/* ==========================================================
   错题本「勾选重做」测试
   验证：
     ① 有错题时每道题出现勾选框
     ② 勾选后「已选 N 题」更新、按钮可用
     ③ 全选本页工作
     ④ 清空选择工作
     ⑤ 重做选中 → 跳转到 drill 且只出选中的题
   用法：node tools/e2e-redo.mjs
   ========================================================== */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9343;
const BASE = process.env.BASE || 'http://127.0.0.1:8199';

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=/tmp/yz-redo-e2e',
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
    throw new Error((d || r.exceptionDetails.text) + ' :: ' + expr.slice(0, 70));
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

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✕'} ${name}${detail ? ' — ' + detail : ''}`);
};

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

  /* ---------- 造 3 道错题（直接写 qlog） ---------- */
  await send('Page.navigate', { url: BASE + '/wrong.html' });
  await sleep(1000);
  const seeded = await ev(`(function(){
    localStorage.clear();
    var qids = ['v-eq5-1','v-eq5-2','v-eq5-3'];
    var log = { stats:{byChapter:{},byMethod:{},byTier:{}}, wrong:{}, errStats:{}, due:{}, nearMiss:{n:0,total:0} };
    ['concept','sign','calc','method','model','express'].forEach(function(k){ log.errStats[k]={n:0,ok:0}; });
    qids.forEach(function(id, i){
      log.wrong[id] = { result:'wrong', stuckStep:i, errorType:['sign','calc','method'][i],
        timeMs:1000, chapter:'ch-eq', method:'m-eq-5steps', tier:'l1', n:i+1, due:0, src:'drill' };
    });
    localStorage.setItem('yz-qlog-v1', JSON.stringify(log));
    return Object.keys(log.wrong).length;
  })()`);
  check('已造 3 道错题', seeded === 3, `${seeded} 条`);

  /* ---------- ① 重新加载，检查勾选框 ---------- */
  await send('Page.navigate', { url: BASE + '/wrong.html' });
  await waitUntil(`typeof window.YZ==='object' && !!window.YZ.loadAll`, 30, 300);
  await waitUntil(`Object.keys(window.YZ.CH||{}).length >= 6`, 40, 300);
  const boxes = await waitUntil(`document.querySelectorAll('[data-pick]').length`, 20, 300);
  check('每道错题有勾选框', boxes === 3, `${boxes} 个`);

  const picked0 = await ev(`(document.getElementById('wbPicked')||{}).textContent||''`);
  check('初始未选', picked0 === '未选', picked0);

  const btn0 = await ev(`document.getElementById('redoPicked').disabled`);
  check('未选时按钮禁用', btn0 === true, `disabled=${btn0}`);

  /* ---------- ② 勾选两道 ---------- */
  await ev(`(function(){
    var bs = document.querySelectorAll('[data-pick]');
    bs[0].click(); bs[1].click();
    return true;
  })()`);
  await sleep(300);
  const picked2 = await ev(`(document.getElementById('wbPicked')||{}).textContent||''`);
  check('勾选两道后计数', picked2 === '已选 2 题', picked2);

  const btn2 = await ev(`document.getElementById('redoPicked').disabled`);
  check('勾选后按钮可用', btn2 === false, `disabled=${btn2}`);

  const cardPicked = await ev(`document.querySelectorAll('.wb-item.picked').length`);
  check('选中卡片有高亮', cardPicked === 2, `${cardPicked} 张`);

  /* ---------- ③ 全选本页 ---------- */
  await ev(`(function(){ var s=document.getElementById('selAll'); s.checked=true; s.dispatchEvent(new Event('change')); return true; })()`);
  await sleep(300);
  const pickedAll = await ev(`(document.getElementById('wbPicked')||{}).textContent||''`);
  check('全选本页', pickedAll === '已选 3 题', pickedAll);

  /* ---------- ④ 清空选择 ---------- */
  await ev(`document.getElementById('redoPickedClear').click(); true`);
  await sleep(300);
  const pickedCleared = await ev(`(document.getElementById('wbPicked')||{}).textContent||''`);
  check('清空选择', pickedCleared === '未选', pickedCleared);

  const boxesCleared = await ev(`document.querySelectorAll('[data-pick]:checked').length`);
  check('清空后无勾选', boxesCleared === 0, `${boxesCleared} 个仍勾选`);

  /* ---------- ⑤ 重做选中 → 跳转 drill 且只出选中的题 ---------- */
  await ev(`(function(){
    var bs = document.querySelectorAll('[data-pick]');
    bs[0].click(); bs[2].click();
    return true;
  })()`);
  await sleep(300);
  const pickedIds = await ev(`(function(){
    return [].map.call(document.querySelectorAll('[data-pick]:checked'), function(b){ return b.getAttribute('data-pick'); });
  })()`);
  check('记录了选中 id', pickedIds.length === 2, JSON.stringify(pickedIds));

  await ev(`document.getElementById('redoPicked').click(); true`);
  await sleep(2000);
  const url = await ev(`location.href`);
  check('跳转到 drill 并带 ids', /drill\.html\?ids=/.test(url),
    url.replace(BASE, '').slice(0, 90));

  /* drill 页实际出题数应等于选中数 */
  const drillTotal = await waitUntil(`(function(){
    var el = document.querySelector('.se-count');
    if (!el) return 0;
    var m = /\\/\\s*(\\d+)/.exec(el.textContent || '');
    return m ? parseInt(m[1], 10) : 0;
  })()`, 30, 300);
  check('drill 只出选中的题', drillTotal === 2, `${drillTotal} 题`);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== 勾选重做测试：${results.length - failed.length} / ${results.length} 通过 ===`);
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
