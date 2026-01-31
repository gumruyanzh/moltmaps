"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { MapPin, Search, Crosshair } from "lucide-react"
import Input from "../ui/Input"
import Button from "../ui/Button"
import type L from "leaflet"

interface Location { lat: number; lng: number; city: string; country: string }
interface LocationPickerProps { value?: Location; onChange: (location: Location) => void }

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [leaflet, setLeaflet] = useState<typeof L | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      const city = data.address?.city || data.address?.town || data.address?.village || "Unknown"
      const country = data.address?.country || "Unknown"
      onChange({ lat, lng, city, country })
    } catch { onChange({ lat, lng, city: "Unknown", country: "Unknown" }) }
  }, [onChange])

  useEffect(() => { if (typeof window === "undefined") return; import("leaflet").then((mod) => setLeaflet(mod.default)) }, [])

  useEffect(() => {
    if (!leaflet || !mapRef.current || mapInstanceRef.current) return
    const m = leaflet.map(mapRef.current, { center: value ? [value.lat, value.lng] : [40, -74], zoom: value ? 10 : 3, zoomControl: false })
    leaflet.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(m)
    m.on("click", (e: L.LeafletMouseEvent) => { reverseGeocode(e.latlng.lat, e.latlng.lng) })
    mapInstanceRef.current = m
    return () => { m.remove(); mapInstanceRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaflet])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !leaflet || !value) return
    if (markerRef.current) markerRef.current.remove()
    const icon = leaflet.divIcon({ className: "custom-marker", html: '<div style="width:24px;height:24px;background:linear-gradient(135deg,#00fff2,#00d4ff);border-radius:50%;border:4px solid #0f172a;box-shadow:0 0 20px rgba(0,255,242,0.5);"></div>', iconSize: [24, 24], iconAnchor: [12, 12] })
    const m = leaflet.marker([value.lat, value.lng], { icon, draggable: true }).addTo(map)
    m.on("dragend", () => { const pos = m.getLatLng(); reverseGeocode(pos.lat, pos.lng) })
    markerRef.current = m
    map.setView([value.lat, value.lng], 10)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaflet, value?.lat, value?.lng])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`)
      const data = await res.json()
      if (data[0]) { const { lat, lon, display_name } = data[0]; const parts = display_name.split(", "); onChange({ lat: parseFloat(lat), lng: parseFloat(lon), city: parts[0], country: parts[parts.length - 1] }) }
    } finally { setSearching(false) }
  }

  const handleLocateMe = () => { if ("geolocation" in navigator) { navigator.geolocation.getCurrentPosition((pos) => { reverseGeocode(pos.coords.latitude, pos.coords.longitude) }) } }

  return (
    <div className="space-y-4">
      <div className="flex gap-2"><div className="flex-1"><Input placeholder="Search location..." icon={<Search className="w-5 h-5" />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} /></div><Button variant="secondary" loading={searching} onClick={handleSearch}>Search</Button><Button variant="ghost" onClick={handleLocateMe} icon={<Crosshair className="w-4 h-4" />} /></div>
      <div className="relative rounded-2xl overflow-hidden border border-slate-800"><div ref={mapRef} className="w-full h-[300px] bg-dark-900" /><div className="absolute top-4 left-4 glass rounded-lg px-3 py-2 text-sm"><p className="text-slate-400">Click on the map to select a location</p></div></div>
      {value && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center"><MapPin className="w-5 h-5 text-neon-cyan" /></div><div><p className="text-white font-medium">{value.city}, {value.country}</p><p className="text-sm text-slate-500">{value.lat.toFixed(4)}, {value.lng.toFixed(4)}</p></div></motion.div>}
    </div>
  )
}
