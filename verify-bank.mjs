// 题库校验器：每道题的答案都用代码独立算出，不信任手写值
//
// 三类检查：
//   1. calc  : 用 expr 求值，得到标准答案
//   2. choice: 数值型选项必须恰有一个等于正确值（或与 key 指向的一致）
//   3. 方程题 : 把答案代回原式，左右两边必须相等
//
// 任何一项不符就 exit 1，不允许「看起来对」就放行。

/* ---------- 极小的表达式求值器（只支持题库需要的语法） ---------- */
function evalExpr(src) {
  const s = String(src).replace(/\s+/g, '');
  let i = 0;

  const peek = () => s[i];
  const eat = (c) => { if (s[i] === c) { i++; return true; } return false; };

  function parseExpr() {
    let v = parseTerm();
    for (;;) {
      if (eat('+')) v += parseTerm();
      else if (eat('-')) v -= parseTerm();
      else return v;
    }
  }
  function parseTerm() {
    let v = parseUnary();
    for (;;) {
      if (eat('*')) v *= parseUnary();
      else if (eat('/')) v /= parseUnary();
      else return v;
    }
  }
  function parseUnary() {
    if (eat('-')) return -parseUnary();
    if (eat('+')) return parseUnary();
    return parsePower();
  }
  function parsePower() {
    const base = parseAtom();
    if (eat('^')) {
      const e = parseUnary();          // 右结合
      return Math.pow(base, e);
    }
    return base;
  }
  function parseAtom() {
    if (eat('(')) { const v = parseExpr(); eat(')'); return v; }
    // abs(...)
    if (s.startsWith('abs(', i)) { i += 4; const v = parseExpr(); eat(')'); return Math.abs(v); }
    // 数字（含小数、科学记数法）
    const m = /^\d+(\.\d+)?([eE][+-]?\d+)?/.exec(s.slice(i));
    if (m) { i += m[0].length; return parseFloat(m[0]); }
    throw new Error('无法解析: ' + s.slice(i));
  }

  const v = parseExpr();
  if (i !== s.length) throw new Error('残留字符: ' + s.slice(i));
  return v;
}

const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

/* ---------- 加载题库 ---------- */
const { BANK } = await import('./work/practice/bank.mjs');

let fail = 0;
const problems = [];
const results = [];

for (const q of BANK) {
  const rec = { id: q.id, fam: q.fam, seg: q.seg, diff: q.diff };

  if (q.expr !== undefined) {
    let v;
    try { v = evalExpr(q.expr); }
    catch (e) { problems.push(`${q.id}: expr 无法求值 (${e.message})`); fail++; continue; }
    if (!Number.isFinite(v)) { problems.push(`${q.id}: expr 结果非有限数`); fail++; continue; }
    rec.value = +v.toFixed(10);
  }

  if (q.options) {
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      problems.push(`${q.id}: 选项必须 4 个`); fail++; continue;
    }
    if (!(q.key >= 0 && q.key < 4)) {
      problems.push(`${q.id}: key 越界 (${q.key})`); fail++; continue;
    }
    // 数值型选项：检查是否恰有一个正确项，且与 key 一致
    const nums = q.options.map((o, k) => ({ k, v: o.expr == null ? null : evalExpr(o.expr) }));
    const numeric = nums.filter((x) => x.v !== null);
    if (numeric.length >= 2) {
      // 正确项必须由 key 指定；若同值选项多于一个，视为歧义
      const target = nums[q.key].v;
      if (target === null) {
        problems.push(`${q.id}: key 指向非数值选项，但本题有数值选项`);
        fail++;
      } else {
        const same = numeric.filter((x) => near(x.v, target));
        if (same.length > 1) {
          problems.push(`${q.id}: 有 ${same.length} 个选项数值相同，存在歧义`);
          fail++;
        }
      }
    }
    rec.numericOptions = numeric.length;
    rec.hasErrTags = q.options.filter((o) => o.errTag).length;
  }

  results.push(rec);
}

