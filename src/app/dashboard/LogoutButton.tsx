'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  async function logout() {
    await createClient().auth.signOut()
    router.push('/login')
  }
  return (
    <button onClick={logout} className="text-sm text-[#666] hover:text-[#1A1A1A] transition font-medium">
      Esci
    </button>
  )
}