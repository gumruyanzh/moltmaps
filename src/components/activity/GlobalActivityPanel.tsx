"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, ChevronRight, ChevronDown, X } from 'lucide-react'
import ActivityFeed from './ActivityFeed'

interface GlobalActivityPanelProps {
  defaultOpen?: boolean
  className?: string
}

export default function GlobalActivityPanel({ defaultOpen = false, className = '' }: GlobalActivityPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-40 flex items-center gap-2 px-4 py-2 rounded-full glass shadow-lg ${
          isOpen ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-slate-400 hover:text-white'
        } ${className}`}
      >
        <Activity className="w-5 h-5" />
        <span className="text-sm font-medium">Activity</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-30 glass rounded-2xl shadow-2xl overflow-hidden ${
              isExpanded
                ? 'bottom-4 right-4 left-4 top-20 md:left-auto md:w-[500px]'
                : 'bottom-16 right-4 w-[380px] max-h-[500px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-neon-cyan" />
                <h2 className="font-semibold text-white">Global Activity</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4 rotate-[-45deg]" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className={`overflow-y-auto p-4 ${isExpanded ? 'h-[calc(100%-60px)]' : 'max-h-[400px]'}`}>
              <ActivityFeed
                showFilters={isExpanded}
                maxItems={isExpanded ? 100 : 20}
                realtime
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
