#!/usr/bin/env node
// 考情汇报幻灯片（演示用）
// 独立产物 slides.html，不影响站点的四个页面
// 键盘 ← → / 空格翻页，F 全屏，O 总览
import { writeFileSync } from 'node:fs';

import {
  PAPER_STATS, YEARS, CH_SCORE, CAT_SCORE, DIFF_SCORE,
  FAMILY_MAP, FREQ, FREQ_SUMMARY, SCORE_TIERS, MAIN_GRAND, N_PAPERS,
} from './work/papers/stats.mjs';
import { CH_NAME, CH_ORDER, CAT_NAME, CAT_ORDER, DIFF_NAME, DIFF_ORDER, LEDGER } from './work/papers/ledger.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sum = (a) => a.reduce((x, y) => x + y, 0);
const pct = (v) => Math.round(v);

const BASE_AVG = +(sum(SCORE_TIERS.map((t) => t.base)) / SCORE_TIERS.length).toFixed(1);
const HARD_AVG = +(sum(SCORE_TIERS.map((t) => t.hard)) / SCORE_TIERS.length).toFixed(1);
const BASE_MIN = Math.min(...SCORE_TIERS.map((t) => t.base));
const BASE_MAX = Math.max(...SCORE_TIERS.map((t) => t.base));
const HARD_MIN = Math.min(...SCORE_TIERS.map((t) => t.hard));
const HARD_MAX = Math.max(...SCORE_TIERS.map((t) => t.hard));
const CALC_CONCEPT = CAT_SCORE['计算'].pct + CAT_SCORE['概念'].pct;
const CALC3 = FAMILY_MAP.filter((f) => ['f-arith', 'f-solveeq', 'f-simplify'].includes(f.id)).reduce((a, f) => a + f.total, 0);
const DIFF_IDX_MIN = Math.min(...PAPER_STATS.map((s) => s.diffIndex));
const DIFF_IDX_MAX = Math.max(...PAPER_STATS.map((s) => s.diffIndex));
const TOP_MODE = (() => {
  const v = DIFF_SCORE.top.per.filter((x) => x > 0);
  const c = {};
  for (const x of v) c[x] = (c[x] || 0) + 1;
  return +Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
})();
const famById = (id) => FAMILY_MAP.find((f) => f.id === id);
const CH_GROUPS = CH_ORDER.map((k) => {
  const fams = FAMILY_MAP.filter((f) => f.ch === k).sort((a, b) => b.avgPerYear - a.avgPerYear);
  return { k, name: CH_NAME[k], total: fams.reduce((a, f) => a + f.total, 0), fams };
}).filter((g) => g.fams.length).sort((a, b) => b.total - a.total);

