import {createGarageSync} from './garage-sync.js';
export async function registerCollectionSync(app,{store,env,vehicles}){
 const sync=createGarageSync(store);const known=new Set(vehicles.map(v=>v.slug));
 const auth=async request=>{if(!request.user)throw Object.assign(new Error('Sign in to sync collections.'),{statusCode:401});if(env.COLLECTION_SYNC_ENABLED!=='true'||(env.NODE_ENV==='production'&&!store.cloud))throw Object.assign(new Error('Collection sync is not enabled.'),{statusCode:503});};
 const params={type:'object',required:['id'],properties:{id:{type:'string',format:'uuid'}}};
 app.get('/api/v2/collections/:id/sync',{preHandler:auth,schema:{params}},async request=>({record:await sync.read(request)}));
 app.put('/api/v2/collections/:id/sync',{preHandler:auth,config:{rateLimit:{max:60,timeWindow:'1 minute'}},schema:{params,body:{type:'object',additionalProperties:false,required:['operationId','expectedRevision','document'],properties:{operationId:{type:'string',format:'uuid'},expectedRevision:{type:'integer',minimum:0},preserveConflict:{type:'boolean'},document:{type:'object',additionalProperties:false,required:['name','notes','vehicle_slugs'],properties:{name:{type:'string',minLength:1,maxLength:80},notes:{type:'string',maxLength:2000},vehicle_slugs:{type:'array',maxItems:200,items:{type:'string'}}}}}}}},async(request,reply)=>{
  if(!request.body.document.name.trim()||request.body.document.vehicle_slugs.some(s=>!known.has(s)))return reply.code(400).send({error:{message:'Use a collection name and published vehicles.'}});
  const result=await sync.write(request);return reply.code(result.kind==='ok'?200:409).send(result);
 });
}
