// src/pages/MainExperience.jsx
import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, useScroll } from '@react-three/drei';
import '../App.css'; //

/**
 * This component contains the main 3D scene that the user
 * will scroll through after the intro.
 */
function Scene() { //
  const { camera } = useThree();
  const scroll = useScroll();

  useFrame(() => {
    // This logic is from your original src/components/Scene.jsx
    // It moves the camera forward as the user scrolls.
    camera.position.z = 5 - scroll.offset * 10;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      
      {/* This is placeholder content from src/components/Scene.jsx */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <mesh position={[0, 0, -5]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <mesh position={[0, 0, -10]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </>
  );
}

/**
 * MainExperience component
 * This wraps your scene in a Canvas and ScrollControls.
 */
export default function MainExperience() {
  return (
    // Use the 'lit-screen' style for a light background
    <div className="lit-screen"> 
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        {/* ScrollControls creates a scrollable container.
          'pages' determines how many "screens" of scrolling content you have.
          'damping' smooths the scroll effect.
        */}
        <ScrollControls pages={3} damping={0.25}>
          <Scene />
        </ScrollControls>
      </Canvas>
    </div>
  );
}