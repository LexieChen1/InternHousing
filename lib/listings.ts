import { createClient } from "@/lib/supabase/server";
import { mockListings } from "@/lib/mock-listings";
import type { Listing } from "@/types/listing";

type ListingRow = {
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
  status: string;
};

function mapListingRow(row: ListingRow): Listing {
  return {
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
  };
}
export async function getListings(): Promise<Listing[]> {
  if (process.env.SUPABASE_OFFLINE === "true") {
    return mockListings;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      description,
      city,
      state,
      nearby_campus,
      monthly_rent,
      room_type,
      furnished,
      available_from,
      available_until,
      status
    `)
    .eq("status", "active")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Supabase is unavailable; using mock listings.",
      );
      return mockListings;
    }

    throw new Error(
      `Failed to load listings: ${error.message}`,
    );
  }

  return (data as ListingRow[]).map(mapListingRow);
}

export async function getListingById(
  id: string,
): Promise<Listing | null> {
  if (process.env.SUPABASE_OFFLINE === "true") {
    return (
      mockListings.find((listing) => listing.id === id) ??
      null
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      description,
      city,
      state,
      nearby_campus,
      monthly_rent,
      room_type,
      furnished,
      available_from,
      available_until,
      status
    `)
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Supabase is unavailable; using a mock listing.",
      );
      return (
        mockListings.find((listing) => listing.id === id) ??
        null
      );
    }

    throw new Error(
      `Failed to load listing: ${error.message}`,
    );
  }

  if (!data) {
    return null;
  }

  return mapListingRow(data as ListingRow);
}
