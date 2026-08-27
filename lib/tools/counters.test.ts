import { describe, expect, it } from 'vitest'
import { DatabaseSync } from 'node:sqlite'
import { bumpCounter, underLimit, utcDay } from './counters'

/**
 * The counter is the one piece of this tool where a silent bug is expensive:
 * too permissive and someone points a script at us, too strict and the tool
 * tells every visitor it is full. So it gets a real test.
 *
 * ponytail: tested against node:sqlite rather than @cloudflare/vitest-pool-workers.
 * D1 *is* SQLite, and what is at risk here is the semantics of one conditional
 * upsert — `changes` on a cold day versus at the cap — which is engine
 * behaviour, not binding behaviour. Costs one dev dependency instead of a test
 * harness. Move to the workers pool if we ever need to test D1-specific
 * behaviour like batch() or session bookmarks.
 */

/** Minimal stand-in for the slice of D1Database the counter functions call. */
function fakeD1() {
  const db = new DatabaseSync(':memory:')
  db.exec(`
    CREATE TABLE tool_counters (
      day TEXT NOT NULL,
      key TEXT NOT NULL,
      n   INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (day, key)
    );
  `)

  return {
    prepare(sql: string) {
      const stmt = db.prepare(sql)
      return {
        bind(...values: unknown[]) {
          return {
            async run() {
              const r = stmt.run(...(values as never[]))
              return { meta: { changes: Number(r.changes) } }
            },
            async first<T>() {
              return (stmt.get(...(values as never[])) ?? null) as T | null
            },
          }
        },
      }
    },
  } as unknown as D1Database
}

const DAY = '2026-08-14'

describe('utcDay', () => {
  it('formats as YYYY-MM-DD in UTC', () => {
    expect(utcDay(new Date('2026-08-14T23:30:00Z'))).toBe('2026-08-14')
  })

  it('rolls over on the UTC boundary, not the local one', () => {
    expect(utcDay(new Date('2026-08-15T00:00:01Z'))).toBe('2026-08-15')
  })
})

describe('bumpCounter', () => {
  it('allows the first call of a new day, when no row exists yet', async () => {
    // The bug this guards: `UPDATE ... WHERE n < ?` changes zero rows here,
    // which reads as "capped" — so the tool would report full every midnight.
    const db = fakeD1()
    await expect(bumpCounter(db, 'global-messages', 200, DAY)).resolves.toBe(true)
  })

  it('allows exactly `limit` calls, then refuses', async () => {
    const db = fakeD1()
    const results: boolean[] = []
    for (let i = 0; i < 5; i++) {
      results.push(await bumpCounter(db, 'ip:abc', 3, DAY))
    }
    expect(results).toEqual([true, true, true, false, false])
  })

  it('stays refused once capped — no drift back under the limit', async () => {
    const db = fakeD1()
    for (let i = 0; i < 10; i++) await bumpCounter(db, 'ip:abc', 2, DAY)
    await expect(bumpCounter(db, 'ip:abc', 2, DAY)).resolves.toBe(false)
    expect(await underLimit(db, 'ip:abc', 2, DAY)).toBe(false)
  })

  it('counts each key separately', async () => {
    const db = fakeD1()
    await bumpCounter(db, 'ip:aaa', 1, DAY)
    expect(await bumpCounter(db, 'ip:aaa', 1, DAY)).toBe(false)
    expect(await bumpCounter(db, 'ip:bbb', 1, DAY)).toBe(true)
  })

  it('resets on a new day', async () => {
    const db = fakeD1()
    await bumpCounter(db, 'ip:abc', 1, DAY)
    expect(await bumpCounter(db, 'ip:abc', 1, DAY)).toBe(false)
    expect(await bumpCounter(db, 'ip:abc', 1, '2026-08-15')).toBe(true)
  })
})

describe('underLimit', () => {
  it('is true when nothing has been counted yet', async () => {
    const db = fakeD1()
    expect(await underLimit(db, 'ip:abc', 3, DAY)).toBe(true)
  })

  it('does not consume anything', async () => {
    const db = fakeD1()
    await underLimit(db, 'ip:abc', 1, DAY)
    await underLimit(db, 'ip:abc', 1, DAY)
    // Still gets its full allowance.
    expect(await bumpCounter(db, 'ip:abc', 1, DAY)).toBe(true)
  })

  it('goes false at the cap, matching bumpCounter', async () => {
    const db = fakeD1()
    await bumpCounter(db, 'ip:abc', 2, DAY)
    expect(await underLimit(db, 'ip:abc', 2, DAY)).toBe(true)
    await bumpCounter(db, 'ip:abc', 2, DAY)
    expect(await underLimit(db, 'ip:abc', 2, DAY)).toBe(false)
  })
})
