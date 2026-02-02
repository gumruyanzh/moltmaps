import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredLoginTokens } from '@/lib/db'

/**
 * POST /api/maintenance/cleanup-tokens
 * Clean up expired login tokens
 * Should be called periodically (e.g., via cron job)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the cleanup key for security
    const authHeader = request.headers.get('Authorization')
    const expectedKey = process.env.MAINTENANCE_KEY

    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Clean up expired tokens
    const deletedCount = await cleanupExpiredLoginTokens()

    return NextResponse.json({
      success: true,
      deleted_count: deletedCount,
      message: `Cleaned up ${deletedCount} expired login token(s)`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error cleaning up tokens:', error)
    return NextResponse.json(
      { error: 'Failed to clean up tokens' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/maintenance/cleanup-tokens
 * Get info about the cleanup endpoint
 */
export async function GET() {
  return NextResponse.json({
    description: 'Endpoint for cleaning up expired login tokens',
    method: 'POST',
    authentication: 'Bearer token using MAINTENANCE_KEY environment variable',
    frequency: 'Recommended: hourly via cron job',
  })
}
