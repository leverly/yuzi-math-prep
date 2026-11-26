#!/usr/bin/env node
// 西城区初一(上)数学期末 · 考情备考站
// 设计语言参考北京中考数学站：靛蓝渐变主色 / 白卡片 / 大圆角 / 柔和阴影 / 编号卡
// 零依赖、纯静态，产物可直接 file:// 打开
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import {
  PAPER_STATS, YEARS, CH_SCORE, CAT_SCORE, DIFF_SCORE,
  FAMILY_MAP, FREQ, FREQ_SUMMARY,
  SCORE_TIERS, MAIN_GRAND, N_PAPERS,
} from './work/papers/stats.mjs';
import { CH_NAME, CH_ORDER, CAT_NAME, CAT_ORDER, DIFF_NAME, DIFF_ORDER, LEDGER } from './work/papers/ledger.mjs';
import { SITE, NAV, CATALOG, CHOICE_KEY, TOKENS, HEAD_CSS, PAGEHEAD_CSS, headerHtml, ROUND_SIZE } from './work/site-shell.mjs';
import { BANK as PRACTICE_BANK } from './practice-data.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sum = (a) => a.reduce((x, y) => x + y, 0);
const pct = (v) => Math.round(v);

/* ============================ 派生量 ============================ */
const BASE_AVG = +(sum(SCORE_TIERS.map((t) => t.base)) / SCORE_TIERS.length).toFixed(1);
const HARD_AVG = +(sum(SCORE_TIERS.map((t) => t.hard)) / SCORE_TIERS.length).toFixed(1);
const BASE_MIN = Math.min(...SCORE_TIERS.map((t) => t.base));
const BASE_MAX = Math.max(...SCORE_TIERS.map((t) => t.base));
const HARD_MIN = Math.min(...SCORE_TIERS.map((t) => t.hard));
const HARD_MAX = Math.max(...SCORE_TIERS.map((t) => t.hard));
const CALC_CONCEPT = CAT_SCORE['计算'].pct + CAT_SCORE['概念'].pct;
const CALC3 = FAMILY_MAP.filter((f) => ['f-arith', 'f-solveeq', 'f-simplify'].includes(f.id)).reduce((a, f) => a + f.total, 0);
const DIFF_INDEX_MIN = Math.min(...PAPER_STATS.map((s) => s.diffIndex));
const DIFF_INDEX_MAX = Math.max(...PAPER_STATS.map((s) => s.diffIndex));
const famById = (id) => FAMILY_MAP.find((f) => f.id === id);

// 考点族按章节分组：章节之间按五年总分降序，组内按年均分降序
const CH_GROUPS = CH_ORDER.map((k) => {
  const fams = FAMILY_MAP.filter((f) => f.ch === k).sort((a, b) => b.avgPerYear - a.avgPerYear);
  return { k, name: CH_NAME[k], total: fams.reduce((a, f) => a + f.total, 0), fams };
}).filter((g) => g.fams.length).sort((a, b) => b.total - a.total);
// 压轴的「典型分值」用众数而非五年均值：2021-22 压轴为 0 会把均值拉低到 5.6
const TOP_MODE = (() => {
  const v = DIFF_SCORE.top.per.filter((x) => x > 0);
  const c = {};
  for (const x of v) c[x] = (c[x] || 0) + 1;
  return +Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
})();

/* 首页首屏要说的「今天该干什么」。
 * 题量来自练习题库实测，轮次题量来自 site-shell（与练习页同源），章数来自台账。 */
const PRACTICE_TOTAL = PRACTICE_BANK.length;
const ROUND_Q = ROUND_SIZE;              // 一轮题数（= 章数 × 每章题数）
const CH_COUNT = CH_GROUPS.length;       // 覆盖的章数

