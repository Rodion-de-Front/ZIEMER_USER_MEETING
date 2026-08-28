alter table users
  add column if not exists suspended_at timestamptz null;
