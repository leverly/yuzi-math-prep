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
const pages = ['index.html', 'home.html', 'papers.html', 'trend.html', 'plan.html'];
for (const p of pages) ok(fs.existsSync(p), `${p} 已生成`);

/* index.html 现在是考区选择页，科目首页是 home.html */
const sel = fs.readFileSync('index.html', 'utf8');
const idx = fs.readFileSync('home.html', 'utf8');
const tr = fs.readFileSync('trend.html', 'utf8');
const pl = fs.readFileSync('plan.html', 'utf8');
/* 首页是「考情总览」：首屏给卷面骨架与分值分布，第二屏给必考族清单。
   这些数字必须从台账派生，不能是手写字面量。 */
const { ROUND_SIZE } = await import('./work/site-shell.mjs');
const qPerPaper = LEDGER.length / S.PAPER_STATS.length;
const bonusPerPaper = LEDGER.filter((q) => q.bonus).length / S.PAPER_STATS.length;
ok(idx.includes(`<b>${qPerPaper}</b><span>题 · 100 分钟</span>`), `首页题数 ${qPerPaper} 派生正确（含选做）`);
ok(idx.includes(`必做 ${qPerPaper - bonusPerPaper} + 选做 ${bonusPerPaper}`), '首页题数拆分（必做/选做）派生正确');
ok(idx.includes(`<b>${S.FREQ.must.length}</b><span>族年年考</span>`), '首页必考族数派生正确');
// 必考族清单必须列全，不能只列前几条
const mustRows = (idx.match(/class="must-row"/g) || []).length;
ok(mustRows === S.FREQ.must.length, `首页列出全部 ${S.FREQ.must.length} 个必考族`, `${mustRows} 行`);
// 行动入口仍在（考情讲完后给唯一动作），且指向练习页
ok(/class="btn primary" href="practice\.html"/.test(idx), '行动横幅主按钮指向练习页');
ok(idx.includes('href="history.html"'), '行动横幅有学情数据入口');
// 练习页与首页必须承诺同一个轮次题量
const pr0 = fs.readFileSync('practice.html', 'utf8');
ok(pr0.includes(`每轮 ${ROUND_SIZE} 道题`), '练习页轮次题量与首页同源');
// 已删掉的重叠内容不应回归
ok(!idx.includes('三个判断'), '首页不再有「三个判断」与分值分区重复');
ok(!idx.includes('100 分不是均匀分布的'), '首页不再有重复的分值分区屏');
ok(!idx.includes('class="out-card"'), '首页不再复述诊断五样东西（已在备考诊断页）');
ok(tr.includes(`共 ${S.FAMILY_MAP.length} 族`), '趋势页族数派生正确');
// 备考建议页已去掉分数目标（避免给孩子压力），改为检查「三类题」结构与五级优先级
ok(pl.includes('<h1>备考建议</h1>'), '计划页标题为「备考建议」');
ok(pl.includes('练得稳') && pl.includes('要想一想') && pl.includes('尽力就好'), '计划页三类题结构存在');
ok(!/先保约\s*\d+\s*分|总分\s*≥\s*\d+|目标正确率\s*100%/.test(pl), '计划页不含分数目标（无施压量化）');
/* 改名必须全站同步：导航来自 site-shell，任一页面残留旧标签都是漏改。
   这里是历次改名留下的旧词清单——以后改名把旧词加进来，自动获得全站保护。
   注意：清单里只放「不会作为其他正确文案子串出现」的词。
   「总览」不能放进来——它被「考情总览」包含，子串匹配会误伤正确文案
   （这正是之前踩过的「校验规则误伤正确文字」）。导航项改名改用下面的精确检查。 */
{
  const RETIRED = ['冲刺计划', '练习与诊断', '学情诊断', '演示', '备考计划'];
  for (const word of RETIRED) {
    const stale = [];
    for (const h of fs.readdirSync('.').filter((f) => f.endsWith('.html'))) {
      if (fs.readFileSync(h, 'utf8').includes(word)) stale.push(h);
    }
    ok(stale.length === 0, `全站 HTML 均无旧标签「${word}」`, stale.join(','));
  }

  // 导航项必须逐字等于 site-shell 的 NAV（防止只改了一部分页面）。
  // 顶栏还有一个 .nav-switch「⇄ 切换」返回考区选择器，它不属于 NAV，比对时排除。
  const { NAV } = await import('./work/site-shell.mjs');
  const wantNav = NAV.map(([, t]) => t);
  let navBad = [];
  for (const h of ['home.html', 'papers.html', 'trend.html', 'plan.html', 'practice.html', 'history.html']) {
    if (!fs.existsSync(h)) continue;
    const m = fs.readFileSync(h, 'utf8').match(/<nav class="hdr-nav">([\s\S]*?)<\/nav>/);
    if (!m) { navBad.push(h + '(无导航)'); continue; }
    const got = [...m[1].matchAll(/<a href="[^"]+"([^>]*)>([^<]+)<\/a>/g)]
      .filter((x) => !/nav-switch/.test(x[1]))
      .map((x) => x[2]);
    if (got.join('|') !== wantNav.join('|')) {
      navBad.push(`${h}: ${got.join('/')} ≠ ${wantNav.join('/')}`);
    }
  }
  ok(navBad.length === 0, '各页导航项与 NAV 单一来源逐字一致', navBad.join('; '));
  // 曾经的「总览」不得作为独立导航项回归
  ok(!wantNav.includes('总览'), '导航不再有裸「总览」（应为「考情总览」）');
}

console.log('\n【四之二】首页与「考情总览」定位一致');
{
  const idx2 = fs.readFileSync('home.html', 'utf8');
  /* 首页是考情总览：讲卷子（多少题、多少分、哪些族必考），不是讲诊断功能。
     诊断的产出（五样东西、能力分档）属于备考诊断页，不该在首页复述。 */
  ok(idx2.includes('class="cta-band"'), '有行动横幅（讲完考情给唯一动作）');
  ok(idx2.includes('开始诊断'), '行动横幅有明确按钮');
  ok(idx2.includes('五年年年考'), '首页有必考族清单');
  ok(idx2.includes('各章年均分值'), '首页有章节分值分布');
  ok(!idx2.includes('各能力分档'), '诊断能力维度已移出首页（属备考诊断页）');
}

console.log('\n【四之四】考区选择页（index.html）');
{
  const { CATALOG, CHOICE_KEY, NAV } = await import('./work/site-shell.mjs');

  ok(sel.includes(`<title>期末考情导航站`), '选择页标题为「期末考情导航站」');
  ok(sel.includes('期末考情导航站'), '选择页展示站点名');
  /* 选择页顶栏不能出现科目站导航——此时还没选科目 */
  const selHdr = (sel.match(/<header class="site-head">[\s\S]*?<\/header>/) || [''])[0];
  ok(selHdr.length > 0, '选择页有顶栏');
  for (const [, t] of NAV) {
    if (['考情精简版'].includes(t)) continue;
    ok(!selHdr.includes(`>${t}<`), `选择页顶栏不含科目站导航项「${t}」`);
  }
  ok(!selHdr.includes('nav-slides'), '选择页顶栏不含「考情精简版」入口');

  /* 四级选择器齐全 */
  for (const [id, label] of [['optProvince', '省份'], ['optRegion', '地区'], ['optGrade', '年级'], ['optSubject', '科目']]) {
    ok(sel.includes(`id="${id}"`), `选择页有「${label}」一级（${id}）`);
  }
  ok(sel.includes('id="goBtn"'), '选择页有「进入」按钮');

  /* 目录数据必须内联，且与 CATALOG 同源（file:// 下不能 import） */
  ok(sel.includes(JSON.stringify(CATALOG)), '目录数据与 CATALOG 同源内联');
  ok(!/^\s*import\s/m.test(sel.replace(/<script>[\s\S]*?<\/script>/g, '')), '选择页无外部 import');

  /* 记忆选择 */
  ok(sel.includes(CHOICE_KEY), `记住选择用统一存储键（${CHOICE_KEY}）`);
  ok(sel.includes('localStorage.setItem') && sel.includes('localStorage.removeItem'),
    '选择页有「记住」与「清除」两个动作');

  /* 「进入」按钮的就绪态不能依赖 :disabled 伪类或 opacity 过渡——
     这两者在 headless / 低帧率下会停在旧值，出现「已可点但看着是灰的」。
     用 aria-disabled 显式属性 + 只过渡 transform/box-shadow。 */
  ok(sel.includes('aria-disabled'), '就绪态用 aria-disabled 显式属性控制');
  ok(/\.sel-go\[aria-disabled="true"\]/.test(sel), '未就绪态有对应样式规则');
  {
    const goRule = (sel.match(/\.sel-go\{[^}]*\}/) || [''])[0];
    ok(!/transition:[^;]*opacity/.test(goRule), '「进入」按钮的过渡不含 opacity');
  }
  /* 单一选项的层级必须自动选中，否则用户要点三次才有反应 */
  ok(sel.includes('autoFill'), '有单选层级的自动填充逻辑');

  /* 每个科目都要有可达目标：本站页必须存在，外站必须是 https */
  const allSubjects = Object.entries(CATALOG.subjects).flatMap(([k, arr]) => arr.map((s) => ({ ...s, key: k })));
  ok(allSubjects.length > 0, '目录里至少有一个科目');
  const buildingSubjects = allSubjects.filter((s) => s.building);
  for (const s of buildingSubjects) {
    /* 建设中：不可点，且页面上必须有「建设中」角标——不能静默留一个点不动的按钮 */
    ok(!s.href, `科目「${s.name}」建设中不挂跳转（避免点进空页）`);
  }
  if (buildingSubjects.length) {
    ok(sel.includes('建设中'), '建设中科目在页面上有可见角标');
    ok(sel.includes('b.disabled = true') || sel.includes('disabled = true'),
      '建设中科目按钮实际被禁用');
  }
  for (const s of allSubjects) {
    if (s.building) continue;
    if (s.own) {
      ok(fs.existsSync(s.href), `科目「${s.name}」指向的 ${s.href} 存在`);
    } else {
      ok(/^https:\/\//.test(s.href), `科目「${s.name}」外链为 https（${s.href}）`);
    }
  }

  /* 声明了几套卷就要真有几套——不许把空科目当可用科目列进选择器 */
  const paperDirs = fs.existsSync('真题试卷') ? fs.readdirSync('真题试卷') : [];
  ok(!allSubjects.some((s) => s.own && !paperDirs.includes(s.name)),
    '本站科目都在真题试卷目录下有材料');
  ok(!allSubjects.some((s) => !s.building && s.papers === 0),
    '没有标「建设中」的科目不能是 0 套卷');
}

console.log('\n【四之三】两页划分：逐年拆解 vs 整体解读');
{
  const pp = fs.readFileSync('papers.html', 'utf8');
  const tr2 = fs.readFileSync('trend.html', 'utf8');
  const W2 = { easy: 1, mid: 2, hard: 3, top: 4 };

  /* 逐年页只能放「本卷独有」的信息。
     五年完全相同的东西（选择16/填空16/解答68、24必做+2选做）出现 5 次就是噪声。 */
  ok(!pp.includes('8 题 × 2 分'), '逐年页不再逐卷复制五年相同的卷面骨架');
  ok(!pp.includes('<h3>章节分值</h3>'), '逐年页不再有「章节分值」卡（与整体页转置重复）');
  ok(!pp.includes('<h3>难度分布</h3>'), '逐年页不再有「难度分布」卡（与整体页转置重复）');
  /* 逐年页必须有的本卷独有内容 */
  ok(pp.includes('解答题分值怎么分'), '逐年页有「解答题分值怎么分」（五年唯一逐卷都变的信息）');
  ok(pp.includes('这一卷哪一章比往年重'), '逐年页有「章节相对五年均值的偏离」');
  ok(pp.includes('选做两道考什么'), '逐年页有「选做两道考什么」');

  /* 逐年页的章节偏离必须真的算对了：每卷「偏离最大那一章」的章名与方向要与重算一致。
     只校验章名 + 方向 + 数值，不依赖具体句子结构（句子改过一次就挂）。 */
  const CHK = ['ch-rational', 'ch-poly', 'ch-geo', 'ch-eq', 'ch-expr', 'ch-op'];
  let devOk = 0;
  for (const s of S.PAPER_STATS) {
    const devs = CHK.map((k) => ({
      name: S.CH_SCORE[k].name,
      d: +((s.ch[k] || 0) - S.CH_SCORE[k].avg).toFixed(1),
    })).sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
    const top = devs[0];
    const wantName = top.name;
    const wantDir = top.d > 0 ? '比五年均值多' : '比五年均值少';
    const wantVal = String(Math.abs(top.d));
    /* 该卷这一段里必须同时出现：章名、方向、绝对值。
       锚点用「年份 + 难度指数」，不能只用难度指数——1.76 在 2023-24 与 2025-26 重复。 */
    const start = pp.indexOf(`${s.year} 学年`);
    const seg = pp.slice(start, start + 6000);
    if (seg.includes(wantName) && seg.includes(wantDir) && seg.includes(wantVal)) devOk++;
  }
  ok(devOk === S.PAPER_STATS.length, `五卷的「偏离最大章」全部与重算一致（${devOk}/${S.PAPER_STATS.length}）`);

  /* 整体页只能讲「五年合起来」的判断，不能再摆逐年矩阵 */
  ok(!tr2.includes('各章分值五年走势'), '整体页已删逐年章节矩阵');
  ok(!tr2.includes('难度四级五年分布'), '整体页已删逐年难度矩阵');
  ok(!tr2.includes('八种能力的分值分布'), '整体页已删八能力逐条（与练习诊断重复）');
  /* 整体页的三段结构必须在：没变 / 分在哪 / 在变 */
  for (const k of ['没变', '分在哪', '在变']) {
    ok(tr2.includes(`<span class="kicker">${k}</span>`), `整体页有「${k}」一节`);
  }

  /* ---- 考点族热力矩阵 ----
   * 行 = 族，列 = 学年，格子深浅 = 该年分值。这是英语站的做法，比纯表格多一维「逐年分布」。 */
  ok(tr2.includes('各考点分值分布与重要性'), '整体页有考点族热力矩阵');
  ok(tr2.includes('class="heat"'), '热力矩阵用 table.heat');
  ok(tr2.includes('heat-scroll-hint'), '窄屏有横滑提示（否则读者以为表格被裁断）');
  ok(tr2.includes('heat-legend'), '有图例');
  {
    /* 格子总数必须 = 族数 × 学年数（不多不少，缺一格就是漏渲染） */
    const cells = (tr2.match(/class="cellbox/g) || []).length;
    const want = S.FAMILY_MAP.length * S.YEARS.length;
    ok(cells === want, `格子数 = 族数 × 学年数（${cells} = ${S.FAMILY_MAP.length} × ${S.YEARS.length}）`);

    /* 色阶必须 5 档、且 5 档都有格子。语义分档（2/3-5/6-8/9-12/13+）在数学站成立，
       分位数会塌档（20% 与 40% 分位都是 2 分）——这里把「不塌档」锁住。 */
    const lv = (v) => (v <= 0 ? 0 : v <= 2 ? 1 : v <= 5 ? 2 : v <= 8 ? 3 : v <= 12 ? 4 : 5);
    const used = new Set();
    for (const f of S.FAMILY_MAP) {
      for (const y of S.YEARS) {
        const v = (f.perYear && f.perYear[y]) || 0;
        if (v > 0) used.add(lv(v));
      }
    }
    ok(used.size === 5, `语义分档 5 档都有格子（实际用到 ${[...used].sort().join(',')}）`);

    /* 分位数方案会塌档——留一条反向断言，防止有人换回分位数 */
    const vals = [];
    for (const f of S.FAMILY_MAP) for (const v of f.scores || []) if (v > 0) vals.push(v);
    vals.sort((a, b) => a - b);
    const q = (p) => vals[Math.min(vals.length - 1, Math.floor(vals.length * p))];
    const qThresh = [q(0.2), q(0.4), q(0.6), q(0.8)];
    ok(new Set(qThresh).size < qThresh.length,
      `分位数阈值有重复（${qThresh.join('/')}）→ 分档会塌，故用语义分档`);

    /* 不得把内部卷号（p2022）泄漏到页面 */
    ok(!/选做 p20\d\d/.test(tr2), '选做年份用标签不用内部卷号');
    ok(!/选做\s+年/.test(tr2), '无选做记录的族不渲染空的「选做 年」');
  }

  /* 整体页引用的每个数字都要能从台账重算出来 */
  const mainOf2 = (p) => LEDGER.filter((q) => q.p === p && !q.bonus);
  const idxOf2 = (qs) => {
    const t = qs.reduce((a, q) => a + q.score, 0);
    return t ? qs.reduce((a, q) => a + W2[q.diff] * q.score, 0) / t : 0;
  };
  const cliff2 = S.PAPER_STATS.map((s) => {
    const f = mainOf2(s.id).filter((q) => q.no <= 20);
    const b = mainOf2(s.id).filter((q) => q.no > 20);
    return { fs: f.reduce((a, q) => a + q.score, 0), bs: b.reduce((a, q) => a + q.score, 0), fi: idxOf2(f), bi: idxOf2(b) };
  });
  const fa2 = +(cliff2.reduce((a, c) => a + c.fs, 0) / S.N_PAPERS).toFixed(1);
  const ba2 = +(cliff2.reduce((a, c) => a + c.bs, 0) / S.N_PAPERS).toFixed(1);
  ok(tr2.includes(`>${fa2}<`) && tr2.includes(`>${ba2}<`), `断崖两段 ${fa2}/${ba2} 派生正确`);
  ok(ba2 / fa2 < 0.4, `「后段不到前段四成」成立（${(ba2 / fa2).toFixed(2)}）`);
  const ratios = cliff2.map((c) => c.bi / c.fi);
  const rMin = +Math.min(...ratios).toFixed(1), rMax = +Math.max(...ratios).toFixed(1);
  ok(tr2.includes(`${rMin}–${rMax} 倍`), `难度倍数区间 ${rMin}–${rMax} 派生正确`);

  /* 单题最高分：五年同题位、同考点 */
  const tops2 = S.PAPER_STATS.map((s) => {
    const qs = LEDGER.filter((q) => q.p === s.id && !q.bonus);
    return qs.reduce((a, q) => (q.score > a.score ? q : a));
  });
  ok(new Set(tops2.map((q) => q.no)).size === 1, `单题最高题位五年唯一（q${tops2[0].no}）`);
  ok(new Set(tops2.map((q) => q.topic)).size === 1, `单题最高考点五年唯一（${tops2[0].topic}）`);

  /* 分类能力：页面说「最近两年都是 N 分」，必须成立 */
  const cls2 = S.PAPER_STATS.map((s) => LEDGER.filter((q) => q.p === s.id && q.cat === '分类').reduce((a, q) => a + q.score, 0));
  ok(cls2[cls2.length - 1] === cls2[cls2.length - 2], `分类能力最近两年同分（${cls2.slice(-2).join(' / ')}）`);
  ok(tr2.includes(`最近两年都是 ${cls2[cls2.length - 1]} 分`), '分类「最近两年都是 N 分」与重算一致');

  /* 族名里带题位的族，如果实际落点不止一题，必须标出「实际落点」——
     否则「分类压轴（第23题位）」会被读成"只考第 23 题"（实际还含第 24、26 题）。 */
  const slotNamed = S.FAMILY_MAP.filter((f) => /(\d+)\s*题位/.test(f.name));
  let slotOk = 0;
  for (const f of slotNamed) {
    const nos = [...new Set(f.slots.map((s) => s.no))].sort((a, b) => a - b);
    const inName = +(f.name.match(/(\d+)\s*题位/) || [])[1];
    const isSingle = nos.length === 1 && inName === nos[0];
    if (isSingle) { slotOk++; continue; }
    const want = `实际落点：第 ${nos.join('、')} 题`;
    if (tr2.includes(want)) slotOk++;
    else console.log(`      缺：${f.name} → ${want}`);
  }
  ok(slotOk === slotNamed.length,
    `族名带题位的族都标出了实际落点（${slotOk}/${slotNamed.length}）`);
}

console.log('\n【五】死链');
const htmls = fs.readdirSync('.').filter((f) => f.endsWith('.html'));
let dead = 0;
for (const h of htmls) {
  const txt = fs.readFileSync(h, 'utf8');
  const hrefs = [...txt.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter(Boolean);
  for (const raw of new Set(hrefs)) {
    if (/^https?:/.test(raw)) continue;
    const [l, frag] = raw.split('#');
    if (l && !fs.existsSync(l)) { console.log(`  ✗ ${h} → ${l}`); dead++; continue; }
    /* 锚点也要校验：改了 section id 之后，别的页面指向旧锚点会静默失效 */
    if (frag) {
      const target = l || h;
      const targetTxt = l ? fs.readFileSync(target, 'utf8') : txt;
      if (!targetTxt.includes(`id="${frag}"`)) {
        console.log(`  ✗ ${h} → ${raw}（锚点不存在）`);
        dead++;
      }
    }
  }
}
ok(dead === 0, '所有内部链接与锚点可达', dead + ' 个死链');

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
  /* index.html 是考区选择页，顶栏是「站点名 + 说明」而不是科目站导航，
     单独在【四之四】校验；这里只比对科目站的五个内容页。 */
  const PAGE_FILES = ['home.html', 'papers.html', 'trend.html', 'plan.html', 'practice.html'];

  // 8.1 顶栏标记一致：品牌 + 导航项（href/文字/高亮/精简版样式）必须与共享来源同构
  const { headerHtml } = await import('./work/site-shell.mjs');

  /* 导航标签变长会挤掉最后几项（「考情精简版」比「演示」长 3 字，
     曾把「切换」挤出 820px 视口）。这里按字符宽度估算是否还放得下，
     并要求 HEAD_CSS 里有对应的收缩断点。 */
  {
    const { NAV: NAV2, HEAD_CSS } = await import('./work/site-shell.mjs');
    /* 中文字按 1em、拉丁按 .55em 粗估；导航项 padding 与间距按最宽断点算 */
    const labelEm = (s) => [...s].reduce((w, c) => w + (/[\u4e00-\u9fa5]/.test(c) ? 1 : 0.55), 0);
    const totalEm = NAV2.reduce((w, [, t]) => w + labelEm(t), 0) + labelEm('⇄ 切换');
    /* 14px 字号 + 每项 26px 内边距 + 间隔，粗估总宽 */
    const estPx = totalEm * 14 + NAV2.length * 26 + 60;
    ok(estPx < 900, `导航总宽粗估 ${Math.round(estPx)}px，760px 视口内可容纳（含收缩）`);
    ok(/@media\(max-width:1100px\)\{[\s\S]*?\.hdr-nav a\{/.test(HEAD_CSS),
      'HEAD_CSS 里有导航中窄屏收缩断点');
  }
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

  /* 能力区不能被条件包裹后静默消失：老记录没有 cats 字段时，
     原来整块跳掉，用户只看到章节，会以为站点不诊断能力。
     现在必须始终渲染，并给出「再练一轮就会补上」的说明。 */
  ok(!/if \(catSessions > 0\)/.test(hs), '能力区不再被 catSessions 条件包裹');
  ok(hs.includes('没有存能力明细') && hs.includes('再练一轮就会补上'),
    '老记录下能力区给出明确说明而不是隐藏');
  /* 逐轮明细必须同时含章节与能力两个切面 */
  ok(hs.includes('按章节') && hs.includes('按能力'), '逐轮明细同时展示章节与能力');
  ok(/s\.cats/.test(hs) && /hasCats/.test(hs), '逐轮明细读取了每轮的能力数据');
  ok(hs.includes('同一批题的另一切面'), '逐轮明细说明章节与能力是同一批题的两种切法');

  /* ---- 考点族累计（三层里最细的一层）---- */
  ok(hs.includes('各考点累计掌握情况'), '有考点族累计汇总区');
  {
    /* 以题库全部族为全集：每个族恰好一张卡，不多不少。
       没做到的族也要出现，否则读者看不出还有多少没轮到（能力区踩过同样的坑）。 */
    const cardNames = [...hs.matchAll(/FAM_META\.name/g)].length; // 仅占位，真实校验用下面的数据
    const famIds = Object.keys((await import('./practice-data.mjs')).FAM_META);
    ok(famIds.length > 0, `题库考点族 ${famIds.length} 个`);
    ok(hs.includes('famAgg = new Map()'), '有族级聚合');
    ok(/for \(const \[fid, meta\] of Object\.entries\(FAM_META\)\)/.test(hs),
      '族级聚合以全部族为全集初始化（不只纳入做过的）');
    /* 旧记录里已下线的族不得冒出新卡片，但要计数说明 */
    ok(hs.includes('retiredQ'), '已下线的族会被计数而不是静默丢弃');
    ok(hs.includes('题库已调整下线的考点'), '有下线族的说明文案');
    /* 老记录没有 fams 字段时的说明 */
    ok(hs.includes('没有存考点明细') && hs.includes('再练一轮就会补上'),
      '老记录下考点区给出说明而不是隐藏');
    /* 一轮只覆盖 6 个族这件事必须写在页面上 */
    ok(hs.includes('一轮 18 题只覆盖'), '页面说明一轮只覆盖 6 个考点');
    /* 落库：练习页必须把 fams 存进 sessions */
    const prSrc = fs.readFileSync('practice.html', 'utf8');
    ok(/fams:\s*\(diagResult\.fams/.test(prSrc), '练习页把族级结果落库到 sessions');
  }
  // 练习页必须有入口
  const pr2 = fs.readFileSync('practice.html', 'utf8');
  ok(pr2.includes('href="history.html"'), '练习页有入口');
  // 导航：必须排在「备考诊断」之后
  const navM = hs.match(/<nav class="hdr-nav">([\s\S]*?)<\/nav>/);
  if (navM) {
    const items = [...navM[1].matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map((m) => m[2]);
    const iP = items.indexOf('备考诊断');
    const iH = items.indexOf('学情数据');
    ok(iP >= 0 && iH === iP + 1, '导航中「学情数据」紧跟「备考诊断」', items.join('|'));
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
  /* 页面说"位置最多在相邻两题之间挪一次"——必须真的是相邻题位 */
  const slotGaps = calc3.map((f) => {
    const nos = [...new Set(f.slots.map((s) => s.no))].sort((a, b) => a - b);
    return nos.length === 1 ? 0 : Math.max(...nos) - Math.min(...nos);
  });
  ok(slotGaps.every((g) => g <= 1),
    `计算三族的题位跨度都不超过 1（${calc3.map((f, i) => f.name + ':' + slotGaps[i]).join(' ')}）`);

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

  /* 页面标题必须与导航标签一致——导航叫「考情精简版」而标题叫「考情解读」，
     用户从导航点进来会以为自己走错了。 */
  {
    const { NAV: NAV3 } = await import('./work/site-shell.mjs');
    const navLabel = (NAV3.find(([h]) => h === 'slides.html') || [])[1];
    ok(navLabel === '考情精简版', `导航标签为「考情精简版」（实际「${navLabel}」）`);
    ok(sl.includes(`<title>${navLabel}`), `页面标题与导航标签同为「${navLabel}」`);
  }

  // 已删除的审计型页面不得回流
  for (const gone of ['六章分值分布', '八种能力的分值分布', '题位骨架']) {
    ok(!sl.includes(gone), `已删除的「${gone}」未回流`);
  }

  // 页码不得超出实际页数
  ok(!sl.includes(`/ ${slideN + 1}<`), '页码与页数一致');

  /* ---- 11.3 演示必须与「整体解读」的最新结论同源 ----
     演示是演讲版，结论要和网页版一致；网页版改了结论、演示没跟，就是两套说法。 */
  const trLive = fs.readFileSync('trend.html', 'utf8');

  // 「在变」两处结论：整体页有的，演示也必须有
  ok(trLive.includes('新定义已退出必做位'), '整体页有「新定义退出必做位」结论');
  ok(sl.includes('新定义已退出必做位'), '演示跟上了「新定义退出必做位」');
  ok(trLive.includes('分类讨论在加重'), '整体页有「分类讨论在加重」结论');
  ok(sl.includes('分类讨论在加重'), '演示跟上了「分类讨论在加重」');

  // 分类逐年分值：两页必须一致
  const clsS = S.PAPER_STATS.map((s) => LEDGER.filter((q) => q.p === s.id && q.cat === '分类').reduce((a, q) => a + q.score, 0));
  const clsSeries = clsS.join('/');
  ok(trLive.includes(clsS.join(' ')) || clsS.every((v) => trLive.includes(`>${v}<`)),
    `整体页分类逐年 ${clsSeries} 与台账一致`);
  ok(clsS.every((v) => sl.includes(`>${v}<`)), `演示分类逐年 ${clsSeries} 与台账一致`);

  // 新定义逐年必做分值：演示表格里的数字必须能从台账复算
  const ndMain = S.PAPER_STATS.map((s) => LEDGER.filter((q) => q.p === s.id && q.cat === '新定义' && !q.bonus).reduce((a, q) => a + q.score, 0));
  ok(ndMain[ndMain.length - 1] === 0, `最新一年新定义必做 0 分（${ndMain.join('/')}）`);
  ok(sl.includes('新定义已退出必做位') && sl.includes('旧印象已经过时'),
    '演示的新定义结论与台账一致（必做归零）');

  // 考频三档：演示不得再把「极少考」写成「偶考」
  ok(sl.includes(`极少考 ${S.FREQ_SUMMARY.rare.n} 族`),
    `演示用「极少考 ${S.FREQ_SUMMARY.rare.n} 族」正确标注`);
  ok(!sl.includes(`${S.FREQ.rare.length} 个偶考族`),
    '演示不再把极少考的族写成「偶考」（曾错标 11 族 83 分）');

  // 断崖倍数：网页版与演示都不能写死「两倍」
  const r2 = S.PAPER_STATS.map((s) => {
    const qs = LEDGER.filter((q) => q.p === s.id && !q.bonus);
    const idx = (arr) => {
      const t = arr.reduce((a, q) => a + q.score, 0);
      return t ? arr.reduce((a, q) => a + W[q.diff] * q.score, 0) / t : 0;
    };
    return idx(qs.filter((q) => q.no > 20)) / idx(qs.filter((q) => q.no <= 20));
  });
  ok(Math.min(...r2) < 2, `后段/前段倍数最小值 ${Math.min(...r2).toFixed(2)} < 2，不能写「两倍」`);
  ok(!/是前一段的两倍/.test(sl), '演示未写死「两倍」');
  ok(!/难度是前一段的两倍/.test(trLive), '整体页未写死「两倍」');
} else {
  ok(false, 'slides.html 已生成');
}

console.log('\n' + (fail === 0 ? '=== 全部通过 ===' : `=== ${fail} 项未通过 ===`));
process.exit(fail === 0 ? 0 : 1);
