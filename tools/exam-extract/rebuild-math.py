#!/usr/bin/env python3
"""从 pdftotext -bbox-layout 的坐标信息重建 p2023 的公式排版。

pdftotext -layout 会把分数拆成上下两行、把上标拆成孤立小字，导致
「3/4」「10^4」「31°15′」这类结构全丢。本脚本改用每个 word 的精确
包围盒，按几何关系还原：

  1. 全页配对分数：x 中心重合 + 上下相邻 + 两侧字号都偏小 → a/b
     （负号若垂直居中于分数带内且紧邻左侧，并入分子前缀）
  2. 按「垂直区间重叠 > 50%」聚行（比按 y 中心聚类稳，分数跨行也对）
  3. 行内识别上标/下标：字号 < 0.78 基准 且 基线明显偏移
  4. 输出 Unicode 数学符号（² ⁴ ′ ° × −），站点可直接渲染

用法：
    python3 -I rebuild-math.py /tmp/p23full.html            # 打印全部页
    python3 -I rebuild-math.py /tmp/p23full.html 1 3        # 只打印第 1-3 页
"""
import re
import sys

# Symbol 字体私用区编码 → 标准 Unicode
SYMBOL_MAP = {
    '\uf03e': '>', '\uf03c': '<', '\uf03d': '=', '\uf02b': '+', '\uf02d': '−',
    '\uf0b4': '×', '\uf0b8': '÷', '\uf0a3': '≤', '\uf0b3': '≥',
    '\uf0b0': '°', '\uf0a2': '′', '\uf0d0': '∠', '\uf0d1': '△',
    '\uf0b1': '±', '\uf0b7': '·', '\uf0a5': '∞', '\uf0bb': '≈', '\uf0b9': '≠',
    '\uf0c6': 'Φ', '\uf061': 'α', '\uf062': 'β', '\uf067': 'γ', '\uf071': 'θ',
    '\uf070': 'π', '\uf0e5': '∑', '\uf0f2': '∫',
    '\uf028': '(', '\uf029': ')', '\uf05b': '[', '\uf05d': ']',
    '\uf05c': '∴', '\uf0c4': '⊗', '\uf0bc': '…',
    # 大括号/圆括号碎片（MathType 分式与矩阵用），统一降级为圆括号
    '\uf0e6': '(', '\uf0e7': '(', '\uf0e8': '(', '\uf0e9': '(', '\uf0eb': '(',
    '\uf0f6': ')', '\uf0f7': ')', '\uf0f8': ')', '\uf0f9': ')', '\uf0fb': ')',
    '\uf0d6': '√', '\uf0b2': '·', '\uf0ae': '→', '\uf0ac': '←',
}

# 上标 / 下标可用的 Unicode 字符
SUP = dict(zip('0123456789+-=()n',
               '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ'))
SUB = dict(zip('0123456789+-=()',
               '₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎'))

WORD_RE = re.compile(
    r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</word>'
)


def clean(t):
    return ''.join(SYMBOL_MAP.get(c, c) for c in t)


def to_sup(s):
    if s and all(c in SUP for c in s):
        return ''.join(SUP[c] for c in s)
    return '^{%s}' % s


def to_sub(s):
    if s and all(c in SUB for c in s):
        return ''.join(SUB[c] for c in s)
    return '_{%s}' % s


def parse_pages(path):
    html = open(path, encoding='utf-8', errors='ignore').read()
    pages = []
    for pm in re.finditer(r'<page width="[\d.]+" height="[\d.]+">(.*?)</page>', html, re.S):
        words = []
        for m in WORD_RE.finditer(pm.group(1)):
            x0, y0, x1, y1, w = m.groups()
            w = clean(w)
            if not w.strip():
                continue
            h = float(y1) - float(y0)
            # 丢弃异常高的伪字：PDF 里偶有装饰线/竖排标点被识别成超高 word
            # （实测有一个 '.' 的包围盒高达 205pt，会把整行带撑爆）
            if h > 60:
                continue
            words.append({'x0': float(x0), 'y0': float(y0),
                          'x1': float(x1), 'y1': float(y1),
                          'w': w, 'h': h})
        pages.append(words)
    return pages


