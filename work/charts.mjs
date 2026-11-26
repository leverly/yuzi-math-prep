// 图表：学情数据页（多轮累计）与练习页（本轮诊断）共用。
//
// 为什么抽出来：两处都要画「6 个章节 / 8 项能力」的柱状图，
// 各写一份必然漂移——本项目已经因为样式副本漂移踩过一次（练习页顶栏）。
//
// 两条硬约束，改动时不能破：
// 1. 这个函数会被 .toString() 注入到两个页面的内联脚本里，所以必须**自包含**
//    （不引用外部变量、不引用 esc），且源码里不能出现反引号和美元花括号插值，
//    否则会把构建器的模板字符串截断（2026-11-26 已经这样弄坏过一次 build-history）。
// 2. 只输出 var(--xxx)，不写死颜色，暗色主题靠变量自动跟随。

/* 两个页面共用的样式。用法：构建器把这段拼进自己的 CSS 变量块之后。 */
export const CHART_CSS = `
/* 柱状图：横轴项目、纵轴掌握度或薄弱度。
 *
 * 为什么用 HTML/CSS 而不是 SVG：SVG 的文字会随 viewBox 等比缩放，
 * 于是「宽度」和「字号」只能二选一——
 *   width:100% 铺满容器 → 缩放 1.59 倍，12.9px 的标签渲染成 20px（比正文还大）；
 *   宽度写死 900px → 字号对了，但图表比容器窄，左右空出一大条。
 * 两个方案都试过、都被用户退回。HTML 柱状图没有这个矛盾：
 * 宽度天然 100% 通栏，字号是 CSS 像素、不参与任何缩放。
 *
 * 选柱状而不是雷达：雷达读的是「形状」，但 8 项里常有 5–6 项这轮没做到，
 * 轮廓会退化成一条线；柱状图每根柱子各自可比，没做到的项也看得出是「缺一根」。 */
.bar-wrap{background:var(--surface);border:1px solid var(--border);border-radius:12px;
  padding:16px 20px 12px}
/* 纵轴名一行，与图表左边缘对齐 */
.bar-axis{font-size:11.5px;color:var(--text-3);line-height:1.4}
/* 窄屏才出现横向滚动：8 项挤在 360px 里会把项名压成省略号，读不出是哪一项。
 * 宽屏 .bar-inner 自然撑满（width:auto），不产生留白。 */
.bar-scroll{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch}
.bar-chart{min-width:560px}
.bar-body{display:flex;gap:10px}
/* 纵轴刻度列：宽度定死，刻度右对齐贴住绘图区 */
.bar-yaxis{position:relative;width:38px;flex:none;height:200px;margin-top:12px}
.bar-yaxis span{position:absolute;right:0;transform:translateY(50%);font-size:11.5px;
  color:var(--text-3);font-variant-numeric:tabular-nums;white-space:nowrap;line-height:1}
.bar-main{flex:1;min-width:0}
/* 绘图区：固定高度，柱高按百分比算。
 * margin-top 28 而不是 12：100% 柱子的数值标签在柱顶上方 5px + 行高，
 * 留 12px 时它会顶出绘图区、贴着卡片上沿（实测溢出 18px）。
 * 留 28px 让标签落在网格上方的空白里，不碰到任何边界。 */
.bar-plot{position:relative;height:200px;margin-top:28px}
.bar-grid i{position:absolute;left:0;right:0;height:0;
  border-top:1px dashed var(--border)}
.bar-grid i.base{border-top-style:solid}
/* 柱子层：与网格重叠，每列等宽 */
.bar-cols{position:absolute;inset:0;display:flex}
.bar-col{flex:1;min-width:0;position:relative;display:flex;justify-content:center;align-items:flex-end}
.bar-fill{width:46%;max-width:38px;border-radius:3px 3px 0 0;box-sizing:border-box}
/* 样本不足：空心虚线柱。1 题做对就是 100%，实心柱会被读成「这项满了」 */
.bar-fill.hollow{background:none;border:1.4px dashed var(--text-3);border-bottom:none}
/* 未做到：基线上留一小段残条，让人看出「这里有一项、只是没数据」 */
.bar-stub{width:46%;max-width:38px;height:2.5px;border-radius:1.2px;background:var(--border-2)}
/* 柱顶数值：绝对定位，位置由柱高决定，所以柱子高低不影响排版 */
.bar-val{position:absolute;left:0;right:0;text-align:center;font-size:12.5px;
  font-weight:700;font-variant-numeric:tabular-nums;line-height:1}
/* 横轴项名与样本量：与柱子同列等宽，天然对齐 */
.bar-labels{display:flex;margin-top:9px}
.bar-lab{flex:1;min-width:0;text-align:center}
.bar-lab b{display:block;font-size:12.9px;font-weight:600;color:var(--text);line-height:1.3;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar-lab.off b{color:var(--text-3)}
.bar-lab span{display:block;font-size:11px;color:var(--text-3);
  font-variant-numeric:tabular-nums;margin-top:2px}
/* 图注 12.2px 与站内热力矩阵的图例（.heat-legend）同号：
   两者都是「图表下方的说明」，同一屏出现时不该一大一小。 */
.bar-note{font-size:12.2px;color:var(--text-3);line-height:1.7;margin-top:10px;
  border-top:1px solid var(--border);padding-top:9px}
`;

