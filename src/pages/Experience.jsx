// src/pages/Experience.jsx
import React, { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, useScroll } from '@react-three/drei'
import * as THREE from 'three'
import '../App.css'
import Banana from '../components/Banana'
import SugarCube from '../components/SugarCube'
import Ant from '../components/Ant'

/**
 * ScrollSync component:
 * - runs inside the Canvas and updates a CSS variable "--so" with scroll.offset (0..1..n).
 * - we'll use that CSS var to animate the overlay text with pure CSS.
 */
function ScrollSync() {
  const scroll = useScroll()
  useFrame(() => {
    // scroll.offset ranges 0..pages-1 normalized across pages; for pages=2 it goes 0..1
    const offset = scroll.offset // number 0..1
    // clamp and set CSS variable on root (scoped if you want)
    document.documentElement.style.setProperty('--so', offset.toString())
  })
  return null
}

/**
 * CameraController:
 * - lerps camera position based on scroll offset to create smooth transition from intro -> main.
 * - tweak values to match desired movement.
 */
function CameraController() {
  const { camera } = useThree()
  const scroll = useScroll()
  useFrame((state, delta) => {
    const t = scroll.offset // 0 -> intro, 1 -> main
    // camera start (intro): z=6, x=0.8 (slightly off center), y=1.3 (higher)
    // camera end (main): z=3.8, x=0, y=0.5 (closer & lower)
    const from = new THREE.Vector3(0.8, 1.3, 6)
    const to   = new THREE.Vector3(0.0, 0.5, 3.8)
    // interpolate target
    const target = from.lerpVectors(from, to, t)
    // smooth lerp the camera
    camera.position.lerp(target, 1 - Math.pow(0.001, delta))
    camera.lookAt(0, 0.15, 0)
  })
  return null
}

/**
 * SceneContent:
 * - shows banana + sugar cubes + ants in the world coordinates expected.
 * - these objects are present from the start, but initially the intro overlay hides them.
 */
function SceneContent() {
  // cube positions used by ants (same as earlier)
  const cubeA = new THREE.Vector3(1.1, 0.18, -0.9)
  const cubeB = new THREE.Vector3(-1.2, 0.18, -1.8)
  const getTargets = () => [cubeA.clone(), cubeB.clone()]

  // subtle ground plane for depth (optional)
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight intensity={0.35} position={[5, 5, 5]} />

      {/* Banana at center */}
      <Banana position={[0, 0.15, 0]} scale={0.02} />

      {/* Sugar cubes */}
      <SugarCube position={[cubeA.x, cubeA.y, cubeA.z]} />
      <SugarCube position={[cubeB.x, cubeB.y, cubeB.z]} />

      {/* Ants */}
      <Ant startPos={[0.8, 0.05, -0.4]} getTargets={getTargets} />
      <Ant startPos={[1.2, 0.05, -1.6]} getTargets={getTargets} />
      <Ant startPos={[-0.2, 0.05, -0.6]} getTargets={getTargets} />
      <Ant startPos={[-1.0, 0.05, -0.9]} getTargets={getTargets} />
      <Ant startPos={[-0.6, 0.05, -1.9]} getTargets={getTargets} />
    </>
  )
}

/**
 * Experience main component:
 * - ScrollControls pages={2} handles the scroll area:
 *   - page 0 = intro, page 1 = main scene
 * - CSS var --so (0..1) is set by ScrollSync and used to animate the overlay text.
 */
export default function Experience() {
  return (
    <div className="experience-root">
      {/* Overlay intro text — animated via CSS using --so */}
      <div className="intro-overlay">
        <div className="intro-text">Into The Depth</div>
        <div className="intro-sub">scroll to enter</div>
      </div>

      {/* 3D Canvas */}
      <Canvas className="experience-canvas" camera={{ position: [0.8, 1.3, 6], fov: 50 }}>
        {/* ScrollControls with 2 pages: index 0 is intro, index 1 is main */}
        <ScrollControls pages={2} damping={0.12}>
          <ScrollSync />
          <CameraController />
          <SceneContent />
        </ScrollControls>
      </Canvas>
    </div>
  )
}
