// 错题回流逻辑测试：直接跑 diagnose()，验证 wrongList 产出正确
// diagnose 是纯函数（只依赖 BANK/FAM_META/ERR_FIX），可脱离 DOM 测试
import { readFileSync } from 'node:fs';
import { BANK, FAM_META } from '../practice-data.mjs';

const src = readFileSync(new URL('../practice-src.js', import.meta.url), 'utf8');

// 抽出 diagnose 所需的纯逻辑片段（不碰 DOM）
const start = src.indexOf('const TIER_RULE');
const end = src.indexOf('/* ============ 判分 ============ */');
const logic = src.slice(start, end);

// 提供依赖后执行
const factory = new Function('BANK', 'FAM_META', logic + '\nreturn { diagnose, parseErrTag };');
const { diagnose } = factory(BANK, FAM_META);

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => {
  if (c) { console.log('  ✓ ' + label); pass++; }
  else { console.log('  ✗ ' + label + (detail ? '  → ' + detail : '')); fail++; }
};

// 造一组记录：3 题对、3 题错，错题分布在两个族
const q1 = BANK.find((q) => q.fam === 'f-arith');
const q2 = BANK.find((q) => q.fam === 'f-solveeq');
const q3 = BANK.find((q) => q.fam === 'f-arith' && q.id !== q1.id);
const q4 = BANK.find((q) => q.fam === 'f-abs-line');

// 找出每题的一个错误选项
const wrongPick = (q) => (q.options || []).findIndex((o, i) => i !== q.key);
const rightPick = (q) => q.key;

const records = [
  { id: q1.id, ok: false, picked: wrongPick(q1) },
  { id: q2.id, ok: false, picked: wrongPick(q2) },
  { id: q3.id, ok: false, picked: wrongPick(q3) },
  { id: q4.id, ok: true, picked: rightPick(q4) },
];

const d = diagnose(records);

ok(Array.isArray(d.wrongList), 'diagnose 返回 wrongList 数组');
ok(d.wrongList.length === 3, `错题数 = 3（实际 ${d.wrongList.length}）`);
ok(d.wrongList.every((w) => w.id && w.stem), '每条错题都有 id 与题干');
ok(d.wrongList.every((w) => w.fam && w.famName), '每条错题都带族信息');
ok(d.wrongList.every((w) => typeof w.avg === 'number'), '每条错题都带族年均分（用于排序）');

// 排序：年均分降序
const avgs = d.wrongList.map((w) => w.avg);
ok(avgs.every((v, i) => i === 0 || avgs[i - 1] >= v), '错题按族年均分降序', avgs.join(','));
ok(avgs[0] > 0, '排序权重非零（f-arith 年均 18.4）', String(avgs[0]));

// 正确题不应进错题清单
ok(!d.wrongList.some((w) => w.id === q4.id), '做对的题不进错题清单');

// 全对时 wrongList 应为空
const d2 = diagnose([{ id: q4.id, ok: true, picked: rightPick(q4) }]);
ok(d2.wrongList.length === 0, '全对时错题清单为空');

// 空记录不崩
const d3 = diagnose([]);
ok(Array.isArray(d3.wrongList) && d3.wrongList.length === 0, '空记录时错题清单为空且不报错');

// 产物里应有重做入口与错题样式
const html = readFileSync(new URL('../practice.html', import.meta.url), 'utf8');
ok(html.includes('function renderWrong'), '产物含 renderWrong');
ok(html.includes('function bindRedo'), '产物含 bindRedo');
ok(html.includes('redoBtn'), '产物含 redoBtn');
ok(html.includes('同一道题第二次做是否还错'), '产物含验收标准文案');
ok(/\.wrong-row\{/.test(html), '产物含错题行样式');

console.log(`\n${fail === 0 ? '=== 全部通过 ===' : `=== ${fail} 项失败 ===`}  (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
