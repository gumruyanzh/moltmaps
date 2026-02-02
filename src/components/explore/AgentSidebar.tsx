"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Users, MapPin, Star, Search } from "lucide-react"
import Badge from "../ui/Badge"
import SkillBadge from "../agents/SkillBadge"
import { LevelBadge } from "../agents"
import Link from "next/link"

interface DBAgent {
  id: string
  name: string
  description: string | null
  lat: number
  lng: number
  status: 'online' | 'offline' | 'busy'
  skills: string | null
  avatar_url: string | null
  rating: number
  tasks_completed: number
}

interface AgentSidebarProps {
  agents: DBAgent[]
  selectedAgent?: DBAgent | null
  onAgentSelect: (agent: DBAgent) => void
  onAgentHover?: (agent: DBAgent | null) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
}

const getSkillsArray = (skills: string | null): string[] => {
  if (!skills) return []
  return skills.split(',').map(s => s.trim()).filter(Boolean)
}

const statusColors = {
  online: "success" as const,
  offline: "default" as const,
  busy: "warning" as const,
}

export default function AgentSidebar({
  agents,
  selectedAgent,
  onAgentSelect,
  onAgentHover,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: AgentSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const onlineCount = agents.filter(a => a.status === "online").length

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 48 : 380 }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
      className="relative h-full glass-strong border-r border-slate-800/50 flex flex-col"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-neon-cyan transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800/50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">Agents</h2>
                <Badge variant="cyan" size="sm" icon={<Users className="w-3 h-3" />}>
                  {agents.length}
                </Badge>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-neon-cyan transition-colors"
                />
              </div>

              {/* Status filter */}
              <div className="flex gap-1.5">
                {[
                  { value: "all", label: "All" },
                  { value: "online", label: "Online" },
                  { value: "busy", label: "Busy" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => onStatusFilterChange(tab.value)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      statusFilter === tab.value
                        ? "bg-neon-cyan/20 text-neon-cyan"
                        : "bg-slate-800/50 text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-3 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-neon-green" />
                  {onlineCount} online
                </span>
              </div>
            </div>

            {/* Agent list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {agents.map((agent, i) => {
                const skills = getSkillsArray(agent.skills)
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onMouseEnter={() => onAgentHover?.(agent)}
                    onMouseLeave={() => onAgentHover?.(null)}
                  >
                    <div
                      onClick={() => onAgentSelect(agent)}
                      className={`glass rounded-xl p-3 cursor-pointer hover:neon-border transition-all duration-300 ${
                        selectedAgent?.id === agent.id ? "ring-2 ring-neon-cyan" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-sm font-bold text-dark-900">
                            {agent.name.charAt(0)}
                          </div>
                          <span
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-dark-900 ${
                              agent.status === "online" ? "bg-neon-green" :
                              agent.status === "busy" ? "bg-yellow-500" : "bg-slate-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold truncate text-sm">
                              {agent.name}
                            </h3>
                            <Badge variant={statusColors[agent.status]} size="sm">
                              {agent.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              {(agent.rating || 0).toFixed(1)}
                            </span>
                            <LevelBadge agentId={agent.id} size="sm" />
                          </div>
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {skills.slice(0, 2).map((skill) => (
                                <SkillBadge key={skill} skill={skill} size="sm" showIcon={false} />
                              ))}
                              {skills.length > 2 && (
                                <Badge variant="default" size="sm">+{skills.length - 2}</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {agents.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No agents found</p>
                </div>
              )}
            </div>

            {/* Selected agent action */}
            {selectedAgent && (
              <div className="p-3 border-t border-slate-800/50">
                <Link
                  href={`/agent/${selectedAgent.id}`}
                  className="block w-full py-2.5 bg-neon-cyan text-dark-900 font-semibold text-center rounded-xl text-sm hover:opacity-90 transition-opacity"
                >
                  View Profile
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {collapsed && (
        <div className="flex flex-col items-center py-4 gap-2">
          <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-neon-cyan" />
          </div>
          <span className="text-xs text-slate-400">{agents.length}</span>
        </div>
      )}
    </motion.div>
  )
}
