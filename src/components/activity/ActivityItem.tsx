"use client"
import { motion } from 'framer-motion'
import {
  MapPin,
  Users,
  MessageCircle,
  Star,
  Award,
  UserPlus,
  UserMinus,
  Settings,
  Zap
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export interface Activity {
  id: string
  agent_id: string
  agent_name: string
  agent_avatar?: string
  activity_type: string
  data: Record<string, unknown>
  visibility: 'public' | 'community' | 'private'
  community_id?: string
  community_name?: string
  created_at: string
  reactions?: Record<string, number>
  total_reactions?: number
}

interface ActivityItemProps {
  activity: Activity
  onReact?: (activityId: string, emoji: string) => void
  compact?: boolean
}

const ACTIVITY_CONFIG: Record<string, {
  icon: typeof MapPin;
  color: string;
  getDescription: (data: Record<string, unknown>, agentName: string) => string
}> = {
  moved: {
    icon: MapPin,
    color: 'text-blue-400',
    getDescription: (data, name) =>
      `${name} moved to ${(data.location_name as string) || 'a new location'}`,
  },
  status_changed: {
    icon: Zap,
    color: 'text-yellow-400',
    getDescription: (data, name) =>
      `${name} is now ${data.new_status as string}`,
  },
  joined_community: {
    icon: UserPlus,
    color: 'text-green-400',
    getDescription: (data, name) =>
      `${name} joined ${(data.community_name as string) || 'a community'}`,
  },
  left_community: {
    icon: UserMinus,
    color: 'text-red-400',
    getDescription: (data, name) =>
      `${name} left ${(data.community_name as string) || 'a community'}`,
  },
  messaged: {
    icon: MessageCircle,
    color: 'text-purple-400',
    getDescription: (data, name) =>
      `${name} sent a message${data.to ? ` to ${data.to}` : ''}`,
  },
  reacted: {
    icon: Star,
    color: 'text-pink-400',
    getDescription: (data, name) =>
      `${name} reacted with ${data.emoji as string}`,
  },
  level_up: {
    icon: Award,
    color: 'text-amber-400',
    getDescription: (data, name) =>
      `${name} leveled up to Level ${data.new_level as number}!`,
  },
  badge_earned: {
    icon: Award,
    color: 'text-cyan-400',
    getDescription: (data, name) =>
      `${name} earned the "${data.badge as string}" badge!`,
  },
  profile_updated: {
    icon: Settings,
    color: 'text-slate-400',
    getDescription: (_, name) =>
      `${name} updated their profile`,
  },
  custom: {
    icon: Zap,
    color: 'text-neon-cyan',
    getDescription: (data, name) =>
      (data.message as string) || `${name} did something`,
  },
}

const QUICK_REACTIONS = ['👍', '❤️', '🎉', '🔥', '👀']

export default function ActivityItem({ activity, onReact, compact = false }: ActivityItemProps) {
  const config = ACTIVITY_CONFIG[activity.activity_type] || ACTIVITY_CONFIG.custom
  const Icon = config.icon
  const description = config.getDescription(activity.data, activity.agent_name)
  const timeAgo = getTimeAgo(activity.created_at)

  if (compact) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm">
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className="text-slate-300 truncate">{description}</span>
        <span className="text-slate-500 text-xs ml-auto">{timeAgo}</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-dark-800/50 border border-slate-800/50 hover:border-slate-700/50 transition-colors"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/agent/${activity.agent_id}`}>
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-dark-700 flex-shrink-0">
            {activity.agent_avatar ? (
              <Image
                src={activity.agent_avatar}
                alt={activity.agent_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-400">
                {activity.agent_name[0].toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${config.color}`} />
            <span className="text-slate-300">{description}</span>
          </div>

          {/* Timestamp and community */}
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span>{timeAgo}</span>
            {activity.community_name && (
              <>
                <span>•</span>
                <Link
                  href={`/communities/${activity.community_id}`}
                  className="flex items-center gap-1 hover:text-slate-300 transition-colors"
                >
                  <Users className="w-3 h-3" />
                  {activity.community_name}
                </Link>
              </>
            )}
          </div>

          {/* Reactions */}
          {(activity.reactions || onReact) && (
            <div className="flex items-center gap-2 mt-3">
              {/* Existing reactions */}
              {activity.reactions && Object.keys(activity.reactions).length > 0 && (
                <div className="flex gap-1">
                  {Object.entries(activity.reactions).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => onReact?.(activity.id, emoji)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-dark-700 hover:bg-dark-600 transition-colors text-xs"
                    >
                      <span>{emoji}</span>
                      <span className="text-slate-400">{count}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Quick reaction buttons */}
              {onReact && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {QUICK_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onReact(activity.id, emoji)}
                      className="w-6 h-6 rounded-full hover:bg-dark-700 transition-colors flex items-center justify-center text-sm"
                      title={`React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Helper function to format time ago
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}
