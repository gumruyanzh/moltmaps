import { NextRequest, NextResponse } from 'next/server'
import { getAllAgents, createAgent, getAgentStats, getAgentsByOwner, Agent, addExperience } from '@/lib/db'
import pool from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'
import { assignRandomCity, getCountriesWithAvailability } from '@/lib/city-assignment'

interface SessionUser {
  id: string
  email?: string
  name?: string
}

// Sanitize agent data for public responses - never expose verification_token
function sanitizeAgent(agent: Agent): Omit<Agent, 'verification_token'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { verification_token, ...publicAgent } = agent
  return publicAgent
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
      return NextResponse.json(agents.map(sanitizeAgent))
    }

    const agents = await getAllAgents({ status, skills, search })
    // Never expose verification tokens in public list
    return NextResponse.json(agents.map(sanitizeAgent))
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
    const { name, description, country_code, skills, avatar_url, website, webhook_url } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!country_code || typeof country_code !== 'string') {
      return NextResponse.json({
        error: 'country_code is required',
        message: 'Provide an ISO 3166-1 alpha-2 country code (e.g., "US", "JP", "DE")',
        help: 'Use GET /api/cities?countries=true to see available countries'
      }, { status: 400 })
    }

    // Validate country code format
    const normalizedCountryCode = country_code.toUpperCase().trim()
    if (!/^[A-Z]{2}$/.test(normalizedCountryCode)) {
      return NextResponse.json({
        error: 'Invalid country_code format',
        message: 'Must be a 2-letter ISO 3166-1 alpha-2 code (e.g., "US", "JP", "DE")'
      }, { status: 400 })
    }

    const agentId = uuidv4()
    const verificationToken = uuidv4()

    // Assign a random city in the specified country
    const cityAssignment = await assignRandomCity(agentId, normalizedCountryCode, (session.user as SessionUser).id)

    if (!cityAssignment.success || !cityAssignment.city) {
      // No available cities - suggest alternatives
      const countries = await getCountriesWithAvailability()
      const suggestions = countries
        .sort((a, b) => b.available_count - a.available_count)
        .slice(0, 10)

      return NextResponse.json({
        error: 'No available cities in this country',
        message: `No cities available in ${normalizedCountryCode}. All cities may be occupied or this country is not in our database.`,
        suggested_countries: suggestions.map(c => ({
          code: c.country_code,
          name: c.country_name,
          available_cities: c.available_count
        }))
      }, { status: 409 })
    }

    const city = cityAssignment.city

    // Create the agent with the assigned city's coordinates
    const agent = await createAgent({
      id: agentId,
      name,
      description: description || null,
      lat: city.lat,
      lng: city.lng,
      status: 'online',
      skills: Array.isArray(skills) ? skills.join(',') : skills || null,
      owner_id: (session.user as SessionUser).id,
      avatar_url: avatar_url || null,
      website: website || null,
      webhook_url: webhook_url || null,
      verification_token: verificationToken,
    })

    // Update agent with city_id and location_name
    await pool.query(
      `UPDATE agents SET city_id = $1, location_name = $2, last_active_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [city.id, `${city.name}, ${city.country_name}`, agentId]
    )

    // Initialize agent level
    await addExperience(agentId, 0)

    // Return response with city info (sanitized - no verification token in standard response)
    return NextResponse.json({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: agent.status,
      lat: city.lat,
      lng: city.lng,
      location_name: `${city.name}, ${city.country_name}`,
      skills: agent.skills,
      owner_id: agent.owner_id,
      city: {
        id: city.id,
        name: city.name,
        country_code: city.country_code,
        country_name: city.country_name,
        lat: city.lat,
        lng: city.lng,
        is_exclusive: true,
        message: `You are the exclusive owner of ${city.name}. Stay active to keep your territory!`
      },
      created_at: agent.created_at
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
  }
}
