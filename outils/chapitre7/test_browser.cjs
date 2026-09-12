// Tests sur les vrais HTML ; les réponses à saisir sont calculées par Python.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const base = process.env.SITE_TEST_URL || 'http://127.0.0.1:8765/';
const output = process.env.CH7_TEST_OUTPUT || '/tmp/chapitre7-qa';
const key = 'reussite_maths_v1';
const paths = fs.readdirSync(path.join(root, 'chapitres/07_probabilites')).filter(f=>f.endsWith('.html'));
const oracle = async page => JSON.parse(execFileSync('python3', [path.join(__dirname,'test_math.py'),'oracle'], {
  input: JSON.stringify(await page.evaluate(()=>({code:Chapter7.code,exercises:Chapter7.activeExercises,qcm:Chapter7.activeQcm}))), encoding:'utf8'
}));
const waitMath = async page => {
  await page.waitForFunction(()=>window.MathJax?.startup?.document && document.querySelector('mjx-container'));
  await page.evaluate(async()=>{await MathJax.startup.promise;await MathJax.typesetPromise();});
  assert.equal(await page.locator('mjx-merror, [data-mml-node="merror"]').count(),0,'MathJax sans erreur');
};
const number = s => Number(s.replace(/\s/g,'').replace(',','.'));
const setControls = async(page, values)=>page.evaluate(values=>Object.entries(values).forEach(([id,value])=>{
  const el=document.getElementById(id);el.value=String(value);el.dispatchEvent(new Event(el.type==='range'?'input':'change',{bubbles:true}));
}),values);
const close = (actual,expected,label)=>assert(Math.abs(actual-expected)<0.000006,`${label}: ${actual} != ${expected}`);

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
  try {
    const context=await browser.newContext({viewport:{width:1440,height:1000}});
    context.setDefaultTimeout(20000);
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push(r.status()+' '+r.url());});
    for(const file of paths){
      const code=file.slice(0,2),url=base+'chapitres/07_probabilites/'+file;
      console.log('Vérification '+code);
      await page.goto(url);await waitMath(page);
      assert.equal(await page.locator('.site-side-link[aria-current="page"]').count(),1);
      const expected=await oracle(page);
      for(let i=1;i<=3;i++){
        const input=page.locator(`#ex${i}-rep`),feedback=page.locator(`#ex${i}-fb`);
        for(const invalid of ['', '1/0','abc','0x10']){
          await input.fill(invalid);await page.locator(`#ex${i}-check`).click();
          assert.match(await feedback.getAttribute('class'),/bad/);
          assert(!/^✓|Correct/.test(await feedback.textContent()));
        }
        const raw=expected.exercises[i-1],parts=raw.split('/'),n=BigInt(parts[0]),d=BigInt(parts[1]||'1');
        const wrong=`${n*1000000000000n+d}/${d*1000000000000n}`;
        await input.fill(wrong);await input.press('Enter');
        assert.match(await feedback.getAttribute('class'),/bad/,code+' refuse une erreur de 10^-12');
        await input.fill(raw);await input.press('Enter');
        assert.match(await feedback.getAttribute('class'),/good/);
        assert.match(await feedback.textContent(),/Correct/);
        await input.fill(`${n*7n}/${d*7n}`);await page.locator(`#ex${i}-check`).click();
        assert.match(await feedback.getAttribute('class'),/good/,code+' fraction équivalente');
        await page.locator(`#ex${i}-corr`).click();await waitMath(page);
        assert.match(await page.locator(`#ex${i}-correction`).getAttribute('class'),/show/);
        const old=await page.evaluate(i=>JSON.stringify(Chapter7.activeExercises[i-1].data),i);
        await page.locator(`#ex${i}-new`).click();await waitMath(page);
        assert.notEqual(await page.evaluate(i=>JSON.stringify(Chapter7.activeExercises[i-1].data),i),old);
        assert.equal(await input.inputValue(),'');assert.equal(await feedback.textContent(),'');
        assert(!/show/.test(await page.locator(`#ex${i}-correction`).getAttribute('class')));
        await page.locator(`#ex${i}-corr`).click();
      }
      for(const perfect of [true,false]){
        const q=await oracle(page);
        for(let i=0;i<4;i++){
          const choices=page.locator('.qcm-q').nth(i).locator('.choice'),j=perfect?q.qcm[i]:(q.qcm[i]+1)%4;
          await choices.nth(j).click();
          assert.match(await page.locator(`#qcm-expl-${i}`).textContent(),perfect?/Bonne réponse/:/Faux/);
          assert.equal(await choices.locator(':scope:disabled').count(),4);
          assert.match(await choices.nth(q.qcm[i]).getAttribute('class'),/correct/);
        }
        assert.match(await page.locator('#qcm-score').textContent(),perfect?/4 \/ 4/:/0 \/ 4/);
        const before=await page.locator('#qcm-score').textContent();
        await page.locator('.choice').first().evaluate(el=>el.click());
        assert.equal(await page.locator('#qcm-score').textContent(),before,'score non recompté');
        await page.waitForTimeout(80);
        const rows=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).journal,key);
        assert(rows.some(r=>r.lesson===code&&r.res==='ok'),'réussite enregistrée');
        assert(rows.some(r=>r.lesson===code&&r.res==='ko'),'erreur enregistrée');
        if(perfect){await page.locator('#qcm-new').click();assert.equal(await page.locator('#qcm-score').textContent(),'');}
      }
      await waitMath(page);
      // Calculs de visualisation aux frontières, indépendants du modèle JS.
      if(code==='7A'){
        for(const a of [0,4,10])for(const b of [0,7,10])for(const c of [0,2,10]){
          await setControls(page,{va:a,vb:b,vc:c});
          const text=await page.locator('#visu-values').textContent(),values=await page.locator('#visu-values b').allTextContents();
          const joint=a*b/100,total=(a*b+(10-a)*c)/100;
          close(number(values[0]),joint,'intersection');close(number(values[1]),total,'totale');close(number(values[3]),1,'somme');
          if(total)close(number(values[2]),joint/total,'inverse');else assert.match(text,/non définie/);
          assert.equal(text.includes('ne sont pas indépendants'),Math.abs(joint-a/10*total)>1e-10);
          if(a===0||a===10)assert.match(await page.locator('#visu-edge').textContent(),/paramètre formel/);
        }
        await page.locator('#reset-viz').click();await page.locator('#independent').click();
        assert.match(await page.locator('#visu-values').textContent(),/sont indépendants/);
        await page.locator('#reset-viz').click();
      }else if(code==='7B'){
        for(const u of [0,3,10])for(const v of [0,4,10]){
          await setControls(page,{vp0:u,vsplit:v});await waitMath(page);
          const probs=[u/10,(10-u)*v/100,(10-u)*(10-v)/100];
          const bars=await page.locator('#fig rect').evaluateAll(es=>es.map(e=>+e.getAttribute('height')/140));
          bars.forEach((p,i)=>close(p,probs[i],'poids'));
          const mean=-2*probs[0]+4*probs[2];
          const dot=await page.locator('#fig circle').getAttribute('cx');close(+dot,30+300*(mean+2)/6,'espérance');
          assert(!/NaN|Infinity/.test(await page.locator('#visu-values').textContent()));
          await page.locator('#simulate').click();assert.match(await page.locator('#sim-result').textContent(),/200 tirages/);
          await page.locator('#simulate').click();assert.match(await page.locator('#sim-result').textContent(),/400 tirages/);
          await page.locator('#reset-simulation').click();assert.match(await page.locator('#sim-result').textContent(),/Aucune/);
        }
        await setControls(page,{vp0:3,vsplit:4});await page.locator('#simulate').click();
      }else{
        for(const n of [2,3])for(const p of [0,6,10])for(const kind of ['one','two','path']){
          await setControls(page,{vn:n,vp:p,vevent:kind});
          const word=await page.locator('#vpath').inputValue(),values=await page.locator('#visu-values b').allTextContents();
          let sum=0;
          for(let bits=0;bits<2**n;bits++){
            const w=bits.toString(2).padStart(n,'0'),successes=[...w].filter(c=>c==='1').length;
            if(kind==='one'?successes>=1:kind==='two'?successes===2:w.replace(/0/g,'E').replace(/1/g,'S')===word){
              sum+=[...w].reduce((v,c)=>v*(c==='1'?p/10:1-p/10),1);
            }
          }
          close(number(values[0]),sum,'événement');close(number(values[1]),1,'somme chemins');
        }
        await setControls(page,{vn:3,vp:6,vevent:'two'});
      }
      await page.locator('#visu').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(output,code+'-desktop.png')});
      for(const width of [390,768]){
        await page.setViewportSize({width,height:844});await waitMath(page);
        const dims=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
        assert(dims.scroll<=dims.width+1,code+' débordement à '+width+': '+JSON.stringify(dims));
        for(const id of ['cours','visu','exos','qcm']){
          await page.locator('#'+id).scrollIntoViewIfNeeded();
          if(width===390)await page.screenshot({path:path.join(output,`${code}-mobile-${id}.png`)});
        }
      }
      await page.locator('#site-menu').click();
      assert.equal(await page.locator('#site-menu').getAttribute('aria-expanded'),'true');
      await page.locator('#site-shade').click({position:{x:700,y:200}});
      await page.setViewportSize({width:1440,height:1000});
      await page.locator('#site-lesson-status').selectOption('validated');await page.reload();
      assert.equal(await page.locator('#site-lesson-status').inputValue(),'validated');
      console.log('PASS '+code+': vrais boutons, oracle indépendant, QCM justes/faux, sauvegarde, frontières, MathJax et mobile.');
    }
    // Résilience : MathJax et stockage indisponibles ne bloquent pas les réponses.
    const degraded=await browser.newContext();
    await degraded.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('stockage indisponible');}});});
    await degraded.route('**/vendor/mathjax/**',route=>route.abort());
    const local=await degraded.newPage();
    for(const file of paths){
      await local.goto(base+'chapitres/07_probabilites/'+file);
      const answers=await oracle(local);
      await local.locator('#ex1-rep').fill(answers.exercises[0]);await local.locator('#ex1-check').click();
      assert.match(await local.locator('#ex1-fb').getAttribute('class'),/good/);
      assert.match(await local.locator('[data-storage-note]').first().textContent(),/indisponible/);
    }
    await degraded.close();
    assert.deepEqual(errors,[],'aucune erreur JS ou ressource manquante en mode normal');
    console.log('PASS résilience : validation active sans MathJax et sans stockage ; captures '+output);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
