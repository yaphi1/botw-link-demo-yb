import React, { useEffect, useMemo, useRef } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WALK_SPEED = 2;
const CYCLE_DURATION = 3;

export function YigaModel() {
  const { scene } = useGLTF('/3d_assets/yiga_blademaster.glb');
  const walkForwardImport = useGLTF('/3d_assets/animations/yiga_walk_forward.glb');
  const walkBackwardImport = useGLTF('/3d_assets/animations/yiga_walk_backward.glb');

  const groupRef = useRef<THREE.Group>(null);
  const phaseTimeRef = useRef(0);
  const isWalkingForward = useRef(false);

  const animations = useMemo(() => {
    const forwardClip = walkForwardImport.animations[0].clone();
    forwardClip.name = 'walkForward';
    const backwardClip = walkBackwardImport.animations[0].clone();
    backwardClip.name = 'walkBackward';
    return [forwardClip, backwardClip];
  }, [walkForwardImport, walkBackwardImport]);

  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    actions['walkBackward']?.reset().fadeIn(0.3).play();
  }, [actions]);

  useFrame((_, delta) => {
    if (!groupRef.current) { return; }

    phaseTimeRef.current += delta;
    if (phaseTimeRef.current >= CYCLE_DURATION) {
      phaseTimeRef.current -= CYCLE_DURATION;
      isWalkingForward.current = !isWalkingForward.current;

      if (isWalkingForward.current) {
        actions['walkBackward']?.fadeOut(0.3);
        actions['walkForward']?.reset().fadeIn(0.3).play();
      } else {
        actions['walkForward']?.fadeOut(0.3);
        actions['walkBackward']?.reset().fadeIn(0.3).play();
      }
    }

    const direction = isWalkingForward.current ? 1 : -1;
    groupRef.current.position.z += direction * WALK_SPEED * delta;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} dispose={null} scale={1} />
    </group>
  );
}
