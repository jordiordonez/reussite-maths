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

# Mesure d'audience (facultative). Code du compte GoatCounter : 'reussite-maths'
# donne https://reussite-maths.goatcounter.com. Vide = aucune mesure, et les
# pages ne font alors aucune requête réseau. GoatCounter ne pose pas de cookie
# et ne conserve pas l'adresse IP. Le script n'est chargé que depuis le site
# hébergé (jamais en file:// ni en local) : les fiches restent hors connexion.
GOATCOUNTER = 'reussite-maths'


def analytics_snippet():
    if not GOATCOUNTER:
        return ''
    endpoint = f'https://{GOATCOUNTER}.goatcounter.com/count'
    return ('<script>\n'
            "if (/^https?:$/.test(location.protocol) && !/^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname)) {\n"
            "  var gc = document.createElement('script'); gc.async = true; gc.src = 'https://gc.zgo.at/count.js';\n"
            f"  gc.setAttribute('data-goatcounter', '{endpoint}'); document.head.appendChild(gc);\n"
            '}\n</script>')


def support_text(text):
    """Adapte la page « Offrir un café » à la présence d'une mesure d'audience."""
    if not GOATCOUNTER:
        return text
    return text.replace(
        '<b>Ce site ne collecte rien.</b> Ni compte, ni traçage, ni formulaire. Votre suivi de travail reste dans votre navigateur et ne m’est jamais transmis.',
        '<b>Ce site ne collecte aucune donnée personnelle.</b> Ni compte, ni cookie, ni formulaire. Votre suivi de travail reste dans votre navigateur et ne m’est jamais transmis. '
        'Une mesure d’audience (GoatCounter) compte les pages vues, sans cookie et sans conserver l’adresse IP : je sais combien de fois une fiche est ouverte, jamais par qui.')


# ---------------------------------------------------------------------------
# Référencement. Tout est généré ici : ne pas éditer les balises à la main.
# Adresse publique du site (GitHub Pages). Sert aux liens canoniques, à
# Open Graph et au sitemap ; les liens de navigation restent relatifs.
SITE_URL = 'https://jordiordonez.github.io/reussite-maths/'
SITE_NAME = 'Réussite Spé Maths'
AUTHOR = 'Jordi Ordóñez Adellach'
# Image d'aperçu (1200 × 630) pour les partages. Source : outils/og_image.html,
# capture : node outils/og_image.cjs (Playwright). Fichier : og-image.png.
OG_IMAGE = 'og-image.png'
OG_IMAGE_ALT = 'Réussite Spé Maths : fiches interactives de spécialité mathématiques, Première et Terminale'
# Code de validation de Google Search Console (méthode « Balise HTML ») :
# coller ici la valeur de content="…", puis régénérer. Vide = pas de balise.
GOOGLE_SITE_VERIFICATION = ''

