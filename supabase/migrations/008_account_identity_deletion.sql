-- Forward only. Review and apply in preview before enabling ACCOUNT_DELETION_ENABLED.
-- Retain shared editorial records without a link to the deleted identity.
alter table public.catalogue_documents drop constraint catalogue_documents_updated_by_fkey;
alter table public.catalogue_documents add constraint catalogue_documents_updated_by_fkey foreign key(updated_by) references auth.users(id) on delete set null;
alter table public.catalogue_revisions drop constraint catalogue_revisions_actor_id_fkey;
alter table public.catalogue_revisions add constraint catalogue_revisions_actor_id_fkey foreign key(actor_id) references auth.users(id) on delete set null;
alter table public.processing_jobs drop constraint processing_jobs_created_by_fkey;
alter table public.processing_jobs add constraint processing_jobs_created_by_fkey foreign key(created_by) references auth.users(id) on delete set null;
alter table public.contributions drop constraint contributions_reviewer_id_fkey;
alter table public.contributions add constraint contributions_reviewer_id_fkey foreign key(reviewer_id) references auth.users(id) on delete set null;
alter table public.suggestions drop constraint suggestions_user_id_fkey;
alter table public.suggestions add constraint suggestions_user_id_fkey foreign key(user_id) references auth.users(id) on delete cascade;
alter table public.audit_events drop constraint audit_events_actor_id_fkey;
alter table public.audit_events add constraint audit_events_actor_id_fkey foreign key(actor_id) references auth.users(id) on delete cascade;
alter table public.audit_events enable row level security;

-- Capability check before calling the supported Auth admin deletion API.
create function public.account_deletion_ready() returns boolean
language sql security invoker set search_path=public as $$ select true $$;
revoke all on function public.account_deletion_ready() from public,anon,authenticated;
grant execute on function public.account_deletion_ready() to service_role;
