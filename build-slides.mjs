#!/usr/bin/env node
// 演示用的 Web PPT：面向家长与学生的考情讲解
//
// 设计系统与交互复用英语期末站（~/Desktop/thinking/english/build-slides.mjs）：
// 16:9 舞台按窗口等比缩放、← → / 空格翻页、F 全屏、O 总览、?p=N 定位、打印分页。
// 本文件只换数据与内容——所有数字从 work/papers 的台账派生，不手写。
//
// 内容取舍：这是给家长和学生讲的，不是审计报告。
// 只留三类东西——卷子稳不稳（能不能按图施工）、分在哪（哪里最值钱）、
// 难的部分是否可预测（能不能提前练）。章节分值、八能力条形图这类"看板"
// 全部不进演示：家长听完不会因为它改变任何动作。
import { writeFileSync, readFileSync } from 'node:fs';

import {
  PAPER_STATS, DIFF_SCORE, FAMILY_MAP,
  FREQ, FREQ_SUMMARY, SCORE_TIERS, MAIN_GRAND, N_PAPERS,
} from './work/papers/stats.mjs';
import { DIFF_NAME, LEDGER } from './work/papers/ledger.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sum = (a) => a.reduce((x, y) => x + y, 0);
const W = { easy: 1, mid: 2, hard: 3, top: 4 };

/* ============================ 派生量 ============================ */
const MAIN = PAPER_STATS[0].mainTotal;          // 100 必做
const BONUS = PAPER_STATS[0].bonusTotal;        // 10 选做
const QN = PAPER_STATS[0].qCount;               // 26 题
const BASE = DIFF_SCORE.easy.avg;
const MID = DIFF_SCORE.mid.avg;
const HARD = DIFF_SCORE.hard.avg;
const TOP = DIFF_SCORE.top.avg;
const BASE_MID = +(BASE + MID).toFixed(1);
const HARD_TOP = +(HARD + TOP).toFixed(1);
const DIFF_IDX = PAPER_STATS.map((p) => p.diffIndex);
const DIFF_IDX_MIN = Math.min(...DIFF_IDX);
const DIFF_IDX_MAX = Math.max(...DIFF_IDX);
const famById = (id) => FAMILY_MAP.find((f) => f.id === id);
const SPAN = ['', '一', '二', '三', '四', '五'][N_PAPERS] || String(N_PAPERS);

/* 必做 / 选做 */
const mainOf = (p) => LEDGER.filter((q) => q.p === p && !q.bonus);
const bonusOf = (p) => LEDGER.filter((q) => q.p === p && q.bonus);

/* 断崖：前 20 题 vs 第 21 题之后（均限定必做） */
const CLIFF = PAPER_STATS.map((s) => {
  const front = mainOf(s.id).filter((q) => q.no <= 20);
  const back = mainOf(s.id).filter((q) => q.no > 20);
  const f = sum(front.map((q) => q.score));
  const b = sum(back.map((q) => q.score));
  const idx = (arr, tot) => sum(arr.map((q) => W[q.diff] * q.score)) / tot;
  return { label: s.label, f, b, fi: +idx(front, f).toFixed(2), bi: +idx(back, b).toFixed(2) };
});
const FRONT_AVG = +(sum(CLIFF.map((c) => c.f)) / N_PAPERS).toFixed(1);
const BACK_AVG = +(sum(CLIFF.map((c) => c.b)) / N_PAPERS).toFixed(1);
const FRONT_RANGE = [Math.min(...CLIFF.map((c) => c.f)), Math.max(...CLIFF.map((c) => c.f))];
const BACK_RANGE = [Math.min(...CLIFF.map((c) => c.b)), Math.max(...CLIFF.map((c) => c.b))];
const FRONT_IDX_RANGE = [Math.min(...CLIFF.map((c) => c.fi)), Math.max(...CLIFF.map((c) => c.fi))];
const BACK_IDX_RANGE = [Math.min(...CLIFF.map((c) => c.bi)), Math.max(...CLIFF.map((c) => c.bi))];
/* 后段 / 前段的难度倍数区间：2021-22 只有 1.73 倍，写「两倍」是虚报 */
const BACK_RATIO = (() => {
  const r = CLIFF.map((c) => c.bi / c.fi);
  return [+Math.min(...r).toFixed(1), +Math.max(...r).toFixed(1)];
})();
/* 区间格式化：上下限相等时只写一个数，不写「8–8」 */
const rng = (a, b) => (a === b ? String(a) : a + '–' + b);

/* 卷面结构：五年是否真的没变（决定第 2 页能不能说「结构没变」） */
const SEG_LABEL = (() => {
  const s0 = PAPER_STATS[0];
  const fixed = PAPER_STATS.every((s) => JSON.stringify(s.seg) === JSON.stringify(s0.seg));
  return fixed ? `${s0.seg['选择']} / ${s0.seg['填空']} / ${s0.seg['解答']}` : '逐年有调整';
})();

