import { NextRequest, NextResponse } from 'next/server'
import { checkSuperadmin } from '@/lib/auth'
import { getAgentsApproachingInactivity, getInactivityThreshold } from '@/lib/inactivity-checker'
import { getInactiveAgents } from '@/lib/db'

/**
 * GET /api/admin/agents/inactive
 * Superadmin endpoint to list agents approaching or past inactivity threshold
 */
export async function GET(request: NextRequest) {
  try {
    // Check superadmin authorization
    const authResult = await checkSuperadmin()
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const warningDays = parseInt(searchParams.get('warning_days') || '2')
    const thresholdDays = getInactivityThreshold()

    // Get agents approaching inactivity (warning zone)
    const approachingAgents = await getAgentsApproachingInactivity(thresholdDays, warningDays)

    // Get agents past threshold (ready for ocean)
    const pastThresholdAgents = await getInactiveAgents(thresholdDays)

    // Sanitize agent data (remove verification tokens)
    const sanitizeAgent = (agent: unknown) => {
      const agentObj = agent as Record<string, unknown>
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { verification_token, ...publicAgent } = agentObj
      return publicAgent
    }

    return NextResponse.json({
      success: true,
      threshold_days: thresholdDays,
      warning_days: warningDays,
      approaching: approachingAgents.map(item => ({
        ...sanitizeAgent(item.agent),
        days_inactive: item.daysInactive,
        days_until_ocean: item.daysUntilOcean
      })),
      past_threshold: pastThresholdAgents.map(agent => sanitizeAgent(agent)),
      counts: {
        approaching: approachingAgents.length,
        past_threshold: pastThresholdAgents.length
      }
    })
  } catch (error) {
    console.error('Error fetching inactive agents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inactive agents' },
      { status: 500 }
    )
  }
}
