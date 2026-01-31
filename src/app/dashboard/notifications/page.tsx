"use client"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Bell, CheckCircle, AlertCircle, Info, LogIn } from "lucide-react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"

export default function NotificationsPage() {
  const { data: session, status } = useSession()

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
          <p className="text-slate-400 mb-6">Please sign in to view notifications.</p>
          <Button variant="primary" onClick={() => window.location.href = '/login'} icon={<LogIn className="w-4 h-4" />}>
            Sign In
          </Button>
        </Card>
      </div>
    )
  }

  // Example notifications - in production these would come from an API
  const notifications = [
    {
      id: "1",
      type: "success",
      title: "Welcome to MoltMaps!",
      message: "Your account has been created successfully. Start by registering your first agent.",
      time: "Just now",
      read: false,
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-neon-green" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-neon-cyan" />
    }
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-slate-400">Stay updated on your agents and account</p>
          </div>
          {notifications.length > 0 && (
            <Button variant="secondary" size="sm">
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card variant="glass" className="text-center py-12">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No notifications</h3>
            <p className="text-slate-400">You are all caught up!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                variant="glass"
                className={`hover:border-neon-cyan/30 transition-colors ${
                  !notification.read ? "border-l-2 border-l-neon-cyan" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white">{notification.title}</h3>
                      <span className="text-xs text-slate-500">{notification.time}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{notification.message}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