/* 画一张掌握度 / 薄弱度柱状图。参数：
 *   items: [{ name, rate, known, ok, total, tier }]
 *     known=false 表示这一项这轮/累计还没做到，画一段基线残条 + 「未轮到」
 *     tier: 'weak' | 'shaky' | 'solid' | 'insufficient'（决定柱色与是否空心）
 *   opts: { aria, note, metric, axis }
 *     metric='weak' 时纵轴画薄弱度（= 1 − 正确率），柱高代表「错多少」。
 *     章节图用 weak、能力图用 rate——两处结论方向不同，共用画法但不共用纵轴。
 * 返回：<div class="bar-wrap">…</div>
 *
 * 注意：本函数源码会被 .toString() 注入页面，不要用反引号、不要用外部依赖。
 */
export function barBlock(items, opts) {
  opts = opts || {};
  /* 纵轴方向：'rate' 掌握度（越高越好）| 'weak' 薄弱度（越高越该补） */
  var weak = opts.metric === 'weak';
  /* 柱高取的那个值：薄弱度 = 1 − 正确率 */
  var valOf = function (it) { return weak ? 1 - it.rate : it.rate; };
  var axisName = opts.axis || (weak ? '薄弱度' : '掌握度');

  var escB = function (s) {
    return String(s)
      .split('&').join('&amp;')
      .split('<').join('&lt;')
      .split('>').join('&gt;')
      .split('"').join('&quot;');
  };
  var tierColor = function (t) {
    return t === 'weak' ? 'var(--rose)'
      : t === 'shaky' ? 'var(--gold)'
      : t === 'solid' ? 'var(--ok)'
      : 'var(--text-3)';
  };

  var n = items.length;
  var i;

  /* 网格 0/25/50/75/100，只标 0/50/100 三个数字，标满五条会挤 */
  var grid = '', yaxis = '';
  var gv = [0, 25, 50, 75, 100];
  for (i = 0; i < gv.length; i++) {
    grid += '<i class="' + (gv[i] === 0 ? 'base' : '') +
      '" style="bottom:' + gv[i] + '%"></i>';
    if (gv[i] === 0 || gv[i] === 50 || gv[i] === 100) {
      yaxis += '<span style="bottom:' + gv[i] + '%">' + gv[i] + '%</span>';
    }
  }

  var cols = '', labels = '';
  for (i = 0; i < n; i++) {
    var it = items[i];
    var known = it.known;
    /* 样本不足（不到 3 题）：画空心虚线柱，且不给百分比 */
    var short = known && it.tier === 'insufficient';
    var col = tierColor(it.tier);
    var pctNum = Math.round(valOf(it) * 100);
    /* 高度至少 1%，否则 0% 的柱子完全消失，看不出这里有一项 */
    var h = Math.max(pctNum, 1);

    var inner = '';
    if (!known) {
      inner += '<div class="bar-stub"></div>';
    } else if (short) {
      inner += '<div class="bar-fill hollow" style="height:' + h + '%"></div>';
    } else {
      inner += '<div class="bar-fill" style="height:' + h +
        '%;background:' + col + '"></div>';
    }

    /* 柱顶数值：未做到与样本不足都写「—」，不给假结论 */
    var lbl = (!known || short) ? '—' : pctNum + '%';
    var lblCol = (known && !short) ? col : 'var(--text-3)';
    var lblBottom = (!known || short) ? 2 : h;
    inner += '<div class="bar-val" style="bottom:calc(' + lblBottom + '% + 5px);color:' +
      lblCol + '">' + lbl + '</div>';

    cols += '<div class="bar-col">' + inner + '</div>';
    labels += '<div class="bar-lab' + (known ? '' : ' off') + '">' +
      '<b>' + escB(it.name) + '</b>' +
      '<span>' + (known ? it.ok + '/' + it.total : '未轮到') + '</span></div>';
  }

  return '<div class="bar-wrap">' +
    '<div class="bar-axis">' + escB(axisName) + '</div>' +
    '<div class="bar-scroll">' +
      '<div class="bar-chart" role="img" aria-label="' +
        escB(opts.aria || (weak ? '各章节薄弱度柱状图' : '能力掌握度柱状图')) + '">' +
        '<div class="bar-body">' +
          '<div class="bar-yaxis">' + yaxis + '</div>' +
          '<div class="bar-main">' +
            '<div class="bar-plot"><div class="bar-grid">' + grid + '</div>' +
              '<div class="bar-cols">' + cols + '</div></div>' +
            '<div class="bar-labels">' + labels + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    (opts.note ? '<div class="bar-note">' + escB(opts.note) + '</div>' : '') +
    '</div>';
}
