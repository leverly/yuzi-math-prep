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
const { FAMILY_MAP } = await import('./work/papers/stats.mjs');

// 回填答案
const out = BANK.map((q) => {
  const o = { ...q };
  if (q.expr !== undefined) {
    o.answer = +evalExpr(q.expr).toFixed(10);
  }
  // 选择题：把数值型选项也留一份（用于展示校验，不用于判分）
  if (q.options) {
    o.options = q.options.map((opt) => ({
      t: opt.t,
      errTag: opt.errTag || null,
    }));
  }
  delete o.expr;      // 前端不需要表达式
  return o;
});

// 考点族元信息（用于诊断时显示分值权重）
const famMeta = {};
for (const f of FAMILY_MAP) {
  famMeta[f.id] = { name: f.name, avgPerYear: f.avgPerYear, note: f.note, ch: f.ch };
}

// 只导出题库实际用到的族
const usedFams = [...new Set(BANK.map((q) => q.fam))];
const famMetaUsed = {};
for (const k of usedFams) if (famMeta[k]) famMetaUsed[k] = famMeta[k];

const header = `// 自动生成，请勿手改。源文件：work/practice/bank.mjs
// 答案由 verify-bank.mjs 独立验算后回填。
// 生成时间：${new Date().toISOString().slice(0, 19)}

export const BANK = ${JSON.stringify(out, null, 1)};

export const FAM_META = ${JSON.stringify(famMetaUsed, null, 1)};
`;

writeFileSync('practice-data.mjs', header, 'utf8');

console.log('=== 题库数据生成 ===');
console.log('  题数：' + out.length);
console.log('  有答案（可判分）：' + out.filter((q) => q.answer !== undefined).length);
console.log('  选择题：' + out.filter((q) => q.options).length);
console.log('  计算题：' + out.filter((q) => !q.options).length);
console.log('  考点族：' + usedFams.length);
console.log('  体积：' + (header.length / 1024).toFixed(1) + ' KB');
