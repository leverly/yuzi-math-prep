/* ==========================================================
   真题卷分析 · 北京市西城区七年级上学期期末数学
   样本：2021-22 / 2022-23 / 2023-24 / 2024-25 四份（4 个学年已全部到齐）
   来源：真题试卷/数学/ 下的原卷与解析版

   2023-24 补卷记录（2026-11-24）：
     文件「2023-2024北京西城初一（上）期末数学（教师版）.docx」，卷内标题「2024北京西城初一（上）期末」，
     即 2023-2024 学年度第一学期期末。已逐题提取核对：26 题 / 必做 100 分（17 题 17 分、18-19 各 6、
     20 题 12、21 题 6、22-24 各 7）+ 选做 10 分（25 题 4、26 题 6）。

     补卷带来的最重要变化：原本「动态几何压轴」在三年里是 3/3 年，补入 2023-24 后变成 3/4 年。
     但把该族重新定义为「压轴分类题（23 题）」后（含动点/动射线/线段中点各种载体），又回到 4/4 年——
     第 23 题四年全部是「分类」能力，只是载体每年换。这是「考法稳定、载体轮换」最典型的例子，
     也说明族的口径必须按「考法」而不是按「题干长什么样」来定。

   本文件是「真题对照」模块的数据源，用途有三个：
     ① 展示真题的知识点/难度/题型/分值分布
     ② 校验站内题库覆盖度（哪里缺、哪里偏）
     ③ 修正站内的训练配比（按真题实际权重，不按主观估计）

   每条题目记录：
     no      题号
     ch      章节 id（对应 data-chapters.js）
     cat     能力维度（概念/计算/建模/推理/分类/作图/空间/新定义）
     score   分值
     name    考点简称
     note    备注（可选）

   难度标定（自定，基于题目在卷中的位置与思维链长度）：
     easy    单步、直接套定义
     mid     2–3 步、需要选方法
     hard    多步、需要分类或构造
     top     压轴、需要新定义迁移或多情形讨论
   ========================================================== */

