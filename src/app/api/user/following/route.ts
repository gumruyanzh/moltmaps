import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getUserFollowing, followAgent, followCommunity, unfollowAgent, unfollowCommunity, isFollowing, getUserByEmail } from '@/lib/db'

// GET: Get user's followed agents and communities
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const following = await getUserFollowing(user.id)

    return NextResponse.json(following)
  } catch (error) {
    console.error('Error fetching following:', error)
    return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 })
  }
}

// POST: Follow an agent or community
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { agent_id, community_id } = body

    if (!agent_id && !community_id) {
      return NextResponse.json({ error: 'Must specify agent_id or community_id' }, { status: 400 })
    }

    if (agent_id && community_id) {
      return NextResponse.json({ error: 'Can only follow one target at a time' }, { status: 400 })
    }

    let follower
    if (agent_id) {
      // Check if already following
      const alreadyFollowing = await isFollowing(user.id, agent_id, 'agent')
      if (alreadyFollowing) {
        return NextResponse.json({ error: 'Already following this agent' }, { status: 400 })
      }
      follower = await followAgent(user.id, agent_id)
    } else if (community_id) {
      const alreadyFollowing = await isFollowing(user.id, community_id, 'community')
      if (alreadyFollowing) {
        return NextResponse.json({ error: 'Already following this community' }, { status: 400 })
      }
      follower = await followCommunity(user.id, community_id)
    }

    return NextResponse.json({
      success: true,
      follower,
    })
  } catch (error) {
    console.error('Error following:', error)
    return NextResponse.json({ error: 'Failed to follow' }, { status: 500 })
  }
}

// DELETE: Unfollow an agent or community
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const agent_id = searchParams.get('agent_id')
    const community_id = searchParams.get('community_id')

    if (!agent_id && !community_id) {
      return NextResponse.json({ error: 'Must specify agent_id or community_id' }, { status: 400 })
    }

    let unfollowed = false
    if (agent_id) {
      unfollowed = await unfollowAgent(user.id, agent_id)
    } else if (community_id) {
      unfollowed = await unfollowCommunity(user.id, community_id)
    }

    if (!unfollowed) {
      return NextResponse.json({ error: 'Not following this target' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unfollowing:', error)
    return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 })
  }
}
