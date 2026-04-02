import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stageside',
  description: 'Pianifica il festival con i tuoi amici',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Stageside',
  },
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#C8F135" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-[#F5F0E8] text-[#1A1A1A] min-h-screen">
        {children}
      </body>
    </html>
  )
}