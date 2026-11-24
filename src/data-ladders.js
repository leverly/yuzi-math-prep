/* ==========================================================
   变式阶梯 · 以真题考点族为锚点
   ==========================================================

   【要解决的问题】
   「同一个知识点会不会」不是一个二值问题。学生可能在「原题」上对，
   换个数字就错，或者能正着算不能反着求。只判「这道题对不对」无法
   区分「真会」和「记住了解法」。

   【设计】
   每个阶梯锚定一个真题考点族（FAMILY_DEFS），内含 3 道变式，难度递进：

     L1 改数字   —— 同结构、换数值。验证「解法是否稳定」
     L2 改条件   —— 换情境 / 加约束。验证「是否理解适用条件」
     L3 逆向问   —— 给结果求条件。验证「是否掌握结构」

   只有 3/3 全对才算该考点达标（用户确认的口径）。
   错任何一级 → 整条阶梯重置，从 L1 重来（用户确认的口径）。
   卡在哪一级会被记录（stuckLevel），用于诊断「他卡在改条件还是逆向」。

   【与真题的关系】
   anchor 字段指向 FAMILY_DEFS 的 id，站内据此显示
   「这个考点在真题里每年考 X 分、出现在第 N 题、难度如何」。
   阶梯题本身是真题的变式，不是真题照搬（不宣称押题）。

   【为什么优先做这 8 个族】
   按真题三年累计分值排序，前 8 个族占必做卷的绝大部分：
     f-mixcalc 55 / f-solve 34 / f-dynamic 26 / f-eqapp 22
     f-abs-line 18 / f-simplify 18 / f-construct 18 / f-anglereason 13
   ========================================================== */

export const LADDERS = [
  /* ==================== 1. 有理数四则混合运算（真题 55 分，最大单题） ==================== */
  {
    id: 'lad-mixcalc', anchor: 'f-mixcalc', name: '有理数四则混合运算',
    chapter: 'ch-op', tier: 'l1', method: 'm-op-order',
    why: '真题第 17 题固定 18 分、4 小问，是全卷最大单题。这一块丢分最可惜——全是会做的题。',
    levels: [
      { key: 'number', name: '改数字', note: '同结构换数值，验证解法稳定', qid: 'lad-mix-1' },
      { key: 'condition', name: '改条件', note: '加乘方与括号，验证运算顺序', qid: 'lad-mix-2' },
      { key: 'reverse', name: '逆向问', note: '给结果反推，验证结构理解', qid: 'lad-mix-3' },
    ],
  },

  /* ==================== 2. 解方程（含去分母）（真题 34 分） ==================== */
  {
    id: 'lad-solve', anchor: 'f-solve', name: '解一元一次方程（含去分母）',
    chapter: 'ch-eq', tier: 'l1', method: 'm-eq-5steps',
    why: '真题第 20 题固定 11–12 分。去分母漏乘是最典型的「会做但错」。',
    levels: [
      { key: 'number', name: '改数字', note: '整数系数，验证移项与合并', qid: 'lad-eq-1' },
      { key: 'condition', name: '改条件', note: '含分母，验证去分母不漏乘', qid: 'lad-eq-2' },
      { key: 'reverse', name: '逆向问', note: '给解求参数，验证结构理解', qid: 'lad-eq-3' },
    ],
  },

  /* ==================== 3. 整式化简求值（真题 18 分） ==================== */
  {
    id: 'lad-simplify', anchor: 'f-simplify', name: '整式化简求值',
    chapter: 'ch-poly', tier: 'l1', method: 'm-simplify-eval',
    why: '真题解答题必考。化简错则后面全错，是连锁失分的源头。',
    levels: [
      { key: 'number', name: '改数字', note: '简单去括号合并', qid: 'lad-simp-1' },
      { key: 'condition', name: '改条件', note: '负系数分配，验证变号', qid: 'lad-simp-2' },
      { key: 'reverse', name: '逆向问', note: '与字母取值无关，验证系数为 0', qid: 'lad-simp-3' },
    ],
  },

  /* ==================== 4. 绝对值与数轴（真题 18 分） ==================== */
  {
    id: 'lad-abs', anchor: 'f-abs-line', name: '绝对值化简与数轴',
    chapter: 'ch-rational', tier: 'l2', method: 'm-abs-value',
    why: '每年 3 道概念题。分类讨论漏情况是最高频的失分点。',
    levels: [
      { key: 'number', name: '改数字', note: '已知正负，直接去绝对值', qid: 'lad-abs-1' },
      { key: 'condition', name: '改条件', note: '由数轴判符号，验证分类', qid: 'lad-abs-2' },
      { key: 'reverse', name: '逆向问', note: '给绝对值结果反推范围', qid: 'lad-abs-3' },
    ],
  },

  /* ==================== 5. 方程应用题（真题 22 分） ==================== */
  {
    id: 'lad-eqapp', anchor: 'f-eqapp', name: '一元一次方程应用题',
    chapter: 'ch-eq', tier: 'l2', method: 'm-eq-model',
    why: '真题第 21/22 题，情境每年换但考法不变：设元 → 找等量关系 → 列式 → 检验。',
    levels: [
      { key: 'number', name: '改数字', note: '销售问题，直接套利润关系', qid: 'lad-app-1' },
      { key: 'condition', name: '改条件', note: '行程问题，需处理两段速度', qid: 'lad-app-2' },
      { key: 'reverse', name: '逆向问', note: '给结果反推原价，验证逆运算', qid: 'lad-app-3' },
    ],
  },

  /* ==================== 6. 数轴动点与分类（真题 26 分，压轴位） ==================== */
  {
    id: 'lad-dynamic', anchor: 'f-dynamic', name: '数轴动点与分类讨论',
    chapter: 'ch-rational', tier: 'l3', method: 'm-numberline-move',
    why: '压轴位，必含多情形讨论。真题 2024-25 出现两道，是最能拉开差距的地方。',
    levels: [
      { key: 'number', name: '改数字', note: '单向运动，求相遇时刻', qid: 'lad-dyn-1' },
      { key: 'condition', name: '改条件', note: '求距离为定值，需分类', qid: 'lad-dyn-2' },
      { key: 'reverse', name: '逆向问', note: '给距离反推时刻，两种情形', qid: 'lad-dyn-3' },
    ],
  },

  /* ==================== 7. 线段计算与中点（真题 6 分，3/4 年） ====================
     锚定族从 f-construct 改为 f-midpoint。
     这条阶梯三级题全是「求线段长度」（AB=14 求 BC、中点求 MN），
     而 f-construct 考的是「用直尺圆规作图 + 写说理」——两件事不同。
     原锚定会导致「练的是线段计算，判的是作图能力」，练错对象。 */
  {
    id: 'lad-segcalc', anchor: 'f-midpoint', name: '线段计算与中点',
    chapter: 'ch-geo', tier: 'l2', method: 'm-seg-count',
    why: '真题 3 年考、年均 1.5 分，但它是几何解答题的第一步。这一步错，后面的角度推理全崩。',
    levels: [
      { key: 'number', name: '改数字', note: '线段和差，直接算', qid: 'lad-con-1' },
      { key: 'condition', name: '改条件', note: '含中点与分类，需讨论', qid: 'lad-con-2' },
      { key: 'reverse', name: '逆向问', note: '给中点反推原长', qid: 'lad-con-3' },
    ],
  },

  /* ==================== 8. 角的和差与余补（真题 3 分） ====================
     锚定族从 f-anglereason 改为 f-angle-sum。
     这条阶梯三级题是「算角度」（余补角、角平分线求角），
     而 f-anglereason 考的是「按步填空写 ∵∴ 依据」——考表达不考计算。 */
  {
    id: 'lad-anglesum', anchor: 'f-angle-sum', name: '角的和差与余补',
    chapter: 'ch-geo', tier: 'l2', method: 'm-angle-calc',
    why: '真题 2 年考、年均 1 分，是角度推理的计算底座。余补角与角平分线的换算必须自动化。',
    levels: [
      { key: 'number', name: '改数字', note: '余角补角直接算', qid: 'lad-ang-1' },
      { key: 'condition', name: '改条件', note: '角平分线，需用定义', qid: 'lad-ang-2' },
      { key: 'reverse', name: '逆向问', note: '给关系反推角度，需分类', qid: 'lad-ang-3' },
    ],
  },

  { id: 'lad-newdef', anchor: 'f-newdef', name: '新定义（读定义 → 判断 → 迁移）',
    chapter: 'ch-rational', tier: 'l3', method: 'm-newdef',
    why: '新定义是选做 26 题的常客。三级递进：先按定义算一个值，再判断性质，最后做迁移证明。',
    levels: [
      { key: 'number', qid: 'lad-nd-1', name: '按定义算值' },
      { key: 'condition', qid: 'lad-nd-2', name: '判断性质是否成立' },
      { key: 'reverse', qid: 'lad-nd-3', name: '迁移证明' },
    ] },

  /* ==================== 尺规作图与说理（真题 24 分，4/4 年，年均 6 分） ====================
     这条阶梯复用方法卡 m-construct-ruler 已有的三级变式（v-ruler-1/2/3）。
     它们本来就有 changed 字段标好 number/condition/reverse、同方法、步数达标，
     只是没有被「阶梯」这一层引用——所以能力诊断看不到它们。
     加这层引用的意义：让「作图能力」进入族级达标判定，
     而不是只停留在方法卡的变式链里。 */
  {
    id: 'lad-draw', anchor: 'f-construct', name: '尺规作图与说理',
    chapter: 'ch-geo', tier: 'l2', method: 'm-construct-ruler',
    why: '真题每年固定 6 分：作图痕迹 + 说理填空。这是全卷最「会做但写不全」的题——作图对了但说理漏写就丢分。',
    levels: [
      { key: 'number', name: '改数字', note: '线段延长求和，验证基本作图', qid: 'v-ruler-1' },
      { key: 'condition', name: '改条件', note: '含中点与延长，需分清位置关系', qid: 'v-ruler-2' },
      { key: 'reverse', name: '逆向问', note: '给总长反推原线段', qid: 'v-ruler-3' },
    ],
  },

  /* ==================== 角度推理填空（真题 19 分，3/4 年，年均 4.8 分） ====================
     同理，复用方法卡 m-geo-reason 的三级变式（v-reason-1/2/3）。
     这条阶梯测的是「按步写依据」的表达能力，不是算角度——
     和 lad-anglesum（算角度）是两件事，不能合并。 */
  {
    id: 'lad-reason', anchor: 'f-anglereason', name: '角度推理与说理',
    chapter: 'ch-geo', tier: 'l2', method: 'm-geo-reason',
    why: '真题解答题按步填空，每空对应一个依据（互余、互补、角平分线）。不写依据就丢分，写错依据也丢分。',
    levels: [
      { key: 'number', name: '改数字', note: '互余直接算，验证定义用对', qid: 'v-reason-1' },
      { key: 'condition', name: '改条件', note: '角平分线，需写出依据', qid: 'v-reason-2' },
      { key: 'reverse', name: '逆向问', note: '给倍数关系反推两角', qid: 'v-reason-3' },
    ],
  },

  /* ==========================================================
     以下 5 条（2026-11-24 补）：原先这些族没有变式，
     能力维度诊断会退化成「只看对错」，无法区分执行/条件/结构。
     这 5 族都是低频族（年均 0.5–3 分），但「低频」不等于「不用会」——
     它们占的都是必做段的分，丢了补不回来。
     ========================================================== */

  /* ============ 9. 科学记数法与近似数（真题 12 分，4/4 年） ============ */
  {
    id: 'lad-scinot', anchor: 'f-scinot', name: '科学记数法与近似数',
    chapter: 'ch-op', tier: 'l1',
    why: '真题每年 2–4 分，全是选择填空的送分题。送分题丢分最不该——它只考一个动作：小数点移几位。',
    levels: [
      { key: 'number', name: '改数字', note: '常规大数/小数互转，验证位数判断', qid: 'lad-sc-1' },
      { key: 'condition', name: '改条件', note: '带单位（亿/万），验证单位换算', qid: 'lad-sc-2' },
      { key: 'reverse', name: '逆向问', note: '给记数法结果反推原数，验证结构', qid: 'lad-sc-3' },
    ],
  },

  /* ============ 10. 角度换算（度分秒）（真题 4 分，2/4 年） ============ */
  {
    id: 'lad-dms', anchor: 'f-dms', name: '角度换算（度分秒）',
    chapter: 'ch-geo', tier: 'l2', method: 'm-angle-calc',
    why: '真题每年 2 分填空，专考 60 进位。它不难，但错一次就是整题 0 分——和角度推理题绑在一起丢。',
    levels: [
      { key: 'number', name: '改数字', note: '同单位加减，不跨 60', qid: 'lad-dms-1' },
      { key: 'condition', name: '改条件', note: '跨 60 进位/借位，验证进制理解', qid: 'lad-dms-2' },
      { key: 'reverse', name: '逆向问', note: '给结果反推缺的角', qid: 'lad-dms-3' },
    ],
  },

  /* ============ 11. 列代数式建模（真题 6 分，3/4 年） ============ */
  {
    id: 'lad-modelexpr', anchor: 'f-model-expr', name: '列代数式建模',
    chapter: 'ch-expr', tier: 'l2',
    why: '真题 3 年考，2 分填空。它考的不是算，是「把中文变化翻成式子」——这一步错了后面全错。',
    levels: [
      { key: 'number', name: '改数字', note: '单次折扣，直接列式', qid: 'lad-me-1' },
      { key: 'condition', name: '改条件', note: '两次连续变化，验证顺序与对象', qid: 'lad-me-2' },
      { key: 'reverse', name: '逆向问', note: '给售价式反推原价关系', qid: 'lad-me-3' },
    ],
  },

  /* ============ 12. 反比例关系判断（真题 2 分，1/4 年） ============ */
  {
    id: 'lad-inverse', anchor: 'f-inverse', name: '反比例关系判断',
    chapter: 'ch-expr', tier: 'l2', method: 'm-pattern',
    why: '真题考 1 次、2 分选择。判据只有一个：两量乘积是否为定值。但题干常把关系藏在情境里。',
    levels: [
      { key: 'number', name: '改数字', note: '给乘积定值，直接判断', qid: 'lad-inv-1' },
      { key: 'condition', name: '改条件', note: '藏在情境里，需先找乘积', qid: 'lad-inv-2' },
      { key: 'reverse', name: '逆向问', note: '给变化倍数反推关系类型', qid: 'lad-inv-3' },
    ],
  },

  /* ============ 13. 阅读理解型（真题 6 分，1/4 年） ============ */
  {
    id: 'lad-read', anchor: 'f-read', name: '阅读理解型（模仿迁移）',
    chapter: 'ch-expr', tier: 'l3', method: 'm-newdef',
    why: '真题考 1 次、6 分解答。这类题不考知识，考「照着给定规则执行」——规则读错一步就全错。',
    levels: [
      { key: 'number', name: '改数字', note: '按规则算一步，验证规则读对', qid: 'lad-rd-1' },
      { key: 'condition', name: '改条件', note: '连续两步应用，验证规则叠加', qid: 'lad-rd-2' },
      { key: 'reverse', name: '逆向问', note: '判断某数是否满足规则，需反推', qid: 'lad-rd-3' },
    ],
  },

];

