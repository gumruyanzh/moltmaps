import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { getAgentSessionInvalidationTime } from './db'

const AGENT_SESSION_SECRET = process.env.AGENT_SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'default-agent-secret'

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

/**
 * Extract agent session from cookies
 * Returns agent ID if session is valid, null otherwise
 */
export async function extractAgentFromSession(request: NextRequest): Promise<{
  agentId: string
  agentName: string
} | null> {
  try {
    // Get the agent-session cookie
    const sessionCookie = request.cookies.get('agent-session')
    if (!sessionCookie?.value) {
      return null
    }

    // Verify the JWT
    const secret = new TextEncoder().encode(AGENT_SESSION_SECRET)
    const { payload } = await jwtVerify(sessionCookie.value, secret)

    // Validate payload structure
    if (
      typeof payload.agentId !== 'string' ||
      typeof payload.agentName !== 'string' ||
      payload.type !== 'agent'
    ) {
      return null
    }

    // Check if sessions have been invalidated
    const invalidatedAt = await getAgentSessionInvalidationTime(payload.agentId)
    if (invalidatedAt && payload.iat) {
      const invalidatedTime = new Date(invalidatedAt).getTime() / 1000
      if (payload.iat < invalidatedTime) {
        return null
      }
    }

    return {
      agentId: payload.agentId,
      agentName: payload.agentName,
    }
  } catch {
    return null
  }
}

/**
 * Authenticate an agent request using either:
 * 1. Verification token (for bot API calls)
 * 2. Session cookie (for browser-based requests)
 *
 * Returns the agent ID if authenticated, null otherwise
 */
export async function authenticateAgentRequest(
  request: NextRequest,
  agentId: string,
  agentVerificationToken: string | null,
  body?: Record<string, unknown>
): Promise<{ authenticated: boolean; method: 'token' | 'session' | null }> {
  // First try verification token
  const providedToken = extractToken(request, body)
  if (validateToken(providedToken, agentVerificationToken)) {
    return { authenticated: true, method: 'token' }
  }

  // Then try session cookie
  const sessionAgent = await extractAgentFromSession(request)
  if (sessionAgent && sessionAgent.agentId === agentId) {
    return { authenticated: true, method: 'session' }
  }

  return { authenticated: false, method: null }
}
