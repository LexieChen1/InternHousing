import Link from "next/link";

import { Navbar } from "@/components/navbar";
import { login, signup } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const { error, message } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto flex max-w-7xl justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-blue-600">
            Welcome to InternHousing
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Sign in or create an account
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Save listings, contact hosts, and publish your
            own short-term housing.
          </p>

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          <form className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </span>

              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </span>

              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="current-password"
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </label>

            <button
              formAction={login}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Sign in
            </button>

            <button
              formAction={signup}
              className="w-full rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Create account
            </button>
          </form>

          <Link
            href="/"
            className="mt-6 block text-center text-sm text-slate-500 hover:text-slate-950"
          >
            Return to homepage
          </Link>
        </div>
      </section>
    </main>
  );
}