(function(root){
  'use strict';
  const {R,tex,pi,rnd,pick,mod,notable,trigTex,roundedTrig,numQ,textQ,exactTrigQ}=T10;
  const angle=()=>pick(notable)+24*rnd(-3,3);
  const generators=[
    ()=>{const degrees=15*rnd(-36,36),d={degrees},answer=R(degrees,180);return {data:d,answer,enonce:`<p>Un angle orienté mesure ${degrees}°. On veut l’écrire sous la forme \\(q\\pi\\) radians. <b>Donner seulement le coefficient q</b>, sous forme exacte (fraction autorisée).</p>`,correction:`<ol><li>180° correspondent à π radians.</li><li>Le coefficient vaut \\(q=\\frac{${degrees}}{180}=${tex(answer)}.\\)</li><li>L’angle est donc \\(${pi(answer)}\\) radians. Le signe indique le sens de rotation ; il n’est pas supprimé.</li></ol>`};},
    ()=>{const u=angle(),fn=pick(['sin','cos']),d={u,fn},answer=roundedTrig(fn,u),exact=trigTex(fn,u),decimal=(answer.n/answer.d).toFixed(3).replace('.',',');return {data:d,answer,rounded:true,enonce:`<p>Calculer \\(\\${fn}\\left(${pi(R(u,12))}\\right).\\) Donner le résultat <b>arrondi au millième</b>. Les angles sont en radians.</p>`,correction:`<ol><li>On enlève ou ajoute des tours complets. L’angle \\(${pi(R(u,12))}\\) a le même point image que \\(${pi(R(mod(u),12))}.\\)</li><li>Le ${fn==='sin'?'sinus est l’ordonnée':'cosinus est l’abscisse'} du point. La valeur exacte est \\(${exact}.\\)</li><li>Au millième, on obtient <b>${decimal}</b>.</li></ol><p>Vérifier le quadrant pour le signe. Le bon arrondi est demandé, pas une valeur approchée quelconque.</p>`};},
    ()=>{const radius=rnd(2,9),u=pick([-30,-24,-18,-12,-10,-9,-8,-6,-4,-3,-2,2,3,4,6,8,9,10,12,18,24,30]),d={radius,u},answer=R(radius*Math.abs(u),12);return {data:d,answer,enonce:`<p>Un point parcourt un cercle de rayon ${radius} cm selon une rotation orientée de \\(${pi(R(u,12))}\\) radians, <b>en comptant tout le parcours, même s’il dépasse un tour</b>.</p><p>La longueur parcourue s’écrit \\(L=q\\pi\\) cm. Donner seulement le coefficient q exact.</p>`,correction:`<ol><li>Une longueur est positive : on utilise la valeur absolue de l’angle, \\(${pi(R(Math.abs(u),12))}.\\)</li><li>La longueur d’arc est le rayon multiplié par l’angle parcouru en radians.</li><li>Ainsi \\(L=${radius}\\times${pi(R(Math.abs(u),12))}=${pi(answer)}\\) cm, donc \\(q=${tex(answer)}.\\)</li></ol><p>Il ne faut pas réduire l’angle modulo un tour : cela ferait perdre une partie de la longueur parcourue.</p>`};}
  ];
  const qcmBank=[
    ()=>{const degrees=30*rnd(-12,12),a=R(degrees,180);return numQ('degrees',{degrees},`${degrees}° = qπ radians. Que vaut q ?`,a,[R(degrees,360),R(-degrees,180),R(degrees,90)],`On divise par 180 : \\(q=${tex(a)}.\\)`);},
    ()=>{const u=angle(),a=R(u*15);return numQ('radians',{u},`Combien de degrés représente l’angle \\(${pi(R(u,12))}\\) radians ?`,a,[R(u*30),R(-u*15),R(u)],`Un coefficient de π correspond à ce coefficient multiplié par 180 : ${a.n}°.`);},
    ()=>{const u=angle();return exactTrigQ('sin',{u},`Valeur exacte de \\(\\sin\\left(${pi(R(u,12))}\\right)\\) ?`,'sin',u);},
    ()=>{const u=angle();return exactTrigQ('cos',{u},`Valeur exacte de \\(\\cos\\left(${pi(R(u,12))}\\right)\\) ?`,'cos',u);},
    ()=>{const u=pick([2,3,4,8,9,10]);return exactTrigQ('oppositeSin',{u},`Que vaut \\(\\sin\\left(-${pi(R(u,12))}\\right)\\) ?`,'sin',-u);},
    ()=>{const u=pick([2,3,4,8,9,10]);return exactTrigQ('oppositeCos',{u},`Que vaut \\(\\cos\\left(-${pi(R(u,12))}\\right)\\) ?`,'cos',-u);},
    ()=>{const u=pick([2,3,4,8,9,10]),turn=rnd(1,4);return exactTrigQ('period',{u,turn},`Que vaut \\(\\sin\\left(${pi(R(u+24*turn,12))}\\right)\\) ?`,'sin',u);},
    ()=>{const u=pick([2,3,4]);return exactTrigQ('associated',{u},`Que vaut \\(\\cos\\left(\\pi-${pi(R(u,12))}\\right)\\) ?`,'cos',12-u);},
    ()=>textQ('coordinates',{},'Le point image de x sur le cercle unité a pour coordonnées…','(cos(x) ; sin(x))',['(sin(x) ; cos(x))','(x ; x)','(cos(x) ; −sin(x))'],'Le cosinus est l’abscisse et le sinus l’ordonnée.'),
    ()=>textQ('norm',{},'Pour tout réel x, quelle identité est vraie ?','\\(\\cos^2x+\\sin^2x=1.\\)',['\\(\\cos x+\\sin x=1.\\)','\\(\\cos^2x-\\sin^2x=1.\\)','\\(\\cos x=\\sin x.\\)'],'Le point appartient au cercle de rayon 1, donc la somme des carrés de ses coordonnées vaut 1.'),
    ()=>textQ('quadrant',{},'Si π < x < 3π/2, quels sont les signes de cos(x) et sin(x) ?','Tous deux négatifs.',['Tous deux positifs.','Cosinus positif, sinus négatif.','Cosinus négatif, sinus positif.'],'Dans le troisième quadrant, abscisse et ordonnée sont négatives.'),
    ()=>{const radius=rnd(2,8),u=pick([2,3,4,6,8,12]),a=R(radius*u,12);return numQ('arc',{radius,u},`Sur un cercle de rayon ${radius}, un parcours d’angle \\(${pi(R(u,12))}\\) a pour longueur qπ. Que vaut q ?`,a,[R(u,12),R(radius*u,6),R(radius,1)],`La longueur vaut Rθ, donc \\(q=${tex(a)}.\\)`);}
  ];
  root.Chapter10={code:'10A',generators,qcmBank,parseNum:T10.parseNum,accepts:T10.accepts};
})(globalThis);
