
import { BANK, FAM_META, SOLUTIONS } from './practice-data.mjs';

/* ============ 诊断逻辑（内联以便单文件运行，file:// 可直开） ============ */
const TIER_RULE = { minSample: 3, weak: 0.6, solid: 0.85 };

/* 章节级分档：单轮只有 3 题，百分比波动大（错 1 题就从 100% 掉到 67%）。
 * 所以用比族级更宽的口径：
 *   3–5 题：全对才算掌握，错 1 题算「不稳」，错 2 题以上算「薄弱」
 *   ≥6 题：回到标准阈值（<60% 薄弱 / <85% 不稳 / ≥85% 掌握）
 * 提到模块级：答题中的实时图表与结束后的完整诊断都调它，
 * 两处若各写一份，会出现「进行中显示薄弱、结果页显示不稳」。
 */
function chTierOf(total, ok) {
  if (total < 3) return 'insufficient';
  const rate = ok / total;
  if (total < 6) {
    if (ok === total) return 'solid';
    if (ok >= total - 1) return 'shaky';
    return 'weak';
  }
  return rate < 0.6 ? 'weak' : rate < 0.85 ? 'shaky' : 'solid';
}
/* 分档名与配色在 work/charts.mjs 的 barBlock 内部，这里不再保留副本。
 * 累计面板已从单轮诊断移走（见 showDiag 注释），TIER_NAME / rateCls 一并删掉。 */


const CALC_HINTS = {
  'f-arith': '① 乘方的底数是谁（−2² 与 (−2)² 不同）　② 除法变乘法时倒数有没有取　③ 分配律是否漏乘',
  'f-solveeq': '① 去分母时常数项有没有也乘　② 去括号的符号　③ 移项是否变号　④ 系数化 1 时符号',
  'f-simplify': '① 去括号符号（尤其括号前是负号）　② 合并时字母和指数是否真的相同　③ 代值时负数有没有加括号',
  'f-exprval': '① 是不是把式子整体看成了一个字母　② 系数有没有提对　③ 符号',
  'f-angleconv': '① 60 进制（不是 100 进制）　② 大单位换小单位是乘还是除',
  'f-segmid': '① 中点是不是把线段平分　② 线段和差的加减方向　③ 有没有漏掉另一种位置情况',
  'f-anglesum': '① 角的和差是加还是减　② 平分线把角分成相等的两份　③ 度分秒的进位',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* 把 {a/b} 渲染成竖式分数（先转义，再替换标记） */
function mathText(raw) {
  // 先 esc 会把后面拼的 <span> 一起转义，所以改为：按分数标记切分，
  // 只对「非标记的文本片段」做 esc，拼出来的 HTML 保持原样。
  const src = String(raw);
  // 两种写法：花括号标记 {a/b}，以及整段就是一个分数 a/b
  const toFrac = (n, d) => {
    const num = n.replace('\u2212', '-');
    const neg = num.startsWith('-');
    return '<span class="frac' + (neg ? ' frac-neg' : '') + '">' +
      '<span class="fn">' + esc(neg ? num.slice(1) : num) + '</span>' +
      '<span class="fd">' + esc(d) + '</span></span>';
  };

  // 情形 1：整段就是一个分数（选项里常见）
  const whole = /^([\u2212-]?\d+)\/(\d+)$/.exec(src.trim());
  if (whole) return toFrac(whole[1], whole[2]);

  // 情形 2：句中含 {a/b}
  const re = /\{([\u2212-]?\d+)\/(\d+)\}/g;
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(src)) !== null) {
    out += esc(src.slice(last, m.index));
    out += toFrac(m[1], m[2]);
    last = m.index + m[0].length;
  }
  out += esc(src.slice(last));
  return out;
}



const ERR_FIX = {
  '符号错误': '把这一步单独抄出来重做，先标符号再算数值',
  '概念混淆': '回到定义本身：相反数 / 倒数 / 绝对值分别是什么',
  '概念不清': '回到定义本身，用自己的话复述一遍再做题',
  '概念反向': '注意条件的方向，把「成立」和「不成立」各举一个例子',
  '计算错误': '放慢速度，把中间步骤写出来，不要跳步',
  '合并同类项': '先圈出同类项，再动笔合并',
  '不是同类项': '合并前先问：字母相同吗？指数相同吗？',
  '去括号符号': '括号前是负号时，逐项变号，写全不省略',
  '分配律漏乘': '括号外的数要乘遍括号内每一项',
  '移项符号': '移项必须变号，跨过等号就换符号',
  '系数化 1': '两边同除以系数，注意除数不能是 0',
  '大小比较': '负数比大小看绝对值，绝对值大的反而小',
  '指数错误': '科学记数法：10 的指数 = 整数位数 − 1',
  '形式错误': '科学记数法要求 a 在 [1,10) 之间',
  '精确位错误': '先数清「精确到哪一位」，再决定保留几位小数',
  '取舍方向': '看精确位的下一位，满 5 进 1',
  '关系搞反': '把「谁比谁多/少」写成等式前，先代一个小数字验一遍',
  '空间想象': '动手画一画展开图，或用纸折一次',
  '规律误判': '先算相邻两项的差，确认是不是等差再写通项',
  '常数项': '用 n=1 代入检验，结果应等于第 1 项',
  '公差': '公差 = 后项 − 前项，先算准再写式子',
  '条件误读': '把题目条件逐条列出来，划掉用不上的',
  '符号判断': '异号两数相加，符号跟绝对值大的那个走',
  '不完整': '注意边界情况（如 0）是否也满足条件',
  '方程列错': '设未知数后，先用文字写清等量关系再翻译成式子',
  '求成了补角': '算完回看题目问的是「这个角」还是「它的补角」',
  '未作取舍': '近似数必须按要求的位数取舍',
};

