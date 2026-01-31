"use client"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Grid, List, SortAsc, SortDesc } from "lucide-react"
import AgentCard, { Agent } from "./AgentCard"
import Input from "../ui/Input"
import Select from "../ui/Select"
import Button from "../ui/Button"

interface AgentListProps { agents: Agent[]; onAgentClick?: (agent: Agent) => void; showFilters?: boolean }

const sortOptions = [{ value: "rating", label: "Rating" }, { value: "tasks", label: "Tasks Completed" }, { value: "name", label: "Name" }, { value: "recent", label: "Recently Added" }]
const statusOptions = [{ value: "all", label: "All Status" }, { value: "online", label: "Online" }, { value: "busy", label: "Busy" }, { value: "offline", label: "Offline" }]

export default function AgentList({ agents, onAgentClick, showFilters = true }: AgentListProps) {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortAsc, setSortAsc] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredAgents = useMemo(() => {
    let result = [...agents]
    if (search) { const q = search.toLowerCase(); result = result.filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.skills.some(s => s.toLowerCase().includes(q))) }
    if (statusFilter !== "all") result = result.filter(a => a.status === statusFilter)
    result.sort((a, b) => {
      let cmp = 0
      switch (sortBy) { case "rating": cmp = b.rating - a.rating; break; case "tasks": cmp = b.tasksCompleted - a.tasksCompleted; break; case "name": cmp = a.name.localeCompare(b.name); break; case "recent": cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); break }
      return sortAsc ? -cmp : cmp
    })
    return result
  }, [agents, search, sortBy, statusFilter, sortAsc])

  return (
    <div>
      {showFilters && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1"><Input placeholder="Search agents..." icon={<Search className="w-5 h-5" />} value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <div className="flex gap-2">
              <Select options={statusOptions} value={statusFilter} onChange={setStatusFilter} placeholder="Status" className="w-36" />
              <Select options={sortOptions} value={sortBy} onChange={setSortBy} placeholder="Sort" className="w-36" />
              <Button variant="ghost" size="md" onClick={() => setSortAsc(!sortAsc)} icon={sortAsc ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />} />
              <div className="hidden sm:flex border border-slate-700/50 rounded-lg overflow-hidden">
                <button onClick={() => setViewMode("grid")} className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-400 hover:text-white"}`}><Grid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode("list")} className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-400 hover:text-white"}`}><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500">{filteredAgents.length} agents found</p>
        </div>
      )}
      <AnimatePresence mode="popLayout">
        <motion.div layout className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
          {filteredAgents.map((agent, i) => <motion.div key={agent.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.03 }}><AgentCard agent={agent} compact={viewMode === "list"} onClick={() => onAgentClick?.(agent)} /></motion.div>)}
        </motion.div>
      </AnimatePresence>
      {filteredAgents.length === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12"><p className="text-slate-400">No agents found matching your criteria</p></motion.div>}
    </div>
  )
}
