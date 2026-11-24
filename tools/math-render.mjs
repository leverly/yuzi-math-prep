/* ==========================================================
   公式渲染器（构建期）
   MathJax v3 → SVG，全局字形缓存。
   每条公式输出 <svg><use xlink:href="#MJX-TEX-...">，
   字形路径集中在 <defs> 里，每页只注入一次。

   用法：
     const mr = createMathRenderer();
     mr.render('$x^2$')            → '<span class="math">…svg…</span>'
     mr.render('$$\\frac12$$')     → '<div class="math math-block">…svg…</div>'
     mr.defs()                     → 共享 <svg><defs>…</defs></svg> 字符串
     mr.failures()                 → [{ tex, err }]
   ========================================================== */
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';

/** 行内 $...$ 与行间 $$...$$；反斜杠转义的 \$ 不匹配。 */
const MATH_RE = /\$\$([\s\S]+?)\$\$|(?<!\\)\$((?:\\\$|[^$\n])+?)\$/g;

export function createMathRenderer() {
  const adaptor = liteAdaptor();
  RegisterHTMLHandler(adaptor);
  const tex = new TeX({ packages: AllPackages });
  const out = new SVG({ fontCache: 'global' });
  const doc = mathjax.document('', { InputJax: tex, OutputJax: out });

  const cache = new Map();   // tex -> svg string
  const failures = [];

  function toSvg(texStr, display) {
    const key = (display ? 'D:' : 'I:') + texStr;
    if (cache.has(key)) return cache.get(key);
    let svg;
    try {
      const node = doc.convert(texStr, { display });
      const html = adaptor.outerHTML(node);
      const m = html.match(/<svg[\s\S]*<\/svg>/);
      if (!m) throw new Error('no <svg> in output');
      svg = m[0];
    } catch (err) {
      failures.push({ tex: texStr, err: err.message });
      svg = '<span class="math-err" title="公式渲染失败">' + escapeHtml(texStr) + '</span>';
    }
    cache.set(key, svg);
    return svg;
  }

  /** 渲染一段含 $...$ 的文本，返回 HTML 片段 */
  function render(text) {
    if (typeof text !== 'string' || text.indexOf('$') < 0) return text == null ? '' : String(text);
    return text.replace(MATH_RE, (_all, block, inline) => {
      if (block != null) {
        return '<span class="math math-block">' + toSvg(block.trim(), true) + '</span>';
      }
      return '<span class="math math-inline">' + toSvg(inline.trim(), false) + '</span>';
    });
  }

  /** 递归渲染对象/数组里的所有字符串字段 */
  function deep(value) {
    if (typeof value === 'string') return render(value);
    if (Array.isArray(value)) return value.map(deep);
    if (value && typeof value === 'object') {
      const o = {};
      for (const k of Object.keys(value)) o[k] = deep(value[k]);
      return o;
    }
    return value;
  }

  /**
   * 供图形内嵌用：返回**裸 <svg>**（不带 span 包裹）。
   * span 是 HTML 元素，放进 SVG 里会被忽略，导致内层 svg 失去定位。
   * 同时把 MathJax 的 ex 尺寸换成固定像素（SVG 里没有可靠的 ex 基准）。
   */
  function renderSized(text, pxPerEx = 6.6) {
    const html = render(text);
    const m = html.match(/<svg[\s\S]*<\/svg>/);
    if (!m) return '';
    return m[0].replace(/<svg([^>]*)>/, (all, attrs) => {
      const w = /width="([\d.]+)ex"/.exec(attrs);
      const h = /height="([\d.]+)ex"/.exec(attrs);
      let a = attrs.replace(/\s*style="[^"]*"/, '');
      if (w) a = a.replace(/width="[\d.]+ex"/, 'width="' + (Number(w[1]) * pxPerEx).toFixed(1) + '"');
      if (h) a = a.replace(/height="[\d.]+ex"/, 'height="' + (Number(h[1]) * pxPerEx).toFixed(1) + '"');
      return '<svg' + a + '>';
    });
  }

  /** 共享字形 <defs>，每页注入一次。
      fontCache.defs 是 LiteElement（不是字符串），必须用 adaptor 序列化；
      它已自带 <defs> 包裹，外层 svg 只要尺寸为 0 即可。 */
  function defs() {
    const d = out.fontCache && out.fontCache.defs;
    if (!d) return '';
    const inner = typeof d === 'string' ? d : adaptor.outerHTML(d);
    return '<svg class="math-defs" width="0" height="0" aria-hidden="true" focusable="false">' +
      inner + '</svg>';
  }

  /**
   * 精简 SVG：供 JSON 内联到分片时用。
   *
   * 关键：MathJax 输出用双引号，塞进 JSON 会被转义成 \"，体积翻倍。
   * 这里把所有属性引号改成单引号，JSON 就不需要转义。
   * 同时去掉对渲染无用的属性（data-mml-node 是调试标记，aria 与 xmlns:xlink 在
   * 内联 SVG 里可省——xlink:href 在 HTML5 里直接用 href 即可）。
   */
  function compact(svg) {
    if (!svg) return '';
    return svg
      .replace(/ data-mml-node="[^"]*"/g, '')
      .replace(/ role="img"/g, '')
      .replace(/ focusable="false"/g, '')
      .replace(/ xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/g, '')
      .replace(/xlink:href=/g, 'href=')
      // 属性引号 → 单引号，避免 JSON 转义
      .replace(/="([^"]*)"/g, "='$1'");
  }

  return {
    render,
    renderSized,
    compact,
    deep,
    defs,
    failures: () => failures.slice(),
    stats: () => ({ distinct: cache.size, bytes: [...cache.values()].reduce((a, s) => a + s.length, 0) }),
  };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
