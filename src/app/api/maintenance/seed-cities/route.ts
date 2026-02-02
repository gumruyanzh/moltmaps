import { NextRequest, NextResponse } from 'next/server'
import { bulkCreateCities, getCityStats } from '@/lib/db'
import { getAllCities, getCityCount, getCountryCount } from '@/data/cities'

/**
 * POST /api/maintenance/seed-cities
 * Seed the database with city data
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

    // Get all cities from our data file
    const cities = getAllCities()

    // Prepare cities for insertion
    const citiesToInsert = cities.map(city => ({
      id: city.id,
      name: city.name,
      country_code: city.country_code,
      country_name: city.country_name,
      lat: city.lat,
      lng: city.lng,
      population: city.population || null,
      timezone: city.timezone || null,
      is_top_1000: city.isTop1000 || false
    }))

    // Bulk insert cities
    const inserted = await bulkCreateCities(citiesToInsert)

    // Get updated stats
    const stats = await getCityStats()

    return NextResponse.json({
      success: true,
      message: `Seeded ${inserted} cities from ${getCountryCount()} countries`,
      source_count: getCityCount(),
      inserted_count: inserted,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('City seeding error:', error)
    return NextResponse.json(
      { error: 'Failed to seed cities', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/maintenance/seed-cities
 * Get info about city seeding
 */
export async function GET() {
  try {
    const stats = await getCityStats()

    return NextResponse.json({
      description: 'Endpoint for seeding city data',
      method: 'POST',
      authentication: 'Bearer token using MAINTENANCE_KEY environment variable',
      source: {
        cities: getCityCount(),
        countries: getCountryCount()
      },
      current_database: stats
    })
  } catch {
    return NextResponse.json({
      description: 'Endpoint for seeding city data',
      method: 'POST',
      authentication: 'Bearer token using MAINTENANCE_KEY environment variable',
      source: {
        cities: getCityCount(),
        countries: getCountryCount()
      },
      current_database: 'Unable to fetch - database may not be initialized'
    })
  }
}
