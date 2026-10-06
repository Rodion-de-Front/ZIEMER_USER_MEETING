alter table users add column if not exists auth_version integer not null default 0;

create table if not exists password_reset_codes (
  user_id uuid primary key references users(id) on delete cascade,
  code_hash bytea not null,
  expires_at timestamptz not null,
  requested_at timestamptz not null default now(),
  attempts integer not null default 0
);

create index if not exists password_reset_codes_expires_at_idx
  on password_reset_codes (expires_at);
