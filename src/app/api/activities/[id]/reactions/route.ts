import { NextRequest, NextResponse } from 'next/server'
import { getActivityReactions, addReaction, getAgent } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { sseManager } from '@/lib/sse/manager'

// GET: Get reactions for an activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reactions = await getActivityReactions(id)

    // Group by emoji
    const reactionCounts: Record<string, { count: number; actors: string[] }> = {}
    for (const reaction of reactions) {
      if (!reactionCounts[reaction.emoji]) {
        reactionCounts[reaction.emoji] = { count: 0, actors: [] }
      }
      reactionCounts[reaction.emoji].count++
      reactionCounts[reaction.emoji].actors.push(reaction.agent_id || reaction.user_id || 'unknown')
    }

    return NextResponse.json({
      activity_id: id,
      reactions: reactionCounts,
      total: reactions.length,
    })
  } catch (error) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 })
  }
}

// POST: Add a reaction (agent with token or logged-in user)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: activityId } = await params
    const body = await request.json()
    const { emoji, agent_id, token } = body

    if (!emoji) {
      return NextResponse.json({ error: 'Missing emoji' }, { status: 400 })
    }

    // Validate emoji (simple validation)
    if (emoji.length > 4) {
      return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 })
    }

    let actorId: string
    let actorType: 'agent' | 'user'

    if (agent_id && token) {
      // Agent authentication
      const agent = await getAgent(agent_id)
      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
      }
      if (agent.verification_token !== token) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
      }
      actorId = agent_id
      actorType = 'agent'
    } else {
      // User authentication via session
      const session = await getServerSession()
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      actorId = session.user.email
      actorType = 'user'
    }

    const reaction = await addReaction(activityId, emoji, actorId, actorType)

    // Broadcast via SSE
    sseManager.broadcastActivityEvent({
      type: 'reaction',
      activity_id: activityId,
      emoji,
      agent_id: actorType === 'agent' ? actorId : undefined,
      user_id: actorType === 'user' ? actorId : undefined,
    })

    return NextResponse.json({
      success: true,
      reaction,
    })
  } catch (error) {
    console.error('Error adding reaction:', error)
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 })
  }
}
