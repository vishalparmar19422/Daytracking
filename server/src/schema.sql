-- DayTracking schema. gen_random_uuid() is built into Postgres 13+ core.
-- Mirrors the localStorage shape the client used during the prototype phase.

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table if not exists groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner_id   uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists group_members (
  group_id uuid not null references groups(id) on delete cascade,
  user_id  uuid not null references users(id) on delete cascade,
  primary key (group_id, user_id)
);

create table if not exists notes (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references groups(id) on delete cascade,
  author_id  uuid not null references users(id) on delete cascade,
  note_date  date not null,
  text       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_group_date_idx on notes (group_id, note_date desc);
create index if not exists group_members_user_idx on group_members (user_id);
