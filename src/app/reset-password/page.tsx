"use client"
import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { Lock, ArrowRight, Eye, EyeOff, Bot, CheckCircle, XCircle } from "lucide-react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Validate token on page load
  useEffect(() => {
    if (!token) {
      setTokenError("No reset token provided")
      setValidating(false)
      return
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`)
        const data = await response.json()

        if (!data.valid) {
          setTokenError(data.error || "Invalid reset link")
        }
      } catch {
        setTokenError("Failed to validate reset link")
      } finally {
        setValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password) {
      setError("Please enter a new password")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to reset password")
        return
      }

      setSuccess(true)
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (validating) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full" />
      </div>
    )
  }

  // Invalid token state
  if (tokenError) {
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
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Invalid Reset Link</h2>
                <p className="text-slate-400 mb-6">{tokenError}</p>
                <Link href="/forgot-password">
                  <Button variant="primary">Request New Link</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Success state
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
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
                <p className="text-slate-400 mb-2">Your password has been updated successfully.</p>
                <p className="text-sm text-slate-500">Redirecting to sign in...</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Reset form
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
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-slate-400">Enter your new password below</p>
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
                <div className="relative">
                  <Input
                    label="New Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="w-4 h-4" />}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Input
                  label="Confirm New Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={loading}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Reset Password
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-950 pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
