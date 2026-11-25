
import { BANK, FAM_META } from './practice-data.mjs';

/* ============ 诊断逻辑（与 work/practice/diagnose.mjs 同源，内联以便单文件运行） ============ */
const TIER_RULE = { minSample: 3, weak: 0.6, solid: 0.85 };

const CALC_HINTS = {
  'f-arith': '① 乘方的底数是谁（−2² 与 (−2)² 不同）　② 除法变乘法时倒数有没有取　③ 分配律是否漏乘',
  'f-solveeq': '① 去分母时常数项有没有也乘　② 去括号的符号　③ 移项是否变号　④ 系数化 1 时符号',
  'f-simplify': '① 去括号符号（尤其括号前是负号）　② 合并时字母和指数是否真的相同　③ 代值时负数有没有加括号',
  'f-exprval': '① 是不是把式子整体看成了一个字母　② 系数有没有提对　③ 符号',
  'f-angleconv': '① 60 进制（不是 100 进制）　② 大单位换小单位是乘还是除',
  'f-segmid': '① 中点是不是把线段平分　② 线段和差的加减方向　③ 有没有漏掉另一种位置情况',
  'f-anglesum': '① 角的和差是加还是减　② 平分线把角分成相等的两份　③ 度分秒的进位',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* 把 {a/b} 渲染成竖式分数（先转义，再替换标记） */
function mathText(raw) {
  let t = esc(raw);
  const fracHtml = (n, d) => {
    const num = n.replace('−', '-');
    const neg = num.startsWith('-');
    // 负号不放进分子，由 .frac-neg::before 画在分数线左侧，避免与分数线混淆
    return '<span class="frac' + (neg ? ' frac-neg' : '') + '">' +
      '<span class="fn">' + (neg ? num.slice(1) : num) + '</span>' +
      '<span class="fd">' + d + '</span></span>';
  };
  // 1) 花括号标记 {a/b}
  t = t.replace(/\{([−-]?\d+)\/(\d+)\}/g, (_, n, d) => fracHtml(n, d));
  // 2) 整段就是一个分数（选项里常见 -15/2）：直接渲染竖式，
  //    避免学生把它读成带分数或「−15 除以 2」
  t = t.replace(/^([−-]?\d+)\/(\d+)$/, (_, n, d) => fracHtml(n, d));
  return t;
}

const ERR_FIX = {
  '符号错误': '把这一步单独抄出来重做，先标符号再算数值',
  '概念混淆': '回到定义本身：相反数 / 倒数 / 绝对值分别是什么',
  '概念不清': '回到定义本身，用自己的话复述一遍再做题',
  '概念反向': '注意条件的方向，把「成立」和「不成立」各举一个例子',
  '计算错误': '放慢速度，把中间步骤写出来，不要跳步',
  '合并同类项': '先圈出同类项，再动笔合并',
  '不是同类项': '合并前先问：字母相同吗？指数相同吗？',
  '去括号符号': '括号前是负号时，逐项变号，写全不省略',
  '分配律漏乘': '括号外的数要乘遍括号内每一项',
  '移项符号': '移项必须变号，跨过等号就换符号',
  '系数化 1': '两边同除以系数，注意除数不能是 0',
  '大小比较': '负数比大小看绝对值，绝对值大的反而小',
  '指数错误': '科学记数法：10 的指数 = 整数位数 − 1',
  '形式错误': '科学记数法要求 a 在 [1,10) 之间',
  '精确位错误': '先数清「精确到哪一位」，再决定保留几位小数',
  '取舍方向': '看精确位的下一位，满 5 进 1',
  '关系搞反': '把「谁比谁多/少」写成等式前，先代一个小数字验一遍',
  '空间想象': '动手画一画展开图，或用纸折一次',
  '规律误判': '先算相邻两项的差，确认是不是等差再写通项',
  '常数项': '用 n=1 代入检验，结果应等于第 1 项',
  '公差': '公差 = 后项 − 前项，先算准再写式子',
  '条件误读': '把题目条件逐条列出来，划掉用不上的',
  '符号判断': '异号两数相加，符号跟绝对值大的那个走',
  '不完整': '注意边界情况（如 0）是否也满足条件',
  '方程列错': '设未知数后，先用文字写清等量关系再翻译成式子',
  '求成了补角': '算完回看题目问的是「这个角」还是「它的补角」',
  '未作取舍': '近似数必须按要求的位数取舍',
};

function parseErrTag(tag) {
  if (!tag) return null;
  const i = tag.indexOf('：');
  const cat = i > 0 ? tag.slice(0, i) : tag;
  return { cat, fix: ERR_FIX[cat] || null };
}

function diagnose(records) {
  const byId = new Map(BANK.map(q => [q.id, q]));
  const agg = new Map();

  for (const r of records) {
    const q = byId.get(r.id);
    if (!q) continue;
    if (!agg.has(q.fam)) agg.set(q.fam, { fam: q.fam, total: 0, ok: 0, wrong: [] });
    const a = agg.get(q.fam);
    a.total++;
    if (r.ok) a.ok++;
    else {
      let errCat = null;
      if (q.options && typeof r.picked === 'number' && q.options[r.picked]) {
        const p = parseErrTag(q.options[r.picked].errTag);
        if (p) errCat = p.cat;
      }
      a.wrong.push({ id: q.id, stem: q.stem, errCat });
    }
  }

  const fams = [...agg.values()].map(a => {
    const rate = a.total ? a.ok / a.total : 0;
    const enough = a.total >= TIER_RULE.minSample;
    let tier = !enough ? 'insufficient'
      : rate < TIER_RULE.weak ? 'weak'
      : rate < TIER_RULE.solid ? 'shaky' : 'solid';
    const errMix = {};
    for (const w of a.wrong) if (w.errCat) errMix[w.errCat] = (errMix[w.errCat] || 0) + 1;
    const top = Object.entries(errMix).sort((x, y) => y[1] - x[1])[0];
    const meta = FAM_META[a.fam] || {};
    return {
      fam: a.fam, name: meta.name || a.fam, avg: meta.avgPerYear || 1,
      total: a.total, ok: a.ok, rate, tier, enough,
      topErr: top ? { cat: top[0], fix: ERR_FIX[top[0]] } : null,
      priority: (meta.avgPerYear || 1) * (1 - rate) * (enough ? 1 : 0.3),
    };
  });

  const order = { weak: 0, shaky: 1, insufficient: 2, solid: 3 };
  fams.sort((a, b) => order[a.tier] - order[b.tier] || b.priority - a.priority);

  const actions = [];
  for (const f of fams) {
    if (f.tier === 'solid') continue;
    if (f.tier === 'insufficient') {
      actions.push({ kind: 'need-more', fam: f.fam, text: `「${f.name}」只做了 ${f.total} 题，样本不够判断。再做几题看看。` });
      continue;
    }
    const pct = Math.round(f.rate * 100);
    let text;
    if (f.topErr) {
      text = `「${f.name}」正确率 ${pct}%，主要错在「${f.topErr.cat}」——${f.topErr.fix || '回看这几题的解析。'}`;
    } else if (CALC_HINTS[f.fam]) {
      text = `「${f.name}」正确率 ${pct}%，逐一排查这几处：${CALC_HINTS[f.fam]}`;
    } else {
      text = `「${f.name}」正确率 ${pct}%，回看这几题的解析，找出错在哪一步。`;
    }
    actions.push({ kind: f.tier, fam: f.fam, text });
  }

  const totalQ = fams.reduce((a, f) => a + f.total, 0);
  const totalOk = fams.reduce((a, f) => a + f.ok, 0);
  return {
    totalQ, totalOk, rate: totalQ ? totalOk / totalQ : 0,
    fams, actions: actions.slice(0, 6),
    weak: fams.filter(f => f.tier === 'weak').length,
    shaky: fams.filter(f => f.tier === 'shaky').length,
    solid: fams.filter(f => f.tier === 'solid').length,
  };
}

/* ============ 判分 ============ */
function parseNumber(s) {
  if (s == null) return null;
  let t = String(s).trim().replace(/[−–—]/g, '-').replace(/[，,]/g, '').replace(/\s+/g, '');
  if (!t) return null;
  const frac = /^(-?\d+)\/(\d+)$/.exec(t);
  if (frac) { const d = +frac[2]; return d === 0 ? null : +frac[1] / d; }
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  return parseFloat(t);
}

function judge(q, input) {
  if (q.options) {
    const picked = typeof input === 'number' ? input : parseInt(input, 10);
    if (!(picked >= 0 && picked < q.options.length)) return { invalid: true };
    return { ok: picked === q.key, picked };
  }
  const v = parseNumber(input);
  if (v === null || q.answer === undefined) return { invalid: true };
  const isInt = Number.isInteger(q.answer);
  const isShort = Math.abs(q.answer * 1000 - Math.round(q.answer * 1000)) < 1e-9;
  const tol = (isInt || isShort) ? 1e-9 : 1e-5;
  return { ok: Math.abs(v - q.answer) <= tol * Math.max(1, Math.abs(q.answer)), picked: null };
}

/* ============ 状态 ============ */
const state = {
  fam: 'all', seg: 'all', n: 10,
  queue: [], idx: 0, records: [],
  answered: false, picked: null,
};

const $ = (s) => document.querySelector(s);

/* ============ 持久化：作答记录与历史诊断存在 localStorage ============ */
const LS_KEY = 'xz-practice-v1';
const LS_MAX_SESSIONS = 20;   // 最多保留 20 轮记录

function loadStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { sessions: [], allRecords: [] };
    const o = JSON.parse(raw);
    return { sessions: o.sessions || [], allRecords: o.allRecords || [] };
  } catch (e) {
    return { sessions: [], allRecords: [] };
  }
}

