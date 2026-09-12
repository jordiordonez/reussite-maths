#!/usr/bin/env python3
"""Assemble uniquement 10A et 10B depuis le squelette officiel."""
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
PAGES = {'10A': ('10A_cercle_trigonometrique.html', 'Cercle trigonométrique', ['Degrés et radians', 'Une valeur au millième', 'Une longueur parcourue']), '10B': ('10B_derivation_trigonometrie.html', 'Fonctions trigonométriques', ['Une dérivée en un point', 'Une équation', 'Une aire maximale'])}


def build(code, filename, title, titles):
    target = ROOT / 'chapitres/10_trigonometrie' / filename
    skeleton = (ROOT / 'outils/fiche_squelette.html').read_text()
    skeleton = re.sub(r'<!-- SITE:([A-Z]+):START -->.*?<!-- SITE:\1:END -->\n?', '', skeleton, flags=re.S)
    card = re.search(r'  <div class="card" id="ex1">.*?</div>\n  </div>', skeleton, re.S)[0]
    script = next(m for m in re.finditer(r'<script>(.*?)</script>', skeleton, re.S) if 'function wireExercise' in m[1])
    engine = script[1]
    engine = re.sub(r'  function parseNum\(s\) \{.*?\n  \}', '  function parseNum(s) { return Chapter10.parseNum(s); }', engine, count=1, flags=re.S)
    engine = engine.replace('      cur = gen();', '''      var next = gen(), guard = 0;
      while (cur && JSON.stringify(cur.data) === JSON.stringify(next.data) && guard++ < 100) next = gen();
      cur = next;
      Chapter10.activeExercises[n - 1] = cur;''')
    engine = engine.replace("      var v = parseNum($(id + '-rep').value);", "      var raw = $(id + '-rep').value;\n      var v = parseNum(raw);")
    engine = engine.replace('var r = check(cur, v);', 'var r = check(cur, raw);')
    engine = re.sub(r'  var qcmBank = \[.*?\n  \];', '  var qcmBank = Chapter10.qcmBank;', engine, count=1, flags=re.S)
    engine = engine.replace('      qcmMap[i] = { correct:', '      Chapter10.activeQcm[i] = item;\n      qcmMap[i] = { correct:')
    startup = '''  /* ---------- démarrage ---------- */
  Chapter10.activeExercises = [];
  Chapter10.activeQcm = [];
  Chapter10.generators.forEach(function (gen, index) {
    wireExercise(index + 1, gen, function (e, raw) {
      return Chapter10.accepts(e, raw)
        ? {ok: true, msg: 'Correct : le résultat respecte la question et la précision demandée.'}
        : {ok: false, msg: 'Vérifie le signe, l’unité et la précision demandée. Une valeur voisine n’est pas forcément la bonne réponse.'};
    });
  });
  renderQcm();'''
    engine = re.sub(r'  /\* ---------- démarrage ---------- \*/.*?\n  renderQcm\(\);', lambda _: startup, engine, count=1, flags=re.S)
    content = (HERE / (code + '.html')).read_text()
    # Deux égalités indépendantes ne doivent pas former une seule ligne trop large.
    content = content.replace(r',\qquad', ',\\]\\[')
    content += '<section id="exos"><h2>Exercices</h2><p>Respecte la précision de chaque exercice : valeur exacte, arrondi au millième ou entier. Les fractions et décimaux équivalents sont acceptés.</p>'
    for i, ex_title in enumerate(titles, 1):
        content += card.replace('ex1', f'ex{i}').replace('Exercice 1', f'Exercice {i} · {ex_title}').replace('Niveau 1', f'Niveau {i}').replace('placeholder="réponse"', f'aria-label="Réponse à l’exercice {i}" placeholder="réponse"').replace('class="feedback"', 'class="feedback" role="status"')
    content += '</section><section id="qcm"><h2>QCM</h2><div class="card"><p>Quatre questions tirées dans une banque de douze. Une seule réponse correcte par question.</p><div id="qcm-container"></div><div class="score" id="qcm-score" role="status"></div><div class="row"><button id="qcm-new" type="button">Nouveau QCM</button></div></div></section>'
    source = skeleton.replace('TITRE DE LA FICHE', code + ' · ' + title)
    if code == '10B':
        source = source.replace('Première · Mathématiques', 'Terminale · Mathématiques')
    source = re.sub(r'(<main[^>]*>).*?</main>', lambda m: m[1]+'\n'+content+'\n</main>', source, count=1, flags=re.S)
    source = source.replace(script[0], '<script id="chapter10-model">\n'+(HERE/'common.js').read_text()+'\n'+(HERE/(code+'.js')).read_text()+'\n</script>\n<script>'+engine+'</script>\n<script id="chapter10-visuals">\n'+(HERE/'visuals.js').read_text()+'\n</script>')
    css = '''<style>
    .tablewrap{overflow-x:auto;margin:1rem 0}table{border-collapse:collapse;width:100%;font-size:.9rem}th,td{padding:10px;border:1px solid #dce2ec;text-align:left}th{background:#edf3ff}
    .control{display:grid;grid-template-columns:60px minmax(40px,1fr) 75px;align-items:center;gap:10px;margin:16px 0}.control label{color:#475569;font-size:12px}.control input{min-width:0;width:100%}.control output{font-size:13px;text-align:right}.caption{font-size:12px;color:#64748b}.figure{margin:16px auto;max-width:620px;display:block}.row input{min-width:0;width:150px}#vevent{display:block;width:100%;margin:10px 0}
    .proof{margin:16px 0;padding:12px;border:1px solid #dce2ec;border-radius:10px}.proof summary{min-height:44px;cursor:pointer;font-weight:600;color:#1d4ed8}.proof pre{overflow:auto;font-size:12px}.key{overflow-wrap:anywhere}
    select{min-height:44px;max-width:100%;padding:8px;margin:8px 0}.control input{min-height:44px}.figure text{font-family:system-ui,sans-serif;font-size:14px}.control output{overflow-wrap:anywhere}.tablewrap table{min-width:360px}\n    </style>'''
    css = css.replace('</style>', '@media(max-width:600px){.figure text{font-size:26px}#circle text{font-size:18px}}</style>')
    source = source.replace('</head>', css+'\n</head>')
    for token in ['Chapter10.activeExercises[n - 1] = cur','Chapter10.activeQcm[i] = item','check(cur, raw)','Chapter10.generators.forEach']:
        assert token in source, 'Le squelette a changé : '+token
    target.parent.mkdir(exist_ok=True)
    target.write_text(source)
    print(target.relative_to(ROOT))


if __name__ == '__main__':
    for code, (filename, title, titles) in PAGES.items():
        build(code, filename, title, titles)
