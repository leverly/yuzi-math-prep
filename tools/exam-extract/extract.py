#!/usr/bin/env python3
"""
真题抽取器：把 docx 里的「文本 + MathType 公式图」还原成结构化题目
------------------------------------------------------------------
为什么用 Python：四套卷的公式全部是 Equation.DSMT4 OLE 对象，
纯文本提取必然丢公式（分数 3/4 会变成散落的 3 和 4）。
Python 的 zipfile 是标准库，比 node 侧装依赖可靠。

输出 dist/exam-src/<tag>.json + <tag>/*.png
"""
import zipfile, re, os, json, sys, io

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, '真题试卷', '数学')
OUT = os.path.join(ROOT, 'assets', 'exam-src')
os.makedirs(OUT, exist_ok=True)


def parse_rels(xml):
    m = {}
    for x in re.finditer(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', xml):
        m[x.group(1)] = x.group(2).replace('./', '')
    return m


def parse_paragraphs(xml, rels):
    """按段落切，段内按出现顺序产出 text / img 片段"""
    out = []
    for p in xml.split('</w:p>'):
        parts = []
        # w:t 文本 或 w:object 公式对象，按位置交替
        for m in re.finditer(r'<w:t[^>]*>([^<]*)</w:t>|<w:object>.*?</w:object>', p, re.S):
            if m.group(1) is not None:
                if m.group(1):
                    parts.append({'t': 'text', 'v': m.group(1)})
            else:
                idm = re.search(r'<v:imagedata[^>]*r:id="(rId\d+)"', m.group(0))
                if idm:
                    rid = idm.group(1)
                    parts.append({'t': 'img', 'rid': rid, 'src': rels.get(rid)})
        if parts:
            out.append(parts)
    return out


def parts_to_text(parts):
    return ''.join(p['v'] if p['t'] == 'text' else '⟨公式⟩' for p in parts)


def split_options(parts):
    """把「A. xx B. yy C. zz D. ww」拆成 4 个选项。

    坑：docx 里选项常被拆成多个 w:t 片段（'A' + '. ' + '三棱柱' + 'B. ' + ...），
    逐片段找 [ABCD][.．] 会匹配不上（'A' 和 '. ' 分属两段）。
    所以先把整段拼成一个字符串，再按标记切，最后按字符区间映射回原片段。
    """
    # 拼接：记录每个字符来自哪个片段
    flat = []
    for pi, p in enumerate(parts):
        if p['t'] == 'text':
            for ch in p['v']:
                flat.append((ch, pi, False))
        else:
            # 公式占位，作为一个整体字符
            flat.append(('⟨公式⟩', pi, True))
    text = ''.join(c for c, _, _ in flat)

    # 找所有 A./B./C./D. 标记位置
    marks = [(m.start(), m.group(1)) for m in re.finditer(r'([ABCD])[.．]', text)]
    if not marks:
        return []

    out = []
    for i, (start, key) in enumerate(marks):
        end = marks[i + 1][0] if i + 1 < len(marks) else len(text)
        seg = text[start:end]
        body = re.sub(r'^[ABCD][.．]\s*', '', seg).strip()
        # 还原成片段（保留公式图）
        seg_parts = []
        for ch, pi, is_img in flat[start:end]:
            if is_img:
                seg_parts.append(parts[pi])
            else:
                seg_parts.append({'t': 'text', 'v': ch})
        # 合并相邻 text 片段
        merged = []
        for p in seg_parts:
            if p['t'] == 'text' and merged and merged[-1]['t'] == 'text':
                merged[-1]['v'] += p['v']
            else:
                merged.append(dict(p))
        # 去掉开头的 A./B. 标记
        if merged and merged[0]['t'] == 'text':
            merged[0]['v'] = re.sub(r'^[ABCD][.．]\s*', '', merged[0]['v'])
        out.append({'key': key, 'text': key + '. ' + body, 'parts': merged})
    return out


SKIP = re.compile(
    r'^北京市西城区|^七年级数学$|^注意事项|^第\s*\d+\s*页|^\s*$'
    r'|本试卷共\s*\d+\s*页'
    r'|在试卷和答题卡上准确填写'
    r'|试题答案一律填涂'
    r'|在答题卡上，选择题'
    r'|考试结束，请将考试材料'
    r'|^第一部分|^第二部分'
    r'|^一、选择题|^二、填空题|^三、解答题|^四、选做题'
    r'|^第[1１]-?[8８]题均有四个选项'
    r'|^[一二三四]、'
)
QSTART = re.compile(r'^\s*(\d{1,2})[.．、]\s*')


def build_questions(paras):
    qs, cur = [], None
    started = False   # 见过「一、选择题」之后才算正文
    for parts in paras:
        text = parts_to_text(parts).strip()
        # 正文起点：出现「一、选择题」
        if re.match(r'^一、选择题', text):
            started = True
            continue
        if not started:
            continue
        if SKIP.search(text) and not any(p['t'] == 'img' for p in parts):
            continue

        # 解析区起点：遇到【答案】就停（教师版原卷后接解析）
        if '【答案】' in text or '【分析】' in text:
            break
        m = QSTART.match(text)
        if m and 1 <= int(m.group(1)) <= 26:
            if cur:
                qs.append(cur)
            rest = [dict(p) for p in parts]
            if rest and rest[0]['t'] == 'text':
                rest[0]['v'] = QSTART.sub('', rest[0]['v'], count=1)
            cur = {'no': int(m.group(1)), 'stemParts': rest, 'options': [], 'rawParas': [parts_to_text(parts)]}
            continue
        if cur is None:
            continue

        cur['rawParas'].append(text)
        # 情况①：整段以 A./B./C./D. 开头 → 整段是选项（可能含多个）
        if re.match(r'^\s*[ABCD][.．]', text):
            cur['options'].extend(split_options(parts))
            continue
        # 情况②：题干段末尾夹带 A. 选项（如「…的是（ ）\nA. 三棱柱」同行）→ 拆开
        am = re.search(r'(?<![A-Za-z])A[.．]', text)
        if am and len(re.findall(r'[ABCD][.．]', text)) >= 2:
            head = text[:am.start()].strip()
            if head:
                cur['stemParts'].append({'t': 'break'})
                cur['stemParts'].append({'t': 'text', 'v': head})
            tail_parts = [{'t': 'text', 'v': text[am.start():]}]
            cur['options'].extend(split_options(tail_parts))
            continue
        # 情况③：正在收选项时，新段是选项续行（如单独的 D.）
        if cur['options'] and re.match(r'^\s*[ABCD][.．]', text):
            cur['options'].extend(split_options(parts))
            continue
        cur['stemParts'].append({'t': 'break'})
        cur['stemParts'].extend(parts)
    if cur:
        qs.append(cur)
    return qs


def extract(docx_path, tag):
    z = zipfile.ZipFile(docx_path)
    doc = z.read('word/document.xml').decode('utf-8')
    rels = parse_rels(z.read('word/_rels/document.xml.rels').decode('utf-8'))
    qs = build_questions(parse_paragraphs(doc, rels))

    img_dir = os.path.join(OUT, tag)
    os.makedirs(img_dir, exist_ok=True)
    used = set()
    for q in qs:
        for p in q['stemParts']:
            if p['t'] == 'img' and p.get('src'):
                used.add(p['src'])
        for o in q['options']:
            for p in o['parts']:
                if p['t'] == 'img' and p.get('src'):
                    used.add(p['src'])

    for src in used:
        try:
            data = z.read('word/' + src)
        except KeyError:
            continue
        name = os.path.basename(src)
        with open(os.path.join(img_dir, name), 'wb') as f:
            f.write(data)

    out = {
        'tag': tag,
        'source': os.path.basename(docx_path),
        'qcount': len(qs),
        'imgCount': len(used),
        'questions': [{
            'no': q['no'],
            'stemText': parts_to_text(q['stemParts']).strip(),
            'stemParts': q['stemParts'],
            'options': q['options'],
            'rawParas': q.get('rawParas', []),
        } for q in qs],
    }
    with open(os.path.join(OUT, tag + '.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    return out


def main():
    targets = [
        ('p2024', '精品解析：北京市西城区2024-2025学年七年级上学期期末考试数学试卷 （原卷版）.docx'),
        ('p2022', '精品解析：北京市西城区2022-2023学年七年级上学期数学期末试卷（原卷版）.docx'),
        ('p2023', '2023-2024北京西城初一（上）期末数学（教师版）.docx'),
    ]
    for tag, fn in targets:
        p = os.path.join(SRC, fn)
        if not os.path.exists(p):
            print('缺文件:', fn); continue
        r = extract(p, tag)
        print(f"{tag} → {r['qcount']} 题, {r['imgCount']} 张公式图")

    # 2021-22 在 zip 内
    zp = os.path.join(SRC, '精品解析：北京市西城区2021~2022学年七年级上学期期末数学试卷.zip')
    if os.path.exists(zp):
        z = zipfile.ZipFile(zp)
        # 取原卷版（文件名含"原卷"）
        cand = []
        for n in z.namelist():
            if not n.endswith('.docx'):
                continue
            try:
                real = n.encode('cp437').decode('gbk')
            except Exception:
                real = n
            cand.append((real, n))
        orig = [c for c in cand if '原卷' in c[0]]
        pick = orig[0] if orig else cand[0]
        tmp = os.path.join('/tmp', 'p2021.docx')
        with open(tmp, 'wb') as f:
            f.write(z.read(pick[1]))
        r = extract(tmp, 'p2021')
        # 覆盖 source 为真实来源名
        import json as _j
        _p = os.path.join(OUT, 'p2021.json')
        _d = _j.load(open(_p, encoding='utf-8'))
        _d['source'] = pick[0]
        _j.dump(_d, open(_p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print(f"p2021 → {r['qcount']} 题, {r['imgCount']} 张公式图  （源: {pick[0][:40]}）")


if __name__ == '__main__':
    main()
