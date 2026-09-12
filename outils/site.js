/* Interface et suivi local. Aucune requête réseau, aucun compte requis. */
(function () {
  'use strict';
  const config = JSON.parse(document.getElementById('site-config').textContent);
  const $ = (id) => document.getElementById(id);
  const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const lessons = config.chapters.flatMap(c => c.lessons.map(l => ({...l, chapter: c.title, chapterNumber: c.number})));
  const byId = new Map(lessons.map(l => [l.id, l]));
  const current = byId.get(config.current);
  const KEY = 'reussite_maths_v1';
  const LEGACY = 'carnet_maths_v1';
  const states = {started: 'En cours', review: 'À revoir', validated: 'Validé par moi'};
  const results = {ok: 'Réussi sans aide', aide: 'Réussi avec aide', ko: 'À revoir'};
  const normalize = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const href = (lesson, section = '') => config.prefix + lesson.path + (section ? '#' + encodeURIComponent(section) : '');
  const empty = () => ({version: 1, lessons: {}, journal: [], last: null, legacyImported: false, tombstones: {}});
  let state = empty();
  let storageOK = true;
  let storageCorrupt = false;
  const text = (tag, value, className) => {
    const el = document.createElement(tag);
    el.textContent = value;
    if (className) el.className = className;
    return el;
  };

  function validate(input) {
    if (!input || input.version !== 1 || !input.lessons || typeof input.lessons !== 'object' || Array.isArray(input.lessons) || !Array.isArray(input.journal)) throw Error('Format de sauvegarde non reconnu.');
    if (Object.keys(input.lessons).length > 5000 || input.journal.length > 20000) throw Error('Cette sauvegarde est trop volumineuse.');
    const out = empty();
    const validTime = n => typeof n === 'number' && Number.isFinite(n) && n > 0 && n <= Date.now() + 86400000;
    for (const [id, item] of Object.entries(input.lessons)) {
      if (!/^\d{1,3}[A-Z]$/.test(id) || !item || !Object.hasOwn(states, item.status) || !validTime(item.updated)) throw Error('Une fiche de la sauvegarde est invalide.');
      const section = typeof item.section === 'string' && /^[\w-]{0,80}$/.test(item.section) ? item.section : '';
      out.lessons[id] = {status: item.status, updated: item.updated, section};
    }
    out.journal = input.journal.map(row => {
      if (!row || typeof row.id !== 'string' || !/^[\w-]{1,100}$/.test(row.id) || !validTime(row.ts) || !Object.hasOwn(results, row.res)) throw Error('Une entrée du carnet est invalide.');
      for (const key of ['chap', 'ex', 'err', 'note']) {
        if (typeof row[key] !== 'string' || row[key].length > (key === 'note' ? 2000 : 500)) throw Error('Une entrée du carnet est invalide.');
      }
      return {id: row.id, ts: row.ts, chap: row.chap, ex: row.ex, res: row.res, err: row.err, note: row.note,
        lesson: typeof row.lesson === 'string' && /^\d{1,3}[A-Z]$/.test(row.lesson) ? row.lesson : '',
        updated: validTime(row.updated) ? row.updated : row.ts,
        source: row.source === 'auto' ? 'auto' : 'manual'};
    });
    if (input.last && /^\d{1,3}[A-Z]$/.test(input.last.id) && validTime(input.last.ts)) {
      out.last = {id: input.last.id, ts: input.last.ts, section: typeof input.last.section === 'string' && /^[\w-]{0,80}$/.test(input.last.section) ? input.last.section : ''};
    }
    out.legacyImported = input.legacyImported === true;
    if (input.tombstones && typeof input.tombstones === 'object') {
      for (const [id, ts] of Object.entries(input.tombstones)) {
        if (/^[\w-]{1,100}$/.test(id) && validTime(ts)) out.tombstones[id] = ts;
      }
    }
    return out;
  }

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? validate(JSON.parse(raw)) : empty();
    } catch (e) {
      storageOK = false;
      try { storageCorrupt = !!localStorage.getItem(KEY); } catch (_) {}
      return state;
    }
  }

  function merge(a, b) {
    const out = empty();
    out.lessons = {...a.lessons};
    for (const [id, item] of Object.entries(b.lessons)) if (!out.lessons[id] || item.updated >= out.lessons[id].updated) out.lessons[id] = item;
    out.tombstones = {...a.tombstones};
    for (const [id, ts] of Object.entries(b.tombstones)) out.tombstones[id] = Math.max(out.tombstones[id] || 0, ts);
    const rows = new Map(a.journal.map(r => [r.id, r]));
    b.journal.forEach(r => { if (!rows.has(r.id) || r.updated >= rows.get(r.id).updated) rows.set(r.id, r); });
    out.journal = [...rows.values()].filter(r => !out.tombstones[r.id]).sort((x, y) => x.ts - y.ts);
    out.last = !a.last || (b.last && b.last.ts >= a.last.ts) ? b.last : a.last;
    out.legacyImported = a.legacyImported || b.legacyImported;
    return out;
  }

  function storageLabel() {
    all('[data-storage-note]').forEach(el => {
      el.textContent = storageOK ? 'Enregistré dans ce navigateur, sur cet appareil.' : (storageCorrupt ? 'Sauvegarde locale illisible : copie conservée. Exporte cette séance avant de partir.' : 'Enregistrement indisponible : exporte ton suivi avant de fermer cette page.');
      el.classList.toggle('site-storage-failed', !storageOK);
    });
    if (!storageOK && !$('site-emergency-export')) {
      const note = document.querySelector('[data-storage-note]');
      if (note) {
        const button = text('button', 'Exporter cette séance', 'site-btn subtle');
        button.id = 'site-emergency-export'; button.type = 'button';
        button.addEventListener('click', exportState); note.after(button);
      }
    } else if (storageOK) $('site-emergency-export')?.remove();
  }

  function exportState() {
    state = merge(state, read());
    const data = JSON.stringify({...state, exportedAt: new Date().toISOString()}, null, 2);
    const url = URL.createObjectURL(new Blob([data], {type: 'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = 'reussite-maths-suivi-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  function save(change) {
    state = merge(state, read());
    if (change) change(state);
    try {
      if (storageCorrupt) throw Error('Ne pas écraser une sauvegarde illisible.');
      localStorage.setItem(KEY, JSON.stringify(state));
      storageOK = true;
    } catch (_) { storageOK = false; }
    storageLabel();
    paintBadges();
  }

  function legacyRows(rows) {
    if (rows.length > 20000) throw Error('Carnet trop volumineux.');
    const out = empty();
    out.journal = rows.map((r, index) => {
      if (!r || typeof r.ts !== 'number' || typeof r.chap !== 'string' || typeof r.ex !== 'string' || !Object.hasOwn(results, r.res)) throw Error('Ancien carnet invalide.');
      const code = (r.chap.match(/^\d+[A-Z]\b/) || [''])[0];
      // Stable IDs make repeated imports idempotent, including old entries.
      const signature = JSON.stringify([r.ts, r.chap, r.ex, r.res, r.err, r.note]);
      let hash = 2166136261;
      for (let i = 0; i < signature.length; i++) hash = Math.imul(hash ^ signature.charCodeAt(i), 16777619);
      return {id: 'legacy-' + r.ts + '-' + (hash >>> 0).toString(36) + '-' + index, ts: r.ts, updated: r.ts, chap: r.chap, ex: r.ex, res: r.res,
        err: r.err || '', note: r.note || '', lesson: code, source: 'manual'};
    });
    out.legacyImported = true;
    out.journal.forEach(row => {
      if (!byId.has(row.lesson)) return;
      const previous = out.lessons[row.lesson];
      out.lessons[row.lesson] = {status: row.res === 'ko' || previous?.status === 'review' ? 'review' : 'started', section: 'cours', updated: Math.max(row.ts, previous?.updated || 0)};
    });
    return validate(out);
  }

  state = read();
  if (!state.legacyImported) {
    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY) || '[]');
      if (Array.isArray(legacy)) {
        const imported = legacyRows(legacy);
        save(s => { Object.assign(s, merge(s, imported)); });
      }
    } catch (_) { /* Keep the legacy key untouched for manual recovery. */ }
  }
  storageLabel();

  function paintBadges() {
    all('[data-state-for]').forEach(el => {
      const item = state.lessons[el.dataset.stateFor];
      el.textContent = item ? states[item.status] : 'À commencer';
      el.dataset.state = item ? item.status : 'new';
    });
  }
  paintBadges();

  // Desktop programme / mobile drawer. Restore focus, Escape and trap Tab.
  let drawerOpener = null;
  function drawer(open, opener) {
    if (open && window.innerWidth >= 1100) return;
    document.body.classList.toggle('site-drawer-open', open);
    $('site-shade').hidden = !open;
    $('site-menu').setAttribute('aria-expanded', String(open));
    all('body > main,body > header,body > footer,body > .navbar,body > nav#nav,.site-header .site-brand,.site-actions').forEach(el => { el.inert = open; });
    if (open) {
      drawerOpener = opener || $('site-menu');
      const target = $('site-sidebar').querySelector('a[aria-current="page"]') || $('site-sidebar').querySelector('a');
      if (target) target.focus();
    } else if (drawerOpener) { drawerOpener.focus(); drawerOpener = null; }
  }
  $('site-menu').addEventListener('click', () => drawer(!document.body.classList.contains('site-drawer-open'), $('site-menu')));
  $('site-shade').addEventListener('click', () => drawer(false));
  all('[data-open-program]').forEach(b => b.addEventListener('click', () => drawer(true, b)));
  $('site-sidebar').addEventListener('click', e => { if (e.target.closest('a')) drawer(false); });
  window.addEventListener('resize', () => { if (innerWidth >= 1100 && document.body.classList.contains('site-drawer-open')) drawer(false); });
  document.addEventListener('keydown', e => {
    if (!document.body.classList.contains('site-drawer-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); drawer(false); }
    if (e.key === 'Tab') {
      const items = [$('site-menu'), ...all('a,button,summary', $('site-sidebar')).filter(x => x.getClientRects().length)];
      e.preventDefault();
      const index = items.indexOf(document.activeElement);
      items[(index + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
    }
  });

  // Search indexes sections as well as lesson names, with accent-insensitive matching.
  const searchable = lessons.flatMap(l => [
    {title: l.title, context: `${l.id} · ${l.level === 'premiere' ? 'Première' : 'Terminale'} · ${l.chapter}`, path: href(l)},
    ...l.sections.map(s => ({title: `${s.title} — ${l.title}`, context: `${l.id} · ${l.chapter}`, keywords: s.keywords, path: href(l, s.id)}))
  ]).concat([
    ['Bien démarrer', 'depart'], ['Comprendre l’apprentissage', 'science'], ['Travailler en autonomie', 'methode'],
    ['Organiser ma semaine · minuteur', 'semaine'], ['Quand je bloque', 'bloque'], ['Utiliser une IA · prompts', 'chatgpt'], ['Choisir son outil IA', 'abonnement']
  ].map(([title, id]) => ({title, context: 'Méthode de travail', path: config.prefix + 'strategie/reussir_lannee.html#' + id})));
  function search() {
    const query = normalize($('site-search-input').value).trim();
    const tokens = query.split(/\s+/).filter(Boolean);
    const found = searchable.filter(x => tokens.every(t => normalize(x.title + ' ' + x.context + ' ' + (x.keywords || '')).includes(t)));
    const box = $('site-search-results'); box.replaceChildren();
    $('site-search-count').textContent = query ? `${found.length} résultat${found.length > 1 ? 's' : ''}` : 'Explore les fiches ou saisis une notion.';
    (query ? found : searchable.filter(x => !x.title.includes(' — '))).slice(0, 40).forEach(x => {
      const a = text('a', x.title); a.href = x.path; a.append(text('small', x.context)); box.append(a);
    });
    if (!found.length) box.append(text('p', 'Aucun résultat. Essaie un mot plus court ou le nom du chapitre.'));
  }
  function openSearch() {
    if (document.body.classList.contains('site-drawer-open')) drawer(false);
    $('site-search-dialog').showModal(); search(); $('site-search-input').focus();
  }
  $('site-search-open').addEventListener('click', openSearch);
  $('site-search-close').addEventListener('click', () => $('site-search-dialog').close());
  $('site-search-dialog').addEventListener('click', e => { if (e.target.closest('a')) $('site-search-dialog').close(); });
  $('site-search-input').addEventListener('input', search);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('site-search-dialog').open) {
      e.preventDefault(); $('site-search-dialog').close(); return;
    }
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest('input,textarea,select,[contenteditable="true"]') && !$('site-search-dialog').open) {
      e.preventDefault(); openSearch();
    }
  });

  function changeStatus(id, value) {
    save(s => { s.lessons[id] = {...s.lessons[id], status: value, section: s.lessons[id]?.section || '', updated: Date.now()}; });
  }
  function statusSelect(id) {
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'État de la fiche ' + id);
    Object.entries(states).forEach(([value, label]) => { const option = text('option', label); option.value = value; select.append(option); });
    select.value = state.lessons[id]?.status || 'started';
    select.addEventListener('change', () => { changeStatus(id, select.value); if (config.kind === 'progress') renderProgress(); });
    return select;
  }
  function addEntry(row) {
    save(s => {
      s.journal.push(row);
      if (byId.has(row.lesson)) {
        const previous = s.lessons[row.lesson];
        s.lessons[row.lesson] = {status: row.res === 'ko' ? 'review' : previous?.status || 'started', section: previous?.section || '', updated: Date.now()};
      }
    });
    if ($('site-lesson-status')) $('site-lesson-status').value = state.lessons[current.id].status;
  }

  // Anchors keep the complete lesson and all exercise state in the document.
  const sectionNav = document.querySelector('body > .navbar nav,body > nav#nav');
  if (sectionNav) {
    sectionNav.setAttribute('aria-label', 'Sections de la ' + (config.kind === 'method' ? 'méthode' : 'fiche'));
    const entries = all('a', sectionNav).map(a => ({a, section: document.querySelector(a.getAttribute('href'))})).filter(x => x.section);
    if (current || config.kind === 'template') entries.forEach(({a}) => {
      if (/visu/i.test(a.getAttribute('href'))) a.textContent = 'Explorer';
      else if (/exos|exercices/.test(a.getAttribute('href'))) a.textContent = 'Exercices';
      else if (/methode/.test(a.getAttribute('href'))) a.textContent = 'Méthode';
    });
    let lastSection = '';
    let scheduled = false;
    function observeSection() {
      scheduled = false;
      let chosen = entries[0];
      const offset = 140;
      entries.forEach(x => { if (x.section.getBoundingClientRect().top <= offset) chosen = x; });
      if (!chosen) return;
      entries.forEach(x => { x.a.classList.toggle('active', x === chosen); if (x === chosen) x.a.setAttribute('aria-current', 'location'); else x.a.removeAttribute('aria-current'); });
      if (config.kind === 'method') all('.site-sidebar .site-side-link').forEach(a => {
        if (a.getAttribute('href') === '#' + chosen.section.id) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
      if (chosen.section.id === lastSection) return;
      lastSection = chosen.section.id;
      const a = chosen.a;
      if (a.offsetLeft < sectionNav.scrollLeft || a.offsetLeft + a.offsetWidth > sectionNav.scrollLeft + sectionNav.clientWidth) sectionNav.scrollLeft = Math.max(0, a.offsetLeft - 20);
      if (current) save(s => {
        const ts = Date.now();
        s.lessons[current.id] = {...s.lessons[current.id], section: lastSection, updated: ts};
        s.last = {id: current.id, section: lastSection, ts};
      });
    }
    window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(observeSection); } }, {passive: true});
    sectionNav.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a) return;
      const section = document.querySelector(a.getAttribute('href'));
      if (section) { section.setAttribute('tabindex', '-1'); section.focus({preventScroll: true}); }
    });
    if (current) {
      save(s => {
        const ts = Date.now();
        s.lessons[current.id] = {status: s.lessons[current.id]?.status || 'started', section: s.lessons[current.id]?.section || 'cours', updated: ts};
        s.last = {id: current.id, section: location.hash.slice(1) || 'cours', ts};
      });
      $('site-lesson-status').value = state.lessons[current.id].status;
      $('site-lesson-status').addEventListener('change', e => changeStatus(current.id, e.target.value));
    }
    // Run after the browser's initial fragment navigation, including MathJax layout.
    window.addEventListener('load', observeSection);
    if (document.readyState === 'complete') observeSection();
  }

  if (current) {
    const signatures = new Map();
    const helped = new Set();
    let qcmRecorded = false;
    function captureExercise(card) {
      const fb = card.querySelector('.feedback,.fb');
      if (!fb || !fb.textContent.trim()) return;
      const fields = all('input,select', card).filter(x => x.type !== 'range' && !x.disabled && x.getClientRects().length);
      if (fields.some(x => !x.value.trim())) return;
      const correct = fb.matches('.good,.ok');
      if (!correct && !fb.matches('.bad,.ko')) return;
      const signature = fields.map(x => x.value).join('|') + ':' + correct;
      if (signatures.get(card.id) === signature) return;
      signatures.set(card.id, signature);
      const ts = Date.now();
      addEntry({id: uid(), ts, updated: ts, lesson: current.id, chap: current.id + ' ' + current.title,
        ex: 'Exercice ' + card.id.replace(/\D/g, ''), res: correct ? (helped.has(card.id) ? 'aide' : 'ok') : 'ko', err: '', note: '', source: 'auto'});
    }
    document.addEventListener('click', e => {
      const button = e.target.closest('button');
      if (!button) return;
      const label = normalize(button.textContent);
      const card = button.closest('.card[id^="ex"]');
      if (card) {
        if (/correction/.test(label)) helped.add(card.id);
        if (/nouvel exercice/.test(label)) { signatures.delete(card.id); helped.delete(card.id); }
        if (/verifier/.test(label)) setTimeout(() => captureExercise(card), 0);
      }
      if (button.closest('#qcm')) {
        if (/nouveau qcm/.test(label)) qcmRecorded = false;
        else setTimeout(() => {
          const score = document.querySelector('#qcm .score, #qcm-score, #qcmScore, #qcmscore');
          const match = score?.textContent.match(/(\d+)\s*\/\s*(\d+)/);
          if (!match || qcmRecorded) return;
          qcmRecorded = true;
          const ts = Date.now();
          addEntry({id: uid(), ts, updated: ts, lesson: current.id, chap: current.id + ' ' + current.title,
            ex: 'QCM · ' + match[1] + ' / ' + match[2], res: match[1] === match[2] ? 'ok' : 'ko', err: '', note: 'Résultat enregistré automatiquement.', source: 'auto'});
        }, 0);
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const card = e.target.closest('.card[id^="ex"]');
        if (card) setTimeout(() => captureExercise(card), 0);
      }
    });
  }

  if (config.kind === 'catalog') {
    let filter = 'all';
    let remembered = [];
    try { remembered = JSON.parse(localStorage.getItem('reussite_chapitres_ouverts') || localStorage.getItem('accueil_chapitres_ouverts') || '[]'); } catch (_) {}
    const chapters = all('[data-catalog-chapter]');
    chapters.forEach(el => {
      if (Array.isArray(remembered)) el.open = remembered.includes(el.id);
      el.addEventListener('toggle', () => {
        if (!$('site-catalog-query').value && filter === 'all') {
          try { localStorage.setItem('reussite_chapitres_ouverts', JSON.stringify(chapters.filter(c => c.open).map(c => c.id))); } catch (_) {}
        }
      });
    });
    function filterCatalog() {
      const query = normalize($('site-catalog-query').value).trim();
      let count = 0;
      chapters.forEach(el => {
        const chapter = config.chapters.find(c => String(c.number) === el.dataset.catalogChapter);
        const chapterMatch = normalize(chapter.title + ' ' + chapter.goal).includes(query);
        let visible = 0;
        all('[data-lesson]', el).forEach(row => {
          const l = byId.get(row.dataset.lesson);
          const matches = (filter === 'all' || l.level === filter) && (chapterMatch || normalize(l.id + ' ' + l.title).includes(query));
          row.hidden = !matches; if (matches) visible++;
        });
        all('[data-level-group]', el).forEach(group => { group.hidden = !all('[data-lesson]', group).some(r => !r.hidden); });
        el.hidden = !visible && !(filter === 'all' && !chapter.lessons.length && chapterMatch);
        if (query || filter !== 'all') el.open = !el.hidden;
        count += visible;
      });
      $('site-catalog-count').textContent = count + ' fiche' + (count > 1 ? 's' : '') + ' disponible' + (count > 1 ? 's' : '');
      $('site-catalog-empty').hidden = chapters.some(c => !c.hidden);
    }
    all('[data-filter]').forEach(b => b.addEventListener('click', () => {
      filter = b.dataset.filter; all('[data-filter]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); filterCatalog();
    }));
    $('site-catalog-query').addEventListener('input', filterCatalog);
    function openFragment() { const el = $(location.hash.slice(1)); if (el?.matches('[data-catalog-chapter]')) { el.open = true; el.scrollIntoView(); } }
    filterCatalog(); openFragment(); window.addEventListener('hashchange', openFragment);
  }

  function renderHome() {
    const last = state.last && byId.get(state.last.id);
    if (last) {
      $('site-resume-label').textContent = 'Reprendre là où tu en étais';
      $('site-resume-title').textContent = last.title;
      const section = last.sections.find(s => s.id === state.last.section);
      $('site-resume-description').textContent = `${last.id} · ${last.chapter}${section ? ' · ' + section.title : ''}`;
      $('site-resume-link').textContent = 'Reprendre ma fiche →';
      $('site-resume-link').href = href(last, state.last.section);
    }
    const review = lessons.filter(l => state.lessons[l.id]?.status === 'review');
    const today = $('site-today');
    if (review.length) {
      today.className = 'site-grid'; today.replaceChildren();
      review.slice(0, 2).forEach(l => {
        const a = text('a', '', 'site-tile'); a.href = href(l, l.sections.find(s => /exos|exercices/.test(s.id))?.id || 'cours');
        a.append(text('span', 'À revoir · ' + l.id, 'site-eyebrow'), text('h3', l.title), text('p', 'Reprends un exercice sans regarder la correction.'), text('span', 'M’entraîner →', 'site-tile-link'));
        today.append(a);
      });
    } else {
      today.className = 'site-empty'; today.textContent = last ? 'Aucune notion signalée à revoir. Tu peux poursuivre ta dernière fiche ou choisir le chapitre travaillé en classe.' : 'Tes notions à revoir apparaîtront ici. Après une fiche, indique ce que tu souhaites retravailler.';
    }
  }
  if (config.kind === 'home') renderHome();

  function date(ts) { return new Date(ts).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short', year: 'numeric'}); }
  function message(id, value, error = false) { $(id).textContent = value; $(id).dataset.error = String(error); }
  function renderProgress() {
    const known = Object.entries(state.lessons).filter(([id]) => byId.has(id));
    $('site-stat-started').textContent = known.length;
    $('site-stat-review').textContent = known.filter(([, v]) => v.status === 'review').length;
    $('site-stat-validated').textContent = known.filter(([, v]) => v.status === 'validated').length;
    const list = $('site-progress-list'); list.replaceChildren();
    known.sort((a, b) => b[1].updated - a[1].updated).forEach(([id, item]) => {
      const lesson = byId.get(id), row = text('div', '', 'site-progress-row'), info = document.createElement('div');
      const a = text('a', id + ' · ' + lesson.title); a.href = href(lesson, item.section);
      info.append(a, text('small', 'Dernière activité : ' + date(item.updated)));
      row.append(info, statusSelect(id)); list.append(row);
    });
    if (!known.length) list.append(text('div', 'Ton parcours commence avec ta première fiche. Retrouve ensuite ici les notions travaillées.', 'site-empty'));
    const journal = $('site-journal-list'); journal.replaceChildren();
    [...state.journal].reverse().forEach(r => {
      const row = text('div', '', 'site-journal-row'), info = document.createElement('div');
      info.append(text('small', date(r.ts) + (r.source === 'auto' ? ' · Enregistrement automatique' : '')),
        text('div', r.chap + ' · ' + r.ex), text('p', results[r.res] + (r.err ? ' · ' + r.err : '') + (r.note ? ' — ' + r.note : '')));
      const actions = text('div', '', 'site-journal-actions');
      if (r.res === 'ko') {
        const done = text('button', 'Refait sans aide', 'site-btn secondary'); done.type = 'button';
        done.addEventListener('click', () => {
          const ts = Date.now();
          save(s => { const original = s.journal.find(x => x.id === r.id); if (original) { original.res = 'ok'; original.updated = ts; } });
          addEntry({...r, id: uid(), ts, updated: ts, ex: r.ex + ' (refait)', res: 'ok', source: 'manual'});
          renderProgress();
        }); actions.append(done);
      }
      const remove = text('button', 'Supprimer', 'site-btn subtle'); remove.type = 'button';
      remove.setAttribute('aria-label', 'Supprimer l’entrée ' + r.ex + ' du ' + date(r.ts));
      remove.addEventListener('click', () => {
        if (remove.dataset.armed !== 'true') { remove.dataset.armed = 'true'; remove.textContent = 'Confirmer'; setTimeout(() => { if (remove.isConnected) { remove.dataset.armed = 'false'; remove.textContent = 'Supprimer'; } }, 4000); return; }
        save(s => { s.tombstones[r.id] = Date.now(); s.journal = s.journal.filter(x => x.id !== r.id); }); renderProgress();
      }); actions.append(remove); row.append(info, actions); journal.append(row);
    });
    if (!state.journal.length) journal.append(text('p', 'Tes résultats d’exercices et de QCM apparaîtront ici. Tu peux aussi noter un exercice fait sur papier.', 'site-hint'));
  }

  if (config.kind === 'progress') {
    $('site-file-warning').hidden = location.protocol !== 'file:';
    lessons.forEach(l => { const option = text('option', l.id + ' · ' + l.title); option.value = l.id; $('site-journal-lesson').append(option); });
    const other = text('option', 'Autre exercice / manuel'); other.value = ''; $('site-journal-lesson').append(other);
    $('site-journal-lesson').required = false;
    if (state.last && byId.has(state.last.id)) $('site-journal-lesson').value = state.last.id;
    renderProgress();
    $('site-journal-form').addEventListener('submit', e => {
      e.preventDefault();
      const ex = $('site-journal-exercise').value.trim(); if (!ex) return;
      const lesson = byId.get($('site-journal-lesson').value), ts = Date.now();
      addEntry({id: uid(), ts, updated: ts, lesson: lesson?.id || '', chap: lesson ? lesson.id + ' ' + lesson.title : 'Autre exercice', ex,
        res: $('site-journal-result').value, err: $('site-journal-error').value, note: $('site-journal-note').value.trim(), source: 'manual'});
      $('site-journal-exercise').value = ''; $('site-journal-note').value = ''; $('site-journal-error').value = '';
      message('site-journal-message', storageOK ? 'Séance ajoutée au carnet.' : 'Séance ajoutée en mémoire. Exporte ton suivi avant de fermer la page.', !storageOK);
      renderProgress();
    });
    $('site-copy-report').addEventListener('click', async () => {
      const value = ['Mon bilan de travail en mathématiques — Terminale spécialité.', ...state.journal.map(r => `${date(r.ts)} | ${r.chap} | ${r.ex} | ${results[r.res]}${r.err ? ' | ' + r.err : ''}${r.note ? ' | ' + r.note : ''}`), '', 'Propose trois exercices ciblés de difficulté croissante sur mes difficultés. Donne les énoncés, puis attends mes réponses avant de corriger.'].join('\n');
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
        else throw Error('clipboard');
        message('site-journal-message', 'Bilan copié. Tu peux le coller dans ton tuteur IA.');
      } catch (_) {
        const area = document.createElement('textarea'); area.value = value; area.setAttribute('aria-label', 'Bilan à copier'); area.className = 'site-input';
        $('site-copy-report').after(area); area.focus(); area.select();
        message('site-journal-message', 'Copie le texte sélectionné ci-dessous.');
      }
    });
    $('site-export').addEventListener('click', () => {
      exportState();
      message('site-backup-message', 'Export préparé. Conserve le fichier dans un endroit sûr.');
    });
    function importText(value) {
      if (value.length > 8 * 1024 * 1024) throw Error('Fichier trop volumineux (maximum 8 Mo).');
      const parsed = JSON.parse(value);
      const imported = Array.isArray(parsed) ? legacyRows(parsed) : validate(parsed);
      save(s => Object.assign(s, merge(s, imported)));
      renderProgress();
      message('site-backup-message', storageOK ? 'Sauvegarde fusionnée avec ton suivi. Les entrées déjà présentes ne sont pas dupliquées.' : 'Import chargé en mémoire. Le navigateur ne peut pas l’enregistrer : exporte une copie avant de partir.', !storageOK);
    }
    $('site-import-open').addEventListener('click', () => $('site-import-file').click());
    $('site-import-file').addEventListener('change', async e => {
      const file = e.target.files[0]; if (!file) return;
      try {
        if (file.size > 8 * 1024 * 1024) throw Error('Fichier trop volumineux (maximum 8 Mo).');
        importText(await file.text());
      } catch (err) { message('site-backup-message', 'Import refusé : ' + (err instanceof SyntaxError ? 'ce fichier ne contient pas une sauvegarde JSON valide.' : err.message), true); }
      e.target.value = '';
    });
    $('site-import-text-button').addEventListener('click', () => {
      try { importText($('site-import-text').value); $('site-import-text').value = ''; }
      catch (err) { message('site-backup-message', 'Import refusé : ' + (err instanceof SyntaxError ? 'colle exactement les données exportées.' : err.message), true); }
    });
  }

  window.addEventListener('storage', e => {
    if (e.key !== KEY) return;
    state = merge(state, read()); paintBadges(); storageLabel();
    if (config.kind === 'home') renderHome();
    if (config.kind === 'progress') renderProgress();
    if (current && $('site-lesson-status')) $('site-lesson-status').value = state.lessons[current.id]?.status || 'started';
  });
})();
