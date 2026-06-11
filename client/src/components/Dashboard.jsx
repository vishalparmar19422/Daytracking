import { useEffect, useState } from 'react'
import { useAuth } from '../context/auth'
import * as store from '../lib/store'

export default function Dashboard({ onOpenGroup }) {
  const { user, logout } = useAuth()
  const [groups, setGroups] = useState([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function refresh() {
    const g = await store.listGroups(user.id)
    setGroups(g)
    setLoading(false)
  }

  useEffect(() => {
    // Async fetch: setState runs after the await, so it isn't the synchronous cascade this rule guards against.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    try {
      const group = await store.createGroup(name, user.id)
      setName('')
      await refresh()
      onOpenGroup(group.id)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">DayTracking</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400">
              Signed in as <span className="text-slate-200 font-medium">{user.username}</span>
            </span>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">
        <section>
          <h2 className="text-lg font-semibold mb-3">New group</h2>
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
              placeholder="e.g. Team Standup"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="bg-indigo-600 hover:bg-indigo-500 rounded-lg px-4 py-2 font-medium">
              Create
            </button>
          </form>
          {error && <p className="text-sm text-rose-400 mt-2">{error}</p>}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Your groups</h2>
          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : groups.length === 0 ? (
            <p className="text-slate-400">No groups yet. Create one above to get started.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {groups.map((g) => (
                <li key={g.id}>
                  <button
                    onClick={() => onOpenGroup(g.id)}
                    className="w-full text-left bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-4 py-3 flex items-center justify-between transition-colors"
                  >
                    <span className="font-medium">{g.name}</span>
                    <span className="text-sm text-slate-400">
                      {g.memberIds.length} {g.memberIds.length === 1 ? 'member' : 'members'}
                      {g.ownerId === user.id && ' · owner'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