function saveStore(store) {
  try {
    // 只保留最近 N 轮；allRecords 用于累计诊断，单独裁剪
    store.sessions = store.sessions.slice(-LS_MAX_SESSIONS);
    if (store.allRecords.length > 2000) {
      store.allRecords = store.allRecords.slice(-2000);
    }
    localStorage.setItem(LS_KEY, JSON.stringify(store));
  } catch (e) {
    // 隐私模式或配额满，静默降级（不影响本轮作答）
  }
}

/* 一轮做完后落盘 */
function persistSession(records, diagResult) {
  const store = loadStore();
  const ts = Date.now();
  store.sessions.push({
    at: ts,
    n: records.length,
    ok: records.filter((r) => r.ok).length,
    scope: state.fam === 'all' ? '全部' : ((FAM_META[state.fam] || {}).name || state.fam),
    seg: state.seg,
    fams: diagResult.fams.map((f) => ({
      fam: f.fam, name: f.name, total: f.total, ok: f.ok, tier: f.tier,
    })),
  });
  // 累计记录：用于「历史累计诊断」
  for (const r of records) {
    store.allRecords.push({ id: r.id, ok: r.ok, picked: r.picked, at: ts });
  }
  saveStore(store);
  return store;
}

/* 历史累计诊断：把全部历史作答记录再诊断一遍 */
function diagnoseHistory() {
  const store = loadStore();
  return diagnose(store.allRecords.map((r) => ({ id: r.id, ok: r.ok, picked: r.picked })));
}
const DIFF_NAME = { easy: '基础', mid: '中档', hard: '较难' };

