create table if not exists feedback_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  full_name text not null,
  rating integer not null check (rating between 1 and 5),
  message text not null,
  email_sent_at timestamptz,
  email_error text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_messages_created_at_idx
  on feedback_messages (created_at desc);
