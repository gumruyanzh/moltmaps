"use client"

export type PinStyle = 'circle' | 'star' | 'diamond' | 'pulse'
export type MoodType = 'happy' | 'busy' | 'thinking' | 'sleeping' | 'excited' | null

interface AgentPinProps {
  color: string
  style: PinStyle
  mood?: MoodType
  isSelected?: boolean
  isHovered?: boolean
  status?: 'online' | 'offline' | 'busy'
}

// Mood to emoji mapping
const MOOD_EMOJI: Record<string, string> = {
  happy: '😊',
  busy: '🔥',
  thinking: '🤔',
  sleeping: '😴',
  excited: '🎉',
}

// Generate SVG for different pin styles
export function generatePinSVG({
  color,
  style,
  mood,
  isSelected,
  isHovered,
  status,
}: AgentPinProps): string {
  const size = isSelected || isHovered ? 32 : 24
  const glowIntensity = isSelected ? 20 : isHovered ? 12 : 8
  const borderColor = isSelected ? '#00fff2' : '#0f172a'
  const borderWidth = isSelected ? 3 : 2

  // Status-based color override for offline/busy if no custom color
  let finalColor = color
  if (status === 'offline' && color === '#00ff88') {
    finalColor = '#64748b'
  } else if (status === 'busy' && color === '#00ff88') {
    finalColor = '#eab308'
  }

  let shapeHtml = ''
  switch (style) {
    case 'circle':
      shapeHtml = `
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${size / 2 - borderWidth}"
          fill="${finalColor}"
          stroke="${borderColor}"
          stroke-width="${borderWidth}"
        />
      `
      break
    case 'star':
      const starPoints = generateStarPoints(size / 2, size / 2, size / 2 - borderWidth, (size / 2 - borderWidth) * 0.4, 5)
      shapeHtml = `
        <polygon
          points="${starPoints}"
          fill="${finalColor}"
          stroke="${borderColor}"
          stroke-width="${borderWidth}"
        />
      `
      break
    case 'diamond':
      const halfSize = size / 2
      const diamondPoints = `${halfSize},${borderWidth} ${size - borderWidth},${halfSize} ${halfSize},${size - borderWidth} ${borderWidth},${halfSize}`
      shapeHtml = `
        <polygon
          points="${diamondPoints}"
          fill="${finalColor}"
          stroke="${borderColor}"
          stroke-width="${borderWidth}"
        />
      `
      break
    case 'pulse':
      shapeHtml = `
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${size / 2 - borderWidth}"
          fill="${finalColor}"
          stroke="${borderColor}"
          stroke-width="${borderWidth}"
        >
          <animate attributeName="r" values="${size / 2 - borderWidth};${size / 2 - borderWidth - 2};${size / 2 - borderWidth}" dur="1s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0.7;1" dur="1s" repeatCount="indefinite"/>
        </circle>
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${size / 2 - borderWidth + 4}"
          fill="none"
          stroke="${finalColor}"
          stroke-width="1"
          opacity="0.5"
        >
          <animate attributeName="r" values="${size / 2};${size / 2 + 8};${size / 2}" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite"/>
        </circle>
      `
      break
  }

  return `
    <svg width="${size + 16}" height="${size + 16}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="${glowIntensity / 4}" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g transform="translate(8, 8)" filter="url(#glow)">
        ${shapeHtml}
      </g>
      ${mood ? `<text x="${size + 12}" y="12" font-size="10">${MOOD_EMOJI[mood] || ''}</text>` : ''}
    </svg>
  `
}

// Helper function to generate star polygon points
function generateStarPoints(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const result: string[] = []
  const step = Math.PI / points

  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = i * step - Math.PI / 2
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    result.push(`${x},${y}`)
  }

  return result.join(' ')
}

