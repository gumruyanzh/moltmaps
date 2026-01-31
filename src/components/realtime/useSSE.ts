"use client"
import { useEffect, useRef, useState, useCallback } from 'react'

export type SSEConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface UseSSEOptions {
  url: string
  onMessage?: (event: MessageEvent) => void
  onError?: (error: Event) => void
  onOpen?: () => void
  onClose?: () => void
  reconnectDelay?: number
  maxReconnectAttempts?: number
  eventTypes?: string[]
}

export interface UseSSEReturn {
  status: SSEConnectionStatus
  lastEvent: MessageEvent | null
  error: Event | null
  reconnect: () => void
  disconnect: () => void
}

export function useSSE({
  url,
  onMessage,
  onError,
  onOpen,
  onClose,
  reconnectDelay = 3000,
  maxReconnectAttempts = 10,
  eventTypes = [],
}: UseSSEOptions): UseSSEReturn {
  const [status, setStatus] = useState<SSEConnectionStatus>('disconnected')
  const [lastEvent, setLastEvent] = useState<MessageEvent | null>(null)
  const [error, setError] = useState<Event | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Use refs to avoid dependency issues
  const onMessageRef = useRef(onMessage)
  const onErrorRef = useRef(onError)
  const onOpenRef = useRef(onOpen)
  const onCloseRef = useRef(onClose)

  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage
    onErrorRef.current = onError
    onOpenRef.current = onOpen
    onCloseRef.current = onClose
  }, [onMessage, onError, onOpen, onClose])

  const connect = useCallback(() => {
    // Don't connect in SSR
    if (typeof window === 'undefined') return

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setStatus('connecting')
    setError(null)

    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setStatus('connected')
      reconnectAttemptsRef.current = 0
      onOpenRef.current?.()
    }

    eventSource.onerror = (e) => {
      setError(e)
      setStatus('error')
      onErrorRef.current?.(e)

      // Auto-reconnect
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++
        console.log(
          `[SSE] Reconnecting in ${reconnectDelay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
        )
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, reconnectDelay)
      } else {
        console.log('[SSE] Max reconnect attempts reached')
        setStatus('disconnected')
      }
    }

    // Handle default message event
    eventSource.onmessage = (e) => {
      setLastEvent(e)
      onMessageRef.current?.(e)
    }

    // Handle specific event types
    eventTypes.forEach((eventType) => {
      eventSource.addEventListener(eventType, ((e: MessageEvent) => {
        setLastEvent(e)
        onMessageRef.current?.(e)
      }) as EventListener)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, reconnectDelay, maxReconnectAttempts, JSON.stringify(eventTypes)])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setStatus('disconnected')
    onCloseRef.current?.()
  }, [])

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0
    disconnect()
    connect()
  }, [disconnect, connect])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
    // Only run on mount/unmount and when URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return {
    status,
    lastEvent,
    error,
    reconnect,
    disconnect,
  }
}

// Typed hook for map events
export interface MapSSEEvent {
  type: 'agent_moved' | 'agent_status_changed' | 'agent_profile_changed' | 'agent_created' | 'agent_deleted'
  agent_id: string
  [key: string]: unknown
}

export function useMapSSE(onEvent?: (event: MapSSEEvent) => void) {
  const handleMessage = useCallback(
    (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        onEvent?.(data)
      } catch {
        // Ignore parse errors (heartbeats, etc.)
      }
    },
    [onEvent]
  )

  return useSSE({
    url: '/api/sse/map',
    onMessage: handleMessage,
    eventTypes: [
      'connected',
      'agent_moved',
      'agent_status_changed',
      'agent_profile_changed',
      'agent_created',
      'agent_deleted',
    ],
  })
}

// Typed hook for activity feed
export interface ActivitySSEEvent {
  type: 'new_activity' | 'reaction'
  [key: string]: unknown
}

export function useActivitySSE(onEvent?: (event: ActivitySSEEvent) => void) {
  const handleMessage = useCallback(
    (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        onEvent?.(data)
      } catch {
        // Ignore parse errors
      }
    },
    [onEvent]
  )

  return useSSE({
    url: '/api/sse/activities',
    onMessage: handleMessage,
    eventTypes: ['connected', 'new_activity', 'reaction'],
  })
}

// Typed hook for agent-specific events
export function useAgentSSE(agentId: string, onEvent?: (event: unknown) => void) {
  const handleMessage = useCallback(
    (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        onEvent?.(data)
      } catch {
        // Ignore parse errors
      }
    },
    [onEvent]
  )

  return useSSE({
    url: `/api/sse/agent/${agentId}`,
    onMessage: handleMessage,
    eventTypes: ['connected', 'message_received', 'new_follower', 'new_activity'],
  })
}

// Typed hook for community events
export function useCommunitySSE(communityId: string, onEvent?: (event: unknown) => void) {
  const handleMessage = useCallback(
    (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        onEvent?.(data)
      } catch {
        // Ignore parse errors
      }
    },
    [onEvent]
  )

  return useSSE({
    url: `/api/sse/community/${communityId}`,
    onMessage: handleMessage,
    eventTypes: ['connected', 'community_message', 'member_joined', 'member_left', 'new_activity'],
  })
}

// Typed hook for user notifications
export function useUserNotificationsSSE(onEvent?: (event: unknown) => void) {
  const handleMessage = useCallback(
    (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        onEvent?.(data)
      } catch {
        // Ignore parse errors
      }
    },
    [onEvent]
  )

  return useSSE({
    url: '/api/sse/user/notifications',
    onMessage: handleMessage,
    eventTypes: ['connected', 'notification', 'new_activity'],
  })
}
