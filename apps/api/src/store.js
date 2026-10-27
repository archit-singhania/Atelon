import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { exportCloudAccount } from './account-export.js';

export function createStore(env = process.env) {
  const cloud = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  const local = { collections: new Map(), comparisons: new Map(), threads: new Map(), suggestions: [] };
  const owner = (request) => request.user?.id || request.headers['x-atelon-session'] || 'anonymous-local';
  const rows = (map, user) => [...map.values()].filter((row) => row.user_id === user);
  return {
    mode: cloud ? 'supabase' : 'local',
    async userFromRequest(request) {
      const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (!cloud || !token) return !cloud && env.NODE_ENV !== 'production' && token ? { id: token.slice(0, 32), role: 'local' } : null;
      const { data, error } = await cloud.auth.getUser(token); return error ? null : data.user;
    },
    async list(table, request) { const user = owner(request); if (!cloud) return rows(local[table], user); const { data, error } = await cloud.from(table).select('*').eq('user_id', user).order('updated_at', { ascending: false }); if (error) throw error; return data; },
    async create(table, request, input) { const record = { id: randomUUID(), user_id: owner(request), ...input, ...(table === 'collections' && !cloud ? {revision:1} : {}), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }; if (!cloud) { if(local[table].has(record.id))throw Object.assign(new Error("Record is unavailable."),{statusCode:409}); local[table].set(record.id, record); return record; } const { data, error } = await cloud.from(table).insert(record).select().single(); if (error) throw error; return data; },
    async update(table, request, id, input) { const user = owner(request); if (!cloud) { const prior = local[table].get(id); if (!prior || prior.user_id !== user) return null; const next = { ...prior, ...input, ...(table === 'collections' ? {revision:(prior.revision || 1)+1} : {}), updated_at: new Date().toISOString() }; local[table].set(id, next); return next; } const { data, error } = await cloud.from(table).update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user).select().maybeSingle(); if (error) throw error; return data; },
    async remove(table, request, id) { const user = owner(request); if (!cloud) { const prior = local[table].get(id); return Boolean(prior?.user_id === user && local[table].delete(id)); } const { error, count } = await cloud.from(table).delete({ count: 'exact' }).eq('id', id).eq('user_id', user); if (error) throw error; return Boolean(count); },
    async suggest(request, input) { const record = { id: randomUUID(), user_id: cloud ? request.user?.id || null : owner(request), ...input, status: 'new', created_at: new Date().toISOString() }; if (!cloud) { local.suggestions.push(record); return record; } const { data, error } = await cloud.from('suggestions').insert(record).select().single(); if (error) throw error; return data; },
    async exportUser(request) { if(cloud) return exportCloudAccount(cloud,request.user); const result={};for(const table of ['collections','comparisons','threads'])result[table]=await this.list(table,request);result.suggestions=local.suggestions.filter(row=>row.user_id===owner(request));return result; }
    ,cloud,
    isAdmin(request) { return Boolean(cloud && request.user && (env.ADMIN_USER_IDS || '').split(',').map(value => value.trim()).includes(request.user.id)); }
  };
}
