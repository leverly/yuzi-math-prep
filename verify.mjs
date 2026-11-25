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
// 冲刺计划页已去掉分数目标（避免给孩子压力），改为检查「三类题」结构与五级优先级
ok(pl.includes('冲刺计划'), '计划页标题为「冲刺计划」');
ok(pl.includes('练得稳') && pl.includes('要想一想') && pl.includes('尽力就好'), '计划页三类题结构存在');
ok(!/先保约\s*\d+\s*分|总分\s*≥\s*\d+|目标正确率\s*100%/.test(pl), '计划页不含分数目标（无施压量化）');

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

// 【六】幻灯片已于 2026-11-25 下线：12 页里 10 页与 index/trend/plan/papers 重复，
// 唯一独有的「六周冲刺节奏」与 plan 页「不给具体时间和动作」的立场矛盾。
// 若将来恢复，把 build-slides.mjs 加回构建链，并在此处恢复对应校验。

console.log('\n【七】练习页（practice.html）');
if (fs.existsSync('practice.html')) {
  const pr = fs.readFileSync('practice.html', 'utf8');
  const { BANK } = await import('./practice-data.mjs');
  ok(pr.includes('每轮 18 道题覆盖全部 6 章'), '导语说明每轮题量与覆盖范围');
  ok(pr.includes('18 道题，覆盖全部 6 章'), '预告卡标题正确');
  // 诊断面板必须按章节展示（不是按族，族太细会导致样本不足）
  ok(pr.includes('薄弱章节'), '诊断按章节汇总');
  ok(pr.includes('const BANK = ['), '题库已内联（file:// 可直开）');
  // 构建器用字符串 replace 注入数据：import 行一改，replace 静默失配，
  // 产物会「构建成功」但只剩 40KB 空壳。这里硬断言数据真的进去了。
  ok(pr.includes('const SOLUTIONS = {'), '解析已内联');
  ok(/const BANK = \[\{"id"/.test(pr), '题库内容非空');
  ok(!/import \{ BANK/.test(pr), '无外部 import（避免 CORS）');
  ok(pr.includes('function diagnose('), '诊断引擎已内联');
  ok(pr.includes('class="frac"') || pr.includes('mathText'), '分数渲染已接入');
  // 全部必须是单选题
  const noOpts = BANK.filter((q) => !q.options);
  ok(noOpts.length === 0, '所有题均为单选题', noOpts.map((q) => q.id).join(','));
  const badKey = BANK.filter((q) => q.options && !(q.key >= 0 && q.key < 4));
  ok(badKey.length === 0, '选择题 key 均合法', badKey.map((q) => q.id).join(','));
  // 每题四选项、且互不重复（图题按图区分）
  let badOpt = 0;
  for (const q of BANK) {
    if (!q.options || q.options.length !== 4) { badOpt++; continue; }
    const figs = q.options.filter((o) => o.figSvg).length;
    if (figs === 0) {
      const ts = q.options.map((o) => o.t);
      if (new Set(ts).size !== 4) badOpt++;
    }
  }
  ok(badOpt === 0, '每题 4 个不重复选项', badOpt + ' 题异常');
  // 正确选项必须与 answer 一致
  let mism = 0;
  for (const q of BANK) {
    if (q.answer === undefined || !q.options) continue;
    const c = q.options[q.key];
    if (c && c.expr != null && Math.abs(+c.expr - q.answer) > 1e-6) mism++;
  }
  ok(mism === 0, '正确选项与答案一致', mism + ' 题不符');

  // 选项形式必须统一：不能「分数 / 小数 / 整数」混排（学生无法直接比较）
  let mixed = 0;
  for (const q of BANK) {
    if (!q.options || q.options.some((o) => o.figSvg)) continue;
    if (q.unit) continue;                       // 角度/长度题用小数，跳过
    const ts = q.options.map((o) => o.t).filter((t) => t && !t.includes('×'));
    if (ts.length < 4) continue;
    const hasFrac = ts.some((t) => t.includes('/'));
    const hasDec = ts.some((t) => t.includes('.') && !t.includes('/'));
    const hasInt = ts.some((t) => !t.includes('/') && !t.includes('.'));
    const kinds = [hasFrac, hasDec, hasInt].filter(Boolean).length;
    // 分数与整数可共存（如 5 与 1/2），但小数不能与其他形式混排
    if (hasFrac && hasDec) mixed++;
    else if (!hasFrac && hasDec && hasInt) mixed++;
  }
  ok(mixed === 0, '选项形式统一（分数/小数不混排）', mixed + ' 题混排');

  // 整数答案的题，干扰项必须也是整数（项数、人数等不可能为小数）
  let fracForInt = 0;
  for (const q of BANK) {
    if (!q.options || q.answer === undefined || q.unit) continue;
    if (!Number.isInteger(q.answer)) continue;
    const ts = q.options.map((o) => o.t).filter(Boolean);
    if (ts.some((t) => t.includes('.'))) fracForInt++;
  }
  ok(fracForInt === 0, '整数题的选项无小数', fracForInt + ' 题异常');
} else {
  ok(false, 'practice.html 已生成');
}

/* 【八】外壳一致性：各页共用部分必须逐字相同
 *
 * 背景：practice.html 曾自带一份设计系统副本，与另外四页持续漂移——
 * 先是顶栏样式不同，后是页头 .lede 多了 max-width:720px 造成大片空白。
 * 这类问题肉眼要翻页面才看得见，所以在这里机器化拦住：
 *   1) 所有页面必须引用同一份顶栏（class、导航项、品牌角标一致）
 *   2) 跨页同名选择器不得给出不同声明（顶栏 / 页头排版 / 设计变量）
 *   3) 正文文字块不得自带把容器压窄的 max-width
 */
console.log('\n【八】外壳一致性（跨页共用部分不得漂移）');
{
  const PAGE_FILES = ['index.html', 'papers.html', 'trend.html', 'plan.html', 'practice.html'];

  // 8.1 顶栏标记一致：品牌 + 导航项（href/文字/高亮/演示样式）必须与共享来源同构
  const { headerHtml } = await import('./work/site-shell.mjs');
  const shellPages = PAGE_FILES.filter((f) => fs.existsSync(f));
  // 把顶栏解析成结构化签名，避免被空格/换行/属性顺序影响
  const hdrSig = (html) => {
    const m = html.match(/<header class="site-head">[\s\S]*?<\/header>/);
    if (!m) return null;
    const h = m[0];
    const brand = (h.match(/class="brand-mark"[^>]*>([^<]*)</) || [])[1] || '';
    const sub = (h.match(/<small>([^<]*)<\/small>/) || [])[1] || '';
    const links = [...h.matchAll(/<a href="([^"]+)"([^>]*)>([^<]*)<\/a>/g)].map((x) => ({
      href: x[1],
      text: x[3].trim(),
      on: /class="on"/.test(x[2]),
    }));
    // 顶栏容器 class 也纳入（.hdr 与 .hdr-in 的漂移曾发生过）
    const container = (h.match(/<header class="site-head"><div class="([^"]+)"/) || [])[1] || '';
    return JSON.stringify({ brand, sub, container, links });
  };
  let hdrBad = [];
  for (const f of shellPages) {
    const txt = fs.readFileSync(f, 'utf8');
    const got = hdrSig(txt);
    if (!got) { hdrBad.push(f + '(缺顶栏)'); continue; }
    // 期望签名：用该页自己的 active 项生成
    const want = hdrSig(headerHtml(f));
    if (want !== got) hdrBad.push(f);
  }
  ok(hdrBad.length === 0, '顶栏标记与共享来源一致', hdrBad.join(', '));

  // 8.2 跨页同名选择器：声明必须相同（只查共用外壳类，业务组件各页本就不同）
  const SHELL_SELECTORS = [
    '.site-head', '.hdr-in', '.brand', '.brand-mark', '.brand small',
    '.hdr-nav', '.hdr-nav a', '.hdr-nav a:hover', '.hdr-nav a.on',
    'h1', '.lede', '.lede b', '.wrap',
  ];
  const declOf = (css) => {
    const map = {};
    for (const m of css.matchAll(/([^{}\n\/][^{}\n]*)\{([^{}]*)\}/g)) {
      const sel = m[1].trim().replace(/\s+/g, ' ');
      // 媒体查询里的规则带前导空白，这里按选择器文本聚合（同名多条用 | 连起来）
      map[sel] = map[sel] ? map[sel] + '|' + m[2].trim() : m[2].trim();
    }
    return map;
  };
  const decls = {};
  for (const f of shellPages) {
    const txt = fs.readFileSync(f, 'utf8');
    const i = txt.indexOf('<style>'), j = txt.indexOf('</style>');
    decls[f] = declOf(txt.slice(i, j));
  }
  let selBad = [];
  for (const sel of SHELL_SELECTORS) {
    const seen = new Map(); // 声明 -> 首次出现的文件
    for (const f of shellPages) {
      const d = decls[f][sel];
      if (d === undefined) continue;
      if (seen.has(d)) continue;
      if (seen.size === 0) { seen.set(d, f); continue; }
      selBad.push(`${sel}（${[...seen.values()][0]} vs ${f}）`);
      break;
    }
  }
  ok(selBad.length === 0, '共用外壳选择器跨页一致', selBad.join('; '));

  // 8.3 页面主叙述文字不得自带窄于容器的 max-width
  //
  // 只拦「页面级导语」这一类：它们直接挂在 <main class="wrap"> 下、代表整页的开场叙述，
  // 一旦限宽就会在 1140px 容器里右侧留出一大片空白（2026-11-25 的 .lede 就是这样）。
  // 卡片内部的说明文字（如 .intro-desc）限宽是刻意的排版选择，不在此列。
  const PAGE_LEVEL_SELECTORS = ['.lede'];
  let narrowBad = [];
  for (const f of shellPages) {
    const txt = fs.readFileSync(f, 'utf8');
    const i = txt.indexOf('<style>'), j = txt.indexOf('</style>');
    const css = txt.slice(i, j);
    for (const m of css.matchAll(/([^{}\n\/][^{}\n]*)\{([^{}]*)\}/g)) {
      const sel = m[1].trim();
      const body = m[2];
      if (!PAGE_LEVEL_SELECTORS.includes(sel)) continue;
      const mw = body.match(/max-width:\s*(\d+)px/);
      if (mw && +mw[1] < 1100) narrowBad.push(`${f} ${sel} max-width:${mw[1]}px`);
    }
  }
  ok(narrowBad.length === 0, '页面级导语未被 max-width 压窄', narrowBad.join('; '));
}

console.log('\n【九】练习记录页（history.html）');
if (fs.existsSync('history.html')) {
  const hs = fs.readFileSync('history.html', 'utf8');
  ok(hs.includes('练习记录'), '页面标题正确');
  ok(hs.includes('各章累计掌握情况'), '有章节汇总区');
  ok(hs.includes('逐轮记录'), '有逐轮记录区');
  ok(hs.includes('const BANK = '), '题库已内联');
  ok(hs.includes('xz-practice-v1'), '与练习页共用同一存储键');
  ok(hs.includes('还没有练习记录'), '有空状态提示');
  ok(hs.includes('exportBtn') && hs.includes('importBtn'), '有导出/导入（防清缓存丢数据）');
  // 练习页必须有入口
  const pr2 = fs.readFileSync('practice.html', 'utf8');
  ok(pr2.includes('href="history.html"'), '练习页有历史入口');
} else {
  ok(false, 'history.html 已生成');
}

console.log('\n' + (fail === 0 ? '=== 全部通过 ===' : `=== ${fail} 项未通过 ===`));
process.exit(fail === 0 ? 0 : 1);
