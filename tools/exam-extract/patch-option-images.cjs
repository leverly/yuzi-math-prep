#!/usr/bin/env node
/**
 * 给「选项整项是公式图、但提取器没拿到」的题补上选项图片。
 *
 * 背景：p2025 的 PDF 里，有些题的选项是 Word 公式（矢量），
 * pdftotext 只读到「A．」后面的残片（「﹣」或空）。这类选项
 * 在练习页会显示成空按钮或一个孤零零的减号，学生没法作答。
 *
 * 做法：从 200dpi 页面渲染里按行/按列切出四个选项，存成
 * assets/exam-src/<paper>/q<N>-opt-<K>.png，再把 optionParts
 * 改成 img 片段。裁切坐标写在下面的 PATCHES 里（都是实测过的）。
 *
 * 用法：node tools/exam-extract/patch-option-images.cjs
 * 注意：切图是一次性手工工作，脚本只负责「绑定」，不重新裁图。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

/* 已经切好图的题：paperId → 题号列表 */
const PATCHES = {
  p2025: [1, 7],
};

function patchPaper(src, paperId, nos) {
  const i = src.indexOf('"' + paperId + '": {');
  if (i < 0) throw new Error('找不到 ' + paperId);
  let j = src.indexOf('{', i), depth = 0, end = -1;
  for (let k = j; k < src.length; k++) {
    if (src[k] === '{') depth++;
    else if (src[k] === '}') { depth--; if (depth === 0) { end = k + 1; break; } }
  }
  const block = JSON.parse(src.slice(j, end));
  let changed = 0;
  for (const no of nos) {
    const q = block.questions.find((x) => x.no === no);
    if (!q) continue;
    q.options = ['A', 'B', 'C', 'D'].map((k) => ({
      key: k,
      text: k + '．',
      parts: [{ t: 'img', src: 'media/q' + no + '-opt-' + k + '.png', kind: 'option' }],
    }));
    changed++;
  }
  const body = JSON.stringify(block, null, 1).replace(/^/gm, ' ');
  return { src: src.slice(0, j) + body.trimStart() + src.slice(end), changed };
}

const SRC = path.join(ROOT, 'src/data-exam-full.js');
let src = fs.readFileSync(SRC, 'utf8');
for (const [paper, nos] of Object.entries(PATCHES)) {
  /* 图不在就别改数据，否则页面出现破图 */
  const missing = nos.flatMap((no) =>
    ['A', 'B', 'C', 'D'].filter((k) =>
      !fs.existsSync(path.join(ROOT, 'assets/exam-src', paper, 'q' + no + '-opt-' + k + '.png'))));
  if (missing.length) {
    console.log('跳过 ' + paper + '：缺图 ' + missing.join(', '));
    continue;
  }
  const r = patchPaper(src, paper, nos);
  src = r.src;
  console.log(paper + '：' + r.changed + ' 题选项已绑定图片');
}
fs.writeFileSync(SRC, src);
