import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

const NOTE_RETURNING = `
  returning id, group_id as "groupId", author_id as "authorId",
            to_char(note_date, 'YYYY-MM-DD') as date, text,
            created_at as "createdAt", updated_at as "updatedAt"`

// Author-only guard shared by PATCH/DELETE.
async function loadOwnNote(req, res) {
  const { rows } = await pool.query('select author_id from notes where id = $1', [req.params.id])
  const note = rows[0]
  if (!note) {
    res.status(404).json({ error: 'Note not found' })
    return null
  }
  if (note.author_id !== req.user.id) {
    res.status(403).json({ error: 'You can only modify your own notes' })
    return null
  }
  return note
}

// PATCH /api/notes/:id  { text?, date? }
router.patch('/:id', async (req, res) => {
  if (!(await loadOwnNote(req, res))) return

  let text = null
  if (req.body.text != null) {
    text = String(req.body.text).trim()
    if (!text) return res.status(400).json({ error: 'Note text is required' })
  }
  const date = req.body.date || null

  const { rows } = await pool.query(
    `update notes set
        text      = coalesce($2, text),
        note_date = coalesce($3::date, note_date),
        updated_at = now()
      where id = $1
      ${NOTE_RETURNING}`,
    [req.params.id, text, date],
  )
  res.json(rows[0])
})

// DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
  if (!(await loadOwnNote(req, res))) return
  await pool.query('delete from notes where id = $1', [req.params.id])
  res.json({ ok: true })
})

export default router
