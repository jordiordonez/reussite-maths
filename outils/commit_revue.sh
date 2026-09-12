#!/usr/bin/env bash
# Committe la relecture d'UNE fiche sans emporter le travail en cours d'un autre outil.
# Usage : bash outils/commit_revue.sh <CODE> <chemin_fiche> <fichier_message>
set -euo pipefail
cd "$(dirname "$0")/.."

CODE="$1"; FICHE="$2"; MSG="$3"

# 1) Ne mettre en index que les trois fichiers de cette relecture.
git add "$FICHE" "revue/${CODE}.md" revue/ETAT.md

# 2) Refuser si autre chose a été ajouté par erreur.
AUTRES=$(git diff --cached --name-only | grep -v -e "^${FICHE}$" -e "^revue/${CODE}.md$" -e "^revue/ETAT.md$" || true)
if [ -n "$AUTRES" ]; then
  echo "ARRÊT : des fichiers étrangers sont dans l'index :" >&2
  echo "$AUTRES" >&2
  exit 1
fi

# 3) Récupérer d'abord le travail distant, en rejouant le mien par-dessus.
GIT_TERMINAL_PROMPT=0 git pull --rebase --autostash -q origin main

git commit -q -F "$MSG"
GIT_TERMINAL_PROMPT=0 git push -q origin main
echo "Relecture ${CODE} publiée."

# 4) Signaler ce qui reste non committé : c'est le travail d'un autre outil.
RESTE=$(git status --short || true)
if [ -n "$RESTE" ]; then
  echo "Laissé de côté (travail en cours d'un autre outil) :"
  echo "$RESTE"
fi
