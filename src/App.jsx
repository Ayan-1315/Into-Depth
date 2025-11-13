import { useState } from 'react'
import IntroPage from './pages/IntroPage'
import './App.css'

export default function App() {
  const [started, setStarted] = useState(false)

  return (
    <>
      {!started ? (
        <IntroPage onEnter={() => setStarted(true)} />
      ) : (
        // Scene will create its own Canvas (keeps separation)
        <div style={{ width: '100vw', height: '100vh' }}>
          <SceneCanvas />
        </div>
      )}
    </>
  )
}

// Lazy load the Canvas/Scene into the same file to keep this snippet self-contained
import SceneCanvas from './components/SceneCanvas'
