/* ==========================================================
   数据汇总入口 · 唯一 import 点
   所有页面生成器与校验脚本只从这里取数据，避免多处 import 散乱。
   ========================================================== */
import { CHAPTERS, EXAM_STRUCTURE, TIERS, DAILY, PHASES } from './data-chapters.js';
import { METHODS } from './data-methods.js';
import { CONCEPTS as CONCEPTS_1 } from './data-concepts.js';
import { CONCEPTS_2 } from './data-concepts2.js';

const CONCEPTS = [...CONCEPTS_1, ...CONCEPTS_2];
import { QUESTIONS as METHOD_QUESTIONS } from './data-questions.js';
import { CALC_QUESTIONS as CALC_1 } from './data-calc.js';
import { CALC_QUESTIONS_2 as CALC_2 } from './data-calc2.js';

const CALC_QUESTIONS = [...CALC_1, ...CALC_2];
import { FORMULAS } from './data-formulas.js';
import { GEO_QUESTIONS } from './data-geo.js';
import { LADDERS, LADDER_QUESTIONS } from './data-ladders.js';
import { METHOD_VARIANTS_1 } from './data-variants1.js';
import { METHOD_VARIANTS_2 } from './data-variants2.js';
import { PAPER_GAP_QUESTIONS } from './data-paper-gap.js';
import { BALANCE_QUESTIONS, BALANCE_QUESTIONS_2, BALANCE_QUESTIONS_3 } from './data-balance.js';
import { EQ_QUESTIONS } from './data-eq-balance.js';
import { MAGIC_QUESTIONS } from './data-magic.js';
import { GAP_QUESTIONS } from './data-gap.js';
import { METHOD_FILL_QUESTIONS } from './data-method-fill.js';
import { BIG_QUESTIONS } from './data-big.js';
import { SLOTS, SLOT_STATS, MUST100 } from './data-slots.js';
import { SLOT_QUESTIONS } from './data-slot-questions.js';
import { SLOT_FORMAT_QUESTIONS } from './data-slot-format.js';
import { QTYPE_MAP } from './data-qtype.js';
import { EXAM_BANK } from './data-exam-bank.js';
import { buildFamilyMap } from './data-family-map.js';
import { KNOW, FAMILY_ASSETS } from './data-know.js';
import {
  PAPERS, CH_SCORE, CAT_SCORE, DIFF_SCORE,
  MUST_TEST, HIGH_FREQ, ROTATE_TEST, TRENDS, COVERAGE,
  PAPER_STATS, statPaper, CH_NAME, DIFF_NAME, DIFF_CRITERIA,
  DIFF_COUNT, DIFF_INDEX, TOPIC_MAP, TOPICS_BY_CH,
  FAMILY_DEFS, FAMILY_MAP, FAMILIES_SORTED, FREQ_SUMMARY, FAMILY_QTYPE,
  TOPIC_SOURCES, TOPIC_TRACE, TRACE_SUMMARY,
  METHOD_TO_TOPICS, CHAPTER_TO_TOPICS, CALCTYPE_TO_TOPICS, traceQuestion,
} from './data-papers.js';

export { CHAPTERS, EXAM_STRUCTURE, TIERS, DAILY, PHASES, METHODS, CONCEPTS, CALC_QUESTIONS, FORMULAS };
/* 方法卡配套题（不含计算专项）——校验器需要区分两者 */
export { METHOD_QUESTIONS, GEO_QUESTIONS, PAPER_GAP_QUESTIONS, BALANCE_QUESTIONS, BALANCE_QUESTIONS_2, BALANCE_QUESTIONS_3, EQ_QUESTIONS, MAGIC_QUESTIONS, GAP_QUESTIONS, METHOD_FILL_QUESTIONS, BIG_QUESTIONS, SLOT_QUESTIONS, SLOT_FORMAT_QUESTIONS };
/* 槽位专项（满分版训练结构） */
export { SLOTS, SLOT_STATS, MUST100 };
/* 变式阶梯 */
export { LADDERS, LADDER_QUESTIONS };
/* 方法卡三级变式 */
export { METHOD_VARIANTS_1, METHOD_VARIANTS_2 };
/* 真题分析 */
export {
  PAPERS, CH_SCORE, CAT_SCORE, DIFF_SCORE,
  MUST_TEST, HIGH_FREQ, ROTATE_TEST, TRENDS, COVERAGE,
  PAPER_STATS, statPaper, CH_NAME, DIFF_NAME, DIFF_CRITERIA,
  DIFF_COUNT, DIFF_INDEX, TOPIC_MAP, TOPICS_BY_CH,
  FAMILY_DEFS, FAMILY_MAP, FAMILIES_SORTED, FREQ_SUMMARY, FAMILY_QTYPE,
  TOPIC_SOURCES, TOPIC_TRACE, TRACE_SUMMARY,
  METHOD_TO_TOPICS, CHAPTER_TO_TOPICS, CALCTYPE_TO_TOPICS, traceQuestion,
};

