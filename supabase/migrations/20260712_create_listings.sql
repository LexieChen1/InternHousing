create table public.listings (
    id uuid primary key default gen_random_uuid(), 

    title text not null, 
    description text not null, 

    city text not null, 
    state text not null, 

    monthly_rent integer not null
        check (monthly_rent > 0),
    
    room_type text not null 
        check (
            room_type in (
                'Private room', 
                'Shared room', 
                'Studio',  
                'Entire apartment'
            )
        ), 
    
    furnished boolean not null default false, 

    available_from date not null,   
    available_until date not null, 

    status text not null default 'active'
    check (
      status in (
        'draft',
        'active',
        'paused',
        'rented'
      )
    ),

     created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint valid_availability_dates
    check (available_until >= available_from)
); 

-- Row level security 
alter table public.listings
enable row level security;

-- read policy 
create policy "Anyone can view active listings"
on public.listings
for select
to anon, authenticated
using (status = 'active');

insert into public.listings (
  title,
  description,
  city,
  state,
  monthly_rent,
  room_type,
  furnished,
  available_from,
  available_until
)
values
(
  'Furnished Room Near PATH',
  'A bright furnished private room near the PATH station with convenient access to Manhattan.',
  'Jersey City',
  'NJ',
  1650,
  'Private room',
  true,
  '2027-06-01',
  '2027-08-31'
),
(
  'Summer Studio Near Midtown',
  'A furnished studio within walking distance of major Midtown offices.',
  'New York',
  'NY',
  2100,
  'Studio',
  true,
  '2027-05-20',
  '2027-08-20'
),
(
  'Private Room Near Columbia',
  'An affordable private room with convenient subway access near Columbia University.',
  'New York',
  'NY',
  1450,
  'Private room',
  false,
  '2027-06-10',
  '2027-09-01'
);