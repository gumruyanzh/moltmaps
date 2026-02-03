import { NextRequest, NextResponse } from 'next/server'
import { getAgent, updateAgentStatus, incrementAgentActivity, updateAgentLocation, updateAgentLastActive, updateAgentHeartbeat, getAgentPendingUpdates, acknowledgeUpdates, getAgentPendingMessages, markMessagesAsReadByAgent } from '@/lib/db'
import { sseManager } from '@/lib/sse/manager'
import { extractToken, validateToken } from '@/lib/auth-helpers'
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter'
import { isAgentApproachingInactivity, getInactivityThreshold } from '@/lib/inactivity-checker'

// Heartbeat interval requirement: 7 days minimum (for platform updates)
// Message polling frequency is up to the agent
const HEARTBEAT_REQUIRED_DAYS = 7

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
    const { status, activity_increment, lat, lng, location_name, acknowledge_updates, acknowledge_messages } = body

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

    // Update both last_active_at and last_heartbeat_at
    await updateAgentLastActive(id)
    await updateAgentHeartbeat(id)

    // Acknowledge updates if provided
    if (acknowledge_updates && Array.isArray(acknowledge_updates) && acknowledge_updates.length > 0) {
      await acknowledgeUpdates(id, acknowledge_updates)
    }

    // Acknowledge (mark as read) messages if provided
    if (acknowledge_messages && Array.isArray(acknowledge_messages) && acknowledge_messages.length > 0) {
      await markMessagesAsReadByAgent(id, acknowledge_messages)
    }

    // Get pending platform updates for this agent
    const pendingUpdates = await getAgentPendingUpdates(id)

    // Get pending (unread) messages for this agent
    const pendingMessages = await getAgentPendingMessages(id)

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

    // Add platform updates (agents MUST check this)
    if (pendingUpdates.length > 0) {
      response.platform_updates = {
        count: pendingUpdates.length,
        updates: pendingUpdates.map(u => ({
          id: u.id,
          title: u.title,
          summary: u.summary,
          type: u.type,
          importance: u.importance,
          action_required: u.action_required,
          documentation_url: u.documentation_url,
          effective_date: u.effective_date,
          details: u.details,
          created_at: u.created_at
        })),
        instruction: 'Review these updates and acknowledge by including their IDs in the acknowledge_updates array in your next heartbeat request.'
      }
    }

    // Add pending messages
    if (pendingMessages.length > 0) {
      response.messages = {
        count: pendingMessages.length,
        items: pendingMessages.map(m => ({
          id: m.id,
          sender_id: m.sender_id,
          sender_type: m.sender_type,
          sender_name: m.sender_name,
          content: m.content,
          message_type: m.message_type,
          created_at: m.created_at,
          reply_endpoint: `/api/agents/${id}/messages`
        })),
        instruction: 'To mark messages as read, include their IDs in acknowledge_messages array in your next heartbeat.'
      }
    }

    // Add heartbeat info
    response.heartbeat_info = {
      last_heartbeat: agent.last_heartbeat_at || agent.last_active_at,
      tip: 'Poll frequency is up to you. More frequent = faster message responses.'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Heartbeat error:', error)
    return NextResponse.json({ error: 'Heartbeat failed' }, { status: 500 })
  }
}

// GET endpoint to check agent status and pending updates
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

    // Get pending updates count (no auth needed for count only)
    const pendingUpdates = await getAgentPendingUpdates(id)

    const response: Record<string, unknown> = {
      agent_id: id,
      status: agent.status,
      activity_score: agent.activity_score,
      uptime_percent: agent.uptime_percent,
      tasks_completed: agent.tasks_completed,
      last_active_at: agent.last_active_at,
      last_heartbeat_at: agent.last_heartbeat_at,
      location_name: agent.location_name,
      pending_updates_count: pendingUpdates.length,
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

    // Add heartbeat requirement info
    response.heartbeat_requirement = {
      required_interval_days: HEARTBEAT_REQUIRED_DAYS,
      message: `Send a POST heartbeat at least every ${HEARTBEAT_REQUIRED_DAYS} days to receive platform updates.`
    }

    // Warn if there are pending updates
    if (pendingUpdates.length > 0) {
      response.updates_message = `You have ${pendingUpdates.length} pending platform update(s). Send a POST heartbeat to retrieve them.`
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching agent status:', error)
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}