/* 五个「五年零例外都是基础档」的题位 —— 程序判定，不手写 */
const byNo = new Map();
for (const q of LEDGER) {
  if (!byNo.has(q.no)) byNo.set(q.no, []);
  byNo.get(q.no).push(q);
}
const STABLE_EASY = [...byNo.entries()]
  .filter(([, qs]) => qs.length === N_PAPERS && qs.every((q) => q.diff === 'easy'))
  .sort((a, b) => a[0] - b[0])
  .map(([no, qs]) => ({
    no,
    score: qs[0].score,
    scoreMax: Math.max(...qs.map((q) => q.score)),
    topics: [...new Set(qs.map((q) => q.topic))],
  }));
/* 必考族卡片：族名是 stats.mjs 的原始定义，但演示里第 23 题已有专页，
   这里把「分类压轴」的构成（第 23/24/26 题）显式标出来，避免与那一页串味 */
const FAM_CARDS = FREQ.must.map((f) => {
  let note = '';
  if (f.id === 'f-final') {
    const nos = [...new Set(f.slots.map((s) => s.no))].sort((a, b) => a - b);
    note = '第 ' + nos.join('、') + ' 题合计';
  }
  return { ...f, note };
});
/* 第 5 页只讲客观题位：第 17 题单独占一页，不在这里重复列 */
const STABLE_OBJ = STABLE_EASY.filter((s) => s.no <= 16);
const STABLE_OBJ_SUM_MIN = STABLE_OBJ.reduce((a, s) => a + s.score, 0);
const STABLE_OBJ_SUM_MAX = STABLE_OBJ.reduce((a, s) => a + s.scoreMax, 0);

/* 反向证据：五年里唯一一个难度真跳过的题位。有它，「稳」才不是空话。 */
const JUMP = [...byNo.entries()]
  .filter(([, qs]) => qs.length === N_PAPERS)
  .map(([no, qs]) => {
    const w = qs.map((q) => W[q.diff]);
    return { no, span: Math.max(...w) - Math.min(...w), qs: PAPER_STATS.map((s) => qs.find((q) => q.p === s.id)) };
  })
  .filter((j) => j.span >= 2)
  .sort((a, b) => b.span - a.span);

/* 第 17 题：全卷单题分值最高，五年同一考点同一档 */
const Q17 = PAPER_STATS.map((s) => {
  const q = LEDGER.find((x) => x.p === s.id && x.no === 17);
  return { label: s.label, score: q.score, diff: q.diff, topic: q.topic };
});
const Q17_MIN = Math.min(...Q17.map((q) => q.score));
const Q17_MAX = Math.max(...Q17.map((q) => q.score));
const Q17_SAME_TOPIC = new Set(Q17.map((q) => q.topic)).size === 1;
const Q17_ALL_EASY = Q17.every((q) => q.diff === 'easy');
/* 第 23 + 24 两题之和，逐年 */
const TAIL2 = PAPER_STATS.map((s) => {
  const a = LEDGER.find((x) => x.p === s.id && x.no === 23);
  const b = LEDGER.find((x) => x.p === s.id && x.no === 24);
  return (a ? a.score : 0) + (b ? b.score : 0);
});
const TAIL2_MAX = Math.max(...TAIL2);
/* 第 17 题是否每年都超过 23+24 之和 */
const Q17_BEATS_TAIL = Q17.every((q, i) => q.score > TAIL2[i]);

/* 计算三块：连同题位一起给出——"位置也不变"才是可执行的部分。
   slots 是台账派生好的逐年落点，不另外算。
   题位写法：只在一年出现的位置标出是哪一年，避免读成"两个位置都考"。 */
