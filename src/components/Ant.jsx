// src/components/Ant.jsx
import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Ant({
  startPos = [0.6, 0.05, -0.8],
  speed = 0.9,
  wanderRadius = 0.6,
  id = 'ant',
  getTargets = () => [],
  neighborsGetter = null // optional function to provide other ant positions
}) {
  const ref = useRef()
  const velocity = useRef(new THREE.Vector3((Math.random() - 0.5) * 0.02, 0, (Math.random() - 0.5) * 0.02))
  const tmpV = useMemo(() => new THREE.Vector3(), [])
  const clock = useRef(0)
  const wanderOffset = useMemo(() => Math.random() * 100, [])

  useFrame((state, delta) => {
    clock.current += delta
    if (!ref.current) return

    // Nearest sugar cube
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

    // Wandering vector
    const wander = new THREE.Vector3(
      Math.sin(clock.current * 1.2 + wanderOffset),
      0,
      Math.cos(clock.current * 0.9 + wanderOffset * 0.7)
    ).multiplyScalar(0.5 * wanderRadius)

    // Home (toward nearest sugar cube)
    let home = new THREE.Vector3()
    if (nearest) {
      home.copy(nearest).sub(ref.current.position).setY(0)
      const homeDist = home.length()
      if (homeDist > 0.001) home.normalize()
      const homeWeight = THREE.MathUtils.clamp(1 / (Math.sqrt(nearestDist) + 0.4), 0, 1.6)
      home.multiplyScalar(homeWeight * 1.2)
    }

    // Separation: avoid other ants (if neighborsGetter provided)
    let separation = new THREE.Vector3()
    if (typeof neighborsGetter === 'function') {
      const neighbors = neighborsGetter() // expected array of Vector3 positions
      const SEP_RADIUS = 0.24
      let sepCount = 0
      for (let n of neighbors) {
        // skip self too-close detection by comparing positions
        const d2 = ref.current.position.distanceToSquared(n)
        if (d2 > 0 && d2 < SEP_RADIUS * SEP_RADIUS) {
          const diff = ref.current.position.clone().sub(n).setY(0)
          const inv = 1 / (Math.sqrt(d2) + 0.0001)
          separation.add(diff.multiplyScalar(inv))
          sepCount++
        }
      }
      if (sepCount > 0) {
        separation.divideScalar(sepCount)
        separation.normalize().multiplyScalar(0.9)
      }
    }

    // Steering: combine wander + home + separation + current velocity
    tmpV.set(0, 0, 0)
    tmpV.addScaledVector(wander, 0.6)
    tmpV.addScaledVector(home, 1.0)
    tmpV.addScaledVector(separation, 1.25)
    tmpV.addScaledVector(velocity.current, 0.35)

    // jitter
    tmpV.add(new THREE.Vector3((Math.random() - 0.5) * 0.02, 0, (Math.random() - 0.5) * 0.02))

    // update velocity & position
    velocity.current.lerp(tmpV, 0.08)
    velocity.current.clampLength(0, speed * 0.6)
    ref.current.position.addScaledVector(velocity.current, delta)

    // keep ants on ground plane
    ref.current.position.y = 0.05

    // rotate to face movement
    if (velocity.current.lengthSq() > 0.00001) {
      const dir = velocity.current.clone().normalize()
      const angle = Math.atan2(dir.x, dir.z) // x/z swap
      ref.current.rotation.y = angle
    }

    // keep body segments static (no breathing)
    ref.current.children.forEach((child) => {
      if (child.name === 'segment') child.position.y = 0.02
    })
  })

  return (
    <group ref={ref} position={startPos} name={id} scale={[0.08, 0.08, 0.08]}>
      <mesh name="segment" position={[0, 0.02, 0.16]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={'#1a1a1a'} />
      </mesh>
      <mesh name="segment" position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color={'#222'} />
      </mesh>
      <mesh name="segment" position={[0, 0.02, -0.18]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color={'#111'} />
      </mesh>
    </group>
  )
}
