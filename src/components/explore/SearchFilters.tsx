"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, X, ChevronDown } from "lucide-react"
import Input from "../ui/Input"
import Select from "../ui/Select"
import Badge from "../ui/Badge"
import Button from "../ui/Button"

const skillOptions = [{ value: "coding", label: "Coding" }, { value: "design", label: "Design" }, { value: "data", label: "Data Analysis" }, { value: "web", label: "Web Scraping" }, { value: "automation", label: "Automation" }, { value: "ai", label: "AI/ML" }]
const statusOptions = [{ value: "all", label: "All Status" }, { value: "online", label: "Online Only" }, { value: "busy", label: "Busy" }]
const ratingOptions = [{ value: "all", label: "Any Rating" }, { value: "4.5", label: "4.5+ Stars" }, { value: "4", label: "4+ Stars" }]

interface Filters { search: string; skills: string[]; status: string; minRating: string }
interface SearchFiltersProps { filters: Filters; onChange: (filters: Filters) => void; onClear: () => void }

export default function SearchFilters({ filters, onChange, onClear }: SearchFiltersProps) {
  const [expanded, setExpanded] = useState(false)
  const activeFiltersCount = filters.skills.length + (filters.status !== "all" ? 1 : 0) + (filters.minRating !== "all" ? 1 : 0)
  const toggleSkill = (skill: string) => { const skills = filters.skills.includes(skill) ? filters.skills.filter(s => s !== skill) : [...filters.skills, skill]; onChange({ ...filters, skills }) }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1"><Input placeholder="Search agents by name, skill, or location..." icon={<Search className="w-5 h-5" />} value={filters.search} onChange={(e) => onChange({ ...filters, search: e.target.value })} /></div>
        <Button variant="secondary" onClick={() => setExpanded(!expanded)} className="relative">
          <Filter className="w-4 h-4" /><span className="hidden sm:inline ml-2">Filters</span>
          {activeFiltersCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-cyan text-dark-900 text-xs font-bold rounded-full flex items-center justify-center">{activeFiltersCount}</span>}
          <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </Button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Status" options={statusOptions} value={filters.status} onChange={(v) => onChange({ ...filters, status: v })} />
                <Select label="Minimum Rating" options={ratingOptions} value={filters.minRating} onChange={(v) => onChange({ ...filters, minRating: v })} />
              </div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Skills</label><div className="flex flex-wrap gap-2">{skillOptions.map((skill) => <button key={skill.value} onClick={() => toggleSkill(skill.value)} className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${filters.skills.includes(skill.value) ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan" : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"}`}>{skill.label}</button>)}</div></div>
              {activeFiltersCount > 0 && <div className="flex items-center justify-between pt-2 border-t border-slate-800"><div className="flex flex-wrap gap-2">{filters.skills.map((skill) => <Badge key={skill} variant="cyan" size="sm">{skill}<button onClick={() => toggleSkill(skill)} className="ml-1 hover:text-white"><X className="w-3 h-3" /></button></Badge>)}</div><Button variant="ghost" size="sm" onClick={onClear}>Clear all</Button></div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