/* ============================ 设计系统 ============================ */
// 设计变量 / 顶栏 / 页头排版来自 work/site-shell.mjs（全站唯一来源）
const CSS = TOKENS + HEAD_CSS + PAGEHEAD_CSS + `
/* ---------- Hero ---------- */
.hero{padding:54px 0 30px;position:relative;background:var(--hero-glow)}
.hero-split{display:grid;grid-template-columns:1.12fr .98fr;gap:38px;align-items:start}
/* grid 子项默认 min-width:auto，长文本/宽内容会把整列顶出容器；窄屏下尤其明显 */
.hero-split>div,.hero-split>aside{min-width:0}
.hero-badge{
  display:inline-flex;align-items:center;gap:8px;font-size:.78rem;font-weight:600;
  color:var(--accent);border:1px solid rgba(37,99,235,.24);background:var(--surface);
  padding:5px 13px;border-radius:var(--r-pill);margin-bottom:20px;box-shadow:var(--shadow-1);
}
.dot-live{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px rgba(37,99,235,.16)}
.accent-word{background:var(--accent-grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero-cta{display:flex;gap:10px;margin-top:24px;flex-wrap:wrap}
.btn{
  display:inline-flex;align-items:center;gap:7px;padding:11px 20px;border-radius:11px;
  font-size:14.5px;font-weight:650;text-decoration:none;border:1px solid var(--border-2);
  background:var(--surface);color:var(--text);transition:.18s var(--ease);box-shadow:var(--shadow-1);
}
.btn:hover{transform:translateY(-1px);box-shadow:var(--shadow-2)}
.btn.primary{background:var(--accent-grad);color:#fff;border-color:transparent;box-shadow:var(--shadow-accent)}
.btn.primary:hover{box-shadow:0 14px 30px -8px rgba(37,99,235,.46)}
.hero-trust{display:flex;gap:16px;margin-top:20px;flex-wrap:wrap;font-size:12.8px;color:var(--text-3)}
.hero-trust b{color:var(--ok);margin-right:3px}
.hero-stats{
  display:grid;grid-template-columns:repeat(4,auto);justify-content:start;gap:0 28px;
  margin-top:24px;padding-top:20px;border-top:1px solid var(--border);
}
.hero-stats>div{display:flex;flex-direction:column;gap:1px;min-width:0}
.hero-stats b{font-size:26px;font-weight:780;letter-spacing:-.03em;line-height:1.15;font-variant-numeric:tabular-nums;white-space:nowrap}
.hero-stats .hs-of{font-size:13px;font-weight:650;color:var(--text-3);margin-left:1px}
.hero-stats span{font-size:12px;color:var(--text-3)}

/* ---------- 侧栏数据卡 ---------- */
.cockpit{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);
  padding:22px;box-shadow:var(--shadow-3);position:relative;overflow:hidden;
}
.cockpit::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:var(--accent-grad)}
.cockpit-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;flex-wrap:wrap}
.level-pill{font-size:12px;font-weight:700;color:var(--accent);background:var(--accent-soft);padding:4px 11px;border-radius:var(--r-pill)}
.metric-row{display:flex;align-items:baseline;gap:11px;padding:12px 0;border-bottom:1px solid var(--border)}
.metric-row:last-of-type{border-bottom:none}
.metric-row .mv{font-size:25px;font-weight:780;letter-spacing:-.03em;font-variant-numeric:tabular-nums;min-width:54px}
.metric-row .mv.accent{color:var(--accent)}
.metric-row .mv.gold{color:var(--gold)}
.metric-row .mv.ok{color:var(--ok)}
.metric-row .ml{font-size:12.5px;color:var(--text-2);line-height:1.45}
.metric-row .ml b{display:block;color:var(--text);font-weight:650;font-size:13.5px}

/* 首页右侧：各章五年年均分值条（回答「先看哪一章」）
 * minmax(0,1fr) 而非 1fr：grid 的 1fr 最小尺寸默认是 auto，
 * 窄屏下会被内容顶宽，整块溢出容器右侧。 */
.ch-bar-row{display:grid;grid-template-columns:88px minmax(0,1fr) 34px;align-items:center;gap:10px;padding:7px 0}
.ch-bar-name{font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.ch-bar-track{display:block;height:7px;background:var(--bg-3);border-radius:var(--r-pill);overflow:hidden}
.ch-bar-track i{display:block;height:100%;background:var(--accent-grad);border-radius:var(--r-pill)}
.ch-bar-row:first-of-type .ch-bar-track i{background:var(--gold-grad)}
.ch-bar-val{font-size:12.5px;font-weight:700;color:var(--text-2);text-align:right;font-variant-numeric:tabular-nums}

/* 必考族清单：12 行紧凑排列，条形长度按年均分降序 */
.must-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:0 28px;
  background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
  padding:6px 20px;box-shadow:var(--shadow-1)}
.must-row{display:grid;grid-template-columns:26px 1fr 88px 62px;align-items:center;gap:10px;
  padding:9px 0;border-bottom:1px solid var(--border)}
.must-grid>.must-row:nth-last-child(-n+2){border-bottom:none}
.must-no{font-family:var(--mono);font-size:11px;font-weight:700;color:var(--text-3);opacity:.7}
.must-name{font-size:13.2px;font-weight:600;color:var(--text);min-width:0;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.must-bar{display:block;height:6px;background:var(--bg-3);border-radius:var(--r-pill);overflow:hidden}
.must-bar i{display:block;height:100%;background:var(--accent-grad);border-radius:var(--r-pill)}
.must-val{font-size:13px;font-weight:700;color:var(--accent);text-align:right;
  font-variant-numeric:tabular-nums;white-space:nowrap}
.must-val small{font-size:10.5px;font-weight:600;color:var(--text-3);margin-left:1px}

/* 行动横幅：考情讲完后给唯一动作 */
.cta-band{display:flex;align-items:center;justify-content:space-between;gap:22px;flex-wrap:wrap;
  margin:44px 0 8px;padding:24px 28px;border-radius:var(--r-lg);
  background:var(--surface);border:1px solid rgba(37,99,235,.24);
  box-shadow:0 14px 34px -14px rgba(37,99,235,.24)}
.cta-band-main{min-width:0}
.cta-band-main b{display:block;font-size:17px;font-weight:750;letter-spacing:-.02em;margin-bottom:5px}
.cta-band-main span{font-size:13.2px;color:var(--text-3)}
.cta-band-act{display:flex;gap:10px;flex-wrap:wrap}

.mission-list{margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:5px}
.mission-item{
  display:flex;align-items:center;gap:11px;padding:10px 11px;border-radius:11px;
  text-decoration:none;color:var(--text);transition:.16s var(--ease);
}
.mission-item:hover{background:var(--surface-2)}
.mi-ico{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;font-size:15px;flex:none}
.mi-ico.blue{background:var(--accent-soft)}
.mi-ico.purple{background:var(--purple-soft)}
.mi-ico.gold{background:var(--gold-soft)}
.mi-main{display:flex;flex-direction:column;line-height:1.4;min-width:0}
.mi-main b{font-size:13.5px;font-weight:650}
.mi-main small{font-size:11.8px;color:var(--text-3)}
.mi-go{margin-left:auto;font-size:12px;font-weight:600;color:var(--accent);white-space:nowrap}

/* ---------- 区块 ---------- */
.section{margin:54px 0}
.section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:24px}
.section-head-left{min-width:0}
.kicker{
  font-family:var(--mono);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;
  color:var(--accent);font-weight:600;margin-bottom:8px;display:block;
}
h2{font-size:clamp(21px,2.4vw,27px);font-weight:780;letter-spacing:-.025em;line-height:1.3}
.sub{font-size:13.2px;color:var(--text-3);display:block;margin-top:6px}
h3{font-size:16px;font-weight:700;letter-spacing:-.01em;margin-bottom:10px}

/* ---------- 卡片 ---------- */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:22px;box-shadow:var(--shadow-1)}
.card+.card{margin-top:14px}
.grid{display:grid;gap:14px}
.g2{grid-template-columns:repeat(2,1fr)}
/* 同排卡片高度拉齐后，内容少的那张下方会空一大块；
   align-items:start 让每张卡片只占自己内容的高度 */
.grid.g2{align-items:start}
.g3{grid-template-columns:repeat(3,1fr)}
.g4{grid-template-columns:repeat(4,1fr)}

/* ---------- 编号卡（三判断） ---------- */
.sell-rows{display:flex;flex-direction:column;gap:12px}
.sell-row{
  display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:0;
  border:1px solid var(--border);border-radius:var(--r);background:var(--surface);
  overflow:hidden;transition:.18s var(--ease);
}
.sell-row:hover{border-color:rgba(37,99,235,.3);box-shadow:var(--shadow-2)}
.sell-pain{padding:22px 24px;background:var(--bg-3);display:flex;flex-direction:column;gap:7px;position:relative}
.sell-no{font-family:var(--mono);font-size:.72rem;font-weight:700;letter-spacing:.1em;color:var(--accent);opacity:.75}
.sell-pain b{font-size:15px;font-weight:700;line-height:1.45;letter-spacing:-.01em}
.sell-pain-sub{font-size:12.8px;color:var(--text-3)}
.sell-fix{padding:22px 24px;display:flex;flex-direction:column;gap:9px}
.sell-tag{
  align-self:flex-start;font-size:.7rem;font-weight:800;padding:3px 10px;border-radius:var(--r-pill);
  background:var(--accent-soft);color:var(--accent);letter-spacing:.02em;
}
.sell-fix p{font-size:13.6px;color:var(--text-2);line-height:1.72}
.sell-fix p b{color:var(--text);font-weight:650}
.sell-link{font-size:13px;font-weight:650;color:var(--accent);text-decoration:none;margin-top:auto}
.sell-link:hover{text-decoration:underline}

/* ---------- 三色分值卡 ---------- */
.tier-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.tier-card{
  display:block;text-decoration:none;color:var(--text);background:var(--surface);
  border:1px solid var(--border);border-radius:var(--r);padding:18px 20px;box-shadow:var(--shadow-1);
  transition:.18s var(--ease);position:relative;overflow:hidden;
}
.tier-card::before{content:"";position:absolute;inset:0 auto 0 0;width:4px}
.tier-card.t-blue::before{background:var(--accent)}
.tier-card.t-gold::before{background:var(--gold)}
.tier-card.t-rose::before{background:var(--rose)}
.tier-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-2)}
.tier-n{font-size:31px;font-weight:800;letter-spacing:-.035em;line-height:1.1;font-variant-numeric:tabular-nums}
.tier-card.t-blue .tier-n{color:var(--accent)}
.tier-card.t-gold .tier-n{color:var(--gold)}
.tier-card.t-rose .tier-n{color:var(--rose)}
.tier-n small{font-size:14px;font-weight:650;color:var(--text-3);margin-left:2px}
.tier-l{font-size:13px;font-weight:650;margin-top:5px}
.tier-d{font-size:12.4px;color:var(--text-3);margin-top:3px;line-height:1.55}
.tier-goal{font-size:12px;font-weight:700;color:var(--accent);margin-top:10px;padding-top:9px;border-top:1px solid var(--border)}

/* ---------- 表格 ---------- */
.tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:var(--r);border:1px solid var(--border);background:var(--surface)}
table{width:100%;border-collapse:collapse;font-size:13.4px}
th,td{padding:11px 13px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap}
th{font-size:11.5px;font-weight:700;color:var(--text-3);letter-spacing:.04em;background:var(--surface-2);border-bottom:1px solid var(--border-2)}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
tbody tr:hover{background:var(--surface-2)}
tbody tr:last-child td{border-bottom:none}
tfoot td{font-weight:700;border-top:2px solid var(--border-2);border-bottom:none;background:var(--bg-3)}
.cell-hi{color:var(--accent);font-weight:700}

/* ---------- 标签 ---------- */
.tag{display:inline-block;font-size:11.5px;font-weight:650;padding:2.5px 8px;border-radius:6px;line-height:1.55;white-space:nowrap}
.tag.must{background:var(--rose-soft);color:var(--rose)}
.tag.often{background:var(--gold-soft);color:var(--gold)}
.tag.rare{background:var(--bg-3);color:var(--text-3)}
.tag.easy{background:var(--ok-soft);color:var(--ok)}
.tag.mid{background:var(--accent-soft);color:var(--accent)}
.tag.hard{background:var(--gold-soft);color:var(--gold)}
.tag.top{background:var(--rose-soft);color:var(--rose)}
.tag.bonus{background:var(--purple-soft);color:var(--purple)}
.tag.ch{background:var(--accent-soft);color:var(--accent)}
.tag.cat{background:var(--bg-3);color:var(--text-2)}

/* ---------- 条形 ---------- */
.dist-row{display:grid;grid-template-columns:110px 1fr 92px;align-items:center;gap:12px;padding:7px 0}
.dist-name{font-size:13.4px;font-weight:600;color:var(--text)}
.dist-bar-wrap{display:block;height:8px;background:var(--bg-3);border-radius:var(--r-pill);overflow:hidden}
.dist-bar{display:block;height:100%;background:var(--accent-grad);border-radius:var(--r-pill)}
.dist-bar.gold{background:var(--gold-grad)}
.dist-bar.ok{background:linear-gradient(135deg,#10b981,#059669)}
.dist-bar.rose{background:linear-gradient(135deg,#f43f5e,#e11d48)}
/* 中性/负向：不暗示"好"，只表示比往年轻 */
.dist-bar.mute{background:var(--bg-3)}
.dist-val{font-size:12.8px;color:var(--text-2);text-align:right;font-variant-numeric:tabular-nums;font-weight:600}

/* ---------- 考点族热力矩阵 ----------
 * 行 = 族（按章节分组），列 = 学年，格子深浅 = 该年分值，右侧 = 年均分与出现年数。
 * 取经自英语期末站：同一套「族 × 学年」矩阵，一眼分出「年年考且分高」与「只考过一次」。
 * 差异在色阶：用**语义分档**而非分位数——数学分值本身有含义（2 分是一道选择/填空，
 * 6–8 分是一道解答，13 分以上是整块大题）。分位数在这里会塌档：
 * 87 个非零格里 36 个恰好是 2 分，20% 与 40% 分位都是 2，第 2 档会空掉。 */
.heat-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;
  border:1px solid var(--border);border-radius:var(--r);background:var(--surface);box-shadow:var(--shadow-1)}
.heat{border-collapse:separate;border-spacing:0;width:100%;font-size:13px;min-width:760px}
.heat th,.heat td{padding:0;border:none;white-space:nowrap}
.heat thead th{
  position:sticky;top:0;z-index:2;background:var(--surface-2);
  font-size:11px;font-weight:700;color:var(--text-3);letter-spacing:.03em;
  padding:9px 8px;border-bottom:1px solid var(--border-2);text-align:center;
}
.heat thead th.hc-fam{text-align:left;padding-left:14px;min-width:190px}
.heat thead th.hc-avg{text-align:right;padding-right:14px;min-width:104px}
.heat thead th.hc-hit{min-width:52px}
.heat tbody tr:hover td{background:var(--surface-2)}
.heat .ch-row-h td{
  background:var(--bg-3);font-size:11.5px;font-weight:700;color:var(--text-2);
  padding:7px 14px;letter-spacing:.02em;
}
.heat .ch-row-h td .ch-sum{float:right;font-weight:600;color:var(--text-3);font-size:11px}
.heat .hc-fam-cell{padding:6px 8px 6px 14px;border-bottom:1px solid var(--border)}
.heat .fam-nm{font-size:12.9px;font-weight:600;color:var(--text);display:block;line-height:1.35}
.heat .fam-sub{font-size:11px;color:var(--text-3);font-variant-numeric:tabular-nums}
.heat .hc-cell{padding:4px 5px;border-bottom:1px solid var(--border);text-align:center}
.heat .cellbox{
  display:grid;place-items:center;height:30px;border-radius:6px;
  font-size:12px;font-weight:700;font-variant-numeric:tabular-nums;
  transition:.14s var(--ease);
}
.heat .cellbox.zero{background:transparent;color:var(--text-3);font-weight:500;font-size:11px;opacity:.55}
.heat .cellbox[data-hl]{color:#fff}
.heat tbody tr:hover .cellbox:not(.zero){outline:1px solid rgba(37,99,235,.4);outline-offset:-1px}
.heat .hc-avg-cell{padding:6px 14px 6px 8px;border-bottom:1px solid var(--border);text-align:right}
.heat .avg-bar{display:flex;align-items:center;gap:7px;justify-content:flex-end}
.heat .avg-bar i{display:block;height:6px;border-radius:var(--r-pill);background:var(--accent-grad)}
.heat .avg-bar b{font-size:12.3px;font-weight:700;color:var(--text);font-variant-numeric:tabular-nums;min-width:34px;text-align:right}
.heat .hc-hit-cell{padding:6px 10px;border-bottom:1px solid var(--border);text-align:center;
  font-size:11.5px;color:var(--text-3);font-variant-numeric:tabular-nums}
.heat .hc-hit-cell.full{color:var(--ok);font-weight:700}
.heat tbody tr:last-child td{border-bottom:none}

.heat-legend{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:12px;font-size:12.2px;color:var(--text-3)}
.heat-legend .lg-scale{display:flex;align-items:center;gap:3px}
.heat-legend .lg-scale i{display:block;width:24px;height:11px;border-radius:3px}
.heat-legend .lg-note{display:inline-flex;align-items:center;gap:5px}
.heat-legend .lg-zero{display:inline-block;width:24px;height:11px;border-radius:3px;border:1px dashed var(--border-2)}
.heat-scroll-hint{display:none;font-size:11.8px;color:var(--text-3);margin-top:8px;align-items:center;gap:5px}
.heat-scroll-hint b{color:var(--accent);font-weight:650}
@media(max-width:820px){.heat-scroll-hint{display:flex}}

/* ---------- 考点族卡 ---------- */
.fam-tbl{table-layout:fixed;width:100%}
.fam-tbl th:nth-child(1),.fam-tbl td:nth-child(1){width:auto}
.fam-tbl th:nth-child(2),.fam-tbl td:nth-child(2){width:22%}
.fam-tbl th:nth-child(3),.fam-tbl td:nth-child(3){width:22%}
.fam-tbl td:first-child{white-space:normal}
.fam{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
  padding:17px 19px;box-shadow:var(--shadow-1);transition:.18s var(--ease);
}
.fam:hover{border-color:rgba(37,99,235,.28);box-shadow:var(--shadow-2)}
.fam-head{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin-bottom:7px}
.fam-name{font-size:15px;font-weight:700;letter-spacing:-.01em}
.fam-score{font-size:12.6px;color:var(--text-3);font-variant-numeric:tabular-nums;margin-left:auto}
.fam-meta{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;font-size:11.5px;color:var(--text-3);align-items:center}
.fam-note{font-size:12.9px;color:var(--text-2);line-height:1.65}
.fam-years{display:flex;gap:4px;margin-top:10px;flex-wrap:wrap}
.yr{font-size:11px;padding:2px 6px;border-radius:5px;background:var(--bg-3);color:var(--text-3);font-variant-numeric:tabular-nums}
.yr.hit{background:var(--accent-soft);color:var(--accent);font-weight:650}

/* ---------- 提示条 ---------- */
.note{
  border-left:3px solid var(--accent);background:var(--accent-soft);
  padding:14px 18px;border-radius:0 var(--r-sm) var(--r-sm) 0;
  font-size:13.6px;color:var(--text-2);line-height:1.72;
}
.note b{color:var(--text)}
.note.warn{border-color:var(--gold);background:var(--gold-soft)}
.note.info{border-color:var(--accent);background:var(--accent-soft)}
.note.risk{border-color:var(--rose);background:var(--rose-soft)}
.note+.note{margin-top:10px}

/* ---------- 列表 ---------- */
ul.clean{list-style:none}
ul.clean li{position:relative;padding-left:20px;margin:9px 0;font-size:13.8px;color:var(--text-2);line-height:1.72}
ul.clean li::before{content:"";position:absolute;left:5px;top:9px;width:5px;height:5px;border-radius:50%;background:var(--accent)}
ul.clean li b{color:var(--text);font-weight:650}

/* ---------- 优先级卡 ---------- */
.pri{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
  padding:19px 21px;box-shadow:var(--shadow-1);position:relative;overflow:hidden;
  transition:.18s var(--ease);
}
.pri:hover{box-shadow:var(--shadow-2)}
.pri::before{content:"";position:absolute;inset:0 auto 0 0;width:3px;background:var(--accent)}
.pri.p2::before{background:var(--purple)}
.pri.p3::before{background:var(--ok)}
.pri.p4::before{background:var(--gold)}
.pri.p5::before{background:var(--text-3)}
.pri-rank{font-family:var(--mono);font-size:.68rem;font-weight:700;letter-spacing:.09em;color:var(--accent);display:block;margin-bottom:7px}
.pri.p2 .pri-rank{color:var(--purple)}
.pri.p3 .pri-rank{color:var(--ok)}
.pri.p4 .pri-rank{color:var(--gold)}
.pri.p5 .pri-rank{color:var(--text-3)}
.pri h3{margin:0 0 7px;font-size:15px;font-weight:700}
.pri .meta{font-size:12.3px;color:var(--text-3);margin-bottom:10px;font-variant-numeric:tabular-nums;padding-bottom:9px;border-bottom:1px solid var(--border)}
.pri p{font-size:13.3px;color:var(--text-2);line-height:1.72}
.pri p b{color:var(--text);font-weight:650}


/* ---------- 页脚 ---------- */
footer{margin-top:60px;padding:30px 0 40px;border-top:1px solid var(--border);font-size:12.5px;color:var(--text-3)}
footer p{margin:5px 0}
footer b{color:var(--text-2)}

/* ---------- 响应式 ---------- */
@media(max-width:1100px){
}
@media(max-width:960px){
  .hero-split{grid-template-columns:1fr;gap:26px}
  .g3,.g4,.tier-grid{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:680px){
  body{font-size:14.5px}
  .wrap,.hdr-in{padding:0 16px}
  .hdr-in{height:58px}
  .brand small{display:none}
  .hero{padding:34px 0 22px}
  .hero-stats{grid-template-columns:repeat(2,1fr);gap:12px 0}
  .hero-stats b{font-size:22px}
  .g2,.g3,.g4,.tier-grid{grid-template-columns:1fr}
  /* 必考族：窄屏改单列，条形收窄给名称让位 */
  .must-grid{grid-template-columns:1fr;padding:4px 16px}
  .must-grid>.must-row:nth-last-child(2){border-bottom:1px solid var(--border)}
  .must-row{grid-template-columns:22px 1fr 60px 56px;gap:8px}
  .cta-band{padding:20px 20px;gap:16px}
  .cta-band-act{width:100%}
  .cta-band-act .btn{flex:1;justify-content:center}
  .sell-row{grid-template-columns:1fr}
  .section{margin:38px 0}
  .card{padding:17px}
  .cockpit{padding:18px}
  .dist-row{grid-template-columns:92px 1fr 74px;gap:9px}
  table{font-size:12.4px}
  th,td{padding:8px 9px}
  .pri{padding:16px 18px}
}
`;

