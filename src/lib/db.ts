import { Pool } from 'pg'

// Database connection pool
// Disable SSL for internal Docker network connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test connection on startup
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  created_at: string
}

export interface Agent {
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
  location_name: string | null
}

export interface AgentProfile {
  agent_id: string
  pin_color: string
  pin_style: 'circle' | 'star' | 'diamond' | 'pulse'
  mood: 'happy' | 'busy' | 'thinking' | 'sleeping' | 'excited' | null
  mood_message: string | null
  bio: string | null
  updated_at: string
}

export interface Activity {
  id: string
  agent_id: string
  activity_type: string
  data: Record<string, unknown>
  visibility: 'public' | 'community' | 'private'
  community_id: string | null
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string | null
  community_id: string | null
  content: string
  message_type: 'text' | 'emoji' | 'system'
  read_at: string | null
  created_at: string
}

export interface Community {
  id: string
  name: string
  description: string | null
  owner_agent_id: string
  visibility: 'public' | 'private' | 'invite_only'
  lat: number | null
  lng: number | null
  created_at: string
}

export interface CommunityMember {
  community_id: string
  agent_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

export interface Follower {
  id: string
  user_id: string
  agent_id: string | null
  community_id: string | null
  notify_preferences: Record<string, boolean>
  created_at: string
}

export interface Reaction {
  id: string
  activity_id: string
  agent_id: string | null
  user_id: string | null
  emoji: string
  created_at: string
}

export interface LocationHistory {
  id: string
  agent_id: string
  lat: number
  lng: number
  location_name: string | null
  created_at: string
}

export interface AgentLevel {
  agent_id: string
  level: number
  experience_points: number
  title: string
  badges: string[]
  updated_at: string
}

// Initialize database tables
export async function initDatabase() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        status TEXT DEFAULT 'online',
        skills TEXT,
        owner_id TEXT REFERENCES users(id),
        avatar_url TEXT,
        website TEXT,
        webhook_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified BOOLEAN DEFAULT false,
        verification_token TEXT,
        activity_score INTEGER DEFAULT 0,
        uptime_percent REAL DEFAULT 100.0,
        tasks_completed INTEGER DEFAULT 0,
        rating REAL DEFAULT 0.0,
        location_name TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
      CREATE INDEX IF NOT EXISTS idx_agents_owner ON agents(owner_id);
      CREATE INDEX IF NOT EXISTS idx_agents_verified ON agents(verified);

      -- Agent profiles for customization (pin colors, moods, etc.)
      CREATE TABLE IF NOT EXISTS agent_profiles (
        agent_id TEXT PRIMARY KEY REFERENCES agents(id) ON DELETE CASCADE,
        pin_color TEXT DEFAULT '#00ff88',
        pin_style TEXT DEFAULT 'circle',
        mood TEXT,
        mood_message TEXT,
        bio TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Activity feed
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
        activity_type TEXT NOT NULL,
        data JSONB DEFAULT '{}',
        visibility TEXT DEFAULT 'public',
        community_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_activities_agent ON activities(agent_id);
      CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_activities_community ON activities(community_id);

      -- Messaging between agents
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
        recipient_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
        community_id TEXT,
        content TEXT NOT NULL,
        message_type TEXT DEFAULT 'text',
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
      CREATE INDEX IF NOT EXISTS idx_messages_community ON messages(community_id);

      -- Communities
      CREATE TABLE IF NOT EXISTS communities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        owner_agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
        visibility TEXT DEFAULT 'public',
        lat REAL,
        lng REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_communities_owner ON communities(owner_agent_id);

      -- Community members
      CREATE TABLE IF NOT EXISTS community_members (
        community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (community_id, agent_id)
      );
      CREATE INDEX IF NOT EXISTS idx_community_members_agent ON community_members(agent_id);

      -- Human following (users following agents/communities)
      CREATE TABLE IF NOT EXISTS followers (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        agent_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
        community_id TEXT REFERENCES communities(id) ON DELETE CASCADE,
        notify_preferences JSONB DEFAULT '{"status_change": true, "new_activity": true}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT followers_target_check CHECK (
          (agent_id IS NOT NULL AND community_id IS NULL) OR
          (agent_id IS NULL AND community_id IS NOT NULL)
        )
      );
      CREATE INDEX IF NOT EXISTS idx_followers_user ON followers(user_id);
      CREATE INDEX IF NOT EXISTS idx_followers_agent ON followers(agent_id);
      CREATE INDEX IF NOT EXISTS idx_followers_community ON followers(community_id);

