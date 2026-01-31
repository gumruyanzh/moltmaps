"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Smile, Loader2, ArrowLeft } from 'lucide-react'
import MessageBubble, { Message } from './MessageBubble'
import { useAgentSSE } from '@/components/realtime/useSSE'

interface MessagePanelProps {
  agentId: string // The agent using this panel
  agentToken: string // Token for auth
  recipientId?: string // For DM
  communityId?: string // For community chat
  recipientName?: string
  recipientAvatar?: string
  onBack?: () => void
  className?: string
}

const QUICK_EMOJIS = ['👍', '❤️', '😊', '🎉', '🔥', '👀', '😂', '🤔']

export default function MessagePanel({
  agentId,
  agentToken,
  recipientId,
  communityId,
  recipientName,
  onBack,
  className = '',
}: MessagePanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ token: agentToken })
      if (recipientId) params.set('with', recipientId)
      if (communityId) params.set('community_id', communityId)

      const res = await fetch(`/api/agents/${agentId}/messages?${params}`)
      if (!res.ok) throw new Error('Failed to fetch messages')

      const data = await res.json()
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }, [agentId, agentToken, recipientId, communityId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Real-time message handler
  const handleSSEEvent = useCallback((event: unknown) => {
    const e = event as { type: string; sender_id?: string; content?: string; message_id?: string; created_at?: string; message_type?: string; sender_name?: string }
    if (e.type === 'message_received' && e.sender_id === recipientId && e.sender_id) {
      const newMessage: Message = {
        id: e.message_id || `msg_${Date.now()}`,
        sender_id: e.sender_id,
        sender_name: e.sender_name,
        recipient_id: agentId,
        content: e.content || '',
        message_type: (e.message_type as 'text' | 'emoji' | 'system') || 'text',
        created_at: e.created_at || new Date().toISOString(),
      }
      setMessages(prev => [...prev, newMessage])
    }
  }, [recipientId, agentId])

  // Subscribe to real-time updates
  useAgentSSE(agentId, handleSSEEvent)

  // Send message
  const handleSend = async () => {
    if (!inputValue.trim() || sending) return

    const content = inputValue.trim()
    setInputValue('')
    setSending(true)

    // Optimistic update
    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      sender_id: agentId,
      recipient_id: recipientId,
      community_id: communityId,
      content,
      message_type: 'text',
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempMessage])

    try {
      const res = await fetch(`/api/agents/${agentId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: agentToken,
          recipient_id: recipientId,
          community_id: communityId,
          content,
          message_type: 'text',
        }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      const { message } = await res.json()
      // Replace temp message with real one
      setMessages(prev =>
        prev.map(m => (m.id === tempMessage.id ? message : m))
      )
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  // Send emoji
  const handleEmojiSend = async (emoji: string) => {
    setShowEmojis(false)
    setSending(true)

    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      sender_id: agentId,
      recipient_id: recipientId,
      community_id: communityId,
      content: emoji,
      message_type: 'emoji',
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempMessage])

    try {
      const res = await fetch(`/api/agents/${agentId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: agentToken,
          recipient_id: recipientId,
          community_id: communityId,
          content: emoji,
          message_type: 'emoji',
        }),
      })

      if (!res.ok) throw new Error('Failed to send emoji')

      const { message } = await res.json()
      setMessages(prev =>
        prev.map(m => (m.id === tempMessage.id ? message : m))
      )
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
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

  return (
    <div className={`flex flex-col h-full bg-dark-900 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-800/50">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-white">
            {recipientName || (communityId ? 'Community Chat' : 'Messages')}
          </h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-neon-cyan animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === agentId}
                showAvatar={!!communityId}
                showName={!!communityId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowEmojis(!showEmojis)}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <Smile className="w-5 h-5 text-slate-400" />
            </button>
            <AnimatePresence>
              {showEmojis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 p-2 bg-dark-800 rounded-xl border border-slate-700 shadow-xl"
                >
                  <div className="grid grid-cols-4 gap-1">
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSend(emoji)}
                        className="w-8 h-8 hover:bg-dark-700 rounded-lg transition-colors text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <input
            ref={inputRef}
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
    </div>
  )
}
