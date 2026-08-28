create table if not exists notification_reads (
  user_id uuid not null references users(id) on delete cascade,
  campaign_id uuid not null references push_campaigns(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (user_id, campaign_id)
);
