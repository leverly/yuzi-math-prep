/* ==========================================================
   app.js · 柚子初一上数学期末备考 · 运行时核心
   从「北京中考数学领航」的运行时改造而来，三处关键改动：
   ① 错因六类：把「符号错误」从「计算失误」拆出来（初一特有）
   ② nearMiss：「会做但错」单独计数——这是初一最有价值的诊断信号
   ③ 存储键前缀 bj- → yz-，避免与中考站共用 localStorage
   ========================================================== */
(function (global) {
  'use strict';
  var Z = global.YZ = global.YZ || {};
  global.BJM = Z; /* 兼容别名 */

  var esc = Z.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  Z.ready = ready;

  /* ---------------- 提示条 ---------------- */
  var toastEl = null, toastTimer = null;
  Z.toast = function (msg, ms) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, ms || 2200);
  };

  /* ---------------- 音效 ---------------- */
  var sfxOn = load('yz-sfx-v1', true);
  var audioCtx = null;
  Z.sfx = function (kind) {
    if (!sfxOn || !kind) return;
    try {
      if (!audioCtx) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtx = new Ctx();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var now = audioCtx.currentTime;
      function tone(freq, start, dur, gainVal, type) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(freq, now + start);
        g.gain.setValueAtTime(0, now + start);
        g.gain.linearRampToValueAtTime(gainVal, now + start + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(now + start); o.stop(now + start + dur + 0.02);
      }
      if (kind === 'ok') { tone(660, 0, 0.12, 0.1); tone(880, 0.06, 0.14, 0.08); }
      else if (kind === 'bad') { tone(240, 0, 0.16, 0.09, 'triangle'); }
      else if (kind === 'win') { tone(523, 0, 0.14, 0.09); tone(659, 0.09, 0.14, 0.09); tone(784, 0.18, 0.22, 0.1); }
    } catch (e) {}
  };
  Z.toggleSfx = function (on) { sfxOn = on; store('yz-sfx-v1', on); return sfxOn; };
  Z.sfxOn = function () { return sfxOn; };

  /* ---------------- 主题 ---------------- */
  var THEME_KEY = 'yz-theme-manual';
  function autoTheme() {
    var h = new Date().getHours();
    return (h >= 19 || h < 6) ? 'dark' : 'light';
  }
  Z.applyTheme = function (t, save) {
    document.documentElement.setAttribute('data-theme', t);
    if (save) store(THEME_KEY, t);
  };
  Z.toggleTheme = function () {
    var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    Z.applyTheme(cur, true);
    var b = document.querySelector('.theme-btn');
    if (b) b.textContent = cur === 'dark' ? '☀' : '☾';
    return cur;
  };

  /* ---------------- 档案 ---------------- */
  var PROFILE_KEY = 'yz-profile-v1';
  var profile = load(PROFILE_KEY, { examDate: '', target: '100', grade: '7', daily: 45 });
  Z.profile = function () { return profile; };
  Z.saveProfile = function (patch) {
    profile = Object.assign({}, profile, patch || {});
    store(PROFILE_KEY, profile);
    document.dispatchEvent(new CustomEvent('yz:profile'));
    return profile;
  };
  Z.daysLeft = function () {
    if (!profile.examDate) return null;
    var t = new Date(profile.examDate + 'T00:00:00');
    if (isNaN(t)) return null;
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((t - today) / 86400000);
  };

  /* ---------------- 每日学习量 ---------------- */
  var DAYLOG_KEY = 'yz-daylog-v1';
  var GOAL_KEY = 'yz-goal-v1';
  var daylog = load(DAYLOG_KEY, {});
  var goal = Math.max(1, parseInt(load(GOAL_KEY, 20), 10) || 20);
  function dayKey(d) {
    var t = d || new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }
  Z.dayKey = dayKey;
  Z.goal = function () { return goal; };
  Z.setGoal = function (n) { goal = Math.max(1, parseInt(n, 10) || 20); store(GOAL_KEY, goal); document.dispatchEvent(new CustomEvent('yz:goal')); };
  Z.bumpDay = function (field, n) {
    var k = dayKey();
    var rec = daylog[k] || {};
    rec[field] = (rec[field] || 0) + (n == null ? 1 : n);
    daylog[k] = rec;
    store(DAYLOG_KEY, daylog);
    document.dispatchEvent(new CustomEvent('yz:day'));
  };
  Z.today = function (field) {
    var rec = daylog[dayKey()] || {};
    return field ? (rec[field] || 0) : rec;
  };
  Z.todayQuestions = function () { return Z.today('questions'); };
  Z.todayPct = function () { return Math.min(100, Math.round(Z.todayQuestions() / goal * 100)); };
  Z.streak = function () {
    var n = 0, d = new Date();
    for (;;) {
      var rec = daylog[dayKey(d)];
      if (rec && (rec.questions || 0) > 0) { n++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return n;
  };
  Z.recentDays = function (days) {
    var out = [], n = days || 7;
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      out.push({ key: dayKey(d), label: (d.getMonth() + 1) + '/' + d.getDate(), rec: daylog[dayKey(d)] || {} });
    }
    return out;
  };

  /* ==========================================================
     作答记录 qlog
     结构（替代英语站的 {ok,id}）：
       stats.byChapter / byMethod / byTier  —— 正确率统计
       wrong[id] = { result, stuckStep, errorType, timeMs, n, due, src }
       errStats = { concept:{n,ok}, method:{}, construct:{}, calc:{}, express:{} }
     ========================================================== */
  var QLOG_KEY = 'yz-qlog-v1';
  /* 初一上六类错因：把「符号错误」从「计算失误」里单独拆出来。
     理由：符号错误占计算失分很大比例，但补救方式（针对性符号训练）
     与「算错」（限时重复）不同，合并会让诊断失去行动性。 */
  /* 错因四类（2026-11-24 改）
     旧版 6 类（含 model/express）是「卡在第几步」倒推出来的，
     与真实错因无关，已废弃。新版只保留能从干扰项 errTag 直接得到的四类：
       concept 概念边界 —— 选了概念类干扰项（余角补角混淆、展开图判错等）
       sign    符号错误 —— 选了符号类干扰项（去括号变号、移项变号等）
       calc    计算失误 —— 选了数值算错的干扰项
       method  方法未掌握 —— 选了方法类干扰项（取倒数、漏项、系数当结果等） */
  var ERR_TYPES = ['concept', 'sign', 'calc', 'method'];
  var ERR_NAME = {
    concept: '概念边界', sign: '符号错误',
    calc: '计算失误', method: '方法未掌握',
  };
  /* 每类的「下一步动作」——诊断页直接给建议，不只报数字 */
  var ERR_FIX = {
    concept: '看概念卡对应那张的「差在哪个条件」',
    sign: '专门练去括号/移项的变号，连续 10 题不错再换',
    calc: '限时重复同类计算，记录「会做但错」的次数',
    method: '看方法卡的「常见误用」那段，对照自己选错的选项',
  };
  var qlog = load(QLOG_KEY, null) || {};
  if (!qlog.stats) qlog.stats = {};
  if (!qlog.stats.byChapter) qlog.stats.byChapter = {};
  if (!qlog.stats.byMethod) qlog.stats.byMethod = {};
  if (!qlog.stats.byTier) qlog.stats.byTier = {};
  if (!qlog.wrong) qlog.wrong = {};
  if (!qlog.errStats) qlog.errStats = {};
  if (!qlog.qtypeStats) qlog.qtypeStats = {};
  if (!qlog.due) qlog.due = {};
  /* 逐题作答历史（环形缓冲，最近 200 条）。
     为什么需要它：槽位专项的达标判据是「连对 3 次」，
     而 byChapter/byMethod 的聚合计数无法还原顺序——只看得到
     「答了 10 题对 8 题」，看不出「最近三次是否全对」。
     只存 {id,result,t}，不存答案内容，体积可控（200 条约 8KB）。 */
  if (!qlog.recent) qlog.recent = [];
  var RECENT_MAX = 200;
  ERR_TYPES.forEach(function (t) { if (!qlog.errStats[t]) qlog.errStats[t] = { n: 0, ok: 0 }; });

  Z.ERR_TYPES = ERR_TYPES;
  Z.ERR_NAME = ERR_NAME;
  Z.ERR_FIX = ERR_FIX;
  Z.ERR_NAME = ERR_NAME;
  Z.errName = function (t) { return ERR_NAME[t] || '未分类'; };
  Z.qLog = function () { return qlog; };

  function bumpStat(bucket, key, ok) {
    if (!key) return;
    var r = qlog.stats[bucket][key] || { n: 0, ok: 0 };
    r.n++; if (ok) r.ok++;
    qlog.stats[bucket][key] = r;
  }

  /**
   * 记录一次作答。
   * @param rec { id, chapter, method, tier, result:'right'|'wrong'|'blank',
   *              stuckStep, errorType, timeMs, src }
   */
  Z.qRecord = function (rec) {
    if (!rec || !rec.id) return;
    var ok = rec.result === 'right';
    bumpStat('byChapter', rec.chapter, ok);
    bumpStat('byMethod', rec.method, ok);
    bumpStat('byTier', rec.tier, ok);
    /* 分题型统计：诊断页用它替代已废弃的「卡在第几步」。
       大题不判分，不计入（避免虚高正确率）。 */
    var qt = rec.qtype;
    if (qt && qt !== 'big') {
      if (!qlog.qtypeStats[qt]) qlog.qtypeStats[qt] = { n: 0, ok: 0 };
      qlog.qtypeStats[qt].n++;
      if (ok) qlog.qtypeStats[qt].ok++;
    }

    /* 「会做但错」：全站最关键的初一信号。
       定义：前 n-1 步全部正确，但最终结果错；或中间步骤对、结果错。
       含义是「不是知识问题，是熟练度/规范/注意力问题」，对应动作是限时重复，
       不是看讲解。单独计数，才能算出「非受迫性失误率」。 */
    var nearMiss = rec.nearMiss === true;
    if (!qlog.nearMiss) qlog.nearMiss = { n: 0, total: 0 };
    if (rec.result !== 'blank') {
      qlog.nearMiss.total++;
      if (nearMiss) qlog.nearMiss.n++;
    }

    // 错因统计：错因只在答错时产生，所以 n 是「发生次数」，ok 记「事后补救成功次数」。
    // 答对时如果这题此前带错因，就给那个错因记一次补救成功——这样诊断页的
    // 「补救率」才是真指标（分母是这类错误发生过几次，分子是补回来的几次）。
    var et = rec.errorType;
    var prevWrong = qlog.wrong[rec.id];
    if (ok && prevWrong && ERR_TYPES.indexOf(prevWrong.errorType) >= 0) {
      qlog.errStats[prevWrong.errorType].ok++;
    }
    if (et && ERR_TYPES.indexOf(et) >= 0 && rec.result !== 'blank') {
      qlog.errStats[et].n++;
    }

    if (ok) {
      delete qlog.wrong[rec.id];
      // 答对：按 0.5/1/3/7/21/60 天递增排下次复习
      var prev = qlog.due[rec.id] || { n: 0 };
      var steps = [0.5, 1, 3, 7, 21, 60];
      var n = Math.min((prev.n || 0) + 1, steps.length);
      qlog.due[rec.id] = { n: n, due: Date.now() + steps[n - 1] * 86400000 };
    } else {
      var w = qlog.wrong[rec.id] || { n: 0 };
      qlog.wrong[rec.id] = {
        result: rec.result,
        stuckStep: -1,   /* 已废弃：分步作答取消后不再有「卡在第几步」 */
        errorType: et || 'method',
        errTag: rec.errTag || null,
        qtype: rec.qtype || null,
        timeMs: rec.timeMs || 0,
        chapter: rec.chapter || '',
        method: rec.method || '',
        tier: rec.tier || '',
        nearMiss: nearMiss,
        n: (w.n || 0) + 1,
        due: 0,
        src: rec.src || 'drill',
      };
      qlog.due[rec.id] = { n: 0, due: 0 };
    }
    store(QLOG_KEY, qlog);
    document.dispatchEvent(new CustomEvent('yz:qlog', { detail: rec }));
  };

  /* 逐题作答历史：只在非空作答时记一条。
     空白（blank）不计入——没作答不构成「连对」的证据，也不该打断连对。 */
  var _qRecordInner = Z.qRecord;
  Z.qRecord = function (rec) {
    if (!rec || !rec.id) return;
    _qRecordInner(rec);
    if (rec.result === 'blank') return;
    qlog.recent.push({ id: rec.id, result: rec.result, t: Date.now() });
    if (qlog.recent.length > RECENT_MAX) {
      qlog.recent = qlog.recent.slice(-RECENT_MAX);
    }
    store(QLOG_KEY, qlog);

    /* 族级回写：这是「回流」的唯一入口。
       放在这里而不是各页面里，是为了保证无论从哪个入口练
       （drill / 今日清单 / 模考 / 错题重做），族状态都会被更新。
       漏一处就会让「练了但清单不变」，闭环静默断掉。 */
    if (rec.family && Z.famRecord) {
      Z.famRecord(rec.family, rec.tier, rec.result === 'right', rec.nearMiss === true);
    }
  };

  /**
   * 某组题目的「最近连对次数」。
   * @param ids 题 id 数组（同一槽位内的全部题）
   * 口径：从最近一条记录往前数，连续 result==='right' 的条数；
   *       遇到第一个 wrong 就停。不要求同题，因为同一槽位换题连对
   *       比同题连对更能说明「这个位置稳定」，而不是「记住了这道题」。
   */
  Z.streakFor = function (ids) {
    if (!ids || !ids.length) return { streak: 0, answered: 0 };
    var set = {};
    ids.forEach(function (id) { set[id] = true; });
    var recs = (qlog.recent || []).filter(function (r) { return set[r.id]; });
    var streak = 0;
    for (var i = recs.length - 1; i >= 0; i--) {
      if (recs[i].result === 'right') streak++;
      else break;
    }
    return { streak: streak, answered: recs.length };
  };

  /* 「会做但错」占比：分母是全部有效作答，分子是 nearMiss 次数 */
  Z.nearMissRate = function () {
    var s = qlog.nearMiss || { n: 0, total: 0 };
    return { n: s.n, total: s.total, rate: s.total ? s.n / s.total : 0 };
  };

  Z.wrongIds = function () { return Object.keys(qlog.wrong); };
  Z.wrongMap = function () { return qlog.wrong; };
  Z.qDueMap = function () { return qlog.due; };
  Z.qClearWrong = function (id) {
    delete qlog.wrong[id];
    store(QLOG_KEY, qlog);
    document.dispatchEvent(new CustomEvent('yz:qlog'));
  };

  /** 按错因批量移除（错题本的「清空这一类」） */
  Z.qClearWrongByType = function (type) {
    var n = 0;
    Object.keys(qlog.wrong).forEach(function (id) {
      var w = qlog.wrong[id];
      var t = ERR_TYPES.indexOf(w.errorType) >= 0 ? w.errorType : 'method';
      if (t === type) { delete qlog.wrong[id]; n++; }
    });
    store(QLOG_KEY, qlog);
    document.dispatchEvent(new CustomEvent('yz:qlog'));
    return n;
  };

  /** 清空整个错题本（保留统计） */
  Z.qClearAllWrong = function () {
    var n = Object.keys(qlog.wrong).length;
    qlog.wrong = {};
    store(QLOG_KEY, qlog);
    document.dispatchEvent(new CustomEvent('yz:qlog'));
    return n;
  };

  /** 批量标记已掌握（一次移除多条） */
  Z.qMasterBatch = function (ids) {
    var n = 0;
    (ids || []).forEach(function (id) {
      if (qlog.wrong[id]) { delete qlog.wrong[id]; n++; }
    });
    if (n) {
      store(QLOG_KEY, qlog);
      document.dispatchEvent(new CustomEvent('yz:qlog'));
    }
    return n;
  };

  /**
   * 错题列表（供错题本页分页/搜索用）。
   * 每条带上原始记录 + 题目元信息摘要，避免页面反复查表。
   *
   * 注意 id 有两类：
   *   q-xxx / v-xxx   普通题目，从章节分片查
   *   c-xxx#n         概念卡的第 n 个判断题，从概念卡查
   * kind 字段用来区分，页面据此选择不同的渲染方式。
   */
  Z.wrongList = function () {
    return Object.keys(qlog.wrong).map(function (id) {
      var w = qlog.wrong[id];
      var kind = 'question';
      var conceptId = '';
      var testIdx = -1;
      if (id.indexOf('#') > 0) {
        kind = 'concept';
        var parts = id.split('#');
        conceptId = parts[0];
        testIdx = parseInt(parts[1], 10);
        if (isNaN(testIdx)) testIdx = -1;
      }
      return {
        id: id,
        kind: kind,
        conceptId: conceptId,
        testIdx: testIdx,
        errorType: w.errorType || 'method',
        chapter: w.chapter || '',
        method: w.method || '',
        tier: w.tier || '',
        stuckStep: w.stuckStep == null ? -1 : w.stuckStep,
        times: w.n || 1,
        timeMs: w.timeMs || 0,
        src: w.src || '',
      };
    });
  };

  /** 按错因分栏 */
  Z.wrongByType = function () {
    var out = {};
    ERR_TYPES.forEach(function (t) { out[t] = []; });
    Object.keys(qlog.wrong).forEach(function (id) {
      var w = qlog.wrong[id];
      var t = ERR_TYPES.indexOf(w.errorType) >= 0 ? w.errorType : 'method';
      out[t].push(Object.assign({ id: id }, w));
    });
    return out;
  };

  /** 各桶正确率，按正确率升序（最弱在前） */
  function rates(bucket) {
    var b = qlog.stats[bucket] || {};
    return Object.keys(b).map(function (k) {
      var r = b[k];
      return { key: k, n: r.n, ok: r.ok, rate: r.n ? r.ok / r.n : 0 };
    }).filter(function (x) { return x.n > 0; })
      .sort(function (a, b2) { return a.rate - b2.rate; });
  }
  Z.chapterRates = function () { return rates('byChapter'); };
  Z.methodRates = function () { return rates('byMethod'); };
  Z.tierRates = function () { return rates('byTier'); };
  Z.errStats = function () {
    return ERR_TYPES.map(function (t) {
      var r = qlog.errStats[t] || { n: 0, ok: 0 };
      // n 发生次数 / ok 事后补救成功次数 / rate 补救率（不是正确率）
      return { type: t, name: ERR_NAME[t], n: r.n, ok: r.ok, rate: r.n ? r.ok / r.n : 0 };
    });
  };
  Z.totalAnswered = function () {
    var n = 0, ok = 0;
    Object.keys(qlog.stats.byChapter || {}).forEach(function (k) {
      n += qlog.stats.byChapter[k].n; ok += qlog.stats.byChapter[k].ok;
    });
    return { n: n, ok: ok, rate: n ? ok / n : 0 };
  };

  /* ==========================================================
     弱点聚合：把「错题」变成「可训练的单元」
     ----------------------------------------------------------
     光有横向错因（概念/方法/计算…）不够用——学生知道「我是计算错」，
     但不知道练哪个具体东西。这里按**方法卡**和**章节**两个可训练单元
     聚合，每个单元给出：
       rate      该单元正确率
       wrongN    错题数
       errMix    错因分布（哪类错最多）
       stuckMix  卡点分布（第几步最常卡）
       score     优先级分数（越低越该先练）
     ========================================================== */

  /** 把一条错题记录归到某个桶 */
  function bump(bucket, key, w) {
    if (!key) return;
    var b = bucket[key] || (bucket[key] = {
      key: key, wrongN: 0, totalWrongTimes: 0,
      errMix: {}, stuckMix: {}, steps: {}, ids: [],
    });
    b.wrongN++;
    b.totalWrongTimes += (w.n || 1);
    b.errMix[w.errorType] = (b.errMix[w.errorType] || 0) + 1;
    var st = w.stuckStep >= 0 ? w.stuckStep : -1;
    b.stuckMix[st] = (b.stuckMix[st] || 0) + 1;
    if (st >= 0) b.steps[st] = (b.steps[st] || 0) + 1;
    b.ids.push(w.id);
  }

  /** 取某单元的正确率（来自 stats 桶） */
  function rateOf(bucket, key) {
    var r = (qlog.stats[bucket] || {})[key];
    if (!r || !r.n) return null;
    return { n: r.n, ok: r.ok, rate: r.ok / r.n };
  }

  /**
   * 按方法卡聚合弱点。
   * 只返回「有作答记录」的方法卡——没练过的不算弱点，算未学。
   */
  Z.methodWeakness = function () {
    var buckets = {};
    Object.keys(qlog.wrong).forEach(function (id) {
      var w = qlog.wrong[id];
      if (w.method) bump(buckets, w.method, w);
    });
    // 也纳入「练过但没错题」的方法卡，正确率仍可能低
    Object.keys(qlog.stats.byMethod || {}).forEach(function (m) {
      if (!buckets[m]) buckets[m] = { key: m, wrongN: 0, totalWrongTimes: 0, errMix: {}, stuckMix: {}, steps: {}, ids: [] };
    });
    return Object.keys(buckets).map(function (k) {
      var b = buckets[k];
      var r = rateOf('byMethod', k);
      var rate = r ? r.rate : 1;
      var n = r ? r.n : 0;
      // 优先级：正确率越低、错题越多、练得越少（样本不足但已错）越靠前
      // 用 (1-rate) 为主，错题次数加权，样本少时轻微上调
      var score = (1 - rate) * 100 + Math.min(b.totalWrongTimes, 10) * 2;
      if (n > 0 && n < 3 && b.wrongN > 0) score += 6;   // 样本少但已错，值得早看
      return {
        key: k, rate: rate, answered: n, ok: r ? r.ok : 0,
        wrongN: b.wrongN, totalWrongTimes: b.totalWrongTimes,
        errMix: b.errMix, stuckMix: b.stuckMix, steps: b.steps, ids: b.ids,
        score: Math.round(score),
        topErr: topKey(b.errMix),
        topStuck: topStep(b.stuckMix),
      };
    }).sort(function (a, b2) { return b2.score - a.score; });
  };

  /** 按章节聚合弱点，并汇总该章下的方法卡弱点 */
  Z.chapterWeakness = function () {
    var buckets = {};
    Object.keys(qlog.wrong).forEach(function (id) {
      var w = qlog.wrong[id];
      if (w.chapter) bump(buckets, w.chapter, w);
    });
    Object.keys(qlog.stats.byChapter || {}).forEach(function (c) {
      if (!buckets[c]) buckets[c] = { key: c, wrongN: 0, totalWrongTimes: 0, errMix: {}, stuckMix: {}, steps: {}, ids: [] };
    });
    return Object.keys(buckets).map(function (k) {
      var b = buckets[k];
      var r = rateOf('byChapter', k);
      var rate = r ? r.rate : 1;
      var n = r ? r.n : 0;
      var score = (1 - rate) * 100 + Math.min(b.totalWrongTimes, 12) * 2;
      if (n > 0 && n < 3 && b.wrongN > 0) score += 5;
      return {
        key: k, rate: rate, answered: n, ok: r ? r.ok : 0,
        wrongN: b.wrongN, totalWrongTimes: b.totalWrongTimes,
        errMix: b.errMix, stuckMix: b.stuckMix, steps: b.steps, ids: b.ids,
        score: Math.round(score),
        topErr: topKey(b.errMix),
        topStuck: topStep(b.stuckMix),
      };
    }).sort(function (a, b2) { return b2.score - a.score; });
  };

  function topKey(mix) {
    var best = null, bn = 0;
    Object.keys(mix || {}).forEach(function (k) {
      if (mix[k] > bn) { bn = mix[k]; best = k; }
    });
    return best;
  }
  function topStep(mix) {
    var best = -1, bn = 0;
    Object.keys(mix || {}).forEach(function (k) {
      var v = parseInt(k, 10);
      if (v < 0) return;
      if (mix[k] > bn) { bn = mix[k]; best = v; }
    });
    return best;
  }

  /**
   * 全局「下一步练什么」：给出前 N 个最该练的单元。
   * 这是错因诊断页的核心输出——不是列错题，是给行动。
   */
  Z.nextActions = function (limit) {
    var ms = Z.methodWeakness().filter(function (m) { return m.wrongN > 0 || m.rate < 0.75; });
    var cs = Z.chapterWeakness().filter(function (c) { return c.wrongN > 0 || c.rate < 0.75; });
    var acts = [];
    ms.forEach(function (m) {
      acts.push({
        kind: 'method', key: m.key, score: m.score,
        rate: m.rate, answered: m.answered, wrongN: m.wrongN,
        topErr: m.topErr, topStuck: m.topStuck,
        href: 'drill.html?method=' + encodeURIComponent(m.key) + '&scope=weak',
      });
    });
    cs.forEach(function (c) {
      acts.push({
        kind: 'chapter', key: c.key, score: c.score - 4,   // 章节优先级略低于具体方法
        rate: c.rate, answered: c.answered, wrongN: c.wrongN,
        topErr: c.topErr, topStuck: c.topStuck,
        href: 'drill.html?chapter=' + encodeURIComponent(c.key) + '&scope=weak',
      });
    });
    return acts.sort(function (a, b) { return b.score - a.score; }).slice(0, limit || 5);
  };

  /** 卡点分布（全局）：第几步最容易卡，用于「分层提示」优化与专项 */
  Z.stuckDistribution = function () {
    var dist = {};
    Object.keys(qlog.wrong).forEach(function (id) {
      var w = qlog.wrong[id];
      if (w.stuckStep >= 0) dist[w.stuckStep] = (dist[w.stuckStep] || 0) + 1;
    });
    return dist;
  };

  Z.qReset = function () {
    qlog = { stats: { byChapter: {}, byMethod: {}, byTier: {} }, wrong: {}, errStats: {}, due: {}, nearMiss: { n: 0, total: 0 }, recent: [] };
    ERR_TYPES.forEach(function (t) { qlog.errStats[t] = { n: 0, ok: 0 }; });
    store(QLOG_KEY, qlog);
    document.dispatchEvent(new CustomEvent('yz:qlog', { detail: { reset: true } }));
  };

  /* ---------------- 概念卡 SRS ---------------- */
  var CSRS_KEY = 'yz-csrs-v1';
  var csrs = load(CSRS_KEY, {});
  var DAY = 86400000;
  Z.csrsGet = function (id) { return csrs[id] || null; };
  Z.csrsAll = function () { return csrs; };
  Z.csrsDue = function (ids) {
    var now = Date.now();
    return (ids || Object.keys(csrs)).filter(function (id) {
      var r = csrs[id];
      return !r || (r.due || 0) <= now;
    });
  };
  Z.csrsRate = function (id, grade) {
    var r = csrs[id] || { ease: 2.5, ivl: 0, due: 0, reps: 0, lapses: 0, ans: 0, okc: 0 };
    if (grade === 0) {
      r.ease = Math.max(1.3, r.ease - 0.2);
      r.ivl = 0; r.lapses = (r.lapses || 0) + 1;
      r.due = Date.now() + 10 * 60000;
    } else {
      if (grade === 1) r.ease = Math.max(1.3, r.ease - 0.15);
      if (grade === 3) r.ease = Math.min(3.2, r.ease + 0.15);
      if (r.reps === 0) r.ivl = grade === 1 ? 0.5 : grade === 2 ? 1 : 2;
      else if (r.reps === 1) r.ivl = grade === 1 ? 1 : grade === 2 ? 3 : 5;
      else r.ivl = Math.max(1, Math.round(r.ivl * r.ease * (grade === 1 ? 0.8 : grade === 3 ? 1.25 : 1)));
      r.due = Date.now() + r.ivl * DAY;
    }
    r.reps = (r.reps || 0) + 1;
    r.last = Date.now();
    if (grade !== 1) { r.ans = (r.ans || 0) + 1; if (grade >= 2) r.okc = (r.okc || 0) + 1; }
    csrs[id] = r;
    store(CSRS_KEY, csrs);
    document.dispatchEvent(new CustomEvent('yz:csrs', { detail: { id: id } }));
    return r;
  };
  Z.csrsStats = function () {
    var keys = Object.keys(csrs), now = Date.now(), due = 0, mature = 0;
    keys.forEach(function (k) {
      var r = csrs[k];
      if ((r.due || 0) <= now) due++;
      if ((r.ivl || 0) >= 21) mature++;
    });
    return { total: keys.length, due: due, mature: mature, learning: keys.length - mature };
  };

  /* ---------------- 方法卡过关 ---------------- */
  var METHOD_KEY = 'yz-method-v1';
  var methodLog = load(METHOD_KEY, {});
  Z.methodLog = function () { return methodLog; };
  /* 方法卡三级达标判定
     口径（与变式阶梯一致）：
       ① 三级（改数字/改条件/逆向）全对才达标
       ② 错任何一级 → 整条链重置，从第 1 级重来
       ③ 记录 stuckLevel（卡在第几级），用于诊断

     changed → 级别序号：number=0, condition=1, reverse=2
     母题（无 changed）不计入三级，只作为讲解用。 */
  var LV_ORDER = { number: 0, condition: 1, reverse: 2 };
  Z.methodRecord = function (methodId, variantId, ok, changed) {
    if (!methodId) return;
    var r = methodLog[methodId] || { passed: [false, false, false], done: false, stuckLevel: -1, tries: 0 };
    /* 兼容旧结构 */
    if (!r.passed) r.passed = [false, false, false];
    if (r.stuckLevel == null) r.stuckLevel = -1;
    r.tries = (r.tries || 0) + 1;
    r.at = Date.now();

    var idx = LV_ORDER[changed];
    if (idx == null) {
      /* 不是三级变式（母题等），只记「练过」，不影响达标 */
      r.lastVariant = variantId;
      methodLog[methodId] = r;
      store(METHOD_KEY, methodLog);
      document.dispatchEvent(new CustomEvent('yz:method'));
      return r;
    }

    if (ok) {
      r.passed[idx] = true;
      if (r.passed[0] && r.passed[1] && r.passed[2]) {
        r.done = true;
        r.stuckLevel = -1;
        r.doneAt = Date.now();
      }
    } else {
      /* 错一级 → 整条重置 */
      if (r.stuckLevel < 0) r.stuckLevel = idx;
      r.passed = [false, false, false];
      r.done = false;
      r.resetCount = (r.resetCount || 0) + 1;
    }
    methodLog[methodId] = r;
    store(METHOD_KEY, methodLog);
    document.dispatchEvent(new CustomEvent('yz:method'));
    return r;
  };
  Z.methodDone = function (id) { var r = methodLog[id]; return !!(r && r.done); };
  Z.methodState = function (id) {
    var r = methodLog[id];
    return r || { passed: [false, false, false], done: false, stuckLevel: -1 };
  };
  /* 卡点分布：卡在改数字/改条件/逆向 的方法卡数 */
  Z.methodStuckDist = function () {
    var dist = [0, 0, 0];
    Object.keys(methodLog).forEach(function (k) {
      var r = methodLog[k];
      if (!r.done && r.stuckLevel >= 0 && r.stuckLevel < 3) dist[r.stuckLevel]++;
    });
    return dist;
  };
  Z.methodProgress = function (total) {
    var done = Object.keys(methodLog).filter(function (k) { return methodLog[k].done; }).length;
    return { done: done, total: total || 0 };
  };

  /* ==========================================================
     变式阶梯记录层
     一个阶梯 = 3 级（number → condition → reverse），全对才达标。
     口径（用户确认）：
       ① 3/3 全对才算达标
       ② 错任何一级 → 整条阶梯重置，从第 1 级重来
       ③ 记录 stuckLevel（卡在第几级），用于诊断「他卡在改条件还是逆向」

     与 methodLog 的区别：methodLog 是「方法卡过没过」，这里是
     「某个真题考点族的三级变式过没过」。粒度更细，且绑定真题。
     ========================================================== */
  var LADDER_KEY = 'yz-ladder-v1';
  var ladderLog = load(LADDER_KEY, {});
  Z.ladderLog = function () { return ladderLog; };

  /* 提交一级结果。levelIdx 从 0 开始（0=改数字,1=改条件,2=逆向） */
  Z.ladderRecord = function (ladderId, levelIdx, ok) {
    if (!ladderId) return null;
    var r = ladderLog[ladderId] || { passed: [false, false, false], done: false, stuckLevel: -1, tries: 0, at: 0 };
    r.tries = (r.tries || 0) + 1;
    r.at = Date.now();
    if (ok) {
      r.passed[levelIdx] = true;
      /* 全部三级通过 → 达标 */
      if (r.passed[0] && r.passed[1] && r.passed[2]) {
        r.done = true;
        r.stuckLevel = -1;
        r.doneAt = Date.now();
      }
    } else {
      /* 错一级则重置：整条阶梯从第 1 级重来 */
      if (r.stuckLevel < 0) r.stuckLevel = levelIdx;
      r.passed = [false, false, false];
      r.done = false;
      r.resetCount = (r.resetCount || 0) + 1;
    }
    ladderLog[ladderId] = r;
    store(LADDER_KEY, ladderLog);
    document.dispatchEvent(new CustomEvent('yz:ladder', { detail: { id: ladderId, r: r } }));
    return r;
  };

  Z.ladderState = function (id) {
    return ladderLog[id] || { passed: [false, false, false], done: false, stuckLevel: -1, tries: 0 };
  };
  Z.ladderDone = function (id) { return !!Z.ladderState(id).done; };

  /* 进度：已达标阶梯数 / 总阶梯数（总数为参数，避免运行时依赖 META） */
  Z.ladderProgress = function (total) {
    var done = Object.keys(ladderLog).filter(function (k) { return ladderLog[k].done; }).length;
    return { done: done, total: total || 0, rate: total ? done / total : 0 };
  };

  /* 卡点分布：卡在第几级的阶梯数。用于诊断「主要卡在改条件还是逆向」 */
  Z.ladderStuckDist = function () {
    var dist = [0, 0, 0];
    Object.keys(ladderLog).forEach(function (k) {
      var r = ladderLog[k];
      if (!r.done && r.stuckLevel >= 0 && r.stuckLevel < 3) dist[r.stuckLevel]++;
    });
    return dist;
  };

  /* 重置单条阶梯 */
  Z.ladderReset = function (id) {
    if (ladderLog[id]) { delete ladderLog[id]; store(LADDER_KEY, ladderLog); }
    document.dispatchEvent(new CustomEvent('yz:ladder'));
  };

  /* ==========================================================
     族级状态机 · 排序与回流的地基
     ----------------------------------------------------------
     为什么需要「族」这一层：
       诊断按章节只能说到「几何偏弱」（一章 83 题，无法专项），
       真题分析按族能说到「角度推理 19 分、3 年考」，但点不进去练。
       族是唯一同时被「真题权重」和「站内题」共享的粒度。

     三态（不是二值）：
       未测   —— 有效作答 < 3 题，不参与失分率计算，但仍在清单里（按权重排）
       训练中 —— 有记录、未达阈值
       已达标 —— 达阈值；不是消失，而是转为低频复习（到期短暂回归）

     为什么 L1 要双门槛（正确率 + 跨题连对）：
       只卡正确率：10 题错 1 题在末尾也算过，那是「刚学会」不是「稳定」。
       只卡连对：错 5 题后连对 3 次也能过，样本太小。
       连对必须跨题（同题连对只证明记住了这道题）。
     ========================================================== */
  var FAM_KEY = 'yz-family-v1';
  var famLog = load(FAM_KEY, {});   /* famId → {n, ok, nearN, streak, best, done, dueAt, ivl, lapses, lastAt} */

  /* 分层达标阈值。l3 的 50% 是「入场分」口径，不是「压轴过关」——
     压轴是 6-7 分整题，没有「答一半给一半」，真实可拿的是前一两步。 */
  var FAM_TARGET = {
    l1: { rate: 0.98, minN: 10, streak: 3 },
    l2: { rate: 0.90, minN: 8, streak: 0 },
    l3: { rate: 0.50, minN: 5, streak: 0 },
  };
  Z.FAM_TARGET = FAM_TARGET;

  function famEntry(fid) {
    if (!famLog[fid]) {
      famLog[fid] = { n: 0, ok: 0, nearN: 0, streak: 0, done: false, dueAt: 0, ivl: 0, lapses: 0, lastAt: 0 };
    }
    return famLog[fid];
  }

  /**
   * 记录一次族级作答。
   * @param fid 族 id
   * @param tier 该题所属层（决定阈值）
   * @param ok 是否答对
   * @param nearMiss 是否「会做但错」
   */
  Z.famRecord = function (fid, tier, ok, nearMiss) {
    if (!fid) return null;
    var e = famEntry(fid);
    e.n++; if (ok) e.ok++;
    if (nearMiss) e.nearN++;
    e.lastAt = Date.now();
    /* 跨题连对：答对累加，答错归零。同题重做也计入——但「同题连对」
       只是弱证据，所以达标还要同时满足正确率门槛。 */
    if (ok) e.streak++; else e.streak = 0;

    var T = FAM_TARGET[tier] || FAM_TARGET.l2;
    var rate = e.n ? e.ok / e.n : 0;
    var reached = e.n >= T.minN && rate >= T.rate && e.streak >= (T.streak || 0);

    if (reached && !e.done) {
      e.done = true;
      e.ivl = 1;                        /* 首次达标：1 天后复核 */
      e.dueAt = Date.now() + e.ivl * DAY;
      e.doneAt = Date.now();
    } else if (e.done && !ok) {
      /* 退化：已达标后错一次即退回训练中。
         这是「防止靠运气凑过门槛」——和变式阶梯错一级重置同一个原则。 */
      e.done = false;
      e.lapses = (e.lapses || 0) + 1;
      e.streak = 0;
      e.ivl = 0;
      e.dueAt = 0;
    } else if (e.done && ok) {
      /* 达标后的复核答对：间隔翻倍（1→2→4→8…，上限 30 天） */
      e.ivl = Math.min(30, (e.ivl || 1) * 2);
      e.dueAt = Date.now() + e.ivl * DAY;
    }

    store(FAM_KEY, famLog);
    document.dispatchEvent(new CustomEvent('yz:family', { detail: { id: fid } }));
    return e;
  };

  /** 取族状态：'untested' | 'training' | 'passed' */
  Z.famState = function (fid) {
    var e = famLog[fid];
    if (!e || !e.n) return 'untested';
    return e.done ? 'passed' : 'training';
  };

  /** 族的原始统计（含复习到期判断） */
  Z.famStats = function (fid) {
    var e = famLog[fid] || { n: 0, ok: 0, nearN: 0, streak: 0, done: false, dueAt: 0 };
    return {
      n: e.n || 0, ok: e.ok || 0,
      rate: e.n ? e.ok / e.n : 0,
      nearN: e.nearN || 0,
      nearRate: e.n ? (e.nearN || 0) / e.n : 0,
      streak: e.streak || 0,
      done: !!e.done,
      due: !!e.done && e.dueAt > 0 && e.dueAt <= Date.now(),
      dueAt: e.dueAt || 0,
      lapses: e.lapses || 0,
      state: Z.famState(fid),
    };
  };

  Z.famLog = function () { return famLog; };
  Z.famReset = function () {
    famLog = {}; store(FAM_KEY, famLog);
    document.dispatchEvent(new CustomEvent('yz:family', { detail: { reset: true } }));
  };

  /* ==========================================================
     planToday() · 排序
     ----------------------------------------------------------
     两步走，不是单一分数：

     第一步 定档（硬规则，不看数值）
       封顶规则给了档位依据：必做丢分不可补。
       所以「熟练层未达标」压倒一切，压轴永远排最后——
       不是因为它分值低（8.3 分/年，比方程应用题高），
       而是因为它的可回收分里没有一分能在两周内稳定拿回来。
       若只用「可回收分」单值排序，压轴（6.6）会排在计算（0.9）前面，
       这正是「算得对但结论错」的典型。

     第二步 档内排序（可回收分）
       同档内成本相当，这时「能涨多少」才是有效判据：
         可回收分 = 年均分 × 失分率 × 可回收系数
       l3 系数 0.4 从 slot 分值反推：压轴 6-7 分整题，入场分约 2.5-3，
       除以年均 8.3 得 0.36，取 0.4。这个数能追到 FAMILY_MAP[].slots。

     样本不足：该族作答 < 3 题 → 失分率不参与，标「未测」，
       档内按年均分降序。否则前两周清单会是空的。
     ========================================================== */
  var RECOVER_COEF = { l1: 1, l2: 1, l3: 0.4 };
  var MIN_SAMPLE = 3;

  /* 族的分层：用站内题的分层分布（tierMix），不用真题难度标签。
     为什么不用 diffScore：真题的 mid 只表示「这是解答题」，不表示认知层级。
     有理数四则混合运算在真题里是 mid（第 17 题解答题），但它的认知要求是
     「自动化」——属于熟练层。若按 diffScore 判，它会被当成理解层，
     用 90% 的达标线而不是 98%，正好放过最该零失误的部分。
     判据：哪个层占多数就归哪层；三者相近时取更高的要求（l1 优先）。 */
  function famTier(f) {
    var mix = f.tierMix;
    if (!mix) {
      /* 兜底：没有 tierMix 时退回真题标签，但这是降级路径，正常不应走到 */
      var d = f.diffScore || {};
      var top = (d.hard || 0) + (d.top || 0);
      if (top > (f.total || 0) * 0.5) return 'l3';
      if ((d.easy || 0) > (f.total || 0) * 0.5) return 'l1';
      return 'l2';
    }
    var n1 = mix.l1 || 0, n2 = mix.l2 || 0, n3 = mix.l3 || 0;
    var total = n1 + n2 + n3;
    if (!total) return 'l2';
    /* 熟练层要「过半」才按 l1 判，不是 1/3。
       理由：l1 的达标线是 98% + 跨题连对 3，是全站最严的门槛。
       阈值放太松（1/3）会把「整体代入」这种理解层族也拉进 l1，
       用一个过严的门槛去判它，结果是永远判不过——比判错更糟。
       过半意味着「这个族的主要训练目标是自动化」，这才配得上 98%。 */
    if (n1 / total > 0.5) return 'l1';
    if (n3 / total >= 0.5) return 'l3';
    return 'l2';
  }

  /* 定档：P0 熟练层 / P1 年年考中档 ≥5 分 / P2 其余中档 / P3 攻坚 / P4 少见 */
  function famBand(f, st, tier) {
    if (tier === 'l3') return 'P3';
    if (f.freq === 'rare' && (f.avgPerYear || 0) < 2) return 'P4';
    if (tier === 'l1') return 'P0';
    if (f.hitYears >= 4 && (f.avgPerYear || 0) >= 5) return 'P1';
    return 'P2';
  }
  Z.famTier = famTier;
  Z.famBand = famBand;

  /**
   * 生成今日清单。
   * @param families FAMILY_MAP 数组（构建期写入 META）
   * @returns { items: [...], byBand: {...}, summary: {...} }
   */
  Z.planToday = function (families) {
    var list = families || [];
    var items = [];

    list.forEach(function (f) {
      var st = Z.famStats(f.id);
      var tier = famTier(f);
      var band = famBand(f, st, tier);

      /* 已达标且未到复习期 → 不进清单（低频维持） */
      if (st.state === 'passed' && !st.due) return;

      var tested = st.n >= MIN_SAMPLE;
      /* 未测时给一个中性失分率 0.5，只为让它在档内有个位置；
         排序时未测族一律排在已测族之后，所以这个值不影响结论。 */
      var lossRate = tested ? (1 - st.rate) : 0.5;
      var recover = (f.avgPerYear || 0) * lossRate * (RECOVER_COEF[tier] || 1);

      /* 动作分支：
         未测 → 直接练。没数据时「先看讲解」是错的顺序——
                试一次本身就是诊断，做错了才知道该看哪张卡。
         已测且 nearMiss 高 → 限时收尾（不是看讲解，路径都对只是不稳）。
         其余 → 正常练。 */
      var action = 'drill';
      if (st.n >= MIN_SAMPLE && st.nearRate > 0.2) action = 'finish';

      items.push({
        id: f.id,
        name: f.name,
        ch: f.ch,
        tier: tier,
        band: band,
        freq: f.freq,
        hitYears: f.hitYears || 0,
        avgPerYear: f.avgPerYear || 0,
        state: st.state,
        due: st.due,
        tested: tested,
        n: st.n,
        rate: st.rate,
        nearRate: st.nearRate,
        streak: st.streak,
        recover: Math.round(recover * 100) / 100,
        action: action,
        qCount: f.qCount || 0,
      });
    });

    var BAND_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
    items.sort(function (a, b) {
      if (BAND_ORDER[a.band] !== BAND_ORDER[b.band]) return BAND_ORDER[a.band] - BAND_ORDER[b.band];
      /* 到期复习优先于新训练（同一档内） */
      if (a.due !== b.due) return a.due ? -1 : 1;
      /* 已测优先于未测：有数据才知道该不该练 */
      if (a.tested !== b.tested) return a.tested ? -1 : 1;
      if (a.recover !== b.recover) return b.recover - a.recover;
      return b.avgPerYear - a.avgPerYear;
    });

    var byBand = {};
    items.forEach(function (it) { (byBand[it.band] || (byBand[it.band] = [])).push(it); });

    return {
      items: items,
      byBand: byBand,
      summary: {
        total: items.length,
        untested: items.filter(function (x) { return x.state === 'untested'; }).length,
        training: items.filter(function (x) { return x.state === 'training'; }).length,
        due: items.filter(function (x) { return x.due; }).length,
        passedOut: list.length - items.length,
        /* 首条可执行动作：给首页/今日页一个「就做这个」的落点 */
        first: items[0] || null,
      },
    };
  };

  /* 当日快照：清单一天只算一次。
     理由：每题之后重算会让清单一直跳动，学生无法形成「今天做完这几件」的认知。 */
  var PLAN_KEY = 'yz-plan-v1';
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  Z.planTodayCached = function (families, force) {
    var snap = load(PLAN_KEY, null);
    var today = todayStr();
    if (!force && snap && snap.day === today && snap.plan) return snap.plan;
    var plan = Z.planToday(families);
    /* 存整个 plan 而不是只存 id：清单里带 state/rate/recover，
       只存 id 的话每次读都要重新算一遍，等于没缓存。
       按天 key 保证「今天算一次、明天重算」，不会拿昨天的旧状态。 */
    store(PLAN_KEY, { day: today, plan: plan });
    return plan;
  };
  Z.planSnapshotDay = function () {
    var snap = load(PLAN_KEY, null);
    return snap && snap.day ? snap.day : null;
  };

  /* ---------------- 概念池构建（concept / today 共用） ----------------
     概念卡要变成「可判定的单步题」才能喂给 step-engine。
     这个转换逻辑原先在 concept.html 和 today.html 各写了一遍，
     结构一改就要改两处、漏一处就静默失效，所以抽到这里。

     @param CH      window.YZ.CH（按章分片的数据）
     @param chFilter 只取某一章（null / undefined = 全部）
     @returns 题目数组，可直接交给 BZ.step()
     ---------------------------------------------------------------- */
  Z.buildConceptPool = function (CH, chFilter) {
    var pool = [];
    if (!CH) return pool;
    Object.keys(CH).forEach(function (cid) {
      if (chFilter && cid !== chFilter) return;
      (CH[cid].concepts || []).forEach(function (c) {
        (c.tests || []).forEach(function (t, i) {
          pool.push({
            id: c.id + '#' + i,
            chapter: c.chapter || cid,
            tier: 'l1',
            tierName: c.claim || '概念判断',
            stem: '',
            stemHtml: '<div class="c-claim">' + (c.claimHtml || c.claim || '') +
              '</div><div class="c-q">' + (t.qHtml || t.q || '') + '</div>',
            steps: [{
              label: '判断正误',
              ask: '这个说法成立吗？',
              type: 'judge',
              key: t.a,
              score: 1,
              why: t.why,
              whyHtml: t.whyHtml || t.why,
            }],
            solution: t.why,
            solutionHtml: t.whyHtml || t.why,
            errorTags: ['concept'],
            __conceptId: c.id,
          });
        });
      });
    });
    return pool;
  };

  /* ==========================================================
     方法辨析池：把方法卡的「常见误用」转成判断题
     ----------------------------------------------------------
     为什么这样转：方法卡的 steps 是讲解（只有 ask，没有对错），
     不能直接作答；但 pitfalls 天然是「这种算法对不对」的判断，
     正是方法题该有的练习形态。

     每张卡生成两类判断：
       ① 错法判断：「下面的做法对吗？」→ 错（答案 a=false）
       ② 正解判断：「正确的做法是 …，对吗？」→ 对（答案 a=true）
     两类混着出，避免学生靠「全都错」蒙对。

     @param CH        window.YZ.CH（按章分片的数据）
     @param chFilter  只取某一章（null = 全部）
     @returns 题目数组，可直接交给 YZ.step()
     ========================================================== */
  Z.buildMethodPool = function (CH, chFilter) {
    var pool = [];
    if (!CH) return pool;
    Object.keys(CH).forEach(function (cid) {
      if (chFilter && cid !== chFilter) return;
      (CH[cid].methods || []).forEach(function (m) {
        var pits = m.pitfalls || [];
        pits.forEach(function (p, i) {
          /* ① 错法：问「这样做对吗」，答案是「不对」 */
          pool.push({
            id: m.id + '#' + i + 'a',
            chapter: m.chapter || cid,
            method: m.id,
            tier: 'l2',
            tierName: (m.name || '方法') + ' · 误用辨析',
            stem: '',
            stemHtml: '<div class="c-claim">' + (m.nameHtml || m.name || '') + '</div>' +
              '<div class="c-q">下面这种算法对吗？<br><b>' + (p.badHtml || p.bad || '') + '</b></div>',
            steps: [{
              label: '判断算法',
              ask: '这种算法成立吗？',
              type: 'judge',
              key: false,
              score: 1,
              why: p.why,
              whyHtml: p.whyHtml || p.why,
            }],
            solution: p.why,
            solutionHtml: p.whyHtml || p.why,
            errorTags: ['method'],
            __methodId: m.id,
          });
          /* ② 正解：问「改成这样对吗」，答案是「对」 */
          if (p.good) {
            pool.push({
              id: m.id + '#' + i + 'b',
              chapter: m.chapter || cid,
              method: m.id,
              tier: 'l2',
              tierName: (m.name || '方法') + ' · 正解确认',
              stem: '',
              stemHtml: '<div class="c-claim">' + (m.nameHtml || m.name || '') + '</div>' +
                '<div class="c-q">改成下面这样，对吗？<br><b>' + (p.goodHtml || p.good || '') + '</b></div>',
              steps: [{
                label: '判断算法',
                ask: '这样改对吗？',
                type: 'judge',
                key: true,
                score: 1,
                why: p.why,
                whyHtml: p.whyHtml || p.why,
              }],
              solution: p.why,
              solutionHtml: p.whyHtml || p.why,
              errorTags: ['method'],
              __methodId: m.id,
            });
          }
        });
      });
    });
    return pool;
  };

  /* ---------------- 等级 ---------------- */
  Z.levelInfo = function () {
    var t = Z.totalAnswered();
    var xp = t.ok * 3 + (t.n - t.ok) + Z.streak() * 5 + Object.keys(methodLog).filter(function (k) { return methodLog[k].done; }).length * 20;
    var lv = Math.floor(Math.sqrt(xp / 50)) + 1;
    var names = ['起步', '计算入门', '符号过关', '基础扎实', '方法成形', '中档突破', '错题清零', '满分选手'];
    var next = Math.pow(lv, 2) * 50;
    var prev = Math.pow(lv - 1, 2) * 50;
    return {
      level: lv, xp: xp,
      name: names[Math.min(lv - 1, names.length - 1)],
      next: next, pct: next > prev ? Math.round((xp - prev) / (next - prev) * 100) : 100,
    };
  };

  /* ---------------- 档案导出 / 导入 ---------------- */
  var SCHEMA = 1;
  Z.exportArchive = function () {
    var data = { schemaVersion: SCHEMA, exportedAt: new Date().toISOString(), app: 'yz-math', keys: {} };
    ['yz-profile-v1', 'yz-daylog-v1', 'yz-goal-v1', 'yz-csrs-v1', 'yz-qlog-v1',
      'yz-method-v1', 'yz-ladder-v1', 'yz-exam-v1', 'yz-plan-v1', THEME_KEY].forEach(function (k) {
      var v = localStorage.getItem(k);
      if (v != null) data.keys[k] = v;
    });
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'yz-math-archive-' + dayKey() + '.json';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };
  Z.importArchive = function (json) {
    try {
      var data = typeof json === 'string' ? JSON.parse(json) : json;
      if (!data || !data.keys) throw new Error('格式不正确');
      if ((data.schemaVersion || 0) > SCHEMA) throw new Error('档案版本过新');
      Object.keys(data.keys).forEach(function (k) {
        if (k.indexOf('yz-') !== 0) return;
        localStorage.setItem(k, data.keys[k]);
      });
      Z.toast('档案已导入，即将刷新');
      setTimeout(function () { location.reload(); }, 900);
      return true;
    } catch (e) {
      Z.toast('导入失败：' + e.message);
      return false;
    }
  };

  /* ---------------- 通用交互 ---------------- */
  ready(function () {
    // 主题按钮
    var tb = document.querySelector('.theme-btn');
    if (tb) {
      tb.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀' : '☾';
      tb.addEventListener('click', function () { Z.toggleTheme(); });
    }
    // 移动端菜单
    var mb = document.querySelector('.menu-btn');
    var nav = document.querySelector('.hdr-nav');
    if (mb && nav) {
      mb.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    // 当前导航高亮
    var path = location.pathname.split('/').pop() || 'index.html';
    var dir = location.pathname.replace(/[^/]*$/, '').split('/').filter(Boolean).pop() || '';
    document.querySelectorAll('.hdr-nav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var parts = href.split('/');
      var file = parts.pop();
      var folder = parts.filter(function (p) { return p && p !== '..'; }).pop() || '';
      var match = file === path && (folder === dir || !folder);
      if (match) a.classList.add('on');
    });
    /* 「更多」下拉：点击切换，点外部或 Esc 关闭。
       移动端（≤980px）由 CSS 改为平铺，这里不介入。 */
    var navMore = document.getElementById('navMore');
    var navMoreBtn = document.getElementById('navMoreBtn');
    if (navMore && navMoreBtn) {
      navMoreBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = navMore.classList.toggle('open');
        navMoreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('click', function (e) {
        if (!navMore.contains(e.target)) {
          navMore.classList.remove('open');
          navMoreBtn.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          navMore.classList.remove('open');
          navMoreBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    /* 图形题配图点击放大。
       为什么用事件委托而不是逐个绑定：练习页的题是运行时动态插入的，
       逐绑会在每次换题后失效。委托到 document 上就一劳永逸。
       用原生 <dialog> 而不是 window.open：file:// 下 window.open 常被拦。 */
    document.addEventListener('click', function (e) {
      var fig = e.target.closest && e.target.closest('.q-fig');
      if (fig) {
        var id = fig.getAttribute('data-zoom');
        var dlg = id && document.getElementById(id);
        if (dlg && dlg.showModal) { dlg.showModal(); return; }
        if (dlg) { dlg.setAttribute('open', ''); return; }
      }
      /* 点放大图本身 或 关闭按钮 → 关闭 */
      var zimg = e.target.closest && e.target.closest('.q-zoom img');
      var zbtn = e.target.closest && e.target.closest('.q-zoom-close');
      if (zimg || zbtn) {
        var d = (zimg ? zimg.parentNode : zbtn.parentNode);
        if (d && d.close) d.close();
        else if (d) d.removeAttribute('open');
      }
    });
    /* 点 backdrop 关闭（点 dialog 自身而不是内部 img） */
    document.addEventListener('click', function (e) {
      if (e.target.classList && e.target.classList.contains('q-zoom')) {
        if (e.target.close) e.target.close();
      }
    });
    /* Esc 关闭（浏览器对 dialog 原生支持，这里兜底旧内核） */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = document.querySelector('.q-zoom[open]');
      if (open && open.close) open.close();
    });

    // 滚动进度
    var sp = document.querySelector('.scroll-progress');
    if (sp) {
      var onScroll = function () {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        sp.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      };
      document.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  });
})(window);
