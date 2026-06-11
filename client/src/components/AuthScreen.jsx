import { useState } from 'react'
import { useAuth } from '../context/auth'
import { seedDemoData, DEMO_PASSWORD } from '../lib/seed'

export default function AuthScreen() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const isLogin = mode === 'login'

  async function handleSeed() {
    if (!confirm('Load demo data? This replaces any existing data and logs you in as "alice".')) return
    setError('')
    setBusy(true)
    try {
      await seedDemoData()
      await login('alice', DEMO_PASSWORD) // drops straight into the app
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isLogin) await login(username, password)
      else await register(username, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function switchMode() {
    setMode(isLogin ? 'register' : 'login')
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">DayTracking</h1>
          <p className="text-slate-400 mt-1">Log your end-of-day, together.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col gap-4"
        >
          <h2 className="text-lg font-semibold">{isLogin ? 'Log in' : 'Create an account'}</h2>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-300">Username</span>
            <input
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-300">Password</span>
            <input
              type="password"
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg px-4 py-2 font-medium transition-colors"
          >
            {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Sign up'}
          </button>

          <button
            type="button"
            onClick={switchMode}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            {isLogin ? "Need an account? Sign up" : 'Have an account? Log in'}
          </button>
        </form>

        <div className="mt-6 bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-sm">
          <button
            type="button"
            onClick={handleSeed}
            disabled={busy}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg px-4 py-2 font-medium"
          >
            {busy ? 'Loading…' : 'Load demo data'}
          </button>
          <p className="text-slate-400 mt-3 leading-relaxed">
            Seeds 3 groups — <span className="text-slate-200">Engineering Team</span> (10 people),
            {' '}<span className="text-slate-200">Design Squad</span>, and{' '}
            <span className="text-slate-200">Marketing</span> — each with its own notes over the last
            few days. Logs you in as <span className="text-slate-200 font-medium">alice</span>.
          </p>
          <p className="text-slate-500 mt-2">
            All demo users share the password{' '}
            <code className="text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded">{DEMO_PASSWORD}</code>{' '}
            — e.g. log in as <code className="text-slate-300">bob</code>,{' '}
            <code className="text-slate-300">grace</code>, or{' '}
            <code className="text-slate-300">olivia</code> to see their view.
          </p>
        </div>
      </div>
    </div>
  )
}
