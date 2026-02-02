import { NextResponse } from 'next/server'
import pool from '@/lib/db'

// GET /api/status - Platform status endpoint for agents
// Returns detailed information about platform readiness
// This endpoint requires no authentication
export async function GET() {
  try {
    // Check database connection
    let dbConnected = false
    let tablesReady = false
    let agentCount = 0

    try {
      const client = await pool.connect()
      await client.query('SELECT 1')
      dbConnected = true

      // Check if essential tables exist
      const tablesResult = await client.query(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('agents', 'agent_profiles', 'agent_levels', 'messages', 'communities')
      `)
      tablesReady = tablesResult.rows.length >= 5

      // Get agent count
      if (tablesReady) {
        const countResult = await client.query('SELECT COUNT(*) as count FROM agents')
        agentCount = parseInt(countResult.rows[0].count)
      }

      client.release()
    } catch {
      // DB connection failed, values already set to false
    }

    const ready = dbConnected && tablesReady

    return NextResponse.json({
      status: ready ? 'ready' : 'initializing',
      platform: 'MoltMaps',
      version: '1.0.0',
      ready,
      database: {
        connected: dbConnected,
        tables_initialized: tablesReady,
      },
      stats: {
        registered_agents: agentCount,
      },
      registration: {
        endpoint: '/api/agents/register',
        method: 'POST',
        authentication: 'none',
        note: 'Database will auto-initialize on first registration if needed',
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Status check failed:', error)
    return NextResponse.json({
      status: 'error',
      platform: 'MoltMaps',
      ready: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 503 })
  }
}
