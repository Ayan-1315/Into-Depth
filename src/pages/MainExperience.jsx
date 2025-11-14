// src/pages/MainExperience.jsx
import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, useScroll } from '@react-three/drei';
import '../App.css';
import * as THREE from 'three';
import Banana from '../components/Banana';

function SceneContent() {
  const { camera } = useThree();
  const scroll = useScroll();

  useFrame(() => {
    // Smooth camera movement based on scroll offset (tweak multipliers if needed)
    const targetZ = 5 - scroll.offset * 12; // camera moves forward as user scrolls
    const targetY = THREE.MathUtils.lerp(camera.position.y, 0.5, 0.06);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
    camera.position.y = targetY;
    camera.lookAt(0, 0.15, 0);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight intensity={0.25} position={[5, 5, 5]} />

      {/* Banana sits in the main scene at the same coordinates the intro used */}
      <Banana position={[0, 0.15, 0]} scale={0.02} />

      {/* Placeholder objects where you'll later add sugar cubes & ants */}
      <mesh position={[1.5, 0.1, -1]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial />
      </mesh>

      <mesh position={[-1.5, 0.1, -2]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial />
      </mesh>
    </>
  );
}

export default function MainExperience() {
  return (
    <div className="lit-screen">
      <Canvas camera={{ position: [0, 0.5, 5], fov: 60 }}>
        <ScrollControls pages={3} damping={0.25}>
          <SceneContent />
        </ScrollControls>
      </Canvas>
    </div>
  );
}
