#!/usr/bin/env python3
"""裁掉真题图四周的空白边距。

为什么必须裁：MathType / Word 导出的公式图 PNG 自带大块空白——
实测 p2024-q3 的四个选项图是 128×112，实际笔画只占 66px 高（59%）。
CSS 按 max-height 缩放时，空白也一起被算进高度，
结果「图看着和正文一样高，但里面的数字小、四周空一片」；
学生看到的就是选项数字比题干大得多、还散。

做法：按 alpha 或「非白像素」求内容包围盒，四周留 2px 余量再裁。
不改变缩放逻辑，只去掉无用留白——所以不会让字变小或变大，
只是让 max-height 真正作用在笔画上。

重要：assets/exam-src/ 被 .gitignore 排除（真题图属他人版权内容），
所以裁图结果不进仓库。换机器 / 重新抽取后必须再跑一次本脚本，
否则选项和题干里的公式图会带着大边距，显示比例不对。

完整重建顺序：
    python3 tools/exam-extract/extract-p2023-pdf.py   # 或各卷的 extract*.py
    python3 tools/exam-extract/merge-p2023.cjs
    python3 tools/exam-extract/trim-figures.py        # ← 本脚本
    node tools/exam-extract/build-exam-bank.cjs
    node build-site.mjs

用法：
    python3 tools/exam-extract/trim-figures.py --dry-run   # 只看统计
    python3 tools/exam-extract/trim-figures.py             # 实际裁
"""
import glob
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'assets', 'exam-src')
PAPERS = ['p2021', 'p2022', 'p2023', 'p2024', 'p2025']
PAD = 2          # 裁完四周留的余量（px）
MIN_KEEP = 0.90  # 内容占比超过这个就不裁（几乎没边距）


def content_box(im):
    """返回非空白内容的包围盒 (x0, y0, x1, y1)，全空白返回 None。"""
    rgba = im.convert('RGBA')
    a = __import__('numpy').array(rgba)
    if a.shape[2] == 4 and a[:, :, 3].min() < 250:
        mask = a[:, :, 3] > 10                      # 有 alpha 通道：看透明度
    else:
        mask = (a[:, :, :3] < 240).any(axis=2)      # 无 alpha：看非白像素
    ys, xs = mask.nonzero()
    if len(ys) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def main():
    dry = '--dry-run' in sys.argv
    total = trimmed = 0
    saved_px = 0
    for paper in PAPERS:
        for p in sorted(glob.glob(os.path.join(SRC, paper, '*.png'))):
            try:
                im = Image.open(p)
            except Exception:
                continue
            total += 1
            box = content_box(im)
            if not box:
                continue
            x0, y0, x1, y1 = box
            cw, ch = x1 - x0, y1 - y0
            # 几乎没边距就跳过，避免反复裁把 1px 内容裁没
            if cw >= im.width * MIN_KEEP and ch >= im.height * MIN_KEEP:
                continue
            nx0 = max(0, x0 - PAD)
            ny0 = max(0, y0 - PAD)
            nx1 = min(im.width, x1 + PAD)
            ny1 = min(im.height, y1 + PAD)
            if nx1 - nx0 < 4 or ny1 - ny0 < 4:
                continue
            trimmed += 1
            saved_px += im.width * im.height - (nx1 - nx0) * (ny1 - ny0)
            if not dry:
                im.crop((nx0, ny0, nx1, ny1)).save(p)
    verb = '将裁' if dry else '已裁'
    print(f'扫描 {total} 张，{verb} {trimmed} 张，'
          f'省下约 {saved_px / 1e6:.2f} 百万像素')


if __name__ == '__main__':
    main()
