import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

export function SunLight({ followRef, position }: {
  followRef: React.RefObject<THREE.Group | null>;
  position: [number, number, number];
}) {
  const lightRef = useRef<THREE.DirectionalLight>(null!);

  useFrame(() => {
    if (!followRef.current) { return; }
    const { x, z } = followRef.current.position;
    lightRef.current.position.set(x + position[0], position[1], z + position[2]);
    lightRef.current.target.position.set(x, 0, z);
    lightRef.current.target.updateMatrixWorld();
  });

  return (
    <directionalLight
      ref={lightRef}
      intensity={2}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0001}
      shadow-camera-left={-15}
      shadow-camera-right={15}
      shadow-camera-top={15}
      shadow-camera-bottom={-15} />
  );
}
