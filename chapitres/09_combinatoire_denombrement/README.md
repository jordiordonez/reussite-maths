# Chapitre 8 — Combinatoire et dénombrement

Une fiche de Terminale, conformément à `ordre.md` et au BO 2019 :

| Fiche | Contenu | Prérequis |
|---|---|---|
| [8A — Combinatoire et dénombrement](8A_combinatoire_denombrement.html) | Principes additif et multiplicatif, listes, permutations, combinaisons, parties, coefficients binomiaux, triangle de Pascal | Dénombrement par arbre (Seconde/Première), chemins S/E de 7C |

Le cours distingue explicitement ordre, répétition et contraintes. Il comprend les trois démonstrations exigibles : somme des coefficients binomiaux par dénombrement ; relation de Pascal par dénombrement et par calcul. Les combinaisons avec répétitions ne sont pas présentées comme exigibles.

## Le lien entre les chapitres 7 et 9

7C a posé le schéma de Bernoulli. Ici, choisir les k positions des succès parmi n est mis en bijection avec les chemins à exactement k succès, dont le nombre est le coefficient binomial. La visualisation relie sous-ensemble, mot binaire et chemin S/E ; un QCM vérifie ce dénombrement. La probabilité générale et la loi binomiale restent au chapitre 9.

## Contenu interactif

- Trois exercices génératifs : identifiants avec répétitions ; attribution de postes distincts ; équipes contenant au moins un membre d’un atelier.
- Quinze générateurs de QCM, dont quatre sont tirés à chaque série.
- Explorateur des listes/groupes avec pagination, cases vides et impossibles ; codage d’une partie en chemin ; triangle de Pascal avec terme choisi et ses deux parents.
- Vérification exacte : aucune tolérance ne transforme un entier faux en bonne réponse. Les écritures numériquement équivalentes sont acceptées.

## Vérification reproductible

Rapport : [revue/9A.md](../../revue/9A.md). Les tests extraient le modèle du HTML livré. L’oracle Python compte indépendamment les objets au lieu de recopier les formules JavaScript.

```bash
python3 outils/chapitre8/test_math.py
python3 outils/check_fiche.py chapitres/09_combinatoire_denombrement/9A_combinatoire_denombrement.html
python3 outils/check_site.py
python3 -m http.server 8765 --bind 127.0.0.1
# Dans un autre terminal, avec Playwright disponible :
node outils/chapitre8/test_browser.cjs
```

Si nécessaire, `PLAYWRIGHT_CHANNEL=chrome` utilise Chrome au lieu du Chromium de Playwright. `SITE_TEST_URL` permet de choisir un autre serveur. Captures : `/tmp/chapitre8-qa` (ou `CH8_TEST_OUTPUT`). Le test navigateur couvre aussi l’ouverture `file://` hors connexion et le fonctionnement sans MathJax ni stockage.

## Maintenance sans conflit avec les relecteurs

Les sources sont dans `outils/chapitre8/`. `python3 outils/chapitre8/build.py` assemble uniquement 8A à partir du squelette officiel. Reporter toute correction du HTML dans ces sources avant de reconstruire la fiche.

Pendant les relectures parallèles, ne pas régénérer les autres fiches :

```bash
python3 outils/build_site.py --only \
  chapitres/09_combinatoire_denombrement/9A_combinatoire_denombrement.html \
  index.html chapitres.html progres.html
```

Le catalogue et les pages d’entrée donnent accès à 8A. Les menus embarqués des anciennes fiches et le lien suivant de 7C seront actualisés lors d’une génération globale, une fois les relecteurs arrêtés. Ne pas inclure leurs modifications dans un commit de ce chapitre.
