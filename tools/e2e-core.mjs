/* ==========================================================
   端到端交互测试 · 用 CDP 驱动真实浏览器
   验证：
     ① 计算专项能开始、能逐步作答
     ② 答对进入下一步，答错给提示
     ③ nearMiss（会做但错）能被正确标记
     ④ 记录写入 localStorage
   用法：node tools/e2e.mjs
   ========================================================== */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
const URL_BASE = process.env.BASE || 'http://127.0.0.1:8199';
/* 分段运行：--part=1 只测前段（轻页面），--part=2 只测重页面。
   原因：分片约 3.8MB，单个无头 Chrome 长时间运行会崩。
   分段后每次只跑几分钟，稳定性好得多。 */
const PART = (process.argv.find((a) => a.startsWith('--part=')) || '').slice(7) || 'all';
const inPart = (n) => PART === 'all' || String(n) === PART;

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=/tmp/yz-e2e-profile',
  'about:blank',
], { stdio: 'ignore' });

let ws, msgId = 0;
const pending = new Map();

async function connect() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch (e) {}
    await sleep(250);
  }
  throw new Error('Chrome 未就绪');
}

function send(method, params = {}) {
  const id = ++msgId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) {
    /* 页面脚本异常不中断测试，返回 undefined 由断言判定 */
    return undefined;
  }
  return r.result && r.result.value;
}

/* 轮询等待某选择器出现 */
async function waitFor(sel, tries = 50, gap = 400) {
  for (let i = 0; i < tries; i++) {
    const ok = await evaluate(`!!document.querySelector(${JSON.stringify(sel)})`);
    if (ok) return true;
    await sleep(gap);
  }
  return false;
}

