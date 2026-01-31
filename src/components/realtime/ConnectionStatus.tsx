"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useSSEContext, SSEConnectionStatus } from './SSEProvider'

interface ConnectionStatusProps {
  showAlways?: boolean
  className?: string
}

const statusConfig: Record<
  SSEConnectionStatus,
  { icon: typeof Wifi; color: string; bgColor: string; text: string; pulse?: boolean }
> = {
  connected: {
    icon: Wifi,
    color: 'text-neon-green',
    bgColor: 'bg-neon-green/20',
    text: 'Live',
    pulse: true,
  },
  connecting: {
    icon: RefreshCw,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
    text: 'Connecting...',
  },
  disconnected: {
    icon: WifiOff,
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/20',
    text: 'Offline',
  },
  error: {
    icon: WifiOff,
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
    text: 'Connection Error',
  },
}

export default function ConnectionStatus({ showAlways = false, className = '' }: ConnectionStatusProps) {
  const { connectionStatus, reconnect } = useSSEContext()
  const config = statusConfig[connectionStatus]
  const Icon = config.icon

  // Only show when not connected, unless showAlways is true
  const shouldShow = showAlways || connectionStatus !== 'connected'

  return (
    <AnimatePresence>
      {(showAlways || shouldShow) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${className}`}
        >
          {connectionStatus === 'connecting' ? (
            <Icon className={`w-4 h-4 ${config.color} animate-spin`} />
          ) : (
            <Icon className={`w-4 h-4 ${config.color}`} />
          )}
          <span className={`text-xs font-medium ${config.color}`}>{config.text}</span>
          {config.pulse && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
            </span>
          )}
          {(connectionStatus === 'error' || connectionStatus === 'disconnected') && (
            <button
              onClick={reconnect}
              className="ml-1 text-xs text-slate-400 hover:text-white transition-colors underline"
            >
              Retry
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Minimal indicator for tight spaces (e.g., in the navbar)
export function ConnectionDot({ className = '' }: { className?: string }) {
  const { connectionStatus } = useSSEContext()

  const dotColor =
    connectionStatus === 'connected'
      ? 'bg-neon-green'
      : connectionStatus === 'connecting'
        ? 'bg-yellow-400'
        : connectionStatus === 'error'
          ? 'bg-red-400'
          : 'bg-slate-400'

  const pulseColor =
    connectionStatus === 'connected'
      ? 'bg-neon-green'
      : connectionStatus === 'connecting'
        ? 'bg-yellow-400'
        : connectionStatus === 'error'
          ? 'bg-red-400'
          : 'bg-slate-400'

  return (
    <span className={`relative flex h-2.5 w-2.5 ${className}`} title={statusConfig[connectionStatus].text}>
      {connectionStatus === 'connected' && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-75`} />
      )}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
    </span>
  )
}
