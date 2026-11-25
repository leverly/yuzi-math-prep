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
    if (typeof text !== 'string') return text == null ? '' : String(text);
    if (text.indexOf('$') < 0 && text.indexOf('**') < 0) return text;

    /* 先换公式，再换加粗。
       顺序有理由：解析文本里存在 **$a$ 必须在 [1,10) 之间** 这种写法——
       加粗范围包含公式。先换公式会先把 $a$ 变成 <svg>，
       此时 ** 之间夹的是标签，正则仍能匹配到首尾，结果是安全的；
       反过来先换加粗，$ 还在文本里，后续公式替换不受影响。
       两种都可行，但先换公式能避免「加粗内容里的 $ 被跳过」。 */
    let out = text;
    if (out.indexOf('$') >= 0) {
      out = out.replace(MATH_RE, (_all, block, inline) => {
        if (block != null) {
          return '<span class="math math-block">' + toSvg(block.trim(), true) + '</span>';
        }
        return '<span class="math math-inline">' + toSvg(inline.trim(), false) + '</span>';
      });
    }
    /* **粗体** → <b>粗体</b>。
       为什么在这里做而不是让数据层写 <b>：解析数据有 149 处 **…**，
       逐个改成 HTML 既容易漏也污染数据（数据应是纯文本 + 轻标记）。
       也不引入完整 Markdown 解析器——只需要这一种标记，
       加一个正则就够，多引一个依赖反而增加断网风险。 */
    if (out.indexOf('**') >= 0) {
      out = out.replace(/\*\*([^*]+?)\*\*/g, '<b>$1</b>');
    }
    /* 换行转 <br>。
       解析数据的段落分隔就是 \n（有的地方是 \n\n）。
       CSS 里不能用 white-space: pre-wrap 兜底——那会把源码缩进也渲染出来。
       所以在渲染这一步显式转换：\n\n 当空行（留一个 <br> 加间距），\n 当换行。
       注意顺序：必须在公式与加粗都换完之后做，
       否则会把 <svg>/<b> 标签内部的属性换行也转掉。 */
    if (out.indexOf('\n') >= 0) {
      out = out.replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');
    }
    return out;
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
