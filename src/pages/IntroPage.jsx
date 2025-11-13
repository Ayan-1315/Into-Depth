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

export default function IntroPage() {
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
          <Scene lightOn={lightOn} setLightOn={setLightOn} />
        </ScrollControls>
      </Canvas>

      {!lightOn && <div className="intro-mask" />}
      <div className="intro-header">Into The Depth</div>
    </div>
  )
}

function Scene({ lightOn, setLightOn }) {
  const lamp = useGLTF('/models/hanging_lamp.glb')
  const table = useGLTF('/models/Table.glb')
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

  return (
    <>
      {/* 🔦 Spotlight */}
      <spotLight
        ref={spotlight}
        position={[0, 3, 2]}
        angle={0.35}
        penumbra={0.5}
        intensity={lightOn ? 20 : 0.1}
        castShadow
        distance={10}
        shadow-mapSize={1024}
      />

      {/* ✨ Glowing Bulb */}
      {lightOn && (
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            emissive={'#fff6cc'}
            emissiveIntensity={2}
            color={'#000'}
          />
        </mesh>
      )}

      {/* 💡 Lamp */}
      <primitive
        object={lamp.scene}
        position={[0, 2.5, 0]}
        scale={0.5}
        onClick={() => setLightOn(true)}
        castShadow
      />

      {/* 🪵 Table */}
      {lightOn && (
        <primitive
          object={table.scene}
          position={[0, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={1}
          receiveShadow
        />
      )}

      {/* 🍌 Banana */}
      {lightOn && (
        <primitive
          object={banana.scene}
          position={[0, 0.15, 0]}
          rotation={[0, Math.PI / 4, 0]}
          scale={0.015}
          castShadow
        />
      )}

      {/* 🟥 Red Floor */}
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

useGLTF.preload('/models/hanging_lamp.glb')
useGLTF.preload('/models/Table.glb')
useGLTF.preload('/models/banana.glb')

