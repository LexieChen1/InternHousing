import { z } from "zod";

import type { Listing } from "@/types/listing";

export const roomTypes = [
  "Private room",
  "Shared room",
  "Studio",
  "Entire apartment",
] as const;

export const ragSearchSchema = z
  .object({
    query: z.string().trim().min(3).max(500),
    minRent: z.number().int().positive().optional(),
    maxRent: z.number().int().positive().optional(),
    roomType: z.enum(roomTypes).optional(),
    moveIn: z.iso.date().optional(),
    moveOut: z.iso.date().optional(),
    limit: z.number().int().min(1).max(10).default(5),
  })
  .refine(
    ({ minRent, maxRent }) =>
      !minRent || !maxRent || minRent <= maxRent,
    {
      message:
        "Minimum rent must be less than or equal to maximum rent.",
      path: ["maxRent"],
    },
  )
  .refine(
    ({ moveIn, moveOut }) =>
      !moveIn || !moveOut || moveIn <= moveOut,
    {
      message: "Move-out date must be on or after move-in date.",
      path: ["moveOut"],
    },
  );

export type RagSearchInput = z.infer<
  typeof ragSearchSchema
>;

export type QueryInterpretation = {
  minRent: number | null;
  maxRent: number | null;
  roomType: (typeof roomTypes)[number] | null;
  furnished: boolean | null;
  moveIn: string | null;
  moveOut: string | null;
  campus: string | null;
  softPreferences: string[];
};

export type ResolvedRagSearch = RagSearchInput & {
  furnished?: boolean;
  campus?: string;
  semanticQuery: string;
};

export type RagMatch = {
  listing: Listing;
  semanticScore: number | null;
  reason: string;
};

export type RagSearchResponse = {
  answer: string;
  matches: RagMatch[];
  mode: "semantic" | "keyword";
  interpretedQuery: QueryInterpretation;
  warning?: string;
};
