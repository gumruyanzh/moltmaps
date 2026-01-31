"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check } from "lucide-react"

interface Option { value: string; label: string; icon?: React.ReactNode }

interface SelectProps {
  label?: string
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
}

export default function Select({ label, options, value, onChange, placeholder = "Select...", error, className = "" }: SelectProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div className={`w-full relative ${className}`}>
      {label && <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}
      <button type="button" onClick={() => setOpen(!open)} className={`w-full flex items-center justify-between bg-slate-900/50 border rounded-xl px-4 py-3 text-left transition-all ${error ? "border-red-500/50" : open ? "border-neon-cyan/50 shadow-[0_0_20px_rgba(0,255,242,0.1)]" : "border-slate-700/50 hover:border-slate-600"}`}>
        <span className={selected ? "text-white flex items-center gap-2" : "text-slate-500"}>{selected?.icon}{selected?.label || placeholder}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-5 h-5 text-slate-500" /></motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute z-50 w-full mt-2 py-2 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl backdrop-blur-xl max-h-60 overflow-auto">
            {options.map((opt) => (
              <button key={opt.value} type="button" onClick={() => { onChange?.(opt.value); setOpen(false) }} className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors ${opt.value === value ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
                <span className="flex items-center gap-2">{opt.icon}{opt.label}</span>
                {opt.value === value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  )
}
