import "server-only";

import { getListings } from "@/lib/listings";
import { matchesListingLocation, stateCode } from "@/lib/location";
import type {
  QueryInterpretation,
  RagMatch,
  RagSearchInput,
  RagSearchResponse,
  ResolvedRagSearch,
} from "@/lib/rag/types";
import type { Listing } from "@/types/listing";

function isEligible(
  listing: Listing,
  input: ResolvedRagSearch,
): boolean {
  const normalizeDate = (
    value: string,
    reference?: string,
  ) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    if (!reference) return value;

    const parsed = new Date(`${value}, ${reference.slice(0, 4)}`);

    if (Number.isNaN(parsed.getTime())) return value;

    return [
      parsed.getFullYear(),
      String(parsed.getMonth() + 1).padStart(2, "0"),
      String(parsed.getDate()).padStart(2, "0"),
    ].join("-");
  };

  return (
    (!input.location || matchesListingLocation(listing, input.location)) &&
    (!input.minRent ||
      listing.monthlyRent >= input.minRent) &&
    (!input.maxRent ||
      listing.monthlyRent <= input.maxRent) &&
    (!input.roomType ||
      listing.roomType === input.roomType) &&
    (input.furnished === undefined ||
      listing.furnished === input.furnished) &&
    (!input.campus ||
      Boolean(
        listing.nearbyCampus
          ?.toLowerCase()
          .includes(input.campus.toLowerCase()),
      )) &&
    (!input.moveIn ||
      normalizeDate(listing.availableFrom, input.moveIn) <=
        input.moveIn) &&
    (!input.moveOut ||
      normalizeDate(listing.availableUntil, input.moveOut) >=
        input.moveOut)
  );
}

function tokenScore(query: string, listing: Listing): number {
  const queryTokens = new Set(
    query.toLowerCase().match(/[a-z0-9]+/g) ?? [],
  );
  const listingTokens = new Set(
    [
      listing.title,
      listing.description,
      listing.city,
      listing.state,
      listing.nearbyCampus ?? "",
      listing.roomType,
      listing.furnished ? "furnished" : "unfurnished",
      listing.amenities.join(" "),
      listing.commute,
    ]
      .join(" ")
      .toLowerCase()
      .match(/[a-z0-9]+/g) ?? [],
  );

  if (!queryTokens.size) return 0;

  const overlap = [...queryTokens].filter((token) =>
    listingTokens.has(token),
  ).length;

  return overlap / queryTokens.size;
}

const preferencePatterns: Record<string, RegExp> = {
  quiet: /\b(quiet|peaceful|tranquil)\b/i,
  "good for studying": /\b(study|studying|study-friendly|quiet|peaceful)\b/i,
  "close to transit": /\b(transit|subway|metro|bus|train)\b/i,
  "near transit": /\b(transit|subway|metro|bus|train)\b/i,
  "good for an intern": /\b(intern|interns|internship|internships)\b/i,
};

function supportedPreferences(listing: Listing, preferences: string[]): string[] {
  const text = [listing.title, listing.description, listing.amenities.join(" ")].join(" ");
  return preferences.filter((preference) => preferencePatterns[preference]?.test(text));
}

function fallbackReason(listing: Listing, preferences: string[]): string {
  const details = [
    `$${listing.monthlyRent}/month`,
    listing.roomType.toLowerCase(),
    listing.furnished ? "furnished" : null,
    `${listing.city}, ${listing.state}`,
  ].filter(Boolean);

  const supported = supportedPreferences(listing, preferences);
  const unsupported = preferences.filter((preference) => !supported.includes(preference));
  return [
    `Meets your required filters: ${details.join(", ")}.`,
    supported.length ? `Description mentions support for: ${supported.join(", ")}.` : "",
    unsupported.length ? `Not confirmed in the description: ${unsupported.join(", ")}.` : "",
  ].filter(Boolean).join(" ");
}

const campusAliases: Record<string, string> = {
  caltech: "California Institute of Technology",
  "cal tech": "California Institute of Technology",
  uva: "University of Virginia",
  "uva university": "University of Virginia",
};

function normalizeCampusName(
  campus: string | null,
): string | null {
  if (!campus) return null;

  const normalized = campus
    .trim()
    .toLowerCase()
    .replace(/\s+university$/, "");

  return campusAliases[normalized] ?? campus.trim();
}

