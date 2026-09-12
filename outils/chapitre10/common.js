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
  const mod=n=>((n%24)+24)%24;
  const notable=[0,2,3,4,6,8,9,10,12,14,15,16,18,20,21,22];
  // Valeurs exactes, angles exprimés en unités de π/12.
  const sine={0:'0',2:'\\frac{1}{2}',3:'\\frac{\\sqrt{2}}{2}',4:'\\frac{\\sqrt{3}}{2}',6:'1',8:'\\frac{\\sqrt{3}}{2}',9:'\\frac{\\sqrt{2}}{2}',10:'\\frac{1}{2}',12:'0',14:'-\\frac{1}{2}',15:'-\\frac{\\sqrt{2}}{2}',16:'-\\frac{\\sqrt{3}}{2}',18:'-1',20:'-\\frac{\\sqrt{3}}{2}',21:'-\\frac{\\sqrt{2}}{2}',22:'-\\frac{1}{2}'};
  const trigTex=(kind,u)=>sine[mod(u+(kind==='cos'?6:0))];
  function roundedTrig(kind,u){const t=trigTex(kind,u);if(t===undefined)throw Error('Angle non remarquable');const neg=t.startsWith('-'),s=neg?t.slice(1):t;const thousand=s==='0'?0:s==='1'?1000:s==='\\frac{1}{2}'?500:s.includes('sqrt{2}')?707:866;return R((neg?-1:1)*thousand,1000);}
  function numQ(kind,data,q,answer,wrong,expl){const options=[answer];for(const a of wrong)if(!options.some(b=>a.n*b.d===b.n*a.d))options.push(a);for(let i=1;options.length<4;i++){const a=R(answer.n+i*answer.d,answer.d);if(!options.some(b=>a.n*b.d===b.n*a.d))options.push(a);}const mixed=shuffle(options.slice(0,4));return {kind,data,q,options:mixed.map(a=>'\\('+tex(a)+'\\)'),correct:mixed.findIndex(a=>a.n*answer.d===answer.n*a.d),expl};}
  function textQ(kind,data,q,correct,wrong,expl){const options=[correct,...wrong];if(new Set(options).size!==4)throw Error('Options dupliquées');const mixed=shuffle(options);return {kind,data,q,options:mixed,correct:mixed.indexOf(correct),expl};}
  function exactTrigQ(kind,data,q,fn,u){const a=trigTex(fn,u),pool=['0','1','-1','\\frac{1}{2}','-\\frac{1}{2}','\\frac{\\sqrt{2}}{2}','-\\frac{\\sqrt{2}}{2}','\\frac{\\sqrt{3}}{2}','-\\frac{\\sqrt{3}}{2}'];return textQ(kind,data,q,'\\('+a+'\\)',shuffle(pool.filter(x=>x!==a)).slice(0,3).map(x=>'\\('+x+'\\)'),`Le cercle et les symétries donnent \\(${a}.\\)`);}
  const par=n=>n<0?'('+n+')':String(n);
  const linear=(a,c)=>a+(c<0?' - '+Math.abs(c):c>0?' + '+c:'');
  root.T10={R,tex,pi,parseNum,accepts,rnd,pick,shuffle,mod,notable,trigTex,roundedTrig,numQ,textQ,exactTrigQ,par,linear};
})(globalThis);
