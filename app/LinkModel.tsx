import React, { useEffect, useMemo, useRef } from 'react';
import { useAnimations, useGLTF, useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCapsuleCollision } from './useCapsuleCollision';

type RenderMode = 'textured' | 'solid' | 'wireframe';
const RENDER_MODE: RenderMode = 'textured';

const MAX_SPEED_FORWARD = 4.5;
const MAX_SPEED_BACKWARD = 3.5;
const ACCELERATION = 10;
const START_DELAY = 0.15; // Realistic running start instead of sliding
const TURN_SPEED = 3.5;

const MOVEMENT_STATES = {
  IDLE: 'IDLE',
  RUNNING_FORWARD: 'RUNNING_FORWARD',
  RUNNING_BACKWARD: 'RUNNING_BACKWARD',
  TURNING_LEFT: 'TURNING_LEFT',
  TURNING_RIGHT: 'TURNING_RIGHT',
} as const;

type MovementState = typeof MOVEMENT_STATES[keyof typeof MOVEMENT_STATES];

export function LinkModel({
  ref,
  collidables,
}: {
  ref?: React.RefObject<THREE.Group | null>;
  collidables?: React.RefObject<THREE.Mesh[]>;
}) {
  const internalDefaultRef = useRef<THREE.Group | null>(null);
  const linkRef = ref ?? internalDefaultRef;

  const currentSpeed = useRef(0);
  const forwardHeldTime = useRef(0);
  const facingDirection = useRef(new THREE.Vector3(0, 0, -1));
  const isSlashing = useRef(false);
  const movementStateRef = useRef<MovementState>(MOVEMENT_STATES.IDLE);
  const applyCollision = useCapsuleCollision(collidables);
  const characterImport = useGLTF('/3d_assets/link_sword_and_shield.glb');
  const characterModel = characterImport.scene;
  const idlePlainAnimImport = useGLTF('/3d_assets/animations/sword_and_shield_idle_plain.glb');
  const idleSwingAnimImport = useGLTF('/3d_assets/animations/sword_and_shield_idle_swing.glb');
  const runAnimImport = useGLTF('/3d_assets/animations/sword_and_shield_run.glb');
  const runBackwardAnimImport = useGLTF('/3d_assets/animations/sword_and_shield_run_backward.glb');
  const slashAnimImport = useGLTF('/3d_assets/animations/sword_and_shield_slash.glb');
  const turnLeftAnimImport = useGLTF('/3d_assets/animations/sword_and_shield_turn_left.glb');
  const turnRightAnimImport = useGLTF('/3d_assets/animations/sword_and_shield_turn_right.glb');

  const animations = useMemo(() => {
    // Each GLB contains all armature clips from the Blender project, not just one.
    // Clone and rename to guarantee unique keys in the actions map.
    const clips: [THREE.AnimationClip, string][] = [
      [idlePlainAnimImport.animations[0], 'idlePlain'],
      [idleSwingAnimImport.animations[1], 'idleSwing'],
      [runAnimImport.animations[0], 'run'],
      [runBackwardAnimImport.animations[0], 'runBackward'],
      [slashAnimImport.animations[0], 'slash'],
      [turnLeftAnimImport.animations[2], 'turnLeft'],
      [turnRightAnimImport.animations[2], 'turnRight'],
    ];
    return clips.map(([clip, name]) => {
      const clonedClip = clip.clone();
      clonedClip.name = name;
      return clonedClip;
    });
  }, [
    idlePlainAnimImport,
    idleSwingAnimImport,
    runAnimImport,
    runBackwardAnimImport,
    slashAnimImport,
    turnLeftAnimImport,
    turnRightAnimImport,
  ]);

  const { actions, mixer } = useAnimations(animations, characterModel);
  const actionIdlePlain = actions['idlePlain'];
  const actionIdleSwing = actions['idleSwing'];
  const actionRun = actions['run'];
  const actionRunBackward = actions['runBackward'];
  const actionSlash = actions['slash'];
  const actionTurnLeft = actions['turnLeft'];
  const actionTurnRight = actions['turnRight'];

  const forwardPressed = useKeyboardControls(state => state.forward);
  const backwardPressed = useKeyboardControls(state => state.backward);
  const leftPressed = useKeyboardControls(state => state.left);
  const rightPressed = useKeyboardControls(state => state.right);
  const slashPressed = useKeyboardControls(state => state.slash);

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
    if (!mixer || !actionIdlePlain || !actionIdleSwing) return;
    const alternateIdleOnCycleComplete = (event: THREE.Event & { action: THREE.AnimationAction }) => {
      if (movementState !== MOVEMENT_STATES.IDLE) return;
      if (event.action === actionIdlePlain) {
        actionIdlePlain.fadeOut(0.5);
        actionIdleSwing.reset().fadeIn(0.5).play();
      } else if (event.action === actionIdleSwing) {
        actionIdleSwing.fadeOut(1);
        actionIdlePlain.reset().fadeIn(0.05).play();
      }
    };
    mixer.addEventListener('loop', alternateIdleOnCycleComplete);
    return () => { mixer.removeEventListener('loop', alternateIdleOnCycleComplete); };
  }, [mixer, actionIdlePlain, actionIdleSwing, movementState]);

  useEffect(() => {
    if (!slashPressed || isSlashing.current || !actionSlash) return;
    const allMovementActions = [actionIdlePlain, actionIdleSwing, actionRun, actionRunBackward, actionTurnLeft, actionTurnRight];
    isSlashing.current = true;
    allMovementActions.forEach(a => a?.fadeOut(0.1));
    actionSlash.reset().setLoop(THREE.LoopOnce, 1).fadeIn(0.1).play();
  }, [slashPressed, actionSlash, actionIdlePlain, actionIdleSwing, actionRun, actionRunBackward, actionTurnLeft, actionTurnRight]);


  useEffect(() => {
    if (isSlashing.current) return;
    const transitionDuration = 0.3;
    const allActions = [actionIdlePlain, actionIdleSwing, actionRun, actionRunBackward, actionTurnLeft, actionTurnRight];

    let activeAction = actionIdlePlain;
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
  }, [
    movementState,
    actionIdlePlain,
    actionIdleSwing,
    actionRun,
    actionRunBackward,
    actionTurnLeft,
    actionTurnRight,
  ]);

  useFrame((_, delta) => {
    if (!linkRef.current) { return; }
    movementStateRef.current = movementState;

    const SLASH_FADE_DURATION = 0.3;
    if (isSlashing.current && actionSlash) {
      const timeRemaining = actionSlash.getClip().duration - actionSlash.time;
      if (timeRemaining <= SLASH_FADE_DURATION) {
        isSlashing.current = false;
        const state = movementStateRef.current;
        let resumeAction: THREE.AnimationAction | null | undefined = actionIdlePlain;
        if (state === MOVEMENT_STATES.RUNNING_FORWARD) { resumeAction = actionRun; }
        else if (state === MOVEMENT_STATES.RUNNING_BACKWARD) { resumeAction = actionRunBackward; }
        else if (state === MOVEMENT_STATES.TURNING_LEFT) { resumeAction = actionTurnLeft; }
        else if (state === MOVEMENT_STATES.TURNING_RIGHT) { resumeAction = actionTurnRight; }
        actionSlash.fadeOut(SLASH_FADE_DURATION);
        resumeAction?.reset().fadeIn(SLASH_FADE_DURATION).play();
      }
    }
    if (!isSlashing.current) {
      if (leftPressed) { linkRef.current.rotation.y += TURN_SPEED * delta; }
      if (rightPressed) { linkRef.current.rotation.y -= TURN_SPEED * delta; }
      if (leftPressed || rightPressed) {
        const y = linkRef.current.rotation.y;
        facingDirection.current.set(-Math.sin(y), 0, -Math.cos(y));
      }
    }

    const isRunning = !isSlashing.current && (movementState === MOVEMENT_STATES.RUNNING_FORWARD || movementState === MOVEMENT_STATES.RUNNING_BACKWARD);
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

    const characterMovementVector = facingDirection.current.clone().multiplyScalar(currentSpeed.current * delta);
    const groundY = applyCollision(linkRef.current.position, characterMovementVector, delta);
    linkRef.current.position.add(characterMovementVector);
    if (groundY !== null) { linkRef.current.position.y = groundY; }
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
    <group ref={linkRef}>
      <primitive object={characterModel} dispose={null} rotation={[0, Math.PI, 0]} />
    </group>
  );
};
