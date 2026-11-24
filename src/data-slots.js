/* ==========================================================
   槽位专项 · 满分版训练结构
   ----------------------------------------------------------
   为什么要有这一层：
     章节训练回答「这个知识点会不会」，槽位训练回答「考场上这个位置
     能不能稳定拿分」。考场是按题号触发的，不是按章节触发的。

   三年真题（2021-22 / 2022-23 / 2024-25）的槽位稳定性：
     第 8 题  3/3 年 hard 2 分   三视图 / 图形规律 / 新定义运算
     第 16 题 3/3 年 hard 2 分   幻圆 / 数字填图
     第 23 题 3/3 年 6-7 分      数轴动点 / 动射线（含分类）
     第 24 题 3/3 年 top 6-7 分  新定义 / 动角旋转 / 阅读理解
     选做 25  3/3 年 4-5 分 hard 新定义运算 / 进位制 / 三角尺
     选做 26  3/3 年 5-6 分 top  新定义（数轴类）

   共 6 个槽位、必做 17 分 + 选做 10 分 = 27 分。
   其余 82 分是「零失误区」——不需要槽位训练，需要计算与规范训练。

   达标判据：连对 3 次（不是正确率 80%）。
   理由：考场只有一次机会，80% 正确率在 6 个槽位上期望丢 1.2 个槽位。
   ========================================================== */