function parseErrTag(tag) {
  if (!tag) return null;
  const i = tag.indexOf('：');
  const cat = i > 0 ? tag.slice(0, i) : tag;
  return { cat, fix: ERR_FIX[cat] || null };
}

function diagnose(records) {
  const byId = new Map(BANK.map(q => [q.id, q]));
  const agg = new Map();

  for (const r of records) {
    const q = byId.get(r.id);
    if (!q) continue;
    if (!agg.has(q.fam)) agg.set(q.fam, { fam: q.fam, total: 0, ok: 0, wrong: [] });
    const a = agg.get(q.fam);
    a.total++;
    if (r.ok) a.ok++;
    else {
      let errCat = null;
      if (q.options && typeof r.picked === 'number' && q.options[r.picked]) {
        const p = parseErrTag(q.options[r.picked].errTag);
        if (p) errCat = p.cat;
      }
      a.wrong.push({ id: q.id, stem: q.stem, errCat });
    }
  }

  const fams = [...agg.values()].map(a => {
    const rate = a.total ? a.ok / a.total : 0;
    const enough = a.total >= TIER_RULE.minSample;
    let tier = !enough ? 'insufficient'
      : rate < TIER_RULE.weak ? 'weak'
      : rate < TIER_RULE.solid ? 'shaky' : 'solid';
    const errMix = {};
    for (const w of a.wrong) if (w.errCat) errMix[w.errCat] = (errMix[w.errCat] || 0) + 1;
    const top = Object.entries(errMix).sort((x, y) => y[1] - x[1])[0];
    const meta = FAM_META[a.fam] || {};
    return {
      fam: a.fam, name: meta.name || a.fam, avg: meta.avgPerYear || 1,
      cat: meta.cat || '未知',
      total: a.total, ok: a.ok, rate, tier, enough,
      topErr: top ? { cat: top[0], fix: ERR_FIX[top[0]] } : null,
      priority: (meta.avgPerYear || 1) * (1 - rate) * (enough ? 1 : 0.3),
    };
  });
  const order = { weak: 0, shaky: 1, insufficient: 2, solid: 3 };
  fams.sort((a, b) => order[a.tier] - order[b.tier] || b.priority - a.priority);

  const actions = [];
  for (const f of fams) {
    if (f.tier === 'solid') continue;
    if (f.tier === 'insufficient') {
      actions.push({ kind: 'need-more', fam: f.fam, text: `「${f.name}」只做了 ${f.total} 题，样本不够判断。再做几题看看。` });
      continue;
    }
    const pct = Math.round(f.rate * 100);
    let text;
    if (f.topErr) {
      text = `「${f.name}」正确率 ${pct}%，主要错在「${f.topErr.cat}」——${f.topErr.fix || '回看这几题的解析。'}`;
    } else if (CALC_HINTS[f.fam]) {
      text = `「${f.name}」正确率 ${pct}%，逐一排查这几处：${CALC_HINTS[f.fam]}`;
    } else {
      text = `「${f.name}」正确率 ${pct}%，回看这几题的解析，找出错在哪一步。`;
    }
    actions.push({ kind: f.tier, fam: f.fam, text });
  }

  const totalQ = fams.reduce((a, f) => a + f.total, 0);
  const totalOk = fams.reduce((a, f) => a + f.ok, 0);
  // 错题清单：按「族年均分 × 该题所属族权重」排序，分值高的族里的错题先重做
  const wrongList = [...agg.values()]
    .flatMap((a) => a.wrong.map((w) => ({
      ...w,
      fam: a.fam,
      famName: (FAM_META[a.fam] || {}).name || a.fam,
      avg: (FAM_META[a.fam] || {}).avgPerYear || 0,
    })))
    .sort((x, y) => y.avg - x.avg);
  // 按章节再做一层聚合：学生/家长听得懂的是「哪一章弱」，不是族名
  const chAgg = new Map();
  const famToCh = {};
  for (const [fid, meta] of Object.entries(FAM_META)) famToCh[fid] = meta.ch;
  for (const f of fams) {
    const ch = famToCh[f.fam] || 'unknown';
    if (!chAgg.has(ch)) chAgg.set(ch, { ch, total: 0, ok: 0, totalScoreW: 0, errMix: {} });
    const a = chAgg.get(ch);
    a.total += f.total;
    a.ok += f.ok;
    a.totalScoreW += f.avg;
    for (const [k, v] of Object.entries(f.errMix || {})) a.errMix[k] = (a.errMix[k] || 0) + v;
  }
  const chs = [...chAgg.values()].map((a) => {
    const rate = a.total ? a.ok / a.total : 0;
    const enough = a.total >= 3;
    const tier = chTierOf(a.total, a.ok);
    const top = Object.entries(a.errMix).sort((x, y) => y[1] - x[1])[0];
    return {
      ch: a.ch,
      name: (typeof CH_NAME !== 'undefined' && CH_NAME[a.ch]) || a.ch,
      total: a.total, ok: a.ok, rate, tier, enough,
      topErr: top ? { cat: top[0], fix: ERR_FIX[top[0]] } : null,
      scoreW: a.totalScoreW,
    };
  }).sort((a, b) => {
    const ord = { weak: 0, shaky: 1, insufficient: 2, solid: 3 };
    return ord[a.tier] - ord[b.tier] || b.scoreW - a.scoreW;
  });

  /* 能力维度：同一批作答记录，按「能力」再切一次。
   * 与章节是同一批题的两个切面——某章弱不等于某能力弱，反之亦然。
   * 能力题库不均（计算 69 题、空间/分类/作图/新定义各 3–4 题），
   * 所以低频能力在单轮里常常只有 1–2 题，会落进「样本不足」。
   * 这不是缺陷：累计几轮后自然会补齐。 */
  const catAgg = new Map();
  // 以「全部能力」为全集初始化：这轮没做到的能力也要显示「待积累」，
  // 否则用户看不到它在排队，会以为站点不诊断它
  for (const c of Object.keys(FAM_CAT_SCORE)) {
    catAgg.set(c, { cat: c, total: 0, ok: 0, scoreW: FAM_CAT_SCORE[c] || 0, errMix: {} });
  }
  for (const f of fams) {
    const c = f.cat || '未知';
    if (!catAgg.has(c)) catAgg.set(c, { cat: c, total: 0, ok: 0, scoreW: 0, errMix: {} });
    const a = catAgg.get(c);
    a.total += f.total;
    a.ok += f.ok;
    a.scoreW += (FAM_CAT_SCORE[c] || 0);
    for (const [k, v] of Object.entries(f.errMix || {})) a.errMix[k] = (a.errMix[k] || 0) + v;
  }
  const cats = [...catAgg.values()].map((a) => {
    const rate = a.total ? a.ok / a.total : 0;
    const tier = chTierOf(a.total, a.ok);
    const top = Object.entries(a.errMix).sort((x, y) => y[1] - x[1])[0];
    return {
      cat: a.cat,
      name: a.cat,
      total: a.total, ok: a.ok, rate, tier,
      enough: a.total >= 3,
      topErr: top ? { cat: top[0], fix: ERR_FIX[top[0]] } : null,
      scoreW: a.scoreW,
    };
  }).sort((a, b) => {
    const ord = { weak: 0, shaky: 1, insufficient: 2, solid: 3 };
    return ord[a.tier] - ord[b.tier] || b.scoreW - a.scoreW;
  });

  return {
    totalQ, totalOk, rate: totalQ ? totalOk / totalQ : 0,
    fams, chs, cats, actions: actions.slice(0, 6), wrongList,
    weak: fams.filter(f => f.tier === 'weak').length,
    shaky: fams.filter(f => f.tier === 'shaky').length,
    solid: fams.filter(f => f.tier === 'solid').length,
  };
}

