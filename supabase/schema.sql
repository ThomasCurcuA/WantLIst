-- WantList Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  username text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories table (user-defined)
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  icon text not null default '📦',
  color text not null default 'gray',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Wishes table (category is now a free string, no CHECK constraint)
create table if not exists public.wishes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  price numeric default 0,
  notes text,
  priority text check (priority in ('LOW', 'MED', 'HIGH')) default 'MED',
  category text default 'Other',
  image_url text,
  product_link text,
  is_bought boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.wishes enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Categories policies
create policy "Users can view own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Wishes policies
create policy "Users can view own wishes"
  on public.wishes for select
  using (auth.uid() = user_id);

create policy "Users can insert own wishes"
  on public.wishes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own wishes"
  on public.wishes for update
  using (auth.uid() = user_id);

create policy "Users can delete own wishes"
  on public.wishes for delete
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Migration helper: if you already have the old wishes table with category CHECK constraint:
-- ALTER TABLE public.wishes DROP CONSTRAINT IF EXISTS wishes_category_check;
