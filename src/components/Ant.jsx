// src/components/Ant.jsx
import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Tiny ant prototype:
 * - visual: three small spheres (head, thorax, abdomen)
 * - simple behavior: wander + bias (home) toward nearest sugar cube passed via props
 *
 * Props:
 * - startPos: initial world position
 * - speed: movement speed
 * - wanderRadius: how wildly it wanders
 * - targetGetter: a function that returns an array of target positions (sugar cubes)
 */
export default function Ant({
  startPos = [0.6, 0.05, -0.8],
  speed = 0.9,
  wanderRadius = 0.6,
  id = 'ant',
  getTargets = () => []
}) {
  const ref = useRef()
  const velocity = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * 0.02,
    0,
    (Math.random() - 0.5) * 0.02
  ))
  const tmpV = useMemo(() => new THREE.Vector3(), [])
  const clock = useRef(0)
  const wanderOffset = useMemo(() => Math.random() * 100, [])

  useFrame((state, delta) => {
    clock.current += delta
    if (!ref.current) return

    // Get targets (sugar cubes) and choose nearest
    const targets = getTargets()
    let nearest = null
    let nearestDist = Infinity
    for (let t of targets) {
      const d = ref.current.position.distanceToSquared(t)
      if (d < nearestDist) {
        nearestDist = d
        nearest = t
      }
    }

    // Wander vector (perlin-like with sin/cos)
    const wander = new THREE.Vector3(
      Math.sin(clock.current * 1.2 + wanderOffset),
      0,
      Math.cos(clock.current * 0.9 + wanderOffset * 0.7)
    ).multiplyScalar(0.5 * wanderRadius)

    // Home vector toward nearest sugar cube (if close enough)
    let home = new THREE.Vector3()
    if (nearest) {
      home.copy(nearest).sub(ref.current.position).setY(0)
      const homeDist = home.length()
      if (homeDist > 0.001) home.normalize()
      // weight home by inverse distance so ants approach but also circle
      const homeWeight = THREE.MathUtils.clamp(1 / (Math.sqrt(nearestDist) + 0.5), 0, 1.5)
      home.multiplyScalar(homeWeight)
    }

    // apply steering: wander + home + small random jitter
    tmpV.set(0, 0, 0)
    tmpV.addScaledVector(wander, 0.6)
    tmpV.addScaledVector(home, 1.0)
    tmpV.addScaledVector(velocity.current, 0.4)

    // random jitter
    tmpV.add(new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      0,
      (Math.random() - 0.5) * 0.02
    ))

    // update velocity and position
    velocity.current.lerp(tmpV, 0.06)
    velocity.current.clampLength(0, speed * 0.6)

    ref.current.position.addScaledVector(velocity.current, delta)

    // keep ants on the ground plane roughly y = 0.05
    ref.current.position.y = 0.05

    // rotate ant to face movement direction
    if (velocity.current.lengthSq() > 0.00001) {
      const dir = velocity.current.clone().normalize()
      const angle = Math.atan2(dir.x, dir.z) // note axes swap for three.js
      ref.current.rotation.y = angle
    }

    // small leg / body bobbing using sin
    const bob = Math.sin(clock.current * 12 + wanderOffset) * 0.01
    ref.current.children.forEach((child, idx) => {
      if (child.name === 'segment') {
        child.position.y = 0.02 + bob * (idx * 0.6)
      }
    })
  })

  return (
    <group ref={ref} position={startPos} name={id} scale={[0.08, 0.08, 0.08]}>
      {/* head */}
      <mesh name="segment" position={[0, 0.02, 0.16]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={'#1a1a1a'} />
      </mesh>

      {/* thorax */}
      <mesh name="segment" position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color={'#222'} />
      </mesh>

      {/* abdomen */}
      <mesh name="segment" position={[0, 0.02, -0.18]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color={'#111'} />
      </mesh>
    </group>
  )
}
