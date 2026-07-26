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
| `npm run rag:index` | Generate and store embeddings for active listings |

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

InternHousing does not use embeddings for every requirement. A housing query
usually contains both exact constraints and subjective preferences, and those
two groups need different retrieval methods.

Consider this request:

> Furnished private room near Columbia under $1,800 from June 1 to August 15,
> preferably quiet and close to transit.

The query interpreter converts the request into validated structured data
before any database query runs.

### Structured requirements

These requirements have a definite true-or-false answer and must be enforced
with PostgreSQL filters:

- Room type: `Private room`
- Furnished: `true`
- Maximum monthly rent: `$1,800`
- Available on or before June 1
- Available through or after August 15
- Nearby campus: `Columbia University`

An embedding must not decide whether rent is under a limit or whether a listing
covers the requested dates. PostgreSQL is the source of truth for those facts.
Explicit filters selected in the UI take precedence over values inferred from
the natural-language request.

### Semantic preferences

These requirements depend on meaning and can be ranked by similarity:

- Quiet
- Good for studying
- Close to transit
- Good for an intern

The system embeds these preferences and compares them with the stored listing
embeddings using cosine similarity. Claims such as “safe neighborhood” are not
inferred from similarity or generated without concrete supporting listing
data.

### Hybrid retrieval pipeline

1. Validate the request and interpret it as structured JSON.
2. Apply availability, rent, furnished, campus, and room-type filters.
3. Compare semantic similarity only among eligible listings.
4. Retrieve up to 20 candidates.
5. Rank the candidates and return the best 5 by default.
6. Give only those retrieved listings to the answer model.
7. Generate a concise, grounded explanation.
8. Validate that every explanation references a retrieved listing ID.

This is called **hybrid retrieval** because it combines exact relational
filtering with semantic vector search. It is also **retrieval-augmented
generation (RAG)** because the language model receives retrieved, current
listing records as context before generating its answer.

The language model does not control the database query, invent listing facts,
or replace the structured results. If query interpretation, embedding, or
answer generation fails, the application falls back to validated filters,
keyword ranking, and deterministic explanations.

## RAG Search Setup

The natural-language search uses a hybrid RAG pipeline:

1. PostgreSQL applies hard filters such as rent, dates, and room type.
2. `text-embedding-3-small` converts the request and listings into vectors.
3. pgvector ranks eligible listings by cosine similarity.
4. the Responses API explains only the retrieved listings.
5. validated, deterministic results remain available if answer generation fails.

Add these server-only values to `.env.local`:

```dotenv
OPENAI_API_KEY=your-openai-api-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional overrides
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_RAG_MODEL=gpt-5.4-nano
```

Never prefix either secret with `NEXT_PUBLIC_`.

Apply `supabase/migrations/20260726_add_rag_search.sql`, then index
active listings:

```bash
npm run rag:index
```

Run the indexing command again after a listing's searchable fields change.
For local offline development, the endpoint searches mock listings in memory
and automatically uses keyword ranking when no OpenAI key is configured.

## Contributing

1. Create a branch for your change.
2. Make the change and keep it focused.
3. Run `npm run lint` and `npm run build`.
4. Open a pull request describing the behavior and any database changes.