/* 兼容别名：校验器与页面生成器按 ALL_* 命名引用 */
export { CONCEPTS as ALL_CONCEPTS };

/* ---------------- 派生索引 ---------------- */
export const CH_BY_ID = new Map(CHAPTERS.map((c) => [c.id, c]));
export const M_BY_ID = new Map(METHODS.map((m) => [m.id, m]));

/* 全部可练题目 = 方法卡配套题 + 计算专项 */
/* 把四类化字段合并进每道题：qtype / answer / options / key / distractors */
/* 旧原创题库（2026-11-25 停用，保留定义以便回退）。
   用户要求「只练真题」，所以 ALL_QUESTIONS 现在只含 EXAM_BANK。
   要恢复旧库：把下面 LEGACY_QUESTIONS 加回 ALL_QUESTIONS 即可。 */
export const LEGACY_QUESTIONS = [...METHOD_QUESTIONS, ...CALC_QUESTIONS, ...GEO_QUESTIONS, ...PAPER_GAP_QUESTIONS, ...BALANCE_QUESTIONS, ...BALANCE_QUESTIONS_2, ...BALANCE_QUESTIONS_3, ...EQ_QUESTIONS, ...MAGIC_QUESTIONS, ...LADDER_QUESTIONS, ...METHOD_VARIANTS_1, ...METHOD_VARIANTS_2, ...GAP_QUESTIONS, ...METHOD_FILL_QUESTIONS, ...BIG_QUESTIONS, ...SLOT_QUESTIONS, ...SLOT_FORMAT_QUESTIONS];

/* 可练题库 = 真题原文（五套 130 题）。
   字段与旧库对齐（id/chapter/tier/qtype/stem/options/key/answer/...），
   额外带 stemParts（公式图）与 examRef（回链核验页）。 */
export const ALL_QUESTIONS = EXAM_BANK.map((q) => {
  const TIER = { easy: 'l1', mid: 'l2', hard: 'l3', top: 'l3' };
  return {
    id: q.id,
    chapter: q.chapter,
    method: null,
    tier: TIER[q.diff] || 'l2',
    qtype: q.qtype,
    score: q.score,
    tierName: q.year + ' 第' + q.no + '题 · ' + (q.name || q.topic || ''),
    errorTags: ['exam'],
    stemParts: q.stemParts,
    stem: q.stemText,
    solution: '',
    examRef: { paperId: q.paperId, year: q.year, no: q.no, score: q.score, bonus: q.bonus },
    topic: q.topic || '',
    hasAnswer: q.hasAnswer,
    officialKey: q.officialKey,
    ...(q.options ? { options: q.options } : {}),
    /* 选项的原始片段（含公式图），渲染层据此逐片段输出 */
    ...(q.options && q.optionParts ? { __optParts: q.optionParts } : {}),
    ...(q.key != null ? { key: q.key } : {}),
    ...(q.answer ? { answer: q.answer } : {}),
    ...(q.accept ? { accept: q.accept } : {}),
    __imgBase: 'assets/exam-src/' + q.paperId + '/',
  };
});
/* 合并四类化字段（就地补，不改原数据文件）
   ----------------------------------------------------------
   关键约束：有多步 steps 的题不能被标成 calc / single。
   因为 calc/single 走「题目级单空判分」路径——只判最终答案，
   学生填了第一步的式子会被拿最终答案判错。
   这是静默的判分错误，比报错更伤（学生以为自己错了，其实判错了）。

   所以规则：
     有 steps 且 ≥2 步 → 一律 'steps'（逐步作答），只继承 family
     有 steps 但 1 步   → 可按 calc/single 判（单步等价于单空）
     无 steps           → 用 QTYPE_MAP 的 qtype，缺省 'calc'
   big 例外：big 是「不判分、只对答案」的大题，即使有多步也保留 big
     （big 的步骤只作展示骨架，不做判定） */
