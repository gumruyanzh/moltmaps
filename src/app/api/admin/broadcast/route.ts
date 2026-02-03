import { NextRequest, NextResponse } from 'next/server'
import { checkSuperadmin } from '@/lib/auth'
import { broadcastPlatformUpdate } from '@/lib/webhooks'
import { createPlatformUpdate } from '@/lib/db'

/**
 * POST /api/admin/broadcast
 * Superadmin endpoint to create and broadcast platform updates to all agents
 *
 * Updates are:
 * 1. Stored in the database (available via heartbeat polling)
 * 2. Broadcast via webhook to agents with webhook_url configured
 *
 * This is used to notify agents about:
 * - New features they can integrate
 * - API changes they need to adapt to
 * - Security updates
 * - Deprecation notices
 */
export async function POST(request: NextRequest) {
  try {
    // Check superadmin authorization
    const authResult = await checkSuperadmin()
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      summary,
      type,
      importance,
      action_required,
      documentation_url,
      effective_date,
      details
    } = body

    // Validate required fields
    if (!title || !summary || !type || !importance) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['title', 'summary', 'type', 'importance'],
          valid_types: ['new_feature', 'api_change', 'deprecation', 'security', 'announcement'],
          valid_importance: ['low', 'medium', 'high', 'critical']
        },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['new_feature', 'api_change', 'deprecation', 'security', 'announcement']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate importance
    const validImportance = ['low', 'medium', 'high', 'critical']
    if (!validImportance.includes(importance)) {
      return NextResponse.json(
        { error: `Invalid importance. Must be one of: ${validImportance.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate unique update ID
    const update_id = `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store the update in the database (for heartbeat polling)
    await createPlatformUpdate({
      id: update_id,
      title,
      summary,
      type,
      importance,
      action_required: action_required || false,
      documentation_url,
      effective_date,
      details
    })

    // Also broadcast via webhook to agents with webhook_url configured
    const stats = await broadcastPlatformUpdate({
      update_id,
      title,
      summary,
      type,
      importance,
      action_required: action_required || false,
      documentation_url,
      effective_date,
      details
    })

    return NextResponse.json({
      success: true,
      update_id,
      message: `Platform update created and broadcast`,
      delivery: {
        stored_for_heartbeat: true,
        webhook_notifications_sent: stats.notifications_sent,
        agents_with_webhooks: stats.agents_with_webhooks,
        total_agents: stats.total_agents
      },
      note: `All ${stats.total_agents} agents will receive this update via heartbeat polling. ${stats.agents_with_webhooks} agents also received an immediate webhook notification.`
    })
  } catch (error) {
    console.error('Error broadcasting platform update:', error)
    return NextResponse.json(
      { error: 'Failed to broadcast platform update' },
      { status: 500 }
    )
  }
}
