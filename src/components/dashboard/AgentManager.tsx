"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MoreVertical, Edit, Trash2, Eye, Power, PowerOff, Loader2 } from "lucide-react"
import Badge from "../ui/Badge"
import Button from "../ui/Button"
import Modal from "../ui/Modal"
import Card from "../ui/Card"
import SkillBadge from "../agents/SkillBadge"

interface DBAgent {
  id: string
  name: string
  description: string | null
  lat: number
  lng: number
  status: 'online' | 'offline' | 'busy'
  skills: string | null
  tasks_completed: number
  rating: number
}

interface AgentManagerProps {
  agents: DBAgent[]
  onRefresh?: () => void
}

export default function AgentManager({ agents: initialAgents, onRefresh }: AgentManagerProps) {
  const [agents, setAgents] = useState(initialAgents)
  const [selectedAgent, setSelectedAgent] = useState<DBAgent | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null)

  const getSkillsArray = (skills: string | null): string[] => {
    if (!skills) return []
    return skills.split(',').map(s => s.trim()).filter(Boolean)
  }

  const toggleStatus = async (id: string) => {
    const agent = agents.find(a => a.id === id)
    if (!agent) return

    const newStatus = agent.status === 'online' ? 'offline' : 'online'
    setTogglingStatus(id)

    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setAgents(agents.map(a => a.id === id ? { ...a, status: newStatus } : a))
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setTogglingStatus(null)
    }
  }

  const deleteAgent = async () => {
    if (!selectedAgent) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/agents/${selectedAgent.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAgents(agents.filter(a => a.id !== selectedAgent.id))
        setShowDeleteModal(false)
        setSelectedAgent(null)
        onRefresh?.()
      }
    } catch (error) {
      console.error('Failed to delete agent:', error)
    } finally {
      setDeleting(false)
    }
  }

  const statusColors = {
    online: "success" as const,
    offline: "default" as const,
    busy: "warning" as const,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">My Agents</h2>
          <p className="text-slate-400">Manage your registered agents</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => window.location.href = "/register"}
        >
          Add Agent
        </Button>
      </div>

      <div className="space-y-4">
        {agents.map((agent, i) => {
          const skills = getSkillsArray(agent.skills)
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card variant="glass" hover className="relative">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xl font-bold text-dark-900">
                      {agent.name.charAt(0)}
                    </div>
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                        agent.status === "online" ? "bg-neon-green" : "bg-slate-500"
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                      <Badge variant={statusColors[agent.status]} size="sm" pulse={agent.status === "online"}>
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                      {agent.description || 'No description'}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {skills.slice(0, 3).map((skill) => (
                        <SkillBadge key={skill} skill={skill} size="sm" showIcon={false} />
                      ))}
                      {skills.length > 3 && (
                        <Badge variant="default" size="sm">+{skills.length - 3}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4 hidden sm:block">
                      <p className="text-2xl font-bold text-white">{agent.tasks_completed || 0}</p>
                      <p className="text-xs text-slate-500">tasks completed</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(agent.id)}
                      disabled={togglingStatus === agent.id}
                      icon={
                        togglingStatus === agent.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : agent.status === "online" ? (
                          <PowerOff className="w-4 h-4" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )
                      }
                    />

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMenuOpen(menuOpen === agent.id ? null : agent.id)}
                        icon={<MoreVertical className="w-4 h-4" />}
                      />
                      <AnimatePresence>
                        {menuOpen === agent.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-40 py-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-10"
                          >
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                              onClick={() => window.location.href = `/agent/${agent.id}`}
                            >
                              <Eye className="w-4 h-4" />View
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />Edit
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                              onClick={() => {
                                setSelectedAgent(agent)
                                setShowDeleteModal(true)
                                setMenuOpen(null)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}

        {agents.length === 0 && (
          <Card variant="outline" className="text-center py-12">
            <p className="text-slate-400 mb-4">You have not registered any agents yet</p>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => window.location.href = "/register"}
            >
              Register Your First Agent
            </Button>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Agent"
      >
        <p className="text-slate-400 mb-6">
          Are you sure you want to delete <span className="text-white font-medium">{selectedAgent?.name}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={deleteAgent}
            loading={deleting}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </Modal>

      {menuOpen && <div className="fixed inset-0 z-5" onClick={() => setMenuOpen(null)} />}
    </div>
  )
}
