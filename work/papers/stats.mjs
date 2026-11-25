// 统计派生层：所有分析数字都从这里算，页面与报告不写常量
import { LEDGER, PAPERS_META, CH_ORDER, CH_NAME, CAT_ORDER, CAT_NAME, DIFF_ORDER, DIFF_NAME } from './ledger.mjs';

const sum = (a) => a.reduce((x, y) => x + y, 0);

/* ============ 逐卷统计 ============ */
export const PAPER_STATS = PAPERS_META.map((meta) => {
  const qs = LEDGER.filter((q) => q.p === meta.id);
  const main = qs.filter((q) => !q.bonus);
  const bonus = qs.filter((q) => q.bonus);

  const ch = {}, chN = {}, cat = {}, catN = {}, diff = {}, diffN = {}, seg = {};
  for (const q of main) {
    ch[q.ch] = (ch[q.ch] || 0) + q.score;
    chN[q.ch] = (chN[q.ch] || 0) + 1;
    cat[q.cat] = (cat[q.cat] || 0) + q.score;
    catN[q.cat] = (catN[q.cat] || 0) + 1;
    diff[q.diff] = (diff[q.diff] || 0) + q.score;
    diffN[q.diff] = (diffN[q.diff] || 0) + 1;
    seg[q.seg] = (seg[q.seg] || 0) + q.score;
  }
  const bonusCat = {};
  for (const q of bonus) bonusCat[q.cat] = (bonusCat[q.cat] || 0) + q.score;

  // 难度指数：基础1 中档2 较难3 压轴4，按分值加权，再归一到 100 分
  const W = { easy: 1, mid: 2, hard: 3, top: 4 };
  const diffIndex = +(sum(main.map((q) => W[q.diff] * q.score)) / 100).toFixed(2);

  return {
    ...meta,
    qCount: qs.length,
    mainCount: main.length,
    bonusCount: bonus.length,
    mainTotal: sum(main.map((q) => q.score)),
    bonusTotal: sum(bonus.map((q) => q.score)),
    ch, chN, cat, catN, diff, diffN, seg, bonusCat, diffIndex,
    avgScore: +(sum(main.map((q) => q.score)) / main.length).toFixed(2),
  };
});

export const YEARS = PAPER_STATS.map((s) => s.label);

/* ============ 章节：跨年汇总 ============ */
export const CH_SCORE = {};
for (const k of CH_ORDER) {
  const per = PAPER_STATS.map((s) => s.ch[k] || 0);
  const perN = PAPER_STATS.map((s) => s.chN[k] || 0);
  const total = sum(per);
  CH_SCORE[k] = {
    id: k, name: CH_NAME[k], per, perN, total,
    avg: +(total / PAPER_STATS.length).toFixed(1),
    min: Math.min(...per), max: Math.max(...per),
    range: Math.max(...per) - Math.min(...per),
    pct: Math.round((total / (PAPER_STATS.length * 100)) * 100),
  };
}

/* ============ 能力：跨年汇总 ============ */
export const CAT_SCORE = {};
for (const k of CAT_ORDER) {
  const per = PAPER_STATS.map((s) => s.cat[k] || 0);
  const perN = PAPER_STATS.map((s) => s.catN[k] || 0);
  const total = sum(per);
  CAT_SCORE[k] = {
    id: k, name: CAT_NAME[k], per, perN, total,
    avg: +(total / PAPER_STATS.length).toFixed(1),
    min: Math.min(...per), max: Math.max(...per),
    range: Math.max(...per) - Math.min(...per),
    pct: Math.round((total / (PAPER_STATS.length * 100)) * 100),
  };
}

/* ============ 难度：跨年汇总 ============ */
export const DIFF_SCORE = {};
export const DIFF_COUNT = {};
for (const k of DIFF_ORDER) {
  const per = PAPER_STATS.map((s) => s.diff[k] || 0);
  const perN = PAPER_STATS.map((s) => s.diffN[k] || 0);
  const total = sum(per);
  DIFF_SCORE[k] = {
    id: k, name: DIFF_NAME[k], per, total,
    avg: +(total / PAPER_STATS.length).toFixed(1),
    pct: Math.round((total / (PAPER_STATS.length * 100)) * 100),
  };
  DIFF_COUNT[k] = { per: perN, total: sum(perN), avg: +(sum(perN) / PAPER_STATS.length).toFixed(1) };
}

