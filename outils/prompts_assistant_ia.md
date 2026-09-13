# Tirer le meilleur d'un assistant IA en tant qu'élève de Terminale spé maths

Ces prompts fonctionnent avec ChatGPT, Claude, Gemini, Le Chat de Mistral ou Copilot. Le principe ne dépend pas de l'assistant.

Ce document est la source du chapitre « ChatGPT » de `strategie/reussir_lannee.html`. Il est écrit pour l'élève.

## Ce que permet la version gratuite (à vérifier, l'offre change souvent)

- Accès à un modèle capable de faire des maths de lycée, avec une **limite de messages** par tranche de quelques heures : quand la limite est atteinte, on bascule sur un modèle plus faible. Donc : **une question bien préparée vaut mieux que dix messages flous**.
- Possibilité d'**envoyer une photo** (exercice du manuel, ta copie manuscrite) en nombre limité par jour.
- Un « **Mode étude** » (Study mode) qui pose des questions au lieu de donner la réponse : l'activer quand il existe.
- Pas de garantie de mémoire d'une conversation à l'autre : **recoller le contexte** (le prompt « tuteur » ci-dessous) au début de chaque nouvelle conversation.

## Les 5 règles

1. **Jamais la solution d'abord.** Demander un indice, une question, un rappel de méthode. La solution complète seulement après ton essai écrit.
2. **Toujours vérifier.** un assistant se trompe dans les calculs et parfois dans les théorèmes. Refaire le calcul à la main ou à la calculatrice ; vérifier qu'un théorème cité est bien dans `programmes/`. Si deux réponses diffèrent, le cours du professeur a raison.
3. **Une conversation par chapitre**, commencée par le prompt tuteur.
4. **Envoyer ta copie, pas seulement l'énoncé.** Le meilleur usage : « voici ce que j'ai fait, où est l'erreur ? ».
5. **Pas pour les DM et devoirs notés** (sauf pour comprendre après coup). L'objectif est de réussir seule le jour de l'épreuve.

## Prompts à copier-coller

### P1. Prompt tuteur (début de chaque conversation)

```
Tu es mon tuteur de mathématiques. Je suis en Terminale, enseignement de spécialité mathématiques, en France (programme officiel 2019, Bulletin officiel spécial n°8 du 25 juillet 2019 ; les nouveaux programmes 2026-2027 ne me concernent pas). Mon objectif : [progresser en comprenant / reprendre des bases fragiles / aller plus loin sur les exercices difficiles].
Règles pour toute la conversation :
1. Ne me donne jamais la solution complète d'un exercice tant que je n'ai pas proposé au moins une tentative écrite.
2. Quand je bloque, donne UN seul indice à la fois (une question, un rappel de définition ou la première étape), puis attends ma réponse.
3. Utilise uniquement les notations et théorèmes du programme français de Première et Terminale spé maths. Si un outil est hors programme, dis-le.
4. Quand je propose une réponse, dis d'abord si elle est juste, puis localise précisément l'erreur éventuelle sans la corriger à ma place.
5. Réponses courtes. Formules en LaTeX.
Le chapitre du jour : [CHAPITRE]. Confirme en une phrase et demande-moi mon premier exercice.
```

### P2. Indice progressif

```
Voici l'énoncé : [ÉNONCÉ]. Voici où j'en suis : [CE QUE J'AI ÉCRIT / « je ne sais pas par où commencer »].
Donne-moi uniquement l'indice numéro 1 (le plus léger possible). Si je redemande, tu passeras à l'indice 2, puis 3. La solution complète seulement si je l'écris explicitement.
```

### P3. Vérifie ma solution (avec photo ou texte)

```
Voici l'énoncé et ma résolution [photo / texte]. Ne refais pas l'exercice.
1. Ma réponse finale est-elle juste ?
2. Si non, à quelle ligne exactement se trouve la première erreur ? Explique en une phrase pourquoi c'est une erreur, sans donner la correction.
3. Ma rédaction est-elle acceptable pour le bac (justifications, théorèmes cités) ? Un conseil maximum.
```

### P4. Génère des exercices semblables (difficulté croissante)

