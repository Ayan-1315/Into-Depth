// src/components/SugarCube.jsx
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function SugarCube({
  position = [1.5, 0.2, -1],
  size = 0.45,
  bobAmplitude = 0.06,
  bobSpeed = 1.2,
  id = 'sugar-cube'
}) {
  const ref = useRef()
  const clock = useRef(0)

  useFrame((state, delta) => {
    clock.current += delta
    if (ref.current) {
      // gentle bobbing to give life
      ref.current.position.y = position[1] + Math.sin(clock.current * bobSpeed) * bobAmplitude
      // light rotational wobble
      ref.current.rotation.y = Math.sin(clock.current * 0.5) * 0.08
    }
  })

  return (
    <group ref={ref} position={position} name={id}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial metalness={0.1} roughness={0.9} color={'#fffdfa'} />
      </mesh>
      {/* subtle inner highlight */}
      <mesh position={[0, 0.06, 0]} scale={[0.98, 0.1, 0.98]}>
        <boxGeometry args={[size, 0.08, size]} />
        <meshStandardMaterial color={'#fff3f3'} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}