export const PAPERS = [
  {
    id: 'p2021',
    year: '2021—2022',
    date: '2022.1',
    total: 100,
    bonus: 10,
    minutes: 100,
    questions: 26,
    /* 解答题分值明细（原文） */
    solveSpec: '第17题18分；第18–19题每题6分；第20题11分；第21题7分；第22题8分；第23–24题每题6分',
    bonusSpec: '第25题5分；第26题5分',
    items: [
      /* 选择题 1-8 */
      { no: 1, ch: 'ch-rational', cat: '概念', score: 2, diff: 'easy', name: '绝对值', topic: '绝对值' },
      { no: 2, ch: 'ch-op', cat: '概念', score: 2, diff: 'easy', name: '科学记数法', topic: '科学记数法' },
      { no: 3, ch: 'ch-rational', cat: '概念', score: 2, diff: 'easy', name: '数轴比较大小', topic: '数轴读符号' },
      { no: 4, ch: 'ch-poly', cat: '计算', score: 2, diff: 'easy', name: '合并同类项辨析', topic: '合并同类项辨析' },
      { no: 5, ch: 'ch-eq', cat: '建模', score: 2, diff: 'mid', name: '余角补角列方程', topic: '余角补角' },
      { no: 6, ch: 'ch-poly', cat: '计算', score: 2, diff: 'mid', name: '整式加减（图形边长）', topic: '整式加减（图形边长）' },
      { no: 7, ch: 'ch-eq', cat: '概念', score: 2, diff: 'mid', name: '方程变形辨析', topic: '方程变形与等式性质' },
      { no: 8, ch: 'ch-geo', cat: '空间', score: 2, diff: 'hard', name: '三视图与立体拼搭', topic: '三视图' },
      /* 填空 9-16 */
      { no: 9, ch: 'ch-geo', cat: '计算', score: 2, diff: 'easy', name: '角度换算（度分秒）', topic: '角度换算（度分秒）' },
      { no: 10, ch: 'ch-op', cat: '概念', score: 2, diff: 'easy', name: '四舍五入近似数', topic: '近似数与精确度' },
      { no: 11, ch: 'ch-poly', cat: '概念', score: 2, diff: 'easy', name: '同类项求参数', topic: '同类项概念' },
      { no: 12, ch: 'ch-expr', cat: '计算', score: 2, diff: 'mid', name: '代数式求值（整体）', topic: '代数式求值' },
      { no: 13, ch: 'ch-eq', cat: '概念', score: 2, diff: 'easy', name: '方程解求参数', topic: '方程解求参数' },
      { no: 14, ch: 'ch-rational', cat: '概念', score: 2, diff: 'mid', name: '数轴判断符号', topic: '数轴读符号' },
      { no: 15, ch: 'ch-geo', cat: '分类', score: 2, diff: 'hard', name: '线段中点 + 分类', topic: '线段中点计算' },
      { no: 16, ch: 'ch-op', cat: '推理', score: 2, diff: 'hard', name: '幻圆（数字和相等）', topic: '数字填图（幻方类）' },
      /* 解答 17-24 */
      { no: 17, ch: 'ch-op', cat: '计算', score: 18, diff: 'mid', name: '有理数混合计算（4 小问）', topic: '有理数混合运算', note: '4 小问内部有梯度：前两问 easy、后两问 hard' },
      { no: 18, ch: 'ch-poly', cat: '计算', score: 6, diff: 'mid', name: '整式化简求值', topic: '整式化简求值' },
      { no: 19, ch: 'ch-geo', cat: '作图', score: 6, diff: 'mid', name: '方位角作图 + 三边关系', topic: '方位角与作图' },
      { no: 20, ch: 'ch-eq', cat: '计算', score: 11, diff: 'mid', name: '解方程（2 小问，含去分母）', topic: '解一元一次方程' },
      { no: 21, ch: 'ch-geo', cat: '推理', score: 7, diff: 'mid', name: '角度推理填空（同角余角）', topic: '角度推理与说理' },
      { no: 22, ch: 'ch-eq', cat: '建模', score: 8, diff: 'mid', name: '方程应用题（中国结）', topic: '方程应用（配套/分配）' },
      { no: 23, ch: 'ch-rational', cat: '分类', score: 6, diff: 'hard', name: '数轴点距离 + 分类', topic: '数轴动点与分类' },
      { no: 24, ch: 'ch-expr', cat: '推理', score: 6, diff: 'top', name: '阅读理解（19 的倍数）', topic: '阅读理解型' },
      /* 选做 25-26 */
      { no: 25, ch: 'ch-geo', cat: '作图', score: 5, diff: 'hard', name: '三角尺画角', topic: '三角尺拼角', bonus: true },
      { no: 26, ch: 'ch-rational', cat: '新定义', score: 5, diff: 'top', name: '新定义「k 星点」', topic: '新定义（数轴类）', bonus: true },
    ],
  },
  {
    id: 'p2022',
    year: '2022—2023',
    date: '2023.1',
    total: 100,
    bonus: 10,
    minutes: 100,
    questions: 26,
    solveSpec: '第17题18分；第18–19题每题6分；第20题11分；第21题6分；第22–24题每题7分',
    bonusSpec: '第25题4分；第26题6分',
    items: [
      { no: 1, ch: 'ch-rational', cat: '概念', score: 2, diff: 'easy', name: '相反数', topic: '相反数' },
      { no: 2, ch: 'ch-op', cat: '概念', score: 2, diff: 'easy', name: '科学记数法', topic: '科学记数法' },
      { no: 3, ch: 'ch-geo', cat: '空间', score: 2, diff: 'mid', name: '展开图识别（棱柱）', topic: '展开图识别' },
      { no: 4, ch: 'ch-rational', cat: '概念', score: 2, diff: 'mid', name: '数轴判断符号', topic: '数轴读符号' },
      { no: 5, ch: 'ch-poly', cat: '计算', score: 2, diff: 'easy', name: '整式加减辨析', topic: '合并同类项辨析' },
      { no: 6, ch: 'ch-eq', cat: '建模', score: 2, diff: 'mid', name: '补角列方程', topic: '余角补角列方程' },
      { no: 7, ch: 'ch-expr', cat: '计算', score: 2, diff: 'mid', name: '整体代入求值', topic: '代数式求值' },
      { no: 8, ch: 'ch-expr', cat: '推理', score: 2, diff: 'hard', name: '图形规律（卡片拼图）', topic: '图形规律探究' },
      { no: 9, ch: 'ch-op', cat: '概念', score: 2, diff: 'easy', name: '四舍五入', topic: '近似数与精确度' },
      { no: 10, ch: 'ch-geo', cat: '计算', score: 2, diff: 'easy', name: '角度换算（乘 4）', topic: '角度换算（度分秒）' },
      { no: 11, ch: 'ch-rational', cat: '概念', score: 2, diff: 'mid', name: '绝对值非负性求值', topic: '绝对值非负性' },
      { no: 12, ch: 'ch-poly', cat: '概念', score: 2, diff: 'mid', name: '构造单项式（系数/次数）', topic: '单项式概念（构造）' },
      { no: 13, ch: 'ch-geo', cat: '计算', score: 2, diff: 'mid', name: '线段中点', topic: '线段中点计算' },
      { no: 14, ch: 'ch-eq', cat: '概念', score: 2, diff: 'easy', name: '方程解求参数', topic: '方程解求参数' },
      { no: 15, ch: 'ch-expr', cat: '建模', score: 2, diff: 'mid', name: '列代数式（两次降价）', topic: '列代数式' },
      { no: 16, ch: 'ch-op', cat: '推理', score: 2, diff: 'hard', name: '数字填图（单元和为 23）', topic: '数字填图（幻方类）' },
      { no: 17, ch: 'ch-op', cat: '计算', score: 18, diff: 'mid', name: '计算和化简（4 小问）', topic: '有理数混合运算', note: '4 小问内部有梯度：前两问 easy、后两问 hard' },
      { no: 18, ch: 'ch-geo', cat: '作图', score: 6, diff: 'mid', name: '直线作图 + 三边关系说理', topic: '尺规作图与说理' },
      { no: 19, ch: 'ch-poly', cat: '计算', score: 6, diff: 'mid', name: '化简求值', topic: '整式化简求值' },
      { no: 20, ch: 'ch-eq', cat: '计算', score: 11, diff: 'mid', name: '解方程（2 小问）', topic: '解一元一次方程' },
      { no: 21, ch: 'ch-geo', cat: '推理', score: 6, diff: 'mid', name: '角度推理填空（角平分线）', topic: '角度推理与说理' },
      { no: 22, ch: 'ch-eq', cat: '建模', score: 7, diff: 'mid', name: '方程应用题（两机型，两种方法）', topic: '方程应用（配套/分配）' },
      { no: 23, ch: 'ch-geo', cat: '分类', score: 7, diff: 'top', name: '动射线角度（含参 n）', topic: '动射线（含参）' },
      { no: 24, ch: 'ch-rational', cat: '新定义', score: 7, diff: 'top', name: '新定义「k 倍分点」', topic: '新定义（数轴类）' },
      { no: 25, ch: 'ch-op', cat: '新定义', score: 4, diff: 'hard', name: '新定义「乘减法」', topic: '新定义（运算类）', bonus: true },
      { no: 26, ch: 'ch-rational', cat: '推理', score: 6, diff: 'top', name: '数轴 + 整除（含参）', topic: '数轴与整除', bonus: true },
    ],
  },
  {
    id: 'p2023',
    year: '2023—2024',
    date: '2024.1',
    total: 100,
    bonus: 10,
    minutes: 100,
    questions: 26,
    solveSpec: '第17题17分；第18–19题每题6分；第20题12分；第21题6分；第22–24题每题7分',
    bonusSpec: '第25题4分；第26题6分',
    items: [
      /* 选择题 1-8 */
      { no: 1, ch: 'ch-rational', cat: '概念', score: 2, diff: 'easy', name: '绝对值', topic: '绝对值' },
      { no: 2, ch: 'ch-op', cat: '概念', score: 2, diff: 'easy', name: '科学记数法', topic: '科学记数法' },
      { no: 3, ch: 'ch-geo', cat: '空间', score: 2, diff: 'easy', name: '展开图识别（三棱柱）', topic: '展开图识别' },
      { no: 4, ch: 'ch-poly', cat: '计算', score: 2, diff: 'easy', name: '合并同类项辨析', topic: '合并同类项辨析' },
      { no: 5, ch: 'ch-eq', cat: '建模', score: 2, diff: 'mid', name: '余角列方程', topic: '余角补角列方程' },
      { no: 6, ch: 'ch-rational', cat: '概念', score: 2, diff: 'mid', name: '数轴判断符号', topic: '数轴读符号' },
      { no: 7, ch: 'ch-eq', cat: '概念', score: 2, diff: 'mid', name: '方程变形辨析', topic: '方程变形与等式性质' },
      { no: 8, ch: 'ch-geo', cat: '分类', score: 2, diff: 'hard', name: '线段距离和最小（分类讨论）', topic: '线段中点计算' },
      /* 填空 9-16 */
      { no: 9, ch: 'ch-rational', cat: '概念', score: 2, diff: 'easy', name: '正负数意义', topic: '相反数' },
      { no: 10, ch: 'ch-rational', cat: '概念', score: 2, diff: 'easy', name: '有理数比较大小', topic: '数轴读符号' },
      { no: 11, ch: 'ch-geo', cat: '计算', score: 2, diff: 'mid', name: '网格中角的大小比较', topic: '角的和差计算' },
      { no: 12, ch: 'ch-poly', cat: '概念', score: 2, diff: 'mid', name: '同类项求参数', topic: '同类项概念' },
      { no: 13, ch: 'ch-eq', cat: '概念', score: 2, diff: 'easy', name: '方程解求参数', topic: '方程解求参数' },
      { no: 14, ch: 'ch-expr', cat: '计算', score: 2, diff: 'mid', name: '代数式求值（整体）', topic: '代数式求值' },
      { no: 15, ch: 'ch-eq', cat: '建模', score: 2, diff: 'mid', name: '列方程（算法统宗·客房）', topic: '列方程（分配）' },
      { no: 16, ch: 'ch-op', cat: '推理', score: 2, diff: 'hard', name: '幻方（三角形与正方形等和）', topic: '数字填图（幻方类）' },
      /* 解答 17-24 */
      { no: 17, ch: 'ch-op', cat: '计算', score: 17, diff: 'mid', name: '有理数混合运算（4 小问）', topic: '有理数混合运算' },
      { no: 18, ch: 'ch-poly', cat: '计算', score: 6, diff: 'mid', name: '整式化简求值', topic: '整式化简求值' },
      { no: 19, ch: 'ch-geo', cat: '作图', score: 6, diff: 'mid', name: '尺规作图 + 三边关系说理', topic: '尺规作图与说理' },
      { no: 20, ch: 'ch-eq', cat: '计算', score: 12, diff: 'mid', name: '解方程（2 小问，含去分母）', topic: '解一元一次方程' },
      { no: 21, ch: 'ch-geo', cat: '推理', score: 6, diff: 'mid', name: '角度推理填空（双角平分线）', topic: '角度推理与说理' },
      { no: 22, ch: 'ch-eq', cat: '建模', score: 7, diff: 'mid', name: '方程应用题（工期与费用）', topic: '方程应用（配套/分配）' },
      { no: 23, ch: 'ch-geo', cat: '分类', score: 7, diff: 'top', name: '线段中点 + 延长线（含参）', topic: '线段中点压轴（含参）' },
      { no: 24, ch: 'ch-rational', cat: '新定义', score: 7, diff: 'top', name: '新定义「变速点」（数轴动点）', topic: '新定义（数轴类）' },
      /* 选做 25-26 */
      { no: 25, ch: 'ch-op', cat: '新定义', score: 4, diff: 'hard', name: '新定义运算（迭代：相反数→加1→倒数）', topic: '新定义（运算类）', bonus: true },
      { no: 26, ch: 'ch-geo', cat: '新定义', score: 6, diff: 'top', name: '新定义「特征值」（射线角）', topic: '新定义（运算类）', bonus: true },
    ],
  },
  {
    id: 'p2024',
    year: '2024—2025',
    date: '2025.1',
    total: 100,
    bonus: 10,
    minutes: 100,
    questions: 26,
    solveSpec: '第17题19分；第18–19题每题6分；第20题12分；第21题7分；第22题5分；第23题6分；第24题7分',
    bonusSpec: '第25题4分；第26题6分',
    items: [
      { no: 1, ch: 'ch-rational', cat: '概念', score: 2, diff: 'easy', name: '绝对值', topic: '绝对值' },
      { no: 2, ch: 'ch-op', cat: '概念', score: 2, diff: 'easy', name: '科学记数法', topic: '科学记数法' },
      { no: 3, ch: 'ch-rational', cat: '建模', score: 2, diff: 'mid', name: '数轴 + 相反数（列方程组）', topic: '数轴读符号' },
      { no: 4, ch: 'ch-geo', cat: '空间', score: 2, diff: 'mid', name: '长方体展开图识别', topic: '展开图识别' },
      { no: 5, ch: 'ch-poly', cat: '计算', score: 2, diff: 'easy', name: '合并同类项辨析', topic: '合并同类项辨析' },
      { no: 6, ch: 'ch-eq', cat: '建模', score: 2, diff: 'mid', name: '补角列方程', topic: '余角补角列方程' },
      { no: 7, ch: 'ch-expr', cat: '概念', score: 2, diff: 'mid', name: '反比例关系判断', topic: '反比例关系' },
      { no: 8, ch: 'ch-op', cat: '新定义', score: 2, diff: 'hard', name: '新定义运算（四个结论判断）', topic: '新定义运算' },
      { no: 9, ch: 'ch-rational', cat: '概念', score: 2, diff: 'easy', name: '绝对值意义（最接近标准）', topic: '绝对值' },
      { no: 10, ch: 'ch-geo', cat: '概念', score: 2, diff: 'easy', name: '点与直线位置关系表述', topic: '点线面概念' },
      { no: 11, ch: 'ch-poly', cat: '概念', score: 2, diff: 'mid', name: '构造单项式（次数 4）', topic: '单项式概念（构造）' },
      { no: 12, ch: 'ch-eq', cat: '概念', score: 2, diff: 'easy', name: '方程解求参数', topic: '方程解求参数' },
      { no: 13, ch: 'ch-geo', cat: '计算', score: 2, diff: 'mid', name: '角的和差', topic: '角的和差计算' },
      { no: 14, ch: 'ch-expr', cat: '推理', score: 2, diff: 'hard', name: '图形规律（阴影正方形）', topic: '图形规律探究' },
      { no: 15, ch: 'ch-eq', cat: '建模', score: 2, diff: 'mid', name: '列方程（劳动分配）', topic: '列代数式' },
      { no: 16, ch: 'ch-op', cat: '推理', score: 2, diff: 'hard', name: '幻圆（四数和相等）', topic: '数字填图（幻方类）' },
      { no: 17, ch: 'ch-op', cat: '计算', score: 19, diff: 'mid', name: '有理数计算（4 小问）', topic: '有理数混合运算', note: '4 小问内部有梯度：前两问 easy、后两问 hard' },
      { no: 18, ch: 'ch-poly', cat: '计算', score: 6, diff: 'mid', name: '整式化简求值', topic: '整式化简求值' },
      { no: 19, ch: 'ch-geo', cat: '作图', score: 6, diff: 'mid', name: '尺规作图（线段）', topic: '尺规作图与说理' },
      { no: 20, ch: 'ch-eq', cat: '计算', score: 12, diff: 'mid', name: '解方程（2 小问）', topic: '解一元一次方程' },
      { no: 21, ch: 'ch-eq', cat: '建模', score: 7, diff: 'mid', name: '方程应用题（表格销售额）', topic: '方程应用（表格数据）' },
      { no: 22, ch: 'ch-geo', cat: '建模', score: 5, diff: 'hard', name: 'U 形赛道（几何 + 代数）', topic: '几何建模' },
      { no: 23, ch: 'ch-rational', cat: '分类', score: 6, diff: 'top', name: '数轴双动点（分段变速）', topic: '数轴动点与分类' },
      { no: 24, ch: 'ch-geo', cat: '分类', score: 7, diff: 'top', name: '三角尺旋转 + 角平分线', topic: '动角（旋转）' },
      { no: 25, ch: 'ch-op', cat: '新定义', score: 4, diff: 'hard', name: '三进制转换（进位制）', topic: '进位制（综合与实践）', bonus: true },
      { no: 26, ch: 'ch-rational', cat: '新定义', score: 6, diff: 'top', name: '新定义「平衡点」', topic: '新定义（数轴类）', bonus: true },
    ],
  },
];

