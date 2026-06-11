import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth) // every group route requires a logged-in user

async function isMember(groupId, userId) {
  const r = await pool.query(
    'select 1 from group_members where group_id = $1 and user_id = $2',
    [groupId, userId],
  )
  return r.rowCount > 0
}

// POST /api/groups  { name }  -> creates the group, owner becomes first member
router.post('/', async (req, res) => {
  const name = String(req.body.name || '').trim()
  if (!name) return res.status(400).json({ error: 'Group name is required' })

  const client = await pool.connect()
  try {
    await client.query('begin')
    const { rows } = await client.query(
      `insert into groups (name, owner_id) values ($1, $2)
       returning id, name, owner_id as "ownerId", created_at as "createdAt"`,
      [name, req.user.id],
    )
    const group = rows[0]
    await client.query('insert into group_members (group_id, user_id) values ($1, $2)', [
      group.id,
      req.user.id,
    ])
    await client.query('commit')
    group.memberIds = [req.user.id]
    res.json(group)
  } catch (e) {
    await client.query('rollback')
    throw e
  } finally {
    client.release()
  }
})

// GET /api/groups  -> groups the caller belongs to, with member ids
router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `select g.id, g.name, g.owner_id as "ownerId", g.created_at as "createdAt",
            coalesce(array_agg(gm_all.user_id), '{}') as "memberIds"
       from groups g
       join group_members gm_me  on gm_me.group_id = g.id and gm_me.user_id = $1
       join group_members gm_all on gm_all.group_id = g.id
      group by g.id
      order by g.name`,
    [req.user.id],
  )
  res.json(rows)
})

// GET /api/groups/:id
router.get('/:id', async (req, res) => {
  if (!(await isMember(req.params.id, req.user.id)))
    return res.status(403).json({ error: 'Not a member of this group' })

  const { rows } = await pool.query(
    `select g.id, g.name, g.owner_id as "ownerId", g.created_at as "createdAt",
            coalesce(array_agg(gm.user_id), '{}') as "memberIds"
       from groups g
       join group_members gm on gm.group_id = g.id
      where g.id = $1
      group by g.id`,
    [req.params.id],
  )
  res.json(rows[0] || null)
})

// GET /api/groups/:id/members
router.get('/:id/members', async (req, res) => {
  if (!(await isMember(req.params.id, req.user.id)))
    return res.status(403).json({ error: 'Not a member of this group' })

  const { rows } = await pool.query(
    `select u.id, u.username, u.created_at as "createdAt", (u.id = g.owner_id) as "isOwner"
       from group_members gm
       join users u  on u.id = gm.user_id
       join groups g on g.id = gm.group_id
      where gm.group_id = $1
      order by "isOwner" desc, u.username`,
    [req.params.id],
  )
  res.json(rows)
})

// POST /api/groups/:id/members  { username }  (owner only)
router.post('/:id/members', async (req, res) => {
  const { rows: grows } = await pool.query('select owner_id from groups where id = $1', [req.params.id])
  const group = grows[0]
  if (!group) return res.status(404).json({ error: 'Group not found' })
  if (group.owner_id !== req.user.id)
    return res.status(403).json({ error: 'Only the group owner can add members' })

  const username = String(req.body.username || '').trim()
  if (!username) return res.status(400).json({ error: 'Username is required' })

  const { rows: urows } = await pool.query(
    'select id, username from users where lower(username) = lower($1)',
    [username],
  )
  const user = urows[0]
  if (!user) return res.status(404).json({ error: `No registered user named "${username}"` })

  const member = await pool.query(
    'select 1 from group_members where group_id = $1 and user_id = $2',
    [req.params.id, user.id],
  )
  if (member.rowCount) return res.status(409).json({ error: `${user.username} is already a member` })

  await pool.query('insert into group_members (group_id, user_id) values ($1, $2)', [
    req.params.id,
    user.id,
  ])
  res.json({ ok: true })
})

// POST /api/groups/:groupId/notes  { text, date }
router.post('/:groupId/notes', async (req, res) => {
  if (!(await isMember(req.params.groupId, req.user.id)))
    return res.status(403).json({ error: 'Not a member of this group' })

  const text = String(req.body.text || '').trim()
  if (!text) return res.status(400).json({ error: 'Note text is required' })
  const date = req.body.date || null // "YYYY-MM-DD"; falls back to today in SQL

  const { rows } = await pool.query(
    `insert into notes (group_id, author_id, note_date, text)
     values ($1, $2, coalesce($3::date, current_date), $4)
     returning id, group_id as "groupId", author_id as "authorId",
               to_char(note_date, 'YYYY-MM-DD') as date, text,
               created_at as "createdAt", updated_at as "updatedAt"`,
    [req.params.groupId, req.user.id, date, text],
  )
  res.json(rows[0])
})

// GET /api/groups/:groupId/notes?date=&authorId=&q=   (newest day first)
router.get('/:groupId/notes', async (req, res) => {
  if (!(await isMember(req.params.groupId, req.user.id)))
    return res.status(403).json({ error: 'Not a member of this group' })

  const { date, authorId, q } = req.query
  const clauses = ['group_id = $1']
  const params = [req.params.groupId]
  if (date) {
    params.push(date)
    clauses.push(`note_date = $${params.length}::date`)
  }
  if (authorId) {
    params.push(authorId)
    clauses.push(`author_id = $${params.length}`)
  }
  if (q) {
    params.push(`%${String(q).toLowerCase()}%`)
    clauses.push(`lower(text) like $${params.length}`)
  }

  const { rows } = await pool.query(
    `select id, group_id as "groupId", author_id as "authorId",
            to_char(note_date, 'YYYY-MM-DD') as date, text,
            created_at as "createdAt", updated_at as "updatedAt"
       from notes
      where ${clauses.join(' and ')}
      order by note_date desc, created_at desc`,
    params,
  )
  res.json(rows)
})

export default router
