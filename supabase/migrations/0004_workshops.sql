-- John Jay CSS — 0004: workshops as a first-class entity (run 10 §7). Tier 1 keeps the same
-- rows in data/workshops.local.json, seeded from data/workshops.json.
create table if not exists workshops (
  id text primary key,
  client_id text,
  title text not null,
  series text,
  session_no int default 1,
  date date,
  time text,
  location text,
  level text default 'intro' check (level in ('intro', 'intermediate')),
  description_md text default '',
  materials jsonb default '[]'::jsonb,
  recording_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  archived_from text,
  sort int default 0,
  created_by text,
  created_at bigint,
  updated_at bigint
);
create index if not exists workshops_status_idx on workshops (status);
create index if not exists workshops_series_idx on workshops (series, session_no);
alter table workshops enable row level security;
-- the browser never reads this table directly; the API (service key) does
