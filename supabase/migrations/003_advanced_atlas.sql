create table if not exists research_rooms (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users on delete cascade,
 invite_hash text not null,state jsonb not null default '{}',version integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists room_members (room_id uuid references research_rooms on delete cascade,user_id uuid references auth.users on delete cascade,created_at timestamptz default now(),primary key(room_id,user_id));
create table if not exists room_notes (id uuid primary key default gen_random_uuid(),room_id uuid not null references research_rooms on delete cascade,user_id uuid not null references auth.users on delete cascade,text text not null check(length(text)<=1000),created_at timestamptz default now());
alter table research_rooms enable row level security;alter table room_members enable row level security;alter table room_notes enable row level security;
create policy "read own membership" on room_members for select using(user_id=auth.uid());
create policy "read joined room" on research_rooms for select using(exists(select 1 from room_members where room_id=research_rooms.id and user_id=auth.uid()));
create policy "read joined room notes" on room_notes for select using(exists(select 1 from room_members where room_id=room_notes.room_id and user_id=auth.uid()));
do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') then
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='research_rooms' and schemaname='public') then alter publication supabase_realtime add table research_rooms; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='room_notes' and schemaname='public') then alter publication supabase_realtime add table room_notes; end if;
 end if;
end $$;

create table if not exists contributions (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,
 vehicle_slug text not null,kind text not null check(kind in('specification','relationship','annotation','model')),proposal jsonb not null,
 source_url text not null,status text not null default 'submitted' check(status in('submitted','reviewing','accepted','rejected')),
 review_note text,reviewer_id uuid references auth.users,created_at timestamptz default now(),updated_at timestamptz default now()
);
alter table contributions enable row level security;
create policy "read own contributions" on contributions for select using(user_id=auth.uid());

create or replace function review_atlas_contribution(p_id uuid,p_expected text,p_status text,p_note text,p_reviewer uuid)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare result contributions;
begin
 update contributions set status=p_status,review_note=p_note,reviewer_id=p_reviewer,updated_at=clock_timestamp()
 where id=p_id and status=p_expected returning * into result;
 if result.id is null then return null;end if;
 insert into audit_events(actor_id,action,entity_type,entity_id,payload)
 values(p_reviewer,'review','contribution',p_id::text,jsonb_build_object('from',p_expected,'to',p_status,'note',p_note));
 return to_jsonb(result);
end $$;
revoke all on function review_atlas_contribution(uuid,text,text,text,uuid) from public,anon,authenticated;
grant execute on function review_atlas_contribution(uuid,text,text,text,uuid) to service_role;
