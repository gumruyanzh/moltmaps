import { NextRequest, NextResponse } from 'next/server'
import { validateAndConsumeLoginToken, getAgent } from '@/lib/db'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'
import { checkRateLimit, getClientIP } from '@/lib/rate-limiter'
import { logLoginSuccess, logLoginFailed } from '@/lib/security-logger'
import { webhookEvents } from '@/lib/webhooks'

const AGENT_SESSION_SECRET = process.env.AGENT_SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'default-agent-secret'
const AGENT_SESSION_DURATION = 7 * 24 * 60 * 60 // 7 days in seconds

/**
 * POST /api/auth/agent-login
 * Validate a login token and create an agent session
 */
export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || undefined

  try {
    // Rate limit: 20 attempts per minute per IP
    const rateLimitResult = checkRateLimit(`agent-login:${ip}`, 20, 60000)
    if (!rateLimitResult.allowed) {
      logLoginFailed('rate_limit', undefined, ip)
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait a moment.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { token, agentId } = body

    if (!token || !agentId) {
      return NextResponse.json(
        { error: 'Missing token or agentId' },
        { status: 400 }
      )
    }

    // Validate and consume the token
    const result = await validateAndConsumeLoginToken(token)

    if (!result.valid) {
      // Log the specific failure reason
      if (result.error?.includes('expired')) {
        logLoginFailed('expired', agentId, ip)
      } else if (result.error?.includes('used')) {
        logLoginFailed('already_used', agentId, ip)
      } else {
        logLoginFailed('invalid', agentId, ip)
      }

      return NextResponse.json(
        { error: result.error || 'Invalid token' },
        { status: 401 }
      )
    }

    // Verify the agentId matches
    if (result.agent_id !== agentId) {
      logLoginFailed('invalid', agentId, ip)
      return NextResponse.json(
        { error: 'Token does not match agent' },
        { status: 401 }
      )
    }

    // Get agent details
    const agent = await getAgent(agentId)
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Create agent session JWT
    const secret = new TextEncoder().encode(AGENT_SESSION_SECRET)
    const sessionToken = await new SignJWT({
      agentId: agent.id,
      agentName: agent.name,
      type: 'agent',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${AGENT_SESSION_DURATION}s`)
      .sign(secret)

    // Set the session cookie
    const cookieStore = await cookies()
    cookieStore.set('agent-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AGENT_SESSION_DURATION,
      path: '/',
    })

    // Also set a non-httpOnly cookie for client-side awareness
    cookieStore.set('agent-logged-in', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AGENT_SESSION_DURATION,
      path: '/',
    })

    // Log successful login
    logLoginSuccess(agent.id, ip, userAgent)

    // Send webhook notification to the agent
    webhookEvents.loginUrlUsed(agent.id, ip, userAgent)
    webhookEvents.sessionStarted(agent.id, new Date(Date.now() + AGENT_SESSION_DURATION * 1000).toISOString())

    return NextResponse.json({
      success: true,
      agent_id: agent.id,
      agent_name: agent.name,
      message: 'Login successful',
    })
  } catch (error) {
    console.error('Agent login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