/* ============================ 公共片段 ============================ */
// 导航与顶栏来自 work/site-shell.mjs（全站唯一来源）

function page(active, title, desc, body) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<style>${CSS}</style>
</head>
<body>
${headerHtml(active)}
<main class="wrap">
${body}
</main>
<footer class="wrap">
  <p><b>${esc(SITE.full)}</b> · 样本：西城区 ${YEARS.join(' / ')} 五套期末真题，共 ${LEDGER.length} 题逐题标注</p>
</footer>
</body>
</html>`;
}

const section = (kicker, title, sub, content, id = '') => `
<section class="section"${id ? ` id="${id}"` : ''}>
  <div class="section-head"><div class="section-head-left">
    <span class="kicker">${kicker}</span>
    <h2>${title}</h2>
    ${sub ? `<span class="sub">${sub}</span>` : ''}
  </div></div>
  ${content}
</section>`;

const distBar = (name, val, max, unit, cls = '') => {
  const w = max > 0 ? Math.round((val / max) * 100) : 0;
  return `<div class="dist-row">
    <span class="dist-name">${esc(name)}</span>
    <span class="dist-bar-wrap"><span class="dist-bar ${cls}" style="width:${w}%"></span></span>
    <span class="dist-val">${val}${unit}</span>
  </div>`;
};

/* ============================ 选择页（index.html） ============================ */
/* 站点入口：先选省份 → 地区 → 年级 → 科目，再进对应科目的首页。
 * 只列 CATALOG 里真实有材料的项——空目录不列，点进去不能是空页。
 * 选择结果存 localStorage；有记录时显示「继续上次」并可直接进入。 */
function buildIndex() {
  const css = `
.sel-wrap{min-height:calc(100vh - 64px);display:flex;flex-direction:column;
  justify-content:center;padding:56px 0 72px}
.sel-head{text-align:center;margin-bottom:34px}
.sel-badge{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;
  color:var(--accent);background:var(--accent-soft);padding:5px 13px;border-radius:var(--r-pill);margin-bottom:16px}
.sel-badge i{width:6px;height:6px;border-radius:50%;background:var(--accent);
  box-shadow:0 0 0 3px rgba(37,99,235,.16)}
.sel-h{font-size:34px;font-weight:780;letter-spacing:-.03em;line-height:1.25}
.sel-sub{font-size:14.5px;color:var(--text-3);margin-top:10px}

.sel-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);
  box-shadow:var(--shadow-3);padding:8px 0;max-width:760px;margin:0 auto;width:100%}

.sel-row{display:grid;grid-template-columns:96px 1fr;gap:16px;align-items:start;
  padding:18px 26px;border-bottom:1px solid var(--border)}
.sel-row:last-of-type{border-bottom:none}
.sel-lbl{font-size:13.5px;font-weight:700;color:var(--text-2);padding-top:7px}
.sel-opts{display:flex;flex-wrap:wrap;gap:9px}
.sel-opt{
  appearance:none;font-family:inherit;cursor:pointer;
  display:inline-flex;align-items:center;gap:8px;
  padding:9px 16px;border-radius:11px;border:1px solid var(--border-2);
  background:var(--surface);color:var(--text);font-size:14px;font-weight:600;
  transition:.15s var(--ease);
}
.sel-opt:hover:not(:disabled){border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}
.sel-opt[aria-pressed="true"]{
  background:var(--accent-grad);border-color:transparent;color:#fff;
  box-shadow:var(--shadow-accent);
}
.sel-opt:disabled{opacity:.42;cursor:not-allowed}
.sel-opt .opt-sub{font-size:11.5px;font-weight:600;opacity:.72}
.sel-opt[aria-pressed="true"] .opt-sub{opacity:.86}

.sel-foot{padding:20px 26px 24px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;
  border-top:1px solid var(--border);background:var(--surface-2);
  border-radius:0 0 var(--r-lg) var(--r-lg)}
.sel-go{
  appearance:none;font-family:inherit;cursor:pointer;border:none;
  background:var(--accent-grad);color:#fff;font-size:15px;font-weight:700;
  padding:12px 26px;border-radius:11px;box-shadow:var(--shadow-accent);
  /* 只过渡 transform/box-shadow。opacity 若参与过渡，在部分渲染路径
     （headless 虚拟时间、低帧率设备）会停在起始值，出现「已可点但看着是灰的」 */
  transition:transform .16s var(--ease),box-shadow .16s var(--ease);
}
.sel-go:hover:not([aria-disabled="true"]){transform:translateY(-1px)}
/* 未就绪态用显式属性控制，不依赖 :disabled 伪类——
   伪类在部分渲染路径下重算不及时，会出现「已可点但看着是灰的」 */
.sel-go[aria-disabled="true"]{opacity:.4;cursor:not-allowed;box-shadow:none;transform:none}
.sel-hint{font-size:12.8px;color:var(--text-3)}
.sel-hint b{color:var(--text-2)}

/* 科目卡：比按钮大，带材料规模，让人看清点进去有什么 */
.sel-subj{display:flex;flex-direction:column;align-items:flex-start;gap:3px;
  padding:12px 18px;border-radius:12px;border:1px solid var(--border-2);
  background:var(--surface);cursor:pointer;font-family:inherit;text-align:left;
  transition:.15s var(--ease);min-width:196px}