/* ============ 解题步骤渲染 ============
 * 只覆盖主战场 8 族（SOLUTIONS 里有的题）。其余族靠图形与说理，不给步骤。
 * 步骤数据由 work/practice/verify-solutions.mjs 逐步验算，算错就构建失败。
 *
 * 每步显示「算式 = 结果」而不是只显示说明文字——只写「乘方结果」等于没解析，
 * 学生要看的正是这一步算出来是多少。 */
const solNum = (v) => {
  if (v === null || v === undefined || Number.isNaN(v)) return '';
  const r = Math.round(v * 1e6) / 1e6;
  if (Number.isInteger(r)) return String(r);
  // 尽量还原成简洁分数（分母 ≤ 100）——0.666667 显示成 2/3 才像数学
  for (let d = 2; d <= 100; d++) {
    const n = r * d;
    if (Math.abs(n - Math.round(n)) < 1e-9) {
      const nn = Math.round(n);
      // 能约分就约分
      const g = (a, b) => (b ? g(b, a % b) : a);
      const k = Math.abs(g(nn, d));
      return `${nn / k}/${d / k}`;
    }
  }
  return String(r);
};

function renderSolution(id, collapsed) {
  const sol = (typeof SOLUTIONS !== 'undefined' && SOLUTIONS[id]) || null;
  if (!sol || !sol.steps || !sol.steps.length) return '';
  const items = sol.steps.map((st, i) => {
    // 有 e 且能求值 → 显示「算式 = 结果」
    let calc = '';
    if (st.e) {
      let v = null;
      try { v = evalPlain(st.e); } catch (err) { v = null; }
      if (v !== null) {
        const shown = solNum(v);
        // 算式本身就是结果（如「-1 = -1」）时只显示一次，避免冗余
        const norm = (x) => String(x).replace(/\s+/g, '');
        calc = norm(st.e) === shown
          ? `<span class="sol-calc"><b>${esc(shown)}</b></span>`
          : `<span class="sol-calc">${esc(st.e)} = <b>${esc(shown)}</b></span>`;
      } else {
        calc = `<span class="sol-calc">${esc(st.e)}</span>`;
      }
    }
    return `
    <li class="sol-step">
      <span class="sol-n">${i + 1}</span>
      <span class="sol-txt">${esc(st.note || '')}${calc ? '<br>' + calc : ''}</span>
    </li>`;
  }).join('');
  // 答对时默认收起（不打断节奏），答错时默认展开（正是要看的时候）
  const open = collapsed ? '' : ' open';
  return `
    <details class="sol"${open}>
      <summary>看解题步骤（${sol.steps.length} 步）</summary>
      <ol class="sol-list">${items}</ol>
    </details>`;
}

/* 前端安全求值：只允许数字与 + - * / ( ) . 和 ^、abs()，
 * 不接受任何标识符——解析数据虽由构建期校验，页面里也不该有 eval 面。 */
function evalPlain(src) {
  const s = String(src).replace(/\s+/g, '');
  if (!/^[0-9+\-*/().^abs]+$/.test(s)) throw new Error('不允许的字符');
  let i = 0;
  const eat = (c) => { if (s[i] === c) { i++; return true; } return false; };
  function expr() { let v = term(); for (;;) { if (eat('+')) v += term(); else if (eat('-')) v -= term(); else return v; } }
  function term() { let v = unary(); for (;;) { if (eat('*')) v *= unary(); else if (eat('/')) v /= unary(); else return v; } }
  function unary() { if (eat('-')) return -unary(); if (eat('+')) return unary(); return power(); }
  function power() { const b = atom(); if (eat('^')) return Math.pow(b, unary()); return b; }
  function atom() {
    if (eat('(')) { const v = expr(); eat(')'); return v; }
    if (s.startsWith('abs(', i)) { i += 4; const v = expr(); eat(')'); return Math.abs(v); }
    const m = /^\d+(\.\d+)?/.exec(s.slice(i));
    if (m) { i += m[0].length; return parseFloat(m[0]); }
    throw new Error('无法解析');
  }
  const v = expr();
  if (i !== s.length) throw new Error('有残留');
  return v;
}