/* ============================ 样式 ============================ */
const CSS = `
:root{
  --bg:#f6f8fc; --surface:#fff; --surface-2:#f8fafd;
  --border:rgba(15,23,42,.09); --text:#0f172a; --text-2:#475569; --text-3:#64748b;
  --accent:#2563eb; --accent-grad:linear-gradient(135deg,#2563eb,#4f46e5);
  --purple:#7c3aed; --gold:#d97706; --gold-grad:linear-gradient(135deg,#f59e0b,#d97706);
  --ok:#059669; --rose:#e11d48;
  --accent-soft:rgba(37,99,235,.08); --gold-soft:rgba(245,158,11,.12);
  --rose-soft:rgba(225,29,72,.085); --ok-soft:rgba(16,185,129,.10);
  --shadow:0 16px 36px -10px rgba(15,23,42,.11),0 4px 12px -2px rgba(15,23,42,.05);
  --sans:-apple-system,BlinkMacSystemFont,"SF Pro Display","PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif;
  --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden}
body{font-family:var(--sans);background:#0f172a;color:var(--text);-webkit-font-smoothing:antialiased}

/* 舞台：16:9，按窗口等比缩放 */
#stage{position:fixed;inset:0;display:grid;place-items:center;background:#0b1120}
#deck{width:1280px;height:720px;position:relative;background:var(--bg);overflow:hidden;
  transform-origin:center center;box-shadow:0 30px 80px -20px rgba(0,0,0,.6)}

.slide{position:absolute;inset:0;padding:64px 72px;display:none;flex-direction:column;
  background:var(--bg);overflow:hidden}
.slide.on{display:flex}

/* 标题页 */
.s-cover{justify-content:flex-start;padding-top:96px;
  background:radial-gradient(ellipse 90% 70% at 20% 0%,rgba(37,99,235,.12),transparent 65%),var(--bg)}
.cover-badge{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--accent);
  background:var(--surface);border:1px solid rgba(37,99,235,.24);padding:6px 15px;border-radius:999px;
  width:fit-content;margin-bottom:26px;box-shadow:0 1px 3px rgba(15,23,42,.04)}
.cover-badge i{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px rgba(37,99,235,.16)}
.cover-h{font-size:62px;font-weight:800;letter-spacing:-.035em;line-height:1.16;margin-bottom:22px}
.cover-h em{font-style:normal;background:var(--accent-grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.cover-sub{font-size:19px;color:var(--text-2);line-height:1.7;max-width:820px}
.cover-points{display:flex;flex-direction:column;gap:12px;margin:34px 0 auto}
.cp{display:grid;grid-template-columns:44px 132px 1fr;gap:14px;align-items:baseline;
  background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 20px;
  box-shadow:0 1px 3px rgba(15,23,42,.04)}
.cp-n{font-family:var(--mono);font-size:12.5px;font-weight:800;color:var(--accent);letter-spacing:.06em}
.cp b{font-size:15px;font-weight:700}
.cp span:last-child{font-size:13px;color:var(--text-3)}
.cover-meta{margin-top:auto;padding-top:32px;display:flex;gap:44px;border-top:1px solid var(--border)}
.cover-meta div{display:flex;flex-direction:column;gap:2px}
.cover-meta b{font-size:26px;font-weight:780;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.cover-meta span{font-size:12.5px;color:var(--text-3)}

/* 内容页头 */
.s-head{margin-bottom:30px;flex:none}
.s-kicker{font-family:var(--mono);font-size:11.5px;letter-spacing:.11em;text-transform:uppercase;
  color:var(--accent);font-weight:650;margin-bottom:9px;display:block}
.s-title{font-size:38px;font-weight:780;letter-spacing:-.028em;line-height:1.24}
.s-sub{font-size:14.5px;color:var(--text-3);margin-top:8px}
.s-body{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;
  padding-top:2%;padding-bottom:2%}

/* 大数字组 */
.bignums{display:grid;gap:18px}
.bn{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:22px 24px;
  box-shadow:0 1px 3px rgba(15,23,42,.04)}
.bn-n{font-size:46px;font-weight:800;letter-spacing:-.04em;line-height:1.05;font-variant-numeric:tabular-nums}
.bn-n small{font-size:16px;font-weight:650;color:var(--text-3);margin-left:3px}
.bn-l{font-size:13.5px;font-weight:650;margin-top:7px}
.bn-d{font-size:12.5px;color:var(--text-3);margin-top:3px;line-height:1.5}
.bn.blue .bn-n{color:var(--accent)}
.bn.gold .bn-n{color:var(--gold)}
.bn.rose .bn-n{color:var(--rose)}
.bn.ok .bn-n{color:var(--ok)}

/* 条形对比 */
.bars{display:flex;flex-direction:column;gap:14px}
.bar-row{display:grid;grid-template-columns:88px 1fr 74px;align-items:center;gap:14px}
.bar-lbl{font-size:14px;font-weight:650}
.bar-track{height:26px;background:var(--surface-2);border:1px solid var(--border);border-radius:7px;
  overflow:hidden;position:relative}
.bar-fill{display:block;height:100%;border-radius:6px}
.bar-fill.blue{background:var(--accent-grad)}
.bar-fill.gold{background:var(--gold-grad)}
.bar-val{font-size:14px;font-weight:700;text-align:right;font-variant-numeric:tabular-nums}

/* 堆叠条（难度结构） */
.stack{display:flex;height:44px;border-radius:10px;overflow:hidden;border:1px solid var(--border);background:var(--surface-2)}
.stack i{display:block;height:100%;position:relative}
.stack i span{position:absolute;inset:0;display:grid;place-items:center;font-size:12.5px;font-weight:700;color:#fff}
.seg-easy{background:linear-gradient(135deg,#10b981,#059669)}
.seg-mid{background:var(--accent-grad)}
.seg-hard{background:var(--gold-grad)}
.seg-top{background:linear-gradient(135deg,#f43f5e,#e11d48)}
.legend{display:flex;gap:20px;margin-top:14px;font-size:12.5px;color:var(--text-2);flex-wrap:wrap}
.legend span{display:flex;align-items:center;gap:6px}
.legend i{width:11px;height:11px;border-radius:3px;display:block}

/* 表格 */
.tbl{width:100%;border-collapse:collapse;font-size:14px;background:var(--surface);
  border:1px solid var(--border);border-radius:12px;overflow:hidden}
.tbl th,.tbl td{padding:10px 14px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap}
.tbl th{font-size:11.5px;font-weight:700;color:var(--text-3);letter-spacing:.04em;background:var(--surface-2)}
.tbl td.num,.tbl th.num{text-align:right;font-variant-numeric:tabular-nums}
.tbl tbody tr:last-child td{border-bottom:none}
.tbl .hi{color:var(--accent);font-weight:700}
.tbl .grp td{background:var(--bg);font-weight:700;font-size:13.5px}

.tbl.compact{font-size:12.5px}
.tbl.compact th,.tbl.compact td{padding:6px 12px}
.tbl.compact .grp td{padding:6px 12px;font-size:12.5px}

/* 两栏 */
.two{display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:start}
.card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px 22px;
  box-shadow:0 1px 3px rgba(15,23,42,.04)}
.card h4{font-size:15px;font-weight:700;margin-bottom:12px}

/* 结论条 */
.callout{background:var(--accent-soft);border-left:3px solid var(--accent);border-radius:0 10px 10px 0;
  padding:15px 20px;font-size:14.5px;color:var(--text-2);line-height:1.72}
.callout b{color:var(--text)}
.callout.gold{background:var(--gold-soft);border-color:var(--gold)}
.callout.rose{background:var(--rose-soft);border-color:var(--rose)}

/* 优先级列表 */
.pri-list{display:flex;flex-direction:column;gap:11px}
.pri-item{display:grid;grid-template-columns:44px 1fr auto;gap:16px;align-items:center;
  background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:15px 20px}
.pri-no{font-family:var(--mono);font-size:19px;font-weight:800;color:var(--accent);text-align:center}
.pri-item:nth-child(2) .pri-no{color:var(--purple)}
.pri-item:nth-child(3) .pri-no{color:var(--ok)}
.pri-item:nth-child(4) .pri-no{color:var(--gold)}
.pri-item:nth-child(5) .pri-no{color:var(--text-3)}
.pri-t{font-size:15px;font-weight:700}
.pri-s{font-size:12.5px;color:var(--text-3);margin-top:2px}
.pri-v{font-size:13.5px;font-weight:700;color:var(--text-2);font-variant-numeric:tabular-nums;white-space:nowrap}

/* 结尾页 */
.s-end{justify-content:center;align-items:flex-start;
  background:radial-gradient(ellipse 90% 70% at 20% 0%,rgba(37,99,235,.12),transparent 65%),var(--bg)}
.end-h{font-size:52px;font-weight:800;letter-spacing:-.035em;line-height:1.2;margin-bottom:20px}
.end-list{display:flex;flex-direction:column;gap:12px;margin-top:10px}
.end-item{display:flex;gap:12px;font-size:16px;color:var(--text-2);align-items:baseline}
.end-item b{color:var(--text);font-weight:700}
.end-dot{width:7px;height:7px;border-radius:50%;background:var(--accent);flex:none;margin-top:8px}

/* 页码 / 进度 */
#pager{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:20;
  display:flex;align-items:center;gap:14px;background:rgba(15,23,42,.72);backdrop-filter:blur(10px);
  padding:8px 16px;border-radius:999px;color:#cbd5e1;font-size:12.5px;font-family:var(--mono)}
#pager button{background:none;border:none;color:#94a3b8;cursor:pointer;font-size:15px;padding:2px 6px;
  border-radius:5px;line-height:1}
#pager button:hover{color:#fff;background:rgba(255,255,255,.12)}
#pager .cur{color:#fff;font-weight:700}
#bar{position:fixed;top:0;left:0;height:2px;background:var(--accent-grad);z-index:30;transition:width .3s}

/* 总览 */
#overview{position:fixed;inset:0;background:rgba(11,17,32,.96);z-index:40;display:none;
  padding:40px;overflow:auto}
#overview.on{display:block}
#overview h3{color:#e2e8f0;font-size:15px;font-weight:650;margin-bottom:20px}
.ov-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.ov-card{background:#1e293b;border:2px solid transparent;border-radius:10px;padding:12px 14px;
  cursor:pointer;transition:.15s}
.ov-card:hover{border-color:#3b82f6}
.ov-card .n{font-family:var(--mono);font-size:11px;color:#64748b}
.ov-card .t{font-size:13px;color:#e2e8f0;margin-top:4px;font-weight:600;line-height:1.4}

/* 打印 / 导出 PDF */
@media print{
  @page{size:1280px 720px;margin:0}
  html,body{overflow:visible;background:#fff}
  #stage{position:static;display:block}
  #deck{width:1280px;height:auto;transform:none!important;box-shadow:none}
  .slide{position:relative;display:flex!important;page-break-after:always;height:720px}
  #pager,#bar,#overview{display:none!important}
}
`;

