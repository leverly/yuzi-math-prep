#!/usr/bin/env python3
"""
p2023 PDF 版提取器（2023-2024 教师版，21 页）
------------------------------------------------------------------
这份 PDF 质量好：文字层完整、公式用 ASCII 近似、插图是位图。
结构：
  第 1-6 页 = 原卷（26 题）
  第 7 页起 = 参考答案与解析（含【答案】）

产出：
  assets/exam-src/p2023.json     题目（题干/选项，含插图引用）
  assets/exam-src/p2023-answers.json  答案
  assets/exam-src/pages/p2023-NN.png  原卷页图
"""
import re, os, json, subprocess, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, '真题试卷', '数学', '2023-2024北京西城初一（上）期末数学（教师版）.pdf')
OUT = os.path.join(ROOT, 'assets', 'exam-src')
TXT = '/tmp/ex/p2023pdf.txt'
os.makedirs(OUT, exist_ok=True)
os.makedirs('/tmp/ex', exist_ok=True)



# Symbol 字体的私用区编码（F0xx）→ 标准 Unicode
SYMBOL_MAP = {
    '\uf03e': '>', '\uf03c': '<', '\uf03d': '=', '\uf02b': '+', '\uf02d': '-',
    '\uf0b4': '×', '\uf0b8': '÷', '\uf0a3': '≤', '\uf0b3': '≥',
    '\uf0b0': '°', '\uf0d0': '∠', '\uf0d1': '△', '\uf0b1': '±',
    '\uf0b7': '·', '\uf0a5': '∞', '\uf0bb': '≈', '\uf0b9': '≠',
    '\uf0c6': 'Φ', '\uf061': 'α', '\uf062': 'β', '\uf067': 'γ',
    '\uf071': 'θ', '\uf070': 'π', '\uf0e5': '∑', '\uf0f2': '∫',
    '\uf028': '(', '\uf029': ')', '\uf05b': '[', '\uf05d': ']',
}


def clean_symbols(t):
    """把 Symbol 字体私用区字符还原成标准符号"""
    return ''.join(SYMBOL_MAP.get(c, c) for c in t)

