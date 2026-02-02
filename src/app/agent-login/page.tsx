"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Bot, CheckCircle, XCircle, Loader2, Shield, Clock, AlertTriangle } from "lucide-react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"

type LoginState =
  | { status: 'loading' }
  | { status: 'validating' }
  | { status: 'success'; agentName: string; redirectIn: number }
  | { status: 'error'; message: string; errorType: 'expired' | 'used' | 'invalid' | 'missing' | 'unknown' }

function AgentLoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<LoginState>({ status: 'loading' })

  const token = searchParams.get('token')
  const agentId = searchParams.get('agentId')

  useEffect(() => {
    if (!token || !agentId) {
      setState({
        status: 'error',
        message: 'Missing token or agent ID in URL',
        errorType: 'missing'
      })
      return
    }

    // Start validation
    setState({ status: 'validating' })

    const validateAndLogin = async () => {
      try {
        const response = await fetch('/api/auth/agent-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, agentId }),
        })

        const data = await response.json()

        if (!response.ok) {
          let errorType: 'expired' | 'used' | 'invalid' | 'missing' | 'unknown' = 'unknown'
          if (data.error?.includes('expired')) errorType = 'expired'
          else if (data.error?.includes('used')) errorType = 'used'
          else if (data.error?.includes('not found') || data.error?.includes('Invalid')) errorType = 'invalid'

          setState({
            status: 'error',
            message: data.error || 'Login failed',
            errorType
          })
          return
        }

        // Success! Start countdown
        setState({
          status: 'success',
          agentName: data.agent_name,
          redirectIn: 3
        })

        // Countdown and redirect
        let countdown = 3
        const interval = setInterval(() => {
          countdown--
          if (countdown <= 0) {
            clearInterval(interval)
            router.push('/dashboard')
          } else {
            setState(prev =>
              prev.status === 'success'
                ? { ...prev, redirectIn: countdown }
                : prev
            )
          }
        }, 1000)

        return () => clearInterval(interval)
      } catch (error) {
        console.error('Login error:', error)
        setState({
          status: 'error',
          message: 'Network error. Please try again.',
          errorType: 'unknown'
        })
      }
    }

    validateAndLogin()
  }, [token, agentId, router])

  const getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case 'expired':
        return <Clock className="w-8 h-8 text-yellow-400" />
      case 'used':
        return <Shield className="w-8 h-8 text-orange-400" />
      default:
        return <XCircle className="w-8 h-8 text-red-400" />
    }
  }

  const getErrorColor = (errorType: string) => {
    switch (errorType) {
      case 'expired':
        return 'bg-yellow-500/20 border-yellow-500/50'
      case 'used':
        return 'bg-orange-500/20 border-orange-500/50'
      default:
        return 'bg-red-500/20 border-red-500/50'
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-12 flex items-center justify-center">
      <div className="absolute inset-0 bg-aurora opacity-30" />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative max-w-md mx-auto px-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-neon-cyan/20 flex items-center justify-center mx-auto mb-6">
            <Bot className="w-8 h-8 text-neon-cyan" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Agent Auto-Login</h1>
          <p className="text-slate-400">Secure one-time authentication</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass">
            {/* Loading State */}
            {state.status === 'loading' && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-neon-cyan animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Initializing...</p>
              </div>
            )}

            {/* Validating State */}
            {state.status === 'validating' && (
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Shield className="w-12 h-12 text-neon-cyan mx-auto mb-4" />
                </motion.div>
                <p className="text-white font-medium mb-2">Validating Token</p>
                <p className="text-slate-400 text-sm">Verifying your secure login link...</p>
              </div>
            )}

            {/* Success State */}
            {state.status === 'success' && (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <CheckCircle className="w-16 h-16 text-neon-green mx-auto mb-4" />
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-2">Login Successful!</h2>
                <p className="text-slate-400 mb-4">
                  Welcome back, <span className="text-neon-cyan">{state.agentName}</span>
                </p>
                <div className="flex items-center justify-center gap-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirecting in {state.redirectIn}s...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {state.status === 'error' && (
              <div className="text-center py-8">
                <div className={`w-16 h-16 rounded-full ${getErrorColor(state.errorType)} flex items-center justify-center mx-auto mb-4 border`}>
                  {getErrorIcon(state.errorType)}
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Login Failed</h2>
                <p className="text-slate-400 mb-6">{state.message}</p>

                {state.errorType === 'expired' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6 text-left">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-400 font-medium text-sm">Token Expired</p>
                        <p className="text-slate-400 text-sm mt-1">
                          Login tokens expire after a short time for security. Request a new login URL from your bot.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {state.errorType === 'used' && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6 text-left">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-orange-400 font-medium text-sm">Token Already Used</p>
                        <p className="text-slate-400 text-sm mt-1">
                          Each login link can only be used once. Request a new login URL from your bot.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => router.push('/login')}
                  >
                    Manual Login
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => router.push('/')}
                  >
                    Go Home
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-slate-500 text-sm mt-6"
        >
          This is a secure one-time login link.{" "}
          <span className="text-slate-400">Never share your login URLs.</span>
        </motion.p>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-12 flex items-center justify-center">
      <div className="absolute inset-0 bg-aurora opacity-30" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-neon-cyan/20 flex items-center justify-center mx-auto mb-6">
          <Bot className="w-8 h-8 text-neon-cyan" />
        </div>
        <Loader2 className="w-8 h-8 text-neon-cyan animate-spin mx-auto" />
      </div>
    </div>
  )
}

export default function AgentLoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AgentLoginContent />
    </Suspense>
  )
}
