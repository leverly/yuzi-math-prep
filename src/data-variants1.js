/* ==========================================================
   方法卡三级变式 · 第一批（6 张 L1 卡）
   ==========================================================

   【为什么补这一批】
   23 张方法卡里只有 6 张有完整三级变式，其余 17 张只有孤立母题。
   后果：测不出「换个数字就错」和「能正着算不能反着求」——而这正是
   初一失分的主要形态。

   【三级口径】（与阶梯页一致）
     L1 number    改数字：同结构换数值 → 验证解法是否稳定
     L2 condition 改条件：换情境或加约束 → 验证是否理解适用条件
     L3 reverse   逆向问：给结果求条件 → 验证是否掌握结构

   【写作纪律】
     ① 每级 ≥2 步（判得出卡在哪一步）
     ② 与母题共用同一套步骤骨架（这才是变式，不是新题）
     ③ accept 与 why/solution 必须自洽
     ④ changed 字段严格取 number / condition / reverse
   ========================================================== */

export const METHOD_VARIANTS_1 = [
  /* ==================== m-op-order 有理数混合运算顺序 ==================== */
  /* 母题 lad-mix-1：-6+(-2)-(-4) */
  { id: 'v-oporder-1', variantOf: 'lad-mix-1', changed: 'number',
    chapter: 'ch-op', method: 'm-op-order', tier: 'l1', kind: 'solve', score: 4,
    tierName: '变式 · 改数字', errorTags: ['sign', 'calc'],
    stem: '计算：$-9+(-4)-(-7)$。',
    steps: [
      { label: '统一成加法', ask: '把它全部化成加法，得？', type: 'fill',
        accept: ['-9-4+7'], answer: '-9-4+7', score: 1,
        hint: '减负变加：$-(-7)=+7$。',
        why: '$-9+(-4)-(-7)=-9-4+7$。' },
      { label: '从左到右算', ask: '结果是？', type: 'fill',
        accept: ['-6'], answer: '-6', score: 1,
        hint: '$-9-4=-13$，再加 7。',
        why: '$-13+7=-6$。' },
    ],
    solution: '$-9+(-4)-(-7)=-9-4+7=-6$。' },

  { id: 'v-oporder-2', variantOf: 'lad-mix-1', changed: 'condition',
    chapter: 'ch-op', method: 'm-op-order', tier: 'l1', kind: 'solve', score: 5,
    tierName: '变式 · 改条件', errorTags: ['sign', 'calc'],
    stem: '计算：$(-3)^{2}-2\\times(-4)$。',
    steps: [
      { label: '先算乘方', ask: '$(-3)^{2}$ 等于？', type: 'fill',
        accept: ['9'], answer: '9', score: 1,
        hint: '偶次幂，负号消失。',
        why: '$9$。' },
      { label: '再算乘法', ask: '$2\\times(-4)$ 等于？', type: 'fill',
        accept: ['-8'], answer: '-8', score: 1,
        hint: '异号相乘得负。',
        why: '$-8$。' },
      { label: '相减', ask: '$9-(-8)$ 等于？', type: 'fill',
        accept: ['17'], answer: '17', score: 1,
        hint: '减负变加。',
        why: '$9+8=17$。' },
    ],
    solution: '$(-3)^{2}-2\\times(-4)=9-(-8)=9+8=17$。' },

  { id: 'v-oporder-3', variantOf: 'lad-mix-1', changed: 'reverse',
    chapter: 'ch-op', method: 'm-op-order', tier: 'l1', kind: 'solve', score: 6,
    tierName: '变式 · 逆向问', errorTags: ['method', 'calc'],
    stem: '若 $a-(-3)+2=-4$，求 $a$ 的值。',
    steps: [
      { label: '先化简左边', ask: '$a-(-3)+2$ 化简得？', type: 'fill',
        accept: ['a+5'], answer: 'a+5', score: 1,
        hint: '$-(-3)=+3$，$3+2=5$。',
        why: '$a+5$。' },
      { label: '解方程', ask: '由 $a+5=-4$ 得 $a$ 等于？', type: 'fill',
        accept: ['-9'], answer: '-9', score: 1,
        hint: '移项。',
        why: '$a=-9$。' },
    ],
    solution: '$a-(-3)+2=a+5$。由 $a+5=-4$ 得 $a=-9$。' },

  /* ==================== m-sign-rule 符号处理 ==================== */
  /* 母题 q-mf-sign-1：(-8)-(-15)+(-3) */
  { id: 'v-sign-1', variantOf: 'q-mf-sign-1', changed: 'number',
    chapter: 'ch-op', method: 'm-sign-rule', tier: 'l1', kind: 'solve', score: 4,
    tierName: '变式 · 改数字', errorTags: ['sign'],
    stem: '计算：$(-6)-(-11)+(-4)$。',
    steps: [
      { label: '减法变加法', ask: '统一成加法后得？', type: 'fill',
        accept: ['-6+11-4'], answer: '-6+11-4', score: 1,
        hint: '$-(-11)=+11$。',
        why: '$-6+11-4$。' },
      { label: '算结果', ask: '结果是？', type: 'fill',
        accept: ['1'], answer: '1', score: 1,
        hint: '$-6+11=5$，$5-4=1$。',
        why: '$1$。' },
    ],
    solution: '$(-6)-(-11)+(-4)=-6+11-4=1$。' },

  { id: 'v-sign-2', variantOf: 'q-mf-sign-1', changed: 'condition',
    chapter: 'ch-op', method: 'm-sign-rule', tier: 'l1', kind: 'solve', score: 5,
    tierName: '变式 · 改条件', errorTags: ['sign', 'concept'],
    stem: '计算：$(-2)^{3}-(-2^{3})$。',
    steps: [
      { label: '分清底数', ask: '$(-2)^{3}$ 与 $-2^{3}$ 分别是？', type: 'choice',
        options: ['都是 $-8$', '前者 $-8$，后者 $8$', '前者 $8$，后者 $-8$'], key: 0, score: 1,
        hint: '奇次幂时两者结果相同。',
        why: '都是 $-8$。' },
      { label: '相减', ask: '$(-8)-(-8)$ 等于？', type: 'fill',
        accept: ['0'], answer: '0', score: 1,
        hint: '减一个数等于加它的相反数。',
        why: '$0$。' },
    ],
    solution: '$(-2)^{3}=-8$，$-2^{3}=-(2^{3})=-8$。\n故 $(-8)-(-8)=0$。\n注意：奇次幂时 $(-a)^{n}$ 与 $-a^{n}$ 相等，偶次幂时相反。' },

  { id: 'v-sign-3', variantOf: 'q-mf-sign-1', changed: 'reverse',
    chapter: 'ch-op', method: 'm-sign-rule', tier: 'l1', kind: 'solve', score: 6,
    tierName: '变式 · 逆向问', errorTags: ['concept', 'method'],
    stem: '若 $|a|=-a$ 且 $a\\ne0$，判断 $a$ 的正负，并化简 $|a|-a$。',
    steps: [
      { label: '由条件定符号', ask: '$|a|=-a$ 且 $a\\ne0$，$a$ 是？', type: 'choice',
        options: ['正数', '负数'], key: 1, score: 1,
        hint: '非零且绝对值等于相反数。',
        why: '$a<0$，是负数。' },
      { label: '化简', ask: '$|a|-a$ 等于？', type: 'fill',
        accept: ['-2a'], answer: '-2a', score: 1,
        hint: '$|a|=-a$，故 $-a-a$。',
        why: '$-2a$。' },
    ],
    solution: '由 $|a|=-a$ 且 $a\\ne0$ 知 $a<0$。\n$|a|-a=-a-a=-2a$。' },

  /* ==================== m-remove-bracket 去括号与添括号 ==================== */
  /* 母题 q-mf-bracket-1：-(2a-3b+4) */
  { id: 'v-bracket-1', variantOf: 'q-mf-bracket-1', changed: 'number',
    chapter: 'ch-poly', method: 'm-remove-bracket', tier: 'l1', kind: 'solve', score: 4,
    tierName: '变式 · 改数字', errorTags: ['sign'],
    stem: '去括号：$-(3x-5y+2)$。',
    steps: [
      { label: '看括号前符号', ask: '括号前是什么符号？', type: 'choice',
        options: ['正号', '负号'], key: 1, score: 1,
        hint: '前面是减号（省略了 1）。',
        why: '负号。' },
      { label: '逐项变号', ask: '去括号后是？', type: 'fill',
        accept: ['-3x+5y-2'], answer: '-3x+5y-2', score: 1,
        hint: '三项都要变号。',
        why: '$-3x+5y-2$。' },
    ],
    solution: '$-(3x-5y+2)=-3x+5y-2$。' },

  { id: 'v-bracket-2', variantOf: 'q-mf-bracket-1', changed: 'condition',
    chapter: 'ch-poly', method: 'm-remove-bracket', tier: 'l1', kind: 'solve', score: 5,
    tierName: '变式 · 改条件', errorTags: ['sign', 'calc'],
    stem: '去括号并合并：$2a-3(a-2b)+4b$。',
    steps: [
      { label: '分配负系数', ask: '$-3(a-2b)$ 展开得？', type: 'fill',
        accept: ['-3a+6b'], answer: '-3a+6b', score: 1,
        hint: '$-3\\times(-2b)=+6b$。',
        why: '$-3a+6b$。' },
      { label: '合并', ask: '合并后得？', type: 'fill',
        accept: ['-a+10b'], answer: '-a+10b', score: 1,
        hint: '$2a-3a=-a$，$6b+4b=10b$。',
        why: '$-a+10b$。' },
    ],
    solution: '$2a-3(a-2b)+4b=2a-3a+6b+4b=-a+10b$。' },

  { id: 'v-bracket-3', variantOf: 'q-mf-bracket-1', changed: 'reverse',
    chapter: 'ch-poly', method: 'm-remove-bracket', tier: 'l1', kind: 'solve', score: 6,
    tierName: '变式 · 逆向问', errorTags: ['method', 'concept'],
    stem: '若 $-(\\square-3x+2)=-5x+3x-2$，求 $\\square$ 代表的式子。',
    steps: [
      { label: '去括号', ask: '左边去括号后得？', type: 'fill',
        accept: ['-□+3x-2'], answer: '-□+3x-2', score: 1,
        hint: '负号让括号内每项变号。',
        why: '$-\\square+3x-2$。' },
      { label: '对比系数', ask: '对比右边 $-5x+3x-2$，$\\square$ 等于？', type: 'fill',
        accept: ['5x'], answer: '5x', score: 1,
        hint: '$-\\square$ 对应 $-5x$。',
        why: '$\\square=5x$。' },
    ],
    solution: '左边 $=-(\\square-3x+2)=-\\square+3x-2$。\n与 $-5x+3x-2$ 对比，$-\\square=-5x$，故 $\\square=5x$。' },

  /* ==================== m-like-terms 合并同类项 ==================== */
  /* 母题 q-gap-mono-1：构造单项式（系数负、次数 5） */
  { id: 'v-like-1', variantOf: 'q-gap-mono-1', changed: 'number',
    chapter: 'ch-poly', method: 'm-like-terms', tier: 'l1', kind: 'solve', score: 4,
    tierName: '变式 · 改数字', errorTags: ['calc'],
    stem: '合并同类项：$4x^{2}y-6x^{2}y+2x^{2}y$。',
    steps: [
      { label: '确认同类项', ask: '三项是同类项吗？', type: 'choice',
        options: ['是，字母与指数都相同', '不是'], key: 0, score: 1,
        hint: '都是 $x^{2}y$。',
        why: '是同类项。' },
      { label: '系数相加减', ask: '$4-6+2$ 等于？', type: 'fill',
        accept: ['0'], answer: '0', score: 1,
        hint: '—',
        why: '$0$。' },
      { label: '写结果', ask: '结果是？', type: 'fill',
        accept: ['0'], answer: '0', score: 1,
        hint: '系数为 0 时整项为 0。',
        why: '$0$。' },
    ],
    solution: '$4x^{2}y-6x^{2}y+2x^{2}y=(4-6+2)x^{2}y=0$。' },

  { id: 'v-like-2', variantOf: 'q-gap-mono-1', changed: 'condition',
    chapter: 'ch-poly', method: 'm-like-terms', tier: 'l1', kind: 'solve', score: 5,
    tierName: '变式 · 改条件', errorTags: ['concept', 'calc'],
    stem: '若 $3x^{a}y^{2}$ 与 $-5x^{3}y^{b}$ 是同类项，求 $a+b$。',
    steps: [
      { label: '用同类项条件', ask: '$x$ 的指数应相同，$a$ 等于？', type: 'fill',
        accept: ['3'], answer: '3', score: 1,
        hint: '对比 $x^{3}$。',
        why: '$a=3$。' },
      { label: '求 b', ask: '$y$ 的指数应相同，$b$ 等于？', type: 'fill',
        accept: ['2'], answer: '2', score: 1,
        hint: '对比 $y^{2}$。',
        why: '$b=2$。' },
      { label: '求和', ask: '$a+b$ 等于？', type: 'fill',
        accept: ['5'], answer: '5', score: 1,
        hint: '$3+2$。',
        why: '$5$。' },
    ],
    solution: '同类项要求字母相同且对应指数相同，故 $a=3$，$b=2$，$a+b=5$。' },

  { id: 'v-like-3', variantOf: 'q-gap-mono-1', changed: 'reverse',
    chapter: 'ch-poly', method: 'm-like-terms', tier: 'l1', kind: 'solve', score: 6,
    tierName: '变式 · 逆向问', errorTags: ['method', 'concept'],
    stem: '写出一个单项式，满足：①系数是 $-\\dfrac{1}{2}$；②只含字母 $m$、$n$；③次数是 4。',
    steps: [
      { label: '定次数分配', ask: '次数 4 意味着 $m$、$n$ 的指数之和为？', type: 'fill',
        accept: ['4'], answer: '4', score: 1,
        hint: '所有字母指数之和等于次数。',
        why: '$4$。' },
      { label: '写出一例', ask: '写一个符合条件的（如 $m^{2}n^{2}$ 型），系数 $-\\dfrac12$ 加上后是？', type: 'fill',
        accept: ['-1/2m^{2}n^{2}', '-1/2m^2n^2', '-m^{2}n^{2}/2'], answer: '-1/2m^{2}n^{2}', score: 1,
        hint: '指数分配有多种，只要和为 4。',
        why: '$-\\dfrac12m^{2}n^{2}$（答案不唯一）。' },
    ],
    solution: '次数 4 即 $m$、$n$ 指数之和为 4。例如 $-\\dfrac12m^{2}n^{2}$ 或 $-\\dfrac12mn^{3}$ 都符合。\n（答案不唯一，关键检查三条：系数、字母、次数。）' },

  /* ==================== m-eq-5steps 解一元一次方程五步 ==================== */
  /* 母题 q-eq-bal-4 */
  { id: 'v-eq5-1', variantOf: 'q-eq-bal-4', changed: 'number',
    chapter: 'ch-eq', method: 'm-eq-5steps', tier: 'l1', kind: 'solve', score: 4,
    tierName: '变式 · 改数字', errorTags: ['sign'],
    stem: '解方程：$5x-8=3x+6$。',
    steps: [
      { label: '移项', ask: '移项后得？', type: 'fill',
        accept: ['5x-3x=6+8'], answer: '5x-3x=6+8', score: 1,
        hint: '移项要变号。',
        why: '$5x-3x=6+8$。' },
      { label: '合并', ask: '合并后得？', type: 'fill',
        accept: ['2x=14'], answer: '2x=14', score: 1,
        hint: '—',
        why: '$2x=14$。' },
      { label: '系数化 1', ask: '$x$ 等于？', type: 'fill',
        accept: ['7'], answer: '7', score: 1,
        hint: '两边除以 2。',
        why: '$x=7$。' },
    ],
    solution: '$5x-8=3x+6$，移项得 $5x-3x=6+8$，即 $2x=14$，故 $x=7$。' },

  { id: 'v-eq5-2', variantOf: 'q-eq-bal-4', changed: 'condition',
    chapter: 'ch-eq', method: 'm-eq-5steps', tier: 'l1', kind: 'solve', score: 6,
    tierName: '变式 · 改条件', errorTags: ['calc', 'express'],
    stem: '解方程：$\\dfrac{2x-1}{3}-\\dfrac{x+1}{4}=1$。',
    steps: [
      { label: '去分母', ask: '两边同乘 12，得？', type: 'fill',
        accept: ['4(2x-1)-3(x+1)=12'], answer: '4(2x-1)-3(x+1)=12', score: 1,
        hint: '右边的 1 也要乘 12。',
        why: '$4(2x-1)-3(x+1)=12$。' },
      { label: '去括号', ask: '去括号后得？', type: 'fill',
        accept: ['8x-4-3x-3=12'], answer: '8x-4-3x-3=12', score: 1,
        hint: '$-3\\times1=-3$。',
        why: '$8x-4-3x-3=12$。' },
      { label: '合并求解', ask: '$x$ 等于？', type: 'fill',
        accept: ['19/5', '3.8'], answer: '19/5', score: 1,
        hint: '$5x-7=12$，$5x=19$。',
        why: '$x=\\dfrac{19}{5}$。' },
    ],
    solution: '去分母：$4(2x-1)-3(x+1)=12$\n去括号：$8x-4-3x-3=12$\n合并：$5x-7=12$，$5x=19$，故 $x=\\dfrac{19}{5}$。' },

  { id: 'v-eq5-3', variantOf: 'q-eq-bal-4', changed: 'reverse',
    chapter: 'ch-eq', method: 'm-eq-5steps', tier: 'l1', kind: 'solve', score: 6,
    tierName: '变式 · 逆向问', errorTags: ['method', 'concept'],
    stem: '若方程 $3x+a=2x-5$ 的解是 $x=-2$，求 $a$ 的值。',
    steps: [
      { label: '代入', ask: '把 $x=-2$ 代入得？', type: 'fill',
        accept: ['-6+a=-4-5', '-6+a=-9'], answer: '-6+a=-9', score: 1,
        hint: '$3\\times(-2)=-6$，$2\\times(-2)=-4$。',
        why: '$-6+a=-9$。' },
      { label: '解出 a', ask: '$a$ 等于？', type: 'fill',
        accept: ['-3'], answer: '-3', score: 1,
        hint: '移项。',
        why: '$a=-3$。' },
    ],
    solution: '把 $x=-2$ 代入：$3\\times(-2)+a=2\\times(-2)-5$，即 $-6+a=-9$，故 $a=-3$。' },

  /* ==================== m-simplify-eval 化简求值 ==================== */
  /* 母题 lad-simp-1：3x+2x-5 */
  { id: 'v-simpeval-1', variantOf: 'lad-simp-1', changed: 'number',
    chapter: 'ch-poly', method: 'm-simplify-eval', tier: 'l1', kind: 'solve', score: 4,
    tierName: '变式 · 改数字', errorTags: ['calc'],
    stem: '化简：$7a-3a+4$。',
    steps: [
      { label: '合并同类项', ask: '$7a-3a$ 等于？', type: 'fill',
        accept: ['4a'], answer: '4a', score: 1,
        hint: '系数相减。',
        why: '$4a$。' },
      { label: '写结果', ask: '化简结果是？', type: 'fill',
        accept: ['4a+4'], answer: '4a+4', score: 1,
        hint: '—',
        why: '$4a+4$。' },
    ],
    solution: '$7a-3a+4=4a+4$。' },

  { id: 'v-simpeval-2', variantOf: 'lad-simp-1', changed: 'condition',
    chapter: 'ch-poly', method: 'm-simplify-eval', tier: 'l1', kind: 'solve', score: 5,
    tierName: '变式 · 改条件', errorTags: ['sign', 'calc'],
    stem: '先化简，再求值：$3(2x-1)-2(x-4)$，其中 $x=2$。',
    steps: [
      { label: '去括号', ask: '展开后得？', type: 'fill',
        accept: ['6x-3-2x+8'], answer: '6x-3-2x+8', score: 1,
        hint: '$-2\\times(-4)=+8$。',
        why: '$6x-3-2x+8$。' },
      { label: '合并', ask: '化简结果是？', type: 'fill',
        accept: ['4x+5'], answer: '4x+5', score: 1,
        hint: '$6x-2x=4x$，$-3+8=5$。',
        why: '$4x+5$。' },
      { label: '代入', ask: '当 $x=2$ 时，值是？', type: 'fill',
        accept: ['13'], answer: '13', score: 1,
        hint: '$8+5$。',
        why: '$13$。' },
    ],
    solution: '原式 $=6x-3-2x+8=4x+5$。\n当 $x=2$ 时：$8+5=13$。' },

  { id: 'v-simpeval-3', variantOf: 'lad-simp-1', changed: 'reverse',
    chapter: 'ch-poly', method: 'm-simplify-eval', tier: 'l1', kind: 'solve', score: 6,
    tierName: '变式 · 逆向问', errorTags: ['method'],
    stem: '若 $2x+3x-5$ 的值为 $15$，求 $x$ 的值。',
    steps: [
      { label: '先化简', ask: '$2x+3x-5$ 化简得？', type: 'fill',
        accept: ['5x-5'], answer: '5x-5', score: 1,
        hint: '合并同类项。',
        why: '$5x-5$。' },
      { label: '解方程', ask: '由 $5x-5=15$ 得 $x$ 等于？', type: 'fill',
        accept: ['4'], answer: '4', score: 1,
        hint: '$5x=20$。',
        why: '$x=4$。' },
    ],
    solution: '$2x+3x-5=5x-5$。由 $5x-5=15$ 得 $5x=20$，$x=4$。' },
];
