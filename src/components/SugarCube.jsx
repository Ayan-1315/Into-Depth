// src/components/SugarCube.jsx
import React from 'react'

export default function SugarCube({
  position = [1.5, 0.12, -1],
  size = 0.26,
  id = 'sugar-cube'
}) {
  return (
    <group position={position} name={id}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial metalness={0.12} roughness={0.9} color={'#fffdfa'} />
      </mesh>

      {/* subtle top highlight (still static) */}
      <mesh position={[0, 0.04, 0]} scale={[0.98, 0.1, 0.98]}>
        <boxGeometry args={[size, 0.08, size]} />
        <meshStandardMaterial color={'#fff3f3'} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}
