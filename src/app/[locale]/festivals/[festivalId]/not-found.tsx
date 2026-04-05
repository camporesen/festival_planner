import Link from 'next/link'

export default function FestivalNotFound() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center p-6 text-center">
      <div className="inline-block bg-[#C8F135] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6">
        Stageside
      </div>
      <p className="text-4xl mb-4">🎪</p>
      <h1 className="text-2xl font-black uppercase tracking-tight mb-2">Festival non trovato</h1>
      <p className="text-[#666] text-sm mb-8">Questo festival non esiste o non è più disponibile.</p>
      <Link
        href="/festivals"
        className="bg-[#1A1A1A] hover:bg-[#333] text-white rounded-xl py-3 px-6 text-sm font-black uppercase tracking-wide transition"
      >
        Cerca altri festival
      </Link>
    </div>
  )
}