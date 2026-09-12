#!/usr/bin/env python3
"""Assemble uniquement 8A depuis le squelette officiel, sans écrire les autres fiches."""
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
TARGET = ROOT / 'chapitres/08_combinatoire_denombrement/8A_combinatoire_denombrement.html'


def main():
    skeleton = (ROOT / 'outils/fiche_squelette.html').read_text()
    skeleton = re.sub(r'<!-- SITE:([A-Z]+):START -->.*?<!-- SITE:\1:END -->\n?', '', skeleton, flags=re.S)
    card = re.search(r'  <div class="card" id="ex1">.*?</div>\n  </div>', skeleton, re.S)[0]
    script = next(m for m in re.finditer(r'<script>(.*?)</script>', skeleton, re.S) if 'function wireExercise' in m[1])
    engine = script[1]
    engine = re.sub(r'  function parseNum\(s\) \{.*?\n  \}', '  function parseNum(s) { return Chapter8.parseNum(s); }', engine, count=1, flags=re.S)
    engine = engine.replace('      cur = gen();', '''      var next = gen(), guard = 0;
      while (cur && JSON.stringify(cur.data) === JSON.stringify(next.data) && guard++ < 100) next = gen();
      cur = next;
      Chapter8.activeExercises[n - 1] = cur;''')
    engine = engine.replace("      var v = parseNum($(id + '-rep').value);", "      var raw = $(id + '-rep').value;\n      var v = parseNum(raw);")
    engine = engine.replace('var r = check(cur, v);', 'var r = check(cur, raw);')
    engine = re.sub(r'  var qcmBank = \[.*?\n  \];', '  var qcmBank = Chapter8.qcmBank;', engine, count=1, flags=re.S)
    engine = engine.replace('      qcmMap[i] = { correct:', '      Chapter8.activeQcm[i] = item;\n      qcmMap[i] = { correct:')
    startup = '''  /* ---------- démarrage ---------- */
  Chapter8.activeExercises = [];
  Chapter8.activeQcm = [];
  Chapter8.generators.forEach(function (gen, index) {
    wireExercise(index + 1, gen, function (e, raw) {
      return Chapter8.accepts(e, raw)
        ? {ok: true, msg: 'Correct : ce nombre compte exactement les objets demandés.'}
        : {ok: false, msg: 'Ce nombre n’est pas exact. Vérifie si l’ordre compte, si les répétitions sont autorisées et si les cas se recouvrent.'};
    });
  });
  renderQcm();'''
    engine = re.sub(r'  /\* ---------- démarrage ---------- \*/.*?\n  renderQcm\(\);', lambda _: startup, engine, count=1, flags=re.S)
    titles = ['Former un identifiant', 'Attribuer des postes distincts', 'Former une équipe sous contrainte']
    content = (HERE / 'content.html').read_text()
    # Deux égalités indépendantes ne doivent pas former une seule ligne trop large.
    content = content.replace(r',\qquad', ',\\]\\[')
    content += '<section id="exos"><h2>Exercices</h2><p>Donne le nombre exact demandé : un entier positif ou nul, sans arrondi.</p>'
    for i, title in enumerate(titles, 1):
        content += card.replace('ex1', f'ex{i}').replace('Exercice 1', f'Exercice {i} · {title}').replace('Niveau 1', f'Niveau {i}').replace('placeholder="réponse"', f'aria-label="Réponse à l’exercice {i}" placeholder="nombre exact"').replace('class="feedback"', 'class="feedback" role="status"')
    content += '</section><section id="qcm"><h2>QCM</h2><div class="card"><p>Quatre questions tirées dans une banque de quinze. Une seule réponse correcte par question.</p><div id="qcm-container"></div><div class="score" id="qcm-score" role="status"></div><div class="row"><button id="qcm-new" type="button">Nouveau QCM</button></div></div></section>'
    source = skeleton.replace('TITRE DE LA FICHE', '8A · Combinatoire et dénombrement').replace('Première · Mathématiques', 'Terminale · Mathématiques')
    source = re.sub(r'(<main[^>]*>).*?</main>', lambda m: m[1]+'\n'+content+'\n</main>', source, count=1, flags=re.S)
    source = source.replace(script[0], '<script id="chapter8-model">\n'+(HERE/'model.js').read_text()+'\n</script>\n<script>'+engine+'</script>\n<script id="chapter8-visuals">\n'+(HERE/'visuals.js').read_text()+'\n</script>')
    css = '''<style>
    .tablewrap{overflow-x:auto;margin:1rem 0}table{border-collapse:collapse;width:100%;font-size:.9rem}th,td{padding:10px;border:1px solid #dce2ec;text-align:left}th{background:#edf3ff}td:first-child{min-width:140px}
    .control{display:grid;grid-template-columns:minmax(90px,1fr) 2fr 26px;align-items:center;gap:10px;margin:16px 0}.control label{color:#475569;font-size:12px}.control input{min-width:0;width:100%}.control output{font-size:13px;text-align:right}.caption{font-size:12px;color:#64748b}.figure{margin:16px auto;max-width:540px;display:block}.row input{min-width:0;width:155px}#vmode{display:block;width:100%;margin:10px 0}
    .count-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:20px 0}.count-grid>div{padding:10px 4px;text-align:center;background:#edf3ff;border-radius:10px;font-size:11px}.count-grid strong{display:block;font-size:20px;color:#1d4ed8;overflow-wrap:anywhere}
    .proof{margin:16px 0;padding:12px;border:1px solid #dce2ec;border-radius:10px}.proof summary{min-height:44px;cursor:pointer;font-weight:600;color:#1d4ed8}.proof pre{white-space:pre;overflow:auto;font-size:12px}.subset-toggle[aria-pressed="true"]{background:#15803d;color:#fff}.subset-toggle[aria-pressed="false"]{background:#e8efff;color:#1d4ed8}
    </style>'''
    source = source.replace('</head>', css+'\n</head>')
    for token in ['Chapter8.activeExercises[n - 1] = cur','Chapter8.activeQcm[i] = item','check(cur, raw)','Chapter8.generators.forEach']:
        assert token in source, 'Le squelette a changé : '+token
    TARGET.parent.mkdir(exist_ok=True)
    TARGET.write_text(source)
    print(TARGET.relative_to(ROOT))


if __name__ == '__main__':
    main()
