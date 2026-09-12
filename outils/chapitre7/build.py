#!/usr/bin/env python3
"""Assemble les trois fiches à partir du squelette officiel et des sources 7A/B/C.

La production est distincte de la relecture : ne pas relancer cet assembleur
après une correction directe d'un HTML sans reporter cette correction ici.
"""
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
DEST = ROOT / 'chapitres/07_probabilites'
SHEETS = [('7A', 'probabilites_conditionnelles', 'Probabilités conditionnelles et indépendance', 'Première'),
          ('7B', 'variables_aleatoires', 'Variables aléatoires, espérance et variance', 'Première'),
          ('7C', 'epreuves_independantes_bernoulli', 'Épreuves indépendantes et schéma de Bernoulli', 'Terminale')]


def main():
    skeleton = (ROOT / 'outils/fiche_squelette.html').read_text()
    skeleton = re.sub(r'<!-- SITE:([A-Z]+):START -->.*?<!-- SITE:\1:END -->\n?', '', skeleton, flags=re.S)
    exercise = re.search(r'  <div class="card" id="ex1">.*?</div>\n  </div>', skeleton, re.S)[0]
    engine_match = next(m for m in re.finditer(r'<script>(.*?)</script>', skeleton, re.S) if 'function wireExercise' in m[1])
    engine = engine_match[1]
    engine = re.sub(r'  function parseNum\(s\) \{.*?\n  \}', '  function parseNum(s) { return Chapter7.parseNum(s); }', engine, count=1, flags=re.S)
    engine = engine.replace('      cur = gen();', '      var next = gen(), guard = 0;\n      while (cur && JSON.stringify(cur.data) === JSON.stringify(next.data) && guard++ < 100) next = gen();\n      cur = next;\n      Chapter7.activeExercises[n - 1] = cur;')
    engine = engine.replace("      var v = parseNum($(id + '-rep').value);", "      var raw = $(id + '-rep').value;\n      var v = parseNum(raw);")
    engine = engine.replace('var r = check(cur, v);', 'var r = check(cur, raw);')
    engine = re.sub(r'  var qcmBank = \[.*?\n  \];', '  var qcmBank = Chapter7.qcmBank;', engine, count=1, flags=re.S)
    engine = engine.replace('      qcmMap[i] = { correct:', '      Chapter7.activeQcm[i] = item;\n      qcmMap[i] = { correct:')
    startup = '''  /* ---------- démarrage ---------- */
  Chapter7.activeExercises = [];
  Chapter7.activeQcm = [];
  Chapter7.generators.forEach(function (gen, index) {
    wireExercise(index + 1, gen, function (e, raw) {
      return Chapter7.accepts(e, raw)
        ? {ok: true, msg: 'Correct : cette valeur exacte répond à la question.'}
        : {ok: false, msg: 'Ce résultat n’est pas exact. Vérifie les données utilisées et garde les fractions jusqu’au bout.'};
    });
  });
  renderQcm();'''
    engine = re.sub(r'  /\* ---------- démarrage ---------- \*/.*?\n  renderQcm\(\);', lambda _: startup, engine, count=1, flags=re.S)
    css = '''<style>
    .tablewrap{overflow-x:auto;margin:.8rem 0}table{border-collapse:collapse;width:100%;font-size:.9rem}th,td{padding:9px;border:1px solid #dce2ec;text-align:center;white-space:nowrap}th{background:#edf3ff}
    .control{display:grid;grid-template-columns:minmax(95px,1fr) 2fr 44px;align-items:center;gap:10px;margin:14px 0}.control label{color:#475569;font-size:12px}.control output{font-size:13px;text-align:right;font-variant-numeric:tabular-nums}.caption{font-size:12px;color:#64748b}.figure{margin:16px 0}.row input{min-width:0;width:160px}.row select{max-width:100%}
    @media(max-width:380px){.control{grid-template-columns:95px 1fr 30px;gap:6px}}
    </style>'''
    DEST.mkdir(exist_ok=True)
    for code, slug, title, level in SHEETS:
        target = DEST / f'{code}_{slug}.html'
        content = (HERE / f'{code}.html').read_text()
        content += '<section id="exos"><h2>Exercices</h2><p>Réponds avec une fraction (ex. 3/10) ou un décimal exact (ex. 0,3). Aucun arrondi n’est demandé.</p>'
        for i in range(1, 4):
            content += exercise.replace('ex1', f'ex{i}').replace('Exercice 1', f'Exercice {i}').replace('Niveau 1', f'Niveau {i}').replace('placeholder="réponse"', f'aria-label="Réponse à l’exercice {i}" placeholder="fraction ou décimal exact"').replace('class="feedback"', 'class="feedback" role="status"')
        content += '</section><section id="qcm"><h2>QCM</h2><div class="card"><p>Quatre questions tirées dans une banque de douze. Une seule réponse correcte par question.</p><div id="qcm-container"></div><div class="score" id="qcm-score" role="status"></div><div class="row"><button id="qcm-new" type="button">Nouveau QCM</button></div></div></section>'
        source = skeleton.replace('TITRE DE LA FICHE', code+' · '+title).replace('Première · Mathématiques', level+' · Mathématiques')
        source = re.sub(r'(<main[^>]*>).*?</main>', lambda m: m[1]+'\n'+content+'\n</main>', source, count=1, flags=re.S)
        models = (HERE / 'common.js').read_text()+'\n'+(HERE / f'{code}.js').read_text()
        source = source.replace(engine_match[0], '<script id="chapter7-model">\n'+models+'\n</script>\n<script>'+engine+'</script>\n<script id="chapter7-visuals">\n'+(HERE/'visuals.js').read_text()+'\n</script>')
        source = source.replace('</head>', css+'\n</head>')
        target.write_text(source)
        print(target.relative_to(ROOT))


if __name__ == '__main__':
    main()
