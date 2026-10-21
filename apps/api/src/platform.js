import { randomUUID } from 'node:crypto';
function fail(code, message) { return Object.assign(new Error(message), { statusCode: code }); }
export async function registerPlatform(app, { store, vehicles }) {
  const auth = request => { if (!store.cloud || !request.user) throw fail(401, 'Sign in to use cloud storage.'); };
  const admin = request => { if (!store.isAdmin(request)) throw fail(403, 'Administrator access required.'); };
  const check = result => { if (result.error) throw result.error; return result.data; };
  app.get('/api/v3/research', { preHandler: auth }, async request => check(await store.cloud.from('research_state').select('*').eq('user_id', request.user.id).maybeSingle()) || { state: {} });
  app.put('/api/v3/research', { preHandler: auth, bodyLimit: 128 * 1024, schema: { body: { type: 'object', required: ['state'], properties: { state: { type: 'object' }, expectedUpdatedAt: { type: ['string','null'] } }, additionalProperties: false } } }, async (request, reply) => {
    const result = check(await store.cloud.rpc('save_research_state', { p_user: request.user.id, p_state: request.body.state, p_expected: request.body.expectedUpdatedAt || null }));
    if (!result) return reply.code(409).send({ error: { code: 'SYNC_CONFLICT', message: 'Cloud research changed. Download the cloud copy before uploading again.' } });
    return result;
  });
  app.get('/api/v3/admin/catalogue', { preHandler: admin }, async () => ({ results: check(await store.cloud.from('catalogue_documents').select('*')), jobs: check(await store.cloud.from('processing_jobs').select('*').order('created_at', { ascending: false }).limit(100)) }));
  app.get('/api/v3/admin/suggestions', { preHandler: admin }, async () => ({ results: check(await store.cloud.from('suggestions').select('*').order('created_at',{ascending:false}).limit(100)) }));
  app.patch('/api/v3/admin/suggestions/:id', { preHandler: admin, schema: { body: { type:'object',required:['status'],properties:{status:{enum:['new','reviewing','accepted','rejected']}},additionalProperties:false } } }, async request => { const result=check(await store.cloud.from('suggestions').update(request.body).eq('id',request.params.id).select().single()); check(await store.cloud.from('audit_events').insert({actor_id:request.user.id,action:'moderate',entity_type:'suggestion',entity_id:request.params.id,payload:request.body})); return result; });
  app.put('/api/v3/admin/catalogue/:slug', { preHandler: admin, bodyLimit: 128 * 1024, schema: { params: { type: 'object', properties: { slug: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', maxLength: 100 } }, required: ['slug'] }, body: { type: 'object', required: ['document','expectedRevision'], properties: { document: { type: 'object', required: ['slug','make','model','status','summary','specs'] }, expectedRevision: { type: 'integer', minimum: 0 } }, additionalProperties: false } } }, async (request, reply) => {
    const document = request.body.document; if (document.slug !== request.params.slug) throw fail(400, 'Slug mismatch.');
    const statuses = ['draft','researching','license-review','asset-processing','qa','live','rejected']; if (!statuses.includes(document.status)) throw fail(400, 'Invalid lifecycle state.');
    if (!Array.isArray(document.specs) || document.specs.some(spec => !spec.key || spec.value === undefined || !/^https?:\/\//.test(spec.source || ''))) throw fail(400, 'Every specification requires a value and source URL.');
    if (document.status === 'live') { const original = vehicles.find(vehicle => vehicle.slug === document.slug); if (!original || JSON.stringify(original) !== JSON.stringify(document)) throw fail(422, 'Publication requires the verified build snapshot. Save as QA, export and run strict asset validation before publication.'); }
    const row = check(await store.cloud.rpc('save_catalogue_document', { p_slug: document.slug, p_document: document, p_expected: request.body.expectedRevision, p_actor: request.user.id }));
    if (!row) return reply.code(409).send({ error: { code: 'REVISION_CONFLICT', message: 'Reload the latest catalogue revision.' } });
    return row;
  });
  app.get('/api/v3/admin/catalogue/:slug/history', { preHandler: admin }, async request => ({ results: check(await store.cloud.from('catalogue_revisions').select('*').eq('slug', request.params.slug).order('revision', { ascending: false }).limit(50)) }));
  app.post('/api/v3/admin/uploads', { preHandler: admin, schema: { body: { type: 'object', required: ['slug','extension'], properties: { slug: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', maxLength: 100 }, extension: { enum: ['glb','webp'] } }, additionalProperties: false } } }, async request => {
    const path = `${request.body.slug}/${randomUUID()}.${request.body.extension}`; const upload = check(await store.cloud.storage.from('vehicle-ingest').createSignedUploadUrl(path)); const job = check(await store.cloud.from('processing_jobs').insert({ vehicle_slug: request.body.slug, object_path: path, created_by: request.user.id }).select().single()); return { upload, job };
  });
  app.patch('/api/v3/admin/jobs/:id', { preHandler: admin, schema: { body: { type: 'object', required: ['status'], properties: { status: { enum: ['inspected','optimizing','poster-generation','qa','failed'] }, metrics: { type: 'object' } }, additionalProperties: false } } }, async request => check(await store.cloud.from('processing_jobs').update({ ...request.body, updated_at: new Date().toISOString() }).eq('id', request.params.id).select().single()));
}
