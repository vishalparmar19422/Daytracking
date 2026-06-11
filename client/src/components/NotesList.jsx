import { useState } from 'react'
import { formatDay, formatTime } from '../lib/date'

export default function NotesList({ notes, memberById, currentUserId, onUpdate, onDelete }) {
  if (notes.length === 0) {
    return <p className="text-slate-400">No notes match. Add one above, or clear the filters.</p>
  }

  // Group into [date, notes[]] preserving the newest-first order from the store.
  const days = []
  for (const note of notes) {
    const last = days[days.length - 1]
    if (last && last[0] === note.date) last[1].push(note)
    else days.push([note.date, [note]])
  }

  return (
    <div className="flex flex-col gap-6">
      {days.map(([date, dayNotes]) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-slate-400 mb-2 sticky top-0 bg-slate-900 py-1">
            {formatDay(date)}
          </h3>
          <ul className="flex flex-col gap-2">
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
    <li className="bg-slate-800 border border-slate-700 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-sm">
          <span className="font-medium text-indigo-300">{author}</span>
          <span className="text-slate-500"> · {formatTime(note.createdAt)}</span>
          {note.updatedAt !== note.createdAt && (
            <span className="text-slate-600 text-xs"> (edited)</span>
          )}
        </span>
        {canEdit && !editing && (
          <div className="flex gap-2 text-xs">
            <button onClick={() => setEditing(true)} className="text-slate-400 hover:text-slate-200">
              Edit
            </button>
            <button onClick={remove} className="text-rose-400 hover:text-rose-300">
              Delete
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 resize-y min-h-[4rem]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={save} className="bg-indigo-600 hover:bg-indigo-500 rounded-lg px-3 py-1 text-sm">
              Save
            </button>
            <button onClick={cancel} className="text-slate-400 hover:text-slate-200 text-sm px-3 py-1">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-slate-100">{note.text}</p>
      )}

      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </li>
  )
}
