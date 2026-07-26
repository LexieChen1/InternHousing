import "server-only";

import { getListings } from "@/lib/listings";
import {
  createEmbedding,
  createListingEmbeddings,
  generateGroundedAnswer,
  hasOpenAIKey,
  interpretHousingQuery,
} from "@/lib/rag/openai";
import type {
  QueryInterpretation,
  RagMatch,
  RagSearchInput,
  RagSearchResponse,
  ResolvedRagSearch,
} from "@/lib/rag/types";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/types/listing";

type MatchRow = {
  id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  nearby_campus: string | null;
  monthly_rent: number;
  room_type: string;
  furnished: boolean;
  available_from: string;
  available_until: string;
  similarity: number;
};

function mapMatchRow(row: MatchRow): RagMatch {
  return {
    listing: {
      id: row.id,
      title: row.title,
      description: row.description,
      city: row.city,
      state: row.state,
      nearbyCampus: row.nearby_campus,
      monthlyRent: row.monthly_rent,
      roomType: row.room_type,
      furnished: row.furnished,
      availableFrom: row.available_from,
      availableUntil: row.available_until,
      address: `${row.city}, ${row.state}`,
      commute: "Commute information not provided",
      ownerName: "Host",
      amenities: [],
    },
    semanticScore: Number(row.similarity),
    reason: "",
  };
}

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

function cosineSimilarity(
  first: number[],
  second: number[],
): number {
  let dot = 0;
  let firstMagnitude = 0;
  let secondMagnitude = 0;

  for (let index = 0; index < first.length; index += 1) {
    dot += first[index] * second[index];
    firstMagnitude += first[index] ** 2;
    secondMagnitude += second[index] ** 2;
  }

  return dot / Math.sqrt(firstMagnitude * secondMagnitude);
}

function fallbackReason(listing: Listing): string {
  const details = [
    `$${listing.monthlyRent}/month`,
    listing.roomType.toLowerCase(),
    listing.furnished ? "furnished" : null,
    `${listing.city}, ${listing.state}`,
  ].filter(Boolean);

  return `Matches with ${details.join(", ")}.`;
}

const campusAliases: Record<string, string> = {
  caltech: "California Institute of Technology",
  "cal tech": "California Institute of Technology",
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
      campusMatch?.[1].trim() ?? null,
    ),
    softPreferences,
  };
}

async function retrieveFromDatabase(
  input: ResolvedRagSearch,
): Promise<RagMatch[]> {
  const queryEmbedding = await createEmbedding(
    input.semanticQuery,
  );
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "match_active_listings",
    {
      query_embedding: queryEmbedding,
      match_count: 20,
      min_rent: input.minRent ?? null,
      max_rent: input.maxRent ?? null,
      requested_room_type: input.roomType ?? null,
      requested_furnished: input.furnished ?? null,
      requested_campus: input.campus ?? null,
      requested_move_in: input.moveIn ?? null,
      requested_move_out: input.moveOut ?? null,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as MatchRow[]).map(mapMatchRow);
}

async function retrieveInMemory(
  input: ResolvedRagSearch,
): Promise<{
  matches: RagMatch[];
  mode: "semantic" | "keyword";
}> {
  const eligible = (await getListings()).filter((listing) =>
    isEligible(listing, input),
  );

  if (!eligible.length) {
    return { matches: [], mode: "keyword" };
  }

  if (hasOpenAIKey()) {
    try {
      const [queryEmbedding, listingEmbeddings] =
        await Promise.all([
          createEmbedding(input.semanticQuery),
          createListingEmbeddings(eligible),
        ]);

      const matches = eligible
        .map((listing, index) => ({
          listing,
          semanticScore: cosineSimilarity(
            queryEmbedding,
            listingEmbeddings[index],
          ),
          reason: "",
        }))
        .sort(
          (first, second) =>
            (second.semanticScore ?? 0) -
            (first.semanticScore ?? 0),
        )
        .slice(0, 20);

      return { matches, mode: "semantic" };
    } catch {
      // A configured key may still be invalid, out of credit, or
      // temporarily rate-limited. Keyword retrieval must remain usable.
    }
  }

  return {
    matches: eligible
      .map((listing) => ({
        listing,
        semanticScore: tokenScore(
          input.semanticQuery,
          listing,
        ),
        reason: "",
      }))
      .sort(
        (first, second) =>
          (second.semanticScore ?? 0) -
          (first.semanticScore ?? 0),
      )
      .slice(0, 20),
    mode: "keyword",
  };
}

export async function searchHousing(
  input: RagSearchInput,
): Promise<RagSearchResponse> {
  let warning: string | undefined;
  let mode: "semantic" | "keyword" = "semantic";
  let matches: RagMatch[] = [];
  let interpretedQuery = interpretWithoutModel(input.query);

  if (hasOpenAIKey()) {
    try {
      interpretedQuery = await interpretHousingQuery(
        input.query,
      );
      interpretedQuery.campus = normalizeCampusName(
        interpretedQuery.campus,
      );
    } catch {
      warning =
        "Natural-language constraints could not be extracted; explicit filters were still applied.";
    }
  }

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
    campus: interpretedQuery.campus ?? undefined,
    semanticQuery:
      interpretedQuery.softPreferences.length > 0
        ? interpretedQuery.softPreferences.join(", ")
        : input.query,
  };

  try {
    matches =
      process.env.SUPABASE_OFFLINE === "true"
        ? (await retrieveInMemory(resolved)).matches
        : await retrieveFromDatabase(resolved);
  } catch {
    const fallback = await retrieveInMemory(resolved);
    matches = fallback.matches;
    mode = fallback.mode;
    warning =
      "Semantic database search was unavailable, so a safe fallback was used.";
  }

  if (!matches.length) {
    return {
      answer:
        "No active listings matched all of your required filters.",
      matches: [],
      mode,
      interpretedQuery,
      warning,
    };
  }

  matches = matches.map((match) => ({
    ...match,
    reason: fallbackReason(match.listing),
  }));
  matches = matches.slice(0, input.limit);

  let answer = `${matches.length} listing${
    matches.length === 1 ? "" : "s"
  } matched. The strongest match is ${matches[0].listing.title}.`;

  if (hasOpenAIKey()) {
    try {
      const generated = await generateGroundedAnswer(
        input,
        matches,
      );
      answer = generated.answer;
      matches = matches.map((match) => ({
        ...match,
        reason:
          generated.reasons.get(match.listing.id) ??
          match.reason,
      }));
    } catch {
      warning =
        "The grounded answer model was unavailable; ranked listings are still valid.";
    }
  } else {
    mode = "keyword";
    warning =
      "OPENAI_API_KEY is not configured, so keyword ranking is shown.";
  }

  return {
    answer,
    matches,
    mode,
    interpretedQuery,
    warning,
  };
}
