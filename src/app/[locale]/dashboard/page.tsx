import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const onboardingDone = user.user_metadata?.onboarding_done ?? false
  if (!onboardingDone) redirect('/onboarding')

  const { data: groupMembers } = await supabase
    .from('group_members')
    .select('group_id, display_name, groups(id, name, invite_code, festival_id, festivals(id, name, location, start_date, end_date))')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  const t = await getTranslations('dashboard')
  const tc = await getTranslations('common')
  const locale = await getLocale()

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8 pt-4">
        <div>
          <div className="inline-block bg-[#C8F135] px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest mb-1">
            {tc('app_name')}
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">{t('title')}</h1>
        </div>
      </div>

      <Link href="/festivals">
        <div className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white rounded-xl py-3 text-sm font-bold transition uppercase tracking-wide text-center mb-6">
          {t('discover')}
        </div>
      </Link>

      <div className="space-y-3">
        {(!groupMembers || groupMembers.length === 0) && (
          <div className="text-center py-16 text-[#999]">
            <p className="text-4xl mb-3">🎪</p>
            <p className="font-medium">{t('empty')}</p>
            <p className="text-sm mt-1">{t('empty_sub')}</p>
          </div>
        )}
        {groupMembers?.map((m: any) => {
          const group = m.groups
          const festival = group?.festivals
          if (!group || !festival) return null
          return (
            <Link key={group.id} href={`/festivals/${festival.id}/${group.id}`}>
              <div className="bg-white border border-[#E0D9CC] hover:border-[#1A1A1A] rounded-2xl p-4 transition cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-[#999] font-bold uppercase tracking-wide mb-0.5">{festival.name}</p>
                    <h2 className="font-black text-lg uppercase tracking-tight">{group.name}</h2>
                    {festival.location && <p className="text-[#666] text-sm">{festival.location}</p>}
                    {festival.start_date && (
                      <p className="text-[#999] text-xs mt-1">
                        {new Date(festival.start_date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                        {festival.end_date && ` → ${new Date(festival.end_date).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}`}
                      </p>
                    )}
                  </div>
                  <span className="text-xs bg-[#F5F0E8] text-[#666] px-2 py-1 rounded-lg font-mono border border-[#E0D9CC] flex-shrink-0">
                    {group.invite_code}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}