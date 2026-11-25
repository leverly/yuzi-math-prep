#!/usr/bin/env node
/**
 * 把 assets/exam-src/p2023.json（坐标重建后的结果）写回 src/data-exam-full.js
 * 的 p2023 段，保留 figureMap 等外围字段。
 */
const fs = require('fs');

const SRC = 'src/data-exam-full.js';
const JSONP = 'assets/exam-src/p2023.json';

const fresh = JSON.parse(fs.readFileSync(JSONP, 'utf8'));
let src = fs.readFileSync(SRC, 'utf8');

const i = src.indexOf('"p2023": {');
if (i < 0) throw new Error('找不到 p2023 段');
let j = src.indexOf('{', i), depth = 0, end = -1;
for (let k = j; k < src.length; k++) {
  if (src[k] === '{') depth++;
  else if (src[k] === '}') { depth--; if (depth === 0) { end = k + 1; break; } }
}
if (end < 0) throw new Error('p2023 段括号不闭合');

const old = JSON.parse(src.slice(j, end));

// 合并：以 fresh 的题目为准，外围字段（figureMap/pageImages/note 等）保留
const merged = Object.assign({}, old, {
  tag: 'p2023',
  source: fresh.source || old.source,
  qcount: fresh.qcount,
  note: 'PDF 源（教师版）经坐标重建：分数/上标/度分秒/∠ 全部还原；插图见 figureMap',
  questions: fresh.questions.map((q) => {
    const prev = (old.questions || []).find((p) => p.no === q.no) || {};
    return Object.assign({}, prev, q, {
      // rawParas 用重建后的（公式已还原），便于核验页对照
      rawParas: q.rawParas || prev.rawParas || [],
    });
  }),
});

const body = JSON.stringify(merged, null, 1).replace(/^/gm, ' ');
src = src.slice(0, j) + body.trimStart() + src.slice(end);
fs.writeFileSync(SRC, src);

// 自检
const n = merged.questions.length;
const imgs = merged.questions.reduce(
  (a, q) => a + (q.stemParts || []).filter((p) => p.t === 'img').length, 0);
console.log(`已写入 p2023：${n} 题，${imgs} 张插图`);
