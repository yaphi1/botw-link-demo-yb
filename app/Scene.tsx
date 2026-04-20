import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Html, Environment } from '@react-three/drei';
import { LinkModel } from './LinkModel';
import { Town } from './Town';
import { Sky } from '@react-three/drei'
import * as THREE from 'three';
import { SunLight } from './SunLight';
import { FollowCamera } from './FollowCamera';

const SUN_POSITION: [number, number, number] = [-10, 10, 0];

export default function Scene() {
  const linkRef = useRef<THREE.Group | null>(null);
  const collidableMeshes = useRef<THREE.Mesh[]>([]);

  return (
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp'] },
        { name: 'backward', keys: ['ArrowDown'] },
        { name: 'left', keys: ['ArrowLeft'] },
        { name: 'right', keys: ['ArrowRight'] },
        { name: 'cameraLeft', keys: ['a'] },
        { name: 'cameraRight', keys: ['d'] },
        { name: 'cameraZoomIn', keys: ['w'] },
        { name: 'cameraZoomOut', keys: ['s'] },
        { name: 'cameraUp', keys: ['r'] },
        { name: 'cameraDown', keys: ['f'] },
      ]}
    >
      <Canvas
          style={{ height: '100vh', width: '100%' }}
          camera={{ position: [0, 1.5, 3] }}
          shadows="soft"
        >
        <Suspense fallback={<Html center>Loading...</Html>}>
          <Environment preset="dawn" />
          <fogExp2 attach="fog" args={['#a8c4d8', 0.012]} />
          <ambientLight intensity={0.5} />
          <SunLight followRef={linkRef} position={SUN_POSITION} />
          <Sky
            distance={450000}
            sunPosition={SUN_POSITION}
            inclination={0}
            azimuth={0.25}
          />
          <Town collidablesRef={collidableMeshes} />
          <LinkModel ref={linkRef} collidables={collidableMeshes} />
          <FollowCamera followRef={linkRef} />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
