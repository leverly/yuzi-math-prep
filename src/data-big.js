/* ==========================================================
   多小问大题 · 对齐真题第 17 题结构

   背景：审计发现站内最大单题 8 分，而真题第 17 题是
   「4 小问共 17–19 分」。这是结构差异，不是分值标注错。

   设计：用 steps 表达小问，label 写「（1）（2）（3）」，
   每小问内部再拆成若干判定步。这样：
     · 引擎无需改动（仍按 steps 顺序判定）
     · 语义清晰（学生看到的就是真题的小问结构）
     · 部分得分可算（每小问独立给分）

   这批题覆盖真题的分值结构：
     17 题（计算 4 小问，17–19 分）× 3
     20 题（解方程 2 小问，11–12 分）× 2
   ========================================================== */

export const BIG_QUESTIONS = [
  /* ========== 真题 17 题结构：有理数计算 4 小问 ========== */
  { id: 'q-big-17a', chapter: 'ch-op', method: 'm-op-order', tier: 'l1', kind: 'solve', score: 18,
    tierName: '计算 · 4 小问（真题 17 题结构）', errorTags: ['calc', 'sign'],
    stem: '计算：\n（1）$-12+(-6)-(-28)$；\n（2）$\\left(-\\dfrac{8}{5}\\right)\\div\\dfrac{15}{4}\\div(-9)$；\n（3）$\\left(-\\dfrac{3}{16}-\\dfrac{7}{24}+\\dfrac{5}{6}\\right)\\times(-48)$；\n（4）$-3^{2}+\\left(-\\dfrac{1}{8}\\right)\\times(-2)^{2}$。',
    steps: [
      { label: '（1）减法转加法', ask: '（1）原式化为？', type: 'fill',
        accept: ['-12-6+28'], answer: '-12-6+28', score: 2,
        hint: '$-(-28)=+28$。',
        why: '$-12-6+28$。' },
      { label: '（1）求值', ask: '（1）结果是？', type: 'fill',
        accept: ['10'], answer: '10', score: 2,
        hint: '$-18+28$。',
        why: '$10$。' },
      { label: '（2）除法转乘法', ask: '（2）除以 $\\dfrac{15}{4}$ 等于乘？', type: 'fill',
        accept: ['4/15'], answer: '4/15', score: 2,
        hint: '取倒数。',
        why: '乘 $\\dfrac{4}{15}$。' },
      { label: '（2）求值', ask: '（2）结果是？', type: 'fill',
        accept: ['8/135'], answer: '8/135', score: 2,
        hint: '$\\left(-\\dfrac85\\right)\\times\\dfrac{4}{15}\\div(-9)$，负负得正。',
        why: '$\\dfrac{8}{135}$。' },
      { label: '（3）用分配律', ask: '（3）中 $-\\dfrac{3}{16}\\times(-48)$ 等于？', type: 'fill',
        accept: ['9'], answer: '9', score: 2,
        hint: '$48\\div16\\times3$。',
        why: '$9$。' },
      { label: '（3）求值', ask: '（3）结果是？', type: 'fill',
        accept: ['-17'], answer: '-17', score: 2,
        hint: '$9+14-40$。',
        why: '$9+14-40=-17$。' },
      { label: '（4）算乘方', ask: '（4）中 $-3^{2}$ 与 $(-2)^{2}$ 分别是？', type: 'fill',
        accept: ['-9和4'], answer: '-9和4', score: 2,
        hint: '前者负号在外。',
        why: '$-9$ 与 $4$。' },
      { label: '（4）求值', ask: '（4）结果是？', type: 'fill',
        accept: ['-19/2', '-9.5'], answer: '-19/2', score: 2,
        hint: '$-9+\\left(-\\dfrac18\\right)\\times4$。',
        why: '$-9-\\dfrac12=-\\dfrac{19}{2}$。' },
    ],
    solution: '（1）$-12+(-6)-(-28)=-12-6+28=10$。\n（2）$\\left(-\\dfrac85\\right)\\div\\dfrac{15}{4}\\div(-9)=\\left(-\\dfrac85\\right)\\times\\dfrac{4}{15}\\times\\left(-\\dfrac19\\right)=\\dfrac{8}{135}$。\n（3）$\\left(-\\dfrac{3}{16}-\\dfrac{7}{24}+\\dfrac{5}{6}\\right)\\times(-48)=9+14-40=-17$。\n（4）$-3^{2}+\\left(-\\dfrac18\\right)\\times(-2)^{2}=-9+\\left(-\\dfrac18\\right)\\times4=-9-\\dfrac12=-\\dfrac{19}{2}$。\n【真题对应】2022-23 第 17 题（4 小问 18 分）、2024-25 第 17 题（4 小问 19 分）。\n【要点】4 小问分别考：减法转加法、除法转乘法、分配律、乘方与符号。四个考点各 2 分，任何一步错都只丢该小问的分。' },

  /* ========== 真题 20 题结构：解方程 2 小问 ========== */
  { id: 'q-big-20a', chapter: 'ch-eq', method: 'm-eq-5steps', tier: 'l1', kind: 'solve', score: 12,
    tierName: '方程 · 2 小问（真题 20 题结构）', errorTags: ['calc', 'express'],
    stem: '解下列方程：\n（1）$7x-20=2(3-3x)$；\n（2）$\\dfrac{2x-3}{5}=\\dfrac{3x-1}{2}+1$。',
    steps: [
      { label: '（1）去括号', ask: '（1）去括号后得？', type: 'fill',
        accept: ['7x-20=6-6x'], answer: '7x-20=6-6x', score: 2,
        hint: '$2\\times3=6$，$2\\times(-3x)=-6x$。',
        why: '$7x-20=6-6x$。' },
      { label: '（1）移项合并', ask: '（1）移项合并后得？', type: 'fill',
        accept: ['13x=26'], answer: '13x=26', score: 2,
        hint: '$7x+6x=6+20$。',
        why: '$13x=26$。' },
      { label: '（1）求解', ask: '（1）$x$ 等于？', type: 'fill',
        accept: ['2'], answer: '2', score: 2,
        hint: '$26\\div13$。',
        why: '$x=2$。' },
      { label: '（2）去分母', ask: '（2）两边同乘 10，得？', type: 'fill',
        accept: ['2(2x-3)=5(3x-1)+10'], answer: '2(2x-3)=5(3x-1)+10', score: 2,
        hint: '右边的 1 也要乘 10。',
        why: '$2(2x-3)=5(3x-1)+10$。' },
      { label: '（2）去括号合并', ask: '（2）去括号合并后得？', type: 'fill',
        accept: ['4x-6=15x+5'], answer: '4x-6=15x+5', score: 1,
        hint: '$5(3x-1)=15x-5$，再加 10 得 $15x+5$。',
        why: '$4x-6=15x+5$。' },
      { label: '（2）求解', ask: '（2）$x$ 等于？', type: 'fill',
        accept: ['-1'], answer: '-1', score: 1,
        hint: '$-11x=11$。',
        why: '$x=-1$。' },
    ],
    solution: '（1）$7x-20=2(3-3x)$\n去括号：$7x-20=6-6x$\n移项合并：$13x=26$\n$ x=2$。\n\n（2）$\\dfrac{2x-3}{5}=\\dfrac{3x-1}{2}+1$\n去分母（同乘 10）：$2(2x-3)=5(3x-1)+10$\n去括号：$4x-6=15x-5+10$，即 $4x-6=15x+5$\n移项：$-11x=11$，$x=-1$。\n【真题对应】2021-22 与 2022-23 第 20 题（2 小问 11 分）、2024-25 第 20 题（2 小问 12 分）。\n【要点】（1）只考去括号与移项；（2）考去分母——注意右边的常数 1 必须乘。\n这是真题里最典型的「会做但错」分布：第（1）问基本全对，第（2）问一半人丢分。' },

  /* ========== 真题 21 题结构：几何推理填空 ========== */
  { id: 'q-big-21a', chapter: 'ch-geo', method: 'm-geo-reason', tier: 'l2', kind: 'solve', score: 7,
    tierName: '几何 · 推理填空（真题 21 题结构）', errorTags: ['express', 'concept'],
    stem: '如图，$\\angle AOB=\\angle COD$，$\\angle AOC=90°$。过点 $O$ 在 $\\angle AOC$ 内部画射线 $OE$。\n（1）当 $\\angle EOD=90°$ 时，求证 $OA$ 平分 $\\angle EOB$。请补全推理：\n∵ $\\angle EOD=90°$，∴ $\\angle EOC+\\angle$ ___ $=90°$。\n∵ $\\angle AOB=\\angle COD$，∴ $\\angle EOC+\\angle$ ___ $=90°$。\n∵ $\\angle AOC=90°$，∴ $\\angle EOC+\\angle AOE=90°$。\n∴ $\\angle$ ___ $=\\angle$ ___（理由：___）。\n∴ $OA$ 平分 $\\angle EOB$。\n（2）当 $\\angle EOB=90°$ 时，直接写出哪条射线平分哪个角。',
    fig: { viewBox: [0, 0, 240, 190], alt: '角 AOC 与射线 OE', elems: [
      { t: 'seg', a: [50, 150], b: [210, 150] },
      { t: 'seg', a: [50, 150], b: [50, 40] },
      { t: 'seg', a: [50, 150], b: [180, 55], dash: true },
      { t: 'seg', a: [50, 150], b: [130, 45], dash: true },
      { t: 'pt', at: [50, 150], label: 'O', pos: 'bl' },
      { t: 'pt', at: [210, 150], label: 'C', pos: 'r' },
      { t: 'pt', at: [50, 40], label: 'A', pos: 't' },
      { t: 'pt', at: [180, 55], label: 'B', pos: 'r' },
      { t: 'pt', at: [130, 45], label: 'E', pos: 't' },
    ] },
    steps: [
      { label: '（1）拆解第一个直角', ask: '（1）第一空填哪个角？', type: 'choice',
        options: ['$\\angle COD$', '$\\angle AOB$', '$\\angle AOE$'], key: 0, score: 1,
        hint: '$\\angle EOD=\\angle EOC+\\angle COD$。',
        why: '$\\angle COD$。' },
      { label: '（1）等量代换', ask: '（1）第二空填哪个角？', type: 'choice',
        options: ['$\\angle AOB$', '$\\angle AOE$'], key: 0, score: 1,
        hint: '由 $\\angle AOB=\\angle COD$ 替换。',
        why: '$\\angle AOB$。' },
      { label: '（1）得结论', ask: '（1）$\\angle$___ $=\\angle$___ 填什么？', type: 'choice',
        options: ['$\\angle AOE=\\angle AOB$', '$\\angle AOC=\\angle EOB$'], key: 0, score: 1,
        hint: '同角的余角相等。',
        why: '$\\angle AOE=\\angle AOB$。' },
      { label: '（1）填依据', ask: '（1）括号里的理由是？', type: 'choice',
        options: ['同角的余角相等', '等量代换', '角平分线的定义'], key: 0, score: 2,
        hint: '两个角都与 $\\angle EOC$ 互余。',
        why: '同角的余角相等。' },
      { label: '（2）判断', ask: '（2）$\\angle EOB=90°$ 时，哪条射线平分哪个角？', type: 'choice',
        options: ['$OC$ 平分 $\\angle AOE$', '$OA$ 平分 $\\angle EOC$'], key: 0, score: 1,
        hint: '同理用「同角的余角相等」推。',
        why: '$OC$ 平分 $\\angle AOE$。' },
    ],
    solution: '（1）∵ $\\angle EOD=90°$，∴ $\\angle EOC+\\angle COD=90°$。\n∵ $\\angle AOB=\\angle COD$，∴ $\\angle EOC+\\angle AOB=90°$。\n∵ $\\angle AOC=90°$，∴ $\\angle EOC+\\angle AOE=90°$。\n∴ $\\angle AOE=\\angle AOB$（同角的余角相等）。\n∴ $OA$ 平分 $\\angle EOB$（角平分线的定义）。\n（2）当 $\\angle EOB=90°$ 时，$OC$ 平分 $\\angle AOE$。\n【真题对应】2021-22 第 21 题、2022-23 第 21 题、2023-24 第 21 题，均为「补全推理 + 填依据」。\n【要点】这类题的分全在「填依据」那一空——写「同角的余角相等」得 2 分，写「等量代换」不得分。\n必须分清：由「相等」推「相等」用等量代换；由「都与第三角互余」推「相等」用同角的余角相等。' },
];
