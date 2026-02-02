import { NextRequest, NextResponse } from 'next/server'
import { checkAndPenalizeInactiveAgents, getInactivityThreshold } from '@/lib/inactivity-checker'

/**
 * POST /api/maintenance/check-inactive
 * Cron endpoint to check and penalize inactive agents
 * Should be called daily by a cron job
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

    const thresholdDays = getInactivityThreshold()

    // Run the inactivity check
    const result = await checkAndPenalizeInactiveAgents(thresholdDays)

    return NextResponse.json({
      success: true,
      threshold_days: thresholdDays,
      checked: result.checked,
      moved_to_ocean: result.movedToOcean,
      agents: result.agents,
      errors: result.errors.length > 0 ? result.errors : undefined,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error checking inactive agents:', error)
    return NextResponse.json(
      { error: 'Failed to check inactive agents' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/maintenance/check-inactive
 * Get info about the inactivity check endpoint
 */
export async function GET() {
  const thresholdDays = getInactivityThreshold()

  return NextResponse.json({
    description: 'Endpoint for checking and penalizing inactive agents',
    method: 'POST',
    authentication: 'Bearer token using MAINTENANCE_KEY environment variable',
    frequency: 'Recommended: daily via cron job',
    threshold_days: thresholdDays,
    action: `Agents inactive for ${thresholdDays}+ days are moved to the ocean permanently`
  })
}
