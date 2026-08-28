create type user_role as enum ('user', 'admin');
create type campaign_status as enum ('scheduled', 'sending', 'sent', 'failed');

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  workplace text not null,
  city text not null,
  phone text,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

create table push_campaigns (
  id uuid primary key default gen_random_uuid(),
  title varchar(100) not null,
  body varchar(500) not null,
  scheduled_for timestamptz not null,
  status campaign_status not null default 'scheduled',
  sent_at timestamptz,
  delivery_count integer not null default 0,
  failure_count integer not null default 0,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create index users_search_idx on users using gin (
  to_tsvector('simple', coalesce(full_name, '') || ' ' || email || ' ' || coalesce(workplace, '') || ' ' || coalesce(city, '') || ' ' || coalesce(phone, ''))
);
create index push_campaigns_due_idx on push_campaigns (scheduled_for) where status = 'scheduled';
