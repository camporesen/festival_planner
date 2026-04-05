'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/Toast'
import Link from 'next/link'

export default function NewFestivalPage() {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const inputClass = "w-full bg-[#F5F0E8] border border-[#E0D9CC] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1A1A]"

  async function create() {
    if (!name.trim()) return
    setLoading(true)
    try {
      const { data: fest, error } = await supabase
        .from('festivals')
        .insert({
          name: name.trim(),
          location: location || null,
          start_date: startDate || null,
          end_date: endDate || null,
          is_public: isPublic,
          slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        })
        .select()
        .single()

      if (error) throw error
      toast('Festival creato!', 'success')
      router.push(`/admin/festival/${fest.id}`)
    } catch (e) {
      toast('Errore nella creazione', 'error')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto p-4 pb-24">
      <div className="pt-4 mb-6">
        <Link href="/admin" className="text-sm text-[#666] hover:text-[#1A1A1A] transition mb-3 inline-block">
          ← Admin
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-tight">Nuovo festival</h1>
      </div>

      <div className="bg-white border border-[#E0D9CC] rounded-2xl p-5 space-y-4">
        <div>
          <label className="text-xs font-black uppercase tracking-wide text-[#666] mb-1.5 block">Nome *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="es. Primavera Sound 2027" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-black uppercase tracking-wide text-[#666] mb-1.5 block">Luogo</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="es. Barcellona" className={inputClass} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-black uppercase tracking-wide text-[#666] mb-1.5 block">Data inizio</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
          </div>
          <div className="flex-1">
            <label className="text-xs font-black uppercase tracking-wide text-[#666] mb-1.5 block">Data fine</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">Pubblico</p>
            <p className="text-xs text-[#666]">Visibile a tutti gli utenti</p>
          </div>
          <div
            onClick={() => setIsPublic(!isPublic)}
            className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${isPublic ? 'bg-[#1A1A1A]' : 'bg-[#E0D9CC]'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </div>
      </div>

      <button
        onClick={create}
        disabled={loading || !name.trim()}
        className="w-full mt-4 bg-[#1A1A1A] hover:bg-[#333] text-white disabled:opacity-40 rounded-xl py-3 text-sm font-black uppercase tracking-wide transition"
      >
        {loading ? '...' : 'Crea festival'}
      </button>
    </div>
  )
}