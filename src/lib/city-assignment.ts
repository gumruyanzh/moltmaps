/**
 * City Assignment Logic
 * Handles the business logic for assigning cities to agents
 */

import {
  getRandomAvailableCityInCountry,
  getAvailableCitiesInCountry,
  getCountriesWithAvailability as dbGetCountriesWithAvailability,
  assignCityToAgent as dbAssignCityToAgent,
  releaseCityFromAgent as dbReleaseCityFromAgent,
  getCity,
  getCityByAgentId,
  getAgent,
  City,
  Agent,
} from './db'

export interface AssignmentResult {
  success: boolean
  city?: City
  agent?: Agent
  error?: string
  suggestedCountries?: string[]
}

/**
 * Assign a random available city to an agent
 * This is the main function used during registration
 */
export async function assignRandomCity(
  agentId: string,
  countryCode: string,
  performedBy?: string
): Promise<AssignmentResult> {
  // Get a random available city in the country
  const city = await getRandomAvailableCityInCountry(countryCode)

  if (!city) {
    // No available cities in this country
    const countries = await dbGetCountriesWithAvailability()
    const suggestedCountries = countries
      .sort((a, b) => b.available_count - a.available_count)
      .slice(0, 5)
      .map(c => c.country_code)

    return {
      success: false,
      error: `No available cities in ${countryCode}`,
      suggestedCountries
    }
  }

  // Assign the city to the agent
  const result = await dbAssignCityToAgent(
    city.id,
    agentId,
    performedBy,
    'Random assignment during registration'
  )

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Failed to assign city'
    }
  }

  // Get updated agent
  const agent = await getAgent(agentId)

  return {
    success: true,
    city: result.city,
    agent: agent || undefined
  }
}

/**
 * Assign a specific city to an agent (for superadmin use)
 */
export async function assignSpecificCity(
  cityId: string,
  agentId: string,
  performedBy: string,
  reason?: string
): Promise<AssignmentResult> {
  const city = await getCity(cityId)
  if (!city) {
    return { success: false, error: 'City not found' }
  }

  const result = await dbAssignCityToAgent(
    cityId,
    agentId,
    performedBy,
    reason || 'Superadmin assignment'
  )

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Failed to assign city'
    }
  }

  const agent = await getAgent(agentId)

  return {
    success: true,
    city: result.city,
    agent: agent || undefined
  }
}

/**
 * Release an agent's city (make it available again)
 */
export async function releaseAgentCity(
  agentId: string,
  performedBy?: string,
  reason?: string
): Promise<AssignmentResult> {
  const result = await dbReleaseCityFromAgent(agentId, performedBy, reason)

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Failed to release city'
    }
  }

  return {
    success: true,
    city: result.city
  }
}

/**
 * Get available cities in a country
 */
export async function getAvailableCities(countryCode: string): Promise<City[]> {
  return getAvailableCitiesInCountry(countryCode)
}

/**
 * Get countries with available cities
 */
export async function getCountriesWithAvailability(): Promise<{
  country_code: string
  country_name: string
  available_count: number
  total_count: number
}[]> {
  return dbGetCountriesWithAvailability()
}

/**
 * Get an agent's assigned city
 */
export async function getAgentCity(agentId: string): Promise<City | null> {
  return getCityByAgentId(agentId)
}

/**
 * Check if a country has available cities
 */
export async function hasAvailableCities(countryCode: string): Promise<boolean> {
  const cities = await getAvailableCitiesInCountry(countryCode)
  return cities.length > 0
}

/**
 * Get count of available cities in a country
 */
export async function getAvailableCityCount(countryCode: string): Promise<number> {
  const cities = await getAvailableCitiesInCountry(countryCode)
  return cities.length
}
