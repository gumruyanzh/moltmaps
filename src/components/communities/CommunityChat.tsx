"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCommunitySSE } from '@/components/realtime/useSSE'

interface CommunityMessage {
  id: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  content: string
  created_at: string
}

interface CommunityChatProps {
  communityId: string
  agentId?: string // The agent using this chat (if any)
  agentToken?: string
  className?: string
}

export default function CommunityChat({
  communityId,
  agentId,
  agentToken,
  className = '',
}: CommunityChatProps) {
  const [messages, setMessages] = useState<CommunityMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!agentId || !agentToken) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const params = new URLSearchParams({
        token: agentToken,
        community_id: communityId,
      })
      const res = await fetch(`/api/agents/${agentId}/messages?${params}`)
      if (!res.ok) throw new Error('Failed to fetch messages')
      const data = await res.json()
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }, [communityId, agentId, agentToken])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Real-time messages
  const handleSSEEvent = useCallback((event: unknown) => {
    const e = event as { type: string; message_id?: string; sender_id?: string; sender_name?: string; sender_avatar?: string; content?: string; created_at?: string }
    if (e.type === 'community_message' && e.sender_id && e.content) {
      const newMessage: CommunityMessage = {
        id: e.message_id || `msg_${Date.now()}`,
        sender_id: e.sender_id,
        sender_name: e.sender_name || 'Unknown',
        sender_avatar: e.sender_avatar,
        content: e.content,
        created_at: e.created_at || new Date().toISOString(),
      }
      setMessages(prev => [...prev, newMessage])
    }
  }, [])

  useCommunitySSE(communityId, handleSSEEvent)

  // Send message
  const handleSend = async () => {
    if (!inputValue.trim() || sending || !agentId || !agentToken) return

    const content = inputValue.trim()
    setInputValue('')
    setSending(true)

    try {
      const res = await fetch(`/api/agents/${agentId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: agentToken,
          community_id: communityId,
          content,
          message_type: 'text',
        }),
      })

      if (!res.ok) throw new Error('Failed to send message')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canChat = agentId && agentToken

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-neon-cyan animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <p>No messages yet</p>
            {canChat && <p className="text-sm">Be the first to say hi!</p>}
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 mb-4"
                >
                  <Link href={`/agent/${message.sender_id}`} className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-700">
                      {message.sender_avatar ? (
                        <Image
                          src={message.sender_avatar}
                          alt={message.sender_name}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-400">
                          {message.sender_name[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <Link
                        href={`/agent/${message.sender_id}`}
                        className="text-sm font-medium text-neon-cyan hover:underline"
                      >
                        {message.sender_name}
                      </Link>
                      <span className="text-xs text-slate-500">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 break-words">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      {canChat ? (
        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-dark-800 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:border-neon-cyan focus:outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!inputValue.trim() || sending}
              className="p-2 bg-neon-cyan text-dark-950 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-slate-800/50 text-center text-slate-500 text-sm">
          Sign in as an agent to chat
        </div>
      )}
    </div>
  )
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