const CALC3 = ['f-arith', 'f-solveeq', 'f-simplify'].map((id) => {
  const f = famById(id);
  const noCount = new Map();
  for (const s of f.slots) noCount.set(s.no, (noCount.get(s.no) || 0) + 1);
  const uniq = [...noCount.keys()].sort((a, b) => a - b);
  const fixedSlot = uniq.length === 1;
  let slotLabel;
  if (fixedSlot) {
    slotLabel = '第 ' + uniq[0] + ' 题';
  } else {
    /* 主位（出现次数最多）+ 例外年份 */
    const mainNo = [...noCount.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const odd = f.slots.filter((s) => s.no !== mainNo);
    const oddYears = odd.map((s) => PAPER_STATS.find((p) => p.id === s.p).label);
    slotLabel = '第 ' + mainNo + ' 题' + (oddYears.length ? '（' + oddYears.join('、') + ' 在第 ' + odd[0].no + ' 题）' : '');
  }
  return { ...f, nos: uniq, fixedSlot, slotLabel };
});
const CALC3_TOTAL = sum(CALC3.map((f) => f.total));
const CALC3_AVG = +(CALC3_TOTAL / N_PAPERS).toFixed(1);

/* 能力：计算 + 概念 */
const CAT = { 计算: 0, 概念: 0 };
for (const q of LEDGER) {
  if (q.bonus) continue;
  if (q.cat in CAT) CAT[q.cat] += q.score;
}
const CALC_AVG = +(CAT['计算'] / N_PAPERS).toFixed(1);
const CONCEPT_AVG = +(CAT['概念'] / N_PAPERS).toFixed(1);
const CALC_PCT = Math.round((CALC_AVG / MAIN) * 100);
const CONCEPT_PCT = Math.round((CONCEPT_AVG / MAIN) * 100);
const ACC_PCT = CALC_PCT + CONCEPT_PCT;

/* 第 23 题：五年全是分类 */
const Q23 = PAPER_STATS.map((s) => {
  const q = LEDGER.find((x) => x.p === s.id && x.no === 23);
  return { label: s.label, topic: q.topic, score: q.score, cat: q.cat };
});
const Q23_ALL_CLASSIFY = Q23.every((q) => q.cat === '分类');

/* ---- 在变：演示必须跟上「整体解读」的最新结论 ---- */
/* 分类能力逐年分值 */
const CLASSIFY = PAPER_STATS.map((s) => sum(LEDGER.filter((q) => q.p === s.id && q.cat === '分类').map((q) => q.score)));
const CLS_LAST2 = CLASSIFY.slice(-2);
const CLS_SAME_LAST2 = CLS_LAST2[0] === CLS_LAST2[1];
const CLS_MIN = Math.min(...CLASSIFY);
const CLS_MAX = Math.max(...CLASSIFY);

/* 新定义逐年：必做 / 选做 分开算——「退出必做位」这句话要能站住 */
const NEWDEF = PAPER_STATS.map((s) => {
  const qs = LEDGER.filter((q) => q.p === s.id && q.cat === '新定义');
  return {
    label: s.label,
    main: sum(qs.filter((q) => !q.bonus).map((q) => q.score)),
    bonus: sum(qs.filter((q) => q.bonus).map((q) => q.score)),
  };
});
const ND_LAST_MAIN = NEWDEF[NEWDEF.length - 1].main;
const ND_LAST_BONUS = NEWDEF[NEWDEF.length - 1].bonus;
const ND_PREV_MAIN = NEWDEF[NEWDEF.length - 2].main;
const ND_EXITED = ND_LAST_MAIN === 0 && NEWDEF.slice(0, 2).every((d) => d.main > 0);

/* 考频三档 */
const FREQ_TIERS = [
  { tag: 'must', label: '必考', desc: '五年年年出现', d: FREQ_SUMMARY.must },
  { tag: 'often', label: '偶考', desc: '五年出现 3–4 次', d: FREQ_SUMMARY.often },
  { tag: 'rare', label: '极少考', desc: '五年出现 1–2 次', d: FREQ_SUMMARY.rare },
];

/* ============================ 样式（复用英语站） ============================ */
const BASE_CSS = readFileSync('work/slides-css.txt', 'utf8');
const CSS = BASE_CSS + `
/* 封面：内容比标准页高，收紧上下留白，保证底部数据条不被翻页条压住。
   720px 高的舞台里 96+88 的内边距太奢侈。 */
.s-cover{padding-top:64px;padding-bottom:74px}
.s-cover .cover-points{margin-top:26px;gap:11px}
.s-cover .cover-meta{padding-top:24px}
.s-cover .cover-h{margin-bottom:18px}
.slide.s-end{padding-bottom:52px}

/* 断崖对比：两栏卡片 + 一条比例尺 */
/* align-items:start —— 两栏内容不等长时，短的那栏不要被拉高留出空白 */
.cliff{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
.cliff-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px 22px}
.cliff-card.hot{border-color:rgba(37,99,235,.34);background:rgba(37,99,235,.045)}
.cliff-tag{font-family:var(--mono);font-size:11.5px;letter-spacing:.08em;color:var(--text-3);text-transform:uppercase}
.cliff-n{font-size:38px;font-weight:800;letter-spacing:-.035em;line-height:1.1;margin-top:6px;
  font-variant-numeric:tabular-nums}
.cliff-card.hot .cliff-n{color:var(--accent)}
.cliff-d{font-size:12.5px;color:var(--text-3);margin-top:6px;line-height:1.55}
.split{display:flex;height:34px;border-radius:9px;overflow:hidden;border:1px solid var(--border);margin-top:18px}
.split i{display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:700;color:#fff}

/* 必考族清单 */
.chips{display:flex;flex-wrap:wrap;gap:9px}
.chip{display:inline-flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border);
  border-radius:9px;padding:8px 13px;font-size:13px;font-weight:650}
.chip b{color:var(--accent);font-variant-numeric:tabular-nums;font-size:12.5px;font-weight:800}

/* 三块计算题族 */
.calc-bars{display:flex;flex-direction:column;gap:13px}
.calc-row{display:grid;grid-template-columns:200px 1fr 86px;align-items:center;gap:14px}
.calc-lbl{font-size:14px;font-weight:650}
.calc-track{height:24px;background:var(--surface-2);border:1px solid var(--border);border-radius:7px;overflow:hidden}
.calc-fill{display:block;height:100%;border-radius:6px;background:var(--accent-grad)}
.calc-val{font-size:13.5px;font-weight:700;text-align:right;font-variant-numeric:tabular-nums}

/* 必考族卡片网格 */
.fam-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}
.fam-card{background:var(--surface);border:1px solid var(--border);border-radius:11px;padding:11px 14px}
.fam-name{font-size:13px;font-weight:700;line-height:1.35}
.fam-meta{display:flex;align-items:baseline;gap:7px;margin-top:6px}
.fam-avg{font-size:19px;font-weight:800;color:var(--accent);font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.fam-unit{font-size:11.5px;color:var(--text-3)}
.fam-bar{height:5px;background:var(--surface-2);border-radius:3px;margin-top:7px;overflow:hidden}
.fam-bar i{display:block;height:100%;border-radius:3px;background:var(--accent-grad)}
.fam-note{font-size:11px;color:var(--text-3);margin-top:1px}
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
    ${PAPER_STATS.map((s) => s.label).join(' / ')} 五套区统考卷，${LEDGER.length} 道题逐题标注。
    全卷 ${QN} 题、必做 ${MAIN} 分。${SPAN}年里基础 + 中档从没低过 ${Math.min(...SCORE_TIERS.map((t) => t.base))} 分——
    分数的主体不在压轴。
  </p>
  <div class="cover-points">
    <div class="cp"><span class="cp-n">01</span><b>卷子很稳</b><span>难度指数 ${DIFF_IDX_MIN}–${DIFF_IDX_MAX}，${SPAN}年几乎没有波动</span></div>
    <div class="cp"><span class="cp-n">02</span><b>分在哪</b><span>第 17 题一道 ${Q17_MIN}–${Q17_MAX} 分，比两道压轴加起来还多</span></div>
    <div class="cp"><span class="cp-n">03</span><b>难的部分也固定</b><span>第 23 题${SPAN}年${Q23_ALL_CLASSIFY ? '全是分类讨论' : '题型集中'}</span></div>
  </div>
  <div class="cover-meta">
    <div><b>${LEDGER.length}</b><span>题逐题标注</span></div>
    <div><b>${FAMILY_MAP.length}</b><span>个考点族</span></div>
    <div><b>${FREQ.must.length}</b><span>个必考族</span></div>
    <div><b>${BASE_MID}</b><span>基础+中档年均分</span></div>
  </div>
</div>`);

