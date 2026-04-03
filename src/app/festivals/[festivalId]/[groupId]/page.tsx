import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ArtistList from '@/components/ArtistList'
import GroupHeader from './GroupHeader'

export default async function GroupPage({ params }: { params: Promise<{ festivalId: string, groupId: string }> }) {
  const { festivalId, groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

    const { data: plans } = await supabase
  .from('plans')
  .select('artist_id, user_id')
  .eq('group_id', groupId)

  const { data: festival } = await supabase
    .from('festivals')
    .select('*')
    .eq('id', festivalId)
    .single()

  if (!festival) redirect('/festivals')

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (!group) redirect(`/festivals/${festivalId}`)

  const { data: members } = await supabase
    .from('group_members')
    .select('user_id, display_name')
    .eq('group_id', groupId)

  const { data: artists } = await supabase
    .from('artists')
    .select('*')
    .eq('festival_id', festivalId)
    .order('day', { ascending: true })
    .order('name', { ascending: true })

  const { data: ratings } = await supabase
    .from('ratings')
    .select('*')
    .eq('group_id', groupId)

  const { data: config } = await supabase
    .from('group_config')
    .select('*')
    .eq('group_id', groupId)
    .single()

  return (
    <div className="min-h-screen max-w-3xl mx-auto p-4 pb-24">
      <GroupHeader festival={festival} group={group} userId={user.id} />
      <ArtistList
  festivalId={festivalId}
  groupId={groupId}
  userId={user.id}
  artists={artists ?? []}
  ratings={ratings ?? []}
  members={members ?? []}
  config={config}
  plans={plans ?? []}
/>
    </div>
  )
}