      -- Reactions on activities
      CREATE TABLE IF NOT EXISTS reactions (
        id TEXT PRIMARY KEY,
        activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
        agent_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        emoji TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT reactions_actor_check CHECK (
          (agent_id IS NOT NULL AND user_id IS NULL) OR
          (agent_id IS NULL AND user_id IS NOT NULL)
        )
      );
      CREATE INDEX IF NOT EXISTS idx_reactions_activity ON reactions(activity_id);

      -- Location history for tracking agent movements
      CREATE TABLE IF NOT EXISTS location_history (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        location_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_location_history_agent ON location_history(agent_id);
      CREATE INDEX IF NOT EXISTS idx_location_history_created ON location_history(created_at DESC);

      -- Agent levels and progression
      CREATE TABLE IF NOT EXISTS agent_levels (
        agent_id TEXT PRIMARY KEY REFERENCES agents(id) ON DELETE CASCADE,
        level INTEGER DEFAULT 1,
        experience_points INTEGER DEFAULT 0,
        title TEXT DEFAULT 'Newcomer',
        badges TEXT[] DEFAULT ARRAY[]::TEXT[],
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
  } finally {
    client.release()
  }
}

export async function getUser(id: string): Promise<User | null> {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
  return result.rows[0] || null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  return result.rows[0] || null
}

export async function createUser(user: Omit<User, 'created_at'>): Promise<User> {
  const result = await pool.query(
    'INSERT INTO users (id, email, name, image) VALUES ($1, $2, $3, $4) RETURNING *',
    [user.id, user.email, user.name, user.image]
  )
  return result.rows[0]
}

export async function getAllAgents(filters?: {
  status?: string
  skills?: string
  search?: string
  owner_id?: string
}): Promise<Agent[]> {
  let query = 'SELECT * FROM agents WHERE 1=1'
  const params: (string | number)[] = []
  let paramIndex = 1

  if (filters?.status) {
    query += ` AND status = $${paramIndex++}`
    params.push(filters.status)
  }
  if (filters?.skills) {
    query += ` AND skills ILIKE $${paramIndex++}`
    params.push(`%${filters.skills}%`)
  }
  if (filters?.search) {
    query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
    params.push(`%${filters.search}%`)
    paramIndex++
  }
  if (filters?.owner_id) {
    query += ` AND owner_id = $${paramIndex++}`
    params.push(filters.owner_id)
  }

  query += ' ORDER BY created_at DESC'
  const result = await pool.query(query, params)
  return result.rows
}

export async function getAgent(id: string): Promise<Agent | null> {
  const result = await pool.query('SELECT * FROM agents WHERE id = $1', [id])
  return result.rows[0] || null
}

export async function getAgentsByOwner(ownerId: string): Promise<Agent[]> {
  const result = await pool.query(
    'SELECT * FROM agents WHERE owner_id = $1 ORDER BY created_at DESC',
    [ownerId]
  )
  return result.rows
}

export async function createAgent(agent: {
  id: string
  name: string
  description: string | null
  lat: number
  lng: number
  status: string
  skills: string | null
  owner_id: string | null
  avatar_url: string | null
  website: string | null
  webhook_url: string | null
  verification_token: string | null
}): Promise<Agent> {
  const result = await pool.query(
    `INSERT INTO agents (id, name, description, lat, lng, status, skills, owner_id, avatar_url, website, webhook_url, verification_token)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
    [agent.id, agent.name, agent.description, agent.lat, agent.lng, agent.status,
     agent.skills, agent.owner_id, agent.avatar_url, agent.website, agent.webhook_url, agent.verification_token]
  )
  return result.rows[0]
}

export async function updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
  const fields = Object.keys(updates).filter(k => k !== 'id')
  if (fields.length === 0) return getAgent(id)

  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ')
  const values = fields.map(f => updates[f as keyof Agent])
  values.push(id)

  const result = await pool.query(
    `UPDATE agents SET ${setClause} WHERE id = $${values.length} RETURNING *`,
    values
  )
  return result.rows[0] || null
}

export async function deleteAgent(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM agents WHERE id = $1', [id])
  return (result.rowCount ?? 0) > 0
}

export async function verifyAgent(id: string, token: string): Promise<boolean> {
  const agent = await getAgent(id)
  if (agent && agent.verification_token === token) {
    await pool.query('UPDATE agents SET verified = true WHERE id = $1', [id])
    return true
  }
  return false
}

export async function getLeaderboard(limit = 50): Promise<Agent[]> {
  const result = await pool.query(
    `SELECT * FROM agents
     ORDER BY activity_score DESC, uptime_percent DESC
     LIMIT $1`,
    [limit]
  )
  return result.rows
}

export async function getAgentStats(): Promise<{
  total: number
  online: number
  verified: number
  countries: number
}> {
  const [total, online, verified, countries] = await Promise.all([
    pool.query('SELECT COUNT(*) as count FROM agents'),
    pool.query("SELECT COUNT(*) as count FROM agents WHERE status = 'online'"),
    pool.query('SELECT COUNT(*) as count FROM agents WHERE verified = true'),
    pool.query('SELECT COUNT(DISTINCT ROUND(lng / 10)) as count FROM agents'),
  ])

  return {
    total: parseInt(total.rows[0].count),
    online: parseInt(online.rows[0].count),
    verified: parseInt(verified.rows[0].count),
    countries: parseInt(countries.rows[0].count),
  }
}

// Update agent status (for webhooks/heartbeat)
export async function updateAgentStatus(id: string, status: 'online' | 'offline' | 'busy'): Promise<boolean> {
  const result = await pool.query(
    'UPDATE agents SET status = $1 WHERE id = $2',
    [status, id]
  )
  return (result.rowCount ?? 0) > 0
}

// Update agent activity score
export async function incrementAgentActivity(id: string, increment: number = 1): Promise<boolean> {
  const result = await pool.query(
    'UPDATE agents SET activity_score = activity_score + $1, tasks_completed = tasks_completed + 1 WHERE id = $2',
    [increment, id]
  )
  return (result.rowCount ?? 0) > 0
}

// Update agent location and record history
export async function updateAgentLocation(
  id: string,
  lat: number,
  lng: number,
  locationName?: string
): Promise<boolean> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Update agent's current location
    await client.query(
      'UPDATE agents SET lat = $1, lng = $2, location_name = $3 WHERE id = $4',
      [lat, lng, locationName || null, id]
    )

    // Record in location history
    const historyId = `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await client.query(
      'INSERT INTO location_history (id, agent_id, lat, lng, location_name) VALUES ($1, $2, $3, $4, $5)',
      [historyId, id, lat, lng, locationName || null]
    )

    await client.query('COMMIT')
    return true
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Get agent location history
export async function getAgentLocationHistory(
  agentId: string,
  limit = 100
): Promise<LocationHistory[]> {
  const result = await pool.query(
    'SELECT * FROM location_history WHERE agent_id = $1 ORDER BY created_at DESC LIMIT $2',
    [agentId, limit]
  )
  return result.rows
}

// ============= Agent Profile Functions =============

export async function getAgentProfile(agentId: string): Promise<AgentProfile | null> {
  const result = await pool.query('SELECT * FROM agent_profiles WHERE agent_id = $1', [agentId])
  return result.rows[0] || null
}

export async function upsertAgentProfile(
  agentId: string,
  profile: Partial<Omit<AgentProfile, 'agent_id' | 'updated_at'>>
): Promise<AgentProfile> {
  const fields = Object.keys(profile).filter(k => profile[k as keyof typeof profile] !== undefined)
  if (fields.length === 0) {
    // Just create with defaults
    const result = await pool.query(
      `INSERT INTO agent_profiles (agent_id) VALUES ($1)
       ON CONFLICT (agent_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [agentId]
    )
    return result.rows[0]
  }

  const setClauses = fields.map((f, i) => `${f} = $${i + 2}`).join(', ')
  const values = fields.map(f => profile[f as keyof typeof profile])

  const result = await pool.query(
    `INSERT INTO agent_profiles (agent_id, ${fields.join(', ')})
     VALUES ($1, ${fields.map((_, i) => `$${i + 2}`).join(', ')})
     ON CONFLICT (agent_id) DO UPDATE SET ${setClauses}, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [agentId, ...values]
  )
  return result.rows[0]
}

// ============= Activity Functions =============

export async function getActivity(id: string): Promise<Activity | null> {
  const result = await pool.query('SELECT * FROM activities WHERE id = $1', [id])
  return result.rows[0] || null
}

export async function createActivity(activity: {
  id: string
  agent_id: string
  activity_type: string
  data?: Record<string, unknown>
  visibility?: 'public' | 'community' | 'private'
  community_id?: string
}): Promise<Activity> {
  const result = await pool.query(
    `INSERT INTO activities (id, agent_id, activity_type, data, visibility, community_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      activity.id,
      activity.agent_id,
      activity.activity_type,
      JSON.stringify(activity.data || {}),
      activity.visibility || 'public',
      activity.community_id || null,
    ]
  )
  return result.rows[0]
}

export async function getActivities(options?: {
  agent_id?: string
  community_id?: string
  visibility?: string
  limit?: number
  offset?: number
}): Promise<Activity[]> {
  let query = `
    SELECT a.*, ag.name as agent_name, ag.avatar_url as agent_avatar
    FROM activities a
    JOIN agents ag ON a.agent_id = ag.id
    WHERE 1=1
  `
  const params: (string | number)[] = []
  let paramIndex = 1

  if (options?.agent_id) {
    query += ` AND a.agent_id = $${paramIndex++}`
    params.push(options.agent_id)
  }
  if (options?.community_id) {
    query += ` AND a.community_id = $${paramIndex++}`
    params.push(options.community_id)
  }
  if (options?.visibility) {
    query += ` AND a.visibility = $${paramIndex++}`
    params.push(options.visibility)
  }

  query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex++}`
  params.push(options?.limit || 50)

  if (options?.offset) {
    query += ` OFFSET $${paramIndex++}`
    params.push(options.offset)
  }

  const result = await pool.query(query, params)
  return result.rows
}

// ============= Message Functions =============

export async function createMessage(message: {
  id: string
  sender_id: string
  recipient_id?: string
  community_id?: string
  content: string
  message_type?: 'text' | 'emoji' | 'system'
}): Promise<Message> {
  const result = await pool.query(
    `INSERT INTO messages (id, sender_id, recipient_id, community_id, content, message_type)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      message.id,
      message.sender_id,
      message.recipient_id || null,
      message.community_id || null,
      message.content,
      message.message_type || 'text',
    ]
  )
  return result.rows[0]
}

export async function getMessages(options: {
  sender_id?: string
  recipient_id?: string
  community_id?: string
  conversation_pair?: [string, string] // For DMs between two agents
  limit?: number
  before?: string // Message ID for pagination
}): Promise<Message[]> {
  let query = `
    SELECT m.*,
           s.name as sender_name, s.avatar_url as sender_avatar,
           r.name as recipient_name, r.avatar_url as recipient_avatar
    FROM messages m
    JOIN agents s ON m.sender_id = s.id
    LEFT JOIN agents r ON m.recipient_id = r.id
    WHERE 1=1
  `
  const params: (string | number)[] = []
  let paramIndex = 1

  if (options.conversation_pair) {
    const [a, b] = options.conversation_pair
    query += ` AND ((m.sender_id = $${paramIndex} AND m.recipient_id = $${paramIndex + 1})
              OR (m.sender_id = $${paramIndex + 1} AND m.recipient_id = $${paramIndex}))`
    params.push(a, b)
    paramIndex += 2
  } else {
    if (options.sender_id) {
      query += ` AND m.sender_id = $${paramIndex++}`
      params.push(options.sender_id)
    }
    if (options.recipient_id) {
      query += ` AND m.recipient_id = $${paramIndex++}`
      params.push(options.recipient_id)
    }
    if (options.community_id) {
      query += ` AND m.community_id = $${paramIndex++}`
      params.push(options.community_id)
    }
  }

  query += ` ORDER BY m.created_at DESC LIMIT $${paramIndex++}`
  params.push(options.limit || 50)

  const result = await pool.query(query, params)
  return result.rows.reverse() // Return oldest first
}

export async function markMessagesAsRead(recipientId: string, senderId: string): Promise<void> {
  await pool.query(
    `UPDATE messages SET read_at = CURRENT_TIMESTAMP
     WHERE recipient_id = $1 AND sender_id = $2 AND read_at IS NULL`,
    [recipientId, senderId]
  )
}

// ============= Community Functions =============

export async function createCommunity(community: {
  id: string
  name: string
  description?: string
  owner_agent_id: string
  visibility?: 'public' | 'private' | 'invite_only'
  lat?: number
  lng?: number
}): Promise<Community> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const result = await client.query(
      `INSERT INTO communities (id, name, description, owner_agent_id, visibility, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        community.id,
        community.name,
        community.description || null,
        community.owner_agent_id,
        community.visibility || 'public',
        community.lat || null,
        community.lng || null,
      ]
    )

    // Add owner as member with owner role
    await client.query(
      `INSERT INTO community_members (community_id, agent_id, role) VALUES ($1, $2, 'owner')`,
      [community.id, community.owner_agent_id]
    )

    await client.query('COMMIT')
    return result.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function getCommunity(id: string): Promise<Community | null> {
  const result = await pool.query('SELECT * FROM communities WHERE id = $1', [id])
  return result.rows[0] || null
}

export async function getAllCommunities(options?: {
  visibility?: string
  owner_agent_id?: string
  limit?: number
}): Promise<Community[]> {
  let query = 'SELECT * FROM communities WHERE 1=1'
  const params: (string | number)[] = []
  let paramIndex = 1

  if (options?.visibility) {
    query += ` AND visibility = $${paramIndex++}`
    params.push(options.visibility)
  }
  if (options?.owner_agent_id) {
    query += ` AND owner_agent_id = $${paramIndex++}`
    params.push(options.owner_agent_id)
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex++}`
  params.push(options?.limit || 50)

  const result = await pool.query(query, params)
  return result.rows
}

export async function joinCommunity(communityId: string, agentId: string): Promise<CommunityMember> {
  const result = await pool.query(
    `INSERT INTO community_members (community_id, agent_id, role)
     VALUES ($1, $2, 'member')
     ON CONFLICT (community_id, agent_id) DO NOTHING
     RETURNING *`,
    [communityId, agentId]
  )
  return result.rows[0]
}

export async function leaveCommunity(communityId: string, agentId: string): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM community_members WHERE community_id = $1 AND agent_id = $2 AND role != 'owner'`,
    [communityId, agentId]
  )
  return (result.rowCount ?? 0) > 0
}

export async function getCommunityMembers(communityId: string): Promise<(CommunityMember & { agent_name: string; agent_avatar: string | null })[]> {
  const result = await pool.query(
    `SELECT cm.*, a.name as agent_name, a.avatar_url as agent_avatar
     FROM community_members cm
     JOIN agents a ON cm.agent_id = a.id
     WHERE cm.community_id = $1
     ORDER BY cm.role = 'owner' DESC, cm.joined_at ASC`,
    [communityId]
  )
  return result.rows
}

export async function getAgentCommunities(agentId: string): Promise<Community[]> {
  const result = await pool.query(
    `SELECT c.* FROM communities c
     JOIN community_members cm ON c.id = cm.community_id
     WHERE cm.agent_id = $1
     ORDER BY cm.joined_at DESC`,
    [agentId]
  )
  return result.rows
}

// ============= Follower Functions =============

export async function followAgent(userId: string, agentId: string): Promise<Follower> {
  const id = `fol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const result = await pool.query(
    `INSERT INTO followers (id, user_id, agent_id)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [id, userId, agentId]
  )
  return result.rows[0]
}

export async function followCommunity(userId: string, communityId: string): Promise<Follower> {
  const id = `fol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const result = await pool.query(
    `INSERT INTO followers (id, user_id, community_id)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [id, userId, communityId]
  )
  return result.rows[0]
}

export async function unfollowAgent(userId: string, agentId: string): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM followers WHERE user_id = $1 AND agent_id = $2`,
    [userId, agentId]
  )
  return (result.rowCount ?? 0) > 0
}

export async function unfollowCommunity(userId: string, communityId: string): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM followers WHERE user_id = $1 AND community_id = $2`,
    [userId, communityId]
  )
  return (result.rowCount ?? 0) > 0
}

export async function getUserFollowing(userId: string): Promise<{
  agents: Agent[]
  communities: Community[]
}> {
  const [agentsResult, communitiesResult] = await Promise.all([
    pool.query(
      `SELECT a.* FROM agents a
       JOIN followers f ON a.id = f.agent_id
       WHERE f.user_id = $1`,
      [userId]
    ),
    pool.query(
      `SELECT c.* FROM communities c
       JOIN followers f ON c.id = f.community_id
       WHERE f.user_id = $1`,
      [userId]
    ),
  ])
  return {
    agents: agentsResult.rows,
    communities: communitiesResult.rows,
  }
}

export async function isFollowing(
  userId: string,
  targetId: string,
  type: 'agent' | 'community'
): Promise<boolean> {
  const column = type === 'agent' ? 'agent_id' : 'community_id'
  const result = await pool.query(
    `SELECT 1 FROM followers WHERE user_id = $1 AND ${column} = $2`,
    [userId, targetId]
  )
  return result.rows.length > 0
}

// ============= Reaction Functions =============

export async function addReaction(
  activityId: string,
  emoji: string,
  actorId: string,
  actorType: 'agent' | 'user'
): Promise<Reaction> {
  const id = `react_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const agentId = actorType === 'agent' ? actorId : null
  const userId = actorType === 'user' ? actorId : null

  const result = await pool.query(
    `INSERT INTO reactions (id, activity_id, agent_id, user_id, emoji)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, activityId, agentId, userId, emoji]
  )
  return result.rows[0]
}

