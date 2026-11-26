// 图表：学情数据页（多轮累计）与练习页（本轮诊断）共用。
//
// 为什么抽出来：两处都要画「8 项能力的掌握度」，
// 各写一份必然漂移——本项目已经因为样式副本漂移踩过一次（练习页顶栏）。
//
// 两条硬约束，改动时不能破：
// 1. 这个函数会被 .toString() 注入到两个页面的内联脚本里，所以必须**自包含**
//    （不引用外部变量、不引用 esc），且源码里不能出现反引号和美元花括号插值，
//    否则会把构建器的模板字符串截断（2026-11-26 已经这样弄坏过一次 build-history）。
// 2. 只输出 var(--xxx)，不写死颜色，暗色主题靠变量自动跟随。

/* 两个页面共用的样式。用法：构建器把这段拼进自己的 CSS 变量块之后。 */
export const CHART_CSS = `
/* 掌握度 / 薄弱度柱状图：横轴项目、纵轴掌握度或薄弱度。
 * 选柱状而不是雷达：雷达读的是「形状」，但 8 项里常有 5–6 项这轮没做到，
 * 轮廓会退化成一条线；柱状图每根柱子各自可比，没做到的项也看得出是「缺一根」。 */
/* 卡片按内容收缩并居中：图表渲染宽度是固定的 660px（见下），
   若卡片铺满 1050px 的内容区，右侧会空一大片，看起来像没画完。 */
.bar-wrap{background:var(--surface);border:1px solid var(--border);border-radius:12px;
  padding:16px 20px 12px;width:fit-content;max-width:100%;margin:0 auto}
/* 渲染宽度必须固定，不能写 width:100%。
 * SVG 的文字会随 viewBox 等比缩放：viewBox 宽 660，若铺满 1050px 的卡片，
 * 缩放 1.59 倍 → 声明的 11.5px 标签实际渲染成 18.3px，比正文 15px 还大；
 * 窄屏又反向缩到 9.8px。固定宽度后「声明的字号 = 实际字号」，各视口一致。
 * 窄屏装不下时由 .bar-scroll 横向滚动，不压缩字号。 */
.bar-scroll{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;max-width:100%}
.bar-chart{display:block;width:900px;max-width:none;height:auto;
  font-family:var(--sans)}
/* 图注 12.2px 与站内热力矩阵的图例（.heat-legend）同号：
   两者都是「图表下方的说明」，同一屏出现时不该一大一小。 */
.bar-note{font-size:12.2px;color:var(--text-3);line-height:1.7;margin-top:10px;
  border-top:1px solid var(--border);padding-top:9px}
`;

/* 画一张掌握度 / 薄弱度柱状图。参数：
 *   items: [{ name, rate, known, ok, total, tier }]
 *     known=false 表示这一项这轮/累计还没做到，画一段基线残条 + 「未轮到」
 *     tier: 'weak' | 'shaky' | 'solid' | 'insufficient'（决定柱色与是否空心）
 *   opts: { aria, note, width, height, metric, axis }
 *     metric='weak' 时纵轴画薄弱度（= 1 − 正确率），柱高代表「错多少」。
 *     章节图用 weak、能力图用 rate——两处结论方向不同，共用画法但不共用纵轴。
 * 返回：<div class="bar-wrap">…</div>
 *
 * 注意：本函数源码会被 .toString() 注入页面，不要用反引号、不要用外部依赖。
 */
