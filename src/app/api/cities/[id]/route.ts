import { NextRequest, NextResponse } from 'next/server'
import { getCity, getAgent, getCityAssignmentLog } from '@/lib/db'

/**
 * GET /api/cities/:id
 * Get city details including owner and assignment history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const city = await getCity(id)
    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      )
    }

    // Get owner agent if assigned
    let owner = null
    if (city.agent_id) {
      const agent = await getAgent(city.agent_id)
      if (agent) {
        // Sanitize agent data (remove verification token)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { verification_token, ...publicAgent } = agent
        owner = publicAgent
      }
    }

    // Get recent assignment history
    const history = await getCityAssignmentLog({
      city_id: id,
      limit: 10
    })

    return NextResponse.json({
      success: true,
      city,
      owner,
      history
    })
  } catch (error) {
    console.error('Error fetching city:', error)
    return NextResponse.json(
      { error: 'Failed to fetch city' },
      { status: 500 }
    )
  }
}