/* 2. 卷子很稳 */
push('卷子很稳', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Stable</span>
    <h2 class="s-title">${SPAN}年真题，难度几乎没变过</h2>
    <p class="s-sub">基础 + 中档 ${Math.min(...SCORE_TIERS.map((t) => t.base))}–${Math.max(...SCORE_TIERS.map((t) => t.base))} 分，难度指数 ${DIFF_IDX_MIN}–${DIFF_IDX_MAX}</p>
  </div>
  <div class="s-body">
    <div class="bignums" style="grid-template-columns:repeat(3,1fr)">
      <div class="bn blue"><div class="bn-n">${BASE_MID}<small>分</small></div><div class="bn-l">基础 + 中档</div>
        <div class="bn-d">年均，占必做 ${Math.round(BASE_MID / MAIN * 100)}%</div></div>
      <div class="bn gold"><div class="bn-n">${HARD_TOP}<small>分</small></div><div class="bn-l">较难 + 压轴</div>
        <div class="bn-d">年均，其中压轴 ${TOP} 分</div></div>
      <div class="bn ok"><div class="bn-n">${DIFF_IDX_MIN}<span style="font-size:24px">–</span>${DIFF_IDX_MAX}</div><div class="bn-l">难度指数区间</div>
        <div class="bn-d">${SPAN}年全部落在这里</div></div>
    </div>
    <table class="tbl" style="margin-top:26px">
      <thead><tr><th>年份</th><th class="num">基础+中档</th><th class="num">较难+压轴</th><th class="num">难度指数</th></tr></thead>
      <tbody>${SCORE_TIERS.map((t, i) => `<tr>
        <td>${t.label}</td><td class="num hi">${t.base}</td>
        <td class="num">${t.hard}</td><td class="num">${PAPER_STATS[i].diffIndex}</td>
      </tr>`).join('')}</tbody>
    </table>
    <div class="callout" style="margin-top:20px">
      这张卷子<b>不靠难题区分学生</b>。基础 + 中档${SPAN}年从没低过
      ${Math.min(...SCORE_TIERS.map((t) => t.base))} 分，也从未高过
      ${Math.max(...SCORE_TIERS.map((t) => t.base))} 分——所以备考可以按图施工，不用赌今年变不变。<br>
      另外两件也五年没动：<b>卷面结构 ${SEG_LABEL}</b>（${PAPER_STATS[0].mainCount} 必做 + ${PAPER_STATS[0].bonusCount} 选做），
      <b>${STABLE_EASY.length} 个题位零例外都是基础档</b>（第 ${STABLE_EASY.map((s) => s.no).join('、')} 题）。
    </div>
  </div>
</div>`);

/* 3. 第 17 题 */
push('第 17 题', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Highest Leverage</span>
    <h2 class="s-title">全卷最值钱的一道题：第 17 题</h2>
    <p class="s-sub">单题 ${Q17_MIN}–${Q17_MAX} 分，${SPAN}年${Q17_SAME_TOPIC ? '都是同一个考点' : '考点集中'}${Q17_ALL_EASY ? '、都是基础档' : ''}</p>
  </div>
  <div class="s-body">
    <div class="bignums" style="grid-template-columns:repeat(2,1fr)">
      <div class="bn blue"><div class="bn-n">${Q17_MAX}<small>分</small></div><div class="bn-l">单题分值 · 全卷最高</div>
        <div class="bn-d">而且是 ${SPAN} 年里最重的一次（${Q17_MIN} → ${Q17_MAX}，逐年加码）</div></div>
      <div class="bn gold"><div class="bn-n">${N_PAPERS}<small>年</small></div><div class="bn-l">考点与难度档全都没变</div>
        <div class="bn-d">${Q17_SAME_TOPIC ? '年年都是' + Q17[0].topic : '考点稳定'}${Q17_ALL_EASY ? '，且年年都是基础档' : ''}</div></div>
    </div>
    <table class="tbl compact" style="margin-top:22px">
      <thead><tr><th>年份</th><th class="num">分值</th><th>难度</th><th>考什么</th></tr></thead>
      <tbody>${Q17.map((q) => `<tr><td>${q.label}</td><td class="num hi">${q.score}</td>
        <td>${DIFF_NAME[q.diff]}</td><td>${esc(q.topic)}</td></tr>`).join('')}</tbody>
    </table>
    <div class="callout gold" style="margin-top:18px">
      第 23、24 两道压轴加起来是 ${Math.min(...TAIL2)}–${TAIL2_MAX} 分，<b>比第 17 题还少</b>。
      一道会做的题上丢了分，比压轴不会做更亏——因为它本来不该丢。
    </div>
  </div>
</div>`);

