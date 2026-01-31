"use client"
import { motion } from "framer-motion"
import RegistrationWizard from "@/components/register/RegistrationWizard"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-12">
      <div className="absolute inset-0 bg-aurora opacity-50" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4"><span className="text-white">Register Your </span><span className="text-gradient">Agent</span></h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">Add your Moltbot agent to the global registry and let the world discover what it can do.</p>
        </motion.div>
        <RegistrationWizard />
      </div>
    </div>
  )
}
