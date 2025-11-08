import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, useScroll, PerspectiveCamera, Html } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

// Tweak these
const PAGES = 6
const DEPTH_PER_PAGE = 6
const START_Z = 8
const PAN_AMPLITUDE = 0.9
const FOV_BASE = 45
const FOV_WOBBLE = 10

export default function App() {
  return (
    <div className="fixed inset-0 w-screen h-screen">
      {/* Overlay UI (optional) */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between p-4 text-white">
        <h1 className="text-xl font-semibold tracking-tight">Into Depth</h1>
        <p className="text-xs opacity-70">Scroll ↓</p>
      </div>

      <Canvas
        className="absolute inset-0 w-full h-full"
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

function Scene() {
  // Distinct background + box color per page
  const palette = useMemo(() => {
    const rand = (seed) => {
      let x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }
    return Array.from({ length: PAGES }).map((_, i) => {
      const h1 = Math.floor(rand(i + 1) * 360)
      const h2 = (h1 + 180) % 360
      const bg = new THREE.Color(`hsl(${h1} 65% 12%)`)
      const box = new THREE.Color(`hsl(${h2} 70% 55%)`)
      return { bg, box }
    })
  }, [])

  const panTargets = useMemo(() => {
    const arr = []
    for (let i = 0; i < PAGES; i++) {
      const angle = (i * Math.PI * 0.7) % (Math.PI * 2)
      arr.push(new THREE.Vector2(Math.cos(angle) * 0.8, Math.sin(angle * 0.7) * 0.4))
    }
    return arr
  }, [])

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, START_Z]} fov={FOV_BASE} />
      {/* ScrollControls provides its own internal scroll (no window scroll needed) */}
      <ScrollControls pages={PAGES} damping={0.18}>
        <Rig palette={palette} panTargets={panTargets} />
        {Array.from({ length: PAGES }).map((_, i) => (
          <Page key={i} index={i} z={-i * DEPTH_PER_PAGE} color={palette[i].box} />
        ))}
      </ScrollControls>
    </>
  )
}

/** Camera rig: forward dive + pan + per-page background + FOV wobble */
function Rig({ palette, panTargets }) {
  const scroll = useScroll()
  const { camera, scene } = useThree()
  const target = useRef(new THREE.Vector3())
  const tmp = useRef(new THREE.Color())

  useFrame((_, dt) => {
    const t = scroll.offset // 0..1
    const endZ = -((PAGES - 1) * DEPTH_PER_PAGE) - 2
    const z = THREE.MathUtils.lerp(START_Z, endZ, t)

    // Which two pages are we between?
    const pageF = t * (PAGES - 1)
    const p0 = Math.floor(pageF)
    const p1 = Math.min(p0 + 1, PAGES - 1)
    const localT = pageF - p0
    const easeT = THREE.MathUtils.smoothstep(localT, 0, 1)

    // Pan blend
    const pan0 = panTargets[p0]
    const pan1 = panTargets[p1]
    const panX = THREE.MathUtils.lerp(pan0.x, pan1.x, easeT) * PAN_AMPLITUDE
    const panY = THREE.MathUtils.lerp(pan0.y, pan1.y, easeT) * PAN_AMPLITUDE

    // FOV wobble
    const fov = FOV_BASE + Math.sin(t * Math.PI) * FOV_WOBBLE

    // Set background: distinct per page, with gentle crossfade
    tmp.current.copy(palette[p0].bg).lerp(palette[p1].bg, easeT)
    if (!scene.background) scene.background = new THREE.Color()
    scene.background.lerp(tmp.current, 1 - Math.pow(0.0001, dt))

    // Ease camera toward target
    target.current.set(panX, panY, z)
    camera.position.lerp(target.current, 1 - Math.pow(0.0001, dt))
    camera.fov = THREE.MathUtils.damp(camera.fov, fov, 6, dt)
    camera.updateProjectionMatrix()
  })

  return null
}

/** One page with a centered rotating box and a caption */
function Page({ index, z, color }) {
  const ref = useRef()
  const size = useMemo(() => 1 + (index % 3) * 0.3, [index])

  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.x += dt * 0.4
    ref.current.rotation.y += dt * 0.6
  })

  return (
    <group position={[0, 0, z]}>
      <mesh ref={ref}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* subtle light so the box has shape even on dark bgs */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 2, 2]} intensity={0.9} />

      <Html center>
        <div className="mt-36 select-none rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white backdrop-blur">
          Page {index + 1}
        </div>
      </Html>
    </group>
  )
}