ALL_QUESTIONS.forEach((q) => {
  /* 真题库自带 qtype，不再走 QTYPE_MAP */
  if (q.qtype) return;
  const t = QTYPE_MAP[q.id];
  const multiStep = (q.steps || []).length >= 2;

  if (t) {
    const keepBig = t.qtype === 'big';
    const forced = multiStep && !keepBig ? 'steps' : t.qtype;
    Object.assign(q, {
      qtype: forced,
      family: t.family || q.family,
      /* 只有非步骤题才吸收题目级判分字段，避免污染步骤判定 */
      answer: keepBig || !multiStep ? t.answer : q.answer,
      options: keepBig || !multiStep ? t.options : q.options,
      key: keepBig || !multiStep ? t.key : q.key,
      accept: keepBig || !multiStep ? t.accept : q.accept,
      distractors: keepBig || !multiStep ? t.distractors : q.distractors,
    });
  } else {
    q.qtype = q.qtype || (multiStep ? 'steps' : 'calc');
  }
});

/* ==========================================================
   方法卡母题/变式清空（2026-11-25）
   ----------------------------------------------------------
   练习池换成真题后，方法卡原来引用的母题/变式（原创题）全不存在了。
   真题没有「改数字/改条件/逆向」这种人工变式，无法重挂。

   决定：方法卡退化为**纯讲解卡**——只保留
     识别信号 / 标准步骤 / 常见误用
   三段，不再挂母题与变式链。变式阶梯页同步下线。

   源文件 data-methods.js 不改（保留原引用），便于日后恢复。
   ========================================================== */
METHODS.forEach((m) => {
  m.motherId = null;
  m.variantIds = [];
});

/* 页面生成器沿用 QUESTIONS 命名，指全部可练题目 */
export const QUESTIONS = ALL_QUESTIONS;
export const Q_BY_ID = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));

export const Q_BY_METHOD = new Map();
export const Q_BY_CHAPTER = new Map();
export const C_BY_CHAPTER = new Map();

ALL_QUESTIONS.forEach((q) => {
  if (q.method) {
    if (!Q_BY_METHOD.has(q.method)) Q_BY_METHOD.set(q.method, []);
    Q_BY_METHOD.get(q.method).push(q);
  }
  if (!Q_BY_CHAPTER.has(q.chapter)) Q_BY_CHAPTER.set(q.chapter, []);
  Q_BY_CHAPTER.get(q.chapter).push(q);
});
CONCEPTS.forEach((c) => {
  if (!C_BY_CHAPTER.has(c.chapter)) C_BY_CHAPTER.set(c.chapter, []);
  C_BY_CHAPTER.get(c.chapter).push(c);
});

/* 计算专项按类型分组 */
export const CALC_BY_TYPE = new Map();
CALC_QUESTIONS.forEach((q) => {
  if (!CALC_BY_TYPE.has(q.calcType)) CALC_BY_TYPE.set(q.calcType, []);
  CALC_BY_TYPE.get(q.calcType).push(q);
});

/* ---------------- 族标签（真题考点族 ↔ 站内题） ----------------
   为什么放在这里：族是「排序」与「回流」共用的唯一可寻址单位。
   排序按族排（真题权重 → 档位），回流按族记状态（未测/训练中/已达标）。
   没有这层，诊断只能落到章节（一章 83 题，无法专项），
   真题分析里的「角度推理 19 分」也点不进去练。 */
export const FAMILY_OF_Q = {};        /* qid → familyId */
export const Q_BY_FAMILY = new Map(); /* familyId → [q] */
export const UNRESOLVED_FAMILY = [];  /* 归不到族的题，validate 会报错 */