/* ============ 考点（逐题 topic 归并） ============ */
export const TOPIC_MAP = (() => {
  const m = new Map();
  for (const q of LEDGER) {
    const key = q.topic;
    if (!m.has(key)) {
      m.set(key, { topic: key, ch: q.ch, cat: q.cat, years: new Set(), score: 0, count: 0, bonusOnly: true, slots: [] });
    }
    const t = m.get(key);
    t.years.add(q.p);
    t.score += q.score;
    t.count += 1;
    if (!q.bonus) t.bonusOnly = false;
    t.slots.push({ p: q.p, no: q.no, score: q.score, diff: q.diff, seg: q.seg, bonus: !!q.bonus });
  }
  return [...m.values()].map((t) => ({
    ...t,
    years: [...t.years],
    hitYears: t.years.size,
    avgPerYear: +(t.score / PAPERS_META.length).toFixed(1),
  })).sort((a, b) => b.score - a.score || b.hitYears - a.hitYears);
})();

/* ============ 考点族：按「考法」归并，不按题干长相 ============ */
// 判据：同一族 = 同一考法/同一题位，载体可换
export const FAMILY_DEFS = [
  {
    id: 'f-abs-line', name: '绝对值与数轴', ch: 'ch-rational', cat: '概念',
    topics: ['绝对值', '相反数', '数轴读符号', '数轴与相反数', '有理数大小比较', '正负数意义', '近似数与精确度', '绝对值非负性', '数轴距离最值'],
    note: '选择/填空前段，每年 3–4 题，考绝对值、相反数、数轴判符号',
  },
  {
    id: 'f-scinote', name: '科学记数法与近似数', ch: 'ch-rational', cat: '概念',
    topics: ['科学记数法'],
    note: '每年选择第 2 题固定位置，2 分',
  },
  {
    id: 'f-arith', name: '有理数四则混合运算', ch: 'ch-op', cat: '计算',
    topics: ['有理数混合运算'],
    note: '第 17 题，17–20 分，全卷单题最高分值，纯计算',
  },
  {
    id: 'f-fillnum', name: '数字填图 / 幻方', ch: 'ch-rational', cat: '推理',
    topics: ['数字填图（幻方类）'],
    note: '填空最后一题（16 题），每年必考，考整体代换与方程思想',
  },
  {
    id: 'f-poly', name: '整式加减辨析', ch: 'ch-poly', cat: '概念',
    topics: ['合并同类项辨析', '同类项概念', '单项式概念（构造）', '整式加减（图形边长）'],
    note: '选择 1 题 + 填空 1 题，考概念辨析与构造',
  },
  {
    id: 'f-simplify', name: '整式化简求值', ch: 'ch-poly', cat: '计算',
    topics: ['整式化简求值'],
    note: '第 18 题固定位置，6 分，去括号+合并同类项+代值',
  },
  {
    id: 'f-exprval', name: '代数式求值（整体代入）', ch: 'ch-expr', cat: '计算',
    topics: ['代数式求值'],
    note: '填空位，考整体代入而非逐项展开',
  },
  {
    id: 'f-pattern', name: '图形规律（用含 n 式子表示）', ch: 'ch-expr', cat: '推理',
    topics: ['图形规律探究'],
    note: '选择或填空，考从具体到一般的归纳',
  },
  {
    id: 'f-exprmodel', name: '列代数式建模', ch: 'ch-expr', cat: '建模',
    topics: ['列代数式', '反比例关系', '列代数式（几何建模）'],
    note: '填空/选择位，考用字母表示量与判断关系',
  },
  {
    id: 'f-basicnum', name: '进位制 / 综合与实践', ch: 'ch-op', cat: '推理',
    topics: ['进位制（综合与实践）'],
    note: '2024-25 起出现，给换算规则→照做→逆向，属新情境',
  },
  {
    id: 'f-eqconcept', name: '方程概念辨析', ch: 'ch-eq', cat: '概念',
    topics: ['方程变形与等式性质', '方程解求参数'],
    note: '选择 1 题 + 填空 1 题，考等式性质与解的定义',
  },
  {
    id: 'f-solveeq', name: '解一元一次方程', ch: 'ch-eq', cat: '计算',
    topics: ['解一元一次方程'],
    note: '第 20 题位，11–12 分，去分母/去括号/移项全流程',
  },
  {
    id: 'f-eqmodel', name: '方程应用题', ch: 'ch-eq', cat: '建模',
    topics: ['方程应用（配套/分配）', '方程应用（工程）', '方程应用（表格数据）', '列方程（分配）', '列方程（工程）'],
    note: '解答题中段，5–8 分，从文字/表格建等量关系',
  },
  {
    id: 'f-space', name: '展开图 / 三视图 / 面动成体', ch: 'ch-geo', cat: '空间',
    topics: ['展开图识别', '三视图', '面动成体', '点线面概念'],
    note: '选择前段固定 1 题，考空间想象',
  },
  {
    id: 'f-angleconv', name: '角度换算（度分秒）', ch: 'ch-geo', cat: '计算',
    topics: ['角度换算（度分秒）'],
    note: '填空前段，60 进制换算是固定失分点',
  },
  {
    id: 'f-segmid', name: '线段中点', ch: 'ch-geo', cat: '计算',
    topics: ['线段中点计算'],
    note: '填空位，考中点定义与线段和差',
  },
  {
    id: 'f-anglesum', name: '角的和差', ch: 'ch-geo', cat: '计算',
    topics: ['角的和差计算'],
    note: '填空位，纯角度加减',
  },
  {
    id: 'f-construct', name: '尺规作图与说理', ch: 'ch-geo', cat: '作图',
    topics: ['尺规作图与说理'],
    note: '第 19 题固定位置，6 分，作图+依据说理',
  },
  {
    id: 'f-anglereason', name: '角度推理填空（几何说理）', ch: 'ch-geo', cat: '推理',
    topics: ['角度推理与说理'],
    note: '解答题，6–7 分，补全推理过程并填依据',
  },
  {
    id: 'f-compangle', name: '余角 / 补角列方程', ch: 'ch-geo', cat: '建模',
    topics: ['余角补角列方程'],
    note: '选择位，余补角定义转方程',
  },
  {
    id: 'f-final', name: '分类压轴（第23题位）', ch: 'ch-rational', cat: '分类',
    topics: ['数轴动点与分类', '动角（旋转）', '线段中点压轴（含参）'],
    note: '第 23 题固定题位，6–7 分；五套全是「分类」能力，载体每年换（数轴动点/动角/线段中点）',
  },
  {
    id: 'f-newdef', name: '新定义（选做 / 24 题位）', ch: 'ch-rational', cat: '新定义',
    topics: ['新定义（数轴类）', '新定义（运算类）', '新定义运算', '新定义（变速点）', '新定义（平衡点）', '新定义（传送距离）', '新定义（角·特征值）'],
    note: '压轴或选做，给新规则→判断性质→迁移，是拉分主战场',
  },
  {
    id: 'f-read', name: '阅读理解 / 规律探究', ch: 'ch-op', cat: '推理',
    topics: ['阅读理解型', '规律探究（迭代运算）'],
    note: '解答或选做位，读材料→补表→说理',
  },
  {
    id: 'f-trisquare', name: '三角尺拼角', ch: 'ch-geo', cat: '作图',
    topics: ['三角尺拼角'],
    note: '选做位，用一副三角尺构造特殊角',
  },
];

