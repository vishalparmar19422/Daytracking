// Domain data layer — THE SEAM (now backed by the real API).
//
// Every function still has the same async signature the components call, so
// nothing else in the client had to change when we moved off localStorage.
// The only local state we keep is the auth token (localStorage key dt:token),
// sent as a Bearer header on every request.

import { read, write, remove } from './storage'

const TOKEN = 'token'

function authHeaders() {
  const token = read(TOKEN, null)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Thin fetch wrapper: adds auth + JSON headers, parses the body, and turns a
// non-2xx response into a thrown Error carrying the server's message.
async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    // empty / non-JSON body
  }
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
  return data
}

// ---------- auth ----------

export async function register(username, password) {
  const { token, user } = await api('/auth/register', { method: 'POST', body: { username, password } })
  write(TOKEN, token)
  return user
}

export async function login(username, password) {
  const { token, user } = await api('/auth/login', { method: 'POST', body: { username, password } })
  write(TOKEN, token)
  return user
}

export async function logout() {
  remove(TOKEN)
  return true
}

export async function getCurrentUser() {
  if (!read(TOKEN, null)) return null
  try {
    const { user } = await api('/auth/me')
    return user
  } catch {
    remove(TOKEN) // token expired or invalid — treat as logged out
    return null
  }
}

// ---------- groups ----------
// (ownerId / actingUserId args are ignored now — the server derives identity
//  from the token — but kept in the signatures so call sites stay unchanged.)

export async function createGroup(name) {
  return api('/groups', { method: 'POST', body: { name } })
}

export async function listGroups() {
  return api('/groups')
}

export async function getGroup(groupId) {
  return api(`/groups/${groupId}`)
}

export async function addMember(groupId, username) {
  return api(`/groups/${groupId}/members`, { method: 'POST', body: { username } })
}

export async function listMembers(groupId) {
  return api(`/groups/${groupId}/members`)
}

// ---------- notes ----------

export async function addNote(groupId, _authorId, { text, date }) {
  return api(`/groups/${groupId}/notes`, { method: 'POST', body: { text, date } })
}

export async function listNotes(groupId, { date, authorId, query } = {}) {
  const params = new URLSearchParams()
  if (date) params.set('date', date)
  if (authorId) params.set('authorId', authorId)
  if (query) params.set('q', query)
  const qs = params.toString()
  return api(`/groups/${groupId}/notes${qs ? `?${qs}` : ''}`)
}

export async function updateNote(noteId, _authorId, { text, date }) {
  return api(`/notes/${noteId}`, { method: 'PATCH', body: { text, date } })
}

export async function deleteNote(noteId) {
  return api(`/notes/${noteId}`, { method: 'DELETE' })
}
