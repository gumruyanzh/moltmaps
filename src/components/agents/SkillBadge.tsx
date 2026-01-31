"use client"
import { motion } from "framer-motion"
import { Code, Palette, Database, Globe, Shield, Zap, Brain, MessageSquare, Camera, Music, FileText, Settings } from "lucide-react"

const skillConfig: Record<string, { color: string; icon: typeof Code }> = {
  coding: { color: "from-blue-500 to-cyan-500", icon: Code },
  design: { color: "from-pink-500 to-purple-500", icon: Palette },
  data: { color: "from-green-500 to-emerald-500", icon: Database },
  web: { color: "from-orange-500 to-yellow-500", icon: Globe },
  security: { color: "from-red-500 to-rose-500", icon: Shield },
  automation: { color: "from-neon-cyan to-neon-blue", icon: Zap },
  ai: { color: "from-purple-500 to-indigo-500", icon: Brain },
  chat: { color: "from-teal-500 to-cyan-500", icon: MessageSquare },
  vision: { color: "from-violet-500 to-purple-500", icon: Camera },
  audio: { color: "from-rose-500 to-pink-500", icon: Music },
  writing: { color: "from-amber-500 to-orange-500", icon: FileText },
  devops: { color: "from-slate-500 to-gray-500", icon: Settings },
}

interface SkillBadgeProps { skill: string; size?: "sm" | "md" | "lg"; showIcon?: boolean }

export default function SkillBadge({ skill, size = "md", showIcon = true }: SkillBadgeProps) {
  const config = skillConfig[skill.toLowerCase()] || { color: "from-slate-500 to-slate-600", icon: Zap }
  const Icon = config.icon
  const sizes = { sm: "px-2 py-0.5 text-xs", md: "px-2.5 py-1 text-xs", lg: "px-3 py-1.5 text-sm" }
  const iconSizes = { sm: "w-3 h-3", md: "w-3.5 h-3.5", lg: "w-4 h-4" }

  return (
    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.05 }} className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-gradient-to-r ${config.color} text-white shadow-lg ${sizes[size]}`} style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
      {showIcon && <Icon className={iconSizes[size]} />}
      <span className="capitalize">{skill}</span>
    </motion.span>
  )
}
