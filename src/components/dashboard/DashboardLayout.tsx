"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Bot, Settings, Bell, ChevronLeft, ChevronRight, LogOut, BarChart3 } from "lucide-react"

const navItems = [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard }, { href: "/dashboard/agents", label: "My Agents", icon: Bot }, { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 }, { href: "/dashboard/notifications", label: "Notifications", icon: Bell }, { href: "/dashboard/settings", label: "Settings", icon: Settings }]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <motion.aside initial={false} animate={{ width: collapsed ? 80 : 280 }} transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} className="fixed left-0 top-0 h-screen glass-strong border-r border-slate-800/50 flex flex-col z-40">
        <div className="p-4 flex items-center justify-between border-b border-slate-800/50">
          {!collapsed && <Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center"><Bot className="w-4 h-4 text-dark-900" /></div><span className="font-bold text-white">MoltMaps</span></Link>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">{collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}</button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}><item.icon className="w-5 h-5 flex-shrink-0" />{!collapsed && <span className="font-medium">{item.label}</span>}</Link>
          })}
        </nav>
        <div className="p-4 border-t border-slate-800/50">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-dark-900 font-bold">U</div>
            {!collapsed && <div className="flex-1"><p className="text-sm font-medium text-white">User</p><p className="text-xs text-slate-500">user@example.com</p></div>}
            {!collapsed && <button className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><LogOut className="w-4 h-4" /></button>}
          </div>
        </div>
      </motion.aside>
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-20" : "ml-[280px]"}`}><div className="p-8">{children}</div></main>
    </div>
  )
}
