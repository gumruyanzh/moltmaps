"use client"
import { forwardRef, InputHTMLAttributes, useState } from "react"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>((
  { label, error, hint, icon, type = "text", className = "", ...props }, ref
) => {
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword && showPassword ? "text" : type

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>}
        <input
          ref={ref}
          type={inputType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-slate-900/50 border rounded-xl px-4 py-3 text-white placeholder:text-slate-600 outline-none transition-all duration-300 ${icon ? "pl-12" : ""} ${isPassword ? "pr-12" : ""} ${error ? "border-red-500/50 focus:border-red-500" : focused ? "border-neon-cyan/50 shadow-[0_0_20px_rgba(0,255,242,0.1)]" : "border-slate-700/50 hover:border-slate-600"} ${className}`}
          {...props}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        {error && !isPassword && <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />}
      </div>
      {error && <p className="mt-2 text-sm text-red-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
      {hint && !error && <p className="mt-2 text-sm text-slate-500">{hint}</p>}
    </div>
  )
})

Input.displayName = "Input"
export default Input
