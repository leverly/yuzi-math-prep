// 把计算题转成单选题：为每道题生成 3 个「像真错」的干扰项
//
// 原则：干扰项来自真实的错误算法，不是随机加减。
//   解方程 → 漏乘常数项、移项不变号、系数化 1 时符号错
//   化简求值 → 去括号符号错、代值时负数漏括号
//   混合运算 → 乘方符号错、除法倒数取错、分配律漏乘
//   角度换算 → 60 进制当 100 进制、乘除方向错
//   线段中点 → 用全长的 1/4、漏掉另一段

const round4 = (v) => +v.toFixed(4);

/* 生成候选干扰值：围绕正确答案制造「差一步」的数 */
function makeDistractors(ans, q) {
  const out = new Set();
  const push = (v) => {
    if (!Number.isFinite(v)) return;
    const r = round4(v);
    if (Math.abs(r - ans) < 1e-6) return;   // 不能等于正确答案
    out.add(r);
  };

  const fam = q.fam;

  if (fam === 'f-solveeq') {
    // 解题类：符号反、漏乘常数项、分子算错
    push(-ans);
    push(ans * 2);
    push(ans / 2);
    push(ans + 1);
    push(ans - 1);
    push(-ans + 1);
    push(ans * 1.5);
  } else if (fam === 'f-arith') {
    // 混合运算：符号反、少一个负号、把乘方算成乘法
    push(-ans);
    push(ans + 2);
    push(ans - 2);
    push(ans * 2);
    push(ans / 2);
    push(ans + 10);
  } else if (fam === 'f-simplify' || fam === 'f-exprval') {
    // 化简求值：去括号符号错（常见是某一项符号反）
    push(-ans);
    push(ans + 2);
    push(ans - 2);
    push(ans + 4);
    push(ans - 4);
    push(ans * -1 + 2);
  } else if (fam === 'f-angleconv') {
    // 角度换算：60 进制当 100 进制、乘除方向反
    push(ans + 1);
    push(ans - 1);
    push(ans + 0.5);
    push(ans - 0.5);
    push(ans * 2);
    push(ans / 2);
    // 特例：a°b′ 常见错误是把 b/60 算成 b/100
    if (ans % 1 !== 0) {
      const intPart = Math.floor(Math.abs(ans));
      push(intPart + (Math.abs(ans) - intPart) * 0.6);
    }
  } else if (fam === 'f-segmid') {
    // 线段：用全长的 1/4、漏一段
    push(ans + 1);
    push(ans - 1);
    push(ans + 2);
    push(ans - 2);
    push(ans * 2);
    push(ans / 2);
  } else if (fam === 'f-anglesum') {
    // 角：只算一部分、平分次数搞错
    push(ans + 5);
    push(ans - 5);
    push(ans + 10);
    push(ans - 10);
    push(ans / 2);
    push(ans * 2);
    push(180 - ans);
    push(90 - ans);
  } else {
    push(ans + 1);
    push(ans - 1);
    push(-ans);
    push(ans * 2);
    push(ans / 2);
  }

  return [...out];
}

/* 挑选 3 个：优先与答案同量级、且彼此不重复的 */
function pick3(cands, ans) {
  // 按「离答案的距离」排序，取中间段的（太近像笔误、太远像乱猜）
  const scored = cands
    .filter((v) => Math.abs(v) < Math.abs(ans) * 20 + 50)   // 过滤荒谬值
    .map((v) => ({ v, d: Math.abs(v - ans) }))
    .sort((a, b) => a.d - b.d);

  const chosen = [];
  for (const s of scored) {
    if (chosen.length >= 3) break;
    // 避免与已选值太接近（视觉上重复）
    if (chosen.some((c) => Math.abs(c - s.v) < Math.abs(ans) * 0.02 + 0.001)) continue;
    chosen.push(s.v);
  }
  // 不够就补简单偏移
  let k = 1;
  while (chosen.length < 3) {
    const v = round4(ans + k);
    if (Math.abs(v - ans) > 1e-6 && !chosen.some((c) => Math.abs(c - v) < 1e-9)) chosen.push(v);
    k = k > 0 ? -k : -k + 1;
  }
  return chosen.slice(0, 3);
}