# Une description par fiche, écrite à partir de son contenu réel (140–160
# caractères). Une fiche nouvelle sans entrée reçoit une description
# construite depuis ses titres de cours ; mieux vaut en écrire une ici.
DESCRIPTIONS = {
    '1A': 'Second degré en Première : formes développée, canonique et factorisée, discriminant, racines, signe, somme et produit. Cours, exercices corrigés et QCM.',
    '2A': 'Produit scalaire en Première : projection orthogonale, cosinus, coordonnées, norme et orthogonalité. Cours, figure à manipuler, exercices corrigés et QCM.',
    '2B': "Applications du produit scalaire en Première : formule d'Al-Kashi, polarisation, cercle de diamètre [AB], choix de la méthode. Exercices corrigés et QCM.",
    '2C': 'Géométrie repérée en Première : vecteur normal, équation cartésienne de droite, projeté orthogonal, distance, cercles et paraboles. Exercices corrigés.',
    '2D': "Produit scalaire dans l'espace en Terminale : orthogonalité, vecteur normal, équation de plan, représentation paramétrique, projeté et distances.",
    '3A': 'Suites en Première : génération explicite, par récurrence ou par algorithme, représentation graphique et sens de variation. Cours, exercices et QCM.',
    '3B': 'Suites arithmétiques et géométriques en Première : terme général, sommes, sens de variation et modélisation. Cours, exercices qui se renouvellent et QCM.',
    '3C': 'Suites en Terminale : raisonnement par récurrence, limites, formes indéterminées, théorème des gendarmes, suites monotones et convergence. Exercices et QCM.',
    '4A': 'Nombre dérivé et tangente en Première : taux de variation, nombre dérivé, tangente limite des sécantes et son équation. Figure à manipuler, exercices, QCM.',
    '4B': 'Calcul de dérivées en Première : dérivées de référence, somme, produit, inverse, quotient et g(ax+b), avec les démonstrations. Exercices corrigés et QCM.',
    '4C': 'Variations et extremums en Première : signe de la dérivée, tableau de variations, extremum local, optimisation et position de courbes. Exercices et QCM.',
    '4D': "Dérivée d'une fonction composée en Terminale : composer v∘u, ensemble de définition, formule de dérivation, cas usuels et étude de fonction. Exercices.",
    '4E': "Convexité en Terminale : dérivée seconde, fonction convexe ou concave, caractérisations, point d'inflexion et inégalités. Cours, exercices corrigés et QCM.",
    '5A': 'Fonctions de référence en Première : carré, cube, inverse, racine carrée, valeur absolue, exponentielle, parité et lecture graphique. Exercices et QCM.',
    '5B': 'Limites de fonctions en Terminale : asymptotes, opérations sur les limites, formes indéterminées, comparaison et croissances comparées. Exercices et QCM.',
    '5C': 'Continuité en Terminale : fonction continue, théorème des valeurs intermédiaires, corollaire de la bijection, dichotomie et rédaction type. Exercices, QCM.',
    '6A': 'Fonction exponentielle en Première : f′ = f, relation fonctionnelle, nombre e, variations, fonctions e^(kt) et modélisation. Cours, exercices corrigés et QCM.',
    '6B': 'Exponentielle en Terminale : équations, inéquations, limites, croissances comparées, dérivée de e^u et étude complète de fonction. Exercices corrigés et QCM.',
    '6C': 'Logarithme népérien en Terminale : définition, propriétés algébriques, dérivée, limites, croissances comparées et dérivée de ln(u). Exercices corrigés et QCM.',
    '7A': 'Calcul vectoriel dans le plan en Première : relation de Chasles, colinéarité, déterminant, base, repère et coordonnées. Cours, exercices corrigés et QCM.',
    '7B': "Vecteurs de l'espace en Terminale : combinaisons linéaires, colinéarité, coplanarité, bases et repères de l'espace. Cours, exercices corrigés et QCM.",
    '7C': "Droites et plans de l'espace en Terminale : positions relatives de deux droites, d'une droite et d'un plan, de deux plans, parallélisme. Exercices et QCM.",
    '8A': 'Probabilités conditionnelles en Première : arbres pondérés, formule des probabilités totales, inversion du conditionnement et indépendance. Exercices, QCM.',
    '8B': 'Variables aléatoires en Première : loi de probabilité, espérance, variance, écart type, gain et jeu équitable. Cours, exercices qui se renouvellent et QCM.',
    '8C': "Épreuves indépendantes en Terminale : succession d'épreuves, épreuve et schéma de Bernoulli, chemins d'un arbre, « au moins un ». Exercices corrigés et QCM.",
    '9A': 'Dénombrement en Terminale : principes additif et multiplicatif, k-uplets, permutations, combinaisons, coefficients binomiaux et triangle de Pascal.',
    '10A': 'Loi binomiale en Terminale : probabilité de k succès, probabilités cumulées, espérance, variance, seuils, intervalles et simulation. Exercices corrigés, QCM.',
    '11A': 'Cercle trigonométrique en Première : radians, cosinus et sinus, valeurs remarquables, angles associés, parité et périodicité. Exercices corrigés et QCM.',
    '11B': 'Fonctions trigonométriques en Terminale : dérivées de sin et cos, variations, limites en 0, équations et inéquations, optimisation. Exercices et QCM.',
    '12A': 'Primitives en Terminale : définition, primitives de référence, formes composées u′×(v′∘u), primitive passant par un point. Cours, exercices corrigés et QCM.',
    '12B': "Équations différentielles en Terminale : y′ = ay, y′ = ay + b, condition initiale, allure des courbes, modélisation et méthode d'Euler. Exercices et QCM.",
    '13A': 'Calcul intégral en Terminale : intégrale et aire, lien avec les primitives, propriétés, encadrement, aire entre deux courbes et valeur moyenne. Exercices.',
    '13B': "Intégration par parties en Terminale : choix du facteur à dériver, suites d'intégrales, méthodes des rectangles, des milieux et des trapèzes. Exercices, QCM.",
    '14A': "Sommes de variables aléatoires en Terminale : linéarité de l'espérance, variance et indépendance, loi binomiale, échantillon et moyenne. Exercices et QCM.",
    '14B': "Loi des grands nombres en Terminale : inégalité de Bienaymé-Tchebychev, inégalité de concentration, taille d'échantillon. Cours, exercices corrigés et QCM.",
    '15A': 'Python en spé maths : variables, conditions, boucles, fonctions et listes (extension, compréhension, indices, parcours). Cours, exercices corrigés et QCM.',
    '15B': 'Algorithmes du programme de spé maths : seuil, dichotomie, Newton, Euler, rectangles, simulation et marche aléatoire, en Python. Exercices corrigés et QCM.',
}

