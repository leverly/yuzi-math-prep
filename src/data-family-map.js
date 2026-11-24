/* ==========================================================
   族标签层：把每一道站内题归属到 27 个真题考点族之一

   为什么需要这一层
   ----------------
   站内有三套互不相通的坐标系：
     · 真题分析用「考点族」（27 个，有分值、有频次）
     · 练习用「方法卡 23 / 章节 6」（有题）
     · 诊断用「六类错因 / 第几步」（有记录）
   诊断说「几何偏弱」，落不到「角度推理 19 分、3 年考」；真题说「压轴 26 分」，
   点不进去练。族标签是把三者焊在一起的唯一办法：
     planToday() 按族排序 → 练族 → qRecord 记族 → familyState 判族 → 次日重排。

   推导顺序（前一步成功就不再往下走）
   ----------------------------------
   ① Q_FAMILY_OVERRIDE  人工指定（少数关键词判不准的题）
   ② METHOD_FAMILY      按方法卡 + 关键词消歧（11 张卡跨族）
   ③ CALCTYPE_FAMILY    按运算类型 + 关键词消歧（计算题没有方法卡）
   ④ 仍无解 → 进 UNRESOLVED，validate.mjs 直接报错

   为什么不许「推不出就跳过」：跳过等于「这题练了但不计入任何族」，
   诊断看不见、排序算不到，静默失效。宁可构建失败。

   关键约束：族 id 必须与 src/data-papers.js 的 FAMILY_DEFS 逐字一致。
   ========================================================== */

/* ---------------- ① 人工覆盖 ----------------
   28 道题既无 method 也无 calcType，靠章节 + 题干定族。
   每条都要能说清「凭什么归这一族」，不能只写族名。 */
export const Q_FAMILY_OVERRIDE = {
  /* 尺规作图：题干含「用直尺和圆规」「用语句表述…作图」 */
  'q-draw-1': 'f-construct',
  'q-draw-2': 'f-construct',
  'q-draw-5': 'f-construct',
  'q-draw-6': 'f-construct',
  'q-bal-geo-12': 'f-construct',   /* 方位角作图 */

  /* 线段长度与中点：给全长求分段，或含中点 */
  'q-bal-geo-1': 'f-midpoint',
  'q-bal-geo-2': 'f-midpoint',
  'q-bal-geo-13': 'f-midpoint',    /* C 在「直线」AB 上 → 需分类讨论 */
  'cf-ch-04': 'f-midpoint',        /* 数轴上求中点坐标 */

  /* 点线面与位置关系：概念判断、图形计数、点动成线 */
  'q-bal-geo-8': 'f-pos',
  'q-bal-geo-9': 'f-pos',
  'q-bal-geo-11': 'f-pos',
  'q-bal-geo-15': 'f-pos',
  'cf-ch-19': 'f-pos',
  'cf-fi-14': 'f-pos',

  /* 绝对值与数轴：数轴读符号、大小比较 */
  'q-bal-ra-3': 'f-abs-line',
  'q-bal-ra-4': 'f-abs-line',
  'cf-fi-16': 'f-abs-line',

  /* 数字填图 */
  'q-bal-magic-1': 'f-magic',
  'q-bal-magic-2': 'f-magic',
  'q-bal-magic-3': 'f-magic',

  /* 展开图与三视图 */
  'cf-ch-12': 'f-solid',

  /* 反比例 */
  'cf-ch-13': 'f-inverse',

  /* 科学记数法与近似数：精确度 */
  'cf-fi-01': 'f-scinot',
  'cf-fi-02': 'f-scinot',

  /* 单项式构造 */
  'cf-fi-07': 'f-mono',

  /* 列代数式建模：用含 x 的式子表示售价 */
  'cf-fi-09': 'f-model-expr',
  'cf-fi-10': 'f-model-expr',

  /* ---- 2026-11-24 补入的 cf- 系列（无 method/calcType，逐条人工定族） ---- */

  /* 方程与等式的关系辨析 */
  'cf-ch-32': 'f-eqconcept',
  /* 乘方与运算顺序（同 -3^2 与 (-3)^2 一类） */
  'cf-ch-33': 'f-mixcalc',
  'cf-ch-34': 'f-mixcalc',
  'cf-ch-35': 'f-mixcalc',
  'cf-fi-38': 'f-mixcalc',
  'cf-fi-39': 'f-mixcalc',
  'cf-fi-40': 'f-mixcalc',
  'cf-fi-41': 'f-mixcalc',
  'cf-ch-36': 'f-mixcalc',
  'cf-fi-44': 'f-mixcalc',
  'cf-fi-45': 'f-mixcalc',
  /* 科学记数法（含「用科学记数法表示」的运算结果） */
  'cf-fi-42': 'f-scinot',
  'cf-fi-43': 'f-scinot',
  /* 解方程：直接求解 */
  'cf-fi-46': 'f-solve',
  'cf-fi-47': 'f-solve',
  'cf-fi-48': 'f-solve',
  'cf-fi-49': 'f-solve',
  /* 等式性质变形辨析 */
  'cf-ch-37': 'f-eqconcept',
  /* 方程解求参数 */
  'cf-fi-50': 'f-eqparam',
  'cf-fi-51': 'f-eqparam',
  'cf-fi-52': 'f-eqparam',
  /* 方程应用题：和差问题、利润率 */
  'cf-fi-53': 'f-eqapp',
  'cf-fi-54': 'f-eqapp',
  /* 相反数 / 绝对值辨析 */
  'cf-ch-38': 'f-abs-line',
  'cf-fi-55': 'f-abs-line',
  /* 数轴两点距离 */
  'cf-fi-56': 'f-abs-line',

  /* ---- 变式阶梯题（2026-11-24 补）----
     阶梯题的 method 可能是空字符串（这两族原本没有对应方法卡），
     METHOD_FAMILY 查不到，所以必须在这里显式指定。
     漏标会让这两族的新阶梯题「有题但归不到族」，
     能力诊断和族状态机都读不到——静默失效。 */
  'lad-sc-1': 'f-scinot',
  'lad-sc-2': 'f-scinot',
  'lad-sc-3': 'f-scinot',
  'lad-me-1': 'f-model-expr',
  'lad-me-2': 'f-model-expr',
  'lad-me-3': 'f-model-expr',
};

