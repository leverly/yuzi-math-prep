const fs=require('fs');
const path=require('path');
/* 数据文件都在仓库根，脚本在 tools/exam-extract/，读文件也要回到根 */
const ROOT=path.resolve(__dirname,'../..');
process.chdir(ROOT);

const TAG2YEAR={p2021:'2021—2022',p2022:'2022—2023',p2023:'2023—2024',p2024:'2024—2025',p2025:'2025—2026'};
const TAG2ID={p2021:'p2021',p2022:'p2022',p2023:'p2023',p2024:'p2024',p2025:'p2025'};

/* 填空答案能否「判分」。
   答案 json 里有几种不是答案的占位：
     · 空串
     · 「（答案不唯一）」——开放题，没法自动判，但学生仍要作答
     · 「①.  ②.  ③.  ④.」——编号留空，公式在图片里没提出来
   返回 'gradable'（可判分）/ 'open'（要作答但不判分）/ null（没答案） */
function fillAnswerKind(s){
  if(!s) return null;
  const t=String(s).trim();
  if(!t) return null;
  if(/答案不唯一/.test(t)) return 'open';
  if(/见解析|图见解析|图形如图所示/.test(t)) return null;

  /* 多小问答案「（1）x=2 （2）x=−1」：每个小问后面都得有实质内容。
     只写「（1）；（2）」是空壳（公式在图片里没提出来），不能判分——
     否则会给出一个「填什么都算错」的输入框。
     做法：先按小问编号切开，检查每一段去掉标点后是否还有东西。 */
  if(/[（(]\s*\d\s*[）)]/.test(t)){
    const segs = t.split(/[（(]\s*\d\s*[）)]/).slice(1);   // 丢掉第一个编号之前的部分
    const filled = segs.filter((seg) => {
      const c = seg.replace(/[①②③④⑤⑥⑦⑧⑨⑩]/g, '')
                   .replace(/[（）()、，,。．.；;：:\s]/g, '');
      return c.length > 0;
    });
    if (filled.length === 0) return null;                 // 全是空壳
    // 有小问缺答案 → 不能整题判分，但可以让学生逐问作答
    return filled.length === segs.length ? 'gradable' : 'partial';
  }

  /* 判断是否有「实义内容」。难点在于三种带编号的写法：
       「①. 3  ②. 4」     → 有内容，可判分
       「①④」             → 有内容（填序号），可判分
       「①.  ②.  ③.  ④.」 → 空壳，公式在图片里没提出来
     另外「；」「﹣ ；」这种只剩标点/孤立运算符的也是空壳
     ——答案本体是公式图，没提出来。 */
  const core = t.replace(/[①②③④⑤⑥⑦⑧⑨⑩]/g,'')
                .replace(/[（）()、，,。．.；;：:\s]/g,'');
  /* 只剩运算符或单个字符：不是答案（「﹣」是减号残片，「；」是分隔符） */
  if (/^[﹣\-+×÷=<>≤≥°′″.,;:]*$/.test(core)) return null;
  /* 以分隔符收尾 = 后面还有空但没提取到（「45°；」= 第一空 45°，
     第二空丢了）。整题不能自动判分，否则学生填对第一空也判错。 */
  if (/[；;]\s*$/.test(t)) return 'partial';
  if (core.length > 0) return 'gradable';
  // 只剩编号：形如「①. ②.」是空壳；形如「①④」是答案
  return /\d[.．]\s*$|[①②③④⑤⑥⑦⑧⑨⑩][.．]/.test(t) ? null : 'gradable';
}

// 读四套答案
const ANS={};
['p2021','p2022','p2023','p2024','p2025'].forEach(t=>{
  try{ANS[t]=JSON.parse(fs.readFileSync('assets/exam-src/'+t+'-answers.json','utf8'));}catch(e){ANS[t]={}}
});