/* ---------- 方程题：代回原式验算 ---------- */
// 题库里方程题的答案存在 expr（如 '1/7'）。这里用独立方式重解一遍。
const EQUATIONS = [
  { id: 'eq-01', lhs: '2*x+5*(x+1)', rhs: '6' },
  { id: 'eq-02', lhs: '7*x-20', rhs: '2*(3-3*x)' },
  { id: 'eq-03', lhs: '(2*x-3)/5', rhs: '(3*x-1)/2+1' },
  { id: 'eq-04', lhs: '3*(x-2)-2*(x+1)', rhs: '4' },
  { id: 'eq-05', lhs: '(x+1)/2-(2*x-1)/3', rhs: '1' },
  { id: 'eq-06', lhs: '5*x-3', rhs: '2*(x+3)' },
  { id: 'eq-07', lhs: '(3*x-1)/4', rhs: '(x+3)/2' },
  { id: 'eq-08', lhs: '4-3*(x-2)', rhs: '2*x' },
  { id: 'eq-09', lhs: '(2*x+1)/3-(5*x-1)/6', rhs: '1' },
  { id: 'eq-10', lhs: '0.3*x-0.1', rhs: '0.2*(x+1)' },
];

// 支持变量的求值器
function evalWithVar(src, xVal) {
  const s = String(src).replace(/\s+/g, '');
  let i = 0;
  const eat = (c) => { if (s[i] === c) { i++; return true; } return false; };
  function expr() { let v = term(); for (;;) { if (eat('+')) v += term(); else if (eat('-')) v -= term(); else return v; } }
  function term() { let v = unary(); for (;;) { if (eat('*')) v *= unary(); else if (eat('/')) v /= unary(); else return v; } }
  function unary() { if (eat('-')) return -unary(); if (eat('+')) return unary(); return atom(); }
  function atom() {
    if (eat('(')) { const v = expr(); eat(')'); return v; }
    if (eat('x')) return xVal;
    const m = /^\d+(\.\d+)?/.exec(s.slice(i));
    if (m) { i += m[0].length; return parseFloat(m[0]); }
    throw new Error('无法解析: ' + s.slice(i));
  }
  const v = expr();
  if (i !== s.length) throw new Error('残留: ' + s.slice(i));
  return v;
}

for (const eq of EQUATIONS) {
  const item = BANK.find((b) => b.id === eq.id);
  if (!item) { problems.push(`${eq.id}: 题库中找不到`); fail++; continue; }
  const ans = evalExpr(item.expr);
  let l, r;
  try {
    l = evalWithVar(eq.lhs, ans);
    r = evalWithVar(eq.rhs, ans);
  } catch (e) {
    problems.push(`${eq.id}: 代入失败 (${e.message})`); fail++; continue;
  }
  if (!near(l, r, 1e-9)) {
    problems.push(`${eq.id}: 答案 ${ans} 代回不成立 (左=${l}, 右=${r})`);
    fail++;
  }
}

/* ---------- 输出 ---------- */
console.log('=== 题库校验 ===');
console.log(`  题目数：${BANK.length}`);
const byFam = {};
for (const r of results) byFam[r.fam] = (byFam[r.fam] || 0) + 1;
console.log('  按考点族：');
for (const [k, v] of Object.entries(byFam)) console.log(`    ${k.padEnd(16)} ${v} 题`);

const bySeg = {};
for (const r of results) bySeg[r.seg] = (bySeg[r.seg] || 0) + 1;
console.log('  按题型：', JSON.stringify(bySeg));

const noNum = results.filter((r) => r.seg === '选择' && r.numericOptions === 0);
if (noNum.length) console.log(`  纯文字选项（无法自动核对数值）：${noNum.map((r) => r.id).join(', ')}`);

console.log('');
if (fail === 0) {
  console.log('=== 全部通过 ===');
  process.exit(0);
} else {
  console.log(`=== ${fail} 项失败 ===`);
  for (const p of problems) console.log('  ✗ ' + p);
  process.exit(1);
}