/* 4. 断崖 */
push('断崖', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">The Cliff</span>
    <h2 class="s-title">断崖在第 20 题之后</h2>
    <p class="s-sub">前 20 题 ${rng(...FRONT_RANGE)} 分、难度指数 ${rng(...FRONT_IDX_RANGE)}；第 21 题起 ${rng(...BACK_RANGE)} 分、指数 ${rng(...BACK_IDX_RANGE)}</p>
  </div>
  <div class="s-body">
    <div class="cliff">
      <div class="cliff-card hot">
        <div class="cliff-tag">第 1–20 题 · 熟练度</div>
        <div class="cliff-n">${FRONT_AVG}<small style="font-size:16px;font-weight:650;color:var(--text-3)"> 分</small></div>
        <div class="cliff-d">年均占必做 ${Math.round(FRONT_AVG)}%。难度指数 ${rng(...FRONT_IDX_RANGE)}，
          ${SPAN}年都在 1.4 上下——这一段考的是熟练，不是灵感。</div>
      </div>
      <div class="cliff-card">
        <div class="cliff-tag">第 21–24 题 · 思维</div>
        <div class="cliff-n">${BACK_AVG}<small style="font-size:16px;font-weight:650;color:var(--text-3)"> 分</small></div>
        <div class="cliff-d">年均占必做 ${Math.round(BACK_AVG)}%。难度指数 ${rng(...BACK_IDX_RANGE)}，
          是前一段的 ${rng(...BACK_RATIO)} 倍——这里才开始真正筛人。</div>
      </div>
    </div>
    <div class="split">
      <i class="seg-easy" style="width:${FRONT_AVG}%">前 20 题 ${FRONT_AVG} 分</i>
      <i class="seg-top" style="width:${BACK_AVG}%">${BACK_AVG} 分</i>
    </div>
    <div class="callout" style="margin-top:20px">
      两段的练法不一样：<b>前 20 题练"不出错"</b>（限时、验算、错题重做），
      <b>第 21 题之后练"想清楚"</b>（读题、分类、写过程）。
      用攻难题的方式练前 20 题，或者用刷基础的方式练压轴，都是白花时间。
    </div>
  </div>
</div>`);

/* 5. 四个稳定客观题位 */
push('稳定题位', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">No Surprise</span>
    <h2 class="s-title">${STABLE_OBJ.length} 个选择题位，${SPAN}年零例外都是基础档</h2>
    <p class="s-sub">合计 ${rng(STABLE_OBJ_SUM_MIN, STABLE_OBJ_SUM_MAX)} 分——这些位置没有「今年变难」的先例</p>
  </div>
  <div class="s-body">
    <table class="tbl">
      <thead><tr><th>题号</th><th class="num">分值</th><th>${SPAN}年考过什么</th></tr></thead>
      <tbody>${STABLE_OBJ.map((s) => `<tr>
        <td><b>第 ${s.no} 题</b></td>
        <td class="num hi">${s.score === s.scoreMax ? s.score : s.score + '–' + s.scoreMax}</td>
        <td style="white-space:normal">${s.topics.map(esc).join(' · ')}</td>
      </tr>`).join('')}</tbody>
    </table>
    <div class="callout" style="margin-top:18px">
      这 ${STABLE_OBJ.length} 处失分<b>只可能来自熟练度，不来自难度</b>。
      考前一题一题过、限时做对，是确定性最高的一件事。
    </div>
    ${JUMP.length ? `<div class="callout rose" style="margin-top:12px">
      <b>唯一的例外是第 ${JUMP[0].no} 题</b>（2 分）：${JUMP[0].qs.map((q) => DIFF_NAME[q.diff]).join(' → ')}，
      载体从${esc(JUMP[0].qs[0].topic)}换到${esc(JUMP[0].qs[JUMP[0].qs.length - 1].topic)}。
      全卷只有这一处难度真的跳，其余位置都可以按"年年一样"来准备。
    </div>` : ''}
  </div>
</div>`);

