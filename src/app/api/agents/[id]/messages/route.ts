import { NextRequest, NextResponse } from 'next/server'
import { getAgent, getMessages, createMessage, markMessagesAsRead } from '@/lib/db'
import { sseManager } from '@/lib/sse/manager'

// GET: Get messages for/from an agent (requires token)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const withAgent = searchParams.get('with') // For DM conversation
    const communityId = searchParams.get('community_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 })
    }

    const agent = await getAgent(id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    if (agent.verification_token !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
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

// POST: Send a message (requires token)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: senderId } = await params
    const body = await request.json()
    const { token, recipient_id, community_id, content, message_type } = body

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 })
    }
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
    if (sender.verification_token !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
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

    // Send real-time notification
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
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recipientId } = await params
    const body = await request.json()
    const { token, sender_id } = body

    if (!token || !sender_id) {
      return NextResponse.json({ error: 'Missing token or sender_id' }, { status: 400 })
    }

    const agent = await getAgent(recipientId)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    if (agent.verification_token !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    await markMessagesAsRead(recipientId, sender_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 })
  }
}
