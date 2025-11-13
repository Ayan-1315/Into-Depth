// This component renders the Canvas and the Scene
import React from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './Scene'

export default function SceneCanvas() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.5, 5], fov: 45 }}
      gl={{ antialias: true }}
    >
      {/* strong ambient so model shows even if material is dark */}
      <ambientLight intensity={1.0} />
      {/* soft directional for shape */}
      <directionalLight position={[5, 10, 5]} intensity={0.6} />
      <Scene />
    </Canvas>
  )
}
