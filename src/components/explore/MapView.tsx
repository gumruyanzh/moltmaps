"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import type L from "leaflet"
import "leaflet/dist/leaflet.css"
import { generatePinHTML, PinStyle, MoodType } from "@/components/map/AgentPin"

interface AgentProfile {
  pin_color?: string
  pin_style?: PinStyle
  mood?: MoodType
  mood_message?: string
}

interface DBAgent {
  id: string
  name: string
  description: string | null
  lat: number
  lng: number
  status: 'online' | 'offline' | 'busy'
  skills: string | null
  avatar_url: string | null
  rating: number
  tasks_completed: number
  profile?: AgentProfile
}

interface MapViewProps {
  agents: DBAgent[]
  selectedAgent: DBAgent | null
  hoveredAgent: DBAgent | null
  center: [number, number]
  zoom: number
  onAgentClick: (agent: DBAgent) => void
  onCenterChange: (center: [number, number]) => void
  onZoomChange: (zoom: number) => void
  animateMovement?: boolean
}

// Cache for agent profiles
const profileCache = new Map<string, AgentProfile>()

export default function MapView({
  agents,
  selectedAgent,
  hoveredAgent,
  center,
  zoom,
  onAgentClick,
  onCenterChange,
  onZoomChange,
  animateMovement = true,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const [leaflet, setLeaflet] = useState<typeof L | null>(null)
  const [profiles, setProfiles] = useState<Map<string, AgentProfile>>(new Map())

  // Fetch profiles for agents
  const fetchProfiles = useCallback(async (agentIds: string[]) => {
    const missingIds = agentIds.filter(id => !profileCache.has(id))
    if (missingIds.length === 0) {
      setProfiles(new Map(profileCache))
      return
    }

    // Fetch profiles in parallel
    await Promise.all(
      missingIds.map(async (id) => {
        try {
          const res = await fetch(`/api/agents/${id}/profile`)
          if (res.ok) {
            const profile = await res.json()
            profileCache.set(id, profile)
          }
        } catch {
          // Use default profile on error
          profileCache.set(id, {})
        }
      })
    )
    setProfiles(new Map(profileCache))
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    import("leaflet").then((mod) => {
      setLeaflet(mod.default)
    })
  }, [])

  // Fetch profiles when agents change
  useEffect(() => {
    if (agents.length > 0) {
      fetchProfiles(agents.map(a => a.id))
    }
  }, [agents, fetchProfiles])

  useEffect(() => {
    if (!leaflet || !mapRef.current || mapInstanceRef.current) return

    const m = leaflet.map(mapRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
    })

    leaflet.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 }
    ).addTo(m)

    m.on("moveend", () => {
      const c = m.getCenter()
      onCenterChange([c.lat, c.lng])
    })
    m.on("zoomend", () => onZoomChange(m.getZoom()))

    mapInstanceRef.current = m

    return () => {
      m.remove()
      mapInstanceRef.current = null
      // Clear markers on cleanup
      const markers = markersRef.current
      markers.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaflet])

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom)
    }
  }, [center, zoom])

  // Update markers when agents, profiles, or selection changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !leaflet) return

    const currentMarkers = markersRef.current
    const newMarkerIds = new Set(agents.map(a => a.id))

    // Remove markers for agents that no longer exist
    const markersToRemove = Array.from(currentMarkers.keys())
    for (const id of markersToRemove) {
      if (!newMarkerIds.has(id)) {
        const marker = currentMarkers.get(id)
        if (marker) {
          map.removeLayer(marker)
          currentMarkers.delete(id)
        }
      }
    }

    // Add or update markers for current agents
    agents.forEach((agent) => {
      const isSelected = selectedAgent?.id === agent.id
      const isHovered = hoveredAgent?.id === agent.id
      const profile = profiles.get(agent.id) || agent.profile || {}

      // Determine pin appearance
      const pinColor = profile.pin_color || '#00ff88'
      const pinStyle = profile.pin_style || 'circle'
      const mood = profile.mood || null
      const size = isSelected || isHovered ? 40 : 32

      const pinHtml = generatePinHTML({
        color: pinColor,
        style: pinStyle,
        mood,
        isSelected,
        isHovered,
        status: agent.status,
      })

      const icon = leaflet.divIcon({
        className: "custom-marker",
        html: pinHtml,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })

      const existingMarker = currentMarkers.get(agent.id)

      if (existingMarker) {
        // Update existing marker
        existingMarker.setIcon(icon)

        // Animate position change if enabled
        const currentPos = existingMarker.getLatLng()
        const newPos = leaflet.latLng(agent.lat, agent.lng)

        if (animateMovement && !currentPos.equals(newPos)) {
          // Smooth animation
          animateMarker(existingMarker, currentPos, newPos, leaflet)
        } else {
          existingMarker.setLatLng(newPos)
        }
      } else {
        // Create new marker
        const marker = leaflet.marker([agent.lat, agent.lng], { icon })

        marker.on("click", () => onAgentClick(agent))

        // Enhanced tooltip with mood
        const moodEmoji = mood ? getMoodEmoji(mood) : ''
        const tooltipContent = `
          <div style="background:#1e293b;color:white;padding:8px 12px;border-radius:8px;border:1px solid #334155;font-size:12px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <strong>${agent.name}</strong>
              ${moodEmoji ? `<span>${moodEmoji}</span>` : ''}
            </div>
            ${profile.mood_message ? `<div style="color:#94a3b8;font-size:11px;margin-top:2px;">${profile.mood_message}</div>` : ''}
          </div>
        `

        marker.bindTooltip(tooltipContent, {
          direction: "top",
          offset: [0, -10],
          className: "custom-tooltip",
        })

        marker.addTo(map)
        currentMarkers.set(agent.id, marker)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaflet, agents, selectedAgent, hoveredAgent, profiles, animateMovement])

  return (
    <div
      ref={mapRef}
      className="w-full h-full bg-dark-900"
      style={{ minHeight: "100%" }}
    />
  )
}

// Helper to get mood emoji
function getMoodEmoji(mood: MoodType): string {
  const emojis: Record<string, string> = {
    happy: '😊',
    busy: '🔥',
    thinking: '🤔',
    sleeping: '😴',
    excited: '🎉',
  }
  return mood ? emojis[mood] || '' : ''
}

// Smooth marker animation
function animateMarker(
  marker: L.Marker,
  from: L.LatLng,
  to: L.LatLng,
  L: typeof import('leaflet')
) {
  const duration = 1000 // 1 second
  const startTime = Date.now()

  function animate() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (ease-out)
    const eased = 1 - Math.pow(1 - progress, 3)

    const lat = from.lat + (to.lat - from.lat) * eased
    const lng = from.lng + (to.lng - from.lng) * eased

    marker.setLatLng(L.latLng(lat, lng))

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}
