"use client"
import { forwardRef } from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { Loader2 } from "lucide-react"

type Variant = "primary" | "secondary" | "ghost" | "danger"
type Size = "sm" | "md" | "lg"

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
}

const variants: Record<Variant, string> = {
  primary: "bg-gradient-to-r from-neon-blue to-neon-cyan text-dark-900 font-semibold shadow-[0_4px_15px_rgba(0,212,255,0.3)] hover:shadow-[0_6px_25px_rgba(0,212,255,0.5)] hover:-translate-y-0.5",
  secondary: "border border-neon-cyan/30 text-neon-cyan bg-transparent hover:bg-neon-cyan/10 hover:border-neon-cyan/60",
  ghost: "text-slate-400 hover:text-white hover:bg-slate-800/50",
  danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
}

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-8 py-4 text-lg rounded-xl",
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  { variant = "primary", size = "md", loading, icon, children, disabled, className = "", ...props }, ref
) => (
  <motion.button
    ref={ref}
    whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
    whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
    {children}
  </motion.button>
))

Button.displayName = "Button"
export default Button