export const SLOTS = [
  {
    id: 's8',
    no: '第 8 题',
    score: 2,
    scoreNote: '固定 2 分',
    years: 3,
    diff: 'hard',
    name: '选择压轴 · 空间与规律',
    /* 三年轮换考的三类，站内都要覆盖 */
    rotates: ['三视图与立体拼搭', '图形规律（用含 n 式子表示）', '新定义运算（多结论判断）'],
    why: '三年都在第 8 题、都是 hard、都是 2 分。位置和难度都固定，只有具体考点在轮换——所以三类都要练。',
    /* 关联的站内题目 id（按题型分组） */
    groups: [
      { key: 'space', name: '三视图与展开图', ids: ['cf-ch-12', 'q-bal-geo-16', 'q-geo-9', 'q-bal-geo-7'] },
      { key: 'pattern', name: '图形规律', ids: ['cf-ch-17', 'q-pat-1', 'v-pat-2', 'v-pat-3'] },
      { key: 'newdef', name: '新定义多结论', ids: ['cf-ch-14', 'q-newdef-2'] },
    ],
    drillHint: '三类轮换考。先各做 1 题确定哪类最不稳，再集中练那一类。',
    trap: '第 8 题只有 2 分，但它是「必做卷第一个 hard」。卡住超过 3 分钟就跳过——2 分不值得吃掉后面 18 分计算题的时间。',
  },
  {
    id: 's16',
    no: '第 16 题',
    score: 2,
    scoreNote: '固定 2 分',
    years: 3,
    diff: 'hard',
    name: '填空压轴 · 数字填图',
    rotates: ['幻圆（大圆/小圆/直径等和）', '数字填图（单元和相等）', '正方体顶点填数'],
    why: '三年 3/3 年、固定第 16 题、固定 2 分、固定 hard。这是全卷槽位最稳的一题，也是唯一「年年同样思路」的难题。',
    groups: [
      { key: 'magic', name: '幻圆与数字填图（2 分填空形态）', ids: ['cf-fi-20', 'q-magic-1'] },
      { key: 'magic-full', name: '幻圆与数字填图（完整解答形态）', ids: ['q-bal-magic-1', 'q-bal-magic-2', 'q-bal-magic-3'] },
    ],
    drillHint: '核心思路只有一个：所有「和相等」的单元加起来，等于全部数字之和的若干倍，据此列方程求「单元和」。',
    trap: '这题的正确率不取决于算术，取决于「敢不敢设未知数」。很多学生在这里硬凑数字，凑 5 分钟不如列一个方程。',
  },
  {
    id: 's23',
    no: '第 23 题',
    score: 6,
    scoreNote: '6–7 分',
    years: 3,
    diff: 'top',
    name: '解答压轴 · 数轴动点',
    rotates: ['数轴点距离 + 分类', '数轴双动点（分段变速）', '动射线角度（含参 n）'],
    why: '三年 3/3 年，6–7 分。2024-25 从「单动点」升级为「双动点 + 分段变速」，难度在上升。',
    groups: [
      { key: 'point', name: '数轴动点', ids: ['q-nlmove-1', 'v-nlmove-1', 'v-nlmove-2', 'v-nlmove-3'] },
      { key: 'ladder', name: '动点阶梯（改数字→改条件→逆向问）', ids: ['lad-dyn-1', 'lad-dyn-2', 'lad-dyn-3'] },
      { key: 'ray', name: '动射线', ids: ['q-draw-4'] },
    ],
    drillHint: '按阶梯顺序练：先「改数字」（把真题数字换掉），再「改条件」（加一个动点），最后「逆向问」（已知结果求时间）。跳步练会一直卡在第三问。',
    trap: '压轴的最大失分不是算错，是漏情形。写完答案必须自查一句：点在左侧和右侧，我都算了吗？',
  },
  {
    id: 's24',
    no: '第 24 题',
    score: 7,
    scoreNote: '6–7 分',
    years: 3,
    diff: 'top',
    name: '解答压轴 · 新定义与动角',
    rotates: ['新定义（k 倍分点 / 平衡点）', '动角（三角尺旋转 + 角平分线）', '阅读理解（模仿迁移）'],
    why: '三年 3/3 年、三年全是 top、6–7 分。这是必做卷最后一题，也是满分最难的一关。',
    groups: [
      { key: 'newdef', name: '新定义（含参 + 分类）', ids: ['q-newdef-1', 'q-newdef-3', 'q-slot-newdef-1'] },
      { key: 'angle', name: '动角与旋转', ids: ['q-slot-angle-1', 'q-draw-3'] },
      { key: 'reason', name: '几何说理（角平分线）', ids: ['q-geo-5'] },
    ],
    drillHint: '新定义题的固定三步：① 逐字读定义划条件 ② 用最简单的数字验证自己理解对不对 ③ 按定义迁移。第一步的「说理」就是给分点。',
    trap: '这一题允许丢。但要丢得「有结构」——第（1）问必须拿满，第（2）（3）问写到哪里算到哪里。第（1）问丢分说明定义没读懂，那才是真问题。',
  },
  {
    id: 's25',
    no: '选做 25',
    score: 4,
    scoreNote: '4–5 分',
    years: 3,
    diff: 'hard',
    bonus: true,
    name: '选做 · 新定义运算',
    rotates: ['新定义「乘减法」', '三进制转换（进位制）', '三角尺画角'],
    why: '三年 3/3 年、4–5 分。选做第一题，通常是「给一个新运算规则，照做」——比第 24 题简单，是选做 10 分里更该先拿的 4 分。',
    groups: [
      { key: 'op', name: '新定义运算', ids: ['q-newdef-2'] },
      { key: 'base', name: '进位制转换', ids: ['q-slot-base-1'] },
    ],
    drillHint: '这类题的关键是「严格照字面执行」，不要用自己熟悉的运算规则去套。先在草稿上把定义抄一遍再代数字。',
    trap: '选做计入总分但卷面封顶 100。所以选做 25 的价值是「给必做卷买容错」——必做丢 4 分，这题全对就补回来了。',
  },
  {
    id: 's26',
    no: '选做 26',
    score: 6,
    scoreNote: '5–6 分',
    years: 3,
    diff: 'top',
    bonus: true,
    name: '选做 · 新定义（数轴类）',
    rotates: ['新定义「k 星点」', '新定义「k 倍分点」', '新定义「平衡点」', '数轴 + 整除（含参）'],
    why: '三年 3/3 年、5–6 分、全是 top。这是选做的第二题，也是最值钱的容错来源——6 分能吸收必做卷一道解答题的全部失分。',
    groups: [
      { key: 'newdef', name: '新定义（数轴类）', ids: ['q-newdef-1', 'q-newdef-3', 'q-slot-newdef-2'] },
      { key: 'line', name: '数轴与整除', ids: ['q-nlmove-1'] },
    ],
    drillHint: '数轴类新定义的通用套路：把定义翻译成「距离」或「中点」的语言，再用绝对值或方程处理。',
    trap: '含参问（用 n 表示）是这一题的固定难点。写答案时必须写「取值范围」——只写式子不写范围会扣分。',
  },
];

/* 槽位汇总：给页面用的派生数字，不手写 */
export const SLOT_STATS = (() => {
  const mainSlots = SLOTS.filter((s) => !s.bonus);
  const bonusSlots = SLOTS.filter((s) => s.bonus);
  const sum = (arr) => arr.reduce((a, s) => a + s.score, 0);
  return {
    count: SLOTS.length,
    mainCount: mainSlots.length,
    bonusCount: bonusSlots.length,
    mainScore: sum(mainSlots),
    bonusScore: sum(bonusSlots),
    totalScore: sum(SLOTS),
    /* 必做零失误区 = 必做总分 - 槽位分 */
    cleanScore: 100 - sum(mainSlots),
  };
})();

