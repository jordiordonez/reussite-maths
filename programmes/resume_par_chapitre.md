# Carte des programmes et découpage Première / Terminale

Résumé fidèle des deux BO 2019 (voir les PDF pour le texte exact). Sert à décider, pour chaque chapitre, ce qui est **révision de Première** (à travailler dès maintenant) et ce qui est **nouveau en Terminale**.

## 1. Vue d'ensemble

### Première (programme 2019) — acquis à consolider
- **Algèbre** : suites numériques (modèles discrets) ; équations, fonctions polynômes du second degré.
- **Analyse** : dérivation ; variations et courbes représentatives ; fonction exponentielle ; fonctions trigonométriques.
- **Géométrie** : calcul vectoriel et produit scalaire ; géométrie repérée (vecteur normal, cercle, parabole).
- **Probabilités et statistiques** : probabilités conditionnelles et indépendance ; variables aléatoires réelles (espérance, variance, écart type).
- **Algorithmique et programmation** (Python) : listes, boucles, fonctions.

### Terminale (programme 2019) — l'année
- **Algèbre et géométrie** : combinatoire et dénombrement ; vecteurs, droites et plans de l'espace ; orthogonalité et distances dans l'espace ; représentations paramétriques et équations cartésiennes.
- **Analyse** : suites (limites, récurrence) ; limites de fonctions ; continuité ; compléments sur la dérivation (composée, convexité) ; logarithme népérien ; fonctions sinus et cosinus ; primitives et équations différentielles ; calcul intégral.
- **Probabilités** : succession d'épreuves indépendantes, loi binomiale ; sommes de variables aléatoires ; concentration et loi des grands nombres.
- **Algorithmique et programmation** ; vocabulaire ensembliste et logique (dont le raisonnement par récurrence).

Ordre de travail retenu dans ce projet : **produit scalaire** puis **suites**, chacun en deux temps (Première puis Terminale).

---

## 2. Chapitre « Produit scalaire »

### 2.1 Partie Première (BO 2019, Géométrie) — à travailler dès maintenant

**Calcul vectoriel et produit scalaire**
- Contenus : produit scalaire à partir de la projection orthogonale et de la formule avec le cosinus ; caractérisation de l'orthogonalité ; bilinéarité, symétrie ; en base orthonormée, expression du produit scalaire et de la norme, critère d'orthogonalité ; développement de $\|\vec u+\vec v\|^2$ ; formule d'Al-Kashi ; transformation de l'expression $\vec{MA}\cdot\vec{MB}$.
- Capacités attendues : utiliser le produit scalaire pour démontrer une orthogonalité, calculer un angle, une longueur ; choisir la méthode de calcul adaptée (projection, coordonnées, normes et angle, normes seules) ; résoudre un problème géométrique.
- Démonstrations exigibles : Al-Kashi ; ensemble des points $M$ tels que $\vec{MA}\cdot\vec{MB}=0$ (cercle de diamètre $[AB]$).
- Approfondissements possibles (non exigibles) : loi des sinus, droite d'Euler, médianes concourantes.

**Géométrie repérée** (repère orthonormé)
- Contenus : vecteur normal à une droite ; $(a,b)$ est normal à la droite $ax+by+c=0$, $(-b,a)$ en est un vecteur directeur ; équation de cercle ; parabole, axe de symétrie et sommet.
- Capacités : équation cartésienne d'une droite (point + vecteur normal) ; projeté orthogonal d'un point sur une droite ; équation d'un cercle (centre, rayon) et reconnaissance ; axe et sommet d'une parabole ; utiliser un repère pour étudier une configuration.

Prérequis de Seconde à réactiver si besoin : coordonnées de vecteurs, norme, colinéarité, équation de droite, cosinus dans un triangle rectangle.

### 2.2 Partie Terminale (BO 2019, Algèbre et géométrie) — à travailler ensuite

**Manipulation des vecteurs, droites et plans de l'espace** (préalable)
- Vecteurs de l'espace, combinaisons linéaires ; droites (vecteur directeur), plans (couple de vecteurs non colinéaires) ; bases et repères de l'espace ; positions relatives ; coplanarité.

