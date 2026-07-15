"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const allowedRoomTypes = [
  "Private room",
  "Shared room",
  "Studio",
  "Entire apartment",
] as const;

export async function createListing(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const title = readString(formData, "title");
  const description = readString(
    formData,
    "description",
  );
  const city = readString(formData, "city");
  const state = readString(formData, "state");
  const nearbyCampus = readString(
    formData,
    "nearbyCampus",
  );
  const roomType = readString(
    formData,
    "roomType",
  );
  const monthlyRentValue = readString(
    formData,
    "monthlyRent",
  );
  const availableFrom = readString(
    formData,
    "availableFrom",
  );
  const availableUntil = readString(
    formData,
    "availableUntil",
  );

  const furnished =
    formData.get("furnished") === "on";

  const monthlyRent = Number(monthlyRentValue);

  if (title.length < 5 || title.length > 100) {
    redirect(
      "/listings/new?error=Title must be between 5 and 100 characters",
    );
  }

  if (
    description.length < 20 ||
    description.length > 2000
  ) {
    redirect(
      "/listings/new?error=Description must be between 20 and 2000 characters",
    );
  }

  if (!city || !state) {
    redirect(
      "/listings/new?error=City and state are required",
    );
  }

  if (state.length !== 2) {
    redirect(
      "/listings/new?error=State must be a 2-letter abbreviation",
    );
  }

  if (nearbyCampus.length > 150) {
    redirect(
      "/listings/new?error=Campus name must be 150 characters or fewer",
    );
  }

  if (
    !Number.isInteger(monthlyRent) ||
    monthlyRent <= 0
  ) {
    redirect(
      "/listings/new?error=Enter a valid monthly rent",
    );
  }

  if (
    !allowedRoomTypes.includes(
      roomType as (typeof allowedRoomTypes)[number],
    )
  ) {
    redirect(
      "/listings/new?error=Select a valid room type",
    );
  }

  if (!availableFrom || !availableUntil) {
    redirect(
      "/listings/new?error=Availability dates are required",
    );
  }

  if (
    new Date(availableUntil) <
    new Date(availableFrom)
  ) {
    redirect(
      "/listings/new?error=Move-out date must be after move-in date",
    );
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({
      owner_id: user.id,
      title,
      description,
      city,
      state: state.toUpperCase(),
      nearby_campus: nearbyCampus || null,
      monthly_rent: monthlyRent,
      room_type: roomType,
      furnished,
      available_from: availableFrom,
      available_until: availableUntil,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    redirect(
      `/listings/new?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/listings");
  revalidatePath("/");

  redirect(`/listings/${data.id}`);
}

function readString(
  formData: FormData,
  field: string,
): string {
  const value = formData.get(field);

  return typeof value === "string"
    ? value.trim()
    : "";
}