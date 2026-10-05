import type { Listing } from "@/types/listing";

const stateNames: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
};

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function stateCode(value: string): string | undefined {
  const normalized = normalize(value);
  return Object.entries(stateNames).find(
    ([code, name]) => code.toLowerCase() === normalized ||
      name.toLowerCase() === normalized,
  )?.[0];
}

export function matchesListingLocation(listing: Listing, query: string): boolean {
  const normalized = normalize(query);
  if (!normalized) return true;

  const requestedState = stateCode(normalized);
  if (requestedState && stateCode(listing.state) === requestedState) return true;

  // A state abbreviation should match the state field, not words like "campus".
  if (requestedState && normalized.length === 2) return false;

  return [listing.title, listing.city, listing.state, listing.nearbyCampus ?? ""]
    .some((value) => normalize(value).includes(normalized));
}
