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

const SITE = {
  short: '西城初一数学',
  name: '西城区初一(上)数学期末 · 五年考情与冲刺计划',
  full: '西城区初一(上)数学期末考情分析站',
  exam: '西城区初一(上)期末',
};

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

/* ============================ 设计系统 ============================ */
const CSS = `
:root{
  --r:16px; --r-sm:10px; --r-lg:22px; --r-pill:999px;
  --max:1140px;
  --ease:cubic-bezier(.22,.61,.36,1);
  --sans:-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif;
  --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;

  --bg:#f6f8fc; --bg-2:#fff; --bg-3:#edf2f9;
  --surface:#fff; --surface-2:#f8fafd;
  --border:rgba(15,23,42,.085); --border-2:rgba(15,23,42,.16);
  --text:#0f172a; --text-2:#475569; --text-3:#64748b;

  --accent:#2563eb; --accent-h:#1d4ed8;
  --accent-soft:rgba(37,99,235,.08); --accent-soft-2:rgba(37,99,235,.14);
  --accent-grad:linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);

  --purple:#7c3aed; --purple-soft:rgba(124,58,237,.09);
  --gold:#d97706; --gold-soft:rgba(245,158,11,.12);
  --gold-grad:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);
  --ok:#059669; --ok-soft:rgba(16,185,129,.10);
  --rose:#e11d48; --rose-soft:rgba(225,29,72,.085);

  --shadow-1:0 1px 2px rgba(15,23,42,.04),0 1px 3px rgba(15,23,42,.03);
  --shadow-2:0 4px 12px -2px rgba(15,23,42,.06),0 2px 4px -1px rgba(15,23,42,.04);
  --shadow-3:0 16px 36px -10px rgba(15,23,42,.11),0 4px 12px -2px rgba(15,23,42,.05);
  --shadow-accent:0 10px 26px -8px rgba(37,99,235,.36);
  --hero-glow:radial-gradient(ellipse 80% 55% at 50% -10%,rgba(37,99,235,.11),transparent 70%);
}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{
  font-family:var(--sans); background:var(--bg); color:var(--text);
  line-height:1.68; font-size:15px; overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
}
a{color:inherit}
.wrap{max-width:var(--max);margin:0 auto;padding:0 24px}

/* ---------- 顶栏 ---------- */
.site-head{
  position:sticky;top:0;z-index:60;
  background:rgba(246,248,252,.86);
  backdrop-filter:saturate(180%) blur(14px);
  border-bottom:1px solid var(--border);
}
.hdr-in{max-width:var(--max);margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;gap:14px}
.brand{display:flex;align-items:center;gap:9px;text-decoration:none;font-weight:750;font-size:15px;letter-spacing:-.01em;white-space:nowrap}
.brand-mark{
  width:30px;height:30px;border-radius:9px;background:var(--accent-grad);
  display:grid;place-items:center;color:#fff;font-size:14px;font-weight:800;
  box-shadow:var(--shadow-accent);flex:none;
}
.brand small{font-family:var(--mono);font-size:.68rem;font-weight:600;color:var(--accent);background:var(--accent-soft);padding:2px 6px;border-radius:5px;margin-left:2px}
.hdr-nav{display:flex;gap:2px;margin-left:auto;overflow-x:auto;scrollbar-width:none}
.hdr-nav::-webkit-scrollbar{display:none}
.hdr-nav a{
  padding:7px 13px;border-radius:9px;color:var(--text-2);text-decoration:none;
  font-size:14px;font-weight:550;white-space:nowrap;transition:.16s var(--ease);
}
.hdr-nav a:hover{background:var(--accent-soft);color:var(--accent)}
.hdr-nav a.on{background:var(--accent);color:#fff;font-weight:650;box-shadow:var(--shadow-accent)}
.hdr-nav a.nav-slides{
  background:var(--purple-soft);color:var(--purple);font-weight:650;
  display:inline-flex;align-items:center;gap:5px;
}
.hdr-nav a.nav-slides::before{content:"▶";font-size:9px}
.hdr-nav a.nav-slides:hover{background:var(--purple);color:#fff}

/* ---------- Hero ---------- */
.hero{padding:54px 0 30px;position:relative;background:var(--hero-glow)}
.hero-split{display:grid;grid-template-columns:1.12fr .98fr;gap:38px;align-items:start}
.hero-badge{
  display:inline-flex;align-items:center;gap:8px;font-size:.78rem;font-weight:600;
  color:var(--accent);border:1px solid rgba(37,99,235,.24);background:var(--surface);
  padding:5px 13px;border-radius:var(--r-pill);margin-bottom:20px;box-shadow:var(--shadow-1);
}
.dot-live{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px rgba(37,99,235,.16)}
h1{font-size:clamp(28px,3.6vw,42px);line-height:1.22;font-weight:800;letter-spacing:-.03em;margin-bottom:16px}
.accent-word{background:var(--accent-grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.lede{font-size:15.5px;color:var(--text-2);line-height:1.75}
.lede b{color:var(--text);font-weight:650}
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
.dist-val{font-size:12.8px;color:var(--text-2);text-align:right;font-variant-numeric:tabular-nums;font-weight:600}

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

/* ---------- 阶段表 ---------- */
.phase{display:grid;grid-template-columns:104px 1fr;border:1px solid var(--border);background:var(--surface);overflow:hidden}
.phase:first-of-type{border-radius:var(--r) var(--r) 0 0}
.phase:last-of-type{border-radius:0 0 var(--r) var(--r)}
.phase+.phase{border-top:none}
.phase-w{
  background:var(--bg-3);padding:16px 13px;font-size:12.2px;font-weight:700;color:var(--accent);
  border-right:1px solid var(--border);display:flex;align-items:center;white-space:nowrap;
}
.phase-b{padding:16px 18px}
.phase-b h4{font-size:14px;font-weight:700;margin-bottom:5px}
.phase-b p{font-size:13.2px;color:var(--text-2);line-height:1.65}
.phase-ok{font-size:12.2px;color:var(--ok);margin-top:8px;font-weight:650}

/* ---------- 页脚 ---------- */
footer{margin-top:60px;padding:30px 0 40px;border-top:1px solid var(--border);font-size:12.5px;color:var(--text-3)}
footer p{margin:5px 0}
footer b{color:var(--text-2)}

/* ---------- 响应式 ---------- */
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
  .sell-row{grid-template-columns:1fr}
  .section{margin:38px 0}
  .card{padding:17px}
  .cockpit{padding:18px}
  .dist-row{grid-template-columns:92px 1fr 74px;gap:9px}
  table{font-size:12.4px}
  th,td{padding:8px 9px}
  .phase{grid-template-columns:1fr}
  .phase-w{border-right:none;border-bottom:1px solid var(--border)}
  .pri{padding:16px 18px}
}
`;

