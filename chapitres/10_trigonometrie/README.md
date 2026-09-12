# Chapitre 10 — Fonctions trigonométriques

| Fiche | Niveau | Contenu | Prérequis |
|---|---|---|---|
| [10A — Cercle trigonométrique](10A_cercle_trigonometrique.html) | Première | Radians, degrés, longueurs d’arc, valeurs remarquables, angles associés, parité et périodicité | Triangle rectangle et Pythagore |
| [10B — Fonctions trigonométriques](10B_derivation_trigonometrie.html) | Terminale | Dérivées, variations, limites en zéro, équations et inéquations de cosinus, optimisation | 10A et chapitre 3 |

Chaque fiche comporte six points de cours, une méthode, des visualisations interactives, trois exercices génératifs corrigés et douze entrées de QCM (quatre par série).

10A démontre les trois valeurs exigibles : sin(π/4), cos(π/3) et sin(π/3). Les dérivées sont admises dans 10B ; les limites en zéro en sont déduites sans raisonnement circulaire. Les cas cos x = ±1 sur l’intervalle fermé [−π,π] sont traités séparément. La fonction tangente n’est pas présentée comme exigible.

Les réponses exactes utilisent des fractions d’entiers arbitrairement grands pour la comparaison. Une valeur voisine incorrecte n’est pas acceptée. Quand un coefficient de π est demandé, l’énoncé précise de saisir seulement ce coefficient. Quand un arrondi au millième est demandé, seule la valeur correctement arrondie ou une fraction équivalente convient. Décimales avec virgule et signe moins Unicode sont acceptés.

## Vérifications reproductibles

Rapports : [10A](../../revue/10A.md) et [10B](../../revue/10B.md).

```bash
python3 outils/chapitre10/test_math.py
python3 outils/check_fiche.py chapitres/10_trigonometrie/10A_cercle_trigonometrique.html
python3 outils/check_fiche.py chapitres/10_trigonometrie/10B_derivation_trigonometrie.html
python3 outils/check_site.py
python3 -m http.server 8765 --bind 127.0.0.1
# Dans un autre terminal avec Playwright disponible :
node outils/chapitre10/test_browser.cjs
```

`PLAYWRIGHT_CHANNEL=chrome` sélectionne Chrome. `SITE_TEST_URL` permet un autre serveur. Les captures sont dans `/tmp/chapitre10-qa`, modifiable avec `CH10_TEST_OUTPUT`.

L’oracle Python recalcule les réponses à partir des paramètres, indépendamment des tables JS : 600 tirages par exercice et 300 par entrée QCM, soit 3 600 exercices et 7 200 QCM. Les dérivées sont également vérifiées par différences finies. Les tests extraient les modèles des HTML réellement livrés et contrôlent les bons résultats, fractions équivalentes, mauvaises valeurs, signes et écarts jusqu’à 10⁻¹².

Les tests navigateur utilisent ce même oracle indépendant pour cliquer les vrais boutons. Ils couvrent les scores 4/4 et 0/4, les corrections, les régénérations, les projections du cercle, les dérivées/tangentes, les 25 niveaux des équations/inéquations (dont −1, 1 et les niveaux impossibles), les largeurs 320/390/768 px, la navigation et la progression locale. Ils vérifient aussi l’ouverture directe hors connexion et le fonctionnement sans MathJax ni stockage local.

## Génération ciblée pendant les relectures de Claude

Les sources sont dans `outils/chapitre10/`. `python3 outils/chapitre10/build.py` assemble uniquement ces deux nouvelles fiches depuis le squelette officiel. Toute correction manuelle du HTML doit être reportée dans les sources avant reconstruction.

```bash
python3 outils/build_site.py --only \
  chapitres/10_trigonometrie/10A_cercle_trigonometrique.html \
  chapitres/10_trigonometrie/10B_derivation_trigonometrie.html \
  index.html chapitres.html progres.html
```

Le sommaire et les nouvelles fiches disposent du catalogue actualisé. Les anciens menus embarqués et le lien suivant de 9A restent inchangés pour ne pas écrire dans des fiches en relecture. Une génération globale attendra la fin des travaux parallèles. Aucun commit de ce chapitre ne doit embarquer les fichiers de relecture de Claude.
