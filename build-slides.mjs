#!/usr/bin/env node
// 演示用的 Web PPT：数学真题考情讲解
//
// 设计系统与交互复用英语期末站（~/Desktop/thinking/english/build-slides.mjs）：
// 16:9 舞台按窗口等比缩放、← → / 空格翻页、F 全屏、O 总览、?p=N 定位、打印分页。
// 本文件只换数据与内容——所有数字从 work/papers 的台账派生，不手写。
import { writeFileSync, readFileSync } from 'node:fs';

import {
  PAPER_STATS, YEARS, CH_SCORE, CAT_SCORE, DIFF_SCORE, FAMILY_MAP,
  FREQ, FREQ_SUMMARY, SCORE_TIERS, MAIN_GRAND, N_PAPERS,
} from './work/papers/stats.mjs';
import { CH_NAME, CH_ORDER, CAT_NAME, CAT_ORDER, DIFF_NAME, DIFF_ORDER, LEDGER } from './work/papers/ledger.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sum = (a) => a.reduce((x, y) => x + y, 0);
const pct = (v) => Math.round(v);

/* ============================ 派生量 ============================ */
const MAIN = PAPER_STATS[0].mainTotal;          // 100 必做
const BONUS = PAPER_STATS[0].bonusTotal;        // 10 选做
const QN = PAPER_STATS[0].qCount;               // 26 题
const BASE = DIFF_SCORE.easy.avg;
const MID = DIFF_SCORE.mid.avg;
const HARD = DIFF_SCORE.hard.avg;
const TOP = DIFF_SCORE.top.avg;
const BASE_MID = +(BASE + MID).toFixed(1);
const BASE_MID_PCT = Math.round((BASE_MID / MAIN) * 100);
const HARD_TOP = +(HARD + TOP).toFixed(1);
const DIFF_IDX = PAPER_STATS.map((p) => p.diffIndex);
const DIFF_IDX_MIN = Math.min(...DIFF_IDX);
const DIFF_IDX_MAX = Math.max(...DIFF_IDX);
const CALC = CAT_SCORE['计算'].avg;
const CONCEPT = CAT_SCORE['概念'].avg;
const CALC_CONCEPT_PCT = CAT_SCORE['计算'].pct + CAT_SCORE['概念'].pct;
const TOP_FAMS = FAMILY_MAP.slice(0, 7);
const CALC3 = FAMILY_MAP.filter((f) => ['f-arith', 'f-solveeq', 'f-simplify'].includes(f.id))
  .reduce((a, f) => a + f.total, 0);
const famById = (id) => FAMILY_MAP.find((f) => f.id === id);
const CH_RANKED = CH_ORDER.map((k) => CH_SCORE[k]).sort((a, b) => b.avg - a.avg);
const CAT_RANKED = CAT_ORDER.map((k) => CAT_SCORE[k]).sort((a, b) => b.avg - a.avg);
const SPAN = ['', '一', '二', '三', '四', '五'][N_PAPERS] || String(N_PAPERS);

/* 章 → 该章年均分（用于章节页） */
const CH_AVG_MAX = Math.max(...CH_RANKED.map((c) => c.avg));

/* ============================ 样式（复用英语站） ============================ */
const BASE_CSS = readFileSync('work/slides-css.txt', 'utf8');
const CSS = BASE_CSS + `
/* 封面：底部数据条下移一点，避开固定定位的翻页条 */
.s-cover{padding-bottom:88px}
.slide.s-end{padding-bottom:52px}

/* 数学站补充：章节条形图与考点表 */
.ch-bars{display:flex;flex-direction:column;gap:11px}
.ch-bar-row{display:grid;grid-template-columns:110px 1fr 78px;align-items:center;gap:14px}
.ch-bar-lbl{font-size:14px;font-weight:650}
.ch-bar-track{height:24px;background:var(--surface-2);border:1px solid var(--border);
  border-radius:7px;overflow:hidden}
.ch-bar-fill{display:block;height:100%;border-radius:6px;background:var(--accent-grad)}
.ch-bar-fill.alt{background:var(--gold-grad)}
.ch-bar-val{font-size:13.5px;font-weight:700;text-align:right;font-variant-numeric:tabular-nums}
`;

/* ============================ 幻灯片 ============================ */
const deck = [];
const push = (title, html) => deck.push({ title, html });