.sel-subj:hover{border-color:var(--accent);background:var(--accent-soft)}
/* 选中态与上面三级按钮保持一致：实心蓝 + 投影 */
.sel-subj[aria-pressed="true"]{border-color:transparent;background:var(--accent-grad);
  box-shadow:var(--shadow-accent)}
.sel-subj[aria-pressed="true"] b{color:#fff}
.sel-subj[aria-pressed="true"] small{color:rgba(255,255,255,.82)}
.sel-subj[aria-pressed="true"] .ext{background:rgba(255,255,255,.22);color:#fff}
.sel-subj b{font-size:15px;font-weight:750;display:flex;align-items:center;gap:7px}
.sel-subj small{font-size:12px;color:var(--text-3);font-weight:500}
.sel-subj .ext{font-size:10.5px;font-weight:700;color:var(--purple);
  background:var(--purple-soft);padding:1px 6px;border-radius:5px}

/* 上次选择提示 */
.sel-resume{max-width:760px;margin:0 auto 16px;display:none;align-items:center;gap:12px;
  padding:12px 18px;border-radius:12px;background:var(--accent-soft);
  border:1px solid rgba(37,99,235,.22);font-size:13.5px;color:var(--text-2)}
.sel-resume.on{display:flex}
.sel-resume b{color:var(--accent)}
.sel-resume a{margin-left:auto;font-weight:700;color:var(--accent);text-decoration:none;white-space:nowrap}
.sel-resume button{appearance:none;border:none;background:none;cursor:pointer;
  color:var(--text-3);font-size:12.5px;font-family:inherit;text-decoration:underline}

@media(max-width:640px){
  .sel-h{font-size:26px}
  .sel-row{grid-template-columns:1fr;gap:9px;padding:15px 18px}
  .sel-lbl{padding-top:0}
  .sel-card{border-radius:var(--r)}
  .sel-foot{padding:16px 18px 20px;border-radius:0 0 var(--r) var(--r)}
  .sel-subj{min-width:0;width:100%}
  /* 顶栏右侧说明在窄屏会被裁切，直接收起 */
  .hdr-note{display:none}
}
`;

  /* 选择页的 HTML：选项由 JS 按 CATALOG 渲染，保证与单一来源一致 */
  const catalogJson = JSON.stringify(CATALOG);

  const body = `
<main class="wrap">
<div class="sel-wrap">
  <div class="sel-head">
    <div class="sel-badge"><i></i>${esc(SITE.siteName)}</div>
    <h1 class="sel-h">先选你的考区</h1>
    <p class="sel-sub">选好省份、地区、年级、学期和科目，进入对应的期末考情分析</p>
  </div>

  <div class="sel-resume" id="resume">
    <span>上次看过：<b id="resumeTxt"></b></span>
    <a href="#" id="resumeGo">继续 →</a>
    <button type="button" id="resumeClear">清除</button>
  </div>

  <div class="sel-card">
    <div class="sel-row">
      <span class="sel-lbl">省份</span>
      <div class="sel-opts" id="optProvince"></div>
    </div>
    <div class="sel-row">
      <span class="sel-lbl">地区</span>
      <div class="sel-opts" id="optRegion"></div>
    </div>
    <div class="sel-row">
      <span class="sel-lbl">年级</span>
      <div class="sel-opts" id="optGrade"></div>
    </div>
    <div class="sel-row">
      <span class="sel-lbl">学期</span>
      <div class="sel-opts" id="optTerm"></div>
    </div>
    <div class="sel-row">
      <span class="sel-lbl">科目</span>
      <div class="sel-opts" id="optSubject"></div>
    </div>
    <div class="sel-foot">
      <button class="sel-go" id="goBtn" disabled aria-disabled="true">进入</button>
      <span class="sel-hint" id="hint">请依次选择</span>
    </div>
  </div>
</div>
</main>

<script>
(function(){
  var CATALOG = ${catalogJson};
  var KEY = ${JSON.stringify(CHOICE_KEY)};

  var state = { province: null, region: null, grade: null, term: null, subject: null };

  var el = {
    province: document.getElementById('optProvince'),
    region: document.getElementById('optRegion'),
    grade: document.getElementById('optGrade'),
    term: document.getElementById('optTerm'),
    subject: document.getElementById('optSubject'),
    go: document.getElementById('goBtn'),
    hint: document.getElementById('hint'),
    resume: document.getElementById('resume'),
    resumeTxt: document.getElementById('resumeTxt'),
    resumeGo: document.getElementById('resumeGo'),
    resumeClear: document.getElementById('resumeClear')
  };

  /* 科目键 = 省/区/年级/学期 */
  function subjectKey(g, t) {
    return [state.province, state.region, g, t].join('/');
  }

  function subjectsFor() {
    if (!state.province || !state.region || !state.grade || !state.term) return [];
    return CATALOG.subjects[subjectKey(state.grade, state.term)] || [];
  }

  /* 某一层只有一个选项时自动选中——现在省份/地区/年级/学期都各只有一个或很少，
     不自动填的话用户要点好几次才有反应，像是页面坏了。
     有多个选项时不动，交给用户选。 */
  function autoFill() {
    if (!state.province && CATALOG.provinces.length === 1) {
      state.province = CATALOG.provinces[0].id;
    }
    if (state.province && !state.region) {
      var rs = CATALOG.regions[state.province] || [];
      if (rs.length === 1) state.region = rs[0].id;
    }
    if (state.region && !state.grade && CATALOG.grades.length === 1) {
      state.grade = CATALOG.grades[0].id;
    }
    if (state.grade && !state.term && CATALOG.terms.length === 1) {
      state.term = CATALOG.terms[0].id;
    }
    if (state.grade && state.term && !state.subject) {
      var ss = subjectsFor();
      if (ss.length === 1) state.subject = ss[0].id;
    }
  }

  function makeBtn(label, sub, pressed, disabled, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'sel-opt';
    b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    b.disabled = !!disabled;
    b.innerHTML = label + (sub ? ' <span class="opt-sub">' + sub + '</span>' : '');
    if (!disabled) b.addEventListener('click', onClick);
    return b;
  }

  function render() {
    /* 省份 */
    el.province.innerHTML = '';
    CATALOG.provinces.forEach(function(p){
      el.province.appendChild(makeBtn(p.name, '', state.province === p.id, false, function(){
        state.province = p.id;
        state.region = null; state.grade = null; state.term = null; state.subject = null;
        autoFill();
        render();
      }));
    });

    /* 地区：没选省份时禁用 */
    el.region.innerHTML = '';
    var regions = state.province ? (CATALOG.regions[state.province] || []) : [];
    if (!state.province) {
      el.region.innerHTML = '<span class="sel-hint">先选省份</span>';
    } else {
      regions.forEach(function(r){
        el.region.appendChild(makeBtn(r.name, '', state.region === r.id, false, function(){
          state.region = r.id;
          state.grade = null; state.term = null; state.subject = null;
          autoFill(); render();
        }));
      });
    }

    /* 年级：没选地区时禁用 */
    el.grade.innerHTML = '';
    if (!state.region) {
      el.grade.innerHTML = '<span class="sel-hint">先选地区</span>';
    } else {
      CATALOG.grades.forEach(function(g){
        el.grade.appendChild(makeBtn(g.name, '', state.grade === g.id, false, function(){
          state.grade = g.id;
          state.term = null; state.subject = null;
          autoFill(); render();
        }));
      });
    }

    /* 学期：没选年级时禁用 */
    el.term.innerHTML = '';
    if (!state.grade) {
      el.term.innerHTML = '<span class="sel-hint">先选年级</span>';
    } else {
      CATALOG.terms.forEach(function(t){
        el.term.appendChild(makeBtn(t.name, '', state.term === t.id, false, function(){
          state.term = t.id; state.subject = null; autoFill(); render();
        }));
      });
    }

    /* 科目：没选学期时禁用；选中后点「进入」跳转 */
    el.subject.innerHTML = '';
    var subs = subjectsFor();
    if (!state.term) {
      el.subject.innerHTML = '<span class="sel-hint">先选学期</span>';
    } else if (!subs.length) {
      el.subject.innerHTML = '<span class="sel-hint">该学期暂无材料</span>';
    } else {
      subs.forEach(function(s){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'sel-subj';
        b.setAttribute('aria-pressed', state.subject === s.id ? 'true' : 'false');
        b.innerHTML = '<b>' + s.name + (s.own ? '' : ' <span class="ext">独立站</span>') + '</b>' +
                      '<small>' + s.desc + '</small>';
        b.addEventListener('click', function(){ state.subject = s.id; render(); });
        el.subject.appendChild(b);
      });
    }

    /* 进入按钮：用 aria-disabled 控制视觉，disabled 只用于阻止点击 */
    var ready = state.province && state.region && state.grade && state.term && state.subject;
    el.go.disabled = !ready;
    el.go.setAttribute('aria-disabled', ready ? 'false' : 'true');
    if (ready) {
      var s = subs.filter(function(x){ return x.id === state.subject; })[0];
      el.hint.innerHTML = '将进入 <b>' + s.name + '</b> · ' + s.desc;
    } else {
      el.hint.textContent = '请依次选择省份、地区、年级、学期、科目';
    }
  }

  function currentSubject() {
    return subjectsFor().filter(function(x){ return x.id === state.subject; })[0] || null;
  }

  function go() {
    var s = currentSubject();
    if (!s) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({
        province: state.province, region: state.region,
        grade: state.grade, term: state.term, subject: state.subject,
        name: [labelOf('provinces', state.province), labelOf('regions', state.region, state.province),
               labelOf('grades', state.grade), labelOf('terms', state.term),
               s.name].filter(Boolean).join(' · ')
      }));
    } catch (e) {}
    location.href = s.href;
  }

  function labelOf(kind, id, parent) {
    var list = kind === 'regions' ? (CATALOG.regions[parent] || [])
             : kind === 'provinces' ? CATALOG.provinces
             : kind === 'terms' ? CATALOG.terms
             : CATALOG.grades;
    var hit = list.filter(function(x){ return x.id === id; })[0];
    return hit ? hit.name : '';
  }

  el.go.addEventListener('click', go);

  /* 上次选择 */
  function readSaved() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }
  function showResume() {
    var saved = readSaved();
    /* 旧记录兼容：年级与学期拆成两层之前，存的是 grade:'g7-1' 且没有 term。
       这类记录拼不出有效的科目键，点了会没反应——直接当作没有记录，不要显示。 */
    if (saved && (!saved.term || !CATALOG.subjects[[saved.province, saved.region, saved.grade, saved.term].join('/')])) {
      try { localStorage.removeItem(KEY); } catch (e) {}
      saved = null;
    }
    if (!saved || !saved.name) { el.resume.classList.remove('on'); return; }
    el.resumeTxt.textContent = saved.name;
    el.resume.classList.add('on');
    el.resumeGo.onclick = function(e){
      e.preventDefault();
      var k = [saved.province, saved.region, saved.grade, saved.term].join('/');
      var s = (CATALOG.subjects[k] || [])
        .filter(function(x){ return x.id === saved.subject; })[0];
      if (s) location.href = s.href; else el.resume.classList.remove('on');
    };
    el.resumeClear.onclick = function(){
      try { localStorage.removeItem(KEY); } catch (e) {}
      el.resume.classList.remove('on');
    };
  }

  autoFill();
  render();
  showResume();
})();
</script>`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(SITE.siteName)} · 期末真题考情与备考</title>
<meta name="description" content="按省份、地区、年级、学期、科目选择，进入对应地区的期末考情分析与备考计划">
<style>${TOKENS}${HEAD_CSS}${css}</style>
</head>
<body>
${headerHtml('')}
${body}
</body>
</html>`;
}

