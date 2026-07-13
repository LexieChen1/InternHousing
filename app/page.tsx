import { ListingCard } from "@/components/listing-card";
import { Navbar } from "@/components/navbar";
import { SearchBar } from "@/components/search-bar";
import { mockListings } from "@/lib/mock-listings";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            Housing built for internships
          </p>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Find a place for your internship, NOT a year-long lease.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Search short-term housing by internship dates, budget, location,
            and the preferences that matter to you.
          </p>

          <div className="mt-10">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Available this summer
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Featured housing
            </h2>
          </div>

          <button className="text-sm font-semibold text-slate-700 hover:text-slate-950">
            View all listings →
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-7xl text-sm text-slate-500">
          © 2026 InternHousing
        </div>
      </footer>
    </main>
  );
}