LEVEL_NAMES = {'premiere': 'Première', 'terminale': 'Terminale'}


def page_url(rel):
    """Adresse absolue d'une page, à partir de son chemin relatif à la racine."""
    return SITE_URL if rel == 'index.html' else SITE_URL + rel


def lesson_description(lesson, chapter, source):
    if lesson['id'] in DESCRIPTIONS:
        return DESCRIPTIONS[lesson['id']]
    cours = re.search(r'<section\b[^>]*id="cours"[^>]*>(.*?)</section>', source, re.S)
    points = [re.sub(r'^\s*\d+\.?\s*', '', plain(h)) for h in re.findall(r'<h3[^>]*>(.*?)</h3>', cours[1] if cours else '', re.S)]
    text = f'{lesson["title"]} en {LEVEL_NAMES[lesson["level"]]} ({chapter["title"]}) : ' + ', '.join(points)
    return (text[:150].rsplit(' ', 1)[0].rstrip(',;:') + '…') if len(text) > 155 else text


def hub_description(kind, chapters):
    count = sum(len(c['lessons']) for c in chapters)
    return {
        'home': f'{SITE_NAME} : {count} fiches interactives de spécialité mathématiques en Première et Terminale, programme 2019. Cours, exercices corrigés et QCM, sans compte.',
        'catalog': f'Les {len(chapters)} chapitres de spé maths, du second degré à l’algorithmique : fiches de Première à réviser puis de Terminale, avec cours, exercices et QCM.',
        'progress': 'Mes progrès : fiches commencées, notions à revoir, carnet de travail et export du suivi de spé maths, enregistrés dans le navigateur, sans créer de compte.',
        'method': 'Réussir l’année en spé maths : ce que dit la recherche sur l’apprentissage, semaine type, que faire quand on bloque, prompts pour utiliser une IA comme tuteur.',
    }[kind]


def json_ld(data):
    text = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    return f'<script type="application/ld+json">{text}</script>'


