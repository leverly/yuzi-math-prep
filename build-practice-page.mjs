#!/usr/bin/env node
// 练习页构建器：答题 + 自动判分 + 学情数据
// 独立产物 practice.html，数据内联（无外部请求，file:// 可直开）
import { writeFileSync, readFileSync } from 'node:fs';

import { BANK, FAM_META, SOLUTIONS } from './practice-data.mjs';
import { FAMILY_MAP } from './work/papers/stats.mjs';
import { CH_NAME, CAT_ORDER, CH_ORDER } from './work/papers/ledger.mjs';
import { TOKENS, HEAD_CSS, PAGEHEAD_CSS, headerHtml, ROUND_SIZE, THEME_INIT, THEME_SCRIPT } from './work/site-shell.mjs';
import { CHART_CSS, barBlock } from './work/charts.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* 题库按族分组，供页面做筛选 */
const famList = Object.keys(FAM_META).map((id) => ({
  id,
  name: FAM_META[id].name,
  avg: FAM_META[id].avgPerYear,
  n: BANK.filter((q) => q.fam === id).length,
})).sort((a, b) => b.avg - a.avg);

const totalQ = BANK.length;

/* 每个能力的年均分（各族 avgPerYear 按 cat 累加）——诊断排序用 */
const FAM_CAT_SCORE = (() => {
  const m = {};
  for (const f of FAMILY_MAP) m[f.cat] = (m[f.cat] || 0) + (f.avgPerYear || 0);
  for (const k of Object.keys(m)) m[k] = +m[k].toFixed(1);
  return m;
})();
const choiceN = BANK.filter((q) => q.options).length;
const calcN = totalQ - choiceN;

