import { redirect } from "next/navigation";

import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import { createListing } from "./actions";

type NewListingPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewListingPage({
  searchParams,
}: NewListingPageProps) {
  const { error } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="border-b border-slate-200 pb-6">
            <p className="text-sm font-semibold text-blue-600">
              Host your space
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Create a housing listing
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Add the essential details first. Images and
              amenities will be added in the next step.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            action={createListing}
            className="mt-8 space-y-6"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Listing title
              </span>

              <input
                name="title"
                type="text"
                required
                minLength={5}
                maxLength={100}
                placeholder="Furnished room near Midtown"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </span>

              <textarea
                name="description"
                required
                minLength={20}
                maxLength={2000}
                rows={6}
                placeholder="Describe the room, apartment, neighborhood, transportation, and ideal renter."
                className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  City
                </span>

                <input
                  name="city"
                  type="text"
                  required
                  placeholder="Jersey City"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  State
                </span>

                <input
                  name="state"
                  type="text"
                  required
                  maxLength={2}
                  placeholder="NJ"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                    Nearby college or campus
                </span>

                <input
                    name="nearbyCampus"
                    type="text"
                    maxLength={150}
                    placeholder="University at Albany"
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

                <span className="mt-2 block text-xs text-slate-400">
                    Optional. Enter the university or campus closest to the housing.
                </span>
                </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Monthly rent
                </span>

                <input
                  name="monthlyRent"
                  type="number"
                  required
                  min={1}
                  step={1}
                  placeholder="1800"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Room type
                </span>

                <select
                  name="roomType"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select a room type
                  </option>
                  <option value="Private room">
                    Private room
                  </option>
                  <option value="Shared room">
                    Shared room
                  </option>
                  <option value="Studio">
                    Studio
                  </option>
                  <option value="Entire apartment">
                    Entire apartment
                  </option>
                </select>
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
              <input
                name="furnished"
                type="checkbox"
                className="h-4 w-4"
              />

              <span className="text-sm font-medium text-slate-700">
                This housing is furnished
              </span>
            </label>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Available from
                </span>

                <input
                  name="availableFrom"
                  type="date"
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Available until
                </span>

                <input
                  name="availableUntil"
                  type="date"
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </label>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Publish listing
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}