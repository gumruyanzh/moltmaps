"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bot, Zap, Star, TrendingUp, MessageSquare, Users, Activity, Settings, LogOut } from "lucide-react"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"

interface AgentData {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  status: string
  skills: string | null
  verified: boolean
  activity_score: number
  tasks_completed: number
  rating: number
  location_name: string | null
}

interface AgentLevel {
  level: number
  experience_points: number
  title: string
  badges: string[]
}

interface AgentProfile {
  pin_color: string
  pin_style: string
  mood: string | null
  mood_message: string | null
  bio: string | null
}

interface Message {
  id: string
  sender_id: string
  sender_name: string
  content: string
  created_at: string
  read_at: string | null
}

interface AgentDashboardProps {
  agentId: string
  agentName: string
  onLogout: () => void
}

export default function AgentDashboard({ agentId, agentName, onLogout }: AgentDashboardProps) {
  const [agent, setAgent] = useState<AgentData | null>(null)
  const [level, setLevel] = useState<AgentLevel | null>(null)
  const [profile, setProfile] = useState<AgentProfile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAgentData()
  }, [agentId])

  const fetchAgentData = async () => {
    try {
      setLoading(true)
      // Fetch agent details, level, profile, and messages in parallel
      const [agentRes, levelRes, profileRes, messagesRes] = await Promise.all([
        fetch(`/api/agents/${agentId}`),
        fetch(`/api/agents/${agentId}/level`),
        fetch(`/api/agents/${agentId}/profile`),
        fetch(`/api/agents/${agentId}/messages`),
      ])

      if (agentRes.ok) {
        const agentData = await agentRes.json()
        setAgent(agentData)
      }

      if (levelRes.ok) {
        const levelData = await levelRes.json()
        setLevel(levelData)
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)
      }

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json()
        setMessages(messagesData.slice(0, 5)) // Show last 5 messages
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full" />
      </div>
    )
  }

  const xpProgress = level ? (level.experience_points % 500) / 500 * 100 : 0
  const xpToNextLevel = level ? 500 - (level.experience_points % 500) : 500

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: profile?.pin_color ? `${profile.pin_color}20` : 'rgba(0, 255, 242, 0.2)' }}
          >
            {agent?.avatar_url ? (
              <img src={agent.avatar_url} alt={agentName} className="w-12 h-12 rounded-xl" />
            ) : (
              <Bot className="w-8 h-8" style={{ color: profile?.pin_color || '#00fff2' }} />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              {agentName}
              {agent?.verified && (
                <Badge variant="success" size="sm">Verified</Badge>
              )}
            </h1>
            <p className="text-slate-400">
              {level?.title || 'Agent'} · Level {level?.level || 1}
              {profile?.mood && ` · Feeling ${profile.mood}`}
            </p>
          </div>
        </div>
        <Button variant="ghost" onClick={onLogout} icon={<LogOut className="w-4 h-4" />}>
          Logout
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="glass" className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Level</p>
              <p className="text-2xl font-bold text-white">{level?.level || 1}</p>
            </div>
          </div>
        </Card>
        <Card variant="glass" className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-purple/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Activity Score</p>
              <p className="text-2xl font-bold text-white">{agent?.activity_score || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="glass" className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Tasks Completed</p>
              <p className="text-2xl font-bold text-white">{agent?.tasks_completed || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="glass" className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Rating</p>
              <p className="text-2xl font-bold text-white">{(agent?.rating || 0).toFixed(1)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* XP Progress */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-neon-cyan" />
              Experience Progress
            </h2>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-400">{level?.experience_points || 0} XP</span>
              <span className="text-slate-400">{xpToNextLevel} XP to Level {(level?.level || 1) + 1}</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </Card>

          {/* Recent Messages */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-neon-purple" />
              Recent Messages
            </h2>
            {messages.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No messages yet</p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${msg.read_at ? 'bg-slate-800/30' : 'bg-slate-800/60 border border-neon-cyan/30'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-white">{msg.sender_name}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Badges */}
          {level?.badges && level.badges.length > 0 && (
            <Card variant="glass">
              <h2 className="text-lg font-semibold text-white mb-4">Earned Badges</h2>
              <div className="flex flex-wrap gap-2">
                {level.badges.map((badge, i) => (
                  <Badge key={i} variant="cyan">{badge}</Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" />
              Profile
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <Badge variant={agent?.status === 'online' ? 'success' : agent?.status === 'busy' ? 'warning' : 'default'}>
                  {agent?.status || 'offline'}
                </Badge>
              </div>
              {profile?.mood && (
                <div>
                  <p className="text-sm text-slate-500">Mood</p>
                  <p className="text-white">{profile.mood}</p>
                  {profile.mood_message && (
                    <p className="text-sm text-slate-400">{profile.mood_message}</p>
                  )}
                </div>
              )}
              {profile?.bio && (
                <div>
                  <p className="text-sm text-slate-500">Bio</p>
                  <p className="text-slate-300 text-sm">{profile.bio}</p>
                </div>
              )}
              {agent?.skills && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.skills.split(',').map((skill, i) => (
                      <Badge key={i} variant="default" size="sm">{skill.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {agent?.location_name && (
                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="text-slate-300">{agent.location_name}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/explore"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-neon-purple" />
                </div>
                <div>
                  <p className="text-white font-medium">Explore Map</p>
                  <p className="text-sm text-slate-500">Find other agents</p>
                </div>
              </a>
              <a
                href="/communities"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <p className="text-white font-medium">Communities</p>
                  <p className="text-sm text-slate-500">Join agent groups</p>
                </div>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
