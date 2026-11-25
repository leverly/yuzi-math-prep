#!/usr/bin/env node
// 解析校验器：每一步都是可求值表达式，逐步验算
//
// 为什么需要它：手写解析比没有解析更危险——算错一步，学生照着错。
// 所以解析不靠人眼复核，靠机器：
//   1. 每个 step 的 e 必须能求值（语法错误直接失败）
//   2. 最后一步的值必须等于题目 answer（差 1e-6 就失败）
//   3. 中间步骤数 ≥ 2（一步到位的「解析」没有价值）
//   4. 引用的题必须在题库里（防止题号漂移后解析挂空）
//
// 只覆盖主战场 8 族；其余族不给步骤解析是设计决定，不是遗漏。

import { BANK } from '../../practice-data.mjs';
import { SOLUTIONS } from './solutions.mjs';

/* ---------- 表达式求值器（与 verify-bank.mjs 同源逻辑） ---------- */
function evalExpr(src) {
  const s = String(src).replace(/\s+/g, '');
  let i = 0;
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
    if (eat('^')) return Math.pow(base, parseUnary());
    return base;
  }
  function parseAtom() {
    if (eat('(')) { const v = parseExpr(); eat(')'); return v; }
    if (s.startsWith('abs(', i)) { i += 4; const v = parseExpr(); eat(')'); return Math.abs(v); }
    const m = /^\d+(\.\d+)?/.exec(s.slice(i));
    if (m) { i += m[0].length; return parseFloat(m[0]); }
    throw new Error('无法解析：' + s.slice(i));
  }
  const v = parseExpr();
  if (i !== s.length) throw new Error('有残留字符：' + s.slice(i));
  return v;
}

let fail = 0;
const problems = [];
const bad = (msg) => { problems.push(msg); fail++; };

const byId = new Map(BANK.map((q) => [q.id, q]));
const ids = Object.keys(SOLUTIONS);

console.log('=== 解析校验 ===');
console.log(`  解析条目：${ids.length} / 题库 ${BANK.length} 题`);

/* 1. 引用的题必须在题库里 */
for (const id of ids) {
  if (!byId.has(id)) bad(`${id}: 题库里没有这道题`);
}

/* 2. 逐题逐步验算
 * 两种解析格式：
 *   steps[].e  —— 算式题：每步可求值，末步必须等于 answer
 *   lhs/rhs    —— 方程题：把答案代回原方程，两边必须相等（更强，不依赖步骤写法） */
