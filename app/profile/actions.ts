"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();

  // Confirm which user is currently logged in.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const fullNameValue = formData.get("fullName");
  const universityValue = formData.get("university");
  const graduationYearValue =
    formData.get("graduationYear");
  const bioValue = formData.get("bio");

  const fullName =
    typeof fullNameValue === "string"
      ? fullNameValue.trim()
      : "";

  const university =
    typeof universityValue === "string"
      ? universityValue.trim()
      : "";

  const bio =
    typeof bioValue === "string"
      ? bioValue.trim()
      : "";

  if (!fullName) {
    redirect("/profile?error=Full name is required");
  }

  if (fullName.length > 100) {
    redirect(
      "/profile?error=Full name must be 100 characters or fewer",
    );
  }

  if (university.length > 150) {
    redirect(
      "/profile?error=University must be 150 characters or fewer",
    );
  }

  if (bio.length > 500) {
    redirect(
      "/profile?error=Bio must be 500 characters or fewer",
    );
  }

  let graduationYear: number | null = null;

  if (
    typeof graduationYearValue === "string" &&
    graduationYearValue.trim() !== ""
  ) {
    graduationYear = Number(graduationYearValue);

    if (
      !Number.isInteger(graduationYear) ||
      graduationYear < 2000 ||
      graduationYear > 2100
    ) {
      redirect(
        "/profile?error=Enter a valid graduation year",
      );
    }
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: fullName,
        university: university || null,
        graduation_year: graduationYear,
        bio: bio || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    );

  if (error) {
    redirect(
      `/profile?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/profile");
  revalidatePath("/account");

  redirect(
    "/profile?message=Profile saved successfully",
  );
}