/* ==========================================================
   柚子初一(上)数学期末复习 · 静态站点生成器
   用法：node build-site.mjs [--only=home,calc,today]
   输出：根目录各页面、method/ map/ 子目录、dist/data 分片

   从「北京中考数学领航」的构建器改造而来，关键差异：
     ① 首页从「产品介绍」改为「今日任务卡」——备考工具要打开就能做
     ② 三层从「送分/中档/区分」改为「熟练/理解/攻坚」——按认知而非分值
     ③ 所有页面数字从 STATS / EXAM / DAILY 派生，禁止字面量
        （参考站有 10 处硬编码，导致 README 说 P2、页面写 P1）
     ④ 计算专项 / 每日闭环 / 整卷模考曾各自成页，现均已停用：
        选题统一走 drill.html（含族筛选），诊断走 diag.html
   ========================================================== */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CHAPTERS, METHODS, ALL_QUESTIONS as QUESTIONS, ALL_CONCEPTS as CONCEPTS,
  CALC_QUESTIONS, CALC_BY_TYPE, CALC_TYPE_NAME, METHOD_QUESTIONS,
  CH_BY_ID, M_BY_ID, Q_BY_ID, Q_BY_METHOD, Q_BY_CHAPTER, C_BY_CHAPTER,
  STATS, EXAM_STRUCTURE, TIERS, DAILY, PHASES, FORMULAS,
  PAPERS, CH_SCORE, CAT_SCORE, DIFF_SCORE,
  PAPER_STATS, DIFF_COUNT, DIFF_NAME, CH_NAME,
  FAMILIES_SORTED, FREQ_SUMMARY, TOPIC_MAP, FAMILY_DEFS,
  CONCEPT_TO_FAMILY, FORMULA_TO_FAMILY, LEARN_MODULES,
  KNOW, KNOW_BY_FAMILY, FAMILY_ASSETS, KNOW_STATS, KNOW_TIERS,
  KNOW_FORM_NAME, KNOW_FORM_NOTE,
  traceQuestion, TOPIC_TRACE, TRACE_SUMMARY, TOPIC_SOURCES,
  LADDERS, LADDER_QUESTIONS, FAMILY_MAP,
  FAMILY_OF_Q, Q_BY_FAMILY,
  SLOTS, SLOT_STATS, MUST100,
  SPRINT_DAYS, pickDayQuestions,
} from './src/index.js';
import { EXAM_FULL } from './src/data-exam-full.js';
import { createMathRenderer } from './tools/math-render.mjs';
import { createFigureRenderer } from './tools/fig-render.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = __dir;

/* ---------------- 品牌与口径（唯一来源） ---------------- */
const SITE = {
  name: '柚子 · 初一(上)数学期末复习',
  short: '初一(上)数学期末复习',
  full: '柚子初一(上)数学期末复习',
  exam: '初一(上)期末',
  school: '北师大实验中学',
};

const args = process.argv.slice(2);
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const want = (k) => !ONLY.length || ONLY.includes(k);

const assetHash = (rel) => createHash('sha256').update(readFileSync(join(__dir, rel))).digest('hex').slice(0, 8);
const CSS_VER = assetHash('assets/style.css');
const JS_VER = assetHash('assets/app.js');
const SE_VER = assetHash('assets/step-engine.js');

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ----------------------------------------------------------
   按章分片加载器（注入到需要题目的页面）
   分片是 classic script，file:// 下可用；ES module 会被拦。
   加载后 window.YZ.CH[id] = {questions, concepts, defs}
   ---------------------------------------------------------- */
function shardLoader(base = '') {
  return `
window.YZ = window.YZ || {};
window.YZ.loadAll = function(chapters){
  if (!chapters || !chapters.length) return Promise.resolve({});
  var CH = window.YZ.CH = window.YZ.CH || {};
  var need = chapters.filter(function(id){ return !CH[id]; });
  return Promise.all(need.map(function(id){
    return new Promise(function(res){
      var s = document.createElement('script');
      s.src = ${JSON.stringify(base)} + 'dist/data/ch/' + id + '.js?v=' + ${JSON.stringify(JS_VER)};
      s.onload = function(){ res(); };
      s.onerror = function(){ res(); };
      document.head.appendChild(s);
    });
  })).then(function(){
    /* 分片自带字形 defs：动态加载的页面本身没有字形定义，
       不注入的话公式会全部不可见。 */
    Object.keys(CH).forEach(function(id){
      var d = CH[id];
      if (!d || !d.defs) return;
      if (document.querySelector('[data-defs="' + id + '"]')) return;
      var box = document.createElement('div');
      box.setAttribute('data-defs', id);
      box.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      box.innerHTML = d.defs;
      document.body.appendChild(box);
    });
    return CH;
  });
};
window.YZ.chapterIds = function(){
  var M = window.YZ.META || {};
  return (M.chapters || []).map(function(c){ return c.id; });
};

/* ==========================================================
   三级组卷：把题按「改数字 → 改条件 → 逆向问」排成链
   这是全站练习内容的统一口径——不是随机抽题，而是按三级递进出题。
   输入：题目池；输出：按 method 分组后、每组按三级顺序排列的题
   ========================================================== */
window.YZ.buildLadders = function(pool){
  var LEVEL = { number: 0, condition: 1, reverse: 2 };
  var byMethod = {};
  (pool || []).forEach(function(q){
    var key = q.method || ('__ch_' + (q.chapter || '') );
    if (!byMethod[key]) byMethod[key] = { mothers: [], levels: {}, others: [] };
    if (q.variantOf && q.changed != null && LEVEL[q.changed] != null) {
      /* 三级变式：每级取第一道（同方法同级别通常只有一道） */
      var li = LEVEL[q.changed];
      if (!byMethod[key].levels[li]) byMethod[key].levels[li] = q;
      else byMethod[key].others.push(q);
    } else if (!q.variantOf) {
      byMethod[key].mothers.push(q);
    } else {
      byMethod[key].others.push(q);
    }
  });
  var out = [];
  Object.keys(byMethod).forEach(function(k){
    var g = byMethod[k];
    var hasAll = g.levels[0] && g.levels[1] && g.levels[2];
    /* 有完整三级：先出「三级链」（这是本组核心），再出其余母题与题 */
    if (hasAll) {
      out.push({ q: g.levels[0], group: k, role: 'L1' });
      out.push({ q: g.levels[1], group: k, role: 'L2' });
      out.push({ q: g.levels[2], group: k, role: 'L3' });
    } else {
      [0,1,2].forEach(function(i){ if (g.levels[i]) out.push({ q: g.levels[i], group: k, role: '' }); });
    }
    /* 其余题全部保留，不能丢 */
    g.mothers.forEach(function(q){ out.push({ q: q, group: k, role: 'mother' }); });
    g.others.forEach(function(q){ out.push({ q: q, group: k, role: '' }); });
  });
  return out;
};

/* 只取「有完整三级链」的组，用于达标判定 */
window.YZ.completeChains = function(pool){
  var built = window.YZ.buildLadders(pool);
  var byGroup = {};
  built.forEach(function(x){ (byGroup[x.group] = byGroup[x.group] || []).push(x); });
  var out = [];
  Object.keys(byGroup).forEach(function(k){
    var g = byGroup[k];
    var l1 = g.filter(function(x){ return x.role === 'L1'; })[0];
    var l2 = g.filter(function(x){ return x.role === 'L2'; })[0];
    var l3 = g.filter(function(x){ return x.role === 'L3'; })[0];
    var m = g.filter(function(x){ return x.role === 'mother'; })[0];
    if (l1 && l2 && l3) out.push({ group: k, mother: m ? m.q : null, qs: [l1.q, l2.q, l3.q] });
  });
  return out;
};`;
}

const report = { pages: [], mathFailures: [], figFailures: [], bytes: {} };

/* ---------------- 分层与文案（从 TIERS 派生，不写字面量） ----------------
   三层目标各有三档：base（底线）/ target（目标）/ full（满分要求）。
   显示满分口径用 full，判断达标用 target——两者混用会让诊断页
   报「已达标」而实际离满分还差一截。 */
const TIER_NAME = Object.fromEntries(Object.entries(TIERS).map(([k, v]) => [k, v.name]));
const TIER_NOTE = Object.fromEntries(Object.entries(TIERS).map(([k, v]) => [k, v.note]));
const TIER_FULL_NOTE = Object.fromEntries(Object.entries(TIERS).map(([k, v]) => [k, v.fullNote || '']));
const pctOf = (v) => Math.round(v * 100) + '%';
const TIER_TARGET = Object.fromEntries(Object.entries(TIERS).map(([k, v]) => [k, pctOf(v.target)]));
const TIER_BASE = Object.fromEntries(Object.entries(TIERS).map(([k, v]) => [k, pctOf(v.base)]));
const TIER_FULL = Object.fromEntries(Object.entries(TIERS).map(([k, v]) => [k, pctOf(v.full)]));
const TIER_SCORE = Object.fromEntries(Object.entries(TIERS).map(([k, v]) => [k, v.score]));
const TIER_ORDER = ['l1', 'l2', 'l3'];

const EXAM = EXAM_STRUCTURE;
const TOTAL_MIN = EXAM.minutes;
const TOTAL_Q = EXAM.questions;

/* ---------------- 首页卖点用的派生量（全部现算，不写字面量） ----------------
   首页最有力的论据不是「有多少题」，而是「判到多细」和「对标多硬」。
   这几项都能从数据算出，所以放常量区统一派生；
   页面里直接引用，避免出现「382 题」这种一改题库就失真的硬编码。 */
const STEP_TOTAL = QUESTIONS.reduce((a, q) => a + (q.steps || []).length, 0);
const MULTI_STEP_Q = QUESTIONS.filter((q) => (q.steps || []).length >= 2).length;
const MULTI_STEP_PCT = Math.round((MULTI_STEP_Q / QUESTIONS.length) * 100);
/* 年年考的族：这些是「押不押」都躲不开的分，用年均分合计说明分量 */
const ALWAYS_FAMILIES = FAMILY_MAP.filter((f) => f.freq === 'always');
const ALWAYS_AVG_SCORE = Math.round(ALWAYS_FAMILIES.reduce((a, f) => a + f.avgPerYear, 0));
/* 五份真题的逐题标注条数 */
const PAPER_Q_TOTAL = PAPERS.reduce((a, p) => a + (p.items || []).length, 0);

/* 三级变式齐全的族数（首页「变式三级」那张卡用）。
   判据：该族的题里同时出现 number / condition / reverse 三个层级标记，
   字段来源有两套（方法卡变式链用 changed，阶梯题用 level），所以两个都要看。 */
const ABILITY_FULL = (() => {
  const LEVELS = ['number', 'condition', 'reverse'];
  let n = 0;
  FAMILY_MAP.forEach((f) => {
    const got = new Set(
      QUESTIONS.filter((q) => q.family === f.id)
        .map((q) => q.changed || q.level)
        .filter(Boolean)
    );
    if (LEVELS.every((k) => got.has(k))) n++;
  });
  return n;
})();

/* ---------------- 渲染器 ---------------- */
function newRenderers() {
  const math = createMathRenderer();
  const fig = createFigureRenderer({ math });
  return { math, fig };
}

/* ---------------- 导航 ---------------- */
/* 导航只保留核心理念：题目 + 知识点讲解 + 诊断。
   主入口顺序有理由：
     刷题  —— 训练，唯一有题的入口。
     错题本 —— 沉淀。
     学情诊断 —— 归因 + 下一步建议。
     考情解读 —— 排序依据，学生要知道为什么先练这个。
   已移除：今日清单、计算、整卷模考、槽位专项、变式阶梯、知识图谱、内容说明。
   这些模块的生成函数与数据源仍保留，需要时把条目加回本数组即可恢复。

   注：「巩固练习」页（drill.html）已按用户要求从导航移除（2026-11-25）：
   冲刺计划已提供做题入口，两个入口并列会让「今天做什么」变模糊。
   这是「隐藏入口」不是「删除页面」——页面仍构建、仍可访问：
     · 冲刺计划的所有「开始第 N 天」都跳 drill.html?day=N
     · learn 的「练这一族」、wrong 的「重做」也依赖它
   直接删页面会同时打断这三条路径。 */
const NAV_PRIMARY = [
  ['sprint.html', '冲刺计划'],
  ['wrong.html', '错题本'],
  ['diag.html', '学情诊断'],
  ['learn.html', '知识复习'],
];

/* 次级：讲解类。它们不是入口，是「不会的时候去哪儿看」。
   必须有入口，否则「卡在第 1 步 → 回去看讲解」这一步走不通：
   学生看到诊断说「方法未掌握」，却没有任何可点的讲解页。 */
/* 「更多」下拉已按用户要求清空：概念卡/方法卡/公式法则/章节图谱不再有入口 */
const NAV_SECONDARY = [];

/* 兼容：某些地方还在用 NAV 判断总数 */
const NAV = NAV_PRIMARY.concat(NAV_SECONDARY);


/* 错因推导（2026-11-24 改）：
   单选选错 → 用该选项对应干扰项的 errTag（sign/calc/concept/method）
   计算填错 → calc
   判断答错 → concept 或 method（看题目来源）
   大题不判分 → null
   不再用「卡在第几步」倒推——那与真实错因无关。 */
function errTypeOf(q, ok, errTag){
  if (ok) return null;
  if (errTag) return errTag;
  if (q.qtype === 'single') return 'concept';
  if (q.qtype === 'calc') return 'calc';
  if (q.qtype === 'judge') return q.__conceptId ? 'concept' : 'method';
  if (q.qtype === 'big') return null;
  return 'method';
}

function header(base, active) {
  const link = ([href, label]) => {
    const on = href === active ? ' class="on"' : '';
    return `<a href="${base}${href}"${on}>${label}</a>`;
  };
  const primary = NAV_PRIMARY.map(link).join('');
  /* 次级项在「更多」下拉里；当前页若属于次级，给「更多」加高亮 */
  const secActive = NAV_SECONDARY.some(([h]) => h === active);
  const secondary = NAV_SECONDARY.map(([href, label]) => {
    const on = href === active ? ' class="on"' : '';
    return `<a href="${base}${href}"${on}>${label}</a>`;
  }).join('');

  return `<header class="hdr">
  <div class="hdr-in">
    <a class="logo" href="${base}index.html"><span class="logo-mark">柚</span><span>${esc(SITE.short)}</span></a>
    <nav class="hdr-nav" id="nav">
      ${primary}
      ${NAV_SECONDARY.length ? `<div class="nav-more" id="navMore">
        <button class="nav-more-btn${secActive ? ' on' : ''}" id="navMoreBtn" aria-haspopup="true" aria-expanded="false">
          更多 <span class="nav-caret">▾</span>
        </button>
        <div class="nav-more-menu" id="navMoreMenu">${secondary}</div>
      </div>` : ''}
    </nav>
    <div class="hdr-tools">
      <button class="theme-btn" id="themeBtn" aria-label="切换主题">◐</button>
      <button class="menu-btn" id="navToggle" aria-label="菜单">☰</button>
    </div>
  </div>
</header>`;
}

function footer(base) {
  return `<footer class="foot">
  <div class="foot-in yz-foot">
    <div>
      <div class="yz-foot-title">${esc(SITE.full)}</div>
      <div class="yz-foot-sub">面向 ${esc(SITE.school)} ${esc(SITE.exam)} · 10 天冲刺 / 真题练习 / 错题解析 / 学情诊断</div>
    </div>
    <div class="foot-links">
      <a href="${base}sprint.html">冲刺计划</a>
      <a href="${base}wrong.html">错题本</a>
      <a href="${base}diag.html">学情诊断</a>
      <a href="${base}learn.html">知识复习</a>
    </div>
  </div>
</footer>`;
}

