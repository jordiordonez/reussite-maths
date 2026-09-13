# Spé maths Terminale — fiches interactives et méthode

Ressources libres pour l'enseignement de spécialité mathématiques en Terminale générale (programme officiel français de 2019). Tout est en HTML autonome : les fiches s'ouvrent sur un téléphone ou un iPad, **sans connexion internet**, et s'enregistrent comme un simple fichier.

Le programme officiel prévoit que la Terminale consolide les acquis de Première. Le site suit cette logique : chaque chapitre est traité en deux étages, ce qui relève de la Première à réviser d'abord, puis ce qui relève de la Terminale.

👉 **[Ouvrir le site](https://jordiordonez.github.io/reussite-maths/)**

## Navigation et suivi personnel

Le site propose un accueil pour reprendre sa dernière fiche, un catalogue des
chapitres avec recherche et filtres Première/Terminale, le guide de méthode et une
page **Mes progrès**. Le programme reste accessible dans une colonne sur ordinateur
et dans le menu sur téléphone. Les fiches ont des liens précédent/suivant et une
navigation commune entre Cours, Méthode, Explorer, Exercices et QCM.

Les résultats d’exercices et de QCM, les états des fiches et le carnet sont
enregistrés dans le navigateur, **sans compte**. La lecture ne valide pas une
fiche : l’élève choisit lui-même de la marquer validée. L’ancien carnet du guide
est repris automatiquement et sa sauvegarde d’origine est conservée.

Depuis `progres.html`, exporter le suivi en JSON permet de conserver une copie
ou de le transférer sur un autre navigateur/appareil. L’import fusionne les
données. Le suivi peut disparaître si les données du site sont effacées ; en
navigation privée, il est temporaire. Un stockage partagé entre les fiches
ouvertes directement en `file://` dépend du navigateur : utiliser le site hébergé
pour un suivi commun fiable.

Les choix de navigation, de style et l’évolution envisagée vers des comptes et
une offre payante sont décrits dans [`newstyle.md`](newstyle.md).

## Ce que contient chaque fiche

Un fichier HTML unique, avec dans l'ordre :

1. **Cours** — la notion en 5 à 7 points, avec exemples numériques.
2. **Méthode** — les étapes de résolution par type d'exercice, et les erreurs fréquentes.
3. **Visualisation** — une figure manipulable (curseurs, points déplaçables) dont les grandeurs se recalculent en temps réel.
4. **Exercices** — trois exercices de difficulté croissante, dont les nombres changent à chaque clic sur « Nouvel exercice », avec correction rédigée.
5. **QCM** — quatre questions tirées dans une banque, feedback immédiat et score.

## Fiches disponibles

**Chapitre 1 — Produit scalaire**

| Fiche | Niveau | Contenu |
|---|---|---|
| 1A | Première | Définitions : projection, cosinus, coordonnées, norme, orthogonalité |
| 1B | Première | Applications : Al-Kashi, calcul par les normes, cercle de diamètre [AB] |
| 1C | Première | Géométrie repérée : vecteur normal, équation de droite, projeté, cercle |
| 1D | Terminale | Espace : orthogonalité, plans, droites, distances |

**Chapitre 2 — Suites**

| Fiche | Niveau | Contenu |
|---|---|---|
| 2A | Première | Génération (explicite, récurrence, algorithme) et sens de variation |
| 2B | Première | Suites arithmétiques et géométriques, sommes, modélisation |
| 2C | Terminale | Raisonnement par récurrence, limites, gendarmes, convergence |

**Chapitre 3 — Dérivation et convexité**

| Fiche | Niveau | Contenu |
|---|---|---|
| 3A | Première | Taux de variation, nombre dérivé, tangente et son équation |
| 3B | Première | Dérivées de référence, somme, produit, quotient, g(ax+b) |
| 3C | Première | Signe de la dérivée, variations, extremums, optimisation |
| 3D | Terminale | Dérivée d'une fonction composée |
| 3E | Terminale | Dérivée seconde, convexité, point d'inflexion |

**Chapitre 4 — Limites de fonctions et continuité**

| Fiche | Niveau | Contenu |
|---|---|---|
| 4A | Première | Fonctions de référence : courbes, variations, lecture graphique |
| 4B | Terminale | Limites, asymptotes, formes indéterminées, croissances comparées |
| 4C | Terminale | Continuité, théorème des valeurs intermédiaires, dichotomie |

**Chapitre 5 — Exponentielle et logarithme**

| Fiche | Niveau | Contenu |
|---|---|---|
| 5A | Première | Définition, propriétés algébriques, variations, modélisation |
| 5B | Terminale | Équations, dérivée de e^u, limites, étude complète de fonctions |
| 5C | Terminale | Logarithme népérien, propriétés, dérivée, limites, seuils |

**Chapitre 6 — Géométrie dans l'espace**

| Fiche | Niveau | Contenu |
|---|---|---|
| 6A | Première | Calcul vectoriel dans le plan : Chasles, colinéarité, base |
| 6B | Terminale | Vecteurs de l'espace, coplanarité, bases et repères |
| 6C | Terminale | Droites et plans, positions relatives, sections de cube |

**Chapitre 7 — Probabilités conditionnelles et variables aléatoires**

| Fiche | Niveau | Contenu |
|---|---|---|
| [7A](chapitres/07_probabilites/7A_probabilites_conditionnelles.html) | Première | Conditionnement, arbres, probabilités totales et indépendance |
| [7B](chapitres/07_probabilites/7B_variables_aleatoires.html) | Première | Loi, espérance, variance, écart type et jeu équitable |
| [7C](chapitres/07_probabilites/7C_epreuves_independantes_bernoulli.html) | Terminale | Épreuves indépendantes, Bernoulli, chemins et événements |

Le [dossier du chapitre 7](chapitres/07_probabilites/README.md) décrit ses tests mathématiques indépendants, ses tests navigateur et la génération ciblée à utiliser pendant les relectures parallèles.

**Chapitre 8 — Combinatoire et dénombrement**

| Fiche | Niveau | Contenu |
|---|---|---|
| [8A](chapitres/08_combinatoire_denombrement/8A_combinatoire_denombrement.html) | Terminale | Listes, permutations, combinaisons, coefficients binomiaux, Pascal et chemins à k succès |

Le [dossier du chapitre 8](chapitres/08_combinatoire_denombrement/README.md) précise les démonstrations exigibles, le lien entre 7C et la future loi binomiale, ainsi que ses tests indépendants et navigateur.

**Chapitre 9 — Loi binomiale**

| Fiche | Niveau | Contenu |
|---|---|---|
| [9A](chapitres/09_loi_binomiale/9A_loi_binomiale.html) | Terminale | Loi binomiale, probabilités cumulées, intervalles, seuils, moments et simulation |

Le [dossier du chapitre 9](chapitres/09_loi_binomiale/README.md) décrit les démonstrations, les tests indépendants des probabilités et des arrondis, ainsi que la génération ciblée.

**Chapitre 10 — Fonctions trigonométriques**

| Fiche | Niveau | Contenu |
|---|---|---|
| [10A](chapitres/10_trigonometrie/10A_cercle_trigonometrique.html) | Première | Cercle, radians, valeurs remarquables, angles associés, parité et périodicité |
| [10B](chapitres/10_trigonometrie/10B_derivation_trigonometrie.html) | Terminale | Dérivées, variations, limites en zéro, équations, inéquations et optimisation |

Le [dossier du chapitre 10](chapitres/10_trigonometrie/README.md) décrit les conventions de réponse, les tests indépendants, les contrôles aux bornes et la génération ciblée.

**Chapitre 12 — Calcul intégral**

| Fiche | Niveau | Contenu |
|---|---|---|
| [12A](chapitres/12_calcul_integral/12A_integrales_aires.html) | Terminale | Intégrales, aires, primitives, propriétés, encadrements et valeur moyenne |
| [12B](chapitres/12_calcul_integral/12B_integration_methodes.html) | Terminale | Intégration par parties, suites d’intégrales, rectangles, milieux et trapèzes |

Le [dossier du chapitre 12](chapitres/12_calcul_integral/README.md) précise les démonstrations, les tests indépendants et la construction isolée pendant le travail parallèle sur le chapitre 11.

Le plan complet de l'année, avec l'ordre des quatorze chapitres, leurs dépendances et les prérequis de Première à réactiver pour chacun, est dans [`ordre.md`](ordre.md).

## Le guide de méthode

`strategie/reussir_lannee.html` réunit :

- sept résultats de la recherche sur l'apprentissage des mathématiques, traduits en gestes concrets (effet de test, espacement, mélange des exercices, exemples résolus estompés, auto-explication, analyse des erreurs, gestion de l'anxiété), avec les références ;
- un « escalier d'autonomie » en sept marches, du prérequis à la création d'exercices ;
- une semaine type avec minuteur intégré ;
- une section « quand ça bloque » : règle des 10 minutes, échelle de frustration, phrases à remplacer ;
- dix prompts prêts à copier pour utiliser ChatGPT en tuteur plutôt qu'en solutionneur ;
- un carnet de suivi qui s'enregistre dans le navigateur et produit un bilan à coller dans un assistant.