/* ==========================================================
   派生统计（全部从 PAPERS 逐题数据算出，不手写）

   为什么改成派生：手写的汇总数字与逐题标注会对不上。
   之前手写难度分布是 32/46/14/8，实际算出来是 13/67/9/11 ——
   基础题差了 19 个百分点。这是硬伤，必须从数据算。
   ========================================================== */

const CH_ORDER = ['ch-rational', 'ch-op', 'ch-expr', 'ch-poly', 'ch-eq', 'ch-geo'];
const CAT_ORDER = ['计算', '概念', '建模', '推理', '分类', '作图', '空间', '新定义'];
const DIFF_ORDER = ['easy', 'mid', 'hard', 'top'];

export const CH_NAME = {
  'ch-rational': '有理数',
  'ch-op': '有理数的运算',
  'ch-expr': '代数式',
  'ch-poly': '整式的加减',
  'ch-eq': '一元一次方程',
  'ch-geo': '几何图形初步',
};

export const DIFF_NAME = { easy: '基础', mid: '中档', hard: '较难', top: '压轴' };

/* 难度标定标准（写清楚，否则「难度」是主观词） */
export const DIFF_CRITERIA = {
  easy: {
    name: '基础',
    desc: '单步完成，直接套定义或法则',
    signals: ['只需一次运算或一次判断', '无需求未知数', '题干不超过两行'],
  },
  mid: {
    name: '中档',
    desc: '2–3 步，需要选方法或列式',
    signals: ['需要设未知数或列方程', '需要两步以上运算', '需要从图形读信息'],
  },
  hard: {
    name: '较难',
    desc: '多步综合，或需要分类讨论/构造',
    signals: ['需要分类讨论', '需要构造辅助线或设元', '需要跨章节知识'],
  },
  top: {
    name: '压轴',
    desc: '新定义迁移、多情形讨论，或开放式探究',
    signals: ['题面自定义新概念', '需要判断「是否存在」', '需要写完整说理或举反例'],
  },
};

