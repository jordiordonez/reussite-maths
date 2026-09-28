#!/usr/bin/env python3
"""Intègre seulement 13A/13B (sources 12A/12B) et les hubs, sans exposer les brouillons parallèles.

Le catalogue conserve les fiches déjà exposées dans chapitres.html, puis ajoute
13A et 13B. Les nouveaux fichiers de Claude ne sont pas publiés implicitement.
"""
from pathlib import Path
import importlib.util
import json
import re
import sys

sys.dont_write_bytecode=True

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('site_builder',ROOT/'outils/build_site.py')
builder=importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)
source=(ROOT/'chapitres.html').read_text()
config=json.loads(re.search(r'<script id="site-config" type="application/json">(.*?)</script>',source,re.S)[1])
allowed={l['id'] for c in config['chapters'] for l in c['lessons']} | {'13A','13B'}
catalog=builder.catalog()
for chapter in catalog:
    chapter['lessons']=[l for l in chapter['lessons'] if l['id'] in allowed]
builder.catalog=lambda:catalog
builder.build(['chapitres/13_calcul_integral/13A_integrales_aires.html',
               'chapitres/13_calcul_integral/13B_integration_methodes.html',
               'index.html','chapitres.html','progres.html'])
