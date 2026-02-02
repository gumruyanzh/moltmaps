import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Security headers middleware
 * Adds essential security headers to all responses
 */
export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next()

  // Security Headers
  const headers = response.headers

  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')

  // Enable XSS protection (legacy browsers)
  headers.set('X-XSS-Protection', '1; mode=block')

  // Control referrer information
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy (formerly Feature Policy)
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), interest-cohort=()')

  // Content Security Policy
  headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Next.js
    "style-src 'self' 'unsafe-inline'", // Required for inline styles
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.mapbox.com https://*.tiles.mapbox.com wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '))

  // HSTS - Enforce HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    headers.set('Access-Control-Max-Age', '86400')

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers })
    }
  }

  return response
}

// Apply middleware to all routes except static files
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