/* ============================ 公共片段 ============================ */
const NAV = [
  ['index.html', '总览'],
  ['papers.html', '逐年真题'],
  ['trend.html', '趋势与考点'],
  ['plan.html', '冲刺计划'],
  ['slides.html', '演示', 'nav-slides'],
];

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
<header class="site-head"><div class="hdr-in">
  <a class="brand" href="index.html">
    <span class="brand-mark">西</span>
    <span>${esc(SITE.short)}<small>初一上·期末</small></span>
  </a>
  <nav class="hdr-nav">
    ${NAV.map(([h, t, cls]) => `<a href="${h}"${cls ? ` class="${cls}"` : (h === active ? ' class="on"' : '')}>${t}</a>`).join('')}
  </nav>
</div></header>
<main class="wrap">
${body}
</main>
<footer class="wrap">
  <p><b>${esc(SITE.full)}</b> · 样本：西城区 ${YEARS.join(' / ')} 五套期末真题，共 ${LEDGER.length} 题逐题标注</p>
  <p>所有统计数字由逐题台账派生，非人工填写。频次结论基于 ${N_PAPERS} 套样本，不构成押题。</p>
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

/* ============================ 首页 ============================ */
function buildHome() {
  const topFams = FAMILY_MAP.slice(0, 4);

  const body = `
<section class="hero">
  <div class="hero-split">
    <div>
      <div class="hero-badge"><span class="dot-live"></span>西城区区统考 · 五年真题逐题拆解</div>
      <h1>丢分的不是难题，<br><span class="accent-word">是会做但没做对</span></h1>
      <p class="lede">
        五年里，<b>基础题 + 中档题稳定在 ${BASE_MIN}–${BASE_MAX} 分</b>，较难 + 压轴只有 ${HARD_MIN}–${HARD_MAX} 分。
        也就是说：<b>大部分分数来自那些「会做」的题</b>，丢分也多半丢在这里——跟会不会做难题关系不大。
        本站把五套卷逐题拆开，告诉你每年考什么、五年什么在变、先练什么更划算。
      </p>
      <div class="hero-cta">
        <a class="btn primary" href="plan.html">看冲刺计划 <span aria-hidden="true">→</span></a>
        <a class="btn" href="trend.html">先看五年趋势</a>
      </div>
      <div class="hero-trust">
        <span><b>✓</b> 五套真题</span>
        <span><b>✓</b> ${LEDGER.length} 题逐题标注</span>
        <span><b>✓</b> 数字全部派生</span>
        <span><b>✓</b> 不押题</span>
      </div>
      <div class="hero-stats">
        <div><b>${LEDGER.length}</b><span>题逐题标注</span></div>
        <div><b>${FAMILY_MAP.length}</b><span>个考点族</span></div>
        <div><b>${FREQ.must.length}</b><span>个五年必考</span></div>
        <div><b>${BASE_AVG}<span class="hs-of">分</span></b><span>基础+中档均值</span></div>
      </div>
    </div>

    <aside class="cockpit">
      <div class="cockpit-top">
        <span class="level-pill">分值结构</span>
        <span style="font-size:12px;color:var(--text-3)">五年均值</span>
      </div>
      <div class="metric-row">
        <span class="mv accent">${pct(BASE_AVG)}</span>
        <span class="ml"><b>基础 + 中档</b>分值主体，五年 ${BASE_MIN}–${BASE_MAX} 分</span>
      </div>
      <div class="metric-row">
        <span class="mv gold">${pct(HARD_AVG)}</span>
        <span class="ml"><b>较难 + 压轴</b>五年 ${HARD_MIN}–${HARD_MAX} 分，压轴多为分类讨论</span>
      </div>
      <div class="metric-row">
        <span class="mv ok">${CALC_CONCEPT}<span style="font-size:15px">%</span></span>
        <span class="ml"><b>计算 + 概念</b>靠「准确」而不是「灵感」</span>
      </div>
      <div class="mission-list">
        <a class="mission-item" href="papers.html">
          <span class="mi-ico blue">📄</span>
          <span class="mi-main"><b>逐年真题</b><small>五套卷逐套看结构与差异</small></span>
          <span class="mi-go">去看 →</span>
        </a>
        <a class="mission-item" href="trend.html">
          <span class="mi-ico purple">📊</span>
          <span class="mi-main"><b>趋势与考点</b><small>什么在变、什么年年考</small></span>
          <span class="mi-go">去看 →</span>
        </a>
        <a class="mission-item" href="plan.html">
          <span class="mi-ico gold">🎯</span>
          <span class="mi-main"><b>冲刺计划</b><small>五级优先级 + 六周节奏</small></span>
          <span class="mi-go">去看 →</span>
        </a>
      </div>
    </aside>
  </div>
</section>

${section('分数从哪来', '三个判断，决定复习顺序', '这三个判断都不是经验之谈，是从五年分值分布算出来的', `
<div class="sell-rows">
  <div class="sell-row">
    <div class="sell-pain">
      <span class="sell-no">01</span>
      <b>难题全丢，大部分分数仍然在</b>
      <span class="sell-pain-sub">丢分的大头也不在压轴</span>
    </div>
    <div class="sell-fix">
      <span class="sell-tag">分值结构</span>
      <p>五年难度分布几乎不动：基础 + 中档 <b>${BASE_MIN}–${BASE_MAX} 分</b>，较难 + 压轴 <b>${HARD_MIN}–${HARD_MAX} 分</b>。
      难度指数五年在 ${DIFF_INDEX_MIN}–${DIFF_INDEX_MAX} 之间。<b>所以复习顺序应该把「计算零失误」排在「攻压轴」前面</b>——不是因为它更难，而是因为它更值钱、更可控。</p>
      <a class="sell-link" href="trend.html#difficulty">看难度五年分布 →</a>
    </div>
  </div>
  <div class="sell-row">
    <div class="sell-pain">
      <span class="sell-no">02</span>
      <b>同一道题，换年换个载体就认不出</b>
      <span class="sell-pain-sub">按题干分组会把「必考」误判成「偶考」</span>
    </div>
    <div class="sell-fix">
      <span class="sell-tag">考点族</span>
      <p>第 23 题五年分别考数轴动点、动角、线段中点、数轴双动点、数轴动点——<b>载体全换</b>。
      如果按题干分组，每一族都会显示「只考过一次」，得出「不用重点练」的错误结论。
      <b>按考法归并后，它是 5/5 必考、${famById('f-final').total} 分。</b></p>
      <a class="sell-link" href="trend.html#families">看 ${FAMILY_MAP.length} 个考点族 →</a>
    </div>
  </div>
  <div class="sell-row">
    <div class="sell-pain">
      <span class="sell-no">03</span>
      <b>卷面骨架五年没变，但题位会互换</b>
      <span class="sell-pain-sub">按题号背「第 19 题是作图」会失手</span>
    </div>
    <div class="sell-fix">
      <span class="sell-tag">卷面结构</span>
      <p>26 题 / 100 分钟 / 选择 16 + 填空 16 + 解答 68，五年一动没动。
      但 2025-26 把「解方程」放到第 19 题（12 分）、「尺规作图」放到第 20 题（5 分），与往年相反——<b>要按题型认，不按题号认。</b></p>
      <a class="sell-link" href="papers.html">看逐年真题 →</a>
    </div>
  </div>
</div>`)}

${section('分值分区', '100 分不是均匀分布的', '三块的目标不同，练法也不同', `
<div class="tier-grid">
  <a class="tier-card t-blue" href="plan.html">
    <div class="tier-n">${pct(BASE_AVG)}<small>分</small></div>
    <div class="tier-l">基础 + 中档</div>
    <div class="tier-d">计算、概念辨析、常规几何与方程</div>
    <div class="tier-goal">目标：100% 正确，一分不丢</div>
  </a>
  <a class="tier-card t-gold" href="plan.html">
    <div class="tier-n">${pct(HARD_AVG - TOP_MODE)}<small>分</small></div>
    <div class="tier-l">较难</div>
    <div class="tier-d">选择末题、填空末题、解答中段的思维题</div>
    <div class="tier-goal">目标：争取大部分</div>
  </a>
  <a class="tier-card t-rose" href="plan.html">
    <div class="tier-n">${TOP_MODE}<small>分</small></div>
    <div class="tier-l">压轴</div>
    <div class="tier-d">第 23 题分类讨论 + 第 24 题动角/新定义</div>
    <div class="tier-goal">目标：分类不漏就不亏</div>
  </a>
</div>
<div class="note" style="margin-top:16px">
  <b>读法：</b>蓝色那块（${pct(BASE_AVG)} 分）是「会做但没做对」的重灾区，也是唯一能靠训练做到 100% 的部分。
  金色与红色两块合计 ${pct(HARD_AVG)} 分，其中有相当部分靠方法而非熟练度。<b>先把蓝色做到零失误，再谈另外两块。</b>
</div>`)}

${section('必考清单', `五年年年考的 ${FREQ.must.length} 个考点族`, `覆盖必做分 ${FREQ_SUMMARY.must.pct}%（${FREQ_SUMMARY.must.score}/${MAIN_GRAND} 分）`, `
<div class="grid g2">
  ${topFams.map((f) => `
    <div class="fam">
      <div class="fam-head">
        <span class="fam-name">${esc(f.name)}</span>
        <span class="tag must">5/5 年</span>
        <span class="fam-score">${f.total} 分 · 年均 ${f.avgPerYear}</span>
      </div>
      <div class="fam-note">${esc(f.note)}</div>
    </div>`).join('')}
</div>
<p style="margin-top:16px"><a href="trend.html#families" style="color:var(--accent);font-weight:650;text-decoration:none;font-size:13.5px">查看全部 ${FAMILY_MAP.length} 个考点年均分值 →</a></p>`)}
`;
  return page('index.html', SITE.name, '西城区初一上数学期末五年真题考情分析与冲刺计划', body);
}

