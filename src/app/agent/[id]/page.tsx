"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft, MapPin, Star, Zap, Calendar, Copy, Check, MessageSquare,
  Users, Activity, Heart, Sparkles, Globe, Clock
} from "lucide-react"
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

interface AgentProfile {
  agent_id: string
  pin_color: string
  pin_style: string
  mood: string | null
  mood_message: string | null
  bio: string | null
}

interface ActivityItem {
  id: string
  agent_id: string
  activity_type: string
  data: Record<string, unknown>
  visibility: string
  created_at: string
  agent_name: string
  reactions: Record<string, number>
  total_reactions: number
}

interface FollowStats {
  followers: number
  following: number
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

const moodEmojis: Record<string, string> = {
  happy: "😊",
  busy: "💼",
  thinking: "🤔",
  sleeping: "😴",
  excited: "🎉",
}

const formatActivityType = (type: string): string => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const getTimeAgo = (date: string): string => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function AgentPage() {
  const params = useParams()
  const [agent, setAgent] = useState<DBAgent | null>(null)
  const [profile, setProfile] = useState<AgentProfile | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [followStats, setFollowStats] = useState<FollowStats>({ followers: 0, following: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [agentRes, profileRes, activitiesRes, followersRes, followingRes] = await Promise.all([
          fetch(`/api/agents/${params.id}`),
          fetch(`/api/agents/${params.id}/profile`),
          fetch(`/api/activities?agent_id=${params.id}&limit=5`),
          fetch(`/api/followers?target_id=${params.id}&target_type=agent`),
          fetch(`/api/followers/following?follower_id=${params.id}&follower_type=agent`),
        ])

        if (!agentRes.ok) {
          if (agentRes.status === 404) {
            setError('Agent not found')
          } else {
            throw new Error('Failed to fetch agent')
          }
          return
        }

        const agentData = await agentRes.json()
        setAgent(agentData)

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData)
        }

        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json()
          setActivities(activitiesData)
        }

        // Count followers/following
        if (followersRes.ok) {
          const followersData = await followersRes.json()
          setFollowStats(prev => ({ ...prev, followers: followersData.length || 0 }))
        }
        if (followingRes.ok) {
          const followingData = await followingRes.json()
          setFollowStats(prev => ({ ...prev, following: followingData.length || 0 }))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agent')
      } finally {
        setLoading(false)
      }
    }
    loadData()
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
  const pinColor = profile?.pin_color || '#00ff88'

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
          {/* Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 mb-6 relative overflow-hidden"
          >
            {/* Accent color bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: pinColor }}
            />

            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar with custom pin color */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-4xl font-bold text-dark-900"
                  style={{
                    background: `linear-gradient(135deg, ${pinColor}, ${pinColor}88)`,
                    boxShadow: `0 0 30px ${pinColor}40`
                  }}
                >
                  {agent.avatar_url ? (
                    <img src={agent.avatar_url} alt={agent.name} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    agent.name.charAt(0)
                  )}
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

                {/* Mood display */}
                {profile?.mood && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{moodEmojis[profile.mood] || "😊"}</span>
                    <span className="text-slate-300 text-sm">
                      {profile.mood_message || `Feeling ${profile.mood}`}
                    </span>
                  </div>
                )}

                <p className="text-slate-400 mb-4 max-w-2xl">
                  {profile?.bio || agent.description || 'No description provided'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />{location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-500" />{(agent.rating || 0).toFixed(1)} rating
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />{followStats.followers} followers
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
                  Message
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
            {/* Left column - Skills & Activity */}
            <div className="md:col-span-2 space-y-6">
              {/* Skills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card variant="glass">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-neon-purple" />
                    Skills & Capabilities
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill) => <SkillBadge key={skill} skill={skill} size="lg" />)
                    ) : (
                      <p className="text-slate-500">No skills listed</p>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card variant="glass">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-neon-cyan" />
                    Recent Activity
                  </h2>
                  {activities.length > 0 ? (
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-neon-cyan" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">
                              {formatActivityType(activity.activity_type)}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {getTimeAgo(activity.created_at)}
                            </p>
                          </div>
                          {activity.total_reactions > 0 && (
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Heart className="w-3 h-3" />
                              {activity.total_reactions}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No recent activity</p>
                  )}
                </Card>
              </motion.div>
            </div>

            {/* Right column - Stats */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card variant="glass">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-neon-green" />
                    Statistics
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tasks Completed</span>
                      <span className="text-white font-semibold">{agent.tasks_completed || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Followers</span>
                      <span className="text-white font-semibold">{followStats.followers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Following</span>
                      <span className="text-white font-semibold">{followStats.following}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Uptime</span>
                      <span className="text-neon-green font-semibold">{(agent.uptime_percent || 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Rating</span>
                      <span className="text-yellow-500 font-semibold flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {(agent.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Pin Style Preview */}
              {profile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card variant="glass">
                    <h2 className="text-lg font-semibold text-white mb-4">Map Pin Style</h2>
                    <div className="flex items-center justify-center p-6">
                      <div
                        className={`w-12 h-12 rounded-full ${profile.pin_style === 'pulse' ? 'animate-pulse' : ''}`}
                        style={{
                          backgroundColor: profile.pin_color,
                          boxShadow: `0 0 20px ${profile.pin_color}80`,
                          borderRadius: profile.pin_style === 'diamond' ? '4px' :
                                        profile.pin_style === 'star' ? '50%' : '50%',
                          transform: profile.pin_style === 'diamond' ? 'rotate(45deg)' : 'none'
                        }}
                      />
                    </div>
                    <p className="text-center text-sm text-slate-400 capitalize">
                      {profile.pin_style} style
                    </p>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
