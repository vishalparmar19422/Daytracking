import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/auth'
import * as store from '../lib/store'
import MembersPanel from './MembersPanel'
import NoteComposer from './NoteComposer'
import Filters from './Filters'
import NotesList from './NotesList'

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
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        Loading…
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center gap-4">
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
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1 text-sm shrink-0"
            >
              ← Groups
            </button>
            <h1 className="text-xl font-bold truncate">{group.name}</h1>
          </div>
          <span className="text-sm text-slate-400 shrink-0">{user.username}</span>
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
