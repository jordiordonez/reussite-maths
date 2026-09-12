// Extract the shipped model, not a separate implementation of its verifier.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'../../chapitres/07_probabilites');
const contexts={};
for(const code of ['7A','7B','7C']){
  const file=fs.readdirSync(dir).find(f=>f.startsWith(code+'_')&&f.endsWith('.html'));
  const html=fs.readFileSync(path.join(dir,file),'utf8');
  const source=html.match(/<script id="chapter7-model">([\s\S]*?)<\/script>/)[1];
  let seed=20260912+code.charCodeAt(1);
  const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const ctx=vm.createContext({Math:math});vm.runInContext(source,ctx);contexts[code]=ctx;
}
if(process.argv[2]==='sample'){
  const out={};
  for(const [code,ctx] of Object.entries(contexts)){
    out[code]={exercises:ctx.Chapter7.generators.map(gen=>Array.from({length:400},()=>gen())),qcm:ctx.Chapter7.qcmBank.map(gen=>Array.from({length:200},()=>gen()))};
  }
  process.stdout.write(JSON.stringify(out));
}else if(process.argv[2]==='verify'){
  const jobs=JSON.parse(fs.readFileSync(0,'utf8'));
  process.stdout.write(JSON.stringify(jobs.map(j=>j.inputs.map(s=>contexts[j.code].Chapter7.accepts(j.exercise,s)))));
}else throw Error('Use sample or verify');
