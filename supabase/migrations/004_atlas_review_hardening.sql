-- Apply after 003 in staging. No automatic execution from the application.
create index if not exists room_notes_recent on room_notes(room_id,created_at desc);
create index if not exists contributions_own_recent on contributions(user_id,created_at desc);
create index if not exists contributions_review_queue on contributions(status,created_at desc);
alter table room_notes add constraint room_note_not_blank check(length(btrim(text))>0) not valid;

create or replace function review_atlas_contribution(p_id uuid,p_expected text,p_status text,p_note text,p_reviewer uuid)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare result contributions;
begin
 if length(btrim(p_note))<3 or length(p_note)>2000 then raise exception 'Review requires a meaningful reason'; end if;
 if not ((p_expected='submitted' and p_status in('reviewing','accepted','rejected')) or (p_expected='reviewing' and p_status in('accepted','rejected'))) then return null; end if;
 update contributions set status=p_status,review_note=btrim(p_note),reviewer_id=p_reviewer,updated_at=clock_timestamp()
 where id=p_id and status=p_expected and user_id<>p_reviewer returning * into result;
 if result.id is null then return null;end if;
 insert into audit_events(actor_id,action,entity_type,entity_id,payload)
 values(p_reviewer,'review','contribution',p_id::text,jsonb_build_object('from',p_expected,'to',p_status,'note',btrim(p_note)));
 return to_jsonb(result);
end $$;
revoke all on function review_atlas_contribution(uuid,text,text,text,uuid) from public,anon,authenticated;
grant execute on function review_atlas_contribution(uuid,text,text,text,uuid) to service_role;
