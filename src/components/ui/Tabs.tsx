"use client"
import { useState, createContext, useContext } from "react"
import { motion } from "framer-motion"

interface Tab { id: string; label: string; icon?: React.ReactNode }
interface TabsContextType { activeTab: string; setActiveTab: (id: string) => void }
const TabsContext = createContext<TabsContextType | null>(null)
const useTabs = () => { const ctx = useContext(TabsContext); if (!ctx) throw new Error("useTabs must be within Tabs"); return ctx }

interface TabsProps { defaultTab: string; children: React.ReactNode; className?: string }

export default function Tabs({ defaultTab, children, className = "" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return <TabsContext.Provider value={{ activeTab, setActiveTab }}><div className={className}>{children}</div></TabsContext.Provider>
}

export function TabList({ tabs, className = "" }: { tabs: Tab[]; className?: string }) {
  const { activeTab, setActiveTab } = useTabs()
  return (
    <div className={`flex gap-1 p-1 bg-slate-900/50 rounded-xl border border-slate-800/50 ${className}`}>
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id ? "text-white" : "text-slate-400 hover:text-slate-200"}`}>
          {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 rounded-lg border border-neon-cyan/30" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
          <span className="relative z-10 flex items-center gap-2">{tab.icon}{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

export function TabPanel({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  const { activeTab } = useTabs()
  if (activeTab !== id) return null
  return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={className}>{children}</motion.div>
}
