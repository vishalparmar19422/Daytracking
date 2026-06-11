export default function Filters({ members, filters, onChange }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value })
  }

  const active = filters.date || filters.authorId || filters.query

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs uppercase tracking-wide text-slate-500">Date</span>
        <input
          type="date"
          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition [color-scheme:dark]"
          value={filters.date}
          onChange={(e) => set('date', e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs uppercase tracking-wide text-slate-500">Person</span>
        <select
          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
          value={filters.authorId}
          onChange={(e) => set('authorId', e.target.value)}
        >
          <option value="">Everyone</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.username}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm flex-1 min-w-[8rem]">
        <span className="text-xs uppercase tracking-wide text-slate-500">Search</span>
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Find in notes…"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition placeholder:text-slate-600"
            value={filters.query}
            onChange={(e) => set('query', e.target.value)}
          />
        </div>
      </label>

      {active && (
        <button
          onClick={() => onChange({ date: '', authorId: '', query: '' })}
          className="text-sm text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}
