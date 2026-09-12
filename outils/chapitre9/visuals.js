(function(){
  'use strict';
  const $=id=>document.getElementById(id),M=Chapter9;
  let counts=[],runs=0;
  const format=x=>x.toLocaleString('fr-FR',{maximumFractionDigits:6});
  const probability=r=>M.cmp(r,M.R(0))>0&&M.cmp(r,M.R(1,1000000))<0?'positive, < 0,000001':(r.n==='0'||M.cmp(r,M.R(1))===0?'= ':'≈ ')+format(M.val(r));
  const node=(svg,tag,attrs,text)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;svg.append(e);return e;};
  function params(){return {n:+$('vn').value,m:+$('vp').value};}
  function event(k,a,b){const kind=$('vevent').value;return kind==='point'?k===a:kind==='cdf'?k<=a:kind==='tail'?k>=a:k>=a&&k<=b;}
  function threshold(){
    const {n,m}=params(),dist=M.law(n,m),alpha=M.R(+$('alpha').value,100),k=M.threshold(dist,alpha);
    $('alpha-out').textContent=format(M.val(alpha));
    const result=$('threshold-values');result.replaceChildren();
    const title=document.createElement('strong');title.id='threshold-k';title.textContent=k;result.append('Plus petit seuil k : ',title,'. ');
    const tail=document.createElement('span');tail.id='threshold-tail';tail.textContent=`P(X > ${k}) ${probability(M.tail(dist,k))} (≤ α). `;result.append(tail);
    const previous=document.createElement('span');previous.id='threshold-previous';previous.textContent=k?`Pour k = ${k-1}, P(X > k) ${probability(M.tail(dist,k-1))} (> α).`:'Zéro est déjà le plus petit entier autorisé.';result.append(previous);
    return k;
  }
  function draw(){
    const {n,m}=params(),dist=M.law(n,m);
    $('va').max=n;if(+$('va').value>n)$('va').value=n;
    const a=+$('va').value;$('vb').max=n;$('vb').min=a;
    if(+$('vb').value<a)$('vb').value=a;if(+$('vb').value>n)$('vb').value=n;const b=+$('vb').value;
    $('vn-out').textContent=n;$('vp-out').textContent=format(m/10);$('va-out').textContent=a;$('vb-out').textContent=b;
    $('vb').disabled=$('vevent').value!=='interval';
    const mu=M.R(n*m,10),variance=M.R(n*m*(10-m),100),sigma=Math.sqrt(M.val(variance));
    $('law-values').textContent=`E(X) = ${format(M.val(mu))} · V(X) = ${format(M.val(variance))} · σ(X) ≈ ${format(sigma)}.`;
    const mass=dist.reduce((s,p,k)=>event(k,a,b)?M.add(s,p):s,M.R(0));
    $('event-values').textContent=`Probabilité de l’événement : ${probability(mass)}. Somme de la loi = 1.`;
    const frequencies=dist.map((_,k)=>runs?(counts[k]||0)/runs:0),top=Math.max(...dist.map(M.val),...frequencies)*1.12;
    const svg=$('fig');svg.replaceChildren();
    node(svg,'line',{x1:30,y1:245,x2:345,y2:245,stroke:'#94a3b8'});
    node(svg,'text',{x:5,y:20,'font-size':11,fill:'#64748b'},format(top));
    node(svg,'text',{x:12,y:245,'font-size':11,fill:'#64748b'},'0');
    node(svg,'text',{x:170,y:288,'font-size':12,fill:'#475569'},'Nombre de succès k');
    const step=310/(n+1);
    dist.forEach((p,k)=>{const x=30+k*step,h=210*M.val(p)/top;
      const rect=node(svg,'rect',{x,y:245-h,width:step*(runs ? .48 : .85),height:h,fill:event(k,a,b)?'#2563eb':'#cbd5e1','data-k':k});
      const title=document.createElementNS('http://www.w3.org/2000/svg','title');title.textContent=`P(X = ${k}) ${probability(p)}`;rect.append(title);
      if(runs)node(svg,'rect',{x:x+step*.5,y:245-210*frequencies[k]/top,width:step*.4,height:210*frequencies[k]/top,fill:'#22a06b','data-sample-k':k});
      if(n<=10||k%2===0||k===n)node(svg,'text',{x:x+step*.4,y:263,'text-anchor':'middle','font-size':11,fill:'#475569'},k);
    });
    const observed=runs?counts.reduce((s,c,k)=>s+c*k,0)/runs:0,selected=runs?counts.reduce((s,c,k)=>s+(event(k,a,b)?c:0),0):0;
    $('sim-result').textContent=runs?`${runs} valeurs de X simulées (${n} essais chacune). Moyenne observée ≈ ${format(observed)}. Fréquence de l’événement ≈ ${format(selected/runs)}.`:'Aucune simulation pour cette loi.';
    threshold();
  }
  function reset(){runs=0;counts=Array(params().n+1).fill(0);draw();}
  ['vn','vp'].forEach(id=>$(id).addEventListener('input',reset));
  ['va','vb'].forEach(id=>$(id).addEventListener('input',draw));$('vevent').addEventListener('change',draw);
  $('alpha').addEventListener('input',threshold);
  $('simulate').addEventListener('click',()=>{const {n,m}=params();for(let i=0;i<200;i++){let k=0;for(let j=0;j<n;j++)if(Math.random()<m/10)k++;counts[k]++;runs++;}draw();});
  $('reset-simulation').addEventListener('click',reset);
  $('show-threshold').addEventListener('click',()=>{const k=threshold();$('vevent').value='interval';$('va').value=0;$('vb').min=0;$('vb').value=k;draw();});reset();
})();
