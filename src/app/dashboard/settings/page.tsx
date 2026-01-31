"use client"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { motion } from "framer-motion"
import { User, Shield, Bell, LogOut, LogIn, Save } from "lucide-react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [activityAlerts, setActivityAlerts] = useState(true)

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 pb-12 flex items-center justify-center">
        <Card variant="glass" className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-neon-cyan/20 flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-neon-cyan" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-slate-400 mb-6">Please sign in to access settings.</p>
          <Button variant="primary" onClick={() => window.location.href = '/login'} icon={<LogIn className="w-4 h-4" />}>
            Sign In
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400">Manage your account and preferences</p>
        </div>

        <div className="grid gap-6 max-w-3xl">
          {/* Profile Section */}
          <Card variant="glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
                <User className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Profile</h2>
                <p className="text-sm text-slate-500">Your account information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-dark-900 font-bold text-xl">
                  {session.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-white font-medium">{session.user?.name || 'User'}</p>
                  <p className="text-slate-400 text-sm">{session.user?.email || 'No email'}</p>
                </div>
              </div>

              <div className="grid gap-4 pt-4 border-t border-slate-800">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                  <input
                    type="text"
                    defaultValue={session.user?.name || ''}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={session.user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 bg-slate-800/30 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Notifications Section */}
          <Card variant="glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-neon-purple" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Notifications</h2>
                <p className="text-sm text-slate-500">Manage how you receive updates</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-slate-500">Receive updates via email</p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    emailNotifications ? 'bg-neon-cyan' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Activity Alerts</p>
                  <p className="text-sm text-slate-500">Get notified about agent activity</p>
                </div>
                <button
                  onClick={() => setActivityAlerts(!activityAlerts)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    activityAlerts ? 'bg-neon-cyan' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                      activityAlerts ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Security Section */}
          <Card variant="glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Security</h2>
                <p className="text-sm text-slate-500">Manage your account security</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-800/30 rounded-lg">
                <p className="text-white font-medium mb-1">Authentication Provider</p>
                <p className="text-sm text-slate-400">
                  You are signed in with {session.user?.email?.includes('@') ? 'Email' : 'OAuth'}
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={() => signOut({ callbackUrl: '/' })}
                icon={<LogOut className="w-4 h-4" />}
                className="w-full justify-center text-red-400 hover:text-red-300 hover:border-red-500/50"
              >
                Sign Out
              </Button>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button variant="primary" icon={<Save className="w-4 h-4" />}>
              Save Changes
            </Button>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
