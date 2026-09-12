#!/usr/bin/env python3
"""Oracle indépendant : fractions Python, trigonométrie numérique et différences finies.

Ne réutilise ni la table des valeurs remarquables ni les fonctions de calcul JS.
"""
from fractions import Fraction as F
from pathlib import Path
import json
import math
import re
import subprocess
import sys

HERE=Path(__file__).resolve().parent


def slope(d):
    x=d['t']*math.pi/(2*d['b'])
    fn=math.cos if d['fn']=='sin' else lambda z:-math.sin(z)
    value=d['a']*d['b']*fn(d['b']*x)+d['c']
    exact=round(value)
    assert abs(value-exact)<1e-10
    f=lambda z:d['a']*getattr(math,d['fn'])(d['b']*z)+d['c']*z
    h=1e-5
    assert abs((f(x+h)-f(x-h))/(2*h)-exact)<1e-7
    return F(exact)


def exercise_answer(code,i,d):
    if code=='10A':
        if i==0:return F(d['degrees'],180)
        if i==1:
            v=getattr(math,d['fn'])(d['u']*math.pi/12)
            return F((1 if v>=0 else -1)*math.floor(abs(v)*1000+.5),1000)
        return F(d['radius']*abs(d['u']),12)
    if i==0:return slope(d)
    if i==1:
        value=math.cos(d['u']*math.pi/12)
        alpha=math.acos(value)
        assert abs(alpha/math.pi-d['u']/12)<1e-10
        return F(d['u'],12)
    # Aire = base * hauteur / 2 ; la hauteur ne dépasse pas le deuxième côté.
    target=F(d['a']*d['b'],2)
    for j in range(101):assert float(target)*math.sin(j*math.pi/100)<=float(target)+1e-10
    return target


CONCEPTS={
 'coordinates':'(cos(x) ; sin(x))', 'norm':r'\(\cos^2x+\sin^2x=1.\)',
 'quadrant':'Tous deux négatifs.', 'derivativeSin':r'\(x\mapsto\cos x\)',
 'derivativeCos':r'\(x\mapsto-\sin x\)', 'endpoint':'Deux : −π et π.',
 'range':'Tout l’intervalle [−π,π].', 'variations':'strictement décroissante.',
}


def pi(f):
    if not f:return '0'
    sign='-' if f<0 else '';n=abs(f.numerator);d=f.denominator
    if d==1:return sign+('' if n==1 else str(n))+r'\pi'
    return sign+r'\frac{'+('' if n==1 else str(n))+r'\pi}{'+str(d)+'}'


def qcm_answer(code,kind,d):
    if kind in CONCEPTS:return CONCEPTS[kind]
    if code=='10A':
        if kind=='degrees':return F(d['degrees'],180)
        if kind=='radians':return F(d['u']*15)
        if kind=='arc':return F(d['radius']*d['u'],12)
        x=d['u']*math.pi/12
        if kind in ('oppositeSin','oppositeCos'):x=-x
        if kind=='associated':x=math.pi-x
        fn=math.cos if kind in ('cos','oppositeCos','associated') else math.sin
        return fn(x)
    if kind=='slope':return slope(d)
    if kind=='limit':return F(d['a'])
    if kind=='cosLimit':return F(0)
    if kind=='equation':return F(d['u'],12)
    if kind=='inequality':
        alpha=pi(F(d['u'],12))
        return r'\([-\pi,-'+alpha+r']\cup['+alpha+r',\pi]\)'
    if kind=='maximum':return F(d['a']+d['b'])
    if kind=='period':return F(2,d['b'])
    raise AssertionError((code,kind))


def parse_option(s):
    s=s.removeprefix(r'\(').removesuffix(r'\)')
    radical=re.fullmatch(r'(-?)\\frac\{\\sqrt\{([23])\}\}\{2\}',s)
    if radical:return (-1 if radical[1] else 1)*math.sqrt(int(radical[2]))/2
    m=re.fullmatch(r'(-?)\\frac\{(\d+)\}\{(\d+)\}',s)
    return F((-1 if m[1] else 1)*int(m[2]),int(m[3])) if m else F(s)


