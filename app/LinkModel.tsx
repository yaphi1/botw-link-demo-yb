import React, { useEffect, useRef } from 'react';
import { useAnimations, useGLTF, useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MAX_SPEED_FORWARD = 4;
const MAX_SPEED_BACKWARD = 3.5;
const ACCELERATION = 10;
const START_DELAY = 0.15; // Realistic running start instead of sliding

export const MOVEMENT_STATES = {
  IDLE: 'IDLE',
  RUNNING_FORWARD: 'RUNNING_FORWARD',
  RUNNING_BACKWARD: 'RUNNING_BACKWARD',
} as const;

export type MovementState = typeof MOVEMENT_STATES[keyof typeof MOVEMENT_STATES];

export function LinkModel() {
  const groupRef = useRef<THREE.Group>(null!);
  const currentSpeed = useRef(0);
  const forwardHeldTime = useRef(0);
  const facingDirection = useRef(new THREE.Vector3(0, 0, -1));
  const characterImport = useGLTF('/3d_assets/link_sword_and_shield.glb');
  const characterModel = characterImport.scene;
  const idleAnimImport = useGLTF('/3d_assets/animations/sword_and_shield_idle.glb');
  const runAnimImport = useGLTF('/3d_assets/animations/sword_and_shield_run.glb');
  const runBackwardAnimImport = useGLTF('/3d_assets/animations/sword_and_shield_run_backward.glb');

  const animations = [
    idleAnimImport.animations[1], // for some reason, the mixamo export had an initial ghost copy animation that I couldn't find in blender
    runAnimImport.animations[0],
    runBackwardAnimImport.animations[0],
  ];
  const { actions } = useAnimations(animations, characterModel);
  const [actionIdle, actionRun, actionRunBackward] = Object.values(actions);

  const forwardPressed = useKeyboardControls(state => state.forward);
  const backwardPressed = useKeyboardControls(state => state.backward);
  let movementState: MovementState = MOVEMENT_STATES.IDLE;
  if (forwardPressed) {
    movementState = MOVEMENT_STATES.RUNNING_FORWARD;
  } else if (backwardPressed) {
    movementState = MOVEMENT_STATES.RUNNING_BACKWARD;
  }

  useEffect(() => {
    const transitionDuration = 0.5;
    let activeAction = actionIdle;
    if (movementState === MOVEMENT_STATES.RUNNING_FORWARD) {
      activeAction = actionRun;
    } else if (movementState === MOVEMENT_STATES.RUNNING_BACKWARD) {
      activeAction = actionRunBackward;
    }

    [actionIdle, actionRun, actionRunBackward].forEach(action => {
      if (action !== activeAction) {
        action?.fadeOut(transitionDuration);
      } else {
        action?.reset().fadeIn(transitionDuration).play();
      }
    });
  }, [movementState, actionIdle, actionRun, actionRunBackward]);

  useFrame((_, delta) => {
    const isMoving = movementState !== MOVEMENT_STATES.IDLE;
    if (isMoving) {
      forwardHeldTime.current += delta;
    } else {
      forwardHeldTime.current = 0;
    }

    const isPastDelay = forwardHeldTime.current >= START_DELAY;
    const isBackward = movementState === MOVEMENT_STATES.RUNNING_BACKWARD;
    const maxSpeed = isBackward ? MAX_SPEED_BACKWARD : MAX_SPEED_FORWARD;
    const target = isMoving && isPastDelay ? maxSpeed * (isBackward ? -1 : 1) : 0;
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, target, ACCELERATION * delta);
    groupRef.current.position.addScaledVector(facingDirection.current, currentSpeed.current * delta);
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
