'use client'

import { useState } from 'react'

const PASSWORD = 'cii2026'

export function PitchGate() {
  const [input, setInput] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [shake, setShake] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input === PASSWORD) {
      setUnlocked(true)
    } else {
      setShake(true)
      setInput('')
      setTimeout(() => setShake(false), 600)
    }
  }

  if (unlocked) {
    return (
      <iframe
        src="/cii-epyc-8478ac8377.html"
        className="fixed inset-0 w-full h-full border-none"
        title="CII Pitch"
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#183228]">
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-4 w-full max-w-xs px-4 ${shake ? 'animate-[shake_0.6s_ease]' : ''}`}
      >
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
        `}</style>
        <svg width="72" height="20" viewBox="0 0 72 20" fill="none" className="mb-4 opacity-80">
          <text x="0" y="16" fontFamily="serif" fontSize="18" fill="#f5f0e8" letterSpacing="4">EPYC</text>
        </svg>
        <input
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Password"
          autoFocus
          className="bg-white/10 text-[#f5f0e8] placeholder-white/30 border border-white/20 rounded px-4 py-3 text-sm outline-none focus:border-white/50 transition-colors"
        />
        <button
          type="submit"
          className="bg-[#b91646] hover:bg-[#a01340] text-white text-sm font-medium py-3 rounded transition-colors"
        >
          Enter
        </button>
      </form>
    </div>
  )
}
