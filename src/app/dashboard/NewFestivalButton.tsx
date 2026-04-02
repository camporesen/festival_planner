'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewFestivalButton({ userId, userEmail, userUsername }: { 
  userId: string
  userEmail: string
  userUsername: string 
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function create() {
    if (!name.trim()) return
    setLoading(true)
    const { data: fest, error } = await supabase
      .from('festivals')
      .insert({ name, location, start_date: startDate || null, end_date: endDate || null, created_by: userId })
      .select()
      .single()

    if (error) { setLoading(false); return }

    if (fest) {
      await supabase.from('festival_members').insert({
        festival_id: fest.id, user_id: userId,
        display_name: userUsername || userEmail.split('@')[0],
      })
      await supabase.from('festival_config').insert({ festival_id: fest.id })
      router.push(`/dashboard/${fest.id}`)
    }
    setLoading(false)
  }

  const inputClass = "w-full bg-[#F5F0E8] border border-[#E0D9CC] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1A1A]"

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex-1 bg-[#1A1A1A] hover:bg-[#333] text-white rounded-xl py-2.5 text-sm font-bold transition uppercase tracking-wide">
        + Crea festival
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-[#E0D9CC] shadow-lg">
            <h2 className="font-black text-xl uppercase tracking-tight mb-4">Nuovo festival</h2>
            <div className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome festival *" className={inputClass} />
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Luogo (es. Barcellona)" className={inputClass} />
              <div className="flex gap-2">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="flex-1 bg-[#F5F0E8] hover:bg-[#EDE8E0] border border-[#E0D9CC] rounded-xl py-2.5 text-sm font-semibold transition">Annulla</button>
              <button onClick={create} disabled={loading || !name.trim()} className="flex-1 bg-[#1A1A1A] hover:bg-[#333] text-white disabled:opacity-40 rounded-xl py-2.5 text-sm font-bold transition">
                {loading ? '...' : 'Crea'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}