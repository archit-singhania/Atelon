-- Forward-only migration. Apply in preview and run ownership tests before production.
alter table public.collections add column if not exists revision integer not null default 1;
alter table public.collections add column if not exists system_key text;
create unique index if not exists collections_personal_garage on public.collections(user_id,system_key) where system_key is not null;
create table if not exists public.garage_sync_receipts (
 user_id uuid not null references auth.users on delete cascade,
 operation_id uuid not null,
 payload jsonb not null,
 response jsonb not null,
 created_at timestamptz not null default now(),
 primary key(user_id,operation_id)
);
alter table public.garage_sync_receipts enable row level security;
-- Receipts are private implementation data; only the trusted API may access them.
create or replace function public.bump_collection_revision() returns trigger
language plpgsql set search_path=public as $$
begin new.revision=old.revision+1;new.updated_at=clock_timestamp();return new;end $$;
drop trigger if exists collection_revision on public.collections;
create trigger collection_revision before update on public.collections for each row execute function public.bump_collection_revision();

create or replace function public.sync_personal_garage(p_user uuid,p_operation uuid,p_expected integer,p_document jsonb,p_preserve boolean default false)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare prior public.collections; receipt public.garage_sync_receipts; payload jsonb; result jsonb; slugs text[];
begin
 if p_expected<0 or jsonb_typeof(p_document->'vehicle_slugs')<>'array' or jsonb_array_length(p_document->'vehicle_slugs')>200
 or length(coalesce(p_document->>'name','')) not between 1 and 80 or length(coalesce(p_document->>'notes',''))>2000 then raise exception 'Invalid garage document';end if;
 perform pg_advisory_xact_lock(hashtextextended('garage:'||p_user::text,0));
 payload=jsonb_build_object('expectedRevision',p_expected,'document',p_document,'preserveConflict',p_preserve);
 select * into receipt from public.garage_sync_receipts where user_id=p_user and operation_id=p_operation;
 if found then
  if receipt.payload<>payload then return jsonb_build_object('kind','key-reuse');end if;
  return receipt.response;
 end if;
 select * into prior from public.collections where user_id=p_user and system_key='personal-garage' for update;
 if coalesce(prior.revision,0)<>p_expected then return jsonb_build_object('kind','conflict','record',case when prior.id is null then null else to_jsonb(prior) end);end if;
 if p_preserve and prior.id is not null then
  insert into public.collections(user_id,name,notes,visibility,vehicle_slugs) values(p_user,left(prior.name||' (conflict backup)',80),prior.notes,'private',prior.vehicle_slugs);
 end if;
 select coalesce(array_agg(distinct value order by value),'{}'::text[]) into slugs from jsonb_array_elements_text(p_document->'vehicle_slugs');
 if prior.id is null then
  insert into public.collections(user_id,system_key,name,notes,visibility,vehicle_slugs)
  values(p_user,'personal-garage',p_document->>'name',coalesce(p_document->>'notes',''),'private',slugs) returning * into prior;
 else
  update public.collections set name=p_document->>'name',notes=coalesce(p_document->>'notes',''),vehicle_slugs=slugs
  where id=prior.id returning * into prior;
 end if;
 result=jsonb_build_object('kind','ok','record',to_jsonb(prior));
 insert into public.garage_sync_receipts(user_id,operation_id,payload,response) values(p_user,p_operation,payload,result);
 return result;
end $$;
revoke all on function public.sync_personal_garage(uuid,uuid,integer,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.sync_personal_garage(uuid,uuid,integer,jsonb,boolean) to service_role;
