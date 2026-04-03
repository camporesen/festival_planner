import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FestivalSearch from './FestivalSearch'

export default async function FestivalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: festivals } = await supabase
    .from('festivals')
    .select('id, name, location, start_date, end_date, slug, is_public')
    .eq('is_public', true)
    .order('start_date', { ascending: true })

  return (
    <div className="min-h-screen max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-8 pt-4">
        <div>
          <div className="inline-block bg-[#C8F135] px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest mb-1">
            Stageside
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Trova un festival</h1>
        </div>
        <Link href="/dashboard" className="text-sm text-[#666] hover:text-[#1A1A1A] transition font-medium">
          I tuoi gruppi
        </Link>
      </div>

      <FestivalSearch festivals={festivals ?? []} />
    </div>
  )
}