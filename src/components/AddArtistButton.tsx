'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddArtistButton({ festivalId, onAdd }: {
  festivalId: string
  onAdd: (artist: any) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [dayLabel, setDayLabel] = useState('')
  const [day, setDay] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function add() {
    if (!name.trim()) return
    setLoading(true)
    const { data } = await supabase
      .from('artists')
      .insert({ festival_id: festivalId, name: name.trim(), day: day || null, day_label: dayLabel || null })
      .select().single()
    if (data) { onAdd(data); setName(''); setDay(''); setDayLabel(''); setOpen(false) }
    setLoading(false)
  }

  const inputClass = "w-full bg-[#F5F0E8] border border-[#E0D9CC] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1A1A]"

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex-shrink-0 bg-white border border-[#E0D9CC] hover:border-[#1A1A1A] rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition">
        + Artista
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-[#E0D9CC] shadow-lg">
            <h2 className="font-black text-xl uppercase tracking-tight mb-4">Aggiungi artista</h2>
            <div className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome artista *" className={inputClass} />
              <input type="date" value={day} onChange={e => setDay(e.target.value)} className={inputClass} />
              <input value={dayLabel} onChange={e => setDayLabel(e.target.value)} placeholder="Etichetta giorno (es. Giovedì)" className={inputClass} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="flex-1 bg-[#F5F0E8] border border-[#E0D9CC] rounded-xl py-2.5 text-sm font-semibold">Annulla</button>
              <button onClick={add} disabled={loading || !name.trim()} className="flex-1 bg-[#1A1A1A] text-white disabled:opacity-40 rounded-xl py-2.5 text-sm font-black transition">
                {loading ? '...' : 'Aggiungi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}