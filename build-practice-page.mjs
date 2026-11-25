#!/usr/bin/env node
// 练习页构建器：答题 + 自动判分 + 学情诊断
// 独立产物 practice.html，数据内联（无外部请求，file:// 可直开）
import { writeFileSync, readFileSync } from 'node:fs';

import { BANK, FAM_META } from './practice-data.mjs';
import { FAMILY_MAP } from './work/papers/stats.mjs';
import { TOKENS, HEAD_CSS, PAGEHEAD_CSS, headerHtml } from './work/site-shell.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* 题库按族分组，供页面做筛选 */
const famList = Object.keys(FAM_META).map((id) => ({
  id,
  name: FAM_META[id].name,
  avg: FAM_META[id].avgPerYear,
  n: BANK.filter((q) => q.fam === id).length,
})).sort((a, b) => b.avg - a.avg);

const totalQ = BANK.length;
const choiceN = BANK.filter((q) => q.options).length;
const calcN = totalQ - choiceN;

// 设计变量 / 顶栏 / 页头排版来自 work/site-shell.mjs（全站唯一来源）
const CSS = TOKENS + HEAD_CSS + PAGEHEAD_CSS + `
/* 练习页局部：沿用旧变量名，避免改一堆组件 */
:root{ --shadow:var(--shadow-2); }
body{padding-bottom:80px}

/* 页头（h1 / .lede 排版来自 site-shell 的 PAGEHEAD_CSS，此处不再重复定义） */
.head{padding:38px 0 22px}
.crumb{font-size:13px;color:var(--text-3);margin-bottom:10px}
.crumb a{color:var(--text-3);text-decoration:none}

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
.pbar{flex:1;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden}
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
.tag.seg{background:#eef3f8;color:#3a5a78}
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
.frac .fn{border-bottom:1px solid currentColor;padding:0 3px}
.frac .fd{padding:0 3px}

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

.actions{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap}

/* 诊断面板 */
.diag{margin-top:26px}
.diag-head{display:flex;align-items:baseline;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.kicker{font-family:var(--mono);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;
  color:var(--accent);font-weight:600}
.diag-head h2{font-size:22px;font-weight:780;letter-spacing:-.02em}
.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
.sm{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 16px}
.sm .n{font-size:26px;font-weight:800;letter-spacing:-.03em;font-variant-numeric:tabular-nums;line-height:1.1}
.sm .l{font-size:12px;color:var(--text-3);margin-top:4px}
.sm.weak .n{color:var(--rose)}
.sm.shaky .n{color:var(--gold)}
.sm.solid .n{color:var(--ok)}
.sm.total .n{color:var(--accent)}

.fam-rows{display:flex;flex-direction:column;gap:8px}
.fam-row{background:var(--surface);border:1px solid var(--border);border-radius:12px;
  padding:13px 16px;display:grid;grid-template-columns:1fr auto auto;gap:14px;align-items:center}
.fam-name{font-size:14.5px;font-weight:650}
.fam-sub{font-size:12px;color:var(--text-3);margin-top:2px}
.fam-rate{font-family:var(--mono);font-size:15px;font-weight:700;font-variant-numeric:tabular-nums}
.fam-tier{font-size:11.5px;font-weight:700;padding:3px 10px;border-radius:var(--r-pill);white-space:nowrap}
.tier-weak{background:var(--rose-soft);color:var(--rose)}
.tier-shaky{background:var(--gold-soft);color:var(--gold)}
.tier-solid{background:var(--ok-soft);color:var(--ok)}
.tier-insufficient{background:#e2e8f0;color:var(--text-3)}
.rate-weak{color:var(--rose)}
.rate-shaky{color:var(--gold)}
.rate-solid{color:var(--ok)}
.rate-insufficient{color:var(--text-3)}

.act-list{display:flex;flex-direction:column;gap:10px;margin-top:16px}
.act{background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--accent);
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
  .fam-row{grid-template-columns:1fr auto;gap:8px}
  .fam-tier{grid-column:2}
}
`;

/* 内联脚本（独立常量，避免与外层模板字符串的 ${} 冲突） */
let SCRIPT = readFileSync('practice-src.js', 'utf8');
// 数据内联：file:// 下 import 会被 CORS 拦截，所以直接把题库嵌进页面
SCRIPT = SCRIPT.replace(
  "import { BANK, FAM_META } from './practice-data.mjs';",
  'const BANK = ' + JSON.stringify(BANK) + ';\nconst FAM_META = ' + JSON.stringify(FAM_META) + ';'
);

/* 页面 HTML */
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>练习与诊断 · 西城初一数学</title>
<meta name="description" content="对标西城期末真题的选择题与计算题练习，自动判分并按考点族诊断薄弱环节">
<style>${CSS}</style>
</head>
<body>
${headerHtml('practice.html')}

<main class="wrap">
<div class="head">
  <div class="crumb"><a href="index.html">首页</a> / 练习与诊断</div>
  <h1>练习与诊断</h1>
  <p class="lede">
    ${totalQ} 道题，按西城真题的考点分布与难度编制，全部为单选题。
    计算类题目也以「选出正确结果」的形式出现——省去手写步骤，但考点与真题第 17/18/19 题位一致。
    做完自动判分，并按考点族告诉你<b>先补哪里、怎么补</b>。
  </p>
</div>

<!-- 设置 -->
<div class="setup" id="setup">
  <div class="setup-row">
    <span class="setup-label">范围</span>
    <div class="chips" id="famChips">
      <span class="chip on" data-fam="all">全部</span>
      ${famList.map((f) => `<span class="chip" data-fam="${f.id}">${esc(f.name)}<span style="opacity:.6;font-size:11px"> ${f.n}</span></span>`).join('')}
    </div>
  </div>
  <div class="setup-row">
    <span class="setup-label">题型</span>
    <div class="chips" id="segChips">
      <span class="chip on" data-seg="all">全部 ${totalQ}</span>
    </div>
  </div>
  <div class="setup-row">
    <span class="setup-label">题量</span>
    <div class="chips" id="numChips">
      <span class="chip" data-n="5">5</span>
      <span class="chip on" data-n="10">10</span>
      <span class="chip" data-n="15">15</span>
      <span class="chip" data-n="999">全部</span>
    </div>
    <button class="btn primary" id="startBtn" style="margin-left:auto">开始练习</button>
  </div>
</div>

<!-- 练习区 -->
<div id="quiz" style="display:none">
  <div class="progress">
    <span id="pText">第 1 / 10 题</span>
    <span class="pbar"><i id="pBar" style="width:0%"></i></span>
    <span id="pScore">已对 0</span>
  </div>
  <div id="qHost"></div>
  <div class="actions">
    <button class="btn ghost" id="quitBtn">结束本轮</button>
    <button class="btn" id="skipBtn" style="display:none">跳过</button>
  </div>
</div>

<!-- 诊断区 -->
<div id="diag" class="diag" style="display:none"></div>

<!-- 空态 -->
<div id="empty" class="empty" style="display:none">
  <div class="big">🎯</div>
  <p>选好范围和题量，点「开始练习」。</p>
</div>
</main>

<script type="module">${SCRIPT}</script>
</body>
</html>`;

writeFileSync('practice.html', html, 'utf8');
console.log('=== 练习页构建完成 ===');
console.log('  题库：' + totalQ + ' 题（选择 ' + choiceN + ' / 计算 ' + calcN + '）');
console.log('  考点族：' + famList.length);
console.log('  体积：' + (html.length / 1024).toFixed(1) + ' KB');
