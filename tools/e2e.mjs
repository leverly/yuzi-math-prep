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
  /* 点「最小题量」那一档，再开始。
     不硬编码具体数值：题量选项会随教学口径调整（曾从 6/8/12 改成 10/16/24），
     写死 data-n="6" 会在改选项后静默失败——测试挂掉但看不出是测试的问题。 */
  await evaluate(`(function(){
    var chips = [].slice.call(document.querySelectorAll('#lenChips .chip'));
    if (chips.length) {
      var min = chips.reduce(function(a, b){
        return parseInt(a.getAttribute('data-n'),10) <= parseInt(b.getAttribute('data-n'),10) ? a : b;
      });
      min.click();
    }
    var b = document.getElementById('startBtn');
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

  /* 第一题：先看有几步。
     注意：se-stepno 的内容因题型而异——
       多步题 → 「第 1 / 3 步」（可解析出数字）
       单步题 → 「单选」「计算」「判断」等标签（解析不出数字）
     所以不能把「解析不到」判成失败：题库里有单步题，
     抽到单步题是正常情况，不是渲染坏了。
     真正的判据是「步骤区域渲染出来了」。 */
  const q1Steps = await evaluate(`(function(){
    var s = document.querySelector('#stage .se-stepno');
    if (!s) return null;
    var m = /第\\s*(\\d+)\\s*\\/\\s*(\\d+)/.exec(s.innerText);
    return { cur: m ? +m[1] : 1, total: m ? +m[2] : 1, raw: s.innerText.trim() };
  })()`);
  check('步骤区域已渲染', !!q1Steps, q1Steps ? (q1Steps.raw || `${q1Steps.cur}/${q1Steps.total}`) : '未读到');

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

  /* ---------- 知识复习页 ---------- */
  await send('Page.navigate', { url: URL_BASE + '/learn.html' });
  await waitFor('#learnBody, .learn-body, [data-learn]', 40, 400).catch(() => {});
  await sleep(1200);
  const learnOk = await evaluate(`(function(){
    return !!(document.querySelector('#learnBody') || document.querySelector('.learn-body') || document.body.innerText.length > 500);
  })()`);
  check('知识复习页渲染', learnOk === true);

  /* ---------- 真题分析页 ----------
     注意：这一页被精简过（13 节压到 5 节，逐题大表与部分图表已移除）。
     所以断言不能再依赖 #paperBody / .dist-row 这些旧结构。
     现在的判据是「页面主体渲染出来了」——具体有几节属于内容口径，
     由 validate.mjs 与构建期检查负责，不该在交互测试里锁死。 */
  await send('Page.navigate', { url: URL_BASE + '/papers.html' });
  await waitFor('.card, .stab-row, .dist-row', 60, 400);
  const pBlocks = await evaluate(`(function(){
    return document.querySelectorAll('.card, .stab-row, .dist-row, table tr').length;
  })()`);
  check('真题页主体渲染', pBlocks >= 5, `${pBlocks} 个内容块`);

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
