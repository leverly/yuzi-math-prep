#!/usr/bin/env node
// 历史记录页：逐轮结果 + 多轮汇总
// 数据来自 localStorage（与 practice.html 同一 key），此页只读
import { writeFileSync, readFileSync } from 'node:fs';

import { BANK, FAM_META } from './practice-data.mjs';
import { CH_NAME } from './work/papers/ledger.mjs';
import { TOKENS, HEAD_CSS, PAGEHEAD_CSS, headerHtml } from './work/site-shell.mjs';

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
.ch-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:15px 17px}
.ch-name{font-size:14.5px;font-weight:700;margin-bottom:3px}
.ch-meta{font-size:12px;color:var(--text-3);margin-bottom:10px}
.ch-bar{height:7px;background:var(--bg-3);border-radius:4px;overflow:hidden;margin-bottom:8px}
.ch-bar i{display:block;height:100%;border-radius:4px}
.bar-weak{background:linear-gradient(135deg,#f43f5e,#e11d48)}
.bar-shaky{background:linear-gradient(135deg,#f59e0b,#d97706)}
.bar-solid{background:linear-gradient(135deg,#10b981,#059669)}
.bar-insufficient{background:#cbd5e1}
.ch-row{display:flex;justify-content:space-between;align-items:baseline;font-size:12.5px}
.ch-rate{font-family:var(--mono);font-weight:700;font-variant-numeric:tabular-nums}
.rate-weak{color:var(--rose)}.rate-shaky{color:var(--gold)}
.rate-solid{color:var(--ok)}.rate-insufficient{color:var(--text-3)}
.ch-tier{font-size:11px;font-weight:700;padding:2px 8px;border-radius:var(--r-pill)}
.tier-weak{background:var(--rose-soft);color:var(--rose)}
.tier-shaky{background:var(--gold-soft);color:var(--gold)}
.tier-solid{background:var(--ok-soft);color:var(--ok)}
.tier-insufficient{background:#e2e8f0;color:var(--text-3)}

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

  html += '<div class="sum-grid">' +
    '<div class="sm accent"><div class="n">' + sess.length + '</div><div class="l">已完成轮次</div></div>' +
    '<div class="sm"><div class="n">' + totalQ + '</div><div class="l">累计做题</div></div>' +
    '<div class="sm ok"><div class="n">' + Math.round(rate * 100) + '%</div><div class="l">累计正确率</div></div>' +
    '<div class="sm rose"><div class="n">' + chs.filter(c => c.tier === 'weak').length + '</div><div class="l">薄弱章节</div></div>' +
    '</div>';

  html += '<div class="sect"><div class="sect-head"><span class="kicker">Summary</span>' +
    '<h2>各章累计掌握情况</h2><span class="sub">' +
      (withChs < sess.length ? withChs + ' / ' + sess.length + ' 轮有章节明细' : '全部 ' + sess.length + ' 轮合并统计') +
      '</span></div>' +
    '<div class="ch-grid">' +
    chs.map((c) => {
      const pct = Math.round(c.rate * 100);
      return '<div class="ch-card">' +
        '<div class="ch-name">' + esc(c.name) + '</div>' +
        '<div class="ch-meta">累计 ' + c.ok + '/' + c.total + ' 题 · 覆盖 ' + c.times + ' 轮</div>' +
        '<div class="ch-bar"><i class="bar-' + c.tier + '" style="width:' + pct + '%"></i></div>' +
        '<div class="ch-row"><span class="ch-rate rate-' + c.tier + '">' + pct + '%</span>' +
        '<span class="ch-tier tier-' + c.tier + '">' + TIER[c.tier] + '</span></div>' +
        '</div>';
    }).join('') +
    '</div></div>';

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

  if (catSessions > 0) {
    html += '<div class="sect"><div class="sect-head"><span class="kicker">Abilities</span>' +
      '<h2>各能力累计掌握情况</h2><span class="sub">' +
        (catSessions < sess.length ? catSessions + ' / ' + sess.length + ' 轮有能力明细' : '全部 ' + sess.length + ' 轮合并统计') +
        '</span></div>' +
      '<div class="ch-grid">' +
      cats.map((c) => {
        const pct = Math.round(c.rate * 100);
        const known = c.total > 0;
        return '<div class="ch-card">' +
          '<div class="ch-name">' + esc(c.name) + '</div>' +
          '<div class="ch-meta">' + (known
            ? '累计 ' + c.ok + '/' + c.total + ' 题 · 覆盖 ' + c.times + ' 轮'
            : '还没做到 · 下一轮会优先安排') + '</div>' +
          '<div class="ch-bar"><i class="bar-' + c.tier + '" style="width:' + (known ? pct : 0) + '%"></i></div>' +
          '<div class="ch-row"><span class="ch-rate rate-' + c.tier + '">' + (known ? pct + '%' : '—') + '</span>' +
          '<span class="ch-tier tier-' + c.tier + '">' + (known ? TIER[c.tier] : '未轮到') + '</span></div>' +
          '</div>';
      }).join('') +
      '</div></div>';
  }

  html += '<div class="sect"><div class="sect-head"><span class="kicker">Rounds</span>' +
    '<h2>逐轮记录</h2><span class="sub">点一行展开该轮的章节明细</span></div>' +
    '<div class="round-list">';

  // 最近的在上面
  const ordered = sess.slice().reverse();
  ordered.forEach((s, i) => {
    const idx = sess.length - i;       // 原始轮次号
    const pct = s.n ? Math.round((s.ok / s.n) * 100) : 0;
    const hasChs = Array.isArray(s.chs) && s.chs.length;
    const inner = (hasChs ? s.chs : []).map((c) => {
      const p = c.total ? Math.round((c.ok / c.total) * 100) : 0;
      return '<div class="ch-card">' +
        '<div class="ch-name">' + esc(c.name) + '</div>' +
        '<div class="ch-meta">' + c.ok + '/' + c.total + ' 题' + (c.topErr ? ' · 主错因：' + esc(c.topErr) : '') + '</div>' +
        '<div class="ch-bar"><i class="bar-' + c.tier + '" style="width:' + p + '%"></i></div>' +
        '<div class="ch-row"><span class="ch-rate rate-' + c.tier + '">' + p + '%</span>' +
        '<span class="ch-tier tier-' + c.tier + '">' + TIER[c.tier] + '</span></div>' +
        '</div>';
    }).join('') || '<div class="ch-meta" style="color:var(--text-3)">这一轮是旧版本记录，没有保存章节明细（只有总正确率）。</div>';

    html += '<div class="round" data-i="' + i + '">' +
      '<div class="round-head">' +
        '<span class="round-no">第 ' + idx + ' 轮' + (s.redo ? '（重做）' : '') + '</span>' +
        '<span class="round-time">' + fmtTime(s.at) + '</span>' +
        '<span class="round-score">' + s.ok + ' / ' + s.n + '</span>' +
        '<span class="round-pct">' + pct + '%</span>' +
      '</div>' +
      '<div class="round-body"><div class="ch-grid">' + inner + '</div></div>' +
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
</head>
<body>
${headerHtml('history.html')}
<main class="wrap">
<div class="head">
  <div class="hero-badge"><span class="dot-live"></span>逐轮记录 · 多轮汇总</div>
  <h1>学情数据</h1>
  <p class="lede">每次练习的结果都存在本机浏览器里。这里逐轮列出，并把多轮合并成各章的掌握情况，可以看出哪一章在进步、哪一章还欠着。</p>
</div>
<div id="root"></div>
</main>
<script type="module">
${SCRIPT}
</script>
</body>
</html>`;

// 数据需要内联（file:// 下 import 会被拦截）
const needBANK = !html.includes('const BANK =');
const final = html.replace(
  "import { BANK, FAM_META, CH_NAME } from './practice-data.mjs';",
  'const BANK = ' + JSON.stringify(BANK) + ';\n' +
  'const FAM_META = ' + JSON.stringify(FAM_META) + ';\n' +
  'const CH_NAME = ' + JSON.stringify(CH_NAME) + ';'
);

writeFileSync('history.html', final, 'utf8');
console.log('=== 历史页构建完成 ===');
console.log('  章节：' + chList.length);
console.log('  体积：' + (final.length / 1024).toFixed(1) + ' KB');
