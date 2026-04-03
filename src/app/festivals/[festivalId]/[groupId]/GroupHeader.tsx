'use client'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GroupHeader({ festival, group, userId }: {
  festival: any
  group: any
  userId: string
}) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(group.name)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  function copyCode() {
    navigator.clipboard.writeText(group.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function saveName() {
    if (!name.trim() || name === group.name) { setEditing(false); return }
    setSaving(true)
    await supabase.from('groups').update({ name: name.trim() }).eq('id', group.id)
    setSaving(false)
    setEditing(false)
  }

  const isCreator = group.created_by === userId

  return (
    <div className="py-4 mb-2">
      <Link href={`/festivals/${festival.id}`} className="text-sm text-[#666] hover:text-[#1A1A1A] transition mb-1 inline-block">
        ← {festival.name}
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditing(false) }}
                autoFocus
                className="text-2xl font-black uppercase tracking-tight leading-none bg-transparent border-b-2 border-[#1A1A1A] focus:outline-none w-full"
              />
              <button onClick={saveName} disabled={saving} className="text-xs bg-[#1A1A1A] text-white px-3 py-1.5 rounded-lg font-bold flex-shrink-0">
                {saving ? '...' : 'Salva'}
              </button>
              <button onClick={() => { setEditing(false); setName(group.name) }} className="text-xs text-[#666] px-2 py-1.5 flex-shrink-0">
                Annulla
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black uppercase tracking-tight leading-none">{name}</h1>
              {isCreator && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-[#999] hover:text-[#1A1A1A] transition flex-shrink-0"
                  title="Rinomina gruppo"
                >
                  ✏️
                </button>
              )}
            </div>
          )}
          <p className="text-[#666] text-sm mt-1">{festival.name} · {festival.location}</p>
        </div>
        <button
          onClick={copyCode}
          className="flex-shrink-0 text-xs bg-[#C8F135] hover:bg-[#b8e020] px-3 py-2 rounded-xl font-mono font-bold transition"
        >
          {copied ? '✓ Copiato!' : `🔗 ${group.invite_code}`}
        </button>
      </div>
    </div>
  )
}