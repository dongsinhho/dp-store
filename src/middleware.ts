import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PB_AUTH_COOKIE = "pb_auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect admin routes (except login page)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const authCookie = request.cookies.get(PB_AUTH_COOKIE)

    if (!authCookie?.value) {
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(authCookie.value))

      // Check if token exists and user has admin role
      if (!parsed.token || !parsed.model || parsed.model.role !== "admin") {
        const loginUrl = new URL("/admin/login", request.url)
        return NextResponse.redirect(loginUrl)
      }
    } catch {
      // Invalid cookie data, redirect to login
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
