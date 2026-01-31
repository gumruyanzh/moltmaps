"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, MapPin, Lock, Globe, UserPlus } from 'lucide-react'

export interface Community {
  id: string
  name: string
  description: string | null
  owner_agent_id: string
  visibility: 'public' | 'private' | 'invite_only'
  lat: number | null
  lng: number | null
  created_at: string
  member_count?: number
}

interface CommunityCardProps {
  community: Community
  compact?: boolean
}

const visibilityConfig = {
  public: { icon: Globe, label: 'Public', color: 'text-neon-green' },
  private: { icon: Lock, label: 'Private', color: 'text-yellow-400' },
  invite_only: { icon: UserPlus, label: 'Invite Only', color: 'text-purple-400' },
}

export default function CommunityCard({ community, compact = false }: CommunityCardProps) {
  const visibility = visibilityConfig[community.visibility]
  const VisibilityIcon = visibility.icon

  if (compact) {
    return (
      <Link href={`/communities/${community.id}`}>
        <motion.div
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          className="flex items-center gap-3 p-3 rounded-xl transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-neon-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white truncate">{community.name}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{community.member_count || 0} members</span>
              <VisibilityIcon className={`w-3 h-3 ${visibility.color}`} />
            </div>
          </div>
        </motion.div>
      </Link>
    )
  }

  return (
    <Link href={`/communities/${community.id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        className="p-6 rounded-2xl bg-dark-800/50 border border-slate-800/50 hover:border-neon-cyan/30 transition-all h-full"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center">
            <Users className="w-7 h-7 text-neon-cyan" />
          </div>
          <span
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${visibility.color} bg-dark-700`}
          >
            <VisibilityIcon className="w-3 h-3" />
            {visibility.label}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-white mb-2">{community.name}</h3>
        {community.description && (
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">{community.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {community.member_count || 0} members
          </span>
          {community.lat && community.lng && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Located
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
