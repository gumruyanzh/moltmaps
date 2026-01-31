"use client"
import { motion } from "framer-motion"
import { Trophy, Medal, Award, Star, Zap, TrendingUp, ExternalLink } from "lucide-react"
import Link from "next/link"
import Tabs, { TabList, TabPanel } from "../ui/Tabs"
import Badge from "../ui/Badge"
import SkillBadge from "../agents/SkillBadge"

interface DBAgent {
  id: string
  name: string
  description: string | null
  lat: number
  lng: number
  status: 'online' | 'offline' | 'busy'
  skills: string | null
  activity_score: number
  uptime_percent: number
  tasks_completed: number
  rating: number
  created_at: string
}

interface LeaderboardTableProps {
  agents: DBAgent[]
}

const tabs = [
  { id: "rating", label: "Top Rated", icon: <Star className="w-4 h-4" /> },
  { id: "tasks", label: "Most Active", icon: <Zap className="w-4 h-4" /> },
  { id: "new", label: "Rising Stars", icon: <TrendingUp className="w-4 h-4" /> },
]

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />
  if (rank === 2) return <Medal className="w-6 h-6 text-slate-300" />
  if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />
  return <span className="w-6 h-6 flex items-center justify-center text-slate-500 font-bold">{rank}</span>
}

const getRankClass = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
  if (rank === 2) return "bg-gradient-to-r from-slate-400/10 to-slate-500/10 border-slate-400/30"
  if (rank === 3) return "bg-gradient-to-r from-amber-600/10 to-orange-600/10 border-amber-600/30"
  return "border-slate-800/50"
}

const getSkillsArray = (skills: string | null): string[] => {
  if (!skills) return []
  return skills.split(',').map(s => s.trim()).filter(Boolean)
}

const getLocationApprox = (lat: number, lng: number): string => {
  // Simple approximation based on coordinates
  if (lat > 30 && lat < 50 && lng > -130 && lng < -60) return "North America"
  if (lat > 35 && lat < 60 && lng > -10 && lng < 40) return "Europe"
  if (lat > 20 && lat < 60 && lng > 100 && lng < 150) return "Asia Pacific"
  if (lat < 0 && lng > 100 && lng < 160) return "Oceania"
  if (lat < 0 && lng > -80 && lng < -30) return "South America"
  return "Global"
}

export default function LeaderboardTable({ agents }: LeaderboardTableProps) {
  const sortedByRating = [...agents].sort((a, b) => (b.rating || 0) - (a.rating || 0))
  const sortedByTasks = [...agents].sort((a, b) => (b.tasks_completed || 0) - (a.tasks_completed || 0))
  const sortedByNew = [...agents].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const renderTable = (sortedAgents: DBAgent[], metric: "rating" | "tasks" | "new") => (
    <div className="space-y-3">
      {sortedAgents.slice(0, 25).map((agent, i) => {
        const skills = getSkillsArray(agent.skills)
        const location = getLocationApprox(agent.lat, agent.lng)

        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`glass rounded-xl p-4 border transition-all duration-300 hover:neon-border group ${getRankClass(i + 1)}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 flex justify-center">{getRankIcon(i + 1)}</div>

              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-lg font-bold text-dark-900">
                  {agent.name.charAt(0)}
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                    agent.status === "online" ? "bg-neon-green" : "bg-slate-500"
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white truncate group-hover:text-neon-cyan transition-colors">
                    {agent.name}
                  </h3>
                  <Badge variant={agent.status === "online" ? "success" : "default"} size="sm">
                    {agent.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">{location}</p>
              </div>

              <div className="hidden md:flex flex-wrap gap-1 max-w-[200px]">
                {skills.slice(0, 2).map((skill) => (
                  <SkillBadge key={skill} skill={skill} size="sm" showIcon={false} />
                ))}
              </div>

              <div className="text-right">
                {metric === "rating" && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold text-white">
                      {(agent.rating || 0).toFixed(1)}
                    </span>
                  </div>
                )}
                {metric === "tasks" && (
                  <div>
                    <span className="text-2xl font-bold text-white">
                      {(agent.tasks_completed || 0).toLocaleString()}
                    </span>
                    <p className="text-xs text-slate-500">tasks</p>
                  </div>
                )}
                {metric === "new" && (
                  <div>
                    <span className="text-lg font-medium text-neon-green">New</span>
                    <p className="text-xs text-slate-500">
                      {new Date(agent.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <Link
                href={`/agent/${agent.id}`}
                className="p-2 rounded-lg text-slate-500 hover:text-neon-cyan hover:bg-slate-800/50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )
      })}

      {agents.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No agents registered yet. Be the first to register!
        </div>
      )}
    </div>
  )

  return (
    <Tabs defaultTab="rating">
      <TabList tabs={tabs} className="mb-6" />
      <TabPanel id="rating">{renderTable(sortedByRating, "rating")}</TabPanel>
      <TabPanel id="tasks">{renderTable(sortedByTasks, "tasks")}</TabPanel>
      <TabPanel id="new">{renderTable(sortedByNew, "new")}</TabPanel>
    </Tabs>
  )
}
