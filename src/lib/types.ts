// Database Agent type (from PostgreSQL)
export interface DBAgent {
  id: string
  name: string
  description: string | null
  lat: number
  lng: number
  status: 'online' | 'offline' | 'busy'
  skills: string | null
  owner_id: string | null
  avatar_url: string | null
  website: string | null
  webhook_url: string | null
  created_at: string
  verified: boolean
  verification_token: string | null
  activity_score: number
  uptime_percent: number
  tasks_completed: number
  rating: number
}

// Frontend Agent type (for components)
export interface Agent {
  id: string
  name: string
  description: string
  location: {
    city: string
    country: string
    lat: number
    lng: number
  }
  skills: string[]
  status: 'online' | 'offline' | 'busy'
  rating: number
  tasksCompleted: number
  avatar?: string
  createdAt: string
  verified?: boolean
  activityScore?: number
  uptimePercent?: number
}

// Transform database agent to frontend format
export function transformAgent(dbAgent: DBAgent): Agent {
  return {
    id: dbAgent.id,
    name: dbAgent.name,
    description: dbAgent.description || '',
    location: {
      city: getLocationName(dbAgent.lat, dbAgent.lng).city,
      country: getLocationName(dbAgent.lat, dbAgent.lng).country,
      lat: dbAgent.lat,
      lng: dbAgent.lng,
    },
    skills: dbAgent.skills ? dbAgent.skills.split(',').map(s => s.trim()) : [],
    status: dbAgent.status,
    rating: dbAgent.rating || 0,
    tasksCompleted: dbAgent.tasks_completed || 0,
    avatar: dbAgent.avatar_url || undefined,
    createdAt: dbAgent.created_at,
    verified: dbAgent.verified,
    activityScore: dbAgent.activity_score,
    uptimePercent: dbAgent.uptime_percent,
  }
}

// Simple location approximation based on coordinates
function getLocationName(lat: number, lng: number): { city: string; country: string } {
  // Major city approximations based on coordinates
  const locations = [
    { lat: 40.7, lng: -74, city: 'New York', country: 'USA' },
    { lat: 51.5, lng: -0.1, city: 'London', country: 'UK' },
    { lat: 35.7, lng: 139.7, city: 'Tokyo', country: 'Japan' },
    { lat: 48.9, lng: 2.3, city: 'Paris', country: 'France' },
    { lat: 52.5, lng: 13.4, city: 'Berlin', country: 'Germany' },
    { lat: 37.8, lng: -122.4, city: 'San Francisco', country: 'USA' },
    { lat: 55.8, lng: 37.6, city: 'Moscow', country: 'Russia' },
    { lat: 39.9, lng: 116.4, city: 'Beijing', country: 'China' },
    { lat: 31.2, lng: 121.5, city: 'Shanghai', country: 'China' },
    { lat: -33.9, lng: 151.2, city: 'Sydney', country: 'Australia' },
    { lat: 19.4, lng: -99.1, city: 'Mexico City', country: 'Mexico' },
    { lat: -23.5, lng: -46.6, city: 'São Paulo', country: 'Brazil' },
    { lat: 22.3, lng: 114.2, city: 'Hong Kong', country: 'China' },
    { lat: 1.3, lng: 103.8, city: 'Singapore', country: 'Singapore' },
    { lat: 28.6, lng: 77.2, city: 'New Delhi', country: 'India' },
  ]

  // Find closest city
  let closest = locations[0]
  let minDist = Infinity

  for (const loc of locations) {
    const dist = Math.sqrt(Math.pow(lat - loc.lat, 2) + Math.pow(lng - loc.lng, 2))
    if (dist < minDist) {
      minDist = dist
      closest = loc
    }
  }

  // If more than 10 degrees away, return generic
  if (minDist > 10) {
    return {
      city: `${lat.toFixed(1)}°, ${lng.toFixed(1)}°`,
      country: 'Earth',
    }
  }

  return { city: closest.city, country: closest.country }
}
