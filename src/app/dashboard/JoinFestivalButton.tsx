'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function JoinFestivalButton({ userId, userEmail }: { userId: string, userEmail: string }) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function join() {
    setLoading(true)
    setError('')
    const { data: fest } = await supabase
      .from('festivals')
      .select('id')
      .eq('invite_code', code.trim().toLowerCase())
      .single()

    if (!fest) { setError('Codice non valido.'); setLoading(false); return }

    await supabase.from('festival_members').upsert({
      festival_id: fest.id,
      user_id: userId,
      display_name: userEmail.split('@')[0],
    })
    router.push(`/dashboard/${fest.id}`)
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl py-2 text-sm font-semibold transition">
        Unisciti con codice
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-800">
            <h2 className="font-semibold text-lg mb-4">Unisciti a un festival</h2>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="Codice invite (es. a3f9bc12)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-2 text-sm transition">Annulla</button>
              <button onClick={join} disabled={loading || !code.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg py-2 text-sm font-semibold transition">
                {loading ? 'Entrando...' : 'Entra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}