// 设计变量 / 顶栏 / 页头排版来自 work/site-shell.mjs（全站唯一来源）
const CSS = TOKENS + HEAD_CSS + PAGEHEAD_CSS + CHART_CSS + `
/* 练习页局部：沿用旧变量名，避免改一堆组件 */
:root{ --shadow:var(--shadow-2); }
body{padding-bottom:80px}

/* 页头（h1 / .lede 排版来自 site-shell 的 PAGEHEAD_CSS，此处不再重复定义） */
.head{padding:38px 0 22px}

/* 诊断入口 */
.intro{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
  padding:26px 28px;box-shadow:var(--shadow);margin-bottom:20px}
.intro-eyebrow{font-family:var(--mono);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;
  color:var(--accent);font-weight:600;margin-bottom:10px}
.intro-title{font-size:23px;font-weight:780;letter-spacing:-.02em;margin-bottom:10px}
.intro-desc{font-size:14px;color:var(--text-2);line-height:1.75;max-width:640px}
.plan{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0 22px}
.plan-item{background:var(--surface-2);border:1px solid var(--border);
  border-radius:11px;padding:13px 15px}
.plan-k{font-family:var(--mono);font-size:11px;color:var(--text-3);margin-bottom:5px}
.plan-n{font-size:14.5px;font-weight:700;line-height:1.4}
.plan-v{font-size:12px;color:var(--accent);font-weight:650;margin-top:5px}
.plan-item{min-width:0}
@media(max-width:680px){.plan{grid-template-columns:1fr 1fr}}
.intro-actions{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.intro-hint{font-size:12.5px;color:var(--text-3)}

/* 设置条 */
.setup{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
  padding:18px 20px;box-shadow:var(--shadow);margin-bottom:20px}
.setup-row{display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
.setup-row:last-child{margin-bottom:0}
.setup-label{font-size:13px;font-weight:650;color:var(--text-2);min-width:64px}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{padding:5px 12px;border-radius:var(--r-pill);border:1px solid var(--border);
  background:var(--surface);font-size:13px;cursor:pointer;transition:.15s;color:var(--text-2)}
.chip:hover{border-color:var(--accent);color:var(--accent)}
.chip.on{background:var(--accent);color:#fff;border-color:var(--accent);font-weight:650}
.btn{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:11px;
  font-size:14.5px;font-weight:650;border:1px solid var(--border);background:var(--surface);
  color:var(--text);cursor:pointer;transition:.15s;box-shadow:var(--shadow);font-family:inherit}
.btn:hover{transform:translateY(-1px)}
.btn.primary{background:var(--accent-grad);color:#fff;border-color:transparent;
  box-shadow:0 10px 26px -8px rgba(37,99,235,.36)}
.btn.ghost{box-shadow:none;background:transparent}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none}

/* 进度 */
.progress{display:flex;align-items:center;gap:12px;margin-bottom:16px;font-size:13px;color:var(--text-3)}
.pbar{flex:1;height:6px;background:var(--track);border-radius:3px;overflow:hidden}
.pbar i{display:block;height:100%;background:var(--accent-grad);border-radius:3px;transition:width .3s}

/* 题目卡 */
.q-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
  padding:24px;box-shadow:var(--shadow)}
.q-meta{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:14px}
.tag{font-size:11.5px;font-weight:650;padding:2.5px 8px;border-radius:6px}
.tag.fam{background:var(--accent-soft);color:var(--accent)}
.tag.easy{background:var(--ok-soft);color:var(--ok)}
.tag.mid{background:var(--accent-soft);color:var(--accent)}
.tag.hard{background:var(--gold-soft);color:var(--gold)}
.tag.seg{background:var(--seg-bg);color:var(--seg-fg)}
.q-no{font-family:var(--mono);font-size:12px;color:var(--text-3);margin-left:auto}
.q-stem{font-size:16.5px;line-height:1.85;margin-bottom:20px;font-weight:500}

/* 题干配图 */
.q-fig{margin:4px 0 18px;padding:14px;background:var(--surface-2);
  border:1px solid var(--border);border-radius:10px}

/* 选项配图（四个展开图并排） */
.opt-fig{padding:12px 14px}
.opt-figbox{flex:1;display:block}
.opt-figbox svg{max-width:150px!important}

/* 竖式分数 */
.frac{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;
  font-family:var(--mono);font-size:.86em;line-height:1.15;margin:0 2px;position:relative;top:-1px}
.frac .fn{border-bottom:1px solid currentColor;padding:0 3px;white-space:nowrap}
.frac .fd{padding:0 3px}
/* 负分数：负号绝对定位到分数线左侧、与分数线同一高度
 * （.frac 是纵向 flex，::before 若参与布局会被挤到分子上方） */
.frac.frac-neg .fn{padding-left:0}
.frac.frac-neg{padding-left:9px}
.frac.frac-neg::before{content:"−";position:absolute;left:0;top:50%;
  transform:translateY(-50%);font-weight:700;font-size:1em;line-height:1}

/* 选项 */
.opts{display:flex;flex-direction:column;gap:9px}
.opt{display:flex;align-items:flex-start;gap:11px;padding:12px 15px;border:1px solid var(--border);
  border-radius:11px;cursor:pointer;transition:.15s;background:var(--surface)}
.opt:hover{border-color:var(--accent);background:var(--accent-soft)}
.opt.picked{border-color:var(--accent);background:var(--accent-soft);font-weight:600}
.opt.right{border-color:var(--ok);background:var(--ok-soft)}
.opt.wrong{border-color:var(--rose);background:var(--rose-soft)}
.opt-k{font-family:var(--mono);font-weight:700;color:var(--text-3);flex:none;width:18px}
.opt.picked .opt-k{color:var(--accent)}
.opt.right .opt-k{color:var(--ok)}
.opt.wrong .opt-k{color:var(--rose)}

/* 填空 */
.fill{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.fill input{flex:1;min-width:180px;padding:12px 15px;border:1px solid var(--border);border-radius:11px;
  font-size:16px;font-family:var(--mono);background:var(--surface);color:var(--text)}
.fill input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.fill .unit{font-size:15px;color:var(--text-3);font-weight:600}

/* 反馈 */
.fb{margin-top:16px;padding:14px 18px;border-radius:11px;font-size:14px;line-height:1.75}
.fb.ok{background:var(--ok-soft);border-left:3px solid var(--ok);color:#065f46}
.fb.no{background:var(--rose-soft);border-left:3px solid var(--rose);color:#9f1239}
.fb b{font-weight:700}
.fb .ans{font-family:var(--mono);font-weight:700}
.fb .why{margin-top:8px;padding-top:8px;border-top:1px solid rgba(0,0,0,.08);font-size:13.5px;color:var(--text-2)}
.fb .why b{color:var(--text)}

/* 解题步骤：答错时默认展开，答对时收起 */
.sol{margin-top:12px;padding-top:10px;border-top:1px solid rgba(0,0,0,.08)}
.sol summary{cursor:pointer;font-size:13.5px;font-weight:650;color:var(--accent);
  list-style:none;user-select:none}
.sol summary::-webkit-details-marker{display:none}
.sol summary::before{content:"▸ ";font-size:11px}
.sol[open] summary::before{content:"▾ "}
.sol summary:hover{text-decoration:underline}
.sol-list{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}
.sol-step{display:flex;gap:9px;align-items:flex-start;font-size:13.5px;line-height:1.7;color:var(--text-2)}
.sol-n{flex:none;width:19px;height:19px;border-radius:50%;background:var(--accent-soft);
  color:var(--accent);font-size:11px;font-weight:700;display:grid;place-items:center;
  font-family:var(--mono);margin-top:2px}
.sol-txt{flex:1;min-width:0}
.sol-calc{display:inline-block;margin-top:3px;font-family:var(--mono);font-size:12.5px;
  color:var(--text-3);background:var(--surface-2);border:1px solid var(--border);
  padding:2px 8px;border-radius:6px}
.sol-calc b{color:var(--accent);font-weight:700}

.actions{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap}

/* 诊断结论条：一句话说清「最该补什么」 */
.verdict{border-radius:14px;padding:20px 24px;margin-bottom:18px;
  border:1px solid var(--border);position:relative;overflow:hidden}
.verdict::before{content:"";position:absolute;inset:0 auto 0 0;width:4px}
.verdict.weak{background:var(--rose-soft)}
.verdict.weak::before{background:var(--rose)}
.verdict.shaky{background:var(--gold-soft)}
.verdict.shaky::before{background:var(--gold)}
.verdict.ok{background:var(--ok-soft)}
.verdict.ok::before{background:var(--ok)}
.v-label{font-family:var(--mono);font-size:11.5px;font-weight:700;letter-spacing:.08em;
  color:var(--text-3);margin-bottom:6px}
.v-main{font-size:26px;font-weight:800;letter-spacing:-.028em;line-height:1.2;
  color:var(--text);margin-bottom:7px}
.verdict.weak .v-main{color:var(--rose)}
.verdict.shaky .v-main{color:var(--gold)}
.verdict.ok .v-main{color:var(--ok)}
.v-why{font-size:13.5px;color:var(--text-2);line-height:1.7;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.v-tag{font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:5px;background:rgba(255,255,255,.7)}
.v-act{margin-top:9px;font-size:12.5px;color:var(--text-3)}

/* 诊断面板 */
.diag{margin-top:26px}
.diag-head{display:flex;align-items:baseline;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.kicker{font-family:var(--mono);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;
  color:var(--accent);font-weight:600}
.diag-head h2{font-size:22px;font-weight:780;letter-spacing:-.02em}
.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:22px}
/* 诊断里的小节（按章节 / 按能力）：小节之间留白，标题行与页面主标题区分开 */
.diag-sub{margin-top:28px}
.diag-sub:first-of-type{margin-top:0}
.diag-sub-note{font-size:12.5px;color:var(--text-3)}
.sm{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 16px}
.sm .n{font-size:26px;font-weight:800;letter-spacing:-.03em;font-variant-numeric:tabular-nums;line-height:1.1}
.sm .l{font-size:12px;color:var(--text-3);margin-top:4px}
.sm.weak .n{color:var(--rose)}
.sm.shaky .n{color:var(--gold)}
.sm.solid .n{color:var(--ok)}
.sm.total .n{color:var(--accent)}

.act-list{display:flex;flex-direction:column;gap:10px;margin-top:16px}
/* 错题清单：本轮做错的题逐条列出，可一键重做 */
.wrong-list{display:flex;flex-direction:column;gap:8px}
.wrong-row{background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--rose);
  border-radius:0 10px 10px 0;padding:11px 15px;display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}
.wrong-fam{font-size:11.5px;font-weight:650;color:var(--rose);background:var(--rose-soft);
  padding:2px 8px;border-radius:5px;white-space:nowrap;flex:none}
.wrong-stem{font-size:14px;color:var(--text);flex:1;min-width:180px;line-height:1.6}
.wrong-err{font-size:12px;color:var(--text-3);white-space:nowrap}.act{background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--accent);
  border-radius:0 12px 12px 0;padding:14px 18px;font-size:14px;line-height:1.75;color:var(--text-2)}
.act.weak{border-left-color:var(--rose)}
.act.shaky{border-left-color:var(--gold)}
.act.need-more{border-left-color:var(--text-3)}
.act b{color:var(--text)}

.empty{text-align:center;padding:50px 20px;color:var(--text-3)}
.empty .big{font-size:40px;margin-bottom:12px}

@media(max-width:680px){
  body{font-size:14.5px}
  .wrap,.hdr-in{padding:0 16px}
  .hdr-in{height:58px}
  .brand small{display:none}
  .q-card{padding:18px}
  .summary{grid-template-columns:repeat(2,1fr)}
}
`;