// 归族并校验：每个 topic 必须恰好属一族
const TOPIC_TO_FAMILY = new Map();
for (const f of FAMILY_DEFS) {
  for (const t of f.topics) {
    if (TOPIC_TO_FAMILY.has(t)) throw new Error(`考点重复归族: ${t}`);
    TOPIC_TO_FAMILY.set(t, f.id);
  }
}
const orphan = TOPIC_MAP.filter((t) => !TOPIC_TO_FAMILY.has(t.topic));
if (orphan.length) throw new Error(`以下考点未归入任何族: ${orphan.map((t) => t.topic).join(', ')}`);

export const FAMILY_MAP = FAMILY_DEFS.map((f) => {
  const qs = LEDGER.filter((q) => TOPIC_TO_FAMILY.get(q.topic) === f.id);
  const main = qs.filter((q) => !q.bonus);
  const perYear = {};
  for (const m of PAPERS_META) {
    perYear[m.label] = sum(main.filter((q) => q.p === m.id).map((q) => q.score));
  }
  const yearsHit = new Set(main.map((q) => q.p));
  const bonusYears = new Set(qs.filter((q) => q.bonus).map((q) => q.p));
  const total = sum(main.map((q) => q.score));
  return {
    ...f,
    topicsInData: [...new Set(qs.map((q) => q.topic))],
    count: qs.length,
    mainCount: main.length,
    bonusCount: qs.length - main.length,
    perYear,
    scores: Object.values(perYear),
    total,
    avgPerYear: +(total / PAPERS_META.length).toFixed(1),
    hitYears: yearsHit.size,
    bonusYears: [...bonusYears],
    diffMix: DIFF_ORDER.reduce((a, d) => { const v = sum(main.filter((q) => q.diff === d).map((q) => q.score)); if (v) a[d] = v; return a; }, {}),
    slots: qs.map((q) => ({ p: q.p, no: q.no, score: q.score, seg: q.seg, diff: q.diff, bonus: !!q.bonus })),
  };
}).sort((a, b) => b.total - a.total);