/* 1. 封面 */
push('封面', `
<div class="slide s-cover on">
  <div class="cover-badge"><i></i>西城区区统考 · ${SPAN}年真题逐题拆解</div>
  <h1 class="cover-h">丢分的不是难题<br><em>是会做但没做对</em></h1>
  <p class="cover-sub">
    ${YEARS.join(' / ')} 五套区统考卷，${LEDGER.length} 道题逐题标注。
    全卷 ${QN} 题，必做 ${MAIN} 分。${SPAN}年里基础 + 中档稳定在 ${Math.min(...SCORE_TIERS.map(t=>t.base))}–${Math.max(...SCORE_TIERS.map(t=>t.base))} 分——
    分数差距几乎全在这部分，跟「会不会做压轴」关系不大。
  </p>
  <div class="cover-points">
    <div class="cp"><span class="cp-n">01</span><b>卷面结构</b><span>${QN} 题 / 100 分钟 / 选择 16 + 填空 16 + 解答 68，${SPAN}年未变</span></div>
    <div class="cp"><span class="cp-n">02</span><b>分数分布</b><span>基础+中档占 ${BASE_MID_PCT}%，这才是提分空间</span></div>
    <div class="cp"><span class="cp-n">03</span><b>考点权重</b><span>${FREQ.must.length} 个必考族覆盖 ${FREQ_SUMMARY.must.pct}% 分值，按此排优先级</span></div>
  </div>
  <div class="cover-meta">
    <div><b>${LEDGER.length}</b><span>题逐题标注</span></div>
    <div><b>${FAMILY_MAP.length}</b><span>个考点族</span></div>
    <div><b>${FREQ.must.length}</b><span>个必考族</span></div>
    <div><b>${BASE_MID}</b><span>基础+中档年均分</span></div>
  </div>
</div>`);

/* 2. 卷面结构 */
push('卷面结构', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Structure</span>
    <h2 class="s-title">卷面骨架：${SPAN}年一动没动</h2>
    <p class="s-sub">所以「按题型复习」的框架成立</p>
  </div>
  <div class="s-body">
    <div class="bignums" style="grid-template-columns:repeat(4,1fr)">
      <div class="bn blue"><div class="bn-n">${QN}<small>题</small></div><div class="bn-l">总题量</div>
        <div class="bn-d">必做 ${PAPER_STATS[0].mainCount} + 选做 ${PAPER_STATS[0].bonusCount}</div></div>
      <div class="bn blue"><div class="bn-n">100<small>分钟</small></div><div class="bn-l">考试时长</div>
        <div class="bn-d">平均每题 3.8 分钟</div></div>
      <div class="bn gold"><div class="bn-n">${MAIN}<small>分</small></div><div class="bn-l">必做总分</div>
        <div class="bn-d">选做 ${BONUS} 分计入，但卷面封顶 100</div></div>
      <div class="bn ok"><div class="bn-n">16<span style="font-size:22px">/</span>16<span style="font-size:22px">/</span>68</div><div class="bn-l">选择 / 填空 / 解答</div>
        <div class="bn-d">${SPAN}年完全一致</div></div>
    </div>
    <div class="callout" style="margin-top:28px">
      <b>一个例外：</b>第 19、20 题的内容会互换位置——2025-26 把「解方程」放到第 19 题（12 分）、
      「尺规作图」放到第 20 题（5 分），与往年相反。<b>要按题型认，不按题号认。</b>
    </div>
  </div>
</div>`);

/* 3. 难度结构 */
const dE = DIFF_SCORE.easy.pct, dM = DIFF_SCORE.mid.pct, dH = DIFF_SCORE.hard.pct, dT = DIFF_SCORE.top.pct;
push('难度结构', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Difficulty</span>
    <h2 class="s-title">难度${SPAN}年几乎不动</h2>
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
      <span><i class="seg-easy"></i>基础 年均 ${BASE} 分</span>
      <span><i class="seg-mid"></i>中档 年均 ${MID} 分</span>
      <span><i class="seg-hard"></i>较难 年均 ${HARD} 分</span>
      <span><i class="seg-top"></i>压轴 年均 ${TOP} 分</span>
    </div>
    <table class="tbl" style="margin-top:24px">
      <thead><tr><th>年份</th><th class="num">基础+中档</th><th class="num">较难+压轴</th><th class="num">难度指数</th></tr></thead>
      <tbody>${SCORE_TIERS.map((t, i) => `<tr>
        <td>${t.label}</td><td class="num hi">${t.base}</td>
        <td class="num">${t.hard}</td><td class="num">${PAPER_STATS[i].diffIndex}</td>
      </tr>`).join('')}</tbody>
    </table>
    <div class="callout" style="margin-top:20px">
      基础+中档${SPAN}年稳定在 <b>${Math.min(...SCORE_TIERS.map(t=>t.base))}–${Math.max(...SCORE_TIERS.map(t=>t.base))} 分</b>，
      难度指数在 <b>${DIFF_IDX_MIN}–${DIFF_IDX_MAX}</b> 之间。这套卷子<b>不是靠难题拉开差距</b>的。
    </div>
  </div>
</div>`);