{
  const { map, byFamily, unresolved } = buildFamilyMap(ALL_QUESTIONS);
  Object.assign(FAMILY_OF_Q, map);
  UNRESOLVED_FAMILY.push(...unresolved);
  Object.entries(byFamily).forEach(([fid, qids]) => {
    Q_BY_FAMILY.set(fid, qids.map((id) => Q_BY_ID.get(id)).filter(Boolean));
  });
  /* 把 family 写回题目对象：运行时分片直接带 family 字段，
     前端 qRecord 不必再查映射表（分片是 JSON，查表还要多传一份）。 */
  ALL_QUESTIONS.forEach((q) => { if (FAMILY_OF_Q[q.id]) q.family = FAMILY_OF_Q[q.id]; });
}

/* ---------------- 讲解层（按考点族组织） ----------------
   为什么单独一层：概念卡/方法卡/公式卡都挂在「章节」上，而真题分析和
   排序/回流都用「考点族」。讲解必须跟族走，否则「某族 4.8 分/年」这句话
   落不到「该族讲什么」。口径与缺口见 src/data-know.js 文件头。 */
export { KNOW, FAMILY_ASSETS };
export const KNOW_BY_FAMILY = new Map(KNOW.map((k) => [k.family, k]));

/* 三档讲解深度：判据写死在 data-know.js 文件头，此处只做派生，
   页面数字全部从这里取，不写字面量。 */
export const KNOW_FORM_NAME = {
  process: '过程型', rule: '规则型', entry: '入题型',
};
export const KNOW_FORM_NOTE = {
  process: '单题 5 分以上，一步错全题废 —— 讲步骤骨架与每步采分点',
  rule: '单题 2 分，失分机制是「想不起来」—— 讲识别信号与反例',
  entry: '压轴整题给分、没有部分分 —— 只讲入场动作与分类标准',
};

/* 每族的讲解档位：deep ≥4 分/年、std 2–4、scan <2。
   判据只用年均分，不用 freq——f-magic 年均 2 分却五年必考，
   若按 freq 分会排在 f-anglereason（年均 3.8）前面，与提分效率相反。 */
export const KNOW_TIERS = [
  { key: 'deep', name: '深讲', min: 4, note: '分值高、要写正文，讲解与训练都要到位' },
  { key: 'std', name: '标准', min: 2, note: '分值中等，讲清识别规则即可' },
  { key: 'scan', name: '速览', min: 0, note: '分值低或偶考，只给识别信号' },
];

export const KNOW_STATS = (() => {
  const tierOf = (avg) => (avg >= 4 ? 'deep' : avg >= 2 ? 'std' : 'scan');
  const rows = FAMILIES_SORTED.map((f) => {
    const k = KNOW_BY_FAMILY.get(f.id) || {};
    const a = FAMILY_ASSETS[f.id] || {};
    return {
      id: f.id, name: f.name, ch: f.ch, cat: f.cat,
      avg: f.avgPerYear, hitYears: f.hitYears, maxScore: f.maxScore, freq: f.freq,
      tier: tierOf(f.avgPerYear),
      form: k.form || null, hand: !!k.hand,
      nConcept: (a.concepts || []).length,
      nFormula: (a.formulas || []).length,
      nMethod: (a.methods || []).length,
      ladder: a.ladder || null,
      qCount: (Q_BY_FAMILY.get(f.id) || []).length,
    };
  });
  const byTier = {};
  KNOW_TIERS.forEach((t) => {
    const g = rows.filter((r) => r.tier === t.key);
    byTier[t.key] = {
      families: g.length,
      avg: +g.reduce((a, r) => a + r.avg, 0).toFixed(1),
      pct: Math.round(g.reduce((a, r) => a + r.avg, 0)),
      rows: g,
    };
  });
  const total = +rows.reduce((a, r) => a + r.avg, 0).toFixed(1);
  return {
    rows, byTier, total,
    handCount: rows.filter((r) => r.hand).length,
    handAvg: +rows.filter((r) => r.hand).reduce((a, r) => a + r.avg, 0).toFixed(1),
    noAsset: rows.filter((r) => !r.nConcept && !r.nFormula).length,
    noAssetAvg: +rows.filter((r) => !r.nConcept && !r.nFormula).reduce((a, r) => a + r.avg, 0).toFixed(1),
  };
})();