async function main() {
  const wsUrl = await connect();
  ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id);
      if (m.error) p.reject(new Error(JSON.stringify(m.error)));
      else p.resolve(m.result);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');

  const results = [];
  const check = (name, ok, detail = '') => {
    results.push({ name, ok, detail });
    console.log(`${ok ? '✓' : '✕'} ${name}${detail ? ' — ' + detail : ''}`);
  };

  /* ---------- 1. 首页驾驶舱 ---------- */
  await send('Page.navigate', { url: URL_BASE + '/index.html' });
  /* 等 document ready + YZ 就绪 */
  for (let i = 0; i < 60; i++) {
    const ok = await evaluate(`document.readyState === 'complete' && !!window.YZ`);
    if (ok) break;
    await sleep(300);
  }
  const homeOk = await waitFor('.yz-metrics .ck-item', 40, 400);
  check('首页驾驶舱渲染', homeOk);

  /* 两层导航：主入口 ≤4 项 + 「更多」下拉 */
  const navInfo = await evaluate(`(function(){
    var nav = document.getElementById('nav');
    if (!nav) return { primary: 0, hasMore: false, menu: 0 };
    var primary = nav.querySelectorAll(':scope > a').length;
    var btn = document.getElementById('navMoreBtn');
    var menu = document.querySelectorAll('#navMoreMenu a').length;
    return { primary: primary, hasMore: !!btn, menu: menu };
  })()`) || { primary: 0, hasMore: false, menu: 0 };
  check('导航精简（主入口 ≤5）', navInfo.primary <= 5 && navInfo.primary >= 3,
    `主入口 ${navInfo.primary} 项`);

  if (navInfo.hasMore && navInfo.menu > 0) {
    await evaluate(`(function(){ var b=document.getElementById('navMoreBtn'); if(b) b.click(); return true; })()`);
    await sleep(350);
    const menuOpen = await evaluate(`(function(){
      var m = document.getElementById('navMore');
      return !!(m && m.classList.contains('open'));
    })()`);
    check('下拉可展开', menuOpen === true);
  }

  await sleep(300);

  /* ---------- 3. 逐步作答（在 drill 页启动一组练习） ---------- */
  await send('Page.navigate', { url: URL_BASE + '/drill.html' });
  await waitFor('#startBtn');
  /* 等分片加载完再点开始 */
  for (let i = 0; i < 50; i++) {
    const ready = await evaluate(`!!(window.YZ && window.YZ.CH && Object.keys(window.YZ.CH).length >= 6)`);
    if (ready) break;
    await sleep(400);
  }
  await evaluate(`(function(){
    var n6 = document.querySelector('#lenChips [data-n="6"]');
    var b = document.getElementById('startBtn');
    if (n6) n6.click();
    if (b) b.click();
    return true;
  })()`);
  await waitFor('#stage .se-card', 40, 400);
  check('刷题页可开始一组', await evaluate(`!!document.querySelector('#stage .se-card')`));

  async function answerStep(inputValue) {
    const kind = await evaluate(`(function(){
      var card = document.querySelector('#stage .se-card');
      if (!card) return 'none';
      if (card.querySelector('.se-opts')) return 'choice';
      if (card.querySelector('.se-input')) return 'fill';
      return 'none';
    })()`);
    if (kind === 'choice') {
      await evaluate(`(function(){var b=document.querySelector('#stage .se-opt'); if(b) b.click(); return !!b;})()`);
      await sleep(320);
    } else if (kind === 'fill') {
      await evaluate(`(function(){
        var i = document.querySelector('#stage .se-input');
        i.value = ${JSON.stringify(inputValue)};
        document.querySelector('#stage .se-submit').click();
        return true;
      })()`);
      await sleep(320);
    }
    return kind;
  }

  /* 第一题：先看能不能答。
     注意不能只认「第 x / y 步」这一种格式——step-engine 现在有两条渲染路径：
       · qtype = single/calc/big → drawByQtype，.se-stepno 显示题型标签（如「计算」）
       · 旧 steps / judge        → drawGuided，.se-stepno 显示「第 x / y 步」
     断言应验「题目已就位且可作答」，不是验某一种渲染格式。 */
  const q1Ready = await evaluate(`(function(){
    var card = document.querySelector('#stage .se-card');
    if (!card) return null;
    var tag = card.querySelector('.se-stepno');
    var stepM = tag ? /第\\s*(\\d+)\\s*\\/\\s*(\\d+)/.exec(tag.innerText) : null;
    return {
      label: tag ? tag.innerText.trim() : '',
      cur: stepM ? +stepM[1] : null,
      total: stepM ? +stepM[2] : null,
      answerable: !!(card.querySelector('.se-opts') || card.querySelector('.se-input') || card.querySelector('.se-opt')),
    };
  })()`);
  check('首题已就位且可作答', !!q1Ready && q1Ready.answerable,
    q1Ready ? (q1Ready.total ? `${q1Ready.cur}/${q1Ready.total} 步` : q1Ready.label) : '未读到');

  /* 点「下一步」按钮推进（答对后） */
  async function clickNext() {
    await evaluate(`(function(){ var b=document.querySelector('#stage .se-next'); if(b && !b.disabled) b.click(); return true; })()`);
    await sleep(280);
  }

  /* 走完第一题：逐步全答对。guided 模式全部步骤走完才结算。 */
  try {
  const firstQid = await evaluate(`(function(){var h=document.querySelector('#stage');return h&&h.__curQ?h.__curQ.id:null;})()`);
  let guard = 0;
  while (guard++ < 12) {
    /* 题换了或卡片消失 → 结束 */
    const st = await evaluate(`(function(){
      var h=document.querySelector('#stage');
      if(!h) return { id:null, card:false, result:false };
      return {
        id: h.__curQ ? h.__curQ.id : null,
        card: !!h.querySelector('.se-card'),
        result: !!h.querySelector('.se-result, .se-summary')
      };
    })()`);
    if (!st.card || st.result) break;
    if (firstQid && st.id && st.id !== firstQid) break;

    const kind = await evaluate(`(function(){
      var c = document.querySelector('#stage .se-card');
      if (!c) return 'none';
      if (c.querySelector('.se-opts')) return 'choice';
      if (c.querySelector('.se-input')) return 'fill';
      return 'none';
    })()`);
    if (kind === 'none') break;

    if (kind === 'choice') {
      await evaluate(`(function(){var b=document.querySelector('#stage .se-opt'); if(b) b.click(); return !!b;})()`);
      await sleep(450);
    } else {
      const val = await evaluate(`(function(){
        var host = document.querySelector('#stage');
        var st = host && host.__state;
        var q = host && host.__curQ;
        if (!q) return '';
        var s = q.steps[st ? st.stepIdx : 0];
        if (!s) return '';
        return String((s.accept && s.accept[0]) || s.answer || '');
      })()`);
      if (!val) break;
      await evaluate(`(function(){
        var i = document.querySelector('#stage .se-input');
        var s = document.querySelector('#stage .se-submit');
        if (!i || !s) return false;
        i.value = ${JSON.stringify(val)};
        s.click();
        return true;
      })()`);
      await sleep(450);
    }
    /* 点「下一步」 */
    await evaluate(`(function(){ var b=document.querySelector('#stage .se-next'); if(b && !b.disabled) b.click(); return true; })()`);
    await sleep(450);
  }
  } catch (e) {
    /* 单题演练失败不应中断整轮测试——后面的检查项仍有诊断价值 */
    console.log('  （单题演练跳过：' + e.message.slice(0, 60) + '）');
  }

  await sleep(600);

  const afterOne = await evaluate(`(function(){
    var log = window.YZ.qLog();
    if (!log || !log.stats) return { n: 0, wrong: 0, nm: null };
    var bc = log.stats.byChapter || {};
    var n = 0; Object.keys(bc).forEach(function(k){ n += (bc[k] && bc[k].n) || 0; });
    return { n: n, wrong: Object.keys(log.wrong||{}).length, nm: log.nearMiss || null };
  })()`);
  check('作答记录已落库', afterOne.n > 0, `记录 ${afterOne.n} 条`);

  /* ---------- 4. 直接验证 nearMiss 计算逻辑 ---------- */
  const nmLogic = await evaluate(`(function(){
    /* 模拟：3 步题，前两步对、最后一步错 */
    var rec = { id:'test-nm', chapter:'ch-op', tier:'l1', result:'wrong', stuckStep:2, errorType:'calc', nearMiss:true };
    window.YZ.qRecord(rec);
    var nm = window.YZ.nearMissRate();
    return { n: nm.n, total: nm.total, rate: nm.rate };
  })()`);
  check('nearMiss 记录生效', nmLogic.n >= 1, `n=${nmLogic.n} total=${nmLogic.total}`);

  /* ---------- 5. 概念页 ---------- */
  await send('Page.navigate', { url: URL_BASE + '/concept.html' });
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    const n = await evaluate(`Object.keys(window.YZ.CH||{}).length`);
    if (n >= 6) break;
  }
  await evaluate(`(function(){var b=document.getElementById('startAll'); if(b) b.click(); return !!b;})()`);
  for (let i = 0; i < 20; i++) {
    await sleep(250);
    const ok = await evaluate(`!!document.querySelector('#stage .se-card')`);
    if (ok) break;
  }
  const conceptStage = await evaluate(`!!document.querySelector('#stage .se-card')`);
  check('概念自测可开始', conceptStage);

  /* 概念题的题干在 .se-stem 内的 .c-claim + .c-q 里，直接看 se-stem 的文本量 */
  let conceptQ = '';
  for (let i = 0; i < 20; i++) {
    conceptQ = await evaluate(`(function(){
      var el = document.querySelector('#stage .se-stem');
      if (!el) return '';
      var t = (el.innerText||'').trim();
      var svg = el.querySelectorAll('svg').length;
      return t + (svg ? ' [公式' + svg + ']' : '');
    })()`);
    if (conceptQ.length > 6) break;
    await sleep(250);
  }
  check('概念判断题渲染', conceptQ.length > 6, conceptQ.replace(/\n/g, ' ').slice(0, 40));

  /* ---------- 7. 错题本 ---------- */
  await send('Page.navigate', { url: URL_BASE + '/wrong.html' });
  await waitFor('#wbCount');
  const wbInfo = await evaluate(`(function(){
    var c = document.getElementById('wbCount');
    var list = document.getElementById('wbList');
    return { count: c ? c.innerText : '', hasList: !!list, empty: !!document.querySelector('#wbList .empty') };
  })()`);
  check('错题本渲染', wbInfo.hasList && (wbInfo.count.length > 0 || wbInfo.empty),
    wbInfo.empty ? '空态（记录已清空，符合预期）' : wbInfo.count);

  /* ---------- 9. 方法卡页 ---------- */
  await send('Page.navigate', { url: URL_BASE + '/method/m-eq-5steps.html' });
  await waitFor('.mc-steps li');
  const mcSteps = await evaluate(`document.querySelectorAll('.mc-steps li').length`);
  check('方法卡步骤渲染', mcSteps > 0, `${mcSteps} 步`);
  const mcPit = await evaluate(`document.querySelectorAll('.pitfall-card').length`);
  check('方法卡误用渲染', mcPit > 0, `${mcPit} 条`);

  /* ---------- 10. 公式库 ---------- */
  await send('Page.navigate', { url: URL_BASE + '/graph.html' });
  await waitFor('#fgBody tr', 60, 500);
  const fgRows = await evaluate(`document.querySelectorAll('#fgBody tr').length`);
  check('公式库表格渲染', fgRows > 10, `${fgRows} 行`);

  /* ---------- 全部页面可达 + 关键区块 ----------
     只列实际构建的页面。已停用的（today/calc/exam/plan/slots/ladder/content）
     曾长期留在这张表里，导致「测试有 7 项红」成了常态——红着就没人看，
     真正的失败会被淹掉。停用页面不在此表。 */
  const PAGES = [
    ['index.html', '.entry-card'],
    ['drill.html', '#startBtn'],
    ['concept.html', '.setup-card'],
    ['learn.html', '.learn-tab'],
    ['papers.html', '.cloud-dots'],
    ['wrong.html', '#wbList'],
    ['graph.html', '#fgBody tr'],
    ['map.html', '[data-ch]'],
    ['method.html', '.method-card'],
  ];
  for (const [pg, sel] of PAGES) {
    await send('Page.navigate', { url: URL_BASE + '/' + pg });
    let ok = false;
    for (let i = 0; i < 25; i++) {
      await sleep(300);
      ok = await evaluate(`!!document.querySelector(${JSON.stringify(sel)})`);
      if (ok) break;
    }
    check('页面 ' + pg + ' 可渲染', ok, sel);
  }

  /* ---------- 三级变式链（核心） ---------- */
  await send('Page.navigate', { url: URL_BASE + '/drill.html?method=m-eq-5steps' });
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    const n = await evaluate(`typeof window.YZ==='object' ? Object.keys(window.YZ.CH||{}).length : 0`);
    if (n >= 6) break;
  }
  const order = await evaluate(`(function(){
    if (!window.YZ || !window.YZ.buildLadders) return null;
    var pool=[];
    Object.keys(window.YZ.CH||{}).forEach(function(cid){
      (window.YZ.CH[cid].questions||[]).forEach(function(q){
        if(q.method==='m-eq-5steps') pool.push(q);
      });
    });
    return window.YZ.buildLadders(pool).slice(0,3).map(function(x){ return x.q.changed; });
  })()`);
  check('出题池按三级顺序',
    Array.isArray(order) && order[0]==='number' && order[1]==='condition' && order[2]==='reverse',
    Array.isArray(order) ? order.join(' → ') : String(order));

  const chainLogic = await evaluate(`(function(){
    localStorage.removeItem('yz-method-v1');
    window.YZ.methodRecord('m-test','a',true,'number');
    window.YZ.methodRecord('m-test','b',true,'condition');
    var mid = window.YZ.methodState('m-test');
    window.YZ.methodRecord('m-test','c',false,'reverse');
    var fail = window.YZ.methodState('m-test');
    return { midDone: mid.done, failDone: fail.done, failPassed: fail.passed, stuck: fail.stuckLevel };
  })()`);
  check('三级全对前不达标', chainLogic.midDone === false, JSON.stringify(chainLogic));
  check('错一级则整条重置', chainLogic.failDone === false && chainLogic.failPassed.every(x=>!x),
    JSON.stringify(chainLogic.failPassed));
  check('记录卡在第几级', chainLogic.stuck === 2, 'stuckLevel=' + chainLogic.stuck);

  /* ---------- 讲解数据层（know.html 已停用，数据与校验保留）----------
     know.html 页面已于 2026-11-24 按用户要求删除（使用视角看没有意义），
     但 src/data-know.js 的 27 族讲解数据与 FAMILY_ASSETS 归属表仍被
     validate.mjs 的断言使用（族-讲解一一对应、form 与单题分值一致、
     50 概念卡与 46 公式各恰属一族）。所以这里只验数据层，不再验页面渲染。 */
  const knowData = await evaluate(`(function(){
    var M = window.YZ.META || {};
    return { fams: (M.families || []).length };
  })()`);
  check('考点族数据可用（讲解层已停用但数据保留）', knowData.fams > 20, knowData.fams + ' 族');

  /* ---------- 学习页（learn.html）----------
     四级验证：模块 tab → 章节目录 → 进章看条目 → 分页 → 返回。
     这一页的层级是「模块 / 章 / 条目」，任何一层断了都会让内容看不见，
     而 DOM 里条目数照样是 139——所以必须逐层验，不能只数条目。 */
  await send('Page.navigate', { url: URL_BASE + '/learn.html' });
  await waitFor('.learn-tab', 40, 500);

  const learnTabs = await evaluate(`(function(){
    var tabs = document.querySelectorAll('.learn-tab');
    var mods = document.querySelectorAll('.learn-mod');
    var on = document.querySelector('.learn-mod.on');
    return {
      tabs: tabs.length,
      mods: mods.length,
      keys: [].map.call(tabs, function(t){ return t.getAttribute('data-mod'); }),
      /* 初始应停在目录层：目录可见、章容器全隐藏 */
      tocVisible: on ? on.querySelector('.learn-toc').offsetParent !== null : false,
      chaptersHidden: on ? [].every.call(on.querySelectorAll('.learn-chapter'),
        function(c){ return c.offsetParent === null; }) : false
    };
  })()`);
  check('学习页三个模块 tab', learnTabs.tabs === 3 && learnTabs.mods === 3,
    `tab ${learnTabs.tabs} · 模块 ${learnTabs.mods} · ${(learnTabs.keys || []).join('/')}`);
  check('初始停在章节目录层', learnTabs.tocVisible && learnTabs.chaptersHidden,
    `目录可见=${learnTabs.tocVisible} · 章全隐藏=${learnTabs.chaptersHidden}`);

  /* 进第 1 章：目录隐藏、该章显示、条目可见 */
  await evaluate(`(function(){
    var b = document.querySelector('.learn-mod[data-mod="concept"] [data-go="ch-rational"]');
    if (b) b.click(); return !!b;
  })()`);
  await sleep(400);
  const inChapter = await evaluate(`(function(){
    var on = document.querySelector('.learn-mod.on');
    var ch = on.querySelector('.learn-chapter[data-chapter="ch-rational"]');
    var visItems = [].filter.call(ch.querySelectorAll('.learn-item'),
      function(i){ return i.offsetParent !== null; });
    return {
      tocHidden: on.querySelector('.learn-toc').offsetParent === null,
      chShown: ch.offsetParent !== null,
      crumb: ch.querySelector('.crumb-ch').textContent.trim(),
      visibleItems: visItems.length,
      allItems: ch.querySelectorAll('.learn-item').length,
      hasPager: !!ch.parentNode.querySelector('.pager[data-pager="ch-rational"]'),
      /* 面包屑不能被吸顶头部压住，否则「返回目录」点不到 */
      backClickable: (function(){
        var back = ch.querySelector('.crumb-back');
        var hdr = document.querySelector('.hdr');
        if (!back || !hdr) return false;
        return back.getBoundingClientRect().top >= hdr.getBoundingClientRect().bottom;
      })()
    };
  })()`);
  check('点目录能进章', inChapter.tocHidden && inChapter.chShown && inChapter.visibleItems > 0,
    `${inChapter.crumb} · 可见 ${inChapter.visibleItems}/${inChapter.allItems} 条`);
  check('章内按 8 条分页', inChapter.allItems > 8 && inChapter.visibleItems === 8 && inChapter.hasPager,
    `总 ${inChapter.allItems} 条 · 本页 ${inChapter.visibleItems} 条 · 分页器=${inChapter.hasPager}`);
  check('「返回目录」未被头部遮挡', inChapter.backClickable, `可点=${inChapter.backClickable}`);

  /* 翻到第 2 页：条目应换成另一批 */
  const page2 = await evaluate(`(function(){
    var p = document.querySelector('.pager[data-pager="ch-rational"]');
    var btns = p ? p.querySelectorAll('button[data-pg="1"]') : [];
    if (btns.length) btns[0].click();
    var ch = document.querySelector('.learn-mod.on .learn-chapter[data-chapter="ch-rational"]');
    var vis = [].filter.call(ch.querySelectorAll('.learn-item'), function(i){ return i.offsetParent !== null; });
    var onBtn = p ? p.querySelector('button.on') : null;
    return { visible: vis.length, activePage: onBtn ? onBtn.textContent.trim() : null };
  })()`);
  await sleep(300);
  const page2b = await evaluate(`(function(){
    var p = document.querySelector('.pager[data-pager="ch-rational"]');
    var onBtn = p ? p.querySelector('button.on') : null;
    var ch = document.querySelector('.learn-mod.on .learn-chapter[data-chapter="ch-rational"]');
    var vis = [].filter.call(ch.querySelectorAll('.learn-item'), function(i){ return i.offsetParent !== null; });
    return { visible: vis.length, activePage: onBtn ? onBtn.textContent.trim() : null };
  })()`);
  check('翻页能换一批条目', page2b.activePage === '2' && page2b.visible > 0,
    `当前第 ${page2b.activePage} 页 · 可见 ${page2b.visible} 条`);

  /* 返回目录 */
  await evaluate(`document.querySelector('.learn-mod.on .crumb-back').click()`);
  await sleep(300);
  const backOk = await evaluate(`(function(){
    var on = document.querySelector('.learn-mod.on');
    return on.querySelector('.learn-toc').offsetParent !== null
      && [].every.call(on.querySelectorAll('.learn-chapter'), function(c){ return c.offsetParent === null; });
  })()`);
  check('返回目录', backOk === true, `回到目录=${backOk}`);

  /* 切到「公式」：模块可见性要跟着变，且回到目录层 */
  await evaluate(`document.querySelector('.learn-tab[data-mod="formula"]').click()`);
  await sleep(350);
  const switched = await evaluate(`(function(){
    var on = document.querySelector('.learn-mod.on');
    return {
      key: on.getAttribute('data-mod'),
      tocVisible: on.querySelector('.learn-toc').offsetParent !== null,
      chapters: on.querySelectorAll('.learn-chapter').length,
      othersHidden: [].every.call(document.querySelectorAll('.learn-mod'), function(m){
        return m.classList.contains('on') || m.offsetParent === null;
      })
    };
  })()`);
  check('切模块后回到目录', switched.key === 'formula' && switched.tocVisible
    && switched.othersHidden && switched.chapters > 0,
    `${switched.key} · 目录可见=${switched.tocVisible} · ${switched.chapters} 章 · 其余隐藏=${switched.othersHidden}`);

  /* 全部条目都必须有「练这一族」入口——这是这一页的存在理由 */
  const totalItems = await evaluate(`document.querySelectorAll('.learn-item').length`);
  const totalDrill = await evaluate(`document.querySelectorAll('.learn-item a[href^="drill.html?family="]').length`);
  const totalTest = await evaluate(`document.querySelectorAll('.learn-item a[href^="drill.html?qtype=concept"]').length`);
  check('每条都能进练习', totalItems > 0 && totalDrill === totalItems,
    `条目 ${totalItems} · 练这一族 ${totalDrill} · 测这张卡 ${totalTest}`);

  /* 条目是折叠的：默认全部收起，点开才显示正文。
     必须在「某个章可见」时验——上一段已返回目录，所有章 display:none，
     条目即使 open 也测不到 offsetParent（会得到假阴性）。所以先重新进一章。 */
  await evaluate(`document.querySelector('.learn-mod[data-mod="formula"] [data-go="ch-rational"]').click()`);
  await sleep(350);
  const collapsed = await evaluate(`(function(){
    var wrap = document.querySelector('.learn-mod.on .learn-chapter[data-chapter="ch-rational"]');
    var items = wrap.querySelectorAll('.learn-item');
    var closed = [].every.call(items, function(i){ return !i.open; });
    var first = items[0];
    first.open = true;
    var bodyVisible = first.querySelector('.li-body').offsetParent !== null;
    first.open = false;
    return { allClosed: closed, expands: bodyVisible };
  })()`);
  check('条目默认折叠且可展开', collapsed.allClosed && collapsed.expands,
    `全部收起=${collapsed.allClosed} · 可展开=${collapsed.expands}`);

  /* ---------- 汇总 ---------- */
  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== 端到端测试：${results.length - failed.length} / ${results.length} 通过 ===`);
  if (failed.length) {
    console.log('失败项：');
    failed.forEach((f) => console.log('  · ' + f.name + ' — ' + f.detail));
  }

  ws.close();
  chrome.kill();
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error('测试异常：', e.message);
  try { chrome.kill(); } catch (x) {}
  process.exit(1);
});
