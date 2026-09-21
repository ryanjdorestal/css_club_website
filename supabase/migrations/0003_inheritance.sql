-- John Jay CSS — 0003: the inheritance spine mirror. The truth is the
-- markdown under content/inheritance/ (Tier 1); this table mirrors it when
-- Supabase is configured so the snapshot can write files back. Supersedes
-- the 0002 `handoffs` table (kept for history; handoffs are now records of
-- type 'handoff').
create table if not exists public.inheritance_records (
  id text primary key,                       -- 'F26/decisions/2026-09-21-platform-adoption'
  path text not null,                        -- 'content/inheritance/<id>.md'
  type text not null,                        -- roster | handoff | decision | project | event | contact | lesson | minutes
  term text not null,
  title text not null,
  frontmatter jsonb not null default '{}',
  body_md text not null default '',
  updated_at bigint not null default extract(epoch from now())::bigint
);
create index if not exists inheritance_records_term on public.inheritance_records (term, type);
alter table public.inheritance_records enable row level security;
-- board-only: no anon policy; the API (service role) reads and writes.
