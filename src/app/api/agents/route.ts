import { NextRequest, NextResponse } from 'next/server'
import { getAllAgents, createAgent, getAgentStats, getAgentsByOwner } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

interface SessionUser {
  id: string
  email?: string
  name?: string
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || undefined
    const skills = searchParams.get('skills') || undefined
    const search = searchParams.get('search') || undefined
    const statsOnly = searchParams.get('stats') === 'true'
    const myAgents = searchParams.get('my') === 'true'

    if (statsOnly) {
      const stats = await getAgentStats()
      return NextResponse.json(stats)
    }

    // Get user's own agents if requested
    if (myAgents) {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const agents = await getAgentsByOwner((session.user as SessionUser).id)
      return NextResponse.json(agents)
    }

    const agents = await getAllAgents({ status, skills, search })
    return NextResponse.json(agents)
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, lat, lng, skills, avatar_url, website, webhook_url } = body

    if (!name || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const agent = await createAgent({
      id: uuidv4(),
      name,
      description: description || null,
      lat,
      lng,
      status: 'online',
      skills: Array.isArray(skills) ? skills.join(',') : skills || null,
      owner_id: (session.user as SessionUser).id,
      avatar_url: avatar_url || null,
      website: website || null,
      webhook_url: webhook_url || null,
      verification_token: uuidv4(),
    })

    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
  }
}
