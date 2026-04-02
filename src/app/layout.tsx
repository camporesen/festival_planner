import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Festival Planner',
  description: 'Pianifica il festival con i tuoi amici',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-[#F5F0E8] text-[#1A1A1A] min-h-screen">
        {children}
      </body>
    </html>
  )
}