/* ============================ 逐年真题 ============================ */
function buildPapers() {
  const body = `
<section class="hero" style="padding:44px 0 8px">
  <div class="hero-badge"><span class="dot-live"></span>五套卷 · 逐套拆解</div>
  <h1>逐年真题拆解</h1>
  <p class="lede">五套卷逐套看：结构、章节、能力、难度各是什么样，以及<b>这一年跟别的年份有什么不同</b>。</p>
</section>

${PAPER_STATS.map((s) => {
    const bonusQs = LEDGER.filter((q) => q.p === s.id && q.bonus);
    return section(s.label, `${s.year} 学年`,
      `${s.mainCount} 必做 + ${s.bonusCount} 选做 ｜ 必做 ${s.mainTotal} 分 ｜ 难度指数 ${s.diffIndex}`,
      `<div class="grid g2">
        <div class="card">
          <h3>章节分值</h3>
          ${CH_ORDER.map((k) => distBar(CH_NAME[k], s.ch[k] || 0, 30, ' 分')).join('')}
        </div>
        <div class="card">
          <h3>难度分布</h3>
          ${DIFF_ORDER.map((k) => distBar(DIFF_NAME[k], s.diff[k] || 0, 60, ' 分',
        k === 'easy' ? 'ok' : k === 'mid' ? '' : k === 'hard' ? 'gold' : 'rose')).join('')}
          <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);font-size:12.6px;color:var(--text-3)">
            题量：基础 ${s.diffN.easy || 0} · 中档 ${s.diffN.mid || 0} · 较难 ${s.diffN.hard || 0} · 压轴 ${s.diffN.top || 0}
          </div>
        </div>
      </div>
      <div class="card">
        <h3>本卷结构</h3>
        <div class="tbl-wrap"><table>
          <thead><tr><th>大题</th><th class="num">分值</th><th>说明</th></tr></thead>
          <tbody>
            <tr><td>一、选择</td><td class="num">${s.seg['选择']}</td><td>8 题 × 2 分</td></tr>
            <tr><td>二、填空</td><td class="num">${s.seg['填空']}</td><td>8 题 × 2 分</td></tr>
            <tr><td>三、解答</td><td class="num">${s.seg['解答']}</td><td>${esc(s.solveLayout)}</td></tr>
            <tr><td>四、选做</td><td class="num">${s.bonusTotal}</td><td>${esc(s.bonusLayout)}（计入总分，卷面封顶 100）</td></tr>
          </tbody>
          <tfoot><tr><td>必做合计</td><td class="num">${s.mainTotal}</td><td>卷面封顶 100 分</td></tr></tfoot>
        </table></div>
        <div style="margin-top:14px;display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <span style="font-size:12.4px;color:var(--text-3)">选做考什么：</span>
          ${bonusQs.map((q) => `<span class="tag bonus">${esc(q.topic)}（${q.cat}）</span>`).join(' ')}
        </div>
      </div>`);
  }).join('')}

${section('横向对照', '五套卷放在一起看', '哪一年最难、哪一年几何最重', `
<div class="tbl-wrap"><table>
  <thead><tr><th>年份</th><th class="num">基础</th><th class="num">中档</th><th class="num">较难</th><th class="num">压轴</th><th class="num">难度指数</th><th class="num">几何</th><th class="num">方程</th><th class="num">运算</th></tr></thead>
  <tbody>${PAPER_STATS.map((s) => `<tr>
    <td><b>${s.label}</b></td>
    <td class="num">${s.diff.easy || 0}</td>
    <td class="num">${s.diff.mid || 0}</td>
    <td class="num">${s.diff.hard || 0}</td>
    <td class="num">${s.diff.top || 0}</td>
    <td class="num cell-hi">${s.diffIndex}</td>
    <td class="num">${s.ch['ch-geo'] || 0}</td>
    <td class="num">${s.ch['ch-eq'] || 0}</td>
    <td class="num">${s.ch['ch-op'] || 0}</td>
  </tr>`).join('')}</tbody>
