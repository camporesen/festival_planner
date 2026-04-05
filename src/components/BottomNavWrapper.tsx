'use client'
import { usePathname } from 'next/navigation'
import BottomNav from './BottomNav'
import { Suspense } from 'react'

const HIDDEN_SEGMENTS = ['login', 'forgot-password', 'reset-password', 'join', 'onboarding']

function BottomNavInner() {
  const pathname = usePathname()
  // Rimuovi il locale dall'inizio del path (es. /it/login → /login)
  const segments = pathname.split('/').filter(Boolean)
  // segments[0] è il locale, segments[1] è la pagina
  const isRoot = segments.length <= 1
  const pageSegment = segments[1] ?? ''
  
  if (isRoot || HIDDEN_SEGMENTS.includes(pageSegment)) return null
  return <BottomNav />
}

export default function BottomNavWrapper() {
  return (
    <Suspense fallback={null}>
      <BottomNavInner />
    </Suspense>
  )
}