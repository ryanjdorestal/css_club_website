-- John Jay CSS — 0002: the OS tables. Run after 0001_init.sql.
-- Shapes mirror api/_core/models.py (the validation layer) and seeds.py (the
-- Tier-1 fallback). All writes go through the Python API with the service
-- role; the browser holds only the anon key and reads published rows.

-- ------------------------------------------------------------------ terms
create table if not exists public.terms (
  id text primary key,                     -- 'F26', 'S27', 'F24-S25'
  label text not null,
  starts_on date,
  ends_on date,
  is_current boolean not null default false,
  created_at bigint not null default extract(epoch from now())::bigint,
  updated_at bigint not null default extract(epoch from now())::bigint
);

-- --------------------------------------------------------- board profiles
-- The roster that gates login: email + active + os_role for the current term.
alter table public.board_profiles
  add column if not exists email text,
  add column if not exists role_title text,
  add column if not exists photo_path text,
  add column if not exists active boolean not null default false,
  add column if not exists os_role text not null default 'officer',   -- officer | admin
  add column if not exists visibility text not null default 'public',
  add column if not exists updated_at bigint not null default extract(epoch from now())::bigint;
alter table public.board_profiles alter column id type text using id::text;
alter table public.board_profiles alter column id set default gen_random_uuid()::text;
create index if not exists board_profiles_term_email on public.board_profiles (term, lower(email));

-- ------------------------------------------------------------- projects
-- apps → projects (one section, one data model, one review queue).
alter table if exists public.apps rename to projects;
alter table public.projects
  add column if not exists kind text not null default 'app',               -- app | project | research | tool
  add column if not exists featured boolean not null default false,
  add column if not exists display_order int not null default 999,
  add column if not exists authors jsonb not null default '[]',
  add column if not exists author_email text,
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at bigint,
  add column if not exists review_notes text,
  add column if not exists published_at bigint,
  add column if not exists source text,
  add column if not exists example boolean not null default false,
  add column if not exists created_by text,
  add column if not exists updated_at bigint not null default extract(epoch from now())::bigint;
alter table public.projects alter column status set default 'submitted';   -- submitted | in_review | changes_requested | approved | published | archived
alter table public.projects alter column id set default gen_random_uuid()::text;
alter table if exists public.app_submissions rename to project_submissions;  -- kept for history; new submissions are projects rows
create or replace view public.apps as select * from public.projects where kind = 'app';  -- one release of compatibility

-- ----------------------------------------------------------------- posts
create table if not exists public.posts (
  id text primary key,                     -- = slug
  slug text unique not null,
  title text not null,
  dek text,
  body_md text not null default '',
  cover_path text,
  author_profile_id text,
  author_name text,
  status text not null default 'draft',    -- draft | review | published | archived
  published_at text,
  tags text[] not null default '{}',
  source text,
  created_by text,
  created_at bigint not null default extract(epoch from now())::bigint,
  updated_at bigint not null default extract(epoch from now())::bigint
);

-- ---------------------------------------------------------------- events
alter table public.events alter column id type text using id::text;
alter table public.events alter column id set default gen_random_uuid()::text;
alter table public.events
  add column if not exists date_label text,
  add column if not exists location text,
  add column if not exists flyer_path text,
  add column if not exists recap_post_id text,
  add column if not exists "when" text not null default 'upcoming',        -- upcoming | past | cancelled
  add column if not exists sort int not null default 0,
  add column if not exists created_by text,
  add column if not exists updated_at bigint not null default extract(epoch from now())::bigint;
alter table public.events alter column status set default 'draft';         -- draft | published | archived

-- ------------------------------------------------------------- resources
create table if not exists public.resources (
  id text primary key,
  "group" text not null,
  title text not null,
  url text not null,
  description text,
  sort int not null default 0,
  last_checked bigint,
  last_status int,
  dead boolean not null default false,
  created_by text,
  created_at bigint not null default extract(epoch from now())::bigint,
  updated_at bigint not null default extract(epoch from now())::bigint
);

create table if not exists public.links (
  key text primary key,                    -- discord | join_form | linktree …
  url text not null,
  label text,
  last_checked bigint,
  last_status int,
  dead boolean not null default false,
  updated_at bigint not null default extract(epoch from now())::bigint
);

-- --------------------------------------------------------------- members
-- The Discord & member tracker (people, not auth). Replaces 0001's shape.
alter table public.members alter column id type text using id::text;
alter table public.members alter column id set default gen_random_uuid()::text;
alter table public.members alter column full_name drop not null;
alter table public.members alter column email drop not null;
alter table public.members drop constraint if exists members_email_key;
alter table public.members
  add column if not exists display_name text,
  add column if not exists school_email text,
  add column if not exists last_seen_term text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists notes text,
  add column if not exists source text not null default 'manual',        -- form | import | manual
  add column if not exists status_note text,
  add column if not exists created_by text;
alter table public.members alter column status set default 'interested'; -- interested | member | active | alumni | left

-- -------------------------------------------------------------- handoffs
create table if not exists public.handoffs (
  id text primary key default gen_random_uuid()::text,
  profile_id text,
  officer_name text,
  role_title text,
  term text,
  body_md text not null default '',
  status text not null default 'draft',    -- draft | filed | acknowledged
  filed_at bigint,
  created_by text,
  created_at bigint not null default extract(epoch from now())::bigint,
  updated_at bigint not null default extract(epoch from now())::bigint
);

-- --------------------------------------------------------------- records
-- The audit log (who · action · table · row · before/after · when).
alter table public.records alter column id type text using id::text;
alter table public.records
  add column if not exists actor text,
  add column if not exists action text,
  add column if not exists table_name text,
  add column if not exists row_id text,
  add column if not exists before jsonb,
  add column if not exists after jsonb,
  add column if not exists note text;
alter table public.records alter column type set default 'audit';
alter table public.records alter column title set default '';
create index if not exists records_table_created on public.records (table_name, created_at desc);

-- ----------------------------------------------------------- settings
alter table public.site_settings add column if not exists updated_by text;
alter table public.site_settings alter column updated_at type bigint using extract(epoch from updated_at)::bigint;

-- --------------------------------------------------------------------- RLS
alter table public.terms enable row level security;
alter table public.posts enable row level security;
alter table public.resources enable row level security;
alter table public.links enable row level security;
alter table public.handoffs enable row level security;

create policy terms_public_read on public.terms for select using (true);
create policy posts_public_read on public.posts for select using (status = 'published');
create policy resources_public_read on public.resources for select using (true);
create policy links_public_read on public.links for select using (true);
drop policy if exists apps_public_read on public.projects;
create policy projects_public_read on public.projects for select using (status = 'published' and visibility = 'public');
drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events for select using (status = 'published');
-- board_profiles: public rows only; officers (authenticated) can read the roster
drop policy if exists board_public_read on public.board_profiles;
create policy board_public_read on public.board_profiles for select using (visibility = 'public' or auth.role() = 'authenticated');
-- handoffs, members, records, project_submissions: no anon access — API (service role) only.

-- --------------------------------------------------------------- storage
insert into storage.buckets (id, name, public) values ('public-media', 'public-media', true) on conflict (id) do nothing;
create policy "public-media read" on storage.objects for select using (bucket_id = 'public-media');
-- writes: service role only (the API), no policy for anon/authenticated.