/* ==========================================================
   学习层：概念卡 / 公式 → 考点族 → 题 的反查表
   ----------------------------------------------------------
   为什么需要反向查询：FAMILY_ASSETS 是「族 → 概念卡/公式」，
   而学习页是「给一张概念卡，找它的题」。没有题目级的
   concept/formula 字段，所以只能经族中转。

   为什么这样够用（不是偷懒）：
     · FAMILY_ASSETS 已把 50 张概念卡、46 条公式各恰好归入一族
       （validate.mjs 第 9 节守着，漏归/重归都报错）
     · 27 个族全部有站内题（Q_BY_FAMILY 无空族）
   所以「概念 → 族 → 题」这条链每一步都有保证，不存在断头路。

   代价是族级关联：点「练这一族」进的是该族全部题，不是「只考这张卡的
   3 道题」。页面上的这段说明已按用户要求删除（2026-11-24）。
   ========================================================== */
export const CONCEPT_TO_FAMILY = new Map();
export const FORMULA_TO_FAMILY = new Map();
Object.entries(FAMILY_ASSETS).forEach(([fid, a]) => {
  (a.concepts || []).forEach((cid) => CONCEPT_TO_FAMILY.set(cid, fid));
  (a.formulas || []).forEach((name) => FORMULA_TO_FAMILY.set(name, fid));
});

/* 三模块的展示描述。计数从数据派生，页面不写字面量。 */
export const LEARN_MODULES = [
  {
    key: 'concept', name: '概念', unit: '张概念卡',
    count: CONCEPTS.length,
    note: '先记「必满足的条件」，再判断题里的说法是否成立。初一的失分大量来自概念边界——单项式次数、绝对值分类、等式性质适用条件。',
  },
  {
    key: 'formula', name: '公式', unit: '条公式法则',
    count: FORMULAS.length,
    note: '每条都带适用条件与常见误用。初一失分多数不是记不住公式，是条件不满足还硬套——所以「适用条件」比公式本身更重要。',
  },
  {
    key: 'topic', name: '知识点', unit: '个真题考点',
    /* 按「章 + 考点」记录数计（43），不是唯一考点名（42）：
       有 1 个考点（列代数式）跨两章出现，学习页按章节分组展示，
       所以它必须出现两次、各归各章，否则会有一章漏项。 */
    count: Object.keys(TOPIC_MAP).length,
    note: `来自 ${PAPERS.length} 份区统考卷的逐题标注，不是教材目录。分值是该考点 ${PAPERS.length} 年的累计分，年数指出现过的卷数。`,
  },
];


export const CALC_TYPE_NAME = {
  mix: '四则混合',
  power: '乘方与科学记数法',
  bracket: '去括号与合并同类项',
  eq: '解一元一次方程',
  simplify: '整式化简求值',
};

/* ---------------- 统计（页面数字的唯一来源） ---------------- */
export const STATS = {
  chapters: CHAPTERS.length,
  methods: METHODS.length,
  questions: QUESTIONS.length,
  calcQuestions: CALC_QUESTIONS.length,
  allQuestions: ALL_QUESTIONS.length,
  concepts: CONCEPTS.length,
  conceptTests: CONCEPTS.reduce((a, c) => a + (c.tests || []).length, 0),
  formulas: FORMULAS.length,
  steps: ALL_QUESTIONS.reduce((a, q) => a + (q.steps || []).length, 0),
  /* 挂了方法卡的题数（首页「讲解」卡用） */
  methodQCount: ALL_QUESTIONS.filter((q) => q.method).length,
  byTier: {
    l1: ALL_QUESTIONS.filter((q) => q.tier === 'l1').length,
    l2: ALL_QUESTIONS.filter((q) => q.tier === 'l2').length,
    l3: ALL_QUESTIONS.filter((q) => q.tier === 'l3').length,
  },
  byTierMethods: {
    l1: METHODS.filter((m) => m.tier === 'l1').length,
    l2: METHODS.filter((m) => m.tier === 'l2').length,
    l3: METHODS.filter((m) => m.tier === 'l3').length,
  },
};
