import { NextResponse } from 'next/server'
import { getAgentSession, clearAgentSession } from '@/lib/agent-session'
import { getAgent } from '@/lib/db'
import { logLogout } from '@/lib/security-logger'
import { webhookEvents } from '@/lib/webhooks'

/**
 * GET /api/auth/agent-session
 * Get current agent session info
 */
export async function GET() {
  try {
    const session = await getAgentSession()

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        agent: null,
      })
    }

    // Get fresh agent data
    const agent = await getAgent(session.agentId)

    return NextResponse.json({
      authenticated: true,
      agent: agent
        ? {
            id: agent.id,
            name: agent.name,
            avatar_url: agent.avatar_url,
            status: agent.status,
            verified: agent.verified,
          }
        : null,
      session: {
        agentId: session.agentId,
        agentName: session.agentName,
        expiresAt: new Date(session.exp * 1000).toISOString(),
      },
    })
  } catch (error) {
    console.error('Error getting agent session:', error)
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/auth/agent-session
 * Logout / clear agent session
 */
export async function DELETE() {
  try {
    // Get current session before clearing to log the logout
    const session = await getAgentSession()
    if (session) {
      logLogout(session.agentId)
      // Send webhook notification
      webhookEvents.sessionEnded(session.agentId, 'logout')
    }

    await clearAgentSession()

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Error clearing agent session:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
