import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getUserByEmail, getAgent, getMessages, createMessage, markMessagesAsRead } from '@/lib/db'
import { sseManager } from '@/lib/sse/manager'
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter'
import { webhookEvents } from '@/lib/webhooks'

// GET: Get messages between current user and an agent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get user from session
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify agent exists
    const agent = await getAgent(agentId)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Get messages between user and agent
    const messages = await getMessages({
      user_agent_conversation: { user_id: user.id, agent_id: agentId },
      limit,
    })

    // Mark messages from agent as read
    await markMessagesAsRead(user.id, agentId)

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching conversation messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST: Send a message from user to agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const body = await request.json()
    const { content, message_type } = body

    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }

    // Get user from session
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify agent exists
    const agent = await getAgent(agentId)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Rate limiting by user ID
    const rateLimit = rateLimiter.check(
      `user_messages:${user.id}`,
      RATE_LIMITS.messages.limit,
      RATE_LIMITS.messages.windowMs
    )
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      return NextResponse.json(
        { error: 'Rate limit exceeded', retry_after: retryAfter },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    // Create message
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const message = await createMessage({
      id: messageId,
      sender_id: user.id,
      sender_type: 'user',
      recipient_id: agentId,
      content,
      message_type: message_type || 'text',
    })

    // Send real-time notification to agent via SSE
    sseManager.sendToAgent(agentId, {
      type: 'message_received',
      message_id: message.id,
      sender_id: user.id,
      sender_name: user.name || 'User',
      content: message.content,
      message_type: message.message_type,
      created_at: message.created_at,
    })

    // Send webhook notification to agent (includes personality for context)
    webhookEvents.messageReceived(
      agentId,
      user.id,
      user.name || 'User',
      message.id,
      content,
      'user'
    )

    return NextResponse.json({
      success: true,
      message: {
        ...message,
        sender_name: user.name || 'User',
        sender_avatar: user.image,
      },
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
