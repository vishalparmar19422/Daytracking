export default function Filters({ members, filters, onChange }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value })
  }

  const active = filters.date || filters.authorId || filters.query

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-400">Date</span>
        <input
          type="date"
          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500 [color-scheme:dark]"
          value={filters.date}
          onChange={(e) => set('date', e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-400">Person</span>
        <select
          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500"
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
        <span className="text-slate-400">Search</span>
        <input
          type="text"
          placeholder="Find in notes…"
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500"
          value={filters.query}
          onChange={(e) => set('query', e.target.value)}
        />
      </label>

      {active && (
        <button
          onClick={() => onChange({ date: '', authorId: '', query: '' })}
          className="text-sm text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5"
        >
          Clear
        </button>
      )}
    </div>
  )
}
