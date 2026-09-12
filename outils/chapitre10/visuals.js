(function(){
  'use strict';
  const $=id=>document.getElementById(id),P=Math.PI,blue='#2563eb',green='#15803d';
  const fmt=x=>(Math.abs(x)<5e-10?0:x).toLocaleString('fr-FR',{maximumFractionDigits:3});
  const angle=u=>{const a=T10.R(u,12);return a.n===0?'0':(a.n===-1?'-':a.n===1?'':a.n)+'π'+(a.d===1?'':'/'+a.d);};
  const line=(x1,y1,x2,y2,color='#94a3b8',extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" ${extra}/>`;
  const dot=(x,y,color,r=5,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" ${extra}/>`;
  const text=(x,y,s)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="#475569">${s}</text>`;
  function path(fn,min,max,X,Y,color){const points=Array.from({length:721},(_,i)=>{const x=min+(max-min)*i/720;return (i?'L':'M')+X(x)+','+Y(fn(x));});return `<path d="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="2.5"/>`;}
  function axes(X,Y,min,max,low,high){let s=line(X(min),Y(0),X(max),Y(0))+line(X(0),Y(low),X(0),Y(high));for(let k=Math.ceil(min/P);k<=Math.floor(max/P);k+=(min< -2*P?2:1))s+=line(X(k*P),Y(0)-4,X(k*P),Y(0)+4)+text(X(k*P),Y(0)+26,k===0?'0':k===1?'π':k===-1?'−π':k+'π');return s;}
  function watch(ids,render){ids.forEach(id=>$(id).addEventListener($(id).type==='range'?'input':'change',render));render();}
  if(Chapter10.code==='10A'){
    function render(){
      const u=+$('angle').value,x=u*P/12,c=Math.cos(x),s=Math.sin(x),cx=200,cy=150,r=115;
      $('angle-value').textContent=angle(u);$('circle-values').textContent=`x = ${angle(u)} rad (${u*15}°). cos x ≈ ${fmt(c)} ; sin x ≈ ${fmt(s)}.`;
      $('turn-minus').disabled=u-24< -48;$('turn-plus').disabled=u+24>48;
      $('circle').innerHTML=`<circle cx="200" cy="150" r="115" fill="#f8fafc" stroke="#94a3b8"/>`+line(55,cy,345,cy)+line(cx,12,cx,290)+text(335,174,'I (1 ; 0)')+text(217,310,'y')+text(375,155,'x')+line(cx,cy,cx+r*c,cy-r*s,'#64748b')+line(cx,cy,cx+r*c,cy,blue,'stroke-width="4"')+line(cx+r*c,cy,cx+r*c,cy-r*s,green,'stroke-width="4"')+line(cx,cy-r*s,cx+r*c,cy-r*s,'#94a3b8','stroke-dasharray="4 4"')+dot(cx+r*c,cy-r*s,'#0f172a',6,'id="circle-point"')+text(320,35,'↺ positif');
      const X=t=>40+(t+4*P)/(8*P)*540,Y=y=>120-75*y;
      $('waves').innerHTML=axes(X,Y,-4*P,4*P,-1.3,1.3)+text(24,Y(1),'1')+text(22,Y(-1),'−1')+path(Math.cos,-4*P,4*P,X,Y,blue)+path(Math.sin,-4*P,4*P,X,Y,green)+line(X(x),20,X(x),220,'#64748b','stroke-dasharray="4 4"')+dot(X(x),Y(c),blue,5,'id="cos-point"')+dot(X(x),Y(s),green,5,'id="sin-point"');
    }
    watch(['angle'],render);
    [['turn-minus',()=>+$('angle').value-24],['turn-plus',()=>+$('angle').value+24],['opposite',()=>-$('angle').value],['angle-reset',()=>4]].forEach(([id,fn])=>$(id).addEventListener('click',()=>{$('angle').value=fn();render();}));
  }else{
    function renderDerivative(){
      const a=+$('amplitude').value,b=+$('frequency').value,c=+$('offset').value,u=+$('abscissa').value,x0=u*P/12,kind=$('function-kind').value;
      const f=x=>a*Math[kind](b*x)+c,df=x=>a*b*(kind==='sin'?Math.cos(b*x):-Math.sin(b*x)),y0=f(x0),slope=df(x0);
      ['amplitude','frequency','offset'].forEach(id=>$(id+'-value').textContent=$(id).value);$('abscissa-value').textContent=angle(u);
      const coefficient=kind==='sin'?a*b:-a*b;
      $('slope-values').textContent=`f′(x) = ${coefficient} ${kind==='sin'?'cos':'sin'}(${b}x). À x₀ = ${angle(u)} : f(x₀) ≈ ${fmt(y0)} ; pente f′(x₀) ≈ ${fmt(slope)}.`;
      const top=Math.max(1,Math.abs(a)+Math.abs(c),Math.abs(a*b))*1.2,X=x=>40+(x+2*P)/(4*P)*540,Y=y=>140-110*y/top;
      $('derivative-plot').innerHTML='<defs><clipPath id="plot-clip"><rect x="40" y="20" width="540" height="240"/></clipPath></defs>'+axes(X,Y,-2*P,2*P,-top,top)+text(80,32,fmt(top))+text(80,255,fmt(-top))+`<g clip-path="url(#plot-clip)">`+path(f,-2*P,2*P,X,Y,blue)+path(df,-2*P,2*P,X,Y,green)+line(X(-2*P),Y(y0+slope*(-2*P-x0)),X(2*P),Y(y0+slope*(2*P-x0)),'#c2410c','stroke-width="2" stroke-dasharray="7 5" id="tangent-line"')+dot(X(x0),Y(y0),blue,6,'id="function-point"')+dot(X(x0),Y(slope),green,5,'id="slope-point"')+'</g>';
    }
    // Tous les segments sont fermés. Un segment réduit à un point est une solution isolée.
    function solve(a,relation){
      const full=[[-P,P]];
      if(relation==='eq'){if(a< -1||a>1)return [];if(a===1)return [[0,0]];if(a===-1)return [[-P,-P],[P,P]];const t=Math.acos(a);return [[-t,-t],[t,t]];}
      if(relation==='le'){if(a< -1)return [];if(a>=1)return full;const t=Math.acos(a);return [[-P,-t],[t,P]];}
      if(a>1)return [];if(a<=-1)return full;const t=Math.acos(a);return [[-t,t]];
    }
    Chapter10.solveCos=solve;
    function renderSolutions(){
      const a=+$('level').value/10,relation=$('relation').value,segments=solve(a,relation),X=x=>40+(x+P)/(2*P)*540,Y=y=>135-75*y;
      $('level-value').textContent=fmt(a);
      const exact=x=>Math.abs(x)<1e-12?'0':Math.abs(x+P)<1e-12?'−π':Math.abs(x-P)<1e-12?'π':x<0?'−α':'α';
      const result=segments.length?segments.map(([l,r])=>l===r?'{'+exact(l)+'}':'['+exact(l)+' ; '+exact(r)+']').join(' ∪ '):'∅';
      $('solution-values').textContent='S = '+result+(a> -1&&a<1?`. Ici α est l’unique angle de [0,π] tel que cos α = ${fmt(a)} ; α ≈ ${fmt(Math.acos(a))} rad.`:'.');
      let graphic=axes(X,Y,-P,P,-1.3,1.3)+text(25,Y(1),'1')+text(23,Y(-1),'−1')+path(Math.cos,-P,P,X,Y,blue)+line(40,Y(a),580,Y(a),'#c2410c','stroke-dasharray="5 4"')+text(305,265,'Solutions dans [−π,π]')+line(40,286,580,286);
      for(const [l,r] of segments)graphic+=line(X(l),286,X(r),286,green,`stroke-width="5" data-solution="true" data-left="${l}" data-right="${r}"`)+dot(X(l),286,green)+dot(X(r),286,green);
      $('solution-plot').innerHTML=graphic;
    }
    watch(['amplitude','frequency','offset','abscissa','function-kind'],renderDerivative);
    watch(['level','relation'],renderSolutions);
  }
})();
