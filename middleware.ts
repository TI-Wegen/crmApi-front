import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/chat']
const publicRoutes = ['/', '/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get('crm_token')?.value

  const isAuthenticated = !!token

  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/chat', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (publicRoutes.includes(pathname) && isAuthenticated && pathname !== '/login') {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  if (!protectedRoutes.some(route => pathname.startsWith(route)) &&
      !publicRoutes.includes(pathname)) {
    return new NextResponse('Page Not Found', { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