/* ============================ 幻灯片内容 ============================ */
function slides() {
  const out = [];

  /* 1. 封面 */
  out.push({
    title: '封面',
    html: `
<div class="slide s-cover on">
  <div class="cover-badge"><i></i>西城区区统考 · 五年真题逐题拆解</div>
  <h1 class="cover-h">初一（上）数学期末<br><em>考情分析与冲刺计划</em></h1>
  <p class="cover-sub">
    ${YEARS.join(' / ')} 五套区统考卷，${LEDGER.length} 道题逐题标注。
  </p>
  <div class="cover-points">
    <div class="cp"><span class="cp-n">01</span><b>每年考什么</b><span>五套卷逐套拆解结构、章节、能力、难度</span></div>
    <div class="cp"><span class="cp-n">02</span><b>五年什么在变</b><span>哪些稳如磐石，哪些在漂移，哪些已经消失</span></div>
    <div class="cp"><span class="cp-n">03</span><b>先练什么更划算</b><span>按「能不能练稳」排出五级优先级</span></div>
  </div>
  <div class="cover-meta">
    <div><b>${LEDGER.length}</b><span>题逐题标注</span></div>
    <div><b>${FAMILY_MAP.length}</b><span>个考点族</span></div>
    <div><b>${FREQ.must.length}</b><span>个五年必考</span></div>
    <div><b>${BASE_AVG}</b><span>基础+中档均值（分）</span></div>
  </div>
</div>`,
  });

  /* 2. 卷面结构 */
  out.push({
    title: '卷面结构',
    html: `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Structure</span>
    <h2 class="s-title">卷面骨架：五年一动没动</h2>
    <p class="s-sub">所以「按题型复习」的框架是成立的</p>
  </div>
  <div class="s-body">
    <div class="bignums" style="grid-template-columns:repeat(4,1fr)">
      <div class="bn blue"><div class="bn-n">26<small>题</small></div><div class="bn-l">总题量</div><div class="bn-d">必做 24 + 选做 2</div></div>
      <div class="bn blue"><div class="bn-n">100<small>分钟</small></div><div class="bn-l">考试时长</div><div class="bn-d">平均每题 3.8 分钟</div></div>
      <div class="bn gold"><div class="bn-n">100<small>分</small></div><div class="bn-l">必做满分</div><div class="bn-d">选做 10 分计入但封顶 100</div></div>
      <div class="bn ok"><div class="bn-n">16<span style="font-size:22px">/</span>16<span style="font-size:22px">/</span>68</div><div class="bn-l">选择 / 填空 / 解答</div><div class="bn-d">五年完全一致</div></div>
    </div>
    <div class="callout" style="margin-top:26px">
      <b>一个例外：</b>第 19、20 题的内容会互换位置——2025-26 把「解方程」放到第 19 题（12 分）、
      「尺规作图」放到第 20 题（5 分），与往年相反。<b>要按题型认，不按题号认。</b>
    </div>
  </div>
</div>`,
  });

  /* 3. 难度结构（核心论点） */
  const dE = DIFF_SCORE.easy.pct, dM = DIFF_SCORE.mid.pct, dH = DIFF_SCORE.hard.pct, dT = DIFF_SCORE.top.pct;
  out.push({
    title: '难度结构',
    html: `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Difficulty</span>
    <h2 class="s-title">难度五年几乎不动</h2>
    <p class="s-sub">基础 ${dE}% ／ 中档 ${dM}% ／ 较难 ${dH}% ／ 压轴 ${dT}%</p>
  </div>
  <div class="s-body">
    <div class="stack">
      <i class="seg-easy" style="width:${dE}%"><span>${dE}%</span></i>
      <i class="seg-mid" style="width:${dM}%"><span>${dM}%</span></i>
      <i class="seg-hard" style="width:${dH}%"><span>${dH}%</span></i>
      <i class="seg-top" style="width:${dT}%"></i>
    </div>
    <div class="legend">
      <span><i class="seg-easy"></i>基础 年均 ${DIFF_SCORE.easy.avg} 分</span>
      <span><i class="seg-mid"></i>中档 年均 ${DIFF_SCORE.mid.avg} 分</span>
      <span><i class="seg-hard"></i>较难 年均 ${DIFF_SCORE.hard.avg} 分</span>
      <span><i class="seg-top"></i>压轴 年均 ${DIFF_SCORE.top.avg} 分</span>
    </div>
    <table class="tbl" style="margin-top:24px">
      <thead><tr><th>年份</th><th class="num">基础+中档</th><th class="num">较难+压轴</th><th class="num">难度指数</th></tr></thead>
      <tbody>${SCORE_TIERS.map((t, i) => `<tr>
        <td>${t.label}</td>
        <td class="num hi">${t.base}</td>
        <td class="num">${t.hard}</td>
        <td class="num">${PAPER_STATS[i].diffIndex}</td>
      </tr>`).join('')}</tbody>
    </table>
    <div class="callout" style="margin-top:20px">
      基础+中档五年稳定在 <b>${BASE_MIN}–${BASE_MAX} 分</b>，难度指数在 <b>${DIFF_IDX_MIN}–${DIFF_IDX_MAX}</b> 之间。
      这套卷子<b>不是靠难题拉开差距</b>的。
    </div>
  </div>
</div>`,
  });

  /* 4. 核心结论 */
  out.push({
    title: '核心结论',
    html: `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Key Finding</span>
    <h2 class="s-title">分数的主体不是压轴</h2>
    <p class="s-sub">是那约 ${pct(BASE_AVG)} 分的基础+中档</p>
  </div>
  <div class="s-body">
    <div class="bignums" style="grid-template-columns:repeat(3,1fr)">
      <div class="bn blue"><div class="bn-n">${pct(BASE_AVG)}<small>分</small></div><div class="bn-l">基础 + 中档</div>
        <div class="bn-d">五年 ${BASE_MIN}–${BASE_MAX} 分，唯一能靠训练做到 100% 的部分</div></div>
      <div class="bn gold"><div class="bn-n">${pct(HARD_AVG)}<small>分</small></div><div class="bn-l">较难 + 压轴</div>
        <div class="bn-d">五年 ${HARD_MIN}–${HARD_MAX} 分，其中压轴约 ${TOP_MODE} 分</div></div>
      <div class="bn ok"><div class="bn-n">${CALC_CONCEPT}<small>%</small></div><div class="bn-l">计算 + 概念占比</div>
        <div class="bn-d">靠「准确」而不是「灵感」</div></div>
    </div>
    <div class="callout rose" style="margin-top:28px;font-size:16px">
      <b>推论：</b>压轴全丢，大部分分数仍然在；但基础段每丢一处，都是实打实的损失。<br>
      <b>所以复习顺序应该把「计算零失误」排在「攻压轴」前面</b>——不是因为它更难，而是因为它更值钱、更可控。
    </div>
  </div>
</div>`,
  });

  /* 5. 章节分布 */
  const chMax = Math.max(...CH_ORDER.map((k) => CH_SCORE[k].avg));
  out.push({
    title: '章节分布',
    html: `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Chapters</span>
    <h2 class="s-title">六章分值分布</h2>
    <p class="s-sub">方程 23% + 几何 22% 是主体；有理数 + 运算各占 20%</p>
  </div>
  <div class="s-body">
    <div class="bars">
      ${CH_ORDER.slice().sort((a, b) => CH_SCORE[b].avg - CH_SCORE[a].avg).map((k) => {
        const d = CH_SCORE[k];
        return `<div class="bar-row">
          <span class="bar-lbl">${CH_NAME[k]}</span>
          <span class="bar-track"><span class="bar-fill blue" style="width:${Math.round(d.avg / chMax * 100)}%"></span></span>
          <span class="bar-val">${d.avg} 分</span>
        </div>`;
      }).join('')}
    </div>
    <div class="callout gold" style="margin-top:24px">
      <b>最稳的是整式的加减</b>（五年极差 ${CH_SCORE['ch-poly'].range} 分）；
      <b>波动最大的是几何与运算</b>（极差 ${CH_SCORE['ch-geo'].range} 与 ${CH_SCORE['ch-op'].range} 分），
      而且两者此消彼长——几何重的年份运算就轻。
    </div>
  </div>
</div>`,
  });

  /* 6. 能力分布 */
  const catMax = Math.max(...CAT_ORDER.map((k) => CAT_SCORE[k].avg));
  out.push({
    title: '能力分布',
    html: `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Abilities</span>
    <h2 class="s-title">八种能力的分值分布</h2>
    <p class="s-sub">计算 ${CAT_SCORE['计算'].pct}% + 概念 ${CAT_SCORE['概念'].pct}% = ${CALC_CONCEPT}%，近六成靠「准确」</p>
  </div>
  <div class="s-body">
    <div class="bars">
      ${CAT_ORDER.slice().sort((a, b) => CAT_SCORE[b].avg - CAT_SCORE[a].avg).map((k) => {
        const d = CAT_SCORE[k];
        const cls = d.pct >= 30 ? 'blue' : d.pct >= 10 ? 'gold' : 'ok';
        return `<div class="bar-row" style="grid-template-columns:78px 1fr 96px">
          <span class="bar-lbl" style="font-size:13px">${CAT_NAME[k]}</span>
          <span class="bar-track" style="height:22px"><span class="bar-fill ${cls}" style="width:${Math.round(d.avg / catMax * 100)}%"></span></span>
          <span class="bar-val" style="font-size:13px">${d.avg} 分 · ${d.pct}%</span>
        </div>`;
      }).join('')}
    </div>
    <div class="callout" style="margin-top:22px">
      <b>分类讨论连续两年 13 分</b>（2024-25、2025-26），是唯一明显上升的能力。
      <b>新定义在必做位已消失</b>——2025-26 全部落在选做。
    </div>
  </div>
</div>`,
  });

  /* 7. 考点族（年均分值表） */
  out.push({
    title: '考点年均分值',
    html: `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Topics</span>
    <h2 class="s-title">各考点年均分值</h2>
    <p class="s-sub">按章节分组 · 组内按年均分降序 · 共 ${FAMILY_MAP.length} 族</p>
  </div>
  <div class="s-body">
    <div class="two" style="gap:26px">
      <table class="tbl compact">
        <thead><tr><th>考点</th><th class="num">年均分</th></tr></thead>
        <tbody>${CH_GROUPS.slice(0, 3).map((g) => `
          <tr class="grp"><td colspan="2">${g.name} · 五年 ${g.total} 分</td></tr>
          ${g.fams.slice(0, 2).map((f) => `<tr><td style="padding-left:20px">${f.name}</td><td class="num hi">${f.avgPerYear || '—'}</td></tr>`).join('')}
        `).join('')}</tbody>
      </table>
      <table class="tbl compact">
        <thead><tr><th>考点</th><th class="num">年均分</th></tr></thead>
        <tbody>${CH_GROUPS.slice(3).map((g) => `
          <tr class="grp"><td colspan="2">${g.name} · 五年 ${g.total} 分</td></tr>
          ${g.fams.slice(0, 2).map((f) => `<tr><td style="padding-left:20px">${f.name}</td><td class="num hi">${f.avgPerYear || '—'}</td></tr>`).join('')}
        `).join('')}</tbody>
      </table>
    </div>
    <div class="callout" style="margin-top:20px">
      单题分值最高的是<b>有理数四则混合运算</b>（年均 ${famById('f-arith').avgPerYear} 分），
      其次<b>解一元一次方程</b>（${famById('f-solveeq').avgPerYear} 分）与<b>分类压轴</b>（${famById('f-final').avgPerYear} 分）。表中每章列前 2 项。
    </div>
  </div>
</div>`,
  });

  /* 8. 必考 12 族 */
  out.push({
    title: '必考清单',
    html: `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Must-Know</span>
    <h2 class="s-title">五年年年考的 ${FREQ.must.length} 个考点族</h2>
    <p class="s-sub">覆盖必做分 ${FREQ_SUMMARY.must.pct}%（${FREQ_SUMMARY.must.score}/${MAIN_GRAND} 分）</p>
  </div>
  <div class="s-body">
    <table class="tbl" style="font-size:13.5px">
      <thead><tr><th>考点族</th><th class="num">五年总分</th><th class="num">年均</th><th>说明</th></tr></thead>
      <tbody>${FREQ.must.slice(0, 8).map((f) => `<tr>
        <td><b>${f.name}</b></td>
        <td class="num">${f.total}</td>
        <td class="num hi">${f.avgPerYear}</td>
        <td style="white-space:normal;color:var(--text-3);font-size:12.5px">${esc(f.note)}</td>
      </tr>`).join('')}</tbody>
    </table>
    <div class="callout" style="margin-top:18px">
      其余 ${FREQ.must.length - 8} 族（${FREQ.must.slice(8).map((f) => f.name).join('、')}）也都是年年考，
      只是分值较低、题型固定。
    </div>
  </div>
</div>`,
  });

  /* 9. 压轴专题 */
  out.push({
    title: '压轴专题',
    html: `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Hardest</span>
    <h2 class="s-title">第 23 题：五年全是「分类讨论」</h2>
    <p class="s-sub">载体每年换，内核不变</p>
  </div>
  <div class="s-body">
    <table class="tbl">
      <thead><tr><th>年份</th><th>第 23 题考什么</th><th class="num">分值</th><th>能力</th></tr></thead>
      <tbody>${PAPER_STATS.map((s) => {
        const q = LEDGER.find((x) => x.p === s.id && x.no === 23);
        return `<tr>
          <td>${s.label}</td>
          <td>${q ? esc(q.topic) : '—'}</td>
          <td class="num">${q ? q.score : '—'}</td>
          <td>${q ? q.cat : '—'}</td>
        </tr>`;
      }).join('')}</tbody>
    </table>
    <div class="callout rose" style="margin-top:22px;font-size:15px">
      <b>训练方法不是刷各种载体</b>，而是练「分类的完备性」：<br>
      动点在哪些区间？动角转到哪些位置？端点重合算不算？<b>漏一种就是丢一半分。</b>
    </div>
  </div>
</div>`,
  });

  /* 10. 五级优先级 */
  const pri = [
    ['01', '计算零失误', `${CALC3} 分 / ${MAIN_GRAND} 分 = ${Math.round(CALC3 / MAIN_GRAND * 100)}%`, '正确率 100%，不是 95%'],
    ['02', '概念辨析', `占 ${CAT_SCORE['概念'].pct}%`, '靠「陷阱清单」，不靠刷题'],
    ['03', '几何说理格式', `作图 ${famById('f-construct').total} 分 + 角度推理 19 分`, '格式分，不是智力分'],
    ['04', '分类压轴', `${famById('f-final').total} 分 · 5/5 必考`, '练分类完备性'],
    ['05', '选做新定义', '10 分（封顶 100）', '必做全对再碰'],
  ];
  out.push({
    title: '五级优先级',
    html: `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Priority</span>
    <h2 class="s-title">五级优先，按「能不能练稳」排序</h2>
    <p class="s-sub">顺序由五年真题的考法分布决定</p>
  </div>
  <div class="s-body">
    <div class="pri-list">
      ${pri.map(([n, t, v, s]) => `<div class="pri-item">
        <span class="pri-no">${n}</span>
        <div><div class="pri-t">${t}</div><div class="pri-s">${s}</div></div>
        <span class="pri-v">${v}</span>
      </div>`).join('')}
    </div>
  </div>
</div>`,
  });

  /* 11. 六周节奏 */
  const phases = [
    ['第 1–2 周', '计算固化', '每天 1 组第 17 题 + 1 组解方程 + 1 道化简求值，限时'],
    ['第 2–3 周', '概念清单', '把五套卷选择题的错误选项归类，做成「陷阱清单」'],
    ['第 3–4 周', '几何格式', '作图专练「画 + 写依据」；角度推理补全过程'],
    ['第 4–5 周', '分类压轴', '五套卷第 23 题逐题重做，练「分几种情况」'],
    ['第 5–6 周', '整卷实战', '五套真题限时整卷，熟悉节奏为主'],
    ['考前 3 天', '只回看', '只过错题与陷阱清单，不做新题'],
  ];
  out.push({
    title: '六周节奏',
    html: `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Roadmap</span>
    <h2 class="s-title">六周冲刺节奏</h2>
    <p class="s-sub">每个阶段带达标判据，不达标不进入下一阶段</p>
  </div>
  <div class="s-body">
    <table class="tbl">
      <thead><tr><th style="width:110px">时间</th><th style="width:120px">阶段</th><th>做什么</th></tr></thead>
      <tbody>${phases.map(([w, t, b]) => `<tr>
        <td><b style="color:var(--accent)">${w}</b></td>
        <td><b>${t}</b></td>
        <td style="white-space:normal">${b}</td>
      </tr>`).join('')}</tbody>
    </table>
    <div class="callout" style="margin-top:20px">
      <b>衡量指标不是「今天做了多少题」</b>，而是「同一道题第二次做是否还错」。
      这 ${pct(BASE_AVG)} 分反复练的是「不错」，不是「不会」。
    </div>
  </div>
</div>`,
  });

  /* 12. 结尾 */
  out.push({
    title: '结论',
    html: `
<div class="slide s-end">
  <h2 class="end-h">三句话总结</h2>
  <div class="end-list">
    <div class="end-item"><span class="end-dot"></span><span>卷面五年不变，<b>基础+中档稳定 ${BASE_MIN}–${BASE_MAX} 分</b>——分数主体就在这里</span></div>
    <div class="end-item"><span class="end-dot"></span><span><b>${FREQ.must.length} 个必考族覆盖 ${FREQ_SUMMARY.must.pct}% 分值</b>，其中计算三块合计 ${CALC3} 分</span></div>
    <div class="end-item"><span class="end-dot"></span><span>复习顺序应该是<b>先保计算零失误，再攻分类压轴</b>，而不是反过来</span></div>
  </div>
  <div class="cover-meta" style="margin-top:56px;border-top:1px solid var(--border);padding-top:28px;width:100%">
    <div><b>${LEDGER.length}</b><span>题逐题标注</span></div>
    <div><b>${N_PAPERS}</b><span>套真题样本</span></div>
    <div><b>${FAMILY_MAP.length}</b><span>个考点族</span></div>
  </div>
</div>`,
  });

  return out;
}

