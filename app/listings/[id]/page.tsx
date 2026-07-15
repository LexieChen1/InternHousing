import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/navbar";
import { getListingById } from "@/lib/listings";

type ListingDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ListingDetailsPage({
  params,
}: ListingDetailsPageProps) {
  const { id } = await params;

  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/listings"
          className="text-sm font-medium text-slate-500 hover:text-slate-950"
        >
          ← Back to listings
        </Link>

        <div className="mt-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  Verified listing
                </span>

                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                  {listing.roomType}
                </span>

                {listing.furnished && (
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                    Furnished
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                {listing.title}
              </h1>

              <p className="mt-3 text-slate-500">
                {listing.city}, {listing.state}
              </p>

              {listing.nearbyCampus && (
                <p className="mt-2 text-sm font-medium text-blue-600">
                  Near {listing.nearbyCampus}
                </p>
              )}
            </div>

            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              ♡ Save listing
            </button>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-4 md:grid-rows-2">
            <div className="flex min-h-80 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-slate-300 md:col-span-2 md:row-span-2">
              <span className="text-sm font-medium text-slate-500">
                Main listing image
              </span>
            </div>

            <div className="flex min-h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100">
              <span className="text-sm text-slate-400">
                Image 2
              </span>
            </div>

            <div className="flex min-h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-slate-200">
              <span className="text-sm text-slate-400">
                Image 3
              </span>
            </div>

            <div className="flex min-h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-blue-100">
              <span className="text-sm text-slate-400">
                Image 4
              </span>
            </div>

            <div className="flex min-h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 to-white">
              <span className="text-sm text-slate-400">
                Image 5
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <section className="border-b border-slate-200 pb-8">
              <h2 className="text-xl font-semibold text-slate-950">
                About this place
              </h2>

              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                {listing.description}
              </p>
            </section>

            <section className="border-b border-slate-200 py-8">
              <h2 className="text-xl font-semibold text-slate-950">
                Stay details
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Available
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-950">
                    {listing.availableFrom} –{" "}
                    {listing.availableUntil}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Room type
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-950">
                    {listing.roomType}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Commute
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-950">
                    {listing.commute}
                  </p>
                </div>

                {listing.nearbyCampus && (
                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Nearby campus
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-950">
                      {listing.nearbyCampus}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="py-8">
              <h2 className="text-xl font-semibold text-slate-950">
                Amenities
              </h2>

              {listing.amenities.length > 0 ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {listing.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm text-slate-700"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-700">
                        ✓
                      </span>

                      {amenity}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No amenities have been added yet.
                </p>
              )}
            </section>
          </div>

          <aside>
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-950/5">
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-slate-950">
                  ${listing.monthlyRent.toLocaleString()}

                  <span className="text-sm font-normal text-slate-500">
                    {" "}
                    / month
                  </span>
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200">
                <div className="border-r border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Move in
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-950">
                    {listing.availableFrom}
                  </p>
                </div>

                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Move out
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-950">
                    {listing.availableUntil}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Request to book
              </button>

              <p className="mt-3 text-center text-xs text-slate-400">
                You will not be charged yet.
              </p>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <p className="text-sm text-slate-500">
                  Listed by
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600">
                    {listing.ownerName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {listing.ownerName}
                    </p>

                    <p className="text-xs text-slate-500">
                      Verified housing provider
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}