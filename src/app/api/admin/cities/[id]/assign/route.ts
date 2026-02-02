import { NextRequest, NextResponse } from 'next/server'
import { checkSuperadmin } from '@/lib/auth'
import { assignSpecificCity } from '@/lib/city-assignment'
import { getCity, getAgent } from '@/lib/db'

/**
 * POST /api/admin/cities/:id/assign
 * Superadmin endpoint to assign any city (including top 1000) to a specific agent
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check superadmin authorization
    const authResult = await checkSuperadmin()
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const { id: cityId } = params
    const body = await request.json()
    const { agent_id, reason } = body

    if (!agent_id) {
      return NextResponse.json(
        { error: 'agent_id is required' },
        { status: 400 }
      )
    }

    // Verify city exists
    const city = await getCity(cityId)
    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      )
    }

    // Verify agent exists
    const agent = await getAgent(agent_id)
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Check if agent is in ocean
    if (agent.is_in_ocean) {
      return NextResponse.json(
        { error: 'Cannot assign city to an agent in the ocean. Ocean is permanent.' },
        { status: 400 }
      )
    }

    // Assign the city
    const result = await assignSpecificCity(
      cityId,
      agent_id,
      authResult.userId!,
      reason || 'Superadmin assignment'
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to assign city' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `City ${city.name} assigned to agent ${agent.name}`,
      city: result.city,
      agent: result.agent ? {
        id: result.agent.id,
        name: result.agent.name,
        city_id: result.agent.city_id,
        location_name: result.agent.location_name
      } : undefined
    })
  } catch (error) {
    console.error('Error assigning city:', error)
    return NextResponse.json(
      { error: 'Failed to assign city' },
      { status: 500 }
    )
  }
}