def structured_data(kind, chapters, lesson=None, chapter=None, description=''):
    if kind == 'home':
        levels = ['Première', 'Terminale']
        return json_ld({'@context': 'https://schema.org', '@graph': [
            {'@type': 'WebSite', '@id': SITE_URL + '#site', 'url': SITE_URL, 'name': SITE_NAME, 'inLanguage': 'fr'},
            {'@type': 'LearningResource', '@id': SITE_URL + '#ressource', 'url': SITE_URL, 'name': SITE_NAME,
             'description': description, 'inLanguage': 'fr', 'isPartOf': {'@id': SITE_URL + '#site'},
             'learningResourceType': ['Cours', 'Exercices', 'QCM', 'Visualisation interactive'],
             'educationalLevel': levels,
             'audience': {'@type': 'EducationalAudience', 'educationalRole': 'student'},
             'about': 'Enseignement de spécialité mathématiques, voie générale, programmes officiels de 2019',
             'teaches': [c['title'] for c in chapters],
             'isAccessibleForFree': True,
             'license': 'https://creativecommons.org/licenses/by-sa/4.0/',
             'author': {'@type': 'Person', '@id': 'https://www.joasolucions.com/es/sobre#jordi-ordonez', 'url': 'https://www.joasolucions.com/es/sobre', 'name': AUTHOR, 'jobTitle': 'Mathématicien, enseignant'}},
        ]})
    if kind == 'lesson':
        crumbs = [('Accueil', SITE_URL), ('Chapitres', page_url('chapitres.html')),
                  (chapter['title'], page_url('chapitres.html') + f'#ch{chapter["number"]}'),
                  (f'{lesson["id"]} · {lesson["title"]}', page_url(lesson['path']))]
        return json_ld({'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': i, 'name': name, 'item': url} for i, (name, url) in enumerate(crumbs, 1)]})
    return ''


def meta_block(rel, title, description, og_type='website', extra=''):
    """Balises de tête : description, canonique, Open Graph, Twitter."""
    url = page_url(rel)
    image = SITE_URL + OG_IMAGE
    tags = [f'<meta name="description" content="{esc(description)}">',
            f'<link rel="canonical" href="{url}">',
            f'<meta property="og:type" content="{og_type}">',
            f'<meta property="og:site_name" content="{SITE_NAME}">',
            f'<meta property="og:title" content="{esc(title)}">',
            f'<meta property="og:description" content="{esc(description)}">',
            f'<meta property="og:url" content="{url}">',
            f'<meta property="og:image" content="{image}">',
            '<meta property="og:image:width" content="1200">',
            '<meta property="og:image:height" content="630">',
            f'<meta property="og:image:alt" content="{esc(OG_IMAGE_ALT)}">',
            '<meta property="og:locale" content="fr_FR">',
            '<meta name="twitter:card" content="summary_large_image">',
            f'<meta name="twitter:title" content="{esc(title)}">',
            f'<meta name="twitter:description" content="{esc(description)}">',
            f'<meta name="twitter:image" content="{image}">']
    if rel == 'index.html' and GOOGLE_SITE_VERIFICATION:
        tags.insert(0, f'<meta name="google-site-verification" content="{esc(GOOGLE_SITE_VERIFICATION)}">')
    return block('META', '\n'.join(tags) + ('\n' + extra if extra else ''))


def last_modified(rels):
    """Date de dernière modification : celle du dernier commit, ou aujourd'hui
    si le fichier diffère de ce commit (ou si Git est indisponible)."""
    import datetime
    import subprocess
    today = datetime.date.today().isoformat()
    try:
        dirty = set(subprocess.run(['git', 'diff', '--name-only', 'HEAD', '--', *rels], cwd=ROOT,
                                   capture_output=True, text=True, check=True).stdout.split('\n'))
    except (OSError, subprocess.CalledProcessError):
        return {rel: today for rel in rels}
    dates = {}
    for rel in rels:
        if rel in dirty:
            dates[rel] = today
            continue
        out = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', rel], cwd=ROOT, capture_output=True, text=True).stdout.strip()
        dates[rel] = out or today
    return dates


def write_sitemap(lessons):
    """sitemap.xml : pages principales et fiches. Ni redirections, ni copie
    personnelle du guide, ni page de soutien."""
    rels = ['index.html', 'chapitres.html', 'strategie/reussir_lannee.html', 'progres.html'] + [l['path'] for l in lessons]
    dates = last_modified(rels)
    rows = ''.join(f'  <url><loc>{esc(page_url(rel))}</loc><lastmod>{dates[rel]}</lastmod></url>\n' for rel in rels)
    text = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{rows}</urlset>\n'
    path = ROOT / 'sitemap.xml'
    if not path.exists() or path.read_text() != text:
        path.write_text(text)
    return len(rels)


def plain(value):
    return html.unescape(re.sub(r'<[^>]+>', '', value)).strip()


