/* ==========================================================
   三级变式链测试
   验证：
     ① 方法卡页显示三级链（改数字/改条件/逆向）
     ② drill 按三级顺序出题（不洗牌）
     ③ 三级全对 → 方法卡标记「已掌握」
     ④ 错一级 → 整条重置 + 记录卡在第几级
   用法：node tools/e2e-chain.mjs
   ========================================================== */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9339;
const BASE = process.env.BASE || 'http://127.0.0.1:8199';

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=/tmp/yz-chain-e2e',
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
  if (r.exceptionDetails) {
    const d = r.exceptionDetails.exception && r.exceptionDetails.exception.description;
    throw new Error((d || r.exceptionDetails.text || 'eval error') + ' :: ' + expr.slice(0, 80));
  }
  return r.result && r.result.value;
}
async function waitUntil(expr, tries = 30, gap = 300) {
  for (let i = 0; i < tries; i++) {
    const v = await ev(expr);
    if (v) return v;
    await sleep(gap);
  }
  return null;
}
async function waitShards(min = 6) {
  /* 先等 window.YZ 与 META 就绪，再等分片 */
  await waitUntil(`typeof window.YZ === 'object' && !!window.YZ.loadAll`, 30, 300);
  await waitUntil(`Object.keys(window.YZ.CH||{}).length >= ${min}`, 40, 300);
}

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✕'} ${name}${detail ? ' — ' + detail : ''}`);
};

async function stageState() {
  return await ev(`(function(){
    var h = document.querySelector('#stage');
    if (!h) return { card:false };
    var q = h.__curQ, st = h.__state;
    return { card: !!h.querySelector('.se-card'), id: q?q.id:null,
      changed: q?q.changed:null, method: q?q.method:null,
      kind: h.querySelector('.se-opts')?'choice':(h.querySelector('.se-input')?'fill':'none') };
  })()`);
}

async function answer(correct) {
  const s = await stageState();
  if (!s.card) return false;
  if (s.kind === 'choice') {
    await ev(`(function(){
      var host=document.querySelector('#stage'); var q=host.__curQ, st=host.__state;
      var step=q.steps[st.stepIdx]; var b=document.querySelectorAll('#stage .se-opt');
      if(!b.length) return false;
      b[${correct ? 'step.key' : '(step.key===0?1:0)'}].click(); return true;
    })()`);
  } else if (s.kind === 'fill') {
    await ev(`(function(){
      var host=document.querySelector('#stage'); var q=host.__curQ, st=host.__state;
      var step=q.steps[st.stepIdx]; var i=document.querySelector('#stage .se-input'), b=document.querySelector('#stage .se-submit');
      if(!i||!b) return false;
      i.value = ${correct ? "String((step.accept&&step.accept[0])||step.answer||'')" : "'99999'"};
      b.click(); return true;
    })()`);
  }
  await sleep(320);
  return true;
}
async function next() {
  await ev(`(function(){var b=document.querySelector('#stage .se-next'); if(b&&!b.disabled) b.click(); return true;})()`);
  await sleep(300);
}
/* 完整答完当前题：循环到「题 id 变了」或「卡片消失」。
   注意：引擎在最后一步答完后才切题，所以不能一读到 id 变化就提前退出，
   必须保证最后一步也答了。用「已答步数 ≥ 步骤数」作为完成判据更稳。 */
async function finishQuestion(correct) {
  const start = (await stageState()).id;
  if (!start) return;
  let g = 0;
  while (g++ < 15) {
    const s = await stageState();
    if (!s.card) break;
    if (s.id && s.id !== start) break;   /* 已切到下一题 */
    const stepNow = await ev(`(function(){
      var h=document.querySelector('#stage');
      if(!h||!h.__state) return -1;
      return h.__state.stepIdx;
    })()`);
    await answer(correct);
    await next();
    /* 如果这一步答完题就结束了（卡片消失或 id 变），下一轮循环会 break */
    const after = await stageState();
    if (!after.card || (after.id && after.id !== start)) break;
  }
}

