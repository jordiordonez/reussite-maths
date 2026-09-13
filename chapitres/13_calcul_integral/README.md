# Chapitre 12 — Calcul intégral

| Fiche | Niveau | Contenu | Prérequis |
|---|---|---|---|
| [12A — Intégrales, aires et valeur moyenne](12A_integrales_aires.html) | Terminale | Aire sous une courbe, théorème fondamental, calcul par primitives, signe et orientation, Chasles, linéarité, encadrements, aire entre courbes et valeur moyenne | 11A, dérivation et aires du collège |
| [12B — Intégration par parties et approximations](12B_integration_methodes.html) | Terminale | Intégration par parties, suites d’intégrales, comparaison et récurrence, rectangles, milieux, trapèzes | 12A, 11A, suites et exponentielle |

Les deux fiches suivent le programme de Terminale 2019 retenu par le projet. Le calcul intégral n’est pas présenté comme une notion de Première.

## Contenu et démonstrations

- 12A : sept points de cours, méthode, courbe interactive avec aires positives/négatives et moyenne, trois exercices génératifs, douze entrées de QCM.
- 12B : six points de cours, méthode, comparaison de quatre méthodes numériques et d’une suite d’aires, trois exercices génératifs, douze entrées de QCM.
- Démonstrations exigibles : la fonction aire est une primitive dans le cas continu positif croissant (accroissements des deux signes) ; formule F(b) − F(a) ; intégration par parties issue de la dérivée du produit.
- Deux suites étudiées : Jₙ = intégrale de xⁿ(1−x) sur [0,1] et Iₙ = intégrale de xⁿeˣ sur [0,1], avec limites par comparaison et relations de récurrence.
- L’algorithme des rectangles à gauche est donné en Python et testé depuis le code inclus dans la fiche. Monte-Carlo, Brouncker et les approfondissements sur les nombres harmoniques ne sont pas développés ; le BO les propose comme exemples ou approfondissements.

Les réponses exactes sont comparées par fractions entières, sans tolérance permissive. Pour l’exercice d’intégration par parties, le bon arrondi au millième est demandé. Les fractions équivalentes, les décimales françaises et le signe moins Unicode sont acceptés ; une valeur fausse distante de 10⁻¹² est refusée.

## Vérifications reproductibles

Rapports : [12A](../../revue/13A.md) et [12B](../../revue/13B.md).

```bash
python3 outils/chapitre12/test_math.py
python3 outils/check_fiche.py chapitres/13_calcul_integral/13A_integrales_aires.html chapitres/13_calcul_integral/13B_integration_methodes.html
python3 outils/check_site.py
python3 -m http.server 8765 --bind 127.0.0.1
# Dans un autre terminal disposant de Playwright :
node outils/chapitre12/test_browser.cjs
```

`PLAYWRIGHT_CHANNEL=chrome` sélectionne Chrome ; `SITE_TEST_URL` choisit un autre serveur. Les captures vont dans `/tmp/chapitre12-qa` (ou `CH12_TEST_OUTPUT`).

L’oracle extrait les modèles des HTML livrés et réimplémente le calcul attendu indépendamment en Python : quadrature de Simpson exacte sur les polynômes utilisés, exponentielle Decimal à 60 chiffres, sommes rationnelles. Il vérifie 600 tirages par exercice et 300 par entrée QCM, soit 3 600 exercices, 7 200 QCM et 77 492 acceptations/refus. Il contrôle aussi 588 configurations d’aires, 288 configurations de sommes et 12 cas de l’algorithme Python.

Les tests navigateur cliquent les vraies réponses calculées par l’oracle, puis des réponses fausses et des valeurs voisines. Ils contrôlent corrections, régénération, scores 4/4 et 0/4, enregistrement unique, graphiques (y compris l’aire signée des polygones réellement dessinés), titres, navigation, mobile 320/390/768 px, stockage local, ouverture hors connexion et mode sans stockage ni MathJax.

## Construction isolée pendant le travail de Claude

```bash
python3 outils/chapitre12/build.py
python3 outils/chapitre12/integrate_site.py
```

L’assembleur part du squelette officiel et n’écrit que 12A/12B. Reporter toute correction manuelle du HTML dans les sources avant reconstruction.

Le script d’intégration ne réécrit que les deux nouvelles fiches et les trois pages principales. Il conserve les fiches déjà exposées dans le catalogue puis ajoute 12A/12B : un fichier brouillon de chapitre 11 présent sur le disque n’est pas automatiquement rendu accessible. Le chapitre 11 reste un prérequis pédagogique, même si sa publication intervient plus tard.

Les anciens menus et liens « suivant » restent inchangés jusqu’à la fin des travaux parallèles. Une génération globale pourra alors tous les actualiser. Ne pas embarquer le travail de Claude dans un commit de ce chapitre ; aucun commit/push n’est effectué par ces scripts.
