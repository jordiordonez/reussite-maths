(function(root){
  'use strict';
  const {R,add,sub,mul,div,tex:t,wrap:w,rnd,numeric,concept}=C7;
  const table=()=>({ab:rnd(2,35),anb:rnd(2,35),nab:rnd(2,35),nanb:rnd(2,35)});
  const branch=()=>({a:rnd(1,9),b:rnd(1,9),c:rnd(1,9)});
  function probabilities(d){
    const a=R(d.a,10),b=R(d.b,10),c=R(d.c,10);
    const joint=mul(a,b),other=mul(sub(R(1),a),c),total=add(joint,other);
    return {a,b,c,joint,other,total,reverse:div(joint,total)};
  }
  const generators=[
    function(){
      const d=table(),answer=R(d.ab,d.ab+d.anb);
      return {data:d,answer,enonce:`<p>On tire au hasard une personne, avec équiprobabilité, dans le groupe suivant. A : « pratique un sport », B : « joue d’un instrument ».</p><div class="tablewrap"><table><tr><th></th><th>B</th><th>Non B</th></tr><tr><th>A</th><td>${d.ab}</td><td>${d.anb}</td></tr><tr><th>Non A</th><td>${d.nab}</td><td>${d.nanb}</td></tr></table></div><p>Calculer \\(P_A(B).\\) Donner la valeur exacte, sous forme décimale ou de fraction.</p>`,
        correction:`<ol><li>« Sachant A » : on se limite à la ligne A, soit ${d.ab}+${d.anb}=${d.ab+d.anb} personnes.</li><li>Parmi elles, ${d.ab} réalisent B.</li><li>Donc \\(P_A(B)=\\frac{${d.ab}}{${d.ab+d.anb}}=${t(answer)}.\\)</li></ol>`};
    },
    function(){
      const d=branch(),p=probabilities(d);
      return {data:d,answer:p.total,enonce:`<p>On connaît \\(P(A)=${t(p.a)},\\) \\(P_A(B)=${t(p.b)}\\) et \\(P_{\\overline A}(B)=${t(p.c)}.\\)</p><p>Calculer \\(P(B)\\) avec les deux chemins de l’arbre. Donner une valeur exacte.</p>`,
        correction:`<ol><li>La branche complémentaire vaut \\(P(\\overline A)=1-${t(p.a)}=${t(sub(R(1),p.a))}.\\)</li><li>Les deux chemins donnent \\(P(A\\cap B)=${t(p.a)}\\times${t(p.b)}=${t(p.joint)}\\) et \\(P(\\overline A\\cap B)=${t(sub(R(1),p.a))}\\times${t(p.c)}=${t(p.other)}.\\)</li><li>Ils sont incompatibles et couvrent B : \\(P(B)=${t(p.joint)}+${t(p.other)}=${t(p.total)}.\\)</li></ol>`};
    },
    function(){
      const d=branch(),p=probabilities(d);
      return {data:d,answer:p.reverse,enonce:`<p>Dans un lot de pièces, la proportion provenant de l’atelier A est ${w(p.a)}. Parmi les pièces de A, la proportion défectueuse est ${w(p.b)} ; parmi celles de l’autre atelier, elle est ${w(p.c)}.</p><p>On choisit une pièce au hasard dans le lot et on constate qu’elle est défectueuse (événement D). Calculer \\(P_D(A).\\) Donner la valeur exacte, sous forme de fraction si nécessaire.</p>`,
        correction:`<ol><li>Le chemin « A puis D » a pour probabilité \\(P(A\\cap D)=${t(p.a)}\\times${t(p.b)}=${t(p.joint)}.\\)</li><li>La probabilité totale d’un défaut est \\(P(D)=${t(p.joint)}+${t(p.other)}=${t(p.total)}>0.\\)</li><li>On se restreint aux pièces défectueuses : \\(P_D(A)=\\frac{P(A\\cap D)}{P(D)}=\\frac{${t(p.joint)}}{${t(p.total)}}=${t(p.reverse)}.\\)</li></ol><p>On a inversé le conditionnement : la donnée \\(P_A(D)\\) ne répondait pas directement à la question.</p>`};
    }
  ];
  const bank=[
    ()=>{const d=table(),a=R(d.ab,d.ab+d.anb);return numeric('conditional',d,`Parmi ${d.ab+d.anb} élèves de A, ${d.ab} sont dans B. Que vaut \\(P_A(B)\\) ?`,a,[R(d.anb,d.ab+d.anb),R(d.ab,d.ab+d.nab),R(d.ab,d.ab+d.anb+d.nab+d.nanb)],`On divise l’effectif de A et B par celui de A : ${w(a)}.`);},
    ()=>{const d=branch(),p=probabilities(d);return numeric('intersection',d,`Si \\(P(A)=${t(p.a)}\\) et \\(P_A(B)=${t(p.b)},\\) que vaut \\(P(A\\cap B)\\) ?`,p.joint,[p.a,p.b,add(p.a,p.b)],`On multiplie le long du chemin : \\(${t(p.a)}\\times${t(p.b)}=${t(p.joint)}.\\)`);},
    ()=>{const d=branch(),p=probabilities(d);return numeric('total',d,`\\(P(A)=${t(p.a)},\\) \\(P_A(B)=${t(p.b)},\\) \\(P_{\\overline A}(B)=${t(p.c)}.\\) Que vaut \\(P(B)\\) ?`,p.total,[p.joint,p.other,add(p.b,p.c)],`La somme des deux chemins donne \\(${t(p.joint)}+${t(p.other)}=${t(p.total)}.\\)`);},
    ()=>{const d=branch(),p=probabilities(d);return numeric('reverse',d,`\\(P(A\\cap B)=${t(p.joint)}\\) et \\(P(B)=${t(p.total)}.\\) Que vaut \\(P_B(A)\\) ?`,p.reverse,[p.joint,p.total,p.b],`On divise par la probabilité de ce qui est connu : \\(${t(p.joint)}\\div${t(p.total)}=${t(p.reverse)}.\\)`);},
    ()=>{const b=rnd(1,9),v=R(10-b,10);return numeric('conditionalComplement',{b},`\\(P_A(B)=${t(R(b,10))}.\\) Que vaut \\(P_A(\\overline B)\\) ?`,v,[R(b,10),R(1),R(0)],`Dans la population A, les deux branches totalisent 1 : ${w(v)}.`);},
    ()=>concept('independence',{},'Quelle égalité caractérise l’indépendance de A et B ?', ['\\(P(A\\cap B)=P(A)P(B).\\)','\\(P(A\\cap B)=0.\\)','\\(P(A)=P(B).\\)','\\(P(A\\cup B)=1.\\)'],0,'C’est la définition, valable même si un événement a une probabilité nulle.'),
    ()=>concept('disjoint',{},'A et B sont incompatibles et ont chacun une probabilité strictement positive. Sont-ils indépendants ?', ['Non : l’intersection a une probabilité nulle, mais le produit est positif.','Oui, car ils ne peuvent pas se produire ensemble.','Oui, dès que leurs probabilités sont égales.','On ne peut jamais le savoir.'],0,'L’indépendance exigerait un produit égal à la probabilité de l’intersection : ici ils diffèrent.'),
    ()=>{const a=rnd(1,4),b=rnd(1,4),ans=R(10-a-b,10);return numeric('partition',{a,b},`A, B, C forment une partition. \\(P(A)=${t(R(a,10))}\\) et \\(P(B)=${t(R(b,10))}.\\) Calculer \\(P(C).\\)`,ans,[R(a+b,10),R(a,10),R(b,10)],`La somme vaut 1, donc \\(P(C)=1-${t(R(a,10))}-${t(R(b,10))}=${t(ans)}.\\)`);},
    ()=>{const a=rnd(1,9),b=rnd(1,9),ans=R(a*b,100);return numeric('independentProduct',{a,b},`A et B sont indépendants, de probabilités ${w(R(a,10))} et ${w(R(b,10))}. Quelle est la probabilité de A et B ?`,ans,[R(a+b,10),R(a,10),R(b,10)],`L’indépendance permet le produit : ${w(ans)}.`);},
    ()=>{const d=table(),ans=R(d.ab,d.ab+d.nab);return numeric('otherConditional',d,`Il y a ${d.ab+d.nab} personnes dans B, dont ${d.ab} dans A. Calculer \\(P_B(A).\\)`,ans,[R(d.nab,d.ab+d.nab),R(d.ab,d.ab+d.anb),R(1)],`Le dénominateur est l’effectif de B : ${w(ans)}.`);},
    ()=>{const d=table(),n=d.ab+d.anb+d.nab+d.nanb,ans=R(n-d.nanb,n);return numeric('union',d,`Sur ${n} issues équiprobables, ${d.nanb} ne réalisent ni A ni B. Calculer \\(P(A\\cup B).\\)`,ans,[R(d.nanb,n),R(1),R(0)],`On retire les issues qui ne réalisent aucun des deux événements : ${w(ans)}.`);},
    ()=>concept('nullCondition',{},'Si P(A) = 0, que peut-on dire de la notation P_A(B) dans ce cours ?', ['Elle n’est pas définie par la formule du quotient.','Elle vaut toujours 0.','Elle vaut toujours 1.','Elle est forcément égale à P(B).'],0,'Le quotient définissant la probabilité conditionnelle exige P(A) > 0.')
  ];
  root.Chapter7={code:'7A',generators,qcmBank:bank,accepts:C7.accepts,parseNum:C7.parseNum,probabilities};
})(globalThis);
