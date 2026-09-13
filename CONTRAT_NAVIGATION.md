# Contrat de navigation

Ce document fixe ce qui ne doit plus changer dans le site. Il a été écrit le 13 septembre 2026, quand le programme de Terminale a été couvert en entier, juste avant que le site soit partagé hors du cercle familial.

**Pourquoi.** Tant que le site n'avait qu'une utilisatrice, réorganiser ne coûtait rien. Dès qu'un enseignant partage un lien, qu'un parent le transmet ou qu'un élève ajoute une fiche à son écran d'accueil, chaque changement de structure casse quelque chose chez quelqu'un qui n'est pas là pour le signaler. Ce document échange une liberté de réorganisation contre la fiabilité des liens.

## Ce qui est gelé

### 1. Les adresses des fiches

Le chemin d'une fiche publiée ne change plus :

```
chapitres/<NN>_<nom_du_chapitre>/<CODE>_<nom_de_la_fiche>.html
```

Les trente-six fiches existantes gardent leur adresse actuelle, définitivement. Une fiche n'est ni renommée, ni déplacée, ni supprimée.

C'est la règle la plus importante : un lien vers la première fiche du dépôt, partagé au tout début du projet, fonctionne encore aujourd'hui. Cette propriété doit survivre à tout le reste.

### 2. Les adresses des pages principales

| Page | Adresse | Rôle |
|---|---|---|
| Accueil | `index.html` | Point d'entrée, reprise de séance |
| Chapitres | `chapitres.html` | Catalogue complet |
| Méthode | `strategie/reussir_lannee.html` | Guide de travail |
| Mes progrès | `progres.html` | Suivi et carnet |

### 3. Les quatre destinations du bandeau

Accueil, Chapitres, Méthode, Mes progrès. **Dans cet ordre, avec ces mots.** Le nombre de destinations, leur ordre et leur intitulé sont fixes. Une cinquième destination ne s'ajoute pas sans nécessité démontrée.

### 4. Les ancres de section dans les fiches

Les cinq sections gardent leurs identifiants : `#cours`, `#methode`, `#visu`, `#exos`, `#qcm`. Un lien vers la méthode d'une fiche précise doit rester valide.

Le libellé affiché peut changer, l'identifiant non. C'est déjà le cas : la troisième section s'appelle « Explorer » alors que son identifiant reste `visu`.

### 5. La clé de sauvegarde du suivi

`reussite_maths_v1` dans le stockage local du navigateur.

Elle a déjà changé une fois, l'ancienne étant `carnet_maths_v1`. Le code récupère toujours l'ancienne, ce qui a évité une perte de données. **Toute nouvelle clé devra faire de même, sans exception.** Un élève qui perd son suivi sans message ne revient pas.

### 6. Le nom du site

« Réussite Spé Maths », sans logo ni pastille dans le bandeau.

## Ce qui reste libre

- L'apparence : couleurs, typographie, mise en page, illustrations.
- Le contenu des fiches : cours, méthode, exercices, QCM, visualisations.
- L'ajout de nouvelles fiches et de nouveaux chapitres, qui suivent simplement la convention de nommage.
- Le contenu des quatre pages principales, tant que leur rôle et leur adresse ne changent pas.
- Tout ce qui relève de l'accessibilité et de la correction de défauts.

## Si une exception devient nécessaire

Elle doit être rare et traitée, pas subie.

**Une adresse doit changer** : l'ancienne continue de fonctionner. Sur un hébergement sans redirection côté serveur, comme le nôtre, l'ancien fichier est conservé et redirige vers le nouveau. On ne supprime jamais une adresse publiée.

**La clé de stockage doit changer** : la nouvelle version lit l'ancienne clé au premier démarrage et reprend son contenu, sans supprimer l'original. C'est ce qui a été fait pour la clé précédente.

**Une destination doit être renommée** : à éviter. Un élève retient l'emplacement des choses, pas leur nom. Si c'est inévitable, la position dans le bandeau ne bouge pas.

## Vérification

`outils/check_site.py` contrôle déjà que tous les liens internes et toutes les ancres sont valides. Il faut le lancer après toute modification touchant la navigation.

Ce contrôle ne voit pas les liens partagés à l'extérieur. C'est précisément pour eux que ce document existe.
