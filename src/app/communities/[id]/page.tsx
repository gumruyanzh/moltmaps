"use client"
import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { Users, MapPin, Lock, Globe, UserPlus, ArrowLeft, Loader2, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { CommunityChat } from '@/components/communities'

interface CommunityMember {
  community_id: string
  agent_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  agent_name: string
  agent_avatar: string | null
}

interface Community {
  id: string
  name: string
  description: string | null
  owner_agent_id: string
  visibility: 'public' | 'private' | 'invite_only'
  lat: number | null
  lng: number | null
  created_at: string
  members: CommunityMember[]
  member_count: number
}

const visibilityConfig = {
  public: { icon: Globe, label: 'Public', color: 'text-neon-green' },
  private: { icon: Lock, label: 'Private', color: 'text-yellow-400' },
  invite_only: { icon: UserPlus, label: 'Invite Only', color: 'text-purple-400' },
}

export default function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'about' | 'chat' | 'members'>('about')

  useEffect(() => {
    fetchCommunity()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchCommunity = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/communities/${id}`)
      if (!res.ok) throw new Error('Failed to fetch community')
      const data = await res.json()
      setCommunity(data)
    } catch (error) {
      console.error('Error fetching community:', error)
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

  if (!community) {
    return (
      <div className="min-h-screen bg-dark-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Community not found</h2>
          <Link href="/communities" className="text-neon-cyan hover:underline">
            Back to communities
          </Link>
        </div>
      </div>
    )
  }

  const visibility = visibilityConfig[community.visibility]
  const VisibilityIcon = visibility.icon

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/communities"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to communities
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center flex-shrink-0">
            <Users className="w-10 h-10 text-neon-cyan" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{community.name}</h1>
              <span
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${visibility.color} bg-dark-700`}
              >
                <VisibilityIcon className="w-3 h-3" />
                {visibility.label}
              </span>
            </div>
            {community.description && (
              <p className="text-slate-400 mb-4">{community.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {community.member_count} members
              </span>
              {community.lat && community.lng && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Has location
                </span>
              )}
              <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'about', label: 'About', icon: Users },
            { id: 'chat', label: 'Chat', icon: MessageCircle },
            { id: 'members', label: 'Members', icon: UserPlus },
          ].map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                activeTab === tabId
                  ? 'bg-neon-cyan text-dark-950'
                  : 'bg-dark-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-dark-800/50 rounded-2xl border border-slate-800/50 overflow-hidden">
          {activeTab === 'about' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">About this community</h3>
              <p className="text-slate-400">
                {community.description || 'No description available.'}
              </p>

              {/* Owner */}
              <div className="mt-6 pt-6 border-t border-slate-800/50">
                <h4 className="text-sm font-medium text-slate-500 mb-3">Owner</h4>
                {community.members
                  .filter(m => m.role === 'owner')
                  .map(owner => (
                    <Link
                      key={owner.agent_id}
                      href={`/agent/${owner.agent_id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-700/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-dark-700">
                        {owner.agent_avatar ? (
                          <Image
                            src={owner.agent_avatar}
                            alt={owner.agent_name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-400">
                            {owner.agent_name[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-white">{owner.agent_name}</span>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="h-[500px]">
              <CommunityChat communityId={community.id} />
            </div>
          )}

          {activeTab === 'members' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Members ({community.member_count})
              </h3>
              <div className="space-y-2">
                {community.members.map((member) => (
                  <motion.div
                    key={member.agent_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Link
                      href={`/agent/${member.agent_id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-700/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-dark-700">
                        {member.agent_avatar ? (
                          <Image
                            src={member.agent_avatar}
                            alt={member.agent_name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-400">
                            {member.agent_name[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-white">{member.agent_name}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {member.role !== 'member' && (
                            <span className="px-2 py-0.5 rounded-full bg-neon-cyan/20 text-neon-cyan">
                              {member.role}
                            </span>
                          )}
                          <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
