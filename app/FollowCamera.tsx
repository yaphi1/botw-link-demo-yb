import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import React, { useRef } from 'react';
import * as THREE from 'three';

const ROTATE_SPEED = 2.0;
const ZOOM_SPEED = 5.0;
const RAISE_SPEED = 3.0;
const MIN_DISTANCE = 1.5;
const MAX_DISTANCE = 15;
const MIN_HEIGHT = 1;
const MAX_HEIGHT = 10;

export function FollowCamera({ followRef }: {
  followRef: React.RefObject<THREE.Group | null>;
}) {
  const { camera } = useThree();
  const cameraRotation = useRef(0.5 * Math.PI);
  const cameraDistance = useRef(3);
  const cameraHeight = useRef(1.5);

  const cameraLeft = useKeyboardControls(state => state.cameraLeft);
  const cameraRight = useKeyboardControls(state => state.cameraRight);
  const cameraZoomIn = useKeyboardControls(state => state.cameraZoomIn);
  const cameraZoomOut = useKeyboardControls(state => state.cameraZoomOut);
  const cameraUp = useKeyboardControls(state => state.cameraUp);
  const cameraDown = useKeyboardControls(state => state.cameraDown);

  useFrame((_, delta) => {
    if (!followRef.current) { return; }

    if (cameraLeft) { cameraRotation.current -= ROTATE_SPEED * delta; }
    if (cameraRight) { cameraRotation.current += ROTATE_SPEED * delta; }
    if (cameraZoomIn) { cameraDistance.current = Math.max(MIN_DISTANCE, cameraDistance.current - ZOOM_SPEED * delta); }
    if (cameraZoomOut) { cameraDistance.current = Math.min(MAX_DISTANCE, cameraDistance.current + ZOOM_SPEED * delta); }
    if (cameraUp) { cameraHeight.current = Math.min(MAX_HEIGHT, cameraHeight.current + RAISE_SPEED * delta); }
    if (cameraDown) { cameraHeight.current = Math.max(MIN_HEIGHT, cameraHeight.current - RAISE_SPEED * delta); }

    const pos = followRef.current.position;
    camera.position.set(
      pos.x + Math.sin(cameraRotation.current) * cameraDistance.current,
      pos.y + cameraHeight.current,
      pos.z + Math.cos(cameraRotation.current) * cameraDistance.current,
    );
    camera.lookAt(pos.x, pos.y + 1, pos.z);
  });

  return null;
}
