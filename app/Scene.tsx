import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, OrbitControls, Html, Environment } from '@react-three/drei';
import { LinkModel } from './LinkModel';
import { GroundGrid } from './GroundGrid';
import { Town } from './Town';
import { Sky } from '@react-three/drei'

export default function Scene() {
  return (
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp'] },
        { name: 'backward', keys: ['ArrowDown'] },
        { name: 'left', keys: ['ArrowLeft'] },
        { name: 'right', keys: ['ArrowRight'] },
      ]}
    >
      <Canvas
          style={{ height: '100vh', width: '100%' }}
          camera={{ position: [0, 1.5, 3] }}
          shadows
        >
        <Suspense fallback={<Html center>Loading...</Html>}>
          <Environment preset="dawn" />
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[2, 5, 2]} 
            intensity={1}
            castShadow
          />
          {/* <GroundGrid /> */}
          <Sky
            distance={450000}
            sunPosition={[-10, 10, 0]}
            inclination={0}
            azimuth={0.25}
          />
          <Town />
          <LinkModel />
          <OrbitControls target={[0, 1, 0]} />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