/* 4. 核心结论 */
push('核心结论', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Key Finding</span>
    <h2 class="s-title">分数的主体不在压轴</h2>
    <p class="s-sub">在那些「会做」的题上</p>
  </div>
  <div class="s-body">
    <div class="bignums" style="grid-template-columns:repeat(3,1fr)">
      <div class="bn blue"><div class="bn-n">${BASE_MID}<small>分</small></div><div class="bn-l">基础 + 中档</div>
        <div class="bn-d">年均，占必做分 ${BASE_MID_PCT}%</div></div>
      <div class="bn gold"><div class="bn-n">${HARD_TOP}<small>分</small></div><div class="bn-l">较难 + 压轴</div>
        <div class="bn-d">年均，其中压轴 ${TOP} 分</div></div>
      <div class="bn ok"><div class="bn-n">${CALC_CONCEPT_PCT}<small>%</small></div><div class="bn-l">计算 + 概念占比</div>
        <div class="bn-d">靠「准确」而不是「灵感」</div></div>
    </div>
    <div class="callout gold" style="margin-top:28px;font-size:16px">
      <b>推论：</b>压轴全丢，${BASE_MID} 分的基础+中档仍然在；但基础段每丢一处，都是实打实的损失。<br>
      <b>所以复习顺序应把「计算零失误」排在「攻压轴」前面</b>——不是因为它更难，而是因为它更值钱、更可控。
    </div>
  </div>
</div>`);

/* 5. 章节分布 */
push('章节分布', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Chapters</span>
    <h2 class="s-title">六章分值分布</h2>
    <p class="s-sub">方程 ${CH_SCORE['ch-eq'].pct}% + 几何 ${CH_SCORE['ch-geo'].pct}% 是主体</p>
  </div>
  <div class="s-body">
    <div class="ch-bars">
      ${CH_RANKED.map((c) => `<div class="ch-bar-row">
        <span class="ch-bar-lbl">${c.name}</span>
        <span class="ch-bar-track"><span class="ch-bar-fill" style="width:${Math.round(c.avg / CH_AVG_MAX * 100)}%"></span></span>
        <span class="ch-bar-val">${c.avg} 分</span>
      </div>`).join('')}
    </div>
    <div class="callout" style="margin-top:24px">
      <b>最稳的是整式的加减</b>（${SPAN}年极差 ${CH_SCORE['ch-poly'].range} 分）；
      <b>波动最大的是几何与运算</b>（极差 ${CH_SCORE['ch-geo'].range} 与 ${CH_SCORE['ch-op'].range} 分），
      而且两者此消彼长——几何重的年份运算就轻。
    </div>
  </div>
</div>`);

