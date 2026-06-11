import { useEffect, useState } from 'react'
import { useAuth } from '../context/auth'
import * as store from '../lib/store'
import Logo from './Logo'
import Avatar from './Avatar'

export default function Dashboard({ onOpenGroup }) {
  const { user, logout } = useAuth()
  const [groups, setGroups] = useState([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

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
    setCreating(true)
    try {
      const group = await store.createGroup(name, user.id)
      setName('')
      await refresh()
      onOpenGroup(group.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Avatar name={user.username} size="sm" />
              <span className="text-sm text-slate-300 font-medium">{user.username}</span>
            </div>
            <button
              onClick={logout}
              className="text-sm text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-10">
        <section>
          <h1 className="text-2xl font-bold tracking-tight">Your groups</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Create a group and add your teammates, then log what you did each day.
          </p>

          <form onSubmit={handleCreate} className="mt-5 flex gap-2">
            <input
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition placeholder:text-slate-600"
              placeholder="New group name — e.g. Team Standup"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              disabled={creating || !name.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg px-5 py-2.5 font-medium transition-colors shrink-0"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
          </form>
          {error && <p className="text-sm text-rose-400 mt-2">{error}</p>}
        </section>

        <section>
          {loading ? (
            <ul className="flex flex-col gap-2.5">
              {[0, 1, 2].map((i) => (
                <li key={i} className="h-[4.5rem] rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
              ))}
            </ul>
          ) : groups.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-slate-800">
              <div className="mx-auto w-12 h-12 grid place-items-center rounded-full bg-slate-900 text-slate-500 mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <p className="text-slate-300 font-medium">No groups yet</p>
              <p className="text-slate-500 text-sm mt-1">Create your first group above to get started.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {groups.map((g) => (
                <li key={g.id}>
                  <button
                    onClick={() => onOpenGroup(g.id)}
                    className="group w-full text-left bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3.5 flex items-center gap-4 transition-colors"
                  >
                    <span className="grid place-items-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300 font-semibold shrink-0">
                      {g.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium truncate">{g.name}</span>
                      <span className="block text-sm text-slate-400">
                        {g.memberIds.length} {g.memberIds.length === 1 ? 'member' : 'members'}
                        {g.ownerId === user.id && (
                          <span className="ml-2 text-xs text-indigo-300/90 bg-indigo-500/10 border border-indigo-500/20 rounded px-1.5 py-0.5">
                            owner
                          </span>
                        )}
                      </span>
                    </span>
                    <svg className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
