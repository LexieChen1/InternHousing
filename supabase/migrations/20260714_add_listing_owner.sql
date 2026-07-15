-- Connect listings to user profiles.
-- Keep owner_id nullable because existing sample listings have no owner.
alter table public.listings
add column if not exists owner_id uuid
references public.profiles(id)
on delete cascade;

create index if not exists listings_owner_id_idx
on public.listings(owner_id);

-- Allow authenticated users to create and manage listings.
grant insert, update, delete
on table public.listings
to authenticated;

-- Users can create listings only for themselves.
create policy "Users can create their own listings"
on public.listings
for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
);

-- Users can update only their own listings.
create policy "Users can update their own listings"
on public.listings
for update
to authenticated
using (
  (select auth.uid()) = owner_id
)
with check (
  (select auth.uid()) = owner_id
);

-- Users can delete only their own listings.
create policy "Users can delete their own listings"
on public.listings
for delete
to authenticated
using (
  (select auth.uid()) = owner_id
);