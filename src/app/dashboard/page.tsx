import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import NewFestivalButton from './NewFestivalButton'
import JoinFestivalButton from './JoinFestivalButton'
import LogoutButton from './LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: festivals } = await supabase
    .from('festival_members')
    .select('festival_id, display_name, festivals(id, name, location, start_date, end_date, invite_code, created_by)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8 pt-4">
        <div>
          <div className="inline-block bg-[#C8F135] px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest mb-1">
            Festival Planner
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">I tuoi festival</h1>
        </div>
        <LogoutButton />
      </div>

      <div className="flex gap-3 mb-6">
        <NewFestivalButton userId={user.id} userEmail={user.email!} />
        <JoinFestivalButton userId={user.id} userEmail={user.email!} />
      </div>

      <div className="space-y-3">
        {(!festivals || festivals.length === 0) && (
          <div className="text-center py-16 text-[#999]">
            <p className="text-4xl mb-3">🎵</p>
            <p className="font-medium">Nessun festival ancora.</p>
            <p className="text-sm mt-1">Creane uno o unisciti con un codice invite.</p>
          </div>
        )}
        {festivals?.map((m: any) => {
          const f = m.festivals
          if (!f) return null
          return (
            <Link key={f.id} href={`/dashboard/${f.id}`}>
              <div className="bg-white border border-[#E0D9CC] hover:border-[#1A1A1A] rounded-2xl p-4 transition cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-black text-lg uppercase tracking-tight">{f.name}</h2>
                    {f.location && <p className="text-[#666] text-sm">{f.location}</p>}
                    {f.start_date && (
                      <p className="text-[#999] text-xs mt-1">
                        {new Date(f.start_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {f.end_date && ` → ${new Date(f.end_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}`}
                      </p>
                    )}
                  </div>
                  <span className="text-xs bg-[#F5F0E8] text-[#666] px-2 py-1 rounded-lg font-mono border border-[#E0D9CC]">
                    {f.invite_code}
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