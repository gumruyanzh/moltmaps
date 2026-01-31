"use client"
import { useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Maximize2, Minimize2, ZoomIn, ZoomOut, LocateFixed } from "lucide-react"
import dynamic from "next/dynamic"
import SearchFilters from "./SearchFilters"
import AgentSidebar from "./AgentSidebar"
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
}

interface MapExplorerProps {
  agents: DBAgent[]
}

const defaultFilters = {
  search: "",
  skills: [] as string[],
  status: "all",
  minRating: "all",
}

const getSkillsArray = (skills: string | null): string[] => {
  if (!skills) return []
  return skills.split(',').map(s => s.trim()).filter(Boolean)
}

export default function MapExplorer({ agents }: MapExplorerProps) {
  const [filters, setFilters] = useState(defaultFilters)
  const [selectedAgent, setSelectedAgent] = useState<DBAgent | null>(null)
  const [hoveredAgent, setHoveredAgent] = useState<DBAgent | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0])
  const [mapZoom, setMapZoom] = useState(2)

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const skills = getSkillsArray(agent.skills)

      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (
          !agent.name.toLowerCase().includes(q) &&
          !skills.some(s => s.toLowerCase().includes(q))
        ) {
          return false
        }
      }
      if (filters.status !== "all" && agent.status !== filters.status) return false
      if (filters.minRating !== "all" && (agent.rating || 0) < parseFloat(filters.minRating)) return false
      if (filters.skills.length > 0 && !filters.skills.some(s => skills.includes(s))) return false
      return true
    })
  }, [agents, filters])

  const handleAgentSelect = useCallback((agent: DBAgent) => {
    setSelectedAgent(agent)
    setMapCenter([agent.lat, agent.lng])
    setMapZoom(10)
  }, [])

  return (
    <div className={`flex flex-col ${fullscreen ? "fixed inset-0 z-50" : "h-[calc(100vh-80px)]"}`}>
      <div className="p-4 bg-dark-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <SearchFilters
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(defaultFilters)}
        />
      </div>
      <div className="flex-1 flex overflow-hidden">
        <AgentSidebar
          agents={filteredAgents}
          selectedAgent={selectedAgent}
          onAgentSelect={handleAgentSelect}
          onAgentHover={setHoveredAgent}
        />
        <div className="flex-1 relative">
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
          <div className="absolute top-4 right-4 flex flex-col gap-2">
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
              onClick={() => setMapZoom(z => Math.max(z - 1, 1))}
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
          <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-2">
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
          <div className="absolute top-4 left-4">
            <ConnectionStatus showAlways />
          </div>
        </div>
      </div>
    </div>
  )
}
