import React, { useState } from 'react'
import IntroPage from './pages/IntroPage'
import Experience from './pages/Experience'
import './App.css'

export default function App() {
  const [sceneReady, setSceneReady] = useState(false)

  return (
    <>
      {!sceneReady && <IntroPage onReveal={() => setSceneReady(true)} />}
      {sceneReady && <Experience />}
    </>
  )
}
