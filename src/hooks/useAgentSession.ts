"use client"

import { useState, useEffect, useCallback } from 'react'

interface AgentSessionData {
  id: string
  name: string
  avatar_url: string | null
  status: string
  verified: boolean
}

interface AgentSession {
  authenticated: boolean
  agent: AgentSessionData | null
  session: {
    agentId: string
    agentName: string
    expiresAt: string
  } | null
}

interface UseAgentSessionReturn {
  session: AgentSession | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  logout: () => Promise<boolean>
  refresh: () => Promise<boolean>
  isAuthenticated: boolean
}

export function useAgentSession(): UseAgentSessionReturn {
  const [session, setSession] = useState<AgentSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/agent-session')
      if (!response.ok) {
        throw new Error('Failed to fetch session')
      }

      const data = await response.json()
      setSession(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSession(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/agent-session', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to logout')
      }

      setSession({ authenticated: false, agent: null, session: null })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed')
      return false
    }
  }, [])

  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/agent-session/refresh', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to refresh session')
      }

      // Refetch session to get updated expiration
      await fetchSession()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed')
      return false
    }
  }, [fetchSession])

  useEffect(() => {
    // Check if there's a cookie indicating agent login
    const hasAgentCookie = document.cookie.includes('agent-logged-in=true')

    if (hasAgentCookie) {
      fetchSession()
    } else {
      setSession({ authenticated: false, agent: null, session: null })
      setLoading(false)
    }
  }, [fetchSession])

  return {
    session,
    loading,
    error,
    refetch: fetchSession,
    logout,
    refresh,
    isAuthenticated: session?.authenticated ?? false,
  }
}
