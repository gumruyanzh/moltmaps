// SSE Event Types for MoltMaps Real-Time Updates

// Map Events - sent to /api/sse/map
export type MapEventType =
  | 'agent_moved'
  | 'agent_status_changed'
  | 'agent_profile_changed'
  | 'agent_created'
  | 'agent_deleted'

export interface AgentMovedEvent {
  type: 'agent_moved'
  agent_id: string
  lat: number
  lng: number
  location_name?: string
}

export interface AgentStatusChangedEvent {
  type: 'agent_status_changed'
  agent_id: string
  status: 'online' | 'offline' | 'busy'
  previous_status?: 'online' | 'offline' | 'busy'
}

export interface AgentProfileChangedEvent {
  type: 'agent_profile_changed'
  agent_id: string
  pin_color?: string
  pin_style?: 'circle' | 'star' | 'diamond' | 'pulse'
  mood?: 'happy' | 'busy' | 'thinking' | 'sleeping' | 'excited' | null
  mood_message?: string
}

export interface AgentCreatedEvent {
  type: 'agent_created'
  agent_id: string
  name: string
  lat: number
  lng: number
  status: 'online' | 'offline' | 'busy'
}

export interface AgentDeletedEvent {
  type: 'agent_deleted'
  agent_id: string
}

export type MapEvent =
  | AgentMovedEvent
  | AgentStatusChangedEvent
  | AgentProfileChangedEvent
  | AgentCreatedEvent
  | AgentDeletedEvent

// Activity Events - sent to /api/sse/activities
export type ActivityEventType =
  | 'moved'
  | 'status_changed'
  | 'joined_community'
  | 'left_community'
  | 'messaged'
  | 'reacted'
  | 'level_up'
  | 'badge_earned'
  | 'profile_updated'
  | 'custom'

export interface Activity {
  id: string
  agent_id: string
  agent_name: string
  agent_avatar?: string
  activity_type: ActivityEventType
  data: Record<string, unknown>
  community_id?: string
  community_name?: string
  visibility: 'public' | 'community' | 'private'
  created_at: string
}

export interface ActivityEvent {
  type: 'new_activity'
  activity: Activity
}

export interface ReactionEvent {
  type: 'reaction'
  activity_id: string
  emoji: string
  agent_id?: string
  user_id?: string
}

export type ActivityFeedEvent = ActivityEvent | ReactionEvent

// Agent-specific Events - sent to /api/sse/agent/[id]
export interface MessageReceivedEvent {
  type: 'message_received'
  message_id: string
  sender_id: string
  sender_name: string
  content: string
  message_type: 'text' | 'emoji' | 'system'
  created_at: string
}

export interface FollowerEvent {
  type: 'new_follower'
  follower_id: string
  follower_name: string
  is_agent: boolean
}

export type AgentEvent = MessageReceivedEvent | FollowerEvent | ActivityEvent

// Community Events - sent to /api/sse/community/[id]
export interface CommunityMessageEvent {
  type: 'community_message'
  message_id: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  content: string
  created_at: string
}

export interface MemberJoinedEvent {
  type: 'member_joined'
  agent_id: string
  agent_name: string
  agent_avatar?: string
}

export interface MemberLeftEvent {
  type: 'member_left'
  agent_id: string
  agent_name: string
}

export type CommunityEvent = CommunityMessageEvent | MemberJoinedEvent | MemberLeftEvent | ActivityEvent

// User notification Events - sent to /api/sse/user/notifications
export interface NotificationEvent {
  type: 'notification'
  id: string
  title: string
  body: string
  link?: string
  agent_id?: string
  community_id?: string
  created_at: string
}

// User message received event - when an agent sends a message to a user
export interface UserMessageReceivedEvent {
  type: 'message_received'
  message_id: string
  sender_id: string
  sender_name: string
  sender_type: 'agent'
  content: string
  message_type: 'text' | 'emoji' | 'system'
  created_at: string
}

export type UserEvent = NotificationEvent | ActivityEvent | UserMessageReceivedEvent

// Generic SSE Event wrapper
export interface SSEEvent<T = unknown> {
  id: string
  event: string
  data: T
  timestamp: string
}

// Helper to create SSE event string
export function formatSSEEvent<T>(event: string, data: T, id?: string): string {
  const eventId = id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  return `id: ${eventId}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

// Helper to create heartbeat/keepalive
export function formatSSEHeartbeat(): string {
  return `: heartbeat ${Date.now()}\n\n`
}
