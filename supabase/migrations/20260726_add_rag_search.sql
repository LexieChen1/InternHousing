-- Semantic retrieval for active housing listings.
-- text-embedding-3-small returns 1536-dimensional vectors by default.
create extension if not exists vector
with schema extensions;

create table public.listing_embeddings (
  listing_id uuid primary key
    references public.listings(id)
    on delete cascade,
  search_document text not null,
  embedding extensions.vector(1536) not null,
  embedding_model text not null,
  embedding_version integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.listing_embeddings
enable row level security;

-- Vectors are an implementation detail. Clients retrieve matches only through
-- the bounded function below, which returns active public listing fields.
revoke all on table public.listing_embeddings
from anon, authenticated;

create or replace function public.match_active_listings(
  query_embedding extensions.vector(1536),
  match_count integer default 5,
  min_rent integer default null,
  max_rent integer default null,
  requested_room_type text default null,
  requested_furnished boolean default null,
  requested_campus text default null,
  requested_move_in date default null,
  requested_move_out date default null
)
returns table (
  id uuid,
  title text,
  description text,
  city text,
  state text,
  nearby_campus text,
  monthly_rent integer,
  room_type text,
  furnished boolean,
  available_from date,
  available_until date,
  similarity double precision
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    listing.id,
    listing.title,
    listing.description,
    listing.city,
    listing.state,
    listing.nearby_campus,
    listing.monthly_rent,
    listing.room_type,
    listing.furnished,
    listing.available_from,
    listing.available_until,
    1 - (
      listing_embedding.embedding
      <=> query_embedding
    ) as similarity
  from public.listings as listing
  join public.listing_embeddings as listing_embedding
    on listing_embedding.listing_id = listing.id
  where listing.status = 'active'
    and (min_rent is null or listing.monthly_rent >= min_rent)
    and (max_rent is null or listing.monthly_rent <= max_rent)
    and (
      requested_room_type is null
      or listing.room_type = requested_room_type
    )
    and (
      requested_furnished is null
      or listing.furnished = requested_furnished
    )
    and (
      requested_campus is null
      or listing.nearby_campus ilike
        ('%' || requested_campus || '%')
    )
    and (
      requested_move_in is null
      or listing.available_from <= requested_move_in
    )
    and (
      requested_move_out is null
      or listing.available_until >= requested_move_out
    )
  order by listing_embedding.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 20);
$$;

revoke all on function public.match_active_listings(
  extensions.vector,
  integer,
  integer,
  integer,
  text,
  boolean,
  text,
  date,
  date
) from public;

grant execute on function public.match_active_listings(
  extensions.vector,
  integer,
  integer,
  integer,
  text,
  boolean,
  text,
  date,
  date
) to anon, authenticated;

-- Exact vector search is appropriate for the MVP. Add an HNSW index only
-- after the listing count and measured latency justify it.