/* ============ 判分 ============ */
function parseNumber(s) {
  if (s == null) return null;
  let t = String(s).trim().replace(/[−–—]/g, '-').replace(/[，,]/g, '').replace(/\s+/g, '');
  if (!t) return null;
  const frac = /^(-?\d+)\/(\d+)$/.exec(t);
  if (frac) { const d = +frac[2]; return d === 0 ? null : +frac[1] / d; }
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  return parseFloat(t);
}

function judge(q, input) {
  if (q.options) {
    const picked = typeof input === 'number' ? input : parseInt(input, 10);
    if (!(picked >= 0 && picked < q.options.length)) return { invalid: true };
    return { ok: picked === q.key, picked };
  }
  const v = parseNumber(input);
  if (v === null || q.answer === undefined) return { invalid: true };
  const isInt = Number.isInteger(q.answer);
  const isShort = Math.abs(q.answer * 1000 - Math.round(q.answer * 1000)) < 1e-9;
  const tol = (isInt || isShort) ? 1e-9 : 1e-5;
  return { ok: Math.abs(v - q.answer) <= tol * Math.max(1, Math.abs(q.answer)), picked: null };
}

/* ============ 状态 ============ */
const ROUND_SIZE = 18;      // 每轮 18 题 = 6 章 × 3 题
const PER_CH = 3;           // 每章 3 题（恰好够诊断分档的样本下限）

const state = {
  round: 0,                 // 第几轮（用于轮转选族）
  plan: [],                 // 本轮覆盖的族（有规划感的来源）
  queue: [], idx: 0, records: [],
  answered: false, picked: null,
};

const $ = (s) => document.querySelector(s);

/* ============ 持久化：作答记录与历史诊断存在 localStorage ============ */
const LS_KEY = 'xz-practice-v1';
const LS_MAX_SESSIONS = 20;   // 最多保留 20 轮记录

function loadStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { sessions: [], allRecords: [] };
    const o = JSON.parse(raw);
    return { sessions: o.sessions || [], allRecords: o.allRecords || [] };
  } catch (e) {
    return { sessions: [], allRecords: [] };
  }
}

function saveStore(store) {
  try {
    // 只保留最近 N 轮；allRecords 用于累计诊断，单独裁剪
    store.sessions = store.sessions.slice(-LS_MAX_SESSIONS);
    if (store.allRecords.length > 2000) {
      store.allRecords = store.allRecords.slice(-2000);
    }
    localStorage.setItem(LS_KEY, JSON.stringify(store));
  } catch (e) {
    // 隐私模式或配额满，静默降级（不影响本轮作答）
  }
}

/* 一轮做完后落盘 */
function persistSession(records, diagResult) {
  const store = loadStore();
  const ts = Date.now();
  // 存章节级结论（诊断口径是章节），供历史页逐轮展示
  store.sessions.push({
    at: ts,
    n: records.length,
    ok: records.filter((r) => r.ok).length,
    round: state.round,
    redo: !!state.redo,
    chs: (diagResult.chs || []).map((c) => ({
      ch: c.ch, name: c.name, total: c.total, ok: c.ok, tier: c.tier,
      topErr: c.topErr ? c.topErr.cat : null,
    })),
    cats: (diagResult.cats || []).map((c) => ({
      cat: c.cat, name: c.name, total: c.total, ok: c.ok, tier: c.tier,
      topErr: c.topErr ? c.topErr.cat : null,
    })),
    /* 考点族级明细：诊断每轮都算了 fams（23 族），原来用完就扔，
       导致历史页只能在「章」和「能力」两个层级累计。
       存下来后历史页才能给出「尺规作图与说理 3/3 对」这种具体结论。 */
    fams: (diagResult.fams || []).map((f) => ({
      fam: f.fam, name: f.name, ch: (FAM_META[f.fam] || {}).ch || 'unknown', cat: f.cat,
      total: f.total, ok: f.ok, tier: f.tier,
      topErr: f.topErr ? f.topErr.cat : null,
    })),
  });
  // 累计记录：用于「历史累计诊断」
  for (const r of records) {
    store.allRecords.push({ id: r.id, ok: r.ok, picked: r.picked, at: ts });
  }
  saveStore(store);
  return store;
}

/* 历史累计诊断：把全部历史作答记录再诊断一遍 */
function diagnoseHistory() {
  const store = loadStore();
  return diagnose(store.allRecords.map((r) => ({ id: r.id, ok: r.ok, picked: r.picked })));
}
const DIFF_NAME = { easy: '基础', mid: '中档', hard: '较难' };

