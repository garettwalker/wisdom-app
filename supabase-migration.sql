-- Migration: Add journal support to existing user_progress table
-- Run this if you already have the user_progress table

-- Add journal_entry column if it doesn't exist
alter table user_progress
  add column if not exists journal_entry text;

-- Add completed_at column (rename existing or add new)
-- Note: If you have the old schema, completed_at may already exist
alter table user_progress
  add column if not exists completed_at timestamp with time zone;

-- Add updated_at column
alter table user_progress
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Remove session_duration if you want to simplify (optional - keeping for now)
-- alter table user_progress drop column if exists session_duration;

-- Create updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = timezone('utc'::text, now());
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists update_user_progress_updated_at on user_progress;

create trigger update_user_progress_updated_at
  before update on user_progress
  for each row execute procedure public.update_updated_at_column();

-- Index for completed days
create index if not exists user_progress_completed_idx on user_progress(user_id, completed_at)
  where completed_at is not null;