async function main() {
  ws = new WebSocket(await connect());
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id);
      m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
    }
  };
  await send('Page.enable');
  await send('Runtime.enable');

  /* 先清空历史记录，避免上轮污染 */
  await send('Page.navigate', { url: BASE + '/index.html' });
  await sleep(800);
  await ev(`localStorage.clear(); true`);

  /* ---------- ① 方法卡页显示三级链 ---------- */
  await send('Page.navigate', { url: BASE + '/method/m-eq-5steps.html' });
  await sleep(1400);
  const chainSteps = await ev(`document.querySelectorAll('.chain-step').length`);
  check('方法卡页显示三级链', chainSteps === 3, `${chainSteps} 级`);
  const chainNames = await ev(`[].map.call(document.querySelectorAll('.chain-name'), function(e){return e.textContent;}).join(',')`);
  check('三级名称正确', chainNames === '改数字,改条件,逆向问', chainNames);
  const chainStatus = await ev(`(document.getElementById('chainStatus')||{}).textContent||''`);
  check('初始状态为未开始', chainStatus === '未开始', chainStatus);

  /* ---------- ② drill 出题池按三级顺序（不依赖交互，直接验数据层） ---------- */
  await send('Page.navigate', { url: BASE + '/drill.html?method=m-eq-5steps' });
  await waitShards(6);
  const order = await ev(`(function(){
    var pool=[];
    Object.keys(window.YZ.CH||{}).forEach(function(cid){
      (window.YZ.CH[cid].questions||[]).forEach(function(q){
        if(q.method==='m-eq-5steps') pool.push(q);
      });
    });
    var built = window.YZ.buildLadders(pool);
    return built.slice(0,4).map(function(x){ return x.q.changed || 'mother'; });
  })()`);
  check('出题池按三级顺序', Array.isArray(order) && order[0] === 'number' && order[1] === 'condition' && order[2] === 'reverse',
    '顺序：' + (Array.isArray(order) ? order.join(' → ') : order));

  const chainInfo = await ev(`(function(){
    var pool=[];
    Object.keys(window.YZ.CH||{}).forEach(function(cid){
      (window.YZ.CH[cid].questions||[]).forEach(function(q){
        if(q.method==='m-eq-5steps') pool.push(q);
      });
    });
    var cs = window.YZ.completeChains(pool);
    return { n: cs.length, first: cs[0] ? cs[0].qs.map(function(q){return q.changed;}) : null };
  })()`);
  check('识别出完整三级链', chainInfo.n >= 1, `${chainInfo.n} 条，首条：${JSON.stringify(chainInfo.first)}`);

  /* ---------- ③ 三级全对 → 已掌握 ---------- */
  const stPass = await ev(`(function(){
    localStorage.removeItem('yz-method-v1');
    window.YZ.methodRecord('m-eq-5steps','v-eq5-1',true,'number');
    window.YZ.methodRecord('m-eq-5steps','v-eq5-2',true,'condition');
    window.YZ.methodRecord('m-eq-5steps','v-eq5-3',true,'reverse');
    return window.YZ.methodState('m-eq-5steps');
  })()`);
  check('三级全对 → 已掌握', stPass.done === true, JSON.stringify(stPass.passed));

  /* ---------- ④ 错一级 → 整条重置 ---------- */
  const stFail = await ev(`(function(){
    localStorage.removeItem('yz-method-v1');
    window.YZ.methodRecord('m-eq-5steps','v-eq5-1',true,'number');
    window.YZ.methodRecord('m-eq-5steps','v-eq5-2',false,'condition');
    return window.YZ.methodState('m-eq-5steps');
  })()`);
  check('错一级 → 整条重置', stFail.passed.every((x) => !x) && !stFail.done,
    `passed=${JSON.stringify(stFail.passed)}`);
  check('记录卡在第几级', stFail.stuckLevel === 1, `stuckLevel=${stFail.stuckLevel}（改条件）`);

  /* ---------- ⑤ 卡点分布 ---------- */
  const dist = await ev(`JSON.stringify(window.YZ.methodStuckDist())`);
  check('卡点分布可读', dist === '[0,1,0]', dist);

  /* ---------- ⑥ 方法卡页达标状态联动 ---------- */
  await send('Page.navigate', { url: BASE + '/method/m-eq-5steps.html' });
  await sleep(1400);
  const shownStatus = await ev(`(document.getElementById('chainStatus')||{}).textContent||''`);
  check('方法卡页显示卡点状态', /卡在/.test(shownStatus), shownStatus);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== 三级链测试：${results.length - failed.length} / ${results.length} 通过 ===`);
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
