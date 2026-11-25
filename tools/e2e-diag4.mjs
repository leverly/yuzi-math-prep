/* ==========================================================
   诊断四点实现验收
     ① 点「巩固练习」直接出题（无配置页挡路）
     ② 三行说明：练什么 / 为什么 / 现在什么状态
     ③ 做完一组显示诊断（卡在哪步 → 哪类错因 → 再练按钮）
     ④ 首页一行：今日 P0 还剩几族
   用法：node tools/e2e-diag4.mjs
   ========================================================== */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9352;
const BASE = process.env.BASE || 'http://127.0.0.1:8199';

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=/tmp/yz-diag4',
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
    throw new Error((d || r.exceptionDetails.text) + ' :: ' + expr.slice(0, 60));
  }
  return r.result && r.result.value;
}
async function waitUntil(expr, tries = 40, gap = 300) {
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

async function stageState() {
  return await ev(`(function(){
    var h = document.querySelector('#stage');
    if (!h) return { card:false };
    var q = h.__curQ, st = h.__state;
    return { card: !!h.querySelector('.se-card'), id: q?q.id:null,
      stepIdx: st?st.stepIdx:0, steps: q?(q.steps||[]).length:0,
      kind: h.querySelector('.se-opts')?'choice':(h.querySelector('.se-input')?'fill':'none'),
      stepType: (q && q.steps && q.steps[st?st.stepIdx:0]) ? q.steps[st?st.stepIdx:0].type : null };
  })()`);
}
/* 通用作答：支持 opt（含 judge 布尔 key）与 input 两种形态。
   wrongAtStep: 第几步答错（-1 = 全对） */
async function stepThrough(wrongAtStep) {
  for (let i = 0; i < 10; i++) {
    const st = await ev(`(function(){
      var h = document.querySelector('#stage');
      if (!h) return { gone: true };
      if (h.querySelector('.se-go')) return { go: true };
      var q = h.__curQ, s2 = h.__state;
      if (!q || !s2) return { none: true };
      var step = q.steps[s2.stepIdx];
      if (!step) return { none: true };
      if (h.querySelector('.se-opts')) return { mode:'opt', key: step.key, idx: s2.stepIdx };
      if (h.querySelector('.se-input')) return { mode:'input', acc:(step.accept && step.accept[0]) || step.answer, idx: s2.stepIdx };
      return { none: true };
    })()`);
    if (st.go) {
      await ev(`(function(){var b=document.querySelector('#stage .se-go'); if(b){b.click(); return true} return false})()`);
      await sleep(500);
      return;
    }
    if (st.gone || st.none) return;

    const doWrong = (st.idx === wrongAtStep);
    if (st.mode === 'opt') {
      await ev(`(function(){
        var h=document.querySelector('#stage'); var q=h.__curQ, s2=h.__state;
        var step=q.steps[s2.stepIdx]; var b=document.querySelectorAll('#stage .se-opt');
        var k=step.key;
        var right=(typeof k==='boolean')?(k?0:1):k;
        var idx=${doWrong} ? (right===0?1:0) : right;
        if(b[idx]) b[idx].click();
        return true;
      })()`);
    } else {
      await ev(`(function(){
        var h=document.querySelector('#stage'); var q=h.__curQ, s2=h.__state;
        var step=q.steps[s2.stepIdx];
        var i=document.querySelector('#stage .se-input'); if(!i) return false;
        i.value=${doWrong} ? '99999' : String((step.accept&&step.accept[0])||step.answer||'');
        document.querySelector('#stage .se-submit').click();
        return true;
      })()`);
    }
    await sleep(360);
    await ev(`(function(){var b=document.querySelector('#stage .se-next'); if(b&&!b.disabled){b.click(); return true} return false})()`);
    await sleep(360);
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

  /* 清空记录，模拟第一次使用 */
  await send('Page.navigate', { url: BASE + '/index.html' });
  await sleep(1200);
  await ev(`localStorage.clear(); true`);

  /* ---------- ④ 首页今日一行（无记录时） ---------- */
  await send('Page.navigate', { url: BASE + '/index.html' });
  await waitUntil(`typeof window.YZ==='object' && !!window.YZ.loadAll`, 30, 300);
  const todayLine = await waitUntil(`(function(){
    var e = document.getElementById('todayLine');
    if (!e || e.style.display === 'none') return false;
    return { text: e.innerText.replace(/\\n/g,' ').slice(0,90), hasBtn: !!e.querySelector('a') };
  })()`, 30, 300);
  check('④ 首页有「今日」一行', !!todayLine, todayLine ? todayLine.text : '未渲染');
  check('④ 今日一行带可点按钮', !!(todayLine && todayLine.hasBtn));

  /* ---------- ① 点巩固练习直接出题 ---------- */
  await send('Page.navigate', { url: BASE + '/drill.html?n=3' });
  await waitUntil(`typeof window.YZ==='object' && !!window.YZ.loadAll`, 30, 300);
  const autoStarted = await waitUntil(`!!document.querySelector('#stage .se-card')`, 40, 300);
  check('① 打开即出题（无需配置）', !!autoStarted);

  const setupHidden = await ev(`(function(){
    var w = document.getElementById('setupWrap');
    return !w || w.style.display === 'none';
  })()`);
  check('① 配置区默认收起', setupHidden === true);

  /* ---------- ② 三行说明 ---------- */
  const why = await ev(`(function(){
    var w=document.getElementById('whyWhat'), y=document.getElementById('whyWhy'), s=document.getElementById('whyState');
    return { what: w?w.innerText.trim():'', why: y?y.innerText.trim():'', state: s?s.innerText.trim():'' };
  })()`);
  check('② 第一行「练什么」', why.what.length > 2, why.what.slice(0, 50));
  check('② 第二行「为什么」', why.why.length > 5, why.why.slice(0, 50));
  check('② 第三行「状态」', why.state.length > 5, why.state.slice(0, 50));

  /* ---------- ③ 做完一组出诊断 ---------- */
  /* 3 题：第 1 题第 1 步错（制造「卡在第 1 步」），其余全对 */
  await stepThrough(0);
  await sleep(500);
  await stepThrough(-1);
  await sleep(500);
  await stepThrough(-1);
  await sleep(1500);

  const after = await waitUntil(`(function(){
    var box = document.getElementById('diagAfter');
    var card = document.getElementById('diagAfterCard');
    if (!box || box.style.display === 'none') return null;
    if (!card.innerText.trim()) return null;
    return {
      text: card.innerText.replace(/\\n/g, ' ').slice(0, 200),
      hasHead: !!card.querySelector('.da-head'),
      hasWrong: !!card.querySelector('.da-wrong'),
      actions: card.querySelectorAll('.da-actions a, .da-actions button').length
    };
  })()`);
  check('③ 做完一组显示诊断', !!after, after ? after.text.slice(0, 60) : '未显示');
  if (after) {
    check('③ 有「本组 N 题对 M 题」', after.hasHead === true);
    check('③ 有错因归因', after.hasWrong === true, after.text.slice(60, 150));
    check('③ 有下一步动作按钮', after.actions >= 2, after.actions + ' 个');
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== 诊断四点验收：${results.length - failed.length} / ${results.length} 通过 ===`);
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
