// src/pages/IntroPage.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react'
import Particles from 'react-tsparticles'
import './IntroPage.css'

export default function IntroPage({ onReveal }) {
  const [fading, setFading] = useState(false)
  const headerRef = useRef(null)

  // no-op init to avoid loadFull issues
  const particlesInit = useCallback(async (engine) => {
    return
  }, [])

  const particlesOptions = {
    fullScreen: false,
    detectRetina: true,
    fpsLimit: 60,
    particles: {
      number: { value: 48, density: { enable: true, area: 900 } },
      color: { value: '#bfe8cf' },
      shape: { type: 'triangle' },
      opacity: { value: 0.9 },
      size: { value: { min: 1.6, max: 5.0 } },
      links: { enable: true, distance: 110, color: '#79c18a', opacity: 0.14, width: 1 },
      move: { enable: true, speed: 0.6, random: true, outModes: { default: 'out' } }
    },
    interactivity: {
      detectsOn: 'canvas',
      events: {
        onHover: { enable: true, mode: 'repulse' },
        onClick: { enable: false },
        resize: true
      },
      modes: { repulse: { distance: 120, duration: 0.4 } }
    }
  }

  // pointer -> css vars for mask
  useEffect(() => {
    const onMove = (e) => {
      const x = `${e.clientX}px`
      const y = `${e.clientY}px`
      document.documentElement.style.setProperty('--mouse-x', x)
      document.documentElement.style.setProperty('--mouse-y', y)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    // init center
    document.documentElement.style.setProperty('--mouse-x', `${window.innerWidth / 2}px`)
    document.documentElement.style.setProperty('--mouse-y', `${window.innerHeight / 2}px`)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // reveal handlers (scroll/touch/key)
  useEffect(() => {
    const triggerReveal = () => {
      setFading(true)
      removeListeners()
    }
    const removeListeners = () => {
      window.removeEventListener('wheel', triggerReveal)
      window.removeEventListener('touchstart', triggerReveal)
      window.removeEventListener('keydown', triggerReveal)
      window.removeEventListener('pointerdown', triggerReveal)
    }
    window.addEventListener('wheel', triggerReveal, { passive: true })
    window.addEventListener('touchstart', triggerReveal, { passive: true })
    window.addEventListener('keydown', triggerReveal)
    window.addEventListener('pointerdown', triggerReveal, { passive: true })
    return () => removeListeners()
  }, [])

  useEffect(() => {
    if (!fading) return
    const t = setTimeout(() => { if (onReveal) onReveal() }, 700)
    return () => clearTimeout(t)
  }, [fading, onReveal])

  return (
    <div className={`intro-wrapper ${fading ? 'intro-fade' : ''}`}>
      <div className="intro-particles-wrap" aria-hidden>
        <Particles id="intro-particles" init={particlesInit} options={particlesOptions}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      </div>

      <div className="intro-header" ref={headerRef}>
        <h1 className="intro-title">INTO THE DEPTH</h1>
      </div>

      <div className="intro-sub">Scroll • Swipe • Arrow</div>
    </div>
  )
}