/* 6. 能力分布 */
const CAT_MAX = Math.max(...CAT_RANKED.map((c) => c.avg));
push('能力分布', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Abilities</span>
    <h2 class="s-title">八种能力的分值分布</h2>
    <p class="s-sub">计算 ${CAT_SCORE['计算'].pct}% + 概念 ${CAT_SCORE['概念'].pct}% = ${CALC_CONCEPT_PCT}%，近六成靠「准确」</p>
  </div>
  <div class="s-body">
    <div class="ch-bars">
      ${CAT_RANKED.map((c) => `<div class="ch-bar-row" style="grid-template-columns:88px 1fr 96px">
        <span class="ch-bar-lbl" style="font-size:13px">${c.name}</span>
        <span class="ch-bar-track" style="height:22px"><span class="ch-bar-fill${c.pct >= 30 ? '' : ' alt'}" style="width:${Math.round(c.avg / CAT_MAX * 100)}%"></span></span>
        <span class="ch-bar-val" style="font-size:13px">${c.avg} 分 · ${c.pct}%</span>
      </div>`).join('')}
    </div>
    <div class="callout" style="margin-top:22px">
      <b>分类讨论连续两年 13 分</b>（2024-25、2025-26），是唯一明显上升的能力。
      <b>新定义在必做位已消失</b>——2025-26 全部落在选做。
    </div>
  </div>
</div>`);

/* 7. 考点权重（前 7 族） */
push('考点权重', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Weight</span>
    <h2 class="s-title">分值最高的 7 个考点族</h2>
    <p class="s-sub">按年均分值降序——这才是排优先级的依据</p>
  </div>
  <div class="s-body">
    <table class="tbl">
      <thead><tr><th>考点族</th><th class="num">年均分</th><th class="num">占卷面</th><th>出现</th><th>说明</th></tr></thead>
      <tbody>${TOP_FAMS.map((f) => `<tr>
        <td><b>${esc(f.name)}</b></td>
        <td class="num hi">${f.avgPerYear}</td>
        <td class="num">${Math.round(f.avgPerYear / MAIN * 100)}%</td>
        <td>${f.hitYears}/${N_PAPERS}</td>
        <td style="white-space:normal;color:var(--text-3);font-size:12.5px">${esc(f.note)}</td>
      </tr>`).join('')}</tbody>
    </table>
    <div class="callout gold" style="margin-top:20px">
      前 7 族合计年均 <b>${TOP_FAMS.reduce((a, f) => a + f.avgPerYear, 0).toFixed(1)} 分</b>，
      占卷面 <b>${Math.round(sum(TOP_FAMS.map(f => f.avgPerYear)) / MAIN * 100)}%</b>。
      首末族年均差 <b>${(TOP_FAMS[0].avgPerYear - TOP_FAMS[TOP_FAMS.length - 1].avgPerYear).toFixed(1)} 分</b>——这个差距就是优先级。
    </div>
  </div>
</div>`);

/* 8. 必考 12 族 */
push('必考清单', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Must-Know</span>
    <h2 class="s-title">${SPAN}年年年考的 ${FREQ.must.length} 个族</h2>
    <p class="s-sub">覆盖必做分 ${FREQ_SUMMARY.must.pct}%（${FREQ_SUMMARY.must.score}/${MAIN_GRAND} 分）</p>
  </div>
  <div class="s-body">
    <table class="tbl compact">
      <thead><tr><th>考点族</th><th class="num">五年总分</th><th class="num">年均</th><th>说明</th></tr></thead>
      <tbody>${FREQ.must.slice(0, 8).map((f) => `<tr>
        <td><b>${esc(f.name)}</b></td>
        <td class="num">${f.total}</td>
        <td class="num hi">${f.avgPerYear}</td>
        <td style="white-space:normal;color:var(--text-3);font-size:12px">${esc(f.note)}</td>
      </tr>`).join('')}</tbody>
    </table>
    <div class="callout" style="margin-top:14px">
      其余 ${FREQ.must.length - 8} 族（${FREQ.must.slice(8).map((f) => f.name).join('、')}）也都是年年考，
      只是分值较低、题型固定。
    </div>
  </div>
</div>`);

/* 9. 压轴专题 */
push('压轴专题', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Hardest</span>
    <h2 class="s-title">第 23 题：${SPAN}年全是「分类讨论」</h2>
    <p class="s-sub">载体每年换，内核不变</p>
  </div>
  <div class="s-body">
    <table class="tbl">
      <thead><tr><th>年份</th><th>第 23 题考什么</th><th class="num">分值</th><th>能力</th></tr></thead>
      <tbody>${PAPER_STATS.map((s) => {
        const q = LEDGER.find((x) => x.p === s.id && x.no === 23);
        return `<tr><td>${s.label}</td><td>${q ? esc(q.topic) : '—'}</td>
          <td class="num">${q ? q.score : '—'}</td><td>${q ? q.cat : '—'}</td></tr>`;
      }).join('')}</tbody>
    </table>
    <div class="callout gold" style="margin-top:22px;font-size:15px">
      <b>训练方法不是刷各种载体</b>，而是练「分类的完备性」：<br>
      动点在哪些区间？动角转到哪些位置？端点重合算不算？<b>漏一种就是丢一半分。</b>
    </div>
  </div>
</div>`);

