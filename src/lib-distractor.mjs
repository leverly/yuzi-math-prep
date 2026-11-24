/* 干扰项生成器：按「常见错误」造，不是随机数
   每个干扰项带一个 errTag，选错就能反推错因。 */

const clean=s=>String(s||'').trim();

/* 解析答案类型 */
export function answerKind(a){
  const s=clean(a);
  if(/^-?\d+(\.\d+)?$/.test(s)) return 'int';
  if(/^-?\d+\/\d+$/.test(s)) return 'frac';
  if(/×10\^/.test(s)||/\\times10\^/.test(s)) return 'sci';
  if(/°$/.test(s)) return 'deg';
  if(/^[a-zA-Z]$/.test(s)) return 'letter';
  if(/^[\u4e00-\u9fa5]$/.test(s)) return 'letter';
  if(/[≤≥<>]/.test(s)) return 'ineq';          // 不等式
  if(/^[①②③④]+$/.test(s)) return 'combo';     // 编号组合
  if(/[a-zA-Z]/.test(s)) return 'expr';
  if(/和|、/.test(s)) return 'pair';             // 「3和3」「12和8」
  return 'other';
}

/* 数值干扰项：符号错、±1、×2 */
/* 数值格式化：消除浮点误差（0.1+0.2=0.30000000000000004） */
function fmt(n){
  const r=Math.round(n*1e6)/1e6;
  return String(Number.isInteger(r)?r:r);
}

function intDistractors(a){
  const n=Number(a), out=[];
  if(n!==0) out.push({v:fmt(-n), errTag:'sign', why:'符号错了'});
  out.push({v:fmt(n+1), errTag:'calc', why:'算错了一位'});
  out.push({v:fmt(n-1), errTag:'calc', why:'算错了一位'});
  if(n!==0) out.push({v:fmt(n*2), errTag:'calc', why:'多乘了 2'});
  /* n=0 时上面只有 ±1，补两个有诊断意义的 */
  if(n===0){ out.push({v:'2', errTag:'method', why:'把系数当成了结果'}); out.push({v:'-2', errTag:'method', why:'符号与系数都错了'}); }
  return out;
}

/* 分数干扰项：倒数、符号错 */
function fracDistractors(a){
  const m=a.match(/^(-?)(\d+)\/(\d+)$/);
  if(!m) return intDistractors(a);
  const sg=m[1], pn=Number(m[2]), qn=Number(m[3]);
  const out=[];
  const mk=(p,q,tag,why)=>{ if(q===0)return; const g=(x,y)=>y?g(y,x%y):x; const k=g(p,q)||1;
    /* 退化值（=0 或 ±1）不作为干扰项 */
    if(p===0||(p===q&&p===1))return; if(p%q===0&&Math.abs(p/q)===1)return;
    out.push({v:(sg?'-':'')+p+'/'+q, errTag:tag, why}); };
  /* 符号错 */
  if(!sg) mk(pn,qn,'sign','符号错了');
  /* 倒数 */
  mk(qn,pn,'method','把分数取倒数了');
  /* 分子 ±1（跳过会变成 0 或 1 的） */
  if(pn+1!==qn) mk(pn+1,qn,'calc','分子算错了');
  if(pn-1>0 && pn-1!==qn) mk(pn-1,qn,'calc','分子算错了');
  /* 分母 +1 */
  mk(pn,qn+1,'calc','分母算错了');
  return out;
}

/* 科学记数法：指数±1、系数移位 */
function sciDistractors(a){
  const m=a.match(/^(-?[\d.]+)(?:×|\\times)10\^\{?(-?\d+)\}?$/);
  if(!m) return intDistractors(a);
  const [,coef,exp]=m;
  const e=Number(exp);
  return [
    {v:`${coef}×10^{${e+1}}`, errTag:'calc', why:'指数多了一位'},
    {v:`${coef}×10^{${e-1}}`, errTag:'calc', why:'指数少了一位'},
    {v:`${Number(coef)*10}×10^{${e-1}}`, errTag:'concept', why:'系数不在 1~10 之间'},
  ];
}

/* 角度：余角补角混淆、±30 */
function degDistractors(a){
  const m=a.match(/^(-?[\d.]+)°$/);
  if(!m) return intDistractors(a);
  const d=Number(m[1]);
  const out=[];
  if(d>=0&&d<=180) out.push({v:`${180-d}°`, errTag:'concept', why:'把补角当成答案'});
  if(d>=0&&d<=90) out.push({v:`${90-d}°`, errTag:'concept', why:'把余角当成答案'});
  out.push({v:`${d+30}°`, errTag:'calc', why:'角度算错了'});
  out.push({v:`${Math.abs(d-30)}°`, errTag:'calc', why:'少减了 30°'});
  return out;
}

