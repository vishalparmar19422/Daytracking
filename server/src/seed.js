// Demo data seeder. Wipes all tables and rebuilds three groups with dummy
// users and unique notes. Used by `npm run seed` and the POST /api/dev/seed
// endpoint. Every demo user shares DEMO_PASSWORD so you can log in as anyone.
import { pool } from './db.js'
import { hashPassword } from './auth.js'

export const DEMO_PASSWORD = 'demo'

function isoDaysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const USERS = [
  'alice', 'bob', 'carol', 'dave', 'erin', 'frank', 'grace',
  'heidi', 'ivan', 'judy', 'mallory', 'niaj', 'olivia',
]

const GROUPS = [
  {
    name: 'Engineering Team',
    owner: 'alice',
    members: ['bob', 'carol', 'dave', 'erin', 'frank', 'grace', 'heidi', 'ivan', 'judy'],
    notes: [
      { by: 'alice', daysAgo: 0, text: 'Merged the auth refactor and cut release v2.3. Watching error rates.' },
      { by: 'bob', daysAgo: 0, text: 'Fixed the flaky checkout test — it was a race on the cart fixture.' },
      { by: 'grace', daysAgo: 0, text: 'Paired with Heidi on the GraphQL schema cleanup.' },
      { by: 'carol', daysAgo: 1, text: 'Migrated the users table to UUID primary keys on staging.' },
      { by: 'dave', daysAgo: 1, text: 'Profiled the search endpoint; p95 down from 800ms to 210ms.' },
      { by: 'heidi', daysAgo: 1, text: 'Reviewed 4 PRs and documented the new caching layer.' },
      { by: 'erin', daysAgo: 2, text: 'Wrote integration tests for the webhook retry logic.' },
      { by: 'frank', daysAgo: 2, text: 'Upgraded Node to 22 across all services. No breakages.' },
      { by: 'ivan', daysAgo: 3, text: 'Rolled back the recommendations feature flag — too slow under load.' },
      { by: 'judy', daysAgo: 3, text: 'On-call: handled 2 alerts, both false positives. Tuned the thresholds.' },
    ],
  },
  {
    name: 'Design Squad',
    owner: 'grace',
    members: ['mallory', 'niaj', 'olivia'],
    notes: [
      { by: 'grace', daysAgo: 0, text: 'Finalized the new color tokens and shipped them to the Figma library.' },
      { by: 'olivia', daysAgo: 0, text: 'Iterated on the empty states for the notes feed.' },
      { by: 'mallory', daysAgo: 1, text: 'Redesigned the onboarding flow — 3 screens down to 2.' },
      { by: 'niaj', daysAgo: 2, text: 'Ran user testing on the dashboard prototype; 5 sessions recorded.' },
      { by: 'mallory', daysAgo: 3, text: 'Audited iconography for consistency across the app.' },
    ],
  },
  {
    name: 'Marketing',
    owner: 'bob',
    members: ['mallory', 'olivia'],
    notes: [
      { by: 'bob', daysAgo: 0, text: 'Launched the June newsletter — 32% open rate so far.' },
      { by: 'mallory', daysAgo: 1, text: 'Drafted the case study with the Acme account.' },
      { by: 'olivia', daysAgo: 2, text: 'Scheduled social posts for product launch week.' },
      { by: 'bob', daysAgo: 3, text: 'Reviewed ad spend; reallocated budget to the best-performing channel.' },
    ],
  },
]

export async function seed() {
  const hash = await hashPassword(DEMO_PASSWORD)
  const client = await pool.connect()
  try {
    await client.query('begin')
    await client.query('truncate notes, group_members, groups, users restart identity cascade')

    const idByName = {}
    for (const username of USERS) {
      const { rows } = await client.query(
        'insert into users (username, password_hash) values ($1, $2) returning id',
        [username, hash],
      )
      idByName[username] = rows[0].id
    }

    for (const g of GROUPS) {
      const { rows } = await client.query(
        'insert into groups (name, owner_id) values ($1, $2) returning id',
        [g.name, idByName[g.owner]],
      )
      const groupId = rows[0].id
      for (const m of [g.owner, ...g.members]) {
        await client.query('insert into group_members (group_id, user_id) values ($1, $2)', [
          groupId,
          idByName[m],
        ])
      }
      for (const note of g.notes) {
        await client.query(
          'insert into notes (group_id, author_id, note_date, text) values ($1, $2, $3::date, $4)',
          [groupId, idByName[note.by], isoDaysAgo(note.daysAgo), note.text],
        )
      }
    }

    await client.query('commit')
  } catch (e) {
    await client.query('rollback')
    throw e
  } finally {
    client.release()
  }

  return {
    users: USERS.length,
    groups: GROUPS.map((g) => ({ name: g.name, members: g.members.length + 1, notes: g.notes.length })),
  }
}

// CLI entry: `npm run seed`
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then((summary) => {
      console.log('✓ Seeded:', JSON.stringify(summary, null, 2))
    })
    .catch((err) => {
      console.error('✗ Seed failed:', err.message)
      process.exitCode = 1
    })
    .finally(() => pool.end())
}
