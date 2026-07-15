import { redirect } from "next/navigation";

import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import { saveProfile } from "./actions";

type ProfilePageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

type ProfileRow = {
  full_name: string | null;
  university: string | null;
  graduation_year: number | null;
  bio: string | null;
};

export default async function ProfilePage({
  searchParams,
}: ProfilePageProps) {
  const { message, error } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      `
        full_name,
        university,
        graduation_year,
        bio
      `,
    )
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="border-b border-slate-200 pb-6">
            <p className="text-sm font-semibold text-blue-600">
              Your account
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Your Profile
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              This information will appear on your housing
              listings and help renters learn more about you.
            </p>
          </div>

          {message && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {(error || profileError) && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error ?? profileError?.message}
            </div>
          )}

          <form
            action={saveProfile}
            className="mt-8 space-y-6"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </span>

              <input
                type="email"
                value={user.email ?? ""}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
              />

              <span className="mt-2 block text-xs text-slate-400">
                Your login email cannot be changed here.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Full name
              </span>

              <input
                name="fullName"
                type="text"
                required
                maxLength={100}
                defaultValue={profile?.full_name ?? ""}
                placeholder="Alex Chen"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  University
                </span>

                <input
                  name="university"
                  type="text"
                  maxLength={150}
                  defaultValue={
                    profile?.university ?? ""
                  }
                  placeholder="University at Albany"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Graduation year
                </span>

                <input
                  name="graduationYear"
                  type="number"
                  min={2000}
                  max={2100}
                  defaultValue={
                    profile?.graduation_year ?? ""
                  }
                  placeholder="2026"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Bio
              </span>

              <textarea
                name="bio"
                rows={5}
                maxLength={500}
                defaultValue={profile?.bio ?? ""}
                placeholder="Tell renters or hosts a little about yourself..."
                className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <span className="mt-2 block text-xs text-slate-400">
                Maximum 500 characters.
              </span>
            </label>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Save profile
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}