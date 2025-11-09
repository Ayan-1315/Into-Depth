import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

export default function HangingLight({ position = [0, 2.5, 0], ropeLength = 2.5, iconURL = '/a34a1a21-2843-44ad-a8ac-1089d906c8de.png', onClick }) {
  const ropeRef = useRef()
  const bulbRef = useRef()
  const texture = useTexture(iconURL)

  const ropeGeometry = useMemo(() => {
    const points = []
    const segments = 10
    for (let i = 0; i <= segments; i++) {
      points.push(new THREE.Vector3(0, -i * (ropeLength / segments), 0))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [ropeLength])

  useFrame(() => {
    if (bulbRef.current) {
      bulbRef.current.rotation.y += 0.005
    }
  })

  return (
    <group position={position}>
      {/* Rope */}
      <line ref={ropeRef} geometry={ropeGeometry}>
        <lineBasicMaterial attach="material" color="#444" linewidth={2} />
      </line>

      {/* Light bulb / switch */}
      <mesh
        ref={bulbRef}
        position={[0, -ropeLength - 0.3, 0]}
        onClick={onClick}
      >
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </group>
  )
}
