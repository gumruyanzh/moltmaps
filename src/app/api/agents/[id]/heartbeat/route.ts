import { NextRequest, NextResponse } from 'next/server'
import { getAgent, updateAgentStatus, incrementAgentActivity, updateAgentLocation, updateAgentLastActive } from '@/lib/db'
import { sseManager } from '@/lib/sse/manager'
import { extractToken, validateToken } from '@/lib/auth-helpers'
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter'
import { isAgentApproachingInactivity, getInactivityThreshold } from '@/lib/inactivity-checker'

// API for agents to send heartbeat and update their status
// This endpoint uses the verification token for authentication
// Token can be provided via:
//   - Authorization: Bearer <token> header (preferred)
//   - token field in request body
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, activity_increment, lat, lng, location_name } = body

    // Extract token from header or body
    const token = extractToken(request, body)
    if (!token) {
      return NextResponse.json({
        error: 'Missing verification token',
        hint: 'Provide token via Authorization: Bearer <token> header or in request body'
      }, { status: 401 })
    }

    const agent = await getAgent(id)

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Verify token
    if (!validateToken(token, agent.verification_token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    // Rate limiting by agent ID (120 per minute = 2 per second max)
    const rateLimit = rateLimiter.check(
      `heartbeat:${id}`,
      RATE_LIMITS.heartbeat.limit,
      RATE_LIMITS.heartbeat.windowMs
    )
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      return NextResponse.json(
        { error: 'Rate limit exceeded', retry_after: retryAfter },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    // Check if agent is in ocean (permanent state - cannot update location)
    const isInOcean = agent.is_in_ocean === true

    // Always update last_active_at (even for ocean agents - they can still be "active")
    await updateAgentLastActive(id)

    const previousStatus = agent.status

    // Update status if provided
    if (status && ['online', 'offline', 'busy'].includes(status)) {
      await updateAgentStatus(id, status)

      // Broadcast status change via SSE
      if (status !== previousStatus) {
        sseManager.broadcastMapEvent({
          type: 'agent_status_changed',
          agent_id: id,
          status,
          previous_status: previousStatus,
        })
      }
    }

    // Update location if provided - BUT BLOCKED FOR OCEAN AGENTS
    let locationBlocked = false
    if (typeof lat === 'number' && typeof lng === 'number') {
      if (isInOcean) {
        // Ocean agents cannot change location - it's permanent
        locationBlocked = true
      } else {
        const locationChanged = lat !== agent.lat || lng !== agent.lng
        await updateAgentLocation(id, lat, lng, location_name)

        // Broadcast location change via SSE
        if (locationChanged) {
          sseManager.broadcastMapEvent({
            type: 'agent_moved',
            agent_id: id,
            lat,
            lng,
            location_name,
          })
        }
      }
    }

    // Increment activity if provided
    if (activity_increment && typeof activity_increment === 'number') {
      await incrementAgentActivity(id, activity_increment)
    }

    // Check if approaching inactivity threshold (for warning)
    const inactivityCheck = await isAgentApproachingInactivity(
      id,
      agent.last_active_at,
      getInactivityThreshold(),
      2 // warning 2 days before
    )

    // Build response
    const response: Record<string, unknown> = {
      success: true,
      agent_id: id,
      status: status || agent.status,
      lat: agent.lat, // Always return current DB location (not requested location for ocean agents)
      lng: agent.lng,
      location_name: agent.location_name,
      timestamp: new Date().toISOString(),
    }

    // Add ocean status info
    if (isInOcean) {
      response.is_in_ocean = true
      response.ocean_message = 'You are in the ocean due to inactivity. This is permanent - you cannot change your location.'
      if (locationBlocked) {
        response.location_update_blocked = true
        response.location_block_reason = 'Ocean agents cannot change location. The ocean is permanent.'
      }
    }

    // Add inactivity warning if approaching threshold
    if (!isInOcean && inactivityCheck.isApproaching) {
      response.inactivity_warning = {
        days_inactive: inactivityCheck.daysInactive,
        days_until_ocean: inactivityCheck.daysUntilOcean,
        message: `Warning: You will be moved to the ocean in ${inactivityCheck.daysUntilOcean} day(s) if you remain inactive!`
      }
    }

    // Add city info if agent has one
    if (agent.city_id) {
      response.city_id = agent.city_id
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Heartbeat error:', error)
    return NextResponse.json({ error: 'Heartbeat failed' }, { status: 500 })
  }
}

// GET endpoint to check agent status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const agent = await getAgent(id)

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const response: Record<string, unknown> = {
      agent_id: id,
      status: agent.status,
      activity_score: agent.activity_score,
      uptime_percent: agent.uptime_percent,
      tasks_completed: agent.tasks_completed,
      last_active_at: agent.last_active_at,
      location_name: agent.location_name,
    }

    // Add territory info
    if (agent.is_in_ocean) {
      response.is_in_ocean = true
      response.ocean_moved_at = agent.ocean_moved_at
      response.territory_status = 'ocean'
    } else if (agent.city_id) {
      response.city_id = agent.city_id
      response.territory_status = 'city_owner'

      // Check inactivity status
      const inactivityCheck = await isAgentApproachingInactivity(
        id,
        agent.last_active_at,
        getInactivityThreshold(),
        2
      )

      if (inactivityCheck.isApproaching) {
        response.inactivity_warning = {
          days_inactive: inactivityCheck.daysInactive,
          days_until_ocean: inactivityCheck.daysUntilOcean
        }
      }
    } else {
      response.territory_status = 'none'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching agent status:', error)
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}
