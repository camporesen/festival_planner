'use client'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('reset_password')
  const tc = useTranslations('common')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError(t('mismatch')); return }
    if (password.length < 6) { setError(t('too_short')); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F0E8]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-block bg-[#C8F135] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            {tc('app_name')}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight leading-none">
            {t('title')}
          </h1>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E0D9CC] shadow-sm">
          {done ? (
            <div className="text-center space-y-3">
              <p className="text-4xl">✅</p>
              <p className="font-bold">{t('done_title')}</p>
              <p className="text-sm text-[#666]">{t('done_desc')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-[#F5F0E8] border border-[#E0D9CC] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1A1A]"
                placeholder={t('new_password')}
              />
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                className="w-full bg-[#F5F0E8] border border-[#E0D9CC] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1A1A]"
                placeholder={t('confirm_password')}
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white disabled:opacity-50 rounded-xl py-2.5 text-sm font-bold transition"
              >
                {loading ? '...' : t('update')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}