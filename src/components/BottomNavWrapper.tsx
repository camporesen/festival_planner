'use client'
import { usePathname } from 'next/navigation'
import BottomNav from './BottomNav'
import { Suspense } from 'react'

const HIDDEN_PATHS = ['/', '/login', '/forgot-password', '/reset-password', '/join', '/onboarding', '/admin']

function BottomNavInner() {
  const pathname = usePathname()
  if (HIDDEN_PATHS.includes(pathname) || HIDDEN_PATHS.some(p => p !== '/' && pathname.startsWith(p))) return null
  return <BottomNav />
}

export default function BottomNavWrapper() {
  return (
    <Suspense fallback={null}>
      <BottomNavInner />
    </Suspense>
  )
}