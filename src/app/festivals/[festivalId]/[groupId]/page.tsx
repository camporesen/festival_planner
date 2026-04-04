import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ArtistList from '@/components/ArtistList'
import GroupHeader from './GroupHeader'

export const revalidate = 0

export default async function GroupPage({ params }: { params: Promise<{ festivalId: string, groupId: string }> }) {
  const { festivalId, groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const [
  { data: festival },
  { data: group },
  { data: members },
  { data: artists },
  { data: ratings },
  { data: config },
  { data: plans }
] = await Promise.all([
  supabase.from('festivals').select('*').eq('id', festivalId).single(),
  supabase.from('groups').select('*').eq('id', groupId).single(),
  supabase.from('group_members').select('user_id, display_name').eq('group_id', groupId),
  supabase.from('artists').select('*').eq('festival_id', festivalId).order('day').order('name'),
  supabase.from('ratings').select('*').eq('group_id', groupId),
  supabase.from('group_config').select('*').eq('group_id', groupId).single(),
  supabase.from('plans').select('artist_id, user_id').eq('group_id', groupId),
])

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