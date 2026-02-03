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
  role: 'user' | 'superadmin'
  password_hash: string | null
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
  sessions_invalidated_at: string | null
  // City territory system fields
  city_id: string | null
  last_active_at: string | null
  is_in_ocean: boolean
  ocean_moved_at: string | null
  previous_city_id: string | null
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

export interface LoginToken {
  id: string
  agent_id: string
  token: string
  expires_at: string
  used_at: string | null
  created_at: string
}

export interface PasswordResetToken {
  id: string
  user_id: string
  token: string
  expires_at: string
  used_at: string | null
  created_at: string
}

export interface City {
  id: string
  name: string
  country_code: string
  country_name: string
  lat: number
  lng: number
  population: number | null
  timezone: string | null
  is_top_1000: boolean
  agent_id: string | null
  assigned_at: string | null
  created_at: string
}

export interface CityAssignmentLog {
  id: string
  city_id: string
  agent_id: string | null
  action: 'assigned' | 'released' | 'moved_to_ocean' | 'superadmin_override'
  performed_by: string | null
  reason: string | null
  created_at: string
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
        role TEXT DEFAULT 'user',
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Add role column if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
          ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
          ALTER TABLE users ADD COLUMN password_hash TEXT;
        END IF;
      END $$;

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

      -- Add sessions_invalidated_at column if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='sessions_invalidated_at') THEN
          ALTER TABLE agents ADD COLUMN sessions_invalidated_at TIMESTAMP;
        END IF;
      END $$;

      -- City territory system columns for agents
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='city_id') THEN
          ALTER TABLE agents ADD COLUMN city_id TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='last_active_at') THEN
          ALTER TABLE agents ADD COLUMN last_active_at TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='is_in_ocean') THEN
          ALTER TABLE agents ADD COLUMN is_in_ocean BOOLEAN DEFAULT false;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='ocean_moved_at') THEN
          ALTER TABLE agents ADD COLUMN ocean_moved_at TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='previous_city_id') THEN
          ALTER TABLE agents ADD COLUMN previous_city_id TEXT;
        END IF;
      END $$;

      -- Cities table for territory system
      CREATE TABLE IF NOT EXISTS cities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        country_code TEXT NOT NULL,
        country_name TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        population INTEGER,
        timezone TEXT,
        is_top_1000 BOOLEAN DEFAULT false,
        agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
        assigned_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, country_code)
      );

      CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country_code);
      CREATE INDEX IF NOT EXISTS idx_cities_agent ON cities(agent_id);
      CREATE INDEX IF NOT EXISTS idx_cities_available ON cities(agent_id) WHERE agent_id IS NULL AND is_top_1000 = false;
      CREATE INDEX IF NOT EXISTS idx_cities_top_1000 ON cities(is_top_1000);

      -- City assignment audit log
      CREATE TABLE IF NOT EXISTS city_assignment_log (
        id TEXT PRIMARY KEY,
        city_id TEXT NOT NULL,
        agent_id TEXT,
        action TEXT NOT NULL,
        performed_by TEXT,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_city_assignment_log_city ON city_assignment_log(city_id);
      CREATE INDEX IF NOT EXISTS idx_city_assignment_log_agent ON city_assignment_log(agent_id);

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

      -- Login tokens for URL-based auto-login
      CREATE TABLE IF NOT EXISTS login_tokens (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_login_tokens_agent ON login_tokens(agent_id);
      CREATE INDEX IF NOT EXISTS idx_login_tokens_token ON login_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_login_tokens_expires ON login_tokens(expires_at);

      -- Password reset tokens
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);
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

export async function createUser(user: Omit<User, 'created_at' | 'role' | 'password_hash'> & { role?: 'user' | 'superadmin', password_hash?: string | null }): Promise<User> {
  const result = await pool.query(
    'INSERT INTO users (id, email, name, image, role, password_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [user.id, user.email, user.name, user.image, user.role || 'user', user.password_hash || null]
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

// Get users who follow an agent
export async function getAgentFollowers(agentId: string): Promise<{ id: string; user_id: string; created_at: string }[]> {
  const result = await pool.query(
    `SELECT id, user_id, created_at FROM followers WHERE agent_id = $1`,
    [agentId]
  )
  return result.rows
}

// Get follower count for an agent
export async function getAgentFollowerCount(agentId: string): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*) as count FROM followers WHERE agent_id = $1`,
    [agentId]
  )
  return parseInt(result.rows[0].count, 10)
}

// Get users who follow a community
export async function getCommunityFollowers(communityId: string): Promise<{ id: string; user_id: string; created_at: string }[]> {
  const result = await pool.query(
    `SELECT id, user_id, created_at FROM followers WHERE community_id = $1`,
    [communityId]
  )
  return result.rows
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

// ============= Login Token Functions =============

/**
 * Create a one-time login token for an agent
 * Token expires after specified minutes (default: 10 minutes)
 */
export async function createLoginToken(
  agentId: string,
  expiresInMinutes: number = 10
): Promise<LoginToken> {
  const crypto = await import('crypto')

  const id = `lt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

  const result = await pool.query(
    `INSERT INTO login_tokens (id, agent_id, token, expires_at)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [id, agentId, token, expiresAt.toISOString()]
  )
  return result.rows[0]
}

/**
 * Validate and consume a login token
 * Returns the agent_id if valid, null otherwise
 * Marks token as used to prevent reuse
 */
export async function validateAndConsumeLoginToken(token: string): Promise<{
  valid: boolean
  agent_id?: string
  error?: string
}> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Find the token
    const result = await client.query(
      `SELECT * FROM login_tokens WHERE token = $1`,
      [token]
    )

    if (result.rows.length === 0) {
      await client.query('ROLLBACK')
      return { valid: false, error: 'Token not found' }
    }

    const loginToken: LoginToken = result.rows[0]

    // Check if already used
    if (loginToken.used_at) {
      await client.query('ROLLBACK')
      return { valid: false, error: 'Token already used' }
    }

    // Check if expired
    if (new Date(loginToken.expires_at) < new Date()) {
      await client.query('ROLLBACK')
      return { valid: false, error: 'Token expired' }
    }

    // Mark as used
    await client.query(
      `UPDATE login_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [loginToken.id]
    )

    await client.query('COMMIT')
    return { valid: true, agent_id: loginToken.agent_id }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Get login token by token string (for validation without consuming)
 */
export async function getLoginToken(token: string): Promise<LoginToken | null> {
  const result = await pool.query(
    `SELECT * FROM login_tokens WHERE token = $1`,
    [token]
  )
  return result.rows[0] || null
}

/**
 * Clean up expired login tokens (for maintenance)
 */
export async function cleanupExpiredLoginTokens(): Promise<number> {
  const result = await pool.query(
    `DELETE FROM login_tokens WHERE expires_at < CURRENT_TIMESTAMP`
  )
  return result.rowCount ?? 0
}

/**
 * Revoke all login tokens for an agent
 */
export async function revokeAgentLoginTokens(agentId: string): Promise<number> {
  const result = await pool.query(
    `DELETE FROM login_tokens WHERE agent_id = $1 AND used_at IS NULL`,
    [agentId]
  )
  return result.rowCount ?? 0
}

/**
 * Invalidate all sessions for an agent
 * Sets a timestamp that makes all session tokens issued before this time invalid
 */
export async function invalidateAllAgentSessions(agentId: string): Promise<string> {
  const now = new Date().toISOString()
  await pool.query(
    `UPDATE agents SET sessions_invalidated_at = $1 WHERE id = $2`,
    [now, agentId]
  )
  return now
}

/**
 * Get the session invalidation timestamp for an agent
 */
export async function getAgentSessionInvalidationTime(agentId: string): Promise<string | null> {
  const result = await pool.query(
    `SELECT sessions_invalidated_at FROM agents WHERE id = $1`,
    [agentId]
  )
  return result.rows[0]?.sessions_invalidated_at || null
}

// ============= City Territory Functions =============

/**
 * Get a city by ID
 */
export async function getCity(id: string): Promise<City | null> {
  const result = await pool.query('SELECT * FROM cities WHERE id = $1', [id])
  return result.rows[0] || null
}

/**
 * Get a city by name and country code
 */
export async function getCityByNameAndCountry(name: string, countryCode: string): Promise<City | null> {
  const result = await pool.query(
    'SELECT * FROM cities WHERE name = $1 AND country_code = $2',
    [name, countryCode]
  )
  return result.rows[0] || null
}

/**
 * Get all cities with optional filters
 */
export async function getCities(filters?: {
  country_code?: string
  is_available?: boolean
  is_top_1000?: boolean
  limit?: number
  offset?: number
}): Promise<City[]> {
  let query = 'SELECT * FROM cities WHERE 1=1'
  const params: (string | number | boolean)[] = []
  let paramIndex = 1

  if (filters?.country_code) {
    query += ` AND country_code = $${paramIndex++}`
    params.push(filters.country_code)
  }
  if (filters?.is_available === true) {
    query += ` AND agent_id IS NULL AND is_top_1000 = false`
  }
  if (filters?.is_top_1000 !== undefined) {
    query += ` AND is_top_1000 = $${paramIndex++}`
    params.push(filters.is_top_1000)
  }

  query += ' ORDER BY population DESC NULLS LAST'

  if (filters?.limit) {
    query += ` LIMIT $${paramIndex++}`
    params.push(filters.limit)
  }
  if (filters?.offset) {
    query += ` OFFSET $${paramIndex++}`
    params.push(filters.offset)
  }

  const result = await pool.query(query, params)
  return result.rows
}

/**
 * Get available cities in a country (not assigned and not top 1000)
 */
export async function getAvailableCitiesInCountry(countryCode: string): Promise<City[]> {
  const result = await pool.query(
    `SELECT * FROM cities
     WHERE country_code = $1
       AND agent_id IS NULL
       AND is_top_1000 = false
     ORDER BY population DESC NULLS LAST`,
    [countryCode]
  )
  return result.rows
}

/**
 * Get a random available city in a country
 */
export async function getRandomAvailableCityInCountry(countryCode: string): Promise<City | null> {
  const result = await pool.query(
    `SELECT * FROM cities
     WHERE country_code = $1
       AND agent_id IS NULL
       AND is_top_1000 = false
     ORDER BY RANDOM()
     LIMIT 1`,
    [countryCode]
  )
  return result.rows[0] || null
}

/**
 * Get countries with available city counts
 */
export async function getCountriesWithAvailability(): Promise<{
  country_code: string
  country_name: string
  available_count: number
  total_count: number
}[]> {
  const result = await pool.query(`
    SELECT
      country_code,
      country_name,
      COUNT(*) FILTER (WHERE agent_id IS NULL AND is_top_1000 = false) as available_count,
      COUNT(*) as total_count
    FROM cities
    GROUP BY country_code, country_name
    HAVING COUNT(*) FILTER (WHERE agent_id IS NULL AND is_top_1000 = false) > 0
    ORDER BY country_name
  `)
  return result.rows.map(row => ({
    country_code: row.country_code,
    country_name: row.country_name,
    available_count: parseInt(row.available_count),
    total_count: parseInt(row.total_count)
  }))
}

/**
 * Assign a city to an agent (with transaction and audit logging)
 */
export async function assignCityToAgent(
  cityId: string,
  agentId: string,
  performedBy?: string,
  reason?: string
): Promise<{ success: boolean; city?: City; error?: string }> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Lock the city row for update
    const cityResult = await client.query(
      'SELECT * FROM cities WHERE id = $1 FOR UPDATE',
      [cityId]
    )
    const city = cityResult.rows[0]

    if (!city) {
      await client.query('ROLLBACK')
      return { success: false, error: 'City not found' }
    }

    if (city.agent_id) {
      await client.query('ROLLBACK')
      return { success: false, error: 'City is already occupied' }
    }

    // Check if agent already has a city
    const agentResult = await client.query(
      'SELECT city_id FROM agents WHERE id = $1',
      [agentId]
    )
    if (agentResult.rows[0]?.city_id) {
      await client.query('ROLLBACK')
      return { success: false, error: 'Agent already has a city assigned' }
    }

    // Assign city to agent
    const now = new Date().toISOString()
    await client.query(
      'UPDATE cities SET agent_id = $1, assigned_at = $2 WHERE id = $3',
      [agentId, now, cityId]
    )

    // Update agent with city and location
    await client.query(
      `UPDATE agents SET
         city_id = $1,
         lat = $2,
         lng = $3,
         location_name = $4,
         is_in_ocean = false,
         ocean_moved_at = NULL,
         last_active_at = $5
       WHERE id = $6`,
      [cityId, city.lat, city.lng, `${city.name}, ${city.country_name}`, now, agentId]
    )

    // Log the assignment
    const logId = `cal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await client.query(
      `INSERT INTO city_assignment_log (id, city_id, agent_id, action, performed_by, reason)
       VALUES ($1, $2, $3, 'assigned', $4, $5)`,
      [logId, cityId, agentId, performedBy || null, reason || null]
    )

    await client.query('COMMIT')

    // Return updated city
    const updatedCity = await client.query('SELECT * FROM cities WHERE id = $1', [cityId])
    return { success: true, city: updatedCity.rows[0] }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Release a city from an agent
 */
export async function releaseCityFromAgent(
  agentId: string,
  performedBy?: string,
  reason?: string
): Promise<{ success: boolean; city?: City; error?: string }> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Get the agent's current city
    const agentResult = await client.query(
      'SELECT city_id FROM agents WHERE id = $1',
      [agentId]
    )
    const cityId = agentResult.rows[0]?.city_id

    if (!cityId) {
      await client.query('ROLLBACK')
      return { success: false, error: 'Agent does not have a city assigned' }
    }

    // Release the city
    await client.query(
      'UPDATE cities SET agent_id = NULL, assigned_at = NULL WHERE id = $1',
      [cityId]
    )

    // Update agent (but don't change location yet - that happens when moving to ocean)
    await client.query(
      'UPDATE agents SET city_id = NULL, previous_city_id = $1 WHERE id = $2',
      [cityId, agentId]
    )

    // Log the release
    const logId = `cal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await client.query(
      `INSERT INTO city_assignment_log (id, city_id, agent_id, action, performed_by, reason)
       VALUES ($1, $2, $3, 'released', $4, $5)`,
      [logId, cityId, agentId, performedBy || null, reason || null]
    )

    await client.query('COMMIT')

    const releasedCity = await client.query('SELECT * FROM cities WHERE id = $1', [cityId])
    return { success: true, city: releasedCity.rows[0] }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Get city by agent ID
 */
export async function getCityByAgentId(agentId: string): Promise<City | null> {
  const result = await pool.query(
    'SELECT * FROM cities WHERE agent_id = $1',
    [agentId]
  )
  return result.rows[0] || null
}

/**
 * Create a city (for seeding)
 */
export async function createCity(city: Omit<City, 'created_at' | 'agent_id' | 'assigned_at'>): Promise<City> {
  const result = await pool.query(
    `INSERT INTO cities (id, name, country_code, country_name, lat, lng, population, timezone, is_top_1000)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (name, country_code) DO UPDATE SET
       lat = EXCLUDED.lat,
       lng = EXCLUDED.lng,
       population = EXCLUDED.population,
       timezone = EXCLUDED.timezone,
       is_top_1000 = EXCLUDED.is_top_1000
     RETURNING *`,
    [city.id, city.name, city.country_code, city.country_name, city.lat, city.lng,
     city.population || null, city.timezone || null, city.is_top_1000 || false]
  )
  return result.rows[0]
}

/**
 * Bulk create cities (for seeding)
 */
export async function bulkCreateCities(cities: Omit<City, 'created_at' | 'agent_id' | 'assigned_at'>[]): Promise<number> {
  if (cities.length === 0) return 0

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    let inserted = 0
    for (const city of cities) {
      const result = await client.query(
        `INSERT INTO cities (id, name, country_code, country_name, lat, lng, population, timezone, is_top_1000)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (name, country_code) DO UPDATE SET
           lat = EXCLUDED.lat,
           lng = EXCLUDED.lng,
           population = EXCLUDED.population,
           timezone = EXCLUDED.timezone,
           is_top_1000 = EXCLUDED.is_top_1000`,
        [city.id, city.name, city.country_code, city.country_name, city.lat, city.lng,
         city.population || null, city.timezone || null, city.is_top_1000 || false]
      )
      if ((result.rowCount ?? 0) > 0) inserted++
    }

    await client.query('COMMIT')
    return inserted
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Get city statistics
 */
export async function getCityStats(): Promise<{
  total_cities: number
  assigned_cities: number
  available_cities: number
  top_1000_cities: number
  countries_count: number
}> {
  const result = await pool.query(`
    SELECT
      COUNT(*) as total_cities,
      COUNT(*) FILTER (WHERE agent_id IS NOT NULL) as assigned_cities,
      COUNT(*) FILTER (WHERE agent_id IS NULL AND is_top_1000 = false) as available_cities,
      COUNT(*) FILTER (WHERE is_top_1000 = true) as top_1000_cities,
      COUNT(DISTINCT country_code) as countries_count
    FROM cities
  `)
  return {
    total_cities: parseInt(result.rows[0].total_cities),
    assigned_cities: parseInt(result.rows[0].assigned_cities),
    available_cities: parseInt(result.rows[0].available_cities),
    top_1000_cities: parseInt(result.rows[0].top_1000_cities),
    countries_count: parseInt(result.rows[0].countries_count)
  }
}

/**
 * Get city assignment log for a city or agent
 */
export async function getCityAssignmentLog(options: {
  city_id?: string
  agent_id?: string
  limit?: number
}): Promise<CityAssignmentLog[]> {
  let query = 'SELECT * FROM city_assignment_log WHERE 1=1'
  const params: (string | number)[] = []
  let paramIndex = 1

  if (options.city_id) {
    query += ` AND city_id = $${paramIndex++}`
    params.push(options.city_id)
  }
  if (options.agent_id) {
    query += ` AND agent_id = $${paramIndex++}`
    params.push(options.agent_id)
  }

  query += ' ORDER BY created_at DESC'

  if (options.limit) {
    query += ` LIMIT $${paramIndex++}`
    params.push(options.limit)
  }

  const result = await pool.query(query, params)
  return result.rows
}

/**
 * Update agent's last_active_at timestamp
 */
export async function updateAgentLastActive(agentId: string): Promise<void> {
  await pool.query(
    'UPDATE agents SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1',
    [agentId]
  )
}

/**
 * Get inactive agents (no activity for specified days)
 */
export async function getInactiveAgents(daysInactive: number): Promise<Agent[]> {
  const result = await pool.query(
    `SELECT * FROM agents
     WHERE is_in_ocean = false
       AND city_id IS NOT NULL
       AND (last_active_at IS NULL OR last_active_at < NOW() - INTERVAL '1 day' * $1)
     ORDER BY last_active_at ASC NULLS FIRST`,
    [daysInactive]
  )
  return result.rows
}

/**
 * Move an agent to the ocean (permanent penalty for inactivity)
 */
export async function moveAgentToOcean(
  agentId: string,
  oceanLat: number,
  oceanLng: number,
  performedBy?: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Get the agent's current city
    const agentResult = await client.query(
      'SELECT city_id FROM agents WHERE id = $1',
      [agentId]
    )
    const cityId = agentResult.rows[0]?.city_id

    // Release the city if they have one
    if (cityId) {
      await client.query(
        'UPDATE cities SET agent_id = NULL, assigned_at = NULL WHERE id = $1',
        [cityId]
      )

      // Log the release
      const releaseLogId = `cal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await client.query(
        `INSERT INTO city_assignment_log (id, city_id, agent_id, action, performed_by, reason)
         VALUES ($1, $2, $3, 'moved_to_ocean', $4, $5)`,
        [releaseLogId, cityId, agentId, performedBy || 'system', reason || 'Inactivity penalty']
      )
    }

    // Move agent to ocean
    const now = new Date().toISOString()
    await client.query(
      `UPDATE agents SET
         city_id = NULL,
         previous_city_id = $1,
         lat = $2,
         lng = $3,
         location_name = 'Ocean (Inactive)',
         is_in_ocean = true,
         ocean_moved_at = $4
       WHERE id = $5`,
      [cityId || null, oceanLat, oceanLng, now, agentId]
    )

    await client.query('COMMIT')
    return { success: true }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Get user by ID including role
 */
export async function getUserWithRole(id: string): Promise<User | null> {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
  return result.rows[0] || null
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: 'user' | 'superadmin'): Promise<User | null> {
  const result = await pool.query(
    'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
    [role, userId]
  )
  return result.rows[0] || null
}

/**
 * Check if user is superadmin
 */
export async function isSuperadmin(userId: string): Promise<boolean> {
  const result = await pool.query(
    "SELECT role FROM users WHERE id = $1",
    [userId]
  )
  return result.rows[0]?.role === 'superadmin'
}

// ============= Password Reset Functions =============

/**
 * Create a password reset token for a user
 * Token expires after 1 hour
 */
export async function createPasswordResetToken(userId: string): Promise<PasswordResetToken> {
  const crypto = await import('crypto')

  const id = `prt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Invalidate any existing tokens for this user
  await pool.query(
    'DELETE FROM password_reset_tokens WHERE user_id = $1 AND used_at IS NULL',
    [userId]
  )

  const result = await pool.query(
    `INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [id, userId, token, expiresAt.toISOString()]
  )
  return result.rows[0]
}

/**
 * Validate and consume a password reset token
 * Returns the user_id if valid, null otherwise
 */
export async function validatePasswordResetToken(token: string): Promise<{
  valid: boolean
  user_id?: string
  error?: string
}> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const result = await client.query(
      'SELECT * FROM password_reset_tokens WHERE token = $1',
      [token]
    )

    if (result.rows.length === 0) {
      await client.query('ROLLBACK')
      return { valid: false, error: 'Invalid or expired reset link' }
    }

    const resetToken: PasswordResetToken = result.rows[0]

    if (resetToken.used_at) {
      await client.query('ROLLBACK')
      return { valid: false, error: 'This reset link has already been used' }
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      await client.query('ROLLBACK')
      return { valid: false, error: 'This reset link has expired' }
    }

    // Mark as used
    await client.query(
      'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = $1',
      [resetToken.id]
    )

    await client.query('COMMIT')
    return { valid: true, user_id: resetToken.user_id }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Update a user's password
 */
export async function updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
  const result = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [passwordHash, userId]
  )
  return (result.rowCount ?? 0) > 0
}

/**
 * Clean up expired password reset tokens
 */
export async function cleanupExpiredPasswordResetTokens(): Promise<number> {
  const result = await pool.query(
    'DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP'
  )
  return result.rowCount ?? 0
}

export default pool
