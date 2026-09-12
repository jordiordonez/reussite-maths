// Vérifications sur les vrais boutons, avec réponses calculées indépendamment en Python.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const base=process.env.SITE_TEST_URL||'http://127.0.0.1:8765/';
const files={'12A':'12A_integrales_aires.html','12B':'12B_integration_methodes.html'};
const output=process.env.CH12_TEST_OUTPUT||'/tmp/chapitre12-qa';
const key='reussite_maths_v1';
const oracle=async page=>JSON.parse(execFileSync('python3',[path.join(__dirname,'test_math.py'),'oracle'],{
  input:JSON.stringify(await page.evaluate(()=>({code:Chapter12.code,exercises:Chapter12.activeExercises,qcm:Chapter12.activeQcm}))),encoding:'utf8'
}));
async function math(page){
  await page.waitForFunction(()=>window.MathJax?.startup?.document&&document.querySelector('mjx-container'));
  await page.evaluate(async()=>{await MathJax.startup.promise;await MathJax.typesetPromise();});
  assert.equal(await page.locator('[data-mml-node="merror"],mjx-merror').count(),0);
  const rawTex=await page.evaluate(()=>{
    const walker=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT),found=[];
    while(walker.nextNode()){
      const t=walker.currentNode;
      if(!t.parentElement.closest('mjx-container,script,style,pre,code')&&t.textContent.includes('\\'))found.push(t.textContent);
    }
    return found;
  });
  assert.deepEqual(rawTex,[],'aucun antislash LaTeX laissé dans le texte rendu');
}
const set=async(page,values)=>page.evaluate(values=>Object.entries(values).forEach(([id,v])=>{const e=document.getElementById(id);e.value=String(v);e.dispatchEvent(new Event(e.type==='range'?'input':'change',{bubbles:true}));}),values);
const choose=(n,k)=>{let row=[1];for(let r=1;r<=n;r++)row=Array.from({length:r+1},(_,i)=>(row[i-1]||0)+(row[i]||0));return row[k]||0;};

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
  try{
    for(const [code,file] of Object.entries(files)){
    const relative="chapitres/12_calcul_integral/"+file;
    const context=await browser.newContext({viewport:{width:1440,height:1000}});context.setDefaultTimeout(20000);
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push(r.status()+' '+r.url());});
    await page.goto(base+relative);await math(page);
    assert.equal(await page.locator('.site-side-link[aria-current="page"]').count(),1);
    const title=code==='12A'?'Intégrales, aires et valeur moyenne':'Intégration par parties et approximations';
    assert((await page.title()).includes(title));
    assert((await page.locator('h1').textContent()).includes(title));
    assert((await page.locator('.site-side-link[aria-current="page"]').textContent()).includes(title));
    assert.match(await page.locator('.site-pager a').first().getAttribute('href'),code==='12A'?/10B_|11[AB]_/:/12A_/);
    const expected=await oracle(page);
    for(let i=1;i<=3;i++){
      const raw=expected.exercises[i-1],parts=raw.split('/'),numerator=BigInt(parts[0]),denominator=BigInt(parts[1]||'1'),input=page.locator(`#ex${i}-rep`),fb=page.locator(`#ex${i}-fb`);
      for(const wrong of ['','abc','1/0',`${numerator+denominator}/${denominator}`,`${numerator*1000000000000n+denominator}/${denominator*1000000000000n}`]){
        await input.fill(wrong);await page.locator(`#ex${i}-check`).click();assert.match(await fb.getAttribute('class'),/bad/);
        assert(!/✓|Correct/.test(await fb.textContent()));
      }
      for(const correct of [raw,`${numerator*7n}/${denominator*7n}`,...(code==='12B'&&i===1?[(Number(numerator)/Number(denominator)).toFixed(3).replace('.',',')]:[])]){
        await input.fill(correct);await input.press('Enter');assert.match(await fb.getAttribute('class'),/good/);assert.match(await fb.textContent(),/Correct/);
      }
      await page.locator(`#ex${i}-corr`).click();await math(page);
      assert.match(await page.locator(`#ex${i}-correction`).getAttribute('class'),/show/);
      const before=await page.evaluate(i=>JSON.stringify(Chapter12.activeExercises[i-1].data),i);
      await page.locator(`#ex${i}-new`).click();await math(page);
      assert.notEqual(await page.evaluate(i=>JSON.stringify(Chapter12.activeExercises[i-1].data),i),before);
      assert.equal(await input.inputValue(),'');assert.equal(await fb.textContent(),'');
      assert(!/show/.test(await page.locator(`#ex${i}-correction`).getAttribute('class')));
      await page.locator(`#ex${i}-corr`).click();
    }
    console.log(code+' PASS exercices : bonnes valeurs, équivalences, valeurs fausses, Entrée, corrections, régénération.');
    for(const perfect of [true,false]){
      const answers=await oracle(page);
      for(let i=0;i<4;i++){
        const j=perfect?answers.qcm[i]:(answers.qcm[i]+1)%4,choices=page.locator('.qcm-q').nth(i).locator('.choice');
        await choices.nth(j).click();
        assert.match(await page.locator(`#qcm-expl-${i}`).textContent(),perfect?/Bonne réponse/:/Faux/);
        assert.equal(await choices.locator(':scope:disabled').count(),4);
      }
      const score=perfect?'4 / 4':'0 / 4';assert((await page.locator('#qcm-score').textContent()).includes(score));
      await page.locator('.choice').first().evaluate(b=>b.click());await page.waitForTimeout(80);
      const rows=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).journal,key);
      assert.equal(rows.filter(r=>r.lesson===code&&r.ex==='QCM · '+score&&r.res===(perfect?'ok':'ko')).length,1);
      if(perfect){await page.locator('#qcm-new').click();assert.equal(await page.locator('#qcm-score').textContent(),'');}
    }
    console.log(code+' PASS QCM : 4/4 et 0/4, boutons verrouillés, enregistrement unique et juste.');


    const integrate=(fn,a,b,n=4000)=>{const h=(b-a)/n;let s=0;for(let i=0;i<n;i++)s+=h*fn(a+(i+.5)*h);return s;};
    function coordinates(min,max,low,high){const r=high-low||2,lo=low-r*.15,hi=high+r*.15;return {X:x=>50+(x-min)/(max-min)*520,Y:y=>285-(y-lo)/(hi-lo)*250,sx:520/(max-min),sy:250/(hi-lo)};}
    const number=x=>(Math.abs(x)<5e-10?0:x).toLocaleString('fr-FR',{maximumFractionDigits:5});
    if(code==='12A'){
      for(const p of [-2,0,1])for(const c of [-3,0,2])for(const [a,b] of [[-3,3],[-2,2],[2,-2],[0,0],[1,3],[-3,-1]]){
        await set(page,{coefficient:p,constant:c,'bound-a':a,'bound-b':b});
        const f=x=>p*x*x+c,exact=p*(b**3-a**3)/3+c*(b-a),mean=a===b?null:exact/(b-a);
        const status=await page.locator('#area-values').textContent();
        assert(status.includes('Intégrale de a à b ≈ '+number(exact)));
        
        // Les polygones affichés doivent avoir le signe de la fonction entre leurs bornes.
        const regions=await page.locator('[data-region]').evaluateAll(es=>es.map(e=>({l:+e.dataset.left,r:+e.dataset.right,color:e.getAttribute('fill')})));
        for(const region of regions)assert.equal(region.color,f((region.l+region.r)/2)>=0?'#2563eb':'#f97362');
        const {X,Y}=coordinates(-3,3,Math.min(0,c,f(3)),Math.max(0,c,f(3)));
        for(const label of await page.locator('#area-plot [data-axis-value]').all())assert(Math.abs(+(await label.getAttribute('y'))-5-Y(+(await label.getAttribute('data-axis-value'))))<1e-8);
        const points=await page.locator('#area-plot polyline').evaluate(e=>e.getAttribute('points').split(' ').map(p=>p.split(',').map(Number)));
        for(const i of [0,60,120,180,240]){const x=-3+6*i/240;assert(Math.abs(points[i][0]-X(x))<1e-8);assert(Math.abs(points[i][1]-Y(f(x)))<1e-8);}
        if(mean===null){assert.equal(await page.locator('#mean-line').count(),0);assert(status.includes('non définie'));}
        else{
          assert(Math.abs(+(await page.locator('#mean-line').getAttribute('y1'))-Y(mean))<1e-8);
          assert(status.includes('Moyenne sur l’intervalle entre les bornes ≈ '+number(mean)));
        }
      }
      await set(page,{coefficient:1,constant:-1,'bound-a':-2,'bound-b':2});
    }else{
      for(const a of [-3,0,2])for(const c of [-2,0,3])for(const b of [1,4])for(const n of [1,7,60])for(const method of ['left','right','mid','trap']){
        await set(page,{quad:a,shift:c,end:b,'rect-count':n,'rect-method':method});
        const f=x=>a*x*x+c,h=b/n;
        let expected=0;for(let i=0;i<n;i++)expected+=h*(method==='left'?f(i*h):method==='right'?f((i+1)*h):method==='mid'?f((i+.5)*h):(f(i*h)+f((i+1)*h))/2);
        const status=await page.locator('#rect-values').textContent();
        assert(status.includes('Approximation ≈ '+number(expected)));
        const {sx,sy,X,Y}=coordinates(0,b,Math.min(0,f(0),f(b)),Math.max(0,f(0),f(b)));
        for(const label of await page.locator('#rect-plot [data-axis-value]').all())assert(Math.abs(+(await label.getAttribute('y'))-5-Y(+(await label.getAttribute('data-axis-value'))))<1e-8);
        const pieces=await page.locator('#rect-plot [data-piece]').evaluateAll(es=>es.map(e=>({points:e.getAttribute('points').split(' ').map(p=>p.split(',').map(Number)),color:e.getAttribute('fill')})));
        let area=0;
        for(const piece of pieces){
          const pts=piece.points;let twice=0;for(let i=0;i<pts.length;i++){const q=pts[(i+1)%pts.length];twice+=pts[i][0]*q[1]-q[0]*pts[i][1];}
          area+=(piece.color==='#2563eb'?1:-1)*Math.abs(twice)/2/(sx*sy);
          const y=pts.reduce((s,p)=>s+p[1],0)/pts.length;
          if(Math.abs(y-Y(0))>1e-8)assert.equal(piece.color,y<Y(0)?'#2563eb':'#f97362');
        }
        assert(Math.abs(area-expected)<1e-8,JSON.stringify({a,c,b,n,method,area,expected}));
      }
      for(const n of [0,1,5,12]){
        await set(page,{rank:n});
        assert((await page.locator('#sequence-values').textContent()).includes('1/'+((n+1)*(n+2))));
        const lines=await page.locator('#sequence-plot polyline').evaluateAll(es=>es.map(e=>e.getAttribute('points').split(' ').map(p=>p.split(',').map(Number))));
        for(let i=0;i<=240;i++){const x=i/240;assert(Math.abs(lines[0][i][1]-(245-210*x**n*(1-x)))<1e-8);assert(lines[1][i][1]>=lines[0][i][1]-1e-8);}
      }
      await set(page,{quad:1,shift:0,end:1,'rect-count':4,'rect-method':'left',rank:1});
    }
    // Montrer et typesetter les preuves aussi, pas seulement les cartes repliées.
    for(const proof of await page.locator('.proof').all())await proof.locator('summary').click();
    await math(page);
    const meanHeight=await page.locator('mjx-container:not([display="true"]) > svg').evaluateAll(es=>es.reduce((s,e)=>s+e.getBoundingClientRect().height,0)/es.length);
    assert(meanHeight>=12&&meanHeight<=35,'formules inline à échelle lisible : '+meanHeight);
    await page.locator('#visu').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,code+'-desktop.png')});
    for(const width of [390,320,768]){
      await page.setViewportSize({width,height:900});await math(page);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'débordement à '+width);
      if(width===320){
        const wide=await page.locator('mjx-container[display="true"]').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>({tex:e.querySelector('mjx-assistive-mml')?.textContent,width:e.scrollWidth,available:e.clientWidth})));
        assert.deepEqual(wide,[],code+' : formules de cours lisibles sans défilement horizontal à 320 px');
      }
      for(const id of ['cours','methode','visu','exos','qcm']){
        await page.locator('#'+id).scrollIntoViewIfNeeded();
        if(width!==768)await page.screenshot({path:path.join(output,`${code}-${width}-${id}.png`)});
      }
      if(width===320){
        await page.locator('.proof').nth(0).screenshot({path:path.join(output,code+'-320-preuve.png')});
        await page.locator(code==='12A'?'#area-plot':'#rect-plot').screenshot({path:path.join(output,code+'-320-figure.png')});
      }
    }
    await page.locator('#site-menu').click();assert.equal(await page.locator('#site-menu').getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');assert.equal(await page.locator('#site-menu').getAttribute('aria-expanded'),'false');
    await page.setViewportSize({width:1440,height:1000});
    await page.locator('#site-lesson-status').selectOption('validated');await page.reload();
    assert.equal(await page.locator('#site-lesson-status').inputValue(),'validated');
    await page.goto(base+'chapitres.html#ch12');
    assert.equal(await page.locator('#ch12 [data-lesson="'+code+'"]').count(),1);
    await page.goto(base+'progres.html');assert.equal(await page.locator('#site-journal-lesson option[value="'+code+'"]').count(),1);
    console.log('PASS visualisations, preuves, mobile 390/320/768, navigation et persistance.');
    // En file://, toutes les ressources nécessaires sont locales.
    const offline=await browser.newContext({offline:true}),local=await offline.newPage();
    await local.goto(pathToFileURL(path.resolve(__dirname,'../..',relative)).href);await math(local);
    const answer=(await oracle(local)).exercises[0];await local.locator('#ex1-rep').fill(String(answer));await local.locator('#ex1-check').click();
    assert.match(await local.locator('#ex1-fb').getAttribute('class'),/good/);await offline.close();
    const degraded=await browser.newContext();degraded.setDefaultTimeout(15000);
    await degraded.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('stockage indisponible');}}));
    await degraded.route('**/vendor/mathjax/**',r=>r.abort());
    const noStorage=await degraded.newPage();noStorage.on('pageerror',e=>errors.push(e.message));
    await noStorage.goto(base+relative);
    const answers=await oracle(noStorage);
    await noStorage.locator('#ex1-rep').fill(String(answers.exercises[0]));await noStorage.locator('#ex1-check').click();
    assert.match(await noStorage.locator('#ex1-fb').getAttribute('class'),/good/);
    assert.match(await noStorage.locator('[data-storage-note]').first().textContent(),/indisponible/);
    if(code==='12A'){await set(noStorage,{'bound-a':0,'bound-b':0});assert.match(await noStorage.locator('#area-values').textContent(),/non définie/);}else{await set(noStorage,{quad:0,shift:0});assert.match(await noStorage.locator('#rect-values').textContent(),/Approximation ≈ 0/);}
    await degraded.close();assert.deepEqual(errors,[]);
    console.log('PASS hors connexion file:// et mode sans MathJax/stockage ; aucune erreur JS. Captures : '+output);
    await context.close();
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
