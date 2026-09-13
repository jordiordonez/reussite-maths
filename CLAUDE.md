# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Objet du projet

Matériel de soutien en mathématiques pour un élève de **Terminale, enseignement de spécialité mathématiques** (Éducation nationale française), ayant eu des difficultés en Première et gardant la spécialité. Le projet produit des fiches HTML autonomes (téléphone/iPad, hors connexion) et un guide de méthode.

Le dépôt est **public** : ne jamais y écrire de données personnelles (prénom, établissement, notes, résultats). La version personnalisée du guide reste locale et hors dépôt (voir plus bas).

Langue de travail : le contenu destiné à l'élève est en **français** (vocabulaire et notations du programme officiel français). Les échanges avec l'utilisateur peuvent être en français ou catalan.

## Structure du dossier

- `programmes/` : programmes officiels (Bulletin officiel) de spécialité maths Première et Terminale, en PDF et en résumés Markdown par chapitre. Toujours vérifier ici qu'une notion est bien au programme et dans quelle classe avant de la traiter.
- `ordre.md` : plan de l'année. Ordre des chapitres, contenu de Terminale, prérequis de Première à réactiver, dépendances et calendrier indicatif. **À consulter avant de produire un nouveau chapitre**, et à mettre à jour (colonne Statut) après chaque chapitre livré.
- `chapitres/NN_nom/` : un dossier par chapitre. Chaque chapitre est découpé en **partie Première** (révisable dès maintenant) et **partie Terminale**. Ordre de travail décidé : `01_produit_scalaire`, puis `02_suites`, puis les autres.
- `strategie/` : document HTML autonome « comment réussir l'année » (méthode d'apprentissage, usage de ChatGPT gratuit, gestion de la frustration).
- `outils/` : `prompt_fiche_html.md` (spécification des fiches), `prompts_assistant_ia.md` (source des prompts du guide, valables pour tout assistant IA), `check_fiche.py` (vérification automatique d'une fiche).
- `index.html` : accueil personnel généré ; `chapitres.html` : catalogue généré ; `progres.html` : suivi local généré. Après ajout d’une fiche, lancer `python3 outils/build_site.py` et mettre à jour le `README.md` de son chapitre. Ne pas éditer les pages générées à la main.
- `outils/site.css`, `outils/site.js`, `outils/build_site.py` : interface commune, navigation et stockage local. Les blocs `SITE:*` des HTML sont générés ; éditer leurs sources puis régénérer. Le contenu pédagogique hors de ces blocs est préservé. Les choix de produit sont documentés dans `newstyle.md`.
- `vendor/mathjax/` : MathJax 3 (build SVG autonome, polices incluses). Les fiches y font référence en chemin relatif `../../vendor/mathjax/tex-mml-svg.js`, jamais par CDN : c'est ce qui rend le hors connexion réel.
- `prompt_eines_html.docx` : spécification d'origine (en catalan) des fiches HTML interactives, non publiée. Son contenu est repris dans `outils/prompt_fiche_html.md`.

## Navigation gelée

Les adresses des fiches et des quatre pages principales, l'ordre et l'intitulé des destinations du bandeau, les ancres de section et la clé de stockage du suivi ne changent plus. Voir `CONTRAT_NAVIGATION.md`. Ne renommer ni déplacer aucune fiche publiée.

## Produire une nouvelle fiche

Partir de `outils/fiche_squelette.html` : le copier dans le dossier du chapitre et le remplir. Il fournit l'en-tête, la navigation, le design, le moteur d'exercices (`wireExercise`), le moteur de QCM (`qcmMap`, `build`) et le bloc responsive, tous testés. Ne jamais repartir d'une page vierge.

## Format des fiches HTML (obligatoire)

Chaque fiche est **un seul fichier `.html` autonome**, ouvrable hors connexion sur mobile, qui couvre une partie d'un chapitre (ou un chapitre entier si simple). Structure imposée, dans cet ordre :

1. En-tête avec titre serif aligné à gauche et sous-titre « Première · Mathématiques » ou « Terminale · Mathématiques ». L’interface commune désactive l’animation répétée du titre.
2. Navigation sticky entre sections.
3. Section « Cours » : 5 à 7 points clés avec exemples numériques concrets.
4. Section « Visualisation » : la visualisation la plus riche possible (sliders, zones colorées, grandeurs recalculées en temps réel), en SVG inline ou canvas.
5. Section « Exercices » : 3 exercices **génératifs** (nombres aléatoires, bouton « Nouvel exercice »), avec correction détaillée affichable.
6. Section « QCM » : 4 questions A/B/C/D, feedback immédiat vert/rouge, explication brève, score final, bouton « Nouveau QCM ».

Design : fond `#faf8f5`, cartes blanches à ombre douce, titres serif / corps sans-serif, accent bleu, corail pour les erreurs, vert pour les réussites, boutons ≥ 44 px, responsive portrait mobile.

Règles techniques :
- MathJax en local (`../../vendor/mathjax/tex-mml-svg.js`, jamais de CDN) ; configuration `svg: { fontCache: 'local' }`, indispensable car les fiches réaffichent des formules dynamiquement. Écrire `\binom{n}{k}`, jamais `C(n,k)`.
- Les réponses et explications du QCM vivent dans un objet JS (`qcmMap[i] = {correct, expl}`), **jamais** dans des attributs `onclick` ou `data-` : cela évite les erreurs de parsing et les QCM figés.
- Pas de dépendance autre que MathJax ; tout le CSS/JS est inline.

## Vérification d'une fiche

Il n'y a pas de build. Pour valider une fiche :

```bash
python3 outils/check_fiche.py chapitres/01_produit_scalaire/*.html   # structure + node --check sur les scripts
open chapitres/01_produit_scalaire/xx.html                            # ouvre dans le navigateur par défaut
```

Vérifier manuellement : rendu MathJax, sliders, régénération des exercices, QCM (aucune question figée, score affiché), affichage en largeur mobile (outils de développement du navigateur).

Après chaque ajout de fiche, lancer d’abord `python3 outils/build_site.py` pour
actualiser le catalogue et intégrer la navigation commune. Le navigateur n’a
pas besoin d’un serveur de build : les CSS/JS restent intégrés dans les HTML.
Le suivi utilise `localStorage` ; ne jamais ajouter de résultats personnels au
dépôt. Tests de navigation/suivi : `node outils/test_site.cjs` avec Playwright
disponible et le serveur local `python3 -m http.server 8765 --bind 127.0.0.1`.

## Principes pédagogiques à respecter

- Difficulté croissante à l'intérieur d'une fiche et d'une fiche à l'autre ; exercices d'abord proches du cours puis de plus en plus éloignés.
- Sessions courtes : chaque section doit être autosuffisante.
- Explications courtes (1 à 2 phrases) dans le feedback ; la correction complète est accessible mais repliée.
- Ne jamais dépasser le programme officiel de la classe concernée ; signaler explicitement ce qui relève de Première et ce qui relève de Terminale.

## Version personnalisée du guide

Le guide publié est anonyme. Pour en produire une copie portant le prénom de l'élève, hors dépôt :

```bash
bash outils/perso.sh          # écrit strategie/reussir_lannee_perso.html, ignoré par git
```

Ce fichier est régénéré à partir du guide public : le modifier directement n'a pas de sens, éditer `strategie/reussir_lannee.html` puis relancer le script.

## Publication

Le site est publié sur GitHub Pages depuis la branche `main`, à la racine. Toute fiche ajoutée doit être référencée dans le `README.md` de son chapitre ; lancer `outils/build_site.py` pour actualiser le catalogue et l’interface, puis vérifier avec `outils/check_fiche.py` avant l’envoi.
