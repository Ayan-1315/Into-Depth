// src/Scene.jsx
import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';

export default function Scene() {
  const { camera } = useThree();
  const scroll = useScroll();

  useFrame(() => {
    // Move the camera forward as the user scrolls (linear mapping)
    camera.position.z = 5 - scroll.offset * 10;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      {/* Example layered meshes at different depths */}
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
