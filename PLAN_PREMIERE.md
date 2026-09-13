# Ouvrir le site aux élèves de Première

Le site a d'abord été conçu pour la Terminale. Ses fiches de Première existaient comme socle : ce qu'il faut réactiver avant d'aborder un chapitre de Terminale.

En pratique, ces fiches couvrent déjà presque tout le programme de Première. Les ouvrir explicitement aux élèves de Première coûte peu et double le public.

Ce document fait l'inventaire, dit ce qui manque, et fixe l'ordre de production.

## Inventaire au 13 septembre 2026

Les dix rubriques du programme de Première, confrontées aux fiches existantes.

| Rubrique du programme | Couverture | Fiches |
|---|---|---|
| Suites numériques, modèles discrets | ✅ complète | 2A, 2B |
| Équations, fonctions polynômes du second degré | ✅ complète | 15A |
| Dérivation | ✅ complète | 3A, 3B |
| Variations et courbes représentatives | ✅ complète | 3C, 4A |
| Fonction exponentielle | ✅ complète | 5A |
| Fonctions trigonométriques | ⚠️ **partielle** | 10A |
| Calcul vectoriel et produit scalaire | ✅ complète | 1A, 1B, 6A |
| Géométrie repérée | ✅ complète | 1C |
| Probabilités conditionnelles et indépendance | ✅ complète | 7A |
| Variables aléatoires réelles | ✅ complète | 7B |
| Algorithmique et programmation | ✅ complète | 14A |

**Quinze fiches de Première existent.** Le programme est couvert à l'exception de deux points.

## Ce qui manque

### 1. Le second degré — ✅ fait le 13 septembre 2026

C'est le seul chapitre entièrement absent. Il n'avait pas été traité parce qu'il ne sert pas directement en Terminale : aucun chapitre de Terminale n'en dépend, il n'était donc pas nécessaire comme socle.

Pour un élève de Première, c'est au contraire un morceau central du programme, et l'un des plus évalués. La fiche `15A` le traite : formes factorisée et canonique, discriminant, signe, somme et produit des racines, et la démonstration exigible de la résolution.

### 2. La trigonométrie de Première — à compléter

La fiche `10A` existe et traite le cercle trigonométrique, les radians, les valeurs remarquables, la parité et la périodicité. Elle a été écrite comme socle de la dérivation des fonctions trigonométriques en Terminale.

Trois éléments du programme de Première y manquent, vérifiés dans le texte officiel :

- l'**enroulement de la droite** sur le cercle, qui est la construction fondatrice, celle qui donne un sens à « cosinus d'un nombre réel » ;
- la **démonstration exigible** du calcul du sinus de pi sur quatre, du cosinus et du sinus de pi sur trois ;
- l'approximation de pi par la méthode d'Archimède, citée comme exemple d'algorithme, donc facultative.

À traiter en complétant `10A` plutôt qu'en créant une fiche : le sujet est le même, et le contrat de navigation interdit de déplacer une fiche publiée.

## Ce qui change pour l'élève de Première

Rien dans les fiches : elles traitent déjà le programme de Première, elles ne sont pas un résumé.

Ce qui change, c'est la lisibilité. Un élève de Première doit voir immédiatement quels chapitres le concernent. D'où les badges de public décrits ci-dessous.

Un point à garder honnête : **l'ordre des chapitres du site suit la logique de la Terminale**, pas celle de la Première. Un élève de Première ne doit pas le suivre, il doit suivre son cours. Le catalogue le dit.

## Badges de public

Chaque chapitre indique qui il concerne, à partir du niveau réel de ses fiches, sans saisie manuelle :

| Badge | Signification | Exemple |
|---|---|---|
| **Première** | Le chapitre ne contient que des fiches de Première | 1 · Second degré |
| **Terminale** | Le chapitre ne contient que des fiches de Terminale | 9 · Dénombrement, 10 · Loi binomiale |
| **Première et Terminale** | Le chapitre contient les deux | 2 · Produit scalaire, 4 · Dérivation |

Le badge est calculé par `outils/build_site.py` à partir des fiches réellement présentes. Ajouter une fiche met le badge à jour tout seul.

Un filtre du catalogue permet déjà de n'afficher que l'un des deux niveaux.

## Ordre de production

1. ~~**Le second degré**~~ — ✅ fait, fiche 1A.
2. ~~**Les badges de public**~~ — ✅ faits, calculés depuis le niveau réel des fiches.
3. **Compléter la trigonométrie de Première** — l'enroulement et la démonstration exigible.
4. **Relire indépendamment** les fiches non encore relues, dont les nouvelles.

Les points 1 et 2 suffisent à annoncer honnêtement que le site couvre les deux niveaux. Le point 3 est une lacune réelle mais limitée, à signaler dans la fiche concernée tant qu'elle n'est pas comblée.
