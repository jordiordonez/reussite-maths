# Navigation et style — Réussite Spé Maths

## Intention

Un espace de travail calme : reprendre les bases, comprendre, s’entraîner, puis
retrouver ce qui mérite une nouvelle séance. Le contenu pédagogique des fiches
est conservé. Toutes les pages partagent les mêmes repères.

## Navigation appliquée

- Bandeau commun : Réussite Spé Maths en toutes lettres, sans pastille ni logo, Accueil, Chapitres, Méthode, Mes progrès,
  recherche et accès au suivi de l’appareil.
- Ordinateur à partir de 1 100 px : programme latéral de 264 px, chapitre actuel
  déplié, fiche active indiquée. Première et Terminale sont regroupées séparément.
- Tablette et mobile : panneau du programme accessible par Menu et par le bouton
  « Voir les fiches ». Fermeture par Échap, retour du focus, navigation au clavier.
- Fiches : fil d’Ariane, titre aligné à gauche, liens de section Cours, Méthode,
  Explorer, Exercices et QCM. Les sections restent dans le même document pour
  conserver les exercices lors des déplacements. Liens précédent/suivant nommés.
- Accueil : reprendre la dernière fiche et sa section, notions à revoir,
  accès au programme et à l’organisation d’une séance.
- Chapitres : liste repliable, objectifs et prérequis, recherche, filtres de niveau,
  états individuels. Les chapitres futurs sont visibles et marqués « À venir ».
- Méthode : sommaire commun et accès direct au carnet dans Mes progrès.
  L’ancien libellé ambigu « Abonnement ? » devient « Choisir son outil IA ».
- Recherche globale : noms de fiches, chapitres, sections et rubriques du guide.
  Le raccourci `/` ouvre la recherche en dehors des champs de saisie.

## Style

Fond ivoire `#FAF8F5`, surfaces blanches, texte `#1F2937`, accent bleu `#2563EB`.
Titres Georgia, corps et navigation en police système. Colonne de lecture de
820 px maximum, cartes de 12–16 px de rayon, bordures fines et ombres discrètes.
Vert pour les réussites, ambre pour les notions à revoir, corail pour les erreurs.
Les états portent toujours un libellé. Boutons de 44 px minimum, focus visible,
respect de la réduction des animations et styles d’impression.

## Suivi sans compte

Le suivi est stocké dans `localStorage`, sous `reussite_maths_v1`. Il contient la
dernière fiche/section, les états choisis, les résultats des exercices et QCM et
le carnet manuel. Les champs de l’exercice aléatoire en cours ne sont pas
restaurés au rechargement : une nouvelle génération reste le comportement des
fiches. Les résultats déjà enregistrés sont conservés.

Lire marque « En cours », jamais « Validé ». Une erreur place la fiche dans
« À revoir ». La validation reste une décision de l’élève. Les résultats
automatiques et les séances manuelles sont distingués dans le carnet.

L’ancien carnet `carnet_maths_v1` est importé une seule fois sans supprimer la
copie d’origine. Export JSON, import validé et fusion sans duplication par
identifiant, et actualisation entre onglets. Les suppressions du carnet sont
confirmées et mémorisées pour ne pas réapparaître lors d’une fusion.

Le suivi est propre à une origine web, un navigateur et un appareil. Effacer
les données du site peut l’effacer ; la navigation privée est temporaire.
L’ouverture directe en `file://` ne garantit pas un stockage partagé entre pages.
Le site hébergé offre une origine commune ; les HTML restent consultables hors
connexion avec leur dossier MathJax. Aucun cache hors ligne du site hébergé n’est
promis. Une erreur d’écriture est affichée ; une sauvegarde illisible n’est pas
écrasée silencieusement.

## Évolution ultérieure : comptes et offre payante

Pas de faux bouton de connexion ni d’offre fictive dans cette version.
L’emplacement du suivi personnel pourra devenir le menu du compte.

- Authentification via OpenID Connect, selon le fournisseur choisi.
- Au premier compte, proposition d’importer le suivi local vers le compte.
- Après connexion, retour à la fiche et section de départ.
- Synchronisation des progrès entre appareils et indicateur de synchronisation.
- Même navigation pour visiteur, membre gratuit et abonné.
- Offre à définir autour de parcours personnalisés, révisions guidées et suivi
  enrichi ; page Offres distincte du contenu pédagogique et gestion dans le compte.
- Les droits d’accès payants demanderont un service côté serveur. Masquer un
  bouton dans un HTML public ne constitue pas un contrôle d’accès.

## Entretien

Les sources communes sont `outils/site.css`, `outils/site.js` et
`outils/build_site.py`. Le script intègre le CSS, le JS et le catalogue dans chaque
HTML pour préserver l’usage sans dépendance réseau supplémentaire.

Après avoir ajouté une fiche, lancer `python3 outils/build_site.py`, puis les
vérifications. Le catalogue est découvert à partir des HTML et de `ordre.md`.
Les zones communes portent des marqueurs `SITE:*` ; ne pas les éditer à la main.
La génération ne remplace pas le cours, les exercices ou les moteurs des fiches.
