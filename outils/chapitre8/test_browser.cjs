// Vérifications sur les vrais boutons, avec réponses calculées indépendamment en Python.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const base=process.env.SITE_TEST_URL||'http://127.0.0.1:8765/';
const relative='chapitres/08_combinatoire_denombrement/8A_combinatoire_denombrement.html';
const output=process.env.CH8_TEST_OUTPUT||'/tmp/chapitre8-qa';
const key='reussite_maths_v1';
const oracle=async page=>JSON.parse(execFileSync('python3',[path.join(__dirname,'test_math.py'),'oracle'],{
  input:JSON.stringify(await page.evaluate(()=>({exercises:Chapter8.activeExercises,qcm:Chapter8.activeQcm}))),encoding:'utf8'
}));
async function math(page){
  await page.waitForFunction(()=>window.MathJax?.startup?.document&&document.querySelector('mjx-container'));
  await page.evaluate(async()=>{await MathJax.startup.promise;await MathJax.typesetPromise();});
  assert.equal(await page.locator('[data-mml-node="merror"],mjx-merror').count(),0);
}
const set=async(page,values)=>page.evaluate(values=>Object.entries(values).forEach(([id,v])=>{const e=document.getElementById(id);e.value=String(v);e.dispatchEvent(new Event(e.type==='range'?'input':'change',{bubbles:true}));}),values);
const choose=(n,k)=>{let row=[1];for(let r=1;r<=n;r++)row=Array.from({length:r+1},(_,i)=>(row[i-1]||0)+(row[i]||0));return row[k]||0;};

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000}});context.setDefaultTimeout(20000);
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push(r.status()+' '+r.url());});
    await page.goto(base+relative);await math(page);
    assert.equal(await page.locator('.site-side-link[aria-current="page"]').count(),1);
    assert.match(await page.locator('.site-pager a').first().getAttribute('href'),/7C_/);
    const expected=await oracle(page);
    for(let i=1;i<=3;i++){
      const answer=expected.exercises[i-1],input=page.locator(`#ex${i}-rep`),fb=page.locator(`#ex${i}-fb`);
      for(const wrong of ['','abc','1/0','-1',String(answer+1),`${answer}.000000000001`]){
        await input.fill(wrong);await page.locator(`#ex${i}-check`).click();assert.match(await fb.getAttribute('class'),/bad/);
        assert(!/✓|Correct/.test(await fb.textContent()));
      }
      for(const correct of [String(answer),`${answer},0`,`${answer*7}/7`]){
        await input.fill(correct);await input.press('Enter');assert.match(await fb.getAttribute('class'),/good/);assert.match(await fb.textContent(),/Correct/);
      }
      await page.locator(`#ex${i}-corr`).click();await math(page);
      assert.match(await page.locator(`#ex${i}-correction`).getAttribute('class'),/show/);
      const before=await page.evaluate(i=>JSON.stringify(Chapter8.activeExercises[i-1].data),i);
      await page.locator(`#ex${i}-new`).click();await math(page);
      assert.notEqual(await page.evaluate(i=>JSON.stringify(Chapter8.activeExercises[i-1].data),i),before);
      assert.equal(await input.inputValue(),'');assert.equal(await fb.textContent(),'');
      assert(!/show/.test(await page.locator(`#ex${i}-correction`).getAttribute('class')));
      await page.locator(`#ex${i}-corr`).click();
    }
    console.log('PASS exercices : bonnes valeurs, équivalences, valeurs fausses, Entrée, corrections, régénération.');
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
      assert.equal(rows.filter(r=>r.lesson==='8A'&&r.ex==='QCM · '+score&&r.res===(perfect?'ok':'ko')).length,1);
      if(perfect){await page.locator('#qcm-new').click();assert.equal(await page.locator('#qcm-score').textContent(),'');}
    }
    console.log('PASS QCM : 4/4 et 0/4, boutons verrouillés, enregistrement unique et juste.');
    // Comptages affichés, éléments impossibles, objet vide et pagination.
    for(const n of [0,1,4,6])for(const k of [0,2,6]){
      await set(page,{vn:n,vk:k});
      const expectedCounts={words:k===0?1:n**k,choose:choose(n,k),ordered:k>n?0:Array.from({length:k},(_,i)=>n-i).reduce((a,b)=>a*b,1)};
      for(const mode of ['words','ordered','choose']){
        await set(page,{vmode:mode});
        const total=Number((await page.locator('#count-'+mode).textContent()).replace(/\s/g,''));assert.equal(total,expectedCounts[mode]);
        assert.equal(await page.locator('#fig rect').count(),Math.min(24,total));
        assert.equal(await page.locator('#objects-next').isDisabled(),total<=24);
      }
    }
    await set(page,{vn:6,vk:3,vmode:'words'});const first=await page.locator('#fig').textContent();
    await page.locator('#objects-next').click();assert.notEqual(await page.locator('#fig').textContent(),first);
    assert.match(await page.locator('#objects-note').textContent(),/25 à 48 sur 216/);
    await page.locator('#objects-prev').click();assert.equal(await page.locator('#fig').textContent(),first);
    await page.locator('#objects-reset').click();
    await page.locator('#subset-buttons button').nth(0).click();await page.locator('#subset-buttons button').nth(2).click();
    assert.match(await page.locator('#subset-values').textContent(),/\{A, C\} · Mot : 1010 · Chemin : SESE/);
    assert.match(await page.locator('#subset-values').textContent(),/6 chemin\(s\).*16 chemins/);
    await set(page,{vn:0});assert.match(await page.locator('#subset-values').textContent(),/mot vide.*chemin vide.*1 chemin/);
    await page.locator('#objects-reset').click();
    for(let n=0;n<=8;n++)for(let k=0;k<=n;k++){
      await set(page,{pn:n,pk:k});
      const value=choose(n,k),text=await page.locator('#pascal-values').textContent();
      assert(text.includes(`Ligne ${n}, position ${k} : ${value}.`));
      assert(text.endsWith(`= ${2**n}.`));
      if(k>0&&k<n)assert(text.includes(`${choose(n-1,k-1)} + ${choose(n-1,k)} = ${value}.`));
      else assert(text.includes('Bord du triangle : valeur 1.'));
    }
    await set(page,{pn:8,pk:8});await set(page,{pn:0});assert.equal(await page.locator('#pk').inputValue(),'0');
    await set(page,{pn:5,pk:2});
    // Montrer et typesetter les preuves aussi, pas seulement les cartes repliées.
    for(const proof of await page.locator('.proof').all())await proof.locator('summary').click();
    await math(page);
    const meanHeight=await page.locator('mjx-container:not([display="true"]) > svg').evaluateAll(es=>es.reduce((s,e)=>s+e.getBoundingClientRect().height,0)/es.length);
    assert(meanHeight>=12&&meanHeight<=35,'formules inline à échelle lisible : '+meanHeight);
    await page.locator('#visu').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'8A-desktop.png')});
    for(const width of [390,320,768]){
      await page.setViewportSize({width,height:900});await math(page);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'débordement à '+width);
      for(const id of ['cours','methode','visu','exos','qcm']){
        await page.locator('#'+id).scrollIntoViewIfNeeded();
        if(width!==768)await page.screenshot({path:path.join(output,`8A-${width}-${id}.png`)});
      }
      if(width===320){
        await page.locator('.proof').nth(2).screenshot({path:path.join(output,'8A-320-preuve-pascal.png')});
        await page.locator('#pascal-fig').screenshot({path:path.join(output,'8A-320-triangle.png')});
      }
    }
    await page.locator('#site-menu').click();assert.equal(await page.locator('#site-menu').getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');assert.equal(await page.locator('#site-menu').getAttribute('aria-expanded'),'false');
    await page.setViewportSize({width:1440,height:1000});
    await page.locator('#site-lesson-status').selectOption('validated');await page.reload();
    assert.equal(await page.locator('#site-lesson-status').inputValue(),'validated');
    await page.goto(base+'chapitres.html#ch8');
    assert.equal(await page.locator('#ch8 [data-lesson="8A"]').count(),1);
    await page.goto(base+'progres.html');assert.equal(await page.locator('#site-journal-lesson option[value="8A"]').count(),1);
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
    await set(noStorage,{vn:0,vk:0});assert.equal(await noStorage.locator('#count-choose').textContent(),'1');
    await degraded.close();assert.deepEqual(errors,[]);
    console.log('PASS hors connexion file:// et mode sans MathJax/stockage ; aucune erreur JS. Captures : '+output);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