/* ==========================================================
   阶梯题库
   每道题都必须：
     ① ≥2 步（否则判不出「卡在哪一步」）
     ② 每步有 score（采分点）
     ③ accept 与 why/solution 自洽
     ④ 同一阶梯内三步共用同一套步骤骨架（这才是「变式」而不是「新题」）
   ========================================================== */

export const LADDER_QUESTIONS = [
  /* ---------- 阶梯 1：有理数四则混合 ---------- */
  { id: 'lad-mix-1', chapter: 'ch-op', method: 'm-op-order', tier: 'l1', kind: 'solve', score: 4,
    ladder: 'lad-mixcalc', level: 'number',
    tierName: '阶梯 1/3 · 改数字', errorTags: ['sign', 'calc'],
    stem: '计算：$-6+(-2)-(-4)$。',
    steps: [
      { label: '统一成加法', ask: '先把它全部化成加法，得？', type: 'fill',
        accept: ['-6-2+4'], answer: '-6-2+4', score: 1,
        hint: '减负变加：$-(-4)=+4$。',
        why: '$-6+(-2)-(-4)=-6-2+4$。' },
      { label: '从左到右算', ask: '结果是？', type: 'fill',
        accept: ['-4'], answer: '-4', score: 1,
        hint: '$-6-2=-8$，再加 4。',
        why: '$-8+4=-4$。' },
    ],
    solution: '$-6+(-2)-(-4)=-6-2+4=-4$。' },

  { id: 'lad-mix-2', chapter: 'ch-op', method: 'm-op-order', tier: 'l1', kind: 'solve', score: 5,
    ladder: 'lad-mixcalc', level: 'condition',
    tierName: '阶梯 2/3 · 改条件', errorTags: ['sign', 'calc'],
    stem: '计算：$-2^{2}+(-3)^{2}\\times\\dfrac{2}{3}$。',
    steps: [
      { label: '先算乘方', ask: '$-2^{2}$ 与 $(-3)^{2}$ 分别是？', type: 'choice',
        options: ['$-4$ 和 $9$', '$4$ 和 $9$', '$-4$ 和 $-9$', '$4$ 和 $-9$'], key: 0, score: 1,
        hint: '负号在括号外只作用于结果；在括号内才是底数。',
        why: '$-2^{2}=-4$，$(-3)^{2}=9$。' },
      { label: '算乘法', ask: '$9\\times\\dfrac{2}{3}$ 等于？', type: 'fill',
        accept: ['6'], answer: '6', score: 1,
        hint: '$9\\div3\\times2$。',
        why: '$6$。' },
      { label: '相加', ask: '$-4+6$ 等于？', type: 'fill',
        accept: ['2'], answer: '2', score: 1,
        hint: '异号相加取绝对值大的符号。',
        why: '$2$。' },
    ],
    solution: '原式 $=-4+9\\times\\dfrac23=-4+6=2$。' },

  { id: 'lad-mix-3', chapter: 'ch-op', method: 'm-op-order', tier: 'l1', kind: 'solve', score: 6,
    ladder: 'lad-mixcalc', level: 'reverse',
    tierName: '阶梯 3/3 · 逆向问', errorTags: ['method', 'calc'],
    stem: '已知 $a=-2$，$b=3$，求 $a^{2}-2ab$ 的值。若把 $a$ 改为某个数后结果为 $16$，求此时 $a$ 的正值。',
    steps: [
      { label: '代入求值', ask: '$a=-2$，$b=3$ 时，$a^{2}-2ab$ 等于？', type: 'fill',
        accept: ['16'], answer: '16', score: 1,
        hint: '$4-2\\times(-2)\\times3$。',
        why: '$4+12=16$。' },
      { label: '建立方程', ask: '设 $a=x$（$b=3$），由 $x^{2}-6x=16$ 整理得？', type: 'fill',
        accept: ['x^{2}-6x-16=0'], answer: 'x^{2}-6x-16=0', score: 1,
        hint: '把 16 移到左边。',
        why: '$x^{2}-6x-16=0$。' },
      { label: '求正解', ask: '$a$ 的正值是？', type: 'fill',
        accept: ['8'], answer: '8', score: 1,
        hint: '$x^{2}-6x-16=(x-8)(x+2)$。',
        why: '$x=8$ 或 $x=-2$，取正值 $8$。' },
    ],
    solution: '当 $a=-2$，$b=3$ 时，$a^{2}-2ab=4+12=16$。\n设 $a=x$，则 $x^{2}-6x=16$，即 $x^{2}-6x-16=0$，$(x-8)(x+2)=0$，$x=8$ 或 $-2$。\n取正值，$a=8$。' },

  /* ---------- 阶梯 2：解方程 ---------- */
  { id: 'lad-eq-1', chapter: 'ch-eq', method: 'm-eq-5steps', tier: 'l1', kind: 'solve', score: 4,
    ladder: 'lad-solve', level: 'number',
    tierName: '阶梯 1/3 · 改数字', errorTags: ['sign'],
    stem: '解方程：$4x-7=2x+5$。',
    steps: [
      { label: '移项', ask: '移项后得？', type: 'fill',
        accept: ['4x-2x=5+7'], answer: '4x-2x=5+7', score: 1,
        hint: '移项要变号。',
        why: '$4x-2x=5+7$。' },
      { label: '合并', ask: '合并后得？', type: 'fill',
        accept: ['2x=12'], answer: '2x=12', score: 1,
        hint: '—',
        why: '$2x=12$。' },
      { label: '系数化 1', ask: '$x$ 等于？', type: 'fill',
        accept: ['6'], answer: '6', score: 1,
        hint: '两边除以 2。',
        why: '$x=6$。' },
    ],
    solution: '$4x-7=2x+5$，移项得 $4x-2x=5+7$，即 $2x=12$，故 $x=6$。' },

  { id: 'lad-eq-2', chapter: 'ch-eq', method: 'm-eq-5steps', tier: 'l1', kind: 'solve', score: 6,
    ladder: 'lad-solve', level: 'condition',
    tierName: '阶梯 2/3 · 改条件', errorTags: ['calc', 'express'],
    stem: '解方程：$\\dfrac{x-1}{3}-\\dfrac{x+2}{4}=1$。',
    steps: [
      { label: '去分母', ask: '两边同乘 12，得？', type: 'fill',
        accept: ['4(x-1)-3(x+2)=12'], answer: '4(x-1)-3(x+2)=12', score: 1,
        hint: '右边的 1 也要乘 12。',
        why: '$4(x-1)-3(x+2)=12$。' },
      { label: '去括号', ask: '去括号后得？', type: 'fill',
        accept: ['4x-4-3x-6=12'], answer: '4x-4-3x-6=12', score: 1,
        hint: '$-3\\times2=-6$。',
        why: '$4x-4-3x-6=12$。' },
      { label: '合并求解', ask: '$x$ 等于？', type: 'fill',
        accept: ['22'], answer: '22', score: 1,
        hint: '$x-10=12$。',
        why: '$x=22$。' },
    ],
    solution: '去分母：$4(x-1)-3(x+2)=12$\n去括号：$4x-4-3x-6=12$\n合并：$x-10=12$，故 $x=22$。' },

  { id: 'lad-eq-3', chapter: 'ch-eq', method: 'm-eq-5steps', tier: 'l1', kind: 'solve', score: 6,
    ladder: 'lad-solve', level: 'reverse',
    tierName: '阶梯 3/3 · 逆向问', errorTags: ['concept', 'method'],
    stem: '若关于 $x$ 的方程 $2x+a=5$ 的解是 $x=3$，求 $a$ 的值；再求当 $a$ 取此值时，方程 $ax-1=0$ 的解。',
    steps: [
      { label: '代回求参', ask: '把 $x=3$ 代入得？', type: 'fill',
        accept: ['6+a=5'], answer: '6+a=5', score: 1,
        hint: '$2\\times3=6$。',
        why: '$6+a=5$。' },
      { label: '解出 a', ask: '$a$ 等于？', type: 'fill',
        accept: ['-1'], answer: '-1', score: 1,
        hint: '移项。',
        why: '$a=-1$。' },
      { label: '解新方程', ask: '$a=-1$ 时，$-x-1=0$ 的解是？', type: 'fill',
        accept: ['-1'], answer: '-1', score: 1,
        hint: '$-x=1$。',
        why: '$x=-1$。' },
    ],
    solution: '把 $x=3$ 代入 $2x+a=5$：$6+a=5$，故 $a=-1$。\n当 $a=-1$ 时，方程变为 $-x-1=0$，解得 $x=-1$。' },

  /* ---------- 阶梯 3：整式化简求值 ---------- */
  { id: 'lad-simp-1', chapter: 'ch-poly', method: 'm-simplify-eval', tier: 'l1', kind: 'solve', score: 4,
    ladder: 'lad-simplify', level: 'number',
    tierName: '阶梯 1/3 · 改数字', errorTags: ['calc'],
    stem: '化简：$3x+2x-5$。',
    steps: [
      { label: '合并同类项', ask: '$3x+2x$ 等于？', type: 'fill',
        accept: ['5x'], answer: '5x', score: 1,
        hint: '系数相加，字母不变。',
        why: '$5x$。' },
      { label: '写结果', ask: '化简结果是？', type: 'fill',
        accept: ['5x-5'], answer: '5x-5', score: 1,
        hint: '—',
        why: '$5x-5$。' },
    ],
    solution: '$3x+2x-5=5x-5$。' },

  { id: 'lad-simp-2', chapter: 'ch-poly', method: 'm-simplify-eval', tier: 'l1', kind: 'solve', score: 5,
    ladder: 'lad-simplify', level: 'condition',
    tierName: '阶梯 2/3 · 改条件', errorTags: ['sign', 'calc'],
    stem: '先化简，再求值：$2(x^{2}-3x)-3(x^{2}-2x+1)$，其中 $x=-2$。',
    steps: [
      { label: '去括号', ask: '展开后得？', type: 'fill',
        accept: ['2x^{2}-6x-3x^{2}+6x-3'], answer: '2x^{2}-6x-3x^{2}+6x-3', score: 1,
        hint: '第二个括号前是负号，三项全变号。',
        why: '$2x^{2}-6x-3x^{2}+6x-3$。' },
      { label: '合并', ask: '化简结果是？', type: 'fill',
        accept: ['-x^{2}-3'], answer: '-x^{2}-3', score: 1,
        hint: '$-6x+6x=0$。',
        why: '$-x^{2}-3$。' },
      { label: '代入', ask: '当 $x=-2$ 时，值是？', type: 'fill',
        accept: ['-7'], answer: '-7', score: 1,
        hint: '$-4-3$。',
        why: '$-7$。' },
    ],
    solution: '原式 $=2x^{2}-6x-3x^{2}+6x-3=-x^{2}-3$。\n当 $x=-2$ 时：$-4-3=-7$。' },

  { id: 'lad-simp-3', chapter: 'ch-poly', method: 'm-simplify-eval', tier: 'l1', kind: 'solve', score: 6,
    ladder: 'lad-simplify', level: 'reverse',
    tierName: '阶梯 3/3 · 逆向问', errorTags: ['method', 'concept'],
    stem: '若多项式 $(2x^{2}+ax-3)-(bx^{2}-2x+1)$ 的值与 $x$ 的取值无关，求 $a$、$b$ 的值。',
    steps: [
      { label: '去括号合并', ask: '化简后得？', type: 'fill',
        accept: ['(2-b)x^{2}+(a+2)x-4'], answer: '(2-b)x^{2}+(a+2)x-4', score: 1,
        hint: '把 $x^{2}$ 项与 $x$ 项分别合并。',
        why: '$(2-b)x^{2}+(a+2)x-4$。' },
      { label: '用「与 x 无关」', ask: '与 $x$ 无关意味着各项系数满足？', type: 'choice',
        options: ['系数都为 0', '系数都为 1'], key: 0, score: 1,
        hint: '系数不为 0 时，$x$ 变化会导致结果变化。',
        why: '含 $x$ 的项系数必须为 0。' },
      { label: '求 b', ask: '$2-b=0$ 得 $b$ 等于？', type: 'fill',
        accept: ['2'], answer: '2', score: 1,
        hint: '—',
        why: '$b=2$。' },
      { label: '求 a', ask: '$a+2=0$ 得 $a$ 等于？', type: 'fill',
        accept: ['-2'], answer: '-2', score: 1,
        hint: '—',
        why: '$a=-2$。' },
    ],
    solution: '原式 $=(2-b)x^{2}+(a+2)x-4$。\n与 $x$ 取值无关，则含 $x$ 项系数均为 0：\n$2-b=0$ 得 $b=2$；$a+2=0$ 得 $a=-2$。' },

  /* ---------- 阶梯 4：绝对值与数轴 ---------- */
  { id: 'lad-abs-1', chapter: 'ch-rational', method: 'm-abs-value', tier: 'l2', kind: 'solve', score: 4,
    ladder: 'lad-abs', level: 'number',
    tierName: '阶梯 1/3 · 改数字', errorTags: ['concept', 'sign'],
    stem: '已知 $a<0$，化简 $|a|-a$。',
    steps: [
      { label: '去绝对值', ask: '$a<0$ 时 $|a|$ 等于？', type: 'fill',
        accept: ['-a'], answer: '-a', score: 1,
        hint: '负数的绝对值是它的相反数。',
        why: '$|a|=-a$。' },
      { label: '化简', ask: '结果是？', type: 'fill',
        accept: ['-2a'], answer: '-2a', score: 1,
        hint: '$-a-a$。',
        why: '$-2a$。' },
    ],
    solution: '因为 $a<0$，所以 $|a|=-a$，故 $|a|-a=-a-a=-2a$。' },

  { id: 'lad-abs-2', chapter: 'ch-rational', method: 'm-abs-value', tier: 'l2', kind: 'solve', score: 6,
    ladder: 'lad-abs', level: 'condition',
    tierName: '阶梯 2/3 · 改条件', errorTags: ['concept', 'sign'],
    stem: '有理数 $a$、$b$ 在数轴上的位置如图：$a$ 在原点左侧较远处，$b$ 在原点右侧较近处。化简 $|a+b|-|b-a|$。',
    fig: { viewBox: [0, 0, 280, 90], alt: '数轴上 a 与 b 的位置',
      elems: [
        { t: 'arrow', a: [20, 55], b: [265, 55] },
        { t: 'ticks', a: [40, 55], b: [240, 55], n: 9, size: 4 },
        { t: 'pt', at: [80, 55], label: '$a$', pos: 'b' },
        { t: 'pt', at: [185, 55], label: '$b$', pos: 'b' },
        { t: 'pt', at: [140, 55], label: '$0$', pos: 'b' },
      ] },
    steps: [
      { label: '判断 a+b 的符号', ask: '$|a|>|b|$ 且 $a<0<b$，则 $a+b$ 是？', type: 'choice',
        options: ['正数', '负数'], key: 1, score: 2,
        hint: '$a$ 离原点更远，负的部分更多。',
        why: '$a+b<0$。' },
      { label: '判断 b-a 的符号', ask: '$b>a$，则 $b-a$ 是？', type: 'choice',
        options: ['正数', '负数'], key: 0, score: 2,
        hint: '大数减小数为正。',
        why: '$b-a>0$。' },
      { label: '化简', ask: '$|a+b|-|b-a|$ 等于？', type: 'fill',
        accept: ['-a-b-b+a', '-2b'], answer: '-2b', score: 1,
        hint: '负数取相反数，正数直接去。',
        why: '$-(a+b)-(b-a)=-a-b-b+a=-2b$。' },
    ],
    solution: '由图 $a<0<b$ 且 $|a|>|b|$，故 $a+b<0$，$b-a>0$。\n$|a+b|-|b-a|=-(a+b)-(b-a)=-a-b-b+a=-2b$。' },

  { id: 'lad-abs-3', chapter: 'ch-rational', method: 'm-abs-value', tier: 'l2', kind: 'solve', score: 6,
    ladder: 'lad-abs', level: 'reverse',
    tierName: '阶梯 3/3 · 逆向问', errorTags: ['method', 'concept'],
    stem: '若 $|a-2|=3$，求 $a$ 的值；再求使 $|a-2|$ 取得最小值的 $a$。',
    steps: [
      { label: '拆分绝对值方程', ask: '$|a-2|=3$ 拆成哪两个方程？', type: 'fill',
        accept: ['a-2=3 或 a-2=-3'], answer: 'a-2=3 或 a-2=-3', score: 1,
        hint: '绝对值等于正数，有两种情况。',
        why: '$a-2=3$ 或 $a-2=-3$。' },
      { label: '解出 a', ask: '$a$ 的值是？', type: 'fill',
        accept: ['5或-1', '5,-1'], answer: '5或-1', score: 1,
        hint: '$a=5$ 或 $a=-1$。',
        why: '$a=5$ 或 $a=-1$。' },
      { label: '求最小值点', ask: '$|a-2|$ 最小时 $a$ 等于？', type: 'fill',
        accept: ['2'], answer: '2', score: 1,
        hint: '绝对值最小为 0。',
        why: '$a=2$ 时 $|a-2|=0$，最小。' },
    ],
    solution: '由 $|a-2|=3$ 得 $a-2=3$ 或 $a-2=-3$，故 $a=5$ 或 $a=-1$。\n绝对值最小为 0，此时 $a-2=0$，即 $a=2$。' },

  /* ---------- 阶梯 5：方程应用题 ---------- */
  { id: 'lad-app-1', chapter: 'ch-eq', method: 'm-eq-model', tier: 'l2', kind: 'solve', score: 5,
    ladder: 'lad-eqapp', level: 'number',
    tierName: '阶梯 1/3 · 改数字', errorTags: ['model'],
    stem: '某商品进价 120 元，按标价的 8 折出售，仍可获利 20%。求标价。',
    steps: [
      { label: '表示售价', ask: '设标价 $x$ 元，售价是？', type: 'fill',
        accept: ['0.8x'], answer: '0.8x', score: 1,
        hint: '8 折即乘 0.8。',
        why: '$0.8x$。' },
      { label: '列方程', ask: '获利 20% 时，售价等于进价的多少倍？', type: 'fill',
        accept: ['1.2'], answer: '1.2', score: 1,
        hint: '$1+20\\%$。',
        why: '$1.2$ 倍。' },
      { label: '求解', ask: '由 $0.8x=120\\times1.2$ 得标价是多少元？', type: 'fill',
        accept: ['180'], answer: '180', score: 1,
        hint: '$144\\div0.8$。',
        why: '$180$ 元。' },
    ],
    solution: '设标价 $x$ 元，售价为 $0.8x$。\n由 $0.8x=120\\times(1+20\\%)=144$ 得 $x=180$。\n答：标价 180 元。' },

  { id: 'lad-app-2', chapter: 'ch-eq', method: 'm-eq-model', tier: 'l2', kind: 'solve', score: 6,
    ladder: 'lad-eqapp', level: 'condition',
    tierName: '阶梯 2/3 · 改条件', errorTags: ['model'],
    stem: '甲、乙两地相距 300 千米。汽车从甲地出发，先以每小时 60 千米行驶 2 小时，之后提速到每小时 90 千米。求还需几小时到达乙地。',
    steps: [
      { label: '算已行路程', ask: '前 2 小时行了多少千米？', type: 'fill',
        accept: ['120'], answer: '120', score: 1,
        hint: '$60\\times2$。',
        why: '$120$ 千米。' },
      { label: '算剩余路程', ask: '还剩多少千米？', type: 'fill',
        accept: ['180'], answer: '180', score: 1,
        hint: '$300-120$。',
        why: '$180$ 千米。' },
      { label: '列方程求解', ask: '设还需 $x$ 小时，由 $90x=180$ 得 $x$ 等于？', type: 'fill',
        accept: ['2'], answer: '2', score: 1,
        hint: '$180\\div90$。',
        why: '$x=2$ 小时。' },
    ],
    solution: '前 2 小时行 $60\\times2=120$ 千米，剩 $300-120=180$ 千米。\n设还需 $x$ 小时，则 $90x=180$，$x=2$。\n答：还需 2 小时。' },

  { id: 'lad-app-3', chapter: 'ch-eq', method: 'm-eq-model', tier: 'l2', kind: 'solve', score: 6,
    ladder: 'lad-eqapp', level: 'reverse',
    tierName: '阶梯 3/3 · 逆向问', errorTags: ['model', 'express'],
    stem: '某商品打 9 折后售价 162 元，此时利润率恰为 20%。求进价；若要利润率达到 30%，售价应为多少元？',
    steps: [
      { label: '求进价', ask: '设进价 $x$ 元，由 $x\\times1.2=162$ 得 $x$ 等于？', type: 'fill',
        accept: ['135'], answer: '135', score: 1,
        hint: '$162\\div1.2$。',
        why: '$135$ 元。' },
      { label: '求新售价', ask: '利润率 30% 时，售价是？', type: 'fill',
        accept: ['175.5'], answer: '175.5', score: 1,
        hint: '$135\\times1.3$。',
        why: '$175.5$ 元。' },
    ],
    solution: '设进价 $x$ 元，由 $x(1+20\\%)=162$ 得 $x=135$。\n利润率 30% 时售价 $=135\\times1.3=175.5$ 元。' },

  /* ---------- 阶梯 6：数轴动点与分类 ---------- */
  { id: 'lad-dyn-1', chapter: 'ch-rational', method: 'm-numberline-move', tier: 'l3', kind: 'solve', score: 6,
    ladder: 'lad-dynamic', level: 'number',
    tierName: '阶梯 1/3 · 改数字', errorTags: ['method', 'calc'],
    stem: '数轴上点 $A$ 表示 $-4$，动点 $P$ 从 $A$ 出发以每秒 2 个单位向右运动。$t$ 秒后 $P$ 的坐标是什么？几秒后 $P$ 到达原点？',
    steps: [
      { label: '写坐标式', ask: '$t$ 秒后 $P$ 的坐标是？', type: 'fill',
        accept: ['-4+2t'], answer: '-4+2t', score: 1,
        hint: '起点加位移。',
        why: '$-4+2t$。' },
      { label: '列方程', ask: '到达原点时坐标满足？', type: 'fill',
        accept: ['-4+2t=0'], answer: '-4+2t=0', score: 1,
        hint: '原点坐标是 0。',
        why: '$-4+2t=0$。' },
      { label: '求解', ask: '$t$ 等于？', type: 'fill',
        accept: ['2'], answer: '2', score: 1,
        hint: '$2t=4$。',
        why: '$t=2$ 秒。' },
    ],
    solution: '$P$ 的坐标为 $-4+2t$。由 $-4+2t=0$ 得 $t=2$。\n答：2 秒后到达原点。' },

  { id: 'lad-dyn-2', chapter: 'ch-rational', method: 'm-numberline-move', tier: 'l3', kind: 'solve', score: 8,
    ladder: 'lad-dynamic', level: 'condition',
    tierName: '阶梯 2/3 · 改条件', errorTags: ['method', 'concept'],
    stem: '数轴上点 $A$ 表示 $-4$，点 $B$ 表示 $8$。动点 $P$ 从 $A$ 以每秒 2 个单位向右运动。$t$ 为何值时，$P$ 到 $B$ 的距离为 $4$？',
    steps: [
      { label: '写坐标式', ask: '$t$ 秒后 $P$ 的坐标是？', type: 'fill',
        accept: ['-4+2t'], answer: '-4+2t', score: 1,
        hint: '起点加位移。',
        why: '$-4+2t$。' },
      { label: '写距离条件', ask: '到 $B$ 距离为 4，可列式为？', type: 'fill',
        accept: ['|-4+2t-8|=4'], answer: '|-4+2t-8|=4', score: 2,
        hint: '距离用绝对值表示。',
        why: '$|2t-12|=4$。' },
      { label: '解第一种', ask: '$2t-12=4$ 时 $t$ 等于？', type: 'fill',
        accept: ['8'], answer: '8', score: 2,
        hint: '$2t=16$。',
        why: '$t=8$。' },
      { label: '解第二种', ask: '$2t-12=-4$ 时 $t$ 等于？', type: 'fill',
        accept: ['4'], answer: '4', score: 2,
        hint: '$2t=8$。',
        why: '$t=4$。' },
    ],
    solution: '$P$ 坐标为 $-4+2t$，到 $B(8)$ 的距离为 $|(-4+2t)-8|=|2t-12|$。\n由 $|2t-12|=4$ 得 $2t-12=4$ 或 $2t-12=-4$，解得 $t=8$ 或 $t=4$。\n答：$t=4$ 秒或 $t=8$ 秒。\n关键：距离是绝对值，必须分两种情况，只解一个是最常见的漏解。' },

  { id: 'lad-dyn-3', chapter: 'ch-rational', method: 'm-numberline-move', tier: 'l3', kind: 'solve', score: 8,
    ladder: 'lad-dynamic', level: 'reverse',
    tierName: '阶梯 3/3 · 逆向问', errorTags: ['method', 'model'],
    stem: '数轴上点 $A$ 表示 $-6$，动点 $P$ 从 $A$ 向右以每秒 3 个单位运动。已知运动 $t$ 秒后 $P$ 在点 $6$ 处，求 $t$；再求此时 $P$ 到点 $A$ 的距离。',
    steps: [
      { label: '写坐标式', ask: '$t$ 秒后 $P$ 的坐标是？', type: 'fill',
        accept: ['-6+3t'], answer: '-6+3t', score: 1,
        hint: '起点加位移。',
        why: '$-6+3t$。' },
      { label: '列方程求 t', ask: '由 $-6+3t=6$ 得 $t$ 等于？', type: 'fill',
        accept: ['4'], answer: '4', score: 1,
        hint: '$3t=12$。',
        why: '$t=4$。' },
      { label: '求距离', ask: '$P$ 到 $A$ 的距离是？', type: 'fill',
        accept: ['12'], answer: '12', score: 1,
        hint: '$|6-(-6)|$，或 $3\\times4$。',
        why: '$12$。' },
    ],
    solution: '$P$ 坐标为 $-6+3t$。由 $-6+3t=6$ 得 $3t=12$，$t=4$。\n此时 $P$ 在 6 处，到 $A(-6)$ 的距离为 $|6-(-6)|=12$（也等于 $3\\times4$）。' },

  /* ---------- 阶梯 7：线段与作图说理 ---------- */
  { id: 'lad-con-1', chapter: 'ch-geo', method: 'm-seg-count', tier: 'l2', kind: 'solve', score: 4,
    ladder: 'lad-segcalc', level: 'number',
    tierName: '阶梯 1/3 · 改数字', errorTags: ['concept', 'calc'],
    stem: '线段 $AB=14$，点 $C$ 在 $AB$ 上且 $AC=5$。求 $BC$。',
    fig: { viewBox: [0, 0, 260, 70], alt: '线段 AB 上一点 C',
      elems: [
        { t: 'seg', a: [30, 40], b: [230, 40] },
        { t: 'pt', at: [30, 40], label: 'A', pos: 'l' },
        { t: 'pt', at: [100, 40], label: 'C', pos: 't' },
        { t: 'pt', at: [230, 40], label: 'B', pos: 'r' },
      ] },
    steps: [
      { label: '用线段和差', ask: '$C$ 在 $AB$ 上，$BC$ 等于？', type: 'fill',
        accept: ['AB-AC'], answer: 'AB-AC', score: 1,
        hint: '整条减去一段。',
        why: '$BC=AB-AC$。' },
      { label: '代入', ask: '$BC$ 等于？', type: 'fill',
        accept: ['9'], answer: '9', score: 1,
        hint: '$14-5$。',
        why: '$9$。' },
    ],
    solution: '因为 $C$ 在 $AB$ 上，所以 $BC=AB-AC=14-5=9$。' },

  { id: 'lad-con-2', chapter: 'ch-geo', method: 'm-seg-count', tier: 'l2', kind: 'solve', score: 6,
    ladder: 'lad-segcalc', level: 'condition',
    tierName: '阶梯 2/3 · 改条件', errorTags: ['method', 'concept'],
    stem: '线段 $AB=16$，$M$ 是 $AB$ 的中点，点 $N$ 在直线 $AB$ 上且 $AN=6$。求 $MN$ 的长。',
    fig: { viewBox: [0, 0, 300, 80], alt: '线段 AB 与中点 M，N 可能在延长线上',
      elems: [
        { t: 'seg', a: [40, 45], b: [250, 45] },
        { t: 'pt', at: [40, 45], label: 'A', pos: 'l' },
        { t: 'pt', at: [145, 45], label: 'M', pos: 't' },
        { t: 'pt', at: [250, 45], label: 'B', pos: 'r' },
      ] },
    steps: [
      { label: '求 AM', ask: '$M$ 是中点，$AM$ 等于？', type: 'fill',
        accept: ['8'], answer: '8', score: 1,
        hint: '$16\\div2$。',
        why: '$AM=8$。' },
      { label: '判断位置关系', ask: '题目说 $N$ 在「直线 $AB$」上，$N$ 有几种可能位置？', type: 'choice',
        options: ['只有 1 种', '有 2 种'], key: 1, score: 2,
        hint: '「直线」不是「线段」，$N$ 可以在延长线上。',
        why: '$N$ 可在 $A$ 右侧或左侧，共 2 种。' },
      { label: '情形一', ask: '$N$ 在 $A$ 右侧、$AN=6$ 时，$MN$ 等于？', type: 'fill',
        accept: ['2'], answer: '2', score: 1,
        hint: '$|8-6|$。',
        why: '$MN=8-6=2$。' },
      { label: '情形二', ask: '$N$ 在 $A$ 左侧、$AN=6$ 时，$MN$ 等于？', type: 'fill',
        accept: ['14'], answer: '14', score: 1,
        hint: '$8+6$。',
        why: '$MN=8+6=14$。' },
    ],
    solution: '$AM=\\dfrac12AB=8$。\n$N$ 在直线 $AB$ 上，有两种情形：\n① $N$ 在 $A$ 右侧：$MN=AM-AN=8-6=2$；\n② $N$ 在 $A$ 左侧：$MN=AM+AN=8+6=14$。\n答：$MN=2$ 或 $14$。\n关键：「直线」不是「线段」，漏掉延长线上的情形是最高频失分。' },

  { id: 'lad-con-3', chapter: 'ch-geo', method: 'm-seg-count', tier: 'l2', kind: 'solve', score: 6,
    ladder: 'lad-segcalc', level: 'reverse',
    tierName: '阶梯 3/3 · 逆向问', errorTags: ['method', 'express'],
    stem: '$M$ 是线段 $AB$ 的中点，$N$ 是 $MB$ 的中点。已知 $MN=3$，求 $AB$ 的长。',
    fig: { viewBox: [0, 0, 280, 70], alt: '线段 AB 上两个中点',
      elems: [
        { t: 'seg', a: [30, 40], b: [250, 40] },
        { t: 'pt', at: [30, 40], label: 'A', pos: 'l' },
        { t: 'pt', at: [140, 40], label: 'M', pos: 't' },
        { t: 'pt', at: [195, 40], label: 'N', pos: 'b' },
        { t: 'pt', at: [250, 40], label: 'B', pos: 'r' },
      ] },
    steps: [
      { label: '由 MN 求 MB', ask: '$N$ 是 $MB$ 中点，$MB$ 等于？', type: 'fill',
        accept: ['6'], answer: '6', score: 1,
        hint: '$2\\times3$。',
        why: '$MB=6$。' },
      { label: '由 MB 求 AB', ask: '$M$ 是 $AB$ 中点，$AB$ 等于？', type: 'fill',
        accept: ['12'], answer: '12', score: 1,
        hint: '$2\\times6$。',
        why: '$AB=12$。' },
    ],
    solution: '$MB=2MN=6$，$AB=2MB=12$。\n答：$AB=12$。' },

  /* ---------- 阶梯 8：角的和差与推理 ---------- */
  { id: 'lad-ang-1', chapter: 'ch-geo', method: 'm-angle-calc', tier: 'l2', kind: 'solve', score: 4,
    ladder: 'lad-anglesum', level: 'number',
    tierName: '阶梯 1/3 · 改数字', errorTags: ['concept'],
    stem: '一个角是 $52°$，求它的余角与补角。',
    steps: [
      { label: '求余角', ask: '余角是？', type: 'fill',
        accept: ['38°', '38'], answer: '38°', score: 1,
        hint: '$90°-52°$。',
        why: '$38°$。' },
      { label: '求补角', ask: '补角是？', type: 'fill',
        accept: ['128°', '128'], answer: '128°', score: 1,
        hint: '$180°-52°$。',
        why: '$128°$。' },
    ],
    solution: '余角 $=90°-52°=38°$，补角 $=180°-52°=128°$。' },

  { id: 'lad-ang-2', chapter: 'ch-geo', method: 'm-angle-calc', tier: 'l2', kind: 'solve', score: 6,
    ladder: 'lad-anglesum', level: 'condition',
    tierName: '阶梯 2/3 · 改条件', errorTags: ['concept', 'express'],
    stem: '$OC$ 是 $\\angle AOB$ 的平分线，$OD$ 是 $\\angle AOC$ 的平分线，$\\angle AOB=96°$。求 $\\angle BOD$。',
    fig: { viewBox: [0, 0, 260, 180], alt: '角 AOB 的两条平分线',
      elems: [
        { t: 'seg', a: [70, 140], b: [215, 140] },
        { t: 'seg', a: [70, 140], b: [195, 45] },
        { t: 'seg', a: [70, 140], b: [210, 80], dash: true },
        { t: 'seg', a: [70, 140], b: [140, 95], dash: true },
        { t: 'angle', at: [70, 140], from: 'right', to: 'ur', r: 28 },
        { t: 'pt', at: [70, 140], label: 'O', pos: 'bl' },
        { t: 'pt', at: [215, 140], label: 'B', pos: 'r' },
        { t: 'pt', at: [195, 45], label: 'A', pos: 'tr' },
        { t: 'pt', at: [210, 80], label: 'C', pos: 'r' },
        { t: 'pt', at: [140, 95], label: 'D', pos: 'l' },
      ] },
    steps: [
      { label: '求 AOC', ask: '$OC$ 平分 $\\angle AOB$，$\\angle AOC$ 等于？', type: 'fill',
        accept: ['48°', '48'], answer: '48°', score: 1,
        hint: '$96°\\div2$。',
        why: '$48°$。' },
      { label: '求 AOD', ask: '$OD$ 平分 $\\angle AOC$，$\\angle AOD$ 等于？', type: 'fill',
        accept: ['24°', '24'], answer: '24°', score: 1,
        hint: '$48°\\div2$。',
        why: '$24°$。' },
      { label: '求 BOD', ask: '$\\angle BOD=\\angle AOB-\\angle AOD$，等于？', type: 'fill',
        accept: ['72°', '72'], answer: '72°', score: 1,
        hint: '$96°-24°$。',
        why: '$72°$。' },
    ],
    solution: '$\\angle AOC=\\dfrac12\\angle AOB=48°$，$\\angle AOD=\\dfrac12\\angle AOC=24°$。\n故 $\\angle BOD=\\angle AOB-\\angle AOD=96°-24°=72°$。' },

  { id: 'lad-ang-3', chapter: 'ch-geo', method: 'm-angle-calc', tier: 'l2', kind: 'solve', score: 7,
    ladder: 'lad-anglesum', level: 'reverse',
    tierName: '阶梯 3/3 · 逆向问', errorTags: ['method', 'concept'],
    stem: '已知 $\\angle AOB=80°$，$\\angle BOC=30°$，求 $\\angle AOC$；若 $\\angle AOC$ 的补角是 $60°$，判断 $OC$ 的位置。',
    steps: [
      { label: '分类一', ask: '$OC$ 在 $\\angle AOB$ 内部时，$\\angle AOC$ 等于？', type: 'fill',
        accept: ['50°', '50'], answer: '50°', score: 2,
        hint: '$80°-30°$。',
        why: '$50°$。' },
      { label: '分类二', ask: '$OC$ 在 $\\angle AOB$ 外部时，$\\angle AOC$ 等于？', type: 'fill',
        accept: ['110°', '110'], answer: '110°', score: 2,
        hint: '$80°+30°$。',
        why: '$110°$。' },
      { label: '由补角反推', ask: '补角为 $60°$，则 $\\angle AOC$ 等于？', type: 'fill',
        accept: ['120°', '120'], answer: '120°', score: 1,
        hint: '$180°-60°$。',
        why: '$120°$。' },
      { label: '判断结论', ask: '$120°$ 与上面两个值都不符，说明？', type: 'choice',
        options: ['题设矛盾，无解', '$OC$ 在另一侧更远处'], key: 0, score: 1,
        hint: '$120°$ 既不是 $50°$ 也不是 $110°$。',
        why: '与已知条件矛盾，说明该情形不成立。' },
    ],
    solution: '由 $\\angle AOB=80°$、$\\angle BOC=30°$，$OC$ 有两种位置：\n① 在内部：$\\angle AOC=80°-30°=50°$；\n② 在外部：$\\angle AOC=80°+30°=110°$。\n若 $\\angle AOC$ 的补角为 $60°$，则 $\\angle AOC=120°$，与 $50°$、$110°$ 都不符，故该情形与题设矛盾。\n关键：几何题没说位置关系必须分类；分类后还要检验是否与题设相容。' },

  /* ---------- 新定义阶梯（lad-newdef） ---------- */
  { id: 'lad-nd-1', chapter: 'ch-rational', method: 'm-newdef', tier: 'l3', kind: 'solve', score: 3,
    ladder: 'lad-newdef', level: 'number',
    tierName: '阶梯 1/3 · 按定义算值', errorTags: ['method'],
    stem: '定义：数轴上点 $A$、$B$ 表示数 $a$、$b$，若 $a+b=2m$，称 $A$、$B$ 互为关于点 $M$（表示 $m$）的「平衡点」。\n已知 $A$ 表示 $-1$，$M$ 表示 $3$，求 $B$ 表示的数。',
    steps: [
      { label: '读定义', ask: '「平衡点」的定义等式是？', type: 'choice',
        options: ['$a+b=2m$', '$a-b=2m$'], key: 0, score: 1,
        hint: '逐字读，不要凭印象。',
        why: '$a+b=2m$。' },
      { label: '代入', ask: '代入 $a=-1$、$m=3$ 得？', type: 'fill',
        accept: ['-1+b=6'], answer: '-1+b=6', score: 1,
        hint: '$2\times3=6$。',
        why: '$-1+b=6$。' },
      { label: '求解', ask: '$b$ 等于？', type: 'fill',
        accept: ['7'], answer: '7', score: 1,
        hint: '$b=6+1$。',
        why: '$7$。' },
    ],
    solution: '由定义 $a+b=2m$，代入 $a=-1$、$m=3$：$-1+b=6$，故 $b=7$。\n【阶梯 1/3】这一级只考「读定义 + 代入」，是拿分的基本盘。' },

  { id: 'lad-nd-2', chapter: 'ch-rational', method: 'm-newdef', tier: 'l3', kind: 'solve', score: 5,
    ladder: 'lad-newdef', level: 'condition',
    tierName: '阶梯 2/3 · 判断性质', errorTags: ['method', 'concept'],
    stem: '沿用「平衡点」定义（$a+b=2m$ 时称 $A$、$B$ 互为关于 $M$ 的平衡点）。\n判断：「若 $A$、$B$ 互为关于 $M$ 的平衡点，则 $M$ 是线段 $AB$ 的中点」是否正确？说明理由。',
    steps: [
      { label: '翻译定义', ask: '$a+b=2m$ 变形得 $m$ 等于？', type: 'fill',
        accept: ['(a+b)/2'], answer: '(a+b)/2', score: 2,
        hint: '两边除以 2。',
        why: '$m=\dfrac{a+b}{2}$。' },
      { label: '识别几何意义', ask: '$\dfrac{a+b}{2}$ 在数轴上表示什么？', type: 'choice',
        options: ['$AB$ 的中点坐标', '$AB$ 的长度'], key: 0, score: 2,
        hint: '中点公式就是两端坐标的平均。',
        why: '$AB$ 的中点坐标。' },
      { label: '下结论', ask: '所以该说法？', type: 'choice',
        options: ['正确', '错误'], key: 0, score: 1,
        hint: '—',
        why: '正确：$M$ 的坐标是 $AB$ 的中点坐标。' },
    ],
    solution: '由 $a+b=2m$ 得 $m=\dfrac{a+b}{2}$，这正是线段 $AB$ 中点的坐标公式。\n所以「$M$ 是 $AB$ 的中点」正确。\n【阶梯 2/3】这一级考「把新定义翻译成熟悉的概念」——这是新定义题的关键一步。' },

  { id: 'lad-nd-3', chapter: 'ch-rational', method: 'm-newdef', tier: 'l3', kind: 'solve', score: 7,
    ladder: 'lad-newdef', level: 'reverse',
    tierName: '阶梯 3/3 · 迁移证明', errorTags: ['method', 'express'],
    stem: '沿用「平衡点」定义（$a+b=2m$）。\n已知 $A$、$B$ 表示 $a$、$b$，$M$ 表示 $m$ 且 $A$、$B$ 互为关于 $M$ 的平衡点。\n若把 $A$ 沿数轴正方向移动 2 个单位得到 $A_1$，$A_1$、$B$ 互为关于 $M_1$ 的平衡点。用含 $a$、$b$ 的式子表示 $M_1$ 的坐标，并说明 $M_1$ 比 $M$ 大多少。',
    steps: [
      { label: '写出 A1', ask: '$A$ 右移 2 个单位后，$A_1$ 表示？', type: 'fill',
        accept: ['a+2'], answer: 'a+2', score: 1,
        hint: '向右加。',
        why: '$a+2$。' },
      { label: '用定义求 M1', ask: '由平衡点定义，$M_1$ 的坐标是？', type: 'fill',
        accept: ['(a+2+b)/2'], answer: '(a+2+b)/2', score: 2,
        hint: '$\dfrac{(a+2)+b}{2}$。',
        why: '$\dfrac{a+b+2}{2}$。' },
      { label: '求差值', ask: '$M_1-M$ 等于？', type: 'fill',
        accept: ['1'], answer: '1', score: 2,
        hint: '$\dfrac{a+b+2}{2}-\dfrac{a+b}{2}$。',
        why: '$\dfrac{2}{2}=1$。' },
      { label: '下结论', ask: '结论是？', type: 'choice',
        options: ['$M_1$ 比 $M$ 大 1', '$M_1$ 比 $M$ 大 2'], key: 0, score: 1,
        hint: '端点移 2，中点只移一半。',
        why: '$M_1$ 比 $M$ 大 1。' },
    ],
    solution: '$A_1$ 表示 $a+2$。由定义 $M_1$ 的坐标为 $\dfrac{(a+2)+b}{2}=\dfrac{a+b+2}{2}$。\n$M_1-M=\dfrac{a+b+2}{2}-\dfrac{a+b}{2}=1$。\n故 $M_1$ 比 $M$ 大 1。\n【阶梯 3/3】这一级考「迁移 + 推理」：端点移动 2，中点只移动 1（一半）。\n这个结论本身也有意义——中点随端点同步移动，但幅度减半。' },

  /* ==========================================================
     阶梯 9：科学记数法（f-scinot）
     能力递进：位数判断 → 单位换算 → 反推原数
     ========================================================== */
  { id: 'lad-sc-1', chapter: 'ch-op', tier: 'l1', kind: 'solve', score: 2,
    tierName: '阶梯 1/3 · 改数字', errorTags: ['concept', 'calc'],
    ladder: 'lad-scinot', level: 'number',
    stem: '用科学记数法表示 $3200000$。',
    steps: [
      { label: '定 $a$', ask: '写成 $a\\times10^{n}$ 时，$a$ 应满足 $1\\le|a|<10$。这里 $a$ 等于？', type: 'fill',
        accept: ['3.2'], answer: '3.2', score: 1,
        hint: '小数点移到第一个非零数字之后。',
        why: '$3200000=3.2\\times10^{6}$，故 $a=3.2$。' },
      { label: '定 $n$', ask: '$n$ 等于？', type: 'fill',
        accept: ['6'], answer: '6', score: 1,
        hint: '数位数减 1：$3200000$ 是 7 位数。',
        why: '$7-1=6$，故 $3.2\\times10^{6}$。' },
    ],
    solution: '$3200000=3.2\\times10^{6}$。\n【要点】$a$ 的小数点移到第一个非零数字后面；$n=$ 整数位数 $-1$。' },

  { id: 'lad-sc-2', chapter: 'ch-op', tier: 'l1', kind: 'solve', score: 2,
    tierName: '阶梯 2/3 · 改条件', errorTags: ['concept', 'calc'],
    ladder: 'lad-scinot', level: 'condition',
    stem: '将 $24.32$ 亿用科学记数法表示。',
    steps: [
      { label: '换单位', ask: '$24.32$ 亿写成不带单位的数，等于 $24.32\\times$ 多少？', type: 'fill',
        accept: ['100000000', '10^8', '10^{8}'], answer: '100000000', score: 1,
        hint: '1 亿 $=10^{8}$。',
        why: '1 亿 $=100000000=10^{8}$。' },
      { label: '合起来', ask: '结果为？', type: 'fill',
        accept: ['2.432×10^9', '2.432\\times10^{9}', '2.432*10^9'], answer: '2.432×10^9', score: 1,
        hint: '$24.32\\times10^{8}=2.432\\times10^{9}$。',
        why: '$24.32\\times10^{8}=2.432\\times10^{9}$。' },
    ],
    solution: '$24.32$ 亿 $=24.32\\times10^{8}=2.432\\times10^{9}$。\n【易错】直接把「亿」当 $10^{4}$（那是「万」）。$1$ 亿 $=10^{8}$。' },

  { id: 'lad-sc-3', chapter: 'ch-op', tier: 'l1', kind: 'solve', score: 2,
    tierName: '阶梯 3/3 · 逆向问', errorTags: ['concept'],
    ladder: 'lad-scinot', level: 'reverse',
    stem: '一个数用科学记数法表示为 $5.06\\times10^{4}$，这个数原来是多少？',
    steps: [
      { label: '看指数', ask: '指数 $4$ 表示小数点向右移动几位？', type: 'fill',
        accept: ['4'], answer: '4', score: 1,
        hint: '正指数 → 向右移。',
        why: '正指数表示原数是较大的数，小数点右移 $4$ 位。' },
      { label: '还原', ask: '原数等于？', type: 'fill',
        accept: ['50600'], answer: '50600', score: 1,
        hint: '$5.06$ 右移 4 位。',
        why: '$5.06\\times10^{4}=50600$。' },
    ],
    solution: '$5.06\\times10^{4}=50600$。\n【要点】反推时正指数右移、负指数左移，移的位数就是指数绝对值。' },

  /* ==========================================================
     阶梯 10：角度换算（f-dms）
     能力递进：同单位加减 → 跨 60 进位 → 反推缺角
     ========================================================== */
  { id: 'lad-dms-1', chapter: 'ch-geo', method: 'm-angle-calc', tier: 'l2', kind: 'solve', score: 2,
    tierName: '阶梯 1/3 · 改数字', errorTags: ['calc'],
    ladder: 'lad-dms', level: 'number',
    stem: '计算：$45°30\'+30°20\'$。',
    steps: [
      { label: '分别相加', ask: '度与度、分与分分别相加，得？', type: 'fill',
        accept: ['75°50\''], answer: "75°50'", score: 1,
        hint: '$45+30$，$30+20$。',
        why: '$45°+30°=75°$，$30\'+20\'=50\'$。' },
      { label: '检查分', ask: '$50\'$ 是否超过 $60\'$？', type: 'choice',
        options: ['没有超过，直接写结果', '超过了，需要进位'], key: 0, score: 1,
        hint: '分满 60 才进 1 度。',
        why: '$50<60$，不需要进位。' },
    ],
    solution: "$45°30'+30°20'=75°50'$。\n【要点】度分秒是 60 进制，但只有「分满 60」才进位。" },

  { id: 'lad-dms-2', chapter: 'ch-geo', method: 'm-angle-calc', tier: 'l2', kind: 'solve', score: 3,
    tierName: '阶梯 2/3 · 改条件', errorTags: ['calc', 'sign'],
    ladder: 'lad-dms', level: 'condition',
    stem: '计算：$45°50\'+30°40\'$。',
    steps: [
      { label: '分别相加', ask: '分与分相加得多少分？', type: 'fill',
        accept: ['90'], answer: '90', score: 1,
        hint: '$50+40$。',
        why: '$50\'+40\'=90\'$。' },
      { label: '进位', ask: '$90\'$ 化成度分是？', type: 'fill',
        accept: ['1°30\''], answer: "1°30'", score: 1,
        hint: '$90=60+30$。',
        why: '$90\'=1°30\'$。' },
      { label: '合并', ask: '最后结果是？', type: 'fill',
        accept: ['76°30\''], answer: "76°30'", score: 1,
        hint: '$45+30+1=76$。',
        why: "$45°50'+30°40'=76°30'$。" },
    ],
    solution: "$45°50'+30°40'$：分相加 $90'=1°30'$；度相加 $45+30=75$，再加进位 $1$，得 $76°30'$。\n【易错】忘记进位，写成 $75°90'$——$90'$ 必须化成 $1°30'$。" },

  { id: 'lad-dms-3', chapter: 'ch-geo', method: 'm-angle-calc', tier: 'l2', kind: 'solve', score: 3,
    tierName: '阶梯 3/3 · 逆向问', errorTags: ['calc'],
    ladder: 'lad-dms', level: 'reverse',
    stem: '已知 $\\angle AOB=90°$，$\\angle AOC=37°28\'$，且 $OC$ 在 $\\angle AOB$ 内部。求 $\\angle BOC$。',
    steps: [
      { label: '列关系', ask: '$\\angle BOC$ 与已知两角的关系是？', type: 'choice',
        options: ['$\\angle BOC=\\angle AOB-\\angle AOC$', '$\\angle BOC=\\angle AOB+\\angle AOC$'], key: 0, score: 1,
        hint: '$OC$ 在内部，$\\angle BOC$ 是剩下那块。',
        why: '$OC$ 在 $\\angle AOB$ 内部，故 $\\angle BOC=\\angle AOB-\\angle AOC$。' },
      { label: '借位相减', ask: "$90°$ 借 $1°$ 化成多少分？", type: 'fill',
        accept: ['60'], answer: '60', score: 1,
        hint: "$1°=60'$。",
        why: "$90°=89°60'$。" },
      { label: '求结果', ask: '$\\angle BOC$ 等于？', type: 'fill',
        accept: ["52°32'"], answer: "52°32'", score: 1,
        hint: "$89°60'-37°28'$。",
        why: "$89°60'-37°28'=52°32'$。" },
    ],
    solution: "$\\angle BOC=\\angle AOB-\\angle AOC=90°-37°28'=89°60'-37°28'=52°32'$。\n【要点】度不够减时向度借 $1$，换成 $60'$。" },

  /* ==========================================================
     阶梯 11：列代数式建模（f-model-expr）
     能力递进：单次变化 → 两次连续变化 → 反推原价关系
     ========================================================== */
  { id: 'lad-me-1', chapter: 'ch-expr', tier: 'l2', kind: 'solve', score: 2,
    tierName: '阶梯 1/3 · 改数字', errorTags: ['model'],
    ladder: 'lad-modelexpr', level: 'number',
    stem: '某商品原价 $a$ 元，打八折出售，售价是多少元？',
    steps: [
      { label: '理解折扣', ask: '打八折表示按原价的百分之几出售？', type: 'fill',
        accept: ['80', '80%'], answer: '80', score: 1,
        hint: '八折 = 十分之八。',
        why: '打八折即按原价的 $80\\%$。' },
      { label: '列式', ask: '售价为？', type: 'fill',
        accept: ['0.8a', '0.8 a', '80%a'], answer: '0.8a', score: 1,
        hint: '$a\\times80\\%$。',
        why: '售价 $=a\\times0.8=0.8a$。' },
    ],
    solution: '打八折即乘 $0.8$，售价 $=0.8a$ 元。\n【要点】「打几折」就是乘零点几。' },

  { id: 'lad-me-2', chapter: 'ch-expr', tier: 'l2', kind: 'solve', score: 3,
    tierName: '阶梯 2/3 · 改条件', errorTags: ['model'],
    ladder: 'lad-modelexpr', level: 'condition',
    stem: '某商品原价 $x$ 元，先提价 $20\\%$，再打八折出售。最终售价是多少元？',
    steps: [
      { label: '第一步', ask: '提价 $20\\%$ 后的价格是？', type: 'fill',
        accept: ['1.2x', '1.2 x'], answer: '1.2x', score: 1,
        hint: '$x\\times(1+20\\%)$。',
        why: '提价后 $=x(1+20\\%)=1.2x$。' },
      { label: '第二步', ask: '再打八折，是在哪个价格基础上乘 $0.8$？', type: 'choice',
        options: ['在提价后的 $1.2x$ 上', '在原价 $x$ 上'], key: 0, score: 1,
        hint: '连续变化时，后一步作用在前一步的结果上。',
        why: '折扣作用在提价后的价格上。' },
      { label: '合并', ask: '最终售价为？', type: 'fill',
        accept: ['0.96x', '0.96 x'], answer: '0.96x', score: 1,
        hint: '$1.2x\\times0.8$。',
        why: '$1.2x\\times0.8=0.96x$。' },
    ],
    solution: '提价后 $x(1+20\\%)=1.2x$；再打八折 $1.2x\\times0.8=0.96x$。\n【要点】连续变化必须按顺序乘，每一步作用在前一步的结果上——不是都作用在原价上。\n这个结果还有意义：$0.96x<x$，先提价 $20\\%$ 再打八折，最终比原价还低。' },

  { id: 'lad-me-3', chapter: 'ch-expr', tier: 'l2', kind: 'solve', score: 3,
    tierName: '阶梯 3/3 · 逆向问', errorTags: ['model'],
    ladder: 'lad-modelexpr', level: 'reverse',
    stem: '某商品先提价 $20\\%$ 再打八折，最终售价为 $480$ 元。原价是多少元？',
    steps: [
      { label: '用前面的结论', ask: '最终售价与原价的关系式是？', type: 'fill',
        accept: ['0.96x', '0.96 x'], answer: '0.96x', score: 1,
        hint: '上一级算过：$1.2\\times0.8=0.96$。',
        why: '最终售价 $=0.96x$。' },
      { label: '列方程', ask: '由 $0.96x=480$，$x$ 等于？', type: 'fill',
        accept: ['500'], answer: '500', score: 1,
        hint: '$480\\div0.96$。',
        why: '$x=480\\div0.96=500$。' },
      { label: '检验', ask: '$500$ 提价 $20\\%$ 再打八折，是否得 $480$？', type: 'choice',
        options: ['是，$500\\times1.2\\times0.8=480$', '否，数值不对'], key: 0, score: 1,
        hint: '$500\\times1.2=600$，$600\\times0.8=480$。',
        why: '$500\\times1.2\\times0.8=480$ ✓。' },
    ],
    solution: '最终售价 $=0.96x=480$，故 $x=500$。\n【要点】逆向问题先用正向关系式，再解方程。检验能抓住大部分计算错误。' },

  /* ==========================================================
     阶梯 12：反比例关系（f-inverse）
     能力递进：直接判断 → 情境中找乘积 → 由变化倍数反推
     ========================================================== */
  { id: 'lad-inv-1', chapter: 'ch-expr', method: 'm-pattern', tier: 'l2', kind: 'solve', score: 2,
    tierName: '阶梯 1/3 · 改数字', errorTags: ['concept'],
    ladder: 'lad-inverse', level: 'number',
    stem: '已知 $xy=12$，$y$ 与 $x$ 成什么关系？',
    steps: [
      { label: '看形式', ask: '两个量的乘积是定值还是比值是定值？', type: 'choice',
        options: ['乘积是定值 $12$', '比值是定值'], key: 0, score: 1,
        hint: '$xy=12$ 是乘积形式。',
        why: '乘积为定值 $12$。' },
      { label: '下结论', ask: '所以 $y$ 与 $x$ 成？', type: 'choice',
        options: ['反比例关系', '正比例关系'], key: 0, score: 1,
        hint: '乘积定值 → 反比例。',
        why: '乘积为定值，故成反比例关系。' },
    ],
    solution: '$xy=12$，乘积为定值，故 $y$ 与 $x$ 成反比例关系。\n【判据】乘积定值 → 反比例；比值定值 → 正比例。' },

  { id: 'lad-inv-2', chapter: 'ch-expr', method: 'm-pattern', tier: 'l2', kind: 'solve', score: 3,
    tierName: '阶梯 2/3 · 改条件', errorTags: ['concept', 'model'],
    ladder: 'lad-inverse', level: 'condition',
    stem: '路程一定时，速度与时间成什么关系？',
    steps: [
      { label: '写关系式', ask: '路程 $s$、速度 $v$、时间 $t$ 的关系是？', type: 'fill',
        accept: ['s=vt', 's = vt', 'vt=s'], answer: 's=vt', score: 1,
        hint: '路程 = 速度 × 时间。',
        why: '$s=vt$。' },
      { label: '看谁定', ask: '路程一定时，$v$ 与 $t$ 的乘积等于？', type: 'fill',
        accept: ['s', '定值'], answer: 's', score: 1,
        hint: '$vt=s$，$s$ 不变。',
        why: '乘积 $vt=s$ 为定值。' },
      { label: '下结论', ask: '所以速度与时间成？', type: 'choice',
        options: ['反比例关系', '正比例关系'], key: 0, score: 1,
        hint: '乘积定值。',
        why: '乘积为定值，成反比例关系。' },
    ],
    solution: '由 $s=vt$，路程一定时 $vt=s$ 为定值，故速度与时间成反比例关系。\n【要点】情境题先写关系式，再看「谁是定值」——不能凭「一个变大另一个变小」就判反比例（那也可能是一次函数）。' },

  { id: 'lad-inv-3', chapter: 'ch-expr', method: 'm-pattern', tier: 'l2', kind: 'solve', score: 3,
    tierName: '阶梯 3/3 · 逆向问', errorTags: ['concept'],
    ladder: 'lad-inverse', level: 'reverse',
    stem: '已知 $y$ 与 $x$ 成反比例，且当 $x=3$ 时 $y=8$。当 $x=6$ 时 $y$ 等于多少？',
    steps: [
      { label: '用反比例定式', ask: '设 $y=\\dfrac{k}{x}$，$k$ 等于？', type: 'fill',
        accept: ['24'], answer: '24', score: 1,
        hint: '$k=xy=3\\times8$。',
        why: '$k=xy=24$。' },
      { label: '求新值', ask: '$x=6$ 时 $y$ 等于？', type: 'fill',
        accept: ['4'], answer: '4', score: 1,
        hint: '$y=24\\div6$。',
        why: '$y=\\dfrac{24}{6}=4$。' },
      { label: '验变化', ask: '$x$ 从 $3$ 变到 $6$（乘 2），$y$ 应怎么变？', type: 'choice',
        options: ['除以 2，从 $8$ 变成 $4$', '也乘 2，变成 $16$'], key: 0, score: 1,
        hint: '反比例：一个乘几，另一个就除以几。',
        why: '$x$ 乘 $2$，$y$ 除以 $2$：$8\\div2=4$ ✓。' },
    ],
    solution: '设 $y=\\dfrac{k}{x}$，由 $x=3,y=8$ 得 $k=24$。当 $x=6$ 时 $y=4$。\n【验算】$x$ 乘 $2$，$y$ 除以 $2$：$8\\div2=4$ ✓。\n【要点】反比例的「反」就体现在这里：一个量乘几，另一个量就除以几。' },

  /* ==========================================================
     阶梯 13：阅读理解型（f-read）
     能力递进：按规则算一步 → 连续两步 → 反推验证
     ========================================================== */
  { id: 'lad-rd-1', chapter: 'ch-expr', method: 'm-newdef', tier: 'l3', kind: 'solve', score: 2,
    tierName: '阶梯 1/3 · 改数字', errorTags: ['method', 'calc'],
    ladder: 'lad-read', level: 'number',
    stem: '【阅读材料】判断一个数是否为 $9$ 的倍数，可把这个数各位数字相加。若和是 $9$ 的倍数，则原数是 $9$ 的倍数。\n用这个方法判断 $738$ 是否为 $9$ 的倍数。',
    steps: [
      { label: '按规则执行', ask: '各位数字之和等于？', type: 'fill',
        accept: ['18'], answer: '18', score: 1,
        hint: '$7+3+8$。',
        why: '$7+3+8=18$。' },
      { label: '判是否倍数', ask: '$18$ 是 $9$ 的倍数吗？结论？', type: 'choice',
        options: ['是，所以 $738$ 是 $9$ 的倍数', '不是，所以 $738$ 不是 $9$ 的倍数'], key: 0, score: 1,
        hint: '$18=9\\times2$。',
        why: '$18$ 是 $9$ 的倍数，故 $738$ 是 $9$ 的倍数。' },
    ],
    solution: '各位和 $7+3+8=18$，$18$ 是 $9$ 的倍数，故 $738$ 是 $9$ 的倍数。\n【要点】阅读题第一步永远是「照规则做一遍」，不要自己另想办法。' },

  { id: 'lad-rd-2', chapter: 'ch-expr', method: 'm-newdef', tier: 'l3', kind: 'solve', score: 3,
    tierName: '阶梯 2/3 · 改条件', errorTags: ['method', 'calc'],
    ladder: 'lad-read', level: 'condition',
    stem: '【阅读材料】判断一个数是否为 $19$ 的倍数：每次划掉末位数字，把末位数字的 $2$ 倍加到剩下的数上；重复直到能看出是否为 $19$ 的倍数。\n用这个方法判断 $437$ 是否为 $19$ 的倍数（做两步即可）。',
    steps: [
      { label: '第一步', ask: '划掉末位 $7$，$43$ 加上 $7$ 的 $2$ 倍，得？', type: 'fill',
        accept: ['57'], answer: '57', score: 1,
        hint: '$43+2\\times7$。',
        why: '$43+14=57$。' },
      { label: '第二步', ask: '对 $57$ 再做一次：划掉 $7$，$5$ 加 $14$，得？', type: 'fill',
        accept: ['19'], answer: '19', score: 1,
        hint: '$5+2\\times7$。',
        why: '$5+14=19$。' },
      { label: '下结论', ask: '$19$ 是 $19$ 的倍数吗？结论？', type: 'choice',
        options: ['是，所以 $437$ 是 $19$ 的倍数', '不是'], key: 0, score: 1,
        hint: '$19=19\\times1$。',
        why: '$19$ 是 $19$ 的倍数，故 $437$ 是。' },
    ],
    solution: '$437\\to43+2\\times7=57$；$57\\to5+2\\times7=19$；$19$ 是 $19$ 的倍数，故 $437$ 是。\n【易错】第二步把「划掉后的数」写成 $57$ 而不是 $5$——每步都要真正划掉末位。' },

  { id: 'lad-rd-3', chapter: 'ch-expr', method: 'm-newdef', tier: 'l3', kind: 'solve', score: 3,
    tierName: '阶梯 3/3 · 逆向问', errorTags: ['method', 'concept'],
    ladder: 'lad-read', level: 'reverse',
    stem: '【阅读材料】同上，判断 $19$ 的倍数的方法。\n已知某两位数 $\\overline{a5}$（十位是 $a$，个位是 $5$）是 $19$ 的倍数，求 $a$。',
    steps: [
      { label: '按规则做一步', ask: '划掉末位 $5$，$a$ 加上 $5$ 的 $2$ 倍，得？', type: 'fill',
        accept: ['a+10'], answer: 'a+10', score: 1,
        hint: '$a+2\\times5$。',
        why: '$a+10$。' },
      { label: '用条件', ask: '$\\overline{a5}$ 是 $19$ 的倍数，则 $a+10$ 应是 $19$ 的几倍？$a$ 是 $0\\sim9$ 的数字。', type: 'fill',
        accept: ['19'], answer: '19', score: 1,
        hint: '$a+10$ 最大是 $19$。',
        why: '$a\\le9$，故 $a+10\\le19$；要成为 $19$ 的倍数只能是 $19$ 本身。' },
      { label: '求解', ask: '$a$ 等于？', type: 'fill',
        accept: ['9'], answer: '9', score: 1,
        hint: '$a+10=19$。',
        why: '$a=9$，即该数为 $95=19\\times5$ ✓。' },
    ],
    solution: '划掉末位 $5$：$a+2\\times5=a+10$。因 $0\\le a\\le9$，故 $10\\le a+10\\le19$，要成为 $19$ 的倍数只能等于 $19$，得 $a=9$。\n验证：$95=19\\times5$ ✓。\n【要点】逆向题的入口是「用范围缩小可能」——不是硬解方程。' },

];
