/* ==========================================================
   图形测试 · 初一上四类关键图形
   数轴 / 柱状图 / 扇形统计图 / 正方体展开图 / 坐标轴
   用法：node tools/fig-test.mjs
   产出：tools/fig-preview.html（人工目检）
   ========================================================== */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMathRenderer } from './math-render.mjs';
import { createFigureRenderer } from './fig-render.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const math = createMathRenderer();
const fr = createFigureRenderer({ math });

const FIGS = {
  /* ---------- 1. 数轴：初一最高频图形 ---------- */
  '数轴': {
    viewBox: [0, 0, 300, 80],
    alt: '数轴，标出 -2 与 3',
    elems: [
      { t: 'arrow', a: [20, 45], b: [285, 45] },
      { t: 'ticks', a: [35, 45], b: [265, 45], n: 11, size: 5 },
      { t: 'pt', at: [35, 45], label: '$-2$', pos: 'b' },
      { t: 'pt', at: [127, 45], label: '$0$', pos: 'b' },
      { t: 'pt', at: [219, 45], label: '$3$', pos: 'b' },
      { t: 'pt', at: [35, 45], r: 3.6, fill: 'var(--rose)' },
      { t: 'pt', at: [219, 45], r: 3.6, fill: 'var(--accent)' },
      { t: 'label', at: [292, 45], text: 'x', anchor: 'l', dx: 2 },
    ],
  },

  /* ---------- 2. 柱状图：rect 原语验证 ---------- */
  '柱状图': {
    viewBox: [0, 0, 280, 180],
    alt: '某班各小组人数柱状图',
    elems: [
      { t: 'arrow', a: [40, 150], b: [265, 150] },
      { t: 'arrow', a: [40, 150], b: [40, 20] },
      { t: 'ticks', a: [40, 150], b: [40, 30], n: 5, size: 4, dir: 'h' },
      { t: 'rect', x: 60, y: 90, w: 30, h: 60, fill: 'var(--accent-soft)' },
      { t: 'rect', x: 105, y: 60, w: 30, h: 90, fill: 'var(--accent-soft)' },
      { t: 'rect', x: 150, y: 105, w: 30, h: 45, fill: 'var(--accent-soft)' },
      { t: 'rect', x: 195, y: 75, w: 30, h: 75, fill: 'var(--accent-soft)' },
      { t: 'label', at: [75, 162], text: '一组' },
      { t: 'label', at: [120, 162], text: '二组' },
      { t: 'label', at: [165, 162], text: '三组' },
      { t: 'label', at: [210, 162], text: '四组' },
      { t: 'label', at: [30, 152], text: '0', anchor: 'r' },
    ],
  },

  /* ---------- 3. 扇形统计图：arc 填充验证 ---------- */
  '扇形图': {
    viewBox: [0, 0, 220, 200],
    alt: '扇形统计图，四部分占比',
    elems: [
      { t: 'arc', c: [110, 95], r: 70, from: 0, to: 108, fill: 'var(--accent-soft)' },
      { t: 'arc', c: [110, 95], r: 70, from: 108, to: 198, fill: 'var(--gold-soft)' },
      { t: 'arc', c: [110, 95], r: 70, from: 198, to: 288, fill: 'var(--ok-soft)' },
      { t: 'arc', c: [110, 95], r: 70, from: 288, to: 360, fill: 'var(--rose-soft)' },
      { t: 'circle', c: [110, 95], r: 70 },
      { t: 'label', at: [110, 95], text: '合计' },
      { t: 'label', at: [155, 60], text: '30%' },
      { t: 'label', at: [70, 60], text: '25%' },
    ],
  },

  /* ---------- 4. 正方体展开图：poly + rect 验证 ---------- */
  '展开图': {
    viewBox: [0, 0, 240, 200],
    alt: '正方体展开图（十字形）',
    elems: [
      { t: 'rect', x: 60, y: 40, w: 45, h: 45 },
      { t: 'rect', x: 60, y: 85, w: 45, h: 45 },
      { t: 'rect', x: 60, y: 130, w: 45, h: 45 },
      { t: 'rect', x: 15, y: 85, w: 45, h: 45 },
      { t: 'rect', x: 105, y: 85, w: 45, h: 45 },
      { t: 'rect', x: 150, y: 85, w: 45, h: 45 },
      { t: 'label', at: [82, 67], text: '上' },
      { t: 'label', at: [82, 112], text: '前' },
      { t: 'label', at: [82, 157], text: '下' },
      { t: 'label', at: [37, 112], text: '左' },
      { t: 'label', at: [127, 112], text: '右' },
      { t: 'label', at: [172, 112], text: '后' },
    ],
  },

  /* ---------- 5. 坐标轴：ticks.dir 验证 ---------- */
  '坐标轴': {
    viewBox: [0, 0, 240, 200],
    alt: '平面直角坐标系第一象限',
    elems: [
      { t: 'arrow', a: [40, 160], b: [220, 160] },
      { t: 'arrow', a: [40, 160], b: [40, 20] },
      { t: 'ticks', a: [40, 160], b: [210, 160], n: 5, size: 4 },
      { t: 'ticks', a: [40, 160], b: [40, 30], n: 5, size: 4, dir: 'h' },
      { t: 'pt', at: [125, 75], label: '$A(2,3)$', pos: 'tr' },
      { t: 'label', at: [30, 165], text: 'O', anchor: 'r' },
      { t: 'label', at: [226, 160], text: 'x', anchor: 'l' },
      { t: 'label', at: [40, 14], text: 'y' },
    ],
  },

  /* ---------- 6. 线段与角：几何图形初步 ---------- */
  '线段与角': {
    viewBox: [0, 0, 240, 160],
    alt: '线段 AB 上一点 C，以及角',
    elems: [
      { t: 'seg', a: [30, 110], b: [210, 110] },
      { t: 'pt', at: [30, 110], label: 'A', pos: 'l' },
      { t: 'pt', at: [110, 110], label: 'C', pos: 't' },
      { t: 'pt', at: [210, 110], label: 'B', pos: 'r' },
      { t: 'seg', a: [110, 110], b: [190, 45] },
      { t: 'angle', at: [110, 110], from: 'right', to: 'ur', r: 24, label: '$\\alpha$' },
    ],
  },
};

let ok = 0, fail = 0;
const blocks = [];
for (const [name, fig] of Object.entries(FIGS)) {
  const svg = fr.render(fig);
  if (svg && svg.startsWith('<svg')) { ok++; }
  else { fail++; console.log('✕ ' + name + ' 渲染失败'); }
  blocks.push(`<figure><figcaption>${name} · ${svg.length} B</figcaption>${svg}</figure>`);
}

const failures = fr.failures();
if (failures.length) {
  console.log('渲染失败明细：', failures);
  fail += failures.length;
}

writeFileSync(join(__dir, 'fig-preview.html'), `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>图形测试 · 初一上</title>
<link rel="stylesheet" href="../assets/style.css">
<style>body{padding:24px;background:var(--bg)}figure{display:inline-block;margin:12px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:12px;vertical-align:top}figcaption{font-size:.8rem;color:var(--text-2);margin-bottom:8px}.fig{width:300px}</style>
</head><body>${blocks.join('')}</body></html>`);

console.log(`\n图形测试：${ok} 通过 / ${fail} 失败（共 ${Object.keys(FIGS).length} 张）`);
console.log('预览：tools/fig-preview.html');
process.exit(fail ? 1 : 0);
