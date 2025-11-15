// src/pages/Experience.jsx
import React, { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, useScroll, ContactShadows, Environment } from '@react-three/drei'
import * as THREE from 'three'
import '../App.css'
import Banana from '../components/Banana'
import SugarCube from '../components/SugarCube'
import Ant from '../components/Ant'

function CameraController() {
  const { camera } = useThree()
  const scroll = useScroll()

  const from = useMemo(() => new THREE.Vector3(0, 4.6, 16), [])
  const to = useMemo(() => new THREE.Vector3(0, -2.6, 4.0), [])
  const control = useMemo(() => new THREE.Vector3(), [])
  const rotStart = useMemo(() => new THREE.Euler(-0.18, 0, 0), [])
  const rotEnd = useMemo(() => new THREE.Euler(0.36, 0, 0), [])
  const quat = useMemo(() => new THREE.Quaternion(), [])
  const qStart = useMemo(() => new THREE.Quaternion().setFromEuler(rotStart), [])
  const qEnd = useMemo(() => new THREE.Quaternion().setFromEuler(rotEnd), [])

  useFrame((state, delta) => {
    const t = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp(scroll.offset, 0, 1), 0, 1)
    control.lerpVectors(from, to, t)
    const arc = Math.sin(t * Math.PI) * 1.6
    control.y += arc
    camera.position.lerp(control, 1 - Math.pow(0.001, delta))
    quat.copy(qStart).slerp(qEnd, t)
    camera.quaternion.slerp(quat, 1 - Math.pow(0.001, delta))
    const jitter = Math.sin(state.clock.elapsedTime * 0.9) * 0.0012
    camera.position.x += jitter * (1 - t)
  })
  return null
}

function DebugBox() {
  return (
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[1.6, 1.6, 1.6]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

function SceneContent() {
  const cubePositions = useMemo(
    () => [
      new THREE.Vector3(0.9, 0.12, -0.9),
      new THREE.Vector3(-1.1, 0.12, -1.8),
      new THREE.Vector3(0.0, 0.12, -2.4)
    ],
    []
  )

  const getTargets = () => cubePositions.map((v) => v.clone())

  const antPositionsRef = useRef([])
  const ants = useMemo(() => {
    const list = []
    const count = 28
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 0.35 + Math.random() * 1.8
      const x = Math.cos(angle) * radius
      const z = -0.4 - Math.random() * 2.6
      list.push([x, 0.05, z])
    }
    antPositionsRef.current = list.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
    return list
  }, [])

  const neighborsGetter = () => antPositionsRef.current

  return (
    <>
      {/* Hemisphere gives a gentle fill (fast) */}
      <hemisphereLight skyColor={'#a6d9ff'} groundColor={'#102033'} intensity={0.6} />
      {/* stronger directional + point for clarity */}
      <directionalLight position={[4, 8, 4]} intensity={0.9} />
      <pointLight position={[-3, 2, -2]} intensity={0.6} />
      <spotLight position={[0, 6, 2]} angle={0.6} penumbra={0.4} intensity={1.0} castShadow />

      {/* Environment provides subtle reflections but is lightweight */}
      <Environment preset="studio" />

      {/* Banana hero */}
      <Banana position={[0, 0.18, 0]} scale={1.05} />

      {/* sugar cubes */}
      <SugarCube position={[cubePositions[0].x, cubePositions[0].y, cubePositions[0].z]} size={0.18} />
      <SugarCube position={[cubePositions[1].x, cubePositions[1].y, cubePositions[1].z]} size={0.18} />
      <SugarCube position={[cubePositions[2].x, cubePositions[2].y, cubePositions[2].z]} size={0.18} />

      {/* ants */}
      {ants.map((pos, idx) => (
        <Ant key={`ant-${idx}`} startPos={pos} getTargets={getTargets} neighborsGetter={neighborsGetter} speed={0.95} />
      ))}

      <ContactShadows rotation-x={Math.PI / 2} position={[0, 0.01, 0]} opacity={0.48} width={6} height={6} blur={2.2} far={2.8} />

      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.02} />
      </mesh>
    </>
  )
}

export default function Experience() {
  return (
    <div className="experience-root">
      <Canvas
        className="experience-canvas"
        camera={{ position: [0, 4.6, 16], fov: 48 }}
        shadows
        // no explicit background here — canvas is transparent so CSS gradient shows
        style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'transparent' }}
      >
        <ScrollControls pages={2} damping={0.12}>
          <CameraController />
          <Suspense fallback={<DebugBox />}>
            <SceneContent />
          </Suspense>
        </ScrollControls>
      </Canvas>
    </div>
  )
}
