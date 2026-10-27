const fail=(statusCode,message)=>Object.assign(new Error(message),{statusCode});
export function createGarageSync(store){
 const receipts=new Map();
 return {
  async read(request){return (await store.list('collections',request)).find(row=>request.params?.id?row.id===request.params.id:row.system_key==='personal-garage')||null;},
  async write(request){
   const {operationId,expectedRevision,document,preserveConflict=false}=request.body;
   if(store.cloud){const {data,error}=await store.cloud.rpc(request.params?.id?'sync_collection':'sync_personal_garage',{p_user:request.user.id,p_operation:operationId,p_expected:expectedRevision,p_document:document,p_preserve:preserveConflict,...(request.params?.id?{p_collection:request.params.id}:{})});if(error)throw error;return data;}
   const key=JSON.stringify([request.user.id,operationId]);const payload=JSON.stringify({expectedRevision,document,preserveConflict,collection:request.params?.id||null});
   // Serialize local-mode writes too; production uses the transactional RPC lock.
   return this.lock(async()=>{
    const receipt=receipts.get(key);if(receipt)return receipt.payload===payload?receipt.result:{kind:'key-reuse'};
    const prior=await this.read(request);if((prior?.revision||0)!==expectedRevision)return{kind:'conflict',record:prior};
    if(preserveConflict&&prior)await store.create('collections',request,{name:(prior.name+' (conflict backup)').slice(0,80),notes:prior.notes,vehicle_slugs:prior.vehicle_slugs,visibility:'private'});
    const values={...document,vehicle_slugs:[...new Set(document.vehicle_slugs)].sort(),revision:expectedRevision+1};
    const record=prior?await store.update('collections',request,prior.id,values):await store.create('collections',request,{...values,visibility:'private',...(request.params?.id?{id:request.params.id}:{system_key:'personal-garage'})});
    const result={kind:'ok',record};receipts.set(key,{payload,result});return result;
   });
  },
  pending:Promise.resolve(),
  lock(action){const next=this.pending.then(action);this.pending=next.catch(()=>{});return next;}
 };
}
export async function registerGarageSync(app,{store,vehicles,env}){
 const sync=createGarageSync(store);const known=new Set(vehicles.map(v=>v.slug));
 const auth=async request=>{if(!request.user)throw fail(401,'Sign in to synchronize your Garage.');if(env.GARAGE_SYNC_ENABLED==='false'||(env.NODE_ENV==='production'&&env.GARAGE_SYNC_ENABLED!=='true'))throw fail(503,'Garage synchronization is not enabled yet. Pending changes remain on this device.');if(env.NODE_ENV==='production'&&!store.cloud)throw fail(503,'Cloud persistence is not configured.');};
 app.get('/api/v2/garage',{preHandler:auth},async request=>({record:await sync.read(request)}));
 app.put('/api/v2/garage/sync',{preHandler:auth,config:{rateLimit:{max:60,timeWindow:'1 minute'}},schema:{body:{type:'object',additionalProperties:false,required:['operationId','expectedRevision','document'],properties:{preserveConflict:{type:'boolean'},operationId:{type:'string',pattern:'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'},expectedRevision:{type:'integer',minimum:0},document:{type:'object',additionalProperties:false,required:['name','notes','vehicle_slugs'],properties:{name:{type:'string',minLength:1,maxLength:80},notes:{type:'string',maxLength:2000},vehicle_slugs:{type:'array',maxItems:200,items:{type:'string',maxLength:100}}}}}}}},async(request,reply)=>{
  if(!request.body.document.name.trim()||request.body.document.vehicle_slugs.some(slug=>!known.has(slug)))throw fail(400,'Use a name and published vehicle identifiers.');
  const result=await sync.write(request);return reply.code(result.kind==='ok'?200:409).send(result);
 });
}
