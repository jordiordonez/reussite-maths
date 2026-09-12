(function(){
  'use strict';
  const $=id=>document.getElementById(id),M=Chapter8,letters='ABCDEF',colors=['#2563eb','#15803d','#9f3b71','#925c0b','#6941c6','#0e7490'];
  let offset=0,selected=new Set();
  function el(svg,tag,attrs,content){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(content!==undefined)e.textContent=content;svg.append(e);return e;}
  function subset(){
    const n=+$('vn').value;selected=new Set([...selected].filter(x=>x<n));$('subset-buttons').replaceChildren();
    for(let i=0;i<n;i++){const button=document.createElement('button');button.type='button';button.className='subset-toggle';button.textContent=letters[i];button.setAttribute('aria-pressed',String(selected.has(i)));button.addEventListener('click',()=>{selected.has(i)?selected.delete(i):selected.add(i);subset();});$('subset-buttons').append(button);}
    const values=[...selected].sort((a,b)=>a-b).map(i=>letters[i]);
    const bits=Array.from({length:n},(_,i)=>selected.has(i)?'1':'0').join(''),word=bits.replace(/1/g,'S').replace(/0/g,'E');
    $('subset-values').textContent=`Partie : ${values.length?'{'+values.join(', ')+'}':'∅'} · Mot : ${bits||'mot vide'} · Chemin : ${word||'chemin vide'}. Les lettres choisies désignent les positions des ${selected.size} succès. Il existe ${M.choose(n,selected.size)} chemin(s) avec ce nombre de succès, et ${2**n} chemins S/E au total.`;
  }
  function draw(){
    const n=+$('vn').value,k=+$('vk').value,mode=$('vmode').value;
    $('vn-out').textContent=n;$('vk-out').textContent=k;
    const counts={words:M.words(n,k),ordered:M.ordered(n,k),choose:M.choose(n,k)},total=counts[mode];
    Object.entries(counts).forEach(([key,v])=>$('count-'+key).textContent=v.toLocaleString('fr-FR'));
    if(offset>=total)offset=0;
    const objects=M.enumerate(n,k,mode,offset,24),svg=$('fig');svg.replaceChildren();
    svg.setAttribute('viewBox',`0 0 360 ${Math.max(80,Math.ceil(objects.length/2)*27+16)}`);
    $('objects-note').textContent=total===0?'Aucun objet possible avec ces paramètres.':k===0?'Un seul objet de taille 0 : le groupe vide ou la liste vide.':`Objets ${offset+1} à ${offset+objects.length} sur ${total}. ${mode==='choose'?'Chaque groupe apparaît une seule fois ; changer l’ordre de ses lettres ne crée pas un nouveau groupe.':'L’ordre des lettres distingue les listes.'}`;
    if(!objects.length)el(svg,'text',{x:180,y:60,'text-anchor':'middle',fill:'#64748b','font-size':14},'Aucun objet');
    objects.forEach((xs,i)=>{
      const x=7+(i%2)*177,y=8+Math.floor(i/2)*27;
      el(svg,'rect',{x,y,width:169,height:23,rx:5,fill:'#f1f5f9'});
      const text=el(svg,'text',{x:x+7,y:y+16,'font-size':12,fill:'#334155'});
      text.textContent=mode==='choose'?'{':'(';
      if(!xs.length)text.textContent=mode==='choose'?'∅':'( )';
      else{xs.forEach((v,j)=>{const span=document.createElementNS('http://www.w3.org/2000/svg','tspan');span.setAttribute('fill',colors[v]);span.textContent=(j?', ':'')+letters[v];text.append(span);});text.append(document.createTextNode(mode==='choose'?'}':')'));}
    });
    $('objects-prev').disabled=offset===0;$('objects-next').disabled=offset+24>=total;subset();
  }
  ['vn','vk','vmode'].forEach(id=>$(id).addEventListener(id==='vmode'?'change':'input',()=>{offset=0;draw();}));
  $('objects-prev').addEventListener('click',()=>{offset=Math.max(0,offset-24);draw();});
  $('objects-next').addEventListener('click',()=>{offset+=24;draw();});
  $('objects-reset').addEventListener('click',()=>{$('vn').value=4;$('vk').value=2;$('vmode').value='choose';offset=0;selected.clear();draw();});
  function pascal(){
    const n=+$('pn').value;$('pk').max=n;if(+$('pk').value>n)$('pk').value=n;const k=+$('pk').value;
    $('pn-out').textContent=n;$('pk-out').textContent=k;
    const svg=$('pascal-fig');svg.replaceChildren();const X=(r,c)=>180+(c-r/2)*38,Y=r=>20+r*34;
    if(k>0&&k<n)for(const c of [k-1,k])el(svg,'line',{x1:X(n,k),y1:Y(n),x2:X(n-1,c),y2:Y(n-1),stroke:'#22a06b','stroke-width':2});
    for(let r=0;r<=8;r++)for(let c=0;c<=r;c++){
      const active=r===n&&c===k,parent=k>0&&k<n&&r===n-1&&(c===k-1||c===k),x=X(r,c),y=Y(r);
      el(svg,'circle',{cx:x,cy:y,r:15,fill:active?'#2563eb':parent?'#dcfce7':r===n?'#e8efff':'#f3f4f6'});
      el(svg,'text',{x,y:y+4,'text-anchor':'middle','font-size':12,fill:active?'#fff':parent?'#166534':'#475569','font-weight':active||parent?700:400},M.choose(r,c));
    }
    const value=M.choose(n,k),row=Array.from({length:n+1},(_,i)=>M.choose(n,i));
    $('pascal-values').textContent=`Ligne ${n}, position ${k} : ${value}. ${k===0||k===n?'Bord du triangle : valeur 1.':`${M.choose(n-1,k-1)} + ${M.choose(n-1,k)} = ${value}.`} Somme de la ligne : ${row.join(' + ')} = ${2**n}.`;
  }
  ['pn','pk'].forEach(id=>$(id).addEventListener('input',pascal));draw();pascal();
})();
