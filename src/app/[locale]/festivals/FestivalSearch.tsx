'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

type Festival = {
  id: string
  name: string
  location: string | null
  start_date: string | null
  end_date: string | null
  slug: string | null
  is_public: boolean
}

export default function FestivalSearch({ festivals }: { festivals: Festival[] }) {
  const [query, setQuery] = useState('')
  const t = useTranslations('festivals')
  const locale = useLocale()

  const filtered = festivals.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase()) ||
    f.location?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={t('search_placeholder')}
        className="w-full bg-white border border-[#E0D9CC] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A1A1A] mb-4"
        autoFocus
      />
      <div className="space-y-3">
        {filtered.length === 0 && query && (
          <div className="text-center py-12 text-[#999]">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-medium">{t('empty')}</p>
            <p className="text-sm mt-1">{t('empty_sub')}</p>
          </div>
        )}
        {filtered.map(f => (
          <Link key={f.id} href={`/festivals/${f.id}`}>
            <div className="bg-white border border-[#E0D9CC] hover:border-[#1A1A1A] rounded-2xl p-4 transition cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-black text-lg uppercase tracking-tight">{f.name}</h2>
                  {f.location && <p className="text-[#666] text-sm">{f.location}</p>}
                  {f.start_date && (
                    <p className="text-[#999] text-xs mt-1">
                      {new Date(f.start_date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                      {f.end_date && ` → ${new Date(f.end_date).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}`}
                    </p>
                  )}
                </div>
                <span className="text-xs bg-[#C8F135] text-[#1A1A1A] px-2 py-1 rounded-lg font-bold">
                  {t('public_badge')}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}