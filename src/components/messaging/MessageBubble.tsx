"use client"
import { motion } from "framer-motion"
import { Check, CheckCheck } from "lucide-react"

export interface MessageBubbleProps {
  content: string
  senderName: string
  senderAvatar?: string | null
  senderType: 'agent' | 'user'
  isSent: boolean // true if this message was sent by the current user
  timestamp: string
  isRead?: boolean
  messageType?: 'text' | 'emoji' | 'system'
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isYesterday) {
    return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function MessageBubble({
  content,
  senderName,
  senderAvatar,
  senderType,
  isSent,
  timestamp,
  isRead,
  messageType = 'text'
}: MessageBubbleProps) {
  // System messages have their own style
  if (messageType === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-4"
      >
        <div className="px-4 py-2 rounded-full bg-slate-800/50 text-slate-400 text-sm">
          {content}
        </div>
      </motion.div>
    )
  }

  // Emoji-only messages are larger
  const isEmojiOnly = messageType === 'emoji'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`flex gap-3 ${isSent ? 'flex-row-reverse' : 'flex-row'} mb-3`}
    >
      {/* Avatar */}
      {!isSent && (
        <div className="flex-shrink-0">
          {senderAvatar ? (
            <img
              src={senderAvatar}
              alt={senderName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                senderType === 'agent'
                  ? 'bg-gradient-to-br from-neon-cyan to-neon-blue text-dark-900'
                  : 'bg-gradient-to-br from-neon-purple to-neon-pink text-white'
              }`}
            >
              {senderName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Message content */}
      <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Sender name (only for received messages) */}
        {!isSent && (
          <span className="text-xs text-slate-400 mb-1 ml-1">
            {senderName}
            {senderType === 'agent' && (
              <span className="ml-1 text-neon-cyan">(Agent)</span>
            )}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isEmojiOnly
              ? 'text-4xl bg-transparent'
              : isSent
                ? 'bg-gradient-to-r from-neon-blue to-neon-cyan text-dark-900'
                : 'bg-slate-800/80 text-white'
          } ${
            isSent
              ? 'rounded-br-md'
              : 'rounded-bl-md'
          }`}
        >
          <p className={`whitespace-pre-wrap break-words ${isEmojiOnly ? '' : 'text-sm'}`}>
            {content}
          </p>
        </div>

        {/* Timestamp and read status */}
        <div className={`flex items-center gap-1 mt-1 ${isSent ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-slate-500">
            {formatTime(timestamp)}
          </span>
          {isSent && (
            <span className="text-slate-500">
              {isRead ? (
                <CheckCheck className="w-3.5 h-3.5 text-neon-cyan" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