/* ============================ 输出 ============================ */
const deck = slides();
const body = deck.map((s, i) => s.html.replace('class="slide', `data-i="${i}" class="slide`)).join('\n');

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>初一(上)数学期末考情分析 · 汇报</title>
<style>${CSS}</style>
</head>
<body>
<div id="bar"></div>
<div id="stage"><div id="deck">
${body}
</div></div>

<div id="pager">
  <button id="prev" aria-label="上一页">←</button>
  <span><span class="cur" id="cur">1</span> / ${deck.length}</span>
  <button id="next" aria-label="下一页">→</button>
  <button id="ov" aria-label="总览" style="margin-left:6px">⊞</button>
  <button id="fs" aria-label="全屏">⛶</button>
  <a href="index.html" title="返回站点" aria-label="返回站点" style="color:#94a3b8;text-decoration:none;font-size:14px;padding:2px 6px;border-radius:5px">↩</a>
</div>

<div id="hint" style="position:fixed;top:18px;right:20px;z-index:19;
  background:rgba(15,23,42,.66);backdrop-filter:blur(10px);color:#cbd5e1;font-size:12px;
  padding:7px 15px;border-radius:999px;opacity:1;transition:opacity .5s;pointer-events:none">
  ← → 翻页 · F 全屏 · O 总览
