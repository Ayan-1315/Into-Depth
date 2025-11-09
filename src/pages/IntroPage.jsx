import { useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Stage } from '@react-three/drei'
import './IntroPage.css'

function Model({ path, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const { scene } = useGLTF(path)
  return <primitive object={scene} scale={scale} position={position} rotation={rotation} />
}

export default function IntroPage({ onReveal }) {
  const [lightOn, setLightOn] = useState(false)
  const spotlightRef = useRef()

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
      <Canvas camera={{ position: [0, 1.5, 5], fov: 40 }}>
        {lightOn && <ambientLight intensity={0.7} />}
        <directionalLight intensity={lightOn ? 1.2 : 0.1} position={[1, 5, 2]} castShadow />
        <spotLight
          ref={spotlightRef}
          position={[0, 5, 0]}
          angle={0.3}
          intensity={lightOn ? 0.8 : 0.2}
          penumbra={0.5}
          castShadow
        />
        <Stage environment="city" intensity={0.2}>
          {/* Models */}
          <Model path="/models/hanging_lamp.glb" scale={0.8} position={[0, 2.3, 0]} />
          <Model path="/models/Table.glb" scale={0.015} position={[0, -1.05, 0]} rotation={[0, Math.PI / 2, 0]} />
          <Model path="/models/banana.glb" scale={0.25} position={[0, -0.5, 0.4]} rotation={[0, Math.PI / 3, 0]} />
        </Stage>
        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* Spotlight mask */}
      {!lightOn && <div className="intro-cover" />}

      {/* Heading */}
      <div className="intro-header">Into The Depth</div>

      {/* Switch Target */}
      {!lightOn && (
        <div className="intro-text" style={{ top: '55vh', left: '50vw', transform: 'translate(-50%, -50%)' }}>
          🔦 Find the switch
        </div>
      )}

      {/* Switch Click */}
      {!lightOn && (
        <div
          className="light-emoji"
          style={{ top: '70vh', left: '48vw' }}
          onClick={() => {
            setLightOn(true)
            setTimeout(() => onReveal && onReveal(), 2500)
          }}
        >
          💡
        </div>
      )}
    </>
  )
}
