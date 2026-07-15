import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  const isLoggedIn =
    typeof data?.claims?.sub === "string";

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xl font-bold text-slate-950"
        >
          InternHousing
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/listings"
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            Browse listings
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href="/listings/new"
                className="text-sm font-medium text-slate-600 hover:text-slate-950"
              >
                List your place
              </Link>

              <Link
                href="/profile"
                className="text-sm font-medium text-slate-600 hover:text-slate-950"
              >
                Profile
              </Link>

              <form
                action="/auth/signout"
                method="post"
              >
                <button
                  type="submit"
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}