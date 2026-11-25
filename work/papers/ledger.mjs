// 西城区初一(上)数学期末真题 · 逐题标注台账
// 口径：每套 26 题 = 必做 24 题(100 分) + 选做 2 题(10 分)
// 章节：ch-rational 有理数 / ch-op 有理数运算 / ch-expr 代数式 / ch-poly 整式加减
//       ch-eq 一元一次方程 / ch-geo 几何图形初步
// cat：概念 / 计算 / 建模 / 推理 / 分类 / 作图 / 空间 / 新定义
// diff：easy 基础 / mid 中档 / hard 较难 / top 压轴
// 来源核实：五套卷原文逐题读过，p2022 无官方答案，其余四套有

export const PAPERS_META = [
  {
    id: 'p2021', year: '2021—2022', label: '2021-22',
    file: '精品解析：北京市西城区2021~2022学年七年级上学期期末数学试卷.zip',
    hasAnswer: true, answerSource: '精品解析（解析版）',
    // 解答题分值分布（原卷明写）
    solveLayout: '第17题18分；第18、19题各6分；第20题11分；第21题7分；第22题8分；第23、24题各6分',
    bonusLayout: '第25、26题各5分',
  },
  {
    id: 'p2022', year: '2022—2023', label: '2022-23',
    file: '2022-2023年西城区七年数学上期末数学试卷.pdf',
    hasAnswer: false, answerSource: '无（仅原卷）',
    solveLayout: '第17题18分；第18、19题各6分；第20题11分；第21题6分；第22-24题各7分',
    bonusLayout: '第25题4分，第26题6分',
  },
  {
    id: 'p2023', year: '2023—2024', label: '2023-24',
    file: '2023-2024北京西城初一（上）期末数学（教师版）.docx',
    hasAnswer: true, answerSource: '教师版（含答案解析）',
    solveLayout: '第17题17分；第18、19题各6分；第20题12分；第21题6分；第22-24题各7分',
    bonusLayout: '第25题4分，第26题6分',
  },
  {
    id: 'p2024', year: '2024—2025', label: '2024-25',
    file: '精品解析：北京市西城区2024-2025学年七年级上学期期末考试数学试卷 （解析版）.docx',
    hasAnswer: true, answerSource: '精品解析（解析版）',
    solveLayout: '第17题19分；第18、19题各6分；第20题12分；第21题7分；第22题5分；第23题6分；第24题7分',
    bonusLayout: '第25题4分，第26题6分',
  },
  {
    id: 'p2025', year: '2025—2026', label: '2025-26',
    file: '2025-2026学年北京市西城区七年级（上）期末数学试卷.pdf',
    hasAnswer: true, answerSource: '原卷含参考答案与解析（自带难度标注）',
    solveLayout: '第17题20分；第18题6分；第19题12分；第20题5分；第21题7分；第22题5分；第23题6分；第24题7分',
    bonusLayout: '第25题4分，第26题6分',
  },
];