/* 选项打散：避免答案总在同一个位置 */
function shuffleOptions(q) {
  if (!q.options) return q;
  const idx = q.options.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return {
    ...q,
    options: idx.map(i => q.options[i]),
    key: idx.indexOf(q.key),
  };
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* 出题策略：诊断要下结论，每族至少需要 3 题。
 * 所以「全部」不是跨族撒一遍，而是按族轮转、每族凑够样本再换下一族。 */
const catOfFam = (fid) => (FAM_META[fid] || {}).cat || '未知';

/* 统计各能力「累计已做过的题数」——用于优先补样本缺口 */
function countAbilitySamples() {
  const n = {};
  try {
    const store = loadStore();
    const byId = new Map(BANK.map((q) => [q.id, q]));
    for (const r of (store.allRecords || [])) {
      const q = byId.get(r.id);
      if (!q) continue;
      const c = catOfFam(q.fam);
      n[c] = (n[c] || 0) + 1;
    }
  } catch (e) { /* 无记录时全 0 */ }
  return n;
}

/* 出题：按「章节」均衡取题，6 章 × 每章 3 题 = 18 题。
 *
 * 为什么按章而不是按族：
 *   - 诊断要回答「整体学情」，章节是学生和家长都听得懂的粒度
 *   - 23 个考点族全覆盖要 69 题（约 46 分钟），太久了
 *   - 6 章 × 3 题只要 12 分钟，且每章都能判出结论
 *
 * 章内取题：优先取该章「年均分最高」的族的题，保证权重高的考点先被覆盖。 */
function pickQueue() {
  // 章节 → 该章的族（按年均分降序）
  const chMap = new Map();
  for (const q of BANK) {
    const meta = FAM_META[q.fam] || {};
    const ch = meta.ch || 'unknown';
    if (!chMap.has(ch)) chMap.set(ch, new Map());
    const fams = chMap.get(ch);
    if (!fams.has(q.fam)) {
      fams.set(q.fam, { id: q.fam, avg: meta.avgPerYear || 0, qs: [] });
    }
    fams.get(q.fam).qs.push(q);
  }

  // 章节按「该章总年均分」降序
  const chapters = [...chMap.entries()].map(([ch, fams]) => {
    const list = [...fams.values()].sort((a, b) => b.avg - a.avg);
    const total = list.reduce((a, f) => a + f.avg, 0);
    return { ch, fams: list, total };
  }).sort((a, b) => b.total - a.total);

  const picked = [];
  const usedIds = new Set();

  // 每章取 PER_CH 题。三层优先级：
  //   ① 本章这 3 题落在同一族 —— 该族样本才够 3 题、判得出能力结论
  //   ② 优先选「该能力累计样本最少」的族 —— 诊断的目的是补数据缺口，
  //      而不是每轮重复练已经练过的（计算族年均分最高，若不干预会永远霸榜）
  //   ③ 同条件时按族年均分降序，保证高分考点优先
  const catDone = countAbilitySamples();   // 各能力已累计做过的题数

  /* 选族：全局贪心 + 能力去重
   * 逐条走「章 × 族」候选，按优先级排序后依次认领，
   * 已被别章占用的能力跳过 —— 否则 3 个章会同时选计算族，
   * 一轮 18 题里 9 题是计算、概念一题没有。
   *
   * 候选排序（依次比较）：
   *   ① 该能力累计样本是否已够 3 题 —— 够了的往后排（先补数据缺口）
   *   ② 该能力累计样本少者优先
   *   ③ 族年均分高者优先（高分考点先覆盖） */
  const cands = [];
  for (const c of chapters) {
    for (const f of c.fams) {
      cands.push({ ch: c.ch, fam: f, avg: f.avg || 0, cat: catOfFam(f.id) });
    }
  }
  cands.sort((a, b) => {
    const na = catDone[a.cat] || 0, nb = catDone[b.cat] || 0;
    const da = na >= 3 ? 1 : 0, db = nb >= 3 ? 1 : 0;
    if (da !== db) return da - db;      // 已够样本的能力降级
    if (na !== nb) return na - nb;      // 样本少的优先
    return b.avg - a.avg;               // 年均分高的优先
  });

  const chPick = new Map();             // 章 → 选中的族
  const catUsed = new Set();            // 本轮已占用的能力
  for (const cd of cands) {
    if (chPick.has(cd.ch)) continue;    // 该章已定
    if (catUsed.has(cd.cat)) continue;  // 该能力已被别章占用
    chPick.set(cd.ch, cd.fam);
    catUsed.add(cd.cat);
  }
  // 兜底：没选到族的章取自己年均分最高的
  for (const c of chapters) {
    if (!chPick.has(c.ch) && c.fams.length) {
      const f = c.fams.slice().sort((a, b) => (b.avg || 0) - (a.avg || 0))[0];
      chPick.set(c.ch, f);
    }
  }

  for (const c of chapters) {
    const f = chPick.get(c.ch);
    if (!f) continue;
    let got = 0;
    const qs = shuffle(f.qs);
    for (const q of qs) {
      if (got >= PER_CH) break;
      if (usedIds.has(q.id)) continue;
      picked.push(q);
      usedIds.add(q.id);
      got++;
    }
    // 该族题不够 PER_CH 时，从章内其他族补
    if (got < PER_CH) {
      for (const g of c.fams) {
        if (got >= PER_CH) break;
        if (g.id === f.id) continue;
        for (const q of shuffle(g.qs)) {
          if (got >= PER_CH) break;
          if (usedIds.has(q.id)) continue;
          picked.push(q);
          usedIds.add(q.id);
          got++;
        }
      }
    }
  }

  state.plan = chapters.map((c) => ({
    ch: c.ch,
    name: (typeof CH_NAME !== 'undefined' && CH_NAME[c.ch]) || c.ch,
    total: Math.round(c.total * 10) / 10,
    fams: c.fams.map((f) => f.id),
  }));

  return picked.slice(0, ROUND_SIZE).map(shuffleOptions);
}

/* ============ 渲染题目 ============ */
function renderQuestion() {
  const q = state.queue[state.idx];
  const famName = (FAM_META[q.fam] || {}).name || q.fam;
  state.answered = false;
  state.picked = null;

  const total = state.queue.length;
  $('#pText').textContent = '第 ' + (state.idx + 1) + ' / ' + total + ' 题';
  $('#pBar').style.width = Math.round((state.idx / total) * 100) + '%';
  $('#pScore').textContent = '已对 ' + state.records.filter(r => r.ok).length;
  /* 切题时也重画：开新轮时要把上一轮的柱子清空 */
  renderLiveChart();

  const optsHtml = q.options ? `
    <div class="opts" id="opts">
      ${q.options.map((o, i) => `<div class="opt${o.figSvg ? ' opt-fig' : ''}" data-i="${i}">
        <span class="opt-k">${'ABCD'[i]}</span>
        ${o.figSvg ? `<span class="opt-figbox">${o.figSvg}</span>` : `<span>${mathText(o.t)}</span>`}
      </div>`).join('')}
    </div>` : `
    <div class="fill">
      <input id="fillInput" type="text" inputmode="text" autocomplete="off"
        placeholder="填写数值，如 10、-3/4、0.5">
      ${q.unit ? `<span class="unit">${esc(q.unit)}</span>` : ''}
      <button class="btn primary" id="submitFill">提交</button>
    </div>`;

  $('#qHost').innerHTML = `
    <div class="q-card">
      <div class="q-meta">
        <span class="tag fam">${esc(famName)}</span>
        <span class="tag seg">${esc(q.seg)}题</span>
        <span class="tag ${q.diff}">${DIFF_NAME[q.diff] || q.diff}</span>
        <span class="q-no">${q.id}</span>
      </div>
      <div class="q-stem">${mathText(q.stem)}</div>
      ${q.figSvg ? `<div class="q-fig">${q.figSvg}</div>` : ''}
      ${optsHtml}
      <div id="fb"></div>
      <div class="actions" id="qActions" style="display:none">
        <button class="btn primary" id="nextBtn">下一题 →</button>
      </div>
    </div>`;

  if (q.options) {
    $('#opts').addEventListener('click', (e) => {
      const el = e.target.closest('.opt');
      if (!el || state.answered) return;
      const i = +el.dataset.i;
      document.querySelectorAll('.opt').forEach(x => x.classList.remove('picked'));
      el.classList.add('picked');
      state.picked = i;
      submit(i);
    });
  } else {
    const inp = $('#fillInput');
    inp.focus();
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(inp.value); });
    $('#submitFill').addEventListener('click', () => submit(inp.value));
  }
}

