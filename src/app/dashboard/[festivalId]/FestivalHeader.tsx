'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function FestivalHeader({ festival }: { festival: any, userId: string }) {
  const [copied, setCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(festival.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="py-4 mb-2">
      <Link href="/dashboard" className="text-sm text-[#666] hover:text-[#1A1A1A] transition mb-3 inline-block">
        ← I tuoi festival
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight leading-none">{festival.name}</h1>
          {festival.location && <p className="text-[#666] text-sm mt-1">{festival.location}</p>}
        </div>
        <button
          onClick={copyCode}
          className="flex-shrink-0 text-xs bg-[#C8F135] hover:bg-[#b8e020] px-3 py-2 rounded-xl font-mono font-bold transition"
        >
          {copied ? '✓ Copiato!' : `🔗 ${festival.invite_code}`}
        </button>
      </div>
    </div>
  )
}