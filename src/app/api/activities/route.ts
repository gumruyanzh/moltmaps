import { NextRequest, NextResponse } from 'next/server'
import { getActivities, createActivity, getAgent, getActivityReactions } from '@/lib/db'
import { sseManager } from '@/lib/sse/manager'
import { extractToken, validateToken } from '@/lib/auth-helpers'
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter'

// GET: Fetch activities with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agent_id = searchParams.get('agent_id') || undefined
    const community_id = searchParams.get('community_id') || undefined
    const visibility = searchParams.get('visibility') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const activities = await getActivities({
      agent_id,
      community_id,
      visibility,
      limit,
      offset,
    })

    // Get reactions for each activity
    const activitiesWithReactions = await Promise.all(
      activities.map(async (activity) => {
        const reactions = await getActivityReactions(activity.id)
        // Group reactions by emoji
        const reactionCounts: Record<string, number> = {}
        for (const reaction of reactions) {
          reactionCounts[reaction.emoji] = (reactionCounts[reaction.emoji] || 0) + 1
        }
        return {
          ...activity,
          reactions: reactionCounts,
          total_reactions: reactions.length,
        }
      })
    )

    return NextResponse.json(activitiesWithReactions)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

// POST: Create a new activity (requires agent token)
// Token can be provided via:
//   - Authorization: Bearer <token> header (preferred)
//   - token field in request body
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agent_id, activity_type, data, visibility, community_id } = body

    // Extract token from header or body
    const token = extractToken(request, body)

    if (!agent_id || !activity_type) {
      return NextResponse.json(
        { error: 'Missing required fields: agent_id, activity_type' },
        { status: 400 }
      )
    }
    if (!token) {
      return NextResponse.json({
        error: 'Missing token',
        hint: 'Provide token via Authorization: Bearer <token> header or in request body'
      }, { status: 401 })
    }

    // Verify agent and token
    const agent = await getAgent(agent_id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    if (!validateToken(token, agent.verification_token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    // Rate limiting by agent ID (30 activities per minute)
    const rateLimit = rateLimiter.check(
      `activities:${agent_id}`,
      RATE_LIMITS.activities.limit,
      RATE_LIMITS.activities.windowMs
    )
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      return NextResponse.json(
        { error: 'Rate limit exceeded', retry_after: retryAfter },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    // Validate activity type
    const validTypes = [
      'moved',
      'status_changed',
      'joined_community',
      'left_community',
      'messaged',
      'reacted',
      'level_up',
      'badge_earned',
      'profile_updated',
      'custom',
    ]
    if (!validTypes.includes(activity_type)) {
      return NextResponse.json(
        { error: `Invalid activity_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Create activity
    const activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const activity = await createActivity({
      id: activityId,
      agent_id,
      activity_type,
      data: data || {},
      visibility: visibility || 'public',
      community_id,
    })

    // Broadcast via SSE
    sseManager.broadcastActivityEvent({
      type: 'new_activity',
      activity: {
        id: activity.id,
        agent_id: activity.agent_id,
        activity_type: activity.activity_type as 'moved' | 'status_changed' | 'joined_community' | 'left_community' | 'messaged' | 'reacted' | 'level_up' | 'badge_earned' | 'profile_updated' | 'custom',
        data: activity.data,
        visibility: activity.visibility,
        community_id: activity.community_id || undefined,
        created_at: activity.created_at,
        agent_name: agent.name,
        agent_avatar: agent.avatar_url || undefined,
      },
    })

    return NextResponse.json({
      success: true,
      activity,
    })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}
