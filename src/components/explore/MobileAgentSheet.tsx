"use client"
import { useRef, useEffect } from "react"
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion"
import { X, Search, Star, ChevronRight } from "lucide-react"
import Badge from "../ui/Badge"
import SkillBadge from "../agents/SkillBadge"
import { LevelBadge } from "../agents"

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

interface MobileAgentSheetProps {
  isOpen: boolean
  onClose: () => void
  agents: DBAgent[]
  selectedAgent?: DBAgent | null
  onAgentSelect: (agent: DBAgent) => void
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

export default function MobileAgentSheet({
  isOpen,
  onClose,
  agents,
  selectedAgent,
  onAgentSelect,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: MobileAgentSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.velocity.y > 500 || info.offset.y > 200) {
      onClose()
    }
  }

  const onlineCount = agents.filter(a => a.status === "online").length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - z-[999] to be above Leaflet map panes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[999] md:hidden"
          />

          {/* Sheet - z-[1000] to be above Leaflet map panes and backdrop */}
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-[1000] md:hidden bg-dark-950 rounded-t-3xl max-h-[85vh] flex flex-col touch-none"
          >
            {/* Drag handle */}
            <div
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-12 h-1.5 rounded-full bg-slate-700" />
            </div>

            {/* Header */}
            <div className="px-4 pb-3 border-b border-slate-800/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Agents</h2>
                  <p className="text-sm text-slate-400">{agents.length} total · {onlineCount} online</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-neon-cyan"
                />
              </div>

              {/* Status filter tabs */}
              <div className="flex gap-2 mt-3">
                {[
                  { value: "all", label: "All" },
                  { value: "online", label: "Online" },
                  { value: "busy", label: "Busy" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => onStatusFilterChange(tab.value)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                      statusFilter === tab.value
                        ? "bg-neon-cyan/20 text-neon-cyan"
                        : "bg-slate-800/50 text-slate-400"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Agent list */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-4 space-y-3">
                {agents.map((agent) => {
                  const skills = getSkillsArray(agent.skills)
                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-slate-800/30 rounded-2xl p-4 active:bg-slate-800/50 transition-colors ${
                        selectedAgent?.id === agent.id ? "ring-2 ring-neon-cyan" : ""
                      }`}
                      onClick={() => onAgentSelect(agent)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-lg font-bold text-dark-900">
                            {agent.name.charAt(0)}
                          </div>
                          <span
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-dark-950 ${
                              agent.status === "online" ? "bg-neon-green" :
                              agent.status === "busy" ? "bg-yellow-500" : "bg-slate-500"
                            }`}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold truncate">
                              {agent.name}
                            </h3>
                            <Badge variant={statusColors[agent.status]} size="sm">
                              {agent.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              {(agent.rating || 0).toFixed(1)}
                            </span>
                            <LevelBadge agentId={agent.id} size="sm" />
                          </div>
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {skills.slice(0, 3).map((skill) => (
                                <SkillBadge key={skill} skill={skill} size="sm" showIcon={false} />
                              ))}
                              {skills.length > 3 && (
                                <Badge variant="default" size="sm">+{skills.length - 3}</Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      </div>
                    </motion.div>
                  )
                })}

                {agents.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                      <Search className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="font-medium">No agents found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>

              {/* Safe area padding for iOS */}
              <div className="h-8" />
            </div>

            {/* Selected agent quick action */}
            {selectedAgent && (
              <div className="p-4 border-t border-slate-800/50 bg-dark-950">
                <button
                  onClick={() => { window.location.href = `/agent/${selectedAgent.id}` }}
                  className="block w-full py-3 bg-neon-cyan text-dark-900 font-semibold text-center rounded-xl active:opacity-90 transition-opacity cursor-pointer"
                >
                  View {selectedAgent.name}&apos;s Profile
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
