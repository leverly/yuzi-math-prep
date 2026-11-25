// 学情诊断引擎
//
// 设计原则（吸取上一版的教训）：
//   1. 诊断必须从真实作答记录推出，不能按位置猜
//   2. 结论必须是「下一步做什么」，不是「你哪块差」
//   3. 每个结论都要能追溯到具体题号与具体错误选项
//
// 数据流：
//   作答记录 [{id, ok, picked, errTag}] → 按考点族聚合 → 分档 → 排序 → 行动建议

/* ---------- 分档规则 ----------
 * 判据同时看「正确率」和「样本量」：
 *   样本不足时不下结论（避免「做了 1 题错 1 题 = 0%」这种误判）
 */
export const TIER_RULE = {
  minSample: 3,        // 少于此题数不下结论
  weak: 0.6,           // 正确率 < 60% → 薄弱
  shaky: 0.85,         // 60%–85% → 不稳
  solid: 0.85,         // ≥ 85% → 掌握
};

/* ---------- 错因分类 ----------
 * 只从「选了哪个错误选项」反推，不从题面猜。
 * 每个错误选项在题库里带 errTag，形如「符号错误：…」，
 * 这里取其冒号前的前缀作为大类。
 */
export const ERR_CATS = {
  '符号错误': { fix: '把这一步单独抄出来重做，先标符号再算数值' },
  '概念混淆': { fix: '回到定义本身：相反数 / 倒数 / 绝对值分别是什么' },
  '概念不清': { fix: '回到定义本身，用自己的话复述一遍再做题' },
  '概念反向': { fix: '注意条件的方向，把「成立」和「不成立」各举一个例子' },
  '计算错误': { fix: '放慢速度，把中间步骤写出来，不要跳步' },
  '合并同类项': { fix: '先圈出同类项，再动笔合并' },
  '不是同类项': { fix: '合并前先问：字母相同吗？指数相同吗？' },
  '去括号符号': { fix: '括号前是负号时，逐项变号，写全不省略' },
  '分配律漏乘': { fix: '括号外的数要乘遍括号内每一项，写出来再合并' },
  '移项符号': { fix: '移项必须变号，跨过等号就换符号' },
  '系数化 1': { fix: '两边同除以系数，注意除数不能是 0' },
  '大小比较': { fix: '负数比大小看绝对值，绝对值大的反而小' },
  '指数错误': { fix: '科学记数法：10 的指数 = 整数位数 − 1' },
  '形式错误': { fix: '科学记数法要求 a 在 [1,10) 之间' },
  '精确位错误': { fix: '先数清「精确到哪一位」，再决定保留几位小数' },
  '取舍方向': { fix: '看精确位的下一位，满 5 进 1' },
  '关系搞反': { fix: '把「谁比谁多/少」写成等式前，先代一个小数字验一遍' },
  '空间想象': { fix: '动手画一画展开图，或用纸折一次' },
  '规律误判': { fix: '先算相邻两项的差，确认是不是等差再写通项' },
  '常数项': { fix: '用 n=1 代入检验，结果应等于第 1 项' },
  '公差': { fix: '公差 = 后项 − 前项，先算准再写式子' },
  '条件误读': { fix: '把题目条件逐条列出来，划掉用不上的' },
  '符号判断': { fix: '异号两数相加，符号跟绝对值大的那个走' },
  '不完整': { fix: '注意边界情况（如 0）是否也满足条件' },
  '方程列错': { fix: '设未知数后，先用文字写清等量关系再翻译成式子' },
  '求成了补角': { fix: '算完回看题目问的是「这个角」还是「它的补角」' },
  '未作取舍': { fix: '近似数必须按要求的位数取舍' },
  '概念反向': { fix: '把条件的正反两面各举一例' },
};

/* 计算题无法从选项反推错因，改为按族给出「固定失分点」排查顺序。
 * 这些都是真题里反复出现的错法，不是泛泛而谈。 */