def base_height(words):
    hs = sorted(w['h'] for w in words if w['h'] > 1)
    return hs[len(hs) // 2] if hs else 10.0


def build_fractions(words, base_h):
    """全页配对分数，返回 (剩余 words, 分数原子列表)。"""
    # 分子/分母的字号通常只比正文略小（0.85~0.95 倍），A./B. 等标记则与
    # 正文同高且常带句点。用「纯数字且高度不超过正文」来锁定候选，
    # 避免把选项标记当成分子。
    def is_frac_glyph(w):
        t = w['w'].strip()
        if not t:
            return False
        if not all(c.isdigit() or c in '−-' for c in t):
            return False
        return w['h'] <= base_h * 1.02

    small = [w for w in words if is_frac_glyph(w)]
    used = set()
    fracs = []

    # 候选对：a 在上、b 在下，x 中心接近，垂直间隙小，字号相近
    # 关键约束：分数带总高 < 3 倍基准字号，防止把不同行的字跨行配对
    cands = []
    for i, a in enumerate(small):
        for j, b in enumerate(small):
            if i == j or b['y0'] <= a['y1'] - 1:
                continue
            gap = b['y0'] - a['y1']
            if not (0 <= gap <= 9):
                continue
            # 分子分母字号必须接近（排除正文里偶然对齐的两个不同大小字）
            if max(a['h'], b['h']) / max(1e-6, min(a['h'], b['h'])) > 1.35:
                continue
            # 分数带不能跨越行：总高不超过 3 倍基准字号
            if b['y1'] - a['y0'] > base_h * 3.0:
                continue
            # 分子分母必须落在同一列：x 中心差 <= 4pt（多位数分母常居中，
            # 与分子中心有少量偏移），且分母的横向区间不能超出分子太多
            dx = abs((a['x0'] + a['x1']) / 2 - (b['x0'] + b['x1']) / 2)
            if dx > 4.0:
                continue
            if b['x0'] < a['x0'] - 6 or b['x1'] > a['x1'] + 6:
                continue
            cands.append((gap + dx, i, j))

    cands.sort()
    for _, i, j in cands:
        a, b = small[i], small[j]
        ka, kb = id(a), id(b)
        if ka in used or kb in used:
            continue
        used.add(ka)
        used.add(kb)
        fracs.append({'num': a, 'den': b,
                      'x0': min(a['x0'], b['x0']), 'x1': max(a['x1'], b['x1']),
                      'y0': a['y0'], 'y1': b['y1']})

    # 负号前缀：垂直居中于分数带、紧邻左侧
    for f in fracs:
        yc = (f['y0'] + f['y1']) / 2
        best, bestd = None, 1e9
        for w in words:
            if id(w) in used or w['w'] != '−':
                continue
            wyc = (w['y0'] + w['y1']) / 2
            if not (f['y0'] <= wyc <= f['y1']):
                continue
            d = f['x0'] - w['x1']
            if -2 <= d <= 12 and abs(wyc - yc) < abs(bestd):
                best, bestd = w, wyc - yc
        if best is not None:
            used.add(id(best))
            f['x0'] = min(f['x0'], best['x0'])
            f['prefix'] = '−'

    rest = [w for w in words if id(w) not in used]
    return rest, fracs


def make_atoms(words, fracs):
    atoms = []
    for w in words:
        atoms.append({'x0': w['x0'], 'x1': w['x1'], 'y0': w['y0'], 'y1': w['y1'],
                      'h': w['h'], 'text': w['w'], 'kind': 'word'})
    for f in fracs:
        atoms.append({'x0': f['x0'], 'x1': f['x1'], 'y0': f['y0'], 'y1': f['y1'],
                      'h': f['y1'] - f['y0'],
                      'den_y1': f['den']['y1'],
                      'text': (f.get('prefix', '') + f['num']['w'] + '/' + f['den']['w']),
                      'kind': 'frac'})
    return atoms


def group_lines(atoms, base_h):
    """先按正文（正常字号）聚出基线带，再把小字/分数按垂直中心归位。

    不能用「区间重叠率」直接聚行：分数原子高约 2.5 倍基准，会把相邻
    两行桥接成一行。必须先排除高原子再定行，最后回填。
    """
    if not atoms:
        return []

    normal = [a for a in atoms if a['kind'] == 'word' and a['h'] >= base_h * 0.78]
    if not normal:
        normal = [a for a in atoms if a['kind'] == 'word'] or atoms

    # 用正文的垂直中心聚行
    normal = sorted(normal, key=lambda d: (d['y0'] + d['y1']) / 2)
    bands = []
    cur = [normal[0]]
    for a in normal[1:]:
        cy = (a['y0'] + a['y1']) / 2
        ccy = sum((x['y0'] + x['y1']) / 2 for x in cur) / len(cur)
        if abs(cy - ccy) <= base_h * 0.42:
            cur.append(a)
        else:
            bands.append(cur)
            cur = [a]
    bands.append(cur)

    # 每行的垂直带（用该行正文的上下界）
    spans = [(min(a['y0'] for a in b), max(a['y1'] for a in b)) for b in bands]

    # 小字/分数原子：按垂直中心落到最近的行带
    for a in atoms:
        if a['kind'] == 'word' and a['h'] >= base_h * 0.78:
            continue
        # 分数是「行内嵌」对象：分子顶边略高于正文顶边，分母底边与基线齐平。
        # 用「与正文行的垂直重叠量」定归属最稳（分子分母都落在同一行带内）。
        if a['kind'] == 'frac':
            best, bestd = 0, -1e18
            for bi, (y0, y1) in enumerate(spans):
                lo, hi = max(a['y0'], y0), min(a['y1'], y1)
                ov = max(0.0, hi - lo)
                # 同分时取更近的（避免都算 0 时乱归）
                tie = -abs((a['y0'] + a['y1']) / 2 - (y0 + y1) / 2) * 1e-3
                if ov + tie > bestd:
                    best, bestd = bi, ov + tie
            bands[best].append(a)
            continue
        ac = (a['y0'] + a['y1']) / 2
        best, bestd = 0, 1e18
        for bi, (y0, y1) in enumerate(spans):
            bc = (y0 + y1) / 2
            d = abs(ac - bc)
            if d < bestd:
                best, bestd = bi, d
        bands[best].append(a)

    for b in bands:
        b.sort(key=lambda d: d['x0'])
    return bands


def render_line(atoms, base_h):
    atoms = sorted(atoms, key=lambda d: d['x0'])
    # 纯括号行：MathType 分式/矩阵的伸缩括号被拆成上中下碎片，
    # 分数本体已还原，剩下的孤立 () 行是垃圾，直接丢弃
    stripped = ''.join(a['text'] for a in atoms)
    # MathType 伸缩括号的上/下碎片：内容只有括号，或「括号 + 孤立数字」
    # （如 "()2"）。分数本体已还原，这些是残渣，整行丢弃。
    if stripped and re.fullmatch(r'[()（）\[\]]+\d*', stripped):
        return ''

    normal = [a for a in atoms if a['h'] >= base_h * 0.70]
    if normal:
        base_top = sorted(a['y0'] for a in normal)[len(normal) // 2]
        base_bot = sorted(a['y1'] for a in normal)[len(normal) // 2]
    else:
        base_top, base_bot = atoms[0]['y0'], atoms[0]['y1']

    out = []
    i = 0
    while i < len(atoms):
        a = atoms[i]
        # 只有明显偏小的字（< 0.70 基准）才可能是上下标
        is_small = a['kind'] == 'word' and a['h'] < base_h * 0.70
        prev_x1 = atoms[i - 1]['x1'] if i > 0 else -1e9
        adj = a['x0'] - prev_x1 < base_h * 0.6

        # 上标：小字 + 底边明显高于正文底边（抬升 >= 0.25 字高）
        if is_small and out and adj and a['y1'] < base_bot - base_h * 0.25:
            out[-1] += to_sup(a['text'])
            i += 1
            continue
        # 下标：小字 + 顶边明显低于正文顶边（下沉 >= 0.25 字高）
        if is_small and out and adj and a['y0'] > base_top + base_h * 0.25:
            out[-1] += to_sub(a['text'])
            i += 1
            continue

        out.append(a['text'])
        i += 1

    return ''.join(out)


def split_columns(words, page_w=595.32):
    """本卷是单栏排版（每页都有跨中线的长句），不做栏切分。

    保留此函数是为了兼容将来真正的双栏卷：只有当「跨越中线的 word
    极少（< 1%）」且左右两侧都有大量内容时才切成两栏。
    """
    if not words:
        return words, []
    mid = page_w / 2
    crossing = [w for w in words if w['x0'] < mid - 6 and w['x1'] > mid + 6]
    if len(crossing) >= max(2, len(words) * 0.01):
        return words, []
    left = [w for w in words if w['x1'] <= mid + 4]
    right = [w for w in words if w['x0'] >= mid - 4]
    if len(left) < 20 or len(right) < 20:
        return words, []
    return left, right


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else '/tmp/p23full.html'
    lo = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    hi = int(sys.argv[3]) if len(sys.argv) > 3 else 10 ** 6
    pages = parse_pages(path)
    for pno, words in enumerate(pages, 1):
        if not (lo <= pno <= hi):
            continue
        left, right = split_columns(words)
        cols = [left, right] if right else [left]
        print(f'===== page {pno} =====')
        for ci, col in enumerate(cols):
            if not col:
                continue
            bh = base_height(col)
            rest, fracs = build_fractions(col, bh)
            atoms = make_atoms(rest, fracs)
            for ln in group_lines(atoms, bh):
                s = render_line(ln, bh).strip()
                if s:
                    print(s)


if __name__ == '__main__':
    main()
