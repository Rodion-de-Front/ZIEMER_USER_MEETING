create table if not exists registration_codes (
  email text primary key,
  code_hash bytea not null,
  expires_at timestamptz not null,
  requested_at timestamptz not null default now(),
  attempts integer not null default 0,
  verified_at timestamptz
);

create index if not exists registration_codes_expires_at_idx
  on registration_codes (expires_at);
