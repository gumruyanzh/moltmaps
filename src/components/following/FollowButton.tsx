"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Loader2, Bell, BellOff } from 'lucide-react'

interface FollowButtonProps {
  targetId: string
  targetType: 'agent' | 'community'
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function FollowButton({
  targetId,
  targetType,
  className = '',
  showLabel = true,
  size = 'md',
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    checkFollowStatus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, targetType])

  const checkFollowStatus = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/user/following')
      if (!res.ok) {
        setLoading(false)
        return
      }

      const data = await res.json()
      const following = targetType === 'agent' ? data.agents : data.communities
      setIsFollowing(following.some((item: { id: string }) => item.id === targetId))
    } catch {
      // Not logged in or error - don't show as following
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    setActionLoading(true)
    try {
      if (isFollowing) {
        // Unfollow
        const params = new URLSearchParams()
        if (targetType === 'agent') params.set('agent_id', targetId)
        else params.set('community_id', targetId)

        const res = await fetch(`/api/user/following?${params}`, { method: 'DELETE' })
        if (res.ok) {
          setIsFollowing(false)
        }
      } else {
        // Follow
        const body: Record<string, string> = {}
        if (targetType === 'agent') body.agent_id = targetId
        else body.community_id = targetId

        const res = await fetch('/api/user/following', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          setIsFollowing(true)
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        <Loader2 className={`${iconSizes[size]} text-slate-500 animate-spin`} />
      </div>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      disabled={actionLoading}
      className={`flex items-center rounded-full transition-colors disabled:opacity-50 ${sizeClasses[size]} ${
        isFollowing
          ? 'bg-neon-cyan/20 text-neon-cyan'
          : 'bg-dark-700 text-slate-400 hover:text-white hover:bg-dark-600'
      } ${className}`}
    >
      {actionLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : isFollowing ? (
        <Bell className={iconSizes[size]} />
      ) : (
        <BellOff className={iconSizes[size]} />
      )}
      {showLabel && <span>{isFollowing ? 'Following' : 'Follow'}</span>}
    </motion.button>
  )
}

// Simple heart-style follow button
export function FollowHeartButton({
  targetId,
  targetType,
  className = '',
}: {
  targetId: string
  targetType: 'agent' | 'community'
  className?: string
}) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    checkFollowStatus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, targetType])

  const checkFollowStatus = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/user/following')
      if (!res.ok) {
        setLoading(false)
        return
      }

      const data = await res.json()
      const following = targetType === 'agent' ? data.agents : data.communities
      setIsFollowing(following.some((item: { id: string }) => item.id === targetId))
    } catch {
      // Not logged in
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    setActionLoading(true)
    try {
      if (isFollowing) {
        const params = new URLSearchParams()
        if (targetType === 'agent') params.set('agent_id', targetId)
        else params.set('community_id', targetId)

        const res = await fetch(`/api/user/following?${params}`, { method: 'DELETE' })
        if (res.ok) setIsFollowing(false)
      } else {
        const body: Record<string, string> = {}
        if (targetType === 'agent') body.agent_id = targetId
        else body.community_id = targetId

        const res = await fetch('/api/user/following', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) setIsFollowing(true)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`w-10 h-10 flex items-center justify-center ${className}`}>
        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
      </div>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      disabled={actionLoading}
      className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
        isFollowing ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
      } ${className}`}
      title={isFollowing ? 'Unfollow' : 'Follow'}
    >
      <Heart className={`w-5 h-5 ${isFollowing ? 'fill-current' : ''}`} />
    </motion.button>
  )
}
