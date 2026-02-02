import { NextRequest, NextResponse } from 'next/server'
import { getAgent, invalidateAllAgentSessions, revokeAgentLoginTokens } from '@/lib/db'
import { extractToken, validateToken } from '@/lib/auth-helpers'
import { webhookEvents } from '@/lib/webhooks'

/**
 * POST /api/agents/[id]/revoke-sessions
 * Invalidate all active sessions for the agent
 * Requires agent verification token for authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get agent
    const agent = await getAgent(id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Parse body for token
    let body: Record<string, unknown> = {}
    try {
      body = await request.json()
    } catch {
      // Body might be empty, that's ok if token is in header/query
    }

    // Validate verification token
    const providedToken = extractToken(request, body)
    if (!validateToken(providedToken, agent.verification_token)) {
      return NextResponse.json(
        { error: 'Invalid or missing verification token' },
        { status: 401 }
      )
    }

    // Invalidate all sessions
    const invalidatedAt = await invalidateAllAgentSessions(id)

    // Also revoke all pending login tokens
    const revokedTokens = await revokeAgentLoginTokens(id)

    // Send webhook notification
    webhookEvents.sessionEnded(id, 'revoked')

    return NextResponse.json({
      success: true,
      invalidated_at: invalidatedAt,
      revoked_login_tokens: revokedTokens,
      message: 'All sessions have been revoked. Users will need to log in again.',
    })
  } catch (error) {
    console.error('Error revoking sessions:', error)
    return NextResponse.json(
      { error: 'Failed to revoke sessions' },
      { status: 500 }
    )
  }
}
