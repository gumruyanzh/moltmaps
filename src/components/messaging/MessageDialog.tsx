"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Loader2, AlertCircle, WifiOff } from "lucide-react"
import { createPortal } from "react-dom"
import { useSession } from "next-auth/react"
import MessageBubble from "./MessageBubble"
import Button from "@/components/ui/Button"

interface Message {
  id: string
  sender_id: string
  sender_type: 'agent' | 'user'
  sender_name?: string
  sender_avatar?: string | null
  recipient_id: string | null
  content: string
  message_type: 'text' | 'emoji' | 'system'
  read_at: string | null
  created_at: string
}

interface Agent {
  id: string
  name: string
  avatar_url: string | null
  status: 'online' | 'offline' | 'busy'
  personality?: string | null
}

interface MessageDialogProps {
  isOpen: boolean
  onClose: () => void
  agent: Agent
}

export default function MessageDialog({ isOpen, onClose, agent }: MessageDialogProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const userId = (session?.user as { id?: string })?.id

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Load messages
  useEffect(() => {
    if (!isOpen || !userId) return

    const loadMessages = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/user/conversations/${agent.id}/messages`)
        if (!res.ok) {
          throw new Error('Failed to load messages')
        }
        const data = await res.json()
        setMessages(data)
        setTimeout(scrollToBottom, 100)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages')
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [isOpen, userId, agent.id, scrollToBottom])

  // Setup SSE for real-time updates
  useEffect(() => {
    if (!isOpen || !userId) return

    const eventSource = new EventSource('/api/sse/user/notifications')
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setConnected(true)
    }

    eventSource.onerror = () => {
      setConnected(false)
    }

    eventSource.addEventListener('message_received', (event) => {
      try {
        const data = JSON.parse(event.data)
        // Only add if it's from the agent we're chatting with
        if (data.sender_id === agent.id && data.sender_type === 'agent') {
          const newMsg: Message = {
            id: data.message_id,
            sender_id: data.sender_id,
            sender_type: 'agent',
            sender_name: data.sender_name,
            sender_avatar: agent.avatar_url,
            recipient_id: userId,
            content: data.content,
            message_type: data.message_type || 'text',
            read_at: null,
            created_at: data.created_at || new Date().toISOString(),
          }
          setMessages(prev => [...prev, newMsg])
          setTimeout(scrollToBottom, 100)
        }
      } catch (e) {
        console.error('Failed to parse SSE message:', e)
      }
    })

    return () => {
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [isOpen, userId, agent.id, agent.avatar_url, scrollToBottom])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || sending) return

    const content = newMessage.trim()
    setNewMessage("")
    setSending(true)

    // Optimistically add the message
    const tempId = `temp_${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: userId,
      sender_type: 'user',
      sender_name: session?.user?.name || 'You',
      sender_avatar: session?.user?.image || null,
      recipient_id: agent.id,
      content,
      message_type: 'text',
      read_at: null,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimisticMessage])
    setTimeout(scrollToBottom, 100)

    try {
      const res = await fetch(`/api/user/conversations/${agent.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send message')
      }

      const data = await res.json()
      // Replace optimistic message with real one
      setMessages(prev =>
        prev.map(m => m.id === tempId ? { ...data.message, sender_name: session?.user?.name } : m)
      )
    } catch (err) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (typeof window === "undefined") return null

  const statusColors = {
    online: "bg-neon-green",
    offline: "bg-slate-500",
    busy: "bg-yellow-500"
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg h-[600px] max-h-[80vh] glass rounded-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-700/50">
              <div className="relative">
                {agent.avatar_url ? (
                  <img
                    src={agent.avatar_url}
                    alt={agent.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center text-dark-900 font-bold">
                    {agent.name.charAt(0)}
                  </div>
                )}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-dark-800 ${statusColors[agent.status]}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{agent.name}</h3>
                <p className="text-xs text-slate-400 capitalize">{agent.status}</p>
              </div>
              <div className="flex items-center gap-2">
                {!connected && (
                  <span title="Reconnecting...">
                    <WifiOff className="w-4 h-4 text-yellow-500" />
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <p className="text-red-400 text-sm">{error}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setError(null)
                      setLoading(true)
                      // Trigger reload
                      fetch(`/api/user/conversations/${agent.id}/messages`)
                        .then(r => r.json())
                        .then(setMessages)
                        .finally(() => setLoading(false))
                    }}
                  >
                    Retry
                  </Button>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <p className="text-center">No messages yet.</p>
                  <p className="text-sm text-center mt-1">
                    Send a message to start the conversation.
                  </p>
                  {agent.personality && (
                    <p className="text-xs text-center mt-4 italic max-w-xs text-slate-500">
                      &quot;{agent.personality}&quot;
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      content={message.content}
                      senderName={message.sender_name || (message.sender_type === 'agent' ? agent.name : 'You')}
                      senderAvatar={message.sender_avatar}
                      senderType={message.sender_type}
                      isSent={message.sender_type === 'user' && message.sender_id === userId}
                      timestamp={message.created_at}
                      isRead={!!message.read_at}
                      messageType={message.message_type}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-slate-700/50">
              {!session ? (
                <p className="text-center text-slate-400 text-sm">
                  Sign in to send messages
                </p>
              ) : (
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-neon-cyan/50 transition-colors disabled:opacity-50"
                  />
                  <Button
                    variant="primary"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    loading={sending}
                    icon={<Send className="w-4 h-4" />}
                  >
                    Send
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
