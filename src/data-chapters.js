/* ==========================================================
   章节树 · 人教版 2024 新版七年级上册
   口径来源：《初一上期中复习指导说明》（校内文件）+ 人教版 2024 教材目录

   与中考站的关键差异：
     ① tier 不是「送分/中档/区分」（按卷面分值），而是 L1/L2/L3（按认知要求）
        因为初一上失分的主因不是「不会」，是「会做但算错、写不全、审不清」
     ② examRefs 改成「题位区间」而非单题号（期末卷 30 题，题位与考点不是一一对应）
     ③ 第六章可开关：若期末不含几何图形初步，把 CHAPTERS 里该章移除即可，
        其余章节与所有派生统计自动跟随，无需改其他文件

   tier 说明：
     l1  熟练层：计算与规范。会做的必须做对，达标线 98%
     l2  理解层：概念与建模。知道为什么、能列式，达标线 90%
     l3  攻坚层：压轴与探究。拿到能拿的分，达标线 50%
   ========================================================== */

export const CHAPTERS = [
  {
    id: 'ch-rational', no: 1, name: '有理数', block: '数与代数',
    prereq: [], tier: ['l1', 'l2'],
    examRefs: { choice: [1, 3, 4], fill: [9, 11, 14], solve: [23, 24] },
    summary: '正负数意义、数轴三要素、相反数、绝对值、有理数大小比较。',
    methods: ['m-abs-value', 'm-numberline-dist'],
    /* 该章在期末卷的典型题位与分值权重 */
    weight: 0.13,
  },
  {
    id: 'ch-op', no: 2, name: '有理数的运算', block: '数与代数',
    prereq: ['ch-rational'], tier: ['l1'],
    examRefs: { choice: [2, 8], fill: [9, 10, 16], solve: [17] },
    summary: '加减乘除乘方、运算律、混合运算顺序、科学记数法与近似数。',
    methods: ['m-op-order', 'm-sign-rule', 'm-magic-sum'],
    weight: 0.20,
  },
  {
    id: 'ch-expr', no: 3, name: '代数式', block: '数与代数',
    prereq: ['ch-op'], tier: ['l1', 'l2'],
    examRefs: { choice: [7, 8], fill: [12, 14, 15], solve: [24] },
    summary: '用字母表示数、代数式书写规范、求值（含整体代入）、规律探究。',
    methods: ['m-substitute', 'm-pattern'],
    weight: 0.13,
  },
  {
    id: 'ch-poly', no: 4, name: '整式的加减', block: '数与代数',
    prereq: ['ch-expr'], tier: ['l1'],
    examRefs: { choice: [4, 5, 6], fill: [11, 12], solve: [18, 19] },
    summary: '单项式与多项式、同类项、去括号法则、整式加减与化简求值。',
    methods: ['m-like-terms', 'm-remove-bracket', 'm-simplify-eval'],
    weight: 0.18,
  },
  {
    id: 'ch-eq', no: 5, name: '一元一次方程', block: '数与代数',
    prereq: ['ch-poly'], tier: ['l1', 'l2', 'l3'],
    examRefs: { choice: [5, 6, 7], fill: [12, 13, 14, 15], solve: [20, 21, 22] },
    summary: '方程与解、等式性质、解法五步、含参方程、实际问题建模。',
    methods: ['m-eq-5steps', 'm-eq-model', 'm-eq-param'],
    weight: 0.24,
  },
  {
    /* 第六章：可开关模块。若期末不含几何图形初步，删除本对象即可。 */
    id: 'ch-geo', no: 6, name: '几何图形初步', block: '图形与几何',
    prereq: ['ch-rational'], tier: ['l2', 'l3'],
    examRefs: { choice: [3, 4, 8], fill: [9, 10, 13, 15], solve: [18, 19, 21, 22, 23, 24] },
    summary: '立体与平面图形、直线射线线段、角的度量与计算、余角补角、展开图。',
    methods: ['m-seg-count', 'm-angle-calc', 'm-unfold'],
    weight: 0.12,
  },
];

/* ==========================================================
   期末卷面结构 · 两套口径（区卷 / 校卷）

   ① 西城区期末卷（默认）—— 多份同卷文档摘要逐字一致：
        6 页 · 两部分 · 四道大题 · 26 道小题
        必做满分 100（选择 8×2=16 / 填空 8×2=16 / 解答 ~10 题 68）
        第四大题选做 10 分，计入总分，但卷面总分不超过 100
        考试时间 100 分钟
      重要含义：卷面封顶 100 → 必做丢分无法用选做完全补回
      （丢 5 分必做，选做全对也只到 100）→ 基础题零失误比押压轴更值钱

   ② 北师大实验中学自命题（备用）—— 有加试传统：
        2019 初一上期中为 100+20 分 / 27 小题 + 3 道附加题 / 100 分钟
        题量大于区卷，压轴向 A 层/P 层学生水平对齐
      注：这是期中证据，期末是否仍为 100+20 待校内确认

   注意：校内《初一上期中复习指导说明》给的是「10 选择 + 10 填空 + 10 解答」
   的期中校卷结构，与期末区卷结构不同，两者并存不矛盾。
   ========================================================== */
