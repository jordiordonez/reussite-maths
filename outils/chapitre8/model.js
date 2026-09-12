/* Modèle pur : comptages exacts, générateurs et QCM de la fiche 8A. */
(function(root){
  'use strict';
  const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  function shuffle(xs){const a=xs.slice();for(let i=a.length-1;i>0;i--){const j=rnd(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function factorial(n){if(!Number.isInteger(n)||n<0||n>18)throw Error('Factorielle hors domaine');let p=1;for(let i=2;i<=n;i++)p*=i;return p;}
  function ordered(n,k){if(k>n)return 0;let p=1;for(let i=0;i<k;i++)p*=n-i;return p;}
  function choose(n,k){if(k<0||k>n)return 0;return ordered(n,k)/factorial(k);}
  const words=(n,k)=>k===0?1:n**k;
  // Comparaison exacte, même si l'élève saisit 120,0 ou 240/2.
  function rational(raw){
    const s=String(raw).trim().replace(/−/g,'-').replace(/,/g,'.');
    if(s.length>100||!/^\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)\s*(?:\/\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)\s*)?$/.test(s))return null;
    function decimal(part){part=part.trim();const sign=part.startsWith('-')?-1n:1n,bits=part.replace(/^[+-]/,'').split('.');return [sign*BigInt((bits[0]||'0')+(bits[1]||'')),10n**BigInt((bits[1]||'').length)];}
    const p=s.split('/'),a=decimal(p[0]),b=p.length===2?decimal(p[1]):[1n,1n];
    return b[0]===0n?null:[a[0]*b[1],a[1]*b[0]];
  }
  function parseNum(raw){const r=rational(raw);return r?Number(r[0])/Number(r[1]):NaN;}
  const accepts=(e,raw)=>{const r=rational(raw);return !!r&&r[0]===BigInt(e.answer)*r[1];};
  function numeric(kind,data,q,answer,wrong,expl){
    const options=[answer];for(const x of wrong)if(Number.isSafeInteger(x)&&x>=0&&!options.includes(x))options.push(x);
    for(let i=1;options.length<4;i++)if(!options.includes(answer+i))options.push(answer+i);
    const mixed=shuffle(options.slice(0,4));return {kind,data,q,options:mixed.map(String),correct:mixed.indexOf(answer),expl};
  }
  function concept(kind,q,options,correct,expl){const order=shuffle([0,1,2,3]);return {kind,data:{},q,options:order.map(i=>options[i]),correct:order.indexOf(correct),expl};}
  const generators=[
    ()=>{const d={letters:rnd(2,6),digits:rnd(2,5),k:rnd(2,4)},letterWays=words(d.letters,d.k),answer=letterWays*d.digits;
      return {data:d,answer,enonce:`<p>Un identifiant contient <b>${d.k} lettres suivies d’un chiffre</b>. Chaque lettre est choisie parmi ${d.letters} lettres distinctes et peut être répétée. Le dernier caractère est choisi parmi ${d.digits} chiffres autorisés, dont 0.</p><p>Combien d’identifiants différents peut-on former ? L’ordre compte ; il ne s’agit pas d’un nombre entier à écrire.</p>`,
        correction:`<ol><li>Il y a ${d.letters} choix à chacune des ${d.k} positions de lettre : les répétitions sont autorisées.</li><li>Le nombre de suites de lettres est \\(${d.letters}^{${d.k}}=${letterWays}.\\)</li><li>On associe à chaque suite l’un des ${d.digits} chiffres. Le principe multiplicatif donne \\(${letterWays}\\times${d.digits}=${answer}.\\)</li></ol><p>On ne divise pas par une factorielle : échanger deux lettres peut changer l’identifiant.</p>`};},
    ()=>{const n=rnd(5,9),k=rnd(2,4),d={n,k},factors=Array.from({length:k},(_,i)=>n-i),answer=ordered(n,k);
      return {data:d,answer,enonce:`<p>${n} personnes sont candidates pour ${k} postes <b>distincts et nommés</b> dans une association. Chaque poste est attribué à une personne différente ; tout candidat peut occuper n’importe quel poste.</p><p>Combien d’attributions complètes sont possibles ?</p>`,
        correction:`<ol><li>Les postes étant distincts, on compte des listes ordonnées de ${k} personnes, sans répétition.</li><li>Dans un ordre fixé des postes, les nombres de choix sont ${factors.join(', ')}.</li><li>Le principe multiplicatif donne \\[${factors.join('\\times')}=${answer}.\\]</li></ol><p>Ne pas diviser par \\(${k}!,\\) car échanger deux personnes entre deux postes donne une autre attribution.</p>`};},
    ()=>{const a=rnd(3,6),b=rnd(3,6),k=rnd(2,4),d={a,b,k},all=choose(a+b,k),none=choose(b,k),answer=all-none;
      return {data:d,answer,enonce:`<p>Un groupe comprend ${a} élèves de l’atelier A et ${b} autres élèves. Tous les élèves sont distincts. On forme une équipe de ${k} personnes, <b>sans rôle ni ordre</b>, qui doit contenir <b>au moins un élève de A</b>.</p><p>Combien d’équipes conviennent ?</p>`,
        correction:`<ol><li>Sans la contrainte, on choisit ${k} élèves parmi ${a+b} : \\(\\binom{${a+b}}{${k}}=${all}.\\)</li><li>Une équipe interdite ne contient personne de A. ${b>=k?`On choisit ses ${k} élèves parmi les ${b} autres : \\(\\binom{${b}}{${k}}=${none}.\\)`:`Il n’y a que ${b} élèves hors de A pour ${k} places : aucune équipe interdite, soit 0.`}</li><li>Ces équipes interdites font partie du total. On les retire : \\(${all}-${none}=${answer}.\\)</li></ol><p>« Au moins un » inclut deux, trois ou davantage d’élèves de A, dans la limite de ${k}. Choisir d’abord un élève de A puis compléter compterait certaines équipes plusieurs fois.</p>`};}
  ];
  const qcmBank=[
    ()=>{const a=rnd(2,9),b=rnd(2,9);return numeric('add',{a,b},`Deux ensembles disjoints contiennent respectivement ${a} et ${b} éléments. Quel est le cardinal de leur réunion ?`,a+b,[a*b,Math.max(a,b),Math.abs(a-b)],`Sans élément commun, on additionne les deux cardinaux : ${a+b}.`);},
    ()=>{const a=rnd(2,6),b=rnd(2,6);return numeric('product',{a,b},`A contient ${a} éléments et B en contient ${b}. Combien de couples contient A × B ?`,a*b,[a+b,a*a,b*b],`À chaque élément de A correspondent ${b} choix dans B, soit ${a*b} couples.`);},
    ()=>{const n=rnd(2,6),k=rnd(2,4),a=words(n,k);return numeric('words',{n,k},`Combien de mots de longueur ${k} peut-on écrire sur un alphabet de ${n} lettres, avec répétitions autorisées ?`,a,[n*k,ordered(n,k),choose(n,k)],`Chaque position offre ${n} choix : \\(${n}^{${k}}=${a}.\\)`);},
    ()=>{const n=rnd(4,8),k=rnd(2,3),a=ordered(n,k);return numeric('ordered',{n,k},`Combien de listes ordonnées de ${k} éléments distincts peut-on former à partir de ${n} éléments ?`,a,[choose(n,k),words(n,k),factorial(k)],`Les choix diminuent d’une unité à chaque position : le produit vaut ${a}.`);},
    ()=>{const n=rnd(3,7),a=factorial(n);return numeric('permutations',{n},`De combien de façons peut-on aligner ${n} livres tous distincts ?`,a,[n*n,2**n,n],`On permute les ${n} objets : \\(${n}!=${a}.\\)`);},
    ()=>{const n=rnd(4,9),k=rnd(2,n-1),a=choose(n,k);return numeric('choose',{n,k},`On choisit ${k} objets parmi ${n} objets distincts, sans ordre et sans répétition. Combien de choix ?`,a,[ordered(n,k),words(n,k),n*k],`Chaque groupe a ${k}! ordres possibles. Le nombre de groupes est \\(\\binom{${n}}{${k}}=${a}.\\)`);},
    ()=>{const n=rnd(0,8),a=2**n;return numeric('subsets',{n},`Combien de parties possède un ensemble à ${n} éléments, en comptant la partie vide et l’ensemble lui-même ?`,a,[n*n,n+1,Math.max(0,a-1)],`On choisit pour chaque élément « dedans » ou « dehors » : \\(2^{${n}}=${a}.\\) Pour l’ensemble vide, sa seule partie est lui-même.`);},
    ()=>{const n=rnd(2,9);return numeric('boundary',{n},`Que vaut \\(\\binom{${n}}{0}\\) ?`,1,[0,n,factorial(n)],'Il existe exactement une partie à zéro élément : la partie vide. La valeur est 1.');},
    ()=>{const n=rnd(5,9),k=rnd(1,3),a=choose(n,k);return numeric('symmetry',{n,k},`Sachant \\(\\binom{${n}}{${k}}=${a},\\) combien vaut \\(\\binom{${n}}{${n-k}}\\) ?`,a,[n-k,k,a+1],`Choisir les éléments retenus revient à choisir leur complément : la valeur reste ${a}.`);},
    ()=>{const n=rnd(3,8),k=rnd(1,n-1),a=choose(n+1,k+1);return numeric('pascal',{n,k},`Calculer \\(\\binom{${n}}{${k}}+\\binom{${n}}{${k+1}}.\\)`,a,[choose(n,k),choose(n,k+1),choose(n+1,k)],`La relation de Pascal donne \\(\\binom{${n+1}}{${k+1}}=${a}.\\)`);},
    ()=>{const n=rnd(1,8),a=2**n;return numeric('sum',{n},`Calculer \\(\\sum_{k=0}^{${n}}\\binom{${n}}k.\\)`,a,[n*n,Math.max(0,a-1),n+1],`On compte toutes les parties en les regroupant selon leur taille : \\(2^{${n}}=${a}.\\)`);},
    ()=>concept('order','Quelle situation se compte directement avec un coefficient binomial ?', ['Choisir trois personnes sans rôle parmi huit personnes distinctes.','Attribuer trois postes distincts à trois personnes parmi huit.','Former un code de trois caractères, avec répétitions.','Classer les huit personnes de la première à la dernière.'],0,'Une combinaison est une partie : ni ordre, ni répétition. Les autres situations comptent des listes.'),
    ()=>concept('overlap','Peut-on toujours additionner les cardinaux de deux ensembles pour compter leur réunion ?', ['Non : les éléments communs seraient comptés deux fois.','Oui, même si les ensembles se recouvrent.','Non : il faut toujours multiplier les cardinaux.','Oui, dès que les deux ensembles ont le même cardinal.'],0,'Le principe additif direct exige des ensembles disjoints ; sinon il faut retrancher le cardinal de leur intersection.'),
    ()=>numeric('zeroFactorial',{},'Quelle valeur donne-t-on à 0! ?',1,[0,2,10],'Par convention 0! = 1, en accord avec l’unique permutation de l’ensemble vide.'),
    ()=>{const n=rnd(3,8),k=rnd(1,n-1),a=choose(n,k);return numeric('successPaths',{n,k},`Parmi les suites de ${n} symboles S/E, combien contiennent exactement ${k} succès S ? On compte des chemins, pas leur probabilité.`,a,[2**n,ordered(n,k),n*k],`Choisir les ${k} positions de S fixe entièrement le chemin, les autres positions portant E : \\(\\binom{${n}}{${k}}=${a}.\\)`);}
  ];
  // Énumération bornée en taille d'affichage ; aucune liste gigantesque en mémoire.
  function enumerate(n,k,mode,offset=0,limit=24){
    const out=[];let seen=0;
    function visit(prefix){
      if(out.length>=limit)return;
      if(prefix.length===k){if(seen++>=offset)out.push(prefix.slice());return;}
      const first=mode==='choose'&&prefix.length?prefix[prefix.length-1]+1:0;
      for(let v=first;v<n;v++)if(mode==='words'||!prefix.includes(v)){visit([...prefix,v]);if(out.length>=limit)break;}
    }
    visit([]);return out;
  }
  root.Chapter8={code:'8A',factorial,ordered,choose,words,parseNum,accepts,generators,qcmBank,enumerate};
})(globalThis);