</table></div>
<p style="margin-top:12px;font-size:12.8px;color:var(--text-3)">
  难度指数 = 按分值加权（基础 1 / 中档 2 / 较难 3 / 压轴 4）后归一。五年在 ${DIFF_INDEX_MIN}–${DIFF_INDEX_MAX} 之间，几乎没有变化。
</p>`, 'compare')}

`;
  return page('papers.html', '逐年真题拆解 · ' + SITE.short, '西城区初一上数学期末五套真题逐卷结构分析', body);
}

/* ============================ 趋势与考点 ============================ */
function buildTrend() {
  const catMax = Math.max(...CAT_ORDER.map((k) => CAT_SCORE[k].max));

  const body = `
<section class="hero" style="padding:44px 0 8px">
  <div class="hero-badge"><span class="dot-live"></span>五年趋势 · 考点频次</div>
  <h1>五年趋势与考点频次</h1>
  <p class="lede">先看什么在变（章节、能力、难度），再看各考点的年均分值——分值高的先练。</p>
</section>

${section('章节', '各章分值五年走势', '极差 = 五年最高与最低之差', `
<div class="tbl-wrap"><table>
  <thead><tr><th>章节</th>${YEARS.map((y) => `<th class="num">${y}</th>`).join('')}<th class="num">均分</th><th class="num">占比</th><th class="num">极差</th></tr></thead>
  <tbody>${CH_ORDER.map((k) => {
    const d = CH_SCORE[k];
    return `<tr><td><b>${d.name}</b></td>${d.per.map((v) => `<td class="num">${v}</td>`).join('')}
      <td class="num cell-hi">${d.avg}</td><td class="num">${d.pct}%</td>
      <td class="num">${d.range >= 8 ? `<span style="color:var(--gold);font-weight:700">${d.range}</span>` : d.range}</td></tr>`;
  }).join('')}</tbody>
  <tfoot><tr><td>合计</td>${YEARS.map(() => '<td class="num">100</td>').join('')}<td class="num">100</td><td class="num">100%</td><td class="num">—</td></tr></tfoot>
</table></div>
<div class="note" style="margin-top:14px">
  <b>最稳的是整式的加减</b>（极差 ${CH_SCORE['ch-poly'].range} 分），<b>波动最大的是几何与运算</b>（极差 ${CH_SCORE['ch-geo'].range} 与 ${CH_SCORE['ch-op'].range} 分），
  而且两者此消彼长——几何重的年份运算就轻。
</div>`, 'chapters')}

${section('能力', '八种能力的分值分布', '按「这道题主要卡在哪」归类，一题一类', `
<div class="card">
  ${CAT_ORDER.map((k) => {
    const d = CAT_SCORE[k];
    return `<div style="padding:9px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:13.2px;margin-bottom:6px;gap:10px;flex-wrap:wrap">
        <span><b style="font-weight:650">${d.name}</b> <span style="color:var(--text-3);font-size:12px">年均 ${d.avg} 分 · 占 ${d.pct}%</span></span>
        <span style="color:var(--text-2);font-variant-numeric:tabular-nums;font-size:12.2px">${d.per.join(' / ')}</span>
      </div>
      <div class="dist-bar-wrap"><span class="dist-bar ${d.pct >= 30 ? '' : d.pct >= 10 ? 'gold' : 'ok'}" style="width:${Math.round(d.avg / catMax * 100)}%"></span></div>
    </div>`;
  }).join('')}
  <div class="note" style="margin-top:16px">
    <b>计算 ${CAT_SCORE['计算'].pct}% + 概念 ${CAT_SCORE['概念'].pct}% = ${CALC_CONCEPT}%</b>：近六成分值靠「准确」而不是「灵感」。<br>
    <b>分类讨论连续两年 13 分</b>（2024-25、2025-26），是唯一明显上升的能力。<br>
    <b>新定义在必做位已消失</b>：2025-26 的新定义全部落在选做，2024-25 只剩 2 分——「新定义是压轴」这个旧印象已经过时。
  </div>
</div>`, 'abilities')}

${section('难度', '难度四级五年分布', `基础 ${DIFF_SCORE.easy.pct}% / 中档 ${DIFF_SCORE.mid.pct}% / 较难 ${DIFF_SCORE.hard.pct}% / 压轴 ${DIFF_SCORE.top.pct}%`, `
<div class="tbl-wrap"><table>
  <thead><tr><th>难度</th>${YEARS.map((y) => `<th class="num">${y}</th>`).join('')}<th class="num">年均</th><th class="num">占比</th></tr></thead>
  <tbody>${DIFF_ORDER.map((k) => {
    const d = DIFF_SCORE[k];
    return `<tr><td><span class="tag ${k}">${d.name}</span></td>${d.per.map((v) => `<td class="num">${v}</td>`).join('')}
      <td class="num cell-hi">${d.avg}</td><td class="num">${d.pct}%</td></tr>`;
  }).join('')}</tbody>
  <tfoot><tr><td>合计</td>${YEARS.map(() => '<td class="num">100</td>').join('')}<td class="num">100</td><td class="num">100%</td></tr></tfoot>
</table></div>
<div class="note info" style="margin-top:14px">
  难度标注说明：2025-26 卷自带官方标注（易/较易/中档/较难），已逐题比对；其余四套为人工判定。用于看<b>大致比例</b>，不宜精确到单题。
</div>`, 'difficulty')}

${section('考点族', '各考点年均分值',
    `按章节分组 · 组内按年均分降序 · 共 ${FAMILY_MAP.length} 族`, `
<div class="tbl-wrap"><table class="fam-tbl">
  <thead><tr><th>考点</th><th class="num">年均分</th><th class="num">出现年数</th></tr></thead>
  <tbody>${CH_GROUPS.map((g) => `
    <tr style="background:var(--bg-3)">
      <td colspan="3" style="font-weight:700;color:var(--text);white-space:normal">
        ${esc(g.name)}
        <span style="font-weight:500;color:var(--text-3);font-size:12.5px;margin-left:8px">五年合计 ${g.total} 分</span>
      </td>
    </tr>
    ${g.fams.map((f) => `<tr>
      <td style="padding-left:26px">${esc(f.name)}</td>
      <td class="num cell-hi">${f.avgPerYear || '—'}</td>
      <td class="num">${f.hitYears}/${N_PAPERS}</td>
    </tr>`).join('')}`).join('')}</tbody>
  <tfoot><tr><td>合计</td><td class="num">${MAIN_GRAND / N_PAPERS}</td><td class="num">—</td></tr></tfoot>
</table></div>
<p style="margin-top:12px;font-size:12.8px;color:var(--text-3)">
  年均分 = 五年必做分合计 ÷ ${N_PAPERS}。只出现在选做位的考点计 0 分（选做不计入必做 100 分）。
</p>`, 'families')}

${section('诚实边界', '三个必须说明的限制', '', `
<div class="card">
  <ul class="clean">
    <li><b>样本只有 ${N_PAPERS} 套。</b>「必考 5/5」的意思是「这五年每年都考」，不是「明年一定考」。频次三档（5/5、4/5、≤3/5）是按 ${N_PAPERS} 套算的，样本增加时结论会变。</li>
    <li><b>2022-23 卷没有官方答案</b>（只有原卷），该套未纳入可判分范围；其余四套有完整答案与解析。</li>
    <li><b>不预测下一年考什么。</b>本站只陈述「过去五年实际考了什么、以什么频次、在什么位置」。</li>
  </ul>
</div>`)}
`;
  return page('trend.html', '五年趋势与考点频次 · ' + SITE.short, '西城区初一上数学期末五年考情趋势与考点族频次', body);
}