let stepTotal = 0;
for (const id of ids) {
  const q = byId.get(id);
  if (!q) continue;
  const sol = SOLUTIONS[id];
  if (!sol || !Array.isArray(sol.steps) || !sol.steps.length) {
    bad(`${id}: steps 为空`);
    continue;
  }
  if (sol.steps.length < 2) bad(`${id}: 只有 ${sol.steps.length} 步，解析没有价值`);

  const isEquation = sol.lhs !== undefined && sol.rhs !== undefined;
  const isSingle = sol.e !== undefined;
  // 纯说理题：没有可求值的算式（选项是文字，如「一定是负数」），
  // 必须显式声明 kind:'reason' 才允许只有 note —— 防止「忘了写 e」被静默放过。
  const isReason = sol.kind === 'reason';

  if (isReason) {
    sol.steps.forEach((st, k) => {
      stepTotal++;
      if (!st.note || !st.note.trim()) bad(`${id} 第 ${k + 1} 步: 缺 note`);
    });
    if (sol.steps.length < 2) bad(`${id}: 说理题少于 2 步`);
    continue;
  }

  if (isSingle) {
    // 化简求值类：把给定的变量值代入后求值，必须等于答案
    if (q.answer === undefined) { bad(`${id}: 有 e 但没有 answer`); continue; }
    try {
      const v = evalExpr(sol.e);
      if (Math.abs(v - q.answer) > 1e-6) {
        bad(`${id}: 代入求值 = ${v}，但题目答案 = ${q.answer}`);
      }
    } catch (err) {
      bad(`${id}: 代入求值失败 — ${err.message}`);
    }
    sol.steps.forEach((st, k) => {
      stepTotal++;
      if (!st.note || !st.note.trim()) bad(`${id} 第 ${k + 1} 步: 缺 note`);
    });
    continue;
  }

  if (isEquation) {
    // 方程题：把答案代回原方程验算
    if (q.answer === undefined) { bad(`${id}: 方程题但没有 answer`); continue; }
    try {
      const L = evalExpr(sol.lhs.replace(/\bx\b/g, `(${q.answer})`));
      const R = evalExpr(sol.rhs.replace(/\bx\b/g, `(${q.answer})`));
      if (Math.abs(L - R) > 1e-6) {
        bad(`${id}: 把 x=${q.answer} 代回原方程，左边 = ${L}，右边 = ${R}，不相等`);
      }
    } catch (e) {
      bad(`${id}: 代回验算失败 — ${e.message}`);
    }
    // 方程题只要求 note 完整
    sol.steps.forEach((st, k) => {
      stepTotal++;
      if (!st.note || !st.note.trim()) bad(`${id} 第 ${k + 1} 步: 缺 note`);
    });

    // 末步 note 必须写出答案 —— 代回验算只能证明「答案对」，
    // 不能证明「步骤描述对」。曾经 eq-11 答案对、步骤写歪到 −23/5，就是这么漏掉的。
    // 注意：note 里用的是排版负号「−」，answer 是 ASCII「-」，比对前要归一。
    const norm = (s) => String(s).replace(/[−–—]/g, '-').replace(/\s+/g, '');
    const lastNote = norm(sol.steps[sol.steps.length - 1].note || '');
    const cands = [String(q.answer), String(Math.round(q.answer * 1000) / 1000)];
    // 分数写法也接受：0.142857... 允许写成 1/7
    if (Math.abs(q.answer * 7 - 1) < 1e-6) cands.push('1/7');
    if (!cands.some((c) => lastNote.includes(norm(c)))) {
      bad(`${id}: 末步 note 未写出答案 ${q.answer} — 「${lastNote.slice(0, 40)}」`);
    }
    continue;
  }

  let last = null;
  let prev = null;
  sol.steps.forEach((st, k) => {
    stepTotal++;
    if (!st.e || typeof st.e !== 'string') { bad(`${id} 第 ${k + 1} 步: 缺 e`); return; }
    if (!st.note || !st.note.trim()) bad(`${id} 第 ${k + 1} 步: 缺 note`);
    try {
      const v = evalExpr(st.e);
      // 相邻两步值相同 = 纯重复步骤（如「中间结果」），没有信息量
      if (prev !== null && Math.abs(v - prev) < 1e-9 && k > 0) {
        bad(`${id} 第 ${k + 1} 步与上一步数值相同（${v}），是冗余步骤`);
      }
      prev = v;
      last = v;
    } catch (e) {
      bad(`${id} 第 ${k + 1} 步: ${e.message}`);
    }
  });

  // 3. 最后一步必须等于 answer
  if (last !== null && q.answer !== undefined) {
    if (Math.abs(last - q.answer) > 1e-6) {
      bad(`${id}: 解析末步 = ${last}，但题目答案 = ${q.answer}`);
    }
  }
}

/* 4. 覆盖率：主战场 8 族应尽量有解析 */
const MAIN_FAMS = ['f-arith', 'f-solveeq', 'f-simplify', 'f-exprval', 'f-eqconcept', 'f-poly', 'f-scinote', 'f-abs-line'];
const cover = {};
for (const f of MAIN_FAMS) {
  const total = BANK.filter((q) => q.fam === f).length;
  const done = BANK.filter((q) => q.fam === f && SOLUTIONS[q.id]).length;
  cover[f] = { total, done };
}
console.log('  主战场覆盖：');
for (const [f, v] of Object.entries(cover)) {
  const pct = v.total ? Math.round((v.done / v.total) * 100) : 0;
  console.log(`    ${f.padEnd(14)} ${v.done}/${v.total}  (${pct}%)`);
}
const mainTotal = Object.values(cover).reduce((a, v) => a + v.total, 0);
const mainDone = Object.values(cover).reduce((a, v) => a + v.done, 0);
console.log(`    合计           ${mainDone}/${mainTotal}  (${Math.round((mainDone / mainTotal) * 100)}%)`);
console.log(`  步骤总数：${stepTotal}`);

console.log('');
if (fail === 0) {
  console.log('=== 全部通过 ===');
  process.exit(0);
} else {
  console.log(`=== ${fail} 项失败 ===`);
  for (const p of problems) console.log('  ✗ ' + p);
  process.exit(1);
}
