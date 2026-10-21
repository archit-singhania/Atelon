create table if not exists research_state (
 user_id uuid primary key references auth.users on delete cascade,
 state jsonb not null default '{}', updated_at timestamptz not null default now()
);
alter table research_state enable row level security;
create policy "own research state" on research_state for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create table if not exists catalogue_documents (
 slug text primary key, document jsonb not null, revision integer not null default 1,
 updated_by uuid references auth.users, updated_at timestamptz not null default now()
);
create table if not exists catalogue_revisions (
 id uuid primary key default gen_random_uuid(), slug text not null, document jsonb not null,
 revision integer not null, actor_id uuid references auth.users, created_at timestamptz not null default now(), unique(slug,revision)
);
create table if not exists processing_jobs (
 id uuid primary key default gen_random_uuid(), vehicle_slug text not null,
 status text not null default 'uploaded' check (status in ('uploaded','inspected','optimizing','poster-generation','qa','published','failed')),
 object_path text not null, metrics jsonb not null default '{}', created_by uuid references auth.users,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table catalogue_documents enable row level security;
alter table catalogue_revisions enable row level security;
alter table processing_jobs enable row level security;
-- All administrative access is through the trusted Fastify service role after verified administrator identity.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('vehicle-ingest','vehicle-ingest',false,104857600,array['model/gltf-binary','application/octet-stream','image/webp'])
on conflict (id) do nothing;

create or replace function save_research_state(p_user uuid, p_state jsonb, p_expected timestamptz)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare result research_state;
begin
 insert into research_state(user_id,state,updated_at) values(p_user,p_state,clock_timestamp())
 on conflict(user_id) do update set state=excluded.state,updated_at=excluded.updated_at
 where research_state.updated_at=p_expected returning * into result;
 return case when result.user_id is null then null else to_jsonb(result) end;
end $$;
revoke all on function save_research_state(uuid,jsonb,timestamptz) from public,anon,authenticated;
grant execute on function save_research_state(uuid,jsonb,timestamptz) to service_role;

create or replace function save_catalogue_document(p_slug text,p_document jsonb,p_expected integer,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare prior_revision integer; result catalogue_documents;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_slug,0));
 select revision into prior_revision from catalogue_documents where slug=p_slug;
 if coalesce(prior_revision,0)<>p_expected then return null; end if;
 insert into catalogue_documents(slug,document,revision,updated_by,updated_at)
 values(p_slug,p_document,p_expected+1,p_actor,clock_timestamp())
 on conflict(slug) do update set document=excluded.document,revision=excluded.revision,updated_by=excluded.updated_by,updated_at=excluded.updated_at returning * into result;
 insert into catalogue_revisions(slug,document,revision,actor_id) values(p_slug,p_document,p_expected+1,p_actor);
 insert into audit_events(actor_id,action,entity_type,entity_id,payload) values(p_actor,'save','vehicle',p_slug,jsonb_build_object('revision',p_expected+1));
 return to_jsonb(result);
end $$;
revoke all on function save_catalogue_document(text,jsonb,integer,uuid) from public,anon,authenticated;
grant execute on function save_catalogue_document(text,jsonb,integer,uuid) to service_role;
