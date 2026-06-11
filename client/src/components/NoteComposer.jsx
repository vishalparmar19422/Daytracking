import { useState } from 'react'
import { todayISO } from '../lib/date'
import Avatar from './Avatar'

export default function NoteComposer({ currentUser, onAdd }) {
  const [text, setText] = useState('')
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onAdd({ text, date })
      setText('')
      setDate(todayISO()) // reset to today after posting
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const isToday = date === todayISO()

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Avatar name={currentUser} size="md" className="mt-0.5" />
        <textarea
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition resize-y min-h-[4.5rem] placeholder:text-slate-600"
          placeholder="What did you get done today?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap pl-12">
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <input
            type="date"
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 [color-scheme:dark]"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
          />
          {isToday && <span className="text-xs text-slate-600">Today</span>}
        </label>
        <button
          disabled={busy || !text.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg px-5 py-2 font-medium transition-colors"
        >
          {busy ? 'Saving…' : 'Add note'}
        </button>
      </div>
      {error && <p className="text-sm text-rose-400 pl-12">{error}</p>}
    </form>
  )
}
