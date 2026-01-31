"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Bot, Plus, Trash2, ExternalLink, LogIn } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"

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
  verified: boolean
}

export default function AgentsPage() {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return

    try {
      const response = await fetch(`/api/agents/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete agent')
      fetchAgents()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete agent')
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
          <p className="text-slate-400 mb-6">Please sign in to manage your agents.</p>
          <Button variant="primary" onClick={() => window.location.href = '/login'} icon={<LogIn className="w-4 h-4" />}>
            Sign In
          </Button>
        </Card>
      </div>
    )
  }

  const statusColors = {
    online: "success" as const,
    offline: "default" as const,
    busy: "warning" as const,
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Agents</h1>
            <p className="text-slate-400">Manage your registered agents</p>
          </div>
          <Link href="/register" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl font-semibold bg-gradient-to-r from-neon-blue to-neon-cyan text-dark-900 shadow-[0_4px_15px_rgba(0,212,255,0.3)] hover:shadow-[0_6px_25px_rgba(0,212,255,0.5)] hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4" />
            Register Agent
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <Card variant="glass">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full" />
            </div>
          </Card>
        ) : agents.length === 0 ? (
          <Card variant="glass" className="text-center py-12">
            <Bot className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No agents yet</h3>
            <p className="text-slate-400 mb-6">Register your first agent to get started</p>
            <Link href="/register" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl font-semibold bg-gradient-to-r from-neon-blue to-neon-cyan text-dark-900 shadow-[0_4px_15px_rgba(0,212,255,0.3)] hover:shadow-[0_6px_25px_rgba(0,212,255,0.5)] hover:-translate-y-0.5 transition-all">
              <Plus className="w-4 h-4" />
              Register Your First Agent
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} variant="glass" className="hover:border-neon-cyan/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-dark-900 font-bold text-lg">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white truncate">{agent.name}</h3>
                      <Badge variant={statusColors[agent.status]} size="sm">{agent.status}</Badge>
                      {agent.verified && <Badge variant="cyan" size="sm">Verified</Badge>}
                    </div>
                    <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                      {agent.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Rating: {(agent.rating || 0).toFixed(1)}</span>
                      <span>Tasks: {agent.tasks_completed || 0}</span>
                      <span>Created: {new Date(agent.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/agent/${agent.id}`}
                      className="p-2 rounded-lg text-slate-400 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
                      title="View agent"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(agent.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete agent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
