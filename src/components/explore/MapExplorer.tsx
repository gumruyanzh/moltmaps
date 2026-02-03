"use client"
import { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Maximize2, Minimize2, ZoomIn, ZoomOut, LocateFixed, List, X, Search } from "lucide-react"
import dynamic from "next/dynamic"
import AgentSidebar from "./AgentSidebar"
import MobileAgentSheet from "./MobileAgentSheet"
import ConnectionStatus from "@/components/realtime/ConnectionStatus"

const Map = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-dark-900 flex items-center justify-center">
      <div className="pulse-dot w-4 h-4" />
    </div>
  ),
})

// Database Agent type
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
  // Territory system fields
  location_name?: string | null
  city_id?: string | null
  is_in_ocean?: boolean
}

interface MapExplorerProps {
  agents: DBAgent[]
}

const getSkillsArray = (skills: string | null): string[] => {
  if (!skills) return []
  return skills.split(',').map(s => s.trim()).filter(Boolean)
}

export default function MapExplorer({ agents }: MapExplorerProps) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showSearch, setShowSearch] = useState(false)

  // Map state
  const [selectedAgent, setSelectedAgent] = useState<DBAgent | null>(null)
  const [hoveredAgent, setHoveredAgent] = useState<DBAgent | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0])
  const [mapZoom, setMapZoom] = useState(2)

  // Mobile state
  const [showAgentList, setShowAgentList] = useState(false)

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const skills = getSkillsArray(agent.skills)

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !agent.name.toLowerCase().includes(q) &&
          !skills.some(s => s.toLowerCase().includes(q))
        ) {
          return false
        }
      }
      if (statusFilter !== "all" && agent.status !== statusFilter) return false
      return true
    })
  }, [agents, searchQuery, statusFilter])

  const onlineCount = useMemo(() =>
    filteredAgents.filter(a => a.status === "online").length
  , [filteredAgents])

  const handleAgentSelect = useCallback((agent: DBAgent) => {
    setSelectedAgent(agent)
    setMapCenter([agent.lat, agent.lng])
    setMapZoom(10)
    setShowAgentList(false) // Close mobile sheet when selecting
  }, [])

  return (
    <div className={`flex flex-col ${fullscreen ? "fixed inset-0 z-50 bg-dark-950" : "h-[calc(100vh-64px)] md:h-[calc(100vh-80px)]"}`}>
      {/* Main content - map takes full space on mobile */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AgentSidebar
            agents={filteredAgents}
            selectedAgent={selectedAgent}
            onAgentSelect={handleAgentSelect}
            onAgentHover={setHoveredAgent}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>

        {/* Map container - isolate creates a new stacking context to contain Leaflet's z-indexes */}
        <div className="flex-1 relative isolate">
          <Map
            agents={filteredAgents}
            selectedAgent={selectedAgent}
            hoveredAgent={hoveredAgent}
            center={mapCenter}
            zoom={mapZoom}
            onAgentClick={handleAgentSelect}
            onCenterChange={setMapCenter}
            onZoomChange={setMapZoom}
          />

          {/* Mobile search bar - top overlay */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-0 left-0 right-0 p-3 md:hidden z-20"
              >
                <div className="glass rounded-xl flex items-center gap-2 p-2">
                  <Search className="w-5 h-5 text-slate-400 ml-2" />
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => { setShowSearch(false); setSearchQuery("") }}
                    className="p-2 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile top controls */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start md:hidden z-10">
            <ConnectionStatus showAlways />

            {!showSearch && (
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSearch(true)}
                  className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400"
                >
                  <Search className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFullscreen(!fullscreen)}
                  className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400"
                >
                  {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </motion.button>
              </div>
            )}
          </div>

          {/* Desktop controls - top right */}
          <div className="hidden md:flex absolute top-4 right-4 flex-col gap-2 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setFullscreen(!fullscreen)}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMapZoom(z => Math.min(z + 1, 18))}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <ZoomIn className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMapZoom(z => Math.max(z - 1, 2))}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <ZoomOut className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setMapCenter([20, 0]); setMapZoom(2) }}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <LocateFixed className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Desktop connection status */}
          <div className="hidden md:block absolute top-4 left-4 z-10">
            <ConnectionStatus showAlways />
          </div>

          {/* Mobile zoom controls - right side, vertically centered */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 md:hidden z-10">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMapZoom(z => Math.min(z + 1, 18))}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 active:text-white"
            >
              <ZoomIn className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMapZoom(z => Math.max(z - 1, 2))}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 active:text-white"
            >
              <ZoomOut className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { setMapCenter([20, 0]); setMapZoom(2) }}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 active:text-white"
            >
              <LocateFixed className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Mobile bottom bar with agent list toggle */}
          <div className="absolute bottom-0 left-0 right-0 md:hidden z-10">
            {/* Status legend - compact on mobile */}
            <div className="flex justify-center mb-3">
              <div className="glass rounded-full px-4 py-2">
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-neon-green" />
                    <span className="text-slate-300">{onlineCount}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-slate-400">Busy</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    <span className="text-slate-400">Off</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Agent list toggle button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAgentList(true)}
              className="w-full glass-strong border-t border-slate-800/50 px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
                  <List className="w-5 h-5 text-neon-cyan" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium text-sm">{filteredAgents.length} Agents</p>
                  <p className="text-slate-400 text-xs">{onlineCount} online</p>
                </div>
              </div>
              <div className="text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
            </motion.button>
          </div>

          {/* Desktop status legend */}
          <div className="hidden md:block absolute bottom-4 left-4 glass rounded-xl px-4 py-2 z-10">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-neon-green" />Online
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500" />Busy
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-500" />Offline
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile agent bottom sheet */}
      <MobileAgentSheet
        isOpen={showAgentList}
        onClose={() => setShowAgentList(false)}
        agents={filteredAgents}
        selectedAgent={selectedAgent}
        onAgentSelect={handleAgentSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  )
}