/* 选项打散：避免答案总在同一个位置 */
function shuffleOptions(q) {
  if (!q.options) return q;
  const idx = q.options.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return {
    ...q,
    options: idx.map(i => q.options[i]),
    key: idx.indexOf(q.key),
  };
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* 出题策略：诊断要下结论，每族至少需要 3 题。
 * 所以「全部」不是跨族撒一遍，而是按族轮转、每族凑够样本再换下一族。 */
function pickQueue() {
  const match = (q) =>
    (state.fam === 'all' || q.fam === state.fam) &&
    (state.seg === 'all' || q.seg === state.seg);

  const pool = BANK.filter(match);
  if (!pool.length) return [];

  const n = Math.min(state.n, pool.length);

  // 指定了族：直接从该族取
  if (state.fam !== 'all') {
    return shuffle(pool).slice(0, n).map(shuffleOptions);
  }

  // 「全部」：按族分组，每族取 min(3, 该族题数)，凑够 n 为止
  const byFam = new Map();
  for (const q of pool) {
    if (!byFam.has(q.fam)) byFam.set(q.fam, []);
    byFam.get(q.fam).push(q);
  }
  // 族按真题年均分值降序（分值高的优先练）
  const famOrder = [...byFam.keys()].sort(
    (a, b) => ((FAM_META[b] || {}).avgPerYear || 0) - ((FAM_META[a] || {}).avgPerYear || 0)
  );

  const picked = [];
  const MIN_PER_FAM = 3;
  // 第一轮：每个族取 MIN_PER_FAM 题
  for (const f of famOrder) {
    const qs = shuffle(byFam.get(f));
    picked.push(...qs.slice(0, MIN_PER_FAM));
    if (picked.length >= n) break;
  }
  // 第二轮：还不够就继续补（每族再加）
  if (picked.length < n) {
    const used = new Set(picked.map((q) => q.id));
    for (const f of famOrder) {
      for (const q of shuffle(byFam.get(f))) {
        if (used.has(q.id)) continue;
        picked.push(q);
        used.add(q.id);
        if (picked.length >= n) break;
      }
      if (picked.length >= n) break;
    }
  }
  return picked.slice(0, n).map(shuffleOptions);
}

/* ============ 渲染题目 ============ */
function renderQuestion() {
  const q = state.queue[state.idx];
  const famName = (FAM_META[q.fam] || {}).name || q.fam;
  state.answered = false;
  state.picked = null;

  const total = state.queue.length;
  $('#pText').textContent = '第 ' + (state.idx + 1) + ' / ' + total + ' 题';
  $('#pBar').style.width = Math.round((state.idx / total) * 100) + '%';
  $('#pScore').textContent = '已对 ' + state.records.filter(r => r.ok).length;

  const optsHtml = q.options ? `
    <div class="opts" id="opts">
      ${q.options.map((o, i) => `<div class="opt${o.figSvg ? ' opt-fig' : ''}" data-i="${i}">
        <span class="opt-k">${'ABCD'[i]}</span>
        ${o.figSvg ? `<span class="opt-figbox">${o.figSvg}</span>` : `<span>${mathText(o.t)}</span>`}
      </div>`).join('')}
    </div>` : `
    <div class="fill">
      <input id="fillInput" type="text" inputmode="text" autocomplete="off"
        placeholder="填写数值，如 10、-3/4、0.5">
      ${q.unit ? `<span class="unit">${esc(q.unit)}</span>` : ''}
      <button class="btn primary" id="submitFill">提交</button>
    </div>`;

  $('#qHost').innerHTML = `
    <div class="q-card">
      <div class="q-meta">
        <span class="tag fam">${esc(famName)}</span>
        <span class="tag seg">${esc(q.seg)}题</span>
        <span class="tag ${q.diff}">${DIFF_NAME[q.diff] || q.diff}</span>
        <span class="q-no">${q.id}</span>
      </div>
      <div class="q-stem">${mathText(q.stem)}</div>
      ${q.figSvg ? `<div class="q-fig">${q.figSvg}</div>` : ''}
      ${optsHtml}
      <div id="fb"></div>
      <div class="actions" id="qActions" style="display:none">
        <button class="btn primary" id="nextBtn">下一题 →</button>
      </div>
    </div>`;

  if (q.options) {
    $('#opts').addEventListener('click', (e) => {
      const el = e.target.closest('.opt');
      if (!el || state.answered) return;
      const i = +el.dataset.i;
      document.querySelectorAll('.opt').forEach(x => x.classList.remove('picked'));
      el.classList.add('picked');
      state.picked = i;
      submit(i);
    });
  } else {
    const inp = $('#fillInput');
    inp.focus();
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(inp.value); });
    $('#submitFill').addEventListener('click', () => submit(inp.value));
  }
}

