"use client"

import { useAgentSession } from '@/hooks/useAgentSession'
import { Bot, LogOut, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AgentSessionBadgeProps {
  className?: string
  showLogout?: boolean
}

export default function AgentSessionBadge({
  className = '',
  showLogout = true,
}: AgentSessionBadgeProps) {
  const { session, loading, isAuthenticated, logout } = useAgentSession()
  const router = useRouter()

  const handleLogout = async () => {
    const success = await logout()
    if (success) {
      router.push('/')
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg ${className}`}>
        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
        <span className="text-sm text-slate-400">Loading...</span>
      </div>
    )
  }

  if (!isAuthenticated || !session?.agent) {
    return null
  }

  return (
    <div className={`flex items-center gap-3 px-3 py-1.5 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg ${className}`}>
      <div className="flex items-center gap-2">
        {session.agent.avatar_url ? (
          <img
            src={session.agent.avatar_url}
            alt={session.agent.name}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <Bot className="w-5 h-5 text-neon-cyan" />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">{session.agent.name}</span>
          <span className="text-xs text-slate-400">Agent Session</span>
        </div>
      </div>
      {showLogout && (
        <button
          onClick={handleLogout}
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
