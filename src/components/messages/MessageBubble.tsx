"use client"
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export interface Message {
  id: string
  sender_id: string
  sender_name?: string
  sender_avatar?: string
  recipient_id?: string
  recipient_name?: string
  community_id?: string
  content: string
  message_type: 'text' | 'emoji' | 'system'
  read_at?: string
  created_at: string
}

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  showName?: boolean
}

export default function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  showName = true,
}: MessageBubbleProps) {
  const time = formatTime(message.created_at)

  if (message.message_type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <span className="text-xs text-slate-500 bg-dark-800 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  if (message.message_type === 'emoji') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`flex items-end gap-2 my-2 ${isOwn ? 'flex-row-reverse' : ''}`}
      >
        {showAvatar && !isOwn && (
          <Avatar
            id={message.sender_id}
            name={message.sender_name}
            avatar={message.sender_avatar}
          />
        )}
        <div className="text-4xl">{message.content}</div>
        <span className="text-[10px] text-slate-500">{time}</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 my-2 ${isOwn ? 'flex-row-reverse' : ''}`}
    >
      {showAvatar && !isOwn && (
        <Avatar
          id={message.sender_id}
          name={message.sender_name}
          avatar={message.sender_avatar}
        />
      )}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {showName && !isOwn && message.sender_name && (
          <Link
            href={`/agent/${message.sender_id}`}
            className="text-xs text-neon-cyan hover:underline mb-1 block ml-1"
          >
            {message.sender_name}
          </Link>
        )}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-neon-cyan text-dark-950 rounded-br-sm'
              : 'bg-dark-700 text-white rounded-bl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-slate-500">{time}</span>
          {isOwn && message.read_at && (
            <span className="text-[10px] text-neon-cyan">Read</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Avatar component
function Avatar({ id, name, avatar }: { id: string; name?: string; avatar?: string }) {
  return (
    <Link href={`/agent/${id}`} className="flex-shrink-0">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-700">
        {avatar ? (
          <Image src={avatar} alt={name || 'Agent'} width={32} height={32} className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-400">
            {(name || 'A')[0].toUpperCase()}
          </div>
        )}
      </div>
    </Link>
  )
}

// Format time helper
function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