/* ============================ 首页（home.html） ============================ */
function buildHome() {
  // 首页的活是「让柚子今天就去练一轮」。
  // 考情论证（82 分是主体、按考法归并、按题型认）看过一次就够，压缩成一条并列在下方，
  // 完整版都在 trend / papers / plan，首页不再复述。

  // 右侧卡：各章五年年均分值条。回答「先看哪一章」——
  // 比原来那三行「82/18/57%」更能导向动作：它直接对应练习页的章节维度。
  const chAvg = CH_GROUPS.map((g) => ({
    name: g.name,
    avg: +g.fams.reduce((a, f) => a + f.avgPerYear, 0).toFixed(1),
  })).sort((a, b) => b.avg - a.avg);
  const chMax = Math.max(...chAvg.map((c) => c.avg));
  const chBars = chAvg.map((c) => `
      <div class="ch-bar-row">
        <span class="ch-bar-name">${esc(c.name)}</span>
        <span class="ch-bar-track"><i style="width:${Math.round((c.avg / chMax) * 100)}%"></i></span>
        <span class="ch-bar-val">${c.avg}</span>
      </div>`).join('');

  // 卷面骨架：五年完全相同，从台账现算，不写死
  const mainQ = LEDGER.filter((q) => !q.bonus);
  const segScore = { 选择: 0, 填空: 0, 解答: 0 };
  for (const q of mainQ) segScore[q.seg] = (segScore[q.seg] || 0) + q.score;
  // 题数用「总题数」（含选做），与逐年拆解页的口径一致：每卷 26 题 = 24 必做 + 2 选做。
  // 分值用必做分（选做计入总分但卷面封顶 100，不能与必做分相加）。
  const paperQ = LEDGER.length / N_PAPERS;
  const bonusQ = LEDGER.filter((q) => q.bonus).length / N_PAPERS;

  const body = `
<section class="hero">
  <div class="hero-split">
    <div>
      <div class="hero-badge"><span class="dot-live"></span>西城区区统考 · 五年真题逐题拆解</div>
      <h1>这套卷子<span class="accent-word">考什么</span><br>多少分，哪里最值钱</h1>
      <p class="lede">
        五套卷的卷面骨架一动没动：<b>${paperQ} 题 / 100 分钟</b>（必做 ${paperQ - bonusQ} + 选做 ${bonusQ}），
        选择 ${pct(segScore['选择'] / N_PAPERS)} + 填空 ${pct(segScore['填空'] / N_PAPERS)} + 解答 ${pct(segScore['解答'] / N_PAPERS)}。
        但分值不是均匀分布的——<b>${pct(BASE_AVG)} 分落在基础与中档</b>，压轴只有 ${pct(HARD_AVG)} 分。
      </p>
      <div class="hero-stats">
        <div><b>${paperQ}</b><span>题 · 100 分钟</span></div>
        <div><b>${pct(BASE_AVG)}<span class="hs-of">分</span></b><span>基础 + 中档</span></div>
        <div><b>${pct(HARD_AVG)}<span class="hs-of">分</span></b><span>较难 + 压轴</span></div>
        <div><b>${FREQ.must.length}</b><span>族年年考</span></div>
      </div>
    </div>

    <aside class="cockpit">
      <div class="cockpit-top">
        <span class="level-pill">各章年均分值</span>
        <span style="font-size:12px;color:var(--text-3)">五年均值</span>
      </div>
      ${chBars}
      <div class="mission-list">
        <a class="mission-item" href="papers.html">
          <span class="mi-ico blue">📄</span>
          <span class="mi-main"><b>逐年拆解</b><small>五套卷逐套看结构与差异</small></span>
          <span class="mi-go">去看 →</span>
        </a>
        <a class="mission-item" href="trend.html">
          <span class="mi-ico purple">📊</span>
          <span class="mi-main"><b>整体解读</b><small>什么在变、什么年年考</small></span>
          <span class="mi-go">去看 →</span>
        </a>
        <a class="mission-item" href="plan.html">
          <span class="mi-ico gold">🎯</span>
          <span class="mi-main"><b>备考计划</b><small>五级优先级，先练什么后练什么</small></span>
          <span class="mi-go">去看 →</span>
        </a>
      </div>
    </aside>
  </div>
</section>

${section('必考族', `五年年年考的 ${FREQ.must.length} 个考点族`, `覆盖必做分 ${FREQ_SUMMARY.must.pct}%（${FREQ_SUMMARY.must.score}/${MAIN_GRAND} 分）——这 ${FREQ.must.length} 族五年没有一年缺席`, `
<div class="must-grid">
  ${FREQ.must.map((f, i) => `
    <div class="must-row">
      <span class="must-no">${String(i + 1).padStart(2, '0')}</span>
      <span class="must-name">${esc(f.name)}</span>
      <span class="must-bar"><i style="width:${Math.round((f.avgPerYear / FREQ.must[0].avgPerYear) * 100)}%"></i></span>
      <span class="must-val">${f.avgPerYear}<small>分/年</small></span>
    </div>`).join('')}
</div>
<p style="margin-top:14px"><a href="trend.html#freq" style="color:var(--accent);font-weight:650;text-decoration:none;font-size:13.5px">看全部 ${FAMILY_MAP.length} 个考点族的五年频次 →</a></p>`)}

${section('一个判断', '先练哪块，有唯一答案', '论证在整体解读，这里只给结论', `
<div class="sell-row">
  <div class="sell-pain">
    <span class="sell-no">01</span>
    <b>压轴只占 ${pct(HARD_AVG)} 分，${pct(BASE_AVG)} 分是能练稳的</b>
    <span class="sell-pain-sub">所以顺序是先保计算零失误，再攻压轴</span>
  </div>
  <div class="sell-fix">
    <span class="sell-tag">一句话</span>
    <p><b>把「计算零失误」排在「攻压轴」前面</b>——不是因为它更难，而是因为它更值钱、更可控。</p>
    <a class="sell-link" href="trend.html#where">为什么这么排 →</a>
  </div>
</div>`)}

<div class="cta-band">
  <div class="cta-band-main">
    <b>想知道自己在这 ${FREQ.must.length} 族里，哪几族在丢分？</b>
    <span>做一轮 ${ROUND_Q} 题 · 约 12 分钟 · 覆盖 ${CH_COUNT} 章 · 不用注册，记录只存本机</span>
  </div>
  <div class="cta-band-act">
    <a class="btn primary" href="practice.html">开始诊断 <span aria-hidden="true">→</span></a>
    <a class="btn ghost" href="history.html">看学情数据</a>
  </div>
</div>`;
  return page('home.html', SITE.name, '西城区初一上数学期末五年真题考情分析与备考练习', body);
}

/* ============================ 逐年拆解 ============================ */
/* 这一页只回答「这一套跟别的年份有什么不一样」。
 * 五年完全相同的东西（选择 16 / 填空 16 / 解答 68、24 必做 + 2 选做）
 * 与五年均值的对比（章节均分、难度比例）属于「整体解读」，不在这里重复。
 * 每卷只留三类本卷独有信息：
 *   1) 解答题分值怎么分（唯一逐年都变的卷面信息）
 *   2) 各章相对五年均值偏离多少（本卷的特点，不是均值本身）
 *   3) 选做两道考什么、有没有答案
 */
