#!/usr/bin/env bash
# Génère une copie personnalisée du guide de méthode, hors dépôt Git.
# Usage : bash outils/perso.sh "Prénom"
set -euo pipefail
cd "$(dirname "$0")/.."
if [ $# -lt 1 ]; then
  echo "Usage : bash outils/perso.sh \"Prénom\"" >&2
  exit 1
fi
NOM="$1"
SRC="strategie/reussir_lannee.html"
DST="strategie/reussir_lannee_perso.html"
sed "s|<div class=\"who\">Programme officiel 2019|<div class=\"who\">Pour ${NOM} · programme officiel 2019|" "$SRC" > "$DST"
echo "Écrit : $DST (pour ${NOM})"