/* ---------------- ② 方法卡 → 族 ----------------
   每张卡给一个默认族；跨族的卡再给一组关键词规则，按顺序取第一个命中。
   规则里的正则作用在「题干 + 解答」上，所以能匹配到 LaTeX 原文（如 $|a|$）。 */
export const METHOD_FAMILY = {
  /* 唯一族：直接落 */
  'm-op-order':      { def: 'f-mixcalc' },
  'm-simplify-eval': { def: 'f-simplify' },
  'm-substitute':    { def: 'f-eval' },
  'm-abs-value':     { def: 'f-abs-line' },
  'm-numberline-move': { def: 'f-dynamic' },
  'm-unfold':        { def: 'f-solid' },
  'm-magic-sum':     { def: 'f-magic' },
  'm-construct-ruler': { def: 'f-construct' },
  'm-dyn-angle':     { def: 'f-dynamic' },
  'm-geo-reason':    { def: 'f-anglereason' },
  'm-geo-model':     { def: 'f-geomodel' },
  'm-eq-param':      { def: 'f-eqparam' },

  /* 跨族：关键词消歧 */
  'm-sign-rule': {
    def: 'f-mixcalc',
    rules: [[/绝对值|\|a\|/, 'f-abs-line']],
  },
  'm-remove-bracket': {
    def: 'f-like',
    rules: [[/求值/, 'f-simplify']],
  },
  'm-like-terms': {
    def: 'f-like',
    rules: [
      [/单项式/, 'f-mono'],
      [/同类项[\s\S]{0,40}求/, 'f-mono'],
    ],
  },
  /* m-eq-5steps 的消歧规则必须只看「题干问什么」，不能看解答过程。
     踩过的坑：原规则含 /移项/，而解方程的解答必然出现「移项」二字，
     结果所有解方程题都被判成「方程概念辨析」——包括 3 道变式阶梯题。

     f-eqparam 的判据要更严：它指「只求参数，不解方程」。
     所以先排除「题干里还有第二个方程要解」的情况
     （如「…求 a 的值；再求 ax-1=0 的解」——那是解方程，属 f-solve）。 */
  'm-eq-5steps': {
    def: 'f-solve',
    rules: [
      [/^(?=[\s\S]*下列)[\s\S]*变形/, 'f-eqconcept'],
      [/等式两边|等式性质/, 'f-eqconcept'],
      /* 只问参数：题干有「的解是/解为」但不再出现第二个「方程…的解/求…的解」 */
      [/^(?![\s\S]*再求[\s\S]*的解)[\s\S]*(的解是|解为|是方程[\s\S]{0,20}的解)/, 'f-eqparam'],
    ],
  },
  'm-numberline-dist': {
    def: 'f-abs-line',
    rules: [
      [/中点/, 'f-midpoint'],
      [/则称|称为|定义/, 'f-newdef'],
    ],
  },
  'm-eq-model': {
    def: 'f-eqapp',
    rules: [[/余角|补角/, 'f-supp']],
  },
  'm-pattern': {
    def: 'f-pattern',
    rules: [[/反比例/, 'f-inverse']],
  },
  'm-abs-eq': { def: 'f-abs-line' },
  'm-seg-count': {
    def: 'f-midpoint',
    rules: [
      [/多少条线段|多少个角|几个点|共有.*条/, 'f-pos'],
      [/点.*与.*直线|位置关系/, 'f-pos'],
    ],
  },
  'm-angle-calc': {
    def: 'f-angle-sum',
    rules: [
      [/\d+°\s*\d+\s*['′]/, 'f-dms'],          /* 含度分秒写法 */
      [/度分秒|°\s*['′]/, 'f-dms'],
      /* f-supp 的定义是「余角/补角【列方程】」——要设未知数解方程。
         所以只有出现「设/求这个角/是多少度」这类逆向表述才算，
         单纯「求它的余角与补角」是直接算，属 f-angle-sum。
         原规则只写 /余角|补角/，把直接计算题也吞进 f-supp，
         导致同一条阶梯的三级题被拆到两个族。 */
      [/设.*角|求这个角|这个角是|一个角的余角|一个角的补角/, 'f-supp'],
      [/旋转|三角尺/, 'f-dynamic'],
      [/画|作图|直尺/, 'f-construct'],
    ],
  },
  'm-newdef': {
    def: 'f-newdef',
    rules: [
      [/阅读材料/, 'f-read'],
      [/反比例/, 'f-inverse'],
    ],
  },
};

/* ---------------- ③ 运算类型 → 族 ----------------
   计算专项 77 题没有方法卡，但有 calcType。同样给默认族 + 关键词规则。 */
export const CALCTYPE_FAMILY = {
  mix: { def: 'f-mixcalc' },

  /* power 一类里混着三件事：乘方运算、科学记数法、近似数 */
  power: {
    def: 'f-mixcalc',
    rules: [
      [/科学记数法|精确|近似|原数/, 'f-scinot'],
      [/绝对值/, 'f-abs-line'],
      [/相反数/, 'f-abs-line'],
    ],
  },

  /* bracket 一类里混着整式加减与化简求值 */
  bracket: {
    def: 'f-like',
    rules: [
      [/求值/, 'f-simplify'],
      [/单项式/, 'f-mono'],
      [/同类项[\s\S]{0,40}求/, 'f-mono'],
    ],
  },

  eq: {
    def: 'f-solve',
    rules: [
      [/变形|移项|等式性质/, 'f-eqconcept'],
    ],
  },

  /* simplify 一类里混着「化简求值」与「整体代入」 */
  simplify: {
    def: 'f-simplify',
    rules: [
      [/已知[\s\S]{0,30}[=＝][\s\S]{0,20}求/, 'f-eval'],
      [/周长|边长/, 'f-like'],
    ],
  },
};

/* ---------------- 解析器 ---------------- */
function matchRules(rules, hay) {
  if (!rules) return null;
  for (const [re, fam] of rules) {
    if (re.test(hay)) return fam;
  }
  return null;
}

/**
 * 解析一道题的族。
 * @param q 站内题对象（需 id / method / calcType / stem / solution）
 * @returns 族 id，或 null（无解）
 */
export function resolveFamily(q) {
  if (!q || !q.id) return null;

  const ov = Q_FAMILY_OVERRIDE[q.id];
  if (ov) return ov;

  const hay = (q.stem || '') + '\n' + (q.solution || '');

  if (q.method && METHOD_FAMILY[q.method]) {
    const spec = METHOD_FAMILY[q.method];
    return matchRules(spec.rules, hay) || spec.def;
  }

  if (q.calcType && CALCTYPE_FAMILY[q.calcType]) {
    const spec = CALCTYPE_FAMILY[q.calcType];
    return matchRules(spec.rules, hay) || spec.def;
  }

  return null;
}

/**
 * 批量解析。
 * @param questions 站内题数组
 * @returns { map: {qid: famId}, unresolved: [q], byFamily: {famId: [qid]} }
 */
export function buildFamilyMap(questions) {
  const map = {};
  const unresolved = [];
  const byFamily = {};

  questions.forEach((q) => {
    const fam = resolveFamily(q);
    if (!fam) { unresolved.push(q); return; }
    map[q.id] = fam;
    (byFamily[fam] || (byFamily[fam] = [])).push(q.id);
  });

  return { map, unresolved, byFamily };
}