function buildPapers() {
  const W = { easy: 1, mid: 2, hard: 3, top: 4 };
  const idxOf = (qs) => {
    const t = sum(qs.map((q) => q.score));
    return t ? +(sum(qs.map((q) => W[q.diff] * q.score)) / t).toFixed(2) : 0;
  };

  /* 五年恒定的事实，全页只说一次，不复制五遍 */
  const s0 = PAPER_STATS[0];
  const SEG_FIXED = PAPER_STATS.every((s) => JSON.stringify(s.seg) === JSON.stringify(s0.seg));
  const CNT_FIXED = PAPER_STATS.every((s) => s.mainCount === s0.mainCount && s.bonusCount === s0.bonusCount);

  const body = `
<section class="hero" style="padding:44px 0 8px">
  <div class="hero-badge"><span class="dot-live"></span>五套卷 · 逐套拆解</div>
  <h1>逐年拆解</h1>
  <p class="lede">这一页只看<b>每套卷自己的特点</b>：解答题的分值怎么分、哪一章比往年重、选做考了什么。
    ${SEG_FIXED && CNT_FIXED ? `卷面骨架五年不变（选择 ${s0.seg['选择']} + 填空 ${s0.seg['填空']} + 解答 ${s0.seg['解答']}，${s0.mainCount} 必做 + ${s0.bonusCount} 选做），只在这里说一次。` : ''}
    要看五年横向对比，去<a href="trend.html">整体解读</a>。</p>
</section>

${PAPER_STATS.map((s) => {
    const bonusQs = LEDGER.filter((q) => q.p === s.id && q.bonus);
    const main = LEDGER.filter((q) => q.p === s.id && !q.bonus);
    const front = main.filter((q) => q.no <= 20);
    const back = main.filter((q) => q.no > 20);
    const solveQs = main.filter((q) => q.no >= 17);

    /* 各章相对五年均值的偏离，按绝对偏离降序 */
    const devs = CH_ORDER.map((k) => {
      const v = s.ch[k] || 0;
      const avg = CH_SCORE[k].avg;
      return { name: CH_SCORE[k].name, v, avg, d: +(v - avg).toFixed(1) };
    }).sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
    const devMax = Math.max(...devs.map((x) => Math.abs(x.d)), 1);

    return section(s.label, `${s.year} 学年`,
      `难度指数 ${s.diffIndex} ｜ 基础 ${s.diff.easy || 0} · 中档 ${s.diff.mid || 0} · 较难 ${s.diff.hard || 0}${s.diff.top ? ' · 压轴 ' + s.diff.top : ''}`,
      `<div class="grid g2">
        <div class="card">
          <h3>解答题分值怎么分</h3>
          <div class="tbl-wrap"><table>
            <thead><tr><th>题号</th><th>考什么</th><th class="num">分值</th><th>难度</th></tr></thead>
            <tbody>${solveQs.map((q) => `<tr>
              <td>第 ${q.no} 题</td>
              <td style="white-space:normal">${esc(q.topic)}</td>
              <td class="num cell-hi">${q.score}</td>
              <td><span class="tag ${q.diff}">${DIFF_NAME[q.diff]}</span></td>
            </tr>`).join('')}</tbody>
          </table></div>
          <div style="margin-top:12px;padding-top:11px;border-top:1px solid var(--border);font-size:12.6px;color:var(--text-3)">
            解答题 ${s.seg['解答']} 分。前 20 题难度指数 ${idxOf(front)}，第 21 题起 ${idxOf(back)}。
          </div>
        </div>
        <div class="card">
          <h3>这一卷哪一章比往年重</h3>
          <div style="font-size:12.4px;color:var(--text-3);margin-bottom:10px">相对五年年均分的偏离 ｜ 蓝色=比往年重，灰色=比往年轻</div>
          ${devs.map((x) => `<div class="dist-row">
            <span class="dist-name">${esc(x.name)}</span>
            <span class="dist-bar-wrap"><span class="dist-bar ${x.d > 0 ? '' : 'mute'}" style="width:${Math.round(Math.abs(x.d) / devMax * 100)}%"></span></span>
            <span class="dist-val">${x.d > 0 ? '+' : ''}${x.d} 分</span>
          </div>`).join('')}
          <div style="margin-top:12px;padding-top:11px;border-top:1px solid var(--border);font-size:12.6px;color:var(--text-3);line-height:1.7">
            本卷 <b style="color:var(--text-2)">${esc(devs[0].name)}</b> ${devs[0].d > 0 ? '比五年均值多' : '比五年均值少'}
            <b style="color:var(--text-2)">${Math.abs(devs[0].d)} 分</b>，是偏离最大的一章。<br>
            偏离最小的是 ${esc(devs[devs.length - 1].name)}（${devs[devs.length - 1].d > 0 ? '+' : ''}${devs[devs.length - 1].d} 分）——
            这一章的分值五年都很稳。
          </div>
        </div>
      </div>
      <div class="card">
        <h3>选做两道考什么</h3>
        <div style="display:flex;gap:7px;align-items:center;flex-wrap:wrap">
          ${bonusQs.map((q) => `<span class="tag bonus">第 ${q.no} 题 · ${esc(q.topic)}（${q.score} 分）</span>`).join(' ')}
        </div>
        <div style="margin-top:12px;font-size:12.6px;color:var(--text-3)">
          选做 ${s.bonusTotal} 分计入总分，卷面封顶 100。${s.hasAnswer ? '本卷有答案（' + esc(s.answerSource) + '）。' : '本卷材料只有原卷，答案由独立验算补出。'}
        </div>
      </div>`);
  }).join('')}

`;
  return page('papers.html', '逐年拆解 · ' + SITE.short, '西城区初一上数学期末五套真题逐年拆解', body);
}

/* ============================ 整体解读 ============================ */
/* 这一页只讲「五年合起来看，什么没变、什么在变、什么最值钱」。
 * 逐年的数字（每卷各章多少分、每卷难度比例）属于「逐年拆解」，不在这里摆矩阵。
 * 读者读完这一页应该能回答三个问题：
 *   1) 这份卷子稳不稳（能不能按图施工）
 *   2) 分堆在哪里（哪里最值钱、哪里最不值得花时间）
 *   3) 什么在变（哪些是新增趋势，不能按旧印象准备）
 */
