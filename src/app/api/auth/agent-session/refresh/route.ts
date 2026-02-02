import { NextResponse } from 'next/server'
import { getAgentSession } from '@/lib/agent-session'
import { getAgent } from '@/lib/db'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

const AGENT_SESSION_SECRET = process.env.AGENT_SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'default-agent-secret'
const AGENT_SESSION_DURATION = 7 * 24 * 60 * 60 // 7 days in seconds

/**
 * POST /api/auth/agent-session/refresh
 * Extend the current agent session without requiring a new login URL
 */
export async function POST() {
  try {
    // Get current session
    const session = await getAgentSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No active session to refresh' },
        { status: 401 }
      )
    }

    // Verify the agent still exists
    const agent = await getAgent(session.agentId)
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Create a new session token with extended expiration
    const secret = new TextEncoder().encode(AGENT_SESSION_SECRET)
    const newExpiresAt = new Date(Date.now() + AGENT_SESSION_DURATION * 1000)

    const sessionToken = await new SignJWT({
      agentId: agent.id,
      agentName: agent.name,
      type: 'agent',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${AGENT_SESSION_DURATION}s`)
      .sign(secret)

    // Update the session cookie
    const cookieStore = await cookies()
    cookieStore.set('agent-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AGENT_SESSION_DURATION,
      path: '/',
    })

    // Also update the non-httpOnly indicator cookie
    cookieStore.set('agent-logged-in', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AGENT_SESSION_DURATION,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      expires_at: newExpiresAt.toISOString(),
      message: 'Session refreshed successfully',
    })
  } catch (error) {
    console.error('Error refreshing session:', error)
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    )
  }
}
