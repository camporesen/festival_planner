import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CreateGroupButton from './CreateGroupButton'
import JoinGroupButton from './JoinGroupButton'
import { notFound } from 'next/navigation'

export default async function FestivalPage({ params }: { params: Promise<{ festivalId: string }> }) {
  const { festivalId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: festival } = await supabase
    .from('festivals')
    .select('*')
    .eq('id', festivalId)
    .single()

  if (!festival) notFound()

  // Gruppi del festival a cui appartiene l'utente
  const { data: myGroups } = await supabase
    .from('groups')
    .select('id, name, invite_code, created_by, group_members(count)')
    .eq('festival_id', festivalId)
    .in('id', (await supabase.from('group_members').select('group_id').eq('user_id', user.id)).data?.map(g => g.group_id) ?? [])

  const username = user.user_metadata?.username ?? user.email!.split('@')[0]

  return (
    <div className="min-h-screen max-w-2xl mx-auto p-4 pb-24">
      <div className="pt-4 mb-6">
        <Link href="/festivals" className="text-sm text-[#666] hover:text-[#1A1A1A] transition mb-3 inline-block">
          ← Tutti i festival
        </Link>
        <h1 className="text-3xl font-black uppercase tracking-tight leading-none">{festival.name}</h1>
        {festival.location && <p className="text-[#666] text-sm mt-1">{festival.location}</p>}
        {festival.start_date && (
          <p className="text-[#999] text-xs mt-1">
            {new Date(festival.start_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
            {festival.end_date && ` → ${new Date(festival.end_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}`}
          </p>
        )}
      </div>

      {/* I tuoi gruppi */}
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-widest text-[#999] mb-3">I tuoi gruppi</p>

        <div className="flex gap-3 mb-4">
          <CreateGroupButton festivalId={festivalId} userId={user.id} username={username} />
          <JoinGroupButton festivalId={festivalId} userId={user.id} username={username} />
        </div>

        <div className="space-y-3">
          {(!myGroups || myGroups.length === 0) && (
            <div className="text-center py-10 text-[#999] bg-white border border-dashed border-[#E0D9CC] rounded-2xl">
              <p className="font-medium">Non sei in nessun gruppo.</p>
              <p className="text-sm mt-1">Creane uno o unisciti con un codice.</p>
            </div>
          )}
          {myGroups?.map((g: any) => (
            <Link key={g.id} href={`/festivals/${festivalId}/${g.id}`}>
              <div className="bg-white border border-[#E0D9CC] hover:border-[#1A1A1A] rounded-2xl p-4 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-black uppercase tracking-tight">{g.name}</h2>
                    <p className="text-xs text-[#999] mt-0.5">
                      {g.group_members?.[0]?.count ?? 0} membri
                    </p>
                  </div>
                  <span className="text-xs bg-[#F5F0E8] text-[#666] px-2 py-1 rounded-lg font-mono border border-[#E0D9CC]">
                    {g.invite_code}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}