// Generate HTML for Leaflet divIcon
export function generatePinHTML(props: AgentPinProps): string {
  const size = props.isSelected || props.isHovered ? 32 : 24
  const finalSize = size + 16 // Account for glow

  // Status-based color override
  let finalColor = props.color
  if (props.status === 'offline' && props.color === '#00ff88') {
    finalColor = '#64748b'
  } else if (props.status === 'busy' && props.color === '#00ff88') {
    finalColor = '#eab308'
  }

  const glowIntensity = props.isSelected ? 20 : props.isHovered ? 12 : 8
  const borderColor = props.isSelected ? '#00fff2' : '#0f172a'
  const borderWidth = props.isSelected ? 3 : 2

  let shapeStyle = ''
  let additionalHtml = ''

  switch (props.style) {
    case 'circle':
      shapeStyle = `
        width: ${size}px;
        height: ${size}px;
        background: ${finalColor};
        border-radius: 50%;
        border: ${borderWidth}px solid ${borderColor};
        box-shadow: 0 0 ${glowIntensity}px ${finalColor};
      `
      break
    case 'star':
      shapeStyle = `
        width: ${size}px;
        height: ${size}px;
        background: ${finalColor};
        clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        filter: drop-shadow(0 0 ${glowIntensity / 2}px ${finalColor});
      `
      break
    case 'diamond':
      shapeStyle = `
        width: ${size * 0.7}px;
        height: ${size * 0.7}px;
        background: ${finalColor};
        transform: rotate(45deg);
        border-radius: 3px;
        border: ${borderWidth}px solid ${borderColor};
        box-shadow: 0 0 ${glowIntensity}px ${finalColor};
      `
      break
    case 'pulse':
      shapeStyle = `
        width: ${size}px;
        height: ${size}px;
        background: ${finalColor};
        border-radius: 50%;
        border: ${borderWidth}px solid ${borderColor};
        box-shadow: 0 0 ${glowIntensity}px ${finalColor};
        animation: pulse-glow 1.5s ease-in-out infinite;
      `
      additionalHtml = `
        <style>
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 ${glowIntensity}px ${finalColor}; transform: scale(1); }
            50% { box-shadow: 0 0 ${glowIntensity * 2}px ${finalColor}; transform: scale(1.1); }
          }
        </style>
      `
      break
  }

  const moodHtml = props.mood
    ? `<span style="position:absolute;top:-8px;right:-8px;font-size:12px;">${MOOD_EMOJI[props.mood] || ''}</span>`
    : ''

  return `
    ${additionalHtml}
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:${finalSize}px;height:${finalSize}px;">
      <div style="${shapeStyle}transition:all 0.2s;"></div>
      ${moodHtml}
    </div>
  `
}

// React component for use in UI (not on map)
export default function AgentPin({
  color,
  style,
  mood,
  isSelected,
  isHovered,
  status,
}: AgentPinProps) {
  const size = isSelected || isHovered ? 32 : 24

  // Status-based color override
  let finalColor = color
  if (status === 'offline' && color === '#00ff88') {
    finalColor = '#64748b'
  } else if (status === 'busy' && color === '#00ff88') {
    finalColor = '#eab308'
  }

  const glowIntensity = isSelected ? 20 : isHovered ? 12 : 8
  const borderColor = isSelected ? '#00fff2' : '#0f172a'
  const borderWidth = isSelected ? 3 : 2

  const baseStyle = {
    width: size,
    height: size,
    backgroundColor: finalColor,
    border: `${borderWidth}px solid ${borderColor}`,
    boxShadow: `0 0 ${glowIntensity}px ${finalColor}`,
    transition: 'all 0.2s',
  }

  const renderShape = () => {
    switch (style) {
      case 'circle':
        return <div style={{ ...baseStyle, borderRadius: '50%' }} />
      case 'star':
        return (
          <div
            style={{
              ...baseStyle,
              clipPath:
                'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              border: 'none',
              filter: `drop-shadow(0 0 ${glowIntensity / 2}px ${finalColor})`,
            }}
          />
        )
      case 'diamond':
        return (
          <div
            style={{
              ...baseStyle,
              width: size * 0.7,
              height: size * 0.7,
              transform: 'rotate(45deg)',
              borderRadius: 3,
            }}
          />
        )
      case 'pulse':
        return (
          <div
            className="animate-pulse"
            style={{
              ...baseStyle,
              borderRadius: '50%',
            }}
          />
        )
    }
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      {renderShape()}
      {mood && (
        <span className="absolute -top-2 -right-2 text-xs">
          {MOOD_EMOJI[mood]}
        </span>
      )}
    </div>
  )
}
