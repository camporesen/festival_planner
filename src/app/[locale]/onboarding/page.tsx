'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const steps = [
  {
    emoji: '🔍',
    title: 'Trova il tuo festival',
    description: 'Cerca tra i festival già pronti su Stageside. La lineup è già caricata — non devi fare niente.',
    highlight: 'Primavera Sound 2026 è già disponibile',
  },
  {
    emoji: '👥',
    title: 'Crea il tuo gruppo',
    description: 'Ogni festival ha i suoi gruppi privati. Crea il tuo e invita gli amici con un semplice link.',
    highlight: 'Solo il tuo gruppo vede i vostri voti',
  },
  {
    emoji: '🎯',
    title: 'Vota e pianifica',
    description: 'Votate gli artisti insieme. Lo score del gruppo decide i MUST SEE. Costruite il piano del giorno e sapete sempre dove trovarvi.',
    highlight: 'Timeline, conflitti e piani in tempo reale',
  },
]

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  async function finish() {
    // Salva che l'onboarding è stato completato nei metadata utente
    await supabase.auth.updateUser({
      data: { onboarding_done: true }
    })
    router.push('/festivals')
  }

  const step = steps[current]
  const isLast = current === steps.length - 1

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-between p-6">
      {/* Top */}
      <div className="w-full flex justify-between items-center pt-2">
        <div className="inline-block bg-[#C8F135] px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-widest">
          Stageside
        </div>
        <button
          onClick={finish}
          className="text-sm text-[#999] hover:text-[#1A1A1A] transition font-medium"
        >
          Salta
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs w-full">
        <div className="text-7xl mb-6">{step.emoji}</div>
        <h2 className="text-3xl font-black uppercase tracking-tight leading-none mb-4">
          {step.title}
        </h2>
        <p className="text-[#666] text-base leading-relaxed mb-4">
          {step.description}
        </p>
        <div className="bg-white border border-[#E0D9CC] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1A1A1A]">
          {step.highlight}
        </div>
      </div>

      {/* Bottom */}
      <div className="w-full max-w-xs space-y-4">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-[#1A1A1A]' : 'w-1.5 bg-[#E0D9CC]'}`}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={() => isLast ? finish() : setCurrent(current + 1)}
          className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white rounded-xl py-3.5 text-sm font-black uppercase tracking-wide transition"
        >
          {isLast ? 'Inizia' : 'Avanti'}
        </button>
      </div>
    </div>
  )
}