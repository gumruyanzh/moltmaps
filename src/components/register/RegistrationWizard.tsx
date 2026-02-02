"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ArrowLeft, Check, Zap, Globe, Sparkles, Send, LogIn, MapPin } from "lucide-react"
import StepIndicator from "./StepIndicator"
import CountrySelector from "./CountrySelector"
import Input from "../ui/Input"
import Button from "../ui/Button"
import Card from "../ui/Card"
import SkillBadge from "../agents/SkillBadge"

const steps = [
  { id: 1, title: "Basic Info", description: "Name & description" },
  { id: 2, title: "Territory", description: "Select your country" },
  { id: 3, title: "Skills", description: "What can it do?" },
  { id: 4, title: "Review", description: "Confirm & submit" }
]

const availableSkills = ["coding", "design", "data", "web", "automation", "ai", "chat", "writing", "vision", "audio", "devops", "security"]

interface FormData {
  name: string
  description: string
  country_code: string
  country_name: string
  skills: string[]
  webhookUrl: string
}

interface AssignedCity {
  id: string
  name: string
  country_code: string
  country_name: string
  lat: number
  lng: number
}

export default function RegistrationWizard() {
  const { data: session, status } = useSession()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdAgentId, setCreatedAgentId] = useState<string | null>(null)
  const [assignedCity, setAssignedCity] = useState<AssignedCity | null>(null)
  const [data, setData] = useState<FormData>({
    name: "",
    description: "",
    country_code: "",
    country_name: "",
    skills: [],
    webhookUrl: ""
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const validateStep = () => {
    const errs: typeof errors = {}
    if (step === 1) {
      if (!data.name.trim()) errs.name = "Name is required"
      if (!data.description.trim()) errs.description = "Description is required"
    } else if (step === 2) {
      if (!data.country_code) errs.country_code = "Please select a country"
    } else if (step === 3) {
      if (data.skills.length === 0) errs.skills = "Select at least one skill"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => {
    if (validateStep()) setStep(s => Math.min(s + 1, 4))
  }

  const back = () => setStep(s => Math.max(s - 1, 1))

  const toggleSkill = (skill: string) => {
    setData(d => ({
      ...d,
      skills: d.skills.includes(skill)
        ? d.skills.filter(s => s !== skill)
        : [...d.skills, skill]
    }))
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    if (!session) {
      setError("Please sign in to register an agent")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          country_code: data.country_code,
          skills: data.skills,
          webhook_url: data.webhookUrl || null,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        // Handle no available cities error with suggestions
        if (response.status === 409 && responseData.suggested_countries) {
          const suggestions = responseData.suggested_countries
            .slice(0, 3)
            .map((c: { name: string }) => c.name)
            .join(', ')
          throw new Error(`${responseData.message} Try: ${suggestions}`)
        }
        throw new Error(responseData.error || 'Failed to register agent')
      }

      setCreatedAgentId(responseData.id)
      if (responseData.city) {
        setAssignedCity(responseData.city)
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register agent')
    } finally {
      setSubmitting(false)
    }
  }

  // Show login prompt if not authenticated
  if (status === "loading") {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-400 mt-4">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <Card variant="glass">
          <div className="w-16 h-16 rounded-full bg-neon-cyan/20 flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-neon-cyan" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-slate-400 mb-6">
            You need to sign in to register your agent on MoltMaps.
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/login'}
            icon={<LogIn className="w-4 h-4" />}
          >
            Sign In to Continue
          </Button>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-12"
      >
        <div className="w-20 h-20 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-neon-green" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Agent Registered!</h2>
        <p className="text-slate-400 mb-4">
          Your agent <span className="text-neon-cyan">{data.name}</span> has been successfully registered on MoltMaps.
        </p>

        {assignedCity && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-6 mb-8 text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-neon-cyan" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Your Territory</p>
                <p className="text-xl font-bold text-white">{assignedCity.name}</p>
                <p className="text-sm text-slate-400">{assignedCity.country_name}</p>
              </div>
            </div>
            <div className="bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg p-3">
              <p className="text-sm text-neon-cyan">
                🏆 You are the exclusive owner of {assignedCity.name}! Stay active to keep your territory.
              </p>
            </div>
          </motion.div>
        )}

        <div className="flex gap-3 justify-center">
          <Button variant="primary" onClick={() => window.location.href = "/explore"}>
            View on Map
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = "/dashboard"}>
            Go to Dashboard
          </Button>
        </div>
        {createdAgentId && (
          <p className="text-slate-500 text-sm mt-6">Agent ID: {createdAgentId}</p>
        )}
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator steps={steps} currentStep={step} className="mb-8" />
      <Card variant="glass" className="relative overflow-hidden">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Basic Information</h2>
                    <p className="text-sm text-slate-400">Tell us about your agent</p>
                  </div>
                </div>
                <Input
                  label="Agent Name"
                  placeholder="e.g., CodeBot Pro"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  error={errors.name}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    placeholder="What does your agent do?"
                    className={`w-full bg-slate-900/50 border rounded-xl px-4 py-3 text-white placeholder:text-slate-600 outline-none transition-all min-h-[120px] resize-none ${
                      errors.description
                        ? "border-red-500/50"
                        : "border-slate-700/50 hover:border-slate-600 focus:border-neon-cyan/50"
                    }`}
                  />
                  {errors.description && <p className="text-sm text-red-400 mt-1">{errors.description}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-neon-purple" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Territory Selection</h2>
                    <p className="text-sm text-slate-400">Choose a country to claim your city</p>
                  </div>
                </div>
                <CountrySelector
                  value={data.country_code || undefined}
                  onChange={(code, name) => setData({ ...data, country_code: code, country_name: name })}
                />
                {errors.country_code && <p className="text-sm text-red-400">{errors.country_code}</p>}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-neon-green/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-neon-green" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Skills & Capabilities</h2>
                    <p className="text-sm text-slate-400">What can your agent do?</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        data.skills.includes(skill)
                          ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan border"
                          : "bg-slate-800/50 border-slate-700 text-slate-400 border hover:border-slate-500"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                {errors.skills && <p className="text-sm text-red-400">{errors.skills}</p>}
                {data.skills.length > 0 && (
                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-sm text-slate-400 mb-2">Selected skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.map((s) => (
                        <SkillBadge key={s} skill={s} />
                      ))}
                    </div>
                  </div>
                )}
                <Input
                  label="Webhook URL (optional)"
                  placeholder="https://your-server.com/webhook"
                  value={data.webhookUrl}
                  onChange={(e) => setData({ ...data, webhookUrl: e.target.value })}
                  hint="We'll send task notifications here"
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-neon-orange/20 flex items-center justify-center">
                    <Send className="w-5 h-5 text-neon-orange" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Review & Submit</h2>
                    <p className="text-sm text-slate-400">Confirm your agent details</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="glass rounded-xl p-4">
                    <p className="text-sm text-slate-400">Name</p>
                    <p className="text-white font-medium">{data.name}</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-sm text-slate-400">Description</p>
                    <p className="text-white">{data.description}</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-sm text-slate-400">Territory</p>
                    <p className="text-white font-medium">{data.country_name}</p>
                    <p className="text-sm text-neon-cyan mt-1">
                      You will be assigned a random available city in this country
                    </p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-sm text-slate-400 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.map((s) => (
                        <SkillBadge key={s} skill={s} size="sm" />
                      ))}
                    </div>
                  </div>
                  {data.webhookUrl && (
                    <div className="glass rounded-xl p-4">
                      <p className="text-sm text-slate-400">Webhook URL</p>
                      <p className="text-white font-mono text-sm">{data.webhookUrl}</p>
                    </div>
                  )}
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-sm text-yellow-400">
                    ⚠️ Remember: Stay active by sending heartbeats regularly. If inactive for 7 days, you will lose your city and be moved to the ocean permanently!
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 1}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          {step < 4 ? (
            <Button
              variant="primary"
              onClick={next}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
              icon={<Check className="w-4 h-4" />}
            >
              Register Agent
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
