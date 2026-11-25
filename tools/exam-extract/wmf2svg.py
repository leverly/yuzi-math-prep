#!/usr/bin/env python3
"""
精简 WMF → SVG 转换器（只处理 MathType 公式需要的子集）
------------------------------------------------------------------
为什么自己写：本机没有可用的 WMF 转换工具（sips/qlmanage/libreoffice
都失败或卡死）。但 MathType 导出的 WMF 结构简单——主要是
ExtTextOut（文字）+ MoveTo/LineTo（分数线、根号）+ 少量矩形，
可以解析成 SVG。

只处理这些记录：
  0x0a32 ExtTextOut   文字（含位置、字高）
  0x0214 MoveTo       移动当前点
  0x0213 LineTo       画线
  0x041b Rectangle    矩形
  0x02fb CreateFont   字体高度（用于估字号）
  0x020b SetWindowOrg / 0x020c SetWindowExt  坐标范围

不处理：曲线、位图、渐变。公式里极少出现，出现就退化。
"""
import struct, sys, os, re, json


def parse_wmf(path):
    d = open(path, 'rb').read()
    if d[:4] == b'\xd7\xcd\xc6\x9a':      # placeable header
        off = 22
    elif d[:4] == b'\x01\x00\x00\x00':
        off = 0
    else:
        return None
    off += 18                              # WMF header

    org = [0, 0]
    ext = [1000, 1000]
    font_h = 200
    align = 0                              # SetTextAlign 位标志
    items = []                             # {type, ...}
    cur = [0, 0]

    while off + 6 <= len(d):
        size, func = struct.unpack('<IH', d[off:off + 6])
        if size == 0 or size < 3:
            break
        body = d[off + 6:off + size * 2]
        try:
            if func == 0x020b:             # SetWindowOrg
                y, x = struct.unpack('<hh', body[:4]); org = [x, y]
            elif func == 0x020c:           # SetWindowExt
                y, x = struct.unpack('<hh', body[:4]); ext = [x or 1000, y or 1000]
            elif func == 0x02fb:           # CreateFont
                h = struct.unpack('<h', body[:2])[0]; font_h = abs(h) or font_h
            elif func == 0x012e:           # SetTextAlign
                align = struct.unpack('<H', body[:2])[0]
            elif func == 0x0214:           # MoveTo
                y, x = struct.unpack('<hh', body[:4]); cur = [x, y]
            elif func == 0x0213:           # LineTo
                y, x = struct.unpack('<hh', body[:4])
                items.append({'t': 'line', 'a': list(cur), 'b': [x, y]})
                cur = [x, y]
            elif func == 0x0a32:           # ExtTextOut
                if len(body) >= 8:
                    y, x, cnt, opts = struct.unpack('<hhHH', body[:8])
                    # MathType 导出的 ExtTextOut 坐标常为 0，真实位置是
                    # 上一条 MoveTo 设定的当前点
                    if x == 0 and y == 0:
                        x, y = cur
                    # WMF 的 cch 是字符数；字符串按单字节 ANSI 存，
                    # 但实测 body 长度是 8 + cch*2 + 2，说明这里用的是
                    # 「宽字符」布局。取前 cch 个字符（跳过每字符的高字节 0）。
                    raw = body[8:8 + cnt * 2]
                    txt = ''.join(chr(raw[i]) for i in range(0, len(raw) - 1, 2)
                                  if raw[i] != 0)
                    items.append({'t': 'text', 'x': x, 'y': y, 'align': align,
                                  's': txt, 'h': font_h})
            elif func == 0x041b:           # Rectangle
                b, r, t, l = struct.unpack('<hhhh', body[:8])
                items.append({'t': 'rect', 'x': l, 'y': t, 'w': r - l, 'h': b - t})
        except struct.error:
            pass
        off += size * 2

    return {'org': org, 'ext': ext, 'items': items}


def to_svg(m, pad=4):
    items = m['items']
    if not items:
        return None
    xs, ys = [], []
    for it in items:
        if it['t'] == 'line':
            xs += [it['a'][0], it['b'][0]]; ys += [it['a'][1], it['b'][1]]
        elif it['t'] == 'text':
            xs.append(it['x']); ys.append(it['y'])
        elif it['t'] == 'rect':
            xs += [it['x'], it['x'] + it['w']]; ys += [it['y'], it['y'] + it['h']]
    if not xs:
        return None
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    # 文字有字高，向上留空间
    y0 -= max(it.get('h', 200) for it in items if it['t'] == 'text') if any(it['t'] == 'text' for it in items) else 0
    w = max(x1 - x0, 1); h = max(y1 - y0, 1)
    vw, vh = w + pad * 2, h + pad * 2

    parts = []
    for it in items:
        if it['t'] == 'line':
            parts.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#111" stroke-width="%.1f"/>'
                         % (it['a'][0] - x0 + pad, it['a'][1] - y0 + pad,
                            it['b'][0] - x0 + pad, it['b'][1] - y0 + pad, max(h / 60, 2)))
        elif it['t'] == 'rect':
            parts.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" stroke="#111"/>'
                         % (it['x'] - x0 + pad, it['y'] - y0 + pad, it['w'], it['h']))
        elif it['t'] == 'text':
            s = it['s']
            if not s.strip():
                continue
            # MathType 在 WMF 里用 ASCII 近似表示数学符号
            s = s.replace('<-', '←').replace('->', '→')
            s = s.replace('<=', '≤').replace('>=', '≥')
            s = s.replace('!=', '≠').replace('*', '×')
            s = (s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))
            al = it.get('align', 0)
            anchor = 'start'
            tx = it['x'] - x0 + pad
            # WMF SetTextAlign 位：
            #   1  TA_UPDATECP    位置取当前点（已处理）
            #   2  TA_RIGHT       x 是右边界
            #   4  TA_CENTER      x 是中心
            #   16 TA_RTLREADING  从右向左读 → 起点在右，文字向左延伸
            if al & 16:
                anchor = 'end'          # 右端对齐，文字向左画
            elif al & 2:
                anchor = 'end'
            elif al & 4:
                anchor = 'middle'
            parts.append('<text x="%.1f" y="%.1f" text-anchor="%s" font-family="Times New Roman, serif" font-size="%.1f" fill="#111">%s</text>'
                         % (tx, it['y'] - y0 + pad, anchor, abs(it['h']) * 0.75, s))
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %.0f %.0f" width="%.0f" height="%.0f">%s</svg>'
            % (vw, vh, vw, vh, ''.join(parts)))


def main():
    if len(sys.argv) < 3:
        print('用法: wmf2svg.py <输入.wmf> <输出.svg>'); return
    m = parse_wmf(sys.argv[1])
    if not m:
        print('不是可识别的 WMF'); return
    svg = to_svg(m)
    if not svg:
        print('无可用绘图内容'); return
    open(sys.argv[2], 'w', encoding='utf-8').write(svg)
    print('OK →', sys.argv[2], len(svg), '字节')


if __name__ == '__main__':
    main()
