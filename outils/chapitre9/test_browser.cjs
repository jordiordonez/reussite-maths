// Vérifications sur les vrais boutons, avec réponses calculées indépendamment en Python.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const base=process.env.SITE_TEST_URL||'http://127.0.0.1:8765/';
const relative='chapitres/09_loi_binomiale/9A_loi_binomiale.html';
const output=process.env.CH9_TEST_OUTPUT||'/tmp/chapitre9-qa';
const key='reussite_maths_v1';
const oracle=async page=>JSON.parse(execFileSync('python3',[path.join(__dirname,'test_math.py'),'oracle'],{
  input:JSON.stringify(await page.evaluate(()=>({exercises:Chapter9.activeExercises,qcm:Chapter9.activeQcm}))),encoding:'utf8'
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
    const context=await browser.newContext({viewport:{width:1440,height:1000}});context.setDefaultTimeout(20000);
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push(r.status()+' '+r.url());});
    await page.goto(base+relative);await math(page);
    assert.equal(await page.locator('.site-side-link[aria-current="page"]').count(),1);
    assert.match(await page.locator('.site-pager a').first().getAttribute('href'),/8A_/);
    const expected=await oracle(page);
    for(let i=1;i<=3;i++){
      const raw=expected.exercises[i-1],parts=raw.split('/'),numerator=BigInt(parts[0]),denominator=BigInt(parts[1]||'1'),input=page.locator(`#ex${i}-rep`),fb=page.locator(`#ex${i}-fb`);
      for(const wrong of ['','abc','1/0','-1',`${numerator+denominator}/${denominator}`,`${numerator*1000000000000n+denominator}/${denominator*1000000000000n}`]){
        await input.fill(wrong);await page.locator(`#ex${i}-check`).click();assert.match(await fb.getAttribute('class'),/bad/);
        assert(!/✓|Correct/.test(await fb.textContent()));
      }
      for(const correct of [raw,`${numerator*7n}/${denominator*7n}`,...(i===2?[(Number(numerator)/Number(denominator)).toFixed(3).replace('.',',')]:[])]){
        await input.fill(correct);await input.press('Enter');assert.match(await fb.getAttribute('class'),/good/);assert.match(await fb.textContent(),/Correct/);
      }
      await page.locator(`#ex${i}-corr`).click();await math(page);
      assert.match(await page.locator(`#ex${i}-correction`).getAttribute('class'),/show/);
      const before=await page.evaluate(i=>JSON.stringify(Chapter9.activeExercises[i-1].data),i);
      await page.locator(`#ex${i}-new`).click();await math(page);
      assert.notEqual(await page.evaluate(i=>JSON.stringify(Chapter9.activeExercises[i-1].data),i),before);
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
      assert.equal(rows.filter(r=>r.lesson==='9A'&&r.ex==='QCM · '+score&&r.res===(perfect?'ok':'ko')).length,1);
      if(perfect){await page.locator('#qcm-new').click();assert.equal(await page.locator('#qcm-score').textContent(),'');}
    }
    console.log('PASS QCM : 4/4 et 0/4, boutons verrouillés, enregistrement unique et juste.');
    // Oracle de visualisation : convolution entière, distincte de la formule du HTML.
    function distribution(n,m){
      let weights=[1n];
      for(let r=0;r<n;r++){
        const next=Array(weights.length+1).fill(0n);
        weights.forEach((w,k)=>{next[k]+=w*BigInt(10-m);next[k+1]+=w*BigInt(m);});
        weights=next;
      }
      return {weights,den:10n**BigInt(n)};
    }
    for(const n of [1,4,10,20])for(const m of [0,1,5,10]){
      await set(page,{vn:n,vp:m,va:Math.floor(n/3),vb:Math.ceil(2*n/3)});
      const {weights,den}=distribution(n,m),a=Math.floor(n/3),b=Math.ceil(2*n/3);
      for(const kind of ['point','cdf','tail','interval']){
        await set(page,{vevent:kind});
        const yes=k=>kind==='point'?k===a:kind==='cdf'?k<=a:kind==='tail'?k>=a:k>=a&&k<=b;
        const mass=weights.reduce((sum,w,k)=>sum+(yes(k)?w:0n),0n),prob=Number(mass)/Number(den);
        const text=await page.locator('#event-values').textContent();
        if(prob>0&&prob<1e-6)assert(text.includes('positive, < 0,000001'));
        else assert(text.includes(prob.toLocaleString('fr-FR',{maximumFractionDigits:6})));
        const bars=await page.locator('#fig [data-k]').evaluateAll(es=>es.map(e=>({k:+e.getAttribute('data-k'),height:+e.getAttribute('height'),fill:e.getAttribute('fill')})));
        assert.equal(bars.length,n+1);
        const probs=weights.map(w=>Number(w)/Number(den)),top=Math.max(...probs)*1.12;
        bars.forEach(bar=>{assert(Math.abs(bar.height-210*probs[bar.k]/top)<1e-8);assert.equal(bar.fill,yes(bar.k)?'#2563eb':'#cbd5e1');});
      }
      for(const percent of [0,5,50,100]){
        await set(page,{alpha:percent});
        const k=weights.findIndex((_,k)=>weights.slice(k+1).reduce((s,w)=>s+w,0n)*100n<=BigInt(percent)*den);
        assert.equal(await page.locator('#threshold-k').textContent(),String(k));
        await page.locator('#show-threshold').click();
        assert.equal(await page.locator('#va').inputValue(),'0');assert.equal(await page.locator('#vb').inputValue(),String(k));
      }
    }
    // P=0 et P=1 : les fréquences simulées doivent être exactement dégénérées.
    for(const m of [0,10]){
      await set(page,{vn:4,vp:m,vevent:'point',va:m===0?0:4});
      await page.locator('#simulate').click();await page.locator('#simulate').click();
      assert.match(await page.locator('#sim-result').textContent(),/400 valeurs/);
      assert((await page.locator('#sim-result').textContent()).includes('Moyenne observée ≈ '+(m===0?0:4)));
      await set(page,{vevent:'cdf'});assert.match(await page.locator('#sim-result').textContent(),/400 valeurs/);
      await page.locator('#reset-simulation').click();assert.match(await page.locator('#sim-result').textContent(),/Aucune/);
    }
    await set(page,{vn:20,vp:1,vevent:'point',va:20});
    assert.match(await page.locator('#event-values').textContent(),/positive, < 0,000001/);
    await set(page,{vn:10,vp:5,va:3,vb:7,vevent:'interval',alpha:5});
    await page.locator('#simulate').click();
    // Montrer et typesetter les preuves aussi, pas seulement les cartes repliées.
    for(const proof of await page.locator('.proof').all())await proof.locator('summary').click();
    await math(page);
    const meanHeight=await page.locator('mjx-container:not([display="true"]) > svg').evaluateAll(es=>es.reduce((s,e)=>s+e.getBoundingClientRect().height,0)/es.length);
    assert(meanHeight>=12&&meanHeight<=35,'formules inline à échelle lisible : '+meanHeight);
    await page.locator('#visu').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'9A-desktop.png')});
    for(const width of [390,320,768]){
      await page.setViewportSize({width,height:900});await math(page);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'débordement à '+width);
      for(const id of ['cours','methode','visu','exos','qcm']){
        await page.locator('#'+id).scrollIntoViewIfNeeded();
        if(width!==768)await page.screenshot({path:path.join(output,`9A-${width}-${id}.png`)});
      }
      if(width===320){
        await page.locator('.proof').nth(0).screenshot({path:path.join(output,'9A-320-preuve-binomiale.png')});
        await page.locator('#fig').screenshot({path:path.join(output,'9A-320-loi.png')});
      }
    }
    await page.locator('#site-menu').click();assert.equal(await page.locator('#site-menu').getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');assert.equal(await page.locator('#site-menu').getAttribute('aria-expanded'),'false');
    await page.setViewportSize({width:1440,height:1000});
    await page.locator('#site-lesson-status').selectOption('validated');await page.reload();
    assert.equal(await page.locator('#site-lesson-status').inputValue(),'validated');
    await page.goto(base+'chapitres.html#ch9');
    assert.equal(await page.locator('#ch9 [data-lesson="9A"]').count(),1);
    await page.goto(base+'progres.html');assert.equal(await page.locator('#site-journal-lesson option[value="9A"]').count(),1);
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
    await set(noStorage,{vn:1,vp:0,va:0,vevent:'point'});assert.match(await noStorage.locator('#event-values').textContent(),/= 1/);
    await degraded.close();assert.deepEqual(errors,[]);
    console.log('PASS hors connexion file:// et mode sans MathJax/stockage ; aucune erreur JS. Captures : '+output);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