</div>

<div id="overview">
  <h3>总览 · 点击跳转</h3>
  <div class="ov-grid">
    ${deck.map((s, i) => `<div class="ov-card" data-go="${i}"><div class="n">${String(i + 1).padStart(2, '0')}</div><div class="t">${esc(s.title)}</div></div>`).join('')}
  </div>
</div>

<script>
(function(){
  var deck=document.getElementById('deck');
  var slides=[].slice.call(deck.querySelectorAll('.slide'));
  var i=0, N=slides.length;

  function fit(){
    var s=Math.min(window.innerWidth/1280, window.innerHeight/720);
    deck.style.transform='scale('+s+')';
  }
  window.addEventListener('resize',fit); fit();

  function show(n){
    i=Math.max(0,Math.min(N-1,n));
    slides.forEach(function(el,k){ el.classList.toggle('on', k===i); });
    document.getElementById('cur').textContent=i+1;
    document.getElementById('bar').style.width=((i+1)/N*100)+'%';
  }
  function next(){ show(i+1); }
  function prev(){ show(i-1); }

  document.getElementById('next').onclick=next;
  document.getElementById('prev').onclick=prev;
  document.getElementById('fs').onclick=function(){
    if(!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };
  var ov=document.getElementById('overview');
  document.getElementById('ov').onclick=function(){ ov.classList.toggle('on'); };
  ov.addEventListener('click',function(e){
    var c=e.target.closest('[data-go]');
    if(c){ show(+c.dataset.go); ov.classList.remove('on'); }
    else if(e.target===ov){ ov.classList.remove('on'); }
  });

  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){ e.preventDefault(); next(); }
    else if(e.key==='ArrowLeft'||e.key==='PageUp'){ e.preventDefault(); prev(); }
    else if(e.key==='Home'){ show(0); }
    else if(e.key==='End'){ show(N-1); }
    else if(e.key==='f'||e.key==='F'){ document.getElementById('fs').click(); }
    else if(e.key==='o'||e.key==='O'){ ov.classList.toggle('on'); }
    else if(e.key==='Escape'){ ov.classList.remove('on'); }
  });

  // 触摸滑动
  var x0=null;
  document.addEventListener('touchstart',function(e){ x0=e.touches[0].clientX; },{passive:true});
  document.addEventListener('touchend',function(e){
    if(x0===null) return;
    var dx=e.changedTouches[0].clientX-x0;
    if(Math.abs(dx)>50){ dx<0?next():prev(); }
    x0=null;
  },{passive:true});

  // 支持 ?p=N 直接跳页（方便演示时定位）
  setTimeout(function(){
    var hint=document.getElementById('hint');
    if(hint){ hint.style.opacity='0'; setTimeout(function(){ hint.remove(); },600); }
  }, 3200);

  var m=location.search.match(/[?&]p=(\\d+)/);
  if(m) show(+m[1]-1); else show(0);
})();
</script>
</body>
</html>`;

writeFileSync('slides.html', html, 'utf8');
console.log('=== 幻灯片构建完成 ===');
console.log('  页数：' + deck.length);
console.log('  体积：' + (html.length / 1024).toFixed(1) + ' KB');
console.log('  输出：slides.html');