export const CALC_HINTS = {
  'f-arith': '① 乘方的底数是谁（−2² 与 (−2)² 不同）　② 除法变乘法时倒数有没有取　③ 分配律是否漏乘',
  'f-solveeq': '① 去分母时常数项有没有也乘　② 去括号的符号　③ 移项是否变号　④ 系数化 1 时符号',
  'f-simplify': '① 去括号符号（尤其括号前是负号）　② 合并时字母和指数是否真的相同　③ 代值时负数有没有加括号',
  'f-exprval': '① 是不是把式子整体看成了一个字母　② 系数有没有提对　③ 符号',
  'f-angleconv': '① 60 进制（不是 100 进制）　② 大单位换小单位是乘还是除',
  'f-segmid': '① 中点是不是把线段平分　② 线段和差的加减方向　③ 有没有漏掉另一种位置情况',
  'f-anglesum': '① 角的和差是加还是减　② 平分线把角分成相等的两份　③ 度分秒的进位',
};

export function parseErrTag(tag) {
  if (!tag) return null;
  const i = tag.indexOf('：');
  const cat = i > 0 ? tag.slice(0, i) : tag;
  const detail = i > 0 ? tag.slice(i + 1) : '';
  return { cat, detail, fix: ERR_CATS[cat]?.fix || null };
}

/* ---------- 主诊断函数 ---------- */
/**
 * @param {Array} records  作答记录 [{id, ok, picked(选项索引或null), answer}]
 * @param {Array} bank     题库
 * @param {Object} famMeta 考点族元信息（从 stats.mjs 取）
 * @returns 诊断结果
 */
export function diagnose(records, bank, famMeta = {}) {
  const byId = new Map(bank.map((q) => [q.id, q]));
  const famAgg = new Map();

  for (const r of records) {
    const q = byId.get(r.id);
    if (!q) continue;
    if (!famAgg.has(q.fam)) {
      famAgg.set(q.fam, { fam: q.fam, total: 0, ok: 0, wrong: [], segMix: {} });
    }
    const a = famAgg.get(q.fam);
    a.total++;
    a.segMix[q.seg] = (a.segMix[q.seg] || 0) + 1;
    if (r.ok) a.ok++;
    else {
      let errCat = null, errDetail = null;
      if (q.options && typeof r.picked === 'number' && q.options[r.picked]) {
        const p = parseErrTag(q.options[r.picked].errTag);
        if (p) { errCat = p.cat; errDetail = p.detail; }
      }
      a.wrong.push({ id: q.id, stem: q.stem, errCat, errDetail, diff: q.diff });
    }
  }

  /* 分档 + 排序 */
  const fams = [...famAgg.values()].map((a) => {
    const rate = a.total ? a.ok / a.total : 0;
    const enough = a.total >= TIER_RULE.minSample;
    let tier;
    if (!enough) tier = 'insufficient';
    else if (rate < TIER_RULE.weak) tier = 'weak';
    else if (rate < TIER_RULE.solid) tier = 'shaky';
    else tier = 'solid';

    // 错因统计
    const errMix = {};
    for (const w of a.wrong) if (w.errCat) errMix[w.errCat] = (errMix[w.errCat] || 0) + 1;
    const topErr = Object.entries(errMix).sort((x, y) => y[1] - x[1])[0];

    const meta = famMeta[a.fam] || {};
    return {
      fam: a.fam,
      name: meta.name || a.fam,
      avgPerYear: meta.avgPerYear ?? null,
      note: meta.note || '',
      total: a.total, ok: a.ok, rate,
      tier, enough,
      wrong: a.wrong,
      errMix,
      topErr: topErr ? { cat: topErr[0], n: topErr[1], fix: ERR_CATS[topErr[0]]?.fix } : null,
      // 排序分：分值越高、正确率越低，越优先
      priority: (meta.avgPerYear || 1) * (1 - rate) * (enough ? 1 : 0.3),
    };
  });

  /* 优先级排序：薄弱且分值高的排前面 */
  const rankOrder = { weak: 0, shaky: 1, insufficient: 2, solid: 3 };
  fams.sort((a, b) => {
    if (rankOrder[a.tier] !== rankOrder[b.tier]) return rankOrder[a.tier] - rankOrder[b.tier];
    return b.priority - a.priority;
  });

  /* 行动建议：每条都必须可执行 */
  const actions = [];
  for (const f of fams) {
    if (f.tier === 'solid') continue;
    if (f.tier === 'insufficient') {
      actions.push({
        fam: f.fam, name: f.name, kind: 'need-more',
        text: `「${f.name}」只做了 ${f.total} 题，样本不够判断。再做几题看看。`,
      });
      continue;
    }
    const fix = f.topErr?.fix;
    const fallback = CALC_HINTS[f.fam];
    let text;
    if (fix) {
      text = `「${f.name}」正确率 ${Math.round(f.rate * 100)}%，主要错在「${f.topErr.cat}」——${fix}`;
    } else if (fallback) {
      // 计算题没有选项，无法从选项反推错因；按这一族的固定失分点给出排查顺序
      text = `「${f.name}」正确率 ${Math.round(f.rate * 100)}%，逐一排查这几处：${fallback}`;
    } else {
      text = `「${f.name}」正确率 ${Math.round(f.rate * 100)}%，回看这几题的解析，找出错在哪一步。`;
    }
    actions.push({
      fam: f.fam, name: f.name, kind: f.tier,
      text,
      wrongIds: f.wrong.map((w) => w.id),
    });
  }

  /* 总体概况 */
  const totalQ = fams.reduce((a, f) => a + f.total, 0);
  const totalOk = fams.reduce((a, f) => a + f.ok, 0);

  return {
    totalQ, totalOk,
    rate: totalQ ? totalOk / totalQ : 0,
    fams,
    actions: actions.slice(0, 6),
    weakCount: fams.filter((f) => f.tier === 'weak').length,
    shakyCount: fams.filter((f) => f.tier === 'shaky').length,
    solidCount: fams.filter((f) => f.tier === 'solid').length,
  };
}

