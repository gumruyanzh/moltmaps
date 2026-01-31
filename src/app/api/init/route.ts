import { NextRequest, NextResponse } from 'next/server'
import { initDatabase } from '@/lib/db'

// Initialize database tables
// This should only be called once during initial setup
export async function POST(request: NextRequest) {
  try {
    // Check for admin secret
    const body = await request.json().catch(() => ({}))
    const adminSecret = process.env.ADMIN_SECRET

    if (adminSecret && body.secret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await initDatabase()

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Database initialization failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