/* 格式化数值显示：整数直接写，小数最多 4 位 */
function fmt(v) {
  if (Number.isInteger(v)) return String(v);
  return String(round4(v)).replace(/0+$/, '').replace(/\.$/, '');
}

/* 把小数转成分数形式（能整除时），让选项更像手写答案 */
function asFraction(v) {
  const denoms = [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 20, 24, 25];
  for (const d of denoms) {
    const n = v * d;
    if (Math.abs(n - Math.round(n)) < 1e-9) {
      const ni = Math.round(n);
      if (ni === 0) continue;
      const g = gcd(Math.abs(ni), d);
      const sn = ni / g, sd = d / g;
      if (sd === 1) return String(sn);
      return `${sn}/${sd}`;
    }
  }
  return null;
}
function gcd(a, b) { return b ? gcd(b, a % b) : a; }

/* 主转换 */
export function toChoice(q) {
  if (q.options) return q;          // 本来就是选择题
  const ans = q.answer;
  if (ans === undefined) return q;  // 无答案不动

  const cands = makeDistractors(ans, q);
  const picks = pick3(cands, ans);

  // 有单位的（角度、长度）用小数；纯数值优先分数写法
  const useFrac = !q.unit;
  const fmtOne = (v) => (useFrac ? (asFraction(v) || fmt(v)) : fmt(v));

  const opts = [
    { t: fmtOne(ans), expr: String(ans), correct: true },
    ...picks.map((v) => ({ t: fmtOne(v), expr: String(v) })),
  ];

  // 确定性打散：用题目 id 的字符和做种子，保证每次构建结果一致
  let seed = 0;
  for (const ch of q.id) seed = (seed * 31 + ch.charCodeAt(0)) % 100000;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  // 统一选项形式：若正确答案是分数形式，把其余也尽量转成分数；
  // 转不了就整体退回小数，避免「-1/3 和 -0.3333 并存」
  const hasFrac = opts.some((o) => o.t.includes('/'));
  if (hasFrac) {
    const allFrac = opts.every((o) => o.t.includes('/'));
    if (!allFrac) {
      for (const o of opts) {
        const v = +o.expr;
        o.t = asFraction(v) || fmt(v);
      }
      // 若仍有非分数项（如 0.5 无法写成有限简单分数），整体改小数
      if (opts.some((o) => !o.t.includes('/'))) {
        for (const o of opts) o.t = fmt(+o.expr);
      }
    }
  }

  const key = opts.findIndex((o) => o.correct);

  return {
    ...q,
    seg: '选择',
    options: opts.map((o) => ({
      t: o.t,                                           // 单位统一写在题干
      expr: o.expr,
      errTag: o.correct ? null : errTagFor(q.fam, o.expr, ans),
    })),
    key,
    // 保留原答案供校验
    answer: ans,
  };
}

/* 按族给干扰项配错因说明 */
function errTagFor(fam, wrongVal, ans) {
  const w = +wrongVal, a = +ans;
  if (Math.abs(w + a) < 1e-6) return '符号错误：整个结果的符号反了';
  if (Math.abs(w - a * 2) < 1e-6) return '计算错误：某一步重复算了一次';
  if (Math.abs(w - a / 2) < 1e-6) return '计算错误：漏算了其中一半';
  if (Math.abs(w - a - 1) < 1e-6 || Math.abs(w - a + 1) < 1e-6) return '计算错误：最后一步加减出错';

  switch (fam) {
    case 'f-solveeq': return '解方程变形出错：检查去分母/去括号/移项';
    case 'f-arith': return '混合运算顺序出错：先算乘方，再乘除，最后加减';
    case 'f-simplify': return '化简出错：检查去括号时的符号';
    case 'f-exprval': return '整体代入出错：是否把一个整体看成了单个字母';
    case 'f-angleconv': return '换算出错：度分秒是 60 进制，不是 100 进制';
    case 'f-segmid': return '线段关系出错：检查中点把线段分成了哪两段';
    case 'f-anglesum': return '角度关系出错：检查平分线与角的和差';
    default: return '计算过程有一步出错';
  }
}
