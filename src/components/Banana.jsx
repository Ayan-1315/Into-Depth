// src/components/Banana.jsx
import React from 'react'
import { useGLTF } from '@react-three/drei'

export default function Banana({
  position = [0, 0, 0],
  rotation = [30, Math.PI / 2, 4],
  scale = 0.01,
  id = 'banana'
}) {
  const { scene: bananaScene } = useGLTF('/models/banana.glb')

  // Fix tiny model scale (tweak between 30-60 if needed)
  const MODEL_SCALE_FIX = 0.5

  return (
    <group position={position} rotation={rotation} scale={scale * MODEL_SCALE_FIX} name={id}>
      <primitive object={bananaScene} />
    </group>
  )
}

useGLTF.preload('/models/banana.glb')
