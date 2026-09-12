/* Calculs rationnels exacts : les BigInt restent internes, les fractions sont sérialisables. */
(function(root){
  'use strict';
  const gcd=(a,b)=>b?gcd(b,a%b):a<0n?-a:a;
  function R(a,b=1){let n=BigInt(a),d=BigInt(b);if(!d)throw Error('Dénominateur nul');if(d<0n){n=-n;d=-d;}const g=gcd(n,d);return {n:String(n/g),d:String(d/g)};}
  const add=(a,b)=>R(BigInt(a.n)*BigInt(b.d)+BigInt(b.n)*BigInt(a.d),BigInt(a.d)*BigInt(b.d));
  const sub=(a,b)=>R(BigInt(a.n)*BigInt(b.d)-BigInt(b.n)*BigInt(a.d),BigInt(a.d)*BigInt(b.d));
  const cmp=(a,b)=>{const x=BigInt(a.n)*BigInt(b.d)-BigInt(b.n)*BigInt(a.d);return x<0n?-1:x>0n?1:0;};
  const val=a=>Number(a.n)/Number(a.d);
  const tex=a=>a.d==='1'?a.n:(a.n.startsWith('-')?'-':'')+'\\frac{'+a.n.replace('-','')+'}{'+a.d+'}';
  const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  function shuffle(xs){const a=xs.slice();for(let i=a.length-1;i>0;i--){const j=rnd(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function choose(n,k){if(k<0||k>n)return 0n;let c=1n;for(let j=1;j<=k;j++)c=c*BigInt(n-j+1)/BigInt(j);return c;}
  function law(n,m){
    if(!Number.isInteger(n)||n<0||n>30||!Number.isInteger(m)||m<0||m>10)throw Error('Paramètres hors domaine');
    if(m===0||m===10)return Array.from({length:n+1},(_,k)=>R(k===(m===0?0:n)?1:0));
    return Array.from({length:n+1},(_,k)=>R(choose(n,k)*BigInt(m)**BigInt(k)*BigInt(10-m)**BigInt(n-k),10n**BigInt(n)));
  }
  function interval(dist,a,b){return dist.reduce((s,p,k)=>k>=a&&k<=b?add(s,p):s,R(0));}
  const point=(d,k)=>k>=0&&k<d.length?d[k]:R(0);
  const cdf=(d,k)=>interval(d,0,k);
  const tail=(d,k)=>interval(d,k+1,d.length-1);
  function threshold(d,alpha){for(let k=0;k<d.length;k++)if(cmp(tail(d,k),alpha)<=0)return k;throw Error('Seuil introuvable');}
  function rounded(a,places=3){const scale=10n**BigInt(places),n=BigInt(a.n),d=BigInt(a.d);if(n<0n)throw Error('Arrondi de probabilité négative');return R((2n*n*scale+d)/(2n*d),scale);}
  function decimal(a,places=3){const r=rounded(a,places),scale=10n**BigInt(places),digits=(BigInt(r.n)*scale/BigInt(r.d)).toString().padStart(places+1,'0');return places?digits.slice(0,-places)+','+digits.slice(-places):digits;}
  function rational(raw){
    const s=String(raw).trim().replace(/−/g,'-').replace(/,/g,'.');
    if(s.length>100||!/^\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)\s*(?:\/\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)\s*)?$/.test(s))return null;
    function part(x){x=x.trim();const sign=x.startsWith('-')?-1n:1n,b=x.replace(/^[+-]/,'').split('.');return [sign*BigInt((b[0]||'0')+(b[1]||'')),10n**BigInt((b[1]||'').length)];}
    const parts=s.split('/'),a=part(parts[0]),b=parts.length===2?part(parts[1]):[1n,1n];return b[0]===0n?null:R(a[0]*b[1],a[1]*b[0]);
  }
  const parseNum=raw=>{const a=rational(raw);return a?val(a):NaN;};
  const accepts=(e,raw)=>{const a=rational(raw);return !!a&&cmp(a,e.answer)===0;};
  function numeric(kind,data,q,answer,wrong,expl){
    const options=[answer];for(const x of wrong)if(!options.some(a=>cmp(a,x)===0))options.push(x);
    for(let i=1;options.length<4;i++){const x=add(answer,R(i,10));if(!options.some(a=>cmp(a,x)===0))options.push(x);}
    const mixed=shuffle(options.slice(0,4));return {kind,data,q,options:mixed.map(a=>'\\('+tex(a)+'\\)'),correct:mixed.findIndex(a=>cmp(a,answer)===0),expl};
  }
  function concept(kind,q,options,correct,expl){const order=shuffle([0,1,2,3]);return {kind,data:{},q,options:order.map(i=>options[i]),correct:order.indexOf(correct),expl};}
  const parameters=()=>{const n=rnd(3,7),m=rnd(1,9);return {n,m,k:rnd(0,n)};};
  const description=d=>`X suit la loi \\(\\mathcal B(${d.n},${tex(R(d.m,10))}).\\)`;
  const generators=[
    ()=>{const n=rnd(3,6),m=rnd(1,9),k=rnd(0,n),d={n,m,k},a=point(law(n,m),k),c=choose(n,k),path=R(BigInt(m)**BigInt(k)*BigInt(10-m)**BigInt(n-k),10n**BigInt(n));
      return {data:d,answer:a,enonce:`<p>On répète ${n} tests indépendants. Chacun a deux issues et réussit avec la même probabilité \\(${tex(R(m,10))}.\\) X compte les tests réussis.</p><p>Calculer \\(P(X=${k}).\\) Donner la <b>valeur exacte</b>, sous forme de fraction ou de décimal exact.</p>`,correction:`<ol><li>Le nombre d’essais est ${n}, le paramètre de succès est \\(p=${tex(R(m,10))}.\\) X suit une loi binomiale.</li><li>Il y a \\(\\binom{${n}}{${k}}=${c}\\) chemins à ${k} succès. Chacun a pour probabilité \\[\\left(${tex(R(m,10))}\\right)^{${k}}\\left(${tex(R(10-m,10))}\\right)^{${n-k}}=${tex(path)}.\\]</li><li>Les chemins sont incompatibles ; on additionne leurs probabilités : \\[P(X=${k})=${c}\\times${tex(path)}=${tex(a)}.\\]</li></ol><p>Le coefficient binomial compte les chemins ; il ne remplace pas leur probabilité.</p>`};},
    ()=>{const n=rnd(6,12),m=rnd(1,9),a=rnd(1,n-2),b=rnd(a+1,n),d={n,m,a,b},dist=law(n,m),exact=interval(dist,a,b),answer=rounded(exact);
      return {data:d,answer,exact,rounded:true,enonce:`<p>${description(d)}</p><p>Calculer \\(P(${a}\\leq X\\leq${b}).\\) Donner le résultat <b>arrondi au millième</b> (trois chiffres après la virgule).</p>`,correction:`<ol><li>Les deux bornes sont incluses. On additionne les probabilités pour les entiers ${a} à ${b}.</li><li>Avec la fonction cumulée \\(F(t)=P(X\\leq t),\\) on peut écrire \\[P(${a}\\leq X\\leq${b})=F(${b})-F(${a-1}).\\]</li><li>Les valeurs exactes sont \\(F(${b})=${tex(cdf(dist,b))}\\) et \\(F(${a-1})=${tex(cdf(dist,a-1))}.\\)</li><li>Leur différence vaut \\(${tex(exact)}.\\) On arrondit seulement maintenant : <b>${decimal(exact)}</b>.</li></ol><p>Soustraire F(${a}) exclurait à tort la valeur ${a}. Le vérificateur attend le bon arrondi, pas une valeur seulement voisine.</p>`};},
    ()=>{const n=rnd(8,16),m=rnd(2,8),percent=[5,10,20,25][rnd(0,3)],d={n,m,percent},dist=law(n,m),alpha=R(percent,100),k=threshold(dist,alpha),t=tail(dist,k),prev=k?tail(dist,k-1):null;
      return {data:d,answer:R(k),enonce:`<p>${n} personnes ont réservé une activité. Chacune vient avec probabilité \\(${tex(R(m,10))},\\) indépendamment des autres. X compte les personnes présentes.</p><p>Quel est le <b>plus petit nombre entier de places k</b>, entre 0 et ${n}, pour lequel \\(P(X>k)\\leq${tex(alpha)}\\) ? Donner cet entier.</p>`,correction:`<ol><li>On modélise X par \\(\\mathcal B(${n},${tex(R(m,10))}).\\) Il manque des places exactement lorsque X &gt; k.</li><li>Pour k = ${k}, la probabilité de dépassement est \\(${tex(t)}\\) : elle est inférieure ou égale à \\(${tex(alpha)}.\\)</li><li>${k?`Pour k = ${k-1}, cette probabilité vaut \\(${tex(prev)},\\) strictement supérieure à \\(${tex(alpha)}.\\)`:'Zéro est déjà le plus petit entier autorisé.'}</li><li>La probabilité \\(P(X>k)\\) décroît au sens large avec k. Le plus petit nombre de places est donc <b>${k}</b>.</li></ol><p>Comparer les valeurs exactes évite de valider un seuil à tort à cause d’un arrondi.</p>`};}
  ];
  const qcmBank=[
    ()=>{const d=parameters(),a=point(law(d.n,d.m),d.k);return numeric('point',d,`${description(d)} Que vaut \\(P(X=${d.k})\\) ?`,a,[R(d.m,10),R(0),sub(R(1),a)],`On utilise le coefficient binomial et la probabilité d’un chemin : \\(P(X=${d.k})=${tex(a)}.\\)`);},
    ()=>{const d=parameters(),dist=law(d.n,d.m),a=cdf(dist,d.k);return numeric('cdf',d,`${description(d)} Que vaut \\(P(X\\leq${d.k})\\) ?`,a,[point(dist,d.k),tail(dist,d.k),R(0)],`On additionne les valeurs de 0 à ${d.k} inclus : \\(${tex(a)}.\\)`);},
    ()=>{const d=parameters(),dist=law(d.n,d.m),a=tail(dist,d.k-1);return numeric('atLeast',d,`${description(d)} Probabilité d’au moins ${d.k} succès ?`,a,[tail(dist,d.k),cdf(dist,d.k),point(dist,d.k)],`Au moins ${d.k} signifie X ≥ ${d.k} : \\(1-P(X\\leq${d.k-1})=${tex(a)}.\\)`);},
    ()=>{const d=parameters(),dist=law(d.n,d.m),a=cdf(dist,d.k-1);return numeric('strictLess',d,`${description(d)} Que vaut \\(P(X<${d.k})\\) ?`,a,[cdf(dist,d.k),point(dist,d.k),R(1)],`X est entier, donc X < ${d.k} équivaut à X ≤ ${d.k-1}. Le résultat est \\(${tex(a)}.\\)`);},
    ()=>{const d=parameters();d.a=rnd(0,d.n-1);d.b=rnd(d.a+1,d.n);const dist=law(d.n,d.m),a=interval(dist,d.a,d.b);return numeric('interval',d,`${description(d)} Que vaut \\(P(${d.a}\\leq X\\leq${d.b})\\) ?`,a,[point(dist,d.a),cdf(dist,d.b),sub(R(1),a)],`On inclut toutes les valeurs de ${d.a} à ${d.b} : \\(${tex(a)}.\\)`);},
    ()=>{const d=parameters(),a=R(d.n*d.m,10);return numeric('mean',d,`${description(d)} Quelle est son espérance ?`,a,[R(d.m,10),R(d.n),R(d.n*d.m*(10-d.m),100)],`\\(E(X)=np=${tex(a)}.\\)`);},
    ()=>{const d=parameters(),a=R(d.n*d.m*(10-d.m),100);return numeric('variance',d,`${description(d)} Quelle est sa variance ?`,a,[R(d.n*d.m,10),R(d.m*(10-d.m),100),R(0)],`\\(V(X)=np(1-p)=${tex(a)}.\\)`);},
    ()=>{const n=[4,16][rnd(0,1)],a=R(Math.sqrt(n)/2);return numeric('sigma',{n},`X suit \\(\\mathcal B(${n},1/2).\\) Quel est son écart type ?`,a,[R(n/4),R(n/2),R(0)],`La variance vaut ${n/4} ; sa racine carrée est \\(${tex(a)}.\\)`);},
    ()=>{const d=parameters(),dist=law(d.n,d.m),a=dist[0];return numeric('none',d,`${description(d)} Probabilité d’aucun succès ?`,a,[dist[d.n],sub(R(1),a),R(0)],`Le seul chemin est constitué d’échecs : \\((1-p)^{${d.n}}=${tex(a)}.\\)`);},
    ()=>{const d=parameters(),a=tail(law(d.n,d.m),0);return numeric('atLeastOne',d,`${description(d)} Probabilité d’au moins un succès ?`,a,[sub(R(1),a),R(d.m,10),R(1)],`C’est le complément d’aucun succès : \\(1-(1-p)^{${d.n}}=${tex(a)}.\\)`);},
    ()=>{const d=parameters();d.percent=[5,10,25,50][rnd(0,3)];const dist=law(d.n,d.m),k=threshold(dist,R(d.percent,100));return numeric('threshold',d,`${description(d)} Plus petit entier k entre 0 et ${d.n} avec \\(P(X>k)\\leq${tex(R(d.percent,100))}\\) ?`,R(k),[R(Math.max(0,k-1)),R(k+1),R(d.n)],`Le premier entier satisfaisant le risque demandé est ${k}. Le test compare P(X > k), pas P(X ≥ k).`);},
    ()=>{const d=parameters(),exact=point(law(d.n,d.m),d.k),a=rounded(exact);return numeric('rounded',d,`${description(d)} Arrondir \\(P(X=${d.k})\\) au millième.`,a,[add(a,R(1,1000)),sub(a,R(1,1000)),exact],`La valeur exacte est \\(${tex(exact)}.\\) Son arrondi est ${decimal(exact)}, soit \\(${tex(a)}.\\)`);},
    ()=>concept('model','Quelle situation justifie directement une loi binomiale pour le nombre de succès ?', ['Un nombre fixé d’essais indépendants à deux issues, avec le même p.','Des essais indépendants dont p change à chaque fois.','Des tirages sans remise quelconques dans une urne.','Des essais de même p, sans hypothèse d’indépendance.'],0,'Il faut à la fois un nombre fixé d’essais, deux issues, la constance de p et l’indépendance.'),
    ()=>concept('support','Si X suit une loi binomiale de paramètres n et p, quelle affirmation est toujours vraie ?', ['X est un entier compris entre 0 et n.','X est toujours égal à np.','X peut prendre toute valeur réelle entre 0 et n.','X est une probabilité comprise entre 0 et 1.'],0,'X compte les succès. Son espérance np peut, elle, ne pas être entière.'),
    ()=>concept('paths','Dans la formule binomiale, que représente le coefficient binomial ?', ['Le nombre de chemins ayant exactement k succès.','La probabilité d’un seul chemin.','Le nombre total de chemins, quel que soit k.','La probabilité de succès d’un essai.'],0,'8A compte les choix des k positions de succès ; 7C donne le produit des probabilités le long d’un chemin.'),
    ()=>concept('simulation','On simule 200 valeurs indépendantes de X suivant la même loi binomiale. Que peut-on affirmer ?', ['La fréquence observée peut différer de la probabilité théorique.','Chaque fréquence est exactement la probabilité théorique.','La moyenne est forcément np à chaque simulation.','Ajouter une simulation rapproche toujours la fréquence de la théorie.'],0,'Un échantillon fluctue : la loi théorique n’impose pas des fréquences exactes dans chaque série finie.')
  ];
  root.Chapter9={code:'9A',R,add,sub,cmp,val,tex,choose,law,point,cdf,tail,interval,threshold,rounded,decimal,parseNum,accepts,generators,qcmBank};
})(globalThis);
