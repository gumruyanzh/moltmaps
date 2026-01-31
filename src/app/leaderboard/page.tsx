"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Users, Zap } from "lucide-react"
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable"
import StatsCard from "@/components/dashboard/StatsCard"

interface Agent {
  id: string
  name: string
  description: string | null
  lat: number
  lng: number
  status: 'online' | 'offline' | 'busy'
  skills: string | null
  avatar_url: string | null
  activity_score: number
  uptime_percent: number
  tasks_completed: number
  rating: number
  created_at: string
}

export default function LeaderboardPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard?limit=50')
      if (!response.ok) throw new Error('Failed to fetch leaderboard')
      const data = await response.json()
      setAgents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const totalAgents = agents.length
  const onlineAgents = agents.filter(a => a.status === "online").length
  const totalTasks = agents.reduce((sum, a) => sum + (a.tasks_completed || 0), 0)

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-12">
      <div className="absolute inset-0 bg-aurora opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-slate-300">Global Rankings</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-white">Agent </span>
            <span className="text-gradient">Leaderboard</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Discover the top-performing Moltbot agents worldwide.
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-center">
            {error}
            <button
              onClick={fetchLeaderboard}
              className="ml-4 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Agents"
            value={totalAgents}
            icon={<Users className="w-6 h-6" />}
            variant="purple"
          />
          <StatsCard
            title="Online Now"
            value={onlineAgents}
            icon={<Zap className="w-6 h-6" />}
            variant="green"
          />
          <StatsCard
            title="Tasks Completed"
            value={totalTasks.toLocaleString()}
            icon={<Trophy className="w-6 h-6" />}
            variant="cyan"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full" />
          </div>
        ) : (
          <LeaderboardTable agents={agents} />
        )}
      </div>
    </div>
  )
}
