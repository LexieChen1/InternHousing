import type { Listing } from "@/types/listing";

/**
 * Embeddings work best when every record uses the same stable template.
 * Keep private owner data and instructions out of this document.
 */
export function buildListingDocument(
  listing: Listing,
): string {
  return [
    `Title: ${listing.title}`,
    `Location: ${listing.city}, ${listing.state}`,
    listing.nearbyCampus
      ? `Nearby campus: ${listing.nearbyCampus}`
      : null,
    `Monthly rent: $${listing.monthlyRent}`,
    `Room type: ${listing.roomType}`,
    `Furnished: ${listing.furnished ? "yes" : "no"}`,
    `Available: ${listing.availableFrom} through ${listing.availableUntil}`,
    listing.commute ? `Transit: ${listing.commute}` : null,
    listing.amenities.length
      ? `Amenities: ${listing.amenities.join(", ")}`
      : null,
    `Description: ${listing.description}`,
  ]
    .filter(Boolean)
    .join("\n");
}
