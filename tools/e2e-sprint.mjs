/* ==========================================================
   端到端验收 · 10 天冲刺逻辑（2026-11-25 建）

   验的是这一轮改动的四件事，每件都必须落到「浏览器里真实发生了」：
     ① 冲刺页渲染出 10 天，第 1 天显示题数
     ② 点第 1 天能出题（?day=1），题数 = 计划里的题数
     ③ 选择题答错 → 解析当场展开（不是折叠的 <details>）
     ④ 答错后错题本里有这道题，且带「为什么」和「易错」

   为什么单独一个脚本而不是塞进 e2e.mjs：
     e2e.mjs 里锁着大量旧页面断言（today/calc/concept 等），
     那些页面已从构建移除，改它会连带删掉历史覆盖。
     新逻辑的验收写在这里，独立可跑。

   用法：node tools/e2e-sprint.mjs
   ========================================================== */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { existsSync } from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9337;
const URL_BASE = process.env.BASE || 'http://127.0.0.1:8199';

if (!existsSync(CHROME)) {
  console.error('找不到 Chrome：' + CHROME);
  process.exit(2);
}

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=/tmp/yz-e2e-sprint-profile',
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
  throw new Error('连不上 Chrome');
}

function send(method, params = {}) {
  const id = ++msgId;
  return new Promise((res, rej) => {
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expr) {
  const r = await send('Runtime.evaluate', {
    expression: expr, returnByValue: true, awaitPromise: true,
  });
  if (r.exceptionDetails) {
    throw new Error('页面异常：' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  }
  return r.result?.value;
}

async function goto(path) {
  await send('Page.navigate', { url: URL_BASE + path });
  await sleep(900);
  /* 等分片加载完：META 与 CH 都就位 */
  for (let i = 0; i < 30; i++) {
    const ok = await evaluate(`!!(window.YZ && window.YZ.META && window.YZ.META.sprint && window.YZ.CH && Object.keys(window.YZ.CH).length)`);
    if (ok) return;
    await sleep(200);
  }
}

let pass = 0, fail = 0;
const fails = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; fails.push(name + (detail ? ' — ' + detail : '')); console.log('  ✕ ' + name + (detail ? ' — ' + detail : '')); }
}

async function main() {
  const wsUrl = await connect();
  ws = new WebSocket(wsUrl);
  await new Promise((r) => { ws.addEventListener('open', r); });
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) rej(new Error(m.error.message)); else res(m.result);
    }
  });
  await send('Page.enable');
  await send('Runtime.enable');

  /* 每轮从干净的 localStorage 开始，否则上一轮的完成度会影响断言 */
  await send('Page.navigate', { url: URL_BASE + '/index.html' });
  await sleep(600);
  await evaluate('try{localStorage.clear()}catch(e){}');

  /* ==================== ① 冲刺页 ==================== */
  console.log('\n① 冲刺页渲染');
  await goto('/sprint.html');
  const dayCount = await evaluate(`document.querySelectorAll('.sprint-day').length`);
  check('渲染出 10 天', dayCount === 10, '实际 ' + dayCount);

  const meta = await evaluate(`(function(){
    var D = window.YZ.META.sprint;
    return D.map(function(d){ return { day:d.day, n:(d.ids||[]).length, kind:d.kind }; });
  })()`);
  check('计划里第 1 天有题', meta[0].n > 0, '题数 ' + meta[0].n);
  check('计划共 10 天', meta.length === 10, '实际 ' + meta.length);

  /* 第 1 天卡片的题数文字要和计划一致 */
  const firstState = await evaluate(`(function(){
    var el = document.querySelector('.sprint-day[data-day="1"] .sd-state');
    return el ? el.textContent : '';
  })()`);
  check('第 1 天显示题数', firstState.indexOf(String(meta[0].n)) >= 0,
    '卡片显示「' + firstState + '」，计划 ' + meta[0].n + ' 题');

  /* 顶部「下一个任务」应指向第 1 天 */
  const nextTxt = await evaluate(`(function(){
    var el = document.querySelector('.sprint-next-t');
    return el ? el.textContent : '';
  })()`);
  check('顶部指向第 1 天', nextTxt.indexOf('第 1 天') >= 0, '实际「' + nextTxt + '」');

  /* ==================== ② 按天出题 ==================== */
  console.log('\n② 按天出题（?day=1）');
  await goto('/drill.html?day=1&autostart=1');
  await sleep(1200);

  const stageInfo = await evaluate(`(function(){
    var card = document.querySelector('.se-card');
    if (!card) return { ok:false };
    return { ok:true, hasOpts: !!document.querySelector('.se-opt') };
  })()`);
  check('出题成功', stageInfo.ok === true, '找不到 .se-card');
  check('第 1 天是选择题', stageInfo.hasOpts === true, '找不到 .se-opt');

  /* 三道说明里应写着「第 1 天」 */
  const whyWhat = await evaluate(`(function(){
    var el = document.getElementById('whyWhat');
    return el ? el.textContent : '';
  })()`);
  check('三行说明显示当天任务', whyWhat.indexOf('第 1 天') >= 0, '实际「' + whyWhat + '」');

  /* ==================== ③ 答错展开解析 ==================== */
  console.log('\n③ 选择题答错 → 解析当场展开');

  /* 故意选一个错的选项：先读正确答案，再挑一个不同的 */
  const picked = await evaluate(`(function(){
    var q = window.__curQ || (window.YZ && window.YZ.__curQ);
    /* 从 DOM 里找正确项：引擎把正确项在答完后才加 .right，
       所以这里从题目数据取。题目对象挂在 stage 上不一定可达，
       改用「点第一个选项，然后看是否被判错」——若对了就换下一个。 */
    var btns = document.querySelectorAll('.se-opt');
    if (!btns.length) return { err:'没有选项' };
    return { n: btns.length };
  })()`);
  check('选项数 ≥2', picked.n >= 2, JSON.stringify(picked));

  /* 逐个试：点到被判错为止。
     答对时要推两步才到下一题：.se-next（看结果）→ .se-go（下一题）。
     只点 .se-next 会停在「本题完成」卡片上，下一轮就找不到选项了
     ——第一次跑这个测试就栽在这里，误判成「功能坏了」。 */
  const wrongRes = await evaluate(`(function(){
    var log = [];
    for (var round = 0; round < 10; round++) {
      var btns = document.querySelectorAll('.se-opt');
      if (!btns.length) { log.push('第' + round + '轮：没有选项'); break; }
      var advanced = false;
      for (var i = 0; i < btns.length; i++) {
        var b = document.querySelectorAll('.se-opt')[i];
        if (!b || b.classList.contains('locked')) continue;
        b.click();
        var fb = document.querySelector('.se-fb');
        var cls = fb ? fb.className : '';
        if (cls.indexOf('bad') >= 0) {
          /* 先把「答错瞬间」的现场抓下来（解析是否展开在这里判定），
             再点 .se-next 推进——错题记录是在 guidedDone → completeQuestion
             里写进 localStorage 的，不推进就不会留下记录。
             这不是产品缺陷：学生看完解析自然会点下一题。 */
          var snap = {
            wrongIndex: i, round: round, fbClass: cls,
            hasSolbox: !!fb.querySelector('.se-solbox'),
            hasPit: !!fb.querySelector('.se-pit-box'),
            solText: (fb.querySelector('.se-solbox') ? fb.querySelector('.se-solbox').innerText : '').slice(0, 80),
            svgInSol: fb.querySelectorAll('.se-solbox svg').length,
            detailOpen: !!fb.querySelector('details[open]'),
            detailCount: fb.querySelectorAll('details').length,
            log: log,
          };
          var nx2 = document.querySelector('.se-next');
          if (nx2) nx2.click();
          var go2 = document.querySelector('.se-go');
          if (go2) go2.click();
          snap.afterAdvance = !!document.querySelector('.se-opt, .se-done-card, .se-rate');
          return snap;
        }
        if (cls.indexOf('ok') >= 0) {
          log.push('第' + round + '轮 选 ' + i + ' 对了，推进');
          var nx = document.querySelector('.se-next');
          if (nx) nx.click();
          var go = document.querySelector('.se-go');
          if (go) go.click();
          advanced = true;
          break;
        }
      }
      if (!advanced) { log.push('第' + round + '轮：无按钮可点'); break; }
    }
    return { exhausted: true, log: log };
  })()`);

  if (wrongRes && wrongRes.wrongIndex != null) {
    check('答错被判为错', wrongRes.fbClass.indexOf('bad') >= 0, wrongRes.fbClass);
    check('答错后解析块出现（.se-solbox）', wrongRes.hasSolbox === true,
      '没找到 .se-solbox');
    check('解析不是折叠的（没有 details）', wrongRes.detailCount === 0,
      '发现 ' + wrongRes.detailCount + ' 个 details');
    check('解析有内容', (wrongRes.solText || '').length > 10,
      '内容「' + (wrongRes.solText || '') + '」');
    check('「易错」也出现（.se-pit-box）', wrongRes.hasPit === true,
      '没找到 .se-pit-box');
  } else {
    check('找到一道能答错的题', false, JSON.stringify(wrongRes));
  }

  /* ==================== ④ 错题本带解析 ==================== */
  console.log('\n④ 错题本带解析');
  const wrongCount = await evaluate(`(function(){
    var log = window.YZ.qLog ? window.YZ.qLog() : {};
    return Object.keys(log.wrong || {}).length;
  })()`);
  check('错题已记录', wrongCount > 0, '错题数 ' + wrongCount);

  await goto('/wrong.html');
  await sleep(900);
  const wbInfo = await evaluate(`(function(){
    var items = document.querySelectorAll('.wb-item');
    if (!items.length) return { n:0 };
    var first = items[0];
    return {
      n: items.length,
      hasStem: !!first.querySelector('.wb-stem'),
      hasAns: !!first.querySelector('.wb-ans'),
      hasSolOpen: !!first.querySelector('.wb-sol-open'),
      hasPit: !!first.querySelector('.wb-pit'),
      solText: (first.querySelector('.wb-sol-open') ? first.querySelector('.wb-sol-open').innerText : '').slice(0, 60),
      detailsCount: first.querySelectorAll('details').length,
    };
  })()`);
  check('错题本列出条目', wbInfo.n > 0, '条目数 ' + wbInfo.n);
  check('有题干', wbInfo.hasStem === true);
  check('有正确答案', wbInfo.hasAns === true);
  check('解析默认展开（.wb-sol-open）', wbInfo.hasSolOpen === true,
    '发现 ' + wbInfo.detailsCount + ' 个 details（说明还在用折叠）');
  check('解析有内容', (wbInfo.solText || '').length > 10, '内容「' + (wbInfo.solText || '') + '」');
  check('有「易错」', wbInfo.hasPit === true);

  /* ==================== ⑤ 诊断页读错题 ==================== */
  console.log('\n⑤ 诊断页基于错题');
  await goto('/diag.html');
  await sleep(1200);
  const diagInfo = await evaluate(`(function(){
    return {
      hasErrVerdict: !!document.querySelector('.err-verdict'),
      groups: document.querySelectorAll('.wd-group').length,
      items: document.querySelectorAll('.wd-item').length,
      hasSol: !!document.querySelector('.wd-sol'),
      hasPit: !!document.querySelector('.wd-pit'),
      hasAction: !!document.querySelector('.wd-foot .btn'),
    };
  })()`);
  check('有错因结论', diagInfo.hasErrVerdict === true);
  check('错题按错因分组', diagInfo.groups > 0, '组数 ' + diagInfo.groups);
  check('列出具体错题', diagInfo.items > 0, '题数 ' + diagInfo.items);
  check('错题带解析', diagInfo.hasSol === true);
  check('错题带易错', diagInfo.hasPit === true);
  check('每组有下一步动作', diagInfo.hasAction === true);

  /* ==================== ⑥ 完成度回写 ==================== */
  console.log('\n⑥ 冲刺页完成度回写');
  await goto('/sprint.html');
  const doneAfter = await evaluate(`(function(){
    var bar = document.querySelector('.sprint-bar-meta');
    var d1 = document.querySelector('.sprint-day[data-day="1"]');
    return {
      barText: bar ? bar.textContent : '',
      d1State: d1 ? d1.querySelector('.sd-state').textContent : '',
      d1Cls: d1 ? d1.className : '',
    };
  })()`);
  check('进度条显示已作答数', /[1-9]\d*\s*\/\s*\d+/.test(doneAfter.barText),
    '实际「' + doneAfter.barText + '」');
  check('第 1 天进入「进行中」或「完成」',
    doneAfter.d1Cls.indexOf('doing') >= 0 || doneAfter.d1Cls.indexOf('done') >= 0,
    'class = ' + doneAfter.d1Cls);

  /* ==================== 汇总 ==================== */
  console.log('\n=== 结果 ===');
  console.log('  通过 ' + pass + ' / ' + (pass + fail));
  if (fail) {
    console.log('\n  失败项：');
    fails.forEach((f) => console.log('   · ' + f));
  }
  process.exitCode = fail ? 1 : 0;
}

main()
  .catch((e) => { console.error('测试崩溃：', e.message); process.exitCode = 2; })
  .finally(() => { try { chrome.kill(); } catch (x) {} });
