import { useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import './IntroPage.css'

function Model({ path, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], onClick, visible = true }) {
  const { scene } = useGLTF(path)
  const ref = useRef()
  return visible ? (
    <primitive object={scene} scale={scale} position={position} rotation={rotation} ref={ref} onClick={onClick} />
  ) : null
}

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
    <>
      <Canvas camera={{ position: [0, 1.5, 5], fov: 40 }} shadows>
        {lightOn && <ambientLight intensity={0.7} />}
        <directionalLight
          intensity={lightOn ? 1.2 : 0.1}
          position={[2, 5, 2]}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <spotLight
          position={[0, 4.5, 0]}
          angle={0.4}
          intensity={lightOn ? 1.0 : 0.2}
          penumbra={0.4}
          castShadow
        />

        {/* Models (hidden until lightOn is true) */}
        <Model
          path="/models/Table.glb"
          scale={0.035}
          position={[0, -1.1, 0]}
          rotation={[0, Math.PI / 2, 0]}
          visible={lightOn}
        />
        <Model
          path="/models/banana.glb"
          scale={0.15}
          position={[0, -0.6, 0.5]}
          rotation={[0, Math.PI / 3, 0]}
          visible={lightOn}
        />

        {/* Lamp (always visible and clickable) */}
        <Model
          path="/models/hanging_lamp.glb"
          scale={0.8}
          position={[0, 2.3, 0]}
          onClick={() => {
            if (!lightOn) {
              setLightOn(true)
              setTimeout(() => onReveal && onReveal(), 3000)
            }
          }}
        />

        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* Spotlight mask */}
      {!lightOn && <div className="intro-cover" />}

      {/* Title */}
      <div className="intro-header">Into The Depth</div>

      {/* Text Prompt */}
      {!lightOn && (
        <div className="intro-text" style={{ top: '58vh', left: '50vw', transform: 'translate(-50%, -50%)' }}>
          Click on the lamp to turn on the light
        </div>
      )}
    </>
  )
}
