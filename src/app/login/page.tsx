'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (isSignUp) {
      if (!username.trim()) { setError('Scegli uno username.'); setLoading(false); return }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username.trim() } }
      })
      if (error) setError(error.message)
        else router.push(next)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push(next)
    }
    setLoading(false)
  }

  const inputClass = "w-full bg-[#F5F0E8] border border-[#E0D9CC] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1A1A]"

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F0E8]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-block bg-[#C8F135] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            Stageside
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight leading-none">
            Pianifica<br />il festival
          </h1>
          <p className="text-[#666] mt-2 text-sm">con i tuoi amici</p>
          {next !== '/dashboard' && (
            <p className="text-xs text-[#999] mt-2 bg-white border border-[#E0D9CC] rounded-xl px-3 py-2">
              Accedi per unirti al gruppo
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E0D9CC] shadow-sm">
          <h2 className="font-bold text-lg mb-4">{isSignUp ? 'Crea account' : 'Accedi'}</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className={inputClass}
                placeholder="username (es. nicolò)"
                maxLength={30}
              />
            )}
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={inputClass}
              placeholder="email"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={inputClass}
              placeholder="password"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm">{message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white disabled:opacity-50 rounded-xl py-2.5 text-sm font-bold transition"
            >
              {loading ? '...' : isSignUp ? 'Registrati' : 'Accedi'}
            </button>
          </form>

          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
            className="w-full mt-4 text-sm text-[#666] hover:text-[#1A1A1A] transition"
          >
            {isSignUp ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}