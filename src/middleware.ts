import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Gestisci le rotte API separatamente
  if (pathname.startsWith('/api') || pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // Applica il middleware i18n
  const response = intlMiddleware(request)

  // Controlla autenticazione
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const protectedPaths = ['/dashboard', '/festivals', '/profile', '/onboarding']
  const isProtected = protectedPaths.some(p => pathname.includes(p))

  if (!user && isProtected) {
    const loginUrl = new URL(`/${request.nextUrl.locale ?? 'it'}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)']
}