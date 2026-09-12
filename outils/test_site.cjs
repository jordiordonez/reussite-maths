// Browser regression checks. Run with a local server and Playwright available.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.SITE_TEST_URL || 'http://127.0.0.1:8765/';
const output = process.env.SITE_TEST_OUTPUT || '/tmp/reussite-maths-qa';
const key = 'reussite_maths_v1';

(async () => {
  fs.mkdirSync(output, {recursive: true});
  const browser = await chromium.launch({headless: true});
  try {
    const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) errors.push(response.status() + ' ' + response.url()); });
    const goto = async url => { await page.goto(base + url); await page.waitForLoadState('load'); };
    await goto('index.html');
    const config = await page.locator('#site-config').textContent().then(JSON.parse);
    const lessons = config.chapters.flatMap(c => c.lessons);
    assert(lessons.length >= 21);
    assert.equal(await page.locator('.site-hero').count(), 1);
    await page.screenshot({path: path.join(output, 'accueil-desktop.png'), fullPage: true});
    await page.locator('#site-search-open').click();
    await page.locator('#site-search-input').fill('derivee');
    assert(await page.locator('#site-search-results a').count() > 0);
    await page.keyboard.press('Escape');
    await page.locator('#site-search-dialog').waitFor({state: 'hidden'});
    assert.equal(await page.locator('#site-search-dialog').isVisible(), false);
    await goto('chapitres.html');
    await page.locator('[data-filter="premiere"]').click();
    assert.equal(await page.locator('[data-level="terminale"]:visible').count(), 0);
    await page.locator('#site-catalog-query').fill('introuvable-xyz');
    assert(await page.locator('#site-catalog-empty').isVisible());
    await page.locator('#site-catalog-query').fill('');
    await page.locator('[data-filter="all"]').click();
    await page.locator('#ch3 > summary').click();
    await page.screenshot({path: path.join(output, 'chapitres-desktop.png'), fullPage: true});

    const checkedLessons = process.env.SITE_TEST_FAST ? lessons.slice(0, 2) : lessons;
    for (const lesson of checkedLessons) {
      await goto(lesson.path);
      assert.equal(await page.locator('.site-sidebar .site-side-link[aria-current="page"]').count(), 1, lesson.id + ' active lesson');
      assert.equal(await page.locator('.site-pager a').count(), 2);
      const missing = await page.evaluate(() => [...document.querySelectorAll('.navbar nav a')].filter(a => !document.querySelector(a.getAttribute('href'))).map(a => a.href));
      assert.deepEqual(missing, [], lesson.id + ' section anchors');
      // Read-only navigation must never declare a lesson mastered.
      const record = await page.evaluate(([key, id]) => JSON.parse(localStorage.getItem(key)).lessons[id], [key, lesson.id]);
      assert.equal(record.status, 'started', lesson.id);
      assert.equal(await page.locator('mjx-container').count() > 0, true, lesson.id + ' MathJax');
      // Exercise recording supports both old and new engine IDs.
      const card = page.locator('#ex1');
      if (await card.count()) {
        for (const field of await card.locator('select:visible').all()) await field.selectOption({index: 1});
        for (const field of await card.locator('input:not([type="range"]):visible').all()) await field.fill('987654');
        const check = card.getByRole('button', {name: 'Vérifier', exact: true});
        if (await check.count()) {
          await check.click();
          await page.waitForTimeout(30);
          const journal = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).journal, key);
          assert(journal.some(r => r.lesson === lesson.id && r.ex === 'Exercice 1'), lesson.id + ' exercise recorded');
        }
      }
      // Complete a QCM. Its history entry must be recorded once, and not twice.
      let choices = page.locator('#qcm .choices, #qcm .opts');
      for (const choice of await choices.all()) await choice.locator('button').first().click();
      await page.waitForTimeout(30);
      const journal = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).journal, key);
      assert.equal(journal.filter(r => r.lesson === lesson.id && r.ex.startsWith('QCM')).length, 1, lesson.id + ' QCM recorded');
      console.log('  ✓ ' + lesson.id);
    }
    console.log('PASS: ' + checkedLessons.length + ' lessons, formula rendering, exercise/QCM results and navigation.');

    await goto(lessons[0].path);
    await page.locator('#site-lesson-status').selectOption('validated');
    await page.locator('.navbar nav a').last().click();
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).last.section === 'qcm', key);
    await goto('index.html');
    assert((await page.locator('#site-resume-link').getAttribute('href')).includes('#qcm'));
    await goto('progres.html');
    assert(Number(await page.locator('#site-stat-validated').textContent()) >= 1);
    await page.locator('#site-journal-exercise').fill('Manuel p. 84');
    await page.locator('#site-journal-note').fill('<img src=x onerror=alert(1)>');
    await page.locator('#site-journal-form button[type="submit"]').click();
    assert.equal(await page.locator('#site-journal-list img').count(), 0);
    const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).journal.length, key);
    const backup = await page.evaluate(key => localStorage.getItem(key), key);
    await page.locator('#sauvegarde details summary').click();
    await page.locator('#site-import-text').fill(backup);
    await page.locator('#site-import-text-button').click();
    assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).journal.length, key), before);
    await page.locator('#site-import-text').fill('{"version":1,"lessons":{},"journal":[{"bad":"data"}]}');
    await page.locator('#site-import-text-button').click();
    assert.equal(await page.locator('#site-backup-message').getAttribute('data-error'), 'true');
    assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).journal.length, key), before);
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#site-export').click();
    const download = await downloadPromise;
    const exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    assert.equal(exported.journal.length, before);
    await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
    await page.screenshot({path: path.join(output, 'progres-desktop.png')});
    await page.reload();
    assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).journal.length, key), before);
    console.log('PASS: resumption, manual validation, persistence, safe rendering, export and validated idempotent import.');

    // No lesson data should be lost when another tab writes.
    const second = await context.newPage();
    await second.goto(base + lessons[1].path);
    await second.locator('#site-lesson-status').selectOption('validated');
    await page.waitForFunction(() => Number(document.getElementById('site-stat-validated').textContent) >= 2);
    await second.close();
    await goto('strategie/reussir_lannee.html');
    await page.locator('#t5').click();
    assert.equal(await page.locator('#timerDisplay').textContent(), '05:00');
    await page.locator('#tStop').click();
    await page.locator('#frScale button').first().click();
    assert(await page.locator('#frAnswer').isVisible());
    assert.equal(await page.locator('#cAdd').count(), 0);
    console.log('PASS: cross-tab synchronization and guide tools.');

    await page.setViewportSize({width: 390, height: 844});
    for (const url of ['index.html', 'chapitres.html', 'progres.html', ...checkedLessons.map(l => l.path), 'strategie/reussir_lannee.html']) {
      await goto(url);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), url + ' mobile overflow');
    }
    await goto('index.html');
    await page.screenshot({path: path.join(output, 'accueil-mobile.png'), fullPage: true});
    await page.locator('#site-menu').click();
    assert(await page.locator('#site-sidebar').isVisible());
    assert.equal(await page.locator('#site-menu').getAttribute('aria-expanded'), 'true');
    await page.waitForFunction(() => document.getElementById('site-sidebar').getBoundingClientRect().left >= -1);
    await page.screenshot({path: path.join(output, 'menu-mobile.png')});
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#site-menu').getAttribute('aria-expanded'), 'false');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'site-menu');
    await goto(lessons[8].path);
    await page.screenshot({path: path.join(output, 'fiche-mobile.png')});
    await page.setViewportSize({width: 1440, height: 1000});
    await page.screenshot({path: path.join(output, 'fiche-desktop.png')});
    for (const width of [320, 1024]) {
      await page.setViewportSize({width, height: 900});
      for (const url of ['index.html', 'chapitres.html', 'progres.html', lessons[0].path]) {
        await goto(url);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), url + ' overflow at ' + width);
      }
    }
    console.log('PASS: responsive layouts and drawer keyboard/focus behavior.');

    const migrated = await browser.newContext();
    await migrated.addInitScript(() => {
      if (!localStorage.getItem('carnet_maths_v1')) localStorage.setItem('carnet_maths_v1', JSON.stringify([{ts: 1700000000000, chap: '1A Produit scalaire', ex: 'Ancien exercice', res: 'ko', err: 'calcul', note: 'À reprendre'}]));
    });
    const old = await migrated.newPage(); await old.goto(base + 'progres.html');
    assert.equal(await old.locator('#site-journal-list .site-journal-row').count(), 1);
    await old.reload();
    assert.equal(await old.locator('#site-journal-list .site-journal-row').count(), 1);
    assert(await old.evaluate(() => !!localStorage.getItem('carnet_maths_v1')));
    await migrated.close();
    const blocked = await browser.newContext();
    await blocked.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Disabled', 'QuotaExceededError'); }; });
    const noStorage = await blocked.newPage(); await noStorage.goto(base + lessons[0].path);
    assert(await noStorage.locator('.site-storage-failed').count() > 0);
    await blocked.close();
    console.log('PASS: legacy migration and explicit storage-failure feedback.');
    const offline = await browser.newContext({offline: true});
    const local = await offline.newPage();
    const localErrors = []; local.on('pageerror', e => localErrors.push(e.message));
    await local.goto(require('node:url').pathToFileURL(path.resolve(__dirname, '..', lessons[0].path)).href);
    await local.waitForSelector('mjx-container');
    assert.equal(await local.locator('.site-pager a').count(), 2);
    assert.deepEqual(localErrors, []);
    await offline.close();
    console.log('PASS: standalone HTML and local MathJax with network disabled.');
    assert.deepEqual(errors, [], 'No uncaught browser exceptions');
    console.log('PASS: no browser errors. Screenshots: ' + output);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
