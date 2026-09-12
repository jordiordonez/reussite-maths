#!/usr/bin/env python3
"""Oracle indépendant : fractions Python, énumération des issues, variance centrée.

Les données viennent des générateurs extraits des HTML livrés ; aucune réponse
attendue ou fonction de calcul JS n'est utilisée pour calculer l'oracle.
"""
from fractions import Fraction as F
from itertools import product
from pathlib import Path
import json
import re
import subprocess
import sys

HERE = Path(__file__).resolve().parent


def tree(d):
    # Enumeration of the 100 equally probable cells described by tenths.
    outcomes = [(i < d['a'], j < (d['b'] if i < d['a'] else d['c'])) for i in range(10) for j in range(10)]
    joint = sum(a and b for a,b in outcomes)
    total = sum(b for a,b in outcomes)
    return F(joint,100), F(total,100), F(joint,total)


def moments(d):
    # Expand the discrete law into an equiprobable population.
    population = [x for x,weight in zip(d['x'],d['weights']) for _ in range(weight)]
    assert len(population)==d['den']
    mean=sum(map(F,population))/len(population)
    variance=sum((F(x)-mean)**2 for x in population)/len(population)
    return mean,variance


def word_probability(d):
    successes=d['word'].count('S')
    # Count elementary outcomes in a repeated draw from ten labelled tokens.
    favorable=d['p']**successes*(10-d['p'])**(len(d['word'])-successes)
    return F(favorable,10**len(d['word']))


def bernoulli_event(p,n,predicate):
    # Enumerate paths instead of using JS complement/binomial expressions.
    return sum((word_probability({'p':p,'word':''.join(w)}) for w in product('SE',repeat=n) if predicate(w)),F(0))


def exercise_answer(code,index,d):
    if code=='7A':
        return F(d['ab'],d['ab']+d['anb']) if index==0 else tree(d)[1 if index==1 else 2]
    if code=='7B':
        return F(sum(x>=d['threshold'] for x in d['faces']),6) if index==0 else moments(d)[1 if index==1 else 0]
    if index==0:return word_probability(d)
    return bernoulli_event(d['p'],d['n'] if index==1 else 3,lambda w: w.count('S')>=1 if index==1 else w.count('S')==2)


CONCEPTS={
 'independence':r'\(P(A\cap B)=P(A)P(B).\)',
 'disjoint':'Non : l’intersection a une probabilité nulle, mais le produit est positif.',
 'nullCondition':'Elle n’est pas définie par la formule du quotient.',
 'constant':'0',
 'meanNotValue':'E(X) = 0, même si X ne prend jamais la valeur 0.',
 'validLaw':'Chaque probabilité est positive ou nulle et leur somme vaut 1.',
 'definition':'une fonction qui associe un nombre réel à chaque issue.',
 'schema':'Répéter quatre fois, indépendamment, le même test succès/échec de probabilité p.',
 'pathVsEvent':'trois chemins distincts : SSE, SES, ESS.',
}


def qcm_answer(kind,d):
    if kind in CONCEPTS:return CONCEPTS[kind]
    if kind=='conditional':return F(d['ab'],d['ab']+d['anb'])
    if kind=='otherConditional':return F(d['ab'],d['ab']+d['nab'])
    if kind=='union':return 1-F(d['nanb'],sum(d.values()))
    if kind in ('intersection','total','reverse'):return tree(d)[['intersection','total','reverse'].index(kind)]
    if kind=='conditionalComplement':return F(10-d['b'],10)
    if kind in ('partition','missingMass'):return F(10-d['a']-d['b'],10)
    if kind=='independentProduct':return F(d['a']*d['b'],100)
    if kind=='lawValue':return F(d['faces'].count(d['target']),6)
    if kind in ('mean','variance'):return moments(d)[kind=='variance']
    if kind=='sigma':return F(d['a'])
    if kind=='fair':return F(d['p']*d['lot'],10)
    if kind=='net':return (F(d['lot']-d['fee'])*d['p']+F(-d['fee'])*(10-d['p']))/10
    if kind=='event':return F(sum(w for x,w in zip(d['x'],d['weights']) if x<=0),d['den'])
    if kind=='bernoulliMean':return F(d['p'],10)
    if kind=='bernoulliVariance':return moments({'x':[0,1],'weights':[10-d['p'],d['p']],'den':10})[1]
    if kind=='path':return word_probability(d)
    if kind=='none':return bernoulli_event(d['p'],d['n'],lambda w:'S' not in w)
    if kind=='atLeastOne':return bernoulli_event(d['p'],d['n'],lambda w:'S' in w)
    if kind=='exactTwo':return bernoulli_event(d['p'],3,lambda w:w.count('S')==2)
    if kind=='heterogeneous':return F(sum(i<d['a'] and j<d['b'] and k<d['c'] for i,j,k in product(range(10),repeat=3)),1000)
    if kind=='failure':return F(10-d['p'],10)
    if kind=='space':return F(len(list(product('SE',repeat=d['n']))))
    if kind=='all':return bernoulli_event(d['p'],3,lambda w:w.count('S')==3)
    raise AssertionError(kind)


