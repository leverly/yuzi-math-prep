// 图形生成：为需要图的题生成内联 SVG
// 只画题干描述的结构，不画多余元素——图是帮助理解，不是装饰

const S = (w, h, body) =>
  `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px;height:auto;display:block;margin:0 auto">${body}</svg>`;

const L = (x1, y1, x2, y2, extra = '') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#334155" stroke-width="1.6" ${extra}/>`;

const T = (x, y, s, size = 13, anchor = 'middle') =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="#0f172a" text-anchor="${anchor}" font-family="-apple-system,PingFang SC,sans-serif">${s}</text>`;

const DOT = (x, y) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#2563eb"/>`;

/* 角的和差：从 O 出发的多条射线 */
function angleFig(rays, opts = {}) {
  const w = opts.w || 320, h = opts.h || 200;
  const ox = opts.ox ?? 60;
  const oy = opts.oy ?? (h - 50);
  const len = opts.len || 150;
  const PAD = 22;           // 画布内边距，保证标签不出界

  let body = '';
  // 先画所有射线
  for (const r of rays) {
    const rad = (r.deg * Math.PI) / 180;
    body += L(ox, oy, ox + len * Math.cos(rad), oy - len * Math.sin(rad));
  }
  // 再画弧线（在射线之上，但不遮挡标签）
  if (opts.arcs) {
    for (const a of opts.arcs) {
      const r0 = a.r || 42;
      const x1 = ox + r0 * Math.cos((a.from * Math.PI) / 180);
      const y1 = oy - r0 * Math.sin((a.from * Math.PI) / 180);
      const x2 = ox + r0 * Math.cos((a.to * Math.PI) / 180);
      const y2 = oy - r0 * Math.sin((a.to * Math.PI) / 180);
      const large = Math.abs(a.to - a.from) > 180 ? 1 : 0;
      const sweep = a.to > a.from ? 0 : 1;
      body += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${r0} ${r0} 0 ${large} ${sweep} ${x2.toFixed(1)} ${y2.toFixed(1)}"
        fill="none" stroke="#94a3b8" stroke-width="1.2"/>`;
    }
  }
  // 最后画标签（覆盖在最上层），沿射线方向外推
  for (const r of rays) {
    const rad = (r.deg * Math.PI) / 180;
    let lx = ox + (len + 14) * Math.cos(rad);
    let ly = oy - (len + 14) * Math.sin(rad) + 4;
    lx = Math.max(PAD, Math.min(w - PAD, lx));
    ly = Math.max(PAD, Math.min(h - 10, ly));
    body += T(lx, ly, r.name, 14);
  }
  body += DOT(ox, oy);
  // O 标签放在左下，避开所有射线
  body += T(Math.max(PAD, ox - 16), Math.min(h - 10, oy + 20), 'O', 14);
  return S(w, h, body);
}

/* 线段图：给若干点与中点关系 */
function segFig(pts, opts = {}) {
  const w = opts.w || 340, h = opts.h || 110;
  const y = opts.y || 52;
  const x0 = opts.x0 || 46, x1 = opts.x1 || (w - 46);
  let body = L(x0, y, x1, y);
  const span = x1 - x0;
  for (const p of pts) {
    const px = x0 + span * p.t;
    body += DOT(px, y);
    body += T(px, y + (p.below ? 26 : -14), p.name);
    if (p.tick) {
      body += L(px - 4, y - 5, px + 4, y + 5, 'stroke="#94a3b8"');
    }
  }
  return S(w, h, body);
}

/* 展开图：用方格画 */
function netFig(cells, opts = {}) {
  const c = opts.cell || 22;
  const cols = opts.cols || 6;
  const rows = opts.rows || 4;
  const w = cols * c + 8, h = rows * c + 8;
  let body = `<rect x="4" y="4" width="${cols * c}" height="${rows * c}" fill="#f8fafd" stroke="#e2e8f0"/>`;
  for (const [cx, cy] of cells) {
    body += `<rect x="${4 + cx * c}" y="${4 + cy * c}" width="${c}" height="${c}"
      fill="#dbeafe" stroke="#2563eb" stroke-width="1.4"/>`;
  }
  return S(w, h, body);
}

/* ============ 各题的具体图 ============ */
export const FIGS = {
  /* 角度和差：∠AOB=3∠BOC=36°，∠BOC=12°，∠COD=62°，依次排列 */
  /* ∠BOC=12°, ∠COD=62°, ∠AOB=3∠BOC=36°，依次排列
     从 OD 起算：D=0°, C=62°, B=74°, A=110° */
  'as-01': () => angleFig(
    [
      { deg: 0, name: 'D' },
      { deg: 62, name: 'C' },
      { deg: 74, name: 'B' },
      { deg: 110, name: 'A' },
    ],
    { w: 330, h: 220, ox: 70, oy: 175, len: 160,
      arcs: [{ from: 62, to: 74, r: 40 }, { from: 0, to: 62, r: 56 }] }
  ),

  /* OC 在 ∠AOB 内部 */
  /* OC 在 ∠AOB 内部：B=0°, C=30°, A=70° */
  'as-02': () => angleFig(
    [{ deg: 0, name: 'B' }, { deg: 30, name: 'C' }, { deg: 70, name: 'A' }],
    { w: 300, h: 190, ox: 65, oy: 150, len: 150, arcs: [{ from: 30, to: 70, r: 44 }] }
  ),

  /* OC 平分 ∠AOB(90°)，OD 在外部 */
  /* ∠AOB=90°，OC 平分，OD 在外部且 ∠BOD=20°：B=0°, C=45°, A=90°, D=-20° */
  'as-03': () => angleFig(
    [{ deg: 0, name: 'B' }, { deg: 45, name: 'C' }, { deg: 90, name: 'A' }, { deg: -20, name: 'D' }],
    { w: 320, h: 250, ox: 95, oy: 155, len: 125,
      arcs: [{ from: 0, to: 45, r: 42 }, { from: -20, to: 0, r: 30 }] }
  ),

  /* OC 平分 ∠AOB(120°)，OD 平分 ∠AOC */
  /* ∠AOB=120°，OC 平分（C=60°），OD 平分 ∠AOC（D=90°） */
  'as-05': () => angleFig(
    [{ deg: 0, name: 'B' }, { deg: 60, name: 'C' }, { deg: 90, name: 'D' }, { deg: 120, name: 'A' }],
    { w: 360, h: 230, ox: 110, oy: 180, len: 140,
      arcs: [{ from: 0, to: 60, r: 36 }, { from: 60, to: 120, r: 36 }] }
  ),

  /* 线段中点：AB=14, C 中点, D 在 CB, E 是 DB 中点, EB=2 */
  'sm-02': () => segFig(
    [
      { t: 0, name: 'A', below: true },
      { t: 0.5, name: 'C' },
      { t: 0.5 + (5 / 14), name: 'D', below: true },
      { t: 1 - (2 / 14), name: 'E' },
      { t: 1, name: 'B', below: true },
    ],
    { w: 380 }
  ),

  /* AB=12, AC=4, M 是 BC 中点 */
  'sm-03': () => segFig(
    [
      { t: 0, name: 'A', below: true },
      { t: 4 / 12, name: 'C' },
      { t: 8 / 12, name: 'M' },
      { t: 1, name: 'B', below: true },
    ],
    { w: 340 }
  ),

  /* AC=6, BC=4, M 是 AC 中点, N 是 BC 中点 */
  'sm-05': () => segFig(
    [
      { t: 0, name: 'A', below: true },
      { t: 3 / 10, name: 'M' },
      { t: 6 / 10, name: 'C', below: true },
      { t: 8 / 10, name: 'N' },
      { t: 1, name: 'B', below: true },
    ],
    { w: 360 }
  ),

  /* AC=10, BC=14，M 是 AC 中点、N 是 BC 中点 */
  'sm-06': () => segFig(
    [
      { t: 0, name: 'A', below: true },
      { t: 5 / 24, name: 'M' },
      { t: 10 / 24, name: 'C', below: true },
      { t: 17 / 24, name: 'N' },
      { t: 1, name: 'B', below: true },
    ],
    { w: 380 }
  ),

  /* ∠AOB=75°，OC 在内部且 ∠AOC=4∠BOC → B=0°, C=15°, A=75° */
  'as-06': () => angleFig(
    [{ deg: 0, name: 'B' }, { deg: 15, name: 'C' }, { deg: 75, name: 'A' }],
    { w: 310, h: 200, ox: 75, oy: 165, len: 150,
      arcs: [{ from: 0, to: 15, r: 34 }, { from: 15, to: 75, r: 56 }] }
  ),

  /* ∠AOB=140°，OC 平分(70°)，OD 平分∠AOC(35°)，OE 平分∠AOD(17.5°) */
  'as-07': () => angleFig(
    [{ deg: 0, name: 'B' }, { deg: 17.5, name: 'E' }, { deg: 35, name: 'D' },
     { deg: 70, name: 'C' }, { deg: 140, name: 'A' }],
    { w: 360, h: 210, ox: 105, oy: 175, len: 145,
      arcs: [{ from: 0, to: 70, r: 36 }, { from: 70, to: 140, r: 36 }] }
  ),

  /* ∠AOB=90°，OC 在外部使 ∠AOC=130°（即 C 在 A 的另一侧），OD 平分∠BOC */
  'as-09': () => angleFig(
    [{ deg: 0, name: 'B' }, { deg: 90, name: 'A' }, { deg: 130, name: 'C' }, { deg: 65, name: 'D' }],
    { w: 330, h: 240, ox: 95, oy: 175, len: 130,
      arcs: [{ from: 0, to: 65, r: 40 }, { from: 65, to: 130, r: 40 }] }
  ),

  /* 展开图四选项：A 一行6, B 田字+2, C 1-4-1, D 凹字 */
  /* A：六个排成一行（必然首尾重叠，折不成正方体） */
  'sp3-04-a': () => netFig(
    [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]],
    { cols: 6, rows: 1, cell: 20 }
  ),
  /* B：「田」字四格再加两格（田字必重叠） */
  'sp3-04-b': () => netFig(
    [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]],
    { cols: 4, rows: 2, cell: 20 }
  ),
  /* C：1-4-1 型（标准正方体展开图之一，可折成） */
  'sp3-04-c': () => netFig(
    [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]],
    { cols: 4, rows: 3, cell: 22 }
  ),
  /* D：「凹」字形（中间凹陷，必重叠） */
  'sp3-04-d': () => netFig(
    [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [1, 1]],
    { cols: 3, rows: 2, cell: 22 }
  ),
};
