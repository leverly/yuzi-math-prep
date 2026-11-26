// 站点外壳：设计变量、顶栏、页头排版 —— 全站唯一来源
//
// 为什么单独抽出来：practice.html 曾自带一份设计系统副本，与另外四页持续漂移
// （顶栏样式一次、页头 .lede 空白一次）。只改副本治标不治本，所以把「所有页面
// 必须一致」的部分收敛到这里，两个构建器都 import 同一份。
//
// 这里只放**跨页必须逐字相同**的东西：设计变量、reset、容器、顶栏、页头排版。
// 页面各自的业务组件（题目卡、诊断面板、优先级卡…）仍留在各自构建器里。

export const SITE = {
  /* 导航站名（用户 2026-11-26 指定）：第一屏是地区/年级/科目选择器 */
  siteName: '期末考情导航站',
  short: '西城初一数学',
  name: '西城区初一(上)数学期末 · 五年考情与备考建议',  full: '西城区初一(上)数学期末考情分析站',
  exam: '西城区初一(上)期末',
};

/* 选择器：单一来源。
 * 只列**真实有材料**的项——空目录不列，否则点进去是空页。
 * 新增地区/年级/学期/科目时，先把材料放进 真题试卷/<科目>/ 并在此登记。
 *
 * 年级与学期分成两层选：原来合成一项「初一（上）」，家长要在一串
 * 「初一（上）/ 初一（下）/ 初二（上）…」里找，改成先选年级再选学期后，
 * 每层选项都短，也便于以后按学期加材料。 */
export const CATALOG = {
  provinces: [
    { id: 'beijing', name: '北京市' },
  ],
  regions: {
    beijing: [
      { id: 'xicheng', name: '西城区' },
    ],
  },
  grades: [
    { id: 'g7', name: '初一' },
  ],
  terms: [
    { id: 't1', name: '上学期' },
    { id: 't2', name: '下学期' },
  ],
  /* 键是 省/区/年级/学期；没材料的组合不登记，选到就提示「暂无材料」 */
  subjects: {
    'beijing/xicheng/g7/t1': [
      /* 本站自有：数学（唯一可点的科目） */
      { id: 'math', name: '数学', desc: '近五年真题逐题标注', href: 'home.html', papers: 5, own: true },
      /* 建设中：英语站已存在，但先不放出入口；语文尚未开工。
       * 这类项没有 href，选择器渲染为不可点 + 「建设中」标记。
       * 上线时补上 href 并去掉 building 即可。 */
      { id: 'english', name: '英语', desc: '4 套区统考真题 · 专项分层', papers: 4, own: false, building: true },
      { id: 'chinese', name: '语文', desc: '材料整理中', papers: 0, own: false, building: true },
    ],
  },
};

/* 选择结果存在这里；首页读取它决定「记住选择」是否生效 */
export const CHOICE_KEY = 'xq-nav-choice-v1';

/* 全站导航：单一来源，顺序与样式都在这里定
 * 2026-11-25 移除「演示」（slides.html）——12 页里 10 页与其余页重复，
 * 且唯一独有的「六周冲刺节奏」与 plan 页「不给具体时间和动作」的立场矛盾。
 * 2026-11-26 恢复：已重做成 10 页面向家长的考情讲解，删掉冲刺节奏。
 * 2026-11-26 index.html 改为选择器页，原首页移至 home.html，「总览」指向 home.html。
 * 2026-11-26 「演示」改名「考情精简版」——「演示」说的是使用场景，
 *             学生/家长看不出点进去是什么；「考情精简版」说的是内容。
 * 2026-11-26 「总览」改名「考情总览」——单独一个「总览」看不出总览什么，
 *             与旁边「逐年拆解/整体解读」的颗粒度不一致。 */
export const NAV = [
  ['home.html', '考情总览'],
  ['papers.html', '逐年拆解'],
  ['trend.html', '整体解读'],
  ['plan.html', '备考建议'],
  ['practice.html', '备考诊断'],
  ['history.html', '学情数据'],
  ['slides.html', '考情精简版', 'nav-slides'],
];

/* 练习轮次：全站唯一来源
 * 一轮 = 每章 PER_CH 题 × 章数。首页说「做一轮 N 题」、练习页显示「第 1 / N 题」、
 * 出题逻辑取 N 题——三处必须同源，否则首页承诺的题量与实际出题对不上。 */
export const PER_CH = 3;
export const ROUND_SIZE = 18;   // = 6 章 × 3 题


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

  /* 中性块（进度条底槽、灰色标签、「样本不足」档）：必须走变量，
     否则暗色下留下一块浅灰。 */
  --track:#e2e8f0; --mute:#cbd5e1;
  --seg-bg:#eef3f8; --seg-fg:#3a5a78;
  /* 顶栏半透明底色：原来是硬编码的浅色 rgba，暗色下会糊成一块亮条 */
  --head-bg:rgba(246,248,252,.86);

  color-scheme:light;
}