/* 6. 计算 */
push('计算', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Accuracy</span>
    <h2 class="s-title">计算占四成，是唯一能练到不出错的能力</h2>
    <p class="s-sub">计算 ${CALC_AVG} 分（${CALC_PCT}%）+ 概念 ${CONCEPT_AVG} 分（${CONCEPT_PCT}%）= ${ACC_PCT}%，靠「准确」而不是「灵感」</p>
  </div>
  <div class="s-body">
    <div class="calc-bars">
      ${CALC3.map((f) => `<div class="calc-row">
        <span class="calc-lbl">${esc(f.name)}</span>
        <span class="calc-track"><span class="calc-fill" style="width:${Math.round(f.avgPerYear / CALC3[0].avgPerYear * 100)}%"></span></span>
        <span class="calc-val">${f.avgPerYear} 分/年</span>
      </div>`).join('')}
    </div>
    <table class="tbl compact" style="margin-top:20px">
      <thead><tr><th>考什么</th><th>落在哪一题</th><th class="num">单题分值</th><th>${SPAN}年难度</th></tr></thead>
      <tbody>${CALC3.map((f) => `<tr>
        <td><b>${esc(f.name)}</b></td>
        <td>${f.fixedSlot ? f.slotLabel + '<span style="color:var(--text-3)"> · 五年没动过</span>' : f.slotLabel}</td>
        <td class="num hi">${Math.min(...f.scores)}${Math.min(...f.scores) === Math.max(...f.scores) ? '' : '–' + Math.max(...f.scores)}</td>
        <td>基础</td>
      </tr>`).join('')}</tbody>
    </table>
    <div class="callout gold" style="margin-top:18px">
      这三块${SPAN}年合计年均 <b>${CALC3_AVG} 分</b>——考点、题型、难度档全都不变，
      位置最多在相邻两题之间挪一次。
      全卷再没有第二处<b>投入就能换来确定性</b>的地方：它不需要聪明，只需要不出错。
    </div>
  </div>
</div>`);

/* 7. 第 23 题 */
push('第 23 题', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Predictable Hard</span>
    <h2 class="s-title">最难的第 23 题，${SPAN}年${Q23_ALL_CLASSIFY ? '全是「分类讨论」' : '题型集中'}</h2>
    <p class="s-sub">载体年年换，内核不变</p>
  </div>
  <div class="s-body">
    <table class="tbl">
      <thead><tr><th>年份</th><th>第 23 题考什么</th><th class="num">分值</th><th>能力</th></tr></thead>
      <tbody>${Q23.map((q) => `<tr><td>${q.label}</td><td>${esc(q.topic)}</td>
        <td class="num">${q.score}</td><td>${q.cat}</td></tr>`).join('')}</tbody>
    </table>
    <div class="callout gold" style="margin-top:22px;font-size:15px">
      换的只是<b>载体</b>——动点、动角、还是线段中点。<br>
      不变的是同一件事：<b>把可能的情况列全</b>。动点落在哪些区间？动角转到哪些位置？端点重合算不算？<br>
      所以别把这 ${Q23.length} 道题当成 ${Q23.length} 种题去背——要练的是分类的完备性：<b>漏一种，就丢一半分。</b>
    </div>
  </div>
</div>`);

