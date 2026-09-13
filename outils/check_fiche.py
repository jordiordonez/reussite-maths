#!/usr/bin/env python3
"""Vérification rapide d'une fiche HTML : structure attendue + syntaxe JS (node --check).
Usage : python3 outils/check_fiche.py chapitres/01_produit_scalaire/1A_produit_scalaire_definitions.html [...]
"""
import re, subprocess, sys, tempfile, os

REQUIRED = [
    ("<!DOCTYPE html>", "doctype"),
    ("mathjax", "MathJax local"),
    ("qcmMap", "objet qcmMap pour le QCM"),
    ("Nouvel exercice", "bouton Nouvel exercice"),
    ("Nouveau QCM", "bouton Nouveau QCM"),
    ("viewport", "meta viewport"),
]
FORBIDDEN = [
    (re.compile(r'onclick\s*=\s*"[^"]*\{'), "onclick inline contenant des données"),
    (re.compile(r'C\(\s*n\s*,\s*k\s*\)'), "notation C(n,k) au lieu de \\binom"),
]

def check(path):
    ok = True
    html = open(path, encoding="utf-8").read()
    # Les pages laissées aux anciennes adresses après renumérotation ne sont
    # pas des fiches : elles redirigent. Voir outils/redirections.py.
    if 'http-equiv="refresh"' in html:
        print(f"  → redirection : {os.path.basename(path)}")
        return True
    low = html.lower()
    for needle, label in REQUIRED:
        if needle.lower() not in low:
            print(f"  ✗ manque : {label}"); ok = False
    for rx, label in FORBIDDEN:
        if rx.search(html):
            print(f"  ✗ interdit : {label}"); ok = False
    for sec in ["Cours", "Méthode", "Visualisation", "Exercices", "QCM"]:
        if sec.lower() not in low:
            print(f"  ✗ section absente : {sec}"); ok = False
    scripts = re.findall(r'<script(?![^>]*src=)(?![^>]*type="application/json")[^>]*>(.*?)</script>', html, flags=re.S)
    for i, s in enumerate(scripts):
        if "MathJax" in s and "tex" in s and len(s) < 800:
            continue  # bloc de config MathJax
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
            f.write(s); tmp = f.name
        r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True)
        os.unlink(tmp)
        if r.returncode != 0:
            print(f"  ✗ erreur JS (script {i}) :\n{r.stderr.strip()[:800]}"); ok = False
    size = len(html.encode("utf-8")) // 1024
    print(f"  {'✓' if ok else '✗'} {os.path.basename(path)} ({size} Ko, {len(scripts)} scripts)")
    return ok

if __name__ == "__main__":
    paths = sys.argv[1:]
    res = [check(p) for p in paths]
    sys.exit(0 if all(res) else 1)