/* ==========================================================
   必做 100 分模拟 · 组卷规格

   与整卷模考（exam.html）的区别：
     exam.html   26 题 / 100 分钟 / 含选做 → 考「整卷节奏」
     must100     28 个作答位 / 100 分钟 / 只考必做 → 考「零失误」

   为什么需要它：满分的核心指标是「必做丢几分」。整卷把选做混进来，
   会把「必做零失误」这个信号稀释掉——选做拿满 10 分，必做丢 12 分，
   卷面 98 分看起来不错，其实必做破了容错线。

   ★ 关键设计：分值由「卷面位置」决定，不由题库标注决定。
     理由：真题就是位置给分——第 17 题固定 18 分，不会因为某道题
     标了 7 分就变成 7 分。题库里的 score 是难度权重，不是卷面分值。
     若按题库分值组卷，24 道随机题的总分在 95–102 之间浮动，
     「必做 100 分模拟」就名不副实。

   ★ 为什么是 28 个作答位而不是 24 道题：
     真题必做 24 道题，但第 17 题是 4 小问（18 分）、第 20 题是
     2 小问（11 分）——这两题的给分是按小问算的。整题判对错会让
     「错一个小问丢 18 分」，丢分率完全失真。所以拆位：
       16 选填 + 4（17 题 4 小问）+ 2（18/19 题）+ 2（20 题 2 小问）
       + 1（21）+ 1（22）+ 1（23）+ 1（24） = 28 位
     分值合计 32 + 18 + 12 + 11 + 7 + 7 + 6 + 7 = 100
   ========================================================== */
export const MUST100 = {
  name: '必做 100 分模拟',
  total: 100,
  minutes: 100,
  questions: 28,
  /* 满分判据：不是「得分高」，是「丢分 ≤ 选做可得分」 */
  passLine: {
    full: 100,
    solid: 98,
    note: '满分 = 必做零失误。98 = 只丢一道 2 分小题。低于 98 说明零失误区已经破了。',
  },
  /* 卷面骨架：28 位，每位 {pos, want, slot}
     want 是该位在真题卷面里的分值（不是题库标注分值）。
     slot 非空时，该位必须从对应槽位题池取题。 */
  skeleton: [
    /* 选择 1–8，每位 2 分；第 8 位是 hard 槽位 */
    { pos: 1, want: 2, slot: null }, { pos: 2, want: 2, slot: null },
    { pos: 3, want: 2, slot: null }, { pos: 4, want: 2, slot: null },
    { pos: 5, want: 2, slot: null }, { pos: 6, want: 2, slot: null },
    { pos: 7, want: 2, slot: null }, { pos: 8, want: 2, slot: 's8' },
    /* 填空 9–16，每位 2 分；第 16 位是 hard 槽位 */
    { pos: 9, want: 2, slot: null }, { pos: 10, want: 2, slot: null },
    { pos: 11, want: 2, slot: null }, { pos: 12, want: 2, slot: null },
    { pos: 13, want: 2, slot: null }, { pos: 14, want: 2, slot: null },
    { pos: 15, want: 2, slot: null }, { pos: 16, want: 2, slot: 's16' },
    /* 第 17 题：4 小问，18 分 */
    { pos: 17, sub: 1, want: 5, slot: null },
    { pos: 17, sub: 2, want: 5, slot: null },
    { pos: 17, sub: 3, want: 4, slot: null },
    { pos: 17, sub: 4, want: 4, slot: null },
    /* 第 18–19 题：各 6 分 */
    { pos: 18, want: 6, slot: null },
    { pos: 19, want: 6, slot: null },
    /* 第 20 题：2 小问，11 分 */
    { pos: 20, sub: 1, want: 6, slot: null },
    { pos: 20, sub: 2, want: 5, slot: null },
    /* 第 21–22 题 */
    { pos: 21, want: 7, slot: null },
    { pos: 22, want: 7, slot: null },
    /* 第 23–24 题：压轴槽位 */
    { pos: 23, want: 6, slot: 's23' },
    { pos: 24, want: 7, slot: 's24' },
  ],
  /* 段落时间预算：100 分钟怎么分配 */
  budget: [
    { seg: '选填 1–16', min: 22, score: 32, note: '每题平均 82 秒' },
    { seg: '第 17 题（4 小问）', min: 14, score: 18, note: '全卷最大单题，不能拖' },
    { seg: '第 18–19 题', min: 10, score: 12, note: '化简求值 + 作图' },
    { seg: '第 20 题（2 小问）', min: 11, score: 11, note: '解方程，去分母是最大坑' },
    { seg: '第 21–22 题', min: 15, score: 14, note: '应用题，设列解答验五步' },
    { seg: '第 23–24 题', min: 20, score: 13, note: '压轴，允许部分完成' },
    { seg: '检查（专查符号）', min: 8, score: 0, note: '只做一件事：回看所有负号与变号' },
  ],
};
