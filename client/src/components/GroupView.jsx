import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/auth'
import * as store from '../lib/store'
import MembersPanel from './MembersPanel'
import NoteComposer from './NoteComposer'
import Filters from './Filters'
import NotesList from './NotesList'
import Avatar from './Avatar'

const EMPTY_FILTERS = { date: '', authorId: '', query: '' }

export default function GroupView({ groupId, onBack }) {
  const { user } = useAuth()
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [notes, setNotes] = useState([])
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)

  const isOwner = group?.ownerId === user.id

  const loadGroupAndMembers = useCallback(async () => {
    const [g, m] = await Promise.all([store.getGroup(groupId), store.listMembers(groupId)])
    setGroup(g)
    setMembers(m)
  }, [groupId])

  const loadNotes = useCallback(async () => {
    const n = await store.listNotes(groupId, filters)
    setNotes(n)
  }, [groupId, filters])

  useEffect(() => {
    // Async fetch on mount; setState fires after the awaits, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    Promise.all([loadGroupAndMembers(), loadNotes()]).then(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-query whenever the filters change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotes()
  }, [loadNotes])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center gap-3">
        <span className="w-4 h-4 rounded-full border-2 border-slate-700 border-t-indigo-400 animate-spin" />
        Loading…
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4">
        <p>Group not found.</p>
        <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300">
          ← Back to groups
        </button>
      </div>
    )
  }

  // Map authorId -> username for rendering notes.
  const memberById = Object.fromEntries(members.map((m) => [m.id, m.username]))

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="grid place-items-center w-9 h-9 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-lg shrink-0 transition-colors"
              title="Back to groups"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate leading-tight">{group.name}</h1>
              <p className="text-xs text-slate-500">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Avatar name={user.username} size="sm" />
            <span className="hidden sm:inline text-sm text-slate-300 font-medium">{user.username}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-[18rem_1fr]">
        <aside className="flex flex-col gap-6">
          <MembersPanel
            members={members}
            isOwner={isOwner}
            onAdd={async (username) => {
              await store.addMember(groupId, username, user.id)
              await loadGroupAndMembers()
            }}
          />
        </aside>

        <section className="flex flex-col gap-6 min-w-0">
          <NoteComposer
            currentUser={user.username}
            onAdd={async ({ text, date }) => {
              await store.addNote(groupId, user.id, { text, date })
              await loadNotes()
            }}
          />

          <Filters members={members} filters={filters} onChange={setFilters} />

          <NotesList
            notes={notes}
            memberById={memberById}
            currentUserId={user.id}
            onUpdate={async (noteId, patch) => {
              await store.updateNote(noteId, user.id, patch)
              await loadNotes()
            }}
            onDelete={async (noteId) => {
              await store.deleteNote(noteId, user.id)
              await loadNotes()
            }}
          />
        </section>
      </main>
    </div>
  )
}
