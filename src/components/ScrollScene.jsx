import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, useScroll, PerspectiveCamera, Float, Html } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function App() {
  return (
    <div className="w-full h-screen bg-black text-white">
      {/* Overlay UI */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between p-4">
        <h1 className="text-xl font-semibold tracking-tight">Depth Dive</h1>
        <p className="text-xs opacity-70">Scroll to explore ↓</p>
      </div>

      <Canvas gl={{ antialias: true }} dpr={[1, 2]}>
        <color attach="background" args={[0, 0, 0]} />
        <ScrollControls pages={6} damping={0.18}>
          <Scene />
        </ScrollControls>
      </Canvas>
    </div>
  )
}

function Scene() {
  return (
    <>
      {/* Main camera whose fov we can modulate */}
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
      <Rig />

      {/* Light parallax dust (purely decorative) */}
      <group>
        {Array.from({ length: 150 }).map((_, i) => (
          <Dust key={i} />
        ))}
      </group>

      {/* === CONTENT LAYERS === */}
      <Layer z={-2} scale={3.6}>
        <Block title="Overview" subtitle="Top-level system" color="#2dd4bf" />
      </Layer>

      <Layer z={-6} scale={3.0}>
        <Block title="Module" subtitle="Zooming into sub-systems" color="#60a5fa" />
      </Layer>

      <Layer z={-12} scale={2.5}>
        <Block title="Component" subtitle="Finer details & states" color="#f472b6" />
      </Layer>

      <Layer z={-18} scale={2.2}>
        <Block title="Micro-view" subtitle="Tiny interactions" color="#f97316" />
      </Layer>

      <Layer z={-26} scale={2.0}>
        <Block title="Pixel level" subtitle="Almost microscope" color="#eab308" />
      </Layer>

      <Layer z={-34} scale={1.8}>
        <Block title="Singularity" subtitle="The core particle" color="#a78bfa" />
      </Layer>
    </>
  )
}

/** Rig: scroll → camera motion + subtle pan and fov change. */
function Rig() {
  const scroll = useScroll()
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3())

  useFrame((state, dt) => {
    const t = scroll.offset // 0..1 across all pages

    // Camera flies forward as we scroll
    const startZ = 8
    const endZ = -36 // past the last layer
    const z = THREE.MathUtils.lerp(startZ, endZ, t)

    // Soft pan based on scroll
    const panX = Math.sin(t * Math.PI * 2) * 0.8
    const panY = Math.cos(t * Math.PI) * 0.4

    // FOV widens slightly mid-journey then tightens
    const fov = 45 + Math.sin(t * Math.PI) * 10

    // Smooth toward target
    target.current.set(panX, panY, z)
    camera.position.lerp(target.current, 1 - Math.pow(0.0001, dt))
    camera.fov = THREE.MathUtils.damp(camera.fov, fov, 6, dt)
    camera.updateProjectionMatrix()
  })

  return null
}

/** Layer: places content at a certain depth (z) and scale. */
function Layer({ z = -5, scale = 3, children }) {
  return (
    <group position={[0, 0, z]} scale={[scale, scale, 1]}>
      {children}
    </group>
  )
}

/** Block: rounded frame via Shape + shapeGeometry (no extend needed). */
function Block({ title, subtitle, color = '#ffffff' }) {
  // Precompute the rounded-rect shape
  const { shape, segments } = useMemo(() => {
    const w = 1.6, h = 1.0, r = 0.06, segs = 8
    const s = new THREE.Shape()
    const hw = w / 2, hh = h / 2
    s.moveTo(-hw + r, -hh)
    s.lineTo(hw - r, -hh)
    s.quadraticCurveTo(hw, -hh, hw, -hh + r)
    s.lineTo(hw, hh - r)
    s.quadraticCurveTo(hw, hh, hw - r, hh)
    s.lineTo(-hw + r, hh)
    s.quadraticCurveTo(-hw, hh, -hw, hh - r)
    s.lineTo(-hw, -hh + r)
    s.quadraticCurveTo(-hw, -hh, -hw + r, -hh)
    return { shape: s, segments: segs }
  }, [])

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.6}>
      {/* Framed rounded rect */}
      <mesh>
        <shapeGeometry args={[shape, segments]} />
        <meshBasicMaterial color={color} opacity={0.12} transparent />
      </mesh>

      <Html center>
        <div className="select-none rounded-2xl border border-white/10 bg-white/5 px-6 py-4 shadow-xl backdrop-blur">
          <div className="text-2xl font-semibold leading-none">{title}</div>
          <div className="mt-1 text-sm opacity-80">{subtitle}</div>
        </div>
      </Html>
    </Float>
  )
}

/** Dust particles for a sense of speed/depth. */
function Dust() {
  const m = 40
  const x = (Math.random() - 0.5) * m
  const y = (Math.random() - 0.5) * m
  const z = -Math.random() * 40
  const s = Math.random() * 0.02 + 0.005
  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[s, 8, 8]} />
      <meshBasicMaterial color={0x888888} transparent opacity={0.5} />
    </mesh>
  )
}