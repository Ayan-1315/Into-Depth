// src/pages/IntroPage.jsx
import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  ScrollControls,
  useGLTF,
  Environment,
  useScroll
} from '@react-three/drei'
import * as THREE from 'three'
import './IntroPage.css'

// Accept the 'onReveal' prop passed from App.jsx
export default function IntroPage({ onReveal }) {
  const [lightOn, setLightOn] = useState(false)

  useEffect(() => {
    const updateMouse = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`)
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`)
    }
    window.addEventListener('mousemove', updateMouse)
    return () => window.removeEventListener('mousemove', updateMouse)
  }, [])

  return (
    <div className="intro-wrapper">
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 5], fov: 35 }}
        gl={{ physicallyCorrectLights: true }}
      >
        <ambientLight intensity={lightOn ? 0.4 : 0.02} />
        <Environment preset="warehouse" />
        <ScrollControls pages={6} damping={0.25}>
          {/* Pass 'onReveal' down to the 3D Scene component */}
          <Scene lightOn={lightOn} setLightOn={setLightOn} onReveal={onReveal} />
        </ScrollControls>
      </Canvas>

      {!lightOn && <div className="intro-mask" />}
      <div className="intro-header">Into The Depth</div>
    </div>
  )
}

// The Scene function now accepts and uses 'onReveal'
function Scene({ lightOn, setLightOn, onReveal }) {
  // As requested, the 'lamp' model has been removed.
  const banana = useGLTF('/models/banana.glb')

  const scroll = useScroll()
  const cameraTarget = useRef(new THREE.Vector3(0, 0.15, 5))
  const spotlight = useRef()

  useFrame((state, delta) => {
    const t = scroll.offset
    cameraTarget.current.z = THREE.MathUtils.lerp(5, 1.5, t)
    cameraTarget.current.y = THREE.MathUtils.lerp(1.5, 1.0, t)
    state.camera.position.lerp(cameraTarget.current, 1 - Math.pow(0.001, delta))
    state.camera.lookAt(0, 0.15, 0)

    if (spotlight.current) {
      spotlight.current.target.position.set(0, 0.15, 0)
      spotlight.current.target.updateMatrixWorld()
    }
  })

  // This handler will now set the light AND call onReveal
  const handleLampClick = () => {
    setLightOn(true);
    // If the onReveal function exists (it should), call it.
    if (onReveal) {
      onReveal();
    }
  }

  return (
    <>
      {/* Spotlight */}
      <spotLight
        ref={spotlight}
        position={[0, 3, 2]}
        angle={0.35}
        penumbra={0.5}
        // The intensity is low (0.1) until 'lightOn' is true
        intensity={lightOn ? 20 : 0.1}
        castShadow
        distance={10}
        shadow-mapSize={1024}
      />

      {/* The 'Glowing Bulb' mesh has been removed. */}

      {/* The 'Lamp' primitive has been removed. */}

      {/* Banana */}
      {/* The onClick handler has been moved to the banana. */}
      {/* The banana will be dimly lit by the 0.1 intensity spotlight. */}
      <primitive
        object={banana.scene}
        position={[0, 0.15, 0]}
        rotation={[0, Math.PI / 4, 0]}
        scale={0.015}
        castShadow
        // Add the onClick handler here
        onClick={handleLampClick}
      />

      {/* Red Floor */}
      {lightOn && (
        <mesh
          position={[0, -0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="darkred" />
        </mesh>
      )}
    </>
  )
}

// Preload for 'hanging_lamp.glb' has been removed.
useGLTF.preload('/models/banana.glb')