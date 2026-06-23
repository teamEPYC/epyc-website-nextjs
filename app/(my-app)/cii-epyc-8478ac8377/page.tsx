import type { Metadata } from 'next'
import { PitchGate } from './pitch-gate'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function CIIPitchPage() {
  return <PitchGate />
}
