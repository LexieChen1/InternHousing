import { redirect } from "next/navigation";

import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  const userId = data?.claims?.sub;
  const email = data?.claims?.email;

  if (!userId) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <p className="text-sm font-semibold text-blue-600">
            Your account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            You are signed in
          </h1>

          <p className="mt-4 text-slate-600">
            {typeof email === "string"
              ? email
              : "Authenticated user"}
          </p>

          <form
            action="/auth/signout"
            method="post"
            className="mt-8"
          >
            <button
              type="submit"
              className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}