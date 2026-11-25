/* ==========================================================
   分步引擎 step-engine.js
   替代英语站的 ZK.quiz（四选一）。
   核心差异：判定的单位是「步骤」不是「题」，
   所以能记录 stuckStep —— 卡在第几步，这是错因诊断的原始数据。

   三种模式：
     guided     逐步给 ask，答对进下一步，答错立刻给 hint。
                用于新学方法卡之后。
     selfcheck  一次展示全部步骤骨架（只给动词短语，不给答案），
                用户逐步勾「做出来了 / 卡住了」，最后展开完整解答自评。
                用于解答题（27/28）。
     timed      全部题连续作答不打断，交卷后统一判。
                用于整卷。

   用法：
     BJM.step({
       mount: '#stage',
       questions: [q1, q2, ...],
       mode: 'guided',
       limit: 12,
       onStep: (q, stepIdx, ok) => {},
       onAnswer: (q, ok, rec) => {},
       onFinish: (result) => {},
     })
   ========================================================== */
(function (global) {
  'use strict';

  var Z = global.YZ = global.YZ || {};
  global.BJM = Z; /* 兼容别名 */
  var esc = Z.esc || function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ---------------- 答案规范化 ---------------- */
  /* 数值等价：1/2 ≡ 0.5 ≡ 0.50；容忍 1e-6。支持分数、根号、π 常见写法。 */
  function normNum(s) {
    var t = String(s == null ? '' : s)
      .replace(/[\uFF01-\uFF5E]/g, function (c) {          // 全角 → 半角
        return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
      })
      .replace(/[，、；：]/g, function (c) {                // 中文标点
        return { '，': ',', '、': ',', '；': ';', '：': ':' }[c];
      })
      .replace(/[－−–—]/g, '-')
      .replace(/\s+/g, '')
      .replace(/^x=/i, '')                                 // 允许 "x=3"
      .replace(/^y=/i, '')
      .replace(/。$/, '')
      .toLowerCase();
    return t;
  }

  /** 把 "1/2" "-3/4" "√2" 转成数值；转不了返回 NaN */
  function toNum(s) {
    var t = normNum(s);
    if (!t) return NaN;
    var m = /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/.exec(t);
    if (m) {
      var d = Number(m[2]);
      return d === 0 ? NaN : Number(m[1]) / d;
    }
    if (/^-?\d+(?:\.\d+)?$/.test(t)) return Number(t);
    return NaN;
  }

  function answerMatches(input, accept) {
    var list = Array.isArray(accept) ? accept : [accept];
    var ni = normNum(input);
    var vi = toNum(input);
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (ni === normNum(a)) return true;
      var va = toNum(a);
      if (Number.isFinite(vi) && Number.isFinite(va) && Math.abs(vi - va) < 1e-6) return true;
    }
    return false;
  }

  /* ---------------- 单题步骤状态 ---------------- */
  function newState(q, mode) {
    return {
      q: q,
      mode: mode,
      stepIdx: 0,          // guided: 当前步；selfcheck: 当前勾选到第几步
      stuckStep: -1,       // 第一次答错/勾「卡住」的步序号；-1 表示没卡
      results: [],         // 每步 {ok, input, ms}
      startAt: Date.now(),
      done: false,
      left: false,         // 本题是否已经离开（防重复推进：自动跳 + 手动点会撞）
      autoShown: false,    // 是否已自动展示结果卡（防 guidedDone 被调用两次）
      selfChecks: [],      // selfcheck: 每步 true=做出来 / false=卡住
      revealed: false,     // selfcheck: 是否已展开完整解答
    };
  }

  /* ---------------- 渲染工具 ---------------- */
  /** 任意字段：构建期已渲染的 xxxHtml 优先（含公式 SVG），否则转义纯文本。
      理科题目的 hint/why/answer 常含公式，漏用 *Html 会显示成 $...$ 原文。 */
  function fieldHtml(obj, key) {
    if (!obj) return '';
    var h = obj[key + 'Html'];
    if (h != null) return h;
    return esc(obj[key] == null ? '' : obj[key]);
  }

  /** 选项文本：构建期已渲染的 optionsHtml 优先（含公式 SVG），否则转义纯文本 */
  function optHtml(s, k) {
    if (s && s.optionsHtml && s.optionsHtml[k] != null) return s.optionsHtml[k];
    if (s && s.options && s.options[k] != null) return esc(s.options[k]);
    return '';
  }
  function stepTypeLabel(t) {
    return { choice: '选择', fill: '填空', judge: '判断', expr: '选等价形式' }[t] || '作答';
  }

  Z.step = function (opts) {
    var host = typeof opts.mount === 'string' ? document.querySelector(opts.mount) : opts.mount;
    if (!host) return null;

    var mode = opts.mode || 'guided';
    var pool = (opts.questions || []).slice();
    if (opts.shuffle) pool = shuffle(pool);
    if (opts.limit) pool = pool.slice(0, opts.limit);
    var total = pool.length;
    if (!total) {
      host.innerHTML = '<div class="empty">没有可用的题目</div>';
      return null;
    }

    var qi = 0;                 // 第几题
    var state = null;           // 当前题状态
    var answeredCount = 0;      // 完成的题数
    var correctCount = 0;       // 全步正确的题数
    var allResults = [];        // 每题一条记录
    var combo = 0, bestCombo = 0;
    var finished = false;

    host.innerHTML = shell();
    var el = {
      prog: host.querySelector('.se-prog > i'),
      count: host.querySelector('.se-count'),
      combo: host.querySelector('.se-combo'),
      body: host.querySelector('.se-body'),
    };

    function shell() {
      return '<div class="se-shell">' +
        '<div class="se-top">' +
          '<div class="se-prog"><i></i></div>' +
          '<span class="se-count">1 / ' + total + '</span>' +
          '<span class="se-combo">🔥 连击 0</span>' +
        '</div>' +
        '<div class="se-body"></div>' +
      '</div>';
    }

    function paintTop() {
      el.prog.style.width = (qi / total * 100) + '%';
      el.count.textContent = (qi + 1) + ' / ' + total;
      el.combo.textContent = '🔥 连击 ' + combo;
    }

    /* ---------- 进入下一题 ---------- */
    function nextQuestion() {
      if (qi >= total) return finish();
      /* 每题重置「已落盘」标记，否则第二题起会被 recordNow 的开头
         if (_pendingRec) return 挡掉，错题一条也记不下来。 */
      _pendingRec = null;
      /* 清掉上一题的自动跳转定时器：
         答对后 700ms 自动进下一题，若用户在这 700ms 内自己点了「下一题」，
         定时器仍会触发并再跳一次——等于一次点击跳过两道题。
         state 换新时旧 timer 的守卫看不出来（它闭包的是旧 state），
         所以必须在这里显式清。 */
      if (state && state.autoTimer) { clearTimeout(state.autoTimer); state.autoTimer = null; }
      state = newState(pool[qi], mode);
      state.autoTimer = null;
      // 调试钩子：便于自动化测试与卡点统计取当前题
      host.__curQ = state.q;
      host.__state = state;
      paintTop();
      if (mode === 'guided') drawGuided();
      else if (mode === 'selfcheck') drawSelfcheck();
      else drawTimed();
    }

    /* ---------- 记录一题完成 ---------- */
    function completeQuestion(ok) {
      if (!state || state.done) return;
      state.done = true;
      state.ms = Date.now() - state.startAt;
      /* nearMiss（会做但错）：只错在最后一步。
         判据：总步数 ≥ 2，且除最后一步外全部正确，最后一步错。
         这是初一最值钱的信号——说明知识和路径都对，只是收尾出错。 */
      var steps = state.q.steps || [];
      var nearMiss = false;
      if (!ok && steps.length >= 2) {
        var allButLastOk = true;
        for (var i = 0; i < steps.length - 1; i++) {
          if (!state.results[i] || !state.results[i].ok) { allButLastOk = false; break; }
        }
        var last = state.results[steps.length - 1];
        if (allButLastOk && last && !last.ok) nearMiss = true;
      }
      /* errTag：单选选错时由 drawByQtype 写入 results[0].errTag */
      var lastR = state.results[state.results.length - 1];
      var rec = {
        id: state.q.id,
        chapter: state.q.chapter,
        method: state.q.method,
        tier: state.q.tier,
        qtype: state.q.qtype,
        mode: mode,
        result: ok ? 'right' : 'wrong',
        stuckStep: state.stuckStep,
        errTag: (lastR && lastR.errTag) || null,
        timeMs: state.ms,
        nearMiss: nearMiss,
        steps: state.results.slice(),
      };
      allResults.push(rec);
      answeredCount++;
      if (ok) {
        correctCount++;
        combo++;
        if (combo > bestCombo) bestCombo = combo;
        if (Z.sfx) Z.sfx('ok');
      } else {
        combo = 0;
        if (Z.sfx) Z.sfx('bad');
      }
      paintTop();
      /* onAnswer 已在 recordNow 里调过（作答瞬间落盘）。
         这里只补 nearMiss 这类需要「全部结果」才知道的字段，
         不重复调 onAnswer——否则同一题会被记两次错。 */
      if (_pendingRec && nearMiss) {
        _pendingRec.nearMiss = true;
        if (Z.qRecord) {
          var w = (Z.wrongMap && Z.wrongMap()) || {};
          if (w[state.q.id]) { w[state.q.id].nearMiss = true; }
        }
      }
    }

    /* 作答瞬间就把记录写下来，不等「下一题」。
       为什么：错题本的意义是「答错的那一刻就被记住」。
       如果等到点「下一题」才写，学生看完解析直接关页面，
       这道错题就永久丢了——而看完解析就关是最常见的真实行为。
       同一题重复调用由 qRecord 的幂等性保证（同一 id 只累加错次）。 */
    var _pendingRec = null;
    function recordNow() {
      if (_pendingRec) return;
      var q = state.q;
      if (!q) return;
      var r0 = state.results[0];
      if (!r0) return;
      var ok = q.qtype === 'big' ? true : !!r0.ok;
      _pendingRec = {
        id: q.id, chapter: q.chapter, method: q.method, tier: q.tier,
        qtype: q.qtype, mode: mode,
        result: ok ? 'right' : 'wrong',
        stuckStep: ok ? -1 : 0,
        errTag: r0.errTag || null,
        timeMs: Date.now() - state.startAt,
        nearMiss: false,
      };
      if (opts.onAnswer) opts.onAnswer(q, ok, _pendingRec, _pendingRec.errTag);
    }

    /* ==========================================================
       模式一：guided —— 逐步作答
       ========================================================== */
    /* ==========================================================
       四类题型渲染（2026-11-24）
       ----------------------------------------------------------
       单选 single —— ABCD 四选一，选错按干扰项的 errTag 反推错因
       计算 calc   —— 填一个答案，自动判
       大题 big    —— 只给题干 + 完整解答，不判分（真题解答题靠老师批）
       判断 judge  —— 概念/方法辨析，仍是两步按钮
       ---------------------------------------------------------- */
    /* 答错时立刻把解析摊开——不藏在 <details> 里。
       用户要求「错题要有解析」，藏在折叠里的解析等于没有。 */
    function solBox(q) {
      if (!q.solutionHtml && !q.solution) {
        return '<span class="se-nosol">本题暂无解析（原卷未提供答案）</span>';
      }
      return '<div class="se-solbox"><b>为什么</b>' +
        (q.solutionHtml || esc(q.solution)) + '</div>' +
        (q.pitfallHtml ? '<div class="se-pit-box"><b>易错</b>' + q.pitfallHtml + '</div>' : '');
    }

    function drawByQtype() {
      var q = state.q;
      var qt = q.qtype || 'calc';
      var h = '<div class="se-card">';
      h += '<div class="se-meta"><span class="se-tag">' + esc(q.tierName || '练习') + '</span>' +
        '<span class="se-stepno">' + ({single:'单选', calc:'计算', big:'大题', judge:'判断'}[qt] || '') + '</span></div>';
      if (q.trace && q.trace.n > 0) {
        /* 真题溯源：列出可点的真题条目，点进核验页看原题原文 */
        var tsrc = (q.trace.srcs || []);
        var links = tsrc.map(function (x) {
          if (!x || !x.paperId) return '';
          return '<a class="se-trace-lnk" href="exam-verify.html#' + x.paperId + '-q' + x.no +
            '" target="_blank" rel="noopener">' + esc(x.label) + '</a>';
        }).filter(Boolean).join('');
        h += '<div class="se-trace">真题溯源 · 对应 ' + q.trace.n + ' 道' +
          (links ? '：' + links : ' · 最近 ' + esc(q.trace.latest || '') + ' 第 ' + q.trace.latestNo + ' 题') +
          '</div>';
      }
      h += '<div class="se-stem">' + (q.stemHtml || esc(q.stem || '')) + '</div>';
      if (q.figHtml) h += '<div class="se-fig">' + q.figHtml + '</div>';

      if (qt === 'single') {
        h += '<div class="se-opts">';
        (q.optionsHtml || q.options || []).forEach(function (o, k) {
          h += '<button class="se-opt" data-k="' + k + '"><span class="se-key">' +
            'ABCD'[k] + '</span><span>' + (q.optionsHtml ? q.optionsHtml[k] : esc(o)) + '</span></button>';
        });
        h += '</div>';
      } else if (qt === 'calc') {
        h += '<div class="se-fill"><input class="se-input" type="text" autocomplete="off" ' +
          'autocapitalize="off" spellcheck="false" placeholder="填答案后按 Enter">' +
          '<button class="btn primary se-submit">提交</button></div>';
      }
      /* big：不给作答区，只留「看解答」 */

      /* 内容不可用说明：放在作答区之前，学生一眼能看到「这题为什么长这样」 */
      if (q.unavailableNote) {
        h += '<div class="se-unavail">' + esc(q.unavailableNote) + '</div>';
      } else if (q.optMissing) {
        h += '<div class="se-unavail">选项 ' + esc(q.optMissing) +
          ' 在原卷中是公式图，未能提取；其余选项与判分不受影响。</div>';
      }
      h += '<div class="se-fb"></div>';
      h += '<div class="se-actions"><span class="spacer"></span>' +
        '<button class="btn primary se-next"' + (qt === 'big' ? '' : ' disabled') + '>' +
        (qt === 'big' ? '看解答 →' : '看结果 →') + '</button></div>';
      h += '</div>';
      el.body.innerHTML = h;

      var fb = el.body.querySelector('.se-fb');
      var nextBtn = el.body.querySelector('.se-next');
      var answered = false;

      function record(ok, errTag, chosen) {
        if (answered) return;
        answered = true;
        var ms = Date.now() - state.startAt;
        state.results[0] = { ok: ok, input: chosen || '', ms: ms, errTag: errTag || null };
        if (!ok) state.stuckStep = 0;
        if (opts.onStep) opts.onStep(q, 0, ok, errTag);
        nextBtn.disabled = false;
        nextBtn.focus();
        /* 音效在作答瞬间响，不等结算。
           completeQuestion 里也有 sfx，但那只在整题结算时触发；
           答错不自动推进，结算可能几秒后才发生，那时再响已脱离「我错了」这一刻。
           这里覆盖 single / calc 两类（judge 与多步题在 drawGuided 里各自处理）。 */
        if (Z.sfx) Z.sfx(ok ? 'ok' : 'bad');
        /* 立刻落盘，不等「下一题」 */
        recordNow();
        /* 答对 → 立刻结算并跳下一题（guidedDone 内部会直接 nextQuestion）。
           不给延迟：答对就是答对了，让用户多等一会儿没有任何信息增量。
           答错不自动推进——解析要留在屏幕上给用户读。
           用 state.autoShown 防重：guidedDone 会重建 DOM，
           重复进入会绑出两个监听器，一次点击连跳两题。 */
        if (ok && qt !== 'big' && !state.autoShown) {
          state.autoShown = true;
          guidedDone();
        }
      }

      if (qt === 'single') {
        var btns = el.body.querySelectorAll('.se-opt');
        [].forEach.call(btns, function (b) {
          b.addEventListener('click', function () {
            if (answered) return;
            var k = parseInt(b.getAttribute('data-k'), 10);
            /* 无官方答案（如 2022-23 卷只有原卷没解析）：
               让学生看到自己选了什么，但不判对错、不计入统计。 */
            if (q.key == null) {
              [].forEach.call(btns, function (x) { x.classList.add('locked'); });
              b.classList.add('picked');
              fb.className = 'se-fb';
              fb.innerHTML = '<b>已选 ' + 'ABCD'[k] + '</b>' +
                '<span>这套卷没有官方答案，不判分。可对照原卷自行核对。</span>' +
                (q.trace && q.trace.srcs && q.trace.srcs[0]
                  ? '<span><a href="exam-verify.html#' + q.trace.srcs[0].paperId + '-q' + q.trace.srcs[0].no +
                    '" target="_blank" rel="noopener">去看原卷 →</a></span>' : '');
              answered = true;
              state.results[0] = { ok: true, input: 'ABCD'[k], ms: 0, errTag: null, skipped: true };
              nextBtn.disabled = false;
              nextBtn.focus();
              return;
            }
            var ok = k === q.key;
            /* 选错时反推错因。两条路，优先按下标查：
               ① optTags[k]——真题的干扰项错因按选项下标手写（选项是公式图，
                  文本是占位符，按文本匹配根本匹配不上）；
               ② distractors——原创题按选项文本匹配。
               两条都拿不到就给 null，不硬猜。 */
            var errTag = null, whyTxt = '';
            if (!ok) {
              if (q.optTags && q.optTags[k]) {
                errTag = q.optTags[k];
              } else if (q.distractors) {
                var dv = (q.options || [])[k];
                var d = q.distractors.filter(function (x) { return String(x.v) === String(dv); })[0];
                if (d) { errTag = d.errTag; whyTxt = d.why || ''; }
              }
            }
            [].forEach.call(btns, function (x) {
              var xi = parseInt(x.getAttribute('data-k'), 10);
              x.classList.add('locked');
              if (xi === q.key) x.classList.add('right');
              else if (xi === k) x.classList.add('wrong');
            });
            fb.className = 'se-fb ' + (ok ? 'ok' : 'bad');
            fb.innerHTML = ok
              ? '<b>✓ 正确</b>' + (q.pitfallHtml ? '<span class="se-pit">这类题的坑：' + q.pitfallHtml + '</span>' : '')
              : '<b>✕ 选错了</b>' + (whyTxt ? '<span>你选的这项：' + esc(whyTxt) + '</span>' : '') +
                (q.answerHtml ? '<span>正确答案是 <b>' + q.answerHtml + '</b></span>' : '') +
                solBox(q);
            record(ok, errTag, (q.options || [])[k]);
          });
        });
      } else if (qt === 'calc') {
        var inp = el.body.querySelector('.se-input');
        var submit = el.body.querySelector('.se-submit');
        var doSubmit = function () {
          if (answered) return;
          var v = (inp.value || '').trim();
          if (!v) return;
          var acc = q.accept || [];
          var norm = function (x) {
            return String(x).replace(/\s+/g, '').replace(/[（）()]/g, '')
              .replace(/×/g, '*').replace(/−/g, '-').replace(/°/g, '').toLowerCase();
          };
          var ok = acc.some(function (a) { return norm(a) === norm(v); });
          inp.readOnly = true;
          fb.className = 'se-fb ' + (ok ? 'ok' : 'bad');
          fb.innerHTML = ok
            ? '<b>✓ 正确</b>' + (q.pitfallHtml ? '<span class="se-pit">这类题的坑：' + q.pitfallHtml + '</span>' : '')
            : '<b>✕ 答案不对</b>' + (q.answerHtml ? '<span>正确答案是 <b>' + q.answerHtml + '</b></span>' : '') +
              solBox(q);
          record(ok, ok ? null : 'calc', v);
        };
        if (submit) submit.addEventListener('click', doSubmit);
        if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSubmit(); });
      } else if (qt === 'big') {
        /* 大题不判分：直接展示完整解答，用户自评 */
        fb.className = 'se-fb';
        fb.innerHTML = '<div class="se-solbox"><b>完整解答</b>' +
          (q.solutionHtml || esc(q.solution || '（本题暂无解析）')) + '</div>' +
          (q.pitfallHtml ? '<div class="se-pit-box"><b>易错</b>' + q.pitfallHtml + '</div>' : '') +
          '<div class="se-selfnote">大题不自动判分。对照解答自己看：过程写全了吗？每步依据写了吗？</div>';
        record(true, null, '');
      }

      nextBtn.addEventListener('click', function () {
        if (state.done) return;
        guidedDone();
      });
    }

    function drawGuided() {
      var q = state.q;
      /* 新四类题型（single/calc/big）走专用渲染；judge 与旧 steps 走原逻辑 */
      if (q.qtype === 'single' || q.qtype === 'calc' || q.qtype === 'big') {
        return drawByQtype();
      }
      var steps = q.steps || [];
      var s = steps[state.stepIdx];

      if (!s) return guidedDone();

      var h = '<div class="se-card">';
      h += '<div class="se-meta"><span class="se-tag">' + esc(q.tierName || '练习') + '</span>' +
        '<span class="se-stepno">第 ' + (state.stepIdx + 1) + ' / ' + steps.length + ' 步</span></div>';
      /* 真题溯源：做题时就能看到「这道题对应真题哪道」 */
      if (q.trace && q.trace.n > 0) {
        /* 真题溯源：列出可点的真题条目，点进核验页看原题原文 */
        var tsrc = (q.trace.srcs || []);
        var links = tsrc.map(function (x) {
          if (!x || !x.paperId) return '';
          return '<a class="se-trace-lnk" href="exam-verify.html#' + x.paperId + '-q' + x.no +
            '" target="_blank" rel="noopener">' + esc(x.label) + '</a>';
        }).filter(Boolean).join('');
        h += '<div class="se-trace">真题溯源 · 对应 ' + q.trace.n + ' 道' +
          (links ? '：' + links : ' · 最近 ' + esc(q.trace.latest || '') + ' 第 ' + q.trace.latestNo + ' 题') +
          '</div>';
      }
      h += '<div class="se-stem">' + (q.stemHtml || esc(q.stem || '')) + '</div>';
      if (q.figHtml) h += '<div class="se-fig">' + q.figHtml + '</div>';

      // 已完成步骤的折叠回顾
      if (state.stepIdx > 0) {
        h += '<ol class="se-done">';
        for (var i = 0; i < state.stepIdx; i++) {
          var r = state.results[i];
          h += '<li class="' + (r && r.ok ? 'ok' : 'bad') + '"><b>' + (steps[i].labelHtml || esc(steps[i].label || ('第 ' + (i + 1) + ' 步'))) +
            '</b><span>' + esc((r && r.input) || '') + '</span></li>';
        }
        h += '</ol>';
      }

      h += '<div class="se-ask">' + (s.askHtml || esc(s.ask)) + '</div>';

      if (s.type === 'choice' || s.type === 'expr') {
        h += '<div class="se-opts">';
        (s.options || []).forEach(function (o, k) {
          h += '<button class="se-opt" data-k="' + k + '"><span class="se-key">' +
            'ABCD'[k] + '</span><span>' + optHtml(s, k) + '</span></button>';
        });
        h += '</div>';
      } else if (s.type === 'judge') {
        h += '<div class="se-opts se-opts-2">' +
          '<button class="se-opt" data-k="1"><span class="se-key">✓</span><span>成立</span></button>' +
          '<button class="se-opt" data-k="0"><span class="se-key">✕</span><span>不成立</span></button>' +
          '</div>';
      } else {
        h += '<div class="se-fill"><input class="se-input" type="text" autocomplete="off" ' +
          'autocapitalize="off" spellcheck="false" placeholder="' + esc(s.placeholder || '输入答案后按 Enter') + '">' +
          '<button class="btn primary se-submit">提交</button></div>';
      }

      h += '<div class="se-fb"></div>';
      // 单步题（送分区选填）答完即结束，不再要求点「下一步」
      var single = steps.length === 1;
      h += '<div class="se-actions"><span class="spacer"></span>' +
        '<button class="btn primary se-next" disabled>' + (single ? '看结果 →' : '下一步 →') + '</button></div>';
      h += '</div>';
      el.body.innerHTML = h;

      var fb = el.body.querySelector('.se-fb');
      var nextBtn = el.body.querySelector('.se-next');

      function judge(ok, input) {
        var ms = Date.now() - state.startAt;
        state.results[state.stepIdx] = { ok: ok, input: input, ms: ms };
        if (!ok && state.stuckStep < 0) state.stuckStep = state.stepIdx;
        if (opts.onStep) opts.onStep(q, state.stepIdx, ok);

        if (ok) {
          fb.className = 'se-fb ok';
          fb.innerHTML = '<b>✓ 这一步对了</b>' + (s.why ? '<span>' + fieldHtml(s, 'why') + '</span>' : '');
          nextBtn.disabled = false;
          nextBtn.focus();
          // 单步题：答对后直接进结果，省一次点击
          if (steps.length === 1) { setTimeout(function () { if (!state.done) guidedDone(); }, 620); }
        } else {
          fb.className = 'se-fb bad';
          /* 答错要摊开解析，不能只给「提示 + 正确答案」。
             单步题（概念判断、单步填空）整题就只有这一步，
             答错后不给 why 等于「错了但不知道为什么」——
             而这类题正是考「条件边界」的，没有解释就没有学习。
             多步题的中间步骤仍只给提示：那里需要学生自己再试，
             一上来摊全解会剥夺思考。 */
          var isLast = state.stepIdx >= steps.length - 1;
          fb.innerHTML = '<b>✕ 卡在这一步</b>' +
            (s.hint ? '<div class="se-hint"><span class="se-hint-t">提示</span>' + fieldHtml(s, 'hint') + '</div>' : '') +
            (s.answer ? '<div class="se-ans">这一步应该是：<b>' + fieldHtml(s, 'answer') + '</b></div>' : '') +
            ((steps.length === 1 || isLast) ? solBox(q) : '');
          nextBtn.disabled = false;
          nextBtn.focus();
          /* 答错瞬间就响，不等「下一步」。
             completeQuestion 里也有 sfx('bad')，但那只在整题结算时触发；
             答错不自动推进（用户要停下来看解析），结算可能几秒后才发生，
             那时再响已经脱离「我错了」这个时刻。 */
          if (Z.sfx) Z.sfx('bad');
        }
      }

      if (s.type === 'choice' || s.type === 'expr') {
        var btns = el.body.querySelectorAll('.se-opt');
        [].forEach.call(btns, function (b) {
          b.addEventListener('click', function () {
            if (b.classList.contains('locked')) return;
            var k = parseInt(b.getAttribute('data-k'), 10);
            var ok = k === s.key;
            [].forEach.call(btns, function (x) {
              var xi = parseInt(x.getAttribute('data-k'), 10);
              x.classList.add('locked');
              if (xi === s.key) x.classList.add('right');
              else if (xi === k) x.classList.add('wrong');
            });
            judge(ok, (s.options || [])[k] || ('选项' + (k + 1)));
          });
        });
      } else if (s.type === 'judge') {
        var jb = el.body.querySelectorAll('.se-opt');
        [].forEach.call(jb, function (b) {
          b.addEventListener('click', function () {
            if (b.classList.contains('locked')) return;
            var k = parseInt(b.getAttribute('data-k'), 10) === 1;
            var ok = k === !!s.key;
            [].forEach.call(jb, function (x) { x.classList.add('locked'); });
            b.classList.add(ok ? 'right' : 'wrong');
            if (!ok) {
              var right = el.body.querySelector('.se-opt[data-k="' + (s.key ? 1 : 0) + '"]');
              if (right) right.classList.add('right');
            }
            judge(ok, k ? '成立' : '不成立');
          });
        });
      } else {
        var inp = el.body.querySelector('.se-input');
        var submit = function () {
          if (inp.readOnly) return;
          var ok = answerMatches(inp.value, s.accept || s.answer);
          inp.readOnly = true;
          inp.classList.add(ok ? 'right' : 'wrong');
          el.body.querySelector('.se-submit').disabled = true;
          judge(ok, inp.value);
        };
        el.body.querySelector('.se-submit').addEventListener('click', submit);
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
        inp.focus();
      }

      nextBtn.addEventListener('click', function () {
        state.stepIdx++;
        if (state.stepIdx >= steps.length) guidedDone();
        else drawGuided();
      });
    }

    function guidedDone() {
      var q = state.q;
      /* 新四类题型（single/calc/big）只有 1 个结果，不能拿旧 steps 长度比；
         big 不判分，按「已完成」处理（ok=true 但不计入正确率）。 */
      var ok;
      if (q.qtype === 'single' || q.qtype === 'calc' || q.qtype === 'big') {
        var r0 = state.results[0];
        ok = q.qtype === 'big' ? true : !!(r0 && r0.ok);
      } else {
        ok = state.results.length === (q.steps || []).length && state.results.every(function (r) { return r && r.ok; });
      }
      completeQuestion(ok);

      /* 答对且不是最后一题 → 直接跳下一题，不插「本题完成」中间页。
         为什么去掉：答对时那张卡只显示一句「✓ 全部步骤正确」，
         用户还要等 700ms 或再点一次，纯属多一步。
         答错仍保留结果卡——那上面有「卡在第几步」和完整解答，
         是需要停下来读的内容。
         最后一题也保留：后面接总览页，需要一个过渡确认。 */
      if (ok && qi + 1 < total) {
        qi++;
        nextQuestion();
        return;
      }

      var h = '<div class="se-card se-done-card">';
      h += '<div class="se-kicker">本题完成</div>';
      h += '<div class="se-result ' + (ok ? 'ok' : 'bad') + '">' +
        (ok ? '✓ 全部步骤正确' : '✕ 卡在第 ' + (state.stuckStep + 1) + ' 步') + '</div>';
      if (q.solution) {
        h += '<details class="se-sol"><summary>看完整解答</summary><div>' + (q.solutionHtml || esc(q.solution)) + '</div></details>';
      }
      h += '<div class="se-actions"><span class="spacer"></span>' +
        '<button class="btn primary se-go">' + (qi + 1 >= total ? '看结果 →' : '下一题 →') + '</button></div>';
      h += '</div>';
      el.body.innerHTML = h;

      function go() {
        qi++;
        if (qi >= total) finish(); else nextQuestion();
      }
      el.body.querySelector('.se-go').addEventListener('click', go);
    }

    /* ==========================================================
       模式二：selfcheck —— 步骤骨架自查
       不给答案，只给「这一步要做什么」；用户勾做出来/卡住。
       ========================================================== */
    function drawSelfcheck() {
      var q = state.q;
      var steps = q.steps || [];
      var h = '<div class="se-card">';
      h += '<div class="se-meta"><span class="se-tag">' + esc(q.tierName || '解答题') + '</span>' +
        '<span class="se-stepno">' + steps.length + ' 步 · 自评</span></div>';
      h += '<div class="se-stem">' + (q.stemHtml || esc(q.stem || '')) + '</div>';
      if (q.figHtml) h += '<div class="se-fig">' + q.figHtml + '</div>';

      h += '<div class="se-selfnote">先自己在纸上做一遍，再逐步勾选。<b>勾「卡住」会给你两条提示。</b></div>';

      h += '<ol class="se-steps">';
      steps.forEach(function (s, i) {
        h += '<li class="se-step" data-i="' + i + '">' +
          '<div class="se-step-head"><span class="se-step-no">' + (i + 1) + '</span>' +
          '<span class="se-step-label">' + (s.labelHtml || esc(s.label || s.ask)) + '</span>' +
          '<span class="se-step-score">' + (s.score || 1) + ' 分</span></div>' +
          '<div class="se-step-btns">' +
            '<button class="se-sc ok" data-v="1">做出来了</button>' +
            '<button class="se-sc bad" data-v="0">卡住了</button>' +
          '</div>' +
          '<div class="se-step-fb"></div>' +
          '</li>';
      });
      h += '</ol>';

      h += '<div class="se-actions">' +
        '<button class="btn ghost se-reveal" disabled>看完整解答并自评</button>' +
        '<span class="spacer"></span>' +
        '<button class="btn primary se-go" disabled>' + (qi + 1 >= total ? '看结果 →' : '下一题 →') + '</button>' +
        '</div>';
      h += '<div class="se-solbox"></div>';
      h += '</div>';
      el.body.innerHTML = h;

      var items = el.body.querySelectorAll('.se-step');
      var revealBtn = el.body.querySelector('.se-reveal');
      var goBtn = el.body.querySelector('.se-go');
      var solBox = el.body.querySelector('.se-solbox');
      state.selfChecks = new Array(steps.length).fill(null);

      function refreshGates() {
        var all = state.selfChecks.every(function (v) { return v !== null; });
        revealBtn.disabled = !all;
      }

      [].forEach.call(items, function (li) {
        var i = parseInt(li.getAttribute('data-i'), 10);
        var s = steps[i];
        var fb = li.querySelector('.se-step-fb');
        [].forEach.call(li.querySelectorAll('.se-sc'), function (b) {
          b.addEventListener('click', function () {
            if (li.classList.contains('locked')) return;
            var v = b.getAttribute('data-v') === '1';
            li.classList.add('locked');
            state.selfChecks[i] = v;
            if (!v && state.stuckStep < 0) state.stuckStep = i;
            if (opts.onStep) opts.onStep(q, i, v);
            if (v) {
              fb.className = 'se-step-fb ok';
              fb.innerHTML = '<span>✓ 已掌握</span>';
            } else {
              fb.className = 'se-step-fb bad';
              var hints = s.hints || (s.hint ? [s.hint] : []);
              fb.innerHTML = '<div class="se-hint-list">' +
                hints.map(function (hx, k) {
                  var hxHtml = (s.hintsHtml && s.hintsHtml[k] != null) ? s.hintsHtml[k] : esc(hx);
                  return '<div class="se-hint"><span class="se-hint-t">提示 ' + (k + 1) + '</span>' + hxHtml + '</div>';
                }).join('') + '</div>' +
                (s.model ? '<a class="se-model-link" href="' + esc(s.model) + '">看对应构造模型 →</a>' : '');
            }
            refreshGates();
          });
        });
      });

      revealBtn.addEventListener('click', function () {
        revealBtn.disabled = true;
        var got = state.selfChecks.filter(Boolean).length;
        var maxScore = steps.reduce(function (a, s) { return a + (s.score || 1); }, 0);
        var gotScore = steps.reduce(function (a, s, i) { return a + (state.selfChecks[i] ? (s.score || 1) : 0); }, 0);
        var pct = maxScore ? Math.round(gotScore / maxScore * 100) : 0;
        var ok = got === steps.length;

        state.revealed = true;
        solBox.innerHTML = '<div class="se-selfresult">' +
          '<div class="se-sr-score">自评 <b>' + pct + '%</b>（约 ' + gotScore + ' / ' + maxScore + ' 分）</div>' +
          '<div class="se-sr-note">⚠ 这是自评估分，不是机器判分。请对照下面的完整解答核对。</div>' +
          '</div>' +
          (q.solution ? '<details class="se-sol" open><summary>完整解答</summary><div>' +
            (q.solutionHtml || esc(q.solution)) + '</div></details>' : '');

        completeQuestion(ok);
        goBtn.disabled = false;
        goBtn.focus();
      });

      goBtn.addEventListener('click', function () {
        qi++;
        if (qi >= total) finish(); else nextQuestion();
      });
    }

    /* ==========================================================
       模式三：timed —— 不打断，交卷后统一判
       客观题（choice/fill/judge）自动判；解答题标记「待自评」。
       ========================================================== */
    var timedAnswers = {};

    function drawTimed() {
      var q = state.q;
      var h = '<div class="se-card">';
      h += '<div class="se-meta"><span class="se-tag">' + esc(q.tierName || '模考') + '</span>' +
        '<span class="se-stepno">第 ' + (qi + 1) + ' 题</span></div>';
      h += '<div class="se-stem">' + (q.stemHtml || esc(q.stem || '')) + '</div>';
      if (q.figHtml) h += '<div class="se-fig">' + q.figHtml + '</div>';

      var first = (q.steps || [])[0];
      var kind = q.kind || (first && first.type) || 'choice';

      if (kind === 'choice' || (first && first.type === 'choice')) {
        h += '<div class="se-opts">';
        (q.options || (first && first.options) || []).forEach(function (o, k) {
          // 选项可能挂在 q（送分题/模考）或 first（多步题）上，两处都要找
          h += '<button class="se-opt" data-k="' + k + '"><span class="se-key">' +
            'ABCD'[k] + '</span><span>' + optHtml(q.options ? q : first, k) + '</span></button>';
        });
        h += '</div>';
      } else if (kind === 'fill' || (first && first.type === 'fill')) {
        h += '<div class="se-fill"><input class="se-input" type="text" autocomplete="off" spellcheck="false" ' +
          'placeholder="填答案"><button class="btn soft se-clear">清除</button></div>';
      } else {
        h += '<div class="se-answerbox"><textarea class="se-textarea" rows="4" ' +
          'placeholder="解答题：先在纸上作答，此处可写关键步骤（交卷后自评）"></textarea></div>';
      }

      h += '<div class="se-actions"><button class="btn ghost se-skip">跳过</button><span class="spacer"></span>' +
        '<button class="btn primary se-go">' + (qi + 1 >= total ? '交卷 →' : '下一题 →') + '</button></div>';
      h += '</div>';
      el.body.innerHTML = h;

      var goBtn = el.body.querySelector('.se-go');
      var skipBtn = el.body.querySelector('.se-skip');

      function save() {
        var opts_ = el.body.querySelectorAll('.se-opt.on');
        if (opts_.length) timedAnswers[q.id] = { kind: 'choice', v: parseInt(opts_[0].getAttribute('data-k'), 10) };
        var inp = el.body.querySelector('.se-input');
        if (inp) timedAnswers[q.id] = { kind: 'fill', v: inp.value };
        var ta = el.body.querySelector('.se-textarea');
        if (ta) timedAnswers[q.id] = { kind: 'solve', v: ta.value };
      }

      [].forEach.call(el.body.querySelectorAll('.se-opt'), function (b) {
        b.addEventListener('click', function () {
          [].forEach.call(el.body.querySelectorAll('.se-opt'), function (x) { x.classList.remove('on'); });
          b.classList.add('on');
        });
      });
      var clearBtn = el.body.querySelector('.se-clear');
      if (clearBtn) clearBtn.addEventListener('click', function () { el.body.querySelector('.se-input').value = ''; });

      goBtn.addEventListener('click', function () { save(); qi++; if (qi >= total) finish(); else nextQuestion(); });
      skipBtn.addEventListener('click', function () { qi++; if (qi >= total) finish(); else nextQuestion(); });
    }

    /* ---------- 交卷判分（timed） ---------- */
    function gradeTimed() {
      var right = 0, pending = 0, blank = 0;
      pool.forEach(function (q) {
        var a = timedAnswers[q.id];
        var first = (q.steps || [])[0];
        var kind = q.kind || (first && first.type) || 'choice';
        if (kind === 'solve' || (first && first.type === 'solve')) { pending++; return; }
        if (!a) {
          blank++;
          allResults.push({
            id: q.id, chapter: q.chapter, method: q.method, tier: q.tier,
            mode: 'timed', result: 'blank', stuckStep: -1,
          });
          if (opts.onAnswer) opts.onAnswer(q, false, allResults[allResults.length - 1], (allResults[allResults.length - 1]||{}).errTag);
          return;
        }
        var ok = false;
        if (a.kind === 'choice') ok = a.v === (q.answer != null ? q.answer : (first && first.key));
        else ok = answerMatches(a.v, (q.accept || (first && first.accept) || (q.answer != null ? q.answer : (first && first.answer))));
        if (ok) right++;
        allResults.push({
          id: q.id, chapter: q.chapter, method: q.method, tier: q.tier,
          mode: 'timed', result: ok ? 'right' : 'wrong', stuckStep: -1, input: a.v,
        });
        if (opts.onAnswer) opts.onAnswer(q, ok, allResults[allResults.length - 1], (allResults[allResults.length - 1]||{}).errTag);
      });
      // 让 onFinish 的 correct/answered 与 timed 口径一致
      answeredCount = pool.length;
      correctCount = right;
      return { right: right, pending: pending, blank: blank };
    }

    /* ---------- 结束 ---------- */
    function finish() {
      if (finished) return;
      finished = true;
      var graded = null;
      if (mode === 'timed') graded = gradeTimed();

      el.prog.style.width = '100%';
      var rate, summary;
      if (mode === 'timed') {
        var autoTotal = total - graded.pending;
        rate = autoTotal ? Math.round(graded.right / autoTotal * 100) : 0;
        summary = '自动判分题 <b>' + graded.right + ' / ' + autoTotal + '</b> 正确' +
          (graded.pending ? ' · <b>' + graded.pending + '</b> 道解答题待自评' : '');
      } else {
        rate = answeredCount ? Math.round(correctCount / answeredCount * 100) : 0;
        summary = '完成 <b>' + answeredCount + ' / ' + total + '</b> 题 · 全步正确 <b>' + correctCount + '</b> 题';
      }
      var stuck = allResults.filter(function (r) { return r.stuckStep >= 0; }).length;
      var badge = rate >= 90 ? '🏆 卓越表现' : rate >= 75 ? '🌟 稳步提升' : '💪 发现薄弱点就是进步';

      el.body.innerHTML = '<div class="se-card se-done-card">' +
        '<div class="se-kicker">' + (mode === 'timed' ? '交卷完成' : '本轮完成') + '</div>' +
        '<div class="se-badge">' + badge + '</div>' +
        '<div class="se-rate">' + rate + '<span>%</span></div>' +
        '<div class="se-summary">' + summary + '</div>' +
        (stuck ? '<div class="se-summary">其中 <b>' + stuck + '</b> 题出现卡点，已记入错题诊断</div>' : '') +
        '<div class="se-actions center">' +
          '<button class="btn primary se-again">再来一轮</button>' +
          (opts.wrongHref ? '<a class="btn soft" href="' + esc(opts.wrongHref) + '">去清错题</a>' : '') +
          (opts.backHref ? '<a class="btn ghost" href="' + esc(opts.backHref) + '">' + esc(opts.backLabel || '返回') + '</a>' : '') +
        '</div></div>';

      el.body.querySelector('.se-again').addEventListener('click', function () {
        if (opts.onRestart) return opts.onRestart();
        qi = 0; answeredCount = 0; correctCount = 0; allResults = []; combo = 0; bestCombo = 0;
        finished = false; timedAnswers = {};
        pool = shuffle(pool.slice());
        nextQuestion();
      });

      if (opts.onFinish) {
        opts.onFinish({
          mode: mode,
          total: total,
          answered: answeredCount,
          correct: correctCount,
          rate: rate,
          bestCombo: bestCombo,
          results: allResults,
          timed: graded,
        });
      }
    }

    /* ---------- 键盘 ---------- */
    if (!host.__keys) {
      host.__keys = 1;
      document.addEventListener('keydown', function (e) {
        if (!document.body.contains(host) || finished) return;
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        if (/^[1-4]$/.test(e.key)) {
          var b = host.querySelector('.se-opt[data-k="' + (parseInt(e.key, 10) - 1) + '"]:not(.locked)');
          if (b) { e.preventDefault(); b.click(); }
        } else if (e.key === 'Enter') {
          var nx = host.querySelector('.se-next:not([disabled]), .se-go:not([disabled]), .se-reveal:not([disabled])');
          if (nx) { e.preventDefault(); nx.click(); }
        }
      });
    }

    nextQuestion();

    return {
      finish: finish,
      stats: function () { return { total: total, answered: answeredCount, correct: correctCount, results: allResults }; },
    };
  };

  /* ---------------- 工具 ---------------- */
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  Z.answerMatches = answerMatches;
  Z.normNum = normNum;
})(window);
