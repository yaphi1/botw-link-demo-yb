import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useFBX, OrbitControls, Html, useAnimations, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function Box() {
  const ref = useRef<THREE.Mesh | null>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta;
      ref.current.rotation.x += delta * 0.5;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

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

  return <primitive object={characterModel} dispose={null} position={[0,0,0]} />;
}

export default function Scene() {
  return (
    <Canvas
      style={{ height: '100vh', width: '100%' }}
      camera={{ position: [0, 2, 2] }}
      shadows
    >
      <Environment preset="dawn" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 2]} intensity={1} />
      <Suspense fallback={<Html center>Loading...</Html>}>
        {/* <Box /> */}
        <LinkModel />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}
