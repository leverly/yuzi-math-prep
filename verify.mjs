#!/usr/bin/env node
// 站点与数据一致性校验：任何数字都必须能从台账派生，页面不得与之矛盾
import fs from 'node:fs';
import * as S from './work/papers/stats.mjs';
import { LEDGER, PAPERS_META } from './work/papers/ledger.mjs';

let fail = 0;
const ok = (cond, label, detail = '') => {
  if (cond) console.log('  ✓ ' + label);
  else { console.log('  ✗ ' + label + (detail ? '  → ' + detail : '')); fail++; }
};

console.log('【一】台账完整性');
const byP = {};
for (const q of LEDGER) (byP[q.p] ??= []).push(q);
ok(Object.keys(byP).length === 5, '五套卷齐全', Object.keys(byP).length);
for (const meta of PAPERS_META) {
  const qs = byP[meta.id] || [];
  const main = qs.filter((q) => !q.bonus).reduce((a, q) => a + q.score, 0);
  const bonus = qs.filter((q) => q.bonus).reduce((a, q) => a + q.score, 0);
  ok(qs.length === 26 && main === 100 && bonus === 10,
    `${meta.label}：26 题 / 必做 100 / 选做 10`, `${qs.length} 题 ${main}+${bonus}`);
}
const ids = LEDGER.map((q) => q.p + '-q' + q.no);
ok(new Set(ids).size === ids.length, '题目标识唯一（无重复 id）');

console.log('\n【二】归族完备性');
ok(S.FAMILY_MAP.reduce((a, f) => a + f.count, 0) === LEDGER.length,
  '每题恰好归一族', S.FAMILY_MAP.reduce((a, f) => a + f.count, 0) + '/' + LEDGER.length);
ok(S.MAIN_GRAND === 500, '必做总分 500（5×100）', S.MAIN_GRAND);
const freqSum = S.FREQ_SUMMARY.must.score + S.FREQ_SUMMARY.often.score + S.FREQ_SUMMARY.rare.score;
ok(freqSum === S.MAIN_GRAND, '频次三档分值合计 = 必做总分', `${freqSum} vs ${S.MAIN_GRAND}`);

console.log('\n【三】交叉验证（逐年独立算 vs 汇总）');
// 偏差 ≤6pp 视为正常摆动；超过的不是错误，而是「该章确实在漂移」，
// 必须在页面上被当作趋势说明，不能静默当成平均值的代表。
const DRIFT_KNOWN = { 'ch-op': '2025-26 涨到 27 分（第17题涨到20分 + 进位制题入本章）' };
for (const c of S.CROSS_CHECK) {
  if (c.maxDev <= 6) {
    ok(true, `${c.name} 章节占比偏差 ${c.maxDev}pp`, c.yearlyPct.join('/'));
  } else if (DRIFT_KNOWN[c.k]) {
    ok(true, `${c.name} 偏差 ${c.maxDev}pp（已知漂移：${DRIFT_KNOWN[c.k]}）`, c.yearlyPct.join('/'));
  } else {
    ok(false, `${c.name} 偏差 ${c.maxDev}pp 且未说明原因`, c.yearlyPct.join('/'));
  }
}

console.log('\n【四】页面产物与数据一致');
const pages = ['index.html', 'papers.html', 'trend.html', 'plan.html'];
for (const p of pages) ok(fs.existsSync(p), `${p} 已生成`);

const idx = fs.readFileSync('index.html', 'utf8');
const tr = fs.readFileSync('trend.html', 'utf8');
const pl = fs.readFileSync('plan.html', 'utf8');
// hero-stats 里的三个计数：<b>130</b><span>题逐题标注</span> 这类结构
ok(idx.includes(`<b>${LEDGER.length}</b><span>题逐题标注</span>`), '首页题数派生正确');
ok(idx.includes(`<b>${S.FAMILY_MAP.length}</b><span>个考点族</span>`), '首页族数派生正确');
ok(idx.includes(`<b>${S.FREQ.must.length}</b><span>个五年必考</span>`), '首页必考族数派生正确');
ok(idx.includes(`覆盖必做分 ${S.FREQ_SUMMARY.must.pct}%`), '首页必考覆盖率派生正确');
ok(tr.includes(`共 ${S.FAMILY_MAP.length} 族`), '趋势页族数派生正确');
ok(pl.includes(`<div class="tier-n">${S.CAT_SCORE['计算'].pct + S.CAT_SCORE['概念'].pct}<small>%</small></div>`), '计划页计算+概念占比派生正确');

console.log('\n【五】死链');
const htmls = fs.readdirSync('.').filter((f) => f.endsWith('.html'));
let dead = 0;
for (const h of htmls) {
  const txt = fs.readFileSync(h, 'utf8');
  const hrefs = [...txt.matchAll(/href="([^"]+)"/g)].map((m) => m[1].split('#')[0]).filter(Boolean);
  for (const l of new Set(hrefs)) {
    if (/^https?:/.test(l)) continue;
    if (!fs.existsSync(l)) { console.log(`  ✗ ${h} → ${l}`); dead++; }
  }
}
ok(dead === 0, '所有内部链接可达', dead + ' 个死链');

console.log('\n【六】幻灯片（slides.html）');
if (fs.existsSync('slides.html')) {
  const sl = fs.readFileSync('slides.html', 'utf8');
  ok(sl.includes(`>${LEDGER.length}<`), `题数 ${LEDGER.length} 派生正确`);
  ok(sl.includes(`覆盖必做分 ${S.FREQ_SUMMARY.must.pct}%`), '必考覆盖率派生正确');
  // 「其余 N 族」文案必须与表格显示项互补，不重不漏
  const listed = S.FREQ.must.slice(0, 8).map((f) => f.name);
  const rest = S.FREQ.must.slice(8).map((f) => f.name);
  const m = sl.match(/其余 \d+ 族（([^）]*)）/);
  ok(!!m, '其余族文案存在');
  if (m) {
    const txt = m[1];
    ok(listed.filter((n) => txt.includes(n)).length === 0, '其余族文案不含表格已有项（不重）');
    ok(rest.filter((n) => !txt.includes(n)).length === 0, '其余族文案覆盖全部剩余项（不漏）');
  }
  ok((sl.match(/class="slide/g) || []).length >= 10, `页数 ${(sl.match(/class="slide/g) || []).length}`);
} else {
  ok(false, 'slides.html 已生成');
}

console.log('\n' + (fail === 0 ? '=== 全部通过 ===' : `=== ${fail} 项未通过 ===`));
process.exit(fail === 0 ? 0 : 1);
