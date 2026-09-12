#!/usr/bin/env python3
"""Oracle indépendant : convolution des Bernoulli, sans coefficient binomial."""
from fractions import Fraction as F
from functools import lru_cache
from pathlib import Path
import html
import json
import re
import subprocess
import sys

HERE=Path(__file__).resolve().parent


@lru_cache(None)
def law(n,m):
    weights=[1]
    for _ in range(n):
        new=[0]*(len(weights)+1)
        for k,w in enumerate(weights):
            new[k]+=w*(10-m)
            new[k+1]+=w*m
        weights=new
    return [F(w,10**n) for w in weights]


def rounded(value):
    q,r=divmod(value.numerator*1000,value.denominator)
    return F(q+(2*r>=value.denominator),1000)


def threshold(dist,percent):
    for k in range(len(dist)):
        if sum(dist[k+1:])<=F(percent,100):
            return k
    raise AssertionError('Aucun seuil')


def exercise_answer(i,d):
    dist=law(d['n'],d['m'])
    if i==0:return dist[d['k']]
    if i==1:return rounded(sum(dist[d['a']:d['b']+1]))
    return F(threshold(dist,d['percent']))


CONCEPTS={
 'model':'Un nombre fixé d’essais indépendants à deux issues, avec le même p.',
 'support':'X est un entier compris entre 0 et n.',
 'paths':'Le nombre de chemins ayant exactement k succès.',
 'simulation':'La fréquence observée peut différer de la probabilité théorique.',
}


def qcm_answer(kind,d):
    if kind in CONCEPTS:return CONCEPTS[kind]
    if kind=='sigma':return F(1 if d['n']==4 else 2)
    dist=law(d['n'],d['m']);k=d['k']
    if kind=='point':return dist[k]
    if kind=='cdf':return sum(dist[:k+1])
    if kind=='atLeast':return sum(dist[k:])
    if kind=='strictLess':return sum(dist[:k])
    if kind=='interval':return sum(dist[d['a']:d['b']+1])
    mean=sum(i*p for i,p in enumerate(dist))
    if kind=='mean':return mean
    if kind=='variance':return sum((i-mean)**2*p for i,p in enumerate(dist))
    if kind=='none':return dist[0]
    if kind=='atLeastOne':return sum(dist[1:])
    if kind=='threshold':return F(threshold(dist,d['percent']))
    if kind=='rounded':return rounded(dist[k])
    raise AssertionError(kind)


def fraction(a):return F(int(a['n']),int(a['d']))


def parse_option(s):
    s=s.removeprefix(r'\(').removesuffix(r'\)')
    m=re.fullmatch(r'(-?)\\frac\{(\d+)\}\{(\d+)\}',s)
    return F((-1 if m[1] else 1)*int(m[2]),int(m[3])) if m else F(s)


def tex(f):
    return str(f.numerator) if f.denominator==1 else ('-' if f<0 else '')+r'\frac{'+str(abs(f.numerator))+'}{'+str(f.denominator)+'}'


def oracle(q):
    choices=[]
    for item in q['qcm']:
        target=qcm_answer(item['kind'],item['data'])
        options=item['options'] if isinstance(target,str) else list(map(parse_option,item['options']))
        choices.append(options.index(target))
    return {'exercises':[str(exercise_answer(i,e['data'])) for i,e in enumerate(q['exercises'])],'qcm':choices}