function buildTrend() {
  const W = { easy: 1, mid: 2, hard: 3, top: 4 };
  const papers = PAPER_STATS.map((s) => s.id);

  /* ---- 考点族热力矩阵的分档与配色 ----
   * 语义分档（不是分位数）：分值本身说明分量。2 分=一道选择/填空，
   * 3-5=半道解答，6-8=一道解答，9-12=多题合计，13+=整块大题。
   * 选它的理由在 CSS 注释里；这里加断言保证 5 档都有格子，
   * 否则图例写 5 档、实际只用到 4 档，读者无法验证深浅的含义。 */
  const HEAT_LEVEL = (v) => (v <= 0 ? 0 : v <= 2 ? 1 : v <= 5 ? 2 : v <= 8 ? 3 : v <= 12 ? 4 : 5);
  const HEAT_BG = ['', 'rgba(37,99,235,.12)', 'rgba(37,99,235,.26)', 'rgba(37,99,235,.44)',
    'rgba(37,99,235,.64)', 'rgba(37,99,235,.88)'];
  const HEAT_FG = ['', 'var(--accent)', 'var(--accent)', '#fff', '#fff', '#fff'];
  const HEAT_AVG_MAX = Math.max(...FAMILY_MAP.map((f) => f.avgPerYear || 0));
  {
    const seen = new Set();
    for (const f of FAMILY_MAP) for (const y of YEARS) {
      const v = (f.perYear && f.perYear[y]) || 0;
      if (v > 0) seen.add(HEAT_LEVEL(v));
    }
    for (let lv = 1; lv <= 5; lv++) {
      if (!seen.has(lv)) {
        console.warn(`  ⚠ 热力矩阵第 ${lv} 档没有格子——图例与实际不符，需重新划分档位`);
      }
    }
  }

  /* ---- 五年恒定的事实（从台账重算，不引用别处的常量）---- */
  const mainOf = (p) => LEDGER.filter((q) => q.p === p && !q.bonus);
  const idxOf = (qs) => {
    const t = sum(qs.map((q) => q.score));
    return t ? +(sum(qs.map((q) => W[q.diff] * q.score)) / t).toFixed(2) : 0;
  };
  /* 断崖：前 20 题 vs 第 21 题起 */
  const cliff = PAPER_STATS.map((s) => {
    const f = mainOf(s.id).filter((q) => q.no <= 20);
    const b = mainOf(s.id).filter((q) => q.no > 20);
    return { label: s.label, fs: sum(f.map((q) => q.score)), bs: sum(b.map((q) => q.score)), fi: idxOf(f), bi: idxOf(b) };
  });
  const FRONT_AVG = +(sum(cliff.map((c) => c.fs)) / N_PAPERS).toFixed(1);
  const BACK_AVG = +(sum(cliff.map((c) => c.bs)) / N_PAPERS).toFixed(1);
  const FRONT_IDX = [Math.min(...cliff.map((c) => c.fi)), Math.max(...cliff.map((c) => c.fi))];
  const BACK_IDX = [Math.min(...cliff.map((c) => c.bi)), Math.max(...cliff.map((c) => c.bi))];
  /* 后段 / 前段的难度倍数区间——用来支撑「难度是前一段的几倍」这句话 */
  const BACK_RATIO = (() => {
    const r = cliff.map((c) => c.bi / c.fi);
    return [+Math.min(...r).toFixed(1), +Math.max(...r).toFixed(1)];
  })();
  /* 后段分值占前段的比例——用来支撑「不到四成」这句话 */
  const BACK_SHARE = +(BACK_AVG / FRONT_AVG).toFixed(2);

  /* 单题最高分：五年是否同一题、同一考点 */
  const topQ = PAPER_STATS.map((s) => {
    const qs = LEDGER.filter((q) => q.p === s.id && !q.bonus);
    return qs.reduce((a, q) => (q.score > a.score ? q : a));
  });
  const TOPQ_NOS = [...new Set(topQ.map((q) => q.no))];
  const TOPQ_TOPICS = [...new Set(topQ.map((q) => q.topic))];
  const TOPQ_MIN = Math.min(...topQ.map((q) => q.score));
  const TOPQ_MAX = Math.max(...topQ.map((q) => q.score));

  /* 五年零例外都是基础档的题位 */
  const byNo = new Map();
  for (const q of LEDGER) {
    if (!byNo.has(q.no)) byNo.set(q.no, []);
    byNo.get(q.no).push(q);
  }
  const ALWAYS_EASY = [...byNo.entries()]
    .filter(([, qs]) => qs.length === N_PAPERS && qs.every((q) => q.diff === 'easy'))
    .map(([no, qs]) => ({ no, score: qs[0].score, topic: [...new Set(qs.map((q) => q.topic))][0] }))
    .sort((a, b) => a.no - b.no);

  /* 计算 / 概念占比 */
  let calcSum = 0, conceptSum = 0;
  for (const q of LEDGER) {
    if (q.bonus) continue;
    if (q.cat === '计算') calcSum += q.score;
    if (q.cat === '概念') conceptSum += q.score;
  }
  const CALC_AVG2 = +(calcSum / N_PAPERS).toFixed(1);
  const CONCEPT_AVG2 = +(conceptSum / N_PAPERS).toFixed(1);
  const ACC = Math.round(CALC_AVG2 / 100 * 100) + Math.round(CONCEPT_AVG2 / 100 * 100);

  /* 分类能力逐年（判断是否真在上升）*/
  const CLASSIFY = PAPER_STATS.map((s) => sum(LEDGER.filter((q) => q.p === s.id && q.cat === '分类').map((q) => q.score)));

  /* 难度指数区间 */
  const DIMIN = Math.min(...PAPER_STATS.map((s) => s.diffIndex));
  const DIMAX = Math.max(...PAPER_STATS.map((s) => s.diffIndex));

  /* 考频分档：必考 / 偶考 / 极少考 */
  const freqRows = [
    { tag: 'must', label: '必考', desc: '五年年年出现', d: FREQ_SUMMARY.must },
    { tag: 'often', label: '偶考', desc: '五年出现 3–4 次', d: FREQ_SUMMARY.often },
    { tag: 'rare', label: '极少考', desc: '五年出现 1–2 次', d: FREQ_SUMMARY.rare },
  ];

  const body = `
<section class="hero" style="padding:44px 0 8px">
  <div class="hero-badge"><span class="dot-live"></span>五年合起来看</div>
  <h1>整体解读</h1>
  <p class="lede">把五套卷叠在一起，只问三件事：<b>什么没变</b>（能不能按图施工）、<b>分在哪</b>（哪里最值钱）、<b>什么在变</b>（哪些不能按旧印象准备）。</p>
</section>

${section('没变', '五年几乎没变的三件事', `难度指数 ${DIMIN}–${DIMAX}，结构年年相同`, `
<div class="grid g3">
  <div class="card">
    <h3>难度没变</h3>
    <div style="font-size:26px;font-weight:750;letter-spacing:-.02em;color:var(--accent);font-variant-numeric:tabular-nums">${DIFF_INDEX_MIN}–${DIFF_INDEX_MAX}</div>
    <div style="font-size:12.6px;color:var(--text-3);margin-top:4px">五年难度指数区间</div>
    <p style="font-size:13px;color:var(--text-2);margin-top:10px;line-height:1.65">
      基础 + 中档 ${BASE_MIN}–${BASE_MAX} 分，较难 + 压轴 ${HARD_MIN}–${HARD_MAX} 分。
      这套卷子不靠难题区分学生，备考可以按图施工。
    </p>
  </div>
  <div class="card">
    <h3>结构没变</h3>
    <div style="font-size:26px;font-weight:750;letter-spacing:-.02em;color:var(--accent);font-variant-numeric:tabular-nums">16 / 16 / 68</div>
    <div style="font-size:12.6px;color:var(--text-3);margin-top:4px">选择 / 填空 / 解答，五年一致</div>
    <p style="font-size:13px;color:var(--text-2);margin-top:10px;line-height:1.65">
      ${PAPER_STATS[0].mainCount} 必做 + ${PAPER_STATS[0].bonusCount} 选做，必做 100 分。
      所以「按题型复习」这个框架成立，不用赌今年换不换。
    </p>
  </div>
  <div class="card">
    <h3>送分位置没变</h3>
    <div style="font-size:26px;font-weight:750;letter-spacing:-.02em;color:var(--accent);font-variant-numeric:tabular-nums">${ALWAYS_EASY.length} 处</div>
    <div style="font-size:12.6px;color:var(--text-3);margin-top:4px">五年零例外都是基础档</div>
    <p style="font-size:13px;color:var(--text-2);margin-top:10px;line-height:1.65">
      ${ALWAYS_EASY.map((s) => '第 ' + s.no + ' 题').join('、')}——这些位置没有「今年变难」的先例。
    </p>
  </div>
</div>`, 'stable')}

${section('分在哪', '分不在压轴，在会做的题上', '断崖在第 20 题之后', `
<div class="grid g2">
  <div class="card">
    <h3>前 20 题 · 熟练度</h3>
    <div style="font-size:30px;font-weight:750;letter-spacing:-.03em;color:var(--ok);font-variant-numeric:tabular-nums">${FRONT_AVG}<span style="font-size:15px;font-weight:600;color:var(--text-3);margin-left:3px">分/年</span></div>
    <div style="font-size:12.6px;color:var(--text-3);margin-top:4px">年均占必做 ${Math.round(FRONT_AVG)}% ｜ 难度指数 ${FRONT_IDX[0]}–${FRONT_IDX[1]}</div>
    <p style="font-size:13px;color:var(--text-2);margin-top:10px;line-height:1.65">
      五年都在 1.4 上下。这一段考的是熟练，不是灵感——失分只可能来自算错、看错、写错。
    </p>
  </div>
  <div class="card">
    <h3>第 21 题起 · 思维</h3>
    <div style="font-size:30px;font-weight:750;letter-spacing:-.03em;color:var(--rose);font-variant-numeric:tabular-nums">${BACK_AVG}<span style="font-size:15px;font-weight:600;color:var(--text-3);margin-left:3px">分/年</span></div>
    <div style="font-size:12.6px;color:var(--text-3);margin-top:4px">年均占必做 ${Math.round(BACK_AVG)}% ｜ 难度指数 ${BACK_IDX[0]}–${BACK_IDX[1]}</div>
    <p style="font-size:13px;color:var(--text-2);margin-top:10px;line-height:1.65">
      难度指数是前一段的 ${BACK_RATIO[0]}–${BACK_RATIO[1]} 倍。这里才开始真正筛人，
      但它的分值不到前一段的四成。
    </p>
  </div>
</div>
<div class="note" style="margin-top:14px">
  <b>单题最值钱的一道：第 ${TOPQ_NOS.join('/')} 题</b>，${TOPQ_MIN}–${TOPQ_MAX} 分，
  五年${TOPQ_NOS.length === 1 ? '都是同一题位' : '题位有变'}${TOPQ_TOPICS.length === 1 ? '、同一考点（' + esc(TOPQ_TOPICS[0]) + '）' : ''}，且都是基础档。
  它一道题的分，比第 23、24 两道压轴加起来还多——在会做的题上丢分，比压轴不会做更亏。
</div>`, 'where')}

${section('最值钱的能力', '计算占四成，是唯一能练到不出错的能力', `计算 ${CALC_AVG2} 分（${Math.round(CALC_AVG2)}%）+ 概念 ${CONCEPT_AVG2} 分（${Math.round(CONCEPT_AVG2)}%）= ${ACC}%`, `
<div class="grid g2">
  <div class="card">
    <h3>三块计算题，考点与难度档不变</h3>
    <div class="tbl-wrap"><table>
      <thead><tr><th>考什么</th><th class="num">年均分</th><th>落在哪一题</th></tr></thead>
      <tbody>${['f-arith', 'f-solveeq', 'f-simplify'].map((id) => {
        const f = famById(id);
        const noCount = new Map();
        for (const s of f.slots) noCount.set(s.no, (noCount.get(s.no) || 0) + 1);
        const nos = [...noCount.keys()].sort((a, b) => a - b);
        /* 多题位的族写「主位（例外年份在第 N 题）」，避免读成两个位置都考 */
        let slot;
        if (nos.length === 1) {
          slot = `第 ${nos[0]} 题`;
        } else {
          const mainNo = [...noCount.entries()].sort((a, b) => b[1] - a[1])[0][0];
          const odd = f.slots.filter((s) => s.no !== mainNo);
          slot = `第 ${mainNo} 题` + (odd.length
            ? `<span style="color:var(--text-3);font-size:12px">（${odd.map((s) => PAPER_STATS.find((p) => p.id === s.p).label).join('、')} 在第 ${odd[0].no} 题）</span>`
            : '');
        }
        return `<tr><td><b>${esc(f.name)}</b></td>
          <td class="num cell-hi">${f.avgPerYear}</td>
          <td>${slot}</td></tr>`;
      }).join('')}</tbody>
      <tfoot><tr><td>合计</td><td class="num cell-hi">${(CALC3 / N_PAPERS).toFixed(1)}</td><td>五年没换过考点</td></tr></tfoot>
    </table></div>
  </div>
  <div class="card">
    <h3>为什么它排第一</h3>
    <p style="font-size:13.2px;color:var(--text-2);line-height:1.7">
      计算 ${Math.round(CALC_AVG2)}% + 概念 ${Math.round(CONCEPT_AVG2)}% = <b>${ACC}%</b> 的分值靠「准确」而不是「灵感」。<br><br>
      这三块五年合计年均 <b>${(CALC3 / N_PAPERS).toFixed(1)} 分</b>，考点、题型、难度档全都不变，位置最多在相邻两题之间挪一次。
      全卷再没有第二处<b>投入就能换来确定性</b>的地方——它不需要聪明，只需要不出错。
    </p>
  </div>
</div>`, 'accuracy')}

${section('在变', '两处真在变，别按旧印象准备', '其余都是噪声，不足以改复习顺序', `
<div class="grid g2">
  <div class="card">
    <h3>分类讨论在加重</h3>
    <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:8px">
      ${PAPER_STATS.map((s, i) => `<span style="text-align:center">
        <span style="display:block;font-size:11.5px;color:var(--text-3)">${s.label}</span>
        <b style="font-size:17px;color:${CLASSIFY[i] >= 13 ? 'var(--rose)' : 'var(--text-2)'};font-variant-numeric:tabular-nums">${CLASSIFY[i]}</b>
      </span>`).join('<span style="color:var(--border)">·</span>')}
    </div>
    <p style="font-size:13px;color:var(--text-2);line-height:1.65">
      最近两年都是 ${CLASSIFY[CLASSIFY.length - 1]} 分，是唯一明显上升的能力。
      载体年年换（动点、动角、线段中点），考的都是同一件事：<b>把可能的情况列全</b>。
    </p>
  </div>
  <div class="card">
    <h3>新定义已退出必做位</h3>
    <p style="font-size:13px;color:var(--text-2);line-height:1.7">
      2025-26 的新定义全部落在选做，2024-25 必做位只剩 2 分。
      <b>「新定义是压轴、必考、要重点攻」这个旧印象已经过时</b>——
      现在它是选做位的加分项，不是必做位的门槛。
    </p>
    <div class="note info" style="margin-top:12px">
      难度标注说明：2025-26 卷自带官方标注，已逐题比对；其余四套为人工判定。
      用于看<b>大致比例</b>，不宜精确到单题。
    </div>
  </div>
</div>`, 'changing')}

${section('考频', '按考频排，不按章节排',
    `共 ${FAMILY_MAP.length} 族 ｜ 必考 ${FREQ_SUMMARY.must.n} 族覆盖 ${FREQ_SUMMARY.must.pct}% 分值`, `
<div class="tbl-wrap"><table>
  <thead><tr><th>考频</th><th class="num">族数</th><th class="num">五年合计</th><th class="num">占必做</th><th>含义</th></tr></thead>
  <tbody>${freqRows.map((r) => `<tr>
    <td><span class="tag ${r.tag}">${r.label}</span></td>
    <td class="num">${r.d.n}</td>
    <td class="num cell-hi">${r.d.score} 分</td>
    <td class="num">${r.d.pct}%</td>
    <td style="white-space:normal;color:var(--text-3)">${r.desc}</td>
  </tr>`).join('')}</tbody>
</table></div>
<div class="note" style="margin-top:14px">
  <b>先确认必考的 ${FREQ_SUMMARY.must.n} 族能不能独立做对</b>，再看偶考。
  极少考的 ${FREQ_SUMMARY.rare.n} 族五年加起来只有 ${FREQ_SUMMARY.rare.score} 分（${FREQ_SUMMARY.rare.pct}%），
  排在最后。
</div>`, 'freq')}

${section('考点族', '各考点分值分布与重要性',
    `按章节分组 · 行 = 考点族，列 = 学年 · 格子深浅 = 该年分值 · 右侧 = 年均分与出现年数 · 共 ${FAMILY_MAP.length} 族`, `
<div class="heat-wrap">
<table class="heat">
<thead><tr>
  <th class="hc-fam">考点族</th>
  ${YEARS.map((y) => `<th>${y}</th>`).join('')}
  <th class="hc-avg">年均</th>
  <th class="hc-hit">出现</th>
</tr></thead>
<tbody>
${CH_GROUPS.map((g) => `
<tr class="ch-row-h"><td colspan="${YEARS.length + 3}">${esc(g.name)}<span class="ch-sum">${g.fams.length} 族 · 五年合计 ${g.total} 分</span></td></tr>
${g.fams.map((f) => `<tr>
  <td class="hc-fam-cell">
    <span class="fam-nm">${esc(f.name)}</span>
    <span class="fam-sub">${f.hitYears}/${N_PAPERS} 年${f.bonusYears ? ' · 选做 ' + f.bonusYears + ' 年' : ''}</span>
  </td>
  ${YEARS.map((y) => {
    const v = (f.perYear && f.perYear[y]) || 0;
    const lv = HEAT_LEVEL(v);
    return `<td class="hc-cell" title="${esc(f.name)}｜${y}｜${v > 0 ? v + ' 分' : '未考'}">
      <span class="cellbox ${v > 0 ? '' : 'zero'}" ${v > 0 ? `data-hl style="background:${HEAT_BG[lv]};color:${HEAT_FG[lv]}"` : ''}>${v > 0 ? v : '—'}</span>
    </td>`;
  }).join('')}
  <td class="hc-avg-cell">
    <span class="avg-bar"><i style="width:${Math.round((f.avgPerYear / HEAT_AVG_MAX) * 56)}px"></i><b>${f.avgPerYear || '—'}</b></span>
  </td>
  <td class="hc-hit-cell ${f.hitYears === N_PAPERS ? 'full' : ''}">${f.hitYears}/${N_PAPERS}</td>
</tr>`).join('')}
`).join('')}
</tbody>
</table>
</div>
<div class="heat-scroll-hint">← <b>左右滑动</b>看全部 ${YEARS.length} 个学年与年均分</div>
<div class="heat-legend">
  <span class="lg-note"><span class="lg-scale">
    ${[1, 2, 3, 4, 5].map((lv) => `<i style="background:${HEAT_BG[lv]}"></i>`).join('')}
  </span>该年分值：2 分 / 3–5 分 / 6–8 分 / 9–12 分 / 13 分以上</span>
  <span class="lg-note"><span class="lg-zero"></span>该年未考</span>
  <span class="lg-note">右侧条形 = 年均分（满格 ${HEAT_AVG_MAX} 分）</span>
</div>
<div class="note" style="margin-top:14px">
  <b>怎么读：</b>横着看一行，是这一族五年考没考、分值稳不稳；竖着看一列，是那一年的分值压在哪几族。
  <b>深浅不是难度，是分量</b>——「13 分以上」基本就是整块大题（第 17 题的有理数混合运算、第 23 题的分类压轴），
  「2 分」只是单个选择或填空。
</div>
<p style="margin-top:10px;font-size:12.8px;color:var(--text-3)">
  年均分 = 五年必做分合计 ÷ ${N_PAPERS}。只出现在选做位的考点计 0 分（选做不计入必做 100 分）。
</p>`, 'families')}}
`;
  return page('trend.html', '整体解读 · ' + SITE.short, '西城区初一上数学期末五年考情整体解读', body);
}

