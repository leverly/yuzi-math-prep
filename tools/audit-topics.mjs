/* ==========================================================
   真题对标审计报告
   用法：node tools/audit-topics.mjs

   回答一个问题：站内内容是否真的对标了真题？
   输出四个维度：
     ① 知识点覆盖（真题 41 个知识点，站内各有几题）
     ② 方法卡覆盖（23 张卡是否都有题）
     ③ 难度匹配（站内分层 vs 真题四档）
     ④ 模考同构（按真题槽位能否组卷）
   ========================================================== */
import * as m from '../src/index.js';

const KEYS = {
  '有理数混合运算':['四则','混合运算','计算：'],'解一元一次方程':['解方程','去分母'],
  '整式化简求值':['化简','求值'],'方程应用（配套/分配）':['配套','分配','工程','行程','销售','打折','利润'],
  '角度推理与说理':['角平分线','余角','说理','推理'],'数轴动点与分类':['动点'],
  '尺规作图与说理':['作图','尺规'],'数轴读符号':['数轴'],
  '动射线（含参）':['动射线','旋转'],'新定义（数轴类）':['新定义','平衡点','星点','倍分'],
  '方程应用（表格数据）':['表格'],'动角（旋转）':['旋转','三角尺'],
  '绝对值':['绝对值'],'科学记数法':['科学记数法'],'合并同类项辨析':['同类项','合并'],
  '方程解求参数':['方程的解','解求参','是方程'],'数字填图（幻方类）':['幻圆','填图','幻方','顶点'],
  '方位角与作图':['方位角','北偏东','南偏东'],'阅读理解型':['阅读材料','阅读理解'],
  '几何建模':['赛道','建模','篱笆'],'角度换算（度分秒）':['度分秒'],
  '近似数与精确度':['近似','精确','四舍五入'],'代数式求值':['代数式','整体代入'],
  '线段中点计算':['中点'],'展开图识别':['展开图'],'余角补角列方程':['余角','补角'],
  '图形规律探究':['规律'],'单项式概念（构造）':['单项式'],
  '整式加减（图形边长）':['边长'],'方程变形与等式性质':['等式性质','变形'],
  '三视图':['三视图','俯视图','主视图','拼搭'],'同类项概念':['同类项'],'相反数':['相反数'],
  '绝对值非负性':['非负性'],'列代数式':['列代数式','用含'],'反比例关系':['反比例'],
  '新定义运算':['新定义'],'点线面概念':['点动成线','点、线、面','线动成面','在直线'],
  '角的和差计算':['角的和差','∠AOC','∠AOB','∠BOC'],'余角补角':['余角','补角'],
};

const pool = m.ALL_QUESTIONS.map(q=>(q.stem||'')+' '+(q.solution||''));
const topics = Object.values(m.TOPIC_MAP).sort((a,b)=>b.total-a.total);
let miss=[], weak=[];
const rows=[];
topics.forEach(t=>{
  const kws=KEYS[t.topic];
  if(!kws){ rows.push([t, '?', '无映射']); return; }
  const n = pool.filter(x=>kws.some(k=>new RegExp(k).test(x))).length;
  let v = n===0 ? '✕ 无题' : n<2 ? '⚠ 偏少' : '✓';
  if(n===0) miss.push(t.topic);
  else if(n<2) weak.push(t.topic);
  rows.push([t, n, v]);
});
console.log('站内题量', m.ALL_QUESTIONS.length, '| 真题知识点', topics.length);
console.log('');
console.log('分值 年数 知识点'.padEnd(42), '题数  判定');
console.log('-'.repeat(66));
rows.forEach(([t,n,v])=>{
  console.log(String(t.total).padStart(3)+'分', String(t.hitYears)+'年', t.topic.padEnd(24), String(n).padStart(4), ' ', v);
});
console.log('');
console.log('无题:', miss.length ? miss.join('、') : '0 ✓');
console.log('偏少:', weak.length ? weak.join('、') : '0 ✓');

/* ---------- ② 方法卡覆盖 ---------- */
console.log('\n=== ② 方法卡覆盖 ===');
const byMethod = {};
m.ALL_QUESTIONS.forEach(q => { if (q.method) byMethod[q.method] = (byMethod[q.method] || 0) + 1; });
const emptyCards = m.METHODS.filter(x => !byMethod[x.id]);
console.log('方法卡', m.METHODS.length, '张 | 空卡', emptyCards.length,
  emptyCards.length ? '：' + emptyCards.map(x => x.id).join(', ') : '✓');
const avgQ = (m.ALL_QUESTIONS.filter(q => q.method).length / m.METHODS.length).toFixed(1);
console.log('平均每卡', avgQ, '题');

/* ---------- ③ 难度匹配 ---------- */
console.log('\n=== ③ 难度匹配 ===');
const tierCount = { l1: 0, l2: 0, l3: 0 };
m.ALL_QUESTIONS.forEach(q => { if (tierCount[q.tier] != null) tierCount[q.tier]++; });
const tot = m.ALL_QUESTIONS.length;
const realHardTop = m.DIFF_COUNT.hard.pct + m.DIFF_COUNT.top.pct;
const siteL3 = Math.round(tierCount.l3 / tot * 100);
console.log('真题 hard+top 题量占比:', realHardTop + '%');
console.log('站内 l3（攻坚层）占比:', siteL3 + '%');
console.log(Math.abs(siteL3 - realHardTop) <= 5 ? '  ✓ 匹配（差异 ≤5 点）' : '  ⚠ 差异 ' + Math.abs(siteL3 - realHardTop) + ' 点');
console.log('站内分层: l1=' + tierCount.l1 + ' l2=' + tierCount.l2 + ' l3=' + tierCount.l3);

/* ---------- ④ 模考同构 ---------- */
console.log('\n=== ④ 模考同构性 ===');
const need = { l1: 10, l2: 10, l3: 8 };
const sets = Math.min(...Object.keys(need).map(t => Math.floor(tierCount[t] / need[t])));
console.log('按真题 26 题槽位组卷，各层需要:', JSON.stringify(need));
console.log('可组不重复卷数:', sets, sets >= 3 ? '套 ✓' : '套 ⚠ 偏少');

/* ---------- 汇总 ---------- */
console.log('\n' + '='.repeat(50));
const problems = miss.length + emptyCards.length + (Math.abs(siteL3 - realHardTop) > 5 ? 1 : 0);
if (problems === 0) {
  console.log('✓ 审计通过：内容已全面对标真题');
} else {
  console.log('✕ 审计发现', problems, '项问题，见上');
}
process.exit(problems === 0 ? 0 : 1);
