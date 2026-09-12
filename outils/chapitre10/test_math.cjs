const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const files={ '10A':'10A_cercle_trigonometrique.html','10B':'10B_derivation_trigonometrie.html'};
const models={};
for(const [code,file] of Object.entries(files)){
  const source=fs.readFileSync(path.resolve(__dirname,'../../chapitres/10_trigonometrie',file),'utf8').match(/<script id="chapter10-model">([\s\S]*?)<\/script>/)[1];
  let seed=20260912+code.charCodeAt(2);const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const ctx=vm.createContext({Math:math});vm.runInContext(source,ctx);models[code]=ctx.Chapter10;
}
if(process.argv[2]==='sample')process.stdout.write(JSON.stringify(Object.fromEntries(Object.entries(models).map(([code,M])=>[code,{exercises:M.generators.map(g=>Array.from({length:600},g)),qcm:M.qcmBank.map(g=>Array.from({length:300},g))}]))));
else if(process.argv[2]==='verify')process.stdout.write(JSON.stringify(JSON.parse(fs.readFileSync(0,'utf8')).map(j=>j.inputs.map(s=>models[j.code].accepts({answer:j.answer},s)))));
else throw Error('sample ou verify attendu');
