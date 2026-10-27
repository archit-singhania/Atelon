import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import {registerAccountDeletion} from '../apps/api/src/account-deletion.js';
test('Identity deletion requires auth, explicit confirmation, rollout and migration readiness',async t=>{
 for(const scenario of ['anonymous','disabled','confirmation','migration','auth-failure','success']){
  const app=Fastify();t.after(()=>app.close());const calls=[];
  app.addHook('preHandler',async request=>{request.user=scenario==='anonymous'?null:{id:'verified-owner'};});
  await registerAccountDeletion(app,{env:{ACCOUNT_DELETION_ENABLED:scenario==='disabled'?'false':'true'},store:{cloud:{rpc:async()=>({data:scenario!=='migration'}),auth:{admin:{deleteUser:async id=>{calls.push(id);return {error:scenario==='auth-failure'?{message:'private detail'}:null};}}}}}});
  const result=await app.inject({method:'DELETE',url:'/api/v2/account/identity',payload:{confirmation:scenario==='confirmation'?'yes':'DELETE MY ACCOUNT'}});
  assert.equal(result.statusCode,{anonymous:401,disabled:503,confirmation:400,migration:503,'auth-failure':503,success:200}[scenario]);
  assert.deepEqual(calls,['auth-failure','success'].includes(scenario)?['verified-owner']:[]);
  assert.ok(!result.body.includes('private detail'));if(scenario==='success')assert.equal(result.json().deleted,true);
 }
});
