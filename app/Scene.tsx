import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, useAnimations, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MOVEMENT_STATES = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
} as const;
type MovementState = typeof MOVEMENT_STATES[keyof typeof MOVEMENT_STATES];

function LinkModel({ movementState } : { movementState: MovementState }) {
  const characterImport = useGLTF('/3d_assets/link_sword_and_shield.glb');
  const characterModel = characterImport.scene;
  const idleAnimImport = useGLTF('/3d_assets/animations/sword_and_shield_idle.glb');
  const runAnimImport = useGLTF('/3d_assets/animations/sword_and_shield_run.glb');

  const animations = [
    idleAnimImport.animations[1], // for some reason, the mixamo export had an initial ghost copy animation that I couldn't find in blender
    runAnimImport.animations[0],
  ];
  const { actions } = useAnimations(animations, characterModel);

  const [actionIdle, actionRun] = Object.values(actions);

  useEffect(() => {
    const transitionDuration = 0.5;

    if (movementState === MOVEMENT_STATES.RUNNING) {
      actionIdle?.fadeOut(transitionDuration);
      actionRun?.reset().fadeIn(transitionDuration).play();
    } else {
      actionRun?.fadeOut(transitionDuration);
      actionIdle?.reset().fadeIn(transitionDuration).play();
    }
  }, [movementState, actionIdle, actionRun]);

  useEffect(() => {
    characterModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [characterModel]);

  return <primitive object={characterModel} dispose={null} position={[0, 0, 0]} />;
}

export default function Scene() {
  const [movementState, setMovementState] = useState<MovementState>(MOVEMENT_STATES.IDLE);

  const handleCanvasClick = () => {
    setMovementState(prev => prev === MOVEMENT_STATES.IDLE ? MOVEMENT_STATES.RUNNING : MOVEMENT_STATES.IDLE);
  };

  return (
    <Canvas
      style={{ height: '100vh', width: '100%' }}
      camera={{ position: [0, 1.5, 3] }}
      shadows
      onClick={handleCanvasClick}
    >
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
      <Suspense fallback={<Html center>Loading...</Html>}>
        <LinkModel movementState={movementState} />
      </Suspense>
      <OrbitControls target={[0, 1, 0]} />
    </Canvas>
  );
}