/* 内联脚本（独立常量，避免与外层模板字符串的 ${} 冲突） */
let SCRIPT = readFileSync('practice-src.js', 'utf8');
// 数据内联：file:// 下 import 会被 CORS 拦截，所以直接把题库嵌进页面
SCRIPT = SCRIPT.replace(
  "import { BANK, FAM_META, SOLUTIONS } from './practice-data.mjs';",
  'const BANK = ' + JSON.stringify(BANK) + ';\n' +
  'const FAM_META = ' + JSON.stringify(FAM_META) + ';\n' +
  'const SOLUTIONS = ' + JSON.stringify(SOLUTIONS) + ';\n' +
  'const CH_NAME = ' + JSON.stringify(CH_NAME) + ';\n' +
  'const FAM_CAT_SCORE = ' + JSON.stringify(FAM_CAT_SCORE) + ';\n' +
  'const CAT_ORDER = ' + JSON.stringify(CAT_ORDER) + ';\n' +
  'const CH_ORDER = ' + JSON.stringify(CH_ORDER) + ';\n' +
  /* 柱状图画法与学情数据页共用同一份（work/charts.mjs），构建时内联进单文件页面 */
  barBlock.toString()
);

/* 页面 HTML */
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>备考诊断 · 西城初一数学</title>
<meta name="description" content="对标西城期末真题的选择题与计算题诊断，自动判分并按考点族定位薄弱环节">
<style>${CSS}</style>
${THEME_INIT}
</head>
<body>
${headerHtml('practice.html')}

