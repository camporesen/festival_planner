'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function FestivalHeader({ festival, userId }: { festival: any, userId: string }) {
  const [copied, setCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(festival.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="py-4 mb-4">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300 transition mb-3 inline-block">
        ← I tuoi festival
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{festival.name}</h1>
          {festival.location && <p className="text-gray-400 text-sm">{festival.location}</p>}
        </div>
        <button
          onClick={copyCode}
          className="flex-shrink-0 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-2 rounded-xl font-mono transition"
        >
          {copied ? '✓ Copiato!' : `🔗 ${festival.invite_code}`}
        </button>
      </div>
    </div>
  )
}