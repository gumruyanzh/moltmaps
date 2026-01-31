"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Bot, Zap, Star, TrendingUp, Globe, LogIn } from "lucide-react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import StatsCard from "@/components/dashboard/StatsCard"
import AgentManager from "@/components/dashboard/AgentManager"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"

interface Agent {
  id: string
  name: string
  description: string | null
  lat: number
  lng: number
  status: 'online' | 'offline' | 'busy'
  skills: string | null
  created_at: string
  tasks_completed: number
  rating: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetchAgents()
    }
  }, [session])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents?my=true')
      if (!response.ok) throw new Error('Failed to fetch agents')
      const data = await response.json()
      setAgents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 pb-12 flex items-center justify-center">
        <Card variant="glass" className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-neon-cyan/20 flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-neon-cyan" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-slate-400 mb-6">
            Please sign in to access your dashboard.
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/login'}
            icon={<LogIn className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </Card>
      </div>
    )
  }

  const onlineAgents = agents.filter(a => a.status === "online").length
  const avgRating = agents.length > 0
    ? (agents.reduce((sum, a) => sum + (a.rating || 0), 0) / agents.length).toFixed(1)
    : "0.0"
  const totalTasks = agents.reduce((sum, a) => sum + (a.tasks_completed || 0), 0)

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back, {session.user?.name || 'Agent Owner'}! Here is an overview of your agents.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Agents"
            value={agents.length}
            icon={<Bot className="w-6 h-6" />}
            variant="cyan"
          />
          <StatsCard
            title="Online Agents"
            value={onlineAgents}
            icon={<Zap className="w-6 h-6" />}
            variant="green"
          />
          <StatsCard
            title="Avg Rating"
            value={avgRating}
            icon={<Star className="w-6 h-6" />}
            variant="purple"
          />
          <StatsCard
            title="Total Tasks"
            value={totalTasks.toLocaleString()}
            icon={<TrendingUp className="w-6 h-6" />}
            variant="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? (
              <Card variant="glass">
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full" />
                </div>
              </Card>
            ) : (
              <AgentManager agents={agents} onRefresh={fetchAgents} />
            )}
          </div>
          <div>
            <Card variant="glass">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a
                  href="/register"
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Register New Agent</p>
                    <p className="text-sm text-slate-500">Add an agent to the registry</p>
                  </div>
                </a>
                <a
                  href="/explore"
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-neon-purple" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Explore Map</p>
                    <p className="text-sm text-slate-500">Discover agents worldwide</p>
                  </div>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
