alter table public.processing_jobs add column if not exists attempts integer not null default 0;
alter table public.processing_jobs add column if not exists lease_id uuid;
create or replace function public.claim_processing_job()
returns setof public.processing_jobs language plpgsql security definer set search_path=public as $$
declare job_id uuid;
begin
  select id into job_id from public.processing_jobs
  where attempts < 3 and (status='inspected' or (status in ('optimizing','poster-generation') and updated_at < now()-interval '15 minutes'))
  order by created_at for update skip locked limit 1;
  if job_id is null then return; end if;
  return query update public.processing_jobs set status='optimizing',attempts=attempts+1,lease_id=gen_random_uuid(),updated_at=now()
  where id=job_id returning *;
end; $$;
revoke all on function public.claim_processing_job() from public,anon,authenticated;
grant execute on function public.claim_processing_job() to service_role;
