import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, ScrollControls, useScroll } from '@react-three/drei'
import * as THREE from 'three'
import './Scene.css'

/**
 * Scene:
 * - loads banana.glb
 * - if the model fails or is invisible, shows a fallback cube
 * - traverses the model to ensure meshes have visible materials (temporary)
 * - camera focuses on banana and scroll zooms in
 */

export default function Scene() {
  const banana = useGLTF('/models/banana.glb')
  const scroll = useScroll()
  const camTarget = useRef(new THREE.Vector3(0, 0.2, 3.5))
  const hasModelRef = useRef(false)
  const modelRef = useRef()

  // Debug: log model structure once
  useEffect(() => {
    try {
      console.log('GLTF banana:', banana)
      if (banana && banana.scene) {
        // mark model present
        hasModelRef.current = true
        // make sure every mesh receives/casts shadows and has a visible material
        banana.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            // If material is black or null, temporarily set a neutral material so you can see it
            if (!child.material || (child.material && child.material.color && child.material.color.getHex() === 0x000000)) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xffd24d, // banana-like fallback
                metalness: 0,
                roughness: 0.7
              })
            }
          }
        })
      } else {
        console.warn('banana.glb not found or empty.scene')
      }
    } catch (err) {
      console.error('Error inspecting banana gltf', err)
    }
  }, [banana])

  useFrame((state, delta) => {
    const t = scroll.offset
    // camera moves from z=5 to z=1.2 based on scroll
    camTarget.current.z = THREE.MathUtils.lerp(5, 1.2, t)
    camTarget.current.y = THREE.MathUtils.lerp(1.5, 0.2, t)
    state.camera.position.lerp(camTarget.current, 1 - Math.pow(0.001, delta))
    state.camera.lookAt(0, 0.15, 0)
  })

  return (
    <>
      <ScrollControls pages={3} damping={0.2}>
        {/* If model loaded and has scene, render primitive; else render debug cube */}
        {hasModelRef.current && banana && banana.scene ? (
          <primitive
            ref={modelRef}
            object={banana.scene}
            position={[0, 0.15, 0]}
            rotation={[0, Math.PI / 4, 0]}
            scale={0.015}
          />
        ) : (
          // fallback visible geometry so you can confirm rendering
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color={'orange'} />
          </mesh>
        )}

        {/* green ground */}
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color={'green'} />
        </mesh>
      </ScrollControls>
    </>
  )
}

useGLTF.preload('/models/banana.glb')
