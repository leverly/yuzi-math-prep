/* ==========================================================
   内容校验器 · 初一上期末备考站
   用法：node tools/validate.mjs   （有 error 则退出码 1）

   与参考站的关键差异：
     ① 新增「accept 与解析自洽」检查——参考站有一道真题 accept 是 4
        但解析算得 2，这类错误会让学生判对却被解析否定，必须拦住
     ② 新增「计算题必须 ≥2 步」——nearMiss 判据依赖多步，
        单步计算题抓不到「会做但错」
     ③ 新增「数字口径一致」——页面文案里的数字必须来自 STATS，
        参考站因此出现 README 说 P2、页面写 P1 的不同步
     ④ 放宽方法卡「恰 3 变式」——初一的 L1 卡不强制母题+3 变式结构
   ========================================================== */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CHAPTERS, METHODS, ALL_QUESTIONS as QUESTIONS, ALL_CONCEPTS as CONCEPTS,
  CALC_QUESTIONS, METHOD_QUESTIONS, FORMULAS, STATS, EXAM_STRUCTURE, TIERS, DAILY, PHASES,
  LADDERS, LADDER_QUESTIONS, FAMILY_MAP, MUST_TEST, HIGH_FREQ, FAMILIES_SORTED,
  FAMILY_OF_Q, Q_BY_FAMILY, UNRESOLVED_FAMILY,
  CH_BY_ID, M_BY_ID, Q_BY_ID,
  PAPERS, PAPER_STATS, CH_SCORE, CAT_SCORE, DIFF_SCORE, DIFF_COUNT, statPaper,
} from '../src/index.js';
import { createMathRenderer } from './math-render.mjs';
import { createFigureRenderer } from './fig-render.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');

const errors = [];
const warns = [];
const E = (m) => errors.push(m);
const W = (m) => warns.push(m);

const CH_IDS = new Set(CHAPTERS.map((c) => c.id));
const M_IDS = new Set(METHODS.map((m) => m.id));
const Q_IDS = new Set(QUESTIONS.map((q) => q.id));
const C_IDS = new Set(CONCEPTS.map((c) => c.id));
const FORMULA_NAMES = new Set(FORMULAS.map((f) => f.name));
const CALC_IDS = new Set(CALC_QUESTIONS.map((q) => q.id));
const TIER_KEYS = new Set(Object.keys(TIERS));
const ERRS = new Set(['concept', 'sign', 'calc', 'method', 'model', 'express']);
const STEP_TYPES = new Set(['choice', 'fill', 'judge', 'expr']);
const PRIMS = new Set(['pt', 'seg', 'ray', 'poly', 'circle', 'arc', 'angle', 'right',
  'label', 'curve', 'arrow', 'region', 'ticks', 'rect']);

/* ==========================================================
   1. 章节
   ========================================================== */
CHAPTERS.forEach((c) => {
  if (!c.id || !c.name) E(`章节缺 id/name：${JSON.stringify(c).slice(0, 60)}`);
  (c.prereq || []).forEach((p) => {
    if (p === c.id) E(`章节 ${c.id} 的前置包含自身`);
    if (!CH_IDS.has(p)) E(`章节 ${c.id} 的前置 ${p} 不存在`);
  });
  (c.methods || []).forEach((m) => {
    if (!M_IDS.has(m)) E(`章节 ${c.id} 引用的方法卡 ${m} 不存在`);
  });
  (c.tier || []).forEach((t) => {
    if (!TIER_KEYS.has(t)) E(`章节 ${c.id} 的 tier ${t} 非法`);
  });
  if (typeof c.weight !== 'number') W(`章节 ${c.id} 缺 weight（题量分配依据）`);
});

/* 章节权重之和应接近 1 */
{
  const sum = CHAPTERS.reduce((a, c) => a + (c.weight || 0), 0);
  if (Math.abs(sum - 1) > 0.02) W(`章节 weight 之和为 ${sum.toFixed(3)}，应接近 1`);
}

/* ==========================================================
   2. 方法卡
   注意：不强制「恰 3 变式」（参考站的硬约束），因为初一的 L1 卡
   是「操作规范」型，不一定需要母题+3 变式结构。
   但如果有变式，必须凑齐 number/condition/reverse 三类。
   ========================================================== */
METHODS.forEach((m) => {
  if (!CH_IDS.has(m.chapter)) E(`方法卡 ${m.id} 的 chapter ${m.chapter} 不存在`);
  if (!m.signal || m.signal.length < 10) E(`方法卡 ${m.id} 缺识别信号`);
  if (!(m.steps || []).length) E(`方法卡 ${m.id} 缺步骤骨架`);
  if (!TIER_KEYS.has(m.tier)) E(`方法卡 ${m.id} 的 tier ${m.tier} 非法`);
  if ((m.pitfalls || []).length < 2) W(`方法卡 ${m.id} 的 pitfalls 少于 2 条`);

  const vs = m.variantIds || [];
  if (vs.length && vs.length !== 3) E(`方法卡 ${m.id} 有 ${vs.length} 个变式，应为 3 或 0`);
  if (vs.length === 3) {
    const kinds = vs.map((id) => {
      const q = Q_BY_ID.get(id);
      return q ? q.changed : null;
    });
    ['number', 'condition', 'reverse'].forEach((k) => {
      if (!kinds.includes(k)) E(`方法卡 ${m.id} 缺少 ${k} 类变式`);
    });
  }
  vs.forEach((id) => { if (!Q_IDS.has(id)) E(`方法卡 ${m.id} 的变式 ${id} 不存在`); });
  if (m.motherId && !Q_IDS.has(m.motherId)) E(`方法卡 ${m.id} 的母题 ${m.motherId} 不存在`);
});

/* ==========================================================
   3. 题目字段与步骤
   ========================================================== */
const math = createMathRenderer();
const fig = createFigureRenderer({ math });

function checkQuestion(q, opts = {}) {
  const tag = opts.isCalc ? '计算题' : '题目';
  if (!q.id) return E(`${tag}缺 id：${JSON.stringify(q).slice(0, 60)}`);
  if (!CH_IDS.has(q.chapter)) E(`${tag} ${q.id} 的 chapter ${q.chapter} 不存在`);
  if (q.method != null && !M_IDS.has(q.method)) E(`${tag} ${q.id} 的 method ${q.method} 不存在`);
  if (!q.stem || q.stem.length < 4) E(`${tag} ${q.id} 缺题干`);
  if (!TIER_KEYS.has(q.tier)) E(`${tag} ${q.id} 的 tier ${q.tier} 非法`);
  if (!(q.errorTags || []).length) E(`${tag} ${q.id} 缺 errorTags`);
  (q.errorTags || []).forEach((t) => {
    /* 'exam' 是真题标记，不是错因分类，放行 */
    if (t === 'exam') return;
    if (!ERRS.has(t)) E(`${tag} ${q.id} 的错因 ${t} 非法`);
  });

  const steps = q.steps || [];
  /* 真题（带 examRef）是「题目级单空」形态：没有 steps，
     判分靠 qtype=single/calc 的 options/key/accept 字段。
     这不是缺陷，是真题原貌——真题就是一道题一个答案。 */
  if (q.examRef) {
    if (!['single', 'calc', 'big'].includes(q.qtype)) {
      E(`${tag} ${q.id} 真题的 qtype 必须是 single/calc/big，实际 ${q.qtype}`);
    }
    /* 单选题必须有 options；key 可为 null——那表示这套卷没有官方答案
       （如 2022-23 只有原卷），前端会显示「不判分」，不是数据缺陷。 */
    if (q.qtype === 'single' && !q.options) {
      E(`${tag} ${q.id} 单选题缺 options`);
    }
    if (q.qtype === 'single' && q.hasAnswer && q.key == null) {
      E(`${tag} ${q.id} 单选题有答案但缺 key`);
    }
    return;   /* 真题不再走 steps 校验 */
  }
  /* 计算题必须 ≥2 步：nearMiss（会做但错）判据依赖多步 */
  const minSteps = opts.isCalc ? 2 : (q.kind === 'solve' ? 2 : 1);
  if (steps.length < minSteps) {
    E(`${tag} ${q.id} 的步骤少于 ${minSteps} 步（实际 ${steps.length}）` +
      (opts.isCalc ? '——计算题必须有 ≥2 步，否则抓不到「会做但错」' : ''));
  }

  steps.forEach((s, i) => {
    const at = `${tag} ${q.id} 第 ${i + 1} 步`;
    if (!s.ask) E(`${at} 缺 ask`);
    if (!STEP_TYPES.has(s.type)) E(`${at} 的 type ${s.type} 非法`);
    if (s.score == null) E(`${at} 缺 score`);
    if (s.type === 'choice' || s.type === 'expr') {
      if (!(s.options || []).length) E(`${at} 缺 options`);
      if (s.key == null || s.key < 0 || s.key >= (s.options || []).length) E(`${at} 的 key ${s.key} 越界`);
      if (new Set(s.options || []).size !== (s.options || []).length) E(`${at} 的选项有重复`);
    }
    if (s.type === 'fill') {
      const acc = s.accept || (s.answer != null ? [s.answer] : []);
      if (!acc.length) E(`${at} 缺 accept/answer`);
    }
    if (s.type === 'judge' && typeof s.key !== 'boolean') E(`${at} 的 judge key 必须是布尔`);
  });

  if (q.variantOf) {
    if (!Q_IDS.has(q.variantOf)) E(`${tag} ${q.id} 的 variantOf ${q.variantOf} 不存在`);
    const parent = Q_BY_ID.get(q.variantOf);
    if (parent && parent.method !== q.method) E(`变式 ${q.id} 与母题的 method 不一致`);
  }

  /* 公式渲染 */
  const renderAll = (str, where) => {
    if (typeof str === 'string' && str.indexOf('$') >= 0) math.render(str);
  };
  renderAll(q.stem, 'stem');
  renderAll(q.solution, 'solution');

  /* 图形 */
  if (q.fig) {
    (q.fig.elems || []).forEach((e, i) => {
      if (!PRIMS.has(e.t)) E(`${tag} ${q.id} 的图形第 ${i} 个原语 ${e.t} 未知`);
    });
    fig.render(q.fig);
  }
}