**Orthogonalité et distances dans l'espace**
- Contenus : produit scalaire de deux vecteurs de l'espace (bilinéarité, symétrie) ; orthogonalité ; base et repère orthonormés ; coordonnées, expressions du produit scalaire, de la norme, de la distance ; développement de $\|\vec u+\vec v\|^2$, formules de polarisation ; orthogonalité de deux droites, d'une droite et d'un plan ; vecteur normal à un plan ; plan passant par $A$ et normal à $\vec n$ ; projeté orthogonal d'un point sur une droite, sur un plan.
- Capacités : démontrer une orthogonalité, calculer un angle, une longueur ; distance d'un point à une droite ou à un plan par projection orthogonale ; longueurs, angles, aires, volumes ; configurations (orthogonalité droite/droite, droite/plan), lieux simples (plan médiateur).
- Démonstration exigible : le projeté orthogonal de $M$ sur un plan est le point du plan le plus proche de $M$.

**Représentations paramétriques et équations cartésiennes**
- Représentation paramétrique d'une droite ; équation cartésienne d'un plan ($ax+by+cz+d=0$, vecteur normal $(a,b,c)$) ; projeté orthogonal sur un plan ou une droite ; traduire un problème (base, coordonnées, alignement, coplanarité, intersections, orthogonalité) par un système linéaire et l'interpréter.
- Démonstration exigible : équation cartésienne du plan normal à $\vec n$ passant par $A$.

---

## 3. Chapitre « Suites »

### 3.1 Partie Première (BO 2019, Algèbre) — à travailler dès maintenant

**Suites numériques, modèles discrets**
- Contenus : modes de génération (explicite $u_n=f(n)$, récurrence $u_{n+1}=f(u_n)$, algorithme, motifs géométriques) ; notations ; suites arithmétiques (définition, terme général, lien avec les fonctions affines, $1+2+\dots+n$) ; suites géométriques (définition, terme général, lien avec l'exponentielle, $1+q+\dots+q^n$) ; sens de variation ; introduction intuitive de la limite sur des exemples.
- Capacités : passer entre langue naturelle, algébrique et graphique ; modéliser une situation par une suite ; calculer des termes ; pour une suite arithmétique ou géométrique : terme général, somme de termes consécutifs, sens de variation ; modéliser croissance linéaire / exponentielle ; conjecturer une limite dans des cas simples.
- Démonstrations exigibles : terme général d'une suite arithmétique, d'une suite géométrique ; $1+2+\dots+n$ ; $1+q+\dots+q^n$.
- Algorithmes : calcul de termes, de sommes, de seuil ; factorielle ; Syracuse, Fibonacci.

Le programme précise que la notion de limite est **intuitive** en Première : « toute formalisation est exclue ».

### 3.2 Partie Terminale (BO 2019, Analyse) — à travailler ensuite

**Suites**
- Contenus : $(u_n)$ tend vers $+\infty$ si tout intervalle $[A;+\infty[$ contient tous les $u_n$ à partir d'un certain rang ; suite croissante non majorée ; limite $-\infty$ ; convergence vers $\ell$ (tout intervalle ouvert contenant $\ell$ contient tous les $u_n$ à partir d'un certain rang) ; limites et comparaison, théorème des gendarmes ; opérations sur les limites ; comportement de $(q^n)$ ; théorème admis : toute suite croissante majorée (décroissante minorée) converge.
- Capacités : établir la convergence ou la divergence vers $\pm\infty$ ; **raisonner par récurrence** pour établir une propriété d'une suite ; étudier des phénomènes d'évolution modélisés par une suite.
- Démonstrations exigibles : toute suite croissante non majorée tend vers $+\infty$ ; limite de $(q^n)$ après démonstration par récurrence de l'inégalité de Bernoulli ; divergence vers $+\infty$ d'une suite minorée par une suite divergeant vers $+\infty$.
- Algorithmes : recherche de seuils ; valeurs approchées de $\pi$, $e$, $\sqrt2$, nombre d'or, $\ln 2$.
- Approfondissements possibles : suites adjacentes ; récurrences linéaires d'ordre 2 ; méthode de Newton, méthode de Héron.

Note : le raisonnement par récurrence est aussi listé dans « Vocabulaire ensembliste et logique » de Terminale ; il est nouveau par rapport à la Première.
