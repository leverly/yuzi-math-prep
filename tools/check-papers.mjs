/* ==========================================================
   真题对照校验器
   用法：node tools/check-papers.mjs

   作用：把站内题库的章节分布，与真题的实际分值权重对比，
        找出「哪里缺、哪里偏」。这是内容规划的客观依据，
        不靠主观感觉。

   判据（阈值是我定的，可调）：
     偏差 ≤ 3 个百分点 → 匹配
     3 < 偏差 ≤ 8      → 偏离，需调整
     偏差 > 8          → 严重不匹配，优先修
   ========================================================== */
import {
  ALL_QUESTIONS, CH_BY_ID, CH_SCORE, CAT_SCORE, MUST_TEST, COVERAGE,
} from '../src/index.js';

const CH_REAL = Object.fromEntries(
  Object.entries(CH_SCORE).map(([k, v]) => [k, v.pct]),
);

const total = ALL_QUESTIONS.length;
const byCh = {};
ALL_QUESTIONS.forEach((q) => { byCh[q.chapter] = (byCh[q.chapter] || 0) + 1; });

let errors = 0;
let warns = 0;

console.log('\n=== 真题对照校验 ===');
console.log(`站内题库 ${total} 题\n`);

console.log('【章节分布 vs 真题分值权重】');
console.log('章节'.padEnd(16) + '题量'.padStart(6) + '占比'.padStart(8) + '真题'.padStart(8) + '偏差'.padStart(8) + '  判定');
console.log('-'.repeat(66));

const rows = [];
Object.keys(CH_REAL).forEach((k) => {
  const n = byCh[k] || 0;
  const pct = Math.round((n / total) * 100);
  const real = CH_REAL[k];
  const diff = pct - real;
  const abs = Math.abs(diff);
  let verdict = '匹配';
  if (abs > 8) { verdict = '严重不匹配'; errors++; }
  else if (abs > 3) { verdict = '偏离'; warns++; }
  rows.push({ k, n, pct, real, diff, abs, verdict });
});

rows.sort((a, b) => b.abs - a.abs);
rows.forEach((r) => {
  const name = (CH_BY_ID.get(r.k) || {}).name || r.k;
  const sign = r.diff > 0 ? '+' : '';
  console.log(
    name.padEnd(14) +
    String(r.n).padStart(6) +
    (r.pct + '%').padStart(8) +
    (r.real + '%').padStart(8) +
    (sign + r.diff).padStart(8) +
    '  ' + r.verdict
  );
});

/* 计算类占比：真题 42% */
const calcCount = ALL_QUESTIONS.filter((q) => q.calcType).length;
const calcPct = Math.round((calcCount / total) * 100);
const calcReal = CAT_SCORE['计算'].pct;
const calcDiff = calcPct - calcReal;
console.log('\n【计算类占比】');
console.log(`  站内 ${calcCount} 题（${calcPct}%）· 真题 ${calcReal}% · 偏差 ${calcDiff > 0 ? '+' : ''}${calcDiff} 个百分点`);
if (Math.abs(calcDiff) > 10) {
  console.log('  ⚠ 偏差超过 10 个百分点——计算是最大单项，应优先对齐');
  warns++;
}

/* 必考点覆盖 */
console.log('\n【必考点覆盖】');
const gaps = COVERAGE.filter((c) => !c.have);
MUST_TEST.forEach((m) => {
  const cov = COVERAGE.find((c) => c.k === m.k);
  const ok = cov && cov.have;
  console.log(`  ${ok ? '✓' : '✕'} ${m.k}${ok ? '' : '  ← 缺口'}`);
});
if (gaps.length) {
  console.log(`\n  ✕ ${gaps.length} 个必考点未覆盖：`);
  gaps.forEach((g) => console.log(`    · ${g.k}：${g.gap || '需补'}`));
  errors += gaps.length;
}

/* 汇总 */
console.log('\n' + '='.repeat(40));
if (errors) {
  console.log(`✕ ${errors} 项严重问题，${warns} 项偏离`);
  console.log('\n修正优先级（按偏差从大到小）：');
  rows.filter((r) => r.abs > 3).forEach((r) => {
    const name = (CH_BY_ID.get(r.k) || {}).name || r.k;
    const need = r.diff < 0
      ? `需补约 ${Math.round((r.real / 100) * total - r.n)} 题`
      : `偏多约 ${Math.round(r.n - (r.real / 100) * total)} 题`;
    console.log(`  · ${name}：${need}`);
  });
  process.exit(1);
} else if (warns) {
  console.log(`⚠ ${warns} 项偏离（可接受范围内，建议逐步调整）`);
  process.exit(0);
} else {
  console.log('✓ 站内题库分布与真题高度匹配');
  process.exit(0);
}
