import { NextRequest, NextResponse } from 'next/server'
import { getAgent, getAgentProfile, upsertAgentProfile } from '@/lib/db'
import { sseManager } from '@/lib/sse/manager'
import { extractToken, validateToken } from '@/lib/auth-helpers'

// GET: Get agent profile (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const agent = await getAgent(id)

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const profile = await getAgentProfile(id)

    // Return profile with defaults if not found
    return NextResponse.json({
      agent_id: id,
      pin_color: profile?.pin_color || '#00ff88',
      pin_style: profile?.pin_style || 'circle',
      mood: profile?.mood || null,
      mood_message: profile?.mood_message || null,
      bio: profile?.bio || null,
      updated_at: profile?.updated_at || null,
    })
  } catch (error) {
    console.error('Error fetching agent profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PUT: Update agent profile (requires token auth)
// Token can be provided via:
//   - Authorization: Bearer <token> header (preferred)
//   - token field in request body
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { pin_color, pin_style, mood, mood_message, bio } = body

    // Extract token from header or body
    const token = extractToken(request, body)
    if (!token) {
      return NextResponse.json({
        error: 'Missing verification token',
        hint: 'Provide token via Authorization: Bearer <token> header or in request body'
      }, { status: 401 })
    }

    const agent = await getAgent(id)

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Verify token
    if (!validateToken(token, agent.verification_token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    // Validate pin_style if provided
    const validPinStyles = ['circle', 'star', 'diamond', 'pulse']
    if (pin_style && !validPinStyles.includes(pin_style)) {
      return NextResponse.json(
        { error: `Invalid pin_style. Must be one of: ${validPinStyles.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate mood if provided
    const validMoods = ['happy', 'busy', 'thinking', 'sleeping', 'excited', null]
    if (mood !== undefined && !validMoods.includes(mood)) {
      return NextResponse.json(
        { error: `Invalid mood. Must be one of: ${validMoods.filter(m => m).join(', ')}, or null` },
        { status: 400 }
      )
    }

    // Validate pin_color if provided (hex color)
    if (pin_color && !/^#[0-9A-Fa-f]{6}$/.test(pin_color)) {
      return NextResponse.json(
        { error: 'Invalid pin_color. Must be a hex color (e.g., #00ff88)' },
        { status: 400 }
      )
    }

    // Update profile
    const updates: Record<string, unknown> = {}
    if (pin_color !== undefined) updates.pin_color = pin_color
    if (pin_style !== undefined) updates.pin_style = pin_style
    if (mood !== undefined) updates.mood = mood
    if (mood_message !== undefined) updates.mood_message = mood_message
    if (bio !== undefined) updates.bio = bio

    const profile = await upsertAgentProfile(id, updates)

    // Broadcast profile change via SSE
    sseManager.broadcastMapEvent({
      type: 'agent_profile_changed',
      agent_id: id,
      pin_color: profile.pin_color,
      pin_style: profile.pin_style as 'circle' | 'star' | 'diamond' | 'pulse',
      mood: profile.mood,
      mood_message: profile.mood_message || undefined,
    })

    return NextResponse.json({
      success: true,
      ...profile,
    })
  } catch (error) {
    console.error('Error updating agent profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