/* 式子干扰项：符号翻转、漏项、系数错 */
/* 单项式形如 -2a / 5x / 1/3x：系数变号、系数±1 */
function monoDistractors(a){
  const s=clean(a);
  // 形如 -2a / 5x / 1/3x / -1/2x
  const m=s.match(/^(-?)(\d+\/\d+|\d+)?([a-zA-Z]+)$/);
  if(!m) return null;
  const [,sign,coef,letters]=m;
  const out=[];
  const hasNeg=sign==='-';
  out.push({v:(hasNeg?'':'-')+(coef||'')+letters, errTag:'sign', why:'系数符号错了'});
  if(coef){
    if(coef.includes('/')){
      const [p,q]=coef.split('/');
      out.push({v:sign+q+'/'+p+letters, errTag:'method', why:'把系数取倒数了'});
      out.push({v:sign+(Number(p)+1)+'/'+q+letters, errTag:'calc', why:'分子算错了'});
    } else {
      out.push({v:sign+(Number(coef)+1)+letters, errTag:'calc', why:'系数算错了'});
      out.push({v:sign+(Number(coef)-1)+letters, errTag:'calc', why:'系数算错了'});
    }
  } else {
    out.push({v:sign+'2'+letters, errTag:'calc', why:'漏了系数 1'});
  }
  return out;
}

function exprDistractors(a){
  const s=clean(a);
  const out=[];
  const mono=monoDistractors(s);
  if(mono && mono.length>=3) return mono;
  /* 形如 -(a-b) 这种整体带括号的：只翻转外层符号，不做逐项替换 */
  if(/^[-+]?\([^()]*\)$/.test(s)){
    const inner=s.replace(/^[-+]?\(/,'').replace(/\)$/,'');
    const sign=s.startsWith('-')?'':'-';
    return [
      {v:sign+inner, errTag:'sign', why:'外层符号处理错了'},
      {v:sign+'('+inner.replace(/\+/g,'\u0001').replace(/-/g,'+').replace(/\u0001/g,'-')+')', errTag:'sign', why:'括号内符号没全变'},
      {v:'('+inner+')', errTag:'sign', why:'漏了外面的负号'},
    ];
  }
  // 符号翻转：把所有 + 和 - 互换（首项符号单独处理）
  let flipped=s.replace(/\+/g,'\u0001').replace(/-/g,'+').replace(/\u0001/g,'-');
  if(flipped!==s) out.push({v:flipped, errTag:'sign', why:'去括号/移项时符号错了'});
  // 系数 ±1：找第一个数字
  const num=s.match(/(\d+)/);
  if(num){
    const n=Number(num[1]);
    out.push({v:s.replace(num[1], String(n+1)), errTag:'calc', why:'系数算错了'});
  }
  // 漏掉最后一项
  const parts=s.split(/(?=[+-])/);
  if(parts.length>1) out.push({v:parts.slice(0,-1).join(''), errTag:'method', why:'漏了最后一项'});
  return out;
}

/* 字母（如「后」「左」）：用同类备选 */
function letterDistractors(a, pool){
  const p=(pool||['后','右','左','前']).filter(x=>x!==a);
  return p.slice(0,3).map(v=>({v, errTag:'concept', why:'判断错了'}));
}

/* 不等式：翻转符号、改边界 */
function ineqDistractors(a){
  const s=clean(a);
  const out=[];
  if(s.includes('≤')) out.push({v:s.replace('≤','≥'), errTag:'sign', why:'不等号方向错了'});
  else if(s.includes('≥')) out.push({v:s.replace('≥','≤'), errTag:'sign', why:'不等号方向错了'});
  else if(s.includes('<')) out.push({v:s.replace('<','>'), errTag:'sign', why:'不等号方向错了'});
  else if(s.includes('>')) out.push({v:s.replace('>','<'), errTag:'sign', why:'不等号方向错了'});
  /* 边界 ±1 */
  const m=s.match(/(-?\d+)/);
  if(m){ const n=Number(m[1]); out.push({v:s.replace(m[1],String(n+1)), errTag:'calc', why:'边界值算错了'});
         out.push({v:s.replace(m[1],String(n-1)), errTag:'calc', why:'边界值算错了'}); }
  return out;
}