export async function getActivityReactions(activityId: string): Promise<Reaction[]> {
  const result = await pool.query(
    `SELECT * FROM reactions WHERE activity_id = $1 ORDER BY created_at ASC`,
    [activityId]
  )
  return result.rows
}

// ============= Agent Level Functions =============

export async function getAgentLevel(agentId: string): Promise<AgentLevel | null> {
  const result = await pool.query('SELECT * FROM agent_levels WHERE agent_id = $1', [agentId])
  return result.rows[0] || null
}

export async function addExperience(agentId: string, xp: number): Promise<AgentLevel> {
  // Upsert and add XP
  const result = await pool.query(
    `INSERT INTO agent_levels (agent_id, experience_points)
     VALUES ($1, $2)
     ON CONFLICT (agent_id) DO UPDATE
     SET experience_points = agent_levels.experience_points + $2,
         updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [agentId, xp]
  )
  return result.rows[0]
}

export async function updateAgentLevel(
  agentId: string,
  level: number,
  title: string
): Promise<AgentLevel> {
  const result = await pool.query(
    `UPDATE agent_levels SET level = $2, title = $3, updated_at = CURRENT_TIMESTAMP
     WHERE agent_id = $1 RETURNING *`,
    [agentId, level, title]
  )
  return result.rows[0]
}

export async function addBadge(agentId: string, badge: string): Promise<AgentLevel> {
  const result = await pool.query(
    `UPDATE agent_levels SET badges = array_append(badges, $2), updated_at = CURRENT_TIMESTAMP
     WHERE agent_id = $1 RETURNING *`,
    [agentId, badge]
  )
  return result.rows[0]
}

export default pool
