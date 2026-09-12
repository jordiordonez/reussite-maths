// Extraction des fonctions effectivement livrées dans le HTML.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=path.resolve(__dirname,'../../chapitres/08_combinatoire_denombrement/8A_combinatoire_denombrement.html');
const source=fs.readFileSync(file,'utf8').match(/<script id="chapter8-model">([\s\S]*?)<\/script>/)[1];
let seed=20260912;const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const ctx=vm.createContext({Math:math});vm.runInContext(source,ctx);const M=ctx.Chapter8;
if(process.argv[2]==='sample'){
  const visual=[];
  for(let n=0;n<=6;n++)for(let k=0;k<=6;k++)for(const mode of ['words','ordered','choose']){
    const total=M[mode](n,k),last=total?Math.floor((total-1)/24)*24:0;
    visual.push({n,k,mode,total,first:M.enumerate(n,k,mode),lastOffset:last,last:M.enumerate(n,k,mode,last)});
  }
  process.stdout.write(JSON.stringify({exercises:M.generators.map(g=>Array.from({length:600},g)),qcm:M.qcmBank.map(g=>Array.from({length:300},g)),visual}));
}else if(process.argv[2]==='verify'){
  const jobs=JSON.parse(fs.readFileSync(0,'utf8'));
  process.stdout.write(JSON.stringify(jobs.map(j=>j.inputs.map(s=>M.accepts({answer:j.answer},s)))));
}else throw Error('Utiliser sample ou verify');
