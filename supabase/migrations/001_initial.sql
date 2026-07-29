create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  role text check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);
create index on conversations(session_id, created_at);

create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  completed boolean default false,
  due_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  fire_at timestamptz not null,
  fired boolean default false,
  created_at timestamptz default now()
);

create table if not exists digests (
  id text primary key default 'latest',
  text text not null,
  created_at timestamptz default now()
);
