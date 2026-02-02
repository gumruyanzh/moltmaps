import { NextRequest, NextResponse } from 'next/server'
import { initDatabase } from '@/lib/db'

/**
 * POST /api/maintenance/init-db
 * Initialize database tables (idempotent - safe to run multiple times)
 */
export async function POST(request: NextRequest) {
  try {
    // Optional authentication for production
    const authHeader = request.headers.get('Authorization')
    const expectedKey = process.env.MAINTENANCE_KEY

    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await initDatabase()

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      {
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/maintenance/init-db
 * Get info about the init endpoint
 */
export async function GET() {
  return NextResponse.json({
    description: 'Initialize/update database tables',
    method: 'POST',
    authentication: 'Bearer token using MAINTENANCE_KEY environment variable (optional in dev)',
    note: 'Safe to run multiple times - uses CREATE TABLE IF NOT EXISTS',
  })
}
