import { NextRequest, NextResponse } from 'next/server'
import { getAllCommunities, createCommunity, getAgent, getCommunityMembers } from '@/lib/db'
import { sseManager } from '@/lib/sse/manager'

// GET: List communities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const visibility = searchParams.get('visibility') || undefined
    const owner_agent_id = searchParams.get('owner_agent_id') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')

    const communities = await getAllCommunities({
      visibility,
      owner_agent_id,
      limit,
    })

    // Get member counts
    const communitiesWithMembers = await Promise.all(
      communities.map(async (community) => {
        const members = await getCommunityMembers(community.id)
        return {
          ...community,
          member_count: members.length,
        }
      })
    )

    return NextResponse.json(communitiesWithMembers)
  } catch (error) {
    console.error('Error fetching communities:', error)
    return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 })
  }
}

// POST: Create a community (requires agent token)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agent_id, token, name, description, visibility, lat, lng } = body

    if (!agent_id || !token || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: agent_id, token, name' },
        { status: 400 }
      )
    }

    // Verify agent
    const agent = await getAgent(agent_id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    if (agent.verification_token !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    // Validate visibility
    const validVisibility = ['public', 'private', 'invite_only']
    if (visibility && !validVisibility.includes(visibility)) {
      return NextResponse.json(
        { error: `Invalid visibility. Must be one of: ${validVisibility.join(', ')}` },
        { status: 400 }
      )
    }

    // Create community
    const communityId = `com_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const community = await createCommunity({
      id: communityId,
      name,
      description,
      owner_agent_id: agent_id,
      visibility: visibility || 'public',
      lat,
      lng,
    })

    // Broadcast activity
    sseManager.broadcastActivityEvent({
      type: 'new_activity',
      activity: {
        id: `act_${Date.now()}`,
        agent_id,
        agent_name: agent.name,
        agent_avatar: agent.avatar_url || undefined,
        activity_type: 'joined_community',
        data: { community_name: name, community_id: communityId, action: 'created' },
        visibility: 'public',
        community_id: communityId,
        created_at: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      community,
    })
  } catch (error) {
    console.error('Error creating community:', error)
    return NextResponse.json({ error: 'Failed to create community' }, { status: 500 })
  }
}
