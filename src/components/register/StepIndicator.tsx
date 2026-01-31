"use client"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface Step { id: number; title: string; description?: string }
interface StepIndicatorProps { steps: Step[]; currentStep: number; className?: string }

export default function StepIndicator({ steps, currentStep, className = "" }: StepIndicatorProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, i) => {
        const isComplete = currentStep > step.id
        const isCurrent = currentStep === step.id
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div initial={false} animate={{ scale: isCurrent ? 1.1 : 1 }} className={`relative w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${isComplete ? "bg-neon-green text-dark-900" : isCurrent ? "bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-900 shadow-[0_0_20px_rgba(0,255,242,0.3)]" : "bg-slate-800 text-slate-500 border border-slate-700"}`}>
                {isComplete ? <Check className="w-5 h-5" /> : step.id}
                {isCurrent && <motion.div layoutId="stepPulse" className="absolute inset-0 rounded-full border-2 border-neon-cyan animate-ping opacity-30" />}
              </motion.div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${isCurrent ? "text-white" : isComplete ? "text-slate-300" : "text-slate-500"}`}>{step.title}</p>
                {step.description && <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">{step.description}</p>}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-800" />
                <motion.div initial={{ width: 0 }} animate={{ width: isComplete ? "100%" : "0%" }} transition={{ duration: 0.5 }} className="absolute inset-0 bg-gradient-to-r from-neon-green to-neon-cyan" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
