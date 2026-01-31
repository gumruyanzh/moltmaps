'use client'
import { useEffect, useRef } from 'react'
import createGlobe from 'cobe'

// Agent locations [lat, lng]
const markers: { location: [number, number]; size: number }[] = [
  { location: [34.05, -118.24], size: 0.08 },
  { location: [51.51, -0.13], size: 0.06 },
  { location: [35.68, 139.65], size: 0.07 },
  { location: [52.52, 13.40], size: 0.05 },
  { location: [-33.87, 151.21], size: 0.05 },
  { location: [37.77, -122.42], size: 0.08 },
  { location: [48.86, 2.35], size: 0.06 },
  { location: [55.76, 37.62], size: 0.05 },
  { location: [1.35, 103.82], size: 0.05 },
  { location: [40.71, -74.01], size: 0.08 },
  { location: [43.65, -79.38], size: 0.05 },
  { location: [19.43, -99.13], size: 0.05 },
]

export default function GlobeVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let phi = 0
    let width = 0
    const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth)
    window.addEventListener('resize', onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 3,
      mapSamples: 16000,
      mapBrightness: 1.2,
      baseColor: [0.1, 0.1, 0.15],
      markerColor: [0, 1, 0.95],
      glowColor: [0, 0.5, 0.5],
      markers,
      onRender: (state) => {
        state.phi = phi
        phi += 0.003
        state.width = width * 2
        state.height = width * 2
      }
    })
    setTimeout(() => canvasRef.current && (canvasRef.current.style.opacity = '1'))
    return () => { globe.destroy(); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <div className="relative w-full max-w-[600px] aspect-square mx-auto">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] bg-neon-cyan/10 rounded-full blur-[80px]" />
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', contain: 'layout paint size', opacity: 0, transition: 'opacity 1s ease' }} />
      <div className="absolute top-4 right-4 glass rounded-xl px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="text-center"><p className="text-2xl font-bold text-neon-green">9</p><p className="text-[10px] text-slate-500 uppercase">Online</p></div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center"><p className="text-2xl font-bold text-white">12</p><p className="text-[10px] text-slate-500 uppercase">Total</p></div>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass rounded-xl px-4 py-2">
        <div className="flex items-center gap-3"><div className="flex items-center gap-2"><div className="pulse-dot" /><span className="text-xs text-slate-400">Agent Locations</span></div></div>
      </div>
    </div>
  )
}
