import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import '../globals.css'
import BottomNavWrapper from '@/components/BottomNavWrapper'
import { ToastContainer } from '@/components/Toast'

export const metadata: Metadata = {
  title: 'Stageside',
  description: 'Plan the festival with your friends',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Stageside',
  },
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#C8F135" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-[#F5F0E8] text-[#1A1A1A] min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <ToastContainer />
          {children}
          <BottomNavWrapper />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}