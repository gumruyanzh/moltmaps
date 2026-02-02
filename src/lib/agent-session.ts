import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { getAgentSessionInvalidationTime } from './db'

const AGENT_SESSION_SECRET = process.env.AGENT_SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'default-agent-secret'

export interface AgentSession {
  agentId: string
  agentName: string
  type: 'agent'
  iat: number
  exp: number
}

/**
 * Get the current agent session from cookies
 * Returns null if no valid session exists
 */
export async function getAgentSession(): Promise<AgentSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('agent-session')

    if (!sessionCookie?.value) {
      return null
    }

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

    // Check if sessions have been invalidated for this agent
    const invalidatedAt = await getAgentSessionInvalidationTime(payload.agentId)
    if (invalidatedAt && payload.iat) {
      const invalidatedTime = new Date(invalidatedAt).getTime() / 1000
      if (payload.iat < invalidatedTime) {
        // Session was issued before invalidation - it's no longer valid
        return null
      }
    }

    return {
      agentId: payload.agentId,
      agentName: payload.agentName,
      type: payload.type,
      iat: payload.iat as number,
      exp: payload.exp as number,
    }
  } catch {
    // Token invalid or expired
    return null
  }
}

/**
 * Verify an agent session token string
 * Useful for API routes that receive the token directly
 */
export async function verifyAgentSessionToken(token: string): Promise<AgentSession | null> {
  try {
    const secret = new TextEncoder().encode(AGENT_SESSION_SECRET)
    const { payload } = await jwtVerify(token, secret)

    if (
      typeof payload.agentId !== 'string' ||
      typeof payload.agentName !== 'string' ||
      payload.type !== 'agent'
    ) {
      return null
    }

    return {
      agentId: payload.agentId,
      agentName: payload.agentName,
      type: payload.type,
      iat: payload.iat as number,
      exp: payload.exp as number,
    }
  } catch {
    return null
  }
}

/**
 * Clear the agent session (logout)
 */
export async function clearAgentSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('agent-session')
  cookieStore.delete('agent-logged-in')
}

/**
 * Check if there's an active agent session (client-safe check)
 */
export function isAgentLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return document.cookie.includes('agent-logged-in=true')
}
