/**
 * Inactivity Checker
 * Monitors agent activity and moves inactive agents to the ocean
 */

import { getInactiveAgents, moveAgentToOcean, Agent } from './db'
import { getOceanCoordinates } from './ocean-coordinates'

const DEFAULT_INACTIVITY_DAYS = 7

export interface InactivityCheckResult {
  checked: number
  movedToOcean: number
  agents: {
    id: string
    name: string
    previousCity: string | null
    oceanZone: string
    inactiveDays: number
  }[]
  errors: string[]
}

/**
 * Calculate days since last activity
 */
function getDaysSinceActive(lastActiveAt: string | null): number {
  if (!lastActiveAt) {
    return Infinity // Never active
  }
  const lastActive = new Date(lastActiveAt)
  const now = new Date()
  const diffMs = now.getTime() - lastActive.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Check and penalize inactive agents
 * Moves agents who haven't been active for the specified number of days to the ocean
 */
export async function checkAndPenalizeInactiveAgents(
  daysInactive: number = DEFAULT_INACTIVITY_DAYS
): Promise<InactivityCheckResult> {
  const result: InactivityCheckResult = {
    checked: 0,
    movedToOcean: 0,
    agents: [],
    errors: []
  }

  try {
    // Get all inactive agents
    const inactiveAgents = await getInactiveAgents(daysInactive)
    result.checked = inactiveAgents.length

    // Process each inactive agent
    for (const agent of inactiveAgents) {
      try {
        const oceanCoords = getOceanCoordinates(agent.id)
        const inactiveDays = getDaysSinceActive(agent.last_active_at)

        const moveResult = await moveAgentToOcean(
          agent.id,
          oceanCoords.lat,
          oceanCoords.lng,
          'system',
          `Inactive for ${inactiveDays} days (threshold: ${daysInactive} days)`
        )

        if (moveResult.success) {
          result.movedToOcean++
          result.agents.push({
            id: agent.id,
            name: agent.name,
            previousCity: agent.location_name,
            oceanZone: oceanCoords.zoneName,
            inactiveDays
          })
        } else {
          result.errors.push(`Failed to move agent ${agent.id}: ${moveResult.error}`)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        result.errors.push(`Error processing agent ${agent.id}: ${errorMsg}`)
      }
    }

    return result
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    result.errors.push(`Failed to fetch inactive agents: ${errorMsg}`)
    return result
  }
}

/**
 * Get agents approaching inactivity threshold
 * Returns agents who are close to being moved to the ocean
 */
export async function getAgentsApproachingInactivity(
  thresholdDays: number = DEFAULT_INACTIVITY_DAYS,
  warningDays: number = 2
): Promise<{
  agent: Agent
  daysInactive: number
  daysUntilOcean: number
}[]> {
  // Get agents inactive for (threshold - warning) days
  const warningThreshold = thresholdDays - warningDays
  const inactiveAgents = await getInactiveAgents(warningThreshold)

  return inactiveAgents
    .map(agent => {
      const daysInactive = getDaysSinceActive(agent.last_active_at)
      return {
        agent,
        daysInactive,
        daysUntilOcean: Math.max(0, thresholdDays - daysInactive)
      }
    })
    .filter(item => item.daysUntilOcean > 0 && item.daysUntilOcean <= warningDays)
    .sort((a, b) => a.daysUntilOcean - b.daysUntilOcean)
}

/**
 * Check if an agent is approaching inactivity threshold
 */
export async function isAgentApproachingInactivity(
  agentId: string,
  lastActiveAt: string | null,
  thresholdDays: number = DEFAULT_INACTIVITY_DAYS,
  warningDays: number = 2
): Promise<{
  isApproaching: boolean
  daysInactive: number
  daysUntilOcean: number
}> {
  const daysInactive = getDaysSinceActive(lastActiveAt)
  const daysUntilOcean = Math.max(0, thresholdDays - daysInactive)

  return {
    isApproaching: daysUntilOcean > 0 && daysUntilOcean <= warningDays,
    daysInactive,
    daysUntilOcean
  }
}

/**
 * Get the configured inactivity threshold from environment
 */
export function getInactivityThreshold(): number {
  const envValue = process.env.INACTIVITY_DAYS
  if (envValue) {
    const parsed = parseInt(envValue, 10)
    if (!isNaN(parsed) && parsed > 0) {
      return parsed
    }
  }
  return DEFAULT_INACTIVITY_DAYS
}
