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
      .select()
      .single()
    if (data) { onAdd(data); setName(''); setDay(''); setDayLabel(''); setOpen(false) }
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex-shrink-0 ml-auto bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-3 py-1.5 text-sm transition">
        + Artista
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-800">
            <h2 className="font-semibold text-lg mb-4">Aggiungi artista</h2>
            <div className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome artista *"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              <input type="date" value={day} onChange={e => setDay(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              <input value={dayLabel} onChange={e => setDayLabel(e.target.value)} placeholder="Etichetta giorno (es. Giovedì)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-2 text-sm transition">Annulla</button>
              <button onClick={add} disabled={loading || !name.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg py-2 text-sm font-semibold transition">
                {loading ? 'Aggiungendo...' : 'Aggiungi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}