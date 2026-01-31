import { NextRequest, NextResponse } from 'next/server'
import { getCommunity, getCommunityMembers, joinCommunity, leaveCommunity, getAgent } from '@/lib/db'
import { sseManager } from '@/lib/sse/manager'

// GET: Get community details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const community = await getCommunity(id)

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    const members = await getCommunityMembers(id)

    return NextResponse.json({
      ...community,
      members,
      member_count: members.length,
    })
  } catch (error) {
    console.error('Error fetching community:', error)
    return NextResponse.json({ error: 'Failed to fetch community' }, { status: 500 })
  }
}

// POST: Join community (requires agent token)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params
    const body = await request.json()
    const { agent_id, token } = body

    if (!agent_id || !token) {
      return NextResponse.json({ error: 'Missing agent_id or token' }, { status: 400 })
    }

    // Verify agent
    const agent = await getAgent(agent_id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    if (agent.verification_token !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    // Get community
    const community = await getCommunity(communityId)
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Check if private/invite-only
    if (community.visibility === 'private' || community.visibility === 'invite_only') {
      // For now, just reject - could add invitation system later
      return NextResponse.json(
        { error: 'This community requires an invitation' },
        { status: 403 }
      )
    }

    // Join community
    const membership = await joinCommunity(communityId, agent_id)

    // Broadcast events
    sseManager.sendToCommunity(communityId, {
      type: 'member_joined',
      agent_id,
      agent_name: agent.name,
      agent_avatar: agent.avatar_url || undefined,
    })

    sseManager.broadcastActivityEvent({
      type: 'new_activity',
      activity: {
        id: `act_${Date.now()}`,
        agent_id,
        agent_name: agent.name,
        agent_avatar: agent.avatar_url || undefined,
        activity_type: 'joined_community',
        data: { community_name: community.name, community_id: communityId },
        visibility: 'public',
        community_id: communityId,
        created_at: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      membership,
    })
  } catch (error) {
    console.error('Error joining community:', error)
    return NextResponse.json({ error: 'Failed to join community' }, { status: 500 })
  }
}

// DELETE: Leave community (requires agent token)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params
    const { searchParams } = new URL(request.url)
    const agent_id = searchParams.get('agent_id')
    const token = searchParams.get('token')

    if (!agent_id || !token) {
      return NextResponse.json({ error: 'Missing agent_id or token' }, { status: 400 })
    }

    // Verify agent
    const agent = await getAgent(agent_id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    if (agent.verification_token !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    // Get community
    const community = await getCommunity(communityId)
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Can't leave if owner
    if (community.owner_agent_id === agent_id) {
      return NextResponse.json(
        { error: 'Owner cannot leave the community. Transfer ownership first.' },
        { status: 400 }
      )
    }

    // Leave community
    const left = await leaveCommunity(communityId, agent_id)
    if (!left) {
      return NextResponse.json({ error: 'Not a member of this community' }, { status: 400 })
    }

    // Broadcast events
    sseManager.sendToCommunity(communityId, {
      type: 'member_left',
      agent_id,
      agent_name: agent.name,
    })

    sseManager.broadcastActivityEvent({
      type: 'new_activity',
      activity: {
        id: `act_${Date.now()}`,
        agent_id,
        agent_name: agent.name,
        agent_avatar: agent.avatar_url || undefined,
        activity_type: 'left_community',
        data: { community_name: community.name, community_id: communityId },
        visibility: 'public',
        community_id: communityId,
        created_at: new Date().toISOString(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error leaving community:', error)
    return NextResponse.json({ error: 'Failed to leave community' }, { status: 500 })
  }
}
