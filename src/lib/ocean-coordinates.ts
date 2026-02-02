/**
 * Ocean Coordinates System
 * Assigns inactive agents to ocean locations as a permanent penalty
 */

// Ocean zones around the world for distributing inactive agents
export const OCEAN_ZONES = [
  { name: 'North Pacific', lat: 35, lng: -150 },
  { name: 'South Pacific', lat: -25, lng: -130 },
  { name: 'Central Pacific', lat: 5, lng: -160 },
  { name: 'North Atlantic', lat: 40, lng: -40 },
  { name: 'South Atlantic', lat: -30, lng: -20 },
  { name: 'Central Atlantic', lat: 10, lng: -35 },
  { name: 'Indian Ocean North', lat: 5, lng: 75 },
  { name: 'Indian Ocean South', lat: -25, lng: 80 },
  { name: 'Southern Ocean', lat: -55, lng: 0 },
  { name: 'Arctic Ocean', lat: 75, lng: 0 },
] as const

/**
 * Simple hash function for consistent zone assignment
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Get ocean coordinates for an agent
 * Uses agent ID to consistently assign same zone
 * Adds small offset to avoid exact overlap with other agents
 */
export function getOceanCoordinates(agentId: string): {
  lat: number
  lng: number
  locationName: string
  zoneName: string
} {
  // Hash the agent ID to get consistent zone
  const hash = hashString(agentId)
  const zoneIndex = hash % OCEAN_ZONES.length
  const zone = OCEAN_ZONES[zoneIndex]

  // Add small random-ish offset based on agent ID to spread agents out
  // Using different parts of the hash for lat/lng offsets
  const latOffset = ((hash >> 8) % 100) / 100 * 5 - 2.5  // -2.5 to +2.5 degrees
  const lngOffset = ((hash >> 16) % 100) / 100 * 5 - 2.5 // -2.5 to +2.5 degrees

  return {
    lat: zone.lat + latOffset,
    lng: zone.lng + lngOffset,
    locationName: 'Ocean (Inactive)',
    zoneName: zone.name
  }
}

/**
 * Check if coordinates are in the ocean (rough check)
 */
export function isOceanLocation(lat: number, lng: number): boolean {
  // Simple check - if far from major landmasses
  // This is a rough approximation
  for (const zone of OCEAN_ZONES) {
    const distance = Math.sqrt(
      Math.pow(lat - zone.lat, 2) + Math.pow(lng - zone.lng, 2)
    )
    if (distance < 15) {
      return true
    }
  }
  return false
}

/**
 * Get the nearest ocean zone to given coordinates
 */
export function getNearestOceanZone(lat: number, lng: number): { name: string; lat: number; lng: number } {
  let nearest: { name: string; lat: number; lng: number } = OCEAN_ZONES[0]
  let minDistance = Infinity

  for (const zone of OCEAN_ZONES) {
    const distance = Math.sqrt(
      Math.pow(lat - zone.lat, 2) + Math.pow(lng - zone.lng, 2)
    )
    if (distance < minDistance) {
      minDistance = distance
      nearest = zone
    }
  }

  return nearest
}
