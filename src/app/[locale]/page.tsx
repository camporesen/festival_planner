import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="inline-block bg-[#C8F135] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6">
          Stageside
        </div>

        <h1 className="text-5xl font-black uppercase tracking-tight leading-none mb-4">
          Il festival<br />con i tuoi<br />amici
        </h1>

        <p className="text-[#666] text-lg leading-relaxed mb-8">
          Votate gli artisti, costruite il programma insieme, e scoprite dove essere in ogni momento.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/login?signup=true"
            className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white rounded-xl py-3.5 text-sm font-black uppercase tracking-wide transition text-center"
          >
            Inizia gratis
          </Link>
          <Link
            href="/login"
            className="w-full bg-white hover:bg-[#F0EBE3] border border-[#E0D9CC] rounded-xl py-3.5 text-sm font-black uppercase tracking-wide transition text-center"
          >
            Accedi
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="p-6 max-w-lg mx-auto w-full pb-12">
        <div className="space-y-3">
          <div className="bg-white border border-[#E0D9CC] rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🎯</span>
            <div>
              <p className="font-black uppercase tracking-tight">Vota gli artisti</p>
              <p className="text-sm text-[#666] mt-0.5">Interesse, priorità e curiosità — lo score del gruppo decide cosa non perdere.</p>
            </div>
          </div>
          <div className="bg-white border border-[#E0D9CC] rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">👥</span>
            <div>
              <p className="font-black uppercase tracking-tight">Pianifica con gli amici</p>
              <p className="text-sm text-[#666] mt-0.5">Crea un gruppo privato, condividi un link e vedete i voti di tutti in tempo reale.</p>
            </div>
          </div>
          <div className="bg-white border border-[#E0D9CC] rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">📅</span>
            <div>
              <p className="font-black uppercase tracking-tight">Timeline e conflitti</p>
              <p className="text-sm text-[#666] mt-0.5">Quando escono gli orari, vedi la timeline del giorno e i conflitti tra i tuoi MUST SEE.</p>
            </div>
          </div>
          <div className="bg-white border border-[#E0D9CC] rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🗺️</span>
            <div>
              <p className="font-black uppercase tracking-tight">Dove siamo?</p>
              <p className="text-sm text-[#666] mt-0.5">Segna quali concerti vuoi vedere — i tuoi amici sanno sempre dove trovarti.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#999] mt-8">
          Primavera Sound 2026 già disponibile 🎪
        </p>
      </div>
    </div>
  )
}