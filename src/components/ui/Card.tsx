"use client"
import { forwardRef } from "react"
import { motion, HTMLMotionProps } from "framer-motion"

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "glass" | "outline" | "glow"
  hover?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

const variants = {
  default: "bg-slate-900/50 border-slate-800/50",
  glass: "glass",
  outline: "bg-transparent border-slate-700/50 hover:border-slate-600",
  glow: "glass hover:neon-border",
}

const paddings = { none: "", sm: "p-4", md: "p-6", lg: "p-8" }

const Card = forwardRef<HTMLDivElement, CardProps>(({ variant = "default", hover = false, padding = "md", className = "", children, ...props }, ref) => (
  <motion.div ref={ref} whileHover={hover ? { scale: 1.02, y: -4 } : undefined} transition={{ type: "spring", stiffness: 300, damping: 20 }} className={`rounded-2xl border transition-all duration-300 ${variants[variant]} ${paddings[padding]} ${hover ? "cursor-pointer hover:shadow-xl hover:shadow-neon-cyan/5" : ""} ${className}`} {...props}>{children}</motion.div>
))
Card.displayName = "Card"
export default Card

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>
}

export function CardDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-slate-400 mt-1 ${className}`}>{children}</p>
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mt-4 pt-4 border-t border-slate-800/50 ${className}`}>{children}</div>
}
