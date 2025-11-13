// src/App.jsx
import { useState } from 'react'
import IntroPage from './pages/IntroPage' //
// Import the new MainExperience component
import MainExperience from './pages/MainExperience'
import './App.css' //

export default function App() {
  const [sceneReady, setSceneReady] = useState(false) //

  return (
    <>
      {/* This prop is now correctly passed and will be used by IntroPage */}
      {!sceneReady && <IntroPage onReveal={() => setSceneReady(true)} />}

      {/* When sceneReady is true, render the MainExperience component */}
      {sceneReady && <MainExperience />}
    </>
  )
}