// The ONLY module that touches window.localStorage.
// Keys are namespaced under "dt:". When we move to Postgres, store.js stops
// calling these and calls fetch() instead — this file can then be deleted.

const PREFIX = 'dt:'

export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function write(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key)
}
