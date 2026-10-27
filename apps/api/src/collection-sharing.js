import {randomBytes,createHash} from 'node:crypto';
const hash=value=>createHash('sha256').update(value).digest('hex');
const fail=(statusCode,message)=>Object.assign(new Error(message),{statusCode});
export async function registerCollectionSharing(app,{store,env}){
 const local=new Map();
 const enabled=()=>{if(env.COLLECTION_SHARING_ENABLED!=='true'||(env.NODE_ENV==='production'&&!store.cloud))throw fail(503,'Collection sharing is not enabled.');};
 const auth=async request=>{if(!request.user)throw fail(401,'Sign in to manage sharing.');enabled();};
 const params={type:'object',required:['id'],properties:{id:{type:'string',format:'uuid'}}};
 app.post('/api/v2/collections/:id/share',{preHandler:auth,schema:{params,body:{type:'object',additionalProperties:false,required:['expectedRevision'],properties:{expectedRevision:{type:'integer',minimum:1},includeNotes:{type:'boolean',default:false}}}}},async(request,reply)=>{
  const token=randomBytes(32).toString('hex');const digest=hash(token);let result;
  if(store.cloud){const r=await store.cloud.rpc('share_collection',{p_user:request.user.id,p_collection:request.params.id,p_revision:request.body.expectedRevision,p_hash:digest,p_notes:request.body.includeNotes});if(r.error)throw fail(503,'Sharing could not be updated. Retry after refreshing the collection.');result=r.data;}
  else{const c=(await store.list('collections',request)).find(c=>c.id===request.params.id);result={kind:!c?'missing':c.revision!==request.body.expectedRevision?'conflict':'ok'};if(result.kind==='ok')local.set(c.id,{user:request.user.id,digest,snapshot:{name:c.name,vehicle_slugs:[...c.vehicle_slugs],revision:c.revision,shared_at:new Date().toISOString(),...(request.body.includeNotes?{notes:c.notes}:{})}});}
  if(result?.kind!=='ok')throw fail(result?.kind==='conflict'?409:404,'Collection changed or is unavailable. Refresh before sharing.');
  return reply.code(201).send({token,path:`/shared/collection#${token}`,revocable:true});
 });
 app.delete('/api/v2/collections/:id/share',{preHandler:auth,schema:{params}},async(request,reply)=>{
  if(store.cloud){const {error}=await store.cloud.from('collection_shares').delete().eq('collection_id',request.params.id).eq('user_id',request.user.id);if(error)throw fail(503,'Revocation could not be confirmed. Retry.');}
  else if(local.get(request.params.id)?.user===request.user.id)local.delete(request.params.id);
  return reply.code(204).send();
 });
 app.get('/api/v2/shared/collections/:token',{config:{rateLimit:{max:60,timeWindow:'1 minute'}},schema:{params:{type:'object',properties:{token:{type:'string',pattern:'^[a-f0-9]{64}$'}}}}},async(request,reply)=>{
  enabled();const digest=hash(request.params.token);let snapshot;
  if(store.cloud){const {data,error}=await store.cloud.from('collection_shares').select('snapshot').eq('token_hash',digest).maybeSingle();if(error)throw fail(503,'Shared collection could not be loaded.');snapshot=data?.snapshot;}
  else{for(const [id,entry]of local){if(entry.digest===digest){const stillExists=(await store.list('collections',{user:{id:entry.user},headers:{}})).some(c=>c.id===id);if(stillExists)snapshot=entry.snapshot;break;}}}
  if(!snapshot)throw fail(404,'This sharing link is unavailable or revoked.');
  reply.header('Cache-Control','no-store').header('Referrer-Policy','no-referrer');return{collection:snapshot,readOnly:true};
 });
}
