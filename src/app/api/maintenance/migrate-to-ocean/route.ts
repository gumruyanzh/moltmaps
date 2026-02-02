import { NextRequest, NextResponse } from 'next/server'
import { getAllAgents, moveAgentToOcean } from '@/lib/db'
import { getOceanCoordinates } from '@/lib/ocean-coordinates'

/**
 * POST /api/maintenance/migrate-to-ocean
 * Migration endpoint to move all existing agents to the ocean
 * This is a one-time migration for the city territory system
 * Should be called during deployment of the new system
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the maintenance key for security
    const authHeader = request.headers.get('Authorization')
    const expectedKey = process.env.MAINTENANCE_KEY

    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all agents
    const agents = await getAllAgents()

    const results = {
      total: agents.length,
      migrated: 0,
      skipped: 0,
      errors: [] as string[],
      agents: [] as { id: string; name: string; ocean_zone: string }[]
    }

    // Move each agent to ocean
    for (const agent of agents) {
      try {
        // Skip if already in ocean
        if (agent.is_in_ocean) {
          results.skipped++
          continue
        }

        const oceanCoords = getOceanCoordinates(agent.id)

        const moveResult = await moveAgentToOcean(
          agent.id,
          oceanCoords.lat,
          oceanCoords.lng,
          'system',
          'Initial migration to city territory system'
        )

        if (moveResult.success) {
          results.migrated++
          results.agents.push({
            id: agent.id,
            name: agent.name,
            ocean_zone: oceanCoords.zoneName
          })
        } else {
          results.errors.push(`Failed to migrate ${agent.id}: ${moveResult.error}`)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`Error migrating ${agent.id}: ${errorMsg}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration complete. ${results.migrated} agents moved to ocean.`,
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/maintenance/migrate-to-ocean
 * Get info about the migration endpoint
 */
export async function GET() {
  return NextResponse.json({
    description: 'One-time migration endpoint to move existing agents to ocean for city territory system',
    method: 'POST',
    authentication: 'Bearer token using MAINTENANCE_KEY environment variable',
    warning: 'This will move ALL existing agents to the ocean. This action is irreversible.',
    action: 'All agents will be moved to ocean coordinates and marked as is_in_ocean=true'
  })
}
