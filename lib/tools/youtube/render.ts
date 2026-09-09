/**
 * Segments to the four things a visitor can actually take away.
 *
 * Pure, no I/O, no network - the same split as `lib/tools/llms-txt/render.ts`
 * against its generator, and for the same reason: format is deterministic and
 * worth pinning in tests, fetching is not.
 *
 * SRT and VTT are files someone loads into a video editor or serves as a
 * caption track, so a malformed cue is invisible to us and broken for them.
 * That is what `render.test.ts` guards.
 */

import type { TranscriptSegment } from './fetch-transcript'

export type TranscriptFormat = 'text' | 'timestamped' | 'srt' | 'vtt'

/**
 * Roughly a paragraph. Breaks land on a segment boundary once the running
 * paragraph passes this.
 *
 * ponytail: a character count, not a pause-length heuristic. Gap-based
 * paragraphing needs a threshold tuned per content type - a lecture pauses
 * differently from a song - and gets it wrong on both. Ceiling: paragraph
 * breaks land near, not at, a change of subject. Upgrade path if that ever
 * matters is the caption track's own line grouping, which is already in the
 * data we throw away.
 */
const PARAGRAPH_CHARS = 700

export function render(segments: TranscriptSegment[], format: TranscriptFormat): string {
  switch (format) {
    case 'text':
      return toPlainText(segments)
    case 'timestamped':
      return toTimestamped(segments)
    case 'srt':
      return toSrt(segments)
    case 'vtt':
      return toVtt(segments)
  }
}

/** The one people paste into an LLM: prose, no times, wrapped into paragraphs. */
export function toPlainText(segments: TranscriptSegment[]): string {
  const paragraphs: string[] = []
  let current = ''

  for (const segment of segments) {
    current = current ? `${current} ${segment.text}` : segment.text
    if (current.length >= PARAGRAPH_CHARS) {
      paragraphs.push(current)
      current = ''
    }
  }
  if (current) paragraphs.push(current)

  return paragraphs.join('\n\n')
}

/** One line per cue, prefixed with where it starts. */
export function toTimestamped(segments: TranscriptSegment[]): string {
  return segments.map((s) => `[${clock(s.start)}] ${s.text}`).join('\n')
}

/**
 * SubRip. Cues numbered from 1, `HH:MM:SS,mmm` with a comma, blank line between.
 *
 * Ends are clamped so a cue never runs past the next one's start: overlapping
 * cues are legal in the source data and are rejected by some players.
 */
export function toSrt(segments: TranscriptSegment[]): string {
  const cues = segments.map((segment, i) => {
    const [start, end] = bounds(segments, i)
    return `${i + 1}\n${stamp(start, ',')} --> ${stamp(end, ',')}\n${segment.text}`
  })

  return `${cues.join('\n\n')}\n`
}

/** WebVTT. Same cues, a dot for the decimal, and the required header. */
export function toVtt(segments: TranscriptSegment[]): string {
  const cues = segments.map((segment, i) => {
    const [start, end] = bounds(segments, i)
    return `${stamp(start, '.')} --> ${stamp(end, '.')}\n${segment.text}`
  })

  return `WEBVTT\n\n${cues.join('\n\n')}\n`
}

/** Start and end of a cue, never overlapping the next and never zero-length. */
function bounds(segments: TranscriptSegment[], i: number): [number, number] {
  const segment = segments[i]
  const next = segments[i + 1]
  const uncapped = segment.start + segment.duration
  const end = next ? Math.min(uncapped, next.start) : uncapped

  return [segment.start, Math.max(end, segment.start + 0.1)]
}

/** `HH:MM:SS,mmm` or `HH:MM:SS.mmm` - the only difference between SRT and VTT. */
function stamp(seconds: number, decimal: ',' | '.'): string {
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000)
  return `${clock(Math.floor(seconds))}${decimal}${String(ms).padStart(3, '0')}`
}

/**
 * `HH:MM:SS`, always with hours.
 *
 * SRT and VTT both require the hours field. The on-screen timestamped format
 * shares it so a line copied from the page matches the file it came from.
 */
export function clock(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds))
  const h = Math.floor(whole / 3600)
  const m = Math.floor((whole % 3600) / 60)
  const s = whole % 60

  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

/** What the browser saves it as. */
export const FILE_EXTENSION: Record<TranscriptFormat, string> = {
  text: 'txt',
  timestamped: 'txt',
  srt: 'srt',
  vtt: 'vtt',
}

export const MIME_TYPE: Record<TranscriptFormat, string> = {
  text: 'text/plain;charset=utf-8',
  timestamped: 'text/plain;charset=utf-8',
  srt: 'application/x-subrip;charset=utf-8',
  vtt: 'text/vtt;charset=utf-8',
}

/** Characters no filesystem will take. Listed, not ranged, so it stays readable. */
const ILLEGAL_IN_FILENAME = /["*/:<>?\\|]/g

/**
 * A filename from the video's own title.
 *
 * Stripped to what every filesystem accepts. A title with a slash in it
 * silently fails to save, and Windows additionally refuses a name ending in a
 * dot or a space.
 */
export function filename(title: string, format: TranscriptFormat): string {
  const safe = title
    .replace(ILLEGAL_IN_FILENAME, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
    .replace(/[. ]+$/, '')

  return `${safe || 'transcript'}.${FILE_EXTENSION[format]}`
}
