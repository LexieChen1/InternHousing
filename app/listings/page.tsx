import { ListingFilters } from "@/components/listing-filters";
import { Navbar } from "@/components/navbar";
import { getListings } from "@/lib/listings";

type ListingsPageProps = {
  searchParams: Promise<{
    location?: string | string[];
    moveIn?: string | string[];
    moveOut?: string | string[];
  }>;
};

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function ListingsPage({
  searchParams,
}: ListingsPageProps) {
  const query = await searchParams;
  const listings = await getListings();

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-sm font-semibold text-blue-600">
            Intern short-term housing
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Browse available listings
          </h1>

          <p className="mt-3 max-w-2xl text-slate-500">
            Find housing that matches your internship
            dates, budget, and preferred location.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <ListingFilters
          listings={listings}
          initialLocation={getSingleValue(query.location)}
          initialMoveIn={getSingleValue(query.moveIn)}
          initialMoveOut={getSingleValue(query.moveOut)}
        />
      </section>
    </main>
  );
}
