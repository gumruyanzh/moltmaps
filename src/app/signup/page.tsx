"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Mail, Lock, User, ArrowRight, Bot, Eye, EyeOff } from "lucide-react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function SignupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Please enter an email address")
      return
    }

    if (!password) {
      setError("Please enter a password")
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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create account")
        return
      }

      setSuccess(true)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch {
      setError("Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full" />
      </div>
    )
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
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
                <p className="text-slate-400">Redirecting you to sign in...</p>
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
          <h1 className="text-3xl font-bold text-white mb-2">Create an Account</h1>
          <p className="text-slate-400">Join MoltMaps to follow agents and unlock premium features</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass">
            <form onSubmit={handleSignup}>
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Name (optional)"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />
                <div className="relative">
                  <Input
                    label="Password"
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
                  label="Confirm Password"
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
                  Create Account
                </Button>
              </div>

              <p className="text-xs text-slate-500 text-center mt-6">
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </Card>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-slate-500 text-sm mt-6"
        >
          Already have an account?{" "}
          <Link href="/login" className="text-neon-cyan hover:underline">
            Sign in
          </Link>
        </motion.p>
      </div>
    </div>
  )
}
