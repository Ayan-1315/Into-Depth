// src/pages/IntroPage.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react'
import Particles from 'react-tsparticles'
import './IntroPage.css'

export default function IntroPage({ onReveal }) {
  const [fading, setFading] = useState(false)
  const headerRef = useRef(null)
  const letterRefs = useRef([]) // refs for individual letters
  const letterRects = useRef([]) // cached bounding rects for letters
  const particlesInit = useCallback(async (engine) => {
    // no-op init to avoid loadFull issues
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
      events: { onHover: { enable: true, mode: 'repulse' }, onClick: { enable: false }, resize: true },
      modes: { repulse: { distance: 120, duration: 0.4 } }
    }
  }

  // --- Helpers to manage letter refs and rects ---
  const heading = 'INTO THE DEPTH'
  // ensure letterRefs length matches heading length
  letterRefs.current = Array.from({ length: heading.length }).map((_, i) => letterRefs.current[i] || null)

  // recompute bounding rects for each letter
  const recomputeLetterRects = () => {
    const rects = []
    for (let i = 0; i < letterRefs.current.length; i++) {
      const el = letterRefs.current[i]
      if (!el) {
        rects.push(null)
        continue
      }
      rects.push(el.getBoundingClientRect())
    }
    letterRects.current = rects
  }

  // recompute on mount + resize + scroll
  useEffect(() => {
    recomputeLetterRects()
    window.addEventListener('resize', recomputeLetterRects)
    window.addEventListener('scroll', recomputeLetterRects, { passive: true })
    return () => {
      window.removeEventListener('resize', recomputeLetterRects)
      window.removeEventListener('scroll', recomputeLetterRects)
    }
  }, [])

  // pointer move — update CSS vars (px) and update per-letter opacity precisely
  useEffect(() => {
    const RADIUS = 120 // px radius that fades letters (tweak as needed)
    const onPointerMove = (e) => {
      // set CSS variables in pixels so mask positions precisely at viewport coordinates
      const xPx = `${e.clientX}px`
      const yPx = `${e.clientY}px`
      document.documentElement.style.setProperty('--mouse-x', xPx)
      document.documentElement.style.setProperty('--mouse-y', yPx)

      // update per-letter opacity using fresh rects (recompute if empty)
      if (!letterRects.current || letterRects.current.length === 0) recomputeLetterRects()

      for (let i = 0; i < letterRefs.current.length; i++) {
        const ref = letterRefs.current[i]
        const rect = letterRects.current[i]
        if (!ref || !rect) continue

        // compute center of letter in viewport coordinates
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const dist = Math.sqrt(dx * dx + dy * dy)

        // map distance -> opacity: 0 at center -> 1 at >= RADIUS (smoothstep)
        let t = dist / RADIUS
        if (t < 0) t = 0
        if (t > 1) t = 1
        // smoother curve: smoothstep
        const smooth = t * t * (3 - 2 * t)
        const opacity = smooth

        // apply styles directly
        ref.style.opacity = String(opacity)
        ref.style.transform = `translateZ(0) scale(${1 - (1 - opacity) * 0.03})`
        ref.style.filter = `blur(${(1 - opacity) * 1.2}px)`
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    // initialize center
    document.documentElement.style.setProperty('--mouse-x', `${window.innerWidth / 2}px`)
    document.documentElement.style.setProperty('--mouse-y', `${window.innerHeight / 2}px`)

    return () => window.removeEventListener('pointermove', onPointerMove)
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
        {/* split into spans so each letter can be individually measured and styled */}
        <div className="intro-title">
          {heading.split('').map((ch, i) => (
            <span
              key={i}
              ref={(el) => (letterRefs.current[i] = el)}
              className={`intro-letter${ch === ' ' ? ' intro-space' : ''}`}
              aria-hidden
            >
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </div>
      </div>

      <div className="intro-sub">Scroll • Swipe • Arrow</div>
    </div>
  )
}
