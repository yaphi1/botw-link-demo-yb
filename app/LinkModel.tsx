import React, { useEffect, useMemo, useRef } from 'react';
import { useAnimations, useGLTF, useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type RenderMode = 'textured' | 'solid' | 'wireframe';
const RENDER_MODE: RenderMode = 'textured';

const MAX_SPEED_FORWARD = 4.5;
const MAX_SPEED_BACKWARD = 3.5;
const ACCELERATION = 10;
const START_DELAY = 0.15; // Realistic running start instead of sliding
const TURN_SPEED = 3.5;

export const MOVEMENT_STATES = {
  IDLE: 'IDLE',
  RUNNING_FORWARD: 'RUNNING_FORWARD',
  RUNNING_BACKWARD: 'RUNNING_BACKWARD',
  TURNING_LEFT: 'TURNING_LEFT',
  TURNING_RIGHT: 'TURNING_RIGHT',
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
  const turnLeftAnimImport = useGLTF('/3d_assets/animations/sword_and_shield_turn_left.glb');
  const turnRightAnimImport = useGLTF('/3d_assets/animations/sword_and_shield_turn_right.glb');

  const animations = useMemo(() => {
    // Each GLB contains all armature clips from the Blender project, not just one.
    // Clone and rename to guarantee unique keys in the actions map.

    // Find the root bone name so we can strip its tracks from turn clips.
    // Root motion (position + rotation on the root bone) fights with the manual groupRef rotation.
    let rootBoneName = '';
    characterModel.traverse(obj => {
      if (!rootBoneName && obj instanceof THREE.Bone) {
        rootBoneName = obj.name;
      }
    });

    const clips: [THREE.AnimationClip, string, boolean][] = [
      [idleAnimImport.animations[1], 'idle', false],
      [runAnimImport.animations[0], 'run', false],
      [runBackwardAnimImport.animations[0], 'runBackward', false],
      [turnLeftAnimImport.animations[2], 'turnLeft', true],
      [turnRightAnimImport.animations[2], 'turnRight', true],
    ];
    return clips.map(([clip, name, stripRootMotion]) => {
      const c = clip.clone();
      c.name = name;
      if (stripRootMotion && rootBoneName) {
        c.tracks = c.tracks.filter(track => track.name.split('.')[0] !== rootBoneName);
      }
      return c;
    });
  }, [characterModel, idleAnimImport, runAnimImport, runBackwardAnimImport, turnLeftAnimImport, turnRightAnimImport]);

  const { actions } = useAnimations(animations, characterModel);
  const actionIdle = actions['idle'];
  const actionRun = actions['run'];
  const actionRunBackward = actions['runBackward'];
  const actionTurnLeft = actions['turnLeft'];
  const actionTurnRight = actions['turnRight'];

  const forwardPressed = useKeyboardControls(state => state.forward);
  const backwardPressed = useKeyboardControls(state => state.backward);
  const leftPressed = useKeyboardControls(state => state.left);
  const rightPressed = useKeyboardControls(state => state.right);

  let movementState: MovementState = MOVEMENT_STATES.IDLE;
  if (forwardPressed) {
    movementState = MOVEMENT_STATES.RUNNING_FORWARD;
  } else if (backwardPressed) {
    movementState = MOVEMENT_STATES.RUNNING_BACKWARD;
  } else if (leftPressed) {
    movementState = MOVEMENT_STATES.TURNING_LEFT;
  } else if (rightPressed) {
    movementState = MOVEMENT_STATES.TURNING_RIGHT;
  }

  useEffect(() => {
    const transitionDuration = 0.3;
    const allActions = [actionIdle, actionRun, actionRunBackward, actionTurnLeft, actionTurnRight];

    let activeAction = actionIdle;
    if (movementState === MOVEMENT_STATES.RUNNING_FORWARD) {
      activeAction = actionRun;
    } else if (movementState === MOVEMENT_STATES.RUNNING_BACKWARD) {
      activeAction = actionRunBackward;
    } else if (movementState === MOVEMENT_STATES.TURNING_LEFT) {
      activeAction = actionTurnLeft;
    } else if (movementState === MOVEMENT_STATES.TURNING_RIGHT) {
      activeAction = actionTurnRight;
    }

    allActions.forEach(action => {
      if (action !== activeAction) {
        action?.fadeOut(transitionDuration);
      } else {
        action?.reset().fadeIn(transitionDuration).play();
      }
    });
  }, [movementState, actionIdle, actionRun, actionRunBackward, actionTurnLeft, actionTurnRight]);

  useFrame((_, delta) => {
    if (leftPressed) { groupRef.current.rotation.y += TURN_SPEED * delta; }
    if (rightPressed) { groupRef.current.rotation.y -= TURN_SPEED * delta; }
    if (leftPressed || rightPressed) {
      const y = groupRef.current.rotation.y;
      facingDirection.current.set(-Math.sin(y), 0, -Math.cos(y));
    }

    const isRunning = movementState === MOVEMENT_STATES.RUNNING_FORWARD || movementState === MOVEMENT_STATES.RUNNING_BACKWARD;
    if (isRunning) {
      forwardHeldTime.current += delta;
    } else {
      forwardHeldTime.current = 0;
    }

    const isPastDelay = forwardHeldTime.current >= START_DELAY;
    const isBackward = movementState === MOVEMENT_STATES.RUNNING_BACKWARD;
    const maxSpeed = isBackward ? MAX_SPEED_BACKWARD : MAX_SPEED_FORWARD;
    const target = isRunning && isPastDelay ? maxSpeed * (isBackward ? -1 : 1) : 0;
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, target, ACCELERATION * delta);
    groupRef.current.position.addScaledVector(facingDirection.current, currentSpeed.current * delta);
  });

  useEffect(() => {
    characterModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (RENDER_MODE === 'wireframe') {
          child.material = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x0098db });
        } else if (RENDER_MODE === 'solid') {
          child.material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        }
      }
    });
  }, [characterModel]);

  return (
    <group ref={groupRef}>
      <primitive object={characterModel} dispose={null} rotation={[0, Math.PI, 0]} />
    </group>
  );
}
