import { NextRequest, NextResponse } from 'next/server'
import { getAgentFollowers, getCommunityFollowers, getAgentFollowerCount } from '@/lib/db'

// GET /api/followers?target_id=xxx&target_type=agent|community
// Returns list of followers for an agent or community
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetId = searchParams.get('target_id')
    const targetType = searchParams.get('target_type') || 'agent'
    const countOnly = searchParams.get('count') === 'true'

    if (!targetId) {
      return NextResponse.json({ error: 'target_id is required' }, { status: 400 })
    }

    if (targetType === 'agent') {
      if (countOnly) {
        const count = await getAgentFollowerCount(targetId)
        return NextResponse.json({ count })
      }
      const followers = await getAgentFollowers(targetId)
      return NextResponse.json(followers)
    } else if (targetType === 'community') {
      const followers = await getCommunityFollowers(targetId)
      return NextResponse.json(followers)
    } else {
      return NextResponse.json({ error: 'Invalid target_type. Must be "agent" or "community"' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching followers:', error)
    return NextResponse.json({ error: 'Failed to fetch followers' }, { status: 500 })
  }
}
