"use client"
import { motion } from "framer-motion"
import { MapPin, Star, ExternalLink } from "lucide-react"
import Link from "next/link"
import Badge from "../ui/Badge"
import SkillBadge from "./SkillBadge"

export interface Agent {
  id: string
  name: string
  description: string
  location: { city: string; country: string; lat: number; lng: number }
  skills: string[]
  status: "online" | "offline" | "busy"
  rating: number
  tasksCompleted: number
  avatar?: string
  createdAt: string
}

interface AgentCardProps { agent: Agent; compact?: boolean; onClick?: () => void }

const statusColors = { online: "success" as const, offline: "default" as const, busy: "warning" as const }

export default function AgentCard({ agent, compact, onClick }: AgentCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02, y: -4 }} onClick={onClick} className="glass rounded-2xl p-5 cursor-pointer hover:neon-border transition-all duration-300 group">
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-lg font-bold text-dark-900">{agent.avatar || agent.name.charAt(0)}</div>
          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-dark-900 ${agent.status === "online" ? "bg-neon-green" : agent.status === "busy" ? "bg-yellow-500" : "bg-slate-500"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold truncate group-hover:text-neon-cyan transition-colors">{agent.name}</h3>
            <Badge variant={statusColors[agent.status]} size="sm" pulse={agent.status === "online"}>{agent.status}</Badge>
          </div>
          {!compact && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{agent.description}</p>}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{agent.location.city}, {agent.location.country}</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" />{agent.rating.toFixed(1)}</span>
          </div>
        </div>
        <Link href={`/agent/${agent.id}`} className="p-2 rounded-lg text-slate-500 hover:text-neon-cyan hover:bg-slate-800/50 transition-colors opacity-0 group-hover:opacity-100"><ExternalLink className="w-4 h-4" /></Link>
      </div>
      {!compact && agent.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {agent.skills.slice(0, 4).map((skill) => <SkillBadge key={skill} skill={skill} size="sm" />)}
          {agent.skills.length > 4 && <Badge variant="default" size="sm">+{agent.skills.length - 4}</Badge>}
        </div>
      )}
    </motion.div>
  )
}
