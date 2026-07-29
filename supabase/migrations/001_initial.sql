create table conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  role text check (role in ('user', 'assistant')),
  content text not null,
  tool_calls jsonb,
  created_at timestamptz default now()
);

create table todos (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  completed boolean default false,
  due_at timestamptz,
  created_at timestamptz default now()
);

create table reminders (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  fire_at timestamptz not null,
  fired boolean default false,
  created_at timestamptz default now()
);
