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
// 首页已改为行动入口：首屏说「做一轮多少题、覆盖几章、题库多大」，
// 这些数字必须与练习页/题库同源，不能是手写字面量。
const { ROUND_SIZE } = await import('./work/site-shell.mjs');
const { BANK: PRACTICE_BANK } = await import('./practice-data.mjs');
const chCount = new Set(S.FAMILY_MAP.map((f) => f.ch)).size;
ok(idx.includes(`<b>${ROUND_SIZE}</b><span>题一轮</span>`), '首页轮次题量派生正确');
ok(idx.includes(`<b>${chCount}</b><span>章全覆盖</span>`), '首页章数派生正确');
ok(idx.includes(`<b>${PRACTICE_BANK.length}</b><span>题题库</span>`), '首页题库题数派生正确');
// 练习页与首页必须承诺同一个题量
const pr0 = fs.readFileSync('practice.html', 'utf8');
ok(pr0.includes(`每轮 ${ROUND_SIZE} 道题`), '练习页轮次题量与首页同源');
// 首屏两个主按钮都应导向练习/诊断，而不是分析页
ok(/class="btn primary" href="practice\.html"/.test(idx), '首屏主按钮指向练习页');
ok(idx.includes('href="history.html"'), '首屏有学情诊断入口');
// 已删掉的四处重叠内容不应回归
ok(!idx.includes('三个判断'), '首页不再有「三个判断」与分值分区重复');
ok(!idx.includes('100 分不是均匀分布的'), '首页不再有重复的分值分区屏');
ok(!idx.includes('五年年年考的'), '首页不再复述必考清单');
ok(tr.includes(`共 ${S.FAMILY_MAP.length} 族`), '趋势页族数派生正确');
// 冲刺计划页已去掉分数目标（避免给孩子压力），改为检查「三类题」结构与五级优先级
ok(pl.includes('冲刺计划'), '计划页标题为「冲刺计划」');
ok(pl.includes('练得稳') && pl.includes('要想一想') && pl.includes('尽力就好'), '计划页三类题结构存在');
ok(!/先保约\s*\d+\s*分|总分\s*≥\s*\d+|目标正确率\s*100%/.test(pl), '计划页不含分数目标（无施压量化）');

console.log('\n【四之二】首页诊断入口');
{
  const idx2 = fs.readFileSync('index.html', 'utf8');
  const cards = (idx2.match(/class="out-card"/g) || []).length;
  ok(cards === 5, '诊断产出讲清五样东西', cards + ' 张');
  ok(idx2.includes('class="cta-bar"'), '有醒目行动条（不是纯文字链接）');
  ok(idx2.includes('开始诊断'), '行动条有明确按钮');
  ok(idx2.includes('各能力分档'), '能力维度已写进入口说明');
  ok(!idx2.includes('现在就做一轮 →'), '已移除原来的纯文字弱链接');
}

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
  // 能力维度：必须能从族映射到能力，且诊断面板展示
  ok(pr.includes('const FAM_CAT_SCORE = {'), '能力分值表已内联');
  ok(pr.includes('按能力看'), '诊断面板有能力区块');
  ok(pr.includes('catAgg'), '诊断含按能力聚合');
  // 出题必须做全局能力去重，否则 3 个章会同时选计算族
  ok(pr.includes('catUsed') && pr.includes('已够样本的能力降级'), '出题按能力去重');
  // 能力「未轮到」必须显式说明，不能静默不显示
  ok(pr.includes('这轮没做到'), '未覆盖的能力有显式说明');
  ok(pr.includes('这一轮最该补的') && pr.includes('class="verdict'), '诊断有一句话结论条');
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