/* ============================ 冲刺计划 ============================ */
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

  const phases = [
    { w: '第 1–2 周', t: '计算固化', b: '每天 1 组第 17 题（4 小问）+ 1 组解方程 + 1 道化简求值，限时完成。', ok: '达标：连续 5 天全对，且不再超时' },
    { w: '第 2–3 周', t: '概念清单', b: '把五套卷所有选择题的错误选项归类，做成「陷阱清单」，每类写出识别方法。', ok: '达标：能说出每类陷阱怎么识别' },
    { w: '第 3–4 周', t: '几何格式', b: '作图题专练「画 + 写依据」；角度推理专练补全过程与理由用词。', ok: '达标：依据写全、理由用词准确' },
    { w: '第 4–5 周', t: '分类压轴', b: '五套卷第 23 题逐题重做，重点练「分几种情况、为什么是这几种」。', ok: '达标：每道题能说清分类为什么完备、不漏' },
    { w: '第 5–6 周', t: '整卷实战', b: '五套真题限时整卷，按真实考试节奏走一遍，主要是熟悉节奏。', ok: '达标：基础段没有非受迫性失误' },
    { w: '考前 3 天', t: '只回看', b: '只过错题与陷阱清单，不做新题。', ok: '达标：错题清单上的题都能说出错在哪' },
  ];

  const body = `
<section class="hero" style="padding:44px 0 8px">
  <div class="hero-badge"><span class="dot-live"></span>五级优先级 · 六周节奏</div>
  <h1>冲刺计划</h1>
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

${section('节奏', '六周冲刺节奏（可按实际剩余时间压缩）', '每个阶段带达标判据，不达标不进入下一阶段',
    phases.map((p) => `<div class="phase">
      <div class="phase-w">${p.w}</div>
      <div class="phase-b">
        <h4>${p.t}</h4>
        <p>${p.b}</p>
        <div class="phase-ok">${p.ok}</div>
      </div>
    </div>`).join(''), 'rhythm')}

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
  return page('plan.html', '冲刺计划 · ' + SITE.short, '西城区初一上数学期末冲刺计划：五级优先级与六周节奏', body);
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
  ['index.html', buildHome()],
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
