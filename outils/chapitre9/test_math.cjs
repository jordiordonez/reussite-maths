const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=path.resolve(__dirname,'../../chapitres/09_loi_binomiale/9A_loi_binomiale.html');
const source=fs.readFileSync(file,'utf8').match(/<script id="chapter9-model">([\s\S]*?)<\/script>/)[1];
let seed=20260912;const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const ctx=vm.createContext({Math:math});vm.runInContext(source,ctx);const M=ctx.Chapter9;
if(process.argv[2]==='sample'){
  const laws=[];
  for(let n=0;n<=20;n++)for(let m=0;m<=10;m++){
    const d=M.law(n,m),thresholds=[0,1,5,25,50,100].map(percent=>({percent,k:M.threshold(d,M.R(percent,100))}));
    laws.push({n,m,dist:d,thresholds,cdf:d.map((_,k)=>M.cdf(d,k)),tail:d.map((_,k)=>M.tail(d,k))});
  }
  const rounding=['1/2000','999/2000','1999/2000','499999/1000000000','500001/1000000000'].map(s=>{const [n,d]=s.split('/');return {input:s,output:M.rounded(M.R(n,d))};});
  process.stdout.write(JSON.stringify({exercises:M.generators.map(g=>Array.from({length:600},g)),qcm:M.qcmBank.map(g=>Array.from({length:300},g)),laws,rounding}));
}else if(process.argv[2]==='verify'){
  const jobs=JSON.parse(fs.readFileSync(0,'utf8'));
  process.stdout.write(JSON.stringify(jobs.map(j=>j.inputs.map(s=>M.accepts({answer:j.answer},s)))));
}else throw Error('Utiliser sample ou verify');
