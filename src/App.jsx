import { useState } from 'react'
import IntroPage from './pages/IntroPage'
import './App.css'

export default function App() {
  const [sceneReady, setSceneReady] = useState(false)

  return (
    <>
      {!sceneReady && <IntroPage onReveal={() => setSceneReady(true)} />}

      {sceneReady && (
        <div className="lit-screen">
          {/* Your 3D scene or scroll animation will go here */}
        </div>
      )}
    </>
  )
}
