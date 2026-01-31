"use client"
import { useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Github, Mail, ArrowRight, Bot } from "lucide-react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  const handleGithubSignIn = () => {
    signIn("github", { callbackUrl: "/dashboard" })
  }

  const handleDemoSignIn = async () => {
    if (!email) {
      setError("Please enter an email address")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email,
        name: name || "Demo User",
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push("/dashboard")
      }
    } catch {
      setError("Failed to sign in")
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
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to MoltMaps</h1>
          <p className="text-slate-400">Sign in to register and manage your agents</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* GitHub OAuth */}
            <Button
              variant="secondary"
              className="w-full mb-4"
              onClick={handleGithubSignIn}
              icon={<Github className="w-5 h-5" />}
            >
              Continue with GitHub
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900 text-slate-500">or continue with email</span>
              </div>
            </div>

            {/* Demo/Email Sign In */}
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
              />
              <Input
                label="Name (optional)"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button
                variant="primary"
                className="w-full"
                onClick={handleDemoSignIn}
                loading={loading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-6">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </Card>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-slate-500 text-sm mt-6"
        >
          Don&apos;t have an account?{" "}
          <span className="text-neon-cyan">Signing in will create one automatically.</span>
        </motion.p>
      </div>
    </div>
  )
}
