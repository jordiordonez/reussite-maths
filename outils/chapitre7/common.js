/* Calcul rationnel partagé, intégré dans chaque fiche autonome du chapitre 7. */
(function (root) {
  'use strict';
  const gcd = (a,b) => b ? gcd(b,a%b) : Math.abs(a);
  function R(n,d=1) {
    if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || !d) throw Error('Fraction invalide');
    if (d<0) { n=-n; d=-d; }
    const g=gcd(n,d); return {n:n/g,d:d/g};
  }
  const add=(a,b)=>R(a.n*b.d+b.n*a.d,a.d*b.d);
  const sub=(a,b)=>R(a.n*b.d-b.n*a.d,a.d*b.d);
  const mul=(a,b)=>R(a.n*b.n,a.d*b.d);
  const div=(a,b)=>R(a.n*b.d,a.d*b.n);
  const pow=(a,n)=>R(a.n**n,a.d**n);
  const value=a=>a.n/a.d;
  const tex=a=>a.d===1 ? String(a.n) : (a.n<0?'-':'')+'\\frac{'+Math.abs(a.n)+'}{'+a.d+'}';
  const wrap=a=>'\\('+tex(a)+'\\)';
  const par=a=>a.n<0?'\\left('+tex(a)+'\\right)':tex(a);
  const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  const shuffle=arr=>{const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=rnd(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
  function parseNum(raw) {
    const s=String(raw).trim().replace(/−/g,'-').replace(/,/g,'.').replace(/\s+/g,'');
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\/[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(s)) return NaN;
    const parts=s.split('/').map(Number);
    const result=parts.length===2?parts[0]/parts[1]:parts[0];
    return Number.isFinite(result)?result:NaN;
  }
  function accepts(e,raw) {
    const s=String(raw).trim().replace(/−/g,'-').replace(/,/g,'.').replace(/\s+/g,'');
    if(s.length>100 || !Number.isFinite(parseNum(s))) return false;
    function decimal(part){
      const negative=part.startsWith('-'); part=part.replace(/^[+-]/,'');
      const bits=part.split('.'),digits=(bits[0]||'0')+(bits[1]||'');
      return {n:BigInt(digits)*(negative?-1n:1n),d:10n**BigInt((bits[1]||'').length)};
    }
    const parts=s.split('/'),a=decimal(parts[0]),b=parts.length===2?decimal(parts[1]):{n:1n,d:1n};
    if(b.n===0n) return false;
    // Exact rational equality: a neighbouring integer/decimal is never accepted.
    return a.n*b.d*BigInt(e.answer.d)===BigInt(e.answer.n)*a.d*b.n;
  }
  function numeric(kind,data,q,answer,wrong,expl) {
    const key=a=>a.n+'/'+a.d;
    const options=[answer];
    for(const candidate of wrong) if(!options.some(a=>key(a)===key(candidate))) options.push(candidate);
    // Guaranteed distinct fallback choices, including for edge-case parameters.
    for(let i=1;options.length<4;i++) {
      const candidate=add(answer,R(i,10));
      if(!options.some(a=>key(a)===key(candidate))) options.push(candidate);
    }
    const mixed=shuffle(options.slice(0,4));
    return {kind,data,q,options:mixed.map(wrap),correct:mixed.findIndex(a=>key(a)===key(answer)),expl};
  }
  function concept(kind,data,q,options,correct,expl) {
    const order=shuffle([0,1,2,3]);
    return {kind,data,q,options:order.map(i=>options[i]),correct:order.indexOf(correct),expl};
  }
  root.C7={R,add,sub,mul,div,pow,value,tex,wrap,par,rnd,shuffle,parseNum,accepts,numeric,concept};
})(globalThis);
