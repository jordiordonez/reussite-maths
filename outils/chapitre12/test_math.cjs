const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const files={'12A':'12A_integrales_aires.html','12B':'12B_integration_methodes.html'},models={};
for(const [code,file] of Object.entries(files)){
  const source=fs.readFileSync(path.resolve(__dirname,'../../chapitres/12_calcul_integral',file),'utf8').match(/<script id="chapter12-model">([\s\S]*?)<\/script>/)[1];
  let seed=20260912+code.charCodeAt(2);const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const ctx=vm.createContext({Math:math});vm.runInContext(source,ctx);models[code]=ctx.Chapter12;
}
if(process.argv[2]==='sample'){
  const data=Object.fromEntries(Object.entries(models).map(([code,M])=>[code,{exercises:M.generators.map(g=>Array.from({length:600},g)),qcm:M.qcmBank.map(g=>Array.from({length:300},g))}]));
  data.areas=[];for(const p of [-2,0,1,2])for(const c of [-3,0,2])for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++)data.areas.push({p,c,a,b,result:models['12A'].areas(p,c,a,b)});
  data.rectangles=[];for(const a of [-3,0,2])for(const c of [-2,0,3])for(const b of [1,4])for(const n of [1,2,7,60])for(const method of ['left','right','mid','trap'])data.rectangles.push({a,c,b,n,method,result:models['12B'].rectangles(a,c,b,n,method)});
  process.stdout.write(JSON.stringify(data));
}else if(process.argv[2]==='verify')process.stdout.write(JSON.stringify(JSON.parse(fs.readFileSync(0,'utf8')).map(j=>j.inputs.map(s=>models[j.code].accepts({answer:j.answer},s)))));
else throw Error('sample ou verify attendu');
