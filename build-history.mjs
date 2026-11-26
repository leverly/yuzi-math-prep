#!/usr/bin/env node
// 历史记录页：逐轮结果 + 多轮汇总
// 数据来自 localStorage（与 practice.html 同一 key），此页只读
import { writeFileSync, readFileSync } from 'node:fs';

import { BANK, FAM_META } from './practice-data.mjs';
import { CH_NAME } from './work/papers/ledger.mjs';
import { TOKENS, HEAD_CSS, PAGEHEAD_CSS, headerHtml, THEME_INIT, THEME_SCRIPT } from './work/site-shell.mjs';
import { CHART_CSS, barBlock } from './work/charts.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const CH_ORDER = ['ch-rational', 'ch-op', 'ch-expr', 'ch-poly', 'ch-eq', 'ch-geo'];
const chList = CH_ORDER.filter((c) => BANK.some((q) => (FAM_META[q.fam] || {}).ch === c));

const CSS = TOKENS + HEAD_CSS + PAGEHEAD_CSS + `
body{padding-bottom:80px}
.head{padding:38px 0 18px}

/* 汇总卡 */
.sum-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:22px 0}
.sm{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 18px}
.sm .n{font-size:28px;font-weight:800;letter-spacing:-.03em;font-variant-numeric:tabular-nums;line-height:1.1}
.sm .l{font-size:12.5px;color:var(--text-3);margin-top:5px}
.sm.accent .n{color:var(--accent)}
.sm.rose .n{color:var(--rose)}
.sm.gold .n{color:var(--gold)}
.sm.ok .n{color:var(--ok)}

/* 章节汇总表 */
.sect{margin:34px 0}
.sect-head{display:flex;align-items:baseline;gap:12px;margin-bottom:14px;flex-wrap:wrap}
.kicker{font-family:var(--mono);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;
  color:var(--accent);font-weight:600}
.sect-head h2{font-size:21px;font-weight:780;letter-spacing:-.02em}
.sect-head .sub{font-size:12.5px;color:var(--text-3)}

.ch-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
/* 考点族按章分组：每章一个小组，带「几个考点有样本」的计数 */
/* 考点族按章折叠：收起时只留标题行，所以标题行必须自带信息 */
.fam-grp{border:1px solid var(--border);border-radius:var(--r-sm);background:var(--surface);
  margin-bottom:9px;overflow:hidden}
.fam-grp:last-child{margin-bottom:0}
.fam-grp-h{display:flex;align-items:center;gap:10px;flex-wrap:wrap;cursor:pointer;
  font-size:13.2px;font-weight:700;color:var(--text-2);list-style:none;
  padding:11px 15px;user-select:none;transition:.14s var(--ease)}
.fam-grp-h::-webkit-details-marker{display:none}
.fam-grp-h:hover{background:var(--surface-2);color:var(--text)}
/* 箭头用 CSS 三角，不依赖字体字形（▸ 在部分环境缺字，会渲染成一个小点） */
.fam-grp-h::before{content:'';width:0;height:0;flex:none;
  border-left:5px solid var(--text-3);
  border-top:4px solid transparent;border-bottom:4px solid transparent;
  transition:transform .16s var(--ease)}
.fam-grp[open]>.fam-grp-h::before{transform:rotate(90deg)}
.fam-grp-h span{font-size:11.5px;font-weight:600;color:var(--text-3)}
.fam-grp-h .fam-grp-badges{margin-left:auto;display:flex;gap:7px}
.fam-grp-h .fam-grp-badges b{font-size:11px;font-weight:700;padding:1.5px 7px;border-radius:5px}
.fam-grp-h .tier-weak{background:var(--rose-soft);color:var(--rose)}
.fam-grp-h .tier-shaky{background:var(--gold-soft);color:var(--gold)}
/* 展开后内容留出内边距，与标题行对齐 */
.fam-grp .ch-grid{padding:0 15px 15px}
.ch-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:15px 17px}
.ch-name{font-size:14.5px;font-weight:700;margin-bottom:3px}
.ch-meta{font-size:12px;color:var(--text-3);margin-bottom:10px}
.ch-bar{height:7px;background:var(--bg-3);border-radius:4px;overflow:hidden;margin-bottom:8px}
.ch-bar i{display:block;height:100%;border-radius:4px}
.bar-weak{background:linear-gradient(135deg,#f43f5e,#e11d48)}
.bar-shaky{background:linear-gradient(135deg,#f59e0b,#d97706)}
.bar-solid{background:linear-gradient(135deg,#10b981,#059669)}
.bar-insufficient{background:var(--mute)}
.ch-row{display:flex;justify-content:space-between;align-items:baseline;font-size:12.5px}
.ch-rate{font-family:var(--mono);font-weight:700;font-variant-numeric:tabular-nums}
.rate-weak{color:var(--rose)}.rate-shaky{color:var(--gold)}
.rate-solid{color:var(--ok)}.rate-insufficient{color:var(--text-3)}
.ch-tier{font-size:11px;font-weight:700;padding:2px 8px;border-radius:var(--r-pill)}
.tier-weak{background:var(--rose-soft);color:var(--rose)}
.tier-shaky{background:var(--gold-soft);color:var(--gold)}
.tier-solid{background:var(--ok-soft);color:var(--ok)}
.tier-insufficient{background:var(--track);color:var(--text-3)}

${CHART_CSS}

/* 逐轮列表 */
.round-list{display:flex;flex-direction:column;gap:10px}
.round{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.round-head{display:grid;grid-template-columns:auto 1fr auto auto;gap:14px;align-items:center;
  padding:13px 17px;cursor:pointer;user-select:none}
.round-head:hover{background:var(--surface-2)}
.round-no{font-family:var(--mono);font-size:12px;font-weight:700;color:var(--accent);
  background:var(--accent-soft);padding:3px 9px;border-radius:6px;white-space:nowrap}
.round-time{font-size:13px;color:var(--text-2)}
.round-score{font-family:var(--mono);font-size:14px;font-weight:700;font-variant-numeric:tabular-nums}
.round-pct{font-size:12px;color:var(--text-3)}
.round-body{display:none;padding:0 17px 15px;border-top:1px solid var(--border)}
.round.open .round-body{display:block}
/* 逐轮明细里的分组标题：一节按章节、一节按能力，是同一批题的两种切法 */
.grp-lbl{font-size:12.5px;font-weight:700;color:var(--text-2);
  margin:14px 0 9px;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.grp-lbl:first-child{margin-top:13px}
.grp-lbl span{font-size:11.5px;font-weight:500;color:var(--text-3)}
/* 能力区在老记录下的说明 */
.note-cap{background:var(--accent-soft);border:1px solid rgba(37,99,235,.2);
  border-radius:10px;padding:12px 15px;font-size:13px;color:var(--text-2);
  line-height:1.7;margin-bottom:13px}
.note-cap b{color:var(--accent)}
.round-body .ch-grid{grid-template-columns:repeat(3,1fr);margin-top:14px}
.round-body .ch-card{background:var(--surface-2);box-shadow:none}

.empty{text-align:center;padding:70px 20px}
.empty .big{font-size:44px;margin-bottom:14px}
.empty p{color:var(--text-3);font-size:14.5px;line-height:1.8}
.empty a{color:var(--accent);font-weight:650;text-decoration:none}

.actions{display:flex;gap:10px;margin-top:26px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:11px;
  font-size:14px;font-weight:650;border:1px solid var(--border);background:var(--surface);
  color:var(--text);cursor:pointer;transition:.15s;box-shadow:var(--shadow-2);font-family:inherit;
  text-decoration:none}
.btn:hover{transform:translateY(-1px)}
.btn.primary{background:var(--accent-grad);color:#fff;border-color:transparent}
.btn.ghost{box-shadow:none;background:transparent}

@media(max-width:900px){
  .sum-grid{grid-template-columns:repeat(2,1fr)}
  .ch-grid{grid-template-columns:repeat(2,1fr)}
  .round-body .ch-grid{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:600px){
  .ch-grid{grid-template-columns:1fr}
  .round-body .ch-grid{grid-template-columns:1fr}
  .round-head{grid-template-columns:auto 1fr auto;gap:10px}
  .round-score{grid-column:3}
}
`;

