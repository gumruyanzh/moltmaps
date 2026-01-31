"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface PinCustomizerProps {
  currentColor: string
  currentStyle: 'circle' | 'star' | 'diamond' | 'pulse'
  onColorChange: (color: string) => void
  onStyleChange: (style: 'circle' | 'star' | 'diamond' | 'pulse') => void
  disabled?: boolean
}

const PRESET_COLORS = [
  '#00ff88', // Neon Green (default)
  '#00fff2', // Cyan
  '#ff00ff', // Magenta
  '#ff6b6b', // Coral
  '#ffd93d', // Yellow
  '#6c5ce7', // Purple
  '#00b894', // Mint
  '#fd79a8', // Pink
  '#74b9ff', // Light Blue
  '#e17055', // Orange
  '#a29bfe', // Lavender
  '#ffffff', // White
]

const PIN_STYLES: { id: 'circle' | 'star' | 'diamond' | 'pulse'; label: string; preview: string }[] = [
  { id: 'circle', label: 'Circle', preview: '●' },
  { id: 'star', label: 'Star', preview: '★' },
  { id: 'diamond', label: 'Diamond', preview: '◆' },
  { id: 'pulse', label: 'Pulse', preview: '◎' },
]

export default function PinCustomizer({
  currentColor,
  currentStyle,
  onColorChange,
  onStyleChange,
  disabled = false,
}: PinCustomizerProps) {
  const [customColor, setCustomColor] = useState(currentColor)

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setCustomColor(color)
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      onColorChange(color)
    }
  }

  return (
    <div className="space-y-6">
      {/* Pin Color */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Pin Color</label>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {PRESET_COLORS.map((color) => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => !disabled && onColorChange(color)}
              disabled={disabled}
              className={`w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center ${
                currentColor === color ? 'border-white' : 'border-transparent'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-400'}`}
              style={{ backgroundColor: color }}
            >
              {currentColor === color && (
                <Check className="w-4 h-4" style={{ color: color === '#ffffff' ? '#000' : '#fff' }} />
              )}
            </motion.button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customColor}
            onChange={handleCustomColorChange}
            placeholder="#00ff88"
            disabled={disabled}
            className="flex-1 bg-dark-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-neon-cyan focus:outline-none disabled:opacity-50"
          />
          <input
            type="color"
            value={currentColor}
            onChange={(e) => !disabled && onColorChange(e.target.value)}
            disabled={disabled}
            className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent disabled:opacity-50"
          />
        </div>
      </div>

      {/* Pin Style */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Pin Style</label>
        <div className="grid grid-cols-2 gap-2">
          {PIN_STYLES.map((style) => (
            <motion.button
              key={style.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !disabled && onStyleChange(style.id)}
              disabled={disabled}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                currentStyle === style.id
                  ? 'border-neon-cyan bg-neon-cyan/10'
                  : 'border-slate-700 bg-dark-800 hover:border-slate-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className="text-2xl"
                style={{
                  color: currentColor,
                  textShadow: currentStyle === style.id ? `0 0 10px ${currentColor}` : 'none',
                }}
              >
                {style.preview}
              </span>
              <span className="text-sm text-slate-300">{style.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Preview</label>
        <div className="bg-dark-900 rounded-xl p-6 flex items-center justify-center">
          <PinPreview color={currentColor} style={currentStyle} />
        </div>
      </div>
    </div>
  )
}

// Pin preview component
function PinPreview({ color, style }: { color: string; style: 'circle' | 'star' | 'diamond' | 'pulse' }) {
  const baseStyles = {
    width: '32px',
    height: '32px',
    backgroundColor: color,
    boxShadow: `0 0 20px ${color}`,
  }

  switch (style) {
    case 'circle':
      return (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ ...baseStyles, borderRadius: '50%' }}
        />
      )
    case 'star':
      return (
        <motion.div
          animate={{ rotate: [0, 180, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="flex items-center justify-center"
          style={{
            width: '32px',
            height: '32px',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            backgroundColor: color,
            boxShadow: `0 0 20px ${color}`,
          }}
        />
      )
    case 'diamond':
      return (
        <motion.div
          animate={{ rotate: [0, 45, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            ...baseStyles,
            transform: 'rotate(45deg)',
            borderRadius: '4px',
          }}
        />
      )
    case 'pulse':
      return (
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              ...baseStyles,
              borderRadius: '50%',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
          <div
            style={{
              ...baseStyles,
              borderRadius: '50%',
              position: 'relative',
            }}
          />
        </div>
      )
  }
}
