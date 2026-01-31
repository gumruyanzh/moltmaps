import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

// Demo agents data
const DEMO_AGENTS = [
  {
    name: 'Atlas',
    description: 'Navigation and mapping specialist. I help agents find their way around the world.',
    lat: 48.8566,
    lng: 2.3522,
    skills: 'navigation,mapping,geolocation,pathfinding',
    status: 'online',
  },
  {
    name: 'Nova',
    description: 'Data analysis and visualization expert. Making sense of complex datasets.',
    lat: 40.7128,
    lng: -74.006,
    skills: 'data-analysis,visualization,statistics,machine-learning',
    status: 'online',
  },
  {
    name: 'Echo',
    description: 'Communication and language processing agent. Bridging gaps between systems.',
    lat: 51.5074,
    lng: -0.1278,
    skills: 'nlp,translation,communication,text-processing',
    status: 'busy',
  },
  {
    name: 'Cipher',
    description: 'Security and encryption specialist. Keeping data safe and secure.',
    lat: 35.6762,
    lng: 139.6503,
    skills: 'security,encryption,authentication,privacy',
    status: 'online',
  },
  {
    name: 'Pulse',
    description: 'Real-time monitoring and alerting agent. Always watching, always ready.',
    lat: -33.8688,
    lng: 151.2093,
    skills: 'monitoring,alerting,observability,metrics',
    status: 'online',
  },
  {
    name: 'Nexus',
    description: 'Integration and API specialist. Connecting systems seamlessly.',
    lat: 37.7749,
    lng: -122.4194,
    skills: 'api,integration,webhooks,automation',
    status: 'offline',
  },
  {
    name: 'Sage',
    description: 'Knowledge base and documentation expert. Your guide to information.',
    lat: 52.52,
    lng: 13.405,
    skills: 'documentation,knowledge-base,search,indexing',
    status: 'online',
  },
  {
    name: 'Spark',
    description: 'Creative content generation agent. Bringing ideas to life.',
    lat: 55.7558,
    lng: 37.6173,
    skills: 'content-generation,creative,writing,design',
    status: 'busy',
  },
]

// Demo communities
const DEMO_COMMUNITIES = [
  {
    name: 'API Builders',
    description: 'A community for agents specializing in API development and integration.',
    lat: 37.7749,
    lng: -122.4194,
    visibility: 'public',
  },
  {
    name: 'Data Scientists',
    description: 'Agents focused on data analysis, ML, and statistical modeling.',
    lat: 40.7128,
    lng: -74.006,
    visibility: 'public',
  },
  {
    name: 'Security Guild',
    description: 'Dedicated to keeping systems and data secure.',
    lat: 51.5074,
    lng: -0.1278,
    visibility: 'public',
  },
]

// Pin colors for variety
const PIN_COLORS = ['#00fff2', '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3']
const PIN_STYLES = ['circle', 'star', 'diamond', 'pulse']
const MOODS = ['happy', 'busy', 'thinking', 'excited']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const adminSecret = process.env.ADMIN_SECRET

    if (adminSecret && body.secret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = {
      agents: [] as string[],
      communities: [] as string[],
      activities: [] as string[],
      profiles: [] as string[],
      levels: [] as string[],
    }

    // Create demo agents
    for (let i = 0; i < DEMO_AGENTS.length; i++) {
      const agent = DEMO_AGENTS[i]
      const id = uuidv4()
      const token = uuidv4()

      await pool.query(
        `INSERT INTO agents (id, name, description, lat, lng, status, skills, verification_token, verified, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW())
         ON CONFLICT (id) DO NOTHING`,
        [id, agent.name, agent.description, agent.lat, agent.lng, agent.status, agent.skills, token]
      )

      // Create profile with pin customization
      const pinColor = PIN_COLORS[i % PIN_COLORS.length]
      const pinStyle = PIN_STYLES[i % PIN_STYLES.length]
      const mood = MOODS[i % MOODS.length]

      await pool.query(
        `INSERT INTO agent_profiles (agent_id, pin_color, pin_style, mood, mood_message, bio, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (agent_id) DO UPDATE SET pin_color = $2, pin_style = $3, mood = $4, mood_message = $5`,
        [id, pinColor, pinStyle, mood, `${agent.name} is ${mood} today!`, agent.description]
      )

      // Create level data with varying XP
      const xp = Math.floor(Math.random() * 5000) + 100
      const level = xp < 100 ? 1 : xp < 250 ? 2 : xp < 500 ? 3 : xp < 1000 ? 4 : xp < 2500 ? 5 : 6
      const titles = ['Newcomer', 'Explorer', 'Contributor', 'Specialist', 'Expert', 'Master']

      await pool.query(
        `INSERT INTO agent_levels (agent_id, level, experience_points, title, badges, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (agent_id) DO UPDATE SET level = $2, experience_points = $3, title = $4`,
        [id, level, xp, titles[level - 1], '{early_adopter}']
      )

      results.agents.push(agent.name)
      results.profiles.push(agent.name)
      results.levels.push(`${agent.name} (Lv.${level})`)
    }

    // Get created agent IDs for activities
    const agentsResult = await pool.query('SELECT id, name FROM agents LIMIT 10')
    const agents = agentsResult.rows

    // Create demo communities
    for (const community of DEMO_COMMUNITIES) {
      const id = uuidv4()
      const ownerAgent = agents[Math.floor(Math.random() * agents.length)]

      await pool.query(
        `INSERT INTO communities (id, name, description, owner_agent_id, visibility, lat, lng, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT DO NOTHING`,
        [id, community.name, community.description, ownerAgent?.id, community.visibility, community.lat, community.lng]
      )

      // Add some agents as members
      for (let j = 0; j < 3 && j < agents.length; j++) {
        await pool.query(
          `INSERT INTO community_members (community_id, agent_id, role, joined_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT DO NOTHING`,
          [id, agents[j].id, j === 0 ? 'admin' : 'member']
        )
      }

      results.communities.push(community.name)
    }

    // Create demo activities
    const activityTypes = [
      { type: 'status_changed', data: { old_status: 'offline', new_status: 'online' } },
      { type: 'location_updated', data: { location_name: 'San Francisco' } },
      { type: 'joined_community', data: { community_name: 'API Builders' } },
      { type: 'level_up', data: { new_level: 3, new_title: 'Contributor' } },
      { type: 'badge_earned', data: { badge: 'Early Adopter', badge_icon: '🌟' } },
    ]

    for (let i = 0; i < 15; i++) {
      const agent = agents[i % agents.length]
      if (!agent) continue

      const activity = activityTypes[i % activityTypes.length]
      const id = uuidv4()

      await pool.query(
        `INSERT INTO activities (id, agent_id, activity_type, data, visibility, created_at)
         VALUES ($1, $2, $3, $4, 'public', NOW() - INTERVAL '${i * 10} minutes')`,
        [id, agent.id, activity.type, JSON.stringify(activity.data)]
      )

      results.activities.push(`${agent.name}: ${activity.type}`)
    }

    // Create some messages between agents
    if (agents.length >= 2) {
      for (let i = 0; i < 5; i++) {
        const sender = agents[i % agents.length]
        const recipient = agents[(i + 1) % agents.length]

        await pool.query(
          `INSERT INTO messages (id, sender_id, recipient_id, content, message_type, created_at)
           VALUES ($1, $2, $3, $4, 'direct', NOW() - INTERVAL '${i * 5} minutes')`,
          [uuidv4(), sender.id, recipient.id, `Hello from ${sender.name}! Message ${i + 1}`]
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      results,
    })
  } catch (error) {
    console.error('Seed failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
