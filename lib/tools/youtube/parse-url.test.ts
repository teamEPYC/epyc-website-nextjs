import { describe, expect, it } from 'vitest'
import { parseVideoUrl } from './parse-url'

/**
 * Every one of these is a form the YouTube share button, the address bar or a
 * mobile app actually produces. A rejection here is a visitor who pasted a
 * perfectly good link and was told it was wrong, which is the failure that
 * loses them — so the accept list is the important half of this file.
 */

const ID = 'dQw4w9WgXcQ'

function id(input: string): string | null {
  const r = parseVideoUrl(input)
  return r.ok ? r.videoId : null
}

describe('parseVideoUrl — accepts', () => {
  it('the standard watch URL', () => {
    expect(id(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID)
  })

  it('a bare id, which people paste', () => {
    expect(id(ID)).toBe(ID)
  })

  it('youtu.be short links', () => {
    expect(id(`https://youtu.be/${ID}`)).toBe(ID)
  })

  it('youtu.be with a share tracking param', () => {
    expect(id(`https://youtu.be/${ID}?si=aBcDeFgHiJkLmNoP`)).toBe(ID)
  })

  it('shorts, live and embed paths', () => {
    expect(id(`https://www.youtube.com/shorts/${ID}`)).toBe(ID)
    expect(id(`https://www.youtube.com/live/${ID}`)).toBe(ID)
    expect(id(`https://www.youtube.com/embed/${ID}`)).toBe(ID)
  })

  it('mobile and music subdomains', () => {
    expect(id(`https://m.youtube.com/watch?v=${ID}`)).toBe(ID)
    expect(id(`https://music.youtube.com/watch?v=${ID}`)).toBe(ID)
  })

  it('a timestamp and a playlist hanging off the end', () => {
    expect(id(`https://www.youtube.com/watch?v=${ID}&t=42s&list=PLabcdef`)).toBe(ID)
  })

  it('no scheme, and surrounding whitespace', () => {
    expect(id(`  youtube.com/watch?v=${ID}  `)).toBe(ID)
  })

  it('the privacy-mode embed host', () => {
    expect(id(`https://www.youtube-nocookie.com/embed/${ID}`)).toBe(ID)
  })
})

describe('parseVideoUrl — rejects', () => {
  it('empty input', () => {
    expect(parseVideoUrl('   ').ok).toBe(false)
  })

  it('a non-YouTube host, even one carrying a v param', () => {
    const r = parseVideoUrl(`https://vimeo.com/watch?v=${ID}`)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toContain('not a YouTube link')
  })

  it('a channel or playlist URL, and says so specifically', () => {
    const r = parseVideoUrl('https://www.youtube.com/@epyc')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toContain('not to a single video')
  })

  it('an id of the wrong length', () => {
    expect(parseVideoUrl('https://www.youtube.com/watch?v=tooshort').ok).toBe(false)
    expect(parseVideoUrl('https://youtu.be/waytoolongforanid').ok).toBe(false)
  })

  it('junk that is not a URL at all', () => {
    expect(parseVideoUrl('how do I get a transcript').ok).toBe(false)
  })

  it('a non-http scheme on a YouTube host', () => {
    expect(parseVideoUrl(`javascript://youtube.com/watch?v=${ID}`).ok).toBe(false)
  })
})
