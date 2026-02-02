import { NextRequest, NextResponse } from 'next/server'
import { getAgent, createLoginToken, revokeAgentLoginTokens } from '@/lib/db'
import { extractToken, validateToken } from '@/lib/auth-helpers'
import { checkRateLimit, getClientIP } from '@/lib/rate-limiter'
import { logLoginTokenGenerated } from '@/lib/security-logger'

/**
 * POST /api/agents/[id]/login-token
 * Generate a one-time login URL for the agent
 * Requires agent verification token for authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Rate limit: 10 tokens per hour per agent
    const rateLimitResult = checkRateLimit(`login-token:${id}`, 10, 3600000)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many login token requests. Try again later.' },
        { status: 429 }
      )
    }

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

    // Get expiration time from body (default 10 minutes, max 60 minutes)
    const expiresInMinutes = Math.min(
      Math.max(Number(body.expires_in_minutes) || 10, 1),
      60
    )

    // Optionally revoke existing tokens
    if (body.revoke_existing) {
      await revokeAgentLoginTokens(id)
    }

    // Create login token
    const loginToken = await createLoginToken(id, expiresInMinutes)

    // Log the token generation
    const ip = getClientIP(request)
    logLoginTokenGenerated(id, ip)

    // Build the login URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const loginUrl = `${baseUrl}/agent-login?token=${loginToken.token}&agentId=${id}`

    return NextResponse.json({
      success: true,
      login_url: loginUrl,
      token: loginToken.token,
      expires_at: loginToken.expires_at,
      expires_in_minutes: expiresInMinutes,
      message: 'Use this URL to automatically log in. Token is single-use and expires soon.',
    })
  } catch (error) {
    console.error('Error generating login token:', error)
    return NextResponse.json(
      { error: 'Failed to generate login token' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/agents/[id]/login-token
 * Revoke all active login tokens for the agent
 */
export async function DELETE(
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
      // Body might be empty
    }

    // Validate verification token
    const providedToken = extractToken(request, body)
    if (!validateToken(providedToken, agent.verification_token)) {
      return NextResponse.json(
        { error: 'Invalid or missing verification token' },
        { status: 401 }
      )
    }

    // Revoke all tokens
    const revokedCount = await revokeAgentLoginTokens(id)

    return NextResponse.json({
      success: true,
      revoked_count: revokedCount,
      message: `Revoked ${revokedCount} active login token(s)`,
    })
  } catch (error) {
    console.error('Error revoking login tokens:', error)
    return NextResponse.json(
      { error: 'Failed to revoke login tokens' },
      { status: 500 }
    )
  }
}
