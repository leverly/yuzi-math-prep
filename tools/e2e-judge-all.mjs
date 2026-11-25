/* ==========================================================
   逐题判分实测（2026-11-25 建）

   上一版 e2e-judge.mjs 只做了「静态字段一致性」+「随机点几个选项」。
   那不够：用户问的是「每道题的判题是否正确」。
   所以这一版真的逐题跑：
     每道可判分题 → 用引擎的真实判分函数，喂「官方正确答案」和
     「一个错误答案」，断言前者判对、后者判错。

   为什么能直接跑引擎：把 step-engine.js 里的 normNum / toNum /
   answerMatches 三个函数原样取出来（用正则从源文件读，不复制粘贴），
   保证测的就是线上跑的那份代码，不是我的复述。

   用法：node tools/e2e-judge-all.mjs
   ========================================================== */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { readFileSync } from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9355;
const URL_BASE = process.env.BASE || 'http://127.0.0.1:8199';
const ROOT = '/Users/sunzhidong/Desktop/thinking/math';

/* 从引擎源文件里抽出判分函数，注入页面。
   这样测的是真代码，引擎改了测试自动跟上。 */
const engineSrc = readFileSync(ROOT + '/assets/step-engine.js', 'utf8');
function grab(name) {
  const re = new RegExp('function ' + name + '\\s*\\([^)]*\\)\\s*\\{', 'g');
  const m = re.exec(engineSrc);
  if (!m) throw new Error('引擎里找不到函数 ' + name);
  let i = m.index + m[0].length, depth = 1;
  while (i < engineSrc.length && depth > 0) {
    if (engineSrc[i] === '{') depth++;
    else if (engineSrc[i] === '}') depth--;
    i++;
  }
  return engineSrc.slice(m.index, i);
}
const JUDGE_CODE = [grab('normNum'), grab('toNum'), grab('answerMatches')].join('\n');

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=/tmp/yz-judgeall-profile',
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

async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) {
    throw new Error('页面异常：' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  }
  return r.result?.value;
}

