#!/usr/bin/env node
// 练习页构建器：答题 + 自动判分 + 学情诊断
// 独立产物 practice.html，数据内联（无外部请求，file:// 可直开）
import { writeFileSync, readFileSync } from 'node:fs';

import { BANK, FAM_META } from './practice-data.mjs';
import { FAMILY_MAP } from './work/papers/stats.mjs';

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

const CSS = `
:root{
  --r:16px; --r-sm:10px; --r-pill:999px; --max:1000px;
  --sans:-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif;
  --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  --bg:#f6f8fc; --surface:#fff; --surface-2:#f8fafd;
  --border:rgba(15,23,42,.09); --text:#0f172a; --text-2:#475569; --text-3:#64748b;
  --accent:#2563eb; --accent-grad:linear-gradient(135deg,#2563eb,#4f46e5);
  --accent-soft:rgba(37,99,235,.08);
  --ok:#059669; --ok-soft:rgba(16,185,129,.10);
  --gold:#d97706; --gold-soft:rgba(245,158,11,.12);
  --rose:#e11d48; --rose-soft:rgba(225,29,72,.085);
  --shadow:0 4px 12px -2px rgba(15,23,42,.06),0 2px 4px -1px rgba(15,23,42,.04);
  --shadow-3:0 16px 36px -10px rgba(15,23,42,.11),0 4px 12px -2px rgba(15,23,42,.05);
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--sans);background:var(--bg);color:var(--text);line-height:1.68;
  font-size:15px;-webkit-font-smoothing:antialiased;padding-bottom:80px}
.wrap{max-width:var(--max);margin:0 auto;padding:0 20px}

/* 顶栏 */
.site-head{position:sticky;top:0;z-index:60;background:rgba(246,248,252,.9);
  backdrop-filter:saturate(180%) blur(14px);border-bottom:1px solid var(--border)}
.hdr{max-width:var(--max);margin:0 auto;padding:0 20px;height:60px;display:flex;align-items:center;gap:12px}
.brand{display:flex;align-items:center;gap:9px;text-decoration:none;font-weight:750;font-size:15px;color:var(--text)}
.brand-mark{width:28px;height:28px;border-radius:8px;background:var(--accent-grad);display:grid;
  place-items:center;color:#fff;font-size:13px;font-weight:800}
.hdr-nav{margin-left:auto;display:flex;gap:2px;overflow-x:auto;scrollbar-width:none}
.hdr-nav::-webkit-scrollbar{display:none}
.hdr-nav a{padding:7px 12px;border-radius:9px;color:var(--text-2);text-decoration:none;font-size:14px;white-space:nowrap}
.hdr-nav a:hover{background:var(--accent-soft);color:var(--accent)}
.hdr-nav a.on{background:var(--accent);color:#fff;font-weight:650}

/* 页头 */
.head{padding:38px 0 22px}
.crumb{font-size:13px;color:var(--text-3);margin-bottom:10px}
.crumb a{color:var(--text-3);text-decoration:none}
h1{font-size:30px;font-weight:800;letter-spacing:-.03em;line-height:1.25;margin-bottom:12px}
.lede{font-size:15px;color:var(--text-2);max-width:720px}
.lede b{color:var(--text)}

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

@media(max-width:640px){
  body{font-size:14.5px}
  .wrap,.hdr{padding:0 14px}
  h1{font-size:24px}
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
<header class="site-head"><div class="hdr">
  <a class="brand" href="index.html"><span class="brand-mark">西</span>西城初一数学</a>
  <nav class="hdr-nav">
    <a href="index.html">总览</a>
    <a href="papers.html">逐年真题</a>
    <a href="trend.html">趋势与考点</a>
    <a href="plan.html">冲刺计划</a>
    <a href="practice.html" class="on">练习与诊断</a>
    <a href="slides.html">演示</a>
  </nav>
</div></header>

<main class="wrap">
<div class="head">
  <div class="crumb"><a href="index.html">首页</a> / 练习与诊断</div>
  <h1>练习与诊断</h1>
  <p class="lede">
    ${totalQ} 道题，按西城真题的考点分布与题型编制：<b>${choiceN} 道选择题</b>对标第 1–16 题位，<b>${calcN} 道计算题</b>对标第 17/18/19 题位。
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
      <span class="chip on" data-seg="all">全部</span>
      <span class="chip" data-seg="选择">选择题 ${choiceN}</span>
      <span class="chip" data-seg="解答">计算题 ${calcN}</span>
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