## Utilisation hors connexion

Le site ne dépend d'aucun service extérieur : MathJax est embarqué dans `vendor/`. Pour travailler en mode avion, télécharger le dépôt (bouton « Code », puis « Download ZIP ») et ouvrir `index.html` depuis le gestionnaire de fichiers. Une fiche seule fonctionne aussi, mais ses formules ne s'affichent correctement que si le dossier `vendor/` est conservé à côté.

## Programmes officiels

Le dossier `programmes/` contient les annexes du Bulletin officiel de 2019 pour la Première et la Terminale, en PDF et en texte cherchable, plus un résumé par chapitre.

⚠️ De nouveaux programmes ont été publiés au Bulletin officiel du 2 avril 2026. Ils s'appliquent **en Première à la rentrée 2026** et **en Terminale à la rentrée 2027**. Les fiches de ce dépôt suivent les programmes de 2019, ceux des élèves entrés en Terminale en septembre 2026.

## Contribuer ou adapter

La méthode de fabrication d'une fiche est décrite dans `outils/prompt_fiche_html.md`, et `outils/check_fiche.py` vérifie qu'une fiche respecte la structure attendue et que son JavaScript est valide.

Après ajout d’une fiche ou modification de l’interface commune :

```bash
python3 outils/build_site.py
python3 outils/check_fiche.py chapitres/*/*.html
python3 outils/check_site.py
```

