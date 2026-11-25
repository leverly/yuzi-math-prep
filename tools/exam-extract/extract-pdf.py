#!/usr/bin/env python3
"""
PDF 真题抽取器（2025-26 卷专用）
------------------------------------------------------------------
这份是 PDF 且带完整解析，格式与前几套 docx 不同：
  题干形如「1．（2 分）·【易】﹣6 的相反数是（      ）」
  选项形如「A．﹣6   B．6   C．﹣   D．」
公式仍是图形（PDF 文字层丢失），因此题干会缺公式，需靠原卷页图核对。

输出 dist/exam-src 之外：assets/exam-src/p2025.json + 页图
"""
import re, os, json, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, '真题试卷', '数学', '2025-2026学年北京市西城区七年级（上）期末数学试卷.pdf')
OUT = os.path.join(ROOT, 'assets', 'exam-src')
os.makedirs(OUT, exist_ok=True)


def extract_text():
    tmp = '/tmp/ex/p2025.txt'
    os.makedirs('/tmp/ex', exist_ok=True)
    subprocess.run(['pdftotext', '-layout', SRC, tmp], check=False,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return open(tmp, encoding='utf-8', errors='ignore').read()


def main():
    txt = extract_text()
    # 只取原卷部分（到「参考答案」为止）
    cut = txt.find('参考答案与试题解析')
    paper = txt[:cut] if cut > 0 else txt

    lines = paper.split('\n')
    qs = []
    cur = None
    # 题号行：1．（2 分）·【易】...
    # ① 题号独占一行：8．
    QNO = re.compile(r'^\s*(\d{1,2})．\s*$')
    # ② 题号与分值同一行：1．（2 分）·【易】...
    QRE = re.compile(r'^\s*(\d{1,2})．\s*[（(]\s*\d+\s*分\s*[）)]\s*·?\s*【(.*?)】\s*(.*)$')
    # ③ 续行：  （2 分）·【中档】题干...
    QCONT = re.compile(r'^\s*[（(]\s*\d+\s*分\s*[）)]\s*·?\s*【(.*?)】\s*(.*)$')
    pending_no = [None]
    OPTRE = re.compile(r'^\s*[A-D]．')

    for ln in lines:
        s = ln.rstrip()
        if not s.strip():
            continue
        # 跳过页眉页脚
        if re.search(r'第\s*\d+\s*页（共\s*\d+\s*页）', s):
            continue
        if re.search(r'^\s*\d{4}-\d{4}\s*学年北京市西城区', s):
            continue

        # 纯题号行：记下题号，等下一行的（N 分）·【难度】
        mn = QNO.match(s)
        if mn:
            pending_no[0] = int(mn.group(1))
            continue

        m = QRE.match(s)
        if not m and pending_no[0] is not None:
            m = QCONT.match(s)
            if m:
                if cur:
                    qs.append(cur)
                cur = {
                    'no': pending_no[0],
                    'diffTag': m.group(1).strip(),
                    'stemText': m.group(2).strip(),
                    'rawParas': [s.strip()],
                    'options': [],
                }
                pending_no[0] = None
                continue
        if m:
            if cur:
                qs.append(cur)
            cur = {
                'no': int(m.group(1)),
                'diffTag': m.group(2).strip(),
                'stemText': m.group(3).strip(),
                'rawParas': [s.strip()],
                'options': [],
            }
            continue
        if cur is None:
            continue
        # 章节标题/说明行不并入题干（含跨行拆开的续行）
        if re.match(r'^\s*[一二三四]、', s) or re.match(r'^\s*解答应写出', s):
            continue
        if re.match(r'^\s*题\s*\d+\s*分[，,].*分[）)]', s) or '解答应写出文字说明' in s:
            continue

        cur['rawParas'].append(s.strip())
        if OPTRE.match(s):
            # 一行里可能挤多个选项
            parts = re.split(r'\s*(?=[A-D]．)', s.strip())
            for p in parts:
                p = p.strip()
                if re.match(r'^[A-D]．', p):
                    key = p[0]
                    cur['options'].append({'key': key, 'text': p, 'parts': [{'t': 'text', 'v': p[2:].strip()}]})
        else:
            if not cur['options']:
                cur['stemText'] += ' ' + s.strip()
            else:
                # 选项之后的续行（如「（1）...」小问）也算题干
                cur['stemText'] += ' ' + s.strip()
    if cur:
        qs.append(cur)

    # 清理：题干里若混入「三、解答题（共 68 分…」这类章节标题，截掉
    SEC = re.compile(r'\s*[一二三四]、\s*(选择题|填空题|解答题|选做题)\s*[（(][^）)]*[）)]\s*(解答应写出[^。]*。)?')
    for q in qs:
        q['stemText'] = SEC.sub(' ', q['stemText']).strip()
        q['stemText'] = re.sub(r'\s+', ' ', q['stemText'])
        # rawParas 里也清
        q['rawParas'] = [SEC.sub(' ', x).strip() for x in q['rawParas'] if SEC.sub('', x).strip()]

    out = {
        'tag': 'p2025',
        'source': os.path.basename(SRC),
        'qcount': len(qs),
        'imgCount': 0,
        'note': 'PDF 源，公式为图形，文本层不含公式；题干缺公式处需对照原卷页图',
        'questions': [{
            'no': q['no'],
            'diffTag': q['diffTag'],
            'stemText': q['stemText'].strip(),
            'stemParts': [{'t': 'text', 'v': q['stemText'].strip()}],
            'options': q['options'],
            'rawParas': q['rawParas'],
        } for q in qs],
    }
    p = os.path.join(OUT, 'p2025.json')
    json.dump(out, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"p2025 → {len(qs)} 题（{sum(1 for q in qs if q['options'])} 题带选项）")


if __name__ == '__main__':
    main()