QUESTIONS.forEach((q) => checkQuestion(q));
CALC_QUESTIONS.forEach((q) => checkQuestion(q, { isCalc: true }));

/* 计算题 id 不与「方法卡配套题」重复 */
CALC_QUESTIONS.forEach((q) => {
  if (METHOD_QUESTIONS.some((x) => x.id === q.id)) E(`计算题 ${q.id} 与方法卡配套题 id 重复`);
});
{
  const dup = CALC_QUESTIONS.map((q) => q.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dup.length) E(`计算题 id 重复：${[...new Set(dup)].join(', ')}`);
}

/* ==========================================================
   4. accept 与解析自洽（参考站踩过的坑）
   检查：fill 步骤的 answer 是否出现在该步 why 或题目 solution 里。
   这不是完备判定（解析可能用不同写法），但能抓住「数字完全对不上」的硬矛盾。
   ========================================================== */
function numbersIn(s) {
  return (String(s || '').match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
}
CALC_QUESTIONS.concat(QUESTIONS).forEach((q) => {
  (q.steps || []).forEach((s, i) => {
    if (s.type !== 'fill') return;
    const ans = String(s.answer != null ? s.answer : (s.accept || [])[0] || '');
    const nums = numbersIn(ans);
    if (!nums.length) return;
    const hay = [s.why, s.hint, q.solution].filter(Boolean).join(' ');
    const hayNums = numbersIn(hay);
    /* 只检查「单一数字答案」：多数字答案的写法差异太大，误报率高 */
    if (nums.length === 1) {
      const v = nums[0];
      if (hayNums.length && !hayNums.some((h) => Math.abs(h - v) < 1e-9)) {
        W(`题目 ${q.id} 第 ${i + 1} 步答案 ${v} 未在解析中出现——请人工确认 accept 与解析是否自洽`);
      }
    }
  });
});

/* ==========================================================
   5. 概念卡
   ========================================================== */
CONCEPTS.forEach((c) => {
  if (!c.id) return E(`概念卡缺 id`);
  if (C_IDS.has(c.id) && CONCEPTS.filter((x) => x.id === c.id).length > 1) {
    if (CONCEPTS.findIndex((x) => x.id === c.id) !== CONCEPTS.indexOf(c)) E(`概念卡 id 重复：${c.id}`);
  }
  if (!CH_IDS.has(c.chapter)) E(`概念卡 ${c.id} 的 chapter ${c.chapter} 不存在`);
  if (!c.claim) E(`概念卡 ${c.id} 缺 claim`);
  if ((c.tests || []).length < 2) E(`概念卡 ${c.id} 的 tests 少于 2 个（实际 ${(c.tests || []).length}）`);
  (c.tests || []).forEach((t, i) => {
    if (!t.q) E(`概念卡 ${c.id} 第 ${i + 1} 个判断缺 q`);
    if (!t.why) E(`概念卡 ${c.id} 第 ${i + 1} 个判断缺 why`);
    if (typeof t.a !== 'boolean') E(`概念卡 ${c.id} 第 ${i + 1} 个判断的 a 必须是布尔`);
  });
  if (!(c.must || []).length) W(`概念卡 ${c.id} 的 must 为空`);
});

/* 概念卡必须至少有一个「看起来对但错」的判断（a=false），否则失去边界价值 */
CONCEPTS.forEach((c) => {
  if ((c.tests || []).length && !(c.tests || []).some((t) => t.a === false)) {
    W(`概念卡 ${c.id} 全部为真，缺少「看起来对但错」的边界判断`);
  }
});

/* ==========================================================
   5a. 方法卡三级变式链
   口径（用户确认）：练习内容本身必须按「改数字 → 改条件 → 逆向」三级设计，
   不是随机抽题。所以每张方法卡都必须有完整三级链。
   ========================================================== */
/* 2026-11-25 停用：练习池换成真题后，真题没有「改数字/改条件/逆向」
   这类人工变式，方法卡已退化为纯讲解卡。三级变式链校验同步停用。
   恢复：把 VARIANT_CHAIN_ENABLED 改回 true，并把原创变式题加回题库。 */
const VARIANT_CHAIN_ENABLED = false;
if (VARIANT_CHAIN_ENABLED) {
  const LEVEL_ORDER = ['number', 'condition', 'reverse'];
  let missing = [];
  METHODS.forEach((m) => {
    const vs = m.variantIds || [];
    if (vs.length !== 3) { missing.push(m.id + '（' + vs.length + ' 个变式）'); return; }
    const kinds = vs.map((id) => { const q = Q_BY_ID.get(id); return q ? q.changed : null; });
    LEVEL_ORDER.forEach((k) => {
      if (!kinds.includes(k)) missing.push(m.id + '（缺 ' + k + '）');
    });
    /* 变式的 method 必须与卡一致（否则出题时进不了同一组） */
    vs.forEach((id) => {
      const q = Q_BY_ID.get(id);
      if (q && q.method !== m.id) E(`方法卡 ${m.id} 的变式 ${id} 的 method 是 ${q.method}，不一致`);
    });
    /* 三级必须同章（变式不该换章） */
    const chs = new Set(vs.map((id) => { const q = Q_BY_ID.get(id); return q ? q.chapter : null; }).filter(Boolean));
    if (chs.size > 1) E(`方法卡 ${m.id} 的三级变式跨章：${[...chs].join('、')}`);
  });
  if (missing.length) {
    E(`以下方法卡缺完整三级变式链（改数字/改条件/逆向）：\n    ${missing.join('\n    ')}`);
  }
}

/* ==========================================================
   5b. 变式阶梯
   规则（用户确认的口径）：
     ① 每条阶梯必须恰好 3 级，且必须是 number → condition → reverse
     ② 每级指向的题必须存在，且 ladder/level 字段自洽
     ③ 阶梯锚定的真题考点族必须存在（以真题为锚点）
     ④ 阶梯题必须 ≥2 步（否则判不出「卡在哪一步」）
     ⑤ 同一阶梯内三级必须同 chapter / method（这才是「变式」不是「新题」）
   ========================================================== */
/* 2026-11-25 停用：变式阶梯依赖原创变式题，练习池换成真题后
   42 道阶梯题全部不在题库里。阶梯功能已下线（ladder.html 不再生成），
   数据与生成函数保留。恢复阶梯时把下面的 LADDER_ENABLED 改回 true。 */
const LADDER_ENABLED = false;
if (LADDER_ENABLED) {
  const FAM_IDS = new Set((FAMILY_MAP || []).map((f) => f.id));
  const LEVEL_ORDER = ['number', 'condition', 'reverse'];
  const LAD_IDS = new Set();

  LADDERS.forEach((L) => {
    if (!L.id) return E('阶梯缺 id');
    if (LAD_IDS.has(L.id)) E(`阶梯 id 重复：${L.id}`);
    LAD_IDS.add(L.id);

    if (!L.anchor) E(`阶梯 ${L.id} 缺 anchor（真题考点族）`);
    else if (!FAM_IDS.has(L.anchor)) E(`阶梯 ${L.id} 锚定的考点族 ${L.anchor} 不存在`);
    if (!L.why) W(`阶梯 ${L.id} 缺 why（为什么练这个）`);

    const lv = L.levels || [];
    if (lv.length !== 3) E(`阶梯 ${L.id} 有 ${lv.length} 级，必须恰好 3 级`);
    lv.forEach((x, i) => {
      if (x.key !== LEVEL_ORDER[i]) {
        E(`阶梯 ${L.id} 第 ${i + 1} 级应为 ${LEVEL_ORDER[i]}，实际 ${x.key}`);
      }
      if (!x.qid) E(`阶梯 ${L.id} 第 ${i + 1} 级缺 qid`);
      else if (!Q_BY_ID.has(x.qid)) E(`阶梯 ${L.id} 第 ${i + 1} 级的题 ${x.qid} 不存在`);
      if (!x.name) E(`阶梯 ${L.id} 第 ${i + 1} 级缺 name`);
    });

    /* 三级必须同章同方法 */
    const qs = lv.map((x) => Q_BY_ID.get(x.qid)).filter(Boolean);
    if (qs.length === 3) {
      const chs = new Set(qs.map((q) => q.chapter));
      const ms = new Set(qs.map((q) => q.method || ''));
      if (chs.size > 1) E(`阶梯 ${L.id} 三级跨章：${[...chs].join('、')}`);
      if (ms.size > 1) E(`阶梯 ${L.id} 三级方法不一致：${[...ms].join('、')}`);
      qs.forEach((q, i) => {
        if ((q.steps || []).length < 2) {
          E(`阶梯 ${L.id} 第 ${i + 1} 级的题 ${q.id} 少于 2 步——判不出卡在哪一步`);
        }
      });
    }
  });

  /* 反向校验：阶梯题必须挂到某条阶梯上，且 ladder/level 字段自洽 */
  LADDER_QUESTIONS.forEach((q) => {
    if (!q.ladder) return E(`阶梯题 ${q.id} 缺 ladder 字段`);
    if (!LAD_IDS.has(q.ladder)) E(`阶梯题 ${q.id} 的 ladder ${q.ladder} 不存在`);
    if (!LEVEL_ORDER.includes(q.level)) E(`阶梯题 ${q.id} 的 level ${q.level} 非法`);
    const L = LADDERS.find((x) => x.id === q.ladder);
    if (L) {
      const at = (L.levels || []).findIndex((x) => x.qid === q.id);
      if (at < 0) E(`阶梯题 ${q.id} 未出现在阶梯 ${q.ladder} 的 levels 里`);
      else if (L.levels[at].key !== q.level) {
        E(`阶梯题 ${q.id} 的 level ${q.level} 与阶梯定义 ${L.levels[at].key} 不一致`);
      }
    }
  });

  /* 覆盖率：高权重考点族（≥15 分）应尽量有阶梯 */
  const heavy = (FAMILY_MAP || []).filter((f) => (f.total || 0) >= 15);
  const covered = new Set(LADDERS.map((L) => L.anchor));
  const missHeavy = heavy.filter((f) => !covered.has(f.id));
  if (missHeavy.length) {
    W(`以下高权重考点族（≥15 分）还没有变式阶梯：${missHeavy.map((f) => f.name).join('、')}`);
  }
}

/* ==========================================================
   5.5 族标签完备性（排序与回流的地基）
   ----------------------------------------------------------
   为什么必须是硬门禁，不是警告：
   planToday() 按族排序、familyState 按族记状态。一道题没有族，
   就等于「练了但不计入任何统计」——诊断看不见、排序算不到，
   而且不会报错。这种静默失效比崩掉更难查（参照 topic 字符串不匹配那次）。
   ========================================================== */
{
  /* ① 每道题恰属一族：无解、或解析出 FAMILY_DEFS 里不存在的族，都报错 */
  if (UNRESOLVED_FAMILY.length) {
    E(`${UNRESOLVED_FAMILY.length} 道题归不到考点族（在 src/data-family-map.js 补规则）：` +
      UNRESOLVED_FAMILY.slice(0, 8).map((q) => q.id).join('、') +
      (UNRESOLVED_FAMILY.length > 8 ? ' …' : ''));
  }
  const famIds = new Set((FAMILY_MAP || []).map((f) => f.id));
  const badFam = Object.entries(FAMILY_OF_Q).filter(([, fid]) => !famIds.has(fid));
  if (badFam.length) {
    E(`以下题的族 id 在 FAMILY_DEFS 里不存在：${badFam.slice(0, 8).map(([q, f]) => `${q}→${f}`).join('、')}`);
  }
  /* 反向核对：映射表里的每个 qid 必须真在题库里（防止改名后残留旧键） */
  const stale = Object.keys(FAMILY_OF_Q).filter((id) => !Q_IDS.has(id));
  if (stale.length) E(`族映射表有 ${stale.length} 个已不存在的题 id：${stale.slice(0, 8).join('、')}`);

  /* ② 每族至少 2 题：1 题无法做「改数字」的稳定性验证，也算不出正确率 */
  (FAMILY_MAP || []).forEach((f) => {
    const n = (Q_BY_FAMILY.get(f.id) || []).length;
    /* 真题库只有 130 题（五套 × 26），有些族一年只考 1 道，
       所以「1 题」是真题原貌，不是缺陷——降为警告。
       但 0 题仍是错误：说明该族在题库里完全没有可练内容。 */
    if (n === 0) E(`考点族「${f.name}」0 道站内题——该族在题库里完全没有可练内容`);
    else if (n < 2) W(`考点族「${f.name}」只有 ${n} 道站内题（真题本身如此，可选补）`);
  });

  /* ③ 阶梯锚定的族必须有题：阶梯题本身也带族，但若锚定族无题，
       说明该族在题库里没有可练内容，阶梯会变成孤岛 */
  LADDERS.forEach((L) => {
    const n = (Q_BY_FAMILY.get(L.anchor) || []).length;
    if (!n) E(`变式阶梯 ${L.id} 锚定的族 ${L.anchor} 在题库里没有题`);
  });

  /* ③b 阶梯题必须归到锚定族上
     ----------------------------------------------------------
     这条是踩坑后补的：新增阶梯时，若阶梯题没有 method 且未在
     Q_FAMILY_OVERRIDE 里登记，就会「有题但归不到族」。
     后果是静默的——族状态机读不到这些题，能力诊断也看不到，
     而页面上题照常显示、照常能练，完全看不出问题。
     校验器原先只查「锚定族有题」（上面 ③），查不出这种错位。 */
  LADDERS.forEach((L) => {
    const lv = L.levels || [];
    lv.forEach((x) => {
      const q = Q_BY_ID.get(x.qid);
      if (!q) return;  // 题不存在的情况上面已报错
      if (q.family !== L.anchor) {
        E(`阶梯题 ${q.id} 归族为 ${q.family || '(空)'}，与阶梯 ${L.id} 的锚定族 ${L.anchor} 不一致`);
      }
    });
  });

  /* ③c 能力三级覆盖：每族的 changed/level 应尽量凑齐三级
     非阻塞——不齐只说明该族缺某一级的能力信号，不影响可用性，
     但会让能力诊断退化成「只看对错」，值得提醒。 */
  {
    const ABIL_LEVELS = ['number', 'condition', 'reverse'];
    const partial = [];
    (FAMILY_MAP || []).forEach((f) => {
      const qs = Q_BY_FAMILY.get(f.id) || [];
      const lv = new Set(qs.map((q) => q.changed || q.level).filter(Boolean));
      if (lv.size > 0 && lv.size < 3) {
        partial.push(`${f.name}（缺 ${ABIL_LEVELS.filter((k) => !lv.has(k)).join('、')}）`);
      }
    });
    if (partial.length) {
      W(`以下族的能力三级不齐，诊断会退化成只看对错：${partial.join('；')}`);
    }
  }

  /* ④ 覆盖率提示（非阻塞）：真题里年年考的族应尽量有站内题 */
  const alwaysNoQ = (FAMILY_MAP || [])
    .filter((f) => f.freq === 'always' && !(Q_BY_FAMILY.get(f.id) || []).length);
  if (alwaysNoQ.length) {
    W(`年年考但没有站内题的族：${alwaysNoQ.map((f) => f.name).join('、')}`);
  }
}

/* ==========================================================
   6. 每章覆盖
   ========================================================== */
CHAPTERS.forEach((c) => {
  const nq = QUESTIONS.filter((q) => q.chapter === c.id).length +
    CALC_QUESTIONS.filter((q) => q.chapter === c.id).length;
  const nc = CONCEPTS.filter((x) => x.chapter === c.id).length;
  if (nq < 2) W(`章节 ${c.id} 题量 ${nq}，偏少`);
  if (nc < 2) W(`章节 ${c.id} 概念卡 ${nc}，偏少`);
});

/* ==========================================================
   7. 公式库
   参考站完全不校验 FORMULAS；这里补上基本字段检查。
   ========================================================== */
FORMULAS.forEach((f, i) => {
  if (!f.name) E(`公式第 ${i} 条缺 name`);
  if (!f.tex) E(`公式 ${f.name} 缺 tex`);
  if (!f.cond) E(`公式 ${f.name} 缺适用条件 cond`);
  if (!f.misuse) E(`公式 ${f.name} 缺常见误用 misuse`);
  if (f.chapter && !CH_IDS.has(f.chapter)) E(`公式 ${f.name} 的 chapter ${f.chapter} 不存在`);
});

/* ==========================================================
   8. 卷面与分层口径自洽
   ========================================================== */
{
  const partSum = EXAM_STRUCTURE.parts.reduce((a, p) => a + p.sum, 0);
  if (partSum !== EXAM_STRUCTURE.total) {
    E(`卷面分段之和 ${partSum} 与总分 ${EXAM_STRUCTURE.total} 不一致`);
  }
  /* 选做题（第四大题）：计入总分但卷面封顶 100，不参与必做分段求和 */
  if (EXAM_STRUCTURE.bonus) {
    const b = EXAM_STRUCTURE.bonus;
    if (!b.name || typeof b.score !== 'number') E('选做题结构缺 name 或 score');
  }
  /* 不等分值的解答题：each 缺省时必须有 note 说明 */
  EXAM_STRUCTURE.parts.forEach((p) => {
    if (p.each == null && !p.note) E(`卷面分段「${p.name}」既无 each 也无 note 说明分值`);
    if (p.each != null && p.each * p.count !== p.sum) {
      E(`卷面分段「${p.name}」${p.count}×${p.each} ≠ ${p.sum}`);
    }
  });
  const qSum = EXAM_STRUCTURE.parts.reduce((a, p) => a + p.count, 0);
  if (qSum !== EXAM_STRUCTURE.questions) {
    E(`卷面题数之和 ${qSum} 与总题数 ${EXAM_STRUCTURE.questions} 不一致`);
  }
  const tierSum = Object.values(TIERS).reduce((a, t) => a + t.score, 0);
  if (tierSum !== EXAM_STRUCTURE.total) {
    E(`三层分值之和 ${tierSum} 与总分 ${EXAM_STRUCTURE.total} 不一致`);
  }
  Object.values(TIERS).forEach((t) => {
    if (t.target <= 0 || t.target > 1) E(`分层 ${t.name} 的 target ${t.target} 应在 (0,1]`);
  });
}

/* 每日闭环分钟数 */
{
  const m = DAILY.blocks.reduce((a, b) => a + b.minutes, 0);
  if (m !== DAILY.total) W(`每日闭环各段之和 ${m} 分钟，与标注的 ${DAILY.total} 不一致`);
}

/* ==========================================================
   8b. 真题统计一致性（防止「展示值」与「逐题数据」脱节）

   这一条是被真实教训逼出来的：我第一版把难度分布手写成 32/46/14/8，
   但按逐题标注实际算出来是 13/67/9/11，基础题差了 19 个百分点。
   所以现在强制校验：所有汇总必须等于从逐题重算的结果。
   ========================================================== */
{
  /* ① 每卷三套维度之和都必须等于必做总分 */
  PAPER_STATS.forEach((st, i) => {
    const p = PAPERS[i];
    const chSum = Object.values(st.ch).reduce((a, b) => a + b, 0);
    const catSum = Object.values(st.cat).reduce((a, b) => a + b, 0);
    const diffSum = Object.values(st.diff).reduce((a, b) => a + b, 0);
    const segSum = Object.values(st.seg).reduce((a, b) => a + b, 0);
    if (chSum !== st.mainTotal) E(`${p.year} 章节分值之和 ${chSum} ≠ 必做总分 ${st.mainTotal}`);
    if (catSum !== st.mainTotal) E(`${p.year} 能力分值之和 ${catSum} ≠ ${st.mainTotal}`);
    if (diffSum !== st.mainTotal) E(`${p.year} 难度分值之和 ${diffSum} ≠ ${st.mainTotal}`);
    if (segSum !== st.mainTotal) E(`${p.year} 题型分值之和 ${segSum} ≠ ${st.mainTotal}`);
  });

  /* ② 汇总值必须等于逐年平均（容差 0.1） */
  const close = (a, b) => Math.abs(a - b) < 0.1;
  Object.entries(CH_SCORE).forEach(([k, v]) => {
    const reAvg = PAPER_STATS.reduce((a, st) => a + st.ch[k], 0) / PAPER_STATS.length;
    if (!close(v.avg, +reAvg.toFixed(1))) {
      E(`章节 ${v.name} 的汇总平均 ${v.avg} ≠ 逐年重算 ${reAvg.toFixed(1)}`);
    }
  });
  Object.entries(CAT_SCORE).forEach(([k, v]) => {
    const reAvg = PAPER_STATS.reduce((a, st) => a + st.cat[k], 0) / PAPER_STATS.length;
    if (!close(v.avg, +reAvg.toFixed(1))) {
      E(`能力 ${k} 的汇总平均 ${v.avg} ≠ 逐年重算 ${reAvg.toFixed(1)}`);
    }
  });
  Object.entries(DIFF_SCORE).forEach(([k, v]) => {
    const reAvg = PAPER_STATS.reduce((a, st) => a + st.diff[k], 0) / PAPER_STATS.length;
    if (!close(v.avg, +reAvg.toFixed(1))) {
      E(`难度 ${v.name} 的汇总平均 ${v.avg} ≠ 逐年重算 ${reAvg.toFixed(1)}`);
    }
  });

  /* ③ 每题必须有 topic（知识点细分），否则知识点表会漏 */
  PAPERS.forEach((p) => {
    const miss = p.items.filter((x) => !x.topic);
    if (miss.length) {
      E(`${p.year} 有 ${miss.length} 题缺 topic：${miss.map((x) => '#' + x.no).join(', ')}`);
    }
  });

  /* ④ 难度标注必须合法 */
  const DIFF_KEYS = new Set(['easy', 'mid', 'hard', 'top']);
  PAPERS.forEach((p) => {
    p.items.forEach((x) => {
      if (!DIFF_KEYS.has(x.diff)) E(`${p.year} 第 ${x.no} 题难度 ${x.diff} 非法`);
      if (!x.score || x.score <= 0) E(`${p.year} 第 ${x.no} 题分值非法`);
    });
  });

  /* ⑤ 必考点必须都在覆盖度表里 */
  const { MUST_TEST, COVERAGE, FAMILY_MAP, FAMILIES_SORTED, FREQ_SUMMARY, TOPIC_MAP } =
    await import('../src/index.js');
  MUST_TEST.forEach((m) => {
    if (!COVERAGE.find((c) => c.k === m.k)) {
      W(`必考点「${m.k}」未在覆盖度表中登记`);
    }
  });

  /* ⑥ 考点族映射完备：每个必做 topic 必须恰好属于一族
     （data-papers.js 里已有运行期 throw，这里再断言一次，
      因为校验器是「发布前必须跑」的关口） */
  {
    const owner = new Map();
    FAMILY_MAP.forEach((f) => f.topics.forEach((t) => {
      if (owner.has(t)) E(`考点族冲突：「${t}」同时属于 ${owner.get(t)} 与 ${f.id}`);
      owner.set(t, f.id);
    }));
    const orphans = new Set();
    PAPERS.forEach((p) => p.items.filter((x) => !x.bonus)
      .forEach((x) => { if (!owner.has(x.topic)) orphans.add(x.topic); }));
    if (orphans.size) {
      E(`${orphans.size} 个必做考点未归入任何考点族：${[...orphans].join('、')}`);
    }
    /* 族分值合计必须等于三卷必做总分，否则归并漏题或重题 */
    const famTotal = FAMILY_MAP.reduce((a, f) => a + f.total, 0);
    const mainTotal = PAPER_STATS.reduce((a, s) => a + s.mainTotal, 0);
    if (famTotal !== mainTotal) {
      E(`考点族分值合计 ${famTotal} ≠ 三卷必做总分 ${mainTotal}（归并漏题或重复计入）`);
    }
  }

  /* ⑦ 必考点必须真的是「全出现」，高频轮考点必须是 3/4 年
     这条是被真实错误逼出来的：曾手写「角度换算每年必考」，但 2024-25
     卷填空题既无度分秒换算也无四舍五入，实际只有 2/3 年。
     样本扩到 4 卷后，MUST_TEST 只保留 4/4 年的；3/4 年但分值高的进
     HIGH_FREQ（不算必考，但要露出），两者都要与数据核对。 */
  {
    const famById = new Map(FAMILY_MAP.map((f) => [f.id, f]));
    MUST_TEST.forEach((m) => {
      if (!m.family) { E(`必考点「${m.k}」缺 family 字段，无法与数据核对`); return; }
      const f = famById.get(m.family);
      if (!f) { E(`必考点「${m.k}」引用的族 ${m.family} 不存在`); return; }
      if (f.hitYears !== PAPERS.length) {
        E(`必考点「${m.k}」实为 ${f.hitYears}/${PAPERS.length} 年（${Object.values(f.scores).join('/')} 分），不是年年考`);
      }
    });
    (HIGH_FREQ || []).forEach((m) => {
      if (!m.family) { E(`高频考点「${m.k}」缺 family 字段`); return; }
      const f = famById.get(m.family);
      if (!f) { E(`高频考点「${m.k}」引用的族 ${m.family} 不存在`); return; }
      if (f.hitYears === PAPERS.length) {
        E(`高频考点「${m.k}」实为 ${f.hitYears}/${PAPERS.length} 年全出现，应移入 MUST_TEST`);
      } else if (f.hitYears < 3) {
        E(`高频考点「${m.k}」实为 ${f.hitYears}/${PAPERS.length} 年，够不上「高频轮考」（应 ≥3 年）`);
      }
    });
    /* 反向：全出现的族必须列在 MUST_TEST 或 HIGH_FREQ 里，否则列表不完整 */
    const listed = new Set([...MUST_TEST, ...(HIGH_FREQ || [])].map((m) => m.family));
    FAMILIES_SORTED.filter((f) => f.hitYears === PAPERS.length).forEach((f) => {
      if (!listed.has(f.id)) W(`考点族「${f.name}」${PAPERS.length} 年全考，但未列入必考点表`);
    });
  }

  /* ⑧ 频次汇总的三个档位占比之和应为 100% */
  {
    const sum = FREQ_SUMMARY.always.pct + FREQ_SUMMARY.often.pct + FREQ_SUMMARY.rare.pct;
    if (Math.abs(sum - 100) > 1) {
      W(`频次档占比之和为 ${sum}%（四舍五入误差应 ≤1）`);
    }
  }
}

/* ==========================================================
   8c. 真题对标硬门禁（防止内容与真题脱节）

   这是「严肃对待真题对标」的机器保证。三条硬规则：
     ① 每个真题知识点必须至少有 1 道站内题（无题 → 错误）
     ② 每个真题知识点至少 2 道（偏少 → 警告）
     ③ 每张方法卡必须至少有 1 道配套题（空卡 → 错误）

   为什么要有这一层：人工审计会漏、会忘、会随时间漂移。
   把标准写成代码，每次构建都自动检查。
   ========================================================== */
{
  /* 真题知识点 → 站内检索关键词。新增真题知识点时必须同步维护这张表。 */
  const TOPIC_KEYS = {
    '有理数混合运算': ['四则', '混合运算', '计算：'],
    '解一元一次方程': ['解方程', '去分母'],
    '整式化简求值': ['化简', '求值'],
    '方程应用（配套/分配）': ['配套', '分配', '工程', '行程', '销售', '打折', '利润'],
    '方程应用（配套）': ['配套', '裁剪', '侧面', '底面'],
    '方程应用（工程）': ['工程', '工作效率', '人完成', '整理'],
    '角度推理与说理': ['角平分线', '余角', '同角的余角'],
    '数轴动点与分类': ['动点'],
    '尺规作图与说理': ['作图', '尺规'],
    '数轴读符号': ['数轴'],
    '动射线（含参）': ['动射线', '旋转'],
    '新定义（数轴类）': ['新定义', '平衡点', '星点', '倍分'],
    '方程应用（表格数据）': ['表格'],
    '动角（旋转）': ['旋转', '三角尺'],
    '绝对值': ['绝对值'],
    '科学记数法': ['科学记数法'],
    '合并同类项辨析': ['同类项', '合并'],
    '方程解求参数': ['方程的解', '解求参', '是方程'],
    '数字填图（幻方类）': ['幻圆', '填图', '幻方', '顶点'],
    '方位角与作图': ['方位角', '北偏东', '南偏东'],
    '阅读理解型': ['阅读材料', '阅读理解'],
    '几何建模': ['赛道', '建模', '篱笆'],
    '角度换算（度分秒）': ['度分秒'],
    '近似数与精确度': ['近似', '精确', '四舍五入'],
    '进位制（综合与实践）': ['进位制', '三进制', '十六进制', '算筹', '二进制', '逢三进一'],
    '面动成体': ['旋转一周', '旋转成', '绕轴', '平面图形'],
    '代数式求值': ['代数式', '整体代入'],
    '线段中点计算': ['中点'],
    '展开图识别': ['展开图'],
    '余角补角列方程': ['余角', '补角'],
    '图形规律探究': ['规律'],
    '单项式概念（构造）': ['单项式'],
    '整式加减（图形边长）': ['边长'],
    '方程变形与等式性质': ['等式性质', '变形'],
    '三视图': ['三视图', '俯视图', '主视图', '拼搭'],
    '同类项概念': ['同类项'],
    '相反数': ['相反数'],
    '绝对值非负性': ['非负性'],
    '列代数式': ['列代数式', '用含'],
    '反比例关系': ['反比例'],
    '新定义运算': ['新定义'],
    '点线面概念': ['点动成线', '点、线、面', '线动成面', '在直线'],
    '角的和差计算': ['角的和差', '∠AOC', '∠AOB', '∠BOC'],
    '余角补角': ['余角', '补角'],
    '列方程（分配）': ['客房', '分配', '列方程', '如果每'],
    '线段中点压轴（含参）': ['中点', '延长线', '用含'],
  };

  /* 真题的题干在 stemText（含 ⟨公式⟩ 占位），原创题在 stem。两处都要读，
     否则真题会被判成「站内无对应题」。 */
  const texts = QUESTIONS.map((q) => [q.stem, q.stemText, q.solution, q.name, q.tierName]
    .filter(Boolean).join(' '));
  const { TOPIC_MAP } = await import('../src/index.js');

  let noQ = 0;
  let fewQ = 0;
  Object.values(TOPIC_MAP).forEach((t) => {
    const kws = TOPIC_KEYS[t.topic];
    if (!kws) {
      W(`真题知识点「${t.topic}」未在 TOPIC_KEYS 登记，无法自动校验覆盖`);
      return;
    }
    const n = texts.filter((x) => kws.some((k) => new RegExp(k).test(x))).length;
    if (n === 0) {
      E(`真题知识点「${t.topic}」（真题 ${t.total} 分）站内无对应题——必须补`);
      noQ++;
    } else if (n < 2) {
      W(`真题知识点「${t.topic}」站内仅 ${n} 题，偏少（建议 ≥2）`);
      fewQ++;
    }
  });
  if (!noQ && !fewQ) {
    console.log('  ✓ 真题知识点全部有站内题（每个 ≥2 题）');
  } else if (!noQ) {
    console.log(`  ✓ 真题知识点无缺失（${fewQ} 个偏少）`);
  }

  /* 方法卡空卡检查 */
  const byMethod = {};
  QUESTIONS.forEach((q) => { if (q.method) byMethod[q.method] = (byMethod[q.method] || 0) + 1; });
  /* 2026-11-25 起方法卡退化为「纯讲解卡」：练习池只含真题，
     真题没有 method 字段，所以方法卡不再要求配套题。
     只校验：方法卡自身结构完整（有 signal / steps / pitfalls）。 */
  const brokenCards = METHODS.filter((m) =>
    !m.signal || !(m.steps || []).length || !(m.pitfalls || []).length);
  if (brokenCards.length) {
    E(`以下方法卡结构不完整（缺 signal/steps/pitfalls）：${brokenCards.map((m) => m.id).join('、')}`);
  } else {
    console.log(`  ✓ ${METHODS.length} 张方法卡结构完整（纯讲解形态，不要求配套题）`);
  }
}

/* ==========================================================
   9. 构建产物：*Html 覆盖
   ========================================================== */
const SHARD_DIR = join(ROOT, 'dist/data/ch');
if (existsSync(SHARD_DIR)) {
  readdirSync(SHARD_DIR).filter((f) => f.endsWith('.js')).forEach((f) => {
    const code = readFileSync(join(SHARD_DIR, f), 'utf8');
    let data;
    try {
      const win = {};
      new Function('window', code)(win);
      data = win.BJM && win.BJM.CH;
    } catch (e) {
      return E(`分片 ${f} 求值失败：${e.message}`);
    }
    if (!data) return;
    Object.values(data).forEach((ch) => {
      (ch.questions || []).forEach((q) => {
        const fields = ['stem', 'solution'];
        fields.forEach((k) => {
          if (typeof q[k] === 'string' && q[k].indexOf('$') >= 0 && !q[k + 'Html']) {
            E(`分片 ${f} 题目 ${q.id} 的 ${k} 含公式但缺 ${k}Html`);
          }
        });
        (q.steps || []).forEach((s, i) => {
          ['ask', 'hint', 'why', 'answer', 'label'].forEach((k) => {
            if (typeof s[k] === 'string' && s[k].indexOf('$') >= 0 && !s[k + 'Html']) {
              E(`分片 ${f} 题目 ${q.id} 第 ${i + 1} 步 ${k} 含公式但缺 ${k}Html`);
            }
          });
        });
      });
    });
  });
} else {
  W('未找到 dist/data/ch，跳过产物校验（先运行 node build-site.mjs）');
}

/* ==========================================================
   10. 引擎源码引用检查
   ========================================================== */
{
  const sePath = join(ROOT, 'assets/step-engine.js');
  if (existsSync(sePath)) {
    const src = readFileSync(sePath, 'utf8');
    ['stemHtml', 'solutionHtml', 'askHtml', 'whyHtml', 'hintHtml', 'answerHtml',
      'labelHtml', 'optionsHtml', 'hintsHtml'].forEach((k) => {
      const direct = src.indexOf(k) >= 0;
      const viaField = src.indexOf("'" + k.replace(/Html$/, '') + "'") >= 0;
      if (!direct && !viaField) E(`step-engine.js 未引用 ${k}（渲染了但引擎没用）`);
    });
  }
}

/* ==========================================================
   11. 产物存在性
   ========================================================== */
/* 只校验当前生成的页面。
   已停用（生成函数与数据保留，恢复时加回这里与 build-site 的 tasks）：
     today / calc / map / exam / papers / content / slots / ladder */
/* 全站页面清单：与 build-site.mjs 的 tasks 一一对应。
   历史上 tasks 被截断过两次，导致一半页面不生成而无人发现。
   这条检查是兜底：任何一页缺失都报错。 */
const PAGES = [
  /* know.html 已停用（2026-11-24 用户要求）：从使用视角看没有意义。
     函数 buildKnow() 与数据 src/data-know.js 保留，加回 build-site 的 tasks 即恢复。 */
  'index.html', 'today.html', 'calc.html', 'concept.html',
  'drill.html', 'method.html', 'map.html', 'wrong.html', 'slots.html',
  'ladder.html', 'exam.html', 'papers.html', 'plan.html',
  'graph.html', 'content.html',
];
if (existsSync(join(ROOT, 'index.html'))) {
  PAGES.forEach((p) => {
    if (!existsSync(join(ROOT, p))) E(`产物缺失：${p}`);
  });
  /* 章节页（map/<id>.html）随「知识图谱」模块停用，不再检查 */
  /* 方法卡页随「方法卡」模块隐藏，不再检查产物 */
}

/* ==========================================================
   12. 内部死链
   ========================================================== */
function walk(dir, out = []) {
  readdirSync(dir, { withFileTypes: true }).forEach((d) => {
    if (d.name === 'node_modules' || d.name.startsWith('.')) return;
    const p = join(dir, d.name);
    if (d.isDirectory()) walk(p, out);
    else if (d.name.endsWith('.html')) out.push(p);
  });
  return out;
}
if (existsSync(join(ROOT, 'index.html'))) {
  walk(ROOT).forEach((file) => {
    const html = readFileSync(file, 'utf8');
    /* 只匹配真正的 href：(?<![-\w]) 排除 data-href / xlink:href。
       不加这条会把 data-href="'+x.href+'" 这类运行时模板串误报成死链。 */
    const re = /(?<![-\w])href="([^"]+)"/g;
    let m;
    while ((m = re.exec(html))) {
      const href = m[1];
      if (/^(https?:|mailto:|data:|javascript:|\/\/|#)/.test(href)) continue;
      if (href.indexOf("' +") >= 0 || href.indexOf('" +') >= 0 || href.indexOf('${') >= 0) continue;
      const target = join(dirname(file), href.split('#')[0].split('?')[0]);
      if (!existsSync(target)) E(`死链：${file.replace(ROOT + '/', '')} → ${href}`);
    }
  });
}

/* ==========================================================
   9. 知识点讲解层（KNOW / FAMILY_ASSETS）
   ----------------------------------------------------------
   这一层的错不会让页面崩，只会让「讲解」和「真题分析」悄悄对不上：
   某族缺讲解、某张概念卡被归进两族、三档合计不等于 100。
   全部写成断言，因为错法都是静默的。
   ========================================================== */
{
  const {
    KNOW, FAMILY_ASSETS, KNOW_STATS, KNOW_TIERS, KNOW_BY_FAMILY,
  } = await import('../src/index.js');

  const famIds = FAMILY_MAP.map((f) => f.id);
  const famSet = new Set(famIds);

  /* ① 27 族一夫一妻：每个族恰好一条 KNOW，每条 KNOW 恰好一个真实族 */
  const knowSeen = new Map();
  KNOW.forEach((k) => {
    if (!famSet.has(k.family)) E(`KNOW 引用了不存在的考点族「${k.family}」`);
    if (knowSeen.has(k.family)) E(`KNOW 重复：族「${k.family}」出现两次`);
    knowSeen.set(k.family, k);
  });
  famIds.forEach((id) => {
    if (!knowSeen.has(id)) E(`考点族「${id}」没有讲解记录（KNOW 缺该族）`);
  });
  if (KNOW.length !== famIds.length) {
    E(`KNOW 条数 ${KNOW.length} ≠ 考点族数 ${famIds.length}`);
  }

  /* ② form 判据必须与真题给分结构一致（判据写在 data-know.js 文件头）
        注意用「单题最高分」而不是 FAMILY_MAP[].maxScore：
        后者是「逐年总分最高」（4 年里的最高一年），不是单题分值。
        f-scinot 的 maxScore 是 4（某年考了两道各 2 分），但单题只有 2 分，
        用 maxScore 判会把它误判成过程型。 */
  const FORM_OK = new Set(['process', 'rule', 'entry']);
  const maxItem = (fam) => Math.max(0, ...fam.slots.map((s) => s.score));
  KNOW.forEach((k) => {
    if (!FORM_OK.has(k.form)) E(`族「${k.family}」form 非法：${k.form}`);
    const fam = FAMILY_MAP.find((f) => f.id === k.family);
    if (!fam) return;
    const mi = maxItem(fam);
    if (k.form === 'process' && mi < 5) {
      E(`族「${k.family}」标为过程型，但单题最高只有 ${mi} 分`
        + `（过程型判据：单题 ≥5 分，因为「一步错全题废」的风险来自单题分值）`);
    }
    if (k.form === 'rule' && mi > 2) {
      E(`族「${k.family}」标为规则型，但单题最高 ${mi} 分（规则型判据：单题 ≤2 分）`);
    }
    if (k.form === 'entry' && !['分类', '新定义'].includes(fam.cat)) {
      E(`族「${k.family}」标为入题型，但能力维度是「${fam.cat}」（入题型只用于 分类 / 新定义）`);
    }
  });

  /* ③ 正文不许空壳：过程型要有 order，规则型要有 rules */
  KNOW.forEach((k) => {
    const hasOrder = (k.order || []).length > 0;
    const hasRules = (k.rules || []).length > 0;
    if (!hasOrder && !hasRules) E(`族「${k.family}」没有任何正文（order 与 rules 都为空）`);
    if (!k.core) E(`族「${k.family}」缺 core（这一族考的是）`);
    (k.order || []).forEach((o, i) => {
      if (!o.label) E(`族「${k.family}」第 ${i + 1} 步缺 label`);
      if (!o.point) E(`族「${k.family}」第 ${i + 1} 步缺 point（采分点）`);
    });
    (k.rules || []).forEach((r, i) => {
      if (!r.sig || !r.judge) E(`族「${k.family}」第 ${i + 1} 条规则缺 sig/judge`);
    });
    (k.traps || []).forEach((t, i) => {
      if (!t.bad || !t.good || !t.why) E(`族「${k.family}」第 ${i + 1} 个陷阱缺 bad/good/why`);
    });
  });

  /* ④ 配套资产：50 张概念卡、46 条公式各恰好属一族（漏归并 / 重复归并都报错）
        方法卡可属多族，但不得落单 */
  const cOwner = new Map();
  const fOwner = new Map();
  const mOwner = new Map();
  const assetFams = Object.keys(FAMILY_ASSETS);
  assetFams.forEach((fid) => {
    if (!famSet.has(fid)) E(`FAMILY_ASSETS 引用了不存在的考点族「${fid}」`);
  });
  famIds.forEach((id) => {
    if (!assetFams.includes(id)) E(`考点族「${id}」没有资产归属记录（FAMILY_ASSETS 缺该族）`);
  });
  Object.entries(FAMILY_ASSETS).forEach(([fid, a]) => {
    (a.concepts || []).forEach((cid) => {
      if (!C_IDS.has(cid)) E(`族「${fid}」引用了不存在的概念卡「${cid}」`);
      if (cOwner.has(cid)) E(`概念卡「${cid}」同时归入「${cOwner.get(cid)}」与「${fid}」（应恰好一族）`);
      cOwner.set(cid, fid);
    });
    (a.formulas || []).forEach((name) => {
      if (!FORMULA_NAMES.has(name)) E(`族「${fid}」引用了不存在的公式「${name}」`);
      if (fOwner.has(name)) E(`公式「${name}」同时归入「${fOwner.get(name)}」与「${fid}」（应恰好一族）`);
      fOwner.set(name, fid);
    });
    (a.methods || []).forEach((mid) => {
      if (!M_IDS.has(mid)) E(`族「${fid}」引用了不存在的方法卡「${mid}」`);
      mOwner.set(mid, (mOwner.get(mid) || 0) + 1);
    });
    if (a.ladder) {
      const lad = LADDERS.find((l) => l.id === a.ladder);
      if (!lad) E(`族「${fid}」引用的阶梯「${a.ladder}」不存在`);
      else if (lad.anchor !== fid) E(`族「${fid}」引用的阶梯「${a.ladder}」锚定的是「${lad.anchor}」`);
    }
  });
  const cOrphan = CONCEPTS.filter((c) => !cOwner.has(c.id)).map((c) => c.id);
  if (cOrphan.length) W(`${cOrphan.length} 张概念卡未归入任何考点族：${cOrphan.join('、')}`);
  const fOrphan = FORMULAS.filter((f) => !fOwner.has(f.name)).map((f) => f.name);
  if (fOrphan.length) W(`${fOrphan.length} 条公式未归入任何考点族：${fOrphan.join('、')}`);
  const mOrphan = METHODS.filter((m) => !mOwner.has(m.id)).map((m) => m.id);
  if (mOrphan.length) E(`${mOrphan.length} 张方法卡未归入任何考点族：${mOrphan.join('、')}`);

  /* ⑤ 三档合计必须等于「年均必做总分」（= 各卷必做总分之和 ÷ 卷数）
        两端口径必须对齐：KNOW_STATS 的 avg 是年均，mainTotal 是 4 年总和。
        曾写成直接比 mainTotal，报「100.2 ≠ 400」——是校验器自己的口径错。 */
  const mainTotal = PAPER_STATS.reduce((a, s) => a + s.mainTotal, 0);
  const mainAvg = mainTotal / PAPERS.length;
  const tierSum = KNOW_TIERS.reduce((a, t) => a + KNOW_STATS.byTier[t.key].avg, 0);
  if (Math.abs(tierSum - mainAvg) > 1) {
    E(`讲解三档年均合计 ${tierSum.toFixed(1)} 与年均必做总分 ${mainAvg.toFixed(1)} 不符（差 >1）`);
  }
  const tierFams = KNOW_TIERS.reduce((a, t) => a + KNOW_STATS.byTier[t.key].families, 0);
  if (tierFams !== famIds.length) {
    E(`讲解三档族数合计 ${tierFams} ≠ 考点族数 ${famIds.length}`);
  }
  KNOW_STATS.rows.forEach((r) => {
    if (!KNOW_BY_FAMILY.get(r.id)) E(`KNOW_STATS 里的族「${r.id}」查不到讲解`);
  });
}


/* ==========================================================
   10. 学习页（learn.html）· 概念 / 公式 / 知识点 → 题 的通路
   ----------------------------------------------------------
   这一层的核心风险不是页面崩，而是「点了去练，落进去没有题」
   ——按钮还在，学生点了发现空池，比没有按钮更糟。
   所以每条都断言「能到族，且该族有题」。
   ========================================================== */
{
  const {
    CONCEPT_TO_FAMILY, FORMULA_TO_FAMILY, LEARN_MODULES, TOPIC_MAP, FAMILY_DEFS,
  } = await import('../src/index.js');

  const famHasQ = (fid) => (Q_BY_FAMILY.get(fid) || []).length > 0;
  const famSet = new Set(FAMILY_MAP.map((f) => f.id));

  /* ① 反查表不许丢项：50 张概念卡、46 条公式各恰好一条 */
  if (CONCEPT_TO_FAMILY.size !== CONCEPTS.length) {
    E(`概念→族反查表 ${CONCEPT_TO_FAMILY.size} 项 ≠ 概念卡 ${CONCEPTS.length} 张（反转时丢了项）`);
  }
  if (FORMULA_TO_FAMILY.size !== FORMULAS.length) {
    E(`公式→族反查表 ${FORMULA_TO_FAMILY.size} 项 ≠ 公式 ${FORMULAS.length} 条（反转时丢了项）`);
  }

  /* ② 每张概念卡 → 族存在 → 该族有题（否则「练这一族」是空池） */
  CONCEPTS.forEach((c) => {
    const fid = CONCEPT_TO_FAMILY.get(c.id);
    if (!fid) E(`概念卡「${c.id} ${c.claim}」反查不到考点族，「练这一族」会落空`);
    else if (!famSet.has(fid)) E(`概念卡「${c.id}」指向不存在的族「${fid}」`);
    else if (!famHasQ(fid)) E(`概念卡「${c.id}」所在族「${fid}」没有站内题，点进去是空池`);
  });

  /* ③ 每条公式同上 */
  FORMULAS.forEach((f) => {
    const fid = FORMULA_TO_FAMILY.get(f.name);
    if (!fid) E(`公式「${f.name}」反查不到考点族，「练这一族」会落空`);
    else if (!famSet.has(fid)) E(`公式「${f.name}」指向不存在的族「${fid}」`);
    else if (!famHasQ(fid)) E(`公式「${f.name}」所在族「${fid}」没有站内题，点进去是空池`);
  });

  /* ④ 每个真题知识点 → 族存在 → 该族有题 */
  const t2f = new Map();
  FAMILY_DEFS.forEach((f) => f.topics.forEach((t) => t2f.set(t, f.id)));
  Object.entries(TOPIC_MAP).forEach(([k, t]) => {
    const fid = t2f.get(t.topic);
    if (!fid) E(`真题知识点「${t.topic}」未归入任何考点族`);
    else if (!famHasQ(fid)) E(`真题知识点「${t.topic}」所在族「${fid}」没有站内题`);
  });

  /* ⑤ 模块计数必须与数据一致（页面上的数字来自 LEARN_MODULES） */
  const expect = {
    concept: CONCEPTS.length,
    formula: FORMULAS.length,
    topic: Object.keys(TOPIC_MAP).length,
  };
  LEARN_MODULES.forEach((m) => {
    if (expect[m.key] == null) E(`LEARN_MODULES 出现未知模块「${m.key}」`);
    else if (m.count !== expect[m.key]) {
      E(`LEARN_MODULES.${m.key} 计数 ${m.count} ≠ 实际 ${expect[m.key]}`);
    }
  });
  if (LEARN_MODULES.length !== 3) E(`LEARN_MODULES 应为 3 个模块，实为 ${LEARN_MODULES.length}`);

  /* ⑥ 产物里的条目数与入口数必须对得上（页面生成漏项会静默少条目） */
  const learnPath = join(ROOT, 'learn.html');
  if (existsSync(learnPath)) {
    const html = readFileSync(learnPath, 'utf8');
    const items = (html.match(/class="learn-item"/g) || []).length;
    const total = expect.concept + expect.formula + expect.topic;
    if (items !== total) E(`learn.html 条目数 ${items} ≠ ${total}（概念+公式+知识点）`);

    const drillLinks = (html.match(/href="drill\.html\?family=f-/g) || []).length;
    if (drillLinks !== total) {
      E(`learn.html「练这一族」入口 ${drillLinks} 个 ≠ 条目 ${total} 个（有条目进不了练习）`);
    }
    const testLinks = (html.match(/href="drill\.html\?qtype=concept/g) || []).length;
    if (testLinks !== expect.concept) {
      E(`learn.html「测这张卡」入口 ${testLinks} 个 ≠ 概念卡 ${expect.concept} 张`);
    }

    /* ⑦ 三级下钻结构：目录卡、章容器、分页器都要在
          「条目在 DOM 里」不等于「用户能看到」——目录层或章容器缺了，
          页面会只剩一片空白，而条目数照样是 139。所以逐层验。 */
    const tocCards = (html.match(/class="toc-card"/g) || []).length;
    const chapters = (html.match(/class="learn-chapter"/g) || []).length;
    const pagers = (html.match(/class="pager" data-pager=/g) || []).length;

    /* 目录卡 = 每个模块的章数之和（有内容的章才出卡） */
    const chWithConcept = new Set(CONCEPTS.map((c) => c.chapter)).size;
    const chWithFormula = new Set(FORMULAS.map((f) => f.chapter)).size;
    const chWithTopic = new Set(Object.keys(TOPIC_MAP).map((k) => k.split('|')[0])).size;
    const expectToc = chWithConcept + chWithFormula + chWithTopic;
    if (tocCards !== expectToc) {
      E(`learn.html 目录卡 ${tocCards} 张 ≠ 应有 ${expectToc} 张（三模块各自的章数之和）`);
    }
    if (chapters !== expectToc) {
      E(`learn.html 章容器 ${chapters} 个 ≠ ${expectToc}（点目录进不去某一章）`);
    }
    /* 分页器只给超过 8 条的章，所以数量是 0..expectToc 之间，不能是 0（有章确实超 8 条） */
    /* 诚实边界不许丢：它是「关联是族级不是逐题」这个承诺的落点。
       曾因重写模板整段丢失过一次，页面照样能渲染、条目数照样对——
       正是这种「看不出来」的缺失最需要断言。 */
    if (!html.includes('关联是族级的') || !html.includes('不宣称押题')) {
      E('learn.html 缺诚实边界（关联是族级 / 不宣称押题）——这是页面的信任基础，不能省');
    }
    if (pagers === 0) {
      E('learn.html 没有任何分页器——章内超过 8 条时不分页会一屏铺不完');
    }

    /* ⑧ 每个条目必须落在某个章容器里（孤立条目 = 目录点不进去） */
    const itemsInChapters = (html.match(/class="learn-items" data-items="[^"]+">/g) || []).length;
    if (itemsInChapters !== chapters) {
      E(`learn.html 有条目的章 ${itemsInChapters} ≠ 章容器 ${chapters}`);
    }
  }
}

/* ==========================================================
   输出
   ========================================================== */
const stat = {
  章节: CHAPTERS.length,
  方法卡: METHODS.length,
  题目: QUESTIONS.length,
  计算题: CALC_QUESTIONS.length,
  概念卡: CONCEPTS.length,
  判断: CONCEPTS.reduce((a, c) => a + (c.tests || []).length, 0),
  公式: FORMULAS.length,
  变式阶梯: LADDERS.length,
  阶梯题: LADDER_QUESTIONS.length,
};

console.log('\n=== 内容校验 ===');
Object.entries(stat).forEach(([k, v]) => console.log(`  ${k}：${v}`));
console.log('');

if (warns.length) {
  console.log(`⚠ ${warns.length} 条警告：`);
  warns.slice(0, 15).forEach((w) => console.log('  · ' + w));
  if (warns.length > 15) console.log(`  …还有 ${warns.length - 15} 条`);
  console.log('');
}
if (errors.length) {
  console.log(`✕ ${errors.length} 条错误：`);
  errors.slice(0, 25).forEach((e) => console.log('  · ' + e));
  if (errors.length > 25) console.log(`  …还有 ${errors.length - 25} 条`);
  process.exit(1);
} else {
  console.log('✓ 校验通过（0 错误）');
}
