'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname.startsWith(path)

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0D9CC] z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around max-w-lg mx-auto">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 py-3 px-6 transition ${isActive('/dashboard') ? 'text-[#1A1A1A]' : 'text-[#999] hover:text-[#1A1A1A]'}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span className="text-[10px] font-black uppercase tracking-wide">Gruppi</span>
          {isActive('/dashboard') && <div className="absolute bottom-0 w-8 h-0.5 bg-[#C8F135] rounded-full" />}
        </Link>

        <Link
          href="/festivals"
          className={`flex flex-col items-center gap-1 py-3 px-6 transition ${isActive('/festivals') ? 'text-[#1A1A1A]' : 'text-[#999] hover:text-[#1A1A1A]'}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span className="text-[10px] font-black uppercase tracking-wide">Scopri</span>
          {isActive('/festivals') && <div className="absolute bottom-0 w-8 h-0.5 bg-[#C8F135] rounded-full" />}
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 py-3 px-6 transition ${isActive('/profile') ? 'text-[#1A1A1A]' : 'text-[#999] hover:text-[#1A1A1A]'}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span className="text-[10px] font-black uppercase tracking-wide">Profilo</span>
          {isActive('/profile') && <div className="absolute bottom-0 w-8 h-0.5 bg-[#C8F135] rounded-full" />}
        </Link>
      </div>
    </nav>
  )
}
