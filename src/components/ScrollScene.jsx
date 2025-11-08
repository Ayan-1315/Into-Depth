import { Canvas, useFrame } from '@react-three/fiber'
import { ScrollControls, useScroll, Float, Html, Environment, PerspectiveCamera } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * FullscreenScrollScenes
 * - Full-bleed canvas with ScrollControls paging
 * - Each page is a distinct scene with its own object and micro-animations
 * - Subtle camera movement tied to scroll
 */
export default function ScrollScene() {
  const PAGES = 4
  return (
    <div className="w-screen h-screen fixed inset-0 bg-black">
      <Canvas gl={{ antialias: true }} dpr={[1, 2]}>
        {/* Single global lights/environment */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 6, 4]} intensity={1.2} castShadow />
        <Environment preset="city" />

        {/* Camera rig */}
        <PerspectiveCamera makeDefault fov={50} position={[0, 0, 10]} />

        <ScrollControls pages={PAGES} damping={0.2} distance={1}>
          {/* 3D content bound to scroll */}
          <Scenes pages={PAGES} />

          {/* HTML overlays per page (optional labels/instructions) */}
          <HtmlOverlay pages={PAGES} />
        </ScrollControls>
      </Canvas>
    </div>
  )
}

/** Utility: get normalized progress [0..1] for a given page index */
function usePageProgress(totalPages) {
  const scroll = useScroll()
  return (index) => {
    // Each page occupies 1/total span of scroll.range
    const start = index / totalPages
    const len = 1 / totalPages
    return THREE.MathUtils.clamp((scroll.offset - start) / len, 0, 1)
  }
}

function Scenes({ pages }) {
  const getProgress = usePageProgress(pages)
  const group = useRef()
  const camRig = useRef({ x: 0, y: 0 })
  const scroll = useScroll()

  useFrame((state, dt) => {
    // Subtle camera parallax based on total scroll
    const t = state.clock.getElapsedTime()
    const s = scroll.offset
    camRig.current.x = THREE.MathUtils.damp(camRig.current.x, (s - 0.5) * 1.6, 3, dt)
    camRig.current.y = THREE.MathUtils.damp(camRig.current.y, Math.sin(t * 0.2) * 0.2, 3, dt)
    state.camera.position.x = camRig.current.x
    state.camera.position.y = camRig.current.y
    state.camera.lookAt(0, 0, 0)
  })

  return (
    <group ref={group}>
      <SceneOne progress={getProgress(0)} />
      <SceneTwo progress={getProgress(1)} />
      <SceneThree progress={getProgress(2)} />
      <SceneFour progress={getProgress(3)} />
    </group>
  )
}

/**
 * Each scene is isolated with its own root group and object.
 * Visibility/animation is driven by `progress` (0..1) for that page.
 */
function SceneOne({ progress }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 0.6
  })
  const y = THREE.MathUtils.lerp(4, 0, progress) // slide in from top
  const opacity = THREE.MathUtils.smoothstep(0, 0.2, progress) * (1 - THREE.MathUtils.smoothstep(0.8, 1, progress))
  return (
    <group position={[0, y, 0]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
        <mesh ref={ref} castShadow receiveShadow>
          <torusKnotGeometry args={[1.2, 0.36, 220, 26]} />
          <meshStandardMaterial metalness={0.6} roughness={0.2} envMapIntensity={1.2} transparent opacity={opacity} />
        </mesh>
      </Float>
    </group>
  )
}

function SceneTwo({ progress }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.x += dt * 0.4
    ref.current.rotation.z += dt * 0.2
  })
  const x = THREE.MathUtils.lerp(-6, 0, progress) // slide from left
  const scale = THREE.MathUtils.lerp(0.6, 1, THREE.MathUtils.smoothstep(0, 0.6, progress))
  const opacity = THREE.MathUtils.smoothstep(0.05, 0.25, progress)
  return (
    <group position={[x, 0, 0]}>
      <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.4}>
        <mesh ref={ref} scale={scale} castShadow receiveShadow>
          <icosahedronGeometry args={[1.6, 1]} />
          <meshStandardMaterial metalness={0.2} roughness={0.35} envMapIntensity={1.2} transparent opacity={opacity} />
        </mesh>
      </Float>
    </group>
  )
}

function SceneThree({ progress }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color('#8ab4ff'), roughness: 0.25, metalness: 0.5 }), [])
  const bounce = THREE.MathUtils.smoothstep(0.1, 0.7, progress)
  const z = THREE.MathUtils.lerp(-6, 0, progress)
  const rot = bounce * Math.PI * 2
  const opacity = THREE.MathUtils.smoothstep(0.15, 0.35, progress)
  return (
    <group position={[0, 0, z]} rotation={[0, rot, 0]}>
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.25}>
        <mesh castShadow receiveShadow material={mat}>
          <boxGeometry args={[2.5, 1.2, 1.2]} />
        </mesh>
      </Float>
      {/* Accents */}
      <mesh position={[1.6, 0, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial roughness={0.1} metalness={0.9} envMapIntensity={1.5} transparent opacity={opacity} />
      </mesh>
    </group>
  )
}

function SceneFour({ progress }) {
  // Minimal "portal" style ring
  const ringRef = useRef()
  useFrame((_, dt) => {
    if (!ringRef.current) return
    ringRef.current.rotation.y += dt * 0.25
  })
  const s = THREE.MathUtils.lerp(0.5, 1.2, THREE.MathUtils.smoothstep(0.2, 0.9, progress))
  const y = THREE.MathUtils.lerp(-4, 0, progress)
  const opacity = THREE.MathUtils.smoothstep(0.2, 0.5, progress)
  return (
    <group position={[0, y, 0]} scale={s}>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.8, 0.08, 32, 220]} />
        <meshStandardMaterial metalness={0.9} roughness={0.05} envMapIntensity={1.4} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial roughness={0.2} metalness={0.6} envMapIntensity={1.4} transparent opacity={opacity} />
      </mesh>
    </group>
  )
}

/** Optional HTML overlays for each page */
function HtmlOverlay({ pages }) {
  return (
    <>
      {[...Array(pages)].map((_, i) => (
        <Html key={i} center style={{ pointerEvents: 'none' }} position={[0, 0, 0]}>
          <div className="text-white text-center select-none">
            <div className="text-3xl md:text-5xl font-semibold tracking-tight drop-shadow-lg">
              {i === 0 && 'Depth Dive'}
              {i === 1 && 'Structure & Symmetry'}
              {i === 2 && 'Motion & Balance'}
              {i === 3 && 'Portal'}
            </div>
            <div className="mt-2 opacity-80 text-sm md:text-base">
              {i === 0 && 'Scroll to descend. Each stop reveals a new object.'}
              {i === 1 && 'Clean geometry, gentle spin, full-screen focus.'}
              {i === 2 && 'Subtle drift with anchored accents.'}
              {i === 3 && 'A calm landing. Reset or explore back up.'}
            </div>
          </div>
        </Html>
      ))}
    </>
  )
}
