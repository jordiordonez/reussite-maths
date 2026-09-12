# Protocole de relecture mathématique d'une fiche

Objectif : trouver ce qui est **faux**, pas ce qui est perfectible. Une correction erronée enseigne une méthode erronée : c'est le seul défaut qui fait du mal.

## Règle de résilience

**Écris ton rapport dans `revue/<CODE>.md` dès la première anomalie trouvée, puis complète-le au fur et à mesure.** N'attends pas la fin de ton analyse. Si tu es interrompu, le travail déjà fait doit rester sur le disque.

Même chose pour les corrections : applique chaque correction dans la fiche dès que tu l'as validée, une par une, plutôt que d'accumuler.

## Ce qu'il faut vérifier, dans cet ordre

1. **Générateurs d'exercices.** Pour chaque exercice, extrais la logique et réimplémente le calcul attendu **indépendamment** en Python. Fais au moins 200 tirages et compare la réponse attendue par ta réimplémentation à celle qu'accepte la fonction de vérification de la fiche. Tout écart est un défaut.
2. **Textes de correction.** Relis chaque correction générée sur plusieurs tirages, y compris avec des valeurs négatives. Cherche : résultat numérique faux, étape manquante, notation fautive (un nombre négatif élevé au carré doit être entre parenthèses), affirmation mathématiquement fausse, répétition absurde.
3. **Banque de QCM.** Pour chaque question, vérifie que la réponse marquée correcte l'est réellement, que les trois autres sont réellement fausses, et que l'explication est juste. Vérifie aussi qu'aucune question ne peut produire deux options identiques.
4. **Cours.** Contrôle chaque énoncé de théorème : hypothèses complètes, conclusion exacte, quantificateurs corrects. Vérifie que les démonstrations annoncées exigibles par le programme sont présentes et justes. Signale tout contenu hors programme présenté comme exigible.
5. **Visualisation.** Vérifie les formules calculées en direct sur quelques valeurs, notamment aux bords (division par zéro, valeurs négatives, cas dégénérés).
6. **Conformité au programme.** Compare avec `programmes/resume_par_chapitre.md` et, si besoin, le texte officiel dans `programmes/`. Signale une notion absente du programme de la classe concernée.

## Ce que tu corriges, ce que tu signales

- **Tu corriges directement** : erreur de calcul, notation fautive, explication fausse, réponse de QCM mal marquée, générateur qui accepte une mauvaise réponse.
- **Cas particulier à toujours corriger : les tolérances trop larges.** Si l'énoncé demande une valeur « au degré près » ou « au dixième », la vérification ne doit accepter que le bon arrondi, ou au plus un demi-rang d'écart avec la valeur exacte. Une tolérance d'un rang entier félicite l'élève pour une réponse fausse : c'est le pire défaut possible dans une fiche d'entraînement. Vérifie chaque exercice sur ce point.
- **Tu signales sans corriger** : choix pédagogique discutable, formulation lourde, manque jugé gênant. Ce n'est pas l'objet de cette passe.

## Format du rapport `revue/<CODE>.md`

```markdown
# Revue mathématique — <CODE> <titre>

Statut : en cours | terminé
Date : <date>

## Anomalies corrigées
| # | Endroit | Ce qui était faux | Correction appliquée |
|---|---|---|---|

## Points signalés, non corrigés
| # | Endroit | Observation |
|---|---|---|

## Contrôles effectués
- Générateurs : <nombre de tirages, écarts trouvés>
- QCM : <nombre de questions relues, erreurs trouvées>
- Cours : <théorèmes vérifiés>
- Conformité au programme : <verdict>

## Verdict
<une phrase : la fiche est mathématiquement fiable, ou ce qui reste à traiter>
```

Si tu ne trouves aucune anomalie, dis-le explicitement : c'est un résultat, pas un échec.

## Avant de conclure

Relance `python3 outils/check_fiche.py <fiche>` puis `python3 outils/check_site.py`. Si tu as modifié la fiche, vérifie aussi son rendu avec Playwright en 390 px : aucune erreur JavaScript, aucun débordement, aucune macro LaTeX non reconnue.

Ne touche à aucun autre fichier que la fiche relue et son rapport.
