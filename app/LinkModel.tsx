import React, { useEffect, useRef } from 'react';
import { useAnimations, useGLTF, useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MOVEMENT_STATES, MovementState } from './types';

const MAX_SPEED = 5;
const ACCELERATION = 10;

/**
 * This delay makes it look like Link is actually pushing
 * forward when starting to run instead of sliding.
*/
const START_DELAY = 0.15;

export function LinkModel() {
  const groupRef = useRef<THREE.Group>(null!);
  const currentSpeed = useRef(0);
  const forwardHeldTime = useRef(0);
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

  const forwardPressed = useKeyboardControls(state => state.forward);
  const movementState: MovementState = forwardPressed
    ? MOVEMENT_STATES.RUNNING
    : MOVEMENT_STATES.IDLE;

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

  useFrame((_, delta) => {
    const isRunning = movementState === MOVEMENT_STATES.RUNNING;
    if (isRunning) {
      forwardHeldTime.current += delta;
    } else {
      forwardHeldTime.current = 0;
    }

    const isPastDelay = forwardHeldTime.current >= START_DELAY;
    const target = isRunning && isPastDelay ? MAX_SPEED : 0;
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, target, ACCELERATION * delta);
    groupRef.current.position.z -= currentSpeed.current * delta;
  });

  useEffect(() => {
    characterModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [characterModel]);

  return (
    <group ref={groupRef}>
      <primitive object={characterModel} dispose={null} rotation={[0, Math.PI, 0]} />
    </group>
  );
}