/* 10. 优先级 */
const PRI = [
  ['01', '计算零失误', '正确率 100%，不是 95%', `${CALC3} 分`],
  ['02', '概念辨析', '靠「陷阱清单」，不靠刷题', `${CAT_SCORE['概念'].pct}%`],
  ['03', '几何说理格式', '格式分，不是智力分', `${famById('f-construct').total} 分`],
  ['04', '分类压轴', '练分类完备性', `${famById('f-final').total} 分`],
  ['05', '选做新定义', '必做全对再碰', `${BONUS} 分`],
];
push('优先级', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Priority</span>
    <h2 class="s-title">五级优先，按「能不能练稳」排序</h2>
    <p class="s-sub">顺序由${SPAN}年真题的考法分布决定</p>
  </div>
  <div class="s-body">
    <div class="pri-list">
      ${PRI.map(([n, t, s, v]) => `<div class="pri-item">
        <span class="pri-no">${n}</span>
        <div><div style="font-size:15px;font-weight:700">${t}</div><div style="font-size:12.5px;color:var(--text-3);margin-top:2px">${s}</div></div>
        <span style="font-size:13.5px;font-weight:700;color:var(--text-2);white-space:nowrap">${v}</span>
      </div>`).join('')}
    </div>
  </div>
</div>`);

/* 11. 结论 */
push('结论', `
<div class="slide s-end" style="justify-content:center;align-items:flex-start;padding-top:96px;
  background:radial-gradient(ellipse 90% 70% at 20% 0%,rgba(37,99,235,.12),transparent 65%),var(--bg)">
  <h2 class="end-h">三句话总结</h2>
  <div class="end-list">
    <div class="end-item"><span class="end-dot"></span><span>卷面${SPAN}年不变，<b>基础+中档稳定 ${Math.min(...SCORE_TIERS.map(t=>t.base))}–${Math.max(...SCORE_TIERS.map(t=>t.base))} 分</b>——分数主体就在这里</span></div>
    <div class="end-item"><span class="end-dot"></span><span><b>${FREQ.must.length} 个必考族覆盖 ${FREQ_SUMMARY.must.pct}% 分值</b>，其中计算三块合计 ${CALC3} 分</span></div>
    <div class="end-item"><span class="end-dot"></span><span>复习顺序应该是<b>先保计算零失误，再攻分类压轴</b>，而不是反过来</span></div>
  </div>
  <div class="cover-meta" style="margin-top:56px;border-top:1px solid var(--border);padding-top:28px;width:100%">
    <div><b>${LEDGER.length}</b><span>题逐题标注</span></div>
    <div><b>${N_PAPERS}</b><span>套真题样本</span></div>
    <div><b>${FAMILY_MAP.length}</b><span>个考点族</span></div>
  </div>
</div>`);

/* ============================ 输出（交互复用英语站） ============================ */
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>考情解读 · 西城区初一（上）数学期末</title>
<style>${CSS}</style>
</head>
<body>
<div id="stage"><div id="deck">
${deck.map((s) => s.html).join('\n')}
</div></div>

<div id="pager" style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:20;
  display:flex;align-items:center;gap:12px;background:rgba(15,23,42,.72);backdrop-filter:blur(12px);
  padding:8px 14px;border-radius:999px;color:#e2e8f0;font-size:13px;font-family:var(--mono)">
  <button id="prev" aria-label="上一页" style="background:none;border:none;color:#94a3b8;font-size:16px;cursor:pointer;padding:2px 6px">‹</button>
  <span><b id="cur">1</b> / ${deck.length}</span>
  <button id="next" aria-label="下一页" style="background:none;border:none;color:#94a3b8;font-size:16px;cursor:pointer;padding:2px 6px">›</button>
  <button id="ov" aria-label="总览" style="margin-left:6px;background:none;border:none;color:#94a3b8;font-size:14px;cursor:pointer">⊞</button>
  <button id="fs" aria-label="全屏" style="background:none;border:none;color:#94a3b8;font-size:14px;cursor:pointer">⛶</button>
  <a href="index.html" title="返回站点" style="color:#94a3b8;text-decoration:none;font-size:14px;padding:2px 6px">↩</a>
</div>

<div id="bar" style="position:fixed;bottom:0;left:0;height:3px;background:var(--accent-grad);z-index:21;transition:width .2s"></div>

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

  var x0=null;
  document.addEventListener('touchstart',function(e){ x0=e.touches[0].clientX; },{passive:true});
  document.addEventListener('touchend',function(e){
    if(x0===null) return;
    var dx=e.changedTouches[0].clientX-x0;
    if(Math.abs(dx)>50){ dx<0?next():prev(); }
    x0=null;
  },{passive:true});

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