/* ---------------- 页面骨架 ---------------- */
function page({ base = '', active = '', title, desc = '', body, script = '', data = [], useStep = false }) {
  const fullTitle = title.includes(SITE.short) ? title : `${title} · ${SITE.short}`;
  const dataTags = data.map((p) => `<script src="${base}dist/data/${p}.js?v=${JS_VER}"></script>`).join('');
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%232563eb'/%3E%3Cstop offset='1' stop-color='%237c3aed'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='9' fill='url(%23g)'/%3E%3Ctext x='16' y='22' font-family='system-ui,sans-serif' font-size='15' font-weight='800' fill='%23fff' text-anchor='middle'%3E柚%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="${base}assets/style.css?v=${CSS_VER}">
<script>try{var m=JSON.parse(localStorage.getItem('yz-theme-manual')||'null');var h=new Date().getHours();var t=(m==='light'||m==='dark')?m:((h>=19||h<6)?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){var h2=new Date().getHours();document.documentElement.setAttribute('data-theme',(h2>=19||h2<6)?'dark':'light');}</script>
</head>
<body data-base="${base}">
<div class="scroll-progress"></div>
${header(base, active)}
<main class="main">
<div class="wrap">
${body}
</div>
</main>
${footer(base)}
<script src="${base}assets/app.js?v=${JS_VER}"></script>
${useStep ? `<script src="${base}assets/step-engine.js?v=${SE_VER}"></script>` : ''}
${dataTags}
<script>${shardLoader(base)}</script>
${script ? `<script>${script}</script>` : ''}
</body>
</html>`;
}

function emit(relPath, html) {
  const full = join(OUT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html);
  const bytes = Buffer.byteLength(html, 'utf8');
  report.pages.push(relPath);
  report.bytes[relPath] = bytes;
  return bytes;
}

/* ---------------- 题目渲染（构建期） ---------------- */
function renderQuestion(q, R) {
  const C = R.math.compact;
  const o = Object.assign({}, q);
  /* 真题溯源：
     真题本身（带 examRef）直接用它自己的出处，不必再算相似题；
     原创题走 traceQuestion 找相似的真题。 */
  if (q.examRef) {
    o.trace = {
      n: 1,
      latest: q.examRef.year,
      latestNo: q.examRef.no,
      latestScore: q.examRef.score,
      srcs: [{ label: q.examRef.year.slice(0, 4) + '#' + q.examRef.no + '(' + q.examRef.score + ')',
        paperId: q.examRef.paperId, no: q.examRef.no, year: q.examRef.year, score: q.examRef.score }],
      isOrigin: true,
    };
  }
  const tr = q.examRef ? { strength: 0, topics: [], sources: [] } : traceQuestion(q);
  if (tr.strength > 0) {
    o.trace = {
      n: tr.strength,
      topics: tr.topics,
      latest: tr.latest,
      latestNo: tr.latestDetail ? tr.latestDetail.no : null,
      latestScore: tr.latestDetail ? tr.latestDetail.score : null,
      /* 精简的来源列表，避免分片膨胀。带 paperId+no 供前端链到核验页原文 */
      srcs: tr.sources.slice(0, 6).map((x) => ({
        label: x.year.slice(0, 4) + '#' + x.no + '(' + x.score + ')',
        paperId: x.paperId, no: x.no, year: x.year, score: x.score,
      })),
    };
  }
  /* 真题题干：stemParts 里文本/公式图交替，公式图是 MathType 导出的 PNG。
     不能整体走 MathJax（会吃掉 img 标签），要逐片段处理。 */
  if (q.stemParts && q.stemParts.length) {
    const base = q.__imgBase || '';
    o.stemHtml = q.stemParts.map((p) => {
      if (p.t === 'text') return C(R.math.render(p.v));
      if (p.t === 'break') return '<br>';
      if (p.t === 'img' && p.src) {
        const name = p.src.split('/').pop();
        /* p2023 的公式是 MathType WMF，浏览器不支持；字符又是字体编码，
           无法可靠转图（试过会出「336」这类错码）。降级为占位符，
           点开可看原卷该题。 */
        if (/\.wmf$/i.test(name)) {
          const ref = q.examRef || {};
          const href = ref.paperId ? ('exam-verify.html#' + ref.paperId + '-q' + ref.no) : '';
          return '<span class="q-f-miss" title="该公式为 MathType 图形，请对照原卷">' +
            (href ? '<a href="' + href + '" target="_blank" rel="noopener">⟨公式·看原卷⟩</a>' : '⟨公式⟩') +
            '</span>';
        }
        return '<img class="q-f" src="' + base + name + '" alt="公式" loading="lazy">';
      }
      return '';
    }).join('');
  } else {
    o.stemHtml = C(R.math.render(q.stem || ''));
  }
  if (q.solution) o.solutionHtml = C(R.math.render(q.solution));
  /* 「易错」一句：答错时单独一行显示，比混在解析里更容易被读到 */
  if (q.pitfall) o.pitfallHtml = C(R.math.render(q.pitfall));

  /* ---------- 四类题型：渲染层按 qtype 决定形态 ----------
     single 单选 —— 四选一，自动判分，选错能反推错因
     calc   计算 —— 填答案，自动判分
     big    大题 —— 只给题干 + 解答，不判分（真题解答题靠老师批）
     judge  判断 —— 概念/方法辨析，运行时由 pool 生成
     ---------------------------------------------------- */
  /* 默认 qtype 的判定顺序很关键：
     有 steps 且 ≥1 步 → 'steps'（逐步作答，判每一步）
     没有 steps 但题目级有 accept/answer → 'calc'（单空判分）
     否则 'big'（只展示，不判分）
     历史上这里默认成 'calc'，导致两步的阶梯题被当成单空题，
     学生填了第一步的式子却被拿最终答案判错——静默的判分错误，比报错更伤。 */
  o.qtype = q.qtype || ((q.steps && q.steps.length) ? 'steps'
    : ((q.accept || q.answer != null) ? 'calc' : 'big'));
  o.answerHtml = q.answer != null ? C(R.math.render(String(q.answer))) : '';
  /* 单选题的「正确答案」：不能只给字母，也不能给占位符。
     最有用的是「字母 + 那一项的内容」——学生要能一眼对上自己选的那项。
     选项是公式图时，把该选项的片段渲染出来。 */
  if (o.qtype === 'single' && q.key != null && q.options) {
    const letter = 'ABCD'[q.key];
    /* 字段名是 __optParts（data-exam-bank 的 optionParts 在 index.js 里
       改名带过来），写 optionParts 会静默取到 undefined 并回退成占位符。 */
    const parts = q.__optParts && q.__optParts[q.key];
    const body = (parts && parts.length)
      ? parts.map((p) => {
          if (p.t === 'text') return C(R.math.render(p.v));
          if (p.t === 'img' && p.src) {
            const name = p.src.split('/').pop();
            return '<img class="q-f" src="' + (q.__imgBase || '') + name + '" alt="公式" loading="lazy">';
          }
          return '';
        }).join('')
      : (String(q.options[q.key] || '') === '⟨公式⟩'
          /* 片段缺失且选项文本只是占位符：只给字母，不把占位符当答案。
             宁可少给，也不给出一个看起来像答案的假内容。 */
          ? ''
          : C(R.math.render(String(q.options[q.key] || ''))));
    /* 字母与公式图放在同一个行内盒里：图是 inline-block 且
       vertical-align:middle，不加盒子时字母会被挤到图片下方。 */
    o.answerHtml = '<span class="ans-inline">' + letter + '．' + body + '</span>';
  }
  if (o.qtype === 'single' && q.options) {
    /* 真题选项：options 是纯文本（含 ⟨公式⟩ 占位），真正的内容在
       q.__optParts（由 data-exam-bank 带过来）。有 parts 就逐片段渲染，
       否则走 MathJax（原创题的选项是 LaTeX）。 */
    const base = q.__imgBase || '';
    o.optionsHtml = q.options.map((opt, i) => {
      const parts = q.__optParts && q.__optParts[i];
      if (parts && parts.length) {
        return parts.map((p) => {
          if (p.t === 'text') return C(R.math.render(p.v));
          if (p.t === 'img' && p.src) {
            const nm = p.src.split('/').pop();
            if (/\.wmf$/i.test(nm)) {
              const ref = q.examRef || {};
              const href = ref.paperId ? ('exam-verify.html#' + ref.paperId + '-q' + ref.no) : '';
              return '<span class="q-f-miss">' +
                (href ? '<a href="' + href + '" target="_blank" rel="noopener">⟨公式·看原卷⟩</a>' : '⟨公式⟩') +
                '</span>';
            }
            return '<img class="q-f" src="' + base + nm + '" alt="公式" loading="lazy">';
          }
          return '';
        }).join('');
      }
      return C(R.math.render(opt));
    });
    o.key = q.key;
    o.distractors = (q.distractors || []).map((d) => ({
      v: d.v, vHtml: C(R.math.render(String(d.v))), errTag: d.errTag, why: d.why,
    }));
    /* 真题的干扰项错因按「选项下标」标注（data-solutions.js 的 optTags）。
       比按选项文本匹配可靠——选项常是公式图，文本是 ⟨公式⟩ 占位符，匹配不上。
       引擎选错时直接用下标查这张表，拿到四类错因之一。 */
    if (q.optTags && Object.keys(q.optTags).length) o.optTags = q.optTags;
  } else if (o.qtype === 'calc') {
    o.accept = q.accept || (q.answer != null ? [String(q.answer)] : []);
    o.acceptHtml = o.accept.map((a) => C(R.math.render(String(a))));
  }
  if (q.fig) {
    o.figHtml = R.fig.render(q.fig);
    if (!o.figHtml) report.figFailures.push({ id: q.id });
  }
  o.steps = (q.steps || []).map((s) => {
    const x = Object.assign({}, s);
    if (s.ask) x.askHtml = C(R.math.render(s.ask));
    if (s.label) x.labelHtml = C(R.math.render(s.label));
    if (s.hint) x.hintHtml = C(R.math.render(s.hint));
    if (s.why) x.whyHtml = C(R.math.render(s.why));
    if (s.answer) x.answerHtml = C(R.math.render(String(s.answer)));
    if (s.hints) x.hintsHtml = s.hints.map((h) => C(R.math.render(h)));
    if (s.options) x.optionsHtml = s.options.map((opt) => C(R.math.render(opt)));
    return x;
  });
  return o;
}

/* ==========================================================
   数据分片：按章分片，每片自带字形 defs
   ========================================================== */
function emitShards() {
  mkdirSync(join(OUT, 'dist/data'), { recursive: true });
  mkdirSync(join(OUT, 'dist/data/ch'), { recursive: true });

  const meta = {
    chapters: CHAPTERS.map((c) => ({
      id: c.id, no: c.no, name: c.name, block: c.block,
      prereq: c.prereq || [], tier: c.tier || [], methods: c.methods || [],
      summary: c.summary || '', weight: c.weight || 0,
      examRefs: c.examRefs || {},
      qCount: (Q_BY_CHAPTER.get(c.id) || []).length,
      cCount: (C_BY_CHAPTER.get(c.id) || []).length,
    })),
    methods: METHODS.map((m) => ({
      id: m.id, chapter: m.chapter, name: m.name, tier: m.tier,
      motherId: m.motherId || null, variantIds: m.variantIds || [],
      qCount: (Q_BY_METHOD.get(m.id) || []).length,
    })),
    tiers: TIERS,
    exam: EXAM_STRUCTURE,
    daily: DAILY,
    phases: PHASES,
    calcTypes: Object.fromEntries(Object.entries(CALC_TYPE_NAME).map(([k, v]) => [k, v])),
    calcCounts: Object.fromEntries([...CALC_BY_TYPE.entries()].map(([k, v]) => [k, v.length])),
    stats: STATS,
    /* 10 天冲刺计划。ids 在构建期按 pickDayQuestions 算好，
       运行时不用加载全库就能知道「第 N 天练哪几题」。
       这是全站的入口结构：不是按知识点组织，是按「第几天」组织。 */
    sprint: SPRINT_DAYS.map((d) => {
      const qs = pickDayQuestions(d, QUESTIONS, new Set());
      return {
        day: d.day, title: d.title, goal: d.goal, kind: d.kind,
        minutes: d.minutes, why: d.why,
        ids: qs.map((q) => q.id),
        /* 不发射「分值合计」：跨 5 套卷累加出来的是 48 分、122 分这种数，
           看着像单卷分值，实际是三套卷加起来——会误导。
           学生要判断的是「今天做几题、多久」，不是「值多少分」。 */
        paperCount: new Set(qs.map((q) => q.examRef && q.examRef.paperId).filter(Boolean)).size,
        /* 单卷时才给卷面分（第 10 天整卷），其余为 null */
        singlePaperScore: (() => {
          const ps = new Set(qs.map((q) => q.examRef && q.examRef.paperId).filter(Boolean));
          if (ps.size !== 1) return null;
          return qs.reduce((a, q) => a + (q.score || 0), 0);
        })(),
      };
    }),
    /* 考点族：排序（planToday）与回流（famRecord）共用。
       只带排序与展示需要的字段，不带 topics/slots 明细——
       后者在 papers 页用，塞进 meta 会让每个页面都多下载一份。

       tierMix 是站内题的分层分布：族的分层判据用它，不用真题难度标签。
       为什么：真题的 mid 只表示「这是解答题」，不表示认知层级——
       有理数四则混合运算是 mid，但它的认知要求是「自动化」（熟练层）。
       站点原则是「按认知要求分层，不按分值/卷面标签」，
       达标阈值必须匹配学生实际做的题，否则会用错门槛去判。 */
    families: FAMILIES_SORTED.map((f) => {
      const qs = Q_BY_FAMILY.get(f.id) || [];
      const tierMix = { l1: 0, l2: 0, l3: 0 };
      qs.forEach((q) => { if (tierMix[q.tier] != null) tierMix[q.tier]++; });
      return {
        id: f.id, name: f.name, ch: f.ch, cat: f.cat,
        freq: f.freq, hitYears: f.hitYears, avgPerYear: f.avgPerYear,
        total: f.total, maxScore: f.maxScore,
        diffScore: f.diffScore,
        qCount: qs.length,
        tierMix,
      };
    }),
  };
  writeFileSync(join(OUT, 'dist/data/meta.js'),
    'window.YZ=window.YZ||{};window.YZ.META=' + JSON.stringify(meta) + ';');

  const sizes = {};
  let totalBytes = 0;
  CHAPTERS.forEach((c) => {
    const R = newRenderers();
    const C = R.math.compact;
    const qs = (Q_BY_CHAPTER.get(c.id) || []).map((q) => renderQuestion(q, R));
    const cs = (C_BY_CHAPTER.get(c.id) || []).map((x) => ({
      id: x.id, chapter: x.chapter,
      claim: x.claim, claimHtml: C(R.math.render(x.claim || '')),
      must: x.must || [], mustHtml: (x.must || []).map((m) => C(R.math.render(m))),
      tests: (x.tests || []).map((t) => ({
        q: t.q, a: t.a, why: t.why,
        qHtml: C(R.math.render(t.q || '')), whyHtml: C(R.math.render(t.why || '')),
      })),
    }));
    /* 方法卡也进分片：刷题页要用 pitfalls 生成「方法辨析题」。
       只带刷题需要的字段（name/pitfalls），不带 steps 讲解正文，控制体积。 */
    const ms = METHODS.filter((m) => m.chapter === c.id).map((m) => ({
      id: m.id, chapter: m.chapter, name: m.name,
      nameHtml: C(R.math.render(m.name || '')),
      tier: m.tier, signal: m.signal,
      pitfalls: (m.pitfalls || []).map((p) => ({
        t: p.t, bad: p.bad, good: p.good, why: p.why,
        badHtml: C(R.math.render(p.bad || '')),
        goodHtml: C(R.math.render(p.good || '')),
        whyHtml: C(R.math.render(p.why || '')),
      })),
    }));
    /* 分片必须自带 defs：drill/calc 页动态加载分片时页面本身没有字形定义，
       公式会全部不可见。这是参考站踩过的坑。 */
    const defsHtml = R.math.defs();
    const payload = 'window.YZ=window.YZ||{};window.YZ.CH=window.YZ.CH||{};' +
      'window.YZ.CH[' + JSON.stringify(c.id) + ']={questions:' + JSON.stringify(qs) +
      ',concepts:' + JSON.stringify(cs) + ',methods:' + JSON.stringify(ms) +
      ',defs:' + JSON.stringify(defsHtml) + '};';
    writeFileSync(join(OUT, `dist/data/ch/${c.id}.js`), payload);
    const b = Buffer.byteLength(payload, 'utf8');
    sizes[c.id] = b;
    totalBytes += b;
    report.mathFailures.push(...R.math.failures());
    report.figFailures.push(...R.fig.failures());
  });

  return { renderedCount: QUESTIONS.length, conceptCount: CONCEPTS.length, sizes, shardBytes: totalBytes };
}

/* ==========================================================
   页面 1：今日任务卡（首页）
   这是与参考站最大的差异：首页不是产品介绍，是「今天做什么」
   ========================================================== */
function buildHome() {
  const R = newRenderers();

  const body = `
<section class="hero">
  <div class="hero-split">
    <div>
      <div class="hero-badge"><span class="dot-live"></span>${esc(SITE.school)} · ${esc(SITE.exam)}</div>
      <h1>期末前 10 天，<br><span class="accent-word">5 套真题练一遍</span></h1>
      <p class="lede">
        不按知识点铺开，按<b>第几天</b>排：一天一个任务，做完打勾，第 10 天整卷限时。
        练的全是真题——${PAPERS.length} 套西城卷 ${PAPER_Q_TOTAL} 道题，每道都能查到出处。
        做错的题当场给解析和「易错」，学情诊断按错因给你下一步。
      </p>
      <div class="hero-cta">
        <a class="btn primary" href="sprint.html">看 10 天计划 <span aria-hidden="true">→</span></a>
        <a class="btn" href="drill.html">直接开始做题</a>
      </div>
    </div>
    <div class="cockpit-card" id="cockpit">
      <div class="today-line" id="todayLine" style="display:none"></div>
      <div class="cockpit-top">
        <span class="kicker">冲刺进度</span>
        <span class="cockpit-sub" id="cockpitSub">还没有记录</span>
      </div>
      <div class="yz-metrics" id="cockpitMetrics"></div>
      <div class="yz-cockpit-actions">
        <a class="btn primary sm" href="sprint.html">冲刺计划</a>
        <a class="btn ghost sm" href="wrong.html">看错题</a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">10 天怎么排</span>
      <h2>先送分区，再中档区，最后压轴</h2>
      <span class="sub">顺序不是随意的——熟练层没稳住之前练压轴，等于在漏水的桶里加水</span>
    </div>
  </div>
  <div class="grid c2">
    ${[['第 1–3 天', '选择 + 填空（32 分）', '全是熟练层。冲满分的前提是这 32 分零失误——错一道 2 分，比压轴丢分更亏。'],
       ['第 4–6 天', '解答题 17–22', '第 17 题单题 17–20 分（4 小问），全卷最大单题。题型固定，练 5 套就能摸清。'],
       ['第 7–8 天', '压轴 23–26', '目标是拿到前两问，不是满分。压轴整题给分，没有「答一半给一半」。'],
       ['第 9–10 天', '错题重做 + 整卷限时', '错过的不再做对，练了也白练。最后一天限时 100 分钟，考的是时间分配。']].map(([d, t, w]) => `
    <div class="card sprint-mini">
      <div class="sm-day">${d}</div>
      <h3>${t}</h3>
      <p class="desc" style="font-size:.88rem">${w}</p>
    </div>`).join('')}
  </div>
  <div style="margin-top:16px"><a class="btn primary" href="sprint.html">进入 10 天冲刺 →</a></div>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">四个入口</span>
      <h2>冲刺计划 · 巩固练习 · 错题本 · 学情诊断</h2>
      <span class="sub">计划决定今天做什么，练习做题，错题沉淀，诊断给下一步</span>
    </div>
  </div>
  <div class="grid c2">
    <a class="card entry-card" href="sprint.html">
      <div class="entry-no">01</div>
      <h3>冲刺计划</h3>
      <p class="desc">期末前 10 天，一天一个任务。每天显示「还剩几题」和完成度，做完自动打勾。</p>
      <div class="meta">${PAPER_Q_TOTAL} 道真题切成 10 组</div>
    </a>
    <div class="card entry-card">
      <div class="entry-no">02</div>
      <h3>巩固练习</h3>
      <p class="desc">按天出题，或自选范围。选择题与填空题<b>自动判分，答错立刻展开解析</b>；解答题给完整解答，对照自评。</p>
      <div class="meta">单选 / 填空自动判 · 解答题给标准过程</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
        <a class="btn primary sm" href="drill.html?day=1&autostart=1">从第 1 天开始 →</a>
        <a class="btn ghost sm" href="drill.html?qtype=all&autostart=1">随便练一组</a>
      </div>
    </div>
    <a class="card entry-card" href="wrong.html">
      <div class="entry-no">03</div>
      <h3>错题本</h3>
      <p class="desc">答错的题自动进来，<b>每道都带解析</b>：题干 + 正确答案 + 为什么 + 这类题的坑。按错因分组，因为补救方式不同。</p>
      <div class="meta">概念 / 符号 / 计算 / 方法</div>
    </a>
    <a class="card entry-card" href="diag.html">
      <div class="entry-no">04</div>
      <h3>学情诊断</h3>
      <p class="desc">基于<b>当前还没做对的错题</b>给结论：哪类错因最多、每道错题为什么错、下一步该做什么。</p>
      <div class="meta">不是统计报告，是待办清单</div>
    </a>
  </div>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">三层</span>
      <h2>按认知要求分三层，不按分值</h2>
      <span class="sub">「送分/中档/区分」只告诉你题难不难，不告诉你该练什么</span>
    </div>
  </div>
  <div class="tier-minis">
    ${TIER_ORDER.map((t) => `<div class="tier-mini ${t}">
      <div class="tier-mini-name">${TIER_NAME[t]}</div>
      <div class="tier-mini-score">${TIER_SCORE[t]}<small>分</small></div>
      <div class="tier-mini-goal">目标 ${TIER_TARGET[t]}</div>
      <div class="tier-mini-desc">${esc(TIER_NOTE[t])}</div>
    </div>`).join('')}
  </div>
  <p class="desc" style="margin-top:14px;font-size:.9rem">
    熟练层的 ${TIER_TARGET.l1} 是硬指标：一道 5 分的解方程错个符号就是 0 分，没有部分分。
    这一层没守住之前，练压轴是浪费——那几分的补不回这里的丢分。
  </p>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">边界</span>
      <h2>做不到什么</h2>
      <span class="sub">说清楚，比夸功能有用</span>
    </div>
  </div>
  <div class="grid c2">
    <div class="trap"><div class="trap-t">不自动批改解答题</div>
      <div class="trap-why">几何证明与开放性解答无法可靠机器判分，错判比不判更伤信任。改走「采分点自评」：给步骤骨架，你勾哪一步写全了。</div></div>
    <div class="trap"><div class="trap-t">不做通用代数等价判定</div>
      <div class="trap-why">不接符号计算库（与「断网可开」冲突）。改用「分步拆解 + 等价形式选择」，宁少判不错判。</div></div>
  </div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  function paint(){
    var m = document.getElementById('cockpitMetrics');
    var sub = document.getElementById('cockpitSub');
    if (!m) return;
    var log = Z.qLog ? Z.qLog() : null;
    var st = (log && log.stats) || {};
    var byTier = st.byTier || {};
    function rate(o){ if(!o||!(o.n)) return null; return Math.round((o.ok||0)/o.n*100); }
    var nm = Z.nearMissRate ? Z.nearMissRate() : {rate:0,n:0,total:0};
    var items = [];
    ['l1','l2','l3'].forEach(function(t){
      var r = rate(byTier[t]);
      items.push('<div class="ck-item"><b>'+(r==null?'—':r+'%')+'</b><span>'+ (${JSON.stringify(TIER_NAME)})[t] +'</span></div>');
    });
    items.push('<div class="ck-item"><b>'+(nm.total?Math.round(nm.rate*100)+'%':'—')+'</b><span>会做但错</span></div>');
    items.push('<div class="ck-item"><b>'+(Z.streak?Z.streak():0)+'</b><span>连续天数</span></div>');
    m.innerHTML = items.join('');
    if (sub) {
      var n = Object.keys((log&&log.wrong)||{}).length;
      sub.textContent = nm.total ? ('已练 ' + nm.total + ' 题 · 错题 ' + n + ' 条') : '还没有记录，先做一组';
    }
  }
  /* 今日一行：P0（熟练层）还剩几族没达标。
     为什么只报 P0：卷面封顶 100，必做段丢分不可补，
     所以熟练层没清零之前，练别的族都是次优解。
     这一行是「打开就看到的第一步」，所以放在驾驶舱最上方。 */
  function paintToday(){
    var el = document.getElementById('todayLine');
    if (!el) return;
    var fams = (window.YZ.META && window.YZ.META.families) || [];
    if (!fams.length || !Z.planToday) { el.style.display = 'none'; return; }

    /* 今日一行 = 冲刺计划的「下一天」。
       不再是「最弱的族」——冲刺期学生要的是「第几天、还剩几题」，
       而不是一张需要自己翻译成行动的族清单。 */
    var DAYS = (window.YZ.META && window.YZ.META.sprint) || [];
    if (!DAYS.length) { el.style.display = 'none'; return; }
    var qlog = (Z.qLog && Z.qLog()) || {};
    var seen = {};
    (qlog.recent || []).forEach(function(r){ seen[r.id] = true; });
    var wm = (Z.wrongMap && Z.wrongMap()) || {};

    var next = null;
    for (var i = 0; i < DAYS.length; i++) {
      var d = DAYS[i];
      var ids = d.kind === 'redo' ? Object.keys(wm) : (d.ids || []);
      if (!ids.length) continue;                     /* 第 9 天没错题就跳过 */
      var left = 0;
      ids.forEach(function(id){ if (!seen[id]) left++; });
      if (left > 0) { next = { d: d, left: left, total: ids.length }; break; }
    }

    if (!next) {
      el.innerHTML = '<span class="tl-label">今日</span>' +
        '<span class="tl-text">10 天任务都做完了。接下来把错题清零。</span>' +
        '<a class="btn ghost sm" href="wrong.html">错题本</a>';
      el.style.display = '';
      return;
    }
    el.innerHTML = '<span class="tl-label">今日</span>' +
      '<span class="tl-text">第 <b>' + next.d.day + ' 天 · ' + escHtml(next.d.title) + '</b>' +
      '（剩 ' + next.left + ' / ' + next.total + ' 题）</span>' +
      '<a class="btn primary sm" href="drill.html?day=' + next.d.day + '&autostart=1">开始</a>';
    el.style.display = '';
  }
  function escHtml(x){
    return String(x == null ? '' : x).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  Z.ready(function(){
    paint();
    paintToday();
    document.addEventListener('yz:qlog', paint);
    document.addEventListener('yz:day', paint);
    document.addEventListener('yz:family', paintToday);
    Z.loadAll(Z.chapterIds()).then(function(){ paintToday(); });
  });
})();
`;

  const html = page({
    active: 'index.html',
    title: `${SITE.full} · 10 天冲刺`,
    desc: `${SITE.school} ${SITE.exam}：${PAPERS.length} 套真题切成 10 天任务，做错当场给解析，诊断按错因给下一步。`,
    body, script, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

/* ==========================================================
   页面 2：计算专项 calc.html
   ========================================================== */
function buildCalc() {
  const R = newRenderers();
  const C = R.math.compact;
  const types = [...CALC_BY_TYPE.keys()];

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 计算专项</div>
  <h1>计算专项</h1>
  <p class="lede">判定的单位是<b>步骤</b>。每一步只判一个中间结果，所以能精确定位你错在「去分母」「去括号」还是「移项」。<b>除最后一步外全对、最后一步错</b>会被记为「会做但错」——这是初一最值钱的信号。</p>
</div>

<section class="section" style="margin-top:20px">
  <div class="card setup-card">
    <div class="setup-head">
      <h3>配置本组练习</h3>
      <div class="setup-actions"><button class="btn primary" id="startBtn">开始 →</button></div>
    </div>
    <div class="setup-grid">
      <div class="setup-group">
        <div class="kicker">运算类型</div>
        <div class="chips" id="typeChips">
          <button class="chip on" data-t="all">全部</button>
          ${types.map((t) => `<button class="chip" data-t="${t}">${esc(CALC_TYPE_NAME[t])}</button>`).join('')}
        </div>
        <p class="setup-hint" id="typeHint">共 ${STATS.calcQuestions} 题</p>
      </div>
      <div class="setup-group">
        <div class="kicker">作答模式</div>
        <div class="chips" id="modeChips">
          <button class="chip on" data-m="guided">引导 · 逐步作答</button>
          <button class="chip" data-m="selfcheck">自查 · 先做后对</button>
        </div>
        <p class="setup-hint"><b>引导</b>每步一问，答错立刻给提示；<b>自查</b>只给步骤骨架</p>
      </div>
      <div class="setup-group">
        <div class="kicker">题量</div>
        <div class="chips" id="lenChips">
          <button class="chip" data-n="6">6 题</button>
          <button class="chip on" data-n="10">10 题</button>
          <button class="chip" data-n="16">16 题</button>
        </div>
        <p class="setup-hint">建议 10 题一组，控制在 ${DAILY.blocks[1].minutes} 分钟内</p>
      </div>
      <div class="setup-group">
        <div class="kicker">范围</div>
        <div class="chips" id="scopeChips">
          <button class="chip on" data-s="all">全部</button>
          <button class="chip" data-s="wrong">只练错题</button>
        </div>
        <p class="setup-hint">「只练错题」会抽取你错过的计算题</p>
      </div>
    </div>
  </div>
</section>

<section class="section" id="stageWrap" style="display:none">
  <div class="card"><div id="stage"></div></div>
</section>

<section class="section" id="zone">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">按类型</span>
      <h2>五类运算，各自的目标</h2>
    </div>
  </div>
  <div class="grid c2">
    ${types.map((t) => `<a class="card calc-type-card" href="calc.html?type=${t}">
      <h3>${esc(CALC_TYPE_NAME[t])}</h3>
      <p class="desc">${CALC_BY_TYPE.get(t).length} 题</p>
    </a>`).join('')}
  </div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  var CH = {};
  var defsSeen = {};
  var sel = { type: 'all', mode: 'guided', len: 10, scope: 'all' };
  var params = new URLSearchParams(location.search);
  if (params.get('type')) sel.type = params.get('type');
  if (params.get('mode') === 'selfcheck') sel.mode = 'selfcheck';

  function chipGroup(id, key, cast){
    var wrap = document.getElementById(id);
    if (!wrap) return;
    [].forEach.call(wrap.querySelectorAll('.chip'), function(b){
      var v = b.getAttribute('data-' + ({typeChips:'t',modeChips:'m',lenChips:'n',scopeChips:'s'})[id]);
      if (cast) v = cast(v);
      if (v === sel[key]) b.classList.add('on'); else b.classList.remove('on');
      b.addEventListener('click', function(){
        [].forEach.call(wrap.querySelectorAll('.chip'), function(x){ x.classList.remove('on'); });
        b.classList.add('on');
        sel[key] = cast ? cast(b.getAttribute('data-' + ({typeChips:'t',modeChips:'m',lenChips:'n',scopeChips:'s'})[id])) : b.getAttribute('data-' + ({typeChips:'t',modeChips:'m',lenChips:'n',scopeChips:'s'})[id]);
        updateHint();
      });
    });
  }
  chipGroup('typeChips','type');
  chipGroup('modeChips','mode');
  chipGroup('lenChips','len', function(v){ return parseInt(v,10); });
  chipGroup('scopeChips','scope');

  function updateHint(){
    var el = document.getElementById('typeHint');
    if (!el) return;
    var n = 0;
    Object.keys(CH).forEach(function(cid){
      (CH[cid].questions||[]).forEach(function(q){
        if (q.calcType && (sel.type==='all' || q.calcType===sel.type)) n++;
      });
    });
    el.textContent = '共 ' + n + ' 题' + (sel.type==='all' ? '' : '（' + ${JSON.stringify(CALC_TYPE_NAME)}[sel.type] + '）');
  }

  function collect(){
    var pool = [];
    Object.keys(CH).forEach(function(cid){
      var d = CH[cid];
      if (d.defs && !defsSeen[cid]) {
        defsSeen[cid] = true;
        var box = document.createElement('div');
        box.innerHTML = d.defs;
        document.body.appendChild(box.firstChild);
      }
      (d.questions||[]).forEach(function(q){
        if (!q.calcType) return;
        if (sel.type !== 'all' && q.calcType !== sel.type) return;
        if (sel.scope === 'wrong' && !(Z.wrongMap && Z.wrongMap()[q.id])) return;
        pool.push(q);
      });
    });
    return pool;
  }

  document.getElementById('startBtn').addEventListener('click', function(){
    var pool = collect();
    if (!pool.length) { Z.toast('这个范围暂时没有题目'); return; }
    var n = Math.min(sel.len, pool.length);
    if (n < sel.len) Z.toast('这个范围只有 ' + pool.length + ' 题，本组按 ' + n + ' 题出');
    sel.len = n;
    document.getElementById('stageWrap').style.display = '';
    Z.step({
      mount: '#stage',
      questions: pool,
      mode: sel.mode,
      limit: sel.len,
      shuffle: true,
      wrongHref: 'wrong.html',
      backHref: 'calc.html',
      backLabel: '重新配置',
      onAnswer: function(q, ok, rec, errTag){
        Z.qRecord({
          id: q.id, chapter: q.chapter, method: q.method, family: q.family, tier: q.tier, qtype: q.qtype,
          result: rec.result, stuckStep: -1, errTag: errTag || null,
          errorType: (function(q,ok,tag){ if(ok)return null; if(tag)return tag; if(q.qtype==='single')return 'concept'; if(q.qtype==='calc')return 'calc'; if(q.qtype==='judge')return q.__conceptId?'concept':'method'; if(q.qtype==='big')return null; return 'method'; })(q, ok, errTag), timeMs: rec.timeMs, nearMiss: rec.nearMiss, src: sel.mode
        });
        Z.bumpDay('questions', 1);
      },
      onFinish: function(res){
        if (res.rate >= 90) Z.sfx('win');
        Z.toast('本组完成：' + res.correct + ' / ' + res.answered);
      }
    });
    document.getElementById('stageWrap').scrollIntoView({ behavior:'smooth', block:'start' });
  });

  Z.ready(function(){
    Z.loadAll(Z.chapterIds()).then(function(all){
      CH = all || {};
      updateHint();
      if (params.get('autostart') === '1') document.getElementById('startBtn').click();
    });
  });
})();
`;

  const html = page({
    active: 'calc.html',
    title: '计算专项',
    desc: `${SITE.exam}计算专项：${STATS.calcQuestions} 题，按四则混合、乘方、去括号、解方程、化简求值分组，分步判定 + 连对计数。`,
    body, script, useStep: true, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

/* ==========================================================
   页面 3：今日清单 today.html
   ----------------------------------------------------------
   这一页回答一个问题：「今天该练什么」。
   它不是「随机抽 10 题」，而是读 planToday() 的排序结果：
     档位（P0 熟练层 → P3 压轴）由封顶规则决定，
     档内按可回收分（年均分 × 失分率）排，
     已达标且未到复习期的族不进清单。
   四段闭环结构保留，但选题从「随机」改为「按族」。
   ========================================================== */
function buildToday() {
  const R = newRenderers();
  const blocks = DAILY.blocks;

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 今日清单</div>
  <h1>今天练什么</h1>
  <p class="lede">
    这份清单不是随机抽的。顺序由<b>真题权重</b>和<b>你的失分率</b>共同决定：
    必做段丢分不可补（卷面封顶 ${EXAM_STRUCTURE.total}），所以熟练层没达标之前，压轴一律排在最后。
    清单<b>一天只算一次</b>——每题之后重算会让它一直跳，反而不知道该做什么。
  </p>
</div>

<section class="section" style="margin-top:18px">
  <div class="card plan-summary" id="planSummary"></div>
</section>

<section class="section" id="planWrap">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">按优先级排序</span>
    <h2>今天这几件事，从上往下做</h2>
    <span class="sub">P0 熟练层零失误 → P1 年年考中档 → P2 其余中档 → P3 压轴入场分 → P4 少见族</span>
  </div></div>
  <div id="planList"></div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">时间怎么切</span>
    <h2>四段闭环（${DAILY.total} 分钟）</h2>
    <span class="sub">顺序不可调。每段有明确完成判据，完成即结束——不鼓励无限刷</span>
  </div></div>
  <div class="card today-track" id="todayTrack"></div>
  <div class="grid c2" style="margin-top:14px">
    ${blocks.map((b, i) => `<div class="card">
      <div class="kicker">第 ${i + 1} 段 · ${b.minutes} 分钟</div>
      <h3 style="margin:6px 0 4px">${esc(b.name)}</h3>
      <p class="desc" style="font-size:.88rem">${esc(b.desc)} · 约 ${b.count} 题</p>
      <button class="btn ghost sm" data-start="${b.key}" style="margin-top:10px">开始这一段</button>
      <div id="stage-${b.key}" style="margin-top:12px"></div>
    </div>`).join('')}
  </div>
</section>

<section class="section">
  <div class="card" style="padding:20px 24px">
    <h3>时间不够怎么办</h3>
    <div class="grid c3" style="margin-top:12px">
      ${Object.entries(DAILY.variants).map(([k, v]) => `<div>
        <b>${esc(v.name)}</b>
        <p class="desc" style="font-size:.86rem">${esc(v.note)}</p>
      </div>`).join('')}
    </div>
    <p class="desc" style="margin-top:14px;font-size:.88rem">
      优先砍掉「主题」段，<b>不要砍计算和错题</b>——计算是提分主战场，错题是闭环。
    </p>
  </div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  var CH = {};
  var META = window.YZ && window.YZ.META ? window.YZ.META : {};
  var defsSeen = {};
  var done = {};
  var plan = null;

  var BAND_NAME = { P0:'熟练层零失误', P1:'年年考中档', P2:'其余中档', P3:'压轴入场分', P4:'少见族' };
  var BAND_NOTE = {
    P0: '必做段丢分补不回来，这一档先做到不错',
    P1: '年年考、年均 ≥5 分，路径确定',
    P2: '值得练，但不构成满分瓶颈',
    P3: '只求入场分——压轴是整题给分，没有「答一半」',
    P4: '时间充裕才碰',
  };
  var STATE_NAME = { untested:'未测', training:'训练中', passed:'已达标' };
  var ACTION_NAME = { drill:'练', finish:'限时收尾', learn:'先看讲解' };

  function ensureDefs(){
    Object.keys(CH).forEach(function(cid){
      var d = CH[cid];
      if (d.defs && !defsSeen[cid]) {
        defsSeen[cid] = true;
        var box = document.createElement('div');
        box.innerHTML = d.defs;
        document.body.appendChild(box.firstChild);
      }
    });
  }

  /* ---------- 清单渲染 ---------- */
  function paintPlan(){
    var fams = META.families || [];
    if (!fams.length) {
      document.getElementById('planSummary').innerHTML =
        '<p style="margin:0;color:var(--text-2)">族数据未加载，请重新构建站点。</p>';
      return;
    }
    plan = Z.planTodayCached(fams, false);
    var s = plan.summary;

    /* 顶部摘要：一句话说清现在的处境 */
    var head = '';
    if (!s.total) {
      head = '所有族都已达标，且没有到期的复习。今天可以休息，或做一次整卷模考保持手感。';
    } else if (s.first) {
      var f0 = s.first;
      head = '先从 <b>' + f0.name + '</b> 开始（' + BAND_NAME[f0.band] + '）。' +
        (f0.state === 'untested'
          ? '还没测过——先做一组看正确率，这本身就是诊断。'
          : '当前正确率 ' + Math.round(f0.rate*100) + '%，' +
            (f0.band === 'P0' ? '这一档的目标是零失误。' : '可回收约 ' + f0.recover + ' 分/年。'));
    }
    var bits = [];
    bits.push('清单 ' + s.total + ' 项');
    if (s.due) bits.push(s.due + ' 项到期复习');
    if (s.untested) bits.push(s.untested + ' 项未测');
    if (s.passedOut) bits.push(s.passedOut + ' 项已达标（移出）');
    document.getElementById('planSummary').innerHTML =
      '<div class="plan-head"><div><h2 style="margin:0 0 6px">' + head + '</h2>' +
      '<div class="meta">' + bits.join(' · ') + ' · 快照日期 ' + (Z.planSnapshotDay()||'—') + '</div></div></div>';

    /* 分组渲染 */
    var order = ['P0','P1','P2','P3','P4'];
    var html = order.filter(function(b){ return plan.byBand[b]; }).map(function(b){
      var items = plan.byBand[b];
      return '<div class="plan-band"><div class="plan-band-head">' +
        '<span class="plan-band-tag ' + b + '">' + b + '</span>' +
        '<b>' + BAND_NAME[b] + '</b>' +
        '<span class="plan-band-note">' + BAND_NOTE[b] + '</span></div>' +
        '<div class="grid c2">' + items.map(function(it){
          var rateTxt = it.tested ? Math.round(it.rate*100) + '%' : '—';
          var meta = [
            it.avgPerYear + ' 分/年',
            it.hitYears + '/' + PAPERS.length + ' 年',
            it.qCount + ' 题',
            STATE_NAME[it.state] || it.state
          ].join(' · ');
          /* 族级入口：带 family 参数，drill 页按族筛题。
             n=10 与熟练层达标最小样本量对齐，否则点进来也判不出结果。 */
          var href = 'drill.html?family=' + it.id + '&n=10&autostart=1';
          return '<div class="card plan-item' + (it.due ? ' due' : '') + '">' +
            '<div class="plan-item-head"><b>' + it.name + '</b>' +
            (it.due ? '<span class="plan-badge">到期复习</span>' : '') + '</div>' +
            '<div class="meta">' + meta + '</div>' +
            '<div class="plan-item-stats">' +
              '<span>正确率 <b>' + rateTxt + '</b></span>' +
              (it.tested ? '<span>会做但错 <b>' + Math.round(it.nearRate*100) + '%</b></span>' : '') +
              (it.tested ? '<span>可回收 <b>' + it.recover + '</b> 分/年</span>' : '') +
            '</div>' +
            '<a class="btn primary sm" href="' + href + '">' + (ACTION_NAME[it.action]||'练') + ' →</a>' +
          '</div>';
        }).join('') + '</div></div>';
    }).join('');
    document.getElementById('planList').innerHTML = html || '<div class="card"><p style="margin:0">清单为空。</p></div>';
  }

  function paintTrack(){
    var el = document.getElementById('todayTrack');
    if (!el) return;
    el.innerHTML = (META.daily ? META.daily.blocks : []).map(function(b){
      var ok = done[b.key];
      return '<div class="today-step ' + (ok ? 'done' : '') + '">' +
        '<span class="today-dot">' + (ok ? '✓' : '') + '</span>' +
        '<b>' + b.name + '</b><span class="today-min">' + b.minutes + '′</span></div>';
    }).join('<span class="today-arrow">→</span>');
  }

  /* ---------- 四段：选题按族优先级 ---------- */
  function pools(){
    var calc = [], topic = [], wrong = [];
    var wm = (Z.wrongMap && Z.wrongMap()) || {};
    /* 清单里排在前面的族，其题目在池中优先出现 */
    var pri = {};
    if (plan && plan.items) plan.items.forEach(function(it, i){ pri[it.id] = i; });
    function rank(q){
      var f = q.family;
      return f != null && pri[f] != null ? pri[f] : 999;
    }
    Object.keys(CH).forEach(function(cid){
      (CH[cid].questions||[]).forEach(function(q){
        if (q.calcType) calc.push(q); else topic.push(q);
        if (wm[q.id]) wrong.push(q);
      });
    });
    /* 按族优先级排序（稳定：同族内保持原序），再交给 step 引擎 */
    calc.sort(function(a,b){ return rank(a) - rank(b); });
    topic.sort(function(a,b){ return rank(a) - rank(b); });
    return { calc: calc, concept: Z.buildConceptPool(CH, null), topic: topic, wrong: wrong };
  }

  function start(key){
    var p = pools();
    var map = {
      flash: { pool: p.concept, mode: 'guided', limit: 8 },
      calc: { pool: p.calc, mode: 'guided', limit: 10 },
      topic: { pool: p.topic, mode: 'guided', limit: 6 },
      wrong: { pool: p.wrong, mode: 'selfcheck', limit: 8 }
    };
    var cfg = map[key];
    if (!cfg) return;
    if (!cfg.pool.length) {
      Z.toast(key === 'wrong' ? '还没有错题，先做前面的段落' : '这个范围暂时没有题目');
      return;
    }
    ensureDefs();
    Z.step({
      mount: '#stage-' + key,
      questions: cfg.pool,
      mode: cfg.mode,
      limit: cfg.limit,
      /* 前两段保持清单顺序（不打乱），否则「按优先级练」失效；
         错题段打乱，避免按错题本顺序背下来 */
      shuffle: key === 'wrong',
      wrongHref: 'wrong.html',
      backHref: 'today.html',
      backLabel: '回到今日',
      onAnswer: function(q, ok, rec, errTag){
        Z.qRecord({
          id: q.id, chapter: q.chapter, method: q.method, family: q.family, tier: q.tier, qtype: q.qtype,
          result: rec.result, stuckStep: -1, errTag: errTag || null,
          errorType: (function(q,ok,tag){ if(ok)return null; if(tag)return tag; if(q.qtype==='single')return 'concept'; if(q.qtype==='calc')return 'calc'; if(q.qtype==='judge')return q.__conceptId?'concept':'method'; if(q.qtype==='big')return null; return 'method'; })(q, ok, errTag), timeMs: rec.timeMs, nearMiss: rec.nearMiss, src: 'today-' + key
        });
        Z.bumpDay('questions', 1);
      },
      onFinish: function(res){
        done[key] = true;
        paintTrack();
        if (res.rate >= 90) Z.sfx('win');
        Z.toast('这一段完成：' + res.correct + ' / ' + res.answered);
      }
    });
  }

  Z.ready(function(){
    paintPlan();
    paintTrack();
    [].forEach.call(document.querySelectorAll('[data-start]'), function(b){
      b.addEventListener('click', function(){ start(b.getAttribute('data-start')); });
    });
    Z.loadAll(Z.chapterIds()).then(function(all){ CH = all || {}; });
  });
})();
`;

  const html = page({
    active: 'today.html',
    title: '今日清单',
    desc: `按真题权重与失分率排序的今日清单，加 ${DAILY.total} 分钟四段闭环。`,
    body, script, useStep: true, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

/* ==========================================================
   页面 4：概念自测 concept.html
   ========================================================== */
function buildConcept() {
  const R = newRenderers();
  const blocks = [...new Set(CHAPTERS.map((c) => c.block))];

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 概念自测</div>
  <h1>概念自测</h1>
  <p class="lede">只考<b>条件</b>，不考背诵。每个判断都是「这个说法成立吗」，答错会告诉你<b>差在哪个条件</b>。初一的失分大量来自概念边界——单项式次数、绝对值分类、等式性质适用条件。</p>
</div>

<section class="section" style="margin-top:18px">
  <div class="card setup-card">
    <div class="setup-head">
      <h3>开始自测</h3>
      <div class="setup-actions"><button class="btn primary" id="startAll">全部章节 · 20 题</button></div>
    </div>
    <p class="setup-hint">或选一个章节：</p>
    <div class="chips" id="chChips">
      ${CHAPTERS.map((c) => `<button class="chip" data-ch="${c.id}">${c.no}. ${esc(c.name)}</button>`).join('')}
    </div>
  </div>
</section>

<section class="section" id="stageWrap" style="display:none">
  <div class="card"><div id="stage"></div></div>
</section>

<section class="section" id="zone">
  ${blocks.map((bl) => `<div class="section-head">
    <div class="section-head-left"><span class="kicker">${esc(bl)}</span>
    <h2>${CHAPTERS.filter((c) => c.block === bl).length} 章</h2></div>
  </div>
  <div class="grid c2">
    ${CHAPTERS.filter((c) => c.block === bl).map((c) => `<a class="card concept-ch-card" href="concept.html?ch=${c.id}">
      <h3>${c.no}. ${esc(c.name)}</h3>
      <p class="desc">${esc(c.summary)}</p>
      <div class="meta">${(C_BY_CHAPTER.get(c.id) || []).length} 张概念卡 · ${(C_BY_CHAPTER.get(c.id) || []).reduce((a, x) => a + (x.tests || []).length, 0)} 个判断</div>
    </a>`).join('')}
  </div>`).join('')}
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  var CH = {}; /* 分片异步加载后填充，不能快照 window.YZ.CH */
  var defsSeen = {};
  var params = new URLSearchParams(location.search);

  function ensureDefs(){
    Object.keys(CH).forEach(function(cid){
      var d = CH[cid];
      if (d.defs && !defsSeen[cid]) {
        defsSeen[cid] = true;
        var box = document.createElement('div');
        box.innerHTML = d.defs;
        document.body.appendChild(box.firstChild);
      }
    });
  }

  /* 概念卡 → 可判定题目的转换在 app.js 的 buildConceptPool()，
     concept 与 today 共用一份，避免结构改动时两处不同步。 */
  function build(chFilter){
    return Z.buildConceptPool(CH, chFilter);
  }

  function run(chFilter){
    var pool = build(chFilter);
    if (!pool.length) { Z.toast('这个章节还没有概念卡'); return; }
    ensureDefs();
    document.getElementById('stageWrap').style.display = '';
    Z.step({
      mount: '#stage', questions: pool, mode: 'guided', limit: 20, shuffle: true,
      wrongHref: 'wrong.html', backHref: 'concept.html', backLabel: '重新选择',
      onAnswer: function(q, ok, rec){
        Z.qRecord({ id: q.id, chapter: q.chapter, family: q.family, tier: q.tier, result: rec.result,
          stuckStep: rec.stuckStep, errorType: ok ? null : 'concept',
          timeMs: rec.timeMs, src: 'concept' });
        if (Z.csrsRate) Z.csrsRate(q.id, ok ? 2 : 0);
        Z.bumpDay('questions', 1);
      },
      onFinish: function(res){
        if (res.rate >= 90) Z.sfx('win');
        paintAfterDiag(res);
        paintWhy();
      }
    });
    document.getElementById('stageWrap').scrollIntoView({ behavior:'smooth', block:'start' });
  }

  Z.ready(function(){
    document.getElementById('startAll').addEventListener('click', function(){ run(null); });
    [].forEach.call(document.querySelectorAll('[data-ch]'), function(b){
      b.addEventListener('click', function(){ run(b.getAttribute('data-ch')); });
    });
    Z.loadAll(Z.chapterIds()).then(function(all){
      CH = all || {};
      var ch = params.get('ch');
      if (ch) run(ch);
    });
  });
})();
`;

  const html = page({
    active: 'concept.html',
    title: '概念自测',
    desc: `${SITE.exam}概念条件判断：${STATS.concepts} 张概念卡、${STATS.conceptTests} 个判断，只考条件不考背诵。`,
    body, script, useStep: true, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

/* ==========================================================
   页面 5：分步刷题 drill.html
   ========================================================== */
function buildDrill() {
  const R = newRenderers();
  const methodOpts = METHODS.map((m) => `<option value="${m.id}">${esc(m.name)}（${TIER_NAME[m.tier]}）</option>`).join('');
  const chapterOpts = CHAPTERS.map((c) => `<option value="${c.id}">${c.no}. ${esc(c.name)}</option>`).join('');

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 巩固练习</div>
  <h1>巩固练习</h1>
</div>

<!-- 三行：练哪个族 · 为什么是它 · 现在什么状态 -->
<section class="section" id="whyBox">
  <div class="card why-card" id="whyCard">
    <div class="why-row why-what"><span class="why-k">练什么</span><span id="whyWhat">正在选…</span></div>
    <div class="why-row why-why"><span class="why-k">为什么</span><span id="whyWhy">—</span></div>
    <div class="why-row why-state"><span class="why-k">状态</span><span id="whyState">—</span></div>
    <div class="why-actions">
      <button class="btn primary" id="startBtn">开始本组 →</button>
      <button class="btn ghost sm" id="toggleSetup">换个范围</button>
    </div>
  </div>
</section>

<section class="section" id="setupWrap" style="display:none">
  <div class="card setup-card">
    <div class="setup-head">
      <h3>换个范围</h3>
      <div class="setup-actions"><button class="btn ghost sm" id="closeSetup">收起</button></div>
    </div>
    <div class="setup-grid">
      <div class="setup-group">
        <div class="kicker">题目类型</div>
        <div class="chips" id="qtypeChips">
          <button class="chip on" data-qt="all">三类混出</button>
          <button class="chip" data-qt="question">只刷题</button>
          <button class="chip" data-qt="concept">只刷概念</button>
          <button class="chip" data-qt="method">只刷方法</button>
        </div>
        <p class="setup-hint">概念题判「说法对不对」，方法题判「算法对不对」</p>
      </div>
      <div class="setup-group">
        <div class="kicker">作答模式</div>
        <div class="chips" id="modeChips">
          <button class="chip on" data-m="guided">引导 · 逐步作答</button>
          <button class="chip" data-m="selfcheck">自查 · 先做后对</button>
        </div>
      </div>
      <div class="setup-group">
        <div class="kicker">范围</div>
        <div class="chips" id="scopeChips">
          <button class="chip on" data-s="all">全部</button>
          <button class="chip" data-s="wrong">只练错题</button>
          <button class="chip" data-s="weak">专攻最弱</button>
        </div>
        <p class="setup-hint" id="scopeHint">共 ${STATS.allQuestions} 题可练</p>
      </div>
      <div class="setup-group">
        <div class="kicker">方法卡</div>
        <select id="methodSel"><option value="">不限方法</option>${methodOpts}</select>
      </div>
      <div class="setup-group">
        <div class="kicker">章节</div>
        <select id="chapterSel"><option value="">不限章节</option>${chapterOpts}</select>
      </div>
      <div class="setup-group">
        <div class="kicker">分层</div>
        <div class="chips" id="tierChips">
          <button class="chip on" data-t="all">不限</button>
          ${TIER_ORDER.map((t) => `<button class="chip" data-t="${t}">${TIER_NAME[t]}</button>`).join('')}
        </div>
      </div>
      <div class="setup-group">
        <div class="kicker">题量</div>
        <div class="chips" id="lenChips">
          <button class="chip on" data-n="10">10</button>
          <button class="chip" data-n="16">16</button>
          <button class="chip" data-n="24">24</button>
        </div>
        <p class="setup-hint">默认 10 题：熟练层族达标判据需要 ≥10 题，少于这个数判不出结果</p>
      </div>
    </div>
  </div>
</section>

<section class="section" id="stageWrap" style="display:none">
  <div class="card"><div id="stage"></div></div>
</section>

<!-- 一组做完后的诊断：错在第几步 → 哪类错因 → 再练几题 -->
<section class="section" id="diagAfter" style="display:none">
  <div class="card diag-after" id="diagAfterCard"></div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  var CH = {}; /* 分片异步加载后填充，不能快照 window.YZ.CH */
  var defsSeen = {};
  var params = new URLSearchParams(location.search);
  var sel = {
    mode: params.get('mode') === 'selfcheck' ? 'selfcheck' : 'guided',
    scope: ['weak','wrong'].indexOf(params.get('scope')) >= 0 ? params.get('scope') : 'all',
    method: params.get('method') || '',
    chapter: params.get('chapter') || '',
    /* 族筛选：今日清单的「练」按钮落到这里。
       族是真题权重与站内题共享的唯一粒度，所以它是清单到练习的正式通道。 */
    family: params.get('family') || '',
    tier: params.get('tier') || 'all',
    /* 默认 10 题，与熟练层族达标判据（FAM_TARGET.l1.minN = 10）对齐。
       曾默认 8 题：做一组永远凑不够 10 题，族状态永远停在「训练中」，
       学生以为自己在练，系统其实判不出结果——默认值必须能一次判出结论。 */
    len: parseInt(params.get('n'),10) || 10,
    /* 题目类型：all = 三类混出；question = 普通题；concept = 概念判断；
       method = 方法辨析。默认 all，这样「刷题」一个入口就覆盖三类。 */
    qtype: ['question','concept','method'].indexOf(params.get('qtype')) >= 0 ? params.get('qtype') : 'all',
    /* 指定题号白名单：槽位专项页跳转用。
       逗号分隔的 id 列表，命中即入池，优先于章节/方法/分层筛选。 */
    ids: (params.get('ids') || '').split(',').map(function(s){ return s.trim(); }).filter(Boolean),
    /* 冲刺计划的天数。带 day 参数时，题池完全由当天计划决定，
       不再走章节/方法/分层筛选——那样会漏题也会串题。 */
    day: parseInt(params.get('day'), 10) || 0
  };

  function bindChips(id, key, cast){
    var wrap = document.getElementById(id);
    [].forEach.call(wrap.querySelectorAll('.chip'), function(b){
      var attr = b.getAttribute('data-m') || b.getAttribute('data-s') || b.getAttribute('data-t') || b.getAttribute('data-n');
      var v = cast ? cast(attr) : attr;
      if (v === sel[key]) b.classList.add('on'); else b.classList.remove('on');
      b.addEventListener('click', function(){
        [].forEach.call(wrap.querySelectorAll('.chip'), function(x){ x.classList.remove('on'); });
        b.classList.add('on');
        sel[key] = cast ? cast(b.getAttribute('data-m') || b.getAttribute('data-s') || b.getAttribute('data-t') || b.getAttribute('data-n')) : (b.getAttribute('data-m') || b.getAttribute('data-s') || b.getAttribute('data-t') || b.getAttribute('data-n'));
      });
    });
  }
  /* 题目类型筛选：切换后重算可练题数提示 */
  [].forEach.call(document.querySelectorAll('#qtypeChips .chip'), function(b){
    b.addEventListener('click', function(){
      [].forEach.call(document.querySelectorAll('#qtypeChips .chip'), function(x){ x.classList.remove('on'); });
      b.classList.add('on');
      sel.qtype = b.getAttribute('data-qt');
      var hint = document.getElementById('scopeHint');
      if (hint) hint.textContent = '当前类型：' + b.textContent.trim() + ' · 共 ' + collect().length + ' 题可练';
    });
  });
  bindChips('modeChips','mode');
  bindChips('scopeChips','scope');
  bindChips('tierChips','tier');
  bindChips('lenChips','len', function(v){ return parseInt(v,10); });

  var ms = document.getElementById('methodSel'), cs = document.getElementById('chapterSel');
  if (sel.method) ms.value = sel.method;
  if (sel.chapter) cs.value = sel.chapter;
  ms.addEventListener('change', function(){ sel.method = ms.value; });
  cs.addEventListener('change', function(){ sel.chapter = cs.value; });

  /* ---------- 三行说明：练什么 · 为什么 · 现在什么状态 ----------
     这三行替代了原来的配置页。学生点「巩固练习」就该开始做题，
     不该先做「选章节/选方法/选分层/选题量」四个判断——
     那是把诊断的责任推回给她，与诊断的目的相反。 */
  var FAM_TARGET_LABEL = { l1: '熟练层', l2: '理解层', l3: '攻坚层' };
  var BAND_LABEL = { P0: '熟练层优先', P1: '年年考且分值高', P2: '中档', P3: '压轴', P4: '少见' };

  function famById(id){
    var fams = (window.YZ.META && window.YZ.META.families) || [];
    var hit = null;
    fams.forEach(function(f){ if (f.id === id) hit = f; });
    return hit;
  }

  /* 选一个族：URL 指定优先；否则读 planToday 的第一条 */
  function pickFamily(){
    if (sel.family) return famById(sel.family);
    var fams = (window.YZ.META && window.YZ.META.families) || [];
    if (!fams.length || !Z.planToday) return null;
    var plan = Z.planToday(fams);
    if (!plan.items.length) return null;
    return famById(plan.items[0].id) || null;
  }

  function paintWhy(){
    var what = document.getElementById('whyWhat');
    var why = document.getElementById('whyWhy');
    var stEl = document.getElementById('whyState');
    if (!what) return;

    /* 冲刺计划的一天：三行说明换成当天任务，而不是「最弱的族」。
       这两套逻辑不能混——按族选题和按天选题是不同的题池。 */
    if (sel.day) {
      var sp = ((window.YZ.META && window.YZ.META.sprint) || [])[sel.day - 1];
      if (!sp) { what.textContent = '第 ' + sel.day + ' 天不存在'; return; }
      var cnt = (sp.kind === 'redo') ? Object.keys((Z.wrongMap && Z.wrongMap()) || {}).length
                                     : (sp.ids || []).length;
      what.innerHTML = '<b>第 ' + sp.day + ' 天 · ' + escH(sp.title) + '</b>' +
        '<span class="why-tag">' + cnt + ' 题</span>' +
        '<span class="why-tag ghost">' + sp.minutes + ' 分钟</span>';
      why.textContent = sp.why;
      stEl.textContent = sp.kind === 'redo'
        ? (cnt ? '当前有 ' + cnt + ' 道错题待重做' : '现在没有错题，这一天可以跳过')
        : (sp.paperCount > 1 ? '跨 ' + sp.paperCount + ' 套卷同题位对比' : '整卷限时');
      document.getElementById('startBtn').textContent = '开始第 ' + sp.day + ' 天 →';
      return;
    }

    var f = pickFamily();

    if (!f) {
      what.textContent = '全部达标';
      why.textContent = '没有待练的族，可以做一次整卷模考';
      stEl.textContent = '—';
      var btn0 = document.getElementById('startBtn');
      if (btn0) { btn0.textContent = '去做模考'; btn0.onclick = function(){ location.href = 'exam.html'; }; }
      return;
    }

    sel.family = f.id;
    var st = Z.famStats ? Z.famStats(f.id) : { n:0, rate:0, nearRate:0, state:'untested' };
    var tier = Z.famTier ? Z.famTier(f) : 'l2';

    /* 第一行：练什么 */
    what.innerHTML = '<b>' + escH(f.name) + '</b>' +
      '<span class="why-tag">' + (FAM_TARGET_LABEL[tier] || tier) + '</span>' +
      '<span class="why-tag ghost">' + (f.hitYears || 0) + '/' + ${PAPERS.length} + ' 年考 · 年均 ' +
      (Math.round((f.avgPerYear || 0) * 10) / 10) + ' 分</span>';

    /* 第二行：为什么是它 */
    if (st.state === 'untested') {
      why.textContent = '还没测过——先做一组看正确率，这本身就是诊断。';
    } else if (st.nearRate > 0.2) {
      why.textContent = '正确率 ' + Math.round(st.rate * 100) + '%，但「会做但错」占 ' +
        Math.round(st.nearRate * 100) + '%——路径都对，只是收尾不稳。';
    } else {
      why.textContent = '正确率 ' + Math.round(st.rate * 100) + '%，离这一层目标还差 ' +
        Math.max(0, Math.round((({l1:0.98,l2:0.90,l3:0.50}[tier] || 0.9) - st.rate) * 100)) + ' 个点。';
    }

    /* 第三行：现在什么状态 */
    var T = (Z.FAM_TARGET || {})[tier] || { rate: 0.9, minN: 8, streak: 0 };
    if (st.state === 'untested') {
      stEl.textContent = '未测 · 需 ' + T.minN + ' 题才能判定（本组默认 ' + sel.len + ' 题）';
    } else {
      var cond = '≥' + Math.round(T.rate * 100) + '%';
      if (T.streak) cond += ' 且跨题连对 ≥' + T.streak;
      stEl.textContent = '已练 ' + st.n + ' 题 · 当前 ' + Math.round(st.rate * 100) + '%' +
        (st.streak ? ' · 连对 ' + st.streak : '') + ' · 达标线 ' + cond;
    }
  }
  function escH(x){
    return String(x == null ? '' : x).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  /* ---------- 做完一组之后的诊断 ----------
     这是全站唯一真正的「诊断」：它紧接着产生一个动作。
     输入只用本组数据，不做跨页聚合——跨页聚合必然变成报告，
     而报告不会让人行动。

     三段：
       ① 本组成绩 vs 这一层的目标（不是 vs 60 分）
       ② 错的那几题卡在哪一步 → 归到哪类错因（说清「不是算错」这种区别）
       ③ 一个按钮：再练几题 / 换下一族 */
  var ERR_LABEL = { sign:'符号错误', calc:'计算失误', concept:'概念边界',
    method:'方法未掌握', model:'建模失败', express:'规范缺失' };
  var ERR_FIX = { sign:'再练同类变号题', calc:'限时重复同一类',
    concept:'回概念判断', method:'看识别信号 + 母题', model:'练建模四步', express:'练采分点' };

  function paintAfterDiag(res){
    var box = document.getElementById('diagAfter');
    var card = document.getElementById('diagAfterCard');
    if (!box || !card) return;

    var f = famById(sel.family);
    var tier = f && Z.famTier ? Z.famTier(f) : 'l2';
    var T = (Z.FAM_TARGET || {})[tier] || { rate: 0.9 };
    /* 引擎返回的 res.rate 已是百分数（内部 Math.round(x*100)），不能再乘 100 */
    var pct = Math.round(res.rate || 0);
    var target = Math.round(T.rate * 100);

    var html = '';

    /* ① 成绩 vs 目标 */
    html += '<div class="da-head">' +
      '<b>本组 ' + res.answered + ' 题，对 ' + res.correct + ' 题（' + pct + '%）</b>' +
      '<span class="da-target">' + (FAM_TARGET_LABEL[tier] || tier) + '目标 ' + target + '%' +
      (pct >= target ? ' · 已达标' : ' · 还差 ' + (target - pct) + ' 个点') + '</span>' +
      '</div>';

    /* ② 错题归因 */
    var wrong = (res.results || []).filter(function(r){ return r.result !== 'right'; });
    if (!wrong.length) {
      html += '<p class="da-none">本组没有错题。' +
        (pct >= target ? '这一族可以过了。' : '但样本还不够，再练一组确认。') + '</p>';
      html += '<div class="da-actions">' +
        '<button class="btn primary" id="daNext2">换下一族</button>' +
        '<a class="btn ghost" href="drill.html?family=' + encodeURIComponent(sel.family || '') +
        '&n=10&autostart=1">再练一组</a>' +
        '</div>';
    } else {
      /* 统计卡点与错因 */
      var stuckCount = {}, errCount = {};
      var firstStuck = null, firstErr = null;
      wrong.forEach(function(r){
        var s = (r.stuckStep != null && r.stuckStep >= 0) ? r.stuckStep : -1;
        if (s >= 0) {
          stuckCount[s] = (stuckCount[s] || 0) + 1;
          if (firstStuck == null) firstStuck = s;
        }
        var e = r.errTag || r.errorType;
        if (e) {
          errCount[e] = (errCount[e] || 0) + 1;
          if (!firstErr) firstErr = e;
        }
      });

      /* 卡在第几步 */
      var stuckTxt = '';
      if (firstStuck != null) {
        stuckTxt = '卡在第 ' + (firstStuck + 1) + ' 步';
        if (firstStuck === 0) stuckTxt += '（第一步就卡 → 方法或概念没到位，不是算错）';
        else stuckTxt += '（前面都对 → 是收尾/执行问题）';
      }

      /* 哪类错因 */
      var errTxt = '';
      if (firstErr) {
        errTxt = '<b>' + (ERR_LABEL[firstErr] || firstErr) + '</b>';
        if (firstErr === 'sign') errTxt += '——不是算错，是变号。这两类的补法不同：变号要专项，算错要限时重复。';
        else if (firstErr === 'calc') errTxt += '——会做但算错，补法是限时重复同一类。';
        else if (firstErr === 'concept') errTxt += '——定义的条件没弄清，回概念判断。';
      }

      html += '<div class="da-wrong">';
      html += '<div class="da-row"><span class="da-k">错了几题</span><span>' + wrong.length + ' 题</span></div>';
      if (stuckTxt) html += '<div class="da-row"><span class="da-k">卡在哪</span><span>' + stuckTxt + '</span></div>';
      if (errTxt) html += '<div class="da-row"><span class="da-k">哪类错</span><span>' + errTxt + '</span></div>';
      html += '</div>';

      /* nearMiss：会做但错 */
      var nm = wrong.filter(function(r){ return r.nearMiss; }).length;
      if (nm > 0) {
        html += '<p class="da-nm">其中 <b>' + nm + '</b> 题是「会做但错」——除最后一步外全对。' +
          '这不是不会，是收尾不稳。</p>';
      }

      /* ③ 动作按钮 */
      var againN = Math.min(10, Math.max(6, wrong.length * 3));
      var fixTxt = firstErr && ERR_FIX[firstErr] ? ERR_FIX[firstErr] : '再练同类';
      html += '<div class="da-actions">' +
        '<a class="btn primary" href="drill.html?family=' + encodeURIComponent(sel.family || '') +
        '&n=' + againN + '&autostart=1">' + fixTxt + '（' + againN + ' 题）</a>' +
        '<button class="btn ghost" id="daNext">换下一族</button>' +
        '<a class="btn ghost sm" href="wrong.html">看错题本</a>' +
        '</div>';
    }

    card.innerHTML = html;
    box.style.display = '';

    var nx2 = document.getElementById('daNext2');
    if (nx2) nx2.addEventListener('click', function(){ location.href = 'drill.html'; });
    var nx = document.getElementById('daNext');
    if (nx) nx.addEventListener('click', function(){
      /* 换下一族：清掉 family 参数重新载入，让 pickFamily 重新算 */
      location.href = 'drill.html';
    });
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* 折叠区开关 */
  var setupWrap = document.getElementById('setupWrap');
  var tg = document.getElementById('toggleSetup');
  var cl = document.getElementById('closeSetup');
  if (tg && setupWrap) tg.addEventListener('click', function(){ setupWrap.style.display = ''; });
  if (cl && setupWrap) cl.addEventListener('click', function(){ setupWrap.style.display = 'none'; });

  function ensureDefs(){
    Object.keys(CH).forEach(function(cid){
      var d = CH[cid];
      if (d.defs && !defsSeen[cid]) {
        defsSeen[cid] = true;
        var box = document.createElement('div');
        box.innerHTML = d.defs;
        document.body.appendChild(box.firstChild);
      }
    });
  }

  /* 三类题源合并：普通题 / 概念判断 / 方法辨析
     qtype=all 时三类混出（默认），也可单独只刷某一类。
     概念题与方法题是运行时从分片的 concepts / methods 现场生成的，
     不额外占题库文件，所以「一个入口」不会让数据变重。 */
  function collect(){
    var pool = [], wm = (Z.wrongMap && Z.wrongMap()) || {};

    /* 冲刺计划的一天：题池由 META.sprint[day-1].ids 决定。
       第 9 天（错题重做）的 ids 在构建期是空的，运行时用当前错题补上。
       这条路径要最先返回——否则会被下面的章节/族筛选过滤掉大半。 */
    if (sel.day) {
      var sp = ((window.YZ.META && window.YZ.META.sprint) || [])[sel.day - 1];
      if (!sp) { Z.toast('第 ' + sel.day + ' 天不存在'); return []; }
      var wantIds = (sp.kind === 'redo') ? Object.keys(wm) : (sp.ids || []);
      if (!wantIds.length) return [];
      var want = {};
      wantIds.forEach(function(id){ want[id] = true; });
      Object.keys(CH).forEach(function(cid){
        (CH[cid].questions||[]).forEach(function(q){
          if (want[q.id]) pool.push(q);
        });
      });
      /* 按计划里的原顺序排（题号升序），不洗牌——
         同一题位跨卷对比才有意义，打乱就看不出来了。 */
      var order = {};
      wantIds.forEach(function(id, i){ order[id] = i; });
      pool.sort(function(a, b){ return (order[a.id]||0) - (order[b.id]||0); });
      return pool;
    }
    var weakMethods = {};
    if (sel.scope === 'weak' && Z.methodWeakness) {
      (Z.methodWeakness() || []).slice(0, 3).forEach(function(w){ weakMethods[w.id] = true; });
    }
    var idSet = null;
    if (sel.ids.length) {
      idSet = {};
      sel.ids.forEach(function(id){ idSet[id] = true; });
    }
    var wantQ = sel.qtype === 'all' || sel.qtype === 'question';
    var wantC = sel.qtype === 'all' || sel.qtype === 'concept';
    var wantM = sel.qtype === 'all' || sel.qtype === 'method';
    function oneCh(cid){ var o = {}; o[cid] = CH[cid]; return o; }

    Object.keys(CH).forEach(function(cid){
      if (!idSet && sel.chapter && cid !== sel.chapter) return;

      /* ① 普通题 */
      if (wantQ) (CH[cid].questions||[]).forEach(function(q){
        /* 指定题号时：只按白名单取，不再受章节/方法/分层/范围筛选 */
        if (idSet) { if (idSet[q.id]) pool.push(q); return; }
        if (sel.method && q.method !== sel.method) return;
        if (sel.family && q.family !== sel.family) return;
        if (sel.tier !== 'all' && q.tier !== sel.tier) return;
        if (sel.scope === 'wrong' && !wm[q.id]) return;
        if (sel.scope === 'weak' && !weakMethods[q.method]) return;
        pool.push(q);
      });

      /* ② 概念判断题（运行时由概念卡生成） */
      if (wantC && !idSet && Z.buildConceptPool) {
        Z.buildConceptPool(oneCh(cid), cid).forEach(function(q){
          if (sel.tier !== 'all' && q.tier !== sel.tier) return;
          if (sel.scope === 'wrong' && !wm[q.id]) return;
          pool.push(q);
        });
      }

      /* ③ 方法辨析题（运行时由方法卡 pitfalls 生成） */
      if (wantM && !idSet && Z.buildMethodPool) {
        Z.buildMethodPool(oneCh(cid), cid).forEach(function(q){
          if (sel.tier !== 'all' && q.tier !== sel.tier) return;
          if (sel.scope === 'wrong' && !wm[q.id]) return;
          if (sel.method && q.method !== sel.method) return;
          if (sel.scope === 'weak' && !weakMethods[q.method]) return;
          pool.push(q);
        });
      }
    });
    return pool;
  }

  /* 三级递进出题：把题按方法卡组成「母题 → 改数字 → 改条件 → 逆向」链，
     再按链顺序出题。这样练习本身就是「举一反三」的验证，
     而不是随机抽题。返回 { pool, chains } */
  function arrangeByLadder(pool){
    if (!Z.buildLadders) return { pool: pool, chains: [] };
    var built = Z.buildLadders(pool);
    /* 只保留本组范围里的题，按三级顺序展开 */
    var ordered = built.map(function(x){ return x.q; });
    /* 补上没被分组覆盖的题（如同章节但无方法的题） */
    var seen = {};
    ordered.forEach(function(q){ seen[q.id] = true; });
    pool.forEach(function(q){ if (!seen[q.id]) ordered.push(q); });
    var chains = Z.completeChains ? Z.completeChains(pool) : [];
    return { pool: ordered, chains: chains };
  }

  document.getElementById('startBtn').addEventListener('click', function(){
    var raw = collect();
    if (!raw.length) {
      Z.toast(sel.day === 9 ? '现在没有错题，第 9 天可以跳过' : '这个范围暂时没有题目');
      return;
    }
    /* 冲刺计划的一天：题量就是当天的全部，不截断。
       否则「第 3 天 40 题」会被默认 10 题截掉，完成度永远到不了 100%。 */
    if (sel.day) sel.len = raw.length;
    var arranged = arrangeByLadder(raw);
    var pool = arranged.pool;
    var chains = arranged.chains;
    var n = Math.min(sel.len, pool.length);
    if (n < sel.len) {
      /* 题量不足时要说清后果，不只是「按 n 题出」：
         族达标有最小样本量要求，凑不够就判不出来——这比少做几题重要。 */
      var why = sel.family
        ? '，不够 10 题这一族判不出达标（换更大范围或放宽筛选）'
        : '';
      Z.toast('这个范围只有 ' + pool.length + ' 题，本组按 ' + n + ' 题出' + why);
    }
    sel.len = n;
    /* 指定题号时保持给定顺序（槽位题按难度递进排好），不洗牌；
       三级链模式下也保持链顺序（否则递进失效）。
       冲刺计划的一天也要保序：同题位跨卷对比才看得出「是这套卷不会
       还是这类题不会」，打乱就把这个信息丢了。 */
    var keepOrder = sel.ids.length > 0 || chains.length > 0 || sel.day > 0;
    if (chains.length) {
      Z.toast('本组含 ' + chains.length + ' 条三级链：改数字 → 改条件 → 逆向');
    }
    ensureDefs();
    document.getElementById('stageWrap').style.display = '';
    Z.step({
      mount: '#stage', questions: pool, mode: sel.mode, limit: sel.len, shuffle: !keepOrder,
      wrongHref: 'wrong.html', backHref: 'drill.html', backLabel: '重新配置',
      onAnswer: function(q, ok, rec, errTag){
        Z.qRecord({ id: q.id, chapter: q.chapter, method: q.method, family: q.family, tier: q.tier, qtype: q.qtype,
          result: rec.result, stuckStep: -1, errTag: errTag || null, errorType: (function(q,ok,tag){ if(ok)return null; if(tag)return tag; if(q.qtype==='single')return 'concept'; if(q.qtype==='calc')return 'calc'; if(q.qtype==='judge')return q.__conceptId?'concept':'method'; if(q.qtype==='big')return null; return 'method'; })(q, ok, errTag),
          timeMs: rec.timeMs, nearMiss: rec.nearMiss, src: sel.mode });
        if (q.variantOf && Z.methodRecord) Z.methodRecord(q.method, q.id, ok, q.changed);
        Z.bumpDay('questions', 1);
      },
      onFinish: function(res){
        if (res.rate >= 90) Z.sfx('win');
        paintAfterDiag(res);
        paintWhy();
      }
    });
    document.getElementById('stageWrap').scrollIntoView({ behavior:'smooth', block:'start' });
  });

  Z.ready(function(){
    Z.loadAll(Z.chapterIds()).then(function(all){
      CH = all || {};
      paintWhy();
      /* 直接出题：点「巩固练习」就该开始做，不该先配置。
         带 family / ids / method 等参数时不自动开始（那是明确的定向练习）；
         从首页或导航直接进来时自动开始。 */
      var directed = (sel.family && params.get('family'))
        || sel.ids.length || sel.method || sel.chapter || sel.day;
      if (params.get('autostart') === '1' || !directed) {
        document.getElementById('startBtn').click();
      }
    });
  });
})();
`;

  const html = page({
    active: 'drill.html',
    title: '巩固练习',
    desc: `分步判定刷题：${STATS.allQuestions} 题，按方法卡、章节、分层筛选，记录卡在第几步。`,
    body, script, useStep: true, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

/* ==========================================================
   页面 6：方法卡索引 + 单卡
   ========================================================== */
function buildMethodIndex() {
  const R = newRenderers();
  const C = R.math.compact;

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 方法卡</div>
  <h1>方法卡</h1>
  <p class="lede">按<b>识别信号</b>组织，不按章节罗列。每张卡第一行写清「题面出现什么时该想到它」——因为解题的第一步不是算，是认。</p>
</div>

${TIER_ORDER.map((t) => {
  const ms = METHODS.filter((m) => m.tier === t);
  if (!ms.length) return '';
  return `<section class="section">
    <div class="section-head">
      <div class="section-head-left">
        <span class="kicker">${TIER_NAME[t]} · 目标 ${TIER_TARGET[t]}</span>
        <h2>${ms.length} 张</h2>
        <span class="sub">${esc(TIER_NOTE[t])}</span>
      </div>
    </div>
    <div class="grid c2">
      ${ms.map((m) => `<a class="card method-card" href="method/${m.id}.html">
        <div class="mc-top">
          <span class="mcard-tier ${m.tier}">${TIER_NAME[m.tier]}</span>
          <span class="mc-ch">${esc((CH_BY_ID.get(m.chapter) || {}).name || '')}</span>
        </div>
        <h3>${esc(m.name)}</h3>
        <p class="mc-signal">${C(R.math.render(m.signal))}</p>
        <div class="meta">${(m.steps || []).length} 步 · ${(Q_BY_METHOD.get(m.id) || []).length} 题</div>
      </a>`).join('')}
    </div>
  </section>`;
}).join('')}
`;

  const html = page({
    active: 'method.html',
    title: '方法卡',
    desc: `${SITE.exam}方法卡：${STATS.methods} 张，按识别信号组织，覆盖熟练层、理解层、攻坚层。`,
    body, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

function buildMethodCard(m) {
  const R = newRenderers();
  const C = R.math.compact;
  const qs = Q_BY_METHOD.get(m.id) || [];
  const mother = m.motherId ? Q_BY_ID.get(m.motherId) : null;
  const variants = (m.variantIds || []).map((id) => Q_BY_ID.get(id)).filter(Boolean);
  const ch = CH_BY_ID.get(m.chapter) || {};

  const variantLabel = { number: '改数字', condition: '改条件', reverse: '逆向问' };

  function renderQBlock(q) {
    if (!q) return '';
    const rq = renderQuestion(q, R);
    const tr = rq.trace;
    const trLine = tr ? `<div class="trace-line">
      <span class="trace-badge">真题溯源</span>
      <span class="trace-text">对应 ${tr.n} 道真题 · 最近 ${esc(tr.latest)} 第 ${tr.latestNo} 题（${tr.latestScore} 分）</span>
      <span class="trace-srcs">${tr.srcs.map((x) => `<code>${esc(x)}</code>`).join(' ')}</span>
    </div>` : '';
    return `<div class="mc-q">
      ${trLine}
      <div class="mc-q-stem">${rq.stemHtml}</div>
      ${rq.figHtml ? `<div class="mc-q-fig">${rq.figHtml}</div>` : ''}
      <ol class="mc-q-steps">
        ${(rq.steps || []).map((s, i) => `<li>
          <div class="mc-qs-head"><span class="mc-qs-no">${i + 1}</span><span class="mc-qs-label">${s.labelHtml || esc(s.label)}</span><span class="mc-qs-score">${s.score} 分</span></div>
          <div class="mc-qs-ask">${s.askHtml || esc(s.ask)}</div>
          ${s.answerHtml ? `<div class="mc-qs-ans">答案：<b>${s.answerHtml}</b></div>` : ''}
        </li>`).join('')}
      </ol>
      ${rq.solutionHtml ? `<details class="mc-sol"><summary>完整解答</summary><div>${rq.solutionHtml}</div></details>` : ''}
    </div>`;
  }

  const body = `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../method.html">方法卡</a> / ${esc(m.name)}</div>
  <div class="mc-head-row">
    <span class="mcard-tier ${m.tier}">${TIER_NAME[m.tier]}</span>
    <span class="mc-ch">${esc(ch.name || '')}</span>
  </div>
  <h1>${esc(m.name)}</h1>
</div>

<section class="section" style="margin-top:16px">
  <div class="card mc-signal-card">
    <div class="kicker">① 识别信号 · 题面出现什么时该想到它</div>
    <div class="mc-signal-body">${C(R.math.render(m.signal))}</div>
  </div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">② 标准步骤</span>
    <h2>${(m.steps || []).length} 步，每步一个给分点</h2>
  </div></div>
  <ol class="mc-steps">
    ${(m.steps || []).map((s, i) => `<li>
      <span class="mc-step-no">${i + 1}</span>
      <div><b>${esc(s.label)}</b><span class="mc-step-ask">${esc(s.ask)}</span></div>
      <span class="mc-step-score">${s.score} 分</span>
    </li>`).join('')}
  </ol>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">③ 常见误用</span>
    <h2>${(m.pitfalls || []).length} 个高频错误</h2>
  </div></div>
  <div class="grid c2">
    ${(m.pitfalls || []).map((p) => `<div class="card pitfall-card">
      <div class="pf-t">${esc(p.t)}</div>
      <div class="pf-row"><span class="pf-bad">✕</span><span>${C(R.math.render(p.bad))}</span></div>
      <div class="pf-row"><span class="pf-good">✓</span><span>${C(R.math.render(p.good))}</span></div>
      <div class="pf-why">${C(R.math.render(p.why))}</div>
    </div>`).join('')}
  </div>
</section>

${mother ? `<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">④ 母题精讲</span>
    <h2>这道题完整走一遍</h2>
  </div></div>
  <div class="card">${renderQBlock(mother)}</div>
</section>` : ''}

${variants.length ? `<section class="section" id="chainSec" data-method="${m.id}">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">⑤ 三级变式链</span>
    <h2>三级全对才算掌握，错一级从头再来</h2>
    <span class="sub">改数字验解法稳定性 → 改条件验是否懂适用条件 → 逆向问验是否掌握结构</span>
  </div>
  <div class="section-head-right">
    <span class="chain-status" id="chainStatus">未开始</span>
  </div></div>

  <div class="chain-track" id="chainTrack">
    <div class="chain-step" data-lv="0"><span class="chain-no">1</span><span class="chain-name">改数字</span><span class="chain-mark">—</span></div>
    <span class="chain-arrow">→</span>
    <div class="chain-step" data-lv="1"><span class="chain-no">2</span><span class="chain-name">改条件</span><span class="chain-mark">—</span></div>
    <span class="chain-arrow">→</span>
    <div class="chain-step" data-lv="2"><span class="chain-no">3</span><span class="chain-name">逆向问</span><span class="chain-mark">—</span></div>
  </div>

  <div class="chain-cta">
    <a class="btn primary" href="../drill.html?method=${m.id}&mode=guided&autostart=1">按三级顺序练这一组</a>
    <span class="desc" style="font-size:.84rem">出题会自动按「改数字 → 改条件 → 逆向」排列</span>
  </div>

  ${variants.map((v) => `<div class="card mc-variant" data-changed="${v.changed}">
    <div class="mc-v-head"><span class="mc-v-tag">${variantLabel[v.changed] || '变式'}</span></div>
    ${renderQBlock(v)}
  </div>`).join('')}
</section>` : ''}

<section class="section">
  <div class="grid c2">
    <a class="card tool-card" href="../drill.html?method=${m.id}&mode=guided&autostart=1">
      <h3>练这个方法的题</h3>
      <p class="desc">引导模式，逐步作答，答错给提示。</p>
      <div class="meta">${qs.length} 题可用</div>
    </a>
    <a class="card tool-card" href="../drill.html?method=${m.id}&mode=selfcheck&autostart=1">
      <h3>自查模式</h3>
      <p class="desc">只给步骤骨架，自己勾哪一步做出来了。</p>
      <div class="meta">${qs.length} 题可用</div>
    </a>
  </div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  var MID = ${JSON.stringify(m.id)};
  function paint(){
    var st = Z.methodState ? Z.methodState(MID) : null;
    if (!st) return;
    var status = document.getElementById('chainStatus');
    [].forEach.call(document.querySelectorAll('.chain-step'), function(el){
      var i = parseInt(el.getAttribute('data-lv'), 10);
      var mk = el.querySelector('.chain-mark');
      el.classList.remove('done','stuck');
      if (st.done || (st.passed && st.passed[i])) { el.classList.add('done'); if(mk) mk.textContent='✓'; }
      else if (st.stuckLevel === i) { el.classList.add('stuck'); if(mk) mk.textContent='卡'; }
      else if (mk) mk.textContent = '—';
    });
    if (status) {
      if (st.done) { status.textContent = '已掌握'; status.className = 'chain-status ok'; }
      else if (st.stuckLevel >= 0) {
        var names = ['改数字','改条件','逆向问'];
        status.textContent = '卡在「' + names[st.stuckLevel] + '」';
        status.className = 'chain-status warn';
      } else if (st.passed && st.passed.some(Boolean)) { status.textContent = '进行中'; status.className = 'chain-status'; }
      else { status.textContent = '未开始'; status.className = 'chain-status'; }
    }
  }
  Z.ready(function(){ paint(); document.addEventListener('yz:method', paint); });
})();
`;

  const html = page({
    base: '../', active: 'method.html',
    title: m.name,
    desc: `${m.name}：识别信号、标准步骤、常见误用、母题与三级变式链。`,
    body, script, data: ['meta'],
  });
  return html.replace('<body data-base="../">', '<body data-base="../">' + R.math.defs());
}

/* ==========================================================
   页面 7：知识图谱 + 单章
   ========================================================== */
function buildMap() {
  const R = newRenderers();
  const blocks = [...new Set(CHAPTERS.map((c) => c.block))];

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 知识图谱</div>
  <h1>知识图谱</h1>
  <p class="lede">每章的掌握度环来自你的作答记录。<b>前置拖累</b>检测：如果本章吃力，但前置章正确率也低，先补前置——问题往往不在当下这一章。</p>
</div>

<section class="section" style="margin-top:16px">
  <div class="card" style="padding:16px 20px;border-left:4px solid var(--accent)">
    <div class="kicker" style="margin-bottom:6px">最该补哪章</div>
    <div id="mapDiag"><p style="margin:0;font-size:.9rem;color:var(--text-2)">练几题后这里显示最该补的章与理由。</p></div>
  </div>
</section>

${blocks.map((bl) => `<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">${esc(bl)}</span>
    <h2>${CHAPTERS.filter((c) => c.block === bl).length} 章</h2>
  </div></div>
  <div class="grid c2">
    ${CHAPTERS.filter((c) => c.block === bl).map((c) => `<a class="card chapter-card" href="map/${c.id}.html" data-ch="${c.id}">
      <div class="ch-top">
        <span class="ch-no">${c.no}</span>
        <span class="mm-ring">
          <svg viewBox="0 0 32 32" width="32" height="32">
            <circle cx="16" cy="16" r="13" fill="none" stroke="var(--bg-3)" stroke-width="3.5"/>
            <circle class="mm-fill" cx="16" cy="16" r="13" fill="none" stroke="var(--accent)"
              stroke-width="3.5" stroke-dasharray="81.7" stroke-dashoffset="81.7"
              stroke-linecap="round" transform="rotate(-90 16 16)"/>
          </svg>
          <b class="mm-num">—</b>
        </span>
      </div>
      <h3>${esc(c.name)}</h3>
      <p class="desc">${esc(c.summary)}</p>
      <div class="meta">${(Q_BY_CHAPTER.get(c.id) || []).length} 题 · ${(C_BY_CHAPTER.get(c.id) || []).length} 概念卡 · ${(c.methods || []).length} 方法卡</div>
    </a>`).join('')}
  </div>
</section>`).join('')}
`;

  const script = `
(function(){
  var Z = window.YZ;
  function paint(){
    var log = Z.qLog ? Z.qLog() : null;
    var byCh = (log && log.stats && log.stats.byChapter) || {};
    [].forEach.call(document.querySelectorAll('[data-ch]'), function(card){
      var id = card.getAttribute('data-ch');
      var o = byCh[id];
      var fill = card.querySelector('.mm-fill'), num = card.querySelector('.mm-num');
      if (!o || !o.n) { if (num) num.textContent = '—'; return; }
      var r = o.ok / o.n;
      if (fill) fill.setAttribute('stroke-dashoffset', String(81.7 * (1 - r)));
      if (num) num.textContent = Math.round(r * 100) + '%';
    });
    var diag = document.getElementById('mapDiag');
    if (!diag) return;
    if (!Z.chapterWeakness) return;
    var w = (Z.chapterWeakness() || [])[0];
    if (!w) { diag.innerHTML = '<p style="margin:0;font-size:.9rem;color:var(--text-2)">数据还不够，先做一组题。</p>'; return; }
    var META = (window.YZ && window.YZ.META) || {};
    var ch = (META.chapters || []).filter(function(c){ return c.id === w.id; })[0] || {};
    var pre = (ch.prereq || []).map(function(p){
      var pc = (META.chapters || []).filter(function(c){ return c.id === p; })[0] || {};
      var po = byCh[p];
      var pr = po && po.n ? Math.round(po.ok / po.n * 100) : null;
      return { name: pc.name || p, rate: pr };
    });
    var html = '<p style="margin:0;font-size:.94rem"><b>' + (ch.name || w.id) + '</b> 正确率 ' +
      Math.round((w.rate || 0) * 100) + '%，是最该补的一章。</p>';
    var weakPre = pre.filter(function(p){ return p.rate != null && p.rate < 70; });
    if (weakPre.length) {
      html += '<p style="margin:6px 0 0;font-size:.86rem;color:var(--gold)">⚠ 前置拖累：' +
        weakPre.map(function(p){ return p.name + ' 只有 ' + p.rate + '%'; }).join('、') +
        '，建议先补前置章。</p>';
    }
    diag.innerHTML = html;
  }
  Z.ready(function(){ paint(); document.addEventListener('yz:qlog', paint); });
})();
`;

  const html = page({
    active: 'map.html', title: '知识图谱',
    desc: `${STATS.chapters} 章知识结构、掌握度与前置依赖诊断。`,
    body, script, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

function buildChapter(c) {
  const R = newRenderers();
  const C = R.math.compact;
  const methods = (c.methods || []).map((id) => M_BY_ID.get(id)).filter(Boolean);
  const qs = Q_BY_CHAPTER.get(c.id) || [];
  const cs = C_BY_CHAPTER.get(c.id) || [];
  const prereqs = (c.prereq || []).map((p) => CH_BY_ID.get(p)).filter(Boolean);

  const body = `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../map.html">知识图谱</a> / ${esc(c.name)}</div>
  <h1>${c.no}. ${esc(c.name)}</h1>
  <p class="lede">${esc(c.block)} · ${qs.length} 题 · ${cs.length} 概念卡 · ${methods.length} 方法卡 · 期末权重约 ${Math.round((c.weight || 0) * 100)}%</p>
</div>

<section class="section" style="margin-top:18px">
  <div class="card" style="padding:16px 20px;border-left:4px solid var(--accent)">
    <div class="kicker" style="margin-bottom:6px">本章诊断</div>
    <div id="chDiagBody"><p style="margin:0;font-size:.9rem;color:var(--text-2)">练几题后这里显示本章正确率与最弱方法卡。</p></div>
  </div>
</section>

${prereqs.length ? `<section class="section">
  <div class="card" style="padding:16px 20px;border-left:4px solid var(--gold)">
    <div class="kicker" style="margin-bottom:6px">前置章节</div>
    <p style="margin:0;font-size:.94rem">学本章前先确认这几章没问题：${prereqs.map((p) => `<a href="${p.id}.html" style="font-weight:650">${esc(p.name)}</a>`).join('、')}</p>
  </div>
</section>` : ''}

${methods.length ? `<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">方法卡</span><h2>本章涉及的 ${methods.length} 个方法</h2>
  </div></div>
  <div class="grid c2">
    ${methods.map((m) => `<a class="card method-card" href="../method/${m.id}.html" data-method="${m.id}">
      <div class="mc-top"><span class="mcard-tier ${m.tier}">${TIER_NAME[m.tier]}</span></div>
      <h3>${esc(m.name)}</h3>
      <p class="mc-signal">${C(R.math.render(m.signal))}</p>
      <div class="meta">${(m.steps || []).length} 步</div>
    </a>`).join('')}
  </div>
</section>` : ''}

${cs.length ? `<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">概念卡</span><h2>${cs.length} 张，${cs.reduce((a, x) => a + (x.tests || []).length, 0)} 个判断</h2>
  </div></div>
  <div class="grid c2">
    ${cs.map((x) => `<a class="card" href="../concept.html?ch=${c.id}">
      <h3>${esc(x.claim)}</h3>
      <div class="meta">${(x.tests || []).length} 个判断</div>
    </a>`).join('')}
  </div>
</section>` : ''}

<section class="section">
  <div class="grid c2">
    <a class="card tool-card" href="../drill.html?chapter=${c.id}&mode=guided&autostart=1">
      <h3>练本章 · 引导模式</h3>
      <p class="desc">逐步作答，答错给提示，记下卡点。</p>
      <div class="meta">${qs.length} 题可用</div>
    </a>
    <a class="card tool-card" href="../concept.html?ch=${c.id}">
      <h3>本章概念自测</h3>
      <p class="desc">只考条件不考背诵。</p>
      <div class="meta">${cs.length} 张卡</div>
    </a>
  </div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  function paint(){
    var log = Z.qLog ? Z.qLog() : null;
    var o = ((log && log.stats && log.stats.byChapter) || {})['${c.id}'];
    var box = document.getElementById('chDiagBody');
    if (!box) return;
    if (!o || !o.n) { box.innerHTML = '<p style="margin:0;font-size:.9rem;color:var(--text-2)">还没有本章记录。</p>'; return; }
    var r = Math.round(o.ok / o.n * 100);
    var msg = r >= 90 ? '本章扎实。' : r >= 70 ? '本章有漏洞，重点看错题。' : '本章偏弱，建议回方法卡重看识别信号。';
    box.innerHTML = '<p style="margin:0;font-size:.94rem">正确率 <b>' + r + '%</b>（' + o.n + ' 题）· ' + msg + '</p>';
  }
  Z.ready(function(){ paint(); document.addEventListener('yz:qlog', paint); });
})();
`;

  const html = page({
    base: '../', active: 'map.html', title: c.name,
    desc: `${c.name}：${c.summary} ${qs.length} 题、${cs.length} 概念卡。`,
    body, script, data: ['meta'],
  });
  return html.replace('<body data-base="../">', '<body data-base="../">' + R.math.defs());
}

/* ==========================================================
   页面 8：错题本 wrong.html（六类错因）
   ========================================================== */
function buildWrong() {
  const R = newRenderers();
  /* 补救动作的链接目标：一律指向现存页面。
     calc.html 已停用，符号/计算两类改指 drill 的对应族与分层筛选——
     这比一个 404 的「计算专项」有用得多。 */
  const ERRS = [
    ['concept', '概念边界', '定义、定理的适用条件没弄清', '去做条件判断题', 'concept.html'],
    ['sign', '符号错误', '去括号变号、负号、乘方底数', '练符号专项', 'drill.html?family=f-mixcalc'],
    ['calc', '计算失误', '会做但算错，或收尾出错', '限时计算（连对 3 次出册）', 'drill.html?tier=l1'],
    ['method', '方法未掌握', '没思路，或选错了工具', '看识别信号 + 母题', 'method.html'],
    ['model', '建模失败', '应用题列不出方程', '建模四步 + 同类题', 'drill.html?family=f-eqapp'],
    ['express', '规范缺失', '漏写步骤、漏答、单位错', '采分点自评', 'drill.html'],
  ];

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 错题本</div>
  <h1>错题本</h1>
  <p class="lede">答错的题自动进来。六类错因分开看——因为<b>补救方式不同</b>：符号错要专项训练，算错要限时重复，概念错要回条件判断。</p>
</div>

<section class="section">
  <div class="toolbar">
    <div class="chips" id="tabs">
      <button class="chip on" data-tab="all">全部 <span id="nAll">0</span></button>
      ${ERRS.map(([k, n]) => `<button class="chip" data-tab="${k}">${n} <span id="n-${k}">0</span></button>`).join('')}
    </div>
    <div class="toolbar-right">
      <input class="search" id="search" placeholder="搜索题干、章节、错因…">
      <button class="btn ghost sm" id="printBtn">打印错题纸</button>
    </div>
  </div>
  <div class="wb-bar">
    <label class="wb-selectall"><input type="checkbox" id="selAll"> <span>全选本页</span></label>
    <span class="wb-count" id="wbCount"></span>
    <span class="wb-picked" id="wbPicked">已选 0 题</span>
    <div class="wb-bar-actions">
      <button class="btn primary sm" id="redoPicked" disabled>重做选中 →</button>
      <button class="btn ghost sm" id="redoPickedClear" disabled>清空选择</button>
    </div>
  </div>
  <div id="wbList"></div>
  <div class="pager" id="pager"></div>
</section>

<section class="section" id="printZone">
  <div class="print-list" id="printList"></div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  var META = window.YZ && window.YZ.META ? window.YZ.META : {};
  var CH = {}; /* 分片异步加载后填充，不能快照 window.YZ.CH */
  var ERR_NAME = Z.ERR_NAME || {};
  var PAGE = 10;
  var page = 0, tab = 'all', q = '';
  /* 选中集合：跨页、跨 tab 保持（用题 id 作键） */
  var pickedSet = {};
  var params = new URLSearchParams(location.search);
  if (params.get('tab')) tab = params.get('tab');

  function chName(id){ var c = (META.chapters||[]).filter(function(x){return x.id===id;})[0]; return c ? c.name : id; }

  function allWrong(){
    var wm = (Z.wrongMap && Z.wrongMap()) || {};
    var out = [];
    Object.keys(CH).forEach(function(cid){
      (CH[cid].questions||[]).forEach(function(x){
        if (wm[x.id]) out.push(Object.assign({}, wm[x.id], { q: x }));
      });
    });
    return out;
  }

  function counts(list){
    var c = { all: list.length };
    list.forEach(function(w){ c[w.errorType] = (c[w.errorType]||0)+1; });
    return c;
  }

  function render(){
    var list = allWrong();
    var cnt = counts(list);
    document.getElementById('nAll').textContent = cnt.all || 0;
    ['concept','sign','calc','method','model','express'].forEach(function(k){
      var el = document.getElementById('n-' + k);
      if (el) el.textContent = cnt[k] || 0;
    });
    if (tab !== 'all') list = list.filter(function(w){ return w.errorType === tab; });
    if (q) {
      var needle = q.toLowerCase();
      list = list.filter(function(w){
        return ((w.q.stem||'') + ' ' + chName(w.chapter) + ' ' + (ERR_NAME[w.errorType]||'')).toLowerCase().indexOf(needle) >= 0;
      });
    }
    document.getElementById('wbCount').textContent = '共 ' + list.length + ' 条' + (q ? '（已筛选）' : '');

    if (!list.length) {
      document.getElementById('wbList').innerHTML = '<div class="empty">' +
        (cnt.all ? '这个分类下没有错题' : '还没有错题。做错的题会自动进来。') + '</div>';
      document.getElementById('pager').innerHTML = '';
      return;
    }

    var pages = Math.ceil(list.length / PAGE);
    if (page >= pages) page = pages - 1;
    var slice = list.slice(page*PAGE, (page+1)*PAGE);
    document.getElementById('wbList').innerHTML = slice.map(function(w){
      var x = w.q;
      var picked = !!pickedSet[x.id];
      return '<div class="card wb-item' + (picked ? ' picked' : '') + '" data-qid="' + x.id + '">' +
        '<div class="wb-head">' +
        '<label class="wb-check"><input type="checkbox" data-pick="' + x.id + '"' + (picked ? ' checked' : '') + '><span></span></label>' +
        '<span class="wb-tier ' + (w.tier||'') + '">' + (ERR_NAME[w.errorType]||'未分类') + '</span>' +
        '<span class="wb-meta">' + chName(w.chapter) + (w.errTag ? ' · ' + (Z.ERR_NAME && Z.ERR_NAME[w.errTag] ? Z.ERR_NAME[w.errTag] : '') : '') + ' · 错 ' + w.n + ' 次' +
        (w.nearMiss ? ' · <b style="color:var(--gold)">会做但错</b>' : '') + '</span></div>' +
        '<div class="wb-stem">' + (x.stemHtml || x.stem || '') + '</div>' +
        (x.figHtml ? '<div class="wb-fig">' + x.figHtml + '</div>' : '') +
        /* 单选题必须列出选项：不列的话学生复盘时只看到题干，
           根本不知道当时在四个什么之间选——选项本身就是题的一部分。 */
        (x.qtype === 'single' && x.optionsHtml
          ? '<ol class="wb-opts">' + x.optionsHtml.map(function(o, i){
              var on = (i === x.key) ? ' class="on"' : '';
              return '<li' + on + '><span class="wb-opt-k">' + 'ABCD'[i] + '</span>' + o + '</li>';
            }).join('') + '</ol>'
          : '') +
        /* steps 为空时不渲染 <ol>：真题没有拆步，空列表会留下一条
           什么都没有的白条，看着像加载失败。 */
        ((x.steps||[]).length
          ? '<ol class="wb-steps">' + x.steps.map(function(s, i){
              return '<li><b>' + (s.labelHtml||s.label||('第 '+(i+1)+' 步')) + '</b>：' + (s.answerHtml || s.answer || s.askHtml || s.ask || '') + '</li>';
            }).join('') + '</ol>'
          : '') +
        /* 解析默认展开。用户要求「错题要有解析」——错题本里的解析
           藏在折叠里等于没有：错题本就是用来复盘的，点开才看是反人性设计。 */
        (x.answerHtml ? '<div class="wb-ans"><span class="wb-ans-k">正确答案</span>' + x.answerHtml + '</div>' : '') +
        (x.solutionHtml
          ? '<div class="wb-sol-open"><b>为什么</b>' + x.solutionHtml + '</div>'
          : '<div class="wb-nosol">本题暂无解析（原卷未提供答案）</div>') +
        (x.pitfallHtml ? '<div class="wb-pit"><b>易错</b>' + x.pitfallHtml + '</div>' : '') +
        '</div>';
    }).join('');

    document.getElementById('pager').innerHTML = pages > 1 ?
      '<button class="btn ghost sm" data-p="prev" ' + (page===0?'disabled':'') + '>‹ 上一页</button>' +
      '<span>第 ' + (page+1) + ' / ' + pages + ' 页</span>' +
      '<button class="btn ghost sm" data-p="next" ' + (page>=pages-1?'disabled':'') + '>下一页 ›</button>' : '';

    [].forEach.call(document.querySelectorAll('[data-p]'), function(b){
      b.addEventListener('click', function(){
        page += (b.getAttribute('data-p')==='next' ? 1 : -1);
        render();
      });
    });

    /* 勾选：点整行任意处都能切换，但点链接/折叠区不触发 */
    [].forEach.call(document.querySelectorAll('[data-pick]'), function(cb){
      cb.addEventListener('change', function(){
        var id = cb.getAttribute('data-pick');
        if (cb.checked) pickedSet[id] = true; else delete pickedSet[id];
        var card = cb.closest('.wb-item');
        if (card) card.classList.toggle('picked', cb.checked);
        syncPicked();
      });
    });
    /* 点卡片空白处也能勾选 */
    [].forEach.call(document.querySelectorAll('.wb-item'), function(card){
      card.addEventListener('click', function(e){
        if (e.target.closest('a, details, summary, input, button')) return;
        var cb = card.querySelector('[data-pick]');
        if (!cb) return;
        cb.checked = !cb.checked;
        cb.dispatchEvent(new Event('change'));
      });
    });
    syncPicked();

    document.getElementById('printList').innerHTML = list.map(function(w, i){
      var x = w.q;
      return '<div class="print-item"><div class="print-no">' + (i+1) + '.</div>' +
        '<div class="print-body"><div>' + (x.stemHtml || x.stem || '') + '</div>' +
        '<div class="print-meta">' + chName(w.chapter) + ' · ' + (ERR_NAME[w.errorType]||'') + '</div></div></div>';
    }).join('');
  }

  /* 同步「已选 N 题」与按钮可用态；同时更新本页全选框 */
  function syncPicked(){
    var ids = Object.keys(pickedSet);
    var n = ids.length;
    var pk = document.getElementById('wbPicked');
    if (pk) pk.textContent = n ? ('已选 ' + n + ' 题') : '未选';
    var btn = document.getElementById('redoPicked');
    if (btn) btn.disabled = n === 0;
    var clr = document.getElementById('redoPickedClear');
    if (clr) clr.disabled = n === 0;

    var all = document.getElementById('selAll');
    if (all) {
      var boxes = document.querySelectorAll('[data-pick]');
      var checked = document.querySelectorAll('[data-pick]:checked');
      all.checked = boxes.length > 0 && checked.length === boxes.length;
      all.indeterminate = checked.length > 0 && checked.length < boxes.length;
    }
  }

  /* 重做选中：把 id 列表交给 drill，按错题原顺序出题 */
  function redoPicked(){
    var ids = Object.keys(pickedSet);
    if (!ids.length) return;
    /* 保持「先错的先练」：按 wrong 记录里的 n（错次）降序，错得多的优先 */
    var wm = (Z.wrongMap && Z.wrongMap()) || {};
    ids.sort(function(a, b){
      var na = (wm[a] && wm[a].n) || 0, nb = (wm[b] && wm[b].n) || 0;
      return nb - na;
    });
    location.href = 'drill.html?ids=' + encodeURIComponent(ids.join(',')) +
      '&mode=guided&n=' + ids.length + '&autostart=1';
  }

  Z.ready(function(){
    [].forEach.call(document.querySelectorAll('[data-tab]'), function(b){
      if (b.getAttribute('data-tab') === tab) b.classList.add('on');
      b.addEventListener('click', function(){
        [].forEach.call(document.querySelectorAll('[data-tab]'), function(x){ x.classList.remove('on'); });
        b.classList.add('on');
        tab = b.getAttribute('data-tab'); page = 0; render();
      });
    });
    var s = document.getElementById('search');
    if (s) s.addEventListener('input', function(){ q = s.value.trim(); page = 0; render(); });
    var p = document.getElementById('printBtn');
    if (p) p.addEventListener('click', function(){ window.print(); });

    var rp = document.getElementById('redoPicked');
    if (rp) rp.addEventListener('click', redoPicked);
    var rpc = document.getElementById('redoPickedClear');
    if (rpc) rpc.addEventListener('click', function(){
      pickedSet = {};
      render();
    });
    var sa = document.getElementById('selAll');
    if (sa) sa.addEventListener('change', function(){
      var on = sa.checked;
      [].forEach.call(document.querySelectorAll('[data-pick]'), function(cb){
        var id = cb.getAttribute('data-pick');
        cb.checked = on;
        if (on) pickedSet[id] = true; else delete pickedSet[id];
        var card = cb.closest('.wb-item');
        if (card) card.classList.toggle('picked', on);
      });
      syncPicked();
    });

    render();
    document.addEventListener('yz:qlog', render);
    Z.loadAll(Z.chapterIds()).then(function(all){ CH = all || {}; render(); });
  });
})();
`;

  const html = page({
    active: 'wrong.html', title: '错题本',
    desc: '按六类错因分类的错题本：概念边界、符号错误、计算失误、方法未掌握、建模失败、规范缺失。',
    body, script, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

/* ==========================================================
   页面 10：考情解读 papers.html
   ========================================================== */

/* ==========================================================
   真题核验页（exam-verify.html）
   ----------------------------------------------------------
   用途：抽查「抽取出来的题」和「原题」是否一致。
   两侧对照：
     左 = 抽取结果（文本 + 公式图，就是内容库里的原文）
     右 = 原卷（2022-23 有 PDF 页图；其余三套标来源文件 + 逐题核对要点）

   为什么需要这一页：公式是 MathType 对象，抽取过程必然有误差，
   人工抽查是唯一可靠的验收方式。不能自己说「抽对了」。
   ========================================================== */
function buildExamVerify() {
  const R = newRenderers();
  const C = R.math.compact;
  const TAGS = Object.keys(EXAM_FULL);
  const YEAR_LABEL = { p2021: '2021—2022', p2022: '2022—2023', p2023: '2023—2024', p2024: '2024—2025', p2025: '2025—2026' };
  /* 只有 2022-23 有 PDF，可提供原卷页图 */
  /* 有 PDF 源的两套可以给原卷页图；docx 三套没有 */
  const HAS_PAGE_IMG = { p2022: 6, p2025: 7 };

  /* 片段渲染：文本直接输出，公式图引用 assets/exam-src/<tag>/<name> */
  function renderParts(parts, tag) {
    return parts.map((p) => {
      if (p.t === 'text') return esc(p.v);
      if (p.t === 'break') return '<br>';
      if (p.t === 'img' && p.src) {
        const name = p.src.split('/').pop();
        /* 线上（GitHub Pages）不发布真题图，加载失败时显示占位而不是破图 */
        return '<span class="ev-f-wrap"><img class="ev-f" src="assets/exam-src/' + tag + '/' + name +
          '" alt="公式" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'inline\'">' +
          '<span class="ev-f-miss" style="display:none" title="本地未找到该公式图">⟨公式⟩</span></span>';
      }
      return '';
    }).join('');
  }

  const body = TAGS.map((tag) => {
    const d = EXAM_FULL[tag];
    const qs = d.questions;
    const withOpt = qs.filter((q) => q.options.length).length;
    const withImg = qs.filter((q) => q.stemParts.some((p) => p.t === 'img')).length;
    const pageCount = HAS_PAGE_IMG[tag];
    return '<section class="section" data-paper="' + tag + '">' +
      '<div class="section-head"><div class="section-head-left">' +
        '<span class="kicker">' + YEAR_LABEL[tag] + '</span>' +
        '<h2>' + d.qcount + ' 题 · 抽取核对</h2>' +
        '<span class="sub">源文件：' + esc(d.source) + '</span>' +
      '</div></div>' +

      '<div class="ev-summary">' +
        '<div class="ev-stat"><b>' + d.qcount + '</b><span>题</span></div>' +
        '<div class="ev-stat"><b>' + withOpt + '</b><span>带选项</span></div>' +
        '<div class="ev-stat"><b>' + withImg + '</b><span>含公式图</span></div>' +
        (pageCount ? '<div class="ev-stat ok"><b>' + pageCount + '</b><span>原卷页图</span></div>'
                   : '<div class="ev-stat warn"><b>—</b><span>无原卷页图</span></div>') +
      '</div>' +

      (pageCount ? '<div class="card ev-note">右栏原卷页图可逐页对照。点题号高亮该题所在页（近似定位）。</div>'
                 : '<div class="card ev-note">这套只有 docx 源文件，没有原卷页图。核对方式：对照源文件 ' + esc(d.source) + ' 逐题看题干与公式是否一致。</div>') +

      '<div class="ev-list">' + qs.map((q) => {
        const opts = q.options.length
          ? '<div class="ev-opts">' + q.options.map((o) =>
              '<div class="ev-opt"><span class="ev-key">' + esc(o.key) + '</span><span>' + renderParts(o.parts, tag) + '</span></div>'
            ).join('') + '</div>'
          : '';
        const raw = (q.rawParas || []).map((t) =>
          '<div class="ev-raw-line">' + esc(t) + '</div>').join('');
        return '<div class="ev-q" id="' + tag + '-q' + q.no + '">' +
          '<div class="ev-qhead"><span class="ev-no">' + q.no + '</span>' +
            '<span class="ev-meta">' + (q.options.length ? '选择' : '非选择') + '</span>' +
            '<span class="ev-badge">抽取结果</span></div>' +
          '<div class="ev-stem">' + renderParts(q.stemParts, tag) + '</div>' +
          opts +
          (raw ? '<details class="ev-raw"><summary>看原文（未加工）</summary>' +
            '<div class="ev-raw-box">' + raw + '</div>' +
            '<p class="ev-raw-hint">这是从 docx 直接读出的段落，公式处显示为 ⟨公式⟩。' +
            '对照上面：题干文字是否一致、选项是否拆对、公式图位置是否对。</p></details>' : '') +
          '</div>';
      }).join('') + '</div>' +

      (pageCount ? '<details class="ev-pages"><summary>展开原卷页图（' + pageCount + ' 页）</summary>' +
        '<div class="ev-pages-grid">' + Array.from({ length: pageCount }, (_, i) =>
          '<figure><img src="assets/exam-src/pages/' + tag + '-' + (i + 1) + '.png" alt="原卷第 ' + (i + 1) + ' 页" loading="lazy" onerror="this.parentNode.classList.add(\'ev-img-miss\')">' +
          '<figcaption>第 ' + (i + 1) + ' 页</figcaption></figure>'
        ).join('') + '</div></details>' : '') +
      '</section>';
  }).join('');

  const html = page({
    active: 'exam-verify.html',
    title: '真题核验',
    desc: TAGS.length + ' 套西城期末真题的抽取结果与原卷对照，用于人工抽查一致性。',
    body: '<div class="page-head">' +
      '<div class="crumb"><a href="index.html">首页</a> / 真题核验</div>' +
      '<h1>真题核验</h1>' +
      '<p class="lede">' + TAGS.length + ' 套卷共 <b>' + TAGS.reduce((a, t) => a + EXAM_FULL[t].qcount, 0) + ' 道题</b>已抽取进内容库。' +
      '这一页用来抽查：<b>抽出来的题和原卷是否一致</b>。公式是 MathType 嵌入对象（无法转文本），所以保留为图片——请重点核对公式位置与内容。</p>' +
      '</div>' + body,
    script: '',
    data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

function buildDiag() {
  const R = newRenderers();

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 学情诊断</div>
  <h1>学情诊断</h1>
  <p class="lede">按四步读：<b>一、看数据</b>（练了多少、正确率、三层各到哪）→ <b>二、判薄弱知识点</b>（最该补哪个）→ <b>三、归错因</b>（错在哪一类，决定怎么补）→ <b>四、去练</b>。</p>
</div>

<section class="section" style="margin-top:16px">
  <div class="card diag-banner">
    <h2 id="vTitle">还没有足够数据</h2>
    <p id="vText" class="desc">先做一组题，这里才有判断依据。</p>
  </div>
</section>

<section class="section">
  <div class="part-head">
    <span class="part-no">一</span>
    <div><h2>数据</h2><span class="sub">先看事实：练了多少、正确率多少、三层各到哪</span></div>
  </div>
  <div class="grid c4" id="diagMetrics" style="margin-bottom:16px"></div>

  <div class="section-head" style="margin-top:8px"><div class="section-head-left">
    <span class="kicker">三层达标</span><h2>各自离目标还差多少</h2>
    <span class="sub">熟练层 ${TIER_TARGET.l1} · 理解层 ${TIER_TARGET.l2} · 攻坚层 ${TIER_TARGET.l3}</span>
  </div></div>
  <div class="tier-grid" id="tierGrid"></div>

  <div class="grid c2" style="margin-top:16px">
    <div>
      <div class="section-head"><div class="section-head-left">
        <span class="kicker">题型</span><h2>四类题型分别错多少</h2>
        <span class="sub">单选错 → 概念/方法边界不清；计算错 → 熟练度不够</span>
      </div></div>
      <div class="card" id="qtypeCard"></div>
    </div>
    <div>
      <div class="section-head"><div class="section-head-left">
        <span class="kicker">会做但错</span><h2>收尾稳定性</h2>
        <span class="sub">不是不会，是没检查</span>
      </div></div>
      <div class="card" id="nearMissCard"></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="part-head">
    <span class="part-no">二</span>
    <div><h2>薄弱知识点</h2><span class="sub">从数据里找出最该补的，每项可直接开练</span></div>
  </div>
  <div id="weakList"></div>
</section>

<section class="section">
  <div class="part-head">
    <span class="part-no">三</span>
    <div><h2>错题归因</h2><span class="sub">这一节的每一行都来自错题本里的具体题目，不是累计统计</span></div>
  </div>
  <div class="card" id="errCard"></div>
</section>

<section class="section">
  <div class="part-head">
    <span class="part-no">四</span>
    <div><h2>错题清单与下一步</h2><span class="sub">每道错题带解析；按错因分组，每组给一个动作</span></div>
  </div>
  <div id="wrongDiag"></div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  var CH = {}; /* 分片异步加载后填充：错题清单要读题干与解析 */
  var TIER_NAME = ${JSON.stringify(TIER_NAME)};
  var TIER_TARGET = ${JSON.stringify(TIER_TARGET)};
  var ERR_NAME = { concept:'概念边界', sign:'符号错误', calc:'计算失误', method:'方法未掌握' };
  var ERR_FIX = {
    concept: '看概念卡对应那张的「差在哪个条件」',
    sign: '专门练去括号/移项的变号，连续 10 题不错再换',
    calc: '限时重复同类计算，记录「会做但错」的次数',
    method: '看方法卡的「常见误用」那段，对照自己选错的选项',
  };
  var QTYPE_NAME = { single:'单选', calc:'计算', big:'大题', judge:'判断' };
  var QTYPE_HINT = {
    single: '概念/方法边界不清 —— 看错项揭示的是哪类误解',
    calc: '熟练度不够 —— 限时重复，重点看「会做但错」',
    big: '过程写不全 —— 对照解答查每步依据',
    judge: '条件判断有偏差 —— 回到对应概念卡',
  };
  function pct(x){ return Math.round(x*100); }

  function paint(){
    var log = (Z.qLog ? Z.qLog() : null) || {};
    var st = log.stats || {};
    var byTier = st.byTier || {};
    var wrong = log.wrong || {};
    var errStats = log.errStats || {};
    var qtStats = log.qtypeStats || {};
    var nm = (Z.nearMissRate ? Z.nearMissRate() : { n:0, total:0, rate:0 });

    var totalN = 0, totalOk = 0;
    Object.keys(byTier).forEach(function(k){ totalN += byTier[k].n||0; totalOk += byTier[k].ok||0; });
    var overall = totalN ? totalOk/totalN : 0;
    var wCount = Object.keys(wrong).length;

    var vt = document.getElementById('vTitle'), vx = document.getElementById('vText');
    if (!totalN) {
      vt.textContent = '还没有足够数据';
      vx.textContent = '先做一组题，这里才有判断依据。';
    } else {
      var l1 = byTier.l1 && byTier.l1.n ? byTier.l1.ok/byTier.l1.n : null;
      var l2 = byTier.l2 && byTier.l2.n ? byTier.l2.ok/byTier.l2.n : null;
      var l3 = byTier.l3 && byTier.l3.n ? byTier.l3.ok/byTier.l3.n : null;
      var mainErr=null, mainN=0;
      Object.keys(errStats).forEach(function(k){ if((errStats[k].n||0)>mainN){ mainN=errStats[k].n; mainErr=k; } });
      var head='';
      if (l1!=null && l1<0.98) head='第一道门槛是<b>熟练层零失误</b>——现在 '+pct(l1)+'%，要求 98%。';
      else if (l2!=null && l2<0.90) head='熟练层已达标，接下来是<b>理解层</b>——现在 '+pct(l2)+'%，要求 90%。';
      else if (l3!=null && l3<0.50) head='前两层都达标，剩下<b>攻坚层</b>——现在 '+pct(l3)+'%，目标 50%。';
      else head='三层都在目标线上，接下来靠<b>限时模考</b>把稳定性坐实。';
      vt.innerHTML = head;
      vx.innerHTML = mainErr ? ('最集中的错因是 <b>'+(ERR_NAME[mainErr]||mainErr)+'</b>（'+mainN+' 次）——'+(ERR_FIX[mainErr]||'')) : '还没有错因记录，继续练。';
    }

    var dm = document.getElementById('diagMetrics');
    if (dm) {
      dm.innerHTML = [
        ['已练题数', totalN, ''],
        ['总正确率', pct(overall)+'%', ''],
        ['待复习错题', wCount, ''],
        ['会做但错', pct(nm.rate)+'%', nm.n+'/'+nm.total],
      ].map(function(x){
        return '<div class="ck-item"><b>'+x[1]+'</b><span>'+x[0]+'</span>'+(x[2]?'<i>'+x[2]+'</i>':'')+'</div>';
      }).join('');
    }

    var tg = document.getElementById('tierGrid');
    if (tg) {
      tg.innerHTML = ['l1','l2','l3'].map(function(t){
        var d = byTier[t] || { n:0, ok:0 };
        var r = d.n ? d.ok/d.n : 0;
        var target = parseFloat(TIER_TARGET[t])/100 || 0;
        var cls = r>=target ? 'ok' : (d.n?'bad':'');
        return '<div class="tier-card '+cls+'"><div class="tc-name">'+TIER_NAME[t]+'</div>'+
          '<div class="tc-rate">'+(d.n?pct(r)+'%':'—')+'</div>'+
          '<div class="tc-meta">'+(d.n?(d.ok+'/'+d.n):'未练')+' · 目标 '+TIER_TARGET[t]+'</div></div>';
      }).join('');
    }

    var nc = document.getElementById('nearMissCard');
    if (nc) {
      var nr = pct(nm.rate);
      var verdict = nr<=15 ? '收尾很稳。' : nr<=30 ? '收尾有波动，注意最后一步的符号与检验。' : '收尾不稳是当前最大问题——不是不会，是没检查。';
      nc.innerHTML = '<div class="nm-row"><div class="nm-big">'+nr+'%</div><div><b>'+nm.n+' / '+nm.total+'</b> 次「会做但错」<p class="desc" style="margin:6px 0 0;font-size:.88rem">'+verdict+'</p></div></div>';
    }

    var qc = document.getElementById('qtypeCard');
    if (qc) {
      var qk = Object.keys(qtStats).filter(function(k){ return (qtStats[k].n||0)>0; });
      if (!qk.length) {
        qc.innerHTML = '<p style="margin:0;color:var(--text-2);font-size:.9rem">还没有分题型数据。做一组题后这里显示四类题型正确率。</p>';
      } else {
        qc.innerHTML = '<div class="err-rows">'+qk.map(function(k){
          var e = qtStats[k];
          var rate = e.n ? Math.round((e.ok||0)/e.n*100) : 0;
          var cls = rate>=90 ? 'ok' : rate>=70 ? 'mid' : 'bad';
          return '<div class="err-row"><span class="err-name">'+(QTYPE_NAME[k]||k)+'</span>'+
            '<span class="err-bar-wrap"><span class="err-bar '+cls+'" style="width:'+rate+'%"></span></span>'+
            '<span class="err-n">'+rate+'% · '+(e.ok||0)+'/'+e.n+'</span></div>'+
            '<p class="desc" style="margin:-4px 0 10px;font-size:.82rem;color:var(--text-3)">→ '+(QTYPE_HINT[k]||'')+'</p>';
        }).join('')+'</div>';
      }
    }

    /* 错题归因：只用「当前还没做对的错题」，不用历史累计。
       累计统计会把已经补回来的错也算进去，学生看到的是一张
       越来越大的「历史错误账单」，但真正要处理的是现在手里这几道。
       历史累计挪到下方一行小字，保留信息但不占主位。 */
    var curErr = {};   /* 当前错题的错因分布 */
    var curByErr = {}; /* 错因 → 题目 id 列表 */
    Object.keys(wrong).forEach(function(id){
      var w = wrong[id] || {};
      var e = w.errorType || 'method';
      curErr[e] = (curErr[e] || 0) + 1;
      (curByErr[e] = curByErr[e] || []).push(id);
    });

    var ec = document.getElementById('errCard');
    if (ec) {
      var errs = Object.keys(curErr);
      if (!errs.length) {
        ec.innerHTML = '<p style="margin:0;color:var(--text-2);font-size:.9rem">' +
          '当前没有待处理的错题。答错时系统会按你选的那个错项反推错因，并在这里分组。</p>';
      } else {
        var sum = errs.reduce(function(a,k){ return a+curErr[k]; }, 0);
        errs.sort(function(a,b){ return curErr[b]-curErr[a]; });
        var rows = errs.map(function(k){
          var n = curErr[k];
          var p2 = Math.round(n/sum*100);
          return '<div class="err-row"><span class="err-name">'+(ERR_NAME[k]||k)+'</span>'+
            '<span class="err-bar-wrap"><span class="err-bar" style="width:'+p2+'%"></span></span>'+
            '<span class="err-n">'+n+' 题</span></div>'+
            '<p class="desc" style="margin:-4px 0 10px;font-size:.82rem;color:var(--text-3)">→ '+(ERR_FIX[k]||'')+'</p>';
        }).join('');
        /* 一句话结论：哪一类最多、意味着什么 */
        var top = errs[0], topN = curErr[top];
        var verdict = '';
        if (top === 'calc') verdict = '最多的是<b>计算失误</b>——不是不会，是熟练度。这类只能靠限时重复压下去，看讲解没用。';
        else if (top === 'sign') verdict = '最多的是<b>符号错误</b>——去括号、移项、乘方底数三处。这是可以专项练掉的。';
        else if (top === 'concept') verdict = '最多的是<b>概念边界</b>——定义的条件没分清。回概念卡，看「差在哪个条件」。';
        else verdict = '最多的是<b>方法未掌握</b>——没认出该用哪个工具。看方法卡的「识别信号」。';
        ec.innerHTML = '<div class="err-verdict">'+verdict+'</div>' +
          '<div class="err-rows">'+rows+'</div>' +
          '<p class="desc" style="margin:12px 0 0;font-size:.8rem;color:var(--text-3)">' +
          '历史累计（含已补回的）：' + Object.keys(errStats).filter(function(k){return errStats[k].n>0;})
            .map(function(k){ return (ERR_NAME[k]||k)+' '+errStats[k].n+' 次'; }).join(' · ') +
          '</p>';
      }
    }

    /* 四、错题清单：每题带解析，按错因分组，每组一个动作 */
    var wd = document.getElementById('wrongDiag');
    if (wd) {
      var ids = Object.keys(wrong);
      if (!ids.length) {
        wd.innerHTML = '<div class="card"><p style="margin:0;color:var(--text-2);font-size:.9rem">' +
          '还没有错题。做错的题会自动进来，并且带解析。</p></div>';
      } else {
        /* 从分片里找题（题干、答案、解析都在分片里） */
        var byId = {};
        Object.keys(CH).forEach(function(cid){
          (CH[cid].questions||[]).forEach(function(q){ byId[q.id] = q; });
        });
        var groups = {};
        ids.forEach(function(id){
          var w = wrong[id] || {};
          var e = w.errorType || 'method';
          (groups[e] = groups[e] || []).push({ id: id, w: w, q: byId[id] });
        });
        var ACTION = {
          concept: { t:'回概念卡看「差在哪个条件」', href:'learn.html' },
          sign:    { t:'练符号专项（去括号/移项）', href:'drill.html?day=4&autostart=1' },
          calc:    { t:'限时重复同类计算', href:'drill.html?day=3&autostart=1' },
          method:  { t:'看方法卡的识别信号', href:'learn.html' },
        };
        var order = Object.keys(groups).sort(function(a,b){ return groups[b].length-groups[a].length; });
        wd.innerHTML = order.map(function(e){
          var list = groups[e];
          var act = ACTION[e] || ACTION.method;
          var items = list.slice(0, 8).map(function(x){
            var q = x.q;
            if (!q) return '';
            return '<div class="wd-item">' +
              '<div class="wd-head">' +
                '<span class="wd-tag">' + (q.tierName || '') + '</span>' +
                '<span class="wd-n">错 ' + (x.w.n||1) + ' 次</span>' +
                (x.w.nearMiss ? '<span class="wd-nm">会做但错</span>' : '') +
              '</div>' +
              '<div class="wd-stem">' + (q.stemHtml || q.stem || '') + '</div>' +
              (q.qtype === 'single' && q.optionsHtml
                ? '<ol class="wb-opts">' + q.optionsHtml.map(function(o, i){
                    var on = (i === q.key) ? ' class="on"' : '';
                    return '<li' + on + '><span class="wb-opt-k">' + 'ABCD'[i] + '</span>' + o + '</li>';
                  }).join('') + '</ol>'
                : '') +
              (q.answerHtml ? '<div class="wd-ans"><b>答案</b>' + q.answerHtml + '</div>' : '') +
              (q.solutionHtml ? '<div class="wd-sol"><b>为什么</b>' + q.solutionHtml + '</div>'
                              : '<div class="wd-nosol">本题暂无解析（原卷未提供答案）</div>') +
              (q.pitfallHtml ? '<div class="wd-pit"><b>易错</b>' + q.pitfallHtml + '</div>' : '') +
            '</div>';
          }).join('');
          var more = list.length > 8
            ? '<p class="desc" style="margin:8px 0 0;font-size:.82rem;color:var(--text-3)">' +
              '还有 ' + (list.length-8) + ' 道在错题本里</p>' : '';
          return '<div class="card wd-group">' +
            '<div class="wd-group-head">' +
              '<h3>' + (ERR_NAME[e]||e) + ' · ' + list.length + ' 题</h3>' +
              '<a class="btn ghost sm" href="' + act.href + '">' + act.t + ' →</a>' +
            '</div>' +
            items + more +
            '<div class="wd-foot"><a class="btn primary sm" href="wrong.html?tab=' + e + '">去错题本处理这 ' + list.length + ' 题 →</a></div>' +
          '</div>';
        }).join('');
      }
    }

    var wl = document.getElementById('weakList');
    if (wl) {
      /* 字段名必须从 app.js 的返回结构取：
         methodWeakness 返回 { key, rate, answered, ... }——没有 name / n。
         chapterWeakness 返回 { id, name, rate, n }。
         之前两处都读 name，方法那半边永远显示 undefined。
         另外真题的 method 是 null（真题不挂方法卡），所以方法维度
         在真题库里永远是空的——这一节实际上只该列章节。 */
      var mw = (Z.methodWeakness ? Z.methodWeakness() : []) || [];
      var cw = (Z.chapterWeakness ? Z.chapterWeakness() : []) || [];
      var mName = {};
      ((window.YZ.META && window.YZ.META.methods) || []).forEach(function(m){ mName[m.id] = m.name; });
      var items = [];
      mw.slice(0,4).forEach(function(x){
        if (!x || !x.key) return;
        var nm = mName[x.key];
        if (!nm) return;                       /* 无名字的方法 id 不展示 */
        items.push({
          name: nm, rate: x.rate, n: x.answered || 0,
          go: 'drill.html?method=' + encodeURIComponent(x.key) + '&autostart=1',
          kind: '方法',
        });
      });
      /* chapterWeakness 同样返回 key / answered，不是 id / n。 */
      var cName = {};
      ((window.YZ.META && window.YZ.META.chapters) || []).forEach(function(c){ cName[c.id] = c.name; });
      cw.slice(0,3).forEach(function(x){
        if (!x || !x.key) return;
        items.push({
          name: cName[x.key] || x.key, rate: x.rate, n: x.answered || 0,
          go: 'drill.html?chapter=' + encodeURIComponent(x.key) + '&autostart=1',
          kind: '章节',
        });
      });
      if (!items.length) {
        wl.innerHTML = '<div class="card"><p style="margin:0;color:var(--text-2);font-size:.9rem">还没有足够数据判断薄弱点。做 2–3 组题后这里会排序。</p></div>';
      } else {
        wl.innerHTML = '<div class="grid c2">'+items.map(function(x){
          var r = Math.round((x.rate||0)*100);
          return '<a class="card weak-card" data-go="'+x.go+'">'+
            '<div class="wc-head"><b>'+x.name+'</b><span class="wc-kind">'+x.kind+'</span></div>'+
            '<div class="wc-rate">'+r+'%<span> · '+x.n+' 题</span></div>'+
            '<div class="wc-go">去练 →</div></a>';
        }).join('')+'</div>';
        [].forEach.call(wl.querySelectorAll('.weak-card[data-go]'), function(a){
          a.setAttribute('href', a.getAttribute('data-go'));
        });
      }
    }
  }

  /* 错题清单要读题干与解析，必须先加载分片。
     之前 diag 不加载分片，所以只能显示聚合数字——这就是
     「诊断是报告不是清单」的根因。 */
  Z.ready(function(){
    if (Z.loadAll) {
      Z.loadAll(Z.chapterIds()).then(function(all){
        CH = all || {};
        paint();
      });
    } else { paint(); }
    document.addEventListener('yz:qlog', paint);
  });
})();
`;

  const html = page({
    active: 'diag.html',
    title: '学情诊断',
    desc: '按数据 → 薄弱知识点 → 错题归因 → 下一步四步读的学情诊断，每道错题带解析。',
    body, script, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

function buildPapers() {
  const R = newRenderers();
  const CH_ORDER = ['ch-rational', 'ch-op', 'ch-expr', 'ch-poly', 'ch-eq', 'ch-geo'];
  const CAT_ORDER = ['计算', '概念', '建模', '推理', '分类', '作图', '空间', '新定义'];
  const DIFF_ORDER = ['easy', 'mid', 'hard', 'top'];

  const chMax = Math.max(...CH_ORDER.map((k) => CH_SCORE[k].avg));
  const catMax = Math.max(...CAT_ORDER.map((k) => CAT_SCORE[k].avg));
  /* 审计数据：供页面「对标审计」区块使用 */


  /* 交叉验证：逐年独立算的章节占比，与汇总平均的偏差 */
  const crossRows = CH_ORDER.map((k) => {
    const yearly = PAPER_STATS.map((st) => Math.round((st.ch[k] / st.mainTotal) * 100));
    const agg = CH_SCORE[k].pct;
    const maxDev = Math.max(...yearly.map((v) => Math.abs(v - agg)));
    return { k, name: CH_NAME[k], yearly, agg, maxDev, ok: maxDev <= 3 };
  });

  /* ==========================================================
     跨年整体分析（纵向：把三年当一个整体看）
     与「每年独立统计」互补——那里看单卷长相，这里看三年之间
     什么在变、什么没变、变的幅度多大。
     ========================================================== */
  const YEARS = PAPERS.map((p) => p.year);
  const range = (arr) => Math.max(...arr) - Math.min(...arr);

  /* ① 结构骨架：哪些东西三年完全没变 */
  const STRUCT = [
    { k: '题量', v: `${PAPERS[0].questions} 题`, same: PAPERS.every((p) => p.questions === PAPERS[0].questions) },
    { k: '考试时长', v: `${PAPERS[0].minutes} 分钟`, same: PAPERS.every((p) => p.minutes === PAPERS[0].minutes) },
    { k: '必做满分', v: `${PAPERS[0].total} 分`, same: PAPERS.every((p) => p.total === PAPERS[0].total) },
    { k: '选做满分', v: `${PAPERS[0].bonus} 分`, same: PAPERS.every((p) => p.bonus === PAPERS[0].bonus) },
    { k: '选择 / 填空 / 解答', v: '16 / 16 / 68 分', same: PAPER_STATS.every((st) => st.seg.choice === 16 && st.seg.fill === 16) },
    { k: '平均每题', v: `${PAPER_STATS[0].avgScore} 分`, same: PAPER_STATS.every((st) => st.avgScore === PAPER_STATS[0].avgScore) },
  ];

  /* ② 稳定性：只列「变化明显」的维度（极差 > 3 分）。
     满分 100 的卷子里，3 分以内属正常波动，列出来只是噪音。
     被过滤掉的维度在下方用一句话汇总，不丢信息。 */
  const RANGE_MIN = 3;

  const CH_STAB_ALL = CH_ORDER.map((k) => {
    const a = PAPER_STATS.map((st) => st.ch[k]);
    return { k, name: CH_NAME[k], a, r: range(a), mean: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) };
  }).sort((x, y) => y.r - x.r);
  const CH_STAB = CH_STAB_ALL.filter((r) => r.r > RANGE_MIN);
  const CH_STABLE = CH_STAB_ALL.filter((r) => r.r <= RANGE_MIN);

  const CAT_STAB_ALL = CAT_ORDER.map((k) => {
    const a = PAPER_STATS.map((st) => st.cat[k]);
    const mean = +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
    return { k, a, r: range(a), mean, rel: mean > 0 ? Math.round(range(a) / mean * 100) : null };
  }).sort((x, y) => y.r - x.r);
  const CAT_STAB = CAT_STAB_ALL.filter((r) => r.r > RANGE_MIN);
  const CAT_STABLE = CAT_STAB_ALL.filter((r) => r.r <= RANGE_MIN);

  /* ⑤ 核心 vs 外围：三年全考族 vs 其余 */
  const CORE = FAMILIES_SORTED.filter((f) => f.hitYears === PAPERS.length);
  const CORE_SCORE = CORE.reduce((a, f) => a + f.total, 0);
  const PERIPH_SCORE = FAMILY_MAP.reduce((a, f) => a + f.total, 0) - CORE_SCORE;
  const GRAND = PAPER_STATS.reduce((a, st) => a + st.mainTotal, 0);

  /* 点云：按章节分组，组内按分值降序。
     圆点面积与分值成正比（用 sqrt 缩放），颜色区分出现频次。 */
  const CLOUD_MAX = Math.max(...FAMILIES_SORTED.map((f) => f.total));
  const CLOUD_GROUPS = CH_ORDER.map((ch) => {
    const list = FAMILIES_SORTED.filter((f) => f.ch === ch)
      .sort((a, b) => b.total - a.total)
      .map((f) => ({
        id: f.id,
        name: f.name,
        freq: f.freq,
        total: f.total,
        avg: f.avgPerYear,
        years: f.hitYears,
        d: Math.round(14 + 30 * Math.sqrt(f.total / CLOUD_MAX)),
      }));
    return { ch, name: CH_NAME[ch], list };
  }).filter((g) => g.list.length);

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 考情解读</div>
  <h1>考情解读</h1>
  <p class="lede">${PAPERS.length} 份西城期末卷（${PAPERS.map((p) => p.year.replace('—', '–')).join('、')}）逐题拆解 ${PAPERS.reduce((a, p) => a + p.items.length, 0)} 道，按 <b>章节 → 能力 → 难度 → 考点</b> 四个维度统计，最后对比 ${PAPERS.length} 年间的变化。</p>
</div>

<!-- ========== 三、汇总：章节分值 ========== -->
<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">① 章节</span>
    <h2>各章分值</h2>
    <span class="sub">条长是 ${PAPERS.length} 年平均分值</span>
  </div></div>
  <div class="card">
    ${CH_ORDER.map((k) => {
      const d = CH_SCORE[k];
      const w = Math.round(d.avg / chMax * 100);
      return `<div class="dist-row">
        <span class="dist-name">${esc(d.name)}</span>
        <span class="dist-bar-wrap"><span class="dist-bar" style="width:${w}%"></span></span>
        <span class="dist-val">${d.avg.toFixed(1)} 分</span>
      </div>`;
    }).join('')}
  </div>

</section>

<!-- ========== 六、能力维度 ========== -->
<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">② 能力</span>
    <h2>各能力分值</h2>
    <span class="sub">计算 / 概念 / 建模 / 推理 / 分类 / 作图 / 空间 / 新定义，右侧为趋势</span>
  </div></div>
  <div class="card">
    ${CAT_ORDER.map((k) => {
      const d = CAT_SCORE[k];
      const w = Math.round(d.avg / catMax * 100);
      const trendTxt = d.trend === 'up' ? '↑ 上升' : d.trend === 'down' ? '↓ 下降' : '→ 稳定';
      return `<div class="dist-row has-trend">
        <span class="dist-name">${esc(k)}</span>
        <span class="dist-bar-wrap"><span class="dist-bar ${k === '计算' ? 'hot' : ''}" style="width:${w}%"></span></span>
        <span class="dist-val">${d.avg.toFixed(1)} 分</span>
        <span class="dist-trend ${d.trend}">${trendTxt}</span>
      </div>`;
    }).join('')}
  </div>
</section>

<!-- ========== 五、难度分析 ========== -->
<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">③ 难度</span>
    <h2>难度四级分布</h2>
    <span class="sub">按分值与题量两种口径统计</span>
  </div></div>

  <div class="card">
    <div class="kicker" style="margin-bottom:10px">分值口径（占多少分）</div>
    <div class="diff-stack">
      ${DIFF_ORDER.map((k) => {
        const d = DIFF_SCORE[k];
        return `<div class="diff-seg ${k}" style="width:${d.pct}%">
          <b>${d.pct}%</b><span>${esc(d.name)}</span>
        </div>`;
      }).join('')}
    </div>


    <div class="kicker" style="margin:18px 0 10px">题量口径（占多少题）</div>
    <div class="diff-stack">
      ${DIFF_ORDER.map((k) => {
        const d = DIFF_COUNT[k];
        return `<div class="diff-seg ${k}" style="width:${d.pct}%">
          <b>${d.pct}%</b><span>${esc(d.name)}</span>
        </div>`;
      }).join('')}
    </div>


    <div class="dual-note">难度指数（基础 1 → 压轴 4 加权）：${PAPER_STATS.map((st) => st.diffIndex).join(' · ')}</div>
    <div class="dual-note">压轴分值：${PAPER_STATS.map((st) => st.diff.top).join(' / ')} 分</div>
  </div>

</section>

<!-- ========== 考点族：按章节分组 ========== -->
<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">④ 考点</span>
    <h2>考点族与权重</h2>
    <span class="sub">圆点大小 = 分值权重，颜色 = 出现频次；悬停看具体考点</span>
  </div></div>

  <div class="card cloud-card">
    <div class="cloud-groups">
      ${CLOUD_GROUPS.map((g) => `<div class="cloud-group">
        <span class="cloud-ch">${esc(g.name)}</span>
        <span class="cloud-dots">
          ${g.list.map((f) => `<span class="cloud-dot ${f.freq}" style="--d:${f.d}px"
            data-name="${esc(f.name)}" data-total="${f.total}" data-avg="${f.avg}" data-years="${f.years}"></span>`).join('')}
        </span>
      </div>`).join('')}
    </div>
    <div class="cloud-legend">
      <span><i class="cloud-dot always" style="--d:20px"></i>年年考</span>
      <span><i class="cloud-dot often" style="--d:16px"></i>高频</span>
      <span><i class="cloud-dot rare" style="--d:13px"></i>少见</span>
      <span class="legend-sep">圆越大 = 分值越高</span>
    </div>
  </div>
  <div class="cloud-tip" id="cloudTip" role="tooltip"></div>
</section>

<!-- ========== 二点五、跨年整体分析 ========== -->
<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">⑤ 跨年对比</span>
    <h2>${PAPERS.length} 年间的变化</h2>
    <span class="sub">只列变化明显的（极差 4 分及以上）</span>
  </div></div>

  <p class="desc" style="font-size:.88rem;color:var(--text-2);margin:0 0 4px">
    结构 ${PAPERS.length} 年未变：26 题 · 100 分钟 · 100+10 分
  </p>

  <!-- 稳定性：只列变化明显的（极差超过 3 分） -->
  <div class="grid c2" style="margin-top:16px">
    <div class="card">
      <div class="kicker" style="margin-bottom:10px">章节分值变化（极差 4 分及以上）</div>
      ${CH_STAB.map((r) => `<div class="stab-row">
        <span class="stab-name">${esc(r.name)}</span>
        <span class="stab-vals">${r.a.join(' / ')}</span>
        <span class="stab-r ${r.r <= 4 ? 'mid' : 'bad'}">±${r.r}</span>
      </div>`).join('')}
      <p class="desc" style="margin-top:10px;font-size:.82rem;color:var(--text-2)">
        <span class="quiet">稳定：${CH_STABLE.map((r) => `${esc(r.name)} ±${r.r}`).join(' · ')}</span>
      </p>
    </div>
    <div class="card">
      <div class="kicker" style="margin-bottom:10px">能力分值变化（极差 4 分及以上）</div>
      ${CAT_STAB.map((r) => `<div class="stab-row">
        <span class="stab-name">${esc(r.k)}</span>
        <span class="stab-vals">${r.a.join(' / ')}</span>
        <span class="stab-r ${r.r <= 5 ? 'mid' : 'bad'}">±${r.r}</span>
      </div>`).join('')}
      <p class="desc" style="margin-top:10px;font-size:.82rem;color:var(--text-2)">
        <span class="quiet">稳定：${CAT_STABLE.map((r) => `${esc(r.k)} ±${r.r}`).join(' · ')}</span>
      </p>
    </div>
  </div>

  <!-- 核心 vs 外围 -->
  <div class="card" style="margin-top:16px">
    <div class="kicker" style="margin-bottom:10px">核心 / 外围的分数结构</div>
    <div class="core-bar">
      <div class="core-seg core" style="width:${Math.round(CORE_SCORE / GRAND * 100)}%">
        <b>${Math.round(CORE_SCORE / GRAND * 100)}%</b>
        <span>${CORE.length} 个核心族</span>
      </div>
      <div class="core-seg peri" style="width:${Math.round(PERIPH_SCORE / GRAND * 100)}%">
        <b>${Math.round(PERIPH_SCORE / GRAND * 100)}%</b>
        <span>${FAMILY_MAP.length - CORE.length} 个外围族</span>
      </div>
    </div>
    <div class="grid c2" style="margin-top:14px">
      <div>
        <b>核心族 · ${CORE.length} 个 · ${Math.round(CORE_SCORE / GRAND * 100)}%</b>
        <p class="desc" style="font-size:.84rem;margin-top:4px">${PAPERS.length} 年全部出现</p>
      </div>
      <div>
        <b>外围族 · ${FAMILY_MAP.length - CORE.length} 个 · ${Math.round(PERIPH_SCORE / GRAND * 100)}%</b>
        <p class="desc" style="font-size:.84rem;margin-top:4px">出现 ${Math.min(...FAMILY_MAP.filter((f) => f.hitYears < PAPERS.length).map((f) => f.hitYears))}–${PAPERS.length - 1} 年</p>
      </div>
    </div>
  </div>

</section>

`;

  const script = `
(function(){
  var tip = document.getElementById('cloudTip');
  if (!tip) return;
  var OFFSET = 14;           // 与光标的距离
  var lastX = 0, lastY = 0;

  /* 跟随光标：夹在视口内，靠近右/下边缘时翻到另一侧 */
  function place(x, y){
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var vw = window.innerWidth, vh = window.innerHeight;
    var left = x + OFFSET;
    var top  = y + OFFSET;
    if (left + w > vw - 8) left = x - w - OFFSET;
    if (top + h > vh - 8)  top  = y - h - OFFSET;
    tip.style.left = Math.max(8, left) + 'px';
    tip.style.top  = Math.max(8, top)  + 'px';
  }

  function show(el, x, y){
    var d = el.dataset;
    tip.innerHTML = '<b>' + d.name + '</b><span>' + d.total + ' 分 · ' + d.years + '/${PAPERS.length} 年</span>';
    tip.classList.add('on');
    place(x, y);
  }
  function hide(){ tip.classList.remove('on'); }

  [].forEach.call(document.querySelectorAll('.cloud-dots .cloud-dot'), function(el){
    el.addEventListener('mouseenter', function(e){
      lastX = e.clientX; lastY = e.clientY;
      show(el, lastX, lastY);
    });
    /* 光标在圆点上移动时提示跟着走 */
    el.addEventListener('mousemove', function(e){
      lastX = e.clientX; lastY = e.clientY;
      place(lastX, lastY);
    });
    el.addEventListener('mouseleave', hide);
    /* 键盘聚焦（无鼠标位置）时贴在圆点右下 */
    el.addEventListener('focus', function(){
      var r = el.getBoundingClientRect();
      show(el, r.right, r.bottom);
    });
    el.addEventListener('blur', hide);
  });
})();
`.replace(/PAPERS_N/g, String(PAPERS.length));

  const html = page({
    active: 'papers.html',
    title: '考情解读',
    desc: `${PAPERS.length} 份西城${SITE.exam}真题的考点族频次、分值分布、跨年对比与备考优先级。`,
    body, script, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

function buildKnow() {
  const R = newRenderers();
  const C = R.math.compact;
  const fmt = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(1));

  /* 每族的真题证据：逐年题号 / 分值 / 真题里的写法。
     这是本页唯一的「事实」来源，全部来自 TOPIC_SOURCES，不手写。 */
  const examEvidence = (fam) => {
    const rows = [];
    fam.topics.forEach((t) => {
      (TOPIC_SOURCES[t] || []).forEach((s) => {
        rows.push({ ...s, topic: t });
      });
    });
    const seen = new Set();
    return rows
      .filter((r) => { const k = r.paperId + '#' + r.no; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => (a.year === b.year ? a.no - b.no : a.year < b.year ? -1 : 1));
  };

  /* 一族的完整块 */
  const famBlock = (row, open) => {
    const fam = FAMILY_MAP.find((f) => f.id === row.id) || {};
    const k = KNOW_BY_FAMILY.get(row.id) || {};
    const a = FAMILY_ASSETS[row.id] || {};
    const ch = CH_BY_ID.get(fam.ch) || {};
    const ev = examEvidence(fam);

    /* ① 真题证据 */
    const evHtml = ev.length ? ev.map((e) => `<li>
        <span class="know-ev-y">${esc(e.year.slice(0, 4))}</span>
        <span class="know-ev-no">#${e.no}</span>
        <span class="know-ev-s">${e.score} 分</span>
        <span class="know-ev-t">${esc(e.name || e.topic)}</span>
      </li>`).join('') : '<li>本族无必做真题记录</li>';

    /* ④ 正文：规则型讲「识别 → 判定 → 反例」，过程型讲步骤骨架。
       两者同时存在时（如 f-abs-line：2 分小题讲边界，选做整题讲多步），
       规则在前、步骤在后——因为占分主体是前面那个。 */
    const hasRules = (k.rules || []).length > 0;
    const hasOrder = (k.order || []).length > 0;
    let bodyHtml = '';
    if (hasRules) {
      bodyHtml += `<div class="gsec">
        <div class="gsec-t">识别 → 判定 → 反例 · ${hasOrder ? '小题边界' : '三条就够'}</div>
        <div class="tbl-wrap"><table class="gtable know-rule-table">
          <thead><tr><th style="width:30%">题面出现什么</th><th style="width:40%">怎么判</th><th style="width:30%">反例</th></tr></thead>
          <tbody>${k.rules.map((r) => `<tr>
            <td>${C(R.math.render(r.sig || ''))}</td>
            <td>${C(R.math.render(r.judge || ''))}</td>
            <td class="know-rule-bad">${C(R.math.render(r.bad || ''))}</td>
          </tr>`).join('')}</tbody>
        </table></div>
      </div>`;
    }
    if (hasOrder) {
      bodyHtml += `<div class="gsec">
        <div class="gsec-t">步骤骨架 · 每步的采分点与最常丢在哪${hasRules ? '（多步 / 整题时用）' : ''}</div>
        <ol class="know-order">
          ${k.order.map((o, i) => `<li>
            <div class="know-order-head"><span class="know-order-no">${i + 1}</span><b>${esc(o.label)}</b></div>
            <div class="know-order-point">${C(R.math.render(o.point || ''))}</div>
            ${o.lose ? `<div class="know-order-lose"><span>最常丢</span>${C(R.math.render(o.lose))}</div>` : ''}
          </li>`).join('')}
        </ol>
      </div>`;
    }

    /* ⑤ 陷阱 */
    const trapsHtml = (k.traps || []).length ? `<div class="gsec">
      <div class="gsec-t">陷阱 · 真题里真实出现过的错法</div>
      ${k.traps.map((t) => `<div class="trap">
        <div class="trap-row bad"><span class="mark">✕</span><span>${C(R.math.render(t.bad || ''))}</span></div>
        <div class="trap-row good"><span class="mark">✓</span><span>${C(R.math.render(t.good || ''))}</span></div>
        <div class="trap-why">${C(R.math.render(t.why || ''))}</div>
      </div>`).join('')}
    </div>` : '';

    /* ⑥ 配套资产 */
    const assetBits = [];
    if (a.concepts && a.concepts.length) {
      assetBits.push(`<span class="know-asset"><b>${a.concepts.length}</b> 概念卡</span>`);
    }
    if (a.formulas && a.formulas.length) {
      assetBits.push(`<span class="know-asset"><b>${a.formulas.length}</b> 公式</span>`);
    }
    if (a.methods && a.methods.length) {
      assetBits.push(`<span class="know-asset"><b>${a.methods.length}</b> 方法卡</span>`);
    }
    if (a.ladder) assetBits.push('<span class="know-asset ladder">三级变式阶梯</span>');
    assetBits.push(`<span class="know-asset"><b>${row.qCount}</b> 站内题</span>`);

    const methodLinks = (a.methods || []).map((id) => {
      const m = M_BY_ID.get(id);
      return m ? `<a class="btn ghost sm" href="method/${id}.html">${esc(m.name)}</a>` : '';
    }).join('');
    const conceptLink = (a.concepts || []).length
      ? `<a class="btn ghost sm" href="concept.html?ch=${fam.ch}">概念卡 ${a.concepts.length} 张</a>` : '';
    const formulaLink = (a.formulas || []).length
      ? `<a class="btn ghost sm" href="graph.html">公式 ${a.formulas.length} 条</a>` : '';

    return `<details class="gcard know-fam know-${k.form || 'rule'}" id="${row.id}"${open ? ' open' : ''}>
      <summary>
        <span class="know-tier-chip ${row.tier}">${(KNOW_TIERS.find((t) => t.key === row.tier) || {}).name}</span>
        <span class="gcard-name">${esc(fam.name)}</span>
        <span class="gcard-meta">年均 ${fmt(fam.avgPerYear)} 分 · ${fam.hitYears}/${PAPERS.length} 年 · 单题最高 ${fam.maxScore} 分 · ${esc(ch.name || '')}</span>
      </summary>
      <div class="gcard-body">
        <div class="gsec">
          <div class="gsec-t">真题证据 <span class="insight-tag fact">事实</span></div>
          <ul class="know-ev">${evHtml}</ul>
        </div>

        <div class="gsec">
          <div class="gsec-t">这一族考的是 <span class="insight-tag infer">推断</span></div>
          <p class="know-core">${C(R.math.render(k.core || ''))}</p>
          <div class="know-form">
            <span class="know-form-tag">${KNOW_FORM_NAME[k.form] || '—'}</span>
            <span>${esc(KNOW_FORM_NOTE[k.form] || '')}</span>
          </div>
        </div>

        ${bodyHtml}
        ${trapsHtml}

        <div class="gsec">
          <div class="gsec-t">配套资产 · 已有的不重写</div>
          <div class="know-assets">${assetBits.join('')}</div>
          <div class="know-cta">
            <a class="btn primary sm" href="drill.html?family=${row.id}&n=10&autostart=1">去练这一族 →</a>
            ${methodLinks}
            ${conceptLink}
            ${formulaLink}
          </div>
        </div>
      </div>
    </details>`;
  };

  const tierSection = (t) => {
    const g = KNOW_STATS.byTier[t.key];
    if (!g.families) return '';
    return `<section class="section">
      <div class="section-head"><div class="section-head-left">
        <span class="kicker">${esc(t.name)}档 · ${g.families} 族 · 年均 ${fmt(g.avg)} 分（${g.pct}%）</span>
        <h2>${esc(t.note)}</h2>
      </div></div>
      ${g.rows.map((r) => famBlock(r, t.key === 'deep' && r.id === 'f-mixcalc')).join('')}
    </section>`;
  };

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 知识点讲解</div>
  <h1>知识点讲解</h1>
  <p class="lede">按<b>真题考点族</b>讲，不按章节、不按题号。理由不是偏好——
    考情解读已经算出：<b>按题号押题的一致率只有 23–42%，按考法（考点族）的一致率 52–83%</b>。
    所以这一页的组织单位和「考情解读」「今日清单」是同一个：${FAMILY_MAP.length} 个考点族。</p>
</div>

<section class="section" style="margin-top:16px">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">为什么是这一页</span>
    <h2>讲解资产原本和分值倒挂</h2>
    <span class="sub">这是本页存在的唯一理由，数字全部从代码算出</span>
  </div></div>
  <div class="grid c2">
    <div class="card know-why">
      <div class="gsec-t">原来的状态 <span class="insight-tag fact">事实</span></div>
      <p>概念卡 / 方法卡 / 公式卡三套资产<b>全部挂在章节上</b>，而考情解读和排序都用考点族。
        结果是分值最高的几族讲解最少：</p>
      <ul class="know-why-list">
        <li><b>f-construct</b> 尺规作图 · 年均 ${fmt(FAMILY_MAP.find((f) => f.id === 'f-construct').avgPerYear)} 分 · 讲解密度 <b>0.17</b>（每分年均的讲解条数）</li>
        <li><b>f-dynamic</b> 压轴分类 · 年均 ${fmt(FAMILY_MAP.find((f) => f.id === 'f-dynamic').avgPerYear)} 分 · 密度 <b>0.24</b></li>
        <li><b>f-eqconcept</b> 方程概念辨析 · 年均 ${fmt(FAMILY_MAP.find((f) => f.id === 'f-eqconcept').avgPerYear)} 分 · 密度 <b>9.0</b>（最高）</li>
      </ul>
      <p class="desc" style="font-size:.86rem">${KNOW_STATS.noAsset} 个族（合计 ${fmt(KNOW_STATS.noAssetAvg)} 分/年）<b>连一张概念卡和一条公式都没有</b>。</p>
    </div>
    <div class="card know-why">
      <div class="gsec-t">这一版的做法 <span class="insight-tag infer">推断</span></div>
      <p>三档深度，判据只用「年均分」——不用频次。理由：f-magic 年年考但年均只有 2 分，
        若按频次分档会排在 f-anglereason（年均 4.8）之前，与提分效率相反。</p>
      <div class="know-tier-rows">
        ${KNOW_TIERS.map((t) => {
          const g = KNOW_STATS.byTier[t.key];
          return `<div class="know-tier-row"><span class="know-tier-chip ${t.key}">${esc(t.name)}</span>
            <b>${g.families} 族</b><span>年均 ${fmt(g.avg)} 分 · 占 ${g.pct}%</span>
            <em>${esc(t.key === 'deep' ? '写正文：步骤骨架或判定规则 + 陷阱' : t.key === 'std' ? '写规则：识别信号 + 反例' : '只给识别信号，不写正文')}</em></div>`;
        }).join('')}
      </div>
      <p class="desc" style="font-size:.86rem">合计 ${fmt(KNOW_STATS.total)} 分/年（必然 ≈ 必做卷满分 100）。
        其中 ${KNOW_STATS.handCount} 族（${fmt(KNOW_STATS.handAvg)} 分）是本站新写正文——原本零讲解资产。</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">讲解形态由给分结构决定</span>
    <h2>大题讲步骤，小题讲反例，压轴只讲入场</h2>
    <span class="sub">同一套模板套 ${FAMILY_MAP.length} 次是错的：单题 19 分和单题 2 分的失分机制完全不同</span>
  </div></div>
  <div class="grid c3">
    ${['process', 'rule', 'entry'].map((k) => {
      const n = KNOW_STATS.rows.filter((r) => r.form === k).length;
      const avg = KNOW_STATS.rows.filter((r) => r.form === k).reduce((a, r) => a + r.avg, 0);
      /* 类名必须带 f- 前缀：全局已有 .rule 是水平分隔线（height:1px），
         直接用 ${k} 会把卡片压成一条线。 */
      return `<div class="card know-form-card f-${k}">
        <div class="kicker">${KNOW_FORM_NAME[k]}</div>
        <div class="know-form-num">${n} 族</div>
        <div class="know-form-avg">年均 ${fmt(+avg.toFixed(1))} 分</div>
        <p class="desc">${esc(KNOW_FORM_NOTE[k])}</p>
      </div>`;
    }).join('')}
  </div>
</section>

${KNOW_TIERS.map(tierSection).join('')}

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">边界</span>
    <h2>这一页支撑不了什么</h2>
  </div></div>
  <div class="card">
    <ul class="bound-list">
      <li><b>「这一族考的是」是推断，不是数据。</b>它来自该族 ${PAPERS.length} 年真题的给分结构与教材知识，
        不能像年均分那样从逐题标注里算出来。每块都标了徽章，两者不要混读。</li>
      <li><b>速览档 ${KNOW_STATS.byTier.scan.families} 族不写正文。</b>合计 ${fmt(KNOW_STATS.byTier.scan.avg)} 分/年，
        其中 f-read、f-inverse、f-geomodel、f-pos 只出现过 1–2 年——按投入产出它们不构成满分瓶颈，
        但「见过」仍然必要，所以保留识别信号与陷阱。f-read 在 2025-26 进必做位后已升到 2/5，需要单独看。</li>
      <li><b>不宣称押题。</b>讲解依据是 ${PAPERS.length} 份西城<b>区统考</b>卷的考法分布；
        本校自命题（有加试传统）可能更难，本页结论只对区统考口径成立。</li>
    </ul>
  </div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  /* 从 papers.html 的族表点进来时，目标块默认折叠（<details> 不认锚点），
     这里手动展开并滚过去。缺这一步，链接看起来"没反应"。

     必须同时挂 DOMContentLoaded 与 hashchange：
     ① 首次带 #hash 打开 → DOMContentLoaded 触发；
     ② 已在 know.html 内点另一族的锚点 → 只改 hash，浏览器不重载文档，
        DOMContentLoaded 不再触发，只有 hashchange。
     只挂前者会出现「从 A 族点 B 族，页面不展开也不滚」的静默失效。 */
  function openHash(){
    var h = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    if (!h) return;
    var el = document.getElementById(h);
    if (!el) return;
    if (el.tagName === 'DETAILS') el.open = true;
    setTimeout(function(){ el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
  }
  Z.ready(openHash);
  window.addEventListener('hashchange', openHash);
})();
`;

  const html = page({
    active: 'know.html', title: '知识点讲解',
    desc: `按 ${FAMILY_MAP.length} 个真题考点族讲解：三档深度、按给分结构分三种形态，并直接连到该族的练习。`,
    body, script, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}


/* ==========================================================
   页面 11a：槽位专项 slots.html
   满分版训练结构：按真题题号槽位组织，不按章节
   ----------------------------------------------------------
   章节训练回答「这个知识点会不会」；槽位训练回答
   「考场上这个位置能不能稳定拿分」。考场是按题号触发的。
   ========================================================== */

function buildSlots() {
  const R = newRenderers();

  /* 每个槽位的题量（按 groups 展开，去重） */
  const slotView = SLOTS.map((s) => {
    const ids = [...new Set(s.groups.flatMap((g) => g.ids))].filter((id) => Q_BY_ID.has(id));
    return { ...s, ids, qCount: ids.length };
  });

  const mainSlots = slotView.filter((s) => !s.bonus);
  const bonusSlots = slotView.filter((s) => s.bonus);

  const slotCard = (s) => `
  <div class="card slot-card" data-slot="${s.id}">
    <div class="slot-head">
      <div>
        <span class="slot-no">${esc(s.no)}</span>
        <span class="slot-score">${s.score} 分</span>
        <span class="slot-years">${s.years}/3 年</span>
      </div>
      <span class="slot-mark" data-mark="${s.id}">—</span>
    </div>
    <h3>${esc(s.name)}</h3>
    <p class="desc" style="font-size:.88rem">${esc(s.why)}</p>
    <div class="slot-rotates">
      <span class="kicker" style="font-size:.7rem">三年轮换考的题型</span>
      <ul>${s.rotates.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
    </div>
    <div class="slot-groups">
      ${s.groups.map((g) => {
        const gIds = g.ids.filter((id) => Q_BY_ID.has(id));
        return `<div class="slot-group">
          <span class="slot-group-name">${esc(g.name)}</span>
          <span class="slot-group-n">${gIds.length} 题</span>
          <a class="btn ghost sm" href="drill.html?ids=${gIds.join(',')}&mode=guided&n=${Math.max(gIds.length, 3)}&autostart=1">练这一组</a>
        </div>`;
      }).join('')}
    </div>
    <div class="trap" style="margin-top:12px">
      <div class="trap-t">怎么练</div>
      <div class="trap-why">${esc(s.drillHint)}</div>
    </div>
    <div class="trap slot-trap" style="margin-top:8px">
      <div class="trap-t">考场陷阱</div>
      <div class="trap-why">${esc(s.trap)}</div>
    </div>
    <div class="slot-actions">
      <a class="btn primary sm" href="drill.html?ids=${s.ids.join(',')}&mode=guided&n=${Math.max(s.ids.length, 3)}&autostart=1">全部 ${s.qCount} 题连练</a>
    </div>
  </div>`;

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 槽位专项</div>
  <h1>槽位专项</h1>
  <p class="lede">满分不是「多会难题」，是<b>${SLOT_STATS.cleanScore} 分零失误 + ${SLOT_STATS.mainScore} 分固定槽位 + ${SLOT_STATS.bonusScore} 分选做容错</b>。这一页只管那 ${SLOT_STATS.totalScore} 分——三年真题里位置和难度都不变的那几个题号。</p>
</div>

<section class="section" style="margin-top:16px">
  <div class="card" style="padding:20px 24px">
    <div class="kicker" style="margin-bottom:10px">满分的数学形式</div>
    <div class="slot-formula">
      <div class="slot-formula-item">
        <b>${SLOT_STATS.cleanScore}</b>
        <span>零失误区</span>
        <em>选择 1–7、填空 9–15、解答 17–22</em>
      </div>
      <span class="slot-plus">+</span>
      <div class="slot-formula-item hot">
        <b>${SLOT_STATS.mainScore}</b>
        <span>必做槽位</span>
        <em>第 8、16、23、24 题</em>
      </div>
      <span class="slot-plus">=</span>
      <div class="slot-formula-item">
        <b>100</b>
        <span>必做满分</span>
        <em>选做 ${SLOT_STATS.bonusScore} 分可吸收等量失分</em>
      </div>
    </div>
    <div class="trap" style="margin-top:16px">
      <div class="trap-t">为什么按槽位练，而不是按章节</div>
      <div class="trap-why">章节训练回答「这个知识点会不会」，槽位训练回答「考场上这个位置我能不能稳定拿分」。考场是按题号触发的——看到第 16 题就要立刻反应「幻圆，设等和列方程」。这个反应不是章节知识给的，是槽位训练给的。</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">必做卷 · ${SLOT_STATS.mainScore} 分</span>
    <h2>${mainSlots.length} 个固定槽位</h2>
    <span class="sub">三年真题里位置、分值、难度都不变——这是满分唯一需要「攻坚」的部分</span>
  </div></div>
  <div class="grid c2">${mainSlots.map(slotCard).join('')}</div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">选做 · ${SLOT_STATS.bonusScore} 分</span>
    <h2>满分的容错垫</h2>
    <span class="sub">选做不是锦上添花——它决定必做卷能丢几分。选做全对，必做允许丢 ${SLOT_STATS.bonusScore} 分</span>
  </div></div>
  <div class="grid c2">${bonusSlots.map(slotCard).join('')}</div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">达标判据</span>
    <h2>连对 3 次，不是正确率 80%</h2>
  </div></div>
  <div class="card">
    <p style="margin:0 0 10px;font-size:.92rem">考场只有一次机会。${SLOT_STATS.count} 个槽位各 80% 正确率，期望丢 <b>${(SLOT_STATS.count * 0.2).toFixed(1)}</b> 个槽位——按平均 ${Math.round(SLOT_STATS.totalScore / SLOT_STATS.count)} 分算，就是 ${Math.round(SLOT_STATS.totalScore / SLOT_STATS.count * SLOT_STATS.count * 0.2)} 分。这不是满分。</p>
    <p style="margin:0;font-size:.92rem">所以判据是<b>连对 3 次</b>：同一个槽位连续 3 次全对，才算这个位置稳定。中间错一次就重新计数。</p>
    <div class="slot-progress-row" id="slotProgressRow"></div>
  </div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">配比参照</span>
    <h2>槽位是怎么定出来的</h2>
    <span class="sub">三年真题逐题标注 → 按题号归并 → 只保留「三年都在同一位置、同一难度」的槽位</span>
  </div></div>
  <div class="card" style="overflow-x:auto">
    <table class="gtable slot-table">
      <thead><tr>
        <th>题号</th><th>分值</th><th>出现年数</th><th>难度</th><th>三年轮换的题型</th>
      </tr></thead>
      <tbody>
        ${slotView.map((s) => `<tr>
          <td><b>${esc(s.no)}</b>${s.bonus ? ' <span class="bonus-tag">选做</span>' : ''}</td>
          <td>${esc(s.scoreNote)}</td>
          <td>${s.years}/3</td>
          <td><span class="diff-tag diff-${s.diff}">${DIFF_NAME[s.diff]}</span></td>
          <td style="font-size:.82rem">${s.rotates.map(esc).join(' · ')}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <p class="desc" style="font-size:.84rem;margin-top:12px">
      完整逐题标注见 <a href="papers.html">考情解读</a>。这里的槽位只保留「题号 + 难度 + 分值三年都不变」的位置；
      位置在漂移的考点（如应用题在 21/22 题之间移动）不算固定槽位，归入零失误区。
    </p>
  </div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  var SLOT_IDS = ${JSON.stringify(slotView.map((s) => ({ id: s.id, no: s.no, name: s.name, ids: s.ids })))};

  /* 槽位稳定度：直接用 app.js 的 streakFor（基于逐题作答历史）。
     判据是「该槽位内换题连对 3 次」——换题连对说明位置稳定，
     同题连对只能说明记住了这道题。 */
  function slotStreak(ids){
    return (Z.streakFor ? Z.streakFor(ids) : { streak: 0, answered: 0 });
  }

  function paint(){
    SLOT_IDS.forEach(function(s){
      var el = document.querySelector('[data-mark="' + s.id + '"]');
      if (!el) return;
      var st = slotStreak(s.ids);
      el.classList.remove('ok', 'warn');
      if (st.streak >= 3) { el.textContent = '稳定 ' + st.streak + ' 连'; el.classList.add('ok'); }
      else if (st.answered === 0) { el.textContent = '未练'; }
      else { el.textContent = '连对 ' + st.streak + ' / 3'; el.classList.add('warn'); }
    });
    var row = document.getElementById('slotProgressRow');
    if (!row) return;
    var stable = SLOT_IDS.filter(function(s){ return slotStreak(s.ids).streak >= 3; }).length;
    row.innerHTML = '<div class="slot-prog"><b>' + stable + ' / ' + SLOT_IDS.length + '</b> 个槽位已稳定' +
      '<span class="desc" style="font-size:.84rem;margin-left:10px">' +
      (stable >= SLOT_IDS.length ? '全部稳定——现在该去练「必做 100 分模拟」验证整卷。'
        : '还有 ' + (SLOT_IDS.length - stable) + ' 个槽位没稳定，先练它们。') + '</span></div>';
  }

  Z.ready(function(){
    paint();
    document.addEventListener('yz:qlog', paint);
  });
})();
`;

  const html = page({
    active: 'slots.html', title: '槽位专项',
    desc: `满分版槽位训练：${SLOT_STATS.count} 个真题固定槽位，必做 ${SLOT_STATS.mainScore} 分 + 选做 ${SLOT_STATS.bonusScore} 分。`,
    body, script, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}


/* ==========================================================
   页面 11b：变式阶梯 ladder.html
   以真题考点族为锚点，三级递进验证是否真会
   ========================================================== */

function buildLadder() {
  const R = newRenderers();
  const C = R.math.compact;

  /* 阶梯 + 真题锚点信息 */
  const items = LADDERS.map((L) => {
    const fam = (FAMILY_MAP || []).find((f) => f.id === L.anchor) || {};
    const qs = L.levels.map((lv) => Q_BY_ID.get(lv.qid)).filter(Boolean);
    const years = fam.hitYears || 0;
    return {
      id: L.id, name: L.name, chapter: L.chapter, tier: L.tier,
      why: L.why, levels: L.levels, qs: qs.map((q) => q.id),
      anchor: L.anchor, anchorName: fam.name || '', total: fam.total || 0, years,
      chName: (CH_BY_ID.get(L.chapter) || {}).name || '',
    };
  }).sort((a, b) => b.total - a.total);

  const tierName = TIER_NAME;

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 变式阶梯</div>
  <h1>变式阶梯</h1>
  <p class="lede">每个阶梯锚定一个<b>真题考点族</b>，内含 3 道变式，难度递进：<b>改数字 → 改条件 → 逆向问</b>。三题全对才算这个考点达标——错任何一级，整条阶梯从头再来。</p>
</div>

<section class="section" style="margin-top:16px">
  <div class="card setup-card">
    <div class="setup-head">
      <h3>为什么这样判</h3>
      <span class="cockpit-sub" id="ladProgress">—</span>
    </div>
    <div class="grid c3" style="margin-top:14px">
      <div>
        <b>改数字</b>
        <p class="desc" style="font-size:.86rem">同结构换数值。验证解法是否稳定——换个数字就错，说明是背下来的，不是想明白的。</p>
      </div>
      <div>
        <b>改条件</b>
        <p class="desc" style="font-size:.86rem">换情境或加约束。验证是否理解适用条件——不知道什么时候能用，就等于不会用。</p>
      </div>
      <div>
        <b>逆向问</b>
        <p class="desc" style="font-size:.86rem">给结果求条件。验证是否掌握结构——能反着用，才是真会。</p>
      </div>
    </div>
    <div class="trap" style="margin-top:16px">
      <div class="trap-t">错一级为什么整条重置</div>
      <div class="trap-why">如果在「改条件」错了但「改数字」对，说明基础动作没问题、理解有缺口。重置不是惩罚，是防止「靠运气凑过三级」——只有三级都稳，才算这个考点不会在期末翻车。</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">按真题权重排序</span>
    <h2>${items.length} 条阶梯</h2>
    <span class="sub">分值是该考点族在 ${PAPERS.length} 份西城期末卷里的累计分——排在前面的是分值大的核心族</span>
  </div></div>
  <div class="grid c2">
    ${items.map((L) => `<div class="card ladder-card" data-ladder="${L.id}">
      <div class="lad-top">
        <span class="mcard-tier ${L.tier}">${tierName[L.tier]}</span>
        <span class="lad-score">${L.total} 分<small> / ${PAPERS.length} 年</small></span>
      </div>
      <h3>${esc(L.name)}</h3>
      <div class="lad-anchor">真题考点：${esc(L.anchorName)} · ${L.years}/${PAPERS.length} 年考</div>
      <p class="desc lad-why">${esc(L.why)}</p>
      <div class="lad-levels">
        ${L.levels.map((lv, i) => `<div class="lad-lv" data-lv="${i}">
          <span class="lad-lv-no">${i + 1}</span>
          <span class="lad-lv-name">${esc(lv.name)}</span>
          <span class="lad-lv-mark">—</span>
        </div>`).join('')}
      </div>
      <div class="lad-foot">
        <span class="lad-status">未开始</span>
        <button class="btn primary sm" data-start="${L.id}">开始</button>
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="section" id="ladStage" style="display:none">
  <div class="card">
    <div class="lad-run-head">
      <div>
        <div class="kicker" id="ladRunName">—</div>
        <div class="lad-run-lv" id="ladRunLv">—</div>
      </div>
      <button class="btn ghost sm" id="ladQuit">退出</button>
    </div>
    <div class="lad-run-track" id="ladRunTrack"></div>
    <div id="stage"></div>
  </div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">卡在哪一级</span>
    <h2>你的阶梯卡点分布</h2>
    <span class="sub">卡在「改条件」说明理解有缺口；卡在「逆向」说明结构没掌握——两者补救方式不同</span>
  </div></div>
  <div class="card" id="ladStuckCard"></div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  var META = window.YZ && window.YZ.META ? window.YZ.META : {};
  var CH = {};
  var LADS = ${JSON.stringify(items.map((L) => ({
    id: L.id, name: L.name, qs: L.qs,
    levels: L.levels.map((lv) => ({ key: lv.key, name: lv.name, note: lv.note })),
  })))};
  var cur = null, curIdx = 0, running = false;
  var QMAP = {};  /* 题 id → 题目，分片加载后填充 */

  function byId(id){ return LADS.filter(function(x){ return x.id === id; })[0]; }

  function paintCards(){
    var total = LADS.length;
    var p = Z.ladderProgress ? Z.ladderProgress(total) : { done: 0, total: total };
    var el = document.getElementById('ladProgress');
    if (el) el.textContent = '已达标 ' + p.done + ' / ' + total;

    [].forEach.call(document.querySelectorAll('[data-ladder]'), function(card){
      var id = card.getAttribute('data-ladder');
      var st = Z.ladderState ? Z.ladderState(id) : { passed: [false,false,false], done: false, stuckLevel: -1 };
      [].forEach.call(card.querySelectorAll('[data-lv]'), function(row){
        var i = parseInt(row.getAttribute('data-lv'), 10);
        var mk = row.querySelector('.lad-lv-mark');
        row.classList.remove('done', 'stuck');
        if (st.done) { row.classList.add('done'); if (mk) mk.textContent = '✓'; }
        else if (st.passed[i]) { row.classList.add('done'); if (mk) mk.textContent = '✓'; }
        else if (st.stuckLevel === i) { row.classList.add('stuck'); if (mk) mk.textContent = '卡'; }
        else if (mk) mk.textContent = '—';
      });
      var status = card.querySelector('.lad-status');
      var btn = card.querySelector('[data-start]');
      if (status) {
        if (st.done) { status.textContent = '已达标'; status.className = 'lad-status ok'; }
        else if (st.stuckLevel >= 0) { status.textContent = '卡在' + LADS.filter(function(x){return x.id===id;})[0].levels[st.stuckLevel].name; status.className = 'lad-status warn'; }
        else if ((st.passed||[]).some(Boolean)) { status.textContent = '进行中'; status.className = 'lad-status'; }
        else { status.textContent = '未开始'; status.className = 'lad-status'; }
      }
      if (btn) btn.textContent = st.done ? '再练一遍' : (st.stuckLevel >= 0 || (st.passed||[]).some(Boolean) ? '继续' : '开始');
    });

    /* 卡点分布 */
    var box = document.getElementById('ladStuckCard');
    if (box && Z.ladderStuckDist) {
      var d = Z.ladderStuckDist();
      var names = ['改数字', '改条件', '逆向问'];
      var max = Math.max.apply(null, d.concat([1]));
      if (!d.some(Boolean)) {
        box.innerHTML = '<p style="margin:0;color:var(--text-2);font-size:.9rem">还没有卡点数据。做几条阶梯后这里会显示你主要卡在哪一级。</p>';
      } else {
        box.innerHTML = '<div class="lad-stuck-rows">' + names.map(function(n, i){
          var w = Math.round(d[i] / max * 100);
          return '<div class="lad-stuck-row"><span class="lad-stuck-name">' + n + '</span>' +
            '<span class="lad-stuck-bar-wrap"><span class="lad-stuck-bar" style="width:' + w + '%"></span></span>' +
            '<span class="lad-stuck-n">' + d[i] + ' 条</span></div>';
        }).join('') + '</div>' +
        '<p class="desc" style="font-size:.86rem;margin-top:12px">' +
        (d[1] > d[0] && d[1] >= d[2] ? '主要卡在<b>改条件</b>——说明能算但不懂适用条件，建议回方法卡看「识别信号」。' :
         d[2] > d[0] && d[2] > d[1] ? '主要卡在<b>逆向问</b>——说明正向会但结构没掌握，建议做「给结果求条件」的专项。' :
         d[0] > 0 ? '主要卡在<b>改数字</b>——基础动作不稳，先回计算专项。' :
         '卡点分布比较均匀。') + '</p>';
      }
    }
  }

  function ensureDefs(){
    var CHall = window.YZ.CH || {};
    Object.keys(CHall).forEach(function(cid){
      var d = CHall[cid];
      if (!d || !d.defs) return;
      if (document.querySelector('[data-defs="' + cid + '"]')) return;
      var box = document.createElement('div');
      box.setAttribute('data-defs', cid);
      box.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      box.innerHTML = d.defs;
      document.body.appendChild(box);
    });
  }

  function paintRunTrack(){
    var track = document.getElementById('ladRunTrack');
    if (!track || !cur) return;
    var st = Z.ladderState(cur.id);
    track.innerHTML = cur.levels.map(function(lv, i){
      var cls = i === curIdx ? 'cur' : (st.passed[i] ? 'done' : '');
      return '<div class="lad-rt ' + cls + '"><span class="lad-rt-no">' + (i+1) + '</span>' +
        '<span class="lad-rt-name">' + lv.name + '</span></div>';
    }).join('<span class="lad-rt-arrow">→</span>');
  }

  function runLevel(){
    var q = QMAP[cur.qs[curIdx]];
    if (!q) { Z.toast('题目缺失'); return; }
    document.getElementById('ladRunName').textContent = cur.name;
    document.getElementById('ladRunLv').textContent =
      '第 ' + (curIdx+1) + ' / 3 级 · ' + cur.levels[curIdx].name + ' · ' + cur.levels[curIdx].note;
    paintRunTrack();
    Z.step({
      mount: '#stage',
      questions: [q],
      mode: 'guided',
      limit: 1,
      shuffle: false,
      wrongHref: 'wrong.html',
      backHref: 'ladder.html',
      backLabel: '返回阶梯',
      onAnswer: function(qq, ok, rec, errTag){
        Z.qRecord({
          id: qq.id, chapter: qq.chapter, method: qq.method, family: qq.family, tier: qq.tier, qtype: qq.qtype,
          result: rec.result, stuckStep: -1, errTag: errTag || null,
          errorType: (function(q,o,tag){ if(o)return null; if(tag)return tag; if(q.qtype==='single')return 'concept'; if(q.qtype==='calc')return 'calc'; if(q.qtype==='big')return null; return 'method'; })(qq, ok, errTag),
          timeMs: rec.timeMs, nearMiss: rec.nearMiss, src: 'ladder'
        });
        Z.bumpDay('questions', 1);

        var st = Z.ladderRecord(cur.id, curIdx, ok);
        paintCards();

        if (!ok) {
          Z.toast('卡在「' + cur.levels[curIdx].name + '」——整条阶梯从头再来');
          setTimeout(function(){
            curIdx = 0;
            if (running) runLevel();
          }, 900);
          return;
        }
        if (st && st.done) {
          Z.sfx('win');
          Z.toast('「' + cur.name + '」三级全过，达标');
          setTimeout(function(){ exitRun(); paintCards(); }, 800);
        } else {
          Z.toast('「' + cur.levels[curIdx].name + '」通过');
          setTimeout(function(){
            curIdx++;
            if (curIdx >= 3) curIdx = 0;
            if (running) runLevel();
          }, 700);
        }
      },
      onFinish: function(){}
    });
  }

  function startRun(id){
    cur = byId(id);
    if (!cur) return;
    var st = Z.ladderState(id);
    curIdx = st.done ? 0 : (st.stuckLevel >= 0 ? 0 : (st.passed[0] ? (st.passed[1] ? 2 : 1) : 0));
    running = true;
    document.getElementById('ladStage').style.display = '';
    ensureDefs();
    runLevel();
    document.getElementById('ladStage').scrollIntoView({ behavior:'smooth', block:'start' });
  }

  function exitRun(){
    running = false;
    document.getElementById('ladStage').style.display = 'none';
    paintCards();
  }

  Z.ready(function(){
    paintCards();
    document.addEventListener('yz:ladder', paintCards);
    [].forEach.call(document.querySelectorAll('[data-start]'), function(b){
      b.addEventListener('click', function(){ startRun(b.getAttribute('data-start')); });
    });
    var quit = document.getElementById('ladQuit');
    if (quit) quit.addEventListener('click', exitRun);
    Z.loadAll(Z.chapterIds()).then(function(all){
      CH = all || {};
      /* 建题 id → 题目索引 */
      QMAP = {};
      Object.keys(CH).forEach(function(cid){
        (CH[cid].questions||[]).forEach(function(q){ QMAP[q.id] = q; });
      });
    });
  });
})();
`;

  const html = page({
    active: 'ladder.html', title: '变式阶梯',
    desc: `变式阶梯：${LADDERS.length} 条阶梯锚定真题考点族，三级递进（改数字→改条件→逆向），全对才达标。`,
    body, script, useStep: true, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

/* ==========================================================
   页面 12：三阶段计划 plan.html
   ========================================================== */

function buildExam() {
  const R = newRenderers();

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 整卷模考</div>
  <h1>整卷模考</h1>
  <p class="lede">${EXAM.total} 分 / ${TOTAL_Q} 题 / ${TOTAL_MIN} 分钟。选填自动判，解答题走采分点自评。<b>报告看的是三层得分率，不是总分</b>——熟练层 &lt; ${TIER_TARGET.l1} 就回去补基础。</p>
</div>

<section class="section" style="margin-top:16px">
  <div class="card setup-card">
    <div class="setup-head">
      <h3>选一种模考</h3>
      <div class="setup-actions">
        <button class="btn primary" id="startMust">必做 ${MUST100.total} 分模拟</button>
        <button class="btn ghost" id="startBtn">整卷 ${EXAM.total}+${EXAM.bonus ? EXAM.bonus.score : 0} 分模考</button>
      </div>
    </div>
    <div class="grid c2" style="margin-top:16px">
      <div class="card exam-mode-card">
        <div class="exam-mode-tag hot">满分轨</div>
        <b>必做 ${MUST100.total} 分模拟</b>
        <p class="desc" style="font-size:.86rem">${MUST100.questions} 题 / ${MUST100.minutes} 分钟 / 不含选做。<b>只考「零失误」</b>——报告给出必做丢分，丢 ≤ ${MUST100.total - MUST100.passLine.solid} 分才算守住。</p>
      </div>
      <div class="card exam-mode-card">
        <div class="exam-mode-tag">整卷轨</div>
        <b>整卷模考</b>
        <p class="desc" style="font-size:.86rem">${TOTAL_Q} 题 / ${TOTAL_MIN} 分钟 / 含选做。考「整卷节奏」——报告看三层得分率，熟练层 &lt; ${TIER_TARGET.l1} 就回去补基础。</p>
      </div>
    </div>
    <div class="grid c3" style="margin-top:16px">
      ${EXAM.parts.map((p) => `<div><b>${esc(p.name)}</b><p class="desc" style="font-size:.86rem">${p.count} 题 · ${p.sum} 分（第 ${p.from}–${p.to} 题）${p.each ? ` · 每题 ${p.each} 分` : ''}</p></div>`).join('')}
      ${EXAM.bonus ? `<div><b>${esc(EXAM.bonus.name)}</b><p class="desc" style="font-size:.86rem">${EXAM.bonus.score} 分 · ${esc(EXAM.bonus.note)}</p></div>` : ''}
    </div>
    <div class="trap" style="margin-top:16px">
      <div class="trap-t">为什么「基础零失误」比「押中压轴」更值钱</div>
      <div class="trap-why">卷面总分封顶 ${EXAM.total} 分。必做卷丢 5 分，选做题全对也只能回到 ${EXAM.total}——丢分补不回来。所以先保 ${MUST100.total} 分必做卷的零失误，再谈选做题。</div>
    </div>
    <p class="setup-hint" style="margin-top:14px">两种模考都从题库按章节权重抽题组卷。当前题库 ${STATS.allQuestions} 题，够组 ${Math.floor(STATS.allQuestions / TOTAL_Q)} 套整卷、${Math.floor(STATS.allQuestions / MUST100.questions)} 套必做卷。</p>
  </div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">必做 ${MUST100.total} 分怎么分配</span>
    <h2>${MUST100.minutes} 分钟时间预算</h2>
    <span class="sub">满分不靠检查捞分（检查抓不到漏步骤），只靠检查抓符号错——所以最后 8 分钟只做一件事</span>
  </div></div>
  <div class="card" style="overflow-x:auto">
    <table class="gtable slot-table">
      <thead><tr><th>段落</th><th>时间</th><th>分值</th><th>要点</th></tr></thead>
      <tbody>
        ${MUST100.budget.map((b) => `<tr>
          <td><b>${esc(b.seg)}</b></td>
          <td>${b.min}′</td>
          <td>${b.score} 分</td>
          <td style="font-size:.82rem;color:var(--text-2)">${esc(b.note)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <p class="desc" style="font-size:.84rem;margin-top:12px">
      合计 ${MUST100.budget.reduce((a, b) => a + b.min, 0)} 分钟 = ${MUST100.minutes} 分钟。
      第 17 题（${MUST100.budget[1].score} 分）与第 20 题（${MUST100.budget[3].score} 分）合计 ${MUST100.budget[1].score + MUST100.budget[3].score} 分，
      是最大的时间黑洞——这两题超时，压轴就没时间了。
    </p>
  </div>
</section>

<section class="section" id="examStage" style="display:none">
  <div class="card"><div id="stage"></div></div>
</section>

<section class="section" id="reportWrap" style="display:none">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">本次报告</span><h2>三层得分率</h2>
  </div></div>
  <div class="card" id="reportCard"></div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  var CH = {}; /* 分片异步加载后填充，不能快照 window.YZ.CH */
  var META = window.YZ && window.YZ.META ? window.YZ.META : {};
  var defsSeen = {};
  function ensureDefs(){
    Object.keys(CH).forEach(function(cid){
      var d = CH[cid];
      if (d.defs && !defsSeen[cid]) { defsSeen[cid] = true; var b = document.createElement('div'); b.innerHTML = d.defs; document.body.appendChild(b.firstChild); }
    });
  }
  function collect(){
    var all = [];
    Object.keys(CH).forEach(function(cid){ (CH[cid].questions||[]).forEach(function(q){ all.push(q); }); });
    return all;
  }
  /* 必做 100 分模拟的组卷：按 MUST100.skeleton 逐位取题
     ----------------------------------------------------------
     两道关键设计（理由写在 data-slots.js）：

     ① 分值由「卷面位置」决定，不由题库标注决定。
        题库里的 score 是难度权重（2–8 分），不是卷面分值。真题是位置给分——
        第 17 题固定 18 分，不会因为某题标 7 分就变 7 分。按题库分值组卷，
        24 道随机题的总分在 95–102 浮动，「必做 100 分模拟」就名不副实。

     ② 28 个作答位而不是 24 道题。
        第 17 题 4 小问（18 分）、第 20 题 2 小问（11 分）按小问给分。
        整题判对错会让「错一个小问丢 18 分」，丢分率完全失真。

     取题策略：每位找「分值最接近 want」的题（容差 ±3），
     槽位位优先从该槽位题池取；优先错题 → 没做过 → 已熟练。 */
  var SLOT_POOLS = ${JSON.stringify(SLOTS.filter((s) => !s.bonus).map((s) => ({
    id: s.id, ids: [...new Set(s.groups.flatMap((g) => g.ids))],
  })))};

  var SKELETON = ${JSON.stringify(MUST100.skeleton)};

  function shuffle(a) {
    var x = a.slice();
    for (var i = x.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = x[i]; x[i] = x[j]; x[j] = t;
    }
    return x;
  }

  /* 组卷结果：每位一条 { pos, sub, want, q }，按卷面顺序排好 */
  function buildMust100(pool){
    var byId = {};
    pool.forEach(function(q){ byId[q.id] = q; });
    var used = {};
    var wrongMap = (Z.wrongMap && Z.wrongMap()) || {};
    var due = (Z.qDueMap && Z.qDueMap()) || {};

    var slotCands = {};
    SLOT_POOLS.forEach(function(sp){
      slotCands[sp.id] = sp.ids.map(function(id){ return byId[id]; }).filter(Boolean);
    });

    /* 优先错题（该复习）→ 没做过的 → 已熟练的 */
    function rank(q){
      var w = wrongMap[q.id] ? 2 : 0;
      var n = due[q.id] ? due[q.id].n : 0;
      return w - n + Math.random() * 0.5;
    }

    /* 就近取题：分值差 ≤3 才算匹配。
       strict=true 时只接受分值差 ≤1——槽位位必须用这个，
       否则「第 16 题」可能被塞一道 6 分题，槽位结构就失真了。 */
    function takeNear(cands, want, strict) {
      var avail = cands.filter(function(q){ return !used[q.id]; });
      if (!avail.length) return null;
      avail.sort(function(a, b){
        var da = Math.abs((a.score || 0) - want), db = Math.abs((b.score || 0) - want);
        if (da !== db) return da - db;
        return rank(b) - rank(a);
      });
      var best = avail[0];
      var tol = strict ? 1 : 3;
      if (Math.abs((best.score || 0) - want) > tol) return null;
      return best;
    }

    var mainCands = pool.slice();
    var plan = [];

    SKELETON.forEach(function(pos){
      var isSlot = !!(pos.slot && slotCands[pos.slot]);
      var cands = isSlot ? slotCands[pos.slot] : mainCands;
      /* 槽位位先严格匹配（±1 分），保证槽位结构真实 */
      var q = takeNear(cands, pos.want, isSlot);
      if (!q && isSlot) q = takeNear(cands, pos.want, false);
      if (!q && cands !== mainCands) q = takeNear(mainCands, pos.want);
      if (!q) q = takeNear(pool, pos.want);
      if (q) {
        used[q.id] = true;
        plan.push({ pos: pos.pos, sub: pos.sub || 0, want: pos.want, q: q });
      }
    });

    /* 题库不够时用主池补齐，保证每一位都在（否则卷面结构失真） */
    if (plan.length < SKELETON.length) {
      var rest = shuffle(pool.filter(function(q){ return !used[q.id]; }));
      var missing = SKELETON.filter(function(pos){
        return !plan.some(function(p){ return p.pos === pos.pos && p.sub === (pos.sub || 0); });
      });
      missing.forEach(function(pos, i){
        var q = rest[i];
        if (q) {
          used[q.id] = true;
          plan.push({ pos: pos.pos, sub: pos.sub || 0, want: pos.want, q: q });
        }
      });
    }

    plan.sort(function(a, b){
      if (a.pos !== b.pos) return a.pos - b.pos;
      return a.sub - b.sub;
    });
    return plan;
  }

  function runMust100(pool){
    ensureDefs();
    document.getElementById('examStage').style.display = '';
    var plan = buildMust100(pool);
    if (plan.length < 20) { Z.toast('题库不够组必做卷'); return; }

    var totalScore = plan.reduce(function(a, p){ return a + p.want; }, 0);
    var results = [];
    /* plan 里可能有同一道题占多个位（题库不够时），
       按位记录作答结果，题目对象单独维护，避免重复题混淆 */
    var qs = plan.map(function(p){ return p.q; });

    Z.step({
      mount: '#stage', questions: qs, mode: 'timed',
      limit: qs.length,
      shuffle: false,
      wrongHref: 'wrong.html', backHref: 'exam.html', backLabel: '重新开始',
      onAnswer: function(q, ok, rec){
        /* 该题在卷面里占的位（可能多位）——按第一个匹配位取分值 */
        var slot = null;
        for (var i = 0; i < plan.length; i++) {
          if (plan[i].q.id === q.id && !plan[i]._used) { slot = plan[i]; slot._used = true; break; }
        }
        if (!slot) slot = { pos: 0, sub: 0, want: q.score || 0 };
        results.push({
          pos: slot.pos, sub: slot.sub, want: slot.want,
          id: q.id, tier: q.tier, result: rec.result,
        });
        Z.qRecord({ id: q.id, chapter: q.chapter, method: q.method, family: q.family, tier: q.tier,
          result: rec.result, stuckStep: -1, errorType: ok ? null : 'calc',
          timeMs: rec.timeMs, nearMiss: rec.nearMiss, src: 'must100' });
        Z.bumpDay('questions', 1);
      },
      onFinish: function(res){
        /* 必做卷的判据不是得分率，是「丢了几分」——因为满分条件是
           丢分 ≤ 选做可得分（${SLOT_STATS.bonusScore} 分） */
        var lost = 0, lostItems = [], got = 0;
        results.forEach(function(r){
          if (r.result === 'right') { got += r.want; return; }
          lost += r.want;
          lostItems.push(r);
        });
        var lostPct = totalScore ? lost / totalScore : 0;
        var verdict, cls;
        if (lost === 0) { verdict = '满分。必做卷零失误——这已经是考场上的最好结果。'; cls = 'ok'; }
        else if (lost <= 2) { verdict = '只丢 ' + lost + ' 分。仍在满分容错内（选做可吸收 ${SLOT_STATS.bonusScore} 分），但已经用掉一部分安全垫。'; cls = 'ok'; }
        else if (lost <= ${SLOT_STATS.bonusScore}) { verdict = '丢 ' + lost + ' 分。选做全对刚好补回——容错垫用完了，选做不能再错。'; cls = 'warn'; }
        else { verdict = '丢 ' + lost + ' 分，超过选做能补的 ${SLOT_STATS.bonusScore} 分。卷面已经不可能到 100——问题在零失误区，不在压轴。'; cls = 'bad'; }

        var html = '<div class="must-report ' + cls + '">' +
          '<div class="must-report-head"><b>必做卷丢 ' + lost + ' 分</b>' +
          '<span class="must-report-sub">卷面满分 ' + totalScore + ' 分 · 实得 ' + got + ' 分 · 丢分率 ' + Math.round(lostPct*100) + '%</span></div>' +
          '<p class="desc" style="margin:8px 0 0;font-size:.9rem">' + verdict + '</p></div>';

        /* 按「丢分部位」分组：零失误区 vs 固定槽位
           这个区分是满分版报告的核心——两类失分的补救动作不同 */
        var SLOT_POS = ${JSON.stringify(SLOTS.filter((s) => !s.bonus).map((s) => s.no))};
        function isSlot(pos){
          if (pos === 8 || pos === 16 || pos === 23 || pos === 24) return true;
          return false;
        }
        var cleanLost = 0, slotLost = 0;
        lostItems.forEach(function(r){ if (isSlot(r.pos)) slotLost += r.want; else cleanLost += r.want; });

        if (lostItems.length) {
          html += '<div class="must-split">' +
            '<div class="must-split-item' + (cleanLost > 0 ? ' bad' : '') + '">' +
              '<b>' + cleanLost + ' 分</b><span>零失误区失分</span>' +
              '<em>' + (cleanLost > 0 ? '这是不该丢的分——补救动作是限时计算与规范检查，不是看讲解' : '守住了') + '</em></div>' +
            '<div class="must-split-item' + (slotLost > 0 ? ' warn' : '') + '">' +
              '<b>' + slotLost + ' 分</b><span>固定槽位失分</span>' +
              '<em>' + (slotLost > 0 ? '去「槽位专项」按题号练' : '守住了') + '</em></div>' +
            '</div>';

          html += '<div class="section-head" style="margin-top:20px"><div class="section-head-left">' +
            '<span class="kicker">丢分清单</span><h2>' + lostItems.length + ' 处失分</h2></div></div>';
          html += '<table class="gtable slot-table"><thead><tr><th>卷面位置</th><th>分值</th><th>区域</th><th>层级</th><th>去向</th></tr></thead><tbody>';
          lostItems.forEach(function(r){
            var posLabel = '第 ' + r.pos + ' 题' + (r.sub ? '（' + r.sub + '）' : '');
            var tierName = (META.tiers && META.tiers[r.tier]) ? META.tiers[r.tier].name : r.tier;
            html += '<tr><td>' + posLabel + '</td><td>' + r.want + ' 分</td>' +
              '<td>' + (isSlot(r.pos) ? '<b style="color:var(--gold)">槽位</b>' : '零失误区') + '</td>' +
              '<td>' + tierName + '</td>' +
              '<td><a href="drill.html?ids=' + encodeURIComponent(r.id) + '&mode=guided&n=1&autostart=1">立即重做</a></td></tr>';
          });
          html += '</tbody></table>';
          html += '<p class="desc" style="font-size:.86rem;margin-top:10px">' +
            '逐题重做比看解析有效——同一步骤再走一遍，才能确认是「会了」还是「看懂了」。</p>';
        }
        html += '<p class="desc" style="margin-top:14px;font-size:.88rem">解答题（kind=solve）不自动判分，记为待自评——请对照错题本里的完整解答自行核对。</p>';
        document.getElementById('reportCard').innerHTML = html;
        document.getElementById('reportWrap').style.display = '';
        var h2 = document.querySelector('#reportWrap .section-head h2');
        if (h2) h2.textContent = '必做卷丢分报告';
        document.getElementById('reportWrap').scrollIntoView({ behavior:'smooth', block:'start' });
      }
    });
    document.getElementById('examStage').scrollIntoView({ behavior:'smooth', block:'start' });
  }

  document.getElementById('startBtn').addEventListener('click', function(){
    Z.loadAll(Z.chapterIds()).then(function(all){ CH = all || {}; runExam(); });
  });
  document.getElementById('startMust').addEventListener('click', function(){
    Z.loadAll(Z.chapterIds()).then(function(all){ CH = all || {}; runMust100(collect()); });
  });
  function runExam(){
    var pool = collect();
    if (pool.length < 10) { Z.toast('题库还不够组卷'); return; }
    ensureDefs();
    document.getElementById('examStage').style.display = '';
    var results = [];
    Z.step({
      mount: '#stage', questions: pool, mode: 'timed',
      limit: (META.exam ? META.exam.questions : 30),
      shuffle: true,
      wrongHref: 'wrong.html', backHref: 'exam.html', backLabel: '重新开始',
      onAnswer: function(q, ok, rec){
        results.push({ id: q.id, tier: q.tier, result: rec.result });
        Z.qRecord({ id: q.id, chapter: q.chapter, method: q.method, family: q.family, tier: q.tier,
          result: rec.result, stuckStep: -1, errorType: ok ? null : 'calc', timeMs: rec.timeMs, src: 'exam' });
        Z.bumpDay('questions', 1);
      },
      onFinish: function(res){
        var byTier = { l1: {n:0,ok:0}, l2: {n:0,ok:0}, l3: {n:0,ok:0} };
        results.forEach(function(r){
          if (!byTier[r.tier]) byTier[r.tier] = { n:0, ok:0 };
          if (r.result === 'blank') return;
          byTier[r.tier].n++;
          if (r.result === 'right') byTier[r.tier].ok++;
        });
        var TIERS = META.tiers || {};
        var html = '<div class="report-rows">';
        ['l1','l2','l3'].forEach(function(t){
          var T = TIERS[t] || { name:t, target:0 };
          var o = byTier[t];
          var r = o.n ? o.ok/o.n : 0;
          var ok = r >= (T.target||0);
          html += '<div class="report-row"><span class="report-name">' + T.name + '</span>' +
            '<span class="report-rate ' + (ok?'ok':'bad') + '">' + (o.n ? Math.round(r*100) + '%' : '—') + '</span>' +
            '<span class="report-target">目标 ' + Math.round((T.target||0)*100) + '%</span>' +
            '<span class="report-n">' + o.ok + ' / ' + o.n + '</span></div>';
        });
        html += '</div>';
        html += '<p class="desc" style="margin-top:14px;font-size:.88rem">解答题（kind=solve）不自动判分，记为待自评——请对照错题本里的完整解答自行核对。</p>';
        document.getElementById('reportCard').innerHTML = html;
        document.getElementById('reportWrap').style.display = '';
        document.getElementById('reportWrap').scrollIntoView({ behavior:'smooth', block:'start' });
      }
    });
    document.getElementById('examStage').scrollIntoView({ behavior:'smooth', block:'start' });
  }
})();
`;

  const html = page({
    active: 'exam.html', title: '整卷模考',
    desc: `${SITE.exam}整卷模考：${EXAM.total} 分 / ${TOTAL_Q} 题 / ${TOTAL_MIN} 分钟，报告看三层得分率。`,
    body, script, useStep: true, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

/* ==========================================================
   页面：考情解读（真题对照模块）

   三个层次：
     ① 汇总（三年平均）——用于判断「考什么」
     ② 每年独立——用于判断「哪年不一样」
     ③ 交叉验证——逐年独立算出的占比是否与汇总一致

   两个统计口径：
     分值口径（权重）——反映「考多少分」
     题量口径（题数）——反映「考多少题」
     两者都要，因为一道 19 分的中档大题会主导分值分布，
     掩盖「题目数量上基础题其实不少」的事实。
   ========================================================== */

/* ==========================================================
   页面 12：学习 learn.html
   概念 / 公式 / 知识点，三模块一处看，每条都能进练习
   ----------------------------------------------------------
   为什么要这一页（而不是改造 concept/graph/map）：
   那三页各自是「答题器」「速查表」「掌握度环」，没有一个是
   「坐下来读一遍」的形态。学习需要的是：一条一条列出来，
   每条给足条件与误用，末尾直接进练习。

   为什么「每条都能进练习」是可行的（不是硬凑）：
   题目没有 concept/formula 字段，但有 family。而 FAMILY_ASSETS
   已把 50 张概念卡、46 条公式各恰好归入一族，27 个族又都有题。
   于是「概念 → 族 → 题」每一步都有保证，反查表在 src/index.js
   的 CONCEPT_TO_FAMILY / FORMULA_TO_FAMILY，validate 守着不漏项。

   代价是族级关联：点「练这一族」进的是该族全部题，不是「只考这张卡的
   3 道题」。页面上的这段说明已按用户要求删除（2026-11-24）。
   ========================================================== */
/* ==========================================================
   页面 12：学习 learn.html
   概念 / 公式 / 知识点，三模块 · 三级下钻 · 章内分页
   ----------------------------------------------------------
   为什么是三级下钻（模块 → 章节目录 → 章内条目）：
   139 个条目一屏铺完有 19000px 高，用户进来只看到「很长」，
   看不到「这门课有几块、我在哪」。目录层先给全貌（6 章各多少条），
   再进去看细节——这是「内容多才分页」，不是「一律分页」。

   为什么章内还要分页：知识点第 6 章 13 条、公式第 5 章 11 条，
   单章仍可能超一屏。所以章内按 8 条/页分页，条数不足 8 时不显示分页器。

   为什么条目折叠：全展开一条约 139px，一屏只看 5–6 条。折叠后
   标题 + 一行摘要约 80px，一屏 10 条以上，扫读快；要看细节点标题展开。
   摘要取「必记」第一条（概念）或公式本体（公式），不是随便截断。

   为什么「每条都能进练习」是可行的（不是硬凑）：
   题目没有 concept/formula 字段，但有 family。FAMILY_ASSETS 已把
   50 张概念卡、46 条公式各恰好归入一族，27 个族又都有题。
   反查表在 src/index.js 的 CONCEPT_TO_FAMILY / FORMULA_TO_FAMILY，
   validate.mjs 第 10 节守着不漏项、不落空池。

   代价是族级关联：点「练这一族」进的是该族全部题，不是「只考这张卡的
   3 道题」。页面上的这段说明已按用户要求删除（2026-11-24）。
   ========================================================== */
/* 把一行 TeX 转成「能在摘要里读」的纯文本。
   不是完整的 LaTeX 解析器，只覆盖初一教材里出现的符号；
   遇到表外的命令就原样保留（宁可留着 \\xxx 也不删掉造成语义错误）。 */
const TEX_SYMBOL = {
  '\\ge': '≥', '\\le': '≤', '\\ne': '≠', '\\pm': '±', '\\times': '×', '\\div': '÷',
  '\\cdot': '·', '\\circ': '°', '\\angle': '∠', '\\triangle': '△', '\\parallel': '∥',
  '\\perp': '⊥', '\\infty': '∞', '\\pi': 'π', '\\alpha': 'α', '\\beta': 'β', '\\theta': 'θ',
  '\\Rightarrow': '⇒', '\\Leftrightarrow': '⇔', '\\because': '∵', '\\therefore': '∴',
  '\\dfrac': '', '\\frac': '', '\\sqrt': '√', '\\left': '', '\\right': '', '\\,': ' ', '\\;': ' ',
};
function texToPlain(tex) {
  let out = String(tex || '');
  /* 先去掉 $ 定界符与 cases 等环境包装 */
  out = out.replace(/\$+/g, '').replace(/\\begin\{[a-z]+\}|\\end\{[a-z]+\}/g, '');
  /* 命令 → 符号（长的先匹配，避免 \\le 吃掉 \\left 的前缀） */
  Object.keys(TEX_SYMBOL).sort((a, b) => b.length - a.length)
    .forEach((cmd) => { out = out.split(cmd).join(TEX_SYMBOL[cmd]); });
  /* 花括号只做分组，去掉不影响阅读 */
  out = out.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
  return out;
}

function buildLearn() {
  const R = newRenderers();
  const C = R.math.compact;
  const esc2 = esc;

  /* 章内每页条数。8 条 × 折叠卡约 80px ≈ 640px，一屏放得下。 */
  const PER_PAGE = 8;

  const famInfo = (fid) => {
    const f = FAMILY_MAP.find((x) => x.id === fid) || {};
    const qs = Q_BY_FAMILY.get(fid) || [];
    return {
      id: fid, name: f.name || fid, qCount: qs.length,
      avg: f.avgPerYear || 0, hitYears: f.hitYears || 0,
    };
  };

  /* ---------------- 组装三个模块的数据 ----------------
     每个模块 = [{ ch, items: [...] }, ...]，章内顺序即展示顺序。 */
  const conceptGroups = CHAPTERS.map((ch) => ({
    ch,
    items: CONCEPTS.filter((c) => c.chapter === ch.id).map((c) => {
      const fid = CONCEPT_TO_FAMILY.get(c.id);
      const fam = fid ? famInfo(fid) : null;
      const tests = c.tests || [];
      const must = c.must || [];
      return {
        id: c.id,
        claimHtml: C(R.math.render(c.claim || '')),
        /* 摘要 = 必记的「可读版」：把 TeX 命令换成对应符号，而不是删掉。
           为什么要替换而不是删除：直接删 \\ge 会得到 |a|0（失真且比原文更糟）；
           而渲染成 SVG 又会在摘要和正文各出一份，多占约 60KB。
           所以做一张最小符号表——只覆盖初一实际用到的命令。 */
        briefText: must.length ? texToPlain(must[0]) : '',
        mustHtml: must.map((m) => C(R.math.render(m))),
        nTest: tests.length,
        nTrap: tests.filter((t) => t.lv === 3).length,
        fam,
        testHref: `drill.html?qtype=concept&chapter=${ch.id}&n=${tests.length}&autostart=1`,
        drillHref: fam ? `drill.html?family=${fam.id}&n=8&autostart=1` : '',
      };
    }),
  })).filter((g) => g.items.length);

  const formulaGroups = CHAPTERS.map((ch) => ({
    ch,
    items: FORMULAS.filter((f) => f.chapter === ch.id).map((f) => {
      const fid = FORMULA_TO_FAMILY.get(f.name);
      const fam = fid ? famInfo(fid) : null;
      return {
        name: f.name,
        nameHtml: C(R.math.render(f.name)),
        /* 摘要：用 TeX 源码文本，不渲染 SVG。
           公式在摘要和正文各渲染一次会让 learn.html 多出一倍 SVG 体积
           （实测 305KB → 只此一处就占约 60KB），而摘要只要「能认出是哪条」。 */
        briefText: '适用：' + String(f.cond || '').replace(/^\$|\$/g, ''),
        texHtml: C(R.math.render(f.tex)),
        condHtml: C(R.math.render(f.cond)),
        misuseHtml: C(R.math.render(f.misuse)),
        fam,
        drillHref: fam ? `drill.html?family=${fam.id}&n=8&autostart=1` : '',
      };
    }),
  })).filter((g) => g.items.length);

  /* 知识点按「章 + 考点」记录（43 条）。有 1 个考点跨两章，
     必须各归各章，否则会有一章漏项。
     排序：先按出现年数、再按分值——只按分值会把「14 分/2 年」
     排在「12 分/5 年」前面，与「先练年年考的」相反。 */
  const topicGroups = CHAPTERS.map((ch) => ({
    ch,
    items: Object.entries(TOPIC_MAP)
      .filter(([k]) => k.split('|')[0] === ch.id)
      .map(([, t]) => {
        const fid = FAMILY_DEFS.find((f) => f.topics.includes(t.topic))?.id;
        const fam = fid ? famInfo(fid) : null;
        const nos = [...new Set((t.nos || []).map((n) => n.split('#')[1]))].sort((a, b) => a - b);
        return {
          topic: t.topic,
          topicHtml: C(R.math.render(t.topic)),
          briefHtml: `${t.total} 分 · ${t.hitYears}/${PAPERS.length} 年`,
          total: t.total, hitYears: t.hitYears,
          slots: nos.map((n) => '#' + n).join(' / '),
          fam,
          drillHref: fam ? `drill.html?family=${fam.id}&n=8&autostart=1` : '',
        };
      })
      .sort((a, b) => (b.hitYears - a.hitYears) || (b.total - a.total)),
  })).filter((g) => g.items.length);

  /* ---------------- 渲染：一个条目（折叠卡） ---------------- */
  const itemHtml = (mod, it) => {
    if (mod === 'concept') {
      return `<details class="learn-item" data-ch="" data-fam="${it.fam ? it.fam.id : ''}">
  <summary>
    <span class="li-title">${it.claimHtml}</span>
    <span class="li-brief">${esc2(it.briefText)}</span>
    <span class="li-badge">${it.nTest} 判断${it.nTrap ? ` · ${it.nTrap} 陷阱` : ''}</span>
  </summary>
  <div class="li-body">
    ${it.mustHtml.length ? `<div class="li-row"><span class="li-k">必记</span><div class="li-must">${it.mustHtml.map((m) => `<span>${m}</span>`).join('')}</div></div>` : ''}
    ${it.fam ? `<div class="li-row"><span class="li-k">属族</span><div>${esc2(it.fam.name)} <span class="li-fam-q">${it.fam.qCount} 题</span></div></div>` : ''}
    <div class="li-cta">
      <a class="btn primary sm" href="${it.testHref}">测这张卡（${it.nTest} 个判断）</a>
      ${it.drillHref ? `<a class="btn ghost sm" href="${it.drillHref}">练这一族 ${it.fam.qCount} 题 →</a>` : ''}
    </div>
  </div>
</details>`;
    }
    if (mod === 'formula') {
      return `<details class="learn-item" data-fam="${it.fam ? it.fam.id : ''}">
  <summary>
    <span class="li-title">${it.nameHtml}</span>
    <span class="li-brief li-tex-inline">${esc2(it.briefText)}</span>
  </summary>
  <div class="li-body">
    <div class="li-tex">${it.texHtml}</div>
    <div class="li-row"><span class="li-k">适用条件</span><div>${it.condHtml}</div></div>
    <div class="li-row li-bad"><span class="li-k">常见误用</span><div>${it.misuseHtml}</div></div>
    ${it.fam ? `<div class="li-row"><span class="li-k">属族</span><div>${esc2(it.fam.name)} <span class="li-fam-q">${it.fam.qCount} 题</span></div></div>` : ''}
    <div class="li-cta">
      ${it.drillHref ? `<a class="btn primary sm" href="${it.drillHref}">练这一族 ${it.fam.qCount} 题 →</a>` : ''}
    </div>
  </div>
</details>`;
    }
    return `<details class="learn-item" data-fam="${it.fam ? it.fam.id : ''}">
  <summary>
    <span class="li-title">${it.topicHtml}</span>
    <span class="li-brief">${esc2(it.briefHtml)}</span>
  </summary>
  <div class="li-body">
    ${it.slots ? `<div class="li-row"><span class="li-k">题位</span><div class="li-mono">${esc2(it.slots)}</div></div>` : ''}
    ${it.fam ? `<div class="li-row"><span class="li-k">属族</span><div>${esc2(it.fam.name)} <span class="li-fam-q">${it.fam.qCount} 题</span></div></div>` : ''}
    <div class="li-cta">
      ${it.drillHref ? `<a class="btn primary sm" href="${it.drillHref}">练这一族 ${it.fam.qCount} 题 →</a>` : ''}
    </div>
  </div>
</details>`;
  };

  /* ---------------- 渲染：一个模块的全部内容 ----------------
     结构：目录层（6 张章卡）+ 每章一个详情层（章内分页）。
     详情层默认隐藏，JS 控制显示哪个。 */
  const moduleHtml = (mod, groups) => {
    const total = groups.reduce((a, g) => a + g.items.length, 0);

    const toc = `<div class="learn-toc">
  ${groups.map((g) => `<button class="toc-card" data-go="${g.ch.id}">
    <span class="toc-no">${g.ch.no}</span>
    <b>${esc2(g.ch.name)}</b>
    <span class="toc-n">${g.items.length} 条</span>
    <span class="toc-go">查看 →</span>
  </button>`).join('')}
</div>`;

    const chapters = groups.map((g) => {
      const pages = Math.ceil(g.items.length / PER_PAGE);
      /* 章内所有条目一次渲染进 DOM，JS 按页显隐。
         为什么不构建期切页：切页会丢展开状态，且返回时滚动位置全乱。 */
      const items = g.items.map((it, i) => {
        const h = itemHtml(mod, it);
        const page = Math.floor(i / PER_PAGE);
        return h.replace('<details class="learn-item"',
          `<details class="learn-item" data-page="${page}"`);
      }).join('');

      const pager = pages > 1 ? `<div class="pager" data-pager="${g.ch.id}">
        <button data-pg="prev" disabled>‹ 上一页</button>
        ${Array.from({ length: pages }, (_, i) => `<button data-pg="${i}"${i === 0 ? ' class="on"' : ''}>${i + 1}</button>`).join('')}
        <button data-pg="next"${pages === 1 ? ' disabled' : ''}>下一页 ›</button>
      </div>` : '';

      return `<div class="learn-chapter" data-chapter="${g.ch.id}" style="display:none">
  <div class="learn-crumb">
    <button class="crumb-back" data-back="1">← 返回目录</button>
    <span class="crumb-sep">/</span>
    <span class="crumb-ch">第 ${g.ch.no} 章 ${esc2(g.ch.name)}</span>
    <span class="crumb-n">${g.items.length} 条${pages > 1 ? ` · ${pages} 页` : ''}</span>
  </div>
  <div class="learn-items" data-items="${g.ch.id}">${items}</div>
  ${pager}
</div>`;
    }).join('');

    return `<div class="learn-mod" data-mod="${mod}" data-total="${total}">
  ${toc}
  ${chapters}
</div>`;
  };

  const mods = [
    { key: 'concept', html: moduleHtml('concept', conceptGroups), n: CONCEPTS.length },
    { key: 'formula', html: moduleHtml('formula', formulaGroups), n: FORMULAS.length },
    { key: 'topic', html: moduleHtml('topic', topicGroups), n: Object.keys(TOPIC_MAP).length },
  ];

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 知识复习</div>
  <h1>知识复习</h1>
  <p class="lede">三块材料一处看：<b>概念</b>（要记什么条件）、<b>公式</b>（什么时候能用）、
    <b>知识点</b>（真题考过什么）。选模块 → 选章 → 看条目，<b>每条都能直接进练习</b>。</p>
</div>

<section class="section" style="margin-top:16px">
  <div class="learn-tabs" id="learnTabs">
    ${LEARN_MODULES.map((m, i) => `<button class="learn-tab${i === 0 ? ' on' : ''}" data-mod="${m.key}">
      <b>${esc2(m.name)}</b><span>${m.count} ${esc2(m.unit)}</span></button>`).join('')}
  </div>
  <div class="learn-note" id="learnNote">${esc2(LEARN_MODULES[0].note)}</div>
</section>

<section class="section">
  <div id="learnBody">
    ${mods.map((m, i) => m.html.replace('class="learn-mod"', `class="learn-mod${i === 0 ? ' on' : ''}"`)).join('')}
  </div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">口径</span>
    <h2>「练这一族」进的是什么</h2>
  </div></div>
  <div class="card">
    <ul class="bound-list">
      <li><b>关联是族级的，不是逐题精确的。</b>每张概念卡、每条公式都归属一个考点族，
        「练这一族 N 题」进的是该族<b>全部</b>题，不是「只考这张卡的几道题」。
        为什么不做到逐题：那需要给 ${STATS.allQuestions} 道题逐题标注它考了哪张卡，
        标错会让人点进不相关的题，比族级更糟。</li>
      <li><b>知识点模块用的是真题考点，不是教材目录。</b>来自 ${PAPERS.length} 份西城区统考卷的逐题标注，
        分值是 ${PAPERS.length} 年累计分。教材目录与真题考法不完全一一对应，两边都保留才看得出差异。</li>
      <li><b>不宣称押题。</b>分值高说明过去 ${PAPERS.length} 年反复考，不保证明年还考同一个样子。</li>
    </ul>
  </div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  var PER_PAGE = ${PER_PAGE};
  var state = { mod: 'concept', ch: null, page: 0 };

  function modEl(key){ return document.querySelector('.learn-mod[data-mod="' + key + '"]'); }

  /* 渲染当前状态：模块 → 章节 → 页 */
  function apply(){
    /* 模块 */
    [].forEach.call(document.querySelectorAll('.learn-mod'), function(el){
      el.classList.toggle('on', el.getAttribute('data-mod') === state.mod);
    });
    [].forEach.call(document.querySelectorAll('.learn-tab'), function(b){
      b.classList.toggle('on', b.getAttribute('data-mod') === state.mod);
    });
    /* 说明文字 */
    var notes = ${JSON.stringify(LEARN_MODULES.map((m) => m.note))};
    var keys = ${JSON.stringify(LEARN_MODULES.map((m) => m.key))};
    var noteEl = document.getElementById('learnNote');
    if (noteEl) noteEl.innerHTML = notes[keys.indexOf(state.mod)] || '';

    var wrap = modEl(state.mod);
    if (!wrap) return;

    /* 目录 vs 章内：state.ch 为 null 显示目录 */
    var toc = wrap.querySelector('.learn-toc');
    var chapters = wrap.querySelectorAll('.learn-chapter');
    if (toc) toc.style.display = state.ch ? 'none' : '';
    [].forEach.call(chapters, function(el){
      el.style.display = (el.getAttribute('data-chapter') === state.ch) ? '' : 'none';
    });
    if (!state.ch) return;

    /* 章内分页 */
    var items = wrap.querySelectorAll('.learn-chapter[data-chapter="' + state.ch + '"] .learn-item');
    [].forEach.call(items, function(it){
      it.style.display = (+it.getAttribute('data-page') === state.page) ? '' : 'none';
    });
    var pager = wrap.querySelector('.pager[data-pager="' + state.ch + '"]');
    if (pager) {
      var pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
      [].forEach.call(pager.querySelectorAll('button'), function(b){
        var v = b.getAttribute('data-pg');
        if (v === 'prev') b.disabled = state.page <= 0;
        else if (v === 'next') b.disabled = state.page >= pages - 1;
        else b.classList.toggle('on', +v === state.page);
      });
    }
  }

  function goChapter(cid){
    state.ch = cid; state.page = 0; apply();
    var wrap = modEl(state.mod);
    if (wrap) {
      var el = wrap.querySelector('.learn-crumb');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  function backToc(){ state.ch = null; state.page = 0; apply(); }

  Z.ready(function(){
    [].forEach.call(document.querySelectorAll('.learn-tab'), function(b){
      b.addEventListener('click', function(){
        state.mod = b.getAttribute('data-mod');
        state.ch = null; state.page = 0;   /* 换模块回到目录 */
        apply();
      });
    });
    /* 事件委托：目录卡 / 返回 / 分页都在动态显示的区域里 */
    document.addEventListener('click', function(e){
      var go = e.target.closest('[data-go]');
      if (go) { goChapter(go.getAttribute('data-go')); return; }
      var back = e.target.closest('[data-back]');
      if (back) { backToc(); return; }
      var pg = e.target.closest('[data-pg]');
      if (pg && !pg.disabled) {
        var wrap = pg.closest('.learn-mod');
        var cid = pg.closest('.pager').getAttribute('data-pager');
        var n = wrap.querySelectorAll('.learn-chapter[data-chapter="' + cid + '"] .learn-item').length;
        var pages = Math.max(1, Math.ceil(n / PER_PAGE));
        var v = pg.getAttribute('data-pg');
        if (v === 'prev') state.page = Math.max(0, state.page - 1);
        else if (v === 'next') state.page = Math.min(pages - 1, state.page + 1);
        else state.page = +v;
        apply();
      }
    });
    /* 带 hash 进来：#formula / #topic 选中模块 */
    var h = (location.hash || '').replace('#', '');
    if (${JSON.stringify(LEARN_MODULES.map((m) => m.key))}.indexOf(h) >= 0) state.mod = h;
    apply();
  });
})();
`;

  const html = page({
    active: 'learn.html', title: '知识复习',
    desc: `概念 ${CONCEPTS.length} 张、公式 ${FORMULAS.length} 条、真题知识点 ${Object.keys(TOPIC_MAP).length} 个，按章分页浏览，每条都能直接进练习。`,
    body, script, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

function buildGraph() {
  const R = newRenderers();
  const C = R.math.compact;
  const byCh = new Map();
  FORMULAS.forEach((f) => {
    if (!byCh.has(f.chapter)) byCh.set(f.chapter, []);
    byCh.get(f.chapter).push(f);
  });

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 公式法则库</div>
  <h1>公式法则库</h1>
  <p class="lede">每条都带<b>适用条件</b>与<b>常见误用</b>。初一失分多数不是记不住公式，是条件不满足还硬套——所以第三列比第一列更重要。</p>
</div>

<section class="section" style="margin-top:16px">
  <div class="toolbar">
    <div class="chips" id="fgTabs">
      <button class="chip on" data-c="all">全部 ${FORMULAS.length}</button>
      ${CHAPTERS.filter((c) => byCh.has(c.id)).map((c) => `<button class="chip" data-c="${c.id}">${esc(c.name)} ${byCh.get(c.id).length}</button>`).join('')}
    </div>
    <div class="toolbar-right"><input class="search" id="fgSearch" placeholder="搜索公式、条件、误用…"></div>
  </div>
  <div class="tbl-wrap">
    <table class="gtable">
      <thead><tr><th style="width:22%">公式 / 法则</th><th style="width:30%">内容</th><th style="width:22%">适用条件</th><th style="width:26%">常见误用</th></tr></thead>
      <tbody id="fgBody"></tbody>
    </table>
  </div>
</section>
`;

  const DATA = FORMULAS.map((f) => {
    const ch = CH_BY_ID.get(f.chapter) || {};
    return {
      ch: f.chapter, chName: ch.name || '',
      name: f.name,
      tex: C(R.math.render(f.tex)),
      cond: C(R.math.render(f.cond)),
      misuse: C(R.math.render(f.misuse)),
      search: (f.name + ' ' + f.tex + ' ' + f.cond + ' ' + f.misuse + ' ' + (ch.name || '')).replace(/\s+/g, '').toLowerCase(),
    };
  });

  const script = `
(function(){
  var ALL = ${JSON.stringify(DATA)};
  var cur = 'all', q = '';
  function render(){
    var list = ALL.filter(function(f){
      if (cur !== 'all' && f.ch !== cur) return false;
      if (q && f.search.indexOf(q) < 0) return false;
      return true;
    });
    var body = document.getElementById('fgBody');
    if (!list.length) { body.innerHTML = '<tr><td colspan="4" class="empty">没有匹配的条目</td></tr>'; return; }
    body.innerHTML = list.map(function(f){
      return '<tr><td><b>' + f.name + '</b><br><span class="fg-ch">' + f.chName + '</span></td>' +
        '<td>' + f.tex + '</td>' +
        '<td class="fg-cond">' + f.cond + '</td>' +
        '<td class="fg-misuse">' + f.misuse + '</td></tr>';
    }).join('');
  }
  window.YZ.ready(function(){
    [].forEach.call(document.querySelectorAll('[data-c]'), function(b){
      b.addEventListener('click', function(){
        [].forEach.call(document.querySelectorAll('[data-c]'), function(x){ x.classList.remove('on'); });
        b.classList.add('on'); cur = b.getAttribute('data-c'); render();
      });
    });
    var s = document.getElementById('fgSearch');
    s.addEventListener('input', function(){ q = s.value.trim().toLowerCase().replace(/\s+/g,''); render(); });
    render();
  });
})();
`;

  const html = page({
    active: 'graph.html', title: '公式法则库',
    desc: `${SITE.exam}公式法则库：${STATS.formulas} 条，每条带适用条件与常见误用。`,
    body, script, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

/* ==========================================================
   页面 11b：知识点讲解 know.html（已停用，2026-11-24 按用户要求删除）
   按真题「考点族」讲，不按章节
   ----------------------------------------------------------
   为什么建这一页，而不是继续扩概念卡/方法卡/公式卡：
   那三套资产都挂在「章节」上，而考情解读已经算出
     题位一致率 23–42%  vs  考点族一致率 52–83%
   即「按考法备考有效，按题号/题干备考无效」。
   但考情解读给出「某族 4.8 分/年」之后，站内没有一处能落到
   「这一族到底该怎么学」——概念卡讲条件、方法卡讲识别信号、
   公式卡讲适用条件，三者都按章节分散，谁也回答不了整族的问题。

   这一页的排序不是按分值，是按「提分效率」（考情解读 §5.3 的口径）：
   深讲档 = 年均 ≥4 分（9 族 72% 分值），标准档 2–4 分，
   速览档 <2 分只给识别信号、不写正文。
   讲解形态也不是统一模板，而是由真题的给分结构决定（见 data-know.js 头注释）：
   大题讲步骤骨架、小题讲识别与反例、压轴只讲入场动作。
   ========================================================== */

/* ==========================================================
   页面：10 天冲刺 sprint.html

   这是全站的主入口（2026-11-25 改）。
   之前站点按「知识点」组织——学生打开后要自己想「今天练什么」。
   改成按「第几天」组织：每天一个明确任务，做完打勾，第 10 天整卷验收。

   为什么是 10 天而不是「按知识点排列」：
     冲刺期最稀缺的不是题，是「今天该做什么」这个决定。
     把决定替学生做完，他才把时间花在练上。

   每天的任务是真题切片，不是原创模拟题：
     5 套西城卷 × 26 题 = 130 题，全部有出处。
     学生练的每一题都能在「真题核验」页查到原卷。
   ========================================================== */
function buildSprint() {
  const R = newRenderers();

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 冲刺计划</div>
  <h1>10 天冲刺</h1>
  <p class="lede">
    期末前 10 天，把 ${PAPERS.length} 套西城真题拆成 10 个任务，一天一组，做完打勾。
    顺序不是随意的：<b>先送分区（选择填空 32 分），再中档区，最后压轴</b>——
    熟练层没稳住之前练压轴，等于在漏水的桶里加水。
    第 9 天专做错题，第 10 天整卷限时。
  </p>
</div>

<section class="section" style="margin-top:18px">
  <div class="card sprint-status" id="sprintStatus"></div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">按顺序做，不要跳</span>
    <h2>第 1–10 天</h2>
    <span class="sub">每天一个任务 · 点「开始」直接出题 · 做完自动记完成度</span>
  </div></div>
  <div id="sprintList"></div>
</section>

<section class="section">
  <div class="card" style="padding:18px 22px">
    <h3 style="margin:0 0 10px">为什么这么排</h3>
    <div class="grid c2" style="gap:16px">
      <div>
        <b>第 1–3 天：选择 + 填空（32 分）</b>
        <p class="desc" style="font-size:.87rem">这两块全是熟练层。冲满分的前提是这 32 分零失误——
        错一道 2 分，比压轴丢分更亏，因为它本来是最该拿到的。</p>
      </div>
      <div>
        <b>第 4–6 天：解答题 17–22</b>
        <p class="desc" style="font-size:.87rem">第 17 题单题 17–20 分（4 小问），是全卷最大单题。
        这里稳不住，满分无望；但题型固定，练 5 套就能摸清套路。</p>
      </div>
      <div>
        <b>第 7–8 天：压轴 23–26</b>
        <p class="desc" style="font-size:.87rem">目标是<b>拿到前两问</b>，不是满分。
        压轴题是整题给分，没有「答一半给一半」——所以只求入场分。</p>
      </div>
      <div>
        <b>第 9–10 天：错题 + 整卷</b>
        <p class="desc" style="font-size:.87rem">错过的不再做对，练了也白练。
        最后一天限时 100 分钟，检验的是时间分配——这才是考场上真正丢分的地方。</p>
      </div>
    </div>
    <div class="sprint-trace">
      <span>这个顺序不是估的：</span>
      <a href="papers.html">考情解读（逐年分值分布与考点频次）</a>
      <span>·</span>
      <a href="exam-verify.html">真题核验（每道题的原卷出处）</a>
    </div>
  </div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  var META = (window.YZ && window.YZ.META) || {};
  var DAYS = META.sprint || [];
  var KIND = { choice:'选择', fill:'填空', solve:'解答', redo:'错题重做', full:'整卷' };

  /* 完成度口径：某天「完成」= 该天所有题都作答过（不论对错）。
     不要求全对——全对是达标，不是完成。这两件事混在一起
     会让学生不敢往前推，卡在第 1 天反复做。 */
  function dayStats(day){
    var qlog = (Z.qLog && Z.qLog()) || {};
    var seen = {};
    (qlog.recent || []).forEach(function(r){ seen[r.id] = true; });
    var ids = day.ids || [];
    /* 第 9 天（错题重做）的题在运行时才知道，不能预计算 */
    if (day.kind === 'redo') {
      var wm0 = (Z.wrongMap && Z.wrongMap()) || {};
      ids = Object.keys(wm0);
    }
    var done = 0, right = 0;
    var wm = (Z.wrongMap && Z.wrongMap()) || {};
    ids.forEach(function(id){
      if (seen[id]) done++;
      if (seen[id] && !wm[id]) right++;
    });
    return { total: ids.length, done: done, right: right, ids: ids };
  }

  function escH(x){
    return String(x == null ? '' : x).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function paint(){
    var box = document.getElementById('sprintStatus');
    var list = document.getElementById('sprintList');
    if (!DAYS.length) {
      box.innerHTML = '<p style="margin:0;color:var(--text-2)">计划数据未加载，请重新构建。</p>';
      return;
    }

    /* 顶部状态：下一个该做的任务。
       分母用「唯一题数」不是「各天题数之和」——
       第 10 天整卷的 26 题前面都练过，按天相加会算成 156，
       而题库只有 130 题。分母虚高会让进度永远到不了 100%。 */
    var nextDay = null, doneDays = 0, doneQ = 0;
    var uniq = {};
    DAYS.forEach(function(d){
      var st = dayStats(d);
      st.ids.forEach(function(id){ uniq[id] = true; });
      doneQ += st.done;
      var finished = st.total > 0 && st.done >= st.total;
      if (finished) doneDays++;
      else if (nextDay === null) nextDay = { d: d, st: st };
    });
    var totalQ = Object.keys(uniq).length;

    var pct = totalQ ? Math.round(doneQ / totalQ * 100) : 0;
    var head = '';
    if (nextDay) {
      var nd = nextDay.d, nst = nextDay.st;
      var left = nst.total - nst.done;
      head = '<div class="sprint-next">' +
        '<div class="sprint-next-k">下一个任务</div>' +
        '<div class="sprint-next-t">第 ' + nd.day + ' 天 · ' + escH(nd.title) + '</div>' +
        '<div class="sprint-next-g">' + escH(nd.goal) + '</div>' +
        '<div class="sprint-next-m">' + (left > 0
          ? '还剩 ' + left + ' 题 · 约 ' + nd.minutes + ' 分钟'
          : '还没开始 · 约 ' + nd.minutes + ' 分钟') + '</div>' +
        '<a class="btn primary" href="drill.html?day=' + nd.day + '&autostart=1">开始第 ' + nd.day + ' 天 →</a>' +
        '</div>';
    } else {
      head = '<div class="sprint-next sprint-done">' +
        '<div class="sprint-next-k">全部完成</div>' +
        '<div class="sprint-next-t">10 天任务做完了</div>' +
        '<div class="sprint-next-g">最后一步：把错题本清零，然后限时再做一次整卷确认节奏。</div>' +
        '<a class="btn primary" href="wrong.html">去清错题 →</a>' +
        '</div>';
    }
    head += '<div class="sprint-bar-wrap">' +
      '<div class="sprint-bar"><div class="sprint-bar-in" style="width:' + pct + '%"></div></div>' +
      '<div class="sprint-bar-meta"><b>' + Math.min(doneQ, totalQ) + ' / ' + totalQ + '</b> 题已作答 · ' +
      doneDays + ' / ' + DAYS.length + ' 天完成</div>' +
      '</div>';
    box.innerHTML = head;

    /* 10 天列表 */
    list.innerHTML = DAYS.map(function(d){
      var st = dayStats(d);
      var finished = st.total > 0 && st.done >= st.total;
      var started = st.done > 0;
      var cls = finished ? 'done' : (started ? 'doing' : '');
      var stateTxt = finished
        ? '✓ 完成 · 对 ' + st.right + '/' + st.total
        : (started ? '进行中 ' + st.done + '/' + st.total : (st.total ? st.total + ' 题' : '待定'));

      var meta = [];
      if (d.paperCount > 1) meta.push(d.paperCount + ' 套卷');
      if (d.paperCount === 1) meta.push('整卷');
      meta.push(d.minutes + ' 分钟');
      if (d.kind === 'redo') meta.push('按当前错题数动态出题');

      return '<div class="card sprint-day ' + cls + '" data-day="' + d.day + '">' +
        '<div class="sd-left">' +
          '<div class="sd-num">' + d.day + '</div>' +
          '<div class="sd-kind">' + (KIND[d.kind] || d.kind) + '</div>' +
        '</div>' +
        '<div class="sd-main">' +
          '<div class="sd-head">' +
            '<h3>' + escH(d.title) + '</h3>' +
            '<span class="sd-state">' + stateTxt + '</span>' +
          '</div>' +
          '<p class="sd-goal">' + escH(d.goal) + '</p>' +
          '<p class="sd-why">' + escH(d.why) + '</p>' +
          '<div class="sd-foot">' +
            '<span class="sd-meta">' + meta.join(' · ') + '</span>' +
            '<a class="btn ' + (finished ? 'ghost' : 'primary') + ' sm" href="drill.html?day=' + d.day +
              (finished ? '' : '&autostart=1') + '">' +
              (finished ? '重做' : (started ? '继续 →' : '开始 →')) + '</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  Z.ready(function(){
    paint();
    document.addEventListener('yz:qlog', paint);
  });
})();
`;

  const html = page({
    base: '', active: 'sprint.html', title: '10 天冲刺',
    desc: '期末前 10 天，把 5 套西城真题拆成 10 个任务，一天一组。先送分区，再中档区，最后压轴。',
    body, script, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

function buildPlan() {
  const R = newRenderers();

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 三阶段计划</div>
  <h1>三阶段计划</h1>
  <p class="lede">不是「学完再复习」，是<b>双轨并行</b>：当天新课巩固 + 旧章滚动复习。每天先做轨 A（课堂刚讲、遗忘曲线最陡），再做轨 B。</p>
</div>

<section class="section" style="margin-top:16px">
  <div class="card" style="padding:18px 22px">
    <div class="kicker" style="margin-bottom:8px">期末倒计时</div>
    <div class="countdown-row">
      <div class="countdown-big" id="cdBig">—</div>
      <div>
        <p class="desc" style="margin:0" id="cdText">设置期末考试日期，这里显示剩余天数与所处阶段。</p>
        <button class="btn ghost sm" id="setDate" style="margin-top:8px">设置日期</button>
      </div>
    </div>
  </div>
</section>

${PHASES.map((p, i) => `<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">第 ${p.weeks[0]}–${p.weeks[1]} 周</span>
    <h2>${esc(p.name)}</h2>
    <span class="sub">目标：${esc(p.goal)}</span>
  </div></div>
  <div class="grid c2">
    <div class="card phase-card">
      <div class="phase-tag">轨 A · 新课</div>
      <p>${esc(p.trackA)}</p>
    </div>
    <div class="card phase-card">
      <div class="phase-tag">轨 B · 复习</div>
      <p>${esc(p.trackB)}</p>
    </div>
  </div>
</section>`).join('')}

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">每日 ${DAILY.total} 分钟</span><h2>四段怎么分配</h2>
  </div></div>
  <div class="card">
    <div class="grid c4">
      ${DAILY.blocks.map((b, i) => `<div><b>${i + 1}. ${esc(b.name)}</b><p class="desc" style="font-size:.86rem">${b.minutes} 分钟 · ${esc(b.desc)}</p></div>`).join('')}
    </div>
    <p class="desc" style="margin-top:14px;font-size:.88rem">时间不够时优先砍「主题」段，<b>不要砍计算和错题</b>。</p>
  </div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">卷面口径</span><h2>两套模板，同一份知识清单</h2>
    <span class="sub">西城期末是「区级样卷 + 学校自主命题」的混合模式，名校常在区卷基础上加难或加附加题</span>
  </div></div>
  <div class="grid c2">
    <div class="card phase-card">
      <div class="phase-tag">主轨 · 西城区卷</div>
      <p><b>${EXAM.questions} 题 · ${EXAM.total} 分 · ${EXAM.minutes} 分钟</b></p>
      <p class="desc" style="font-size:.86rem">
        选择 ${EXAM.parts[0].count}×${EXAM.parts[0].each} + 填空 ${EXAM.parts[1].count}×${EXAM.parts[1].each} + 解答 ${EXAM.parts[2].sum} 分。
        ${EXAM.bonus ? `第四大题选做 ${EXAM.bonus.score} 分，${esc(EXAM.bonus.note)}。` : ''}
      </p>
      <p class="desc" style="font-size:.82rem;color:var(--gold);margin-top:8px">卷面封顶 100 → 基础题零失误优先于压轴</p>
    </div>
    <div class="card phase-card">
      <div class="phase-tag">副轨 · 校自命题（备用）</div>
      <p><b>27 题 + 3 道附加题 · 100 + 20 分</b></p>
      <p class="desc" style="font-size:.86rem">
        本校有加试传统（2019 期中为 100+20 / 27 题 + 3 附加题 / 100 分钟）。
        题量大于区卷，压轴向 A 层 / P 层水平对齐。
      </p>
      <p class="desc" style="font-size:.82rem;color:var(--text-3);margin-top:8px">注：这是期中证据，期末是否仍为 100+20 待向学校确认</p>
    </div>
  </div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  function paint(){
    var left = Z.daysLeft ? Z.daysLeft() : null;
    var big = document.getElementById('cdBig'), txt = document.getElementById('cdText');
    if (left == null) { if(big) big.textContent = '—'; return; }
    if (left < 0) { if(big) big.textContent = '已过'; if(txt) txt.textContent = '期末已过，或日期设置有误。'; return; }
    if (big) big.textContent = left + ' 天';
    var phase = left > 35 ? '筑基' : left > 14 ? '攻坚' : '冲刺';
    if (txt) txt.textContent = '距期末 ' + left + ' 天 · 当前应在「' + phase + '」阶段';
  }
  Z.ready(function(){
    paint();
    document.addEventListener('yz:profile', paint);
    var b = document.getElementById('setDate');
    if (b) b.addEventListener('click', function(){
      var cur = (Z.profile() || {}).examDate || '';
      var v = window.prompt('期末考试日期（格式 2027-01-13）', cur || '2027-01-13');
      if (v) { Z.saveProfile({ examDate: v }); paint(); Z.toast('已保存'); }
    });
  });
})();
`;

  const html = page({
    active: 'plan.html', title: '三阶段计划',
    desc: '三阶段双轨计划：筑基、攻坚、冲刺，与期末倒计时联动。',
    body, script, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

/* ==========================================================
   页面 11：整卷模考 exam.html
   ========================================================== */

function buildContent() {
  const R = newRenderers();

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 内容说明</div>
  <h1>内容与口径说明</h1>
  <p class="lede">这个站做了什么、没做什么、判分边界在哪——写清楚，避免「什么都包了」的错觉。</p>
</div>

<section class="section" style="margin-top:20px">
  <div class="card" style="padding:22px 24px">
    <h3>当前规模</h3>
    <p class="desc">面向 ${esc(SITE.school)} ${esc(SITE.exam)}。内容按人教版 2024 新版章节组织，方法卡按「识别信号」编排；做错的题自动进错题本并按六类错因归类；学情诊断把记录聚合成三层达标度、薄弱单元与可执行清单。</p>
    <div class="grid c4" style="margin-top:16px">
      <div><b>${STATS.chapters}</b><br><span style="color:var(--text-2);font-size:.86rem">章节</span></div>
      <div><b>${STATS.methods}</b><br><span style="color:var(--text-2);font-size:.86rem">方法卡</span></div>
      <div><b>${STATS.allQuestions}</b><br><span style="color:var(--text-2);font-size:.86rem">题目（含 ${STATS.calcQuestions} 计算）</span></div>
      <div><b>${STATS.concepts}</b><br><span style="color:var(--text-2);font-size:.86rem">概念卡（${STATS.conceptTests} 判断）</span></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">卷面口径</span><h2>按哪套卷练</h2>
    <span class="sub">西城期末为「区级样卷 + 学校自主命题」混合模式</span>
  </div></div>
  <div class="tbl-wrap">
    <table class="gtable">
      <thead><tr><th style="width:20%">口径</th><th style="width:26%">结构</th><th>用途</th></tr></thead>
      <tbody>
        <tr>
          <td><b>西城区卷（主轨）</b></td>
          <td>${EXAM.questions} 题 · ${EXAM.total} 分 · ${EXAM.minutes} 分钟<br>选择 ${EXAM.parts[0].count}×${EXAM.parts[0].each} / 填空 ${EXAM.parts[1].count}×${EXAM.parts[1].each} / 解答 ${EXAM.parts[2].sum} 分${EXAM.bonus ? ` / 选做 ${EXAM.bonus.score} 分` : ''}</td>
          <td>模考按此组卷。卷面封顶 ${EXAM.total} 分，基础零失误优先</td>
        </tr>
        <tr>
          <td><b>校自命题（副轨）</b></td>
          <td>27 题 + 3 道附加题 · 100 + 20 分</td>
          <td>本校加试传统。题量更大，压轴更难（待确认期末现状）</td>
        </tr>
        <tr>
          <td>期中校卷</td>
          <td>10 选择 + 10 填空 + 10 解答 · ${EXAM.total} 分</td>
          <td>校内《期中复习指导说明》原文口径，与期末不同，仅作参照</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">判分边界</span><h2>哪些能自动判，哪些不能</h2>
  </div></div>
  <div class="tbl-wrap">
    <table class="gtable">
      <thead><tr><th style="width:24%">题型</th><th style="width:18%">能否自动判</th><th>做法</th></tr></thead>
      <tbody>
        <tr><td>选择题</td><td style="color:var(--ok)">✓ 可以</td><td>选项构建期渲染，答案精确匹配</td></tr>
        <tr><td>数值填空</td><td style="color:var(--ok)">✓ 可以</td><td>规范化后比对；数值型允许分数与小数互通</td></tr>
        <tr><td>分步计算</td><td style="color:var(--ok)">✓ 可以</td><td>把解方程拆成 5 步，每步只判一个中间结果——初一的计算路径唯一，所以能判到步</td></tr>
        <tr><td>化简结果</td><td style="color:var(--gold)">⚠ 有限</td><td>不做通用代数等价；改成「从 4 个等价形式里选」，干扰项本身就是教学素材</td></tr>
        <tr><td>解答题</td><td style="color:var(--rose)">✗ 不自动判</td><td>走采分点自评：给步骤骨架，你勾哪一步写全了；系统记「最常丢分的步骤」</td></tr>
      </tbody>
    </table>
  </div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">已知限制</span><h2>这一版明确不做的</h2>
  </div></div>
  <div class="grid c2">
    <div class="trap"><div class="trap-t">不做解答题自动批改</div>
      <div class="trap-why">几何证明与开放性解答无法可靠机器判分。错判比不判更伤信任，所以改走自评。</div></div>
    <div class="trap"><div class="trap-t">不接符号计算库</div>
      <div class="trap-why">与「纯静态、断网可开、无 CDN」的硬约束冲突，且引入难以验证的依赖。</div></div>
    <div class="trap"><div class="trap-t">不做动态几何</div>
      <div class="trap-why">图形在构建期渲染成静态 SVG，不做滑块拖拽。数轴动点用「分步 + 多情形」表达。</div></div>
    <div class="trap"><div class="trap-t">不宣称押题</div>
      <div class="trap-why">题目按校内命题范围与课标编写，风格贴近本校卷，但不宣称命中具体题目。</div></div>
    <div class="trap"><div class="trap-t">不追求覆盖全部考点</div>
      <div class="trap-why">理科题目无穷变式。本站标的是「每章权重与当前题量」，不标「已覆盖」。 </div></div>
    <div class="trap"><div class="trap-t">不做「背公式」主线</div>
      <div class="trap-why">公式库带「适用条件 + 常见误用」两列，考的是条件而不是背诵。</div></div>
  </div>
</section>

<section class="section">
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">档案</span><h2>学习记录与备份</h2>
  </div></div>
  <div class="card">
    <p class="desc">学习记录存在浏览器 localStorage（<code>yz-</code> 前缀）。换设备或换浏览器时，用下面的导出/导入迁移。</p>
    <div class="report-actions" style="margin-top:14px">
      <button class="btn primary" id="exportBtn">导出档案</button>
      <label class="btn ghost" style="cursor:pointer">导入档案<input type="file" id="importFile" accept="application/json" style="display:none"></label>
      <button class="btn ghost" id="resetBtn" style="margin-left:auto;color:var(--rose)">清空全部记录</button>
    </div>
  </div>
</section>
`;

  const script = `
(function(){
  var Z = window.YZ;
  Z.ready(function(){
    var e = document.getElementById('exportBtn');
    if (e) e.addEventListener('click', function(){ Z.exportArchive(); });
    var f = document.getElementById('importFile');
    if (f) f.addEventListener('change', function(){
      var file = f.files && f.files[0];
      if (!file) return;
      var r = new FileReader();
      r.onload = function(){ Z.importArchive(r.result); };
      r.readAsText(file);
    });
    var rb = document.getElementById('resetBtn');
    if (rb) rb.addEventListener('click', function(){
      if (window.confirm('确定清空全部学习记录？此操作不可撤销。')) { Z.qReset(); Z.toast('已清空'); }
    });
  });
})();
`;

  const html = page({
    active: '', title: '内容与口径说明',
    desc: '本站做了什么、没做什么、判分边界在哪。',
    body, script, data: ['meta'],
  });
  return html.replace('<body data-base="">', '<body data-base="">' + R.math.defs());
}

/* ==========================================================
   主流程
   ========================================================== */
function main() {
  const t0 = Date.now();
  if (existsSync(join(OUT, 'dist'))) rmSync(join(OUT, 'dist'), { recursive: true, force: true });

  const shard = emitShards();

  /* 页面分两档：
     ① 核心理念页（始终生成）：题目 + 知识点讲解 + 诊断
        （know.html 已停用：用户认为从使用视角看没有意义）
     ② 真题对标页：map 章节页 + papers 考情解读
        —— 这两页是「站内内容是否对得上真题」的验收界面，不能缺
     仍停用（函数与数据保留，把条目加回本数组即可恢复）：
       today（今日清单，已按用户要求删除页面）、calc（计算专项）、
       ladder（变式阶梯）、slots（槽位专项）、exam（整卷模考）、content（内容说明）。

     ⚠ 这个数组曾被静默截断多次（9 项 → 7 项 → 5 项）：构建照样打印「成功」，
     但页数从 39 掉到 5，校验报一堆「死链 → concept.html」。
     改完后必须核对：node build-site.mjs | grep 页面，应为 39。 */
  /* 任务列表 = 全站页面清单。
     每次改动都要保持完整——历史上这里被截断过两次，导致 half the site 不生成。
     validate.mjs 有一条「产物存在性」检查会兜住这类回归。 */
  const tasks = [
    ['home', () => emit('index.html', buildHome())],
    ['sprint', () => emit('sprint.html', buildSprint())],
    ['drill', () => emit('drill.html', buildDrill())],
    ['wrong', () => emit('wrong.html', buildWrong())],
    ['diag', () => emit('diag.html', buildDiag())],
    ['learn', () => emit('learn.html', buildLearn())],
    ['papers', () => emit('papers.html', buildPapers())],
    ['examverify', () => emit('exam-verify.html', buildExamVerify())],

    /* ===== 以下页面已按用户要求从构建移除（2026-11-25）=====
       口径：全站逻辑改为「10 天冲刺」后，这些页面不再属于主路径。
       源文件、数据与生成函数全部保留，加回一行即可恢复：

       ['today',   () => emit('today.html', buildToday())],    今日清单 → 由 sprint 取代
       ['calc',    () => emit('calc.html', buildCalc())],      计算专项 → drill 已覆盖
       ['concept', () => emit('concept.html', buildConcept())], 概念自测 → drill 的 qtype 已覆盖
       ['method',  () => { emit('method.html', buildMethodIndex());
                           METHODS.forEach((m) => emit(`method/${m.id}.html`, buildMethodCard(m))); }],
       ['map',     () => { emit('map.html', buildMap());
                           CHAPTERS.forEach((c) => emit(`map/${c.id}.html`, buildChapter(c))); }],
       ['slots',   () => emit('slots.html', buildSlots())],    槽位专项 → 冲刺计划已按题位分组
       ['exam',    () => emit('exam.html', buildExam())],      随机整卷 → 第 10 天用真题整卷
       ['plan',    () => emit('plan.html', buildPlan())],      三阶段计划 → 冲刺计划取代
       ['graph',   () => emit('graph.html', buildGraph())],    公式库 → 无入口，纯查阅
       ['content', () => emit('content.html', buildContent())], 口径说明 → 低频
       ['ladder',  () => emit('ladder.html', buildLadder())],  变式阶梯 → 真题无变式题，早已断链
       ['know',    () => emit('know.html', buildKnow())],      知识点讲解 → 用户判定无意义
    */
  ];

  tasks.forEach(([k, fn]) => { if (want(k)) fn(); });

  const ms = Date.now() - t0;

  console.log(`\n=== 构建完成 ===`);
  console.log(`  页面：${report.pages.length}`);
  console.log(`  耗时：${ms} ms`);
  console.log(`  分片：${(shard.shardBytes / 1024).toFixed(1)} KB`);
  console.log(`  公式失败：${report.mathFailures.length}`);
  console.log(`  图形失败：${report.figFailures.length}`);

  /* 体积预算（只列实际会构建的页面；已停用页面的条目没有意义） */
  const budget = {
    'index.html': 200 * 1024,
    'drill.html': 400 * 1024,
    'method.html': 400 * 1024,
  };
  let over = 0;
  Object.entries(budget).forEach(([p, lim]) => {
    if (report.bytes[p] && report.bytes[p] > lim) {
      console.log(`  ⚠ 超出体积预算：${p} ${(report.bytes[p] / 1024).toFixed(1)} KB > ${lim / 1024} KB`);
      over++;
    }
  });
  if (!over) console.log('  ✓ 体积预算达标');

  writeFileSync(join(OUT, 'build-report.json'), JSON.stringify({
    at: new Date().toISOString(), ms,
    pages: report.pages.length,
    bytes: report.bytes,
    mathFailures: report.mathFailures,
    figFailures: report.figFailures,
    shardBytes: shard.shardBytes,
  }, null, 2));

  if (report.mathFailures.length) {
    console.log('\n公式失败明细：');
    report.mathFailures.slice(0, 10).forEach((f) => console.log('  · ' + f.tex + ' → ' + f.err));
  }
  if (report.figFailures.length) {
    console.log('\n图形失败明细：');
    report.figFailures.slice(0, 10).forEach((f) => console.log('  · ' + JSON.stringify(f)));
  }

  process.exit(report.mathFailures.length || report.figFailures.length ? 1 : 0);
}

main();