def correct_index(code,q):
    target=qcm_answer(code,q['kind'],q['data'])
    options=q['options'] if isinstance(target,str) else list(map(parse_option,q['options']))
    def eq(a,b):return a==b if isinstance(a,str) or isinstance(b,str) else abs(a-b)<1e-12
    assert len(options)==4 and all(not eq(a,b) for i,a in enumerate(options) for b in options[i+1:]),q
    indices=[i for i,value in enumerate(options) if eq(value,target)]
    assert len(indices)==1,q
    return indices[0]


def oracle(q):
    return {'exercises':[str(exercise_answer(q['code'],i,e['data'])) for i,e in enumerate(q['exercises'])], 'qcm':[correct_index(q['code'],item) for item in q['qcm']]}


def tex(f):return str(f.numerator) if f.denominator==1 else ('-' if f<0 else '')+r'\frac{'+str(abs(f.numerator))+'}{'+str(f.denominator)+'}'


def main():
    samples=json.loads(subprocess.check_output(['node',str(HERE/'test_math.cjs'),'sample']))
    jobs=[];expected=[];stats={'exercises':0,'qcm':0,'comparisons':0}
    for code,rows in samples.items():
        for i,exercises in enumerate(rows['exercises']):
            seen=set()
            for e in exercises:
                d=e['data'];answer=exercise_answer(code,i,d)
                assert answer==F(e['answer']['n'],e['answer']['d']),(code,i,d)
                seen.add(json.dumps(d,sort_keys=True))
                assert not re.search(r'\+\s*-|--|undefined|NaN',e['enonce']+e['correction']),(code,i,d)
                if code=='10A' and i==1:assert f'{float(answer):.3f}'.replace('.',',') in e['correction']
                else:assert tex(answer) in e['correction'],(code,i,d,'correction')
                if code=='10B' and i==1:
                    if d['u']==0:assert r'\{0\}' in e['correction']
                    elif d['u']==12:assert r'\{-\pi,\pi\}' in e['correction']
                    else:assert r'\{-'+pi(answer)+','+pi(answer)+r'\}' in e['correction']
                yes=[str(answer),f'{answer.numerator*7}/{answer.denominator*7}',f' {-answer.numerator} / {-answer.denominator} ']
                if answer.denominator==1:yes.append(str(answer)+',0')
                if code=='10A' and i==1:yes.append(f'{float(answer):.3f}'.replace('.',','))
                no=[str(answer+1),str(answer-1),str(answer+F(1,1000)),str(answer-F(1,1000)),str(answer+F(1,10**12)),str(answer-F(1,10**12)), '', 'abc','1/0','Infinity','NaN','0x10','1e0','1/2/3','2π','1 2']
                if answer:no.append(str(-answer))
                jobs.append({'code':code,'answer':e['answer'],'inputs':yes+no});expected.append([True]*len(yes)+[False]*len(no))
                stats['exercises']+=1;stats['comparisons']+=len(yes)+len(no)
            assert len(seen)>=9,(code,i,'générateur trop pauvre')
            if code=='10B' and i==1:assert {json.loads(x)['u'] for x in seen}=={0,2,3,4,6,8,9,10,12}
        for questions in rows['qcm']:
            for q in questions:
                assert correct_index(code,q)==q['correct'],q
                assert not re.search(r'undefined|NaN|\+\s*-',q['q']+q['expl'])
                stats['qcm']+=1
    results=json.loads(subprocess.check_output(['node',str(HERE/'test_math.cjs'),'verify'],input=json.dumps(jobs).encode()))
    assert results==expected,'Réponse correcte refusée ou réponse fausse acceptée'
    print(json.dumps({'status':'PASS','seed':20260912,**stats},indent=2))


if __name__=='__main__':
    if len(sys.argv)>1 and sys.argv[1]=='oracle':print(json.dumps(oracle(json.load(sys.stdin))))
    else:main()
