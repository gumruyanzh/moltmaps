"use client"
import { useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { createPortal } from "react-dom"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  showClose?: boolean
}

const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" }

export default function Modal({ isOpen, onClose, title, children, size = "md", showClose = true }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose() }, [onClose])

  useEffect(() => {
    if (isOpen) { document.addEventListener("keydown", handleEscape); document.body.style.overflow = "hidden" }
    return () => { document.removeEventListener("keydown", handleEscape); document.body.style.overflow = "unset" }
  }, [isOpen, handleEscape])

  if (typeof window === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className={`relative w-full ${sizes[size]} glass rounded-2xl p-6 shadow-2xl`}>
            {(title || showClose) && (
              <div className="flex items-center justify-between mb-4">
                {title && <h2 className="text-xl font-semibold text-white">{title}</h2>}
                {showClose && <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors ml-auto"><X className="w-5 h-5" /></button>}
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
