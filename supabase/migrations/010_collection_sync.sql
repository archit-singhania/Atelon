-- Uses the revisions and receipt table introduced by 007.
create function public.sync_collection(p_user uuid,p_operation uuid,p_expected integer,p_document jsonb,p_preserve boolean,p_collection uuid)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare prior public.collections; receipt public.garage_sync_receipts; payload jsonb; result jsonb; slugs text[];
begin
 if p_user is null or p_collection is null or p_expected is null or p_expected<0 or p_document is null
 or jsonb_typeof(p_document->'vehicle_slugs') is distinct from 'array'
 or length(btrim(coalesce(p_document->>'name',''))) not between 1 and 80
 or length(coalesce(p_document->>'notes',''))>2000 then raise exception 'Invalid collection';end if;
 if jsonb_array_length(p_document->'vehicle_slugs')>200 then raise exception 'Too many vehicles';end if;
 perform pg_advisory_xact_lock(hashtextextended('garage:'||p_user::text,0));
 payload=jsonb_build_object('collection',p_collection,'expectedRevision',p_expected,'document',p_document,'preserveConflict',p_preserve);
 select * into receipt from public.garage_sync_receipts where user_id=p_user and operation_id=p_operation;
 if found then
  if receipt.payload<>payload then return jsonb_build_object('kind','key-reuse');end if;
  return receipt.response;
 end if;
 select * into prior from public.collections where id=p_collection for update;
 if found and prior.user_id<>p_user then return jsonb_build_object('kind','missing');end if;
 if coalesce(prior.revision,0)<>p_expected then return jsonb_build_object('kind','conflict','record',case when prior.id is null then null else to_jsonb(prior) end);end if;
 if p_preserve and prior.id is not null then
  insert into public.collections(user_id,name,notes,visibility,vehicle_slugs) values(p_user,left(prior.name||' (conflict backup)',80),prior.notes,'private',prior.vehicle_slugs);
 end if;
 select coalesce(array_agg(distinct value order by value),'{}'::text[]) into slugs from jsonb_array_elements_text(p_document->'vehicle_slugs');
 if prior.id is null then
  insert into public.collections(id,user_id,name,notes,visibility,vehicle_slugs) values(p_collection,p_user,p_document->>'name',p_document->>'notes','private',slugs) returning * into prior;
 else
  update public.collections set name=p_document->>'name',notes=p_document->>'notes',vehicle_slugs=slugs where id=p_collection returning * into prior;
 end if;
 result=jsonb_build_object('kind','ok','record',to_jsonb(prior));
 insert into public.garage_sync_receipts(user_id,operation_id,payload,response) values(p_user,p_operation,payload,result);
 return result;
end $$;
revoke all on function public.sync_collection(uuid,uuid,integer,jsonb,boolean,uuid) from public,anon,authenticated;
grant execute on function public.sync_collection(uuid,uuid,integer,jsonb,boolean,uuid) to service_role;
