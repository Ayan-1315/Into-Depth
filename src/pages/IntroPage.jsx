// src/pages/IntroPage.jsx
import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import './IntroPage.css'
import Banana from '../components/Banana'

// IntroPage receives onReveal prop from App
export default function IntroPage({ onReveal }) {
  const [fading, setFading] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)

  useEffect(() => {
    // Handler to trigger fade on first meaningful user gesture (wheel / touch / arrow)
    const triggerReveal = (e) => {
      // ignore small scroll deltas (optional)
      setFading(true)
      // remove listeners once triggered
      removeListeners()
    }

    const removeListeners = () => {
      window.removeEventListener('wheel', triggerReveal)
      window.removeEventListener('touchstart', triggerReveal)
      window.removeEventListener('keydown', triggerReveal)
      window.removeEventListener('pointerdown', triggerReveal)
    }

    // we'll add listeners for a few user gestures
    window.addEventListener('wheel', triggerReveal, { passive: true })
    window.addEventListener('touchstart', triggerReveal, { passive: true })
    window.addEventListener('keydown', triggerReveal)
    window.addEventListener('pointerdown', triggerReveal, { passive: true })

    return () => removeListeners()
  }, [])

  // When fade animation completes, call onReveal to switch scenes
  useEffect(() => {
    if (!fading) return
    const t = setTimeout(() => {
      if (onReveal) onReveal()
    }, 700) // match CSS fade duration (700ms)
    return () => clearTimeout(t)
  }, [fading, onReveal])

  return (
    <div className={`intro-wrapper ${fading ? 'intro-fade' : ''}`}>
      <Canvas
        shadows={false}
        camera={{ position: [0, 0.6, 2.5], fov: 48 }}
        gl={{ antialias: true }}
        onCreated={() => setModelLoaded(true)}
      >
        <ambientLight intensity={0.9} />
        <directionalLight intensity={0.12} position={[5, 5, 5]} />
        <Environment preset="forest" />
        {/* Banana is centered in intro */}
        <Banana position={[0, 0.15, 0]} scale={0.02} />
      </Canvas>

      <div className="intro-header">Into The Depth</div>
      <div className="intro-sub">Scroll / swipe / press any arrow →</div>
    </div>
  )
}