```
Voici un exercice que je viens de réussir : [ÉNONCÉ]. Génère 3 exercices du même type :
- le premier avec seulement les nombres changés,
- le deuxième avec une étape supplémentaire ou une donnée présentée autrement,
- le troisième dans un contexte différent (problème concret ou question de démonstration) mais qui utilise la même méthode.
Donne seulement les énoncés. Garde les réponses pour quand je te les demanderai, une par une.
```

### P5. Explique mon erreur (pour le carnet d'erreurs)

```
Je me suis trompée sur cet exercice : [ÉNONCÉ]. J'ai écrit [MA RÉPONSE], la bonne réponse est [CORRIGÉ].
1. Quel type d'erreur est-ce (calcul, méthode, lecture d'énoncé, connaissance du cours) ?
2. Quelle règle ou définition du cours j'ai mal appliquée ? Cite-la.
3. Propose une phrase courte que je peux noter dans mon carnet d'erreurs pour ne pas la refaire.
4. Donne-moi UN exercice court pour vérifier que j'ai compris.
```

### P6. Fiche de méthode

```
Pour le type d'exercice « [TYPE, ex. : calculer la distance d'un point à un plan] » en Terminale spé maths (programme 2019), écris une fiche de méthode : les étapes numérotées, le théorème ou la formule utilisée à chaque étape, les 3 erreurs les plus fréquentes, et un exemple résolu très court. Maximum 20 lignes.
```

### P7. Interrogation flash (rappel actif)

```
Fais-moi une interrogation orale de 5 questions sur [CHAPITRE] : définitions, formules, et un petit calcul mental. Pose une question à la fois, attends ma réponse, corrige en une phrase, puis passe à la suivante. À la fin, donne mon score et la notion à revoir.
```

### P8. Retour en arrière (prérequis)

```
Je n'arrive pas à faire [TYPE D'EXERCICE]. Quels sont les prérequis de Seconde ou de Première qu'il faut maîtriser pour ça ? Pose-moi une question de vérification sur chacun pour trouver celui qui me manque.
```

### P9. Préparer un contrôle

```
J'ai un contrôle sur [CHAPITRES] dans [N] jours. Propose un plan de révision en sessions de 30 minutes : chaque session commence par 5 minutes de rappel de cours sans le regarder, puis des exercices de difficulté croissante, et se termine par une auto-évaluation. Mélange les chapitres à partir de la deuxième session.
```

### P10. Reformuler un point de cours

```
Je ne comprends pas cette phrase de mon cours : « [PHRASE] ». Explique-la avec des mots simples, puis avec un exemple numérique, puis avec un dessin décrit en mots. Ensuite pose-moi une question pour vérifier que j'ai compris.
```

## Utiliser les scans efficacement

- Photographier à plat, bonne lumière, une page par photo.
- Écrire dans le message : « exercice [numéro] page [page] du manuel [nom], chapitre [chapitre] » pour donner le contexte.
- Après correction, noter dans le carnet de suivi (dans `strategie/reussir_lannee.html`) : fiche, exercice, OK / à revoir, date.
- Copier le bilan du carnet et le coller dans l'assistant avec le prompt P4 pour obtenir des exercices ciblés sur ce qui est « à revoir ».

## Quand envisager un abonnement (ChatGPT Plus, ou Claude Pro)

Indicateurs : la limite gratuite est atteinte plus de 2 fois par semaine ; besoin d'envoyer plus de photos ; envie d'un « Projet » qui garde en mémoire le programme, le carnet de suivi et les exercices déjà faits.

Ce que permettrait un projet abonné (« Projet Maths Terminale ») :
1. Fichiers du projet : `programmes/resume_par_chapitre.md`, la liste des fiches, le carnet de suivi exporté.
2. Instructions du projet : le prompt tuteur P1.
3. Routine : scanner l'exercice fait → « vérifie » (P3) → l'IA met à jour le tableau de suivi (OK / à revoir) → « génère 3 exercices ciblés sur mes “à revoir” » (P4) → scanner les nouveaux essais.

Avant de payer : essayer d'abord 3 semaines avec la version gratuite et le carnet de suivi du document de stratégie. Décider ensuite avec les indicateurs ci-dessus.
