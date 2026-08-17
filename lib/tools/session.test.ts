import { describe, expect, it } from 'vitest'
import { DatabaseSync } from 'node:sqlite'
import { releaseTurn, reserveTurn } from './session'

/**
 * The per-session message cap is the only thing bounding how many model calls
 * one visitor can make, and it used to be a read here, an increment later — so
 * eight requests fired at once all saw zero used. What is at risk is the
 * semantics of one conditional UPDATE, which is engine behaviour, so this runs
 * the real SQL against node:sqlite exactly as counters.test.ts does.
 */

function fakeD1() {
  const db = new DatabaseSync(':memory:')
  db.exec(`
    CREATE TABLE tool_sessions (
      id              TEXT PRIMARY KEY,
      messages_used   INTEGER NOT NULL DEFAULT 0,
      transcript_json TEXT
    );
    INSERT INTO tool_sessions (id, messages_used) VALUES ('s1', 0), ('s2', 0);
  `)

  const handle = {
    prepare(sql: string) {
      const stmt = db.prepare(sql)
      return {
        bind(...values: unknown[]) {
          return {
            async run() {
              const r = stmt.run(...(values as never[]))
              return { meta: { changes: Number(r.changes) } }
            },
          }
        },
      }
    },
  } as unknown as D1Database

  const used = (id: string) =>
    (db.prepare('SELECT messages_used FROM tool_sessions WHERE id = ?').get(id) as {
      messages_used: number
    }).messages_used

  return { handle, used }
}

const LIMIT = 8

describe('reserveTurn', () => {
  it('allows exactly the limit, then refuses and stays refused', async () => {
    const { handle, used } = fakeD1()

    for (let i = 0; i < LIMIT; i++) {
      expect(await reserveTurn(handle, 's1', LIMIT)).toBe(true)
    }

    expect(used('s1')).toBe(LIMIT)
    expect(await reserveTurn(handle, 's1', LIMIT)).toBe(false)
    expect(await reserveTurn(handle, 's1', LIMIT)).toBe(false)

    // A refused claim must not have incremented anything on its way out.
    expect(used('s1')).toBe(LIMIT)
  })

  it('holds when claims arrive at once rather than in sequence', async () => {
    const { handle, used } = fakeD1()

    // The failure this replaced: every one of these read messages_used = 0
    // before any of them wrote, so all twenty were allowed.
    const claims = await Promise.all(
      Array.from({ length: 20 }, () => reserveTurn(handle, 's1', LIMIT)),
    )

    expect(claims.filter(Boolean)).toHaveLength(LIMIT)
    expect(used('s1')).toBe(LIMIT)
  })

  it('counts each session separately', async () => {
    const { handle, used } = fakeD1()

    for (let i = 0; i < LIMIT; i++) await reserveTurn(handle, 's1', LIMIT)

    expect(await reserveTurn(handle, 's2', LIMIT)).toBe(true)
    expect(used('s2')).toBe(1)
  })

  it('refuses an unknown session rather than creating one', async () => {
    const { handle } = fakeD1()
    expect(await reserveTurn(handle, 'nope', LIMIT)).toBe(false)
  })
})

describe('releaseTurn', () => {
  it('hands back a claim when the model never answered', async () => {
    const { handle, used } = fakeD1()

    await reserveTurn(handle, 's1', LIMIT)
    await reserveTurn(handle, 's1', LIMIT)
    await releaseTurn(handle, 's1')

    expect(used('s1')).toBe(1)
  })

  it('reopens the session when a release follows the last claim', async () => {
    const { handle } = fakeD1()

    for (let i = 0; i < LIMIT; i++) await reserveTurn(handle, 's1', LIMIT)
    expect(await reserveTurn(handle, 's1', LIMIT)).toBe(false)

    await releaseTurn(handle, 's1')
    expect(await reserveTurn(handle, 's1', LIMIT)).toBe(true)
  })

  it('never drops below zero', async () => {
    const { handle, used } = fakeD1()

    await releaseTurn(handle, 's1')
    await releaseTurn(handle, 's1')

    expect(used('s1')).toBe(0)
  })
})
