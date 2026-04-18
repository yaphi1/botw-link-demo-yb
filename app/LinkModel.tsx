import React, { useEffect } from 'react';
import { useAnimations, useGLTF, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { MOVEMENT_STATES, MovementState } from './types';

export function LinkModel() {
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