<main class="wrap">
<div class="head">
  <div class="hero-badge"><span class="dot-live"></span>18 题诊断 · 覆盖全部 6 章</div>
  <h1>备考诊断</h1>
  <p class="lede">
    每轮 ${ROUND_SIZE} 道题覆盖全部 6 章，按西城真题的考点分布与难度编制，全部为单选题。
    计算类题目也以「选出正确结果」的形式出现——省去手写步骤，但考点与真题第 17/18/19 题位一致。
    做完自动判分，按章节告诉你<b>哪一章薄弱、接下来该练什么</b>。
  </p>
</div>

<!-- 诊断入口：不做选择题库，直接开始 -->
<div class="intro" id="intro">
  <div class="intro-main">
    <div class="intro-eyebrow">本轮诊断</div>
    <h2 class="intro-title">${ROUND_SIZE} 道题，覆盖全部 6 章</h2>
    <p class="intro-desc">
      每章 3 题——题量刚好够判出每章的强弱，又不会拖太久。
      一轮下来能看到整张卷子的学情全貌：哪一章稳、哪一章要补。
    </p>
    <div class="plan" id="planPreview"></div>
    <div class="intro-actions">
      <button class="btn primary" id="startBtn">开始诊断</button>
      <span class="intro-hint">约 12 分钟 · 做完自动出诊断</span>
      <a class="btn ghost" href="history.html" id="histLink" style="margin-left:auto">学情数据</a>
    </div>
  </div>
</div>

<!-- 练习区 -->
<div id="quiz" style="display:none">
  <div class="progress">
    <span id="pText">第 1 / ${ROUND_SIZE} 题</span>
    <span class="pbar"><i id="pBar" style="width:0%"></i></span>
    <span id="pScore">已对 0</span>
  </div>
  <div id="qHost"></div>
  <div class="actions">
    <button class="btn ghost" id="quitBtn">结束本轮</button>
  </div>
</div>

<!-- 诊断区 -->
<div id="diag" class="diag" style="display:none"></div>
</main>

<script type="module">${SCRIPT}</script>
${THEME_SCRIPT}
</body>
</html>`;

writeFileSync('practice.html', html, 'utf8');
console.log('=== 练习页构建完成 ===');
console.log('  题库：' + totalQ + ' 题（选择 ' + choiceN + ' / 计算 ' + calcN + '）');
console.log('  考点族：' + famList.length);
console.log('  体积：' + (html.length / 1024).toFixed(1) + ' KB');