export function barBlock(items, opts) {
  opts = opts || {};
  /* W 必须与 CHART_CSS 里的 .bar-chart width 一致——
     两者不等就会重新引入「字号随容器缩放」的问题。 */
  var W = opts.width || 900;
  var H = opts.height || 262;
  /* 纵轴方向：'rate' 掌握度（越高越好）| 'weak' 薄弱度（越高越该补） */
  var weak = opts.metric === 'weak';
  /* 柱高取的那个值：薄弱度 = 1 − 正确率 */
  var valOf = function (it) { return weak ? 1 - it.rate : it.rate; };
  var axisName = opts.axis || (weak ? '薄弱度' : '掌握度');
  /* mT 留 36：纵轴名放最上面一行，与 100% 刻度错开 */
  /* mL 留 44：纵轴刻度「100%」11.5px 加左侧留白，太窄会被滚动容器边缘裁掉 */
  /* mB 留 54：项名 12.9 + 样本量 11 两行，字号按站内体系调大后要留够 */
  var mL = 44, mR = 12, mT = 36, mB = 54;
  var plotW = W - mL - mR;
  var plotH = H - mT - mB;
  var n = items.length;
  var slot = plotW / n;
  var barW = Math.min(38, slot * 0.46);

  var num = function (x) { return x.toFixed(1); };
  var escB = function (s) {
    return String(s)
      .split('&').join('&amp;')
      .split('<').join('&lt;')
      .split('>').join('&gt;');
  };
  var tierColor = function (t) {
    return t === 'weak' ? 'var(--rose)'
      : t === 'shaky' ? 'var(--gold)'
      : t === 'solid' ? 'var(--ok)'
      : 'var(--text-3)';
  };
  /* 掌握度 → 纵坐标。0 在底、1 在顶。 */
  var yOf = function (v) { return mT + plotH * (1 - v); };

  /* 网格：0 / 25 / 50 / 75 / 100，基线实线、其余虚线。
     只标 0 / 50 / 100 三个数字，标满五条会挤。 */
  var grid = '';
  var gv = [0, 0.25, 0.5, 0.75, 1];
  var i, y;
  for (i = 0; i < gv.length; i++) {
    y = yOf(gv[i]);
    grid += '<line x1="' + num(mL) + '" y1="' + num(y) + '" x2="' + num(mL + plotW) +
      '" y2="' + num(y) + '" stroke="var(--border)" stroke-width="1"' +
      (gv[i] === 0 ? '' : ' stroke-dasharray="3 4"') + '/>';
    if (gv[i] === 0 || gv[i] === 0.5 || gv[i] === 1) {
      grid += '<text x="' + num(mL - 7) + '" y="' + num(y + 4) +
        '" text-anchor="end" font-size="11.5" fill="var(--text-3)" ' +
        'style="font-variant-numeric:tabular-nums">' + Math.round(gv[i] * 100) + '%</text>';
    }
  }
  /* 纵轴名：绘图区上方一行，横排——竖排旋转字在窄屏容易糊 */
  /* 纵轴名左对齐绘图区起点，不用 end 锚点——
     end 锚点会让 3 个字的起点落在负坐标上，滚动容器一裁就缺首字（实测踩到）。 */
  grid += '<text x="' + num(mL - 33) + '" y="' + num(mT - 20) +
    '" font-size="11.5" fill="var(--text-3)">' + escB(axisName) + '</text>';

  var bars = '';
  for (i = 0; i < n; i++) {
    var it = items[i];
    var cx = mL + slot * (i + 0.5);
    var x = cx - barW / 2;
    var known = it.known;
    /* 样本不足（不到 3 题）：画空心柱。1 题做对就是 100%，
       实心柱会被读成「这项满了」，而实际还下不了结论。 */
    var short = known && it.tier === 'insufficient';
    var col = tierColor(it.tier);
    var v = valOf(it);

    if (!known) {
      /* 未做到：基线上留一段残条，让人看出「这里有一项、只是没数据」 */
      bars += '<rect x="' + num(x) + '" y="' + num(mT + plotH - 2.5) + '" width="' +
        num(barW) + '" height="2.5" rx="1.2" fill="var(--border-2)"/>';
    } else {
      var h = Math.max(plotH * v, 2);
      var by = mT + plotH - h;
      if (short) {
        bars += '<rect x="' + num(x) + '" y="' + num(by) + '" width="' + num(barW) +
          '" height="' + num(h) + '" rx="3" fill="none" stroke="var(--text-3)" ' +
          'stroke-width="1.4" stroke-dasharray="4 3"/>';
      } else {
        bars += '<rect x="' + num(x) + '" y="' + num(by) + '" width="' + num(barW) +
          '" height="' + num(h) + '" rx="3" fill="' + col + '"/>';
      }
    }

    /* 柱顶数值：样本不足与未做到都写「—」，不给假结论。
       薄弱度模式下写的是「错多少」，所以标签也跟着换算。 */
    var pct = !known || short ? '—' : Math.round(v * 100) + '%';
    var pctY = known && !short
      ? mT + plotH - Math.max(plotH * v, 2) - 6
      : mT + plotH - 8;
    bars += '<text x="' + num(cx) + '" y="' + num(pctY) + '" text-anchor="middle" ' +
      'font-size="12.5" font-weight="700" fill="' +
      (known && !short ? col : 'var(--text-3)') + '">' + pct + '</text>';

    /* 横轴项名：12.9/600 与站内热力矩阵的族名（.heat .fam-nm）同号，
       两处图表在同一屏里出现时不会一大一小。 */
    bars += '<text x="' + num(cx) + '" y="' + num(mT + plotH + 17) + '" text-anchor="middle" ' +
      'font-size="12.9" font-weight="600" fill="' + (known ? 'var(--text)' : 'var(--text-3)') +
      '">' + escB(it.name) + '</text>';
    /* 项名下补样本量：1/1 和 9/10 都是 100%，不给样本量会误读。
       11px 与 .heat .fam-sub 同号（副标签层）。 */
    bars += '<text x="' + num(cx) + '" y="' + num(mT + plotH + 32) + '" text-anchor="middle" ' +
      'font-size="11" fill="var(--text-3)" style="font-variant-numeric:tabular-nums">' +
      (known ? it.ok + '/' + it.total : '未轮到') + '</text>';
  }

  /* 渲染宽度固定（见 CHART_CSS）：字号与容器宽度解绑后，
     声明的 10–11px 就是实际渲染的 10–11px，与正文 15px 的比例才协调。
     窄屏装不下时由 .bar-scroll 横向滚动，不压缩字号。 */
  var svg = '<svg class="bar-chart" viewBox="0 0 ' + W + ' ' + H +
    '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' +
    escB(opts.aria || (weak ? '各章节薄弱度柱状图' : '能力掌握度柱状图')) + '">' +
    grid + bars + '</svg>';

  return '<div class="bar-wrap"><div class="bar-scroll">' + svg + '</div>' +
    (opts.note ? '<div class="bar-note">' + escB(opts.note) + '</div>' : '') +
    '</div>';
}
