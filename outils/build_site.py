#!/usr/bin/env python3
"""Intègre l'interface commune dans les HTML, sans dépendance à l'exécution.

Relancer après l'ajout d'une fiche. Le catalogue est découvert depuis les HTML
et ordre.md. Seuls les blocs SITE balisés sont régénérés dans les fiches.
"""
from pathlib import Path
import html
import json
import re

ROOT = Path(__file__).resolve().parent.parent
HERE = Path(__file__).resolve().parent


def plain(value):
    return html.unescape(re.sub(r'<[^>]+>', '', value)).strip()


def esc(value):
    return html.escape(str(value), quote=True)


def signature():
    return ('<div class="site-sign">© 2026 '
            '<a href="https://joasolucions.com" target="_blank" rel="noopener noreferrer">'
            'Solucions Digitals JOA</a>'
            ' · Contenu pédagogique sous licence CC BY-SA 4.0</div>')


def public(lessons):
    """Qui ce chapitre concerne, déduit du niveau réel de ses fiches."""
    niveaux = {x['level'] for x in lessons}
    if niveaux == {'premiere'}:
        return ('premiere', 'Première')
    if niveaux == {'terminale'}:
        return ('terminale', 'Terminale')
    if niveaux:
        return ('deux', 'Première et Terminale')
    return ('', '')


def block(name, text):
    return f'<!-- SITE:{name}:START -->\n{text}\n<!-- SITE:{name}:END -->'


def strip_blocks(text):
    return re.sub(r'<!-- SITE:([A-Z]+):START -->.*?<!-- SITE:\1:END -->\n?', '', text, flags=re.S)


def catalog():
    chapters = []
    for line in (ROOT / 'ordre.md').read_text().splitlines():
        fields = [x.strip() for x in line.split('|')]
        if len(fields) >= 7 and fields[1].isdigit():
            chapters.append({'number': int(fields[1]), 'title': fields[2].replace('**', ''),
                             'goal': fields[3], 'prerequisites': fields[4], 'lessons': []})
    for path in sorted((ROOT / 'chapitres').glob('*/*.html')):
        source = path.read_text()
        # les pages laissées aux anciennes adresses ne sont pas des fiches
        if 'http-equiv="refresh"' in source:
            continue
        title = re.search(r'<h1[^>]*>(.*?)</h1>', source, re.S)
        if not title:
            continue
        # une fiche vit dans le dossier qui porte son numéro
        if int(re.match(r'\d+', path.name.split('_')[0])[0]) != int(path.parent.name[:2]):
            continue
        code = path.name.split('_')[0]
        number = int(re.match(r'\d+', code)[0])
        chapter = next((c for c in chapters if c['number'] == number), None)
        if chapter is None:
            continue
        title = re.sub(r'^\d+[A-Z]\s*[·:—–-]?\s*', '', plain(title[1]))
        subtitle = re.search(r'class="sub"[^>]*>(.*?)</', source, re.S)
        level = 'premiere' if subtitle and 'Première' in plain(subtitle[1]) else 'terminale'
        sections = [{'id': s[0], 'title': plain(s[1]),
                     'keywords': ' '.join(plain(h) for h in re.findall(r'<h3[^>]*>(.*?)</h3>', s[2], re.S))}
                    for s in re.findall(r'<section\b[^>]*\bid="([^"]+)"[^>]*>\s*<h2[^>]*>(.*?)</h2>(.*?)</section>', source, re.S)]
        chapter['lessons'].append({'id': code, 'title': title, 'level': level,
                                    'path': path.relative_to(ROOT).as_posix(), 'sections': sections})
    return chapters


ICONS = {
    'menu': '<path d="M4 6h16M4 12h16M4 18h16"/>',
    'search': '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    'user': '<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
    'close': '<path d="m6 6 12 12M6 18 18 6"/>',
}


def icon(name):
    return f'<svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>'


