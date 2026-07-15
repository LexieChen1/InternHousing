"use client";

import {
  useMemo,
  useState,
  type SubmitEvent,
} from "react";

import { ListingCard } from "@/components/listing-card";
import type { Listing } from "@/types/listing";

type ListingFiltersProps = {
  listings: Listing[];
  initialLocation?: string;
  initialMoveIn?: string;
  initialMoveOut?: string;
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

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setLocation(locationInput);
    setMaxRent(maxRentInput);
    setRoomType(roomTypeInput);
  }

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
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
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
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
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
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
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
          className="self-end rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      <div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Available housing
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredListings.length}{" "}
            {filteredListings.length === 1
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

      {filteredListings.length > 0 ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
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
