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
        <h1 className="text-2xl font-bold">🎪 I tuoi festival</h1>
        <LogoutButton />
      </div>

      <div className="flex gap-3 mb-6">
        <NewFestivalButton userId={user.id} userEmail={user.email!} />
        <JoinFestivalButton userId={user.id} userEmail={user.email!} />
      </div>

      <div className="space-y-3">
        {(!festivals || festivals.length === 0) && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🎵</p>
            <p>Nessun festival ancora.</p>
            <p className="text-sm mt-1">Creane uno o unisciti con un codice invite.</p>
          </div>
        )}
        {festivals?.map((m: any) => {
          const f = m.festivals
          if (!f) return null
          return (
            <Link key={f.id} href={`/dashboard/${f.id}`}>
              <div className="bg-gray-900 border border-gray-800 hover:border-indigo-600 rounded-2xl p-4 transition cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-lg">{f.name}</h2>
                    {f.location && <p className="text-gray-400 text-sm">{f.location}</p>}
                    {f.start_date && (
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(f.start_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {f.end_date && ` → ${new Date(f.end_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}`}
                      </p>
                    )}
                  </div>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-lg font-mono">{f.invite_code}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}