/* ============================ 备考计划 ============================ */
function buildPlan() {
  const pri = [
    {
      cls: 'p1', rank: '第一优先', title: '计算零失误',
      meta: '全卷单题分值最高的三块，也是最能练稳的三块',
      body: `有理数四则混合运算（第 17 题）是<b>单题分值最高</b>的一道；
             解一元一次方程考全流程；
             整式化简求值（第 18 题固定）考去括号+合并+代值。
             <br>固定失分点：符号、乘方、分配律漏乘、去分母漏乘常数项、代值时负数忘加括号。<b>练到不假思索地对。</b>`,
    },
    {
      cls: 'p2', rank: '第二优先', title: '概念辨析：靠清单不靠刷题',
      meta: '每年 4–8 道选择填空，题型高度固定',
      body: `固定考法：合并同类项能不能合并（字母或指数不同就不能）、等式性质用错、科学记数法的 a 必须在 [1,10)、近似数的精确位。
             <br><b>这一类不需要大量练习，需要的是一张「陷阱清单」</b>——把每年选择题的错误选项整理出来，看清命题人怎么设套。`,
    },
    {
      cls: 'p3', rank: '第三优先', title: '几何的「说理格式」',
      meta: '作图题与角度推理，都是「写规范就得分」的题',
      body: `尺规作图五年都考，<b>画完必须写「依据」</b>（两点之间线段最短、两边之和大于第三边）。
             角度推理是「补全过程并填理由」，固定就那几个：同角的余角相等、角平分线的定义、等量代换。
             <br><b>这是「格式分」不是「智力分」，写规范就能拿满。</b>`,
    },
    {
      cls: 'p4', rank: '第四优先', title: '分类压轴（第 23 题）',
      meta: '五年年年都考，载体年年换',
      body: `载体每年换（数轴动点→动角→线段中点→数轴双动点→数轴动点），<b>但内核永远是：把动态过程分成几段，每段列一个式子。</b>
             <br>训练方法不是刷各种载体，而是练<b>「分类的完备性」</b>：动点在哪些区间？动角转到哪些位置？端点重合算不算？<b>漏一种就是丢一半分。</b>`,
    },
    {
      cls: 'p5', rank: '量力而行', title: '选做：新定义与综合实践',
      meta: '锦上添花的部分，不必强求',
      body: `选做<b>不能弥补必做的失误</b>——卷面封顶 100，所以必做永远优先于选做。
             <br>但做出来是额外收获：2025-26 起新定义已从必做位移到选做位，难度也降了一档。`,
    },
  ];

  const body = `
<section class="hero" style="padding:44px 0 8px">
  <div class="hero-badge"><span class="dot-live"></span>五级优先级</div>
  <h1>备考计划</h1>
  <p class="lede">按「先练什么、后练什么」排顺序。顺序不是凭感觉定的——它由五年真题的考法分布决定。</p>
</section>

${section('分清主次', '三类题，三种练法', '不是按难易排，是按「能不能练稳」排', `
<div class="tier-grid">
  <div class="tier-card t-blue" style="cursor:default">
    <div class="tier-n" style="font-size:24px;letter-spacing:-.02em">练得稳</div>
    <div class="tier-l">计算、概念、常规几何与方程</div>
    <div class="tier-d">套路固定，靠熟练度就能做到几乎不出错</div>
  </div>
  <div class="tier-card t-gold" style="cursor:default">
    <div class="tier-n" style="font-size:24px;letter-spacing:-.02em">要想一想</div>
    <div class="tier-l">选择末题、填空末题、解答中段的思维题</div>
    <div class="tier-d">有方法可循，练过同类题就有感觉</div>
  </div>
  <div class="tier-card t-rose" style="cursor:default">
    <div class="tier-n" style="font-size:24px;letter-spacing:-.02em">尽力就好</div>
    <div class="tier-l">第 23 题分类讨论、第 24 题动角</div>
    <div class="tier-d">想全不容易，做到「不漏大类」就很值</div>
  </div>
</div>
<div class="note" style="margin-top:16px">
  <b>为什么先练第一类：</b>它套路最固定、最不依赖临场状态，练到位之后几乎不会再丢分。
  而第二、三类受题目和状态影响大，投入同样的时间，回报反而没那么确定。
  <b>先把稳的那块拿住，再去碰需要灵感的题。</b>
</div>`, 'math')}

${section('优先级', '五级优先，按「能不能练稳」排序', '顺序由五年真题的考法分布决定', `
<div class="grid g2">
  ${pri.map((p) => `<div class="pri ${p.cls}">
    <span class="pri-rank">${p.rank}</span>
    <h3>${p.title}</h3>
    <div class="meta">${p.meta}</div>
    <p>${p.body}</p>
  </div>`).join('')}
</div>`, 'priority')}

${section('提醒', '三条反直觉的建议', '', `
<div class="card">
  <ul class="clean">
    <li><b>别把时间花在「押压轴题型」上。</b>第 23 题载体五年换了四次，押具体载体的命中率极低；押「分类讨论」这个方法，五年 5/5。</li>
    <li><b>别在选做上耗太久。</b>选做不弥补必做，先把必做的题稳稳做完，再看选做。</li>
    <li><b>别用「刷题量」衡量进度。</b>反复练的是「不错」不是「不会」。衡量指标应是「同一道题第二次做是否还错」。</li>
  </ul>
</div>`, 'tips')}

${section('自检', '一份可以打印的考前清单', '按题位检查，不按章节检查', `
<div class="tbl-wrap"><table>
  <thead><tr><th>题位</th><th>内容</th><th>自检问题</th></tr></thead>
  <tbody>
    <tr><td><b>1–2</b></td><td>绝对值 / 相反数 / 科学记数法</td><td>科学记数法的 a 在 [1,10) 吗？</td></tr>
    <tr><td><b>3–8</b></td><td>展开图、整式辨析、数轴判符号、余补角、方程变形</td><td>每个错误选项错在哪，能说出原因吗？</td></tr>
    <tr><td><b>9–15</b></td><td>近似数、角度换算、同类项、整体代入、方程解求参</td><td>度分秒是 60 进制，换算方向对吗？</td></tr>
    <tr><td><b>16</b></td><td>数字填图 / 幻方</td><td>是用「整体代换」还是硬凑？</td></tr>
    <tr><td><b>17</b></td><td>有理数四则混合运算（4 小问）</td><td>乘方符号、分配律漏乘检查了吗？</td></tr>
    <tr><td><b>18</b></td><td>整式化简求值</td><td>代值时负数加括号了吗？</td></tr>
    <tr><td><b>19 / 20</b></td><td>解方程 或 尺规作图（两题位置会互换）</td><td>去分母漏乘常数项了吗？作图的依据写了吗？</td></tr>
    <tr><td><b>21–22</b></td><td>角度推理 或 方程应用</td><td>推理理由用词准确吗？等量关系找对了吗？</td></tr>
    <tr><td><b>23</b></td><td>分类压轴</td><td>分了几种情况？为什么不会有遗漏？</td></tr>
    <tr><td><b>24</b></td><td>动角 或 新定义</td><td>有没有第二种位置 / 情况？</td></tr>
    <tr><td><b>25–26</b></td><td>选做</td><td>必做全对了吗？全对再碰选做。</td></tr>
  </tbody>
</table></div>`, 'checklist')}
`;
  return page('plan.html', '备考计划 · ' + SITE.short, '西城区初一上数学期末备考计划：五级优先级', body);
}

/* ============================ 输出 ============================ */
const OUT = process.cwd();
function emit(name, html) {
  const p = join(OUT, name);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, html, 'utf8');
  return html.length;
}

const t0 = Date.now();
const pages = [
  ['index.html', buildIndex()],
  ['home.html', buildHome()],
  ['papers.html', buildPapers()],
  ['trend.html', buildTrend()],
  ['plan.html', buildPlan()],
];
let bytes = 0;
for (const [n, h] of pages) bytes += emit(n, h);

console.log('=== 构建完成 ===');
console.log('  页面：' + pages.length + ' 个');
console.log('  体积：' + (bytes / 1024).toFixed(1) + ' KB');
console.log('  耗时：' + (Date.now() - t0) + ' ms');
console.log('  样本：' + N_PAPERS + ' 套卷 / ' + LEDGER.length + ' 题');