Le générateur découvre les fiches et le programme depuis les HTML et `ordre.md`,
puis intègre les sources `outils/site.css` et `outils/site.js` dans chaque page.
Les fiches restent autonomes ; aucun téléchargement supplémentaire n’est requis
pour la navigation. Les blocs `SITE:*` sont générés, le contenu pédagogique situé
en dehors de ces blocs reste éditable normalement.

Pour la vérification dans un navigateur (Playwright doit être disponible) :

```bash
python3 -m http.server 8765 --bind 127.0.0.1
# Dans un autre terminal :
node outils/test_site.cjs
```

Les tests découvrent les fiches présentes et couvrent le rendu des formules, les résultats,
la reprise, l’export/import, la migration du carnet, les onglets et le mobile.
Les captures de contrôle sont écrites dans `/tmp/reussite-maths-qa`.

## Où va le projet

La structure du site est gelée : adresses des fiches, rubriques du bandeau et clé de sauvegarde ne changent plus. Les règles sont dans [`CONTRAT_NAVIGATION.md`](CONTRAT_NAVIGATION.md).

Les objectifs pour la suite, page d'entrée pour un nouvel élève, partage des fiches, diffusion et mesure, sont décrits dans [`FEUILLE_DE_ROUTE.md`](FEUILLE_DE_ROUTE.md).

## Licence

Contenu pédagogique sous [licence CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.fr) : réutilisation libre, y compris modifiée, à condition de citer la source et de partager aux mêmes conditions.

Les programmes officiels du Bulletin officiel sont des actes officiels, librement reproductibles. MathJax, dans `vendor/`, est distribué sous licence Apache 2.0.