/* 编号组合 ①②④：换成其他组合 */
function comboDistractors(a){
  const s=clean(a);
  const all=['①','②','③','④'];
  const out=[];
  all.forEach(x=>{ if(!s.includes(x)) out.push({v:s+x, errTag:'method', why:'漏判了一条结论'}); });
  if([...s].length>1) out.push({v:[...s].slice(0,-1).join(''), errTag:'method', why:'漏判了一条结论'});
  /* 替换掉一条：用未选中的替换第一条 */
  const missing=all.filter(x=>!s.includes(x));
  if(missing.length && [...s].length>1) out.push({v:missing[0]+[...s].slice(1).join(''), errTag:'method', why:'误判了一条结论'});
  return out;
}

/* 「3和3」这类成对：各自 ±1 */
function pairDistractors(a){
  const s=clean(a);
  const nums=[...s.matchAll(/(-?\d+)/g)].map(m=>m[1]);
  const out=[];
  if(nums.length>=2){
    out.push({v:s.replace(nums[0],String(Number(nums[0])+1)), errTag:'calc', why:'第一个数算错了'});
    out.push({v:s.replace(nums[1],String(Number(nums[1])+1)), errTag:'calc', why:'第二个数算错了'});
    out.push({v:s.replace(nums[0],String(Number(nums[0])-1)), errTag:'calc', why:'第一个数算错了'});
    out.push({v:s.replace(nums[1],String(Number(nums[1])+2)), errTag:'calc', why:'第二个数算错了'});
  }
  return out;
}

/* 中文术语（反比例/长对正/同角的余角相等）：用同类术语池替换 */
const TERM_POOLS = [
  ['反比例','正比例','不成比例','无法确定'],
  ['长对正','高平齐','宽相等','长平齐'],
  ['同角的余角相等','同角的补角相等','等角的余角相等','对顶角相等'],
  ['负数的相反数反而更大','负数的相反数反而更小','负数没有相反数','无法判断'],
  ['看是否有「田」字或「凹」字等不能折叠的结构','看图形是否对称','看面数是否为 6','看是否有四个面共点'],
  ['可以，三对互不重复','不可以，有一对重复','可以，但有一对重合','无法判断'],
  ['长方形绕一边旋转形成圆柱','长方形平移形成长方体','圆旋转形成球','三角形旋转形成圆锥'],
  ['都为负','都为正','一正一负','无法确定'],
  ['题设矛盾，无解','有唯一解','有无数解','有两个解'],
  ['无解','有唯一解','有无数解','有两个解'],
  ['三视图是否互补','三视图是否相同','三视图是否成比例','无法判断'],
  ['1 个','2 个','3 个','4 个'],
];
function termDistractors(a){
  const s=clean(a);
  const pool=TERM_POOLS.find(p=>p[0]===s);
  if(pool) return pool.slice(1).map(v=>({v, errTag:'concept', why:'概念判断错了'}));
  return [];
}

export function makeDistractors(ans, pool){
  const k=answerKind(ans);
  let ds;
  if(k==='int') ds=intDistractors(ans);
  else if(k==='frac') ds=fracDistractors(ans);
  else if(k==='sci') ds=sciDistractors(ans);
  else if(k==='deg') ds=degDistractors(ans);
  else if(k==='letter') ds=letterDistractors(ans, pool);
  else if(k==='ineq') ds=ineqDistractors(ans);
  else if(k==='combo') ds=comboDistractors(ans);
  else if(k==='pair') ds=pairDistractors(ans);
  else { ds=termDistractors(ans); if(!ds.length) ds=exprDistractors(ans); }
  // 去重、去掉与答案相同的
  const seen=new Set([clean(ans)]);
  const val=x=>{ // 把 "4/4" 折成 1、"0/2" 折成 0，用于剔除退化值
    const m=clean(x).match(/^(-?)(\d+)\/(\d+)(.*)$/);
    if(m && Number(m[3])!==0) return (m[1]==='-'?-1:1)*Number(m[2])/Number(m[3]) + (m[4]||'');
    return clean(x);
  };
  const ansVal=val(ans);
  return ds.filter(d=>{
    const v=clean(d.v);
    if(seen.has(v)) return false;
    /* 剔除：值为 0 或 1 的纯分数（如 4/4、0/2），它们不是有意义的干扰项 */
    if(/^-?\d+\/\d+$/.test(v)){
      const num=val(v);
      if(num===0||num===1||num===-1) return false;
    }
    if(val(v)===ansVal) return false;
    /* 归一化去重：(a-b) 与 a-b 视为同一个 */
    const norm=x=>clean(x).replace(/[()]/g,'');
    if([...seen].some(y=>norm(y)===norm(v))) return false;
    seen.add(v); return true;
  }).slice(0,3);
}
