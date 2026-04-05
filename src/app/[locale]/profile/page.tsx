import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const username = user.user_metadata?.username ?? user.email!.split('@')[0]
  const t = await getTranslations('profile')
  const tc = await getTranslations('common')

  return (
    <div className="min-h-screen max-w-lg mx-auto p-4 pb-24">
      <div className="pt-4 mb-8">
        <div className="inline-block bg-[#C8F135] px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest mb-1">
          {tc('app_name')}
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight">{t('title')}</h1>
      </div>
      <div className="space-y-3">
        <div className="bg-white border border-[#E0D9CC] rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#C8F135] rounded-xl flex items-center justify-center font-black text-lg text-[#1A1A1A]">
              {username[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-black uppercase tracking-tight text-lg">{username}</p>
              <p className="text-xs text-[#999]">{user.email}</p>
            </div>
          </div>
        </div>

        <Link href="/forgot-password">
          <div className="bg-white border border-[#E0D9CC] hover:border-[#1A1A1A] rounded-2xl p-4 transition cursor-pointer flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">{t('change_password')}</p>
              <p className="text-xs text-[#999]">{t('change_password_sub')}</p>
            </div>
            <span className="text-[#999]">→</span>
          </div>
        </Link>

        <div className="bg-white border border-[#E0D9CC] rounded-2xl p-4">
          <LogoutButton />
        </div>
        <div className="bg-white border border-[#E0D9CC] rounded-2xl p-4">
  <LanguageSwitcher />
</div>
      </div>
    </div>
  )
}