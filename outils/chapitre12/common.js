(function(root){
  'use strict';
  const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
  function R(n,d=1){if(!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||!d)throw Error('Fraction invalide');if(d<0){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g};}
  const tex=a=>a.d===1?String(a.n):(a.n<0?'-':'')+'\\frac{'+Math.abs(a.n)+'}{'+a.d+'}';
  function pi(a){if(a.n===0)return '0';const sign=a.n<0?'-':'',n=Math.abs(a.n);return sign+(a.d===1?(n===1?'':n)+'\\pi':'\\frac{'+(n===1?'':n)+'\\pi}{'+a.d+'}');}
  function rational(raw){
    const s=String(raw).trim().replace(/−/g,'-').replace(/,/g,'.');
    if(s.length>100||!/^\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)\s*(?:\/\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)\s*)?$/.test(s))return null;
    const part=x=>{x=x.trim();const b=x.replace(/^[+-]/,'').split('.');return [(x.startsWith('-')?-1n:1n)*BigInt((b[0]||'0')+(b[1]||'')),10n**BigInt((b[1]||'').length)];};
    const p=s.split('/'),a=part(p[0]),b=p.length===2?part(p[1]):[1n,1n];return b[0]===0n?null:[a[0]*b[1],a[1]*b[0]];
  }
  const parseNum=raw=>{const a=rational(raw);return a?Number(a[0])/Number(a[1]):NaN;};
  const accepts=(e,raw)=>{const a=rational(raw);return !!a&&a[0]*BigInt(e.answer.d)===BigInt(e.answer.n)*a[1];};
  const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  const pick=a=>a[rnd(0,a.length-1)];
  function shuffle(xs){const a=xs.slice();for(let i=a.length-1;i>0;i--){const j=rnd(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function numQ(kind,data,q,answer,wrong,expl){const options=[answer];for(const a of wrong)if(!options.some(b=>a.n*b.d===b.n*a.d))options.push(a);for(let i=1;options.length<4;i++){const a=R(answer.n+i*answer.d,answer.d);if(!options.some(b=>a.n*b.d===b.n*a.d))options.push(a);}const mixed=shuffle(options.slice(0,4));return {kind,data,q,options:mixed.map(a=>'\\('+tex(a)+'\\)'),correct:mixed.findIndex(a=>a.n*answer.d===answer.n*a.d),expl};}
  function textQ(kind,data,q,correct,wrong,expl){const options=[correct,...wrong];if(new Set(options).size!==4)throw Error('Options dupliquées');const mixed=shuffle(options);return {kind,data,q,options:mixed,correct:mixed.indexOf(correct),expl};}
  const par=n=>n<0?'('+n+')':String(n);
  const add=(a,b)=>R(a.n*b.d+b.n*a.d,a.d*b.d),mul=(a,b)=>R(a.n*b.n,a.d*b.d);
  const integral=(coeffs,a,b)=>coeffs.reduce((s,c,i)=>add(s,R(c*(b**(i+1)-a**(i+1)),i+1)),R(0));
  function poly(coeffs){let out='';for(let i=coeffs.length-1;i>=0;i--){const c=coeffs[i];if(!c)continue;out+=(out?(c<0?' - ':' + '):(c<0?'-':''))+(i&&Math.abs(c)===1?'':Math.abs(c))+(i?'x'+(i===1?'':'^{'+i+'}'):'');}return out||'0';}
  const round=v=>R((v<0?-1:1)*Math.floor(Math.abs(v)*1000+.5),1000);
  root.T12={R,tex,parseNum,accepts,rnd,pick,shuffle,numQ,textQ,par,add,mul,integral,poly,round};
})(globalThis);