def global_links(prefix, active):
    pages = [('home', 'index.html', 'Accueil'), ('catalog', 'chapitres.html', 'Chapitres'),
             ('method', 'strategie/reussir_lannee.html', 'Méthode'), ('progress', 'progres.html', 'Mes progrès')]
    return ''.join(f'<a href="{prefix}{url}"' + (' aria-current="page"' if key == active else '') + f'>{name}</a>'
                   for key, url, name in pages)


def sidebar(chapters, prefix, active, current=None):
    text = f'<div class="site-side-mobile">{global_links(prefix, active)}</div>'
    if active == 'method':
        text += '<p class="site-side-label">Prendre de bonnes habitudes</p>'
        for id_, name in [('depart', 'Bien démarrer'), ('science', 'Comprendre l’apprentissage'),
                          ('methode', 'Travailler en autonomie'), ('semaine', 'Organiser ma semaine'),
                          ('bloque', 'Quand je bloque'), ('chatgpt', 'Utiliser une IA'), ('abonnement', 'Choisir son outil IA')]:
            text += f'<a class="site-side-link" href="#{id_}">{name}</a>'
    else:
        text += '<p class="site-side-label">Le programme · Première et Terminale</p>'
        for c in chapters:
            opened = current and any(x['id'] == current['id'] for x in c['lessons'])
            text += f'<details class="site-side-chapter" data-chapter="{c["number"]}"' + (' open' if opened else '') + '>'
            pub = public(c['lessons'])
            badge = f'<span class="site-public site-public-{pub[0]}">{pub[1]}</span>' if pub[0] else ''
            text += f'<summary><span class="site-side-number">{c["number"]:02}</span><span class="site-side-titre">{esc(c["title"])}{badge}</span></summary>'
            if not c['lessons']:
                text += '<p class="site-soon">À venir</p>'
            for level, label in [('premiere', 'Programme de Première'), ('terminale', 'Programme de Terminale')]:
                lessons = [x for x in c['lessons'] if x['level'] == level]
                if lessons:
                    text += f'<div class="site-side-group">{label}</div>'
                for lesson in lessons:
                    attr = ' aria-current="page"' if current and lesson['id'] == current['id'] else ''
                    text += f'<a class="site-side-link" href="{prefix}{lesson["path"]}"{attr}><span>{lesson["id"]}</span><span>{esc(lesson["title"])}</span></a>'
            text += '</details>'
    return text + f'<div class="site-side-footer">Un peu, régulièrement.<br>Un chapitre à la fois.<a href="{prefix}progres.html#sauvegarde">Sauvegarder mon suivi</a></div>'


def shell(chapters, prefix, active, current=None):
    return f'''<a class="site-skip" href="#site-main">Aller au contenu</a>
<div class="site-header" role="banner">
 <button class="site-icon site-menu-button" id="site-menu" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="site-sidebar">{icon('menu')}</button>
 <a class="site-brand" href="{prefix}index.html">Réussite Spé Maths</a>
 <nav class="site-global" aria-label="Navigation principale">{global_links(prefix, active)}</nav>
 <div class="site-actions"><button class="site-search-trigger" id="site-search-open" aria-label="Rechercher une notion">{icon('search')}<span>Rechercher</span><kbd>/</kbd></button>
 <a class="site-icon" href="{prefix}progres.html#sauvegarde" aria-label="Mon suivi sur cet appareil" title="Mon suivi sur cet appareil">{icon('user')}</a></div>
</div>
<button class="site-shade" id="site-shade" aria-label="Fermer le menu" hidden tabindex="-1"></button>
<aside class="site-sidebar" id="site-sidebar" aria-label="{'Sommaire de la méthode' if active == 'method' else 'Programme et fiches'}">{sidebar(chapters, prefix, active, current)}</aside>
<dialog class="site-dialog" id="site-search-dialog" aria-labelledby="site-search-title">
 <div class="site-dialog-head"><h2 id="site-search-title">Une notion à retrouver ?</h2><button class="site-icon" id="site-search-close" aria-label="Fermer la recherche">{icon('close')}</button></div>
 <label for="site-search-input" class="site-eyebrow">Fiche, notion ou méthode</label>
 <input id="site-search-input" class="site-input" type="search" placeholder="Tangente, suites, récurrence…" autocomplete="off">
 <p class="site-announcement" id="site-search-count" role="status"></p><div class="site-search-results" id="site-search-results"></div>
</dialog>'''


