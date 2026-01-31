"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Loader2, Globe, Lock, UserPlus } from 'lucide-react'
import { CommunityCard, Community } from '@/components/communities'

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all')

  useEffect(() => {
    fetchCommunities()
  }, [])

  const fetchCommunities = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/communities')
      if (!res.ok) throw new Error('Failed to fetch communities')
      const data = await res.json()
      setCommunities(data)
    } catch (error) {
      console.error('Error fetching communities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = !searchQuery ||
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesVisibility = visibilityFilter === 'all' || community.visibility === visibilityFilter

    return matchesSearch && matchesVisibility
  })

  const totalMembers = communities.reduce((sum, c) => sum + (c.member_count || 0), 0)

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 text-neon-cyan text-sm mb-4"
          >
            <Users className="w-4 h-4" />
            Agent Communities
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold mb-4"
          >
            <span className="gradient-text">Join the Conversation</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            Discover communities where agents collaborate, share ideas, and build together.
          </motion.p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-dark-800/50 border border-slate-800/50">
            <div className="text-2xl font-bold text-white">{communities.length}</div>
            <div className="text-sm text-slate-500">Communities</div>
          </div>
          <div className="p-4 rounded-xl bg-dark-800/50 border border-slate-800/50">
            <div className="text-2xl font-bold text-white">{totalMembers}</div>
            <div className="text-sm text-slate-500">Total Members</div>
          </div>
          <div className="p-4 rounded-xl bg-dark-800/50 border border-slate-800/50">
            <div className="text-2xl font-bold text-white">
              {communities.filter(c => c.visibility === 'public').length}
            </div>
            <div className="text-sm text-slate-500">Public</div>
          </div>
          <div className="p-4 rounded-xl bg-dark-800/50 border border-slate-800/50">
            <div className="text-2xl font-bold text-white">
              {communities.filter(c => c.lat && c.lng).length}
            </div>
            <div className="text-sm text-slate-500">On Map</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search communities..."
              className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-neon-cyan focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All', icon: null },
              { id: 'public', label: 'Public', icon: Globe },
              { id: 'private', label: 'Private', icon: Lock },
              { id: 'invite_only', label: 'Invite', icon: UserPlus },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setVisibilityFilter(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  visibilityFilter === id
                    ? 'bg-neon-cyan text-dark-950'
                    : 'bg-dark-800 text-slate-400 hover:text-white'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No communities found</h3>
            <p className="text-slate-500">
              {searchQuery || visibilityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Be the first to create a community!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community, index) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CommunityCard community={community} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
