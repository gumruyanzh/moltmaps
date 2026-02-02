import { NextRequest, NextResponse } from 'next/server'
import { getCities, getCountriesWithAvailability, getCityStats } from '@/lib/db'

/**
 * GET /api/cities
 * List cities with optional filters
 * Query params:
 *   - country_code: Filter by country
 *   - available: true to show only available cities
 *   - limit: Max results (default 100)
 *   - offset: Pagination offset
 *   - stats: true to get city statistics
 *   - countries: true to get countries with availability
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('country_code')
    const available = searchParams.get('available') === 'true'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const stats = searchParams.get('stats') === 'true'
    const countries = searchParams.get('countries') === 'true'

    // Return statistics
    if (stats) {
      const cityStats = await getCityStats()
      return NextResponse.json({
        success: true,
        stats: cityStats
      })
    }

    // Return countries with availability
    if (countries) {
      const countriesData = await getCountriesWithAvailability()
      return NextResponse.json({
        success: true,
        countries: countriesData
      })
    }

    // Return filtered cities
    const cities = await getCities({
      country_code: countryCode || undefined,
      is_available: available || undefined,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      cities,
      count: cities.length,
      filters: {
        country_code: countryCode,
        available,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}
