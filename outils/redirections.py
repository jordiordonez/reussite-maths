#!/usr/bin/env python3
"""Crée une page de redirection pour chaque ancienne adresse de fiche.

CONTRAT_NAVIGATION.md l'exige : une adresse publiée n'est jamais supprimée.
Sur un hébergement sans redirection côté serveur, on laisse à l'ancienne
place une page minuscule qui renvoie vers la nouvelle.
"""
from pathlib import Path
import glob, os, re

RACINE = Path(__file__).resolve().parent.parent
MAP = {anc: nouv for nouv, anc in enumerate([15] + list(range(1, 15)), start=1)}

GABARIT = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Page déplacée · Réussite Spé Maths</title>
<link rel="canonical" href="{rel}">
<meta http-equiv="refresh" content="0; url={rel}">
<style>body{{margin:0;background:#faf8f5;color:#1f2937;font-family:system-ui,-apple-system,sans-serif;
display:grid;place-items:center;min-height:100vh;padding:24px;text-align:center;line-height:1.6}}
a{{color:#2563eb}}</style>
</head>
<body>
<div>
<p>Cette fiche a changé d’adresse lors de la renumérotation des chapitres.</p>
<p><a href="{rel}">Ouvrir « {titre} »</a></p>
</div>
<script>location.replace("{rel}");</script>
</body>
</html>
"""

def titre_de(chemin):
    s = open(chemin, encoding='utf-8').read(4000)
    m = re.search(r'<title>([^<]+)</title>', s)
    return (m.group(1).split('·')[0].strip() if m else 'la fiche')

def construire():
    os.chdir(RACINE)
    suffixes = {int(d.split('/')[1][:2]): d.split('/')[1] for d in glob.glob('chapitres/*/')}
    faits = 0
    for anc, nouv in MAP.items():
        dossier_nouv = suffixes.get(nouv)
        if not dossier_nouv:
            continue
        suffixe = dossier_nouv.split('_', 1)[1]
        anc_dossier = Path(f'chapitres/{anc:02d}_{suffixe}')
        for f in sorted(glob.glob(f'{dossier_nouv and "chapitres/"+dossier_nouv}/*.html')):
            base = os.path.basename(f)
            m = re.match(rf'{nouv}([A-E])_(.*)$', base)
            if not m:
                continue
            anc_nom = f'{anc}{m.group(1)}_{m.group(2)}'
            cible = anc_dossier / anc_nom
            if cible.exists():
                continue
            cible.parent.mkdir(parents=True, exist_ok=True)
            rel = os.path.relpath(f, cible.parent)
            cible.write_text(GABARIT.format(rel=rel, titre=titre_de(f)), encoding='utf-8')
            faits += 1
    print(f"  {faits} redirections créées")

if __name__ == '__main__':
    construire()
