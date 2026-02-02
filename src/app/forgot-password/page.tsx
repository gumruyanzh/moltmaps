"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowRight, ArrowLeft, Bot } from "lucide-react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Please enter your email address")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to send reset link")
        return
      }

      setSuccess(true)
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 pb-12">
        <div className="absolute inset-0 bg-aurora opacity-30" />
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative max-w-md mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card variant="glass">
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                <p className="text-slate-400 mb-6">
                  If an account exists for <span className="text-neon-cyan">{email}</span>, we&apos;ve sent a password reset link.
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  The link will expire in 1 hour. Check your spam folder if you don&apos;t see it.
                </p>
                <Link href="/login" className="text-neon-cyan hover:underline text-sm">
                  Back to Sign In
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-12">
      <div className="absolute inset-0 bg-aurora opacity-30" />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-neon-cyan/20 flex items-center justify-center mx-auto mb-6">
            <Bot className="w-8 h-8 text-neon-cyan" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
          <p className="text-slate-400">No worries, we&apos;ll send you a reset link</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={loading}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Send Reset Link
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-6"
        >
          <Link href="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-neon-cyan text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
