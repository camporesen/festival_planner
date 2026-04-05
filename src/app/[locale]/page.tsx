import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  const t = await getTranslations('landing')
  const ta = await getTranslations('common')

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="inline-block bg-[#C8F135] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6">
          {ta('app_name')}
        </div>
        <h1 className="text-5xl font-black uppercase tracking-tight leading-none mb-4">
          {t('tagline').split(' ').slice(0, 2).join(' ')}<br />
          {t('tagline').split(' ').slice(2).join(' ')}
        </h1>
        <p className="text-[#666] text-lg leading-relaxed mb-8">{t('description')}</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/login?signup=true" className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white rounded-xl py-3.5 text-sm font-black uppercase tracking-wide transition text-center">
            {t('cta_start')}
          </Link>
          <Link href="/login" className="w-full bg-white hover:bg-[#F0EBE3] border border-[#E0D9CC] rounded-xl py-3.5 text-sm font-black uppercase tracking-wide transition text-center">
            {t('cta_login')}
          </Link>
        </div>
      </div>

      <div className="p-6 max-w-lg mx-auto w-full pb-12">
        <div className="space-y-3">
          {[
            { emoji: '🎯', title: t('feature1_title'), desc: t('feature1_desc') },
            { emoji: '👥', title: t('feature2_title'), desc: t('feature2_desc') },
            { emoji: '📅', title: t('feature3_title'), desc: t('feature3_desc') },
            { emoji: '🗺️', title: t('feature4_title'), desc: t('feature4_desc') },
          ].map((f, i) => (
            <div key={i} className="bg-white border border-[#E0D9CC] rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{f.emoji}</span>
              <div>
                <p className="font-black uppercase tracking-tight">{f.title}</p>
                <p className="text-sm text-[#666] mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-[#999] mt-8">{t('footer')}</p>
      </div>
    </div>
  )
}