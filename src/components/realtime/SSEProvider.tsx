"use client"
import { createContext, useContext, useCallback, useMemo, ReactNode } from 'react'
import { useMapSSE, MapSSEEvent, SSEConnectionStatus } from './useSSE'

// Agent type matching the DB schema
interface DBAgent {
  id: string
  name: string
  description: string | null
  lat: number
  lng: number
  status: 'online' | 'offline' | 'busy'
  skills: string | null
  avatar_url: string | null
  rating: number
  tasks_completed: number
}

interface SSEContextValue {
  connectionStatus: SSEConnectionStatus
  reconnect: () => void
  disconnect: () => void
}

const SSEContext = createContext<SSEContextValue | null>(null)

export function useSSEContext() {
  const context = useContext(SSEContext)
  if (!context) {
    throw new Error('useSSEContext must be used within an SSEProvider')
  }
  return context
}

interface SSEProviderProps {
  children: ReactNode
  onAgentMoved?: (agentId: string, lat: number, lng: number, locationName?: string) => void
  onAgentStatusChanged?: (agentId: string, status: 'online' | 'offline' | 'busy', previousStatus?: string) => void
  onAgentProfileChanged?: (
    agentId: string,
    changes: { pin_color?: string; pin_style?: string; mood?: string; mood_message?: string }
  ) => void
  onAgentCreated?: (agent: Partial<DBAgent>) => void
  onAgentDeleted?: (agentId: string) => void
}

export function SSEProvider({
  children,
  onAgentMoved,
  onAgentStatusChanged,
  onAgentProfileChanged,
  onAgentCreated,
  onAgentDeleted,
}: SSEProviderProps) {
  const handleMapEvent = useCallback(
    (event: MapSSEEvent) => {
      switch (event.type) {
        case 'agent_moved':
          onAgentMoved?.(
            event.agent_id,
            event.lat as number,
            event.lng as number,
            event.location_name as string | undefined
          )
          break
        case 'agent_status_changed':
          onAgentStatusChanged?.(
            event.agent_id,
            event.status as 'online' | 'offline' | 'busy',
            event.previous_status as string | undefined
          )
          break
        case 'agent_profile_changed':
          onAgentProfileChanged?.(event.agent_id, {
            pin_color: event.pin_color as string | undefined,
            pin_style: event.pin_style as string | undefined,
            mood: event.mood as string | undefined,
            mood_message: event.mood_message as string | undefined,
          })
          break
        case 'agent_created':
          onAgentCreated?.({
            id: event.agent_id,
            name: event.name as string,
            lat: event.lat as number,
            lng: event.lng as number,
            status: event.status as 'online' | 'offline' | 'busy',
          })
          break
        case 'agent_deleted':
          onAgentDeleted?.(event.agent_id)
          break
      }
    },
    [onAgentMoved, onAgentStatusChanged, onAgentProfileChanged, onAgentCreated, onAgentDeleted]
  )

  const { status, reconnect, disconnect } = useMapSSE(handleMapEvent)

  const contextValue = useMemo(
    () => ({
      connectionStatus: status,
      reconnect,
      disconnect,
    }),
    [status, reconnect, disconnect]
  )

  return <SSEContext.Provider value={contextValue}>{children}</SSEContext.Provider>
}

// Re-export for convenience
export type { SSEConnectionStatus }
