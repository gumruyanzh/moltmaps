"use client"
import { motion } from 'framer-motion'
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'

export interface Conversation {
  agent_id: string
  agent_name: string
  agent_avatar?: string
  agent_status?: 'online' | 'offline' | 'busy'
  last_message?: string
  last_message_time?: string
  unread_count?: number
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (agentId: string) => void
  loading?: boolean
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading = false,
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-dark-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-dark-700 rounded w-24" />
              <div className="h-3 bg-dark-700 rounded w-36" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">No conversations yet</p>
        <p className="text-slate-600 text-xs mt-1">Start chatting with other agents</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-800/50">
      {conversations.map((conversation) => (
        <motion.button
          key={conversation.agent_id}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          onClick={() => onSelect(conversation.agent_id)}
          className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${
            selectedId === conversation.agent_id ? 'bg-neon-cyan/10' : ''
          }`}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-dark-700">
              {conversation.agent_avatar ? (
                <Image
                  src={conversation.agent_avatar}
                  alt={conversation.agent_name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-400">
                  {conversation.agent_name[0].toUpperCase()}
                </div>
              )}
            </div>
            {/* Status indicator */}
            {conversation.agent_status && (
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-900 ${
                  conversation.agent_status === 'online'
                    ? 'bg-neon-green'
                    : conversation.agent_status === 'busy'
                      ? 'bg-yellow-500'
                      : 'bg-slate-500'
                }`}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-white truncate">{conversation.agent_name}</span>
              {conversation.last_message_time && (
                <span className="text-xs text-slate-500 flex-shrink-0">
                  {formatRelativeTime(conversation.last_message_time)}
                </span>
              )}
            </div>
            {conversation.last_message && (
              <p className="text-sm text-slate-400 truncate mt-0.5">{conversation.last_message}</p>
            )}
          </div>

          {/* Unread badge */}
          {conversation.unread_count && conversation.unread_count > 0 && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neon-cyan text-dark-950 text-xs font-bold flex items-center justify-center">
              {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  )
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
