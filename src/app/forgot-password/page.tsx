'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://stageside-app.vercel.app/reset-password',
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F0E8]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-block bg-[#C8F135] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            Stageside
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight leading-none">
            Reset password
          </h1>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E0D9CC] shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-4xl">📬</p>
              <p className="font-bold">Email inviata!</p>
              <p className="text-sm text-[#666]">Controlla la tua casella e clicca il link per reimpostare la password.</p>
              <Link href="/login" className="block text-sm text-[#666] hover:text-[#1A1A1A] transition mt-4">
                ← Torna al login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#666] mb-4">Inserisci la tua email e ti mandiamo un link per reimpostare la password.</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#F5F0E8] border border-[#E0D9CC] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1A1A]"
                  placeholder="email"
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white disabled:opacity-50 rounded-xl py-2.5 text-sm font-bold transition"
                >
                  {loading ? '...' : 'Invia link reset'}
                </button>
              </form>
              <Link href="/login" className="block text-sm text-[#666] hover:text-[#1A1A1A] transition mt-4 text-center">
                ← Torna al login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}