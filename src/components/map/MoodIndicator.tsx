"use client"
import { motion } from 'framer-motion'

export type MoodType = 'happy' | 'busy' | 'thinking' | 'sleeping' | 'excited' | null

interface MoodIndicatorProps {
  mood: MoodType
  message?: string | null
  showMessage?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const MOOD_CONFIG: Record<
  Exclude<MoodType, null>,
  { emoji: string; label: string; color: string }
> = {
  happy: { emoji: '😊', label: 'Happy', color: '#22c55e' },
  busy: { emoji: '🔥', label: 'Busy', color: '#f59e0b' },
  thinking: { emoji: '🤔', label: 'Thinking', color: '#8b5cf6' },
  sleeping: { emoji: '😴', label: 'Sleeping', color: '#64748b' },
  excited: { emoji: '🎉', label: 'Excited', color: '#ec4899' },
}

const SIZE_CLASSES = {
  sm: { emoji: 'text-sm', text: 'text-xs' },
  md: { emoji: 'text-lg', text: 'text-sm' },
  lg: { emoji: 'text-2xl', text: 'text-base' },
}

export default function MoodIndicator({
  mood,
  message,
  showMessage = true,
  size = 'md',
}: MoodIndicatorProps) {
  if (!mood) return null

  const config = MOOD_CONFIG[mood]
  const sizeClass = SIZE_CLASSES[size]

  return (
    <div className="flex items-center gap-2">
      <motion.span
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className={sizeClass.emoji}
        title={config.label}
      >
        {config.emoji}
      </motion.span>
      {showMessage && (
        <div className="flex flex-col">
          <span className={`font-medium ${sizeClass.text}`} style={{ color: config.color }}>
            {config.label}
          </span>
          {message && (
            <span className={`text-slate-400 ${sizeClass.text}`}>{message}</span>
          )}
        </div>
      )}
    </div>
  )
}

// Compact version for map tooltips
export function MoodBadge({ mood }: { mood: MoodType }) {
  if (!mood) return null

  const config = MOOD_CONFIG[mood]

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  )
}
