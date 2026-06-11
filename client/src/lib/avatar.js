// Deterministic avatar helpers: a person always gets the same initials + color.

const COLORS = [
  'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-indigo-500',
  'bg-violet-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-lime-500',
]

export function initials(name) {
  const s = String(name || '').trim()
  if (!s) return '?'
  const parts = s.split(/[\s_-]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return s.slice(0, 2).toUpperCase()
}

export function colorFor(name) {
  const s = String(name || '')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}
