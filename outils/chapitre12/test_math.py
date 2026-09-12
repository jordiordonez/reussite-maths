#!/usr/bin/env python3
"""Oracle indépendant : quadrature de Simpson exacte pour les polynômes de degré ≤ 3,
Decimal.exp pour l’intégration par parties, sommes rationnelles pour les rectangles.
Les modèles vérifiés sont extraits du HTML livré, pas importés de ses sources.
"""
from fractions import Fraction as F
from decimal import Decimal, localcontext, ROUND_HALF_UP
from pathlib import Path
import html
import json
import math
import re
import subprocess
import sys

HERE=Path(__file__).resolve().parent


def simpson(fn,a,b):
    a,b=F(a),F(b)
    return (b-a)*(fn(a)+4*fn((a+b)/2)+fn(b))/6


def polynomial(cs,x):return sum(c*x**i for i,c in enumerate(cs))


def exercise_answer(code,i,d):
    if code=='12A':
        if i==0:return simpson(lambda x:polynomial(d['coeffs'],x),d['a'],d['b'])
        if i==1:
            f=lambda x:abs(d['k']*(x-d['r']))
            return simpson(f,d['r']-d['left'],d['r'])+simpson(f,d['r'],d['r']+d['right'])
        return simpson(lambda x:d['a']*x*x+d['b']*x+d['c'],0,d['t'])/d['t']
    if i==0:
        with localcontext() as ctx:
            ctx.prec=60
            v=Decimal(d['a'])*((Decimal(d['b'])-1)*Decimal(d['b']).exp()+1)
            return F(v.quantize(Decimal('.001'),rounding=ROUND_HALF_UP))
    if i==1:
        # Primitive des deux monômes, évaluée avec des rationnels Python.
        return d['k']*(F(1,d['n']+1)-F(1,d['n']+2))
    h=F(d['b'],d['n']);fn=lambda x:d['a']*x*x+d['c']
    left=h*sum(fn(j*h) for j in range(d['n']))
    right=h*sum(fn(j*h) for j in range(1,d['n']+1))
    return right-left


CONCEPTS={
 'area':'l’intégrale de |f|.', 'positive':'positive ou nulle.',
 'primitive':'la même différence aux bornes.', 'fundamental':'f(x).',
 'ipp':r"\(\int_a^b uv'= [uv]_a^b-\int_a^b u'v.\)",
 'choice':'u = x et v′ = eˣ.', 'decreasing':'Jₙ₊₁ ≤ Jₙ.',
 'bounds':'Lₙ ≤ intégrale ≤ Rₙ.', 'down':'la somme à droite minore l’intégrale.',
 'mid':'une approximation, pas forcément une borne.',
}


def qcm_answer(kind,d):
    if kind in CONCEPTS:return CONCEPTS[kind]
    if kind=='constant':return F(d['a']*d['b'])
    if kind=='power':return F(1,d['n']+1)
    if kind=='reverse':return F(-d['a'])
    if kind in ('same','limit'):return F(0)
    if kind=='chasles':return F(d['p']+d['q'])
    if kind=='linear':return F(d['k']*d['p']+d['q'])
    if kind=='mean':return F(d['volume'],d['duration'])
    if kind=='lower':return F(d['m']*d['length'])
    if kind=='xe':return F(1)
    if kind=='jn':return F(1,d['n']+1)-F(1,d['n']+2)
    if kind=='ratio':return (F(1,d['n']+2)-F(1,d['n']+3))/(F(1,d['n']+1)-F(1,d['n']+2))
    if kind=='step':return F(d['b'],d['n'])
    if kind=='gap':return exercise_answer('12B',2,{'a':1,'c':0,**d})/d['b']
    raise AssertionError(kind)


def parse_option(s):
    s=s.removeprefix(r'\(').removesuffix(r'\)')
    m=re.fullmatch(r'(-?)\\frac\{(\d+)\}\{(\d+)\}',s)
    return F((-1 if m[1] else 1)*int(m[2]),int(m[3])) if m else F(s)


def correct_index(q):
    target=qcm_answer(q['kind'],q['data'])
    options=q['options'] if isinstance(target,str) else list(map(parse_option,q['options']))
    assert len(options)==len(set(options))==4,q
    assert options.count(target)==1,q
    return options.index(target)


def oracle(q):
    return {'exercises':[str(exercise_answer(q['code'],i,e['data'])) for i,e in enumerate(q['exercises'])], 'qcm':[correct_index(item) for item in q['qcm']]}


def tex(f):return str(f.numerator) if f.denominator==1 else ('-' if f<0 else '')+r'\frac{'+str(abs(f.numerator))+'}{'+str(f.denominator)+'}'