def get_text():
    subprocess.run(['pdftotext', '-layout', SRC, TXT], check=False,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return open(TXT, encoding='utf-8', errors='ignore').read()


def main():
    txt = get_text()
    # 原卷部分：到「参考答案」为止
    cut = txt.find('参考答案')
    paper = txt[:cut] if cut > 0 else txt

    lines = paper.split('\n')
    QRE = re.compile(r'^\s*(\d{1,2})[.．]\s*(.*)$')
    # 缺点的写法（如「18 如图」）：数字后跟空格 + 中文
    QRE2 = re.compile(r'^\s*(\d{1,2})\s+([\u4e00-\u9fa5].*)$')
    OPT = re.compile(r'^\s*[A-D][.．]')

    qs = []
    cur = None
    started = False
    for ln in lines:
        s = ln.rstrip()
        if not s.strip():
            continue
        if re.search(r'第\s*\d+\s*页/共\s*\d+\s*页', s) or '学科网' in s:
            continue
        # 正文起点：一、选择题
        if re.match(r'^\s*一、选择题', s):
            started = True
            continue
        if not started:
            continue
        if re.match(r'^\s*[一二三四]、', s) or re.match(r'^\s*第[一二]部分', s):
            continue

        m = QRE.match(s) or QRE2.match(s)
        if m and 1 <= int(m.group(1)) <= 26:
            no = int(m.group(1))
            # 题号必须递增（否则是正文里的数字被误认）
            if cur is not None and no <= cur['no']:
                m = None
            else:
                if cur:
                    qs.append(cur)
                cur = {'no': no, 'stemText': m.group(2).strip(),
                       'rawParas': [s.strip()], 'options': []}
                continue
        if False:
            pass
        if cur is None:
            continue

        cur['rawParas'].append(s.strip())
        if OPT.match(s):
            # 一行可能挤多个选项
            parts = re.split(r'\s{2,}(?=[A-D][.．])|(?<=[^\s])\s*(?=[A-D][.．])', s.strip())
            for p in parts:
                p = p.strip()
                mm = re.match(r'^([A-D])[.．]\s*(.*)$', p)
                if mm:
                    cur['options'].append({'key': mm.group(1), 'text': p,
                                           'parts': [{'t': 'text', 'v': mm.group(2).strip()}]})
        else:
            if not cur['options']:
                cur['stemText'] += ' ' + s.strip()

    if cur:
        qs.append(cur)

    out = {
        'tag': 'p2023',
        'source': os.path.basename(SRC),
        'qcount': len(qs),
        'imgCount': 0,
        'note': 'PDF 源（教师版），文字层完整，公式为 ASCII 近似；插图见 figureMap',
        'questions': [{
            'no': q['no'],
            'stemText': clean_symbols(q['stemText'].strip()),
            'stemParts': [{'t': 'text', 'v': clean_symbols(q['stemText'].strip())}],
            'options': q['options'],
            'rawParas': q['rawParas'],
        } for q in qs],
    }
    json.dump(out, open(os.path.join(OUT, 'p2023.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f"p2023 原卷 → {len(qs)} 题（{sum(1 for q in qs if q['options'])} 题带选项）")

    # 答案部分：抓「N. 【答案】」到「【解析】」之间的全部内容
    # （解答题的答案可能跨多行，如「（1）x=7 （2）x=-1」）
    ans_sec = txt[cut:] if cut > 0 else ''
    ans = {}
    cur_no = None
    collecting = False
    buf = []
    for ln in ans_sec.split('\n'):
        m = re.match(r'^\s*(\d{1,2})[.．]\s*【答案】\s*(.*)$', ln)
        if m:
            # 收尾上一题
            if cur_no and buf:
                ans[cur_no]['answer'] = ' '.join(x for x in buf if x).strip()
            cur_no = int(m.group(1))
            raw_ans = m.group(2).strip()
            # 选择题答案只取开头的 A/B/C/D（后面常跟着「的」「．」等杂字）
            if 1 <= cur_no <= 8:
                mm = re.match(r'^([A-D])', raw_ans)
                raw_ans = mm.group(1) if mm else raw_ans
            ans[cur_no] = {'answer': raw_ans,
                           'kind': 'choice' if 1 <= cur_no <= 8 else 'fill'}
            buf = [m.group(2).strip()] if m.group(2).strip() else []
            # 选择题答案只有一行（A/B/C/D），不收集后续
            collecting = cur_no > 8
            continue
        if collecting and '【解析】' in ln:
            if cur_no and buf:
                v = ' '.join(x for x in buf if x)
                v = re.sub(r'学科网[^\s]*|第\s*\d+\s*页/共\s*\d+\s*页', '', v)
                ans[cur_no]['answer'] = clean_symbols(re.sub(r'\s+', ' ', v).strip())
            collecting = False
            buf = []
            continue
        if collecting:
            t = ln.strip()
            if not t or t.startswith('【'):
                continue
            # 过滤页眉页脚
            if '学科网' in t or re.search(r'第\s*\d+\s*页/共', t):
                continue
            buf.append(t)
    json.dump({str(k): v for k, v in ans.items()},
              open(os.path.join(OUT, 'p2023-answers.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    got = sum(1 for v in ans.values() if v.get('answer'))
    print(f"p2023 答案 → {got} 题")

    # 原卷页图（前 6 页）
    pdir = os.path.join(OUT, 'pages')
    os.makedirs(pdir, exist_ok=True)
    subprocess.run(['pdftoppm', '-png', '-r', '130', '-f', '1', '-l', '6', SRC,
                    os.path.join(pdir, 'p2023')], check=False,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    n = len([f for f in os.listdir(pdir) if f.startswith('p2023-')])
    print(f"p2023 页图 → {n} 页")

    # ===== 插图绑定 =====
    # 逐张目视确认后的「图片 → 题号」映射（PDF 里图按页序排列，
    # 但题号与图序号不一一对应，所以人工核对过）
    FIG_MAP = {
        'f-005.png': 4,    # 数轴 a≈-2.5, b≈0.5
        'f-010.png': 8,    # 卡片规律 第1/2/3个图形
        'f-011.png': 13,   # 线段 A-C-D-E-B
        'f-012.png': 16,   # 六边形填图 2,4,5,a
        'f-021.png': 18,   # 作图 A,B,C 三点
        'f-032.png': 21,   # 角 AOC=90° + OE
        'f-037.png': 23,   # 动射线 图1 + 备用图
        'f-038.png': 24,   # 数轴 M=-2,O=0,N=1
    }
    figsrc = '/tmp/p23f'
    if os.path.isdir(figsrc):
        byno = {}
        for f, no in FIG_MAP.items():
            sp = os.path.join(figsrc, f)
            if not os.path.exists(sp):
                continue
            dst_name = 'q%d-%s' % (no, f)
            shutil.copy(sp, os.path.join(OUT, 'p2023', dst_name))
            byno.setdefault(no, []).append(dst_name)
        # 写回 json
        pj = os.path.join(OUT, 'p2023.json')
        d2 = json.load(open(pj, encoding='utf-8'))
        for q in d2['questions']:
            names = byno.get(q['no'], [])
            if not names:
                continue
            q['stemParts'].append({'t': 'break'})
            for n in names:
                q['stemParts'].append({'t': 'img', 'src': 'media/' + n, 'kind': 'figure'})
        json.dump(d2, open(pj, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('p2023 插图 → %d 题' % len(byno))



if __name__ == '__main__':
    main()
