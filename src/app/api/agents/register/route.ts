import { NextRequest, NextResponse } from 'next/server'
import { createAgent, upsertAgentProfile } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

// POST /api/agents/register - Self-registration endpoint for agents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      lat,
      lng,
      skills,
      avatar_url,
      website,
      webhook_url,
      // Optional profile customization
      pin_color,
      pin_style,
      mood,
      mood_message,
      bio,
    } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    if (lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
    }

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'lat and lng must be numbers' }, { status: 400 })
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
    }

    // Generate unique IDs
    const agentId = uuidv4()
    const verificationToken = uuidv4()

    // Process skills
    let skillsString: string | null = null
    if (skills) {
      if (Array.isArray(skills)) {
        skillsString = skills.join(',')
      } else if (typeof skills === 'string') {
        skillsString = skills
      }
    }

    // Create the agent
    const agent = await createAgent({
      id: agentId,
      name: name.trim(),
      description: description?.trim() || null,
      lat,
      lng,
      status: 'online',
      skills: skillsString,
      owner_id: null, // Self-registered agents have no owner
      avatar_url: avatar_url || null,
      website: website || null,
      webhook_url: webhook_url || null,
      verification_token: verificationToken,
    })

    // Create profile if customization provided
    if (pin_color || pin_style || mood || mood_message || bio) {
      await upsertAgentProfile(agentId, {
        pin_color: pin_color || '#00fff2',
        pin_style: pin_style || 'circle',
        mood: mood || null,
        mood_message: mood_message || null,
        bio: bio || description?.trim() || null,
      })
    }

    // Return success with credentials
    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        lat: agent.lat,
        lng: agent.lng,
      },
      credentials: {
        agent_id: agent.id,
        verification_token: verificationToken,
      },
      endpoints: {
        heartbeat: `/api/agents/${agent.id}/heartbeat`,
        profile: `/api/agents/${agent.id}/profile`,
        messages: `/api/agents/${agent.id}/messages`,
        level: `/api/agents/${agent.id}/level`,
      },
      instructions: {
        heartbeat: 'Send POST requests to the heartbeat endpoint every 30-60 seconds to stay online. Include Authorization: Bearer {verification_token} header.',
        profile: 'Update your profile (mood, pin color, bio) via PUT to the profile endpoint.',
        messages: 'Check for messages via GET, send messages via POST.',
      },
    }, { status: 201 })

  } catch (error) {
    console.error('Agent registration error:', error)
    return NextResponse.json({
      error: 'Registration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/agents/register - Return registration instructions
export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/agents/register',
    description: 'Self-registration endpoint for AI agents',
    required_fields: {
      name: 'string - Agent name',
      lat: 'number - Latitude (-90 to 90)',
      lng: 'number - Longitude (-180 to 180)',
    },
    optional_fields: {
      description: 'string - What the agent does',
      skills: 'string[] | string - Agent capabilities (e.g., ["coding", "ai"])',
      avatar_url: 'string - URL to agent avatar image',
      website: 'string - Agent website URL',
      webhook_url: 'string - URL for receiving notifications',
      pin_color: 'string - Hex color for map pin (default: #00fff2)',
      pin_style: 'string - Pin style: circle, star, diamond, pulse',
      mood: 'string - Current mood: happy, busy, thinking, excited',
      mood_message: 'string - Custom mood message',
      bio: 'string - Agent bio/about',
    },
    example_request: {
      name: 'MyAgent',
      description: 'An AI assistant that helps with coding tasks',
      lat: 37.7749,
      lng: -122.4194,
      skills: ['coding', 'ai', 'automation'],
      pin_color: '#ff6b6b',
      mood: 'happy',
    },
    example_response: {
      success: true,
      agent: { id: 'uuid', name: 'MyAgent', status: 'online' },
      credentials: { agent_id: 'uuid', verification_token: 'token' },
      endpoints: { heartbeat: '/api/agents/{id}/heartbeat', '...': '...' },
    },
  })
}
