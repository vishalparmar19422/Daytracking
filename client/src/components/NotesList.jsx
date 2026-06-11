import { useState } from 'react'
import { formatDay, formatTime } from '../lib/date'
import Avatar from './Avatar'

export default function NotesList({ notes, memberById, currentUserId, onUpdate, onDelete }) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-14 rounded-2xl border border-dashed border-slate-800">
        <div className="mx-auto w-11 h-11 grid place-items-center rounded-full bg-slate-900 text-slate-500 mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
        </div>
        <p className="text-slate-300 font-medium">No notes here yet</p>
        <p className="text-slate-500 text-sm mt-1">Add one above, or clear the filters.</p>
      </div>
    )
  }

  // Group into [date, notes[]] preserving the newest-first order from the store.
  const days = []
  for (const note of notes) {
    const last = days[days.length - 1]
    if (last && last[0] === note.date) last[1].push(note)
    else days.push([note.date, [note]])
  }

  return (
    <div className="flex flex-col gap-7">
      {days.map(([date, dayNotes]) => (
        <div key={date}>
          <div className="sticky top-16 z-[5] flex items-center gap-3 bg-slate-950/90 backdrop-blur py-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-300">{formatDay(date)}</h3>
            <span className="text-xs text-slate-600">{dayNotes.length}</span>
            <span className="flex-1 h-px bg-slate-800" />
          </div>
          <ul className="flex flex-col gap-2.5">
            {dayNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                author={memberById[note.authorId] || 'Unknown'}
                canEdit={note.authorId === currentUserId}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function NoteItem({ note, author, canEdit, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(note.text)
  const [error, setError] = useState('')

  async function save() {
    setError('')
    try {
      await onUpdate(note.id, { text })
      setEditing(false)
    } catch (err) {
      setError(err.message)
    }
  }

  function cancel() {
    setText(note.text)
    setError('')
    setEditing(false)
  }

  async function remove() {
    if (!confirm('Delete this note?')) return
    try {
      await onDelete(note.id)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <li className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar name={author} size="md" className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm min-w-0">
              <span className="font-semibold text-slate-100">{author}</span>
              <span className="text-slate-500"> · {formatTime(note.createdAt)}</span>
              {note.updatedAt !== note.createdAt && (
                <span className="text-slate-600 text-xs"> (edited)</span>
              )}
            </span>
            {canEdit && !editing && (
              <div className="flex gap-1 text-xs opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditing(true)}
                  className="text-slate-400 hover:text-white hover:bg-slate-800 rounded px-2 py-0.5 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={remove}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded px-2 py-0.5 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="flex flex-col gap-2 mt-2">
              <textarea
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition resize-y min-h-[4rem]"
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={save} className="bg-indigo-600 hover:bg-indigo-500 rounded-lg px-3 py-1 text-sm font-medium transition-colors">
                  Save
                </button>
                <button onClick={cancel} className="text-slate-400 hover:text-slate-200 text-sm px-3 py-1">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-slate-200 mt-0.5 leading-relaxed">{note.text}</p>
          )}

          {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
        </div>
      </div>
    </li>
  )
}
