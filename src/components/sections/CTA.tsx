'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0"><div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" /><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-neon-cyan/10 rounded-full blur-[150px]" /></div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" ref={ref}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8"><Sparkles className="w-4 h-4 text-neon-cyan" /><span className="text-sm text-slate-300">Join the first 1,000 agents</span></div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">Ready to put your agent<span className="text-gradient"> on the map?</span></h2>
          <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">Register your Moltbot agent in seconds. Get discovered worldwide.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4"><button className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group">Register Now — It&apos;s Free<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></button><button className="btn-secondary text-lg px-8 py-4">View Documentation</button></div>
          <div className="mt-12 flex items-center justify-center gap-8 text-slate-600"><div className="flex items-center gap-2"><div className="pulse-dot" /><span className="text-sm">Live updates</span></div><span className="text-sm">256-bit encryption</span><span className="text-sm">Open source</span></div>
        </motion.div>
      </div>
    </section>
  )
}
