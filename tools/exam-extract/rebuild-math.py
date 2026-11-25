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
            words.append({'x0': float(x0), 'y0': float(y0),
                          'x1': float(x1), 'y1': float(y1),
                          'w': w, 'h': float(y1) - float(y0)})
        pages.append(words)
    return pages


def base_height(words):
    hs = sorted(w['h'] for w in words if w['h'] > 1)
    return hs[len(hs) // 2] if hs else 10.0


def build_fractions(words, base_h):
    """全页配对分数，返回 (剩余 words, 分数原子列表)。"""
    small = [w for w in words if w['h'] < base_h * 0.92]
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
            dx = abs((a['x0'] + a['x1']) / 2 - (b['x0'] + b['x1']) / 2)
            if dx > 3.0:
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
                      'text': (f.get('prefix', '') + f['num']['w'] + '/' + f['den']['w']),
                      'kind': 'frac'})
    return atoms


def group_lines(atoms):
    """按垂直区间重叠率 > 50% 聚行。"""
    if not atoms:
        return []
    atoms = sorted(atoms, key=lambda d: (d['y0'] + d['y1']) / 2)
    lines, cur = [], [atoms[0]]
    cy0, cy1 = atoms[0]['y0'], atoms[0]['y1']
    for a in atoms[1:]:
        lo, hi = max(cy0, a['y0']), min(cy1, a['y1'])
        ov = max(0.0, hi - lo)
        smaller = min(cy1 - cy0, a['y1'] - a['y0']) or 1e-6
        if ov / smaller > 0.5:
            cur.append(a)
            cy0, cy1 = min(cy0, a['y0']), max(cy1, a['y1'])
        else:
            lines.append(cur)
            cur = [a]
            cy0, cy1 = a['y0'], a['y1']
    lines.append(cur)
    return lines


def render_line(atoms, base_h):
    atoms = sorted(atoms, key=lambda d: d['x0'])
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
    """检测双栏排版：若大量 word 集中在 x 中心线两侧且中间有明显空白，
    返回 (左栏 words, 右栏 words)；否则返回 (words, [])。"""
    if not words:
        return words, []
    mid = page_w / 2
    # 用「跨越中线的 word」判断是否为单栏：正文跨中线说明单栏
    crossing = [w for w in words if w['x0'] < mid - 6 and w['x1'] > mid + 6]
    if len(crossing) >= max(3, len(words) * 0.02):
        return words, []
    left = [w for w in words if w['x1'] <= mid + 4]
    right = [w for w in words if w['x0'] >= mid - 4]
    # 两侧都要有实质内容才算双栏
    if len(left) < 8 or len(right) < 8:
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
            for ln in group_lines(atoms):
                s = render_line(ln, bh).strip()
                if s:
                    print(s)


if __name__ == '__main__':
    main()
