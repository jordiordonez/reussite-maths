# Feuille de route

Objectifs pour la suite du projet, au-delà de la production des chapitres. Ce document n'engage aucun travail : il fixe une direction et sert de référence quand on décide quoi faire ensuite.

Rédigé le 12 septembre 2026, après la publication de douze chapitres et la relecture mathématique des vingt et une premières fiches.

## 1. Finaliser les chapitres et stabiliser la navigation

Il reste deux chapitres au plan de `ordre.md` : les sommes de variables aléatoires avec la loi des grands nombres, et l'algorithmique, qui est transversale.

Deux chantiers de fond passent avant toute diffusion :

- **Relire les onze fiches produites après la relecture.** Les chapitres 7 à 12 ont été vérifiés par leur auteur, pas par un relecteur indépendant. La relecture des vingt et une premières a corrigé 255 anomalies, dont des énoncés insolubles et des corrections fausses, qu'aucun test automatique ne signalait. Un auteur ne voit pas tous ses propres défauts. `revue/PROTOCOLE.md` décrit la méthode, `revue/ETAT.md` distingue déjà les deux catégories.
- **Geler la navigation.** Elle a changé trois fois. Avant de faire venir des gens, il faut qu'un lien reste valide et qu'un élève qui revient retrouve ses repères.

## 2. Une vraie page d'entrée pour un élève qui arrive

Aujourd'hui l'accueil suppose qu'on sait déjà ce qu'on cherche. Un élève qui découvre le site doit comprendre en quelques secondes ce qu'il peut y faire et par où commencer.

Ce que cette page doit régler :

- **À qui ça s'adresse** : Terminale, enseignement de spécialité, programme officiel français de 2019.
- **Le principe des deux étages** : réviser la partie Première avant que le chapitre commence en classe, puis travailler la partie Terminale. C'est la singularité du projet, elle n'est visible nulle part à l'arrivée.
- **Un premier pas concret**, pas un sommaire. Par exemple : « Quel chapitre commencez-vous en classe ? », qui mène directement aux fiches de Première correspondantes.
- **Ce que le site ne fait pas** : il ne remplace pas le cours, il ne corrige pas les devoirs, il n'a pas de compte.
- **Une démonstration immédiate.** Un exercice génératif jouable sur la page d'accueil vaut mieux que trois paragraphes de description.

## 3. Rendre chaque fiche partageable

Une fiche est aujourd'hui une adresse longue que personne ne retient et que personne ne transmet. Pistes :

- des adresses courtes et lisibles ;
- un aperçu correct quand on colle le lien dans une messagerie ou un réseau, avec titre, chapitre, niveau et une image ;
- un lien vers une section précise, par exemple la méthode d'une fiche, qui fonctionne déjà techniquement mais n'est proposé nulle part.

## 4. Mécanismes de recommandation

Par ordre de coût croissant :

- **Lien vers une fiche précise** : le plus simple, à faire en premier.
- **Résumé imprimable** : une page de cours et de méthode, propre à l'impression et au format PDF. C'est le format que les enseignants distribuent réellement, et il circule hors du site.
- **Exercice partageable** : partager un exercice avec ses valeurs, donc une adresse qui encode le tirage. Suppose que les générateurs acceptent une graine.
- **Recommander à un camarade** : à n'ajouter que si le site est déjà utilisé. Un bouton de partage sur un site que personne ne visite ne sert à rien.
- **Ressources pour enseignants et parents** : une page distincte disant ce que le site couvre, sur quel programme il s'appuie, et comment s'en servir en classe ou à la maison. C'est ce que demandera un enseignant avant de recommander quoi que ce soit.

## 5. Diffusion ciblée

Pas de diffusion large. Quatre cercles, dans cet ordre :

1. **Enseignants de spécialité mathématiques.** Le public le plus exigeant et le plus prescripteur. Ils vérifieront la conformité au programme avant de recommander : c'est précisément ce que la relecture a consolidé.
2. **Groupes de parents.** Ils cherchent une ressource gratuite et sérieuse, et transmettent vite.
3. **Forums et communautés d'élèves.** Ils jugent à l'usage, pas au discours.
4. **Associations de soutien scolaire.** Elles ont un besoin structurel de matériel libre et peuvent l'intégrer à leur pratique.

Condition préalable : la relecture indépendante des onze fiches restantes. Une erreur trouvée par un enseignant coûte plus cher que toutes celles corrigées en interne.

## 6. Ce qu'on mesure

Le nombre de visites ne dit rien d'utile ici. Trois indicateurs comptent :

- **Le retour des utilisateurs**, surtout les signalements d'erreur. La capture d'écran qui a révélé le débordement des formules a été plus utile que tous les tests automatiques réunis. Il faut donc un moyen simple de signaler un problème depuis une fiche.
- **Le taux de reprise** : est-ce qu'un élève qui a ouvert une fiche revient une deuxième fois ? C'est le seul signal honnête d'utilité. Le suivi local le permet déjà, sans compte ni traçage.
- **La progression réelle** : un élève qui valide des fiches, pas qui les survole. Le suivi distingue déjà « en cours » de « validée », une validation exigeant le QCM réussi et des exercices justes.

Ces mesures doivent rester compatibles avec le fonctionnement sans compte et hors connexion, qui est une qualité du projet, pas une limite provisoire.

## Ordre suggéré

1. Terminer les deux derniers chapitres.
2. Relire indépendamment les onze fiches des chapitres 7 à 12.
3. Geler la navigation.
4. Construire la page d'entrée.
5. Ajouter le lien vers une fiche précise et le résumé imprimable.
6. Écrire la page pour enseignants et parents.
7. Diffuser auprès du premier cercle, les enseignants, et écouter.

Le reste dépendra de ce que ce premier cercle dira.
