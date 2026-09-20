-- John Jay CSS — initial schema for the NEW Supabase project.
-- Shapes adapted from rhecwb's migrations (members, onboarding, events,
-- board profiles, records, site_settings) + the John Jay apps pipeline.
-- Re-implemented, not copied; RLS on everything; the service key (used only
-- by the Python API) bypasses RLS by design.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- members
create table public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  major text,
  class_year text,
  discord_handle text,
  role text not null default 'member',            -- member | board | alumni
  status text not null default 'active',          -- active | inactive | alumni
  joined_term text,                               -- e.g. 'Fall 2026'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------ onboarding queue
create table public.onboarding_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  major text,
  class_year text,
  interests text,
  status text not null default 'new',             -- new | approved | declined
  decided_by uuid references public.members(id),
  decided_at timestamptz,
  source text not null default 'site-join-form',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------- app records
-- Public showcase records (approved) — the /apps page reads these.
create table public.apps (
  id text primary key,                            -- '2026/apps/<slug>'
  title text not null,
  summary text,
  author_name text,
  author_handle text,
  author_class_year text,
  platform text[] not null default '{}',          -- web|ios|android|desktop|cli
  stack text[] not null default '{}',
  links jsonb not null default '{}',              -- {web, store, repo}
  screenshots text[] not null default '{}',
  benefits_jj text,
  status text not null default 'approved',        -- approved | live | archived
  term text,
  visibility text not null default 'public',
  last_updated date default current_date,
  created_at timestamptz not null default now()
);

-- Raw submissions from the /apps form — the OS approval queue reads these.
create table public.app_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author_name text not null,
  author_email text not null,
  summary text not null,
  platform text[] not null default '{}',
  link text,
  status text not null default 'submitted',       -- submitted | approved | rejected
  decided_by uuid references public.members(id),
  decided_at timestamptz,
  source text not null default 'site-apps-form',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------- events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  semester text not null,                         -- 'Fall 2026'
  summary text,
  starts_at timestamptz,
  time_label text,                                -- '1:40 PM - 2:55 PM'
  room text,
  flyer text,                                     -- img path
  rsvp_url text,
  status text not null default 'upcoming',        -- upcoming | past | cancelled
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------- board profiles
create table public.board_profiles (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id),
  term text not null,                             -- 'Fall 2026 - Spring 2027'
  role text not null,                             -- President, VP, ...
  group_label text not null default 'Executive Board Members',
  name text not null,
  bio text,
  photo text,
  socials jsonb not null default '{}',
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------- site settings
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.members(id),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- records
-- The inheritance spine: handoffs, board notes, term records (rhecwb pattern).
create table public.records (
  id text primary key,                            -- '2026/handoff/fall'
  type text not null,                             -- handoff | board-note | term-record
  title text not null,
  body text,
  meta jsonb not null default '{}',
  visibility text not null default 'board',       -- board | public
  created_by uuid references public.members(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --------------------------------------------------------------------- RLS
alter table public.members enable row level security;
alter table public.onboarding_requests enable row level security;
alter table public.apps enable row level security;
alter table public.app_submissions enable row level security;
alter table public.events enable row level security;
alter table public.board_profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.records enable row level security;

-- Public (anon) may read only what the public site shows.
create policy apps_public_read on public.apps
  for select using (visibility = 'public');
create policy events_public_read on public.events
  for select using (true);
create policy board_public_read on public.board_profiles
  for select using (true);
create policy settings_public_read on public.site_settings
  for select using (true);
create policy records_public_read on public.records
  for select using (visibility = 'public');

-- No anon writes anywhere: submissions go through the Python API (service key).
-- Board/OS access arrives with Supabase Auth in a later migration; until then
-- the service-key API is the only writer.

-- ------------------------------------------------------------------- seeds
insert into public.site_settings (key, value) values
  ('links', '{"note": "seeded empty; the OS Settings page fills this from data/links.json"}'),
  ('taglines', '{"primary": "Debug Your Mind, Commit To Growth!", "ticker": "Algorithm Thinking | Dev Journeys | Tech Motivation"}')
on conflict (key) do nothing;