def lesson_row(l, prefix=''):
    return f'<a class="site-lesson-row" href="{prefix}{l["path"]}" data-lesson="{l["id"]}" data-level="{l["level"]}"><span class="site-lesson-code">{l["id"]}</span><span class="site-lesson-name">{esc(l["title"])}</span><span class="site-lesson-state" data-state-for="{l["id"]}">À commencer</span><span aria-hidden="true">›</span></a>'


def hub_content(kind, chapters):
    if kind == 'home':
        return """<div class="site-eyebrow">Première et Terminale · Enseignement de spécialité · Programme 2019</div>
<h1>Réussir sa spé maths.</h1>
<p class="site-lead">Le cours, la méthode et des exercices qui se renouvellent, pour la Première et pour la Terminale.<br>Gratuit, sans compte, et utilisable sans connexion.</p>

<div class="site-hero"><div><div class="site-eyebrow" id="site-resume-label">Ta prochaine séance</div><h2 id="site-resume-title">Par quoi commence-t-on ?</h2><p id="site-resume-description">Choisis le chapitre que tu travailles en classe. Chaque parcours commence par les bases de Première avant d’aborder la Terminale.</p><div class="site-hero-actions"><a class="site-btn" id="site-resume-link" href="chapitres.html">Choisir mon chapitre <span aria-hidden="true">&#8594;</span></a><a href="strategie/reussir_lannee.html#depart" style="font-size:12px">Comment bien démarrer</a></div></div>
<div class="site-hero-art" aria-hidden="true"><svg viewBox="0 0 200 200" fill="none"><rect x="10" y="10" width="180" height="180" rx="90" fill="#e3ebfa"/><path d="M38 146H173M63 170V32" stroke="#a6bde5"/><path d="M40 144C80 144 95 134 114 110S150 65 164 40" stroke="#2563eb" stroke-width="3"/><path d="m86 146 60-80" stroke="#88a6d9" stroke-width="1.5" stroke-dasharray="4 5"/><circle cx="114" cy="110" r="5" fill="#2563eb"/><circle cx="63" cy="142" r="4" fill="#faf8f5" stroke="#2563eb" stroke-width="2"/><text x="168" y="166" fill="#8299bd" font-family="Georgia" font-size="14">x</text><text x="45" y="37" fill="#8299bd" font-family="Georgia" font-size="14">y</text></svg></div></div>

<div class="site-section-title"><h2>À travailler aujourd’hui</h2><a href="progres.html">Voir mon suivi &#8594;</a></div><div id="site-today" class="site-empty">Tes notions à revoir apparaîtront ici. Après une fiche, indique ce que tu souhaites retravailler.</div>

<div class="site-section-title"><h2>Comment ça marche</h2></div>
<p class="site-lead" style="font-size:15px;max-width:70ch">Chaque chapitre est traité en deux temps. C’est la seule chose à comprendre pour s’en servir.</p>
<div class="site-grid site-steps">
  <div class="site-tile"><span class="site-step-num">1</span><span class="site-eyebrow">En Première</span><h3>Poser les bases</h3><p>Les fiches marquées <b>Première</b> couvrent le programme de l’année. En Terminale, ce sont exactement les notions à réactiver avant que le chapitre commence en classe.</p></div>
  <div class="site-tile"><span class="site-step-num">2</span><span class="site-eyebrow">En Terminale</span><h3>Aborder la nouveauté</h3><p>Les fiches marquées <b>Terminale</b> traitent ce qui est nouveau, en s’appuyant sur les bases du dessous. Chaque chapitre relie les deux, sans te faire repartir de zéro.</p></div>
</div>

<div class="site-section-title"><h2>Un exercice, tout de suite</h2></div>
<p class="site-lead" style="font-size:15px;max-width:70ch">Voici à quoi ressemble un exercice du site. Les nombres changent à chaque fois, et la correction est rédigée.</p>
<div class="site-tile site-demo">
  <p class="site-demo-statement" id="site-demo-statement"></p>
  <div class="site-demo-row">
    <label for="site-demo-answer" class="site-demo-label">Ta réponse</label>
    <input class="site-input site-demo-input" id="site-demo-answer" type="text" inputmode="text" autocomplete="off" placeholder="un nombre">
    <button class="site-btn" id="site-demo-check" type="button">Vérifier</button>
  </div>
  <p class="site-message" id="site-demo-feedback" role="status"></p>
  <div class="site-demo-actions">
    <button class="site-btn subtle" id="site-demo-solution" type="button">Voir la correction</button>
    <button class="site-btn subtle" id="site-demo-new" type="button">Nouvel exercice</button>
  </div>
  <div class="site-demo-solution" id="site-demo-solution-box" hidden></div>
  <p class="site-hint">Cet exercice vient de la fiche <a href="chapitres/02_produit_scalaire/2A_produit_scalaire_definitions.html">2A · Définitions du produit scalaire</a>. Chaque fiche en contient trois, de difficulté croissante, plus un QCM.</p>
</div>

<div class="site-section-title"><h2>Tout pour avancer</h2></div><div class="site-grid"><a class="site-tile" href="chapitres.html"><span class="site-eyebrow">Le programme</span><h3>Trouver mon chapitre</h3><p>Quinze chapitres, de la Première à la Terminale, avec cours, visualisations et exercices.</p><span class="site-tile-link">Explorer les chapitres &#8594;</span></a><a class="site-tile" href="strategie/reussir_lannee.html#semaine"><span class="site-eyebrow">La méthode</span><h3>Organiser ma séance</h3><p>Une routine simple, un minuteur et des conseils concrets pour travailler en autonomie.</p><span class="site-tile-link">Préparer ma séance &#8594;</span></a></div>

<div class="site-section-title"><h2>Ce que ce site ne fait pas</h2></div>
<div class="site-tile site-limits">
  <ul>
    <li><b>Il ne remplace pas le cours.</b> Il le prépare et le consolide. Ce que dit ton professeur prime toujours.</li>
    <li><b>Il ne corrige pas tes devoirs.</b> Les exercices sont engendrés par le site, avec leur correction.</li>
    <li><b>Il n’y a pas de compte.</b> Ton suivi reste dans ce navigateur, sur cet appareil. Personne d’autre n’y a accès, et rien n’est envoyé nulle part.</li>
  </ul>
</div>

<p class="site-hint"><span class="site-local-note" data-storage-note>Ton suivi reste dans ce navigateur, sur cet appareil.</span><a href="progres.html#sauvegarde">Garder une copie de mon suivi</a></p>"""
    if kind == 'catalog':
        content = '''<div class="site-eyebrow">Le programme à portée de main</div><h1>Chaque chapitre, pas à pas.</h1><p class="site-lead">Quinze chapitres, du second degré au calcul intégral. En Première, travaille les fiches de ton niveau ; en Terminale, commence par celles de Première du chapitre. L’ordre proposé n’est qu’une suggestion : suis celui de ton professeur.</p><div class="site-catalog-tools"><div class="site-filters" aria-label="Niveau des fiches"><button data-filter="all" aria-pressed="true">Tout</button><button data-filter="premiere" aria-pressed="false">Première</button><button data-filter="terminale" aria-pressed="false">Terminale</button></div><label class="site-input" style="padding:0;border:0"><span class="site-eyebrow">Rechercher un chapitre</span><input class="site-input" id="site-catalog-query" type="search" placeholder="Nom ou notion…"></label></div><p class="site-count" id="site-catalog-count" role="status"></p>'''
        for c in chapters:
            count = len(c['lessons'])
            content += f'<details class="site-chapter" id="ch{c["number"]}" data-catalog-chapter="{c["number"]}"><summary><span class="site-number">{c["number"]:02}</span><span class="site-chapter-title">{esc(c["title"])}<span class="site-chapter-meta">{(f'<b class="site-public site-public-{public(c["lessons"])[0]}">{public(c["lessons"])[1]}</b> · ' + str(count) + (" fiche" if count == 1 else " fiches")) if count else "À venir"}</span></span></summary><div class="site-chapter-content"><div class="site-chapter-intro"><p><strong>Au programme :</strong> {esc(c["goal"])}.</p><p><strong>Les bases utiles :</strong> {esc(c["prerequisites"])}.</p></div>'
            for level, title in [('premiere', 'Réactiver les bases · Première'), ('terminale', 'Approfondir · Terminale')]:
                rows = [x for x in c['lessons'] if x['level'] == level]
                if rows:
                    content += f'<div data-level-group="{level}"><h3>{title}</h3>' + ''.join(lesson_row(x) for x in rows) + '</div>'
            if not count:
                content += '<p class="site-soon">Les fiches de ce chapitre sont en préparation.</p>'
            content += '</div></details>'
        return content + '<p class="site-empty" id="site-catalog-empty" hidden>Aucune fiche ne correspond. Essaie une autre notion ou le filtre « Tout ».</p>'
    return '''<div class="site-eyebrow">Un peu plus à l’aise, chaque jour</div><h1>Mes progrès.</h1><p class="site-lead">Garde une trace de tes essais, repère les notions à revoir et prépare ta prochaine séance.</p>
<p class="site-local-note site-hint" data-storage-note>Enregistré dans ce navigateur, sur cet appareil.</p><p class="site-warning" id="site-file-warning" hidden>En ouverture directe de fichiers, le partage du suivi entre les pages dépend du navigateur. Pour un suivi commun fiable, utilise le site en ligne. Exporte régulièrement une copie.</p>
<div class="site-stats"><div class="site-stat"><strong id="site-stat-started">0</strong><span>fiches commencées</span></div><div class="site-stat"><strong id="site-stat-review">0</strong><span>notions à revoir</span></div><div class="site-stat"><strong id="site-stat-validated">0</strong><span>fiches validées par toi</span></div></div>
<div class="site-section-title"><h2>Mon parcours</h2><a href="chapitres.html">Tous les chapitres →</a></div><p class="site-hint">Lire une fiche ne la valide pas. Choisis « Validé » lorsque tu te sens capable de refaire les exercices sans aide.</p><div id="site-progress-list" class="site-progress-list"></div>
<section id="carnet"><div class="site-section-title"><h2>Mon carnet de travail</h2></div><form id="site-journal-form" class="site-tile"><div class="site-form-grid"><label>Fiche<select class="site-input" id="site-journal-lesson" required></select></label><label>Exercice<input class="site-input" id="site-journal-exercise" placeholder="Exercice 2, manuel p. 84…" maxlength="300" required></label><label>Résultat<select class="site-input" id="site-journal-result"><option value="ok">Réussi sans aide</option><option value="aide">Réussi avec aide</option><option value="ko">À revoir</option></select></label><label>Type d’erreur<select class="site-input" id="site-journal-error"><option value="">Aucune / non précisé</option><option>calcul</option><option>méthode</option><option>lecture d’énoncé</option><option>cours non su</option></select></label><label class="site-form-wide">Une note pour la prochaine fois<input class="site-input" id="site-journal-note" maxlength="1000" placeholder="La règle à retenir, ce qui m’a aidé…"></label></div><button class="site-btn" style="margin-top:18px" type="submit">Ajouter au carnet</button><p class="site-message" id="site-journal-message" role="status"></p></form><div id="site-journal-list"></div><button class="site-btn secondary" id="site-copy-report" type="button" style="margin-top:16px">Copier mon bilan pour un tuteur IA</button></section>
<section id="sauvegarde" class="site-backup"><h2>Mon suivi, sur cet appareil</h2><p class="site-lead">Aucun compte nécessaire. Ton suivi reste après la fermeture du navigateur, mais peut disparaître si ses données sont effacées. En navigation privée, il est temporaire.</p><p class="site-hint">Pour changer d’appareil ou de navigateur, exporte une copie puis importe-la sur l’autre appareil. Les sauvegardes sont fusionnées avec le suivi existant.</p><div class="site-backup-actions"><button class="site-btn secondary" id="site-export">Exporter mon suivi</button><button class="site-btn secondary" id="site-import-open">Importer une sauvegarde</button><input type="file" id="site-import-file" accept=".json,application/json" hidden></div><details><summary style="font-size:13px;min-height:44px;cursor:pointer">Importer un ancien carnet copié</summary><label for="site-import-text" class="site-hint">Colle le texte exporté depuis l’ancien guide.</label><textarea class="site-input" id="site-import-text" rows="4"></textarea><button class="site-btn subtle" id="site-import-text-button">Importer ce carnet</button></details><p class="site-message" id="site-backup-message" role="status"></p></section>'''