function interpretWithoutModel(
  query: string,
): QueryInterpretation {
  const normalized = query.toLowerCase();
  const rentMatch = normalized.match(
    /(?:under|below|less than|no more than|max(?:imum)?|up to)\s*\$?\s*([\d,]+)/,
  );
  const minimumRentMatch = normalized.match(
    /(?:above|over|at least|more than|min(?:imum)?)\s*\$?\s*([\d,]+)/,
  );
  const campusMatch = normalized.match(
    /\bnear\s+([a-z][a-z .'-]*?)(?=\s+(?:under|below|less than|no more than|above|over|at least|more than|from|between|for|with|preferably)\b|$)/,
  );
  let roomType = [
    "Private room",
    "Shared room",
    "Studio",
    "Entire apartment",
  ].find((type) => normalized.includes(type.toLowerCase()));

  if (!roomType && normalized.includes("single room")) {
    roomType = "Private room";
  }
  if (!roomType && /\bshared\b/.test(normalized)) roomType = "Shared room";
  if (!roomType && /\bprivate\b/.test(normalized)) roomType = "Private room";
  const softPreferences = [
    "quiet",
    "good for studying",
    "close to transit",
    "near transit",
    "good for an intern",
  ].filter((preference) =>
    normalized.includes(preference),
  );

  return {
    minRent: minimumRentMatch
      ? Number(
          minimumRentMatch[1].replaceAll(",", ""),
        )
      : null,
    maxRent: rentMatch
      ? Number(rentMatch[1].replaceAll(",", ""))
      : null,
    roomType:
      (roomType as QueryInterpretation["roomType"]) ?? null,
    furnished: normalized.includes("furnished")
      ? !normalized.includes("unfurnished")
      : null,
    moveIn: null,
    moveOut: null,
    campus: normalizeCampusName(
      campusMatch && !/^(?:transit|a?\s*bus|subway|metro|train)\b/.test(campusMatch[1].trim())
        ? campusMatch[1].trim()
        : null,
    ),
    softPreferences,
  };
}

async function retrieveListings(
  input: ResolvedRagSearch,
): Promise<RagMatch[]> {
  const eligible = (await getListings()).filter((listing) =>
    isEligible(listing, input),
  );

  return eligible
    .map((listing) => ({
      listing,
      keywordScore: input.preferences.length
        ? supportedPreferences(listing, input.preferences).length / input.preferences.length
        : tokenScore(input.rankingQuery, listing),
      reason: fallbackReason(listing, input.preferences),
    }))
    .sort((first, second) => second.keywordScore - first.keywordScore);
}

export async function searchHousing(
  input: RagSearchInput,
): Promise<RagSearchResponse> {
  const interpretedQuery = interpretWithoutModel(input.query);

  const stateMatch = input.query.match(/\b(?:in|near)\s+([a-z ]+?)(?=\s+(?:under|below|with|for|from|preferably|above|over|at least|up to)\b|[,.;]|$)/i);
  const inferredState = stateCode(stateMatch?.[1] ?? input.query);

  const resolved: ResolvedRagSearch = {
    ...input,
    minRent:
      input.minRent ??
      interpretedQuery.minRent ??
      undefined,
    maxRent: input.maxRent ?? interpretedQuery.maxRent ?? undefined,
    roomType:
      input.roomType ??
      interpretedQuery.roomType ??
      undefined,
    moveIn:
      input.moveIn ?? interpretedQuery.moveIn ?? undefined,
    moveOut:
      input.moveOut ??
      interpretedQuery.moveOut ??
      undefined,
    furnished:
      interpretedQuery.furnished ?? undefined,
    location: input.location || inferredState,
    campus: stateCode(interpretedQuery.campus ?? "")
      ? undefined
      : interpretedQuery.campus ?? undefined,
    preferences: interpretedQuery.softPreferences,
    rankingQuery:
      interpretedQuery.softPreferences.length > 0
        ? interpretedQuery.softPreferences.join(", ")
        : input.query,
  };

  const matches = await retrieveListings(resolved);
  const answer = matches.length
    ? `${matches.length} listing${matches.length === 1 ? "" : "s"} meet your required filters. Preferences affect ranking; see each listing for description support.`
    : "No active listings matched all of your required filters.";

  return {
    answer,
    matches,
    mode: "keyword",
    interpretedQuery,
  };
}
