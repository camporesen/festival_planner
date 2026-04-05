import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ImportArtistsButton from './ImportArtistsButton'
import TogglePublicButton from './TogglePublicButton'

const ADMIN_USER_ID = '39b2c8c8-6edf-4893-81ad-73e1a6240158'

export default async function AdminFestivalPage({ params }: { params: Promise<{ festivalId: string }> }) {
  const { festivalId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_USER_ID) redirect('/dashboard')

  const { data: festival } = await supabase
    .from('festivals')
    .select('*')
    .eq('id', festivalId)
    .single()

  if (!festival) redirect('/admin')

  const [
    { count: artistCount },
    { count: groupCount },
    { count: ratingCount },
  ] = await Promise.all([
    supabase.from('artists').select('*', { count: 'exact', head: true }).eq('festival_id', festivalId),
    supabase.from('groups').select('*', { count: 'exact', head: true }).eq('festival_id', festivalId),
    supabase.from('ratings').select('*', { count: 'exact', head: true }),
  ])

  const { data: artists } = await supabase
    .from('artists')
    .select('id, name, day_label, stage, start_time, end_time')
    .eq('festival_id', festivalId)
    .order('day')
    .order('name')

  return (
    <div className="min-h-screen max-w-3xl mx-auto p-4 pb-24">
      <div className="pt-4 mb-6">
        <Link href="/admin" className="text-sm text-[#666] hover:text-[#1A1A1A] transition mb-3 inline-block">
          ← Admin
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">{festival.name}</h1>
            {festival.location && <p className="text-sm text-[#666]">{festival.location}</p>}
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${festival.is_public ? 'bg-[#C8F135] text-[#1A1A1A]' : 'bg-[#F5F0E8] text-[#666]'}`}>
            {festival.is_public ? 'Pubblico' : 'Privato'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-[#E0D9CC] rounded-2xl p-3 text-center">
          <p className="text-2xl font-black">{artistCount ?? 0}</p>
          <p className="text-[10px] text-[#666] font-bold uppercase tracking-wide mt-0.5">Artisti</p>
        </div>
        <div className="bg-white border border-[#E0D9CC] rounded-2xl p-3 text-center">
          <p className="text-2xl font-black">{groupCount ?? 0}</p>
          <p className="text-[10px] text-[#666] font-bold uppercase tracking-wide mt-0.5">Gruppi</p>
        </div>
        <div className="bg-white border border-[#E0D9CC] rounded-2xl p-3 text-center">
          <p className="text-2xl font-black">{ratingCount ?? 0}</p>
          <p className="text-[10px] text-[#666] font-bold uppercase tracking-wide mt-0.5">Voti</p>
        </div>
      </div>

      <div className="mb-6">
        <TogglePublicButton festivalId={festivalId} isPublic={festival.is_public} />
      </div>

      {/* Import artisti */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black uppercase tracking-widest text-[#999]">Artisti ({artistCount ?? 0})</p>
        <ImportArtistsButton festivalId={festivalId} />
      </div>

      {/* Lista artisti */}
      <div className="space-y-1.5">
        {artists?.map(a => (
          <div key={a.id} className="bg-white border border-[#E0D9CC] rounded-xl px-4 py-2.5 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">{a.name}</p>
              {a.day_label && <p className="text-xs text-[#666]">{a.day_label}</p>}
            </div>
            <div className="text-right">
              {a.stage && <p className="text-xs text-[#666]">{a.stage}</p>}
              {a.start_time && <p className="text-xs text-[#999]">{a.start_time.slice(0,5)} – {a.end_time?.slice(0,5)}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}