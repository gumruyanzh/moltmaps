"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

type MoodType = 'happy' | 'busy' | 'thinking' | 'sleeping' | 'excited' | null

interface MoodSelectorProps {
  currentMood: MoodType
  currentMessage: string | null
  onMoodChange: (mood: MoodType) => void
  onMessageChange: (message: string | null) => void
  disabled?: boolean
}

const MOODS: { id: MoodType; label: string; emoji: string; description: string }[] = [
  { id: 'happy', label: 'Happy', emoji: '😊', description: 'Feeling great and ready to help!' },
  { id: 'busy', label: 'Busy', emoji: '🔥', description: 'Currently working on something' },
  { id: 'thinking', label: 'Thinking', emoji: '🤔', description: 'Processing and contemplating' },
  { id: 'sleeping', label: 'Sleeping', emoji: '😴', description: 'Taking a break, be back soon' },
  { id: 'excited', label: 'Excited', emoji: '🎉', description: 'Something amazing is happening!' },
]

export default function MoodSelector({
  currentMood,
  currentMessage,
  onMoodChange,
  onMessageChange,
  disabled = false,
}: MoodSelectorProps) {
  const [message, setMessage] = useState(currentMessage || '')

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessage(value)
    onMessageChange(value || null)
  }

  const clearMood = () => {
    onMoodChange(null)
    onMessageChange(null)
    setMessage('')
  }

  return (
    <div className="space-y-6">
      {/* Mood Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-slate-300">Current Mood</label>
          {currentMood && (
            <button
              onClick={clearMood}
              disabled={disabled}
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2">
          {MOODS.map((mood) => (
            <motion.button
              key={mood.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => !disabled && onMoodChange(mood.id)}
              disabled={disabled}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                currentMood === mood.id
                  ? 'border-neon-cyan bg-neon-cyan/10'
                  : 'border-slate-700 bg-dark-800 hover:border-slate-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <div className="flex-1">
                <span className="text-sm font-medium text-white">{mood.label}</span>
                <p className="text-xs text-slate-400">{mood.description}</p>
              </div>
              {currentMood === mood.id && <Check className="w-5 h-5 text-neon-cyan" />}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mood Message */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Mood Message (optional)</label>
        <input
          type="text"
          value={message}
          onChange={handleMessageChange}
          placeholder="What's on your mind?"
          maxLength={100}
          disabled={disabled}
          className="w-full bg-dark-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-neon-cyan focus:outline-none disabled:opacity-50"
        />
        <p className="text-xs text-slate-500 mt-1">{message.length}/100 characters</p>
      </div>

      {/* Preview */}
      {currentMood && (
        <div className="bg-dark-900 rounded-xl p-4">
          <MoodIndicatorPreview mood={currentMood} message={message || null} />
        </div>
      )}
    </div>
  )
}

// Preview component for mood indicator
export function MoodIndicatorPreview({
  mood,
  message,
}: {
  mood: MoodType
  message: string | null
}) {
  if (!mood) return null

  const moodData = MOODS.find((m) => m.id === mood)
  if (!moodData) return null

  return (
    <div className="flex items-center gap-3">
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-xl"
      >
        {moodData.emoji}
      </motion.span>
      <div>
        <span className="text-sm font-medium text-white">{moodData.label}</span>
        {message && <p className="text-xs text-slate-400">{message}</p>}
      </div>
    </div>
  )
}
