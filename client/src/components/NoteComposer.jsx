import { useState } from 'react'
import { todayISO } from '../lib/date'

export default function NoteComposer({ onAdd }) {
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

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
      <h2 className="font-semibold">What did you do today?</h2>
      <textarea
        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 resize-y min-h-[5rem]"
        placeholder="Wrapped up the API integration, reviewed Bob's PR…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          Date
          <input
            type="date"
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 [color-scheme:dark]"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <button
          disabled={busy}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg px-4 py-2 font-medium"
        >
          {busy ? 'Saving…' : 'Add note'}
        </button>
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
    </form>
  )
}