/* ---------- 单题判分 ---------- */
export function judge(q, input) {
  if (q.options) {
    const picked = typeof input === 'number' ? input : parseInt(input, 10);
    if (!(picked >= 0 && picked < q.options.length)) return { ok: false, invalid: true };
    return { ok: picked === q.key, picked };
  }
  // 计算题：数值比对，支持分数/小数/负号等价的写法
  const v = parseNumber(input);
  if (v === null) return { ok: false, invalid: true };
  const target = q.__answer;
  if (target === undefined) return { ok: false, invalid: true };
  // 容差：分数题允许学生写近似小数（如 1/7 → 0.142857），
  // 按相对误差 1e-5 判；整数/有限小数题仍按 1e-9 严判。
  const isInteger = Number.isInteger(target);
  const isShortDecimal = Math.abs(target * 1000 - Math.round(target * 1000)) < 1e-9;
  const tol = (isInteger || isShortDecimal) ? 1e-9 : 1e-5;
  return { ok: Math.abs(v - target) <= tol * Math.max(1, Math.abs(target)), picked: null };
}

/* 解析学生输入：支持 "3/4"、"-1/7"、"0.75"、"−3"（全角减号） */
export function parseNumber(s) {
  if (s === null || s === undefined) return null;
  let t = String(s).trim()
    .replace(/[−–—]/g, '-')      // 各种减号统一
    .replace(/[，,]/g, '')
    .replace(/\s+/g, '');
  if (!t) return null;
  // 带分数 1又1/2 或 1 1/2
  const mixed = /^(-?\d+)[又\s]+(\d+)\/(\d+)$/.exec(t);
  if (mixed) {
    const w = parseInt(mixed[1], 10);
    const n = parseInt(mixed[2], 10);
    const d = parseInt(mixed[3], 10);
    if (d === 0) return null;
    return w < 0 ? w - n / d : w + n / d;
  }
  // 分数 a/b
  const frac = /^(-?\d+)\/(\d+)$/.exec(t);
  if (frac) {
    const d = parseInt(frac[2], 10);
    if (d === 0) return null;
    return parseInt(frac[1], 10) / d;
  }
  // 百分数
  const pctM = /^(-?\d+(?:\.\d+)?)%$/.exec(t);
  if (pctM) return parseFloat(pctM[1]) / 100;
  // 普通数字
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  return parseFloat(t);
}