def main():
    samples=json.loads(subprocess.check_output(['node',str(HERE/'test_math.cjs'),'sample']))
    jobs=[];expected=[];stats={'exercises':0,'qcm':0,'comparisons':0,'laws':0,'thresholds':0,'rounded_exact_refusals':0}
    for i,rows in enumerate(samples['exercises']):
        for e in rows:
            d=e['data'];answer=exercise_answer(i,d);assert answer==fraction(e['answer']),(i,d,'réponse')
            dist=law(d['n'],d['m'])
            if i==0:assert tex(answer) in e['correction']
            if i==1:
                exact=sum(dist[d['a']:d['b']+1]);assert exact==fraction(e['exact'])
                for x in [sum(dist[:d['b']+1]),sum(dist[:d['a']]),exact]:assert tex(x) in e['correction'],('correction',d,x)
                decimal=f'{int(answer*1000)//1000},{int(answer*1000)%1000:03d}'
                assert decimal in e['correction']
            if i==2:
                k=int(answer);t=sum(dist[k+1:]);assert t<=F(d['percent'],100) and tex(t) in e['correction']
                if k:assert sum(dist[k:])>F(d['percent'],100) and tex(sum(dist[k:])) in e['correction']
            yes=[str(answer),f'{answer.numerator*7}/{answer.denominator*7}']
            if answer.denominator==1:yes.append(str(answer)+',0')
            if i==1:yes.append(decimal)
            no=[str(answer+1),str(answer-1),str(answer+F(1,1000)),str(answer-F(1,1000)),str(answer+F(1,10**12)),str(answer-F(1,10**12)),
                '', 'abc','1/0','Infinity','NaN','-1','0x10']
            if i==1 and exact!=answer:
                no.append(str(exact));stats['rounded_exact_refusals']+=1
            jobs.append({'answer':e['answer'],'inputs':yes+no});expected.append([True]*len(yes)+[False]*len(no))
            stats['comparisons']+=len(yes)+len(no);stats['exercises']+=1
    results=json.loads(subprocess.check_output(['node',str(HERE/'test_math.cjs'),'verify'],input=json.dumps(jobs).encode()))
    assert results==expected,'Acceptation ou refus erroné'
    for rows in samples['qcm']:
        for q in rows:
            target=qcm_answer(q['kind'],q['data'])
            options=q['options'] if isinstance(target,str) else list(map(parse_option,q['options']))
            assert len(options)==len(set(options))==4 and options[q['correct']]==target,q
            if not isinstance(target,str):assert tex(target) in q['expl'] or str(target.numerator) in q['expl']
            stats['qcm']+=1
    for item in samples['laws']:
        n,m=item['n'],item['m'];dist=law(n,m)
        assert list(map(fraction,item['dist']))==dist and sum(dist)==1 and all(p>=0 for p in dist)
        for k in range(n+1):
            assert fraction(item['cdf'][k])==sum(dist[:k+1])
            assert fraction(item['tail'][k])==sum(dist[k+1:])
        mean=sum(k*p for k,p in enumerate(dist));var=sum((k-mean)**2*p for k,p in enumerate(dist))
        assert mean==F(n*m,10) and var==F(n*m*(10-m),100)
        for row in item['thresholds']:
            assert row['k']==threshold(dist,row['percent']);stats['thresholds']+=1
        stats['laws']+=1
    for r in samples['rounding']:assert fraction(r['output'])==rounded(F(r['input']))
    # Le code pédagogique a un comportement exact aux deux frontières.
    source=(HERE.parent.parent/'chapitres/09_loi_binomiale/9A_loi_binomiale.html').read_text()
    code=html.unescape(re.search(r'<pre><code>(from random.*?)</code></pre>',source,re.S)[1]);ns={};exec(compile(code,'simulation de la fiche','exec'),ns)
    for n in [0,1,5,20]:
        assert ns['binomiale'](n,0)==0 and ns['binomiale'](n,1)==n
    values=iter([.1,.9,.2,.8]);ns['random']=lambda:next(values)
    assert ns['binomiale'](4,.5)==2
    print(json.dumps({'status':'PASS','seed':20260912,**stats,'rounding_boundaries':len(samples['rounding']),'algorithm_checks':9},ensure_ascii=False,indent=2))


if __name__=='__main__':
    print(json.dumps(oracle(json.load(sys.stdin)))) if sys.argv[1:]==['oracle'] else main()
