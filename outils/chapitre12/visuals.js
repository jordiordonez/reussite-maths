(function(){
  'use strict';
  const $=id=>document.getElementById(id),blue='#2563eb',coral='#f97362',green='#15803d';
  const fmt=x=>(Math.abs(x)<5e-10?0:x).toLocaleString('fr-FR',{maximumFractionDigits:5});
  const line=(x1,y1,x2,y2,color='#94a3b8',extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" ${extra}/>`;
  const text=(x,y,s)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="#475569">${s}</text>`;
  const path=(fn,a,b,X,Y)=>Array.from({length:241},(_,i)=>{const x=a+(b-a)*i/240;return `${X(x)},${Y(fn(x))}`;}).join(' ');
  const curve=(fn,a,b,X,Y,color)=>`<polyline points="${path(fn,a,b,X,Y)}" stroke="${color}" stroke-width="3" fill="none"/>`;
  const area=(fn,a,b,X,Y,color,extra='')=>`<polygon points="${X(a)},${Y(0)} ${path(fn,a,b,X,Y)} ${X(b)},${Y(0)}" fill="${color}" fill-opacity=".2" ${extra}/>`;
  function frame(min,max,low,high){const range=high-low||2,lo=low-range*.15,hi=high+range*.15,X=x=>50+(x-min)/(max-min)*520,Y=y=>285-(y-lo)/(hi-lo)*250;let axes=line(50,Y(0),570,Y(0))+line(X(Math.max(min,Math.min(max,0))),35,X(Math.max(min,Math.min(max,0))),285);for(let i=0;i<=4;i++){const x=min+(max-min)*i/4;axes+=text(X(x),320,fmt(x));}for(const value of [...new Set([low,high])])axes+=line(45,Y(value),55,Y(value))+text(44,Y(value)+5,fmt(value)).replace('text-anchor="middle"','text-anchor="end"').replace('<text ','<text data-axis-value="'+value+'" ');return {X,Y,axes};}
  function watch(ids,render){ids.forEach(id=>$(id).addEventListener($(id).type==='range'?'input':'change',render));render();}
  const outputs=ids=>ids.forEach(id=>$(id+'-value').textContent=$(id).value);
  if(Chapter12.code==='12A'){
    function render(){const p=+$('coefficient').value,c=+$('constant').value,a=+$('bound-a').value,b=+$('bound-b').value,f=x=>p*x*x+c,d=Chapter12.areas(p,c,a,b);outputs(['coefficient','constant','bound-a','bound-b']);
      $('area-values').textContent=`Intégrale de a à b ≈ ${fmt(d.signed)}. Aire positive ≈ ${fmt(d.positive)} ; aire négative (grandeur positive) ≈ ${fmt(d.negative)}. Aire géométrique ≈ ${fmt(d.area)}. `+(d.mean===null?'Moyenne non définie : les bornes sont égales.':`Moyenne sur l’intervalle entre les bornes ≈ ${fmt(d.mean)}.`);
      const low=Math.min(0,c,f(3)),high=Math.max(0,c,f(3)),{X,Y,axes}=frame(-3,3,low,high);let s=axes;
      for(let i=0;i<d.cuts.length-1;i++){const l=d.cuts[i],r=d.cuts[i+1];if(l!==r)s+=area(f,l,r,X,Y,f((l+r)/2)>=0?blue:coral,`data-region="true" data-left="${l}" data-right="${r}"`);}
      s+=curve(f,-3,3,X,Y,blue)+line(X(a),35,X(a),285,'#64748b','stroke-dasharray="4 4"')+line(X(b),35,X(b),285,'#64748b','stroke-dasharray="4 4"');
      if(d.mean!==null)s+=line(X(Math.min(a,b)),Y(d.mean),X(Math.max(a,b)),Y(d.mean),green,`stroke-width="3" id="mean-line"`);
      $('area-plot').innerHTML=s;
    }
    watch(['coefficient','constant','bound-a','bound-b'],render);
  }else{
    function strip(l,r,v,w,X,Y){
      if(v*w<0){const z=l+(r-l)*(-v)/(w-v);return strip(l,z,v,0,X,Y)+strip(z,r,0,w,X,Y);}
      return `<polygon points="${X(l)},${Y(0)} ${X(l)},${Y(v)} ${X(r)},${Y(w)} ${X(r)},${Y(0)}" fill="${v+w>=0?blue:coral}" fill-opacity=".18" stroke="#94a3b8" stroke-width=".7" data-piece="true"/>`;
    }
    function renderRect(){const a=+$('quad').value,c=+$('shift').value,b=+$('end').value,n=+$('rect-count').value,method=$('rect-method').value,f=x=>a*x*x+c,d=Chapter12.rectangles(a,c,b,n,method);outputs(['quad','shift','end','rect-count']);
      $('rect-values').textContent=`Approximation ≈ ${fmt(d.value)} ; intégrale exacte ≈ ${fmt(d.exact)} ; différence ≈ ${fmt(d.value-d.exact)}. Encadrement gauche/droite : ${fmt(d.lower)} ≤ intégrale ≤ ${fmt(d.upper)}. Largeur ≈ ${fmt(d.upper-d.lower)}.`;
      const {X,Y,axes}=frame(0,b,Math.min(0,f(0),f(b)),Math.max(0,f(0),f(b)));let s=axes;
      for(let i=0;i<n;i++){const l=i*b/n,r=(i+1)*b/n,v=method==='left'?f(l):method==='right'?f(r):method==='mid'?f((l+r)/2):f(l),w=method==='trap'?f(r):v;s+=strip(l,r,v,w,X,Y);}
      $('rect-plot').innerHTML=s+curve(f,0,b,X,Y,blue);
    }
    function renderSeq(){const n=+$('rank').value,f=x=>x**n*(1-x),g=x=>x**(n+1)*(1-x),X=x=>50+520*x,Y=y=>245-210*y;outputs(['rank']);
      $('sequence-values').textContent=`J${n} = 1/${(n+1)*(n+2)} ≈ ${fmt(1/((n+1)*(n+2)))} ; J${n+1} = 1/${(n+2)*(n+3)} ≈ ${fmt(1/((n+2)*(n+3)))}. Le quotient vaut ${(n+1)}/${n+3} < 1.`;
      $('sequence-plot').innerHTML=line(50,245,570,245)+line(50,35,50,245)+text(50,275,'0')+text(310,275,'0,5')+text(570,275,'1')+text(25,40,'1')+area(f,0,1,X,Y,blue)+curve(f,0,1,X,Y,blue)+curve(g,0,1,X,Y,green);
    }
    watch(['quad','shift','end','rect-count','rect-method'],renderRect);watch(['rank'],renderSeq);
  }
})();
