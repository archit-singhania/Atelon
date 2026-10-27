const failure=(statusCode,message)=>Object.assign(new Error(message),{statusCode});
export async function registerAccountDeletion(app,{store,env}){
 app.delete('/api/v2/account/identity',{
  config:{rateLimit:{max:3,timeWindow:'1 hour'}},
  schema:{body:{type:'object',required:['confirmation'],additionalProperties:false,properties:{confirmation:{const:'DELETE MY ACCOUNT'}}}},
  preHandler:async request=>{
   if(!request.user)throw failure(401,'Sign in again before deleting your account.');
   if(env.ACCOUNT_DELETION_ENABLED!=='true'||!store.cloud)throw failure(503,'Full account deletion is not enabled. No data was deleted.');
  }
 },async(request,reply)=>{
  const readiness=await store.cloud.rpc('account_deletion_ready');
  if(readiness.error||readiness.data!==true)throw failure(503,'Account deletion prerequisites are not ready. No data was deleted.');
  // Auth deletion and database cascades commit together. Never pre-delete app rows:
  // a storage ownership constraint or an Auth failure must leave a retryable account.
  const {error}=await store.cloud.auth.admin.deleteUser(request.user.id);
  if(error)return reply.code(503).send({error:{code:'ACCOUNT_DELETION_UNCONFIRMED',message:'Deletion could not be confirmed. Retry after checking your session. Contact support if it continues; do not clear your local backup.'},requestId:request.id});
  return {deleted:true,scope:'Authentication identity and owned database records. Shared editorial content and published assets remain; device-only data is not erased.'};
 });
}