// 逐题台账
// 字段：no 题号 / seg 大题段 / score 分值 / chapter / cat / diff / topic 考点 / bonus 是否选做
export const LEDGER = [
  // ==================== 2021-2022 ====================
  { p: 'p2021', no: 1, seg: '选择', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '绝对值' },
  { p: 'p2021', no: 2, seg: '选择', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '科学记数法' },
  { p: 'p2021', no: 3, seg: '选择', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '数轴读符号' },
  { p: 'p2021', no: 4, seg: '选择', score: 2, ch: 'ch-poly', cat: '概念', diff: 'easy', topic: '合并同类项辨析' },
  { p: 'p2021', no: 5, seg: '选择', score: 2, ch: 'ch-geo', cat: '建模', diff: 'mid', topic: '余角补角列方程' },
  { p: 'p2021', no: 6, seg: '选择', score: 2, ch: 'ch-poly', cat: '推理', diff: 'hard', topic: '整式加减（图形边长）' },
  { p: 'p2021', no: 7, seg: '选择', score: 2, ch: 'ch-eq', cat: '概念', diff: 'mid', topic: '方程变形与等式性质' },
  { p: 'p2021', no: 8, seg: '选择', score: 2, ch: 'ch-geo', cat: '空间', diff: 'hard', topic: '三视图' },

  { p: 'p2021', no: 9, seg: '填空', score: 2, ch: 'ch-geo', cat: '计算', diff: 'easy', topic: '角度换算（度分秒）' },
  { p: 'p2021', no: 10, seg: '填空', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '近似数与精确度' },
  { p: 'p2021', no: 11, seg: '填空', score: 2, ch: 'ch-poly', cat: '概念', diff: 'easy', topic: '同类项概念' },
  { p: 'p2021', no: 12, seg: '填空', score: 2, ch: 'ch-expr', cat: '计算', diff: 'mid', topic: '代数式求值' },
  { p: 'p2021', no: 13, seg: '填空', score: 2, ch: 'ch-eq', cat: '概念', diff: 'easy', topic: '方程解求参数' },
  { p: 'p2021', no: 14, seg: '填空', score: 2, ch: 'ch-rational', cat: '推理', diff: 'mid', topic: '数轴读符号' },
  { p: 'p2021', no: 15, seg: '填空', score: 2, ch: 'ch-geo', cat: '分类', diff: 'hard', topic: '线段中点计算' },
  { p: 'p2021', no: 16, seg: '填空', score: 2, ch: 'ch-rational', cat: '推理', diff: 'hard', topic: '数字填图（幻方类）' },

  { p: 'p2021', no: 17, seg: '解答', score: 18, ch: 'ch-op', cat: '计算', diff: 'easy', topic: '有理数混合运算' },
  { p: 'p2021', no: 18, seg: '解答', score: 6, ch: 'ch-poly', cat: '计算', diff: 'easy', topic: '整式化简求值' },
  { p: 'p2021', no: 19, seg: '解答', score: 6, ch: 'ch-geo', cat: '作图', diff: 'mid', topic: '尺规作图与说理' },
  { p: 'p2021', no: 20, seg: '解答', score: 11, ch: 'ch-eq', cat: '计算', diff: 'easy', topic: '解一元一次方程' },
  { p: 'p2021', no: 21, seg: '解答', score: 7, ch: 'ch-geo', cat: '推理', diff: 'mid', topic: '角度推理与说理' },
  { p: 'p2021', no: 22, seg: '解答', score: 8, ch: 'ch-eq', cat: '建模', diff: 'mid', topic: '方程应用（配套/分配）' },
  { p: 'p2021', no: 23, seg: '解答', score: 6, ch: 'ch-rational', cat: '分类', diff: 'hard', topic: '数轴动点与分类' },
  { p: 'p2021', no: 24, seg: '解答', score: 6, ch: 'ch-rational', cat: '推理', diff: 'hard', topic: '阅读理解型' },

  { p: 'p2021', no: 25, seg: '选做', score: 5, ch: 'ch-geo', cat: '作图', diff: 'mid', topic: '三角尺拼角', bonus: true },
  { p: 'p2021', no: 26, seg: '选做', score: 5, ch: 'ch-rational', cat: '新定义', diff: 'top', topic: '新定义（数轴类）', bonus: true },

  // ==================== 2022-2023 ====================
  { p: 'p2022', no: 1, seg: '选择', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '相反数' },
  { p: 'p2022', no: 2, seg: '选择', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '科学记数法' },
  { p: 'p2022', no: 3, seg: '选择', score: 2, ch: 'ch-geo', cat: '空间', diff: 'easy', topic: '展开图识别' },
  { p: 'p2022', no: 4, seg: '选择', score: 2, ch: 'ch-rational', cat: '概念', diff: 'mid', topic: '数轴读符号' },
  { p: 'p2022', no: 5, seg: '选择', score: 2, ch: 'ch-poly', cat: '概念', diff: 'easy', topic: '合并同类项辨析' },
  { p: 'p2022', no: 6, seg: '选择', score: 2, ch: 'ch-geo', cat: '建模', diff: 'mid', topic: '余角补角列方程' },
  { p: 'p2022', no: 7, seg: '选择', score: 2, ch: 'ch-expr', cat: '计算', diff: 'mid', topic: '代数式求值' },
  { p: 'p2022', no: 8, seg: '选择', score: 2, ch: 'ch-expr', cat: '推理', diff: 'hard', topic: '图形规律探究' },

  { p: 'p2022', no: 9, seg: '填空', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '近似数与精确度' },
  { p: 'p2022', no: 10, seg: '填空', score: 2, ch: 'ch-geo', cat: '计算', diff: 'easy', topic: '角度换算（度分秒）' },
  { p: 'p2022', no: 11, seg: '填空', score: 2, ch: 'ch-rational', cat: '计算', diff: 'mid', topic: '绝对值非负性' },
  { p: 'p2022', no: 12, seg: '填空', score: 2, ch: 'ch-poly', cat: '概念', diff: 'mid', topic: '单项式概念（构造）' },
  { p: 'p2022', no: 13, seg: '填空', score: 2, ch: 'ch-geo', cat: '计算', diff: 'mid', topic: '线段中点计算' },
  { p: 'p2022', no: 14, seg: '填空', score: 2, ch: 'ch-eq', cat: '概念', diff: 'easy', topic: '方程解求参数' },
  { p: 'p2022', no: 15, seg: '填空', score: 2, ch: 'ch-expr', cat: '建模', diff: 'easy', topic: '列代数式' },
  { p: 'p2022', no: 16, seg: '填空', score: 2, ch: 'ch-rational', cat: '推理', diff: 'hard', topic: '数字填图（幻方类）' },

  { p: 'p2022', no: 17, seg: '解答', score: 18, ch: 'ch-op', cat: '计算', diff: 'easy', topic: '有理数混合运算' },
  { p: 'p2022', no: 18, seg: '解答', score: 6, ch: 'ch-geo', cat: '作图', diff: 'mid', topic: '尺规作图与说理' },
  { p: 'p2022', no: 19, seg: '解答', score: 6, ch: 'ch-poly', cat: '计算', diff: 'easy', topic: '整式化简求值' },
  { p: 'p2022', no: 20, seg: '解答', score: 11, ch: 'ch-eq', cat: '计算', diff: 'easy', topic: '解一元一次方程' },
  { p: 'p2022', no: 21, seg: '解答', score: 6, ch: 'ch-geo', cat: '推理', diff: 'mid', topic: '角度推理与说理' },
  { p: 'p2022', no: 22, seg: '解答', score: 7, ch: 'ch-eq', cat: '建模', diff: 'mid', topic: '方程应用（配套/分配）' },
  { p: 'p2022', no: 23, seg: '解答', score: 7, ch: 'ch-geo', cat: '分类', diff: 'hard', topic: '动角（旋转）' },
  { p: 'p2022', no: 24, seg: '解答', score: 7, ch: 'ch-rational', cat: '新定义', diff: 'top', topic: '新定义（数轴类）' },

  { p: 'p2022', no: 25, seg: '选做', score: 4, ch: 'ch-op', cat: '新定义', diff: 'hard', topic: '新定义（运算类）', bonus: true },
  { p: 'p2022', no: 26, seg: '选做', score: 6, ch: 'ch-rational', cat: '分类', diff: 'top', topic: '数轴动点与分类', bonus: true },

  // ==================== 2023-2024（教师版，含答案） ====================
  { p: 'p2023', no: 1, seg: '选择', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '绝对值' },
  { p: 'p2023', no: 2, seg: '选择', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '科学记数法' },
  { p: 'p2023', no: 3, seg: '选择', score: 2, ch: 'ch-geo', cat: '空间', diff: 'easy', topic: '展开图识别' },
  { p: 'p2023', no: 4, seg: '选择', score: 2, ch: 'ch-poly', cat: '概念', diff: 'easy', topic: '合并同类项辨析' },
  { p: 'p2023', no: 5, seg: '选择', score: 2, ch: 'ch-geo', cat: '建模', diff: 'mid', topic: '余角补角列方程' },
  { p: 'p2023', no: 6, seg: '选择', score: 2, ch: 'ch-rational', cat: '概念', diff: 'mid', topic: '数轴读符号' },
  { p: 'p2023', no: 7, seg: '选择', score: 2, ch: 'ch-eq', cat: '概念', diff: 'mid', topic: '方程变形与等式性质' },
  { p: 'p2023', no: 8, seg: '选择', score: 2, ch: 'ch-rational', cat: '推理', diff: 'hard', topic: '数轴距离最值' },

  { p: 'p2023', no: 9, seg: '填空', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '正负数意义' },
  { p: 'p2023', no: 10, seg: '填空', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '有理数大小比较' },
  { p: 'p2023', no: 11, seg: '填空', score: 2, ch: 'ch-rational', cat: '概念', diff: 'mid', topic: '有理数大小比较' },
  { p: 'p2023', no: 12, seg: '填空', score: 2, ch: 'ch-poly', cat: '概念', diff: 'mid', topic: '同类项概念' },
  { p: 'p2023', no: 13, seg: '填空', score: 2, ch: 'ch-eq', cat: '概念', diff: 'easy', topic: '方程解求参数' },
  { p: 'p2023', no: 14, seg: '填空', score: 2, ch: 'ch-expr', cat: '计算', diff: 'mid', topic: '代数式求值' },
  { p: 'p2023', no: 15, seg: '填空', score: 2, ch: 'ch-eq', cat: '建模', diff: 'mid', topic: '列方程（分配）' },
  { p: 'p2023', no: 16, seg: '填空', score: 2, ch: 'ch-rational', cat: '推理', diff: 'hard', topic: '数字填图（幻方类）' },

  { p: 'p2023', no: 17, seg: '解答', score: 17, ch: 'ch-op', cat: '计算', diff: 'easy', topic: '有理数混合运算' },
  { p: 'p2023', no: 18, seg: '解答', score: 6, ch: 'ch-poly', cat: '计算', diff: 'easy', topic: '整式化简求值' },
  { p: 'p2023', no: 19, seg: '解答', score: 6, ch: 'ch-geo', cat: '作图', diff: 'mid', topic: '尺规作图与说理' },
  { p: 'p2023', no: 20, seg: '解答', score: 12, ch: 'ch-eq', cat: '计算', diff: 'easy', topic: '解一元一次方程' },
  { p: 'p2023', no: 21, seg: '解答', score: 6, ch: 'ch-geo', cat: '推理', diff: 'mid', topic: '角度推理与说理' },
  { p: 'p2023', no: 22, seg: '解答', score: 7, ch: 'ch-eq', cat: '建模', diff: 'mid', topic: '方程应用（工程）' },
  { p: 'p2023', no: 23, seg: '解答', score: 7, ch: 'ch-geo', cat: '分类', diff: 'hard', topic: '线段中点压轴（含参）' },
  { p: 'p2023', no: 24, seg: '解答', score: 7, ch: 'ch-rational', cat: '新定义', diff: 'top', topic: '新定义（变速点）' },

  { p: 'p2023', no: 25, seg: '选做', score: 4, ch: 'ch-op', cat: '推理', diff: 'hard', topic: '规律探究（迭代运算）', bonus: true },
  { p: 'p2023', no: 26, seg: '选做', score: 6, ch: 'ch-geo', cat: '新定义', diff: 'top', topic: '新定义（角·特征值）', bonus: true },

  // ==================== 2024-2025 ====================
  { p: 'p2024', no: 1, seg: '选择', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '绝对值' },
  { p: 'p2024', no: 2, seg: '选择', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '科学记数法' },
  { p: 'p2024', no: 3, seg: '选择', score: 2, ch: 'ch-rational', cat: '概念', diff: 'mid', topic: '数轴与相反数' },
  { p: 'p2024', no: 4, seg: '选择', score: 2, ch: 'ch-geo', cat: '空间', diff: 'easy', topic: '展开图识别' },
  { p: 'p2024', no: 5, seg: '选择', score: 2, ch: 'ch-poly', cat: '概念', diff: 'easy', topic: '合并同类项辨析' },
  { p: 'p2024', no: 6, seg: '选择', score: 2, ch: 'ch-geo', cat: '建模', diff: 'mid', topic: '余角补角列方程' },
  { p: 'p2024', no: 7, seg: '选择', score: 2, ch: 'ch-expr', cat: '概念', diff: 'mid', topic: '反比例关系' },
  { p: 'p2024', no: 8, seg: '选择', score: 2, ch: 'ch-op', cat: '新定义', diff: 'hard', topic: '新定义运算' },

  { p: 'p2024', no: 9, seg: '填空', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '正负数意义' },
  { p: 'p2024', no: 10, seg: '填空', score: 2, ch: 'ch-geo', cat: '概念', diff: 'easy', topic: '点线面概念' },
  { p: 'p2024', no: 11, seg: '填空', score: 2, ch: 'ch-poly', cat: '概念', diff: 'easy', topic: '单项式概念（构造）' },
  { p: 'p2024', no: 12, seg: '填空', score: 2, ch: 'ch-eq', cat: '概念', diff: 'easy', topic: '方程解求参数' },
  { p: 'p2024', no: 13, seg: '填空', score: 2, ch: 'ch-geo', cat: '计算', diff: 'mid', topic: '角的和差计算' },
  { p: 'p2024', no: 14, seg: '填空', score: 2, ch: 'ch-expr', cat: '推理', diff: 'mid', topic: '图形规律探究' },
  { p: 'p2024', no: 15, seg: '填空', score: 2, ch: 'ch-eq', cat: '建模', diff: 'mid', topic: '列方程（分配）' },
  { p: 'p2024', no: 16, seg: '填空', score: 2, ch: 'ch-rational', cat: '推理', diff: 'hard', topic: '数字填图（幻方类）' },

  { p: 'p2024', no: 17, seg: '解答', score: 19, ch: 'ch-op', cat: '计算', diff: 'easy', topic: '有理数混合运算' },
  { p: 'p2024', no: 18, seg: '解答', score: 6, ch: 'ch-poly', cat: '计算', diff: 'easy', topic: '整式化简求值' },
  { p: 'p2024', no: 19, seg: '解答', score: 6, ch: 'ch-geo', cat: '作图', diff: 'mid', topic: '尺规作图与说理' },
  { p: 'p2024', no: 20, seg: '解答', score: 12, ch: 'ch-eq', cat: '计算', diff: 'easy', topic: '解一元一次方程' },
  { p: 'p2024', no: 21, seg: '解答', score: 7, ch: 'ch-eq', cat: '建模', diff: 'mid', topic: '方程应用（表格数据）' },
  { p: 'p2024', no: 22, seg: '解答', score: 5, ch: 'ch-expr', cat: '建模', diff: 'mid', topic: '列代数式（几何建模）' },
  { p: 'p2024', no: 23, seg: '解答', score: 6, ch: 'ch-rational', cat: '分类', diff: 'hard', topic: '数轴动点与分类' },
  { p: 'p2024', no: 24, seg: '解答', score: 7, ch: 'ch-geo', cat: '分类', diff: 'top', topic: '动角（旋转）' },

  { p: 'p2024', no: 25, seg: '选做', score: 4, ch: 'ch-op', cat: '推理', diff: 'mid', topic: '进位制（综合与实践）', bonus: true },
  { p: 'p2024', no: 26, seg: '选做', score: 6, ch: 'ch-rational', cat: '新定义', diff: 'top', topic: '新定义（平衡点）', bonus: true },

  // ==================== 2025-2026 ====================
  { p: 'p2025', no: 1, seg: '选择', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '相反数' },
  { p: 'p2025', no: 2, seg: '选择', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '科学记数法' },
  { p: 'p2025', no: 3, seg: '选择', score: 2, ch: 'ch-geo', cat: '空间', diff: 'mid', topic: '面动成体' },
  { p: 'p2025', no: 4, seg: '选择', score: 2, ch: 'ch-rational', cat: '概念', diff: 'mid', topic: '数轴读符号' },
  { p: 'p2025', no: 5, seg: '选择', score: 2, ch: 'ch-poly', cat: '概念', diff: 'easy', topic: '合并同类项辨析' },
  { p: 'p2025', no: 6, seg: '选择', score: 2, ch: 'ch-expr', cat: '概念', diff: 'mid', topic: '反比例关系' },
  { p: 'p2025', no: 7, seg: '选择', score: 2, ch: 'ch-eq', cat: '建模', diff: 'mid', topic: '列方程（工程）' },
  { p: 'p2025', no: 8, seg: '选择', score: 2, ch: 'ch-rational', cat: '推理', diff: 'hard', topic: '数轴距离最值' },

  { p: 'p2025', no: 9, seg: '填空', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '近似数与精确度' },
  { p: 'p2025', no: 10, seg: '填空', score: 2, ch: 'ch-rational', cat: '概念', diff: 'easy', topic: '有理数大小比较' },
  { p: 'p2025', no: 11, seg: '填空', score: 2, ch: 'ch-poly', cat: '概念', diff: 'mid', topic: '单项式概念（构造）' },
  { p: 'p2025', no: 12, seg: '填空', score: 2, ch: 'ch-eq', cat: '概念', diff: 'easy', topic: '方程解求参数' },
  { p: 'p2025', no: 13, seg: '填空', score: 2, ch: 'ch-geo', cat: '计算', diff: 'mid', topic: '角的和差计算' },
  { p: 'p2025', no: 14, seg: '填空', score: 2, ch: 'ch-expr', cat: '推理', diff: 'mid', topic: '图形规律探究' },
  { p: 'p2025', no: 15, seg: '填空', score: 2, ch: 'ch-op', cat: '推理', diff: 'hard', topic: '进位制（综合与实践）' },
  { p: 'p2025', no: 16, seg: '填空', score: 2, ch: 'ch-rational', cat: '推理', diff: 'hard', topic: '数字填图（幻方类）' },

  { p: 'p2025', no: 17, seg: '解答', score: 20, ch: 'ch-op', cat: '计算', diff: 'easy', topic: '有理数混合运算' },
  { p: 'p2025', no: 18, seg: '解答', score: 6, ch: 'ch-poly', cat: '计算', diff: 'easy', topic: '整式化简求值' },
  { p: 'p2025', no: 19, seg: '解答', score: 12, ch: 'ch-eq', cat: '计算', diff: 'easy', topic: '解一元一次方程' },
  { p: 'p2025', no: 20, seg: '解答', score: 5, ch: 'ch-geo', cat: '作图', diff: 'mid', topic: '尺规作图与说理' },
  { p: 'p2025', no: 21, seg: '解答', score: 7, ch: 'ch-eq', cat: '建模', diff: 'mid', topic: '方程应用（配套/分配）' },
  { p: 'p2025', no: 22, seg: '解答', score: 5, ch: 'ch-op', cat: '推理', diff: 'mid', topic: '进位制（综合与实践）' },
  { p: 'p2025', no: 23, seg: '解答', score: 6, ch: 'ch-rational', cat: '分类', diff: 'hard', topic: '数轴动点与分类' },
  { p: 'p2025', no: 24, seg: '解答', score: 7, ch: 'ch-geo', cat: '分类', diff: 'top', topic: '动角（旋转）' },

  { p: 'p2025', no: 25, seg: '选做', score: 4, ch: 'ch-op', cat: '新定义', diff: 'mid', topic: '新定义运算', bonus: true },
  { p: 'p2025', no: 26, seg: '选做', score: 6, ch: 'ch-rational', cat: '新定义', diff: 'top', topic: '新定义（传送距离）', bonus: true },
];

export const CH_NAME = {
  'ch-rational': '有理数',
  'ch-op': '有理数的运算',
  'ch-expr': '代数式',
  'ch-poly': '整式的加减',
  'ch-eq': '一元一次方程',
  'ch-geo': '几何图形初步',
};

export const CH_ORDER = ['ch-rational', 'ch-op', 'ch-expr', 'ch-poly', 'ch-eq', 'ch-geo'];

export const CAT_NAME = {
  '概念': '概念辨析', '计算': '计算求解', '建模': '建模应用', '推理': '推理说理',
  '分类': '分类讨论', '作图': '作图操作', '空间': '空间想象', '新定义': '新定义迁移',
};

export const CAT_ORDER = ['计算', '概念', '建模', '推理', '分类', '作图', '空间', '新定义'];

export const DIFF_NAME = { easy: '基础', mid: '中档', hard: '较难', top: '压轴' };
export const DIFF_ORDER = ['easy', 'mid', 'hard', 'top'];
