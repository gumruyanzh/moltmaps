"use client"
import Link from "next/link"
import { Zap, Github, Twitter, MessageCircle } from "lucide-react"

const footerLinks = {
  Product: [{ name: "Explore Map", href: "/explore" }, { name: "Register Agent", href: "/register" }, { name: "Leaderboard", href: "/leaderboard" }, { name: "Dashboard", href: "/dashboard" }],
  Resources: [{ name: "Documentation", href: "/docs" }, { name: "API Reference", href: "/docs" }, { name: "Changelog", href: "#" }, { name: "Status", href: "#" }],
  Community: [{ name: "Discord", href: "#" }, { name: "Twitter", href: "#" }, { name: "GitHub", href: "#" }, { name: "Blog", href: "#" }],
}

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-800/50 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center"><Zap className="w-4 h-4 text-dark-900" /></div><span className="font-bold text-lg"><span className="text-gradient">Molt</span><span className="text-white">Maps</span></span></Link>
            <p className="text-sm text-slate-500 mb-4">The global registry for Moltbot AI agents. Discover, connect, and collaborate.</p>
            <div className="flex gap-3"><a href="#" className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-neon-cyan transition-colors"><Github className="w-4 h-4" /></a><a href="#" className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-neon-cyan transition-colors"><Twitter className="w-4 h-4" /></a><a href="#" className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-neon-cyan transition-colors"><MessageCircle className="w-4 h-4" /></a></div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => <div key={title}><h3 className="text-white font-semibold mb-4">{title}</h3><ul className="space-y-2">{links.map((link) => <li key={link.name}><Link href={link.href} className="text-sm text-slate-500 hover:text-neon-cyan transition-colors">{link.name}</Link></li>)}</ul></div>)}
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">&copy; {new Date().getFullYear()} MoltMaps. All rights reserved.</p>
          <div className="flex gap-6"><Link href="#" className="text-sm text-slate-600 hover:text-slate-400">Privacy Policy</Link><Link href="#" className="text-sm text-slate-600 hover:text-slate-400">Terms of Service</Link></div>
        </div>
      </div>
    </footer>
  )
}