def parse_option(s):
    s=s.removeprefix(r'\(').removesuffix(r'\)')
    match=re.fullmatch(r'(-?)\\frac\{(\d+)\}\{(\d+)\}',s)
    if match:return F((-1 if match[1] else 1)*int(match[2]),int(match[3]))
    return F(s)


def tex(f):
    if f.denominator==1:return str(f.numerator)
    return ('-' if f<0 else '')+r'\frac{'+str(abs(f.numerator))+'}{'+str(f.denominator)+'}'


def main():
    samples=json.loads(subprocess.check_output(['node',str(HERE/'test_math.cjs'),'sample']))
    jobs=[];expected=[];stats={}
    for code,parts in samples.items():
        stats[code]={'exercises':0,'qcm':0,'comparisons':0,'negative_cases':0}
        for index,rows in enumerate(parts['exercises']):
            for e in rows:
                d=e['data'];answer=exercise_answer(code,index,d)
                assert answer==F(e['answer']['n'],e['answer']['d']), (code,index,d,'wrong generated answer')
                assert tex(answer) in e['correction'], (code,index,'missing exact answer in correction')
                assert not re.search(r'\+\s*-\d|×\s*-\d|(?<!\{)-\d+\^2',e['correction']), (code,index,'notation')
                # Compare the rational equivalent and deliberately close wrong values.
                correct=[str(answer),f'{answer.numerator*7}/{answer.denominator*7}']
                if answer.denominator==1:correct += [str(answer.numerator)+',0']
                wrong=[str(answer+1),str(answer-1),str(answer+F(1,100)),str(answer-F(1,100)),str(answer+F(1,10**12)),str(answer-F(1,10**12)),'',' ','abc','1/0','Infinity','NaN','0x10']
                jobs.append({'code':code,'exercise':e,'inputs':correct+wrong});expected.append([True]*len(correct)+[False]*len(wrong))
                stats[code]['comparisons']+=len(correct)+len(wrong);stats[code]['exercises']+=1
                if answer<0 or any(x<0 for x in d.get('x',d.get('faces',[]))):stats[code]['negative_cases']+=1
        for rows in parts['qcm']:
            for q in rows:
                target=qcm_answer(q['kind'],q['data']);options=q['options']
                assert len(options)==len(set(options))==4, (code,q['kind'],'duplicate options')
                if isinstance(target,str):assert options[q['correct']]==target,(code,q['kind'],'incorrect concept')
                else:
                    parsed=list(map(parse_option,options));assert len(set(parsed))==4,(code,q['kind'],'equivalent options')
                    assert parsed[q['correct']]==target and sum(v==target for v in parsed)==1,(code,q['kind'],'incorrect answer or distractor')
                    if q['kind'] not in ('bernoulliMean','failure'):assert tex(target) in q['expl'] or str(target.numerator) in q['expl'],(code,q['kind'],'explanation result')
                stats[code]['qcm']+=1
    results=json.loads(subprocess.check_output(['node',str(HERE/'test_math.cjs'),'verify'],input=json.dumps(jobs).encode()))
    for job,want,got in zip(jobs,expected,results):
        assert got==want,(job['code'],job['exercise']['data'],[(s,a,b) for s,a,b in zip(job['inputs'],want,got) if a!=b])
    assert len(results)==len(jobs)
    # Parser equivalence, sign and strict boundary probes on representative values.
    probes=[('7A',F(3,10),['0,3','0.30','3/10','6/20','+0.3',' 3 / 10 '],['30','0.300000000001','0.299999999999','3/0','0.3%']),
            ('7B',F(-3,2),['-1,5','−1.5','-3/2','3/-2'],['-1.500000000001','-1.499999999999','1.5']),
            ('7C',F(0),['0','0,0','0/7'],['0.000000000001','-0.000000000001'])]
    request=[{'code':code,'exercise':{'answer':{'n':v.numerator,'d':v.denominator}},'inputs':yes+no} for code,v,yes,no in probes]
    actual=json.loads(subprocess.check_output(['node',str(HERE/'test_math.cjs'),'verify'],input=json.dumps(request).encode()))
    assert actual==[[True]*len(yes)+[False]*len(no) for _,_,yes,no in probes]
    print(json.dumps({'status':'PASS','seed':20260912,'sheets':stats,'parser_checks':sum(len(y)+len(n) for _,_,y,n in probes)},ensure_ascii=False,indent=2))


if __name__=='__main__':
    if sys.argv[1:] == ['oracle']:
        query=json.load(sys.stdin)
        exercises=[str(exercise_answer(query['code'],i,e['data'])) for i,e in enumerate(query['exercises'])]
        choices=[]
        for q in query['qcm']:
            target=qcm_answer(q['kind'],q['data'])
            options=q['options'] if isinstance(target,str) else list(map(parse_option,q['options']))
            assert options.count(target)==1
            choices.append(options.index(target))
        print(json.dumps({'exercises':exercises,'qcm':choices}))
    else:
        main()