export const EXAM_STRUCTURE = {
  total: 100,
  minutes: 100,
  questions: 26,
  /* 选做题：计入总分，但卷面封顶 100 */
  bonus: {
    name: '选做题', score: 10,
    note: '计入总分，但卷面总分不超过 100',
  },
  parts: [
    { name: '选择题', key: 'choice', from: 1, to: 8, each: 2, count: 8, sum: 16 },
    { name: '填空题', key: 'fill', from: 9, to: 16, each: 2, count: 8, sum: 16 },
    { name: '解答题', key: 'solve', from: 17, to: 26, count: 10, sum: 68, note: '每题 5–8 分不等' },
  ],
};

/* 校卷（北师大实验自命题）备用口径：100 必做 + 20 附加 */
export const EXAM_STRUCTURE_SCHOOL = {
  total: 100,
  minutes: 100,
  questions: 27,
  bonus: { name: '附加题', score: 20, note: '校内加试，3 道题' },
  parts: [
    { name: '选择题', key: 'choice', from: 1, to: 8, each: 2, count: 8, sum: 16 },
    { name: '填空题', key: 'fill', from: 9, to: 16, each: 2, count: 8, sum: 16 },
    { name: '解答题', key: 'solve', from: 17, to: 27, count: 11, sum: 68, note: '含附加题前的基础解答' },
  ],
};

/* 期中校卷口径（校内《复习指导说明》原文）：10 选择 + 10 填空 + 10 解答 */
export const EXAM_STRUCTURE_MIDTERM = {
  total: 100,
  minutes: 100,
  questions: 30,
  parts: [
    { name: '选择题', key: 'choice', from: 1, to: 10, each: 2, count: 10, sum: 20 },
    { name: '填空题', key: 'fill', from: 11, to: 20, each: 2, count: 10, sum: 20 },
    { name: '解答题', key: 'solve', from: 21, to: 30, count: 10, sum: 60, note: '每题 5–7 分不等' },
  ],
};

/* ==========================================================
   三层：按认知要求分层，不按卷面分值分层
   达标线是产品的核心主张。

   ★ 目标分三档，不是一个数（这是满分目标下的关键修正）：
     - base   底线：达到就算「没拖后腿」，此时诊断页不该报红
     - target 目标：这个层该做到的水平
     - full   满分要求：满分目标下真正需要的水平

   为什么必须分开：之前 l3 只写 target 0.50，是「92 分目标」的设定。
   在满分目标下，l3 做到 50% 诊断页会报「已达标」——而实际离满分
   还差 13 分里的一半。诊断页给出的结论会误导人，这比不报更糟。

   l1/l2 的目标值在满分下必须接近 100：
     零失误区的题「错一道就破满分」，98% 意味着 50 题错 1 题，
     在 83 分的零失误区里就是丢 1.7 分——已经用掉选做容错的 1/6。
   ========================================================== */
export const TIERS = {
  l1: {
    name: '熟练层', score: 55,
    base: 0.95, target: 0.98, full: 1.00,
    note: '计算与规范 · 会做的必须做对',
    fullNote: '满分要求 100%——零失误区错一道就破满分',
  },
  l2: {
    name: '理解层', score: 32,
    base: 0.85, target: 0.90, full: 1.00,
    note: '概念与建模 · 知道为什么，能列式',
    fullNote: '满分要求 100%——选填错一题直接丢 2 分',
  },
  l3: {
    name: '攻坚层', score: 13,
    base: 0.40, target: 0.50, full: 0.95,
    note: '压轴与探究 · 拿到能拿的分',
    fullNote: '满分要求 95%——固定槽位只有 4 个，丢一个就丢 6–7 分',
  },
};

/* ==========================================================
   每日闭环四段
   顺序不可调：计算需要清醒注意力，放在闪测之后、主题之前
   ========================================================== */
export const DAILY = {
  total: 45,
  blocks: [
    { key: 'flash', name: '闪测', minutes: 5, count: 8, desc: '概念条件判断，只考条件不考背诵' },
    { key: 'calc', name: '计算', minutes: 15, count: 10, desc: '限时计算，记录「会做但错」' },
    { key: 'topic', name: '主题', minutes: 15, count: 6, desc: '当日主题：方法卡 / 应用题 / 压轴' },
    { key: 'wrong', name: '错题', minutes: 10, count: 8, desc: '今日与到期错题重做' },
  ],
  /* 压缩档：时间不够时怎么砍 */
  variants: {
    30: { name: '30 分钟', keep: ['flash', 'calc', 'topic'], note: '错题移到周末集中处理' },
    45: { name: '45 分钟', keep: ['flash', 'calc', 'topic', 'wrong'], note: '标准版' },
    60: { name: '60 分钟', keep: ['flash', 'calc', 'topic', 'wrong'], extra: 15, note: '主题段加压轴攻坚 15 分钟' },
  },
};

/* ==========================================================
   三阶段（与期末倒计时联动，双轨并行）
   ========================================================== */
export const PHASES = [
  {
    key: 'base', name: '筑基', weeks: [1, 2],
    trackA: '第五章《一元一次方程》新课巩固',
    trackB: '第一~二章（有理数与运算）滚动复习',
    goal: 'L1 计算正确率从基线提到 90%',
  },
  {
    key: 'build', name: '攻坚', weeks: [3, 5],
    trackA: '第六章《几何图形初步》新课速成（若在范围）',
    trackB: '第三~四章（代数式、整式）复习 + 应用题建模',
    goal: 'L1 ≥ 96%，L2 ≥ 85%',
  },
  {
    key: 'sprint', name: '冲刺', weeks: [6, 7],
    trackA: '整卷模考 ×4',
    trackB: '错题清零 + 压轴专项',
    goal: 'L1 ≥ 98%，总分达目标',
  },
];
