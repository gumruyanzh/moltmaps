import { NextRequest, NextResponse } from 'next/server'
import { getAgent, getAgentLevel, addExperience, updateAgentLevel, addBadge } from '@/lib/db'
import { sseManager } from '@/lib/sse/manager'
import { getLevelFromXP, checkLevelUp, XP_REWARDS, BADGES } from '@/lib/levels'
import { extractToken, validateToken } from '@/lib/auth-helpers'
import { webhookEvents } from '@/lib/webhooks'

// GET: Get agent level info (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const agent = await getAgent(id)

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    let levelData = await getAgentLevel(id)

    // If no level data exists, create default
    if (!levelData) {
      levelData = {
        agent_id: id,
        level: 1,
        experience_points: 0,
        title: 'Newcomer',
        badges: [],
        updated_at: new Date().toISOString(),
      }
    }

    const levelInfo = getLevelFromXP(levelData.experience_points)

    return NextResponse.json({
      agent_id: id,
      level: levelInfo.level,
      title: levelInfo.title,
      experience_points: levelData.experience_points,
      xp_for_current_level: levelInfo.minXP,
      xp_for_next_level: levelInfo.maxXP === Infinity ? null : levelInfo.maxXP + 1,
      progress_percent: getProgressPercent(levelData.experience_points, levelInfo),
      badges: levelData.badges,
      color: levelInfo.color,
    })
  } catch (error) {
    console.error('Error fetching level:', error)
    return NextResponse.json({ error: 'Failed to fetch level' }, { status: 500 })
  }
}

// POST: Add XP to agent (requires token)
// Token can be provided via:
//   - Authorization: Bearer <token> header (preferred)
//   - token field in request body
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { xp, activity_type, badge_id } = body

    // Extract token from header or body
    const token = extractToken(request, body)
    if (!token) {
      return NextResponse.json({
        error: 'Missing token',
        hint: 'Provide token via Authorization: Bearer <token> header or in request body'
      }, { status: 401 })
    }

    const agent = await getAgent(id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    if (!validateToken(token, agent.verification_token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    // Determine XP to add
    let xpToAdd = 0
    if (typeof xp === 'number' && xp > 0) {
      xpToAdd = Math.min(xp, 1000) // Cap at 1000 per request
    } else if (activity_type && activity_type in XP_REWARDS) {
      xpToAdd = XP_REWARDS[activity_type as keyof typeof XP_REWARDS]
    }

    const currentLevel = await getAgentLevel(id)
    const oldXP = currentLevel?.experience_points || 0

    // Add XP if any
    let newLevelData = currentLevel
    if (xpToAdd > 0) {
      newLevelData = await addExperience(id, xpToAdd)
    }

    const newXP = newLevelData?.experience_points || oldXP + xpToAdd

    // Check for level up
    const leveledUp = checkLevelUp(oldXP, newXP)
    if (leveledUp && newLevelData) {
      await updateAgentLevel(id, leveledUp.level, leveledUp.title)

      // Broadcast level up event via SSE
      sseManager.broadcastActivityEvent({
        type: 'new_activity',
        activity: {
          id: `act_${Date.now()}`,
          agent_id: id,
          agent_name: agent.name,
          agent_avatar: agent.avatar_url || undefined,
          activity_type: 'level_up',
          data: {
            new_level: leveledUp.level,
            new_title: leveledUp.title,
          },
          visibility: 'public',
          created_at: new Date().toISOString(),
        },
      })

      // Send webhook notification for level up
      webhookEvents.levelUp(id, leveledUp.level, leveledUp.title)
    }

    // Add badge if specified
    let badgeAdded = null
    if (badge_id) {
      const badge = BADGES.find(b => b.id === badge_id)
      if (badge) {
        // Check if already has badge
        const hasBadge = newLevelData?.badges?.includes(badge_id)
        if (!hasBadge) {
          await addBadge(id, badge_id)
          badgeAdded = badge

          // Broadcast badge earned via SSE
          sseManager.broadcastActivityEvent({
            type: 'new_activity',
            activity: {
              id: `act_${Date.now()}`,
              agent_id: id,
              agent_name: agent.name,
              agent_avatar: agent.avatar_url || undefined,
              activity_type: 'badge_earned',
              data: {
                badge: badge.name,
                badge_id: badge.id,
                badge_icon: badge.icon,
              },
              visibility: 'public',
              created_at: new Date().toISOString(),
            },
          })

          // Send webhook notification for badge earned
          webhookEvents.badgeEarned(id, badge.id, badge.name)
        }
      }
    }

    const levelInfo = getLevelFromXP(newXP)

    return NextResponse.json({
      success: true,
      agent_id: id,
      xp_added: xpToAdd,
      total_xp: newXP,
      level: levelInfo.level,
      title: levelInfo.title,
      leveled_up: leveledUp ? true : false,
      new_level: leveledUp?.level,
      badge_added: badgeAdded,
    })
  } catch (error) {
    console.error('Error adding XP:', error)
    return NextResponse.json({ error: 'Failed to add XP' }, { status: 500 })
  }
}

// Helper to calculate progress percent
function getProgressPercent(xp: number, levelInfo: { minXP: number; maxXP: number }): number {
  if (levelInfo.maxXP === Infinity) return 100
  const xpInLevel = xp - levelInfo.minXP
  const xpNeeded = levelInfo.maxXP - levelInfo.minXP + 1
  return Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100))
}