function submit(input) {
  if (state.answered) return;
  const q = state.queue[state.idx];
  const res = judge(q, input);
  if (res.invalid) {
    const fb = $('#fb');
    fb.className = 'fb no';
    fb.innerHTML = '请填写一个数值（可以写分数，如 <span class="ans">-3/4</span>）。';
    return;
  }
  state.answered = true;
  state.records.push({ id: q.id, ok: res.ok, picked: res.picked });

  const fb = $('#fb');
  if (res.ok) {
    fb.className = 'fb ok';
    fb.innerHTML = '<b>✓ 答对了</b>';
  } else {
    let extra = '';
    if (q.options && typeof res.picked === 'number' && q.options[res.picked].errTag) {
      const p = parseErrTag(q.options[res.picked].errTag);
      if (p) extra = `<div class="why"><b>你选的这项：</b>${esc(q.options[res.picked].errTag)}${p.fix ? `<br><b>怎么改：</b>${esc(p.fix)}` : ''}</div>`;
    } else if (q.answer !== undefined) {
      const shown = Number.isInteger(q.answer) ? q.answer : +q.answer.toFixed(6);
      extra = `<div class="why"><b>正确答案：</b><span class="ans">${shown}</span>${q.unit ? esc(q.unit) : ''}</div>`;
    }
    fb.className = 'fb no';
    fb.innerHTML = `<b>✗ 答错了</b>${extra}`;
  }

  // 标记选项
  if (q.options) {
    document.querySelectorAll('.opt').forEach((el, i) => {
      el.classList.remove('picked');
      if (i === q.key) el.classList.add('right');
      else if (i === res.picked) el.classList.add('wrong');
    });
  } else {
    const inp = $('#fillInput');
    if (inp) inp.disabled = true;
    const btn = $('#submitFill');
    if (btn) btn.style.display = 'none';
  }

  const act = $('#qActions');
  act.style.display = 'flex';
  $('#nextBtn').textContent = (state.idx + 1 >= state.queue.length) ? '看诊断结果 →' : '下一题 →';
  $('#nextBtn').onclick = next;
  $('#nextBtn').focus();
  $('#pScore').textContent = '已对 ' + state.records.filter(r => r.ok).length;
}

