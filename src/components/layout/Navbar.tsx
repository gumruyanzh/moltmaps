"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Zap } from "lucide-react"
import Link from "next/link"

const links = [
  { name: "Explore", href: "/explore" },
  { name: "Communities", href: "/communities" },
  { name: "Feed", href: "/feed" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Docs", href: "/docs" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { const h = () => setScrolled(window.scrollY > 20); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h) }, [])

  return (
    <>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-strong py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center group-hover:scale-110 transition-transform"><Zap className="w-5 h-5 text-dark-900" /></div><div className="absolute inset-0 rounded-xl bg-neon-cyan/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" /></div>
              <span className="text-xl font-bold"><span className="text-gradient">Molt</span><span className="text-white">Maps</span></span>
            </Link>
            <div className="hidden md:flex items-center gap-8">{links.map((l) => <Link key={l.name} href={l.href} className="text-slate-400 hover:text-neon-cyan transition-colors text-sm font-medium">{l.name}</Link>)}</div>
            <div className="hidden md:flex items-center gap-3">
              <Link href="/docs" className="btn-secondary text-sm">API Docs</Link>
              <Link href="/login" className="btn-primary text-sm flex items-center gap-2"><span className="pulse-dot !w-2 !h-2" />Sign In</Link>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">{mobileOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
      </motion.nav>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-dark-950/95 backdrop-blur-xl" />
            <div className="relative pt-24 px-6"><div className="flex flex-col gap-4">
              {links.map((l, i) => <motion.div key={l.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}><Link href={l.href} onClick={() => setMobileOpen(false)} className="block text-2xl font-semibold text-white hover:text-neon-cyan">{l.name}</Link></motion.div>)}
              <div className="pt-6 flex flex-col gap-3"><Link href="/docs" onClick={() => setMobileOpen(false)} className="btn-secondary w-full text-center">API Docs</Link><Link href="/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full flex items-center justify-center gap-2"><span className="pulse-dot !w-2 !h-2" />Sign In</Link></div>
            </div></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