const SCRIPT = `
import { BANK, FAM_META, CH_NAME } from './practice-data.mjs';

const LS_KEY = 'xz-practice-v1';
const CH_ORDER = ${JSON.stringify(chList)};

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { sessions: [], allRecords: [] };
    const o = JSON.parse(raw);
    return { sessions: o.sessions || [], allRecords: o.allRecords || [] };
  } catch (e) { return { sessions: [], allRecords: [] }; }
}

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const TIER = { weak:'薄弱', shaky:'不稳', solid:'掌握', insufficient:'样本不足' };
const TIER_RULE = { minSample: 3, weak: 0.6, solid: 0.85 };

/* 章节级分档：小样本（3–5 题）用更宽的口径，
 * 因为单轮只有 3 题，错 1 题就从 100% 掉到 67%，按百分比分档会过度敏感。 */
function tierOf(total, ok) {
  if (total < 3) return 'insufficient';
  if (total < 6) {
    if (ok === total) return 'solid';
    if (ok >= total - 1) return 'shaky';
    return 'weak';
  }
  const r = ok / total;
  return r < 0.6 ? 'weak' : r < 0.85 ? 'shaky' : 'solid';
}

function fmtTime(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return (d.getMonth()+1) + '月' + d.getDate() + '日 ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

function render() {
  const store = load();
  const sess = store.sessions || [];

  if (!sess.length) {
    $('#root').innerHTML =
      '<div class="empty">' +
        '<div class="big">📋</div>' +
        '<p>还没有练习记录。<br>做一轮诊断后，这里会逐轮记录下来，并汇总出各章的掌握情况。</p>' +
        '<div class="actions" style="justify-content:center">' +
          '<a class="btn primary" href="practice.html">去做一轮诊断</a>' +
        '</div>' +
      '</div>';
    return;
  }

  // ---- 汇总：按章节累计全部轮次 ----
  const agg = {};
  for (const ch of CH_ORDER) agg[ch] = { ch, name: CH_NAME[ch] || ch, total: 0, ok: 0, times: 0 };
  for (const s of sess) {
    for (const c of (s.chs || [])) {
      if (!agg[c.ch]) agg[c.ch] = { ch: c.ch, name: c.name, total: 0, ok: 0, times: 0 };
      agg[c.ch].total += c.total;
      agg[c.ch].ok += c.ok;
      agg[c.ch].times += 1;
    }
  }
  const chs = Object.values(agg).filter((c) => c.total > 0);
  for (const c of chs) {
    c.rate = c.ok / c.total;
    c.tier = tierOf(c.total, c.ok);
  }
  chs.sort((a, b) => {
    const ord = { weak: 0, shaky: 1, insufficient: 2, solid: 3 };
    return ord[a.tier] - ord[b.tier] || a.rate - b.rate;
  });

  const withChs = sess.filter((s) => Array.isArray(s.chs) && s.chs.length).length;
  const totalQ = sess.reduce((a, s) => a + (s.n || 0), 0);
  const totalOk = sess.reduce((a, s) => a + (s.ok || 0), 0);
  const rate = totalQ ? totalOk / totalQ : 0;

  // ---- 渲染 ----
  let html = '';
  /* 三个知识维度的区块先攒到变量里，最后按指定顺序拼接。
     顺序：能力 → 章节 → 考点（能力是主视角，知识维度是下钻）。
     三块各自在不同作用域里生成，所以不能靠调整 append 先后实现。 */
  let blockCat = '', blockCh = '', blockFam = '';

  html += '<div class="sum-grid">' +
    '<div class="sm accent"><div class="n">' + sess.length + '</div><div class="l">已完成轮次</div></div>' +
    '<div class="sm"><div class="n">' + totalQ + '</div><div class="l">累计做题</div></div>' +
    '<div class="sm ok"><div class="n">' + Math.round(rate * 100) + '%</div><div class="l">累计正确率</div></div>' +
    '<div class="sm rose"><div class="n">' + chs.filter(c => c.tier === 'weak').length + '</div><div class="l">薄弱章节</div></div>' +
    '</div>';

  /* 章节掌握度柱状图：横轴固定 CH_ORDER 章节顺序，纵轴是掌握度（= 正确率）。
   * 原来这里是 3 列卡片网格，每张卡各自一条进度条——读得出单章数值，
   * 读不出「哪几章一起塌」；而且卡片按「薄弱优先」排序，每次刷新顺序都变，
   * 无法跨轮比较。柱状图按固定章节顺序，同一根柱子的高度变化就是进步。
   * 纵轴与能力图统一用掌握度（2026-11-26 用户要求）：两图并排时方向一致，
   * 不会出现「同一屏里一张越高越好、另一张越高越差」的认知切换。 */
  const chChartItems = CH_ORDER.map((ch) => {
    const c = chs.find((x) => x.ch === ch);
    const known = !!(c && c.total > 0);
    return {
      name: CH_NAME[ch] || ch,
      rate: known ? c.rate : 0,
      known,
      ok: known ? c.ok : 0,
      total: known ? c.total : 0,
      tier: known ? c.tier : 'insufficient',
    };
  });
  const chKnown = chChartItems.filter((x) => x.known).length;
  const chShort = chChartItems.filter((x) => x.known && x.tier === 'insufficient').length;
  const chChart = barBlock(chChartItems, {
    aria: '各章节掌握度柱状图',
    note: chKnown < chChartItems.length
      ? '已练到 ' + chKnown + ' / ' + chChartItems.length + ' 章；没练到的只有一条基线，柱子缺失就是缺口。'
      : chShort > 0
        ? '六章都已练到；其中 ' + chShort + ' 章不到 3 题（虚线框），暂不给分档。'
        : '六章都已练到。掌握度 = 正确率，柱子越高越稳。',
  });

  blockCh += '<div class="sect"><div class="sect-head"><span class="kicker">Summary</span>' +
    '<h2>各章累计掌握情况</h2><span class="sub">' +
      (withChs < sess.length ? withChs + ' / ' + sess.length + ' 轮有章节明细' : '全部 ' + sess.length + ' 轮合并统计') +
      ' · 已覆盖 ' + chKnown + ' / ' + CH_ORDER.length + ' 章' +
      '</span></div>' +
    chChart + '</div>';

  // ---- 汇总：按能力累计 ----
  const CAT_ORDER_UI = ['计算', '概念', '建模', '推理', '分类', '作图', '空间', '新定义'];
  const catAgg = {};
  for (const c of CAT_ORDER_UI) catAgg[c] = { cat: c, name: c, total: 0, ok: 0, times: 0 };
  let catSessions = 0;
  for (const s of sess) {
    if (!Array.isArray(s.cats) || !s.cats.length) continue;
    catSessions++;
    for (const c of s.cats) {
      if (!catAgg[c.cat]) catAgg[c.cat] = { cat: c.cat, name: c.name, total: 0, ok: 0, times: 0 };
      catAgg[c.cat].total += c.total;
      catAgg[c.cat].ok += c.ok;
      if (c.total > 0) catAgg[c.cat].times += 1;
    }
  }
  const cats = Object.values(catAgg);
  for (const c of cats) {
    c.rate = c.total ? c.ok / c.total : 0;
    c.tier = c.total ? tierOf(c.total, c.ok) : 'insufficient';
  }
  cats.sort((a, b) => {
    const ord = { weak: 0, shaky: 1, insufficient: 2, solid: 3 };
    // 同档内：正确率低的在前（更该补），不看题量
    return ord[a.tier] - ord[b.tier] || a.rate - b.rate;
  });

  /* 能力雷达：把 8 项正确率画成闭合轮廓。
   * 卡片网格能读单项数值，但读不出「哪几项齐、哪项明显凹进去」——
   * 那正是「同一批题的两个切面」里能力切面的用处。
   * 手写 SVG：站点零依赖，产物要能 file:// 直开。 */
  /* 能力雷达：8 项正确率画成闭合轮廓。
   * 卡片网格读得出单项数值，读不出「哪几项齐、哪项凹进去」——那正是能力切面的用处。
   * 手写 SVG：站点零依赖，产物要能 file:// 直开。
   * 注意：这段整体位于 SCRIPT 模板字符串内，只能用单引号拼接，
   * 不能出现反引号或美元花括号插值，否则会把外层模板串断掉（上一版就是这样弄坏构建器的）。 */
  /* 能力掌握度柱状图：横轴 8 项能力、纵轴掌握度。
   * 画法在 work/charts.mjs（与练习页「这一轮的诊断」共用，避免两份实现漂移）。 */
  const chartItems = CAT_ORDER_UI.map((c) => {
    const hit = cats.find((x) => x.cat === c);
    const known = !!(hit && hit.total > 0);
    return {
      name: c,
      rate: known ? hit.rate : 0,
      known,
      ok: known ? hit.ok : 0,
      total: known ? hit.total : 0,
      tier: known ? hit.tier : 'insufficient',
    };
  });
  const chartKnown = chartItems.filter((i) => i.known).length;
  const chartShort = chartItems.filter((i) => i.known && i.tier === 'insufficient').length;
  const catChart = barBlock(chartItems, {
    aria: '八种能力掌握度柱状图',
    note: chartKnown < chartItems.length
      ? '已练到 ' + chartKnown + ' / ' + chartItems.length + ' 种；没练到的只有一条基线，柱子缺失就是缺口。'
      : chartShort > 0
        ? '八种能力都已练到；其中 ' + chartShort + ' 种不到 3 题（虚线框），暂不给分档。'
        : '八种能力都已练到，看哪根柱子短。',
  });

  /* 能力区始终渲染。
   * 老版本记录没有 cats 字段时，原来是把整块跳掉——用户只看到章节，
   * 会以为站点根本不诊断能力。现在改为展示 8 个空槽并说明原因，
   * 让「有这个维度、再练一轮就会补上」这件事可见。 */
  if (sess.length > 0) {
    const noCatDetail = catSessions === 0;
    const knownCats = cats.filter((c) => c.total > 0).length;
    blockCat += '<div class="sect"><div class="sect-head"><span class="kicker">Abilities</span>' +
      '<h2>各能力累计掌握情况</h2><span class="sub">' +
        (noCatDetail
          ? '暂无能力明细'
          : (catSessions < sess.length
              ? catSessions + ' / ' + sess.length + ' 轮有能力明细'
              : '全部 ' + sess.length + ' 轮合并统计') +
            ' · 已覆盖 ' + knownCats + ' / ' + cats.length + ' 种') +
        '</span></div>' +
      (noCatDetail
        ? '<div class="note-cap">已有的 ' + sess.length + ' 轮记录是老版本保存的，没有存能力明细，' +
          '所以这里还看不出能力分布。<b>再练一轮就会补上</b>——练习页每道题都标了所属能力，' +
          '新记录会按能力再切一次。</div>'
        : '') +
      (noCatDetail ? '' : catChart) +
      '</div>';
  }

  /* ---- 汇总：按考点族累计 ----
   * 这是三层里最细的一层（章 6 / 能力 8 / 族 23）。
   * 一轮 18 题只碰 6 个族（每章 1 个），所以 23 个族要靠 4 轮以上才陆续有样本。
   * 页面上必须把这件事说清，否则大量「还没做到」看起来像坏了。 */
  const famAgg = new Map();
  /* 以「题库里全部考点族」为全集初始化，不只纳入做过的。
     否则没做到的族整块不出现，读者看不出还有多少没轮到（能力区踩过同一个坑）。 */
  for (const [fid, meta] of Object.entries(FAM_META)) {
    famAgg.set(fid, {
      fam: fid, name: meta.name || fid, ch: meta.ch || 'unknown', cat: meta.cat,
      total: 0, ok: 0, times: 0, errMix: {},
    });
  }
  /* 旧记录里可能出现题库已下线的族 id（改名或合并）。
     不新建卡片——否则同一个考点会以两个名字出现两次（实测踩过）。
     但也不能静默丢弃，计数后在页面下方说明。 */
  let retiredQ = 0;
  for (const s of sess) {
    for (const f of (s.fams || [])) {
      if (!famAgg.has(f.fam)) { retiredQ += (f.total || 0); continue; }
      const a = famAgg.get(f.fam);
      a.total += f.total;
      a.ok += f.ok;
      if (f.total > 0) a.times += 1;
      if (f.topErr) a.errMix[f.topErr] = (a.errMix[f.topErr] || 0) + 1;
    }
  }
  for (const a of famAgg.values()) {
    a.rate = a.total ? a.ok / a.total : 0;
    a.tier = tierOf(a.total, a.ok);
    const top = Object.entries(a.errMix).sort((x, y) => y[1] - x[1])[0];
    a.topErr = top ? top[0] : null;
  }
  const withFams = sess.filter((s) => Array.isArray(s.fams) && s.fams.length).length;
  const famList = [...famAgg.values()];
  const famDone = famList.filter((f) => f.total > 0);

  if (sess.length > 0) {
    const noFamDetail = withFams === 0;
    /* 按章节分组，组内「薄弱 → 不稳 → 样本不足 → 掌握」，同档按正确率升序 */
    const ORD = { weak: 0, shaky: 1, insufficient: 2, solid: 3 };
    const groups = CH_ORDER.map((ch) => {
      const items = famList.filter((f) => f.ch === ch)
        .sort((a, b) => ORD[a.tier] - ORD[b.tier] || a.rate - b.rate);
      return { ch, name: CH_NAME[ch] || ch, items };
    }).filter((g) => g.items.length);

    blockFam += '<div class="sect"><div class="sect-head"><span class="kicker">Families</span>' +
      '<h2>各考点累计掌握情况</h2><span class="sub">' +
        (noFamDetail
          ? '暂无考点明细'
          : (withFams < sess.length ? withFams + ' / ' + sess.length + ' 轮有考点明细' : '全部 ' + sess.length + ' 轮合并统计') +
            ' · 已覆盖 ' + famDone.length + ' / ' + famList.length + ' 个考点') +
        '</span></div>' +
      (noFamDetail
        ? '<div class="note-cap">已有的 ' + sess.length + ' 轮记录是老版本保存的，没有存考点明细。' +
          '<b>再练一轮就会补上</b>——练习页每道题都归到一个考点族，新记录会保留这一层。</div>'
        : '<div class="note-cap">一轮 18 题只覆盖 <b>6 个考点</b>（每章 1 个），所以这里的考点要练几轮才会陆续出现。' +
          '没出现的不是不重要，是还没轮到。</div>') +
      groups.map((g) => {
        const gDone = g.items.filter((f) => f.total > 0);
        const gTot = g.items.length;
        /* 折叠标题行必须自带信息——收起后只剩这一行，
           如果只写章名，读者得全部展开才知道哪章有货。 */
        const gWeak = g.items.filter((f) => f.tier === 'weak').length;
        const gShaky = g.items.filter((f) => f.tier === 'shaky').length;
        const badges = (gWeak ? '<b class="tier-weak">薄弱 ' + gWeak + '</b>' : '') +
          (gShaky ? '<b class="tier-shaky">不稳 ' + gShaky + '</b>' : '');
        return '<details class="fam-grp">' +
          '<summary class="fam-grp-h">' + esc(g.name) +
          '<span>' + gDone.length + ' / ' + gTot + ' 个考点有样本</span>' +
          (badges ? '<span class="fam-grp-badges">' + badges + '</span>' : '') +
          '</summary>' +
          '<div class="ch-grid">' +
          g.items.map((f) => {
            const known = f.total > 0;
            const pct = Math.round(f.rate * 100);
            return '<div class="ch-card">' +
              '<div class="ch-name">' + esc(f.name) + '</div>' +
              '<div class="ch-meta">' + (known
                ? '累计 ' + f.ok + '/' + f.total + ' 题 · 覆盖 ' + f.times + ' 轮' +
                  (f.topErr ? ' · 主错因：' + esc(f.topErr) : '')
                : '还没做到') + '</div>' +
              '<div class="ch-bar"><i class="bar-' + f.tier + '" style="width:' + (known ? pct : 0) + '%"></i></div>' +
              '<div class="ch-row"><span class="ch-rate rate-' + f.tier + '">' + (known ? pct + '%' : '—') + '</span>' +
              '<span class="ch-tier tier-' + f.tier + '">' + TIER[f.tier] + '</span></div>' +
              '</div>';
          }).join('') +
          '</div></details>';
      }).join('') +
      (retiredQ > 0
        ? '<p style="margin-top:10px;font-size:12.6px;color:var(--text-3)">另有 ' + retiredQ +
          ' 题属于题库已调整下线的考点，未计入上表。</p>'
        : '') +
      '</div>';
  }

  /* 知识维度按「能力 → 章节 → 考点」输出：能力是第一视角，章节次之，考点最细 */
  html += blockCat + blockCh + blockFam;

  html += '<div class="sect"><div class="sect-head"><span class="kicker">Rounds</span>' +
    '<h2>逐轮记录</h2><span class="sub">点一行展开该轮的章节与能力明细</span></div>' +
    '<div class="round-list">';

  // 最近的在上面
  const ordered = sess.slice().reverse();
  ordered.forEach((s, i) => {
    const idx = sess.length - i;       // 原始轮次号
    const pct = s.n ? Math.round((s.ok / s.n) * 100) : 0;
    const hasChs = Array.isArray(s.chs) && s.chs.length;
    const hasCats = Array.isArray(s.cats) && s.cats.length;

    /* 一张卡的渲染：章节与能力共用同一套外观 */
    const card = (name, ok, total, tier, topErr) => {
      const p = total ? Math.round((ok / total) * 100) : 0;
      return '<div class="ch-card">' +
        '<div class="ch-name">' + esc(name) + '</div>' +
        '<div class="ch-meta">' + ok + '/' + total + ' 题' +
          (topErr ? ' · 主错因：' + esc(topErr) : '') + '</div>' +
        '<div class="ch-bar"><i class="bar-' + tier + '" style="width:' + p + '%"></i></div>' +
        '<div class="ch-row"><span class="ch-rate rate-' + tier + '">' + p + '%</span>' +
        '<span class="ch-tier tier-' + tier + '">' + TIER[tier] + '</span></div>' +
        '</div>';
    };

    const chCards = (hasChs ? s.chs : [])
      .map((c) => card(c.name, c.ok, c.total, c.tier, c.topErr)).join('');
    /* 这一轮没做到的能力不列——逐轮看的是「这轮发生了什么」，
       空槽留给上面的累计区去说 */
    const catCards = (hasCats ? s.cats : []).filter((c) => c.total > 0)
      .map((c) => card(c.name, c.ok, c.total, c.tier, c.topErr)).join('');

    const body = '<div class="round-body">' +
      (hasChs
        ? '<div class="grp-lbl">按章节</div><div class="ch-grid">' + chCards + '</div>'
        : '<div class="ch-meta" style="color:var(--text-3)">这一轮是旧版本记录，没有保存章节明细（只有总正确率）。</div>') +
      (hasCats
        ? '<div class="grp-lbl">按能力 <span>同一批题的另一切面——某章弱不等于某能力弱</span></div>' +
          '<div class="ch-grid">' + catCards + '</div>'
        : '<div class="grp-lbl">按能力</div>' +
          '<div class="ch-meta" style="color:var(--text-3)">这一轮是旧版本记录，没有保存能力明细。</div>') +
      '</div>';

    html += '<div class="round" data-i="' + i + '">' +
      '<div class="round-head">' +
        '<span class="round-no">第 ' + idx + ' 轮' + (s.redo ? '（重做）' : '') + '</span>' +
        '<span class="round-time">' + fmtTime(s.at) + '</span>' +
        '<span class="round-score">' + s.ok + ' / ' + s.n + '</span>' +
        '<span class="round-pct">' + pct + '%</span>' +
      '</div>' +
      body +
    '</div>';
  });

  html += '</div></div>';

  html += '<div class="actions">' +
    '<a class="btn primary" href="practice.html">再练一轮</a>' +
    '<button class="btn ghost" id="expandAll">全部展开</button>' +
    '<button class="btn ghost" id="exportBtn">导出记录</button>' +
    '<button class="btn ghost" id="importBtn">导入记录</button>' +
    '<input type="file" id="importFile" accept=".json" style="display:none">' +
    '<button class="btn ghost" id="clearAll">清空全部记录</button>' +
    '</div>';

  $('#root').innerHTML = html;

  // 交互
  document.querySelectorAll('.round-head').forEach((h) => {
    h.onclick = () => h.parentElement.classList.toggle('open');
  });
  const ea = $('#expandAll');
  if (ea) ea.onclick = () => {
    const all = document.querySelectorAll('.round');
    const anyClosed = [...all].some((r) => !r.classList.contains('open'));
    all.forEach((r) => r.classList.toggle('open', anyClosed));
    ea.textContent = anyClosed ? '全部收起' : '全部展开';
  };
  // 导出：下载 JSON（换浏览器/清缓存后可用它恢复）
  const ex = $('#exportBtn');
  if (ex) ex.onclick = () => {
    const blob = new Blob([JSON.stringify(load(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    a.href = URL.createObjectURL(blob);
    a.download = '练习记录-' + d.getFullYear() + pad(d.getMonth()+1) + pad(d.getDate()) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  // 导入：合并到现有记录（按时间戳去重）
  const im = $('#importBtn');
  const imf = $('#importFile');
  if (im && imf) {
    im.onclick = () => imf.click();
    imf.onchange = () => {
      const f = imf.files && imf.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const incoming = JSON.parse(reader.result);
          if (!incoming || !Array.isArray(incoming.sessions)) throw new Error('格式不对');
          const cur = load();
          const seen = new Set(cur.sessions.map((s) => s && s.at));
          let added = 0;
          for (const s of incoming.sessions) {
            if (!s || !s.at || seen.has(s.at)) continue;
            cur.sessions.push(s);
            seen.add(s.at);
            added++;
          }
          // allRecords 合并（按 id+at 去重）
          const seenR = new Set(cur.allRecords.map((r) => r && (r.id + '@' + r.at)));
          for (const r of (incoming.allRecords || [])) {
            const k = r && (r.id + '@' + r.at);
            if (!k || seenR.has(k)) continue;
            cur.allRecords.push(r);
            seenR.add(k);
          }
          cur.sessions.sort((a, b) => a.at - b.at);
          localStorage.setItem(LS_KEY, JSON.stringify(cur));
          alert('已导入 ' + added + ' 轮记录。');
          render();
        } catch (e) {
          alert('导入失败：' + e.message);
        }
        imf.value = '';
      };
      reader.readAsText(f);
    };
  }

  const ca = $('#clearAll');
  if (ca) ca.onclick = () => {
    if (!confirm('清空全部 ' + sess.length + ' 轮记录？此操作无法撤销。')) return;
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    render();
  };
}

render();
`;

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>学情数据 · 西城初一数学</title>
<meta name="description" content="逐轮练习记录与各章累计掌握情况，按章节汇总薄弱环节">
<style>${CSS}</style>
${THEME_INIT}
</head>
<body>
${headerHtml('history.html')}
<main class="wrap">
<div class="head">
  <div class="hero-badge"><span class="dot-live"></span>逐轮记录 · 多轮汇总</div>
  <h1>学情数据</h1>
  <p class="lede">每次练习的结果都存在本机浏览器里。这里逐轮列出，并把多轮合并成<b>按能力</b>、<b>按章节</b>、<b>按考点</b>三套掌握情况——同一批题的三种切法。某章弱不等于某能力弱，能力弱也不等于某个考点弱。</p>
</div>
<div id="root"></div>
</main>
<script type="module">
${SCRIPT}
</script>
${THEME_SCRIPT}
</body>
</html>`;

// 数据需要内联（file:// 下 import 会被拦截）
const needBANK = !html.includes('const BANK =');
/* 图表画法来自 work/charts.mjs，同样要内联进页面脚本——
   页面是单文件、file:// 直开，运行时没有模块解析。
   barBlock 的源码是自包含的（无反引号、无外部引用），可以安全 toString 注入。 */
const final = html.replace(
  "import { BANK, FAM_META, CH_NAME } from './practice-data.mjs';",
  'const BANK = ' + JSON.stringify(BANK) + ';\n' +
  'const FAM_META = ' + JSON.stringify(FAM_META) + ';\n' +
  'const CH_NAME = ' + JSON.stringify(CH_NAME) + ';\n' +
  barBlock.toString()
);

writeFileSync('history.html', final, 'utf8');
console.log('=== 历史页构建完成 ===');
console.log('  章节：' + chList.length);
console.log('  体积：' + (final.length / 1024).toFixed(1) + ' KB');