function submit(input) {
  if (state.answered) return;
  const q = state.queue[state.idx];
  const res = judge(q, input);
  if (res.invalid) {
    const fb = $('#fb');
    fb.className = 'fb no';
    fb.innerHTML = '请填写一个数值（可以写分数，如 <span class="ans">-3/4</span>）。';
    return;
  }
  state.answered = true;
  state.records.push({ id: q.id, ok: res.ok, picked: res.picked });

  const fb = $('#fb');
  if (res.ok) {
    fb.className = 'fb ok';
    fb.innerHTML = '<b>✓ 答对了</b>' + renderSolution(q.id, true);
  } else {
    let extra = '';
    if (q.options && typeof res.picked === 'number' && q.options[res.picked].errTag) {
      const p = parseErrTag(q.options[res.picked].errTag);
      if (p) extra = `<div class="why"><b>你选的这项：</b>${esc(q.options[res.picked].errTag)}${p.fix ? `<br><b>怎么改：</b>${esc(p.fix)}` : ''}</div>`;
    } else if (q.answer !== undefined) {
      const shown = Number.isInteger(q.answer) ? q.answer : +q.answer.toFixed(6);
      extra = `<div class="why"><b>正确答案：</b><span class="ans">${shown}</span>${q.unit ? esc(q.unit) : ''}</div>`;
    }
    fb.className = 'fb no';
    fb.innerHTML = `<b>✗ 答错了</b>${extra}` + renderSolution(q.id, false);
  }

  // 标记选项
  if (q.options) {
    document.querySelectorAll('.opt').forEach((el, i) => {
      el.classList.remove('picked');
      if (i === q.key) el.classList.add('right');
      else if (i === res.picked) el.classList.add('wrong');
    });
  } else {
    const inp = $('#fillInput');
    if (inp) inp.disabled = true;
    const btn = $('#submitFill');
    if (btn) btn.style.display = 'none';
  }

  const act = $('#qActions');
  act.style.display = 'flex';
  $('#nextBtn').textContent = (state.idx + 1 >= state.queue.length) ? '看诊断结果 →' : '下一题 →';
  $('#nextBtn').onclick = next;
  $('#nextBtn').focus();
  $('#pScore').textContent = '已对 ' + state.records.filter(r => r.ok).length;
  /* 答完立刻更新：这一题的结果马上反映到上方柱子，
     让「做题 → 柱子动了」的因果在同一屏里可见（用户要求的实时反馈） */
  renderLiveChart();
}

function next() {
  state.idx++;
  if (state.idx >= state.queue.length) return showDiag();
  renderQuestion();
}

/* ============ 诊断面板 ============ */
/* 一节图表：标题 + 柱状图。
 * 画法在 work/charts.mjs 的 barBlock（构建时内联到页面脚本）。
 * 两图的纵轴一律是掌握度，方向一致。 */
function chartSection(o) {
  return '<div class="diag-sub">' +
    '<div class="diag-head">' +
      '<span class="kicker">' + o.kicker + '</span>' +
      '<h2 style="font-size:19px">' + o.title + '</h2>' +
      '<span class="diag-sub-note">' + o.sub + '</span>' +
    '</div>' +
    barBlock(o.items, { aria: o.aria, note: o.note, axis: o.axis }) +
    '</div>';
}

/* 实时章节掌握度：答题过程中每答完一题重画一次。
 *
 * 只算章节一层，不调完整 diagnose()——后者还会算族、能力、行动建议，
 * 每题跑一遍是浪费，而且它的输出这里用不上。
 * 但分档口径必须与 diagnose 共用 chTierOf()，否则会出现
 * 「进行中显示薄弱、结果页显示不稳」这种自相矛盾。
 *
 * 横轴固定 CH_ORDER，与结果页的图一致：同一根柱子前后位置不变，
 * 高度变化才读得出来是「刚做对/做错」。 */
