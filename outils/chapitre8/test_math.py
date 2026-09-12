#!/usr/bin/env python3
"""Oracle indépendant : énumérer les objets, sans recopier les formules JS."""
from fractions import Fraction
from functools import lru_cache
from itertools import product, permutations, combinations
from math import comb
from pathlib import Path
import html
import json
import re
import subprocess
import sys

HERE = Path(__file__).resolve().parent


@lru_cache(None)
def count(n, k, mode):
    iterator = {'words': lambda: product(range(n), repeat=k),
                'ordered': lambda: permutations(range(n), k),
                'choose': lambda: combinations(range(n), k)}[mode]()
    return sum(1 for _ in iterator)


@lru_cache(None)
def teams(a, b, k, require_a):
    return sum(not require_a or any(i<a for i in xs) for xs in combinations(range(a+b), k))


def exercise_answer(index, d):
    if index == 0:
        # Each object is a letter sequence paired with an allowed final digit.
        return count(d['letters'], d['k'], 'words') * len(range(d['digits']))
    if index == 1:
        return count(d['n'], d['k'], 'ordered')
    return teams(d['a'], d['b'], d['k'], True)


CONCEPTS = {
    'order': 'Choisir trois personnes sans rôle parmi huit personnes distinctes.',
    'overlap': 'Non : les éléments communs seraient comptés deux fois.',
}


def qcm_answer(kind, d):
    if kind in CONCEPTS:
        return CONCEPTS[kind]
    if kind == 'add':
        return len({('A', i) for i in range(d['a'])} | {('B', i) for i in range(d['b'])})
    if kind == 'product':
        return sum(1 for _ in product(range(d['a']), range(d['b'])))
    if kind in ('words', 'ordered', 'choose'):
        return count(d['n'], d['k'], kind)
    if kind == 'permutations':
        return count(d['n'], d['n'], 'ordered')
    if kind in ('subsets', 'sum'):
        return sum(count(d['n'], k, 'choose') for k in range(d['n']+1))
    if kind == 'boundary':
        return count(d['n'], 0, 'choose')
    if kind == 'symmetry':
        return count(d['n'], d['n']-d['k'], 'choose')
    if kind == 'pascal':
        return count(d['n'], d['k'], 'choose') + count(d['n'], d['k']+1, 'choose')
    if kind == 'zeroFactorial':
        return count(0, 0, 'ordered')
    if kind == 'successPaths':
        return sum(w.count('S') == d['k'] for w in product('SE', repeat=d['n']))
    raise AssertionError(kind)


def oracle(query):
    return {'exercises': [exercise_answer(i,e['data']) for i,e in enumerate(query['exercises'])],
            'qcm': [q['options'].index(str(qcm_answer(q['kind'],q['data']))) for q in query['qcm']]}


def main():
    data = json.loads(subprocess.check_output(['node', str(HERE/'test_math.cjs'), 'sample']))
    jobs=[]
    expected=[]
    empty_forbidden=0
    stats={'exercises':0,'qcm':0,'comparisons':0,'visual_configurations':0}
    for index, rows in enumerate(data['exercises']):
        for e in rows:
            d=e['data']; answer=exercise_answer(index,d)
            assert answer==e['answer'], (index,d,'réponse générée')
            assert f'={answer}.' in e['correction'], (index,d,'résultat de correction')
            if index==0:
                letters=count(d['letters'],d['k'],'words')
                assert f'={letters}.' in e['correction']
                assert f'{letters}\\times{d["digits"]}={answer}' in e['correction']
            elif index==1:
                factors='\\times'.join(str(d['n']-i) for i in range(d['k']))
                assert f'{factors}={answer}' in e['correction']
            else:
                all_teams=teams(d['a'],d['b'],d['k'],False)
                forbidden=count(d['b'],d['k'],'choose')
                assert all_teams-forbidden==answer
                assert f'{all_teams}-{forbidden}={answer}' in e['correction']
                if not forbidden:
                    assert 'aucune équipe interdite' in e['correction']
                    empty_forbidden+=1
            yes=[str(answer),f'{answer},0',f'{answer}.000',f'{answer*7}/7',f'+{answer}']
            no=[str(answer+1),str(answer-1),str(Fraction(answer)+Fraction(1,100)),str(Fraction(answer)-Fraction(1,100)),
                str(Fraction(answer)+Fraction(1,10**12)),str(Fraction(answer)-Fraction(1,10**12)),
                '-1','','abc','1/0','Infinity','NaN','0x10',str(answer)+' personnes']
            jobs.append({'answer':answer,'inputs':yes+no});expected.append([True]*len(yes)+[False]*len(no))
            stats['exercises']+=1;stats['comparisons']+=len(yes)+len(no)
    for rows in data['qcm']:
        for q in rows:
            target=str(qcm_answer(q['kind'],q['data']))
            assert len(q['options'])==len(set(q['options']))==4
            assert q['options'].count(target)==1 and q['options'][q['correct']]==target, q
            if q['kind'] not in CONCEPTS:
                assert all(str(int(x))==x and int(x)>=0 for x in q['options'])
                assert target in q['expl'], (q['kind'],'explication')
            stats['qcm']+=1
    got=json.loads(subprocess.check_output(['node',str(HERE/'test_math.cjs'),'verify'],input=json.dumps(jobs).encode()))
    assert got==expected, 'Un vérificateur accepte/refuse une mauvaise valeur'
    for v in data['visual']:
        n,k,mode=v['n'],v['k'],v['mode']
        objects=list({'words':lambda:product(range(n),repeat=k),'ordered':lambda:permutations(range(n),k),'choose':lambda:combinations(range(n),k)}[mode]())
        assert v['total']==len(objects)
        assert v['first']==list(map(list,objects[:24]))
        assert v['last']==list(map(list,objects[v['lastOffset']:v['lastOffset']+24]))
        stats['visual_configurations']+=1
    # Vérifier aussi l'algorithme pédagogique réellement publié dans le cours.
    page=(HERE.parent.parent/'chapitres/08_combinatoire_denombrement/8A_combinatoire_denombrement.html').read_text()
    algorithm=html.unescape(re.search(r'<pre><code>(def ligne_pascal.*?)</code></pre>',page,re.S)[1])
    namespace={};exec(compile(algorithm,'algorithme de la fiche','exec'),namespace)
    for n in range(16):
        row=namespace['ligne_pascal'](n)
        assert row==[comb(n,k) for k in range(n+1)] and sum(row)==2**n
    # Frontières et grammaire de saisie ; pas d'approximation de type Number().
    probes=[{'answer':0,'inputs':['0','0,0','0/4','-0','1e-30','-0.000000000001','1/0']},
            {'answer':120,'inputs':['120','240 / 2','-240/-2','120.000000000001','119.999999999999','1 20','120,0','120foo']}]
    result=json.loads(subprocess.check_output(['node',str(HERE/'test_math.cjs'),'verify'],input=json.dumps(probes).encode()))
    assert result==[[True,True,True,True,False,False,False],[True,True,True,False,False,False,True,False]]
    assert empty_forbidden>0
    print(json.dumps({'status':'PASS','seed':20260912,**stats,'cas_impossibles_dans_correction':empty_forbidden,'lignes_pascal':16,'sondes_parseur':15},ensure_ascii=False,indent=2))


if __name__=='__main__':
    if sys.argv[1:]==['oracle']:
        print(json.dumps(oracle(json.load(sys.stdin))))
    else:
        main()
