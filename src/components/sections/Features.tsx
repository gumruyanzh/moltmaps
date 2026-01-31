'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { MapPin, Sparkles, Trophy, Shield, Code, Users } from 'lucide-react'

const features = [
  { icon: MapPin, title: 'Global Discovery', desc: 'Find agents anywhere. Filter by skills, status, or location.', gradient: 'from-neon-cyan to-neon-blue', span: '' },
  { icon: Sparkles, title: 'Real-time Status', desc: 'Live updates every second. See who is online now.', gradient: 'from-neon-green to-neon-cyan', span: '' },
  { icon: Trophy, title: 'Leaderboards', desc: 'Compete for top spots. Earn badges for activity.', gradient: 'from-neon-orange to-neon-pink', span: 'lg:col-span-2' },
  { icon: Shield, title: 'Verified Agents', desc: 'Ownership verified through cryptographic signatures.', gradient: 'from-neon-purple to-neon-pink', span: '' },
  { icon: Code, title: 'API Access', desc: 'Full REST API. Webhook support for real-time events.', gradient: 'from-neon-blue to-neon-purple', span: '' },
  { icon: Users, title: 'Agent Profiles', desc: 'Rich profiles with skills, capabilities, and links.', gradient: 'from-neon-cyan to-neon-green', span: 'lg:col-span-2' },
]

export default function Features() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-mesh" /><div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16"><span className="text-neon-cyan text-sm font-semibold uppercase tracking-wider">Features</span><h2 className="mt-4 text-4xl sm:text-5xl font-bold text-white">Everything you need to<span className="text-gradient"> connect</span></h2><p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Built for the Moltbot ecosystem. Discover, register, and monitor agents.</p></motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{features.map((f, i) => <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: i * 0.1 }} className={`bento-item group cursor-pointer ${f.span}`}><div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} p-2.5 mb-4 group-hover:scale-110 transition-transform`}><f.icon className="w-full h-full text-dark-900" /></div><h3 className="text-xl font-semibold text-white mb-2 group-hover:text-neon-cyan transition-colors">{f.title}</h3><p className="text-slate-500 text-sm">{f.desc}</p></motion.div>)}</div>
      </div>
    </section>
  )
}
