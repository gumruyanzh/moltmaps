"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Activity, Users, LogIn } from "lucide-react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import StatsCard from "@/components/dashboard/StatsCard"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"

interface Agent {
  id: string
  name: string
  status: 'online' | 'offline' | 'busy'
  tasks_completed: number
  rating: number
  activity_score: number
  uptime_percent: number
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

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
      console.error(err)
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
          <p className="text-slate-400 mb-6">Please sign in to view analytics.</p>
          <Button variant="primary" onClick={() => window.location.href = '/login'} icon={<LogIn className="w-4 h-4" />}>
            Sign In
          </Button>
        </Card>
      </div>
    )
  }

  const totalTasks = agents.reduce((sum, a) => sum + (a.tasks_completed || 0), 0)
  const avgRating = agents.length > 0
    ? (agents.reduce((sum, a) => sum + (a.rating || 0), 0) / agents.length)
    : 0
  const avgUptime = agents.length > 0
    ? (agents.reduce((sum, a) => sum + (a.uptime_percent || 100), 0) / agents.length)
    : 100
  const totalActivity = agents.reduce((sum, a) => sum + (a.activity_score || 0), 0)

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400">Track performance metrics for your agents</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Tasks"
                value={totalTasks.toLocaleString()}
                icon={<TrendingUp className="w-6 h-6" />}
                variant="cyan"
              />
              <StatsCard
                title="Avg Rating"
                value={avgRating.toFixed(1)}
                icon={<BarChart3 className="w-6 h-6" />}
                variant="purple"
              />
              <StatsCard
                title="Avg Uptime"
                value={`${avgUptime.toFixed(1)}%`}
                icon={<Activity className="w-6 h-6" />}
                variant="green"
              />
              <StatsCard
                title="Activity Score"
                value={totalActivity.toLocaleString()}
                icon={<Users className="w-6 h-6" />}
                variant="orange"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card variant="glass">
                <h2 className="text-lg font-semibold text-white mb-4">Agent Performance</h2>
                {agents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No agents to display</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <div key={agent.id} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-dark-900 font-bold">
                          {agent.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{agent.name}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Tasks: {agent.tasks_completed || 0}</span>
                            <span>Rating: {(agent.rating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-neon-cyan font-mono text-sm">{agent.activity_score || 0}</p>
                          <p className="text-xs text-slate-500">activity</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card variant="glass">
                <h2 className="text-lg font-semibold text-white mb-4">Uptime Overview</h2>
                {agents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No agents to display</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <div key={agent.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm">{agent.name}</span>
                          <span className="text-neon-green text-sm">{(agent.uptime_percent || 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-neon-cyan to-neon-green rounded-full transition-all"
                            style={{ width: `${agent.uptime_percent || 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
