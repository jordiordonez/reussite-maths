# Spécification d'une fiche HTML interactive (traduction et adaptation de `prompt_eines_html.docx`)

Une fiche = **un seul fichier `.html`**, autonome, qui s'ouvre hors connexion sur un téléphone ou un iPad (sauf MathJax, chargé par CDN : prévoir un repli lisible si le CDN est absent, c'est-à-dire écrire les formules simples aussi en texte quand c'est possible).

## Structure (dans cet ordre)

1. **En-tête** : titre animé (apparition en fondu / glissement) + sous-titre « Première · Mathématiques » ou « Terminale · Mathématiques ».
2. **Navigation sticky** : boutons ou onglets vers chaque section (Cours, Méthode, Visualisation, Exercices, QCM).
3. **Cours** : résumé visuel du concept clé en 5 à 7 points, avec exemples numériques concrets et encadrés mis en valeur. Signaler ce qui est « à savoir démontrer » quand le BO l'exige.
4. **Méthode** : les pas de résolution des types d'exercices du chapitre (« Pour calculer … : 1. … 2. … »). Erreurs fréquentes à éviter.
5. **Visualisation** : la visualisation **la plus riche possible** : sliders, zones colorées illustrant les relations, animations, plusieurs grandeurs recalculées en temps réel. SVG inline ou canvas. Pas de bibliothèque externe.
6. **Exercices** : 3 exercices **génératifs** (valeurs aléatoires à chaque clic sur « Nouvel exercice »), de difficulté croissante (niveau 1 : application directe ; niveau 2 : deux étapes ; niveau 3 : problème). Chaque exercice a un champ de réponse (ou plusieurs), une vérification avec tolérance numérique, et un bouton « Voir la correction » qui déplie une correction rédigée étape par étape.
7. **QCM** : 4 questions A/B/C/D, feedback immédiat vert/rouge, explication brève (1 à 2 phrases), score final quand tout est répondu, bouton « Nouveau QCM » qui pioche/génère de nouvelles questions.
8. **Pied de page** : rappel « Si tu bloques : relis la méthode, refais l'exercice de niveau inférieur, puis demande à ChatGPT une indication (pas la solution) ».

## Design

- Fond clair chaud `#faf8f5`, cartes blanches avec ombre douce, coins arrondis.
- Typographie mixte : serif pour les titres (ex. Georgia), sans-serif pour le corps (system-ui).
- Couleurs cohérentes : accent bleu (`#2563eb`), corail pour les erreurs (`#f97362`), vert pour les réussites (`#22a06b`).
- Boutons grands (hauteur ≥ 44 px), lisibles au doigt.
- Entièrement responsive, pensé pour l'écran vertical d'un téléphone ; agréable aussi sur iPad.

## Pédagogie

- Sessions courtes : chaque section est indépendante et autosuffisante.
- Feedback immédiat à chaque réponse.
- Explications en 1 à 2 phrases dans le feedback ; correction complète repliée.
- Exercices génératifs : nouveaux nombres à chaque génération, valeurs « propres » (résultats entiers ou simples quand c'est possible pour les niveaux 1 et 2).

## Notation mathématique

- MathJax 3 via CDN : `<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>` avec configuration `tex: {inlineMath: [['\\(','\\)']], displayMath: [['\\[','\\]']]}`.
- Toujours `\binom{n}{k}`, jamais `C(n,k)`.
- Vecteurs : `\vec{u}`, `\vec{AB}` ; norme : `\|\vec u\|` ; produit scalaire : `\vec u\cdot\vec v`.
- Après avoir injecté du contenu dynamique contenant des formules, appeler `MathJax.typesetPromise([element])` (vérifier que `window.MathJax` existe).

## Qualité JavaScript (obligatoire)

- Les réponses correctes et explications du QCM sont stockées dans un objet JS (`qcmMap[i] = {correct, expl}`), **jamais** dans des attributs `onclick` ou `data-`. Cela évite les erreurs de parsing (« missing ) after argument list ») et les questions figées.
- Attacher les événements avec `addEventListener`, pas avec des `onclick=""` inline contenant du texte.
- Ne pas mettre de retours à la ligne ou d'apostrophes non échappées dans des chaînes JS générées dans le HTML ; préférer les template literals.
- Tout le CSS et le JS sont inline dans le fichier.
- Le fichier commence par `<!DOCTYPE html>` et finit par `</html>`.

## Vérification avant livraison

1. Extraire les blocs `<script>` (hors MathJax) et lancer `node --check` sur chacun.
2. Ouvrir le fichier dans le navigateur : formules rendues, sliders actifs, « Nouvel exercice » change les valeurs, chaque question du QCM répond, score final affiché, « Nouveau QCM » fonctionne.
3. Tester en largeur 390 px (mode mobile des outils de développement) : pas de défilement horizontal.
