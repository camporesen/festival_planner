'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/Toast'

export default function TogglePublicButton({ festivalId, isPublic }: { festivalId: string, isPublic: boolean }) {
  const [public_, setPublic] = useState(isPublic)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function toggle() {
    setLoading(true)
    const { error } = await supabase
      .from('festivals')
      .update({ is_public: !public_ })
      .eq('id', festivalId)
    if (error) {
      toast('Errore', 'error')
    } else {
      setPublic(!public_)
      toast(public_ ? 'Festival reso privato' : 'Festival reso pubblico', 'success')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white border border-[#E0D9CC] rounded-2xl p-4 flex items-center justify-between">
      <div>
        <p className="font-bold text-sm">Visibilità</p>
        <p className="text-xs text-[#666] mt-0.5">
          {public_ ? 'Visibile a tutti nella pagina Scopri' : 'Non visibile nella ricerca pubblica'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${public_ ? 'bg-[#C8F135] text-[#1A1A1A]' : 'bg-[#F5F0E8] text-[#666]'}`}>
          {public_ ? 'Pubblico' : 'Privato'}
        </span>
        <div
          onClick={loading ? undefined : toggle}
          className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${public_ ? 'bg-[#1A1A1A]' : 'bg-[#E0D9CC]'} ${loading ? 'opacity-50' : ''}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${public_ ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      </div>
    </div>
  )
}