/* 8. 在变（与「整体解读」的「在变」一节同源） */
push('在变', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Changing</span>
    <h2 class="s-title">两处真在变，别按旧印象准备</h2>
    <p class="s-sub">其余都是噪声，不足以改复习顺序</p>
  </div>
  <div class="s-body">
    <div class="cliff">
      <div class="cliff-card hot">
        <div class="cliff-tag">分类讨论在加重</div>
        <div style="display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin:10px 0 8px">
          ${PAPER_STATS.map((s, i) => `<span style="text-align:center">
            <span style="display:block;font-size:11px;color:var(--text-3)">${s.label}</span>
            <b style="font-size:19px;color:${CLASSIFY[i] >= 13 ? 'var(--rose)' : 'var(--text-2)'};font-variant-numeric:tabular-nums">${CLASSIFY[i]}</b>
          </span>`).join('<span style="color:var(--border)">·</span>')}
        </div>
        <div class="cliff-d">
          ${CLS_SAME_LAST2 ? `最近两年都是 <b>${CLS_LAST2[1]} 分</b>，` : ''}是唯一明显上升的能力。
          载体年年换（动点、动角、线段中点），考的都是同一件事：<b>把可能的情况列全</b>。
        </div>
      </div>
      <div class="cliff-card">
        <div class="cliff-tag">新定义已退出必做位</div>
        <table class="tbl compact" style="margin:10px 0 8px">
          <thead><tr><th>年份</th><th class="num">必做</th><th class="num">选做</th></tr></thead>
          <tbody>${NEWDEF.map((d) => `<tr><td>${d.label}</td>
            <td class="num ${d.main === 0 ? '' : 'hi'}">${d.main}</td>
            <td class="num">${d.bonus}</td></tr>`).join('')}</tbody>
        </table>
        <div class="cliff-d">
          ${ND_EXITED ? `最新一年必做 <b>${ND_LAST_MAIN} 分</b>、选做 ${ND_LAST_BONUS} 分；上一年必做还有 ${ND_PREV_MAIN} 分。` : ''}
          <b>「新定义是压轴、必考、要重点攻」这个旧印象已经过时</b>——现在是选做位的加分项，不是必做位的门槛。
        </div>
      </div>
    </div>
    <div class="callout" style="margin-top:18px">
      这两处之外，${SPAN}年的章节分值、难度比例、题型位置都在噪声范围内摆动，
      <b>不足以改变复习顺序</b>——按「没变」那几页准备，比追每一年的小波动更划算。
    </div>
  </div>
</div>`);

/* 9. 必考族 */
push('必考清单', `
<div class="slide">
  <div class="s-head">
    <span class="s-kicker">Checklist</span>
    <h2 class="s-title">${FREQ.must.length} 个必考族，覆盖 ${FREQ_SUMMARY.must.pct}% 分值</h2>
    <p class="s-sub">${SPAN}年年年出现，合计 ${FREQ_SUMMARY.must.score}/${MAIN_GRAND} 分——复习清单可以从这里开始</p>
  </div>
  <div class="s-body">
    <div class="fam-grid">
      ${FAM_CARDS.map((f) => `<div class="fam-card">
        <div class="fam-name">${esc(f.name)}</div>
        <div class="fam-meta"><span class="fam-avg">${f.avgPerYear}</span><span class="fam-unit">分/年</span></div>
        ${f.note ? `<div class="fam-note">${esc(f.note)}</div>` : ''}
        <div class="fam-bar"><i style="width:${Math.round(f.avgPerYear / FREQ.must[0].avgPerYear * 100)}%"></i></div>
      </div>`).join('')}
    </div>
    <div class="callout" style="margin-top:18px">
      与其从教辅目录第一页开始，不如<b>先确认这 ${FREQ.must.length} 个族能不能独立做对</b>。
      按考频分三档：必考 ${FREQ_SUMMARY.must.n} 族 ${FREQ_SUMMARY.must.pct}%、
      偶考 ${FREQ_SUMMARY.often.n} 族 ${FREQ_SUMMARY.often.pct}%、
      极少考 ${FREQ_SUMMARY.rare.n} 族 ${FREQ_SUMMARY.rare.pct}%（${FREQ_SUMMARY.rare.score} 分）——极少考的那些排在最后。
    </div>
  </div>
</div>`);

/* 第 23 题单题年均分：结论页那一行说的是"第 23 题"，就不能挂
   f-final 族的分（9.2 分含第 24、26 题，与这句话指的不是一回事） */
const Q23_AVG = +(sum(Q23.map((q) => q.score)) / N_PAPERS).toFixed(1);

/* 9. 结论：三个方向，每个方向挂上它对应的分值 */
const DIRECTIONS = [
  ['01', '第 17 题练到不出错', '一道题 ' + Q17_MIN + '–' + Q17_MAX + ' 分，比两道压轴加起来还多', Q17_MAX + ' 分'],
  ['02', '把概念题的「错法」列成清单', '概念占 ' + CONCEPT_PCT + '%，丢分靠辨析，不靠难度', CONCEPT_AVG + ' 分'],
  ['03', '第 23 题练「列全」，不练「多刷」', '载体年年换，考的是分类完备性', Q23_AVG + ' 分'],
];
push('结论', `
<div class="slide s-end" style="justify-content:center;align-items:flex-start;padding-top:78px;
  background:radial-gradient(ellipse 90% 70% at 20% 0%,rgba(37,99,235,.12),transparent 65%),var(--bg)">
  <h2 class="end-h">三个方向</h2>
  <div class="pri-list" style="width:100%;margin-top:8px">
    ${DIRECTIONS.map(([n, t, s, v]) => `<div class="pri-item">
      <span class="pri-no">${n}</span>
      <div><div style="font-size:15.5px;font-weight:700">${t}</div>
        <div style="font-size:12.5px;color:var(--text-3);margin-top:3px">${s}</div></div>
      <span style="font-size:14px;font-weight:800;color:var(--accent);white-space:nowrap">${v}</span>
    </div>`).join('')}
  </div>
  <div class="cover-meta" style="margin-top:44px;border-top:1px solid var(--border);padding-top:26px;width:100%">
    <div><b>${LEDGER.length}</b><span>题逐题标注</span></div>
    <div><b>${N_PAPERS}</b><span>套真题样本</span></div>
    <div><b>${FAMILY_MAP.length}</b><span>个考点族</span></div>
    <div><b>${FREQ.must.length}</b><span>个必考族</span></div>
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
  display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.86);backdrop-filter:blur(12px);
  padding:8px 14px;border-radius:999px;color:var(--text-2);font-size:13px;font-family:var(--mono);
  border:1px solid var(--border);box-shadow:0 6px 20px rgba(15,23,42,.08)">
  <button id="prev" aria-label="上一页" style="background:none;border:none;color:var(--text-3);font-size:16px;cursor:pointer;padding:2px 6px">‹</button>
  <span><b id="cur">1</b> / ${deck.length}</span>
  <button id="next" aria-label="下一页" style="background:none;border:none;color:var(--text-3);font-size:16px;cursor:pointer;padding:2px 6px">›</button>
  <button id="ov" aria-label="总览" style="margin-left:6px;background:none;border:none;color:var(--text-3);font-size:14px;cursor:pointer">⊞</button>
  <button id="fs" aria-label="全屏" style="background:none;border:none;color:var(--text-3);font-size:14px;cursor:pointer">⛶</button>
  <a href="index.html" title="返回站点" style="color:var(--text-3);text-decoration:none;font-size:14px;padding:2px 6px">↩</a>
