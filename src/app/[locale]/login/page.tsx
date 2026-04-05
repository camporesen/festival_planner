'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { toast } from '@/components/Toast'
import { useTranslations } from 'next-intl'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true')
  const supabase = createClient()
  const t = useTranslations('auth')
  const tc = useTranslations('common')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (isSignUp) {
      if (!username.trim()) { setError(t('username_required')); setLoading(false); return }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username.trim() } }
      })
      if (error) setError(error.message)
      else router.push('/onboarding')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); toast(error.message, 'error') }
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
            {tc('app_name')}
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight leading-none">
            {t('tagline_line1')}<br />{t('tagline_line2')}
          </h1>
          <p className="text-[#666] mt-2 text-sm">{t('tagline_sub')}</p>
          {next !== '/dashboard' && (
            <p className="text-xs text-[#999] mt-2 bg-white border border-[#E0D9CC] rounded-xl px-3 py-2">
              {t('join_group')}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E0D9CC] shadow-sm">
          <h2 className="font-bold text-lg mb-4">{isSignUp ? t('signup') : t('login')}</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className={inputClass}
                placeholder={t('username')}
                maxLength={30}
              />
            )}
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={inputClass}
              placeholder={t('email')}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={inputClass}
              placeholder={t('password')}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm">{message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white disabled:opacity-50 rounded-xl py-2.5 text-sm font-bold transition"
            >
              {loading ? '...' : isSignUp ? t('signup') : t('login')}
            </button>
          </form>

          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
            className="w-full mt-4 text-sm text-[#666] hover:text-[#1A1A1A] transition"
          >
            {isSignUp ? t('have_account') : t('no_account')}
          </button>

          {!isSignUp && (
            <Link href="/forgot-password" className="w-full text-sm text-[#666] hover:text-[#1A1A1A] transition text-center block mt-2">
              {t('forgot_password')}
            </Link>
          )}
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