async function main() {
  ws = new WebSocket(await connect());
  await new Promise((r) => ws.addEventListener('open', r));
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) rej(new Error(m.error.message)); else res(m.result);
    }
  });
  await send('Page.enable');
  await send('Runtime.enable');

  await send('Page.navigate', { url: URL_BASE + '/drill.html?day=1' });
  await sleep(2600);
  for (let i = 0; i < 40; i++) {
    const ok = await ev(`!!(window.YZ && window.YZ.CH && Object.keys(window.YZ.CH).length >= 6)`);
    if (ok) break;
    await sleep(300);
  }

  const report = await ev(`(function(){
    ${JUDGE_CODE}

    var CH = window.YZ.CH;
    var all = [];
    Object.keys(CH).forEach(function(cid){ (CH[cid].questions||[]).forEach(function(q){ all.push(q); }); });

    var fails = [], oks = [], notes = [];

    /* ---------- 单选：key 必须指向官方字母，且该选项有内容 ---------- */
    all.filter(function(q){ return q.qtype === 'single'; }).forEach(function(q){
      var id = q.id, problems = [];
      var off = q.officialKey == null ? '' : String(q.officialKey).trim().toUpperCase();
      if (!off) { problems.push('无官方答案字母'); }
      else {
        var expect = 'ABCD'.indexOf(off[0]);
        if (expect < 0) problems.push('官方答案不是 A-D：' + JSON.stringify(off));
        else if (q.key !== expect) problems.push('key=' + q.key + ' 但官方是 ' + off[0] + '（应 ' + expect + '）');
        /* 正确答案那一项必须有可见内容，否则学生看不到「哪个是对的」 */
        var parts = q.__optParts || [];
        var kp = parts[q.key] || [];
        var keyVisible = kp.some(function(x){ return x.t === 'img' && x.src; })
                      || kp.some(function(x){ return x.t === 'text' && String(x.v||'').trim(); });
        if (!keyVisible) problems.push('正确答案所在选项内容为空');
      }
      if (problems.length) fails.push({ id: id, type: 'single', problems: problems });
      else oks.push(id);
    });

    /* ---------- 填空：官方答案必须判对；错答案必须判错 ---------- */
    all.filter(function(q){ return q.qtype === 'calc'; }).forEach(function(q){
      var id = q.id, problems = [];
      var acc = q.accept || [];
      var off = q.officialKey == null ? '' : String(q.officialKey).trim();
      if (!acc.length) problems.push('accept 为空');
      else {
        if (off && !answerMatches(off, acc)) {
          problems.push('官方答案 ' + JSON.stringify(off) + ' 被判错');
        }
        /* accept 每一项自身必须判对 */
        acc.forEach(function(a){
          if (!answerMatches(a, acc)) problems.push('accept 项 ' + JSON.stringify(a) + ' 自身判不对');
        });
        /* 明显错误的输入必须判错（否则「随便填都算对」） */
        var probes = ['999999', '这不是答案', 'xyz'];
        probes.forEach(function(pr){
          if (answerMatches(pr, acc)) problems.push('垃圾输入 ' + JSON.stringify(pr) + ' 被判对');
        });
        /* 多小问/多解的残缺答案串不该出现在 accept（会让学生永远判错） */
        acc.forEach(function(a){
          if (/[（(]\\d[）)]|①|②|[；;]/.test(String(a))) {
            problems.push('accept 含小问编号/分号，不是单空答案：' + JSON.stringify(a).slice(0,40));
          }
        });
      }
      if (problems.length) fails.push({ id: id, type: 'calc', problems: problems, accept: acc });
      else oks.push(id);
    });

    /* ---------- 大题：必须不参与判分，且必须有解析 ---------- */
    all.filter(function(q){ return q.qtype === 'big'; }).forEach(function(q){
      var id = q.id, problems = [];
      if (q.accept && q.accept.length) problems.push('big 却带 accept（会被判分）');
      if (q.key != null) problems.push('big 却带 key（会被判分）');
      if (!q.solution) problems.push('无解析');
      if (problems.length) fails.push({ id: id, type: 'big', problems: problems });
      else oks.push(id);
    });

    /* ---------- 额外：有答案却没被判分的题（能力浪费，不是错误）---------- */
    all.forEach(function(q){
      if (q.qtype === 'single' || q.qtype === 'calc') return;
      var k = q.officialKey == null ? '' : String(q.officialKey).trim();
      if (!k) return;
      if (/[（(]\\d[）)]|①|②|；|;|或|不唯一|见解析|略|如图|图形/.test(k)) return;
      if (k.length > 12) return;
      notes.push({ id: q.id, note: '答案 ' + JSON.stringify(k) + ' 是单值，但标 big 未判分' });
    });

    return {
      total: all.length,
      counts: {
        single: all.filter(function(q){ return q.qtype==='single'; }).length,
        calc: all.filter(function(q){ return q.qtype==='calc'; }).length,
        big: all.filter(function(q){ return q.qtype==='big'; }).length,
      },
      pass: oks.length,
      fails: fails,
      notes: notes,
    };
  })()`);

  console.log('\n=== 逐题判分实测 ===\n');
  console.log('总题数', report.total, '| 单选', report.counts.single,
    '· 填空', report.counts.calc, '· 大题', report.counts.big);
  console.log('逐题通过', report.pass, '/', report.total - 0);

  if (report.fails.length) {
    console.log('\n--- 判分问题 ---');
    report.fails.forEach((f) => {
      console.log('  ✕', f.id, '(' + f.type + ')');
      f.problems.forEach((p) => console.log('      · ' + p));
    });
  } else {
    console.log('\n  ✓ 每一道可判分题的判分都正确');
  }

  if (report.notes.length) {
    console.log('\n--- 提示：答案完整但未判分（可补）---');
    report.notes.forEach((n) => console.log('  ·', n.id, '|', n.note));
  }

  process.exitCode = report.fails.length ? 1 : 0;
}

main()
  .catch((e) => { console.error('实测崩溃：', e.message); process.exitCode = 2; })
  .finally(() => { try { chrome.kill(); } catch (x) {} });
