# Chapitre 7 — Probabilités conditionnelles et variables aléatoires

Découpage conforme au BO 2019 et à `ordre.md`. Travailler 7A puis 7B pour réactiver la Première ; passer ensuite à 7C en Terminale.

| Fiche | Niveau | Contenu | Prérequis |
|---|---|---|---|
| [7A](7A_probabilites_conditionnelles.html) | Première | Conditionnement, tableaux, arbres, probabilités totales, conditionnement inverse, indépendance | Fractions, probabilités de Seconde |
| [7B](7B_variables_aleatoires.html) | Première | Loi d’une variable aléatoire, événements, espérance, variance, écart type, jeu équitable | 7A, moyenne pondérée |
| [7C](7C_epreuves_independantes_bernoulli.html) | Terminale | Univers produit, épreuves indépendantes, Bernoulli, chemins et événements, au moins un succès | 7A et 7B |

Chaque fiche comprend cours, méthode, visualisation manipulable, trois exercices génératifs et douze générateurs de QCM. Les réponses attendues sont exactes : fractions équivalentes et décimaux exacts sont acceptés, les valeurs voisines fausses ne le sont pas.

La formule générale de la loi binomiale et sa démonstration sont réservées au chapitre 9, après le dénombrement du chapitre 8. La formule de König-Huygens n’est pas présentée comme exigible en Première.

## Vérification et maintenance

Le protocole est [revue/PROTOCOLE.md](../../revue/PROTOCOLE.md). Rapports propres à ce chapitre : [7A](../../revue/8A.md), [7B](../../revue/8B.md), [7C](../../revue/8C.md).

Depuis la racine du dépôt :

```bash
python3 outils/chapitre7/test_math.py
python3 outils/check_fiche.py chapitres/07_probabilites/*.html
python3 outils/check_site.py
python3 -m http.server 8765 --bind 127.0.0.1
# Dans un autre terminal, avec Playwright disponible :
node outils/chapitre7/test_browser.cjs
```

Si le navigateur Chromium de Playwright n’est pas installé, `PLAYWRIGHT_CHANNEL=chrome` utilise Chrome. Les captures sont placées dans `/tmp/chapitre7-qa` (surcharge possible avec `CH7_TEST_OUTPUT`).

L’oracle Python recalcule indépendamment les résultats à partir des données générées par les HTML livrés : 400 tirages par exercice et 200 par entrée de QCM, graine reproductible 20260912. Le test navigateur utilise aussi cet oracle pour choisir les réponses, sans se fier à l’index « correct » de la page.

Les sources d’assemblage sont dans `outils/chapitre7/`. `build.py` ne reconstruit que les trois fiches du chapitre 7, en réutilisant le squelette officiel. **Reporter toute correction des HTML dans ces sources avant de reconstruire**, sous peine de perdre cette correction.

Pendant les relectures parallèles des autres chapitres, intégrer la navigation uniquement aux nouveaux fichiers et aux pages d’entrée :

```bash
python3 outils/build_site.py --only \
  chapitres/08_probabilites/8A_probabilites_conditionnelles.html \
  chapitres/08_probabilites/8B_variables_aleatoires.html \
  chapitres/08_probabilites/8C_epreuves_independantes_bernoulli.html \
  index.html chapitres.html progres.html
```

Les anciennes fiches restent volontairement intactes : leurs menus embarqués et le lien suivant de 6C seront actualisés par une génération globale **une fois les relecteurs arrêtés**. Entre-temps, le chapitre 7 est accessible depuis l’accueil et le catalogue. Ne pas inclure les modifications des autres relecteurs dans un commit de ce chapitre.