def esc(value):
    return html.escape(str(value), quote=True)


def signature(prefix=''):
    return ('<div class="site-sign">© 2026 '
            '<a href="https://joasolucions.com" target="_blank" rel="noopener noreferrer">'
            'Solucions Digitals JOA</a>'
            ' · Contenu pédagogique sous licence CC BY-SA 4.0'
            f' · <a href="{prefix}soutien.html">Offrir un café</a></div>')


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
        content = '''<div class="site-eyebrow">Le programme à portée de main</div><h1>Chaque chapitre, pas à pas.</h1><p class="site-lead">Quinze chapitres, du second degré à l’algorithmique. En Première, travaille les fiches de ton niveau ; en Terminale, commence par celles de Première du chapitre. L’ordre proposé n’est qu’une suggestion : suis celui de ton professeur.</p><div class="site-catalog-tools"><div class="site-filters" aria-label="Niveau des fiches"><button data-filter="all" aria-pressed="true">Tout</button><button data-filter="premiere" aria-pressed="false">Première</button><button data-filter="terminale" aria-pressed="false">Terminale</button></div><label class="site-input" style="padding:0;border:0"><span class="site-eyebrow">Rechercher un chapitre</span><input class="site-input" id="site-catalog-query" type="search" placeholder="Nom ou notion…"></label></div><p class="site-count" id="site-catalog-count" role="status"></p>'''
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
    if kind == 'support':
        return support_text("""<div class="site-eyebrow">Facultatif, et sans conséquence</div>
<h1>Offrir un café.</h1>
<p class="site-lead">Ce site est gratuit et le restera. Il n’y a rien à débloquer, rien à payer, aucun compte à créer.</p>

<div class="site-tile" style="max-width:66ch">
  <p>Si ce travail vous a été utile et que vous souhaitez faire un geste, vous pouvez m’offrir un café. C’est un remerciement, rien de plus : cela ne finance aucun projet, n’ouvre aucun accès particulier et ne change rien au site.</p>
  <p><b>Cette page s’adresse aux adultes</b>, parents ou enseignants. Si vous êtes élève, ne faites rien : le site est fait pour vous et il est gratuit.</p>
  <p style="margin-top:20px"><a class="site-btn" href="https://www.paypal.com/donate/?business=W2ARKKHJMGEN8&amp;item_name=Un+caf%C3%A9+pour+R%C3%A9ussite+Sp%C3%A9+Maths&amp;currency_code=EUR&amp;locale.x=fr_FR" rel="noopener noreferrer" target="_blank" id="site-tip-link">Offrir un café <span aria-hidden="true">&#8594;</span></a></p>
  <p class="site-hint">Le paiement se fait sur PayPal, hors de ce site.</p>
</div>

<div class="site-section-title"><h2>Ce que je vois, et ce que j’en fais</h2></div>
<div class="site-tile" style="max-width:66ch">
  <ul>
    <li><b>Ce site ne collecte rien.</b> Ni compte, ni traçage, ni formulaire. Votre suivi de travail reste dans votre navigateur et ne m’est jamais transmis.</li>
    <li><b>PayPal, lui, me communique votre nom et votre adresse électronique</b>, ainsi que le montant et la date. C’est le fonctionnement normal d’un paiement.</li>
    <li><b>Je m’en sers uniquement pour vous remercier</b>, si vous avez laissé un message. Aucune liste de diffusion, aucune sollicitation ultérieure, aucune transmission à qui que ce soit.</li>
  </ul>
</div>

<div class="site-section-title"><h2>Pour situer</h2></div>
<div class="site-tile" style="max-width:66ch">
  <ul>
    <li>Le contenu reste sous <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr" rel="noopener noreferrer" target="_blank">licence CC BY-SA 4.0</a> : libre de réutilisation, y compris modifiée.</li>
    <li>Les programmes officiels reproduits sont des actes publics, librement reproductibles.</li>
    <li>Ce geste est personnel et n’a pas de rapport avec une prestation professionnelle.</li>
  </ul>
</div>

<p class="site-hint"><a href="index.html">&#8592; Revenir à l’accueil</a></p>""")
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
    for filename, kind in [('index.html', 'home'), ('chapitres.html', 'catalog'), ('progres.html', 'progress'), ('soutien.html', 'support')]:
        targets.append((ROOT / filename, kind, None))
    descriptions = {}
    for path, kind, lesson in targets:
        if only and path.relative_to(ROOT).as_posix() not in only:
            continue
        prefix = '../' * len(path.relative_to(ROOT).parts[:-1])
        active = 'catalog' if kind in ('lesson', 'template') else kind
        if kind in ('home', 'catalog', 'progress', 'support'):
            title = {'home': 'Accueil', 'catalog': 'Chapitres', 'progress': 'Mes progrès', 'support': 'Offrir un café'}[kind]
            # La page de soutien garde sa tête d'origine : ni balises de partage, ni sitemap.
            head = ('<meta name="description" content="Cours et exercices interactifs de spécialité mathématiques, en Première et en Terminale, avec un suivi personnel sans compte.">'
                    if kind == 'support' else '')
            source = f'<!DOCTYPE html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n{head}' + ('\n' if head else '') + f'<title>{title} · Réussite Spé Maths</title>\n</head>\n<body>\n<main id="site-main" tabindex="-1">{hub_content(kind, chapters)}</main>\n<footer>Réussite Spé Maths · Spécialité mathématiques, Première et Terminale · Programme 2019<br>Les fiches fonctionnent hors connexion avec le dossier MathJax local.</footer>\n</body>\n</html>\n'
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
        rel = path.relative_to(ROOT).as_posix()
        meta = ''
        if lesson:
            chapter = next(c for c in chapters if lesson in c['lessons'])
            level = LEVEL_NAMES[lesson['level']]
            description = lesson_description(lesson, chapter, source)
            meta = meta_block(rel, f'{lesson["id"]} · {lesson["title"]} · {level}, spé maths', description, 'article',
                              structured_data('lesson', chapters, lesson, chapter))
        elif kind in ('home', 'catalog', 'progress', 'method'):
            description = hub_description(kind, chapters)
            title = {'home': f'{SITE_NAME} · Spécialité mathématiques, Première et Terminale',
                     'catalog': f'Les chapitres de spé maths, Première et Terminale · {SITE_NAME}',
                     'progress': f'Mes progrès · {SITE_NAME}',
                     'method': f'Réussir l’année en spé maths : la méthode · {SITE_NAME}'}[kind]
            meta = meta_block(rel, title, description, extra=structured_data(kind, chapters, description=description))
        elif kind == 'template':
            meta = block('META', '<meta name="robots" content="noindex">')
        if meta:
            descriptions.setdefault(re.search(r'<meta name="description" content="([^"]*)"', meta)[1] if 'name="description"' in meta else rel, []).append(rel)
            source = source.replace('</head>', meta + '\n</head>', 1)
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
        source = source.replace('</body>', block('SIGN', signature(prefix)) + '\n</body>', 1)
        source = source.replace('</body>', block('SCRIPT', f'<script id="site-config" type="application/json">{config}</script>\n<script>\n{js}\n</script>' + ('\n' + analytics_snippet() if GOATCOUNTER else '')) + '\n</body>')
        if not path.exists() or source != path.read_text():
            path.write_text(source)
    doubles = [rels for rels in descriptions.values() if len(rels) > 1]
    if doubles:
        raise SystemExit(f'Descriptions identiques : {doubles}')
    if not only:
        urls = write_sitemap(lessons)
        import sys
        sys.dont_write_bytecode = True
        import redirections  # les anciennes adresses suivent le même gabarit
        redirections.construire()
        print(f'sitemap.xml : {urls} adresses.')
    if only:
        print(f'Interface intégrée aux {len(only)} chemins sélectionnés ; catalogue de {len(lessons)} fiches.')
    else:
        print(f'Interface intégrée : {len(lessons)} fiches, guide, squelette et 3 pages principales.')


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--only', nargs='+', help='Ne générer que ces chemins relatifs (travail parallèle).')
    build(parser.parse_args().only)
