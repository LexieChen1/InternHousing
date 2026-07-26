export function SearchBar() {
  return (
    <form
      action="/listings"
      method="get"
      className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-lg shadow-stone-900/5 md:grid-cols-5"
    >
      <label className="md:col-span-5">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Describe what you&apos;re looking for
        </span>

        <input
          type="text"
          name="query"
          minLength={3}
          maxLength={500}
          placeholder="Quiet furnished room near Columbia under $1,800"
          className="w-full rounded-lg border border-stone-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
        />
      </label>

      <label className="md:col-span-2">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Location
        </span>

        <input
          type="text"
          name="location"
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
          name="moveIn"
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
        />
      </label>

      <label>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Move out
        </span>

        <input
          type="date"
          name="moveOut"
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
        />
      </label>

      <button
        type="submit"
        className="self-end rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
      >
        Search
      </button>
    </form>
  );
}
