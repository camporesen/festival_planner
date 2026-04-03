'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function GroupHeader({ festival, group, userId }: {
  festival: any
  group: any
  userId: string
}) {
  const [copied, setCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(group.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="py-4 mb-2">
      <Link href={`/festivals/${festival.id}`} className="text-sm text-[#666] hover:text-[#1A1A1A] transition mb-1 inline-block">
        ← {festival.name}
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight leading-none">{group.name}</h1>
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