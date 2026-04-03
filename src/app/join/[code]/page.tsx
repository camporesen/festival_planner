import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Se non loggato, manda al login con redirect dopo
  if (!user) {
    redirect(`/login?next=/join/${code}`)
  }

  // Trova il gruppo
  const { data: group } = await supabase
    .from('groups')
    .select('id, festival_id, name')
    .eq('invite_code', code.toLowerCase())
    .single()

  if (!group) redirect('/dashboard?error=invalid_code')

  // Recupera username dell'utente
  const username = user.user_metadata?.username ?? user.email!.split('@')[0]

  // Aggiungi l'utente al gruppo
  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: user.id,
    display_name: username,
  })

  // Redirect alla pagina del gruppo
  redirect(`/festivals/${group.festival_id}/${group.id}`)
}