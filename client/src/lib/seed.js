// Demo data trigger. The actual seeding happens server-side (POST /api/dev/seed),
// which wipes the database and rebuilds the demo groups/users/notes. This just
// calls that endpoint; AuthScreen then logs in as alice.

export const DEMO_PASSWORD = 'demo'

export async function seedDemoData() {
  const res = await fetch('/api/dev/seed', { method: 'POST' })
  let data = null
  try {
    data = await res.json()
  } catch {
    // ignore
  }
  if (!res.ok) throw new Error(data?.error || 'Seeding failed')
  return data
}
