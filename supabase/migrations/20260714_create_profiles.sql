create table if not exists public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  full_name text
    check (char_length(full_name) <= 100),

  university text
    check (char_length(university) <= 150),

  graduation_year integer
    check (
      graduation_year is null
      or graduation_year between 2000 and 2100
    ),

  bio text
    check (char_length(bio) <= 500),

  avatar_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Only authenticated users need API access.
revoke all on table public.profiles from anon;

grant select, insert, update
on table public.profiles
to authenticated;

grant select, insert, update, delete
on table public.profiles
to service_role;

alter table public.profiles
enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Automatically create a profile after signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    full_name
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists
  on_auth_user_created
  on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- Create profiles for users who signed up before this migration.
insert into public.profiles (
  id,
  full_name
)
select
  id,
  raw_user_meta_data ->> 'full_name'
from auth.users
on conflict (id) do nothing;