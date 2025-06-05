import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = [
  '/login',
  '/signup',
  '/forgot-password',
  '/update-password',
  '/api/auth/forgot-password',
  '/api/auth/update-password',
  '/auth/callback',
  '/auth/v1',
  '/auth/v1/verify',
]

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const { data: { session } } = await supabase.auth.getSession()
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Allow access to public paths and API routes
  if (isPublicPath || request.nextUrl.pathname.startsWith('/api/')) {
    return res
  }

  // Redirect to login if not authenticated
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
