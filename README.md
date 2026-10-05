# InternHousing

InternHousing is a short-term housing marketplace designed for college students
and interns. It helps renters find housing that fits an internship's dates,
budget, location, and room preferences without committing to a year-long lease.

The project is currently an early-stage MVP built with Next.js and Supabase.

## Features

- Browse active short-term housing listings
- Search by city, state, listing title, or nearby campus
- Filter by maximum monthly rent, room type, and availability dates
- Sort listings by monthly rent
- View individual listing details
- Sign up, sign in, and sign out with email and password
- Create and update a user profile
- Publish a listing from a protected account
- Protect profile and listing data with Supabase Row Level Security
- Responsive interface styled with Tailwind CSS

## Tech Stack

- [Next.js 16](https://nextjs.org/) with the App Router
- [React 19](https://react.dev/) and TypeScript
- [Supabase](https://supabase.com/) for PostgreSQL and authentication
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) for icons
- ESLint for static analysis

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- A Supabase project

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a `.env.local` file in the project root:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Both values are available in your Supabase project's API settings. Only use the
publishable key in this file; never expose a Supabase service-role key to the
browser.

To browse the application with sample data while a free Supabase project is
paused, add:

```dotenv
SUPABASE_OFFLINE=true
```

Offline mode disables session detection and uses the local mock listings.
Remove this variable, or set it to `false`, after resuming Supabase to restore
authentication and live database queries.

### 3. Apply the database migrations

Run the SQL files in `supabase/migrations` in filename order:

1. `20260712_create_listings.sql`
2. `20260714_create_profiles.sql`
3. `20260714_add_listing_owner.sql`
4. `20260714_add_nearby_campus.sql`

You can apply them with the Supabase CLI or paste them into the Supabase SQL
Editor. The first migration also creates three sample listings for local
development.

If email confirmation is enabled in Supabase Auth, add your local application
URL (typically `http://localhost:3000`) to the allowed redirect URLs.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Application Routes

| Route | Description | Access |
| --- | --- | --- |
| `/` | Landing page and featured listings | Public |
| `/listings` | Searchable listing catalog | Public |
| `/listings/[id]` | Listing details | Public |
| `/login` | Sign-up and sign-in forms | Public |
| `/account` | Account overview | Authenticated |
| `/profile` | View and edit a profile | Authenticated |
| `/listings/new` | Publish a listing | Authenticated |

## Project Structure

```text
app/                    Next.js routes, pages, and server actions
components/             Shared UI and listing-search components
lib/                    Supabase clients and listing data access
public/                 Static assets
supabase/migrations/    PostgreSQL schema, policies, and seed data
types/                  Shared TypeScript types
docs/system-design.md   Product and architecture design document
```

## Data and Security

Supabase Row Level Security is enabled for the application's core tables:

- Anyone can read active listings.
- Authenticated users can create listings owned by their account.
- Users can update or delete only listings they own.
- Profile records are private to their associated user.
- A database trigger creates a profile when a new Supabase Auth user signs up.

Input used by the current profile and listing forms is also validated in server
actions before it is written to the database.

## Current Scope

The repository implements the marketplace foundation. The following items are
part of the planned product direction and are not yet implemented:

- Listing editing and deletion in the UI
- Listing image uploads
- Favorites and booking requests
- Geographic and commute-based search
- Automated tests and production observability

For the proposed architecture and longer-term roadmap, see
[docs/system-design.md](docs/system-design.md).

## How Our Search Algorithm Works

Search uses rule-based interpretation and keyword ranking. It requires only
Supabase configuration; no model API keys or indexing commands are needed.

1. Validate the search request.
2. Recognize supported phrases for minimum/maximum rent, room type, furnished
   status, and nearby campus. Explicit UI filters take precedence.
3. Load active listings from Supabase (or mock listings in offline mode).
4. Filter by the resolved requirements, including explicit availability dates.
5. Rank eligible listings by keyword overlap and return all matching listings.
6. Build summaries and explanations directly from listing fields.

Date phrases in free text are not parsed; use the date filters. Keyword search
matches words rather than meaning and does not use a language model.
The existing vector-search migration is historical and is not required by the
current search endpoint.

## Contributing

1. Create a branch for your change.
2. Make the change and keep it focused.
3. Run `npm run lint` and `npm run build`.
4. Open a pull request describing the behavior and any database changes.
