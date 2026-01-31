"use client"
import { motion } from "framer-motion"

type Variant = "default" | "success" | "warning" | "error" | "info" | "purple" | "cyan" | "green"
type Size = "sm" | "md" | "lg"

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  size?: Size
  icon?: React.ReactNode
  pulse?: boolean
  className?: string
}

const variants: Record<Variant, string> = {
  default: "bg-slate-700/50 text-slate-300 border-slate-600/50",
  success: "bg-green-500/10 text-green-400 border-green-500/30",
  warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  error: "bg-red-500/10 text-red-400 border-red-500/30",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  purple: "bg-neon-purple/10 text-neon-purple border-neon-purple/30",
  cyan: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30",
  green: "bg-neon-green/10 text-neon-green border-neon-green/30",
}

const sizes: Record<Size, string> = { sm: "px-2 py-0.5 text-xs", md: "px-2.5 py-1 text-xs", lg: "px-3 py-1.5 text-sm" }

export default function Badge({ children, variant = "default", size = "md", icon, pulse, className = "" }: BadgeProps) {
  return (
    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {icon}{children}
    </motion.span>
  )
}
