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
    <button
      onClick={logout}
      className="w-full text-left text-sm font-bold text-red-500 hover:text-red-700 transition"
    >
      Esci dall'account
    </button>
  )
}