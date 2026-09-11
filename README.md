# Spé maths Terminale — fiches interactives et méthode

Ressources libres pour l'enseignement de spécialité mathématiques en Terminale générale (programme officiel français de 2019). Tout est en HTML autonome : les fiches s'ouvrent sur un téléphone ou un iPad, **sans connexion internet**, et s'enregistrent comme un simple fichier.

Conçu pour un élève qui a eu des difficultés en Première et qui garde la spécialité en Terminale. Chaque chapitre est donc traité en deux étages : ce qui relève de la Première, à réviser d'abord, et ce qui relève de la Terminale.

👉 **[Ouvrir le site](https://jordiordonez.github.io/reussite-maths/)**

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

## Licence

Contenu pédagogique sous [licence CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.fr) : réutilisation libre, y compris modifiée, à condition de citer la source et de partager aux mêmes conditions.

Les programmes officiels du Bulletin officiel sont des actes officiels, librement reproductibles. MathJax, dans `vendor/`, est distribué sous licence Apache 2.0.
