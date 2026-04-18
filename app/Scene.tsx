import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, OrbitControls, Html, Environment } from '@react-three/drei';
import { LinkModel } from './LinkModel';

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
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#ddd" />
          </mesh>
          <gridHelper args={[20, 20]} position={[0, 0.01, 0]} />
            <LinkModel />
          <OrbitControls target={[0, 1, 0]} />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
