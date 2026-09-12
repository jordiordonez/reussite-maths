(function(){
  'use strict';
  const $=id=>document.getElementById(id),{R,sub,mul,add,value,tex}=C7;
  const num=x=>Number(x.toFixed(5)).toLocaleString('fr-FR',{maximumFractionDigits:5});
  function node(svg,tag,attrs,content){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(content!==undefined)e.textContent=content;svg.append(e);return e;}
  const label=(svg,x,y,s,attrs={})=>node(svg,'text',{x,y,'font-size':12,fill:'#374151',...attrs},s);
  const line=(svg,x1,y1,x2,y2,color='#bac4d3')=>node(svg,'line',{x1,y1,x2,y2,stroke:color,'stroke-width':2});
  function display(markup){$('visu-values').innerHTML=markup;if(window.MathJax?.typesetPromise)window.MathJax.typesetPromise([$('visu-values')]).catch(()=>{});}
  if(Chapter7.code==='7A'){
    function draw(){
      const d={a:+$('va').value,b:+$('vb').value,c:+$('vc').value};
      const a=d.a/10,b=d.b/10,c=d.c/10;
      ['a','b','c'].forEach(k=>$('v'+k+'-out').textContent=num(d[k]/10));
      const masses=[a*b,a*(1-b),(1-a)*c,(1-a)*(1-c)],total=masses[0]+masses[2];
      const svg=$('fig');svg.replaceChildren();
      line(svg,30,155,155,82);line(svg,30,155,155,230);
      [40,125].forEach(y=>line(svg,155,82,275,y));[200,285].forEach(y=>line(svg,155,230,275,y));
      label(svg,10,160,'Ω');label(svg,145,75,'A');label(svg,132,248,'non A');
      label(svg,77,102,num(a));label(svg,66,224,num(1-a));
      [b,1-b,c,1-c].forEach((p,i)=>label(svg,204,[46,120,195,280][i],num(p)));
      masses.forEach((p,i)=>{const y=[40,125,200,285][i];label(svg,280,y,i%2?'non B':'B');label(svg,280,y+19,num(p),{fill:i===0?'#2563eb':i===2?'#15803d':'#6b7280','font-weight':600});});
      const m=$('mosaic');m.replaceChildren();const colors=['#2563eb','#dbeafe','#22a06b','#e5e7eb'];
      [[20,20,320*a,120*b],[20,20+120*b,320*a,120*(1-b)],[20+320*a,20,320*(1-a),120*c],[20+320*a,20+120*c,320*(1-a),120*(1-c)]].forEach((r,i)=>node(m,'rect',{x:r[0],y:r[1],width:r[2],height:r[3],fill:colors[i],stroke:'#fff'}));
      const independent=Math.abs(masses[0]-a*total)<1e-12;
      display(`P(A et B) = <b>${num(masses[0])}</b> · P(B) = <b>${num(total)}</b><br>P_B(A) ${total>0?'≈':' :'} <b>${total>0?num(masses[0]/total):'non définie : P(B) = 0'}</b> (affichage à cinq décimales au plus)<br>${independent?'A et B sont indépendants.':'A et B ne sont pas indépendants.'} Somme des feuilles : <b>${num(masses.reduce((s,p)=>s+p,0))}</b>.`);
      $('visu-edge').textContent=a===0||a===1?'Une branche initiale a une probabilité nulle. Son curseur secondaire est un paramètre formel de l’arbre, pas une probabilité conditionnelle définie sur cet événement ; toutes ses feuilles ont une masse nulle.':'Chaque branche initiale a une probabilité positive : les deux conditionnements sont définis.';
    }
    ['va','vb','vc'].forEach(id=>$(id).addEventListener('input',draw));
    $('independent').addEventListener('click',()=>{$('vc').value=$('vb').value;draw();});
    $('reset-viz').addEventListener('click',()=>{$('va').value=4;$('vb').value=7;$('vc').value=2;draw();});draw();
  }else if(Chapter7.code==='7B'){
    let count=[0,0,0],n=0;
    function data(){const u=+$('vp0').value,v=+$('vsplit').value;return {x:[+$('vx0').value,0,+$('vx2').value],weights:[u*10,(10-u)*v,(10-u)*(10-v)],den:100};}
    function draw(){
      const d=data(),m=Chapter7.moments(d),mu=value(m.mean),variance=value(m.variance);
      ['vx0','vx2'].forEach(id=>$(id+'-out').textContent=$(id).value);
      ['vp0','vsplit'].forEach(id=>$(id+'-out').textContent=num(+$(id).value/10));
      const svg=$('fig');svg.replaceChildren();line(svg,25,190,340,190);
      label(svg,20,22,'Probabilités et fréquences');
      d.x.forEach((x,i)=>{const p=d.weights[i]/100,left=50+i*105,h=140*p;node(svg,'rect',{x:left,y:190-h,width:29,height:h,fill:'#2563eb',rx:3});if(n)node(svg,'rect',{x:left+32,y:190-140*count[i]/n,width:25,height:140*count[i]/n,fill:'#22a06b',rx:3});label(svg,left,210,'X = '+x);label(svg,left,181-h,num(p));});
      const xmin=d.x[0],xmax=d.x[2],X=x=>30+300*(x-xmin)/(xmax-xmin);
      line(svg,30,250,330,250);d.x.forEach(x=>{line(svg,X(x),246,X(x),254);label(svg,X(x),272,String(x),{'text-anchor':'middle'});});
      node(svg,'circle',{cx:X(mu),cy:250,r:5,fill:'#d97706'});label(svg,X(mu),238,'E(X)',{'text-anchor':'middle',fill:'#92400e'});
      display(`\\(E(X)=${tex(m.mean)},\\) \\(V(X)=${tex(m.variance)},\\) \\(\\sigma(X)\\approx${num(Math.sqrt(Math.max(0,variance))).replace(',','{,}')}.\\)`);
      const observed=n?d.x.reduce((s,x,i)=>s+x*count[i],0)/n:0;
      $('sim-result').textContent=n?`${n} tirages · moyenne observée : ${num(observed)} · espérance théorique : ${num(mu)}.`:'Aucune simulation pour le moment.';
    }
    function reset(){count=[0,0,0];n=0;draw();}
    ['vx0','vx2','vp0','vsplit'].forEach(id=>$(id).addEventListener('input',reset));
    $('simulate').addEventListener('click',()=>{const d=data();for(let i=0;i<200;i++){const r=Math.random()*100;count[r<d.weights[0]?0:r<d.weights[0]+d.weights[1]?1:2]++;n++;}draw();});
    $('reset-simulation').addEventListener('click',reset);draw();
  }else{
    function words(n){return Array.from({length:2**n},(_,i)=>i.toString(2).padStart(n,'0').replace(/0/g,'E').replace(/1/g,'S'));}
    function draw(){
      const p=+$('vp').value/10,n=+$('vn').value,all=words(n),sel=$('vpath'),previous=sel.value;
      if(sel.options.length!==all.length){sel.replaceChildren();all.forEach(word=>{const o=document.createElement('option');o.value=word;o.textContent=word;sel.append(o);});if(all.includes(previous))sel.value=previous;}
      $('vp-out').textContent=num(p);const kind=$('vevent').value,chosen=sel.value;
      const svg=$('fig');svg.replaceChildren();let total=0,sum=0;
      all.forEach((word,i)=>{const k=[...word].filter(c=>c==='S').length,prob=[...word].reduce((v,c)=>v*(c==='S'?p:1-p),1),yes=kind==='one'?k>=1:kind==='two'?k===2:word===chosen,y=27+i*40;
        total+=prob;if(yes)sum+=prob;label(svg,12,y+10,word,{'font-weight':yes?700:400});node(svg,'rect',{x:69,y,width:220*prob,height:16,fill:yes?'#2563eb':'#e5e7eb',rx:3});label(svg,345,y+12,num(prob),{'text-anchor':'end',fill:yes?'#1d4ed8':'#6b7280'});
      });
      display(`Somme des chemins favorables : <b>${num(sum)}</b>.<br>Somme de toutes les feuilles : <b>${num(total)}</b>.`);
    }
    ['vp','vn','vevent','vpath'].forEach(id=>$(id).addEventListener(id==='vp'?'input':'change',draw));draw();
  }
})();
