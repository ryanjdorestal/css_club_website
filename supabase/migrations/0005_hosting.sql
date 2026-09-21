-- 0005 — hosting budget (run 11). One function the service role calls to read how much of the
-- Supabase free tier this project uses (docs/HOSTING_LIMITS.md). Nothing here is reachable with
-- the anon key: the function is revoked from public/anon/authenticated and granted to service_role.
create or replace function public.hosting_usage()
returns jsonb
language sql
security definer
set search_path = public, pg_catalog
as $$
  select jsonb_build_object(
    'db_bytes', pg_database_size(current_database()),
    'storage_bytes', coalesce((select sum((metadata->>'size')::bigint) from storage.objects), 0),
    'rows', (
      select jsonb_object_agg(t.table_name, t.n) from (
        select 'posts' as table_name, count(*) as n from public.posts
        union all select 'projects', count(*) from public.projects
        union all select 'events', count(*) from public.events
        union all select 'workshops', count(*) from public.workshops
        union all select 'resources', count(*) from public.resources
        union all select 'members', count(*) from public.members
        union all select 'board_profiles', count(*) from public.board_profiles
        union all select 'records', count(*) from public.records
        union all select 'site_settings', count(*) from public.site_settings
      ) t
    ),
    'measured_at', now()
  );
$$;

revoke all on function public.hosting_usage() from public, anon, authenticated;
grant execute on function public.hosting_usage() to service_role;

-- The keepalive workflow writes this row every three days and reads it back (scripts/keepalive.py);
-- /api/health reports it so the OS can show "days since the last write" from the database itself.
insert into public.site_settings (key, value) values ('keepalive', '{"last_run": null, "source": "seed"}'::jsonb)
on conflict (key) do nothing;
