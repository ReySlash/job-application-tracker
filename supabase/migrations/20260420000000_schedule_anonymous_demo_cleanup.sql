-- Automatically clean up anonymous demo users after 1 hour.
-- Application rows are removed through applications.user_id on delete cascade.

create extension if not exists pg_cron with schema extensions;

do $$
declare
  existing_job_id bigint;
begin
  select jobid
  into existing_job_id
  from cron.job
  where jobname = 'cleanup-anonymous-demo-users-hourly';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;
end;
$$;

select cron.schedule(
  'cleanup-anonymous-demo-users-hourly',
  '0 * * * *',
  $$
    delete from auth.users
    where is_anonymous is true
      and created_at < now() - interval '1 hour';
  $$
);
