// Vérifications sur les vrais boutons, avec réponses calculées indépendamment en Python.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const base=process.env.SITE_TEST_URL||'http://127.0.0.1:8765/';
const files={'10A':'10A_cercle_trigonometrique.html','10B':'10B_derivation_trigonometrie.html'};
const output=process.env.CH10_TEST_OUTPUT||'/tmp/chapitre10-qa';
const key='reussite_maths_v1';
const oracle=async page=>JSON.parse(execFileSync('python3',[path.join(__dirname,'test_math.py'),'oracle'],{
  input:JSON.stringify(await page.evaluate(()=>({code:Chapter10.code,exercises:Chapter10.activeExercises,qcm:Chapter10.activeQcm}))),encoding:'utf8'
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
    const relative="chapitres/10_trigonometrie/"+file;
    const context=await browser.newContext({viewport:{width:1440,height:1000}});context.setDefaultTimeout(20000);
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push(r.status()+' '+r.url());});
    await page.goto(base+relative);await math(page);
    assert.equal(await page.locator('.site-side-link[aria-current="page"]').count(),1);
    const title=code==='10A'?'Cercle trigonométrique':'Fonctions trigonométriques';
    assert((await page.title()).includes(title));
    assert((await page.locator('h1').textContent()).includes(title));
    assert((await page.locator('.site-side-link[aria-current="page"]').textContent()).includes(title));
    assert.match(await page.locator('.site-pager a').first().getAttribute('href'),code==='10A'?/9A_/:/10A_/);
    const expected=await oracle(page);
    for(let i=1;i<=3;i++){
      const raw=expected.exercises[i-1],parts=raw.split('/'),numerator=BigInt(parts[0]),denominator=BigInt(parts[1]||'1'),input=page.locator(`#ex${i}-rep`),fb=page.locator(`#ex${i}-fb`);
      for(const wrong of ['','abc','1/0',`${numerator+denominator}/${denominator}`,`${numerator*1000000000000n+denominator}/${denominator*1000000000000n}`]){
        await input.fill(wrong);await page.locator(`#ex${i}-check`).click();assert.match(await fb.getAttribute('class'),/bad/);
        assert(!/✓|Correct/.test(await fb.textContent()));
      }
      for(const correct of [raw,`${numerator*7n}/${denominator*7n}`,...(code==='10A'&&i===2?[(Number(numerator)/Number(denominator)).toFixed(3).replace('.',',')]:[])]){
        await input.fill(correct);await input.press('Enter');assert.match(await fb.getAttribute('class'),/good/);assert.match(await fb.textContent(),/Correct/);
      }
      await page.locator(`#ex${i}-corr`).click();await math(page);
      assert.match(await page.locator(`#ex${i}-correction`).getAttribute('class'),/show/);
      const before=await page.evaluate(i=>JSON.stringify(Chapter10.activeExercises[i-1].data),i);
      await page.locator(`#ex${i}-new`).click();await math(page);
      assert.notEqual(await page.evaluate(i=>JSON.stringify(Chapter10.activeExercises[i-1].data),i),before);
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

    if(code==='10A'){
      for(const u of [-48,-30,-24,-18,-12,-6,-3,0,2,3,4,6,12,24,48]){
        await set(page,{angle:u});
        const p=await page.locator('#circle-point').evaluate(e=>({x:+e.getAttribute('cx'),y:+e.getAttribute('cy')}));
        assert(Math.abs(p.x-(200+115*Math.cos(u*Math.PI/12)))<1e-8);
        assert(Math.abs(p.y-(150-115*Math.sin(u*Math.PI/12)))<1e-8);
        for(const fn of ['sin','cos']){
          const point=await page.locator('#'+fn+'-point').evaluate(e=>({x:+e.getAttribute('cx'),y:+e.getAttribute('cy')}));
          assert(Math.abs(point.x-(40+(u+48)/96*540))<1e-8);
          assert(Math.abs(point.y-(120-75*Math[fn](u*Math.PI/12)))<1e-8);
        }
        assert.equal(await page.locator('#turn-minus').isDisabled(),u-24< -48);
        assert.equal(await page.locator('#turn-plus').isDisabled(),u+24>48);
      }
      await set(page,{angle:4});await page.locator('#turn-plus').click();assert.equal(await page.locator('#angle').inputValue(),'28');
      await page.locator('#turn-minus').click();assert.equal(await page.locator('#angle').inputValue(),'4');
      await page.locator('#opposite').click();assert.equal(await page.locator('#angle').inputValue(),'-4');
      await page.locator('#angle-reset').click();assert.equal(await page.locator('#angle').inputValue(),'4');
    }else{
      for(const a of [-3,0,2])for(const b of [1,3])for(const c of [-2,0,2])for(const fn of ['sin','cos'])for(const u of [-24,-3,0,6,24]){
        await set(page,{amplitude:a,frequency:b,offset:c,'function-kind':fn,abscissa:u});
        const top=Math.max(1,Math.abs(a)+Math.abs(c),Math.abs(a*b))*1.2;
        const x=u*Math.PI/12,f=z=>a*Math[fn](b*z)+c,h=1e-5,derivative=(f(x+h)-f(x-h))/(2*h);
        const point=await page.locator('#slope-point').evaluate(e=>({x:+e.getAttribute('cx'),y:+e.getAttribute('cy')}));
        assert(Math.abs(point.x-(40+(x+2*Math.PI)/(4*Math.PI)*540))<1e-8);
        assert(Math.abs(point.y-(140-110*derivative/top))<1e-6);
        const t=await page.locator('#tangent-line').evaluate(e=>({y1:+e.getAttribute('y1'),y2:+e.getAttribute('y2')}));
        assert(Math.abs(t.y1-(140-110*(f(x)+derivative*(-2*Math.PI-x))/top))<1e-5);
        assert(Math.abs(t.y2-(140-110*(f(x)+derivative*(2*Math.PI-x))/top))<1e-5);
      }
      // Vérifier les ensembles par appartenance, sans recopier les branches du solveur.
      for(let level=-12;level<=12;level++)for(const relation of ['eq','le','ge']){
        await set(page,{level,relation});
        const segments=await page.locator('[data-solution]').evaluateAll(es=>es.map(e=>[+e.dataset.left,+e.dataset.right]));
        const a=level/10;
        const points=Array.from({length:401},(_,i)=>-Math.PI+2*Math.PI*i/400);
        if(Math.abs(a)<=1)points.push(-Math.acos(a),Math.acos(a));
        for(const x of points){
          const v=Math.cos(x),yes=relation==='eq'?Math.abs(v-a)<1e-10:relation==='le'?v<=a+1e-10:v>=a-1e-10;
          assert.equal(segments.some(([l,r])=>x>=l-1e-10&&x<=r+1e-10),yes,JSON.stringify({a,relation,x,segments}));
        }
      }
      await set(page,{level:-10,relation:'eq'});assert.match(await page.locator('#solution-values').textContent(),/−π.*π/);
      assert.equal(await page.locator('[data-solution]').count(),2);
      await set(page,{level:10,relation:'eq'});assert.match(await page.locator('#solution-values').textContent(),/\{0\}/);
      await set(page,{level:5,relation:'le',amplitude:2,frequency:1,offset:0,abscissa:3,'function-kind':'sin'});
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
      for(const id of ['cours','methode','visu','exos','qcm']){
        await page.locator('#'+id).scrollIntoViewIfNeeded();
        if(width!==768)await page.screenshot({path:path.join(output,`${code}-${width}-${id}.png`)});
      }
      if(width===320){
        await page.locator('.proof').nth(0).screenshot({path:path.join(output,code+'-320-preuve.png')});
        await page.locator(code==='10A'?'#circle':'#solution-plot').screenshot({path:path.join(output,code+'-320-figure.png')});
      }
    }
    await page.locator('#site-menu').click();assert.equal(await page.locator('#site-menu').getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');assert.equal(await page.locator('#site-menu').getAttribute('aria-expanded'),'false');
    await page.setViewportSize({width:1440,height:1000});
    await page.locator('#site-lesson-status').selectOption('validated');await page.reload();
    assert.equal(await page.locator('#site-lesson-status').inputValue(),'validated');
    await page.goto(base+'chapitres.html#ch10');
    assert.equal(await page.locator('#ch10 [data-lesson="'+code+'"]').count(),1);
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
    if(code==='10A'){await set(noStorage,{angle:0});assert.match(await noStorage.locator('#circle-values').textContent(),/cos x ≈ 1/);}else{await set(noStorage,{level:12,relation:'eq'});assert.match(await noStorage.locator('#solution-values').textContent(),/∅/);}
    await degraded.close();assert.deepEqual(errors,[]);
    console.log('PASS hors connexion file:// et mode sans MathJax/stockage ; aucune erreur JS. Captures : '+output);
    await context.close();
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
