/* ==========================================================
   图形渲染器（构建期）
   把数据里的声明式 elems 编译成内联 SVG 字符串。
   坐标单位就是 viewBox 单位，不做缩放；响应式靠 width:100%。

   原语（在参考站 13 种基础上新增 3 项能力，供初一上使用）：
     pt      点 + 标签
     seg     线段
     ray     射线（从 a 经 b 延伸）
     poly    折线 / 多边形（closed）
     circle  圆
     arc     圆弧；给 fill 时闭合到圆心成扇形（初一统计图）
     angle   角标（两方向夹角 + 可选标签）
     right   直角标记
     label   文本（支持 $...$）
     curve   函数曲线（采样点连成路径）
     arrow   箭头（a→b）
     region  半透明填充区域（多边形）
     ticks   刻度；dir:'h' 画横刻度（竖直轴用），默认竖刻度
     rect    矩形（柱状图 / 展开图外框 / 方格），支持 rx 圆角

   用法：
     const fr = createFigureRenderer({ math });
     fr.render(figure)   → '<svg class="fig" …>…</svg>'
   ========================================================== */

const STROKE = 1.6;

export function createFigureRenderer(opts = {}) {
  const math = opts.math || null;
  const failures = [];

  function render(fig) {
    if (!fig) return '';
    const vb = fig.viewBox || [0, 0, 240, 180];
    const [x0, y0, w, h] = vb;
    const body = [];
    const defs = [];
    let arrowId = 0;

    const px = (v) => (typeof v === 'number' ? v : Number(v) || 0);

    const parts = (fig.elems || []).map((e, idx) => {
      try {
        return one(e, idx);
      } catch (err) {
        failures.push({ index: idx, type: e && e.t, err: err.message });
        return '';
      }
    }).join('');

    function one(e, idx) {
      const cls = e.cls ? ' class="' + esc(e.cls) + '"' : '';
      const style = e.stroke ? ' stroke="' + esc(e.stroke) + '"' : '';
      const sw = e.w ? ' stroke-width="' + px(e.w) + '"' : '';

      switch (e.t) {
        case 'pt': {
          const [x, y] = e.at;
          const r = e.r || 2.4;
          const label = e.label ? pointLabel(e.at, e.label, e.pos || 'tr') : '';
          return '<circle cx="' + px(x) + '" cy="' + px(y) + '" r="' + r + '"' + cls +
            ' fill="' + esc(e.fill || 'currentColor') + '"/>' + label;
        }
        case 'seg': {
          const [ax, ay] = e.a, [bx, by] = e.b;
          const dash = e.dash ? ' stroke-dasharray="5 4"' : '';
          return '<line x1="' + px(ax) + '" y1="' + px(ay) + '" x2="' + px(bx) + '" y2="' + px(by) +
            '"' + cls + style + sw + dash + '/>';
        }
        case 'ray': {
          const [ax, ay] = e.a, [bx, by] = e.b;
          const dx = bx - ax, dy = by - ay;
          const len = Math.hypot(dx, dy) || 1;
          const ext = Math.max(w, h) * 1.5;
          const ex = ax + dx / len * ext, ey = ay + dy / len * ext;
          return '<line x1="' + px(ax) + '" y1="' + px(ay) + '" x2="' + px(ex) + '" y2="' + px(ey) +
            '"' + cls + style + sw + '/>';
        }
        case 'poly': {
          const d = e.pts.map((p, i) => (i ? 'L' : 'M') + px(p[0]) + ' ' + px(p[1])).join(' ');
          const tag = e.closed ? 'polygon' : 'polyline';
          const dash = e.dash ? ' stroke-dasharray="5 4"' : '';
          const fill = ' fill="' + esc(e.fill || 'none') + '"';
          return '<' + tag + ' d="' + d + '"' + cls + style + sw + fill + dash +
            ' points="' + e.pts.map((p) => px(p[0]) + ',' + px(p[1])).join(' ') + '"/>';
        }
        case 'circle': {
          const [cx, cy] = e.c;
          const fill = ' fill="' + esc(e.fill || 'none') + '"';
          const dash = e.dash ? ' stroke-dasharray="5 4"' : '';
          return '<circle cx="' + px(cx) + '" cy="' + px(cy) + '" r="' + px(e.r) + '"' + cls + style + sw + fill + dash + '/>';
        }
        case 'arc': {
          const [cx, cy] = e.c;
          const r = px(e.r);
          const a1 = (e.from || 0) * Math.PI / 180;
          const a2 = (e.to || 0) * Math.PI / 180;
          const sx = cx + r * Math.cos(a1), sy = cy + r * Math.sin(a1);
          const ex2 = cx + r * Math.cos(a2), ey2 = cy + r * Math.sin(a2);
          const large = Math.abs(a2 - a1) > Math.PI ? 1 : 0;
          const sweep = a2 > a1 ? 1 : 0;
          /* 扇形填充（初一统计图需要）：e.fill 给出时，路径闭合到圆心。
             不闭合时是圆弧；闭合到圆心才是扇形。 */
          const isSector = e.fill && e.fill !== 'none';
          const d = isSector
            ? 'M' + px(cx) + ' ' + px(cy) + ' L' + sx + ' ' + sy + ' A' + r + ' ' + r + ' 0 ' + large + ' ' + sweep + ' ' + ex2 + ' ' + ey2 + ' Z'
            : 'M' + sx + ' ' + sy + ' A' + r + ' ' + r + ' 0 ' + large + ' ' + sweep + ' ' + ex2 + ' ' + ey2;
          let extra = '';
          if (e.arrow) {
            const id = 'fa' + (arrowId++);
            defs.push('<marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="currentColor"/></marker>');
            extra = ' marker-end="url(#' + id + ')"';
          }
          const arcFill = ' fill="' + esc(isSector ? e.fill : 'none') + '"';
          const arcStroke = isSector && !e.stroke ? ' stroke="none"' : '';
          return '<path d="' + d + '"' + arcFill + arcStroke + cls + style + sw + extra + '/>';
        }
        case 'rect': {
          /* 柱状图 / 展开图外框 / 方格。rx 给圆角。
             注意：rect 的 w 是宽度，不能拿它当 stroke-width——
             共用变量 sw 会让每个矩形被描成 40px 宽的黑块。
             需要改描边粗细时用独立的 sw 字段。 */
          const rx = e.rx ? ' rx="' + px(e.rx) + '"' : '';
          const rfill = ' fill="' + esc(e.fill || 'none') + '"';
          const rdash = e.dash ? ' stroke-dasharray="5 4"' : '';
          const rsw = e.sw ? ' stroke-width="' + px(e.sw) + '"' : '';
          /* 填充块默认不描边：描边会让相邻色块之间出现深色缝。 */
          const rstroke = (e.fill && e.fill !== 'none' && !e.stroke) ? ' stroke="none"' : '';
          return '<rect x="' + px(e.x) + '" y="' + px(e.y) + '" width="' + px(e.w) +
            '" height="' + px(e.h) + '"' + rx + rfill + rstroke + cls + style + rsw + rdash + '/>';
        }
        case 'angle': {
          const [cx, cy] = e.at;
          const r = e.r || 22;
          const a1 = dirAngle(e.from);
          const a2 = dirAngle(e.to);
          // 总是画劣角（小于 180°）：把差值归一到 (-π, π]
          let d = a2 - a1;
          while (d <= -Math.PI) d += Math.PI * 2;
          while (d > Math.PI) d -= Math.PI * 2;
          const sx = cx + r * Math.cos(a1), sy = cy + r * Math.sin(a1);
          const ex2 = cx + r * Math.cos(a1 + d), ey2 = cy + r * Math.sin(a1 + d);
          const sweep = d > 0 ? 1 : 0;
          const path = 'M' + round(sx) + ' ' + round(sy) + ' A' + r + ' ' + r + ' 0 0 ' +
            sweep + ' ' + round(ex2) + ' ' + round(ey2);
          let lab = '';
          if (e.label) {
            const mid = a1 + d / 2;
            const lr = r + 13;
            lab = text([cx + lr * Math.cos(mid), cy + lr * Math.sin(mid)], e.label, 'c');
          }
          return '<path d="' + path + '" fill="none"' + style + sw + ' opacity=".85"/>' + lab;
        }
        case 'right': {
          const [cx, cy] = e.at;
          const s = e.size || 10;
          const a1 = dirAngle(e.from), a2 = dirAngle(e.to);
          const p1 = [cx + s * Math.cos(a1), cy + s * Math.sin(a1)];
          const p2 = [cx + s * Math.cos(a1) + s * Math.cos(a2), cy + s * Math.sin(a1) + s * Math.sin(a2)];
          const p3 = [cx + s * Math.cos(a2), cy + s * Math.sin(a2)];
          return '<path d="M' + p1[0] + ' ' + p1[1] + ' L' + p2[0] + ' ' + p2[1] + ' L' + p3[0] + ' ' + p3[1] +
            '" fill="none"' + style + sw + '/>';
        }
        case 'label':
          return text(e.at, e.text, e.anchor || 'c', e.dx, e.dy);
        case 'curve': {
          const pts = sample(e.fn, e.domain || [x0, x0 + w], e.n || 80);
          if (!pts.length) return '';
          const d = pts.map((p, i) => (i ? 'L' : 'M') + round(p[0]) + ' ' + round(p[1])).join(' ');
          return '<path d="' + d + '" fill="none"' + cls + style + sw + '/>';
        }
        case 'arrow': {
          const id = 'fa' + (arrowId++);
          defs.push('<marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="currentColor"/></marker>');
          const [ax, ay] = e.a, [bx, by] = e.b;
          return '<line x1="' + px(ax) + '" y1="' + px(ay) + '" x2="' + px(bx) + '" y2="' + px(by) +
            '"' + cls + style + sw + ' marker-end="url(#' + id + ')"/>';
        }
        case 'region': {
          const pts = e.pts.map((p) => px(p[0]) + ',' + px(p[1])).join(' ');
          return '<polygon points="' + pts + '" fill="' + esc(e.fill || 'var(--accent-soft)') +
            '" stroke="none" opacity="' + (e.opacity == null ? 1 : e.opacity) + '"/>';
        }
        case 'ticks': {
          const [ax, ay] = e.a, [bx, by] = e.b;
          const n = e.n || 5;
          const s = e.size || 4;
          /* dir: 'v' 画竖刻度（水平轴用，默认）；'h' 画横刻度（竖直轴用）。
             初一坐标轴需要 y 轴横刻度，否则刻度与轴重合看不见。 */
          const horiz = e.dir === 'h';
          let out = '';
          for (let i = 1; i < n; i++) {
            const t = i / n;
            const x = ax + (bx - ax) * t, y = ay + (by - ay) * t;
            if (horiz) {
              out += '<line x1="' + round(x - s) + '" y1="' + round(y) + '" x2="' + round(x + s) +
                '" y2="' + round(y) + '"' + style + sw + '/>';
            } else {
              out += '<line x1="' + round(x) + '" y1="' + round(y - s) + '" x2="' + round(x) +
                '" y2="' + round(y + s) + '"' + style + sw + '/>';
            }
          }
          return out;
        }
        default:
          throw new Error('unknown primitive: ' + e.t);
      }
    }

    /** 点的标签：pos 是「标签相对点的方位」（tl/tr/bl/br/l/r/t/b/c），
        不是 text-anchor。默认右上，偏移 9px。 */
    function pointLabel(at, s, pos) {
      const [x, y] = at;
      const OFF = 9;
      const map = {
        tl: [-OFF, -OFF, 'end'], tr: [OFF, -OFF, 'start'],
        bl: [-OFF, OFF, 'end'], br: [OFF, OFF, 'start'],
        l: [-OFF, 0, 'end'], r: [OFF, 0, 'start'],
        t: [0, -OFF, 'middle'], b: [0, OFF, 'middle'],
        c: [0, 0, 'middle'],
      };
      const m = map[pos] || map.tr;
      const str = String(s);
      const isMath = str.indexOf('$') >= 0;
      if (isMath && math) {
        const sized = math.renderSized ? math.renderSized(str, 6.6) : math.render(str);
        const hh = /height="([\d.]+)"/.exec(sized);
        const half = hh ? Number(hh[1]) / 2 : 6;
        return '<g transform="translate(' + round(x + m[0]) + ' ' + round(y + m[1]) + ')">' +
          '<g transform="translate(0 ' + round(half) + ')">' + sized + '</g></g>';
      }
      return '<text x="' + round(x + m[0]) + '" y="' + round(y + m[1] + 4) +
        '" text-anchor="' + m[2] + '" font-size="12" font-family="system-ui,sans-serif"' +
        ' fill="currentColor" stroke="none">' + esc(str) + '</text>';
    }

    /** 文本：$...$ 交给公式渲染器；否则纯 <text>。
        不用 foreignObject（file:// 下会错位）；
        也不用 dominant-baseline（在继承自 <g> 的上下文里会让字形塌缩），
        改用 y + 0.35em 的显式基线偏移，并把 font-size 写在 <text> 自身。 */
    function text(at, s, anchor, dx, dy) {
      const [x, y] = at;
      const ax = anchor === 'l' ? 'start' : anchor === 'r' ? 'end' : 'middle';
      const ox = dx == null ? 0 : dx;
      const oy = dy == null ? 0 : dy;
      const str = String(s);
      const isMath = str.indexOf('$') >= 0;
      if (isMath && math) {
        // MathJax 输出用 ex 单位，SVG 里无可靠 ex 基准会放大；
        // renderSized 把尺寸换成固定像素，再按基线居中平移。
        const sized = math.renderSized ? math.renderSized(str, 6.6) : math.render(str);
        const h = /height="([\d.]+)"/.exec(sized);
        const half = h ? Number(h[1]) / 2 : 6;
        return '<g transform="translate(' + round(x + ox) + ' ' + round(y + oy) + ')">' +
          '<g transform="translate(0 ' + round(half) + ')">' + sized + '</g></g>';
      }
      return '<text x="' + round(x + ox) + '" y="' + round(y + oy + 4) +
        '" text-anchor="' + ax + '" font-size="12" font-family="system-ui,sans-serif"' +
        ' fill="currentColor" stroke="none">' + esc(str) + '</text>';
    }

    const defsStr = defs.length ? '<defs>' + defs.join('') + '</defs>' : '';
    return '<svg class="fig' + (fig.cls ? ' ' + esc(fig.cls) : '') + '" viewBox="' +
      [x0, y0, w, h].join(' ') + '" xmlns="http://www.w3.org/2000/svg" role="img"' +
      (fig.alt ? ' aria-label="' + esc(fig.alt) + '"' : '') +
      ' preserveAspectRatio="xMidYMid meet">' + defsStr +
      '<g fill="none" stroke="currentColor" stroke-width="' + STROKE +
      '" stroke-linecap="round" stroke-linejoin="round">' + parts + '</g></svg>';
  }

  return { render, failures: () => failures.slice() };
}

/* 方向名 → 弧度（SVG 坐标系 y 向下，所以 up 是 -PI/2） */
const DIRS = {
  right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2,
  ur: -Math.PI / 4, dr: Math.PI / 4, dl: Math.PI * 3 / 4, ul: -Math.PI * 3 / 4,
};
function dirAngle(d) {
  if (typeof d === 'number') return d * Math.PI / 180;
  const v = DIRS[d];
  if (v == null) throw new Error('unknown direction: ' + d);
  return v;
}

/* 函数曲线采样：fn(x) 返回 SVG 坐标 y（已含翻转） */
function sample(fn, domain, n) {
  const [a, b] = domain;
  const out = [];
  for (let i = 0; i <= n; i++) {
    const x = a + (b - a) * i / n;
    const y = fn(x);
    if (Number.isFinite(y)) out.push([x, y]);
  }
  return out;
}

function round(v) { return Math.round(v * 100) / 100; }
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