def main():
    samples=json.loads(subprocess.check_output(['node',str(HERE/'test_math.cjs'),'sample']))
    jobs=[];expected=[];stats={'exercises':0,'qcm':0,'comparisons':0,'areas':0,'rectangles':0}
    for code in ('12A','12B'):
        rows=samples[code]
        for i,exercises in enumerate(rows['exercises']):
            seen=set()
            for e in exercises:
                d=e['data'];answer=exercise_answer(code,i,d)
                assert answer==F(e['answer']['n'],e['answer']['d']),(code,i,d,answer)
                seen.add(json.dumps(d,sort_keys=True))
                assert not re.search(r'\+\s*-|--|undefined|NaN',e['enonce']+e['correction']),(code,i,d)
                if e.get('rounded'):assert f'{float(answer):.3f}'.replace('.',',') in e['correction']
                else:assert tex(answer) in e['correction'],(code,i,d,'correction')
                if code=='12A' and i==0:
                    for x in [d['a'],d['b']]:assert tex(simpson(lambda t:polynomial(d['coeffs'],t),0,x)) in e['correction']
                yes=[str(answer),f'{answer.numerator*7}/{answer.denominator*7}',f' {-answer.numerator} / {-answer.denominator} ',str(answer).replace('-','−')]
                if answer.denominator==1:yes.append(str(answer)+',0')
                if e.get('rounded'):yes.append(f'{float(answer):.3f}'.replace('.',','))
                no=[str(answer+1),str(answer-1),str(answer+F(1,1000)),str(answer-F(1,1000)),str(answer+F(1,10**12)),str(answer-F(1,10**12)), '', 'abc','1/0','Infinity','NaN','0x10','1e0','1/2/3','2π','1 2']
                if answer:no.append(str(-answer))
                jobs.append({'code':code,'answer':e['answer'],'inputs':yes+no});expected.append([True]*len(yes)+[False]*len(no))
                stats['exercises']+=1;stats['comparisons']+=len(yes)+len(no)
            assert len(seen)>=20,(code,i,'générateur trop pauvre')
        for questions in rows['qcm']:
            for q in questions:
                if q['kind']=='lower':assert 'meilleure borne inférieure garantie' in q['q']
                assert correct_index(q)==q['correct'],q
                assert not re.search(r'undefined|NaN|\+\s*-',q['q']+q['expl'])
                stats['qcm']+=1
    results=json.loads(subprocess.check_output(['node',str(HERE/'test_math.cjs'),'verify'],input=json.dumps(jobs).encode()))
    assert results==expected,'Réponse correcte refusée ou réponse fausse acceptée'
    for row in samples['areas']:
        p,c,a,b=(row[k] for k in ('p','c','a','b'));r=row['result'];signed=simpson(lambda x:p*x*x+c,a,b)
        assert abs(r['signed']-float(signed))<1e-10
        if a==b:assert r['mean'] is None and r['area']==0
        else:
            assert abs(r['mean']-float(signed/(b-a)))<1e-10
            lo,hi=sorted([a,b]);n=4000;h=(hi-lo)/n
            # Quadrature indépendante de |f| ; n'utilise pas les racines du JS.
            area=h*sum(abs(p*(lo+(j+.5)*h)**2+c) for j in range(n))
            assert abs(r['area']-area)<2e-5,(row,area)
            assert abs((r['positive']-r['negative'])-float(signed)*(1 if b>a else -1))<1e-10
        stats['areas']+=1
    for row in samples['rectangles']:
        a,c,b,n=(row[k] for k in ('a','c','b','n'));r=row['result'];h=F(b,n);fn=lambda x:a*x*x+c
        left=h*sum(fn(i*h) for i in range(n));right=h*sum(fn(i*h) for i in range(1,n+1));mid=h*sum(fn((i+F(1,2))*h) for i in range(n));exact=simpson(fn,0,b)
        wanted={'left':left,'right':right,'mid':mid,'trap':(left+right)/2,'exact':exact,'lower':min(left,right),'upper':max(left,right)}
        wanted['value']=wanted[row['method']]
        for key,value in wanted.items():assert abs(r[key]-float(value))<1e-9,(row,key)
        assert wanted['lower']<=exact<=wanted['upper'];stats['rectangles']+=1
    source=(HERE.parents[1]/'chapitres/12_calcul_integral/12B_integration_methodes.html').read_text()
    algorithm=html.unescape(re.search(r'<pre><code>(def rectangles_gauche.*?)</code></pre>',source,re.S)[1]);ns={};exec(algorithm,ns)
    fn=ns['rectangles_gauche'];assert fn(lambda x:x*x,0,1,2)==.125
    for n in [1,2,10,100]:
        assert abs(fn(lambda x:3,2,5,n)-9)<1e-10
        assert fn(lambda x:x,2,2,n)==0
    for n in [0,-1,1.5]:
        try:fn(lambda x:x,0,1,n)
        except ValueError:pass
        else:raise AssertionError('n invalide accepté')
    print(json.dumps({'status':'PASS','seed':20260912,**stats,'algorithm_checks':12},indent=2))


if __name__=='__main__':
    if len(sys.argv)>1 and sys.argv[1]=='oracle':print(json.dumps(oracle(json.load(sys.stdin))))
    else:main()