/* ---------- 暗色（2026-11-26 恢复） ----------
 * 「重做站点」整站重写时把这套变量连同切换按钮一起丢了，用户反馈「白天黑夜
 * 切换怎么没了」。现在放在全站唯一来源里，五个构建器都从 TOKENS 取，不会再各写一份。
 * 只覆盖颜色类变量；圆角、字体、缓动这些与明暗无关的不动。 */
[data-theme="dark"]{
  --bg:#0b1120; --bg-2:#111827; --bg-3:#182234;
  --surface:#111a2c; --surface-2:#162136;
  --border:rgba(148,163,184,.12); --border-2:rgba(148,163,184,.22);
  --text:#f1f5f9; --text-2:#94a3b8; --text-3:#64748b;

  --accent:#60a5fa; --accent-h:#93c5fd;
  --accent-soft:rgba(96,165,250,.13); --accent-soft-2:rgba(96,165,250,.20);
  --accent-grad:linear-gradient(135deg,#3b82f6 0%,#6366f1 100%);

  --purple:#a78bfa; --purple-soft:rgba(167,139,250,.14);
  --gold:#fbbf24; --gold-soft:rgba(251,191,36,.14);
  --gold-grad:linear-gradient(135deg,#f59e0b 0%,#eab308 100%);
  --ok:#34d399; --ok-soft:rgba(52,211,153,.13);
  --rose:#fb7185; --rose-soft:rgba(251,113,133,.14);

  --shadow-1:0 1px 2px rgba(0,0,0,.35);
  --shadow-2:0 6px 16px -4px rgba(0,0,0,.45);
  --shadow-3:0 20px 40px -12px rgba(0,0,0,.60);
  --shadow-accent:0 10px 28px -8px rgba(59,130,246,.45);
  --hero-glow:radial-gradient(ellipse 80% 55% at 50% -10%,rgba(59,130,246,.18),transparent 70%);

  --track:rgba(148,163,184,.22); --mute:rgba(148,163,184,.32);
  --seg-bg:rgba(148,163,184,.14); --seg-fg:#94a3b8;
  --head-bg:rgba(11,17,32,.82);

  color-scheme:dark;
}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;background:var(--bg)}
body{
  font-family:var(--sans); background:var(--bg); color:var(--text);
  line-height:1.68; font-size:15px; overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
  transition:background .25s var(--ease),color .25s var(--ease);
}
a{color:inherit}
.wrap{max-width:var(--max);margin:0 auto;padding:0 24px}
`;

/* 顶栏 CSS：全站唯一来源 */
export const HEAD_CSS = `
/* ---------- 顶栏 ---------- */
.site-head{
  position:sticky;top:0;z-index:60;
  background:var(--head-bg);
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
/* 「考情精简版」入口：紫色，与内容页区分开 */
.hdr-nav a.nav-slides{background:var(--purple-soft,#f3e8ff);color:var(--purple,#7c3aed);font-weight:650;
  display:inline-flex;align-items:center;gap:5px}
.hdr-nav a.nav-slides::before{content:"▶";font-size:8px}
.hdr-nav a.nav-slides:hover{background:var(--purple,#7c3aed);color:#fff}
/* 「切换」入口：回到地区/年级/科目选择页。弱化处理，不与内容页争视线 */
.hdr-nav a.nav-switch{
  margin-left:6px;border-left:1px solid var(--border);padding-left:16px;
  color:var(--text-3);font-weight:600;
}
.hdr-nav a.nav-switch:hover{color:var(--accent);background:var(--accent-soft)}
/* 选择页顶栏右侧的说明文字（不是链接） */
.hdr-note{font-size:12.8px;color:var(--text-3);font-weight:500;padding:7px 0}

/* ---------- 白天/黑夜切换 ----------
 * 位置：导航最右，与「⇄ 切换」隔一条竖线，两者都是工具而非内容。
 * 用原生 button 而不是 a：它不导航，只是切换本机偏好。 */
.theme-btn{
  flex:none;display:grid;place-items:center;
  width:32px;height:32px;margin-left:4px;
  border:1px solid var(--border);border-radius:50%;
  background:var(--surface);color:var(--text-2);
  font-size:15px;line-height:1;cursor:pointer;
  transition:.16s var(--ease);
}
.theme-btn:hover{background:var(--accent-soft);border-color:var(--border-2);color:var(--accent)}
.theme-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

/* 导航收缩：7 项 + 「切换」，标签变长后（「考情精简版」5 字）在中窄屏会被截断，
   用户看不到最后两项。这里逐级收紧内边距与字号，保证 768px 以上完整显示。
   放在 HEAD_CSS 里而不是各页的媒体查询里——导航是全站共用的。 */
@media(max-width:1100px){
  .hdr-nav a{padding:6px 9px;font-size:13.2px}
  .hdr-nav a.nav-switch{margin-left:2px;padding-left:11px}
  .hdr-in{gap:10px}
}
@media(max-width:900px){
  .hdr-nav a{padding:5px 7px;font-size:12.6px}
  .hdr-nav a.nav-slides::before{display:none}
  .brand{font-size:14px}
}
@media(max-width:760px){
  /* 再窄就把品牌文字与「切换」文字收掉，只留图标，导航仍然可用 */
  .brand span:not(.brand-mark){display:none}
  .hdr-nav a.nav-switch{font-size:0;padding:5px 8px}
  .hdr-nav a.nav-switch::before{content:"⇄";font-size:15px}
}
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

/* ---------- 白天/黑夜切换：全站唯一来源 ----------
 * 三件事必须同源，否则切换会失效或闪屏：
 *   1. THEME_KEY      —— localStorage 键
 *   2. THEME_INIT     —— 放在 <head> 里、样式之后立刻执行的内联脚本
 *   3. themeBtn()     —— 顶栏按钮，点击后切一次并记住
 *
 * 为什么初始化脚本要内联在 <head>：如果等 DOMContentLoaded 再设 data-theme，
 * 浏览器会先按浅色把整页画一遍，暗色用户每次进页面都闪一下白。
 * 所以这段必须在 <body> 解析前同步跑完。
 *
 * 首次访问跟随时间（19:00–6:00 为夜间），之后以用户手动选择为准——
 * 手动选过一次就再也不自动改，否则用户在白天切到夜间，第二天早上又被打回去。 */
export const THEME_KEY = 'xz-theme-v1';

export const THEME_INIT = `<script>
(function(){
  var KEY='${THEME_KEY}';
  function auto(){var h=new Date().getHours();return (h>=19||h<6)?'dark':'light';}
  var t=null;
  try{ t=localStorage.getItem(KEY); }catch(e){}
  if(t!=='light'&&t!=='dark') t=auto();
  document.documentElement.setAttribute('data-theme',t);
})();
</script>`;

/* 顶栏按钮：图标表示「点下去会变成什么」，不是「当前是什么」。
 * 浅色时显示 ☾（点了进夜间），夜间显示 ☀（点了回白天）——
 * 图标与结果一致，用户不用先想「现在是哪个」。 */
export function themeBtnHtml() {
  return `<button class="theme-btn" type="button" data-theme-toggle aria-label="切换白天/黑夜模式" title="切换白天/黑夜模式"><span data-theme-icon>☾</span></button>`;
}

/* 切换逻辑：与 THEME_INIT 共用同一个 KEY，放在页尾执行。
 * 用事件委托挂在 document 上，选择页与内页的按钮都能命中，
 * 不依赖某个具体的 id。 */
export const THEME_SCRIPT = `<script>
(function(){
  var KEY='${THEME_KEY}';
  var root=document.documentElement;
  function icon(){
    var dark=root.getAttribute('data-theme')==='dark';
    document.querySelectorAll('[data-theme-icon]').forEach(function(el){ el.textContent = dark?'☀':'☾'; });
    document.querySelectorAll('[data-theme-toggle]').forEach(function(b){
      b.setAttribute('aria-label', dark?'切换到白天模式':'切换到黑夜模式');
      b.title = dark?'切换到白天模式':'切换到黑夜模式';
    });
  }
  document.addEventListener('click',function(e){
    var btn=e.target.closest('[data-theme-toggle]');
    if(!btn) return;
    var next=root.getAttribute('data-theme')==='dark'?'light':'dark';
    root.setAttribute('data-theme',next);
    try{ localStorage.setItem(KEY,next); }catch(err){}
    icon();
  });
  icon();
})();
</script>`;

/* 顶栏标记：全站唯一来源。active 是高亮项 href
 * active 为空串时是选择页（index.html）：此时还没确定科目，
 * 不能显示数学站的内部导航（逐年拆解/备考建议…），只留站点名。
 *
 * 切换按钮放在 <nav> 之外：nav 在窄屏是可横向滚动的条带，
 * 按钮若在条带里就会被推到屏外（390px 视口下右边缘在 612px），
 * 用户得先横滑导航才点得到——而它本该一直可见。 */
export function headerHtml(active) {
  if (!active) {
    return `<header class="site-head"><div class="hdr-in">
  <a class="brand" href="index.html">
    <span class="brand-mark">考</span>
    <span>${esc(SITE.siteName)}<small>选择考区</small></span>
  </a>
  <nav class="hdr-nav">
    <span class="hdr-note">按地区与科目组织期末考情</span>
  </nav>
  ${themeBtnHtml()}
</div></header>`;
  }
  return `<header class="site-head"><div class="hdr-in">
  <a class="brand" href="home.html">
    <span class="brand-mark">西</span>
    <span>${esc(SITE.short)}<small>初一上·期末</small></span>
  </a>
  <nav class="hdr-nav">
    ${NAV.map(([h, t, cls]) => `<a href="${h}"${cls ? ` class="${cls}"` : (h === active ? ' class="on"' : '')}>${t}</a>`).join('')}
    <a href="index.html" class="nav-switch" title="切换地区 / 年级 / 科目">⇄ 切换</a>
  </nav>
  ${themeBtnHtml()}
</div></header>`;
}
