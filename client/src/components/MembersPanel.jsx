import { useState } from 'react'
import Avatar from './Avatar'

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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:sticky md:top-20">
      <h2 className="font-semibold mb-3 flex items-center gap-2">
        Members
        <span className="text-xs text-slate-400 bg-slate-800 rounded-full px-2 py-0.5">{members.length}</span>
      </h2>

      <ul className="flex flex-col gap-1 mb-4">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-slate-800/60 transition-colors">
            <Avatar name={m.username} size="sm" />
            <span className="text-sm truncate flex-1">{m.username}</span>
            {m.isOwner && (
              <span className="text-[10px] uppercase tracking-wide text-indigo-300/90 bg-indigo-500/10 border border-indigo-500/20 rounded px-1.5 py-0.5">
                owner
              </span>
            )}
          </li>
        ))}
      </ul>

      {isOwner ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-2 pt-3 border-t border-slate-800">
          <input
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition placeholder:text-slate-600"
            placeholder="Add member by username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            disabled={busy || !username.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            {busy ? 'Adding…' : 'Add member'}
          </button>
          {error && <p className="text-xs text-rose-400">{error}</p>}
        </form>
      ) : (
        <p className="text-xs text-slate-500 pt-3 border-t border-slate-800">
          Only the group owner can add members.
        </p>
      )}
    </div>
  )
}
