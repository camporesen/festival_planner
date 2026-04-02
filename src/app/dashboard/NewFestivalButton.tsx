'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewFestivalButton({ userId, userEmail }: { userId: string, userEmail: string }) {
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

    if (error) {
      console.error('Errore creazione festival:', error.message)
      setLoading(false)
      return
    }

    if (fest) {
      const { error: memberError } = await supabase
        .from('festival_members')
        .insert({
          festival_id: fest.id,
          user_id: userId,
          display_name: userEmail.split('@')[0],
        })

      if (memberError) {
        console.error('Errore aggiunta membro:', memberError.message)
      }

      const { error: configError } = await supabase
        .from('festival_config')
        .insert({ festival_id: fest.id })

      if (configError) {
        console.error('Errore config:', configError.message)
      }

      router.push(`/dashboard/${fest.id}`)
    }

    setLoading(false)
  }
  
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 rounded-xl py-2 text-sm font-semibold transition">
        + Crea festival
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-800">
            <h2 className="font-semibold text-lg mb-4">Nuovo festival</h2>
            <div className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome festival *" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Luogo (es. Barcellona)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              <div className="flex gap-2">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-2 text-sm transition">Annulla</button>
              <button onClick={create} disabled={loading || !name.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg py-2 text-sm font-semibold transition">
                {loading ? 'Creando...' : 'Crea'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}