import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-blue-600">404</p>

        <h1 className="mt-3 text-4xl font-bold text-slate-950">
          Listing not found
        </h1>

        <p className="mt-4 text-slate-500">
          This listing may have been removed or is no longer available.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}