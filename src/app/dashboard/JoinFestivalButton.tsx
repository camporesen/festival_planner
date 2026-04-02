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
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

async function join() {
  setLoading(true); setError('')
  const { data: fest } = await supabase
    .from('festivals').select('id')
    .eq('invite_code', code.trim().toLowerCase()).single()
  if (!fest) { setError('Codice non valido.'); setLoading(false); return }
  
  const { error: memberError } = await supabase.from('festival_members').upsert({
    festival_id: fest.id,
    user_id: userId,
    display_name: userUsername || userEmail.split('@')[0],
  })
  
  if (memberError) {
    setError(`Errore: ${memberError.message}`)
    setLoading(false)
    return
  }
  
  router.push(`/dashboard/${fest.id}`)
  setLoading(false)
}

  

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex-1 bg-white hover:bg-[#F5F0E8] border border-[#E0D9CC] rounded-xl py-2.5 text-sm font-bold transition uppercase tracking-wide">
        Unisciti
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-[#E0D9CC] shadow-lg">
            <h2 className="font-black text-xl uppercase tracking-tight mb-4">Unisciti a un festival</h2>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="Codice invite"
              className="w-full bg-[#F5F0E8] border border-[#E0D9CC] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1A1A]" />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="flex-1 bg-[#F5F0E8] border border-[#E0D9CC] rounded-xl py-2.5 text-sm font-semibold">Annulla</button>
              <button onClick={join} disabled={loading || !code.trim()} className="flex-1 bg-[#1A1A1A] text-white disabled:opacity-40 rounded-xl py-2.5 text-sm font-bold transition">
                {loading ? '...' : 'Entra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}