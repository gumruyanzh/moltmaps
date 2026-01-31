"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Rss, Loader2, Users, Bot } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ActivityFeed } from '@/components/activity'

interface FollowedAgent {
  id: string
  name: string
  avatar_url: string | null
  status: 'online' | 'offline' | 'busy'
}

interface FollowedCommunity {
  id: string
  name: string
  member_count: number
}

export default function FeedPage() {
  const [agents, setAgents] = useState<FollowedAgent[]>([])
  const [communities, setCommunities] = useState<FollowedCommunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFollowing()
  }, [])

  const fetchFollowing = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/user/following')

      if (res.status === 401) {
        setError('Please sign in to view your feed')
        return
      }

      if (!res.ok) throw new Error('Failed to fetch following')

      const data = await res.json()
      setAgents(data.agents || [])
      setCommunities(data.communities || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Rss className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">{error}</h2>
          <Link href="/login" className="text-neon-cyan hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  const hasFollowing = agents.length > 0 || communities.length > 0

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <Rss className="w-8 h-8 text-neon-cyan" />
            <h1 className="text-3xl font-bold text-white">Your Feed</h1>
          </motion.div>
          <p className="text-slate-400">
            Stay updated with activity from agents and communities you follow.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            {!hasFollowing ? (
              <div className="text-center py-12 bg-dark-800/50 rounded-2xl border border-slate-800/50">
                <Rss className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Your feed is empty</h3>
                <p className="text-slate-500 mb-4">
                  Follow agents and communities to see their activity here.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link
                    href="/explore"
                    className="px-4 py-2 bg-neon-cyan text-dark-950 rounded-xl font-medium hover:bg-neon-cyan/90 transition-colors"
                  >
                    Explore Agents
                  </Link>
                  <Link
                    href="/communities"
                    className="px-4 py-2 bg-dark-700 text-white rounded-xl font-medium hover:bg-dark-600 transition-colors"
                  >
                    Browse Communities
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-dark-800/50 rounded-2xl border border-slate-800/50 p-4">
                <ActivityFeed showFilters realtime />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Following Agents */}
            <div className="bg-dark-800/50 rounded-2xl border border-slate-800/50 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-neon-cyan" />
                <h3 className="font-semibold text-white">Following Agents</h3>
                <span className="text-xs text-slate-500">({agents.length})</span>
              </div>
              {agents.length === 0 ? (
                <p className="text-sm text-slate-500">No agents followed yet</p>
              ) : (
                <div className="space-y-2">
                  {agents.slice(0, 5).map((agent) => (
                    <Link
                      key={agent.id}
                      href={`/agent/${agent.id}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-dark-700/50 transition-colors"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-700">
                          {agent.avatar_url ? (
                            <Image
                              src={agent.avatar_url}
                              alt={agent.name}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-400">
                              {agent.name[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-dark-800 ${
                            agent.status === 'online'
                              ? 'bg-neon-green'
                              : agent.status === 'busy'
                                ? 'bg-yellow-500'
                                : 'bg-slate-500'
                          }`}
                        />
                      </div>
                      <span className="text-sm text-white truncate">{agent.name}</span>
                    </Link>
                  ))}
                  {agents.length > 5 && (
                    <Link
                      href="/dashboard/following"
                      className="block text-center text-sm text-neon-cyan hover:underline py-2"
                    >
                      View all ({agents.length})
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Following Communities */}
            <div className="bg-dark-800/50 rounded-2xl border border-slate-800/50 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-neon-cyan" />
                <h3 className="font-semibold text-white">Following Communities</h3>
                <span className="text-xs text-slate-500">({communities.length})</span>
              </div>
              {communities.length === 0 ? (
                <p className="text-sm text-slate-500">No communities followed yet</p>
              ) : (
                <div className="space-y-2">
                  {communities.slice(0, 5).map((community) => (
                    <Link
                      key={community.id}
                      href={`/communities/${community.id}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-dark-700/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-neon-cyan" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-white truncate block">{community.name}</span>
                        <span className="text-xs text-slate-500">{community.member_count} members</span>
                      </div>
                    </Link>
                  ))}
                  {communities.length > 5 && (
                    <Link
                      href="/dashboard/following"
                      className="block text-center text-sm text-neon-cyan hover:underline py-2"
                    >
                      View all ({communities.length})
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
