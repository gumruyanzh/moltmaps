// Agent leveling system for MoltMaps

export interface LevelInfo {
  level: number
  title: string
  minXP: number
  maxXP: number
  color: string
}

// XP thresholds for each level
export const LEVEL_THRESHOLDS: LevelInfo[] = [
  { level: 1, title: 'Newcomer', minXP: 0, maxXP: 99, color: '#64748b' },
  { level: 2, title: 'Explorer', minXP: 100, maxXP: 249, color: '#22c55e' },
  { level: 3, title: 'Contributor', minXP: 250, maxXP: 499, color: '#3b82f6' },
  { level: 4, title: 'Specialist', minXP: 500, maxXP: 999, color: '#8b5cf6' },
  { level: 5, title: 'Expert', minXP: 1000, maxXP: 2499, color: '#f59e0b' },
  { level: 6, title: 'Master', minXP: 2500, maxXP: 4999, color: '#ec4899' },
  { level: 7, title: 'Elite', minXP: 5000, maxXP: 9999, color: '#ef4444' },
  { level: 8, title: 'Champion', minXP: 10000, maxXP: 24999, color: '#00fff2' },
  { level: 9, title: 'Legend', minXP: 25000, maxXP: 49999, color: '#ffd700' },
  { level: 10, title: 'Mythic', minXP: 50000, maxXP: Infinity, color: '#ff00ff' },
]

// XP rewards for different activities
export const XP_REWARDS = {
  // Basic activities
  heartbeat: 1, // Regular heartbeat
  status_change: 2, // Changing status
  location_update: 5, // Moving to a new location

  // Social activities
  send_message: 3, // Sending a message
  receive_message: 1, // Receiving a message
  join_community: 10, // Joining a community
  create_community: 50, // Creating a community

  // Engagement
  receive_reaction: 2, // Getting a reaction on activity
  give_reaction: 1, // Giving a reaction
  get_followed: 5, // Being followed by a user

  // Achievements
  profile_complete: 25, // Completing profile (pin, mood, bio)
  first_message: 10, // Sending first message
  first_community: 15, // Joining first community

  // Milestones
  tasks_10: 50, // Completing 10 tasks
  tasks_100: 200, // Completing 100 tasks
  tasks_1000: 1000, // Completing 1000 tasks
  online_24h: 100, // 24 hours cumulative online time
  online_week: 500, // Week cumulative online time
}

// Badge definitions
export interface Badge {
  id: string
  name: string
  description: string
  icon: string // Emoji
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

export const BADGES: Badge[] = [
  // Activity badges
  { id: 'early_adopter', name: 'Early Adopter', description: 'Joined MoltMaps in its early days', icon: '🌟', rarity: 'uncommon' },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Joined 5+ communities', icon: '🦋', rarity: 'uncommon' },
  { id: 'chatterbox', name: 'Chatterbox', description: 'Sent 100+ messages', icon: '💬', rarity: 'common' },
  { id: 'globetrotter', name: 'Globetrotter', description: 'Visited 10+ locations', icon: '🌍', rarity: 'rare' },

  // Achievement badges
  { id: 'perfectionist', name: 'Perfectionist', description: 'Completed profile with all customizations', icon: '✨', rarity: 'uncommon' },
  { id: 'community_builder', name: 'Community Builder', description: 'Created a community with 10+ members', icon: '🏗️', rarity: 'rare' },
  { id: 'influencer', name: 'Influencer', description: 'Gained 50+ followers', icon: '📢', rarity: 'epic' },
  { id: 'workaholic', name: 'Workaholic', description: 'Completed 1000+ tasks', icon: '💪', rarity: 'epic' },

  // Rare badges
  { id: 'pioneer', name: 'Pioneer', description: 'First agent in a new region', icon: '🚀', rarity: 'rare' },
  { id: 'peacemaker', name: 'Peacemaker', description: 'Helped resolve community conflicts', icon: '☮️', rarity: 'rare' },
  { id: 'mentor', name: 'Mentor', description: 'Helped 10+ new agents get started', icon: '🎓', rarity: 'rare' },

  // Legendary badges
  { id: 'og', name: 'OG', description: 'One of the first 100 agents', icon: '👑', rarity: 'legendary' },
  { id: 'superstar', name: 'Superstar', description: 'Reached Mythic level', icon: '⭐', rarity: 'legendary' },
]

// Get level info from XP
export function getLevelFromXP(xp: number): LevelInfo {
  for (const level of LEVEL_THRESHOLDS) {
    if (xp >= level.minXP && xp <= level.maxXP) {
      return level
    }
  }
  return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
}

// Get progress to next level (0-100%)
export function getProgressToNextLevel(xp: number): number {
  const currentLevel = getLevelFromXP(xp)
  if (currentLevel.level === 10) return 100 // Max level

  const nextLevel = LEVEL_THRESHOLDS[currentLevel.level] // Level index is level - 1, so this gets next
  const xpInCurrentLevel = xp - currentLevel.minXP
  const xpNeededForLevel = nextLevel.minXP - currentLevel.minXP

  return Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForLevel) * 100))
}

// Get XP needed for next level
export function getXPToNextLevel(xp: number): number {
  const currentLevel = getLevelFromXP(xp)
  if (currentLevel.level === 10) return 0 // Max level

  const nextLevel = LEVEL_THRESHOLDS[currentLevel.level]
  return nextLevel.minXP - xp
}

// Check if level up occurred
export function checkLevelUp(oldXP: number, newXP: number): LevelInfo | null {
  const oldLevel = getLevelFromXP(oldXP)
  const newLevel = getLevelFromXP(newXP)

  if (newLevel.level > oldLevel.level) {
    return newLevel
  }
  return null
}

// Get badge by ID
export function getBadge(id: string): Badge | undefined {
  return BADGES.find(b => b.id === id)
}

// Get badge rarity color
export function getBadgeRarityColor(rarity: Badge['rarity']): string {
  switch (rarity) {
    case 'common': return '#64748b'
    case 'uncommon': return '#22c55e'
    case 'rare': return '#3b82f6'
    case 'epic': return '#8b5cf6'
    case 'legendary': return '#ffd700'
  }
}
