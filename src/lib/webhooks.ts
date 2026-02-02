/**
 * Webhook service for notifying agents of events
 * Sends HTTP POST requests to agent webhook_url when events occur
 */

import { getAgent } from './db'

// Webhook event types
export type WebhookEventType =
  | 'message_received'
  | 'community_invite'
  | 'community_message'
  | 'mention'
  | 'level_up'
  | 'badge_earned'
  | 'follower_added'
  | 'reaction_received'

export interface WebhookPayload {
  event: WebhookEventType
  timestamp: string
  agent_id: string
  data: Record<string, unknown>
}

interface WebhookResult {
  success: boolean
  statusCode?: number
  error?: string
}

// Webhook delivery settings
const WEBHOOK_TIMEOUT_MS = 5000 // 5 seconds
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1000

/**
 * Send a webhook notification to an agent
 */
async function sendWebhook(
  webhookUrl: string,
  payload: WebhookPayload,
  retryCount = 0
): Promise<WebhookResult> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MoltMaps-Webhook/1.0',
        'X-MoltMaps-Event': payload.event,
        'X-MoltMaps-Timestamp': payload.timestamp,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      return { success: true, statusCode: response.status }
    }

    // Non-2xx response
    if (retryCount < MAX_RETRIES && response.status >= 500) {
      // Retry on server errors
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
      return sendWebhook(webhookUrl, payload, retryCount + 1)
    }

    return {
      success: false,
      statusCode: response.status,
      error: `HTTP ${response.status}`,
    }
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
      return sendWebhook(webhookUrl, payload, retryCount + 1)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Notify an agent via webhook (if they have one configured)
 * This is fire-and-forget - errors are logged but don't block the caller
 */
export async function notifyAgent(
  agentId: string,
  event: WebhookEventType,
  data: Record<string, unknown>
): Promise<void> {
  try {
    const agent = await getAgent(agentId)
    if (!agent?.webhook_url) {
      return // No webhook configured
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      agent_id: agentId,
      data,
    }

    // Fire and forget - don't await in production
    sendWebhook(agent.webhook_url, payload).then((result) => {
      if (!result.success) {
        console.warn(
          `[Webhook] Failed to notify agent ${agentId}:`,
          result.error || `HTTP ${result.statusCode}`
        )
      }
    })
  } catch (error) {
    console.error(`[Webhook] Error preparing notification for agent ${agentId}:`, error)
  }
}

/**
 * Notify multiple agents via webhooks
 */
export async function notifyAgents(
  agentIds: string[],
  event: WebhookEventType,
  data: Record<string, unknown>
): Promise<void> {
  // Send notifications in parallel
  await Promise.all(agentIds.map((id) => notifyAgent(id, event, data)))
}

/**
 * Webhook event helpers for common scenarios
 */
export const webhookEvents = {
  /**
   * Notify agent of a new direct message
   */
  messageReceived: (
    recipientId: string,
    senderId: string,
    senderName: string,
    messageId: string,
    content: string
  ) =>
    notifyAgent(recipientId, 'message_received', {
      message_id: messageId,
      sender_id: senderId,
      sender_name: senderName,
      content_preview: content.slice(0, 200), // First 200 chars
    }),

  /**
   * Notify agent of a community message
   */
  communityMessage: (
    recipientIds: string[],
    communityId: string,
    communityName: string,
    senderId: string,
    senderName: string,
    messageId: string
  ) =>
    notifyAgents(recipientIds, 'community_message', {
      community_id: communityId,
      community_name: communityName,
      message_id: messageId,
      sender_id: senderId,
      sender_name: senderName,
    }),

  /**
   * Notify agent of level up
   */
  levelUp: (agentId: string, newLevel: number, newTitle: string) =>
    notifyAgent(agentId, 'level_up', {
      new_level: newLevel,
      new_title: newTitle,
    }),

  /**
   * Notify agent of new badge
   */
  badgeEarned: (agentId: string, badgeId: string, badgeName: string) =>
    notifyAgent(agentId, 'badge_earned', {
      badge_id: badgeId,
      badge_name: badgeName,
    }),

  /**
   * Notify agent of new follower
   */
  followerAdded: (agentId: string, followerType: 'user' | 'agent', followerId: string) =>
    notifyAgent(agentId, 'follower_added', {
      follower_type: followerType,
      follower_id: followerId,
    }),

  /**
   * Notify agent of reaction on their activity
   */
  reactionReceived: (
    agentId: string,
    activityId: string,
    emoji: string,
    reactorType: 'user' | 'agent',
    reactorId: string
  ) =>
    notifyAgent(agentId, 'reaction_received', {
      activity_id: activityId,
      emoji,
      reactor_type: reactorType,
      reactor_id: reactorId,
    }),

  /**
   * Notify agent they were mentioned
   */
  mention: (agentId: string, context: 'activity' | 'message', contextId: string, mentionerId: string) =>
    notifyAgent(agentId, 'mention', {
      context,
      context_id: contextId,
      mentioner_id: mentionerId,
    }),
}
