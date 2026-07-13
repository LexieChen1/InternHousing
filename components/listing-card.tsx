import type { Listing } from "@/types/listing";

type ListingCardProps = {
  listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-blue-100 to-slate-200">
        <span className="text-sm font-medium text-slate-500">
          Listing image
        </span>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-950">
              {listing.title}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {listing.city}, {listing.state}
            </p>
          </div>

          <p className="whitespace-nowrap font-semibold text-slate-950">
            ${listing.monthlyRent.toLocaleString()}
            <span className="text-sm font-normal text-slate-500">/mo</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            {listing.roomType}
          </span>

          {listing.furnished && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              Furnished
            </span>
          )}
        </div>

        <p className="mt-4 text-sm text-slate-500">
          {listing.availableFrom} – {listing.availableUntil}
        </p>
      </div>
    </article>
  );
}