def build(only=None):
    chapters = catalog()
    css = (HERE / 'site.css').read_text()
    js = (HERE / 'site.js').read_text()
    lessons = [l for c in chapters for l in c['lessons']]
    targets = [(ROOT / l['path'], 'lesson', l) for l in lessons]
    targets += [(ROOT / 'strategie/reussir_lannee.html', 'method', None),
                (HERE / 'fiche_squelette.html', 'template', None)]
    for filename, kind in [('index.html', 'home'), ('chapitres.html', 'catalog'), ('progres.html', 'progress')]:
        targets.append((ROOT / filename, kind, None))
    for path, kind, lesson in targets:
        if only and path.relative_to(ROOT).as_posix() not in only:
            continue
        prefix = '../' * len(path.relative_to(ROOT).parts[:-1])
        active = 'catalog' if kind in ('lesson', 'template') else kind
        if kind in ('home', 'catalog', 'progress'):
            title = {'home': 'Accueil', 'catalog': 'Chapitres', 'progress': 'Mes progrès'}[kind]
            source = f'<!DOCTYPE html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="description" content="Cours et exercices interactifs de spécialité mathématiques, en Première et en Terminale, avec un suivi personnel sans compte.">\n<title>{title} · Réussite Spé Maths</title>\n</head>\n<body>\n<main id="site-main" tabindex="-1">{hub_content(kind, chapters)}</main>\n<footer>Réussite Spé Maths · Spécialité mathématiques, Première et Terminale · Programme 2019<br>Les fiches fonctionnent hors connexion avec le dossier MathJax local.</footer>\n</body>\n</html>\n'
        else:
            source = strip_blocks(path.read_text())
            # One-time migration of the guide: the original journal is imported
            # by site.js; its legacy key remains intact as a recovery copy.
            if kind == 'method':
                source = re.sub(r'(<section id="carnet">).*?</section>', r'\1<h2>Ton carnet a sa propre page</h2><p>Retrouve tes séances et ton suivi dans <a href="../progres.html#carnet">Mes progrès</a>. Les entrées enregistrées dans ce navigateur sont reprises automatiquement.</p></section>', source, flags=re.S)
                source = re.sub(r'  // ---------- Carnet de suivi ----------.*?(?=\n\}\)\(\);\n</script>)', '', source, flags=re.S)
                source = source.replace('>Abonnement ?</a>', '>Choisir son outil IA</a>').replace('<h2>Faut-il un abonnement ?</h2>', '<h2>Choisir son outil IA</h2>')
                source = source.replace('>Carnet de suivi</a>', '>Mon carnet</a>')
            source = re.sub(r'<main(?: id="site-main" tabindex="-1")?>', '<main id="site-main" tabindex="-1">', source, count=1)
        classes = 'site-with-sidebar' + (' site-hub' if kind in ('home', 'catalog', 'progress') else '') + (' site-guide' if kind == 'method' else '')
        source = re.sub(r'<body[^>]*>', f'<body class="{classes}">', source, count=1)
        source = source.replace('</head>', block('STYLE', '<style>\n' + css + '\n</style>') + '\n</head>')
        source = source.replace(f'<body class="{classes}">', f'<body class="{classes}">\n' + block('SHELL', shell(chapters, prefix, active, lesson)), 1)
        if lesson:
            chapter = next(c for c in chapters if lesson in c['lessons'])
            crumbs = f'<div class="site-breadcrumb"><button class="site-chapter-button" data-open-program>Chapitre {chapter["number"]} · Voir les fiches ↓</button><span class="site-desktop-crumb"><a href="{prefix}chapitres.html">Chapitres</a> › <a href="{prefix}chapitres.html#ch{chapter["number"]}">{esc(chapter["title"])}</a> › {esc(lesson["title"])}</span></div>'
            source = source.replace('<header>', block('CRUMBS', crumbs) + '\n<header>', 1)
            tools = '<div class="site-lesson-tools"><span class="site-local-note" data-storage-note>Suivi enregistré sur cet appareil</span><label for="site-lesson-status">Cette fiche : <select id="site-lesson-status"><option value="started">En cours</option><option value="review">À revoir</option><option value="validated">Validé par moi</option></select></label></div>'
            source = source.replace('<main id="site-main" tabindex="-1">', '<main id="site-main" tabindex="-1">\n' + block('TOOLS', tools), 1)
            index = lessons.index(lesson)
            previous = lessons[index - 1] if index else None
            following = lessons[index + 1] if index + 1 < len(lessons) else None
            pager = '<div class="site-pager">'
            pager += f'<a href="{prefix}{previous["path"] if previous else "chapitres.html"}"><small>← {"Fiche précédente" if previous else "Le programme"}</small><strong>{esc(previous["title"]) if previous else "Tous les chapitres"}</strong></a>'
            label = 'Chapitre suivant' if following and re.match(r'\d+', following['id'])[0] != str(chapter['number']) else 'Continuer'
            pager += f'<a href="{prefix}{following["path"] if following else "chapitres.html"}"><small>{label if following else "Parcours terminé"} →</small><strong>{esc(following["title"]) if following else "Revenir au programme"}</strong></a></div><a class="site-page-top" href="#site-main">↑ Haut de la fiche</a>'
            source = source.replace('</main>', block('PAGER', pager) + '\n</main>', 1)
        config = json.dumps({'version': 1, 'kind': kind, 'prefix': prefix, 'current': lesson['id'] if lesson else None, 'chapters': chapters}, ensure_ascii=False).replace('</', '<\\/')
        source = source.replace('</body>', block('SIGN', signature()) + '\n</body>', 1)
        source = source.replace('</body>', block('SCRIPT', f'<script id="site-config" type="application/json">{config}</script>\n<script>\n{js}\n</script>') + '\n</body>')
        if not path.exists() or source != path.read_text():
            path.write_text(source)
    if only:
        print(f'Interface intégrée aux {len(only)} chemins sélectionnés ; catalogue de {len(lessons)} fiches.')
    else:
        print(f'Interface intégrée : {len(lessons)} fiches, guide, squelette et 3 pages principales.')


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--only', nargs='+', help='Ne générer que ces chemins relatifs (travail parallèle).')
    build(parser.parse_args().only)
