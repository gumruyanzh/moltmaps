// SSE Connection Manager for MoltMaps
// Handles broadcasting events to connected clients

import { formatSSEEvent, formatSSEHeartbeat, MapEvent, ActivityFeedEvent, AgentEvent, CommunityEvent, UserEvent } from './events'

type ClientId = string
type ChannelType = 'map' | 'activities' | 'agent' | 'community' | 'user'

interface ConnectedClient {
  id: ClientId
  controller: ReadableStreamDefaultController
  channel: ChannelType
  channelId?: string // For agent/community/user specific channels
  connectedAt: Date
  lastHeartbeat: Date
}

class SSEManager {
  private clients: Map<ClientId, ConnectedClient> = new Map()
  private heartbeatInterval: NodeJS.Timeout | null = null
  private static instance: SSEManager | null = null

  private constructor() {
    // Start heartbeat interval
    this.startHeartbeat()
  }

  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager()
    }
    return SSEManager.instance
  }

  private startHeartbeat() {
    // Send heartbeat every 30 seconds to keep connections alive
    if (this.heartbeatInterval) return

    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeatToAll()
    }, 30000)
  }

  private sendHeartbeatToAll() {
    const heartbeat = formatSSEHeartbeat()
    const clients = Array.from(this.clients.values())
    for (const client of clients) {
      try {
        client.controller.enqueue(new TextEncoder().encode(heartbeat))
        client.lastHeartbeat = new Date()
      } catch {
        // Client disconnected, will be cleaned up
        console.log(`[SSE] Client ${client.id} disconnected during heartbeat`)
        this.removeClient(client.id)
      }
    }
  }

  // Register a new client connection
  addClient(
    channel: ChannelType,
    controller: ReadableStreamDefaultController,
    channelId?: string
  ): ClientId {
    const clientId = `${channel}-${channelId || 'global'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const client: ConnectedClient = {
      id: clientId,
      controller,
      channel,
      channelId,
      connectedAt: new Date(),
      lastHeartbeat: new Date(),
    }

    this.clients.set(clientId, client)
    console.log(`[SSE] Client connected: ${clientId} (${this.clients.size} total)`)

    return clientId
  }

  // Remove a client connection
  removeClient(clientId: ClientId): void {
    if (this.clients.has(clientId)) {
      this.clients.delete(clientId)
      console.log(`[SSE] Client disconnected: ${clientId} (${this.clients.size} remaining)`)
    }
  }

  // Get connected client count
  getClientCount(channel?: ChannelType): number {
    if (!channel) return this.clients.size
    return Array.from(this.clients.values()).filter(c => c.channel === channel).length
  }

  // Send event to specific clients based on channel
  private sendToClients(
    channel: ChannelType,
    event: string,
    data: unknown,
    channelId?: string
  ): void {
    const message = formatSSEEvent(event, data)
    const encoded = new TextEncoder().encode(message)

    const clients = Array.from(this.clients.values())
    for (const client of clients) {
      if (client.channel !== channel) continue
      if (channelId && client.channelId !== channelId) continue

      try {
        client.controller.enqueue(encoded)
      } catch {
        console.log(`[SSE] Failed to send to client ${client.id}`)
        this.removeClient(client.id)
      }
    }
  }

  // Broadcast map events (to all /api/sse/map subscribers)
  broadcastMapEvent(event: MapEvent): void {
    this.sendToClients('map', event.type, event)
    console.log(`[SSE] Map event broadcast: ${event.type}`, event)
  }

  // Broadcast activity events (to all /api/sse/activities subscribers)
  broadcastActivityEvent(event: ActivityFeedEvent): void {
    this.sendToClients('activities', event.type, event)
    console.log(`[SSE] Activity event broadcast: ${event.type}`)
  }

  // Send to specific agent's subscribers (to /api/sse/agent/[id] subscribers)
  sendToAgent(agentId: string, event: AgentEvent): void {
    this.sendToClients('agent', event.type, event, agentId)
    console.log(`[SSE] Agent event sent to ${agentId}: ${event.type}`)
  }

  // Send to community subscribers (to /api/sse/community/[id] subscribers)
  sendToCommunity(communityId: string, event: CommunityEvent): void {
    this.sendToClients('community', event.type, event, communityId)
    console.log(`[SSE] Community event sent to ${communityId}: ${event.type}`)
  }

  // Send to user's notification channel (to /api/sse/user/notifications subscribers)
  sendToUser(userId: string, event: UserEvent): void {
    this.sendToClients('user', event.type, event, userId)
    console.log(`[SSE] User event sent to ${userId}: ${event.type}`)
  }

  // Get connection stats
  getStats(): {
    totalConnections: number
    byChannel: Record<ChannelType, number>
  } {
    const byChannel: Record<ChannelType, number> = {
      map: 0,
      activities: 0,
      agent: 0,
      community: 0,
      user: 0,
    }

    const clients = Array.from(this.clients.values())
    for (const client of clients) {
      byChannel[client.channel]++
    }

    return {
      totalConnections: this.clients.size,
      byChannel,
    }
  }

  // Cleanup inactive clients (called periodically)
  cleanupInactiveClients(maxInactiveMs: number = 120000): number {
    const now = Date.now()
    let cleaned = 0

    const clients = Array.from(this.clients.values())
    for (const client of clients) {
      if (now - client.lastHeartbeat.getTime() > maxInactiveMs) {
        this.removeClient(client.id)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`[SSE] Cleaned up ${cleaned} inactive clients`)
    }

    return cleaned
  }
}

// Export singleton instance
export const sseManager = SSEManager.getInstance()

// Helper to create SSE response stream
export function createSSEStream(
  channel: 'map' | 'activities' | 'agent' | 'community' | 'user',
  channelId?: string
): { stream: ReadableStream; clientId: string } {
  let clientId: string

  const stream = new ReadableStream({
    start(controller) {
      clientId = sseManager.addClient(channel, controller, channelId)

      // Send initial connection message
      const connectMessage = formatSSEEvent('connected', {
        clientId,
        channel,
        channelId,
        timestamp: new Date().toISOString(),
      })
      controller.enqueue(new TextEncoder().encode(connectMessage))
    },
    cancel() {
      sseManager.removeClient(clientId)
    },
  })

  return { stream, clientId: clientId! }
}
