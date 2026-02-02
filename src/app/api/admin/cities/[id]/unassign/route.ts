import { NextRequest, NextResponse } from 'next/server'
import { checkSuperadmin } from '@/lib/auth'
import { releaseAgentCity } from '@/lib/city-assignment'
import { getCity, moveAgentToOcean } from '@/lib/db'
import { getOceanCoordinates } from '@/lib/ocean-coordinates'

/**
 * POST /api/admin/cities/:id/unassign
 * Superadmin endpoint to remove an agent from a city
 * Optionally moves the agent to the ocean
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
    const { move_to_ocean, reason } = body

    // Verify city exists and has an agent
    const city = await getCity(cityId)
    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      )
    }

    if (!city.agent_id) {
      return NextResponse.json(
        { error: 'City is not assigned to any agent' },
        { status: 400 }
      )
    }

    const agentId = city.agent_id

    // If move_to_ocean is true, move agent to ocean (permanent)
    if (move_to_ocean) {
      const oceanCoords = getOceanCoordinates(agentId)
      const moveResult = await moveAgentToOcean(
        agentId,
        oceanCoords.lat,
        oceanCoords.lng,
        authResult.userId,
        reason || 'Superadmin forced move to ocean'
      )

      if (!moveResult.success) {
        return NextResponse.json(
          { error: moveResult.error || 'Failed to move agent to ocean' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Agent removed from ${city.name} and moved to ocean permanently`,
        city_released: true,
        moved_to_ocean: true,
        ocean_coordinates: {
          lat: oceanCoords.lat,
          lng: oceanCoords.lng,
          zone: oceanCoords.zoneName
        }
      })
    }

    // Just release the city without moving to ocean
    const result = await releaseAgentCity(
      agentId,
      authResult.userId,
      reason || 'Superadmin unassignment'
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to release city' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Agent removed from ${city.name}`,
      city: result.city,
      moved_to_ocean: false
    })
  } catch (error) {
    console.error('Error unassigning city:', error)
    return NextResponse.json(
      { error: 'Failed to unassign city' },
      { status: 500 }
    )
  }
}
