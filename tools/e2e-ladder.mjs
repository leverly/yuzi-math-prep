/* ==========================================================
   变式阶梯端到端测试
   验证：
     ① 阶梯页渲染 8 条阶梯
     ② 开始训练 → 第 1 级出现
     ③ 答对 → 进第 2 级
     ④ 答错 → 整条重置回第 1 级 + 记录 stuckLevel
     ⑤ 三级全对 → 达标
     ⑥ 卡点分布统计正确
   用法：node tools/e2e-ladder.mjs
   ========================================================== */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9336;
const BASE = process.env.BASE || 'http://127.0.0.1:8199';

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=/tmp/yz-ladder-e2e',
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

async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' :: ' +
    JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description));
  return r.result && r.result.value;
}

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✕'} ${name}${detail ? ' — ' + detail : ''}`);
};

async function main() {
  ws = new WebSocket(await connect());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id);
      if (m.error) p.reject(new Error(JSON.stringify(m.error)));
      else p.resolve(m.result);
    }
  };
  await send('Page.enable');
  await send('Runtime.enable');

  await send('Page.navigate', { url: BASE + '/ladder.html' });
  await sleep(1800);

  /* ① 渲染 */
  const cards = await ev(`document.querySelectorAll('[data-ladder]').length`);
  check('阶梯卡片渲染', cards >= 8, `${cards} 条`);

  const levels = await ev(`document.querySelectorAll('[data-ladder] .lad-lv').length`);
  check('每条阶梯 3 级', levels === cards * 3, `${levels} 行（${cards}×3）`);

  const anchorCards = await ev(`document.querySelectorAll('[data-ladder] .lad-anchor').length`);
  check('每条阶梯标注真题考点', anchorCards === cards, `${anchorCards} 条`);

  /* 清空旧记录 */
  await ev(`localStorage.removeItem('yz-ladder-v1'); localStorage.removeItem('yz-qlog-v1'); true`);
  await send('Page.navigate', { url: BASE + '/ladder.html' });
  await sleep(1800);

  /* ② 开始第一条阶梯 */
  await ev(`document.querySelector('[data-start]').click(); true`);
  await sleep(1400);

  const runVisible = await ev(`document.getElementById('ladStage').style.display !== 'none'`);
  check('训练区显示', runVisible);

  const runLv = await ev(`(document.getElementById('ladRunLv')||{}).textContent || ''`);
  check('显示第 1 级', /第 1 \/ 3 级/.test(runLv), runLv);

  const trackCur = await ev(`document.querySelectorAll('.lad-rt.cur').length`);
  check('进度条高亮当前级', trackCur === 1, `${trackCur} 个高亮`);

  /* ③ 正确答完第 1 级 */
  async function answerCurrent(correct) {
    return await ev(`(function(){
      var host = document.querySelector('#stage');
      var q = host && host.__curQ;
      var st = host && host.__state;
      if (!q || !st) return { err: 'no state' };
      var s = q.steps[st.stepIdx];
      if (!s) return { err: 'no step' };
      if (s.type === 'choice' || s.type === 'expr') {
        var btns = document.querySelectorAll('#stage .se-opt');
        if (!btns.length) return { err: 'no opts' };
        var target = ${correct} ? s.key : (s.key === 0 ? 1 : 0);
        btns[target].click();
        return { kind: 'choice', picked: target };
      }
      if (s.type === 'fill') {
        var inp = document.querySelector('#stage .se-input');
        if (!inp) return { err: 'no input' };
        var v = ${correct} ? ((s.accept && s.accept[0]) || s.answer || '') : '99999';
        inp.value = String(v);
        document.querySelector('#stage .se-submit').click();
        return { kind: 'fill', val: v };
      }
      return { err: 'unknown type ' + s.type };
    })()`);
  }

  async function clickNextIfAny() {
    await ev(`(function(){ var b=document.querySelector('#stage .se-next'); if(b && !b.disabled) b.click(); return true; })()`);
    await sleep(260);
  }

  /* 完成「当前这一道题」的所有步骤（每步都答对）。
     关键：记录起始题 id，一旦题 id 变化就停，避免把下一级也答了。 */
  async function finishQuestionCorrect() {
    const startId = await ev(`(function(){
      var h=document.querySelector('#stage'); return h&&h.__curQ ? h.__curQ.id : null;
    })()`);
    let guard = 0;
    while (guard++ < 10) {
      const now = await ev(`(function(){
        var h=document.querySelector('#stage');
        if(!h||!h.__curQ) return { id:null, card:false };
        return { id:h.__curQ.id, card: !!h.querySelector('.se-card') };
      })()`);
      if (!now.card) break;
      /* 题已换到下一级 → 停手 */
      if (startId && now.id && now.id !== startId) break;
      await answerCurrent(true);
      await sleep(340);
      await clickNextIfAny();
    }
    return startId;
  }

  await finishQuestionCorrect();
  await sleep(1600);

  const afterL1 = await ev(`(function(){
    var st = window.YZ.ladderState('lad-mixcalc');
    return { passed: st.passed, done: st.done, stuck: st.stuckLevel };
  })()`);
  check('第 1 级通过后记录', afterL1.passed[0] === true, JSON.stringify(afterL1.passed));

  const lv2 = await ev(`(document.getElementById('ladRunLv')||{}).textContent || ''`);
  check('自动进入第 2 级', /第 2 \/ 3 级/.test(lv2), lv2);

  /* ④ 第 2 级故意答错 → 应重置回第 1 级 */
  /* 第 2 级：第一步故意答错，然后走完该题（guided 模式要全部步骤走完才结算） */
  {
    const startId = await ev(`(function(){var h=document.querySelector('#stage');return h&&h.__curQ?h.__curQ.id:null;})()`);
    let first = true;
    let guard = 0;
    while (guard++ < 10) {
      const now = await ev(`(function(){
        var h=document.querySelector('#stage');
        if(!h||!h.__curQ) return { id:null, card:false };
        return { id:h.__curQ.id, card: !!h.querySelector('.se-card') };
      })()`);
      if (!now.card) break;
      if (startId && now.id && now.id !== startId) break;
      if (first) { await answerCurrent(false); first = false; }
      else { await answerCurrent(true); }
      await sleep(380);
      await clickNextIfAny();
    }
  }
  await sleep(1400);

  const afterFail = await ev(`(function(){
    var st = window.YZ.ladderState('lad-mixcalc');
    return { passed: st.passed, done: st.done, stuck: st.stuckLevel, reset: st.resetCount||0 };
  })()`);
  check('答错后整条重置', afterFail.passed.every((x) => !x) && !afterFail.done,
    `passed=${JSON.stringify(afterFail.passed)}`);
  check('记录卡在哪一级', afterFail.stuck === 1, `stuckLevel=${afterFail.stuck}（第 2 级）`);

  const lvBack = await ev(`(document.getElementById('ladRunLv')||{}).textContent || ''`);
  check('重置后回到第 1 级', /第 1 \/ 3 级/.test(lvBack), lvBack);

  /* ⑤ 卡点分布 */
  const dist = await ev(`JSON.stringify(window.YZ.ladderStuckDist())`);
  check('卡点分布统计', dist === '[0,1,0]', dist);

  /* ⑥ 三级全对 → 达标（用一条短阶梯验证） */
  await ev(`localStorage.removeItem('yz-ladder-v1'); true`);
  await send('Page.navigate', { url: BASE + '/ladder.html' });
  await sleep(1700);
  /* 选最短的一条：绝对值阶梯第1级只有2步 */
  await ev(`document.querySelector('[data-ladder="lad-abs"] [data-start]').click(); true`);
  await sleep(1300);

  for (let i = 0; i < 3; i++) {
    await finishQuestionCorrect();
    await sleep(1000);
  }

  const absDone = await ev(`(function(){
    var st = window.YZ.ladderState('lad-abs');
    return { done: st.done, passed: st.passed, stuck: st.stuckLevel };
  })()`);
  check('三级全对即达标', absDone.done === true, JSON.stringify(absDone));

  /* ⑦ 达标后卡片显示 */
  const cardStatus = await ev(`(function(){
    var c = document.querySelector('[data-ladder="lad-abs"] .lad-status');
    return c ? c.textContent : '';
  })()`);
  check('卡片显示已达标', cardStatus === '已达标', cardStatus);

  /* ⑧ 进度计数 */
  const prog = await ev(`(function(){
    var p = window.YZ.ladderProgress(8);
    return p.done + '/' + p.total;
  })()`);
  check('进度计数', prog === '1/8', prog);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== 阶梯测试：${results.length - failed.length} / ${results.length} 通过 ===`);
  if (failed.length) failed.forEach((f) => console.log('  · ' + f.name + ' — ' + f.detail));

  ws.close();
  chrome.kill();
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error('测试异常：', e.message);
  try { chrome.kill(); } catch (x) {}
  process.exit(1);
});
