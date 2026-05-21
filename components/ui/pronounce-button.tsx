'use client'

import { useCallback, useEffect, useRef } from 'react'
import { IconButton } from '@/components/ui/icon-button'
import { Play } from '@/components/icons/play'

// Recorded pronunciation of "epic" (EPYC) — the same clip epyc.in plays,
// self-hosted from /public/audio. Using a real recording instead of the
// browser's speech synthesis keeps the voice consistent across devices.
const AUDIO_SRC = '/audio/epyc-pronunciation.mp3'

export function PronounceButton() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC)
    audio.preload = 'auto'
    audioRef.current = audio
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    // play() rejects if interrupted/blocked — ignore, nothing to recover.
    void audio.play().catch(() => {})
  }, [])

  return (
    <IconButton
      tone="ink"
      aria-label="Hear how to pronounce EPYC"
      className="bg-ink/80 ring-1 ring-cream/30"
      onClick={play}
    >
      <Play size={18} />
    </IconButton>
  )
}
