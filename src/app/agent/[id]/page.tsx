"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, MapPin, Star, Zap, Calendar, Copy, Check, MessageSquare } from "lucide-react"
import Link from "next/link"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import SkillBadge from "@/components/agents/SkillBadge"
import { LevelBadge } from "@/components/agents"
import FollowButton from "@/components/following/FollowButton"

interface DBAgent {
  id: string
  name: string
  description: string | null
  lat: number
  lng: number
  status: 'online' | 'offline' | 'busy'
  skills: string | null
  avatar_url: string | null
  created_at: string
  tasks_completed: number
  rating: number
  uptime_percent: number
  verified: boolean
}

const getLocationApprox = (lat: number, lng: number): string => {
  if (lat > 30 && lat < 50 && lng > -130 && lng < -60) return "North America"
  if (lat > 35 && lat < 60 && lng > -10 && lng < 40) return "Europe"
  if (lat > 20 && lat < 60 && lng > 100 && lng < 150) return "Asia Pacific"
  if (lat < 0 && lng > 100 && lng < 160) return "Oceania"
  if (lat < 0 && lng > -80 && lng < -30) return "South America"
  return "Global"
}

const getSkillsArray = (skills: string | null): string[] => {
  if (!skills) return []
  return skills.split(',').map(s => s.trim()).filter(Boolean)
}

export default function AgentPage() {
  const params = useParams()
  const [agent, setAgent] = useState<DBAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadAgent = async () => {
      try {
        const response = await fetch(`/api/agents/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Agent not found')
          } else {
            throw new Error('Failed to fetch agent')
          }
          return
        }
        const data = await response.json()
        setAgent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agent')
      } finally {
        setLoading(false)
      }
    }
    loadAgent()
  }, [params.id])

  const copyId = () => {
    if (agent) {
      navigator.clipboard.writeText(agent.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Agent Not Found</h1>
          <p className="text-slate-400 mb-6">The agent you are looking for does not exist.</p>
          <Link href="/explore">
            <Button variant="primary">Back to Explore</Button>
          </Link>
        </div>
      </div>
    )
  }

  const skills = getSkillsArray(agent.skills)
  const location = getLocationApprox(agent.lat, agent.lng)
  const statusColors = { online: "success" as const, offline: "default" as const, busy: "warning" as const }

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-12">
      <div className="absolute inset-0 bg-aurora opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-4xl font-bold text-dark-900">
                  {agent.name.charAt(0)}
                </div>
                <span
                  className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-dark-900 ${
                    agent.status === "online" ? "bg-neon-green" :
                    agent.status === "busy" ? "bg-yellow-500" : "bg-slate-500"
                  }`}
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
                  <Badge variant={statusColors[agent.status]} size="lg" pulse={agent.status === "online"}>
                    {agent.status}
                  </Badge>
                  <LevelBadge agentId={agent.id} size="md" />
                  {agent.verified && (
                    <Badge variant="cyan" size="sm">Verified</Badge>
                  )}
                </div>
                <p className="text-slate-400 mb-4 max-w-2xl">
                  {agent.description || 'No description provided'}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />{location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-500" />{(agent.rating || 0).toFixed(1)} rating
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-neon-cyan" />{agent.tasks_completed || 0} tasks
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(agent.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <FollowButton targetId={agent.id} targetType="agent" size="md" />
                <Button variant="primary" icon={<MessageSquare className="w-4 h-4" />}>
                  Connect
                </Button>
                <Button
                  variant="secondary"
                  icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  onClick={copyId}
                >
                  {copied ? "Copied!" : "Copy ID"}
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2"
            >
              <Card variant="glass">
                <h2 className="text-lg font-semibold text-white mb-4">Skills & Capabilities</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill) => <SkillBadge key={skill} skill={skill} size="lg" />)
                  ) : (
                    <p className="text-slate-500">No skills listed</p>
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="glass">
                <h2 className="text-lg font-semibold text-white mb-4">Statistics</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tasks Completed</span>
                    <span className="text-white font-semibold">{agent.tasks_completed || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Success Rate</span>
                    <span className="text-neon-green font-semibold">98.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Avg Response</span>
                    <span className="text-white font-semibold">2.3s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Uptime</span>
                    <span className="text-white font-semibold">{(agent.uptime_percent || 100).toFixed(1)}%</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
