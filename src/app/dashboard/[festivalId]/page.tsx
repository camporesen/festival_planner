import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ArtistList from './ArtistList'
import FestivalHeader from './FestivalHeader'
import ProgrammaButton from './ProgrammaButton'

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

  if (!festival) redirect('/dashboard')

  const { data: members } = await supabase
    .from('festival_members')
    .select('user_id, display_name')
    .eq('festival_id', festivalId)

  console.log('members:', JSON.stringify(members))

  const { data: artists } = await supabase
    .from('artists')
    .select('*')
    .eq('festival_id', festivalId)
    .order('day', { ascending: true })
    .order('name', { ascending: true })

  const { data: ratings } = await supabase
    .from('ratings')
    .select('*')
    .eq('festival_id', festivalId)

  const { data: config } = await supabase
    .from('festival_config')
    .select('*')
    .eq('festival_id', festivalId)
    .single()

  return (
    <div className="min-h-screen max-w-3xl mx-auto p-4 pb-24">
      <FestivalHeader festival={festival} userId={user.id} />
      <ArtistList
        festivalId={festivalId}
        userId={user.id}
        artists={artists ?? []}
        ratings={ratings ?? []}
        members={members ?? []}
        config={config}
      />
      <ProgrammaButton
        artists={artists ?? []}
        ratings={ratings ?? []}
        members={members ?? []}
        config={config}
      />
    </div>
  )
}