/* ---------- 单卷统计 ---------- */
export function statPaper(paper) {
  const main = paper.items.filter((x) => !x.bonus);
  const bonus = paper.items.filter((x) => x.bonus);
  const sum = (arr, f) => arr.reduce((a, x) => a + (f ? f(x) : x.score), 0);

  const ch = {};
  CH_ORDER.forEach((k) => { ch[k] = 0; });
  main.forEach((x) => { ch[x.ch] = (ch[x.ch] || 0) + x.score; });

  const cat = {};
  CAT_ORDER.forEach((k) => { cat[k] = 0; });
  main.forEach((x) => { cat[x.cat] = (cat[x.cat] || 0) + x.score; });

  const diff = {};
  DIFF_ORDER.forEach((k) => { diff[k] = 0; });
  main.forEach((x) => { diff[x.diff] = (diff[x.diff] || 0) + x.score; });

  /* 题量口径的难度分布：反映「题目数量」而不是「分值」
     为什么两个口径都要：按分值加权时，一道 19 分的中档大题会主导分布，
     掩盖「题目数量上基础题其实不少」这个事实。 */
  const diffN = {};
  DIFF_ORDER.forEach((k) => { diffN[k] = 0; });
  main.forEach((x) => { diffN[x.diff] += 1; });

  /* 按题位段统计（选择/填空/解答） */
  const seg = { choice: 0, fill: 0, solve: 0 };
  main.forEach((x) => {
    if (x.no <= 8) seg.choice += x.score;
    else if (x.no <= 16) seg.fill += x.score;
    else seg.solve += x.score;
  });

  const mainTotal = sum(main);
  const bonusTotal = sum(bonus);

  return {
    year: paper.year,
    id: paper.id,
    mainTotal,
    bonusTotal,
    qCount: main.length,
    bonusCount: bonus.length,
    ch, cat, diff, diffN, seg,
    /* 每题平均分 */
    avgScore: +(mainTotal / main.length).toFixed(2),
    /* 难度指数：easy=1 mid=2 hard=3 top=4，加权平均 */
    diffIndex: +(
      main.reduce((a, x) => a + x.score * ({ easy: 1, mid: 2, hard: 3, top: 4 }[x.diff]), 0) / mainTotal
    ).toFixed(2),
  };
}

/* ---------- 汇总统计（三年平均，从单卷派生） ---------- */
export const PAPER_STATS = PAPERS.map(statPaper);

