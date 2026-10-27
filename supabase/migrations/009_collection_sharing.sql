create table public.collection_shares (
 collection_id uuid primary key references public.collections(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 token_hash text not null unique check(length(token_hash)=64),
 snapshot jsonb not null,
 created_at timestamptz not null default now()
);
alter table public.collection_shares enable row level security;
-- No direct browser policies: owner checks and public projections live in the API.
create function public.share_collection(p_user uuid,p_collection uuid,p_revision integer,p_hash text,p_notes boolean)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare c public.collections; doc jsonb;
begin
 select * into c from public.collections where id=p_collection and user_id=p_user for update;
 if not found then return jsonb_build_object('kind','missing');end if;
 if c.revision<>p_revision then return jsonb_build_object('kind','conflict');end if;
 doc=jsonb_build_object('name',c.name,'vehicle_slugs',c.vehicle_slugs,'revision',c.revision,'shared_at',now());
 if p_notes then doc=doc||jsonb_build_object('notes',c.notes);end if;
 insert into public.collection_shares(collection_id,user_id,token_hash,snapshot) values(c.id,p_user,p_hash,doc)
 on conflict(collection_id) do update set token_hash=excluded.token_hash,snapshot=excluded.snapshot,created_at=now();
 return jsonb_build_object('kind','ok');
end $$;
revoke all on function public.share_collection(uuid,uuid,integer,text,boolean) from public,anon,authenticated;
grant execute on function public.share_collection(uuid,uuid,integer,text,boolean) to service_role;
