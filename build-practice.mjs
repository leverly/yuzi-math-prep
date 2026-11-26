// 把 expr 算出的标准答案回填到题库，生成浏览器可用的 practice-data.mjs
// 页面不自己算答案，避免前端求值器出错
import { writeFileSync } from 'node:fs';

function evalExpr(src) {
  const s = String(src).replace(/\s+/g, '');
  let i = 0;
  const eat = (c) => { if (s[i] === c) { i++; return true; } return false; };
  function expr() { let v = term(); for (;;) { if (eat('+')) v += term(); else if (eat('-')) v -= term(); else return v; } }
  function term() { let v = unary(); for (;;) { if (eat('*')) v *= unary(); else if (eat('/')) v /= unary(); else return v; } }
  function unary() { if (eat('-')) return -unary(); if (eat('+')) return unary(); return power(); }
  function power() { const b = atom(); if (eat('^')) return Math.pow(b, unary()); return b; }
  function atom() {
    if (eat('(')) { const v = expr(); eat(')'); return v; }
    if (s.startsWith('abs(', i)) { i += 4; const v = expr(); eat(')'); return Math.abs(v); }
    const m = /^\d+(\.\d+)?([eE][+-]?\d+)?/.exec(s.slice(i));
    if (m) { i += m[0].length; return parseFloat(m[0]); }
    throw new Error('解析失败: ' + s.slice(i));
  }
  const v = expr();
  if (i !== s.length) throw new Error('残留: ' + s.slice(i));
  return v;
}

const { BANK } = await import('./work/practice/bank.mjs');
const { FIGS } = await import('./work/practice/figs.mjs');
const { toChoice } = await import('./work/practice/to-choice.mjs');
const { FAMILY_MAP } = await import('./work/papers/stats.mjs');

// 回填答案 → 再转单选（顺序不能反：toChoice 需要 answer）
const out = BANK.map((rawQ) => {
  // 第一步：算出标准答案
  const withAns = { ...rawQ };
  if (rawQ.expr !== undefined) {
    withAns.answer = +evalExpr(rawQ.expr).toFixed(10);
  } else if (rawQ.options && rawQ.options[rawQ.key] && rawQ.options[rawQ.key].expr != null) {
    // 原生选择题：正确选项带 expr 的，反推 answer 供校验
    try {
      withAns.answer = +evalExpr(rawQ.options[rawQ.key].expr).toFixed(10);
    } catch (e) { /* 非数值选项，跳过 */ }
  }
  // 第二步：没有选项的题转成单选题
  const q = toChoice(withAns);
  const o = { ...q };
  // 选择题：把数值型选项也留一份（用于展示校验，不用于判分）
  delete o.expr;      // 前端不需要表达式

  // 题干图：渲染成内联 SVG
  if (q.fig && FIGS[q.fig]) o.figSvg = FIGS[q.fig]();

  // 选项：保留 expr（校验器用它核对正确项），并按需渲染图
  if (q.options) {
    o.options = o.options.map((opt) => {
      const x = { t: opt.t, errTag: opt.errTag || null };
      if (opt.expr != null) x.expr = opt.expr;
      if (opt.fig && FIGS[opt.fig]) x.figSvg = FIGS[opt.fig]();
      return x;
    });
  }
  return o;
});

// 考点族元信息（用于诊断时显示分值权重）
const famMeta = {};
for (const f of FAMILY_MAP) {
  famMeta[f.id] = { name: f.name, avgPerYear: f.avgPerYear, note: f.note, ch: f.ch, cat: f.cat };
}

// 只导出题库实际用到的族
const usedFams = [...new Set(BANK.map((q) => q.fam))];
const famMetaUsed = {};
for (const k of usedFams) if (famMeta[k]) famMetaUsed[k] = famMeta[k];

// 解题步骤：只挂到题库里确实存在的题上（题号漂移后不会挂空）
const { SOLUTIONS } = await import('./work/practice/solutions.mjs');
const solOut = {};
for (const q of out) {
  if (SOLUTIONS[q.id]) solOut[q.id] = SOLUTIONS[q.id];
}

const header = `// 自动生成，请勿手改。源文件：work/practice/bank.mjs
// 答案由 verify-bank.mjs 独立验算后回填；解析由 work/practice/verify-solutions.mjs 逐步验算。
// 生成时间：${new Date().toISOString().slice(0, 19)}

export const BANK = ${JSON.stringify(out, null, 1)};

export const FAM_META = ${JSON.stringify(famMetaUsed, null, 1)};

/* 解题步骤：只覆盖主战场 8 族；其余族靠图形与说理，公式表达不了 */
export const SOLUTIONS = ${JSON.stringify(solOut, null, 1)};
`;

writeFileSync('practice-data.mjs', header, 'utf8');

console.log('=== 题库数据生成 ===');
console.log('  题数：' + out.length);
console.log('  有答案（可判分）：' + out.filter((q) => q.answer !== undefined).length);
console.log('  选择题：' + out.filter((q) => q.options).length);
console.log('  计算题：' + out.filter((q) => !q.options).length);
console.log('  考点族：' + usedFams.length);
console.log('  体积：' + (header.length / 1024).toFixed(1) + ' KB');