function avgOf(key, sub) {
  const vals = PAPER_STATS.map((st) => (sub ? st[key][sub] : st[key]));
  return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

/* 章节：各年分值 + 平均 + 占比 */
export const CH_SCORE = {};
CH_ORDER.forEach((k) => {
  const scores = PAPER_STATS.map((st) => st.ch[k]);
  const avg = +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  CH_SCORE[k] = {
    name: CH_NAME[k],
    scores,
    avg,
    pct: Math.round(avg),
    /* 波动：极差 / 平均，衡量该章分值是否稳定 */
    volatility: +((Math.max(...scores) - Math.min(...scores)) / (avg || 1) * 100).toFixed(0),
  };
});

/* 能力维度：各年分值 + 平均 + 趋势 */
export const CAT_SCORE = {};
CAT_ORDER.forEach((k) => {
  const scores = PAPER_STATS.map((st) => st.cat[k]);
  const avg = +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const first = scores[0];
  const last = scores[scores.length - 1];
  const delta = last - first;
  CAT_SCORE[k] = {
    scores, avg,
    pct: Math.round(avg),
    delta,
    trend: delta > 2 ? 'up' : delta < -2 ? 'down' : 'flat',
  };
});

/* 难度：各年分值 + 平均占比 */
export const DIFF_SCORE = {};
DIFF_ORDER.forEach((k) => {
  const scores = PAPER_STATS.map((st) => st.diff[k]);
  const avg = +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  DIFF_SCORE[k] = {
    name: DIFF_NAME[k],
    scores, avg,
    pct: Math.round(avg),
    desc: DIFF_CRITERIA[k].desc,
  };
});

/* 难度：题量口径（各年题数 + 平均） */
export const DIFF_COUNT = {};
DIFF_ORDER.forEach((k) => {
  const counts = PAPER_STATS.map((st) => st.diffN[k]);
  const avg = +(counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(1);
  DIFF_COUNT[k] = {
    name: DIFF_NAME[k],
    counts, avg,
    pct: Math.round(avg / (PAPER_STATS[0].qCount) * 100),
  };
});

/* 难度指数逐年 */
export const DIFF_INDEX = PAPER_STATS.map((st) => ({ year: st.year, idx: st.diffIndex }));

/* ---------- 章节内知识点细分 ---------- */
export const TOPIC_MAP = (() => {
  const map = {};
  PAPERS.forEach((p) => {
    p.items.filter((x) => !x.bonus).forEach((x) => {
      const key = x.ch + '|' + x.topic;
      if (!map[key]) {
        map[key] = { ch: x.ch, chName: CH_NAME[x.ch], topic: x.topic, scores: {}, total: 0, nos: [], hitCount: 0 };
      }
      map[key].scores[p.year] = (map[key].scores[p.year] || 0) + x.score;
      map[key].total += x.score;
      map[key].hitCount += 1;
      map[key].nos.push(`${p.year.slice(0, 4)}#${x.no}`);
    });
  });
  return map;
})();

/* 补算：出现年数 + 频次等级 */
Object.values(TOPIC_MAP).forEach((t) => {
  t.hitYears = Object.keys(t.scores).length;
  /* 频次分级：按「出现年数」为主，同年多次考则上调一档 */
  if (t.hitYears >= 3) t.freq = 'always';
  else if (t.hitYears === 2) t.freq = t.hitCount >= 3 ? 'always' : 'often';
  else t.freq = t.hitCount >= 2 ? 'often' : 'rare';
});

/* ==========================================================
   考点族（frequency 表的正确口径）

   为什么需要这一层：细分考点会因「题干换说法」被拆散，导致
   「年年考」被误判成「仅 1 年」。例如尺规作图：
     2021#19 方位角与作图 / 2022#18 直线作图与说理 / 2024#19 尺规作图（线段）
   三行各标「仅 1 年」，但真相是每年固定 6 分。

   归并原则（可核查）：同一个「卷面槽位 + 同一项技能」跨年合并。
   不做语义猜测，只合并满足以下之一者：
     ① 题号槽位相同且能力维度相同（如解答 17 题计算）
     ② 考点名指向同一教材知识点（如 绝对值 / 绝对值意义 / 相反数）
   每条族的 topics 必须与 PAPERS 里的 topic 字符串逐字对应，
   由 tools/validate.mjs 断言「每个必做 topic 恰好归属一族」。
   ========================================================== */

/* ==========================================================
   四类题型映射（2026-11-24 定）
   ----------------------------------------------------------
   依据：真题题位决定题型，而不是题目"看起来像什么"。
     单选 single —— 真题第 1–8 题位（概念辨析、四选一）
     计算 calc   —— 真题第 9–16 填空位 + 第 17 题，填一个数/式
     大题 big    —— 真题第 18–24 及选做位，要写过程，不自动判分
     判断 judge  —— 概念卡 / 方法卡的辨析题，站内运行时生成

   为什么「有理数四则混合运算」归 calc 而不是 big：
   它在真题第 17 题（解答位），但答案是 4 个具体的数，
   本质是计算熟练度，不是"写过程"。判分要能自动判。
   ========================================================== */
export const FAMILY_QTYPE = {
  /* 单选：真题选择题位为主 */
  'f-abs-line':   'single',
  'f-scinot':     'single',
  'f-like':       'single',
  'f-pattern':    'single',
  'f-inverse':    'single',
  'f-supp':       'single',
  'f-eqconcept':  'single',
  'f-solid':      'single',

  /* 计算：真题填空位为主，答案是数或式子 */
  'f-magic':      'calc',
  'f-mono':       'calc',
  'f-eval':       'calc',
  'f-model-expr': 'calc',
  'f-eqparam':    'calc',
  'f-dms':        'calc',
  'f-midpoint':   'calc',
  'f-angle-sum':  'calc',
  'f-pos':        'calc',
  'f-mixcalc':    'calc',

  /* 大题：真题解答位，需要写过程，不自动判分 */
  'f-simplify':   'big',
  'f-solve':      'big',
  'f-eqapp':      'big',
  'f-construct':  'big',
  'f-anglereason':'big',
  'f-dynamic':    'big',
  'f-newdef':     'big',
  'f-geomodel':   'big',
  'f-read':       'big',
};

export const FAMILY_DEFS = [
  /* --- 有理数与运算 --- */
  { id: 'f-abs-line', name: '绝对值与数轴（概念题）', ch: 'ch-rational', cat: '概念',
    topics: ['绝对值', '绝对值意义', '相反数', '非负性求值', '数轴与大小比较', '数轴与符号', '数轴与相反数',
      '数轴读符号', '绝对值非负性', '数轴与整除'],
    note: '每年 3 道选择题：绝对值 / 相反数 / 数轴读符号，全在选择题前段' },
  { id: 'f-scinot', name: '科学记数法与近似数', ch: 'ch-op', cat: '概念',
    topics: ['科学记数法', '近似数', '近似数与精确度'],
    note: '科学记数法固定在选择题第 2 题；近似数在填空（仅 2/3 年）' },
  { id: 'f-mixcalc', name: '有理数四则混合运算', ch: 'ch-op', cat: '计算',
    topics: ['四则混合运算', '有理数混合运算'],
    note: '解答第 17 题，4 小问，全卷最大单题' },
  { id: 'f-magic', name: '数字填图 / 幻圆', ch: 'ch-op', cat: '推理',
    topics: ['数字填图', '数字填图（幻方类）'],
    note: '固定在填空最后一题（16 题），考「和相等」的方程思想' },

  /* --- 整式与代数式 --- */
  { id: 'f-like', name: '整式加减辨析', ch: 'ch-poly', cat: '计算',
    topics: ['合并同类项', '整式加减辨析', '整式加减（图形）', '合并同类项辨析', '整式加减（图形边长）'],
    note: '考「哪些项能合并」，不是算对就行，是判断对' },
  { id: 'f-mono', name: '单项式 / 同类项求参与构造', ch: 'ch-poly', cat: '概念',
    topics: ['同类项求参', '单项式构造', '同类项概念', '单项式概念（构造）'],
    note: '给定系数/次数条件反推，考概念边界' },
  { id: 'f-simplify', name: '整式化简求值', ch: 'ch-poly', cat: '计算',
    topics: ['化简求值', '整式化简求值'],
    note: '解答 18 或 19 题，必须先化简再代值' },
  { id: 'f-eval', name: '代数式求值（整体代入）', ch: 'ch-expr', cat: '计算',
    topics: ['代数式求值', '整体代入'],
    note: '不求出单个字母，把整块当整体代入' },
  { id: 'f-pattern', name: '图形规律（用含 n 式子表示）', ch: 'ch-expr', cat: '推理',
    topics: ['图形规律', '图形规律探究'],
    note: '从第 1、2、3 个图找通项，考归纳' },
  { id: 'f-model-expr', name: '列代数式建模', ch: 'ch-expr', cat: '建模',
    topics: ['列代数式', '列代数式（降价）', '列方程（分配）'],
    note: '把文字条件翻译成式子，是应用题的入口' },
  { id: 'f-inverse', name: '反比例关系判断', ch: 'ch-expr', cat: '概念',
    topics: ['反比例关系'],
    note: '2024-25 新增，对应教材「反比例关系」' },
  { id: 'f-read', name: '阅读理解型（模仿迁移）', ch: 'ch-expr', cat: '推理',
    topics: ['阅读理解型'],
    note: '给一段新方法，照做再迁移；近两年被新定义取代' },

  /* --- 方程 --- */
  { id: 'f-supp', name: '余角 / 补角列方程', ch: 'ch-eq', cat: '建模',
    topics: ['余角补角', '补角列方程', '余角补角列方程'],
    note: '几何概念与方程的结合，固定在选择题' },
  { id: 'f-eqconcept', name: '方程概念辨析', ch: 'ch-eq', cat: '概念',
    topics: ['方程变形', '方程变形与等式性质'],
    note: '判断变形是否等价（去分母、移项变号）' },
  { id: 'f-eqparam', name: '方程解求参数', ch: 'ch-eq', cat: '概念',
    topics: ['方程解求参', '方程解求参数'],
    note: '把解代回原方程求 k/a，固定在填空' },
  { id: 'f-solve', name: '解方程（含去分母）', ch: 'ch-eq', cat: '计算',
    topics: ['解方程（含去分母）', '解一元一次方程'],
    note: '解答第 20 题，2 小问，11–12 分' },
  { id: 'f-eqapp', name: '方程应用题', ch: 'ch-eq', cat: '建模',
    topics: ['方程应用（配套）', '方程应用（表格）', '方程应用（配套/分配）', '方程应用（表格数据）'],
    note: '解答 21 或 22 题，情境每年换（中国结 / 机型 / 销售额）' },

  /* --- 几何 --- */
  { id: 'f-solid', name: '展开图与三视图', ch: 'ch-geo', cat: '空间',
    topics: ['三视图', '展开图', '展开图识别'],
    note: '每年 1 道选择，考空间想象' },
  { id: 'f-dms', name: '角度换算（度分秒）', ch: 'ch-geo', cat: '计算',
    topics: ['角度换算', '角度换算（度分秒）'],
    note: '60 进制运算，固定在填空' },
  { id: 'f-midpoint', name: '线段中点', ch: 'ch-geo', cat: '计算',
    topics: ['线段中点', '线段中点（分类）', '线段中点计算'],
    note: '含「点在延长线上」的分类情形' },
  { id: 'f-angle-sum', name: '角的和差', ch: 'ch-geo', cat: '计算',
    topics: ['角的和差', '角的和差计算'],
    note: '读图算角，是角度推理的地基' },
  { id: 'f-pos', name: '点与直线位置关系', ch: 'ch-geo', cat: '概念',
    topics: ['点线位置关系', '点线面概念'],
    note: '考几何语言的规范表述' },
  { id: 'f-construct', name: '尺规作图与说理', ch: 'ch-geo', cat: '作图',
    topics: ['方位角与作图', '直线作图与说理', '尺规作图（线段）', '尺规作图与说理', '三角尺拼角'],
    note: '每年固定 6 分：作图痕迹 + ∵∴ 说理填空，四年题型略变但槽位不变' },
  { id: 'f-anglereason', name: '角度推理填空（几何说理）', ch: 'ch-geo', cat: '推理',
    topics: ['角度推理（余角）', '角度推理（角平分线）', '角度推理与说理'],
    note: '按步填空，每空对应一个依据' },
  { id: 'f-dynamic', name: '压轴分类题（23 题）', ch: 'ch-geo', cat: '分类',
    topics: ['数轴动点（分类）', '动射线（含参）', '数轴双动点', '动角（旋转）', '数轴动点与分类',
      '线段中点压轴（含参）'],
    note: '四年第 23 题全部是「分类讨论」，但载体每年换：数轴动点 → 动射线 → 线段中点 → 数轴双动点。这是「考法稳定、载体轮换」最典型的例子' },
  { id: 'f-geomodel', name: '几何建模（图形中的代数）', ch: 'ch-geo', cat: '建模',
    topics: ['几何建模（赛道）', '几何建模'],
    note: '2024-25 新增：U 形赛道，几何量 + 代数式 + 不等式' },

  /* --- 新定义 --- */
  { id: 'f-newdef', name: '新定义（必做位）', ch: 'ch-rational', cat: '新定义',
    topics: ['新定义（数轴）', '新定义运算', '新定义（数轴类）', '新定义（运算类）'],
    note: '给定义 → 判断 → 迁移；选做 26 题几乎年年也是新定义' },
];

/* 校验映射完备性：每个必做 topic 必须恰好属于一族 */
{
  const owner = new Map();
  FAMILY_DEFS.forEach((f) => f.topics.forEach((t) => {
    if (owner.has(t)) {
      throw new Error(`考点族冲突：topic「${t}」同时属于 ${owner.get(t)} 与 ${f.id}`);
    }
    owner.set(t, f.id);
  }));
  const orphans = new Set();
  PAPERS.forEach((p) => p.items.filter((x) => !x.bonus)
    .forEach((x) => { if (!owner.has(x.topic)) orphans.add(x.ch + '|' + x.topic); }));
  if (orphans.size) {
    throw new Error(`以下必做考点未归入任何考点族：${[...orphans].join('、')}`);
  }
}

/* 考点族统计：逐年分值 + 合计 + 出现年数 + 难度构成 + 题位 */
export const FAMILY_MAP = FAMILY_DEFS.map((f) => {
  const scores = {};
  PAPERS.forEach((p) => { scores[p.year] = 0; });
  const diffScore = { easy: 0, mid: 0, hard: 0, top: 0 };
  const slots = [];

  PAPERS.forEach((p) => {
    p.items.filter((x) => !x.bonus && f.topics.includes(x.topic)).forEach((x) => {
      scores[p.year] += x.score;
      diffScore[x.diff] += x.score;
      slots.push({
        year: p.year, no: x.no, score: x.score, diff: x.diff,
        seg: x.no <= 8 ? '选择' : x.no <= 16 ? '填空' : '解答',
      });
    });
  });

  const vals = Object.values(scores);
  const total = vals.reduce((a, b) => a + b, 0);
  const hitYears = vals.filter((v) => v > 0).length;

  return {
    ...f,
    scores, total, hitYears,
    diffScore,
    /* 难度构成只保留非零项，便于页面直接拼字符串 */
    diffMix: Object.fromEntries(Object.entries(diffScore).filter(([, v]) => v > 0)),
    avgPerYear: +(total / PAPERS.length).toFixed(1),
    maxScore: Math.max(...vals),
    slots,
    /* 频次三档，判据见 METHOD-真题分析.md §3.5：
         hitYears == 总卷数        → always 年年考
         hitYears == 总卷数 - 1    → often  高频轮考
         其余                       → rare   少见
       历史 bug：这里曾写死 hitYears === 2 → often，在 3 卷时恰好等价，
       补入第 4 卷后失配，把 f-anglereason（4.8 分/年）、f-newdef（4 分/年）
       等 5 个 3/4 年族误标成 rare，连带 planToday 的 P0–P4 档位算错。
       改回与文档一致后加断言（见下方），防止再漂。 */
    freq: hitYears === PAPERS.length ? 'always'
      : hitYears === PAPERS.length - 1 ? 'often' : 'rare',
  };
});

/* 频次判据的自我校验：三档必须覆盖全部族且分值合计等于必做总分。
   为什么必须断言：调档会静默改变「今日」清单排序（planToday 读 freq），
   算错了页面照样能渲染，只是练的顺序悄悄错了——这类错最难发现。 */
{
  const N = PAPERS.length;
  const mainTotal = PAPER_STATS.reduce((a, s) => a + s.mainTotal, 0);
  const byFreq = { always: [], often: [], rare: [] };
  FAMILY_MAP.forEach((f) => {
    if (!byFreq[f.freq]) throw new Error(`考点族 ${f.id} 的 freq「${f.freq}」不合法`);
    byFreq[f.freq].push(f);
    const expect = f.hitYears === N ? 'always' : f.hitYears === N - 1 ? 'often' : 'rare';
    if (f.freq !== expect) {
      throw new Error(`考点族 ${f.id} 频次判错：hitYears=${f.hitYears}/${N} 应为 ${expect}，实为 ${f.freq}`);
    }
  });
  const sum = ['always', 'often', 'rare'].reduce((a, k) => a + byFreq[k].reduce((x, f) => x + f.total, 0), 0);
  if (sum !== mainTotal) {
    throw new Error(`频次三档分值合计 ${sum} ≠ 必做总分 ${mainTotal}`);
  }
}

/* 按总分降序——频率表的主排序：先看占分，再看频次 */
export const FAMILIES_SORTED = [...FAMILY_MAP].sort((a, b) => {
  if (b.hitYears !== a.hitYears) return b.hitYears - a.hitYears;
  return b.total - a.total;
});

/* 三个频次档的分值与占比（页面「结论先行」直接用） */
export const FREQ_SUMMARY = (() => {
  const sum = (freq) => FAMILIES_SORTED.filter((f) => f.freq === freq)
    .reduce((a, f) => a + f.total, 0);
  const mainTotal = PAPER_STATS.reduce((a, s) => a + s.mainTotal, 0);
  const out = {};
  ['always', 'often', 'rare'].forEach((k) => {
    const s = sum(k);
    out[k] = {
      families: FAMILIES_SORTED.filter((f) => f.freq === k).length,
      total: s,
      pct: Math.round((s / mainTotal) * 100),
    };
  });
  out.mainTotal = mainTotal;
  return out;
})();

/* 按章分组的知识点列表 */
export const TOPICS_BY_CH = {};
CH_ORDER.forEach((k) => {
  TOPICS_BY_CH[k] = Object.values(TOPIC_MAP)
    .filter((t) => t.ch === k)
    .sort((a, b) => b.total - a.total);
});



/* ==========================================================
   真题溯源层（题目 ↔ 真题 双向可查）

   用途：让「这道练习题对应哪道真题」可查、可验证。
   站内题通过 topic 匹配到真题条目；题目的 topic 由其
   内容归类得出（见 tools/link-papers.mjs）。

   设计取舍：不做人工逐题标注（277 题 × 4 卷，成本高且易错），
   改为「按知识点匹配 + 人工抽查」——知识点是人工标注的，
   匹配是自动的，准确性由知识点标注质量保证。
   ========================================================== */

/* topic → 真题来源列表 */
export const TOPIC_SOURCES = (() => {
  const map = {};
  PAPERS.forEach((p) => {
    p.items.forEach((x) => {
      const key = x.topic;
      if (!map[key]) map[key] = [];
      map[key].push({
        year: p.year,
        paperId: p.id,
        no: x.no,
        score: x.score,
        diff: x.diff,
        bonus: !!x.bonus,
        name: x.name,
        /* 题位段：选择 1-8 / 填空 9-16 / 解答 17-24 / 选做 25-26 */
        seg: x.bonus ? '选做' : x.no <= 8 ? '选择' : x.no <= 16 ? '填空' : '解答',
      });
    });
  });
  /* 按年份排序，同年按题号 */
  Object.values(map).forEach((arr) => {
    arr.sort((a, b) => (a.year === b.year ? a.no - b.no : a.year.localeCompare(b.year)));
  });
  return map;
})();

/* 每个 topic 的汇总：出现几次、覆盖几年、总分值、题位分布 */
export const TOPIC_TRACE = (() => {
  const out = {};
  Object.entries(TOPIC_SOURCES).forEach(([topic, srcs]) => {
    const years = [...new Set(srcs.map((s) => s.year))];
    const segs = {};
    srcs.forEach((s) => { segs[s.seg] = (segs[s.seg] || 0) + 1; });
    out[topic] = {
      topic,
      count: srcs.length,
      years,
      yearCount: years.length,
      totalScore: srcs.reduce((a, s) => a + s.score, 0),
      segs,
      /* 主题位：出现最多的那个段 */
      mainSeg: Object.entries(segs).sort((a, b) => b[1] - a[1])[0][0],
      sources: srcs,
    };
  });
  return out;
})();

/* 统计：真题中有多少知识点、多少条目被溯源 */
export const TRACE_SUMMARY = {
  topics: Object.keys(TOPIC_TRACE).length,
  entries: Object.values(TOPIC_TRACE).reduce((a, t) => a + t.count, 0),
  papers: PAPERS.length,
};



/* ==========================================================
   方法卡 → 真题知识点 映射（用于给站内题溯源）

   站内题没有 topic 字段，但它们都挂了方法卡（或按章节归属）。
   通过「方法卡 → 真题知识点」的语义映射，可以推出
   「这道练习题对应哪些真题」。
   ========================================================== */
export const METHOD_TO_TOPICS = {
  'm-op-order': ['有理数混合运算'],
  'm-sign-rule': ['有理数混合运算', '绝对值'],
  'm-remove-bracket': ['整式化简求值', '合并同类项辨析'],
  'm-like-terms': ['合并同类项辨析', '同类项概念', '单项式概念（构造）'],
  'm-eq-5steps': ['解一元一次方程', '方程变形与等式性质'],
  'm-simplify-eval': ['整式化简求值'],
  'm-abs-value': ['绝对值', '绝对值非负性', '数轴读符号'],
  'm-numberline-dist': ['数轴读符号', '线段中点计算'],
  'm-substitute': ['代数式求值'],
  'm-eq-model': ['方程应用（配套/分配）', '方程应用（表格数据）', '余角补角列方程'],
  'm-pattern': ['图形规律探究', '列代数式'],
  'm-eq-param': ['方程解求参数'],
  'm-abs-eq': ['绝对值', '方程变形与等式性质'],
  'm-numberline-move': ['数轴动点与分类'],
  'm-seg-count': ['线段中点计算', '点线面概念'],
  'm-angle-calc': ['角的和差计算', '角度推理与说理', '余角补角列方程'],
  'm-unfold': ['展开图识别', '三视图'],
  'm-magic-sum': ['数字填图（幻方类）'],
  'm-newdef': ['新定义（数轴类）', '新定义运算', '阅读理解型', '反比例关系'],
  'm-construct-ruler': ['尺规作图与说理', '方位角与作图'],
  'm-dyn-angle': ['动角（旋转）', '动射线（含参）'],
  'm-geo-reason': ['角度推理与说理'],
  'm-geo-model': ['几何建模'],
};

/* 章节 → 兜底知识点（题目没挂方法卡时用） */
export const CHAPTER_TO_TOPICS = {
  'ch-rational': ['绝对值', '数轴读符号', '相反数', '数轴动点与分类', '新定义（数轴类）'],
  'ch-op': ['有理数混合运算', '科学记数法', '近似数与精确度', '数字填图（幻方类）', '新定义运算'],
  'ch-expr': ['代数式求值', '列代数式', '图形规律探究', '反比例关系', '阅读理解型'],
  'ch-poly': ['整式化简求值', '合并同类项辨析', '单项式概念（构造）', '同类项概念', '整式加减（图形边长）'],
  'ch-eq': ['解一元一次方程', '方程解求参数', '方程应用（配套/分配）', '方程应用（表格数据）', '方程变形与等式性质', '余角补角列方程'],
  'ch-geo': ['角的和差计算', '角度推理与说理', '尺规作图与说理', '线段中点计算', '展开图识别', '三视图', '动角（旋转）', '几何建模', '点线面概念', '角度换算（度分秒）'],
};

/* 计算题按 calcType 精确映射（比章节兜底准确得多） */
export const CALCTYPE_TO_TOPICS = {
  mix: ['有理数混合运算'],
  power: ['科学记数法', '近似数与精确度'],
  bracket: ['合并同类项辨析', '整式化简求值'],
  eq: ['解一元一次方程'],
  simplify: ['整式化简求值'],
};

/* 给单道站内题推溯源。优先级：calcType > method > chapter 兜底 */
export function traceQuestion(q) {
  let topics;
  if (q.calcType && CALCTYPE_TO_TOPICS[q.calcType]) {
    topics = CALCTYPE_TO_TOPICS[q.calcType];
  } else if (q.method && METHOD_TO_TOPICS[q.method]) {
    topics = METHOD_TO_TOPICS[q.method];
  } else {
    topics = CHAPTER_TO_TOPICS[q.chapter] || [];
  }
  const hits = [];
  topics.forEach((t) => {
    (TOPIC_SOURCES[t] || []).forEach((src) => {
      hits.push({ ...src, topic: t });
    });
  });
  /* 去重（同一真题条目可能被多个 topic 命中） */
  const seen = new Set();
  const uniq = hits.filter((h) => {
    const k = h.paperId + '#' + h.no;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return {
    topics,
    sources: uniq,
    /* 溯源强度：命中几道真题 */
    strength: uniq.length,
    /* 最近一年命中（按年份取最大，不是取数组末项——多个 topic 合并后顺序不可靠） */
    latest: uniq.length ? uniq.map((h) => h.year).sort().slice(-1)[0] : null,
    /* 最近一次的具体题号 */
    latestDetail: uniq.length
      ? uniq.slice().sort((a, b) => (a.year === b.year ? a.no - b.no : a.year.localeCompare(b.year))).slice(-1)[0]
      : null,
  };
}

/* ==========================================================
   考点频次三档（样本 4 卷，2026-11-24 重算）

   口径说明（重要）：频次按**考点族**算，不按 topic 算。
   族是「考法」的归并——例如「方程应用题」族合并了配套/分配、
   表格数据等多个 topic，四年每年都有（只是情境换），所以是 4/4。
   按 topic 算会把它拆成 3/4，那是错的粒度。

   4/4 年全出现（14 族）→ MUST_TEST：必须零失误
   3/4 年且分值高（5 族）→ HIGH_FREQ：要覆盖，但不做「必考」断言
   2/4 年及以下 → ROTATE_TEST：有覆盖即可，不堆量

   每条带 family 字段指向 FAMILY_MAP，validate 会断言频次与数据一致，
   防止再次手写出与逐题数据不符的结论。
   ========================================================== */
export const MUST_TEST = [
  { k: '有理数混合运算（第 17 题）', family: 'f-mixcalc', slot: '解答 17 题', note: '4/4 年 · 合计 72 分 · 年均 18 分，全卷最大单题', ch: 'ch-op', cat: '计算' },
  { k: '解方程（含去分母）', family: 'f-solve', slot: '解答 20 题', note: '4/4 年 · 合计 46 分 · 年均 11.5 分', ch: 'ch-eq', cat: '计算' },
  { k: '压轴分类题（23 题位）', family: 'f-dynamic', slot: '解答 23 题', note: '4/4 年 · 合计 33 分 · 年均 8.3 分，必含多情形讨论', ch: 'ch-geo', cat: '分类' },
  { k: '方程应用题', family: 'f-eqapp', slot: '解答 21 或 22 题', note: '4/4 年 · 合计 29 分 · 年均 7.3 分，情境每年换', ch: 'ch-eq', cat: '建模' },
  { k: '绝对值与数轴（概念题）', family: 'f-abs-line', slot: '选择题', note: '4/4 年 · 合计 26 分 · 年均 6.5 分', ch: 'ch-rational', cat: '概念' },
  { k: '整式化简求值', family: 'f-simplify', slot: '解答 18 或 19 题', note: '4/4 年 · 合计 24 分，必须先化简再代值', ch: 'ch-poly', cat: '计算' },
  { k: '尺规作图与说理', family: 'f-construct', slot: '解答 18 或 19 题', note: '4/4 年 · 合计 24 分 · 每年固定 6 分', ch: 'ch-geo', cat: '作图' },
  { k: '科学记数法与近似数', family: 'f-scinot', slot: '选择第 2 题', note: '4/4 年 · 合计 12 分，位置几乎固定', ch: 'ch-op', cat: '概念' },
  { k: '整式加减辨析', family: 'f-like', slot: '选择题', note: '4/4 年 · 考「哪些项能合并」', ch: 'ch-poly', cat: '计算' },
  { k: '数字填图 / 幻圆', family: 'f-magic', slot: '填空 16 题', note: '4/4 年 · 填空压轴位，三年换了三种图形', ch: 'ch-op', cat: '推理' },
  { k: '单项式 / 同类项求参与构造', family: 'f-mono', slot: '填空或选择', note: '4/4 年 · 反推系数与次数', ch: 'ch-poly', cat: '概念' },
  { k: '余角 / 补角列方程', family: 'f-supp', slot: '选择题', note: '4/4 年 · 几何概念与方程的结合', ch: 'ch-eq', cat: '建模' },
  { k: '方程解求参数', family: 'f-eqparam', slot: '填空题', note: '4/4 年 · 代入求 k/a', ch: 'ch-eq', cat: '概念' },
  { k: '展开图与三视图', family: 'f-solid', slot: '选择第 3 或 4 题', note: '4/4 年 · 唯一空间想象题', ch: 'ch-geo', cat: '空间' },
];

/* 高频轮考点（3/4 年，但分值不低）—— 必须覆盖，但不做「必考」断言
   为什么单列：这 5 族合计 53 分，年均 13 分，比一半的必考族更值钱。
   只盯 4/4 年的必考点会漏掉它们。 */
export const HIGH_FREQ = [
  { k: '角度推理填空（几何说理）', family: 'f-anglereason', years: '3/4 年（2021-22 / 2022-23 / 2023-24）', note: '合计 19 分 · 年均 4.8 分；2024-25 改为压轴动角', ch: 'ch-geo', cat: '推理' },
  { k: '新定义（必做位）', family: 'f-newdef', years: '3/4 年（2022-23 / 2023-24 / 2024-25）', note: '合计 16 分 · 年均 4 分；2021-22 只出现在选做', ch: 'ch-rational', cat: '新定义' },
  { k: '代数式求值（整体代入）', family: 'f-eval', years: '3/4 年（2021-22 / 2022-23 / 2023-24）', note: '合计 6 分 · 不求出单个字母', ch: 'ch-expr', cat: '计算' },
  { k: '列代数式建模', family: 'f-model-expr', years: '3/4 年（2022-23 / 2023-24 / 2024-25）', note: '合计 6 分 · 把文字条件翻译成式子', ch: 'ch-expr', cat: '建模' },
  { k: '线段中点', family: 'f-midpoint', years: '3/4 年（2021-22 / 2022-23 / 2023-24）', note: '合计 6 分；2023-24 升级为含参压轴', ch: 'ch-geo', cat: '计算' },
];

/* 轮考点（2/4 年）—— 站内应有覆盖但不需重点堆量 */
export const ROTATE_TEST = [
  { k: '图形规律（用含 n 式子表示）', years: '2022-23、2024-25', family: 'f-pattern', ch: 'ch-expr', cat: '推理', note: '2/4 年 · 合计 4 分' },
  { k: '方程概念辨析', years: '2021-22、2023-24', family: 'f-eqconcept', ch: 'ch-eq', cat: '概念', note: '2/4 年 · 判断变形是否等价' },
  { k: '角度换算（度分秒）', years: '2021-22、2022-23', family: 'f-dms', ch: 'ch-geo', cat: '计算', note: '2/4 年；2023-24 起未考' },
  { k: '角的和差', years: '2023-24、2024-25', family: 'f-angle-sum', ch: 'ch-geo', cat: '计算', note: '2/4 年 · 读图算角' },
  { k: '阅读理解型', years: '2021-22', ch: 'ch-expr', cat: '推理', note: '1/4 年，近三年被新定义取代' },
  { k: '几何建模（图形中的代数）', years: '2024-25', family: 'f-geomodel', ch: 'ch-geo', cat: '建模', note: '1/4 年 · U 形赛道' },
  { k: '反比例关系判断', years: '2024-25', family: 'f-inverse', ch: 'ch-expr', cat: '概念', note: '1/4 年 · 教材新增' },
];

/* ==========================================================
   趋势判断（基于四年数据 + 教材变化）
   ========================================================== */
export const TRENDS = [
  {
    k: '结构极稳', v: '四年均为 26 题 / 8 选择 + 8 填空 + 8 解答 + 2 选做 / 100 分钟 / 100+10 分',
    sig: '稳定', note: '四年卷面结构完全一致，只有解答题内部分值微调（17 题 18→17→19、20 题 11→12）',
  },
  {
    k: '计算权重最大', v: '计算类占必做卷 41–43 分（约 42%）',
    sig: '稳定', note: '第 17 题单题 17–19 分，四年都是全卷最大单题',
  },
  {
    k: '应用题权重上升', v: '建模类 10 → 11 → 11 → 18 分',
    sig: '上升', note: '前三年稳定在 10–11 分，2024-25 跳到 18 分（21 表格销售额 + 22 U 形赛道两道应用题）',
  },
  {
    k: '分类讨论权重上升', v: '分类类 8 → 7 → 9 → 13 分',
    sig: '上升', note: '四年缓升，2024-25 达 13 分；数轴双动点、三角尺旋转都要求多情形讨论',
  },
  {
    k: '纯推理题减少', v: '推理类 15 → 10 → 8 → 4 分',
    sig: '下降', note: '四年单调下降，2024-25 只剩 4 分；阅读理解型（19 的倍数）自 2022-23 起未再出现，转向新定义',
  },
  {
    k: '作图题极其稳定', v: '每年 6 分（四年四考）',
    sig: '稳定', note: '尺规作图 + 「∵∴」说理，四年都是 6 分，是几何语言的基本功',
  },
  {
    k: '新定义成选做主力', v: '选做 25/26 题四年都是新定义或新情境',
    sig: '稳定', note: 'k 星点 → k 倍分点 → 特征值 → 平衡点，模式一致：给定义、判断、迁移',
  },
  {
    k: '几何章权重高位稳定', v: '几何图形初步 19 → 25 → 25 → 24 分',
    sig: '稳定', note: '2021-22 是 19 分，之后三年稳定在 24–25 分；压轴常落在几何（动角、旋转、含参线段）',
  },
];

/* ==========================================================
   站内覆盖度评估（用于「真题对照」模块）
   每个必考点 → 站内是否有对应内容
   ========================================================== */
export const COVERAGE = [
  { k: '科学记数法与近似数', have: true, where: '概念卡 c-op-2 · 计算专项 power 类' },
  { k: '整式加减辨析', have: true, where: '方法卡 m-like-terms · 计算专项 bracket 类' },
  { k: '余角 / 补角列方程', have: true, where: '概念卡 c-ge-2 · 方法卡 m-angle-calc' },
  { k: '方程解求参数', have: true, where: '计算专项 c-eq-16 · 方法卡 m-eq-param' },
  { k: '有理数混合运算（第 17 题）', have: true, where: '计算专项 mix 类 20 题' },
  { k: '整式化简求值', have: true, where: '方法卡 m-simplify-eval · 计算专项 simplify 类' },
  { k: '尺规作图与说理', have: true, where: '作图题 6 道：真尺规 3 道（q-draw-1/5/6）+ 说理填空 3 道（q-draw-2/3/4）。判「作图顺序 + ∵∴ 依据」，不判「画得像不像」' },
  { k: '解方程（含去分母）', have: true, where: '计算专项 eq 类 16 题' },
  { k: '方程应用题', have: true, where: '方法卡 m-eq-model · 9 道应用题' },
  { k: '绝对值与数轴（概念题）', have: true, where: '概念卡 c-ra-1~6 · 计算专项 mix 类' },
  { k: '数字填图 / 幻圆', have: true, where: '方法卡 m-magic-sum · 幻圆专题 4 道（q-magic-1 母题 + v-magic-1~3 变式）· 另有 q-bal-magic-2' },
  { k: '单项式 / 同类项求参与构造', have: true, where: '概念卡 c-ex-5 · 计算专项 bracket 类' },
  { k: '展开图与三视图', have: true, where: '几何题 q-geo-*（展开图）· 概念卡 c-ge-*' },
  { k: '压轴分类题（23 题位）', have: true, where: '方法卡 m-numberline-move · 4 道动点题' },
];
