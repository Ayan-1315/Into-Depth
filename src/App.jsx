import { useState } from 'react'
import IntroPage from './pages/IntroPage'
import MainExperience from './pages/MainExperience'
import './App.css'

export default function App() {
  const [sceneReady, setSceneReady] = useState(false)

  return (
    <>
      {!sceneReady && <IntroPage onReveal={() => setSceneReady(true)} />}
      {sceneReady && <MainExperience />}
    </>
  )
}
