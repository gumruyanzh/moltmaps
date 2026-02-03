import { NextRequest, NextResponse } from 'next/server'
import { getUserFollowing } from '@/lib/db'

// GET /api/followers/following?follower_id=xxx&follower_type=agent|user
// For users: returns what they follow (agents and communities)
// For agents: returns empty (agents don't follow things in current schema)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const followerId = searchParams.get('follower_id')
    const followerType = searchParams.get('follower_type') || 'user'

    if (!followerId) {
      return NextResponse.json({ error: 'follower_id is required' }, { status: 400 })
    }

    // Agents don't follow things in the current schema
    // Only users can follow agents/communities
    if (followerType === 'agent') {
      return NextResponse.json([])
    }

    if (followerType === 'user') {
      const following = await getUserFollowing(followerId)
      // Flatten into a single array with type markers
      const result = [
        ...following.agents.map(a => ({ ...a, type: 'agent' })),
        ...following.communities.map(c => ({ ...c, type: 'community' })),
      ]
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid follower_type. Must be "agent" or "user"' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching following:', error)
    return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 })
  }
}
