'use client'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LANGUAGES = [
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function changeLocale(newLocale: string) {
    // Salva la preferenza nel profilo utente
    await supabase.auth.updateUser({
      data: { preferred_locale: newLocale }
    })

    // Cambia il locale nell'URL
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
    router.refresh()
  }

  return (
    <div>
      <p className="font-bold text-sm mb-3">Lingua</p>
      <div className="flex gap-2">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => changeLocale(lang.code)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border transition ${
              locale === lang.code
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#666] border-[#E0D9CC] hover:border-[#1A1A1A]'
            }`}
          >
            <span>{lang.flag}</span>
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  )
}