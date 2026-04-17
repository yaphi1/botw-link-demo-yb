import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, useAnimations, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function LinkModel() {
  const characterImport = useGLTF('/3d_assets/link.glb');
  const characterModel = characterImport.scene;
  const anim = useGLTF('/3d_assets/animations/sword_and_shield_idle.glb');
  const { actions, mixer } = useAnimations(anim.animations, characterModel);

  useEffect(() => {
    if (!actions) return;
    const keys = Object.keys(actions);
    if (keys.length > 0) {
      const action = actions[keys[0]];
      action?.reset().play();
      action?.setLoop(THREE.LoopRepeat, Infinity);
    }
    return () => { mixer?.stopAllAction() };
  }, [actions, mixer]);

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
  return (
    <Canvas
      style={{ height: '100vh', width: '100%' }}
      camera={{ position: [0, 1.5, 3] }}
      shadows
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
        <LinkModel />
      </Suspense>
      <OrbitControls target={[0, 1, 0]} />
    </Canvas>
  );
}
