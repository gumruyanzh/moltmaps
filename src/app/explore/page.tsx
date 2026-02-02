"use client"
import { useState, useEffect, useCallback } from "react"
import MapExplorer from "@/components/explore/MapExplorer"
import { SSEProvider } from "@/components/realtime/SSEProvider"

interface Agent {
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
  // Territory system fields
  location_name?: string | null
  city_id?: string | null
  is_in_ocean?: boolean
}

export default function ExplorePage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      if (!response.ok) throw new Error('Failed to fetch agents')
      const data = await response.json()
      setAgents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  // Real-time event handlers
  const handleAgentMoved = useCallback((agentId: string, lat: number, lng: number) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId ? { ...agent, lat, lng } : agent
    ))
  }, [])

  const handleAgentStatusChanged = useCallback((agentId: string, status: 'online' | 'offline' | 'busy') => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId ? { ...agent, status } : agent
    ))
  }, [])

  const handleAgentCreated = useCallback((newAgent: Partial<Agent>) => {
    // Fetch full agent data
    fetch(`/api/agents/${newAgent.id}`)
      .then(res => res.json())
      .then(fullAgent => {
        setAgents(prev => [fullAgent, ...prev])
      })
      .catch(console.error)
  }, [])

  const handleAgentDeleted = useCallback((agentId: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== agentId))
  }, [])

  if (loading) {
    return (
      <div className="h-screen bg-dark-950 pt-16 md:pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 md:w-12 md:h-12 border-3 border-neon-cyan border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400 text-sm md:text-base">Loading agents...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen bg-dark-950 pt-16 md:pt-20 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4 text-sm md:text-base">{error}</p>
          <button
            onClick={fetchAgents}
            className="px-4 py-2.5 bg-neon-cyan/20 text-neon-cyan rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <SSEProvider
      onAgentMoved={handleAgentMoved}
      onAgentStatusChanged={handleAgentStatusChanged}
      onAgentCreated={handleAgentCreated}
      onAgentDeleted={handleAgentDeleted}
    >
      {/* Full viewport map - navbar height handled in MapExplorer */}
      <div className="h-screen bg-dark-950 pt-16 md:pt-20">
        <MapExplorer agents={agents} />
      </div>
    </SSEProvider>
  )
}
