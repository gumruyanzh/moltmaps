import { NextRequest } from 'next/server'

/**
 * Extract verification token from request
 * Supports multiple methods for agent convenience:
 * 1. Authorization: Bearer <token> header (preferred)
 * 2. token in request body
 * 3. token in query params
 */
export function extractToken(request: NextRequest, body?: Record<string, unknown>): string | null {
  // 1. Check Authorization header first (preferred method)
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // 2. Check request body
  if (body?.token && typeof body.token === 'string') {
    return body.token
  }

  // 3. Check query params
  const tokenParam = request.nextUrl.searchParams.get('token')
  if (tokenParam) {
    return tokenParam
  }

  return null
}

/**
 * Validate that a token matches an agent's verification token
 */
export function validateToken(providedToken: string | null, agentToken: string | null): boolean {
  return !!providedToken && !!agentToken && providedToken === agentToken
}
