"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type SubmitEvent,
} from "react";

import { ListingCard } from "@/components/listing-card";
import type { RagSearchResponse } from "@/lib/rag/types";
import type { Listing } from "@/types/listing";

type ListingFiltersProps = {
  listings: Listing[];
  initialLocation?: string;
  initialMoveIn?: string;
  initialMoveOut?: string;
  initialNaturalLanguageQuery?: string;
};

type SortOption =
  | "recommended"
  | "price-low"
  | "price-high";

export function ListingFilters({
  listings,
  initialLocation = "",
  initialMoveIn = "",
  initialMoveOut = "",
  initialNaturalLanguageQuery = "",
}: ListingFiltersProps) {
  // Values currently displayed inside the form
  const [locationInput, setLocationInput] = useState(initialLocation);
  const [maxRentInput, setMaxRentInput] = useState("");
  const [roomTypeInput, setRoomTypeInput] = useState("");

  // Values applied after the user clicks Search
  const [location, setLocation] = useState(initialLocation);
  const [moveIn, setMoveIn] = useState(initialMoveIn);
  const [moveOut, setMoveOut] = useState(initialMoveOut);
  const [maxRent, setMaxRent] = useState("");
  const [roomType, setRoomType] = useState("");

  const [sortBy, setSortBy] =
    useState<SortOption>("recommended");
  const [naturalLanguageQuery, setNaturalLanguageQuery] =
    useState(initialNaturalLanguageQuery);
  const [ragResult, setRagResult] =
    useState<RagSearchResponse | null>(null);
  const [ragError, setRagError] = useState("");
  const [isRagSearching, setIsRagSearching] =
    useState(false);
  const hasRunInitialSearch = useRef(false);

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setLocation(locationInput);
    setMaxRent(maxRentInput);
    setRoomType(roomTypeInput);
    setRagResult(null);
    setRagError("");
  }

  async function runRagSearch() {
    setIsRagSearching(true);
    setRagError("");

    try {
      const response = await fetch("/api/rag/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: naturalLanguageQuery,
          maxRent: maxRentInput
            ? Number(maxRentInput)
            : undefined,
          roomType: roomTypeInput || undefined,
          moveIn: moveIn || undefined,
          moveOut: moveOut || undefined,
          limit: 6,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "AI search failed.",
        );
      }

      setRagResult(result as RagSearchResponse);
    } catch (error) {
      setRagError(
        error instanceof Error
          ? error.message
          : "AI search failed.",
      );
    } finally {
      setIsRagSearching(false);
    }
  }

  function handleRagSearch(
    event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    void runRagSearch();
  }

  useEffect(() => {
    if (
      !initialNaturalLanguageQuery ||
      hasRunInitialSearch.current
    ) {
      return;
    }

    hasRunInitialSearch.current = true;
    void runRagSearch();
    // This should run only once for a query submitted from the homepage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNaturalLanguageQuery]);

  function handleReset() {
    setLocationInput("");
    setMaxRentInput("");
    setRoomTypeInput("");

    setLocation("");
    setMoveIn("");
    setMoveOut("");
    setMaxRent("");
    setRoomType("");
    setSortBy("recommended");
    setNaturalLanguageQuery("");
    setRagResult(null);
    setRagError("");
  }

  const filteredListings = useMemo(() => {
    const normalizedLocation = location
      .trim()
      .toLowerCase();

    const results = listings.filter((listing) => {
      const searchableLocation = `
        ${listing.title}
        ${listing.city}
        ${listing.state}
        ${listing.nearbyCampus ?? ""}
      `.toLowerCase();

      const matchesLocation =
        normalizedLocation === "" ||
        searchableLocation.includes(normalizedLocation);

      const matchesPrice =
        maxRent === "" ||
        listing.monthlyRent <= Number(maxRent);

      const matchesRoomType =
        roomType === "" ||
        listing.roomType === roomType;

      const matchesMoveIn =
        moveIn === "" ||
        listing.availableFrom <= moveIn;

      const matchesMoveOut =
        moveOut === "" ||
        listing.availableUntil >= moveOut;

      return (
        matchesLocation &&
        matchesPrice &&
        matchesRoomType &&
        matchesMoveIn &&
        matchesMoveOut
      );
    });

    if (sortBy === "price-low") {
      return [...results].sort(
        (first, second) =>
          first.monthlyRent - second.monthlyRent,
      );
    }

    if (sortBy === "price-high") {
      return [...results].sort(
        (first, second) =>
          second.monthlyRent - first.monthlyRent,
      );
    }

    return results;
  }, [
    listings,
    location,
    maxRent,
    moveIn,
    moveOut,
    roomType,
    sortBy,
]);

  return (
    <div>
      <form
        onSubmit={handleRagSearch}
        className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5"
      >
        <label>
          <span className="block text-sm font-semibold text-emerald-950">
            Describe what you&apos;re looking for
          </span>
          <span className="mt-1 block text-sm text-emerald-800">
            Include preferences such as quiet, furnished,
            near transit, or good for roommates. The filters
            below remain hard requirements.
          </span>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              required
              minLength={3}
              maxLength={500}
              value={naturalLanguageQuery}
              onChange={(event) =>
                setNaturalLanguageQuery(event.target.value)
              }
              placeholder="Quiet furnished room near transit for a summer internship"
              className="min-w-0 flex-1 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
            />
            <button
              type="submit"
              disabled={isRagSearching}
              className="rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
            >
              {isRagSearching
                ? "Finding matches..."
                : "Find matches"}
            </button>
          </div>
        </label>
      </form>

      <form
        onSubmit={handleSearch}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-5"
      >
        <label className="md:col-span-2">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Location
          </span>

          <input
            type="text"
            value={locationInput}
            onChange={(event) =>
              setLocationInput(event.target.value)
            }
            placeholder="City, company, or university"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
          />
        </label>

        <label>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Maximum rent
          </span>

          <input
            type="number"
            min="0"
            value={maxRentInput}
            onChange={(event) =>
              setMaxRentInput(event.target.value)
            }
            placeholder="1800"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
          />
        </label>

        <label>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Room type
          </span>

          <select
            value={roomTypeInput}
            onChange={(event) =>
              setRoomTypeInput(event.target.value)
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
          >
            <option value="">Any type</option>
            <option value="Private room">
              Private room
            </option>
            <option value="Shared room">
              Shared room
            </option>
            <option value="Studio">Studio</option>
            <option value="Entire apartment">
              Entire apartment
            </option>
          </select>
        </label>

        <button
          type="submit"
          className="self-end rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Search
        </button>
      </form>

      {ragError ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {ragError}
        </p>
      ) : null}

      {ragResult ? (
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Grounded recommendation
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {ragResult.answer}
          </p>
          {ragResult.warning ? (
            <p className="mt-3 text-xs text-amber-700">
              {ragResult.warning}
            </p>
          ) : null}
        </section>
      ) : null}

      <div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Available housing
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {(ragResult?.matches.length ??
              filteredListings.length)}{" "}
            {(ragResult?.matches.length ??
              filteredListings.length) === 1
              ? "listing"
              : "listings"}{" "}
            found
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="text-sm font-medium text-slate-500 hover:text-slate-950"
          >
            Clear filters
          </button>

          <label className="flex items-center gap-3 text-sm text-slate-500">
            Sort by

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value as SortOption,
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none"
            >
              <option value="recommended">
                Recommended
              </option>
              <option value="price-low">
                Lowest price
              </option>
              <option value="price-high">
                Highest price
              </option>
            </select>
          </label>
        </div>
      </div>

      {(ragResult?.matches.length ??
        filteredListings.length) > 0 ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ragResult
            ? ragResult.matches.map(({ listing, reason }) => (
                <div key={listing.id}>
                  <ListingCard listing={listing} />
                  <p className="rounded-b-2xl border border-t-0 border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
                    {reason}
                  </p>
                </div>
              ))
            : filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                />
              ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
          <h3 className="text-lg font-semibold text-slate-950">
            No listings found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Try increasing your maximum rent or
            changing your location.
          </p>

          <button
            type="button"
            onClick={handleReset}
            className="mt-5 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
