import { useState } from 'react'

export default function MembersPanel({ members, isOwner, onAdd }) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onAdd(username)
      setUsername('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <h2 className="font-semibold mb-3">
        Members <span className="text-slate-400 font-normal">({members.length})</span>
      </h2>

      <ul className="flex flex-col gap-1 mb-4">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between text-sm">
            <span>{m.username}</span>
            {m.isOwner && (
              <span className="text-xs text-indigo-400 border border-indigo-500/40 rounded px-1.5 py-0.5">
                owner
              </span>
            )}
          </li>
        ))}
      </ul>

      {isOwner ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-2">
          <input
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
            placeholder="Add by username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            disabled={busy}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg px-3 py-2 text-sm font-medium"
          >
            {busy ? 'Adding…' : 'Add member'}
          </button>
          {error && <p className="text-xs text-rose-400">{error}</p>}
        </form>
      ) : (
        <p className="text-xs text-slate-500">Only the owner can add members.</p>
      )}
    </div>
  )
}
