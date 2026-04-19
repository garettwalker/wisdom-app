-- Supabase Database Schema for Desert App
-- Run this in your Supabase project's SQL Editor

-- Create profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create progress table to store completed days with journal entries
create table user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  day_number integer not null check (day_number >= 1 and day_number <= 30),
  session_duration integer not null, -- duration in seconds
  journal_entry text, -- user's reflection/journal entry
  completed_at timestamp with time zone, -- when journal was saved (marks completion)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, day_number) -- One entry per day per user
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table user_progress enable row level security;

-- Profiles: Users can only read/write their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Progress: Users can only read/write their own progress
create policy "Users can view own progress"
  on user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on user_progress for update
  using (auth.uid() = user_id);

create policy "Users can delete own progress"
  on user_progress for delete
  using (auth.uid() = user_id);

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to auto-update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = timezone('utc'::text, now());
  return NEW;
end;
$$ language plpgsql;

create trigger update_user_progress_updated_at
  before update on user_progress
  for each row execute procedure public.update_updated_at_column();

-- Index for faster lookups
create index user_progress_user_id_idx on user_progress(user_id);
create index user_progress_day_number_idx on user_progress(day_number);
-- Index for finding completed days (has journal entry)
create index user_progress_completed_idx on user_progress(user_id, completed_at)
  where completed_at is not null;
