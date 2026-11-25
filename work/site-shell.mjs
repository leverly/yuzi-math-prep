// 站点外壳：设计变量、顶栏、页头排版 —— 全站唯一来源
//
// 为什么单独抽出来：practice.html 曾自带一份设计系统副本，与另外四页持续漂移
// （顶栏样式一次、页头 .lede 空白一次）。只改副本治标不治本，所以把「所有页面
// 必须一致」的部分收敛到这里，两个构建器都 import 同一份。
//
// 这里只放**跨页必须逐字相同**的东西：设计变量、reset、容器、顶栏、页头排版。
// 页面各自的业务组件（题目卡、诊断面板、优先级卡…）仍留在各自构建器里。

export const SITE = {
  short: '西城初一数学',
  name: '西城区初一(上)数学期末 · 五年考情与冲刺计划',
  full: '西城区初一(上)数学期末考情分析站',
  exam: '西城区初一(上)期末',
};

/* 全站导航：单一来源，顺序与样式都在这里定
 * 2026-11-25 移除「演示」（slides.html）——12 页里 10 页与其余页重复，
 * 且唯一独有的「六周冲刺节奏」与 plan 页「不给具体时间和动作」的立场矛盾。 */
export const NAV = [
  ['index.html', '总览'],
  ['papers.html', '逐年真题'],
  ['trend.html', '趋势与考点'],
  ['plan.html', '冲刺计划'],
  ['practice.html', '练习与诊断'],
  ['history.html', '学情诊断'],
];

/* 设计变量：全站唯一来源 */
export const TOKENS = `
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
`;

/* 顶栏 CSS：全站唯一来源 */
export const HEAD_CSS = `
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
`;

/* 页头排版：各页共用（.head 容器与 .crumb 由调用页按需叠加） */
export const PAGEHEAD_CSS = `
/* ---------- 页头排版 ---------- */
h1{font-size:clamp(28px,3.6vw,42px);line-height:1.22;font-weight:800;letter-spacing:-.03em;margin-bottom:16px}
.lede{font-size:15.5px;color:var(--text-2);line-height:1.75}
.lede b{color:var(--text);font-weight:650}

/* 页头小标签（胶囊 + 圆点）：所有内页页头统一用它，不用面包屑 */
.hero-badge{
  display:inline-flex;align-items:center;gap:8px;font-size:.78rem;font-weight:600;
  color:var(--accent);border:1px solid rgba(37,99,235,.24);background:var(--surface);
  padding:5px 13px;border-radius:var(--r-pill);margin-bottom:20px;box-shadow:var(--shadow-1);
}
.dot-live{width:6px;height:6px;border-radius:50%;background:var(--accent);
  box-shadow:0 0 0 3px rgba(37,99,235,.16)}
`;

/* 响应式中与外壳相关的部分（各页媒体查询里必须一致的那几条） */
export const SHELL_MQ = `
  body{font-size:14.5px}
  .wrap,.hdr-in{padding:0 16px}
  .hdr-in{height:58px}
  .brand small{display:none}
`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* 顶栏标记：全站唯一来源。active 是高亮项 href */
export function headerHtml(active) {
  return `<header class="site-head"><div class="hdr-in">
  <a class="brand" href="index.html">
    <span class="brand-mark">西</span>
    <span>${esc(SITE.short)}<small>初一上·期末</small></span>
  </a>
  <nav class="hdr-nav">
    ${NAV.map(([h, t, cls]) => `<a href="${h}"${cls ? ` class="${cls}"` : (h === active ? ' class="on"' : '')}>${t}</a>`).join('')}
  </nav>
</div></header>`;
}
