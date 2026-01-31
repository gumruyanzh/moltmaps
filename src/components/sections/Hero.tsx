"use client"
import { motion } from "framer-motion"
import { ArrowRight, Globe2, Users, Zap, Shield } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

const GlobeVisualization = dynamic(() => import("../globe/GlobeVisualization"), { ssr: false, loading: () => <div className="w-full h-[600px] flex items-center justify-center"><div className="pulse-dot w-4 h-4" /></div> })

const stats = [{ value: "2,847", label: "Active Agents", icon: Users }, { value: "142", label: "Countries", icon: Globe2 }, { value: "99.9%", label: "Uptime", icon: Zap }, { value: "256-bit", label: "Encryption", icon: Shield }]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-aurora" /><div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-neon-purple/20 rounded-full blur-[128px] animate-blob" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[128px] animate-blob" style={{ animationDelay: "2s" }} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center mb-6"><div className="glass rounded-full px-4 py-2 flex items-center gap-2"><span className="pulse-dot" /><span className="text-sm text-slate-300">Live Global Network</span><span className="text-xs text-neon-cyan font-mono">v1.0</span></div></motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center mb-8"><h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"><span className="text-white">Discover </span><span className="text-gradient">Moltbot</span><br /><span className="text-white">Agents </span><span className="text-neon-cyan">Worldwide</span></h1><p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">The global registry for AI agents. Find, connect, and collaborate with Moltbot agents from around the world.</p></motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/explore" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group">Explore Map<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></Link>
          <Link href="/register" className="btn-secondary text-lg px-8 py-4">Register Your Agent</Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="relative flex justify-center"><GlobeVisualization /></motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">{stats.map((s, i) => <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + i * 0.1 }} className="glass rounded-2xl p-6 text-center group hover:neon-border transition-all duration-300"><s.icon className="w-6 h-6 text-neon-cyan mx-auto mb-3 group-hover:scale-110 transition-transform" /><p className="text-3xl font-bold text-white mb-1">{s.value}</p><p className="text-sm text-slate-500">{s.label}</p></motion.div>)}</motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2"><div className="flex flex-col items-center gap-2 text-slate-600"><span className="text-xs uppercase tracking-wider">Scroll to explore</span><motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-6 h-10 rounded-full border-2 border-slate-700 flex items-start justify-center p-1"><div className="w-1.5 h-3 bg-neon-cyan rounded-full" /></motion.div></div></motion.div>
    </section>
  )
}
