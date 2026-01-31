"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Award, Loader2 } from 'lucide-react'
import { BADGES, getBadgeRarityColor } from '@/lib/levels'

interface LevelData {
  level: number
  title: string
  experience_points: number
  xp_for_current_level: number
  xp_for_next_level: number | null
  progress_percent: number
  badges: string[]
  color: string
}

interface LevelBadgeProps {
  agentId: string
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  showBadges?: boolean
  className?: string
}

export default function LevelBadge({
  agentId,
  size = 'md',
  showProgress = false,
  showBadges = false,
  className = '',
}: LevelBadgeProps) {
  const [levelData, setLevelData] = useState<LevelData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLevel()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId])

  const fetchLevel = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/agents/${agentId}/level`)
      if (res.ok) {
        const data = await res.json()
        setLevelData(data)
      }
    } catch (error) {
      console.error('Error fetching level:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
      </div>
    )
  }

  if (!levelData) return null

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div className={className}>
      {/* Main badge */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
        style={{
          backgroundColor: `${levelData.color}20`,
          color: levelData.color,
          border: `1px solid ${levelData.color}40`,
        }}
      >
        <Star className={iconSizes[size]} />
        <span>Lv. {levelData.level}</span>
        <span className="opacity-70">{levelData.title}</span>
      </motion.div>

      {/* Progress bar */}
      {showProgress && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{levelData.experience_points.toLocaleString()} XP</span>
            {levelData.xp_for_next_level && (
              <span>{levelData.xp_for_next_level.toLocaleString()} XP</span>
            )}
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelData.progress_percent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: levelData.color }}
            />
          </div>
        </div>
      )}

      {/* Badges */}
      {showBadges && levelData.badges.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
            <Award className="w-3 h-3" />
            Badges ({levelData.badges.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {levelData.badges.map((badgeId) => {
              const badge = BADGES.find(b => b.id === badgeId)
              if (!badge) return null
              return (
                <motion.span
                  key={badgeId}
                  whileHover={{ scale: 1.1 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: `${getBadgeRarityColor(badge.rarity)}20`,
                    color: getBadgeRarityColor(badge.rarity),
                  }}
                  title={badge.description}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.name}</span>
                </motion.span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Compact level indicator
export function LevelIndicator({
  level,
  color,
}: {
  level: number
  color: string
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      <Star className="w-3 h-3" />
      {level}
    </span>
  )
}

// XP display for agent profiles
export function XPDisplay({ agentId }: { agentId: string }) {
  const [data, setData] = useState<{
    xp: number
    level: number
    title: string
    progress: number
    color: string
  } | null>(null)

  useEffect(() => {
    fetchXP()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId])

  const fetchXP = async () => {
    try {
      const res = await fetch(`/api/agents/${agentId}/level`)
      if (res.ok) {
        const levelData = await res.json()
        setData({
          xp: levelData.experience_points,
          level: levelData.level,
          title: levelData.title,
          progress: levelData.progress_percent,
          color: levelData.color,
        })
      }
    } catch {
      // Silently fail
    }
  }

  if (!data) return null

  return (
    <div className="p-4 rounded-xl bg-dark-800/50 border border-slate-800/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
            style={{ backgroundColor: `${data.color}20`, color: data.color }}
          >
            {data.level}
          </div>
          <div>
            <div className="font-semibold text-white">{data.title}</div>
            <div className="text-xs text-slate-500">{data.xp.toLocaleString()} XP</div>
          </div>
        </div>
      </div>
      <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${data.progress}%`,
            backgroundColor: data.color,
          }}
        />
      </div>
      <div className="text-xs text-slate-500 mt-1 text-right">
        {data.progress}% to next level
      </div>
    </div>
  )
}
