'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/Toast'

export default function ImportArtistsButton({ festivalId }: { festivalId: string }) {
  const [open, setOpen] = useState(false)
  const [json, setJson] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function importArtists() {
    setLoading(true)
    try {
      const artists = JSON.parse(json)
      if (!Array.isArray(artists)) throw new Error('Il JSON deve essere un array')

      const toInsert = artists.map((a: any) => ({
        festival_id: festivalId,
        name: a.name,
        day: a.day ?? null,
        day_label: a.day_label ?? null,
        event_type: a.event_type ?? null,
        stage: a.stage ?? null,
        start_time: a.start_time ?? null,
        end_time: a.end_time ?? null,
      }))

      const { error } = await supabase.from('artists').insert(toInsert)
      if (error) throw error

      toast(`${toInsert.length} artisti importati!`, 'success')
      setOpen(false)
      setJson('')
      window.location.reload()
    } catch (e: any) {
      toast(e.message ?? 'Errore nel parsing JSON', 'error')
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs bg-[#1A1A1A] text-white px-3 py-1.5 rounded-xl font-bold"
      >
        + Import JSON
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#F5F0E8] rounded-3xl w-full max-w-lg flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-5 border-b border-[#E0D9CC]">
              <h2 className="font-black text-xl uppercase tracking-tight">Import artisti</h2>
              <button onClick={() => setOpen(false)} className="text-[#666] text-2xl leading-none">×</button>
            </div>
            <div className="p-5 flex-1 overflow-auto">
              <p className="text-xs text-[#666] mb-3">
                Incolla un array JSON con gli artisti. Formato:
              </p>
              <pre className="text-[10px] bg-white border border-[#E0D9CC] rounded-xl p-3 mb-3 overflow-x-auto">{`[
  {
    "name": "Artista",
    "day": "2026-06-04",
    "day_label": "Giovedì",
    "stage": "Main Stage",
    "start_time": "21:00",
    "end_time": "22:30"
  }
]`}</pre>
              <textarea
                value={json}
                onChange={e => setJson(e.target.value)}
                placeholder="Incolla il JSON qui..."
                className="w-full h-40 bg-white border border-[#E0D9CC] rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
            <div className="p-5 border-t border-[#E0D9CC] flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 bg-white border border-[#E0D9CC] rounded-xl py-2.5 text-sm font-semibold">
                Annulla
              </button>
              <button
                onClick={importArtists}
                disabled={loading || !json.trim()}
                className="flex-1 bg-[#1A1A1A] text-white disabled:opacity-40 rounded-xl py-2.5 text-sm font-black transition"
              >
                {loading ? '...' : 'Importa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}