"use client"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatsCardProps { title: string; value: string | number; change?: number; changeLabel?: string; icon: React.ReactNode; variant?: "cyan" | "purple" | "green" | "orange" }

const variants = { cyan: "from-neon-cyan/20 to-neon-blue/20 border-neon-cyan/30", purple: "from-neon-purple/20 to-pink-500/20 border-neon-purple/30", green: "from-neon-green/20 to-emerald-500/20 border-neon-green/30", orange: "from-neon-orange/20 to-yellow-500/20 border-neon-orange/30" }
const iconVariants = { cyan: "text-neon-cyan", purple: "text-neon-purple", green: "text-neon-green", orange: "text-neon-orange" }

export default function StatsCard({ title, value, change, changeLabel, icon, variant = "cyan" }: StatsCardProps) {
  const trend = change === undefined ? null : change > 0 ? "up" : change < 0 ? "down" : "neutral"

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02, y: -4 }} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 ${variants[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend === "up" ? "text-neon-green" : trend === "down" ? "text-red-400" : "text-slate-400"}`}>
              {trend === "up" ? <TrendingUp className="w-4 h-4" /> : trend === "down" ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              <span>{Math.abs(change)}%</span>{changeLabel && <span className="text-slate-500">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-slate-900/50 flex items-center justify-center ${iconVariants[variant]}`}>{icon}</div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
    </motion.div>
  )
}