</div>

<div id="bar" style="position:fixed;bottom:0;left:0;height:3px;background:var(--accent-grad);z-index:21;transition:width .2s"></div>

<div id="hint" style="position:fixed;top:18px;right:20px;z-index:19;
  background:rgba(255,255,255,.86);backdrop-filter:blur(10px);color:var(--text-3);font-size:12px;
  padding:7px 15px;border-radius:999px;border:1px solid var(--border);opacity:1;transition:opacity .5s;pointer-events:none">
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
console.log('');
console.log('  派生核对：');
console.log('    Q17         ', Q17_MIN + '–' + Q17_MAX + ' 分', Q17_SAME_TOPIC ? '同考点' : '考点变', Q17_ALL_EASY ? '全基础档' : '');
console.log('    Q23+Q24 之和 ', Math.min(...TAIL2) + '–' + TAIL2_MAX, '| Q17 每年更大:', Q17_BEATS_TAIL);
console.log('    断崖        ', '前 ' + FRONT_AVG + '（' + FRONT_IDX_RANGE.join('–') + '）', '后 ' + BACK_AVG + '（' + BACK_IDX_RANGE.join('–') + '）');
console.log('    稳定题位     ', STABLE_OBJ.map((s) => 'q' + s.no).join(' '), '合计 ' + rng(STABLE_OBJ_SUM_MIN, STABLE_OBJ_SUM_MAX) + ' 分', '（q17 单列一页，不重复）');
console.log('    计算/概念    ', CALC_AVG + ' / ' + CONCEPT_AVG, '= ' + ACC_PCT + '%');
console.log('    计算三块     ', CALC3.map((f) => f.avgPerYear).join(' + ') + ' = ' + CALC3_AVG);
