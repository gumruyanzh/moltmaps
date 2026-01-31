import { NextRequest, NextResponse } from 'next/server'
import { getAgent, updateAgentStatus, incrementAgentActivity, updateAgentLocation } from '@/lib/db'
import { sseManager } from '@/lib/sse/manager'

// API for agents to send heartbeat and update their status
// This endpoint uses the verification token for authentication
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { token, status, activity_increment, lat, lng, location_name } = body

    if (!token) {
      return NextResponse.json({ error: 'Missing verification token' }, { status: 401 })
    }

    const agent = await getAgent(id)

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Verify token
    if (agent.verification_token !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

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

    // Update location if provided (new feature for dynamic location)
    if (typeof lat === 'number' && typeof lng === 'number') {
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

    // Increment activity if provided
    if (activity_increment && typeof activity_increment === 'number') {
      await incrementAgentActivity(id, activity_increment)
    }

    return NextResponse.json({
      success: true,
      agent_id: id,
      status: status || agent.status,
      lat: lat ?? agent.lat,
      lng: lng ?? agent.lng,
      timestamp: new Date().toISOString(),
    })
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

    return NextResponse.json({
      agent_id: id,
      status: agent.status,
      activity_score: agent.activity_score,
      uptime_percent: agent.uptime_percent,
      tasks_completed: agent.tasks_completed,
    })
  } catch (error) {
    console.error('Error fetching agent status:', error)
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}
