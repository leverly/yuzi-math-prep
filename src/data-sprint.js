/* ==========================================================
   10 天冲刺计划（2026-11-25 建）

   逻辑：期末前 10 天，把 5 套西城真题拆成 10 天练完。
   不是「每天随机抽题」，是「每天一个明确任务」——
   学生在冲刺期最缺的不是题，是「今天该做什么」。

   分配原则（按真题权重与难度）：
     第 1–2 天  送分区（选择 + 填空），目标是零失误
     第 3–6 天  中档区（解答题 17–22），每天 1 套卷的解答题
     第 7–8 天  压轴区（23–26），允许部分丢分
     第 9 天    整卷限时（用最近一份卷）
     第 10 天   错题清零 + 诊断复盘

   为什么把「选择填空」放前面：
     它们占 32 分且是熟练层，冲满分的前提是这 32 分零失误。
     先练这个，后面的解答题才有余力。

   为什么第 9 天是整卷：
     分散练完各块后，需要一次「100 分钟连续作答」检验节奏。
   ========================================================== */

export const SPRINT_DAYS = [
  {
    day: 1, title: '选择题：前三套',
    goal: '2021-22 / 2022-23 / 2023-24 三套卷的选择题（第 1–8 题）',
    kind: 'choice',
    /* 按题号取：少数选择题的 qtype 被标成 big（题干是图片、答案未提取成字母），
       按 qtype 会漏。第 1 天取前三套，第 2 天取后两套，每天 24 题左右。 */
    pick: { noRange: [1, 8], paperIds: ['p2021', 'p2022', 'p2023'] },
    minutes: 30,
    why: '选择题 16 分，是全卷最容易拿满的部分。错一道就是 2 分，比压轴题丢分更亏。',
  },
  {
    day: 2, title: '选择题：后两套',
    goal: '2024-25 / 2025-26 两套卷的选择题（第 1–8 题）',
    kind: 'choice',
    pick: { noRange: [1, 8], paperIds: ['p2024', 'p2025'] },
    minutes: 30,
    why: '把剩下两套的选择题过完。同一题型换卷练，才能看出是「这套卷不会」还是「这类题不会」。',
  },
  {
    day: 3, title: '填空题：9–16 题',
    goal: '5 套卷的 40 道填空题，重点是计算准确率',
    kind: 'fill',
    /* 填空题是 9–16 题。它们的 qtype 多为 big（有答案但非单选），按题号取。 */
    pick: { noRange: [9, 16] },
    minutes: 40,
    why: '填空题 16 分，多数是直接算。这类题错，说明是熟练度问题不是不会。',
  },
  {
    day: 4, title: '解答题 17–18：计算与化简',
    goal: '有理数混合运算、整式化简求值',
    kind: 'solve',
    pick: { noRange: [17, 18] },
    minutes: 35,
    why: '第 17 题单题 17–19 分（4 小问），是全卷最大单题。这里稳不住，满分无望。',
  },
  {
    day: 5, title: '解答题 19–20：作图与解方程',
    goal: '尺规作图说理、解一元一次方程',
    kind: 'solve',
    pick: { noRange: [19, 20] },
    minutes: 35,
    why: '解方程是纯程序题，路径唯一，应该 100% 正确。作图题的分在「∵∴ 依据」不在画功。',
  },
  {
    day: 6, title: '解答题 21–22：角度推理与应用题',
    goal: '角度推理填空、方程应用题',
    kind: 'solve',
    pick: { noRange: [21, 22] },
    minutes: 40,
    why: '角度推理考「填依据」，应用题考「找等量关系」。两者都是中档题的主要来源。',
  },
  {
    day: 7, title: '压轴 23：数轴动点与分类',
    goal: '数轴动点、动射线，重点是分类讨论是否完整',
    kind: 'solve',
    pick: { noRange: [23, 23] },
    minutes: 40,
    why: '这类题的分全在「分类是否漏情形」。漏一种就丢一半，练的是完整性不是技巧。',
  },
  {
    day: 8, title: '压轴 24–26：新定义与探究',
    goal: '新定义、阅读理解、选做题',
    kind: 'solve',
    pick: { noRange: [24, 26] },
    minutes: 45,
    why: '新定义题的第一步「读定义」是给分点，很多人直接跳过。这类题目标不是满分，是拿到前两问。',
  },
  {
    day: 9, title: '错题重做：前八天错的再做一遍',
    goal: '把前 7 天所有错题重做，做对的移出',
    kind: 'redo',
    pick: { wrongOnly: true },
    minutes: 40,
    why: '错过的题如果不再做对，练了也白练。这一天专门做这件事，不碰新题。',
  },
  {
    day: 10, title: '整卷限时 + 清零',
    goal: '用最近一份卷（2025-26）限时 100 分钟作答；交卷后把错题过一遍',
    kind: 'full',
    pick: { paperId: 'p2025' },
    minutes: 100,
    why: '分散练完各块后，需要一次连续作答检验「时间分配」——这是考场上真正丢分的地方。交卷后看诊断，确认哪些已经稳了。',
  },
];

/* 按天取题的规则（构建期与运行时共用）
   @param day   SPRINT_DAYS 里的一天
   @param all   全部真题
   @param wrongIds 错题 id 集合（redo / final 用）
*/
export function pickDayQuestions(day, all, wrongIds) {
  const p = day.pick || {};
  if (p.wrongOnly) {
    return all.filter((q) => wrongIds && wrongIds.has(q.id));
  }
  if (p.paperId) {
    return all.filter((q) => q.examRef && q.examRef.paperId === p.paperId);
  }
  if (p.qtype) {
    return all.filter((q) => q.qtype === p.qtype);
  }
  if (p.noRange) {
    const [a, b] = p.noRange;
    let list = all.filter((q) => q.examRef && q.examRef.no >= a && q.examRef.no <= b);
    /* 可再按卷过滤（同题型分两天练时用） */
    if (p.paperIds) {
      const ids = new Set(p.paperIds);
      list = list.filter((q) => q.examRef && ids.has(q.examRef.paperId));
    }
    return list;
  }
  return [];
}
