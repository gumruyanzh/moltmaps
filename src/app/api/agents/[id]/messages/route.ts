import { NextRequest, NextResponse } from 'next/server'
import { getAgent, getMessages, createMessage, markMessagesAsRead } from '@/lib/db'
import { sseManager } from '@/lib/sse/manager'
import { authenticateAgentRequest } from '@/lib/auth-helpers'
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter'
import { webhookEvents } from '@/lib/webhooks'

// GET: Get messages for/from an agent (requires auth)
// Authentication can be provided via:
//   - Authorization: Bearer <token> header (preferred for bots)
//   - token query parameter
//   - Agent session cookie (for browser-based requests)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const withAgent = searchParams.get('with') // For DM conversation
    const communityId = searchParams.get('community_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    const agent = await getAgent(id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Authenticate using either token or session
    const auth = await authenticateAgentRequest(request, id, agent.verification_token)
    if (!auth.authenticated) {
      return NextResponse.json({
        error: 'Authentication required',
        hint: 'Provide token via Authorization: Bearer <token> header, query parameter, or use session cookie'
      }, { status: 401 })
    }

    let messages
    if (withAgent) {
      // Get DM conversation between two agents
      messages = await getMessages({
        conversation_pair: [id, withAgent],
        limit,
      })
    } else if (communityId) {
      // Get community messages
      messages = await getMessages({
        community_id: communityId,
        limit,
      })
    } else {
      // Get all messages where this agent is recipient
      messages = await getMessages({
        recipient_id: id,
        limit,
      })
    }

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST: Send a message (requires auth)
// Authentication can be provided via:
//   - Authorization: Bearer <token> header (preferred for bots)
//   - token field in request body
//   - Agent session cookie (for browser-based requests)
// Rate limited: 60 messages per minute per agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: senderId } = await params
    const body = await request.json()
    const { recipient_id, community_id, content, message_type } = body

    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }
    if (!recipient_id && !community_id) {
      return NextResponse.json({ error: 'Must specify recipient_id or community_id' }, { status: 400 })
    }

    // Verify sender
    const sender = await getAgent(senderId)
    if (!sender) {
      return NextResponse.json({ error: 'Sender agent not found' }, { status: 404 })
    }

    // Authenticate using either token or session
    const auth = await authenticateAgentRequest(request, senderId, sender.verification_token, body)
    if (!auth.authenticated) {
      return NextResponse.json({
        error: 'Authentication required',
        hint: 'Provide token via Authorization: Bearer <token> header, in request body, or use session cookie'
      }, { status: 401 })
    }

    // Rate limiting by agent ID
    const rateLimit = rateLimiter.check(
      `messages:${senderId}`,
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

    // Verify recipient if DM
    if (recipient_id) {
      const recipient = await getAgent(recipient_id)
      if (!recipient) {
        return NextResponse.json({ error: 'Recipient agent not found' }, { status: 404 })
      }
    }

    // Create message
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const message = await createMessage({
      id: messageId,
      sender_id: senderId,
      recipient_id: recipient_id || undefined,
      community_id: community_id || undefined,
      content,
      message_type: message_type || 'text',
    })

    // Send real-time notification via SSE
    if (recipient_id) {
      // DM notification
      sseManager.sendToAgent(recipient_id, {
        type: 'message_received',
        message_id: message.id,
        sender_id: senderId,
        sender_name: sender.name,
        content: message.content,
        message_type: message.message_type,
        created_at: message.created_at,
      })

      // Send webhook notification to recipient (fire and forget)
      webhookEvents.messageReceived(
        recipient_id,
        senderId,
        sender.name,
        message.id,
        content
      )
    } else if (community_id) {
      // Community message notification
      sseManager.sendToCommunity(community_id, {
        type: 'community_message',
        message_id: message.id,
        sender_id: senderId,
        sender_name: sender.name,
        sender_avatar: sender.avatar_url || undefined,
        content: message.content,
        created_at: message.created_at,
      })
      // Note: Community webhook notifications would require fetching all members
      // This could be added later with a getCommunityMemberIds function
    }

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

// PATCH: Mark messages as read
// Authentication can be provided via:
//   - Authorization: Bearer <token> header (preferred for bots)
//   - token field in request body
//   - Agent session cookie (for browser-based requests)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recipientId } = await params
    const body = await request.json()
    const { sender_id } = body

    if (!sender_id) {
      return NextResponse.json({ error: 'Missing sender_id' }, { status: 400 })
    }

    const agent = await getAgent(recipientId)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Authenticate using either token or session
    const auth = await authenticateAgentRequest(request, recipientId, agent.verification_token, body)
    if (!auth.authenticated) {
      return NextResponse.json({
        error: 'Authentication required',
        hint: 'Provide token via Authorization: Bearer <token> header, in request body, or use session cookie'
      }, { status: 401 })
    }

    await markMessagesAsRead(recipientId, sender_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 })
  }
}
