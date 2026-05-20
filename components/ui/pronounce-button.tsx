'use client'

import { useCallback } from 'react'
import { IconButton } from '@/components/ui/icon-button'
import { Play } from '@/components/icons/play'

// EPYC is pronounced "epic" — spelling it out to the TTS engine would mispronounce it.
const PRONUNCIATION = 'epic'

export function PronounceButton() {
  const speak = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(PRONUNCIATION)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    synth.speak(utterance)
  }, [])

  return (
    <IconButton
      tone="ink"
      aria-label="Hear how to pronounce EPYC"
      className="bg-ink/80 ring-1 ring-cream/30"
      onClick={speak}
    >
      <Play size={18} />
    </IconButton>
  )
}
