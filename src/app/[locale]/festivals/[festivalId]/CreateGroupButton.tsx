'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/Toast'
import { useTranslations } from 'next-intl'

export default function CreateGroupButton({ festivalId, userId, username }: {
  festivalId: string
  userId: string
  username: string
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('group')
  const tc = useTranslations('common')

  async function create() {
    if (!name.trim()) return
    setLoading(true)
    const { data: group, error } = await supabase
      .from('groups')
      .insert({ festival_id: festivalId, name: name.trim(), created_by: userId })
      .select()
      .single()
    if (error) { toast(tc('error'), 'error'); setLoading(false); return }
    if (group) {
      await supabase.from('group_members').insert({
        group_id: group.id,
        user_id: userId,
        display_name: username,
      })
      await supabase.from('group_config').insert({ group_id: group.id })
      toast(t('create_title'), 'success')
      router.push(`/festivals/${festivalId}/${group.id}`)
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 bg-[#1A1A1A] hover:bg-[#333] text-white rounded-xl py-2.5 text-sm font-bold transition uppercase tracking-wide"
      >
        {t('create')}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-[#E0D9CC] shadow-lg">
            <h2 className="font-black text-xl uppercase tracking-tight mb-4">{t('create_title')}</h2>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="es. Nicola & Gimbo"
              className="w-full bg-[#F5F0E8] border border-[#E0D9CC] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1A1A]"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="flex-1 bg-[#F5F0E8] border border-[#E0D9CC] rounded-xl py-2.5 text-sm font-semibold">
                {tc('cancel')}
              </button>
              <button onClick={create} disabled={loading || !name.trim()} className="flex-1 bg-[#1A1A1A] text-white disabled:opacity-40 rounded-xl py-2.5 text-sm font-bold transition">
                {loading ? '...' : tc('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}