function renderLiveChart() {
  const host = $('#liveChart');
  if (!host) return;

  /* 逐题累计到章：直接看本轮队列里已答的题，不必再走 diagnose 的族聚合 */
  const byId = new Map(BANK.map(q => [q.id, q]));
  const agg = {};
  for (const ch of CH_ORDER) agg[ch] = { total: 0, ok: 0 };
  for (const r of state.records) {
    const q = byId.get(r.id);
    if (!q) continue;
    const ch = (FAM_META[q.fam] || {}).ch;
    if (!ch || !agg[ch]) continue;
    agg[ch].total++;
    if (r.ok) agg[ch].ok++;
  }

  const items = CH_ORDER.map(ch => {
    const a = agg[ch];
    const known = a.total > 0;
    return {
      name: CH_NAME[ch] || ch,
      rate: known ? a.ok / a.total : 0,
      known,
      ok: a.ok,
      total: a.total,
      tier: known ? chTierOf(a.total, a.ok) : 'insufficient',
    };
  });

  host.innerHTML = barBlock(items, {
    compact: true,
    aria: '本轮各章节掌握度（答题中实时更新）',
  });
}

function showDiag() {
  const d = diagnose(state.records);
  /* 落盘：本轮 + 累计。
   * 这里只负责写，不负责显示——累计口径只出现在「学情数据」页，
   * 单轮诊断结果里一律不出现累计数字（用户 2026-11-26 明确要求）。 */
  persistSession(state.records, d);
  $('#quiz').style.display = 'none';
  /* 清掉答题中的实时图：它随 #quiz 一起隐藏了，但节点留着会让 DOM 里
     同时存在三张图（实时 + 章节 + 能力），调试时容易误判成「重复渲染」。
     结果页自己有完整版章节图，这张紧凑版没有保留价值。 */
  const live = $('#liveChart');
  if (live) live.innerHTML = '';
  const host = $('#diag');
  host.style.display = 'block';

  host.innerHTML = `
    <div class="diag-head">
      <span class="kicker">Diagnosis</span>
      <h2>这一轮的诊断</h2>
    </div>

    ${(() => {
      // 一句话结论：从章节里挑「分档最弱 × 年均分最高」的那一章
      const order = { weak: 0, shaky: 1, insufficient: 2, solid: 3 };
      const cand = d.chs.filter(c => c.tier !== 'solid' && c.total > 0)
        .sort((a, b) => order[a.tier] - order[b.tier] || (b.scoreW || 0) - (a.scoreW || 0))[0];
      if (!cand) {
        return `<div class="verdict ok">
          <div class="v-label">这一轮</div>
          <div class="v-main">没有明显短板</div>
          <div class="v-why">${d.chs.length} 章都在掌握线以上。可以做下一轮，或者去练更高分值的能力。</div>
        </div>`;
      }
      const tl = { weak: '薄弱', shaky: '不稳' }[cand.tier] || '待补';
      return `<div class="verdict ${cand.tier === 'weak' ? 'weak' : 'shaky'}">
        <div class="v-label">这一轮最该补的</div>
        <div class="v-main">${esc(cand.name)}</div>
        <div class="v-why">
          <span class="v-tag">${tl}</span>
          ${cand.ok}/${cand.total} 题正确 · 年均 ${(cand.scoreW || 0).toFixed(1)} 分${cand.topErr ? ' · 主错因：' + esc(cand.topErr.cat) : ''}
        </div>
        <div class="v-act">往下看「接下来做什么」，第一条就是它。</div>
      </div>`;
    })()}

    <div class="summary">
      <div class="sm total"><div class="n">${Math.round(d.rate * 100)}%</div><div class="l">总正确率</div></div>
      <div class="sm weak"><div class="n">${d.chs.filter(c=>c.tier==='weak').length}</div><div class="l">薄弱章节</div></div>
      <div class="sm shaky"><div class="n">${d.chs.filter(c=>c.tier==='shaky').length}</div><div class="l">不够稳</div></div>
      <div class="sm solid"><div class="n">${d.chs.filter(c=>c.tier==='solid').length}</div><div class="l">已掌握</div></div>
    </div>

    ${d.chs && d.chs.length ? chartSection({
      kicker: 'Chapters',
      title: '按章节看掌握度',
      sub: '柱子越高越稳',
      /* 横轴固定 CH_ORDER 章节顺序，不沿用 d.chs 的诊断排序（薄弱优先）：
         柱状图要跨轮比较，每轮按掌握度重排会让「上一轮这根高、这轮那根高」
         失去可比性；固定顺序后，同一根柱子的高度变化就是进步。 */
      items: CH_ORDER.map(ch => {
        const c = d.chs.find(x => x.ch === ch);
        const known = !!(c && c.total > 0);
        return {
          name: CH_NAME[ch] || ch,
          rate: known ? c.rate : 0,
          known,
          ok: known ? c.ok : 0,
          total: known ? c.total : 0,
          tier: known ? c.tier : 'insufficient',
        };
      }),
      /* 纵轴与能力图统一用掌握度（2026-11-26 用户要求）：
         两图相邻，方向一致才不会出现「一张越高越好、另一张越高越差」的认知切换。 */
      note: '掌握度 = 正确率。每章 3 题，错 1 题就是 67%，'
        + '所以这一轮的比例只代表这 3 题。多轮累计的结论在「学情数据」页。',
      aria: '本轮各章节掌握度柱状图',
    }) : ''}

    ${d.cats && d.cats.length ? chartSection({
      kicker: 'Abilities',
      title: '按能力看',
      sub: '同一批题的另一切面',
      /* 横轴顺序必须固定（CAT_ORDER），不能沿用 d.cats 的「薄弱优先」排序：
         柱状图是拿来跨轮比较的，每轮重排会让「上一轮这根短、这轮那根短」失去可比性。 */
      items: CAT_ORDER.map(cat => {
        const c = d.cats.find(x => x.cat === cat);
        const known = !!(c && c.total > 0);
        return {
          name: cat,
          rate: known ? c.rate : 0,
          known,
          ok: known ? c.ok : 0,
          total: known ? c.total : 0,
          tier: known ? c.tier : 'insufficient',
        };
      }),
      note: '能力题库不均衡：计算与概念的题多，分类 / 作图 / 空间 / 新定义每轮只出得到 1–2 题。'
        + '所以这一轮里 1–2 题的能力只反映这两题。多轮累计的结论在「学情数据」页。',
      aria: '本轮各能力掌握度柱状图',
    }) : ''}

    ${d.actions.length ? `
    <div style="margin-top:26px">
      <div class="diag-head"><span class="kicker">Next</span><h2 style="font-size:19px">接下来做什么</h2></div>
      <div class="act-list">
        ${d.actions.map(a => `<div class="act ${a.kind}">${a.text}</div>`).join('')}
      </div>
    </div>` : `
    <div class="act" style="margin-top:20px">
      这一轮全对。可以换一个范围再练，或者去「整体解读」看看哪些考点分值更高。
    </div>`}

    ${renderWrong(d.wrongList)}

    <div class="actions" style="margin-top:26px">
      <button class="btn primary" id="againBtn">再练一轮</button>
      <a class="btn ghost" href="history.html">查看学情数据</a>
      <a class="btn ghost" href="plan.html">看备考建议</a>
    </div>
  `;

  $('#againBtn').onclick = () => reset();
  bindRedo(d.wrongList);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* 错题清单：把本轮做错的题逐条列出，可一键重做
 * 这是站点自己立的验收标准「同一道题第二次做是否还错」的落点——
 * 之前错题只用于统计错因，从不出现在界面上，闭环断在这里。 */
function renderWrong(wrongList) {
  if (!wrongList || !wrongList.length) return '';
  const rows = wrongList.map((w) => `
    <div class="wrong-row">
      <span class="wrong-fam">${esc(w.famName)}</span>
      <span class="wrong-stem">${mathText(w.stem)}</span>
      ${w.errCat ? `<span class="wrong-err">${esc(w.errCat)}</span>` : ''}
    </div>`).join('');
  return `
    <div style="margin-top:26px">
      <div class="diag-head">
        <span class="kicker">Redo</span>
        <h2 style="font-size:19px">本轮错题 ${wrongList.length} 道</h2>
      </div>
      <div class="note" style="margin-bottom:14px">
        衡量标准不是「做了多少题」，而是<b>同一道题第二次做是否还错</b>。先重做这几道。
      </div>
      <div class="wrong-list">${rows}</div>
      <div class="actions" style="margin-top:14px">
        <button class="btn primary" id="redoBtn">重做这 ${wrongList.length} 道错题</button>
      </div>
    </div>`;
}

/* 重做错题：用指定 id 列表直接组卷，不走随机抽题 */
function bindRedo(wrongList) {
  const btn = $('#redoBtn');
  if (!btn || !wrongList || !wrongList.length) return;
  btn.onclick = () => {
    const byId = new Map(BANK.map((q) => [q.id, q]));
    const qs = wrongList.map((w) => byId.get(w.id)).filter(Boolean).map(shuffleOptions);
    if (!qs.length) { alert('这些题已不在题库中。'); return; }
    state.queue = qs;
    state.idx = 0;
    state.records = [];
    state.redo = true;
    $('#diag').style.display = 'none';
    $('#intro').style.display = 'none';
    $('#quiz').style.display = 'block';
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}

function reset() {
  state.round += 1;
  $('#diag').style.display = 'none';
  $('#intro').style.display = 'block';
  $('#quiz').style.display = 'none';
  renderPlanPreview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* 预览本轮覆盖的章节（6 章各 3 题） */
function renderPlanPreview() {
  const host = $('#planPreview');
  if (!host) return;

  // 按章聚合（与 pickQueue 同源逻辑）
  const chMap = new Map();
  for (const q of BANK) {
    const meta = FAM_META[q.fam] || {};
    const ch = meta.ch || 'unknown';
    if (!chMap.has(ch)) chMap.set(ch, { n: 0, total: 0, fams: new Set() });
    const d = chMap.get(ch);
    d.n++;
    d.fams.add(q.fam);
  }
  // 每章总分 = 该章各族年均分之和
  for (const [ch, d] of chMap) {
    let s = 0;
    for (const f of d.fams) s += (FAM_META[f] || {}).avgPerYear || 0;
    d.total = s;
  }
  const list = [...chMap.entries()].sort((a, b) => b[1].total - a[1].total);

  host.innerHTML = list.map(([ch, d], i) => `
    <div class="plan-item">
      <div class="plan-k">第 ${i + 1} 章</div>
      <div class="plan-n">${esc((typeof CH_NAME !== 'undefined' && CH_NAME[ch]) || ch)}</div>
      <div class="plan-v">年均 ${Math.round(d.total * 10) / 10} 分 · ${PER_CH} 题</div>
    </div>`).join('');
}

/* ============ 开始一轮诊断 ============ */
function startRound() {
  state.queue = pickQueue();
  if (!state.queue.length) { alert('题库为空。'); return; }
  state.idx = 0;
  state.records = [];
  state.redo = false;
  $('#intro').style.display = 'none';
  $('#diag').style.display = 'none';
  $('#quiz').style.display = 'block';
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const startBtn = $('#startBtn');
if (startBtn) startBtn.onclick = startRound;

renderPlanPreview();

/* 入口只放入口，不放累计数字：
 * 轮次 / 累计题数 / 正确率合计属于「学情数据」页的口径，
 * 单轮诊断这条链上一律不出现（2026-11-26 用户要求）。 */
(function showHistLink() {
  const link = $('#histLink');
  if (!link) return;
  const n = (loadStore().sessions || []).length;
  if (!n) link.style.display = 'none';   // 没有记录就不显示入口
})();

$('#quitBtn').onclick = () => {
  if (!state.records.length) { reset(); return; }
  if (confirm('结束本轮并看诊断结果？')) showDiag();
};