/* ============ 频次三档（随样本重算，不沿用旧结论） ============ */
export const N_PAPERS = PAPERS_META.length;
export const FREQ = {
  must: FAMILY_MAP.filter((f) => f.hitYears === N_PAPERS),
  often: FAMILY_MAP.filter((f) => f.hitYears === N_PAPERS - 1),
  rare: FAMILY_MAP.filter((f) => f.hitYears <= N_PAPERS - 2),
};
export const MAIN_GRAND = sum(PAPER_STATS.map((s) => s.mainTotal));
export const FREQ_SUMMARY = {
  must: { n: FREQ.must.length, score: sum(FREQ.must.map((f) => f.total)), pct: Math.round(sum(FREQ.must.map((f) => f.total)) / MAIN_GRAND * 100) },
  often: { n: FREQ.often.length, score: sum(FREQ.often.map((f) => f.total)), pct: Math.round(sum(FREQ.often.map((f) => f.total)) / MAIN_GRAND * 100) },
  rare: { n: FREQ.rare.length, score: sum(FREQ.rare.map((f) => f.total)), pct: Math.round(sum(FREQ.rare.map((f) => f.total)) / MAIN_GRAND * 100) },
};

/* ============ 题位骨架：每年第 N 题考什么 ============ */
export const SLOT_MATRIX = (() => {
  const rows = [];
  for (let no = 1; no <= 26; no++) {
    const cells = PAPERS_META.map((m) => {
      const q = LEDGER.find((x) => x.p === m.id && x.no === no);
      return q ? { p: m.id, topic: q.topic, ch: q.ch, cat: q.cat, diff: q.diff, score: q.score, bonus: !!q.bonus, fam: TOPIC_TO_FAMILY.get(q.topic) } : null;
    });
    const fams = cells.filter(Boolean).map((c) => c.fam);
    const famCount = {};
    for (const f of fams) famCount[f] = (famCount[f] || 0) + 1;
    const topFam = Object.entries(famCount).sort((a, b) => b[1] - a[1])[0];
    const scores = cells.filter(Boolean).map((c) => c.score);
    rows.push({
      no, cells,
      stableFam: topFam && topFam[1] >= 4 ? topFam[0] : null,
      stableN: topFam ? topFam[1] : 0,
      scoreMin: Math.min(...scores), scoreMax: Math.max(...scores),
      isBonus: cells.every((c) => c && c.bonus),
    });
  }
  return rows;
})();

/* ============ 稳定 vs 漂移 ============ */
const range = (a) => Math.max(...a) - Math.min(...a);
export const STRUCTURE = [
  { k: '题量', v: `${PAPER_STATS[0].qCount} 题`, same: PAPER_STATS.every((s) => s.qCount === PAPER_STATS[0].qCount) },
  { k: '必做满分', v: `${PAPER_STATS[0].mainTotal} 分`, same: PAPER_STATS.every((s) => s.mainTotal === 100) },
  { k: '选做满分', v: `${PAPER_STATS[0].bonusTotal} 分`, same: PAPER_STATS.every((s) => s.bonusTotal === 10) },
  { k: '选择 / 填空 / 解答', v: '16 / 16 / 68', same: PAPER_STATS.every((s) => s.seg['选择'] === 16 && s.seg['填空'] === 16 && s.seg['解答'] === 68) },
  { k: '考试时长', v: '100 分钟', same: true },
];

export const CH_STABILITY = CH_ORDER.map((k) => ({
  k, name: CH_NAME[k], per: CH_SCORE[k].per, r: range(CH_SCORE[k].per),
  mean: CH_SCORE[k].avg, maxDev: Math.max(...CH_SCORE[k].per.map((v) => Math.abs(v - CH_SCORE[k].avg))),
})).sort((a, b) => b.r - a.r);

export const CAT_STABILITY = CAT_ORDER.map((k) => ({
  k, name: CAT_NAME[k], per: CAT_SCORE[k].per, r: range(CAT_SCORE[k].per),
  mean: CAT_SCORE[k].avg,
})).sort((a, b) => b.r - a.r);

export const DIFF_STABILITY = DIFF_ORDER.map((k) => ({
  k, name: DIFF_NAME[k], per: DIFF_SCORE[k].per, r: range(DIFF_SCORE[k].per), mean: DIFF_SCORE[k].avg,
}));

/* ============ 交叉验证：逐年独立算 vs 汇总，偏差超阈值即报错 ============ */
export const CROSS_CHECK = CH_ORDER.map((k) => {
  const yearlyPct = PAPER_STATS.map((s) => Math.round(((s.ch[k] || 0) / s.mainTotal) * 100));
  const agg = CH_SCORE[k].pct;
  const maxDev = Math.max(...yearlyPct.map((v) => Math.abs(v - agg)));
  return { k, name: CH_NAME[k], yearlyPct, agg, maxDev, ok: maxDev <= 6 };
});

/* ============ 高分板块：满分必须全拿的部分 ============ */
// 「基础分」= easy + mid 的分值；「硬骨头」= hard + top
export const SCORE_TIERS = PAPER_STATS.map((s) => ({
  label: s.label,
  base: (s.diff.easy || 0) + (s.diff.mid || 0),
  hard: (s.diff.hard || 0) + (s.diff.top || 0),
}));
