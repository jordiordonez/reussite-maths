# Chapitre 9 — Loi binomiale

| Fiche | Niveau | Contenu | Prérequis |
|---|---|---|---|
| [9A — Loi binomiale](9A_loi_binomiale.html) | Terminale | Modélisation, probabilité ponctuelle et cumulée, intervalles, seuils, espérance, variance, écart type, simulation | 7B, 7C et 8A |

La fiche relie explicitement la probabilité d’un chemin de 7C au nombre de chemins établi en 8A. Elle comprend la démonstration de la formule binomiale, ainsi que celles de l’espérance et de la variance. Les propriétés d’additivité utilisées sont énoncées et admises ici ; leur cadre général sera repris au chapitre 13.

## Contenu interactif

- Trois exercices génératifs : probabilité exacte de k succès ; intervalle avec arrondi au millième ; capacité minimale sous une contrainte de risque de dépassement.
- Seize générateurs de QCM, quatre questions à chaque série.
- Histogramme de la loi avec événement colorié, simulation d’un échantillon, moments théoriques et moyenne observée.
- Recherche exacte du premier seuil tel que P(X > k) ≤ α, contrôle de l’entier précédent et coloration de l’intervalle [0 ; k].
- Mode d’emploi des probabilités ponctuelles/cumulées sur calculatrice et construction d’une table de probabilités cumulées sur tableur, avec exemple de contrôle.

Le calcul rationnel utilise des entiers arbitrairement grands. Une réponse voisine fausse est refusée. Lorsqu’un arrondi est demandé, c’est la valeur correctement arrondie qui est attendue. Une probabilité positive très petite n’est pas affichée comme exactement nulle.

## Vérifications reproductibles

Rapport : [revue/9A.md](../../revue/9A.md). Les tests extraient le modèle du HTML livré. L’oracle Python calcule la loi par convolution de Bernoulli, indépendamment de la formule utilisant les coefficients binomiaux dans la fiche.

```bash
python3 outils/chapitre9/test_math.py
python3 outils/check_fiche.py chapitres/09_loi_binomiale/9A_loi_binomiale.html
python3 outils/check_site.py
python3 -m http.server 8765 --bind 127.0.0.1
# Dans un autre terminal, avec Playwright disponible :
node outils/chapitre9/test_browser.cjs
```

`PLAYWRIGHT_CHANNEL=chrome` utilise Chrome si nécessaire. `SITE_TEST_URL` choisit un autre serveur de test. Les captures vont dans `/tmp/chapitre9-qa` (ou `CH9_TEST_OUTPUT`). Le test vérifie les mobiles 390/320 px, l’ouverture directe hors connexion et le fonctionnement sans MathJax ni stockage.

## Génération ciblée pendant les relectures parallèles

Les sources sont dans `outils/chapitre9/`. `python3 outils/chapitre9/build.py` assemble uniquement 9A à partir du squelette officiel. Reporter toute correction du HTML dans ces sources avant de reconstruire.

```bash
python3 outils/build_site.py --only \
  chapitres/09_loi_binomiale/9A_loi_binomiale.html \
  index.html chapitres.html progres.html
```

Le catalogue donne accès à la fiche. Les anciens menus embarqués et le lien suivant de 8A seront actualisés par une génération globale une fois les relecteurs arrêtés. Ne pas inclure leur travail en cours dans un commit de ce chapitre.
