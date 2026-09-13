# Chapitre 11 — Primitives et équations différentielles

Découpage conforme au BO 2019. Voir `ordre.md` pour la place de ce chapitre dans l'année.

Ce chapitre n'a pas de partie Première : ni les primitives ni les équations différentielles ne figurent au programme de Première. Ce qu'il faut réactiver, c'est la **dérivation**, puisque chercher une primitive est l'opération inverse. La fiche 12A joue ce rôle de pont en relisant le tableau des dérivées à l'envers.

| Fiche | Niveau | Contenu | Prérequis |
|---|---|---|---|
| `11A_primitives.html` | Terminale | Équation y′ = f, notion de primitive, deux primitives diffèrent d'une constante (démonstration exigible), primitives des fonctions de référence, primitives de la forme (v′ ∘ u) × u′, primitive vérifiant une condition initiale | 3B, 3D, 5B, 5C |
| `11B_equations_differentielles.html` | Terminale | Équation y′ = ay et sa résolution (démonstration exigible), allure des courbes, équation y′ = ay + b avec solution particulière constante, équation y′ = ay + f à partir d'une solution particulière, condition initiale, modélisation, méthode d'Euler | 11A, 5B |

## Ordre de travail conseillé

11A puis 11B. La fiche 12A est le socle : sans primitives sûres, la résolution des équations différentielles et tout le chapitre 12 sur l'intégration deviennent inaccessibles.

## Points d'attention issus de la relecture des vingt et une premières fiches

- Une primitive n'est jamais unique : toute réponse doit comporter la constante, et la vérification doit accepter n'importe quelle valeur de cette constante quand l'énoncé ne fixe pas de condition initiale.
- Les primitives de x ↦ 1/x et de x ↦ xⁿ pour n entier négatif supposent un intervalle ne contenant pas zéro : l'intervalle doit être précisé.
- Le programme dit explicitement que certaines fonctions n'ont pas de primitive explicite. Ne pas laisser croire qu'on sait toujours en calculer une.
- Pour y′ = ay + b, la solution particulière constante vaut −b/a, ce qui suppose a non nul. Le cas a = 0 se ramène à une primitive.
