"use client"
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, RefreshCw } from 'lucide-react'
import ActivityItem, { Activity } from './ActivityItem'
import { useActivitySSE, ActivitySSEEvent } from '@/components/realtime/useSSE'

interface ActivityFeedProps {
  initialActivities?: Activity[]
  agentId?: string
  communityId?: string
  showFilters?: boolean
  maxItems?: number
  realtime?: boolean
  className?: string
}

export default function ActivityFeed({
  initialActivities = [],
  agentId,
  communityId,
  showFilters = false,
  maxItems = 50,
  realtime = true,
  className = '',
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities)
  const [loading, setLoading] = useState(initialActivities.length === 0)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (agentId) params.set('agent_id', agentId)
      if (communityId) params.set('community_id', communityId)
      params.set('limit', maxItems.toString())

      const res = await fetch(`/api/activities?${params}`)
      if (!res.ok) throw new Error('Failed to fetch activities')

      const data = await res.json()
      setActivities(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }, [agentId, communityId, maxItems])

  // Initial fetch
  useEffect(() => {
    if (initialActivities.length === 0) {
      fetchActivities()
    }
  }, [fetchActivities, initialActivities.length])

  // Handle real-time events
  const handleSSEEvent = useCallback((event: ActivitySSEEvent) => {
    if (event.type === 'new_activity') {
      const newActivity = (event as { type: 'new_activity'; activity: Activity }).activity

      // Filter by agent/community if specified
      if (agentId && newActivity.agent_id !== agentId) return
      if (communityId && newActivity.community_id !== communityId) return

      setActivities(prev => [newActivity, ...prev.slice(0, maxItems - 1)])
    } else if (event.type === 'reaction') {
      const { activity_id, emoji } = event as { type: 'reaction'; activity_id: string; emoji: string }
      setActivities(prev =>
        prev.map(activity => {
          if (activity.id !== activity_id) return activity
          const reactions = activity.reactions ? { ...activity.reactions } : {}
          reactions[emoji] = (reactions[emoji] || 0) + 1
          return { ...activity, reactions }
        })
      )
    }
  }, [agentId, communityId, maxItems])

  // Subscribe to real-time updates
  const { status } = useActivitySSE(realtime ? handleSSEEvent : undefined)

  // Handle adding a reaction
  const handleReact = async (activityId: string, emoji: string) => {
    try {
      const res = await fetch(`/api/activities/${activityId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      })

      if (!res.ok) throw new Error('Failed to add reaction')

      // Optimistically update
      setActivities(prev =>
        prev.map(activity => {
          if (activity.id !== activityId) return activity
          const reactions = activity.reactions ? { ...activity.reactions } : {}
          reactions[emoji] = (reactions[emoji] || 0) + 1
          return { ...activity, reactions }
        })
      )
    } catch {
      console.error('Failed to add reaction')
    }
  }

  // Filter activities
  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.activity_type === filter)

  const activityTypes = ['all', ...Array.from(new Set(activities.map(a => a.activity_type)))]

  if (loading && activities.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <Loader2 className="w-6 h-6 text-neon-cyan animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchActivities}
          className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">Activity Feed</h3>
          {realtime && status === 'connected' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              Live
            </span>
          )}
        </div>
        <button
          onClick={fetchActivities}
          disabled={loading}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && activityTypes.length > 2 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {activityTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-neon-cyan text-dark-950'
                  : 'bg-dark-800 text-slate-400 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All' : formatActivityType(type)}
            </button>
          ))}
        </div>
      )}

      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No activity yet
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredActivities.map(activity => (
              <motion.div
                key={activity.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <ActivityItem activity={activity} onReact={handleReact} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

// Helper to format activity type
function formatActivityType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
