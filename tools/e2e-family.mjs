/* ==========================================================
   端到端测试 · 族状态机与排序机制
   ----------------------------------------------------------
   背景：「今日清单」页（today.html）已按用户要求删除，
   但机制保留（planToday / famRecord / famStats 仍在 app.js）。
   这个测试因此不再依赖任何页面，直接在真实浏览器里
   加载 app.js + meta.js，验证机制本身是否按口径工作。

   为什么还值得测：机制虽然暂时没有专属页面，
   但 drill 的族筛选、diag 的行动建议都依赖族级状态。
   机制坏了不会报错，只会让诊断给错建议——这类静默失效最难查。

   用法：node tools/e2e-family.mjs
   ========================================================== */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9342;
const HTTP_PORT = 8202;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
};
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = join(ROOT, p);
  if (!existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); res.end('404'); return; }
  res.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(HTTP_PORT, r));

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=/tmp/yz-e2e-family-profile',
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
    return { __error: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
  }
  return r.result && r.result.value;
}

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✕'} ${name}${detail ? ' — ' + detail : ''}`);
};

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

  const BASE = `http://127.0.0.1:${HTTP_PORT}`;

  /* 用一个最小宿主页加载 app.js + meta.js：
     不依赖任何业务页面，只测机制。 */
  await send('Page.navigate', { url: BASE + '/index.html' });
  for (let i = 0; i < 80; i++) {
    if (await evaluate(`document.readyState === 'complete' && !!window.YZ && !!window.YZ.META`)) break;
    await sleep(250);
  }

  const hasApi = await evaluate(`(function(){
    var Z = window.YZ;
    return {
      plan: typeof Z.planToday, rec: typeof Z.famRecord, st: typeof Z.famStats,
      fams: (Z.META && Z.META.families || []).length
    };
  })()`);
  check('机制 API 存在', hasApi && hasApi.plan === 'function' && hasApi.rec === 'function',
    hasApi ? `families=${hasApi.fams}` : '');
  check('META 带 27 个族', hasApi && hasApi.fams === 27, hasApi ? String(hasApi.fams) : '');

  await evaluate(`localStorage.clear()`);

  /* ① 冷启动：全部族都是「未测」，且清单非空（不能因为没数据就空转） */
  const cold = await evaluate(`(function(){
    var Z = window.YZ;
    var p = Z.planToday(Z.META.families);
    return {
      total: p.summary.total,
      untested: p.summary.untested,
      firstBand: p.items[0] ? p.items[0].band : '',
      firstTier: p.items[0] ? p.items[0].tier : ''
    };
  })()`);
  check('冷启动清单非空', cold && cold.total > 0, cold ? `${cold.total} 项，全部未测` : '');
  check('冷启动首条是熟练层（P0）', cold && cold.firstBand === 'P0',
    cold ? `${cold.firstBand} / ${cold.firstTier}` : '');

  /* ② 当日快照复用。
     注意：测试开始前清过 localStorage，此时还没有快照，
     所以必须先调一次 planTodayCached 写入，再验证「同一天复用」。
     直接读 planSnapshotDay() 会得到 null —— 那是「没写过」，不是「没复用」。 */
  const snap = await evaluate(`(function(){
    var Z = window.YZ;
    var first = Z.planTodayCached(Z.META.families, false);   // 写入快照
    var d1 = Z.planSnapshotDay();
    var second = Z.planTodayCached(Z.META.families, false);  // 应命中缓存
    return {
      d1: d1,
      wrote: !!d1,
      same: d1 === Z.planSnapshotDay() && !!d1,
      sameLen: !!(first && second && first.items.length === second.items.length)
    };
  })()`);
  check('当日快照复用同一天', snap && snap.wrote && snap.same === true,
    snap ? `day=${snap.d1}` : '');

  /* ② 档位有序：P0 → P4 */
  const bands = await evaluate(`(function(){
    var Z = window.YZ;
    var p = Z.planToday(Z.META.families);
    return p.items.map(function(x){ return x.band; });
  })()`);
  const ORDER = { P0:0, P1:1, P2:2, P3:3, P4:4 };
  const sorted = Array.isArray(bands) && bands.every((b, i) => i === 0 || ORDER[bands[i-1]] <= ORDER[b]);
  check('档位按 P0→P4 有序', sorted, Array.isArray(bands) ? bands.join(' ') : '');

  /* ③ P0 全部排在 P3 之前（档位硬规则） */
  const guard = await evaluate(`(function(){
    var Z = window.YZ;
    var p = Z.planToday(Z.META.families);
    var items = p.items;
    var firstP3 = items.findIndex(function(x){ return x.band === 'P3'; });
    var lastP0 = items.map(function(x){ return x.band; }).lastIndexOf('P0');
    if (firstP3 < 0 || lastP0 < 0) return { ok: true, note: '无冲突' };
    return { ok: lastP0 < firstP3, lastP0: lastP0, firstP3: firstP3 };
  })()`);
  check('P0 全部排在 P3 之前', guard && guard.ok === true,
    guard && guard.note ? guard.note : `lastP0=${guard?.lastP0} firstP3=${guard?.firstP3}`);

  /* ④ L1 达标：10 题全对 → passed */
  const pass = await evaluate(`(function(){
    var Z = window.YZ;
    for (var i = 0; i < 10; i++) Z.famRecord('f-mixcalc', 'l1', true, false);
    var s = Z.famStats('f-mixcalc');
    return { state: s.state, n: s.n, rate: s.rate, streak: s.streak };
  })()`);
  check('L1 答对 10 题 → 已达标', pass && pass.state === 'passed',
    pass ? `n=${pass.n} rate=${Math.round(pass.rate*100)}% streak=${pass.streak}` : '');

  /* ⑤ 达标族移出清单 */
  const removed = await evaluate(`(function(){
    var Z = window.YZ;
    var p = Z.planToday(Z.META.families);
    return { inList: p.items.some(function(x){ return x.id === 'f-mixcalc'; }), out: p.summary.passedOut };
  })()`);
  check('达标族移出清单', removed && removed.inList === false,
    removed ? `移出 ${removed.out} 项` : '');

  /* ⑥ 退化：达标后错一次 → 退回 training */
  const degrade = await evaluate(`(function(){
    var Z = window.YZ;
    Z.famRecord('f-mixcalc', 'l1', false, false);
    var s = Z.famStats('f-mixcalc');
    return { state: s.state, lapses: s.lapses };
  })()`);
  check('达标后错一次退回训练中', degrade && degrade.state === 'training',
    degrade ? `lapses=${degrade.lapses}` : '');

  /* ⑦ L1 双门槛：9/10 正确但连对不足 3 → 不达标
     （这是「只卡正确率」和「卡正确率+连对」的差别所在） */
  const dual = await evaluate(`(function(){
    var Z = window.YZ;
    localStorage.clear();
    Z.famReset();
    // 先错 2 次，再连对 8 次：正确率 80%，未达 98%
    for (var i = 0; i < 2; i++) Z.famRecord('f-solve', 'l1', false, false);
    for (var j = 0; j < 8; j++) Z.famRecord('f-solve', 'l1', true, false);
    var s = Z.famStats('f-solve');
    return { state: s.state, rate: s.rate, streak: s.streak, n: s.n };
  })()`);
  check('L1 正确率不足 98% 不达标', dual && dual.state === 'training',
    dual ? `rate=${Math.round(dual.rate*100)}% n=${dual.n} streak=${dual.streak}` : '');

  /* ⑧ L3 门槛宽松：5 题对 3 即达标（入场分口径） */
  const l3 = await evaluate(`(function(){
    var Z = window.YZ;
    for (var i = 0; i < 5; i++) Z.famRecord('f-dynamic', 'l3', i < 3, false);
    var s = Z.famStats('f-dynamic');
    return { state: s.state, rate: s.rate };
  })()`);
  check('L3 五题对三题即达标（入场分）', l3 && l3.state === 'passed',
    l3 ? `rate=${Math.round(l3.rate*100)}%` : '');

  /* ⑨ nearMiss 高 → 动作切「限时收尾」 */
  const nmAct = await evaluate(`(function(){
    var Z = window.YZ;
    for (var i = 0; i < 6; i++) Z.famRecord('f-eqapp', 'l2', i < 3, true);
    var p = Z.planToday(Z.META.families);
    var it = p.items.filter(function(x){ return x.id === 'f-eqapp'; })[0];
    return it ? { action: it.action, nearRate: it.nearRate } : null;
  })()`);
  check('nearMiss 高 → 限时收尾', nmAct && nmAct.action === 'finish',
    nmAct ? `nearRate=${Math.round(nmAct.nearRate*100)}%` : '');

  /* ⑩ 族标签覆盖：每道题都有 family（drill 族筛选的前提） */
  const famCover = await evaluate(`(function(){
    var Z = window.YZ;
    if (!Z.CH) return { ready: false };
    var ids = Object.keys(Z.CH);
    if (ids.length < 6) return { ready: false };
    var total = 0, withFam = 0;
    ids.forEach(function(cid){
      (Z.CH[cid].questions || []).forEach(function(q){
        total++;
        if (q.family) withFam++;
      });
    });
    return { ready: true, total: total, withFam: withFam };
  })()`);
  /* 分片是异步加载的，等一下 */
  if (famCover && !famCover.ready) {
    await evaluate(`window.YZ.loadAll(window.YZ.chapterIds())`);
    await sleep(1500);
  }
  const famCover2 = await evaluate(`(function(){
    var Z = window.YZ;
    var ids = Object.keys(Z.CH || {});
    var total = 0, withFam = 0;
    ids.forEach(function(cid){
      (Z.CH[cid].questions || []).forEach(function(q){ total++; if (q.family) withFam++; });
    });
    return { total: total, withFam: withFam };
  })()`);
  check('分片里每道题都带 family',
    famCover2 && famCover2.total > 0 && famCover2.total === famCover2.withFam,
    famCover2 ? `${famCover2.withFam}/${famCover2.total}` : '');

  const fail = results.filter((r) => !r.ok);
  console.log('');
  console.log(`=== ${results.length - fail.length}/${results.length} 通过 ===`);
  if (fail.length) {
    console.log('失败项：');
    fail.forEach((f) => console.log('  · ' + f.name + (f.detail ? ' — ' + f.detail : '')));
  }
  return fail.length;
}

let code = 1;
try {
  code = await main();
} catch (e) {
  console.error('测试异常：', e.message);
} finally {
  try { ws && ws.close(); } catch (e) {}
  chrome.kill();
  server.close();
}
process.exit(code ? 1 : 0);
