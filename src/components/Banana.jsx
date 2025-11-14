// src/components/Banana.jsx
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function Banana({
  position = [0, 0.15, 0],
  rotation = [0, Math.PI / 4, 0],
  scale = 0.02,
  hoverable = false, // not used now but useful later
  id = 'banana'
}) {
  const { scene: bananaScene } = useGLTF('/models/banana.glb')
  const ref = useRef()
  const clock = useRef(0)

  useFrame((state, delta) => {
    clock.current += delta
    // subtle float & slow spin to make it feel alive
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.current * 1.2) * 0.03
      ref.current.rotation.y = rotation[1] + Math.sin(clock.current * 0.4) * 0.1
    }
  })

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale} name={id}>
      <primitive object={bananaScene} />
    </group>
  )
}

// Preload for faster loading
useGLTF.preload('/models/banana.glb')
