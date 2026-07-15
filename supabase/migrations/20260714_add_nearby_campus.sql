alter table public.listings
add column if not exists nearby_campus text
check (
  nearby_campus is null
  or char_length(nearby_campus) <= 150
);

create index if not exists listings_nearby_campus_idx
on public.listings(nearby_campus);