// 读 PAPERS 标注（从源文件解析不可靠，直接用 node import）
(async()=>{
  // 用相对脚本位置的绝对路径，避免换机器/换 cwd 就断
  const ROOT=path.resolve(__dirname,'../..');
  const {PAPERS}=await import('file://'+path.join(ROOT,'src/index.js')+'?v='+Date.now());
  const {EXAM_FULL}=await import('file://'+path.join(ROOT,'src/data-exam-full.js')+'?v='+Date.now());

  const bank=[];
  const TAGS=['p2021','p2022','p2023','p2024','p2025'];

  TAGS.forEach(tag=>{
    const paper=PAPERS.find(p=>p.id===tag);
    const full=EXAM_FULL[tag];
    if(!paper||!full){console.log('跳过',tag);return}
    const ans=ANS[tag]||{};

    full.questions.forEach(q=>{
      const meta=paper.items.find(i=>i.no===q.no)||{};
      const a=ans[q.no]||ans[String(q.no)]||{};
      /* 只有前 8 题是选择题位。9-26 题即使出现「A．B．」也可能是解答题里的
         选项引用（如选做题的「其中所有正确的结论是」），不能算单选。 */
      const isChoice = q.no <= 8 && q.options.length === 4;
      /* 选项「有没有内容」不能只看 text —— 选项常常整项是公式图，
         text 只剩「A．」，但 parts 里有 img。要看 parts 是否产出东西。
         真正空的（parts 全空且 text 也空）才降级，否则会误判好题为坏题。 */
      const optEmpty = isChoice && q.options.every(o => {
        const txt = o.text.replace(/^[A-D][.．]\s*/, '').trim();
        const hasPart = (o.parts || []).some(p =>
          (p.t === 'text' && p.v && p.v.trim()) || (p.t === 'img' && p.src));
        return !txt && !hasPart;
      });
      /* 选项的纯文本：公式图选项的 text 只剩「A．」，剥完是空串。
         这里给一个可读占位，别让 answerText（正确选项内容）变成空。 */
      const optTexts = isChoice ? q.options.map(o => {
        const txt = o.text.replace(/^[A-D][.．]\s*/, '').trim();
        if (txt) return txt;
        const hasImg = (o.parts || []).some(p => p.t === 'img' && p.src);
        return hasImg ? '（图）' : '';
      }) : null;

      // 题型：有官方答案字母的选择题→single；填空位→calc；其余→big
      let qtype, answerText=null, key=null, openAnswer=false;
      /* 选择题一律 single（哪怕没答案）——这样学生仍能看到四个选项、
         自己选，只是不判分。无答案时 key=null，前端据此禁用判分。
         例外：选项全空（公式图没提出来）→ 当不了单选，降级大题。 */
      if(isChoice && !optEmpty && a.answer && /^[A-D]$/.test(a.answer)){
        qtype='single';
        key='ABCD'.indexOf(a.answer);
        answerText=optTexts[key];
      } else if(isChoice && !optEmpty){
        qtype='single';
        key=null;          /* 无官方答案 */
        answerText=null;
      } else if(optEmpty){
        /* 四个选项都是公式图，文字层读不到。给输入框也没法判分
           （选项内容都不知道），只能让学生去原卷看。 */
        qtype='big';
        key=null;
        answerText=a.answer || null;
      } else {
        /* 非选择题：看答案能不能判分。
           gradable → 输入框 + 自动判分
           open     → 输入框 + 参考答案自评（「写出一个…」这类开放题）
           null     → 大题，纸面作答后看解答
           不能只看 a.kind==='fill'：早期答案 json 没写 kind，
           填空题会被误判成 big，学生看到题干却没有作答的地方。 */
        const kind = fillAnswerKind(a.answer);
        /* 答案是整句话的应用题（「每台机器一天生产 40 件…」）不适合
           单行输入框：学生不可能逐字敲。只看答案长度，不看题干长度
           ——题干长但答案是单个数的（如算筹题求 ﹣3672）完全能判分。 */
        const longAnswer = String(a.answer || '').length > 20;
        if(kind === 'gradable' && !longAnswer){
          /* 单行框只适合「一个空」。以下两种要换多行框：
             · 多小问「（1）…（2）…」
             · 多空题「①. 3  ②. 4」（两个空各一个答案）
             而「①④」是**填序号**的单空题，仍用单行框。 */
          const ans = String(a.answer || '');
          const multiPart = /[（(]\s*\d\s*[）)]/.test(ans);
          const multiBlank = /[①②③④⑤⑥⑦⑧⑨⑩][.．]\s*\S/.test(ans)
                           && (ans.match(/[①②③④⑤⑥⑦⑧⑨⑩][.．]\s*\S/g) || []).length >= 2;
          qtype = (multiPart || multiBlank) ? 'big' : 'calc';
          answerText = a.answer;
        } else if(kind === 'open' && !longAnswer){
          qtype = 'calc';
          answerText = a.answer;
          openAnswer = true;
        } else if(kind){
          /* gradable/open/partial 但题干或答案太长：能展示答案，不判分 */
          qtype = 'big';
          answerText = a.answer;
        } else {
          qtype = 'big';
        }
      }
      const options = optTexts;

      bank.push({
        id: tag+'-q'+q.no,
        paperId: tag,
        year: TAG2YEAR[tag],
        no: q.no,
        qtype,
        chapter: meta.ch||'',
        cat: meta.cat||'',
        score: meta.score||0,
        diff: meta.diff||'mid',
        topic: meta.topic||'',
        name: meta.name||'',
        bonus: !!meta.bonus,
        hasAnswer: !!a.answer,
        stemText: q.stemText,
        stemParts: q.stemParts,
        rawParas: q.rawParas||[],
        options,
        optionParts: isChoice ? q.options.map(o => o.parts) : null,
        key,
        answer: answerText,
        /* 开放题（答案不唯一）不设 accept：有输入框，但不自动判分，
           提交后展示参考答案让学生自评。 */
        accept: qtype==='calc'&&answerText&&!openAnswer?[answerText]:undefined,
        openAnswer: openAnswer||undefined,
        officialKey: a.answer||null,
        /* 选项提取失败：页面据此显示说明 + 原卷链接，而不是四个空按钮 */
        ...(optEmpty ? { __optUnavailable: '这道题的四个选项在原卷里都是公式图，未能提取成文字，' +
          '所以这里不显示选项。请点下方「去看原卷」对照作答。' } : {}),
      });
    });
  });

  console.log('题库构建:',bank.length,'题');
  const st={};bank.forEach(q=>st[q.qtype]=(st[q.qtype]||0)+1);
  console.log('题型:',JSON.stringify(st));
  const noAns=bank.filter(q=>!q.hasAnswer).length;
  console.log('无答案:',noAns,'题');

  const header=[
'/* ==========================================================',
'   真题练习题库（2026-11-25 建）',
'   ----------------------------------------------------------',
'   站点只练真题。130 道全部来自五套西城期末卷，无原创改编题。',
'',
'   qtype 由答案可得性决定：',
'     single 单选 —— 选择题且提取到官方答案字母',
'     calc   计算 —— 填空类且提取到「故答案为」',
'     big    大题 —— 解答题（多小问，不自动判分，只给解答）',
'',
'   hasAnswer=false 的题（2022-23 整套 26 题）只有题干没有答案，',
'   页面标「无官方答案」，只展示不判分。',
'',
'   officialKey 保留官方答案原文，用于核验页对照。',
'   ========================================================== */','',
'export const EXAM_BANK = '+JSON.stringify(bank,null,1)+';',''].join('\n');
  fs.writeFileSync('/Users/sunzhidong/Desktop/thinking/math/src/data-exam-bank.js',header);
  console.log('写入 src/data-exam-bank.js');
})();
