import { describe, expect, it } from 'vitest'
import type { TranscriptSegment } from './fetch-transcript'
import { clock, filename, toPlainText, toSrt, toTimestamped, toVtt } from './render'

/**
 * SRT and VTT are loaded into video editors and served as caption tracks, so a
 * malformed cue is invisible to us and permanently broken for whoever saved
 * it. Cue numbering, the comma-versus-dot decimal, the hours field and
 * non-overlapping bounds are all things a player rejects outright.
 */

const segments: TranscriptSegment[] = [
  { start: 1.36, duration: 1.68, text: 'First line' },
  { start: 18.64, duration: 3.24, text: 'Second line' },
  { start: 3661.5, duration: 2, text: 'Past an hour' },
]

describe('clock', () => {
  it('always includes hours, which SRT and VTT both require', () => {
    expect(clock(0)).toBe('00:00:00')
    expect(clock(61)).toBe('00:01:01')
    expect(clock(3661)).toBe('01:01:01')
  })

  it('floors rather than rounds, so a cue never starts before it does', () => {
    expect(clock(59.9)).toBe('00:00:59')
  })
})

describe('toSrt', () => {
  const out = toSrt(segments)

  it('numbers cues from 1 and uses a comma decimal', () => {
    expect(out.startsWith('1\n00:00:01,360 --> 00:00:03,040\nFirst line')).toBe(true)
    expect(out).toContain('\n\n2\n00:00:18,640')
  })

  it('keeps the hours field past an hour', () => {
    expect(out).toContain('01:01:01,500 --> 01:01:03,500')
  })

  it('ends with a newline', () => {
    expect(out.endsWith('\n')).toBe(true)
  })

  it('never lets a cue overlap the next one', () => {
    // A three-second cue two seconds before the next start must be truncated,
    // or players that reject overlaps drop the whole track.
    const overlapping: TranscriptSegment[] = [
      { start: 0, duration: 5, text: 'Long' },
      { start: 2, duration: 1, text: 'Next' },
    ]
    expect(toSrt(overlapping)).toContain('00:00:00,000 --> 00:00:02,000')
  })

  it('never emits a zero-length cue', () => {
    const zero: TranscriptSegment[] = [{ start: 4, duration: 0, text: 'Blip' }]
    expect(toSrt(zero)).toContain('00:00:04,000 --> 00:00:04,100')
  })
})

describe('toVtt', () => {
  it('opens with the required header and uses a dot decimal', () => {
    const out = toVtt(segments)
    expect(out.startsWith('WEBVTT\n\n')).toBe(true)
    expect(out).toContain('00:00:01.360 --> 00:00:03.040')
    expect(out).not.toContain(',360')
  })

  it('does not number its cues, unlike SRT', () => {
    expect(toVtt(segments)).not.toMatch(/\n1\n/)
  })
})

describe('toTimestamped', () => {
  it('prefixes every line with its start', () => {
    expect(toTimestamped(segments).split('\n')[0]).toBe('[00:00:01] First line')
  })
})

describe('toPlainText', () => {
  it('joins cues into prose with no timestamps', () => {
    const out = toPlainText(segments)
    expect(out).toBe('First line Second line Past an hour')
    expect(out).not.toContain('[')
  })

  it('breaks into paragraphs once a run gets long', () => {
    const many = Array.from({ length: 60 }, (_, i) => ({
      start: i,
      duration: 1,
      text: 'a word or two here',
    }))
    expect(toPlainText(many).split('\n\n').length).toBeGreaterThan(1)
  })

  it('is empty, not broken, for no segments', () => {
    expect(toPlainText([])).toBe('')
  })
})

describe('filename', () => {
  it('keeps the title readable, spaces and all', () => {
    expect(filename('Never Gonna Give You Up', 'text')).toBe('Never Gonna Give You Up.txt')
  })

  it('strips characters a filesystem refuses, but keeps the spacing', () => {
    expect(filename('A/B: "C" <D>|E?F*G\\H', 'srt')).toBe('AB C DEFGH.srt')
  })

  it('uses the right extension per format', () => {
    expect(filename('Talk', 'vtt').endsWith('.vtt')).toBe(true)
    expect(filename('Talk', 'timestamped').endsWith('.txt')).toBe(true)
  })

  it('falls back rather than producing a bare extension', () => {
    expect(filename('///', 'text')).toBe('transcript.txt')
  })

  it('never ends in a dot or a space, which Windows refuses', () => {
    expect(filename('Episode 12. ', 'text')).toBe('Episode 12.txt')
  })
})
