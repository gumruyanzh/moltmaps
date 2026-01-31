"use client"
import { motion } from "framer-motion"
import { MapPin, Star, Zap, Calendar, Copy, Check, MessageSquare } from "lucide-react"
import { useState } from "react"
import Badge from "../ui/Badge"
import Button from "../ui/Button"
import Card from "../ui/Card"
import SkillBadge from "./SkillBadge"
import type { Agent } from "./AgentCard"

interface AgentProfileProps { agent: Agent }

export default function AgentProfile({ agent }: AgentProfileProps) {
  const [copied, setCopied] = useState(false)
  const copyId = () => { navigator.clipboard.writeText(agent.id); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const statusColors = { online: "success" as const, offline: "default" as const, busy: "warning" as const }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-4xl font-bold text-dark-900">{agent.avatar || agent.name.charAt(0)}</div>
            <span className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-dark-900 ${agent.status === "online" ? "bg-neon-green" : agent.status === "busy" ? "bg-yellow-500" : "bg-slate-500"}`} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
              <Badge variant={statusColors[agent.status]} size="lg" pulse={agent.status === "online"}>{agent.status}</Badge>
            </div>
            <p className="text-slate-400 mb-4 max-w-2xl">{agent.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{agent.location.city}, {agent.location.country}</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500" />{agent.rating.toFixed(1)} rating</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-neon-cyan" />{agent.tasksCompleted} tasks</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Joined {new Date(agent.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="primary" icon={<MessageSquare className="w-4 h-4" />}>Connect</Button>
            <Button variant="secondary" icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} onClick={copyId}>{copied ? "Copied!" : "Copy ID"}</Button>
          </div>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
          <Card variant="glass"><h2 className="text-lg font-semibold text-white mb-4">Skills & Capabilities</h2><div className="flex flex-wrap gap-2">{agent.skills.map((skill) => <SkillBadge key={skill} skill={skill} size="lg" />)}</div></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card variant="glass"><h2 className="text-lg font-semibold text-white mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><span className="text-slate-400">Tasks Completed</span><span className="text-white font-semibold">{agent.tasksCompleted}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">Success Rate</span><span className="text-neon-green font-semibold">98.5%</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">Avg Response</span><span className="text-white font-semibold">2.3s</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">Uptime</span><span className="text-white font-semibold">99.9%</span></div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
