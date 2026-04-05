import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const ADMIN_USER_ID = '39b2c8c8-6edf-4893-81ad-73e1a6240158'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || user.id !== ADMIN_USER_ID) redirect('/dashboard')

  // Analytics
  const [
    { count: totalUsers },
    { count: totalGroups },
    { count: totalRatings },
    { count: totalFestivals },
    { data: festivals },
    { data: topFestivals },
  ] = await Promise.all([
    supabase.from('group_members').select('*', { count: 'exact', head: true }),
    supabase.from('groups').select('*', { count: 'exact', head: true }),
    supabase.from('ratings').select('*', { count: 'exact', head: true }),
    supabase.from('festivals').select('*', { count: 'exact', head: true }),
    supabase.from('festivals').select('id, name, location, start_date, is_public, invite_code').order('created_at', { ascending: false }),
    supabase.from('groups').select('festival_id, festivals(name)').order('created_at', { ascending: false }),
  ])

  // Conta gruppi per festival
  const festivalGroupCount: Record<string, number> = {}
  topFestivals?.forEach((g: any) => {
    const fid = g.festival_id
    festivalGroupCount[fid] = (festivalGroupCount[fid] ?? 0) + 1
  })

  return (
    <div className="min-h-screen max-w-3xl mx-auto p-4 pb-24">
      <div className="pt-4 mb-6">
        <div className="inline-block bg-red-500 text-white px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest mb-1">
          Admin
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight">Dashboard</h1>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-[#E0D9CC] rounded-2xl p-4">
          <p className="text-3xl font-black">{totalUsers ?? 0}</p>
          <p className="text-xs text-[#666] font-bold uppercase tracking-wide mt-1">Utenti totali</p>
        </div>
        <div className="bg-white border border-[#E0D9CC] rounded-2xl p-4">
          <p className="text-3xl font-black">{totalGroups ?? 0}</p>
          <p className="text-xs text-[#666] font-bold uppercase tracking-wide mt-1">Gruppi creati</p>
        </div>
        <div className="bg-white border border-[#E0D9CC] rounded-2xl p-4">
          <p className="text-3xl font-black">{totalRatings ?? 0}</p>
          <p className="text-xs text-[#666] font-bold uppercase tracking-wide mt-1">Voti inseriti</p>
        </div>
        <div className="bg-white border border-[#E0D9CC] rounded-2xl p-4">
          <p className="text-3xl font-black">{totalFestivals ?? 0}</p>
          <p className="text-xs text-[#666] font-bold uppercase tracking-wide mt-1">Festival</p>
        </div>
      </div>

      {/* Festival */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black uppercase tracking-widest text-[#999]">Festival</p>
        <Link href="/admin/festival/new" className="text-xs bg-[#1A1A1A] text-white px-3 py-1.5 rounded-xl font-bold">
          + Nuovo
        </Link>
      </div>

      <div className="space-y-2 mb-6">
        {festivals?.map((f: any) => (
          <Link key={f.id} href={`/admin/festival/${f.id}`}>
            <div className="bg-white border border-[#E0D9CC] hover:border-[#1A1A1A] rounded-2xl p-4 transition cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-black uppercase tracking-tight">{f.name}</h2>
                  {f.location && <p className="text-xs text-[#666]">{f.location}</p>}
                  {f.start_date && (
                    <p className="text-xs text-[#999] mt-0.5">
                      {new Date(f.start_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${f.is_public ? 'bg-[#C8F135] text-[#1A1A1A]' : 'bg-[#F5F0E8] text-[#666]'}`}>
                    {f.is_public ? 'Pubblico' : 'Privato'}
                  </span>
                  <span className="text-[10px] text-[#999]">
                    {festivalGroupCount[f.id] ?? 0} gruppi
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}