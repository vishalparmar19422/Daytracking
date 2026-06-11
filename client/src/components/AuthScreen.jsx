import { useState } from 'react'
import { useAuth } from '../context/auth'
import Logo from './Logo'

export default function AuthScreen() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const isLogin = mode === 'login'

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

  function switchMode(next) {
    setMode(next)
    setError('')
  }

  const tab = (value, label) => (
    <button
      type="button"
      onClick={() => switchMode(value)}
      className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
        mode === value ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4 overflow-hidden">
      {/* decorative glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[36rem] rounded-full bg-indigo-600/20 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo showText={false} className="mb-3 scale-125" />
          <h1 className="text-2xl font-bold tracking-tight">DayTracking</h1>
          <p className="text-slate-400 mt-1 text-sm">Log your end-of-day, together.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/30">
          <div className="flex gap-1 p-1 mb-5 bg-slate-950/60 rounded-xl border border-slate-800">
            {tab('login', 'Log in')}
            {tab('register', 'Sign up')}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-slate-300">Username</span>
              <input
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
                placeholder="yourname"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-slate-300">Password</span>
              <input
                type="password"
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder="••••••••"
              />
            </label>

            {error && (
              <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2.5 font-medium transition-colors"
            >
              {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          {isLogin ? 'New here? ' : 'Already have an account? '}
          <button
            onClick={() => switchMode(isLogin ? 'register' : 'login')}
            className="text-slate-400 hover:text-slate-200 underline underline-offset-2"
          >
            {isLogin ? 'Create an account' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}
