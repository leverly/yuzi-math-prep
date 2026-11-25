#!/usr/bin/env python3
"""
真题答案抽取：从解析版 docx 里提取每题的答案
------------------------------------------------------------------
格式：
  1. 题干（ ）
  A. ... B. ... C. ... D. ...
  【答案】A
  【解析】...
  【详解】解：...
  故选A．

选择题 → 答案是一个字母 A/B/C/D
填空题 → 答案是具体内容，可能在【答案】后面
解答题 → 【答案】后是分小问的结果

输出 assets/exam-src/<tag>-answers.json: {no: {type, answer, detail}}
"""
import zipfile, re, os, json, io, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, '真题试卷', '数学')
OUT = os.path.join(ROOT, 'assets', 'exam-src')
os.makedirs(OUT, exist_ok=True)


def paras_of(docx_bytes):
    z = zipfile.ZipFile(io.BytesIO(docx_bytes))
    x = z.read('word/document.xml').decode('utf-8')
    out = []
    for p in re.split(r'</w:p>', x):
        t = ''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', p))
        if t.strip():
            out.append(t.strip())
    return out


def extract_answers(paras, tag):
    """按题号聚合【答案】"""
    res = {}
    cur_no = None
    for i, t in enumerate(paras):
        # 题号行：1. xxx 或 1．xxx
        m = re.match(r'^(\d{1,2})[.．]\s*', t)
        if m and 1 <= int(m.group(1)) <= 26:
            cur_no = int(m.group(1))
            # 同行带答案：1. 【答案】A
            am2 = re.search(r'【答案】\s*(.*)$', t)
            if am2:
                res.setdefault(cur_no, {'answer': am2.group(1).strip(), 'raw': am2.group(1).strip()})
            continue
        if cur_no is None:
            continue
        # 【答案】行
        am = re.search(r'【答案】\s*(.*)$', t)
        if am:
            val = am.group(1).strip()
            if cur_no not in res:
                res[cur_no] = {'answer': val, 'raw': val}
            continue
        # 答案可能在下一行（【答案】单独一行时）
        if t == '【答案】' and i + 1 < len(paras):
            res.setdefault(cur_no, {'answer': paras[i + 1].strip(), 'raw': paras[i + 1].strip()})
    return res


def load_docx_bytes(path):
    with open(path, 'rb') as f:
        return f.read()


def main():
    targets = [
        ('p2024', '精品解析：北京市西城区2024-2025学年七年级上学期期末考试数学试卷 （解析版）.docx'),
        ('p2023', '2023-2024北京西城初一（上）期末数学（教师版）.docx'),
    ]
    for tag, fn in targets:
        p = os.path.join(SRC, fn)
        if not os.path.exists(p):
            print('缺:', fn); continue
        ans = extract_answers(paras_of(load_docx_bytes(p)), tag)
        json.dump(ans, open(os.path.join(OUT, tag + '-answers.json'), 'w', encoding='utf-8'),
                  ensure_ascii=False, indent=1)
        print(f'{tag}: {len(ans)} 题有答案')

    # p2021 在 zip 内
    zp = os.path.join(SRC, '精品解析：北京市西城区2021~2022学年七年级上学期期末数学试卷.zip')
    if os.path.exists(zp):
        z = zipfile.ZipFile(zp)
        for n in z.namelist():
            try:
                real = n.encode('cp437').decode('gbk')
            except Exception:
                real = n
            if '解析版' in real and n.endswith('.docx'):
                ans = extract_answers(paras_of(z.read(n)), 'p2021')
                json.dump(ans, open(os.path.join(OUT, 'p2021-answers.json'), 'w', encoding='utf-8'),
                          ensure_ascii=False, indent=1)
                print(f'p2021: {len(ans)} 题有答案')
                break


if __name__ == '__main__':
    main()