console.log('\n【九】学情数据页（history.html）');
if (fs.existsSync('history.html')) {
  const hs = fs.readFileSync('history.html', 'utf8');
  ok(hs.includes('<title>学情数据'), '页面标题为「学情数据」');
  ok(hs.includes('<h1>学情数据</h1>'), '页面主标题为「学情数据」');
  ok(hs.includes('各章累计掌握情况'), '有章节汇总区');
  ok(hs.includes('逐轮记录'), '有逐轮记录区');
  ok(hs.includes('const BANK = '), '题库已内联');
  ok(hs.includes('xz-practice-v1'), '与练习页共用同一存储键');
  ok(hs.includes('还没有练习记录'), '有空状态提示');
  ok(hs.includes('exportBtn') && hs.includes('importBtn'), '有导出/导入（防清缓存丢数据）');
  ok(hs.includes('各能力累计掌握情况'), '有能力累计汇总区');
  ok(hs.includes('还没做到'), '未覆盖能力在汇总里显式标注');
  // 练习页必须有入口
  const pr2 = fs.readFileSync('practice.html', 'utf8');
  ok(pr2.includes('href="history.html"'), '练习页有入口');
  // 导航：必须排在「练习与诊断」之后
  const navM = hs.match(/<nav class="hdr-nav">([\s\S]*?)<\/nav>/);
  if (navM) {
    const items = [...navM[1].matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map((m) => m[2]);
    const iP = items.indexOf('练习与诊断');
    const iH = items.indexOf('学情数据');
    ok(iP >= 0 && iH === iP + 1, '导航中「学情数据」紧跟「练习与诊断」', items.join('|'));
  } else {
    ok(false, '顶栏导航存在');
  }
} else {
  ok(false, 'history.html 已生成');
}

console.log('\n【十】页头一致性');
// 所有内页的页头统一用 .hero-badge（胶囊 + 圆点），不用面包屑。
// 这条是硬约束：practice/history 曾长期用面包屑，与另外四页明显不同。
const innerPages = ['papers.html', 'trend.html', 'plan.html', 'practice.html', 'history.html'];
let badgeOk = 0, crumbPages = [];
for (const p of innerPages) {
  if (!fs.existsSync(p)) continue;
  const h = fs.readFileSync(p, 'utf8');
  if (h.includes('<div class="hero-badge">') && h.includes('.hero-badge{')) badgeOk++;
  else badgePagesFail = (badgePagesFail || []).concat(p);
  if (h.includes('class="crumb"')) crumbPages.push(p);
}
let badgePagesFail = [];
ok(badgeOk === innerPages.length, `内页均有页头 badge（${badgeOk}/${innerPages.length}）`,
  (badgePagesFail || []).join(','));
ok(crumbPages.length === 0, '内页均不再用面包屑', crumbPages.join(','));
// badge 样式必须来自共享外壳（site-shell），不能被某页私自覆盖
const shell = fs.readFileSync('work/site-shell.mjs', 'utf8');
ok(shell.includes('.hero-badge{'), 'badge 样式定义在共享外壳');

console.log('\n【十一】演示幻灯片（slides.html）');
if (fs.existsSync('slides.html')) {
  const sl = fs.readFileSync('slides.html', 'utf8');

  /* ---- 11.1 逐题台账重算演示里出现的每个数字，不信任构建脚本 ---- */
  const W = { easy: 1, mid: 2, hard: 3, top: 4 };
  const sumScore = (arr) => arr.reduce((a, q) => a + q.score, 0);
  const mainOf = (p) => LEDGER.filter((q) => q.p === p && !q.bonus);
  const papers = S.PAPER_STATS.map((s) => s.id);

  // 第 17 题：单题最高、同考点、全基础档
  const q17 = papers.map((p) => LEDGER.find((q) => q.p === p && q.no === 17));
  const q17Scores = q17.map((q) => q.score);
  ok(q17.every(Boolean), '五套卷都有第 17 题');
  ok(Math.max(...q17Scores) === Math.max(...LEDGER.filter((q) => !q.bonus).map((q) => q.score)),
    `第 17 题是全卷单题最高分（${Math.max(...q17Scores)} 分）`);
  ok(new Set(q17.map((q) => q.topic)).size === 1 && q17.every((q) => q.diff === 'easy'),
    '第 17 题五年同考点且同为基础档');

  // 第 17 题 > 第 23+24 题之和（逐年）
  const tail = papers.map((p) => {
    const a = LEDGER.find((q) => q.p === p && q.no === 23);
    const b = LEDGER.find((q) => q.p === p && q.no === 24);
    return (a ? a.score : 0) + (b ? b.score : 0);
  });
  ok(q17Scores.every((s, i) => s > tail[i]),
    `第 17 题逐年都超过第 23+24 题之和（${q17Scores.join(',')} vs ${tail.join(',')}）`);

  // 断崖：前 20 题难度指数必须明显低于第 21 题之后（逐年都成立）
  const cliffGaps = papers.map((p) => {
    const front = mainOf(p).filter((q) => q.no <= 20);
    const back = mainOf(p).filter((q) => q.no > 20);
    const idx = (arr) => sumScore(arr.map((q) => ({ score: W[q.diff] * q.score }))) / sumScore(arr);
    return idx(back) / idx(front);
  });
  ok(cliffGaps.every((g) => g > 1.5),
    `每套卷「第 21 题之后」难度指数都超过「前 20 题」的 1.5 倍（${cliffGaps.map((g) => g.toFixed(2)).join(' ')}）`);

  // 稳定题位：五个五年零例外基础档的位置
  const byNo = new Map();
  for (const q of LEDGER) {
    if (!byNo.has(q.no)) byNo.set(q.no, []);
    byNo.get(q.no).push(q);
  }
  const stable = [...byNo.entries()]
    .filter(([, qs]) => qs.length === S.N_PAPERS && qs.every((q) => q.diff === 'easy'))
    .map(([no]) => no)
    .sort((a, b) => a - b);
  ok(stable.length > 0 && stable.every((n) => sl.includes('第 ' + n + ' 题')),
    `稳定题位 ${stable.map((n) => 'q' + n).join(' ')} 全部出现在页面上`);

  /* 页面上说"唯一的例外是第 N 题"——这句必须真的只有一个，否则就是谎报 */
  const jumps = [...byNo.entries()]
    .filter(([, qs]) => qs.length === S.N_PAPERS)
    .map(([no, qs]) => ({ no, span: Math.max(...qs.map((q) => W[q.diff])) - Math.min(...qs.map((q) => W[q.diff])) }))
    .filter((j) => j.span >= 2);
  ok(jumps.length === 1, `难度跨 2 档以上的题位只有 1 个（实际 ${jumps.length}：${jumps.map((j) => 'q' + j.no).join(',')}）`);
  if (jumps.length === 1) {
    ok(sl.includes('唯一的例外是第 ' + jumps[0].no + ' 题'),
      `页面标注的例外（第 ${jumps[0].no} 题）与台账一致`);
  }

  // 计算 / 概念占比
  let calc = 0, concept = 0;
  for (const q of LEDGER) {
    if (q.bonus) continue;
    if (q.cat === '计算') calc += q.score;
    if (q.cat === '概念') concept += q.score;
  }
  const calcAvg = calc / S.N_PAPERS, conceptAvg = concept / S.N_PAPERS;
  ok(sl.includes(calcAvg.toFixed(1)) && sl.includes(conceptAvg.toFixed(1)),
    `计算 ${calcAvg.toFixed(1)} 分 / 概念 ${conceptAvg.toFixed(1)} 分 与台账一致`);

  // 计算三块（有理数 / 解方程 / 整式化简）
  const calc3 = ['f-arith', 'f-solveeq', 'f-simplify'].map((id) => S.FAMILY_MAP.find((f) => f.id === id));
  ok(calc3.every(Boolean), '计算三族均存在于 FAMILY_MAP');
  ok(calc3.every((f) => sl.includes(String(f.avgPerYear))),
    `计算三族年均分 ${calc3.map((f) => f.avgPerYear).join(' / ')} 都在页面上`);
  ok(calc3.every((f) => f.slots.every((s) => s.diff === 'easy')),
    '计算三族逐年落点全是基础档（"位置与难度都不变"这句话成立）');

  // 第 23 题：五年全是分类能力
  const q23 = papers.map((p) => LEDGER.find((q) => q.p === p && q.no === 23));
  ok(q23.every((q) => q && q.cat === '分类'), '第 23 题五年全是「分类」能力');

  /* 结论页"第 23 题…"那一行挂的分值必须是第 23 题本身的年均分，
     不能是 f-final 族的分（该族还含第 24、26 题，9.2 ≠ 6.4）。 */
  const q23Avg = +(q23.reduce((a, q) => a + q.score, 0) / S.N_PAPERS).toFixed(1);
  const q23Line = sl.match(/第 23 题练「列全」[\s\S]{0,400}?>([\d.]+) 分</);
  ok(q23Line && +q23Line[1] === q23Avg,
    `结论页「第 23 题」挂的分值是单题年均 ${q23Avg} 分（实际 ${q23Line ? q23Line[1] : '未找到'}）`);
  const fFinalAvg = S.FAMILY_MAP.find((f) => f.id === 'f-final').avgPerYear;
  ok(fFinalAvg !== q23Avg && !(q23Line && +q23Line[1] === fFinalAvg),
    `没有把 f-final 族的 ${fFinalAvg} 分错挂到"第 23 题"这句上`);

  // 必考族清单必须全部列出，且数量与 FREQ.must 一致
  const mustNames = S.FREQ.must.map((f) => f.name);
  ok(mustNames.every((n) => sl.includes(n)), `${mustNames.length} 个必考族全部列出`);
  ok(sl.includes(`>${S.FREQ.must.length}</b><span>个必考族`), `必考族计数 ${S.FREQ.must.length} 派生正确`);

  // 基础+中档占比
  const baseMid = +(S.DIFF_SCORE.easy.avg + S.DIFF_SCORE.mid.avg).toFixed(1);
  ok(sl.includes(String(baseMid)), `基础+中档年均 ${baseMid} 分 派生正确`);

  /* ---- 11.2 结构与交互 ---- */
  ok(sl.includes(`${LEDGER.length}</b><span>题逐题标注`), `题数 ${LEDGER.length} 派生正确`);
  ok(sl.includes(`${S.FAMILY_MAP.length}</b><span>个考点族`), `族数 ${S.FAMILY_MAP.length} 派生正确`);
  const slideN = (sl.match(/class="slide/g) || []).length;
  ok(slideN >= 9, `页数 ${slideN}`);
  ok(sl.includes('ArrowRight') && sl.includes('requestFullscreen') && sl.includes('data-go'),
    '键盘翻页 / 全屏 / 总览交互齐备');
  ok(sl.includes('p=(\\d+)'), '支持 ?p=N 定位');
  ok(sl.includes('window.innerWidth/1280') && sl.includes('window.innerHeight/720'), '16:9 舞台按窗口缩放');

  // 已删除的审计型页面不得回流
  for (const gone of ['六章分值分布', '八种能力的分值分布', '题位骨架']) {
    ok(!sl.includes(gone), `已删除的「${gone}」未回流`);
  }

  // 页码不得超出实际页数
  ok(!sl.includes(`/ ${slideN + 1}<`), '页码与页数一致');
} else {
  ok(false, 'slides.html 已生成');
}

console.log('\n' + (fail === 0 ? '=== 全部通过 ===' : `=== ${fail} 项未通过 ===`));
process.exit(fail === 0 ? 0 : 1);
