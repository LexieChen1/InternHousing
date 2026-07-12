export function SearchBar() {
  return (
    <form className="grid gap-4 rounded-2xl bg-white p-4 shadow-xl shadow-slate-950/10 md:grid-cols-5">
      <label className="md:col-span-2">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Location
        </span>

        <input
          type="text"
          placeholder="Company, university, or city"
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
        />
      </label>

      <label>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Move in
        </span>

        <input
          type="date"
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
        />
      </label>

      <label>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Move out
        </span>

        <input
          type="date"
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
        />
      </label>

      <button
        type="submit"
        className="self-end rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
}