function next() {
  state.idx++;
  if (state.idx >= state.queue.length) return showDiag();
  renderQuestion();
}

/* ============ 诊断面板 ============ */
function showDiag() {
  const d = diagnose(state.records);
  // 落盘：本轮 + 累计
  const store = persistSession(state.records, d);
  const hist = diagnose(store.allRecords.map((r) => ({ id: r.id, ok: r.ok, picked: r.picked })));
  $('#quiz').style.display = 'none';
  $('#setup').style.display = 'none';
  const host = $('#diag');
  host.style.display = 'block';

  const tierName = { weak: '薄弱', shaky: '不稳', solid: '掌握', insufficient: '样本不足' };
  const rateCls = (t) => 'rate-' + t;

  host.innerHTML = `
    <div class="diag-head">
      <span class="kicker">Diagnosis</span>
      <h2>这一轮的诊断</h2>
    </div>

    <div class="summary">
      <div class="sm total"><div class="n">${Math.round(d.rate * 100)}%</div><div class="l">总正确率</div></div>
      <div class="sm weak"><div class="n">${d.weak}</div><div class="l">薄弱考点</div></div>
      <div class="sm shaky"><div class="n">${d.shaky}</div><div class="l">不够稳</div></div>
      <div class="sm solid"><div class="n">${d.solid}</div><div class="l">已掌握</div></div>
    </div>

    <div class="fam-rows">
      ${d.fams.map(f => `
        <div class="fam-row">
          <div>
            <div class="fam-name">${esc(f.name)}</div>
            <div class="fam-sub">${f.ok}/${f.total} 题正确${f.topErr ? ' · 主错因：' + esc(f.topErr.cat) : ''}</div>
          </div>
          <div class="fam-rate ${rateCls(f.tier)}">${Math.round(f.rate * 100)}%</div>
          <div class="fam-tier tier-${f.tier}">${tierName[f.tier]}</div>
        </div>`).join('')}
    </div>

    ${d.actions.length ? `
    <div style="margin-top:26px">
      <div class="diag-head"><span class="kicker">Next</span><h2 style="font-size:19px">接下来做什么</h2></div>
      <div class="act-list">
        ${d.actions.map(a => `<div class="act ${a.kind}">${a.text}</div>`).join('')}
      </div>
    </div>` : `
    <div class="act" style="margin-top:20px">
      这一轮全对。可以换一个范围再练，或者去「趋势与考点」看看哪些考点分值更高。
    </div>`}

    ${renderHistory(hist, store)}

    <div class="actions" style="margin-top:26px">
      <button class="btn primary" id="againBtn">再练一轮</button>
      <button class="btn" id="weakBtn">只练薄弱考点</button>
      <button class="btn ghost" id="clearHist">清空历史</button>
      <a class="btn ghost" href="plan.html">看冲刺计划</a>
    </div>
  `;

  const ch = $('#clearHist');
  if (ch) ch.onclick = () => {
    if (!confirm('清空全部练习记录？这不会影响题库。')) return;
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    alert('已清空。');
    reset(false);
  };

  $('#againBtn').onclick = () => reset(false);
  $('#weakBtn').onclick = () => {
    const weakFams = d.fams.filter(f => f.tier === 'weak' || f.tier === 'shaky').map(f => f.fam);
    if (!weakFams.length) { alert('这一轮没有明显薄弱的考点。'); return; }
    state.fam = weakFams[0];
    state.n = 999;
    reset(true);
  };

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* 历史累计面板：把全部历史作答聚合后的诊断 */
function renderHistory(hist, store) {
  const sess = store.sessions.length;
  if (sess <= 1) {
    return `
      <div style="margin-top:26px">
        <div class="diag-head"><span class="kicker">History</span><h2 style="font-size:19px">累计记录</h2></div>
        <div class="act need-more">
          这是第 1 轮练习。之后的每一轮都会自动保存在本机，累计诊断会在这里显示——
          练得越多，对薄弱考点的判断越准。
        </div>
      </div>`;
  }
  const tierName = { weak: '薄弱', shaky: '不稳', solid: '掌握', insufficient: '样本不足' };
  const rows = hist.fams.filter((f) => f.total > 0).slice(0, 10);
  return `
    <div style="margin-top:30px">
      <div class="diag-head">
        <span class="kicker">History</span>
        <h2 style="font-size:19px">累计记录与诊断</h2>
        <span style="font-size:12.5px;color:var(--text-3)">已练 ${sess} 轮 · 累计 ${hist.totalQ} 题</span>
      </div>
      <div class="summary">
        <div class="sm total"><div class="n">${Math.round(hist.rate * 100)}%</div><div class="l">累计正确率</div></div>
        <div class="sm weak"><div class="n">${hist.weak}</div><div class="l">薄弱考点</div></div>
        <div class="sm shaky"><div class="n">${hist.shaky}</div><div class="l">不够稳</div></div>
        <div class="sm solid"><div class="n">${hist.solid}</div><div class="l">已掌握</div></div>
      </div>
      <div class="fam-rows">
        ${rows.map((f) => `
          <div class="fam-row">
            <div>
              <div class="fam-name">${esc(f.name)}</div>
              <div class="fam-sub">累计 ${f.ok}/${f.total} 题正确${f.topErr ? ' · 主错因：' + esc(f.topErr.cat) : ''}</div>
            </div>
            <div class="fam-rate rate-${f.tier}">${Math.round(f.rate * 100)}%</div>
            <div class="fam-tier tier-${f.tier}">${tierName[f.tier]}</div>
          </div>`).join('')}
      </div>
      ${hist.actions.length ? `
      <div class="act-list" style="margin-top:14px">
        ${hist.actions.slice(0, 3).map((a) => `<div class="act ${a.kind}">${a.text}</div>`).join('')}
      </div>` : ''}
    </div>`;
}

function reset(keepScope) {
  $('#diag').style.display = 'none';
  $('#empty').style.display = 'none';
  if (!keepScope) {
    state.fam = 'all'; state.seg = 'all'; state.n = 10;
    document.querySelectorAll('#famChips .chip').forEach(c => c.classList.toggle('on', c.dataset.fam === 'all'));
    document.querySelectorAll('#segChips .chip').forEach(c => c.classList.toggle('on', c.dataset.seg === 'all'));
    document.querySelectorAll('#numChips .chip').forEach(c => c.classList.toggle('on', c.dataset.n === '10'));
  }
  $('#setup').style.display = 'block';
  $('#quiz').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============ 交互绑定 ============ */
function bindChips(sel, key, cast = (v) => v) {
  $(sel).addEventListener('click', (e) => {
    const c = e.target.closest('.chip');
    if (!c) return;
    document.querySelectorAll(sel + ' .chip').forEach(x => x.classList.remove('on'));
    c.classList.add('on');
    state[key] = cast(c.dataset[key === 'fam' ? 'fam' : key === 'seg' ? 'seg' : 'n']);
  });
}
bindChips('#famChips', 'fam');
bindChips('#segChips', 'seg');
bindChips('#numChips', 'n', (v) => +v);

$('#startBtn').onclick = () => {
  state.queue = pickQueue();
  if (!state.queue.length) { alert('这个范围下没有题目。'); return; }
  state.idx = 0;
  state.records = [];
  $('#setup').style.display = 'none';
  $('#empty').style.display = 'none';
  $('#diag').style.display = 'none';
  $('#quiz').style.display = 'block';
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

$('#quitBtn').onclick = () => {
  if (!state.records.length) { reset(false); return; }
  if (confirm('结束本轮并看诊断结果？')) showDiag();
};

$('#empty').style.display = 'block';
