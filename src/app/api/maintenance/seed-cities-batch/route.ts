import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface CityInput {
  id: string
  name: string
  country_code: string
  country_name: string
  lat: number
  lng: number
  population: number | null
  timezone: string | null
  is_top_1000: boolean
}

/**
 * POST /api/maintenance/seed-cities-batch
 * Bulk insert cities (for large dataset seeding)
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

    const body = await request.json()
    const cities: CityInput[] = body.cities

    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      return NextResponse.json(
        { error: 'No cities provided' },
        { status: 400 }
      )
    }

    // Build bulk insert query
    const values: unknown[] = []
    const placeholders: string[] = []

    for (let i = 0; i < cities.length; i++) {
      const city = cities[i]
      const offset = i * 9
      placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`)
      values.push(
        city.id,
        city.name,
        city.country_code,
        city.country_name,
        city.lat,
        city.lng,
        city.population,
        city.timezone,
        city.is_top_1000
      )
    }

    const query = `
      INSERT INTO cities (id, name, country_code, country_name, lat, lng, population, timezone, is_top_1000)
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        country_code = EXCLUDED.country_code,
        country_name = EXCLUDED.country_name,
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        population = EXCLUDED.population,
        timezone = EXCLUDED.timezone,
        is_top_1000 = EXCLUDED.is_top_1000
    `

    const result = await pool.query(query, values)

    return NextResponse.json({
      success: true,
      inserted: result.rowCount,
      batch_size: cities.length
    })
  } catch (error) {
    console.error('Batch city seeding error:', error)
    return NextResponse.json(
      { error: 'Failed to seed cities batch', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
