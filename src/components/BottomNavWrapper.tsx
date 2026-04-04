'use client'
import { usePathname } from 'next/navigation'
import BottomNav from './BottomNav'

const HIDDEN_PATHS = ['/', '/login', '/forgot-password', '/reset-password', '/join']

export default function BottomNavWrapper() {
  const pathname = usePathname()
  const hide = HIDDEN_PATHS.some(p => pathname.startsWith(p))
  if (hide) return null
  return <BottomNav />
}