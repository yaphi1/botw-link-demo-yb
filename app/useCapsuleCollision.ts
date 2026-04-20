import { useRef } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';

const CAPSULE_RADIUS = 1;
// Obstacles shorter than this are stepped over rather than treated as walls
const STEP_HEIGHT = 0.6;
// Y heights at which horizontal wall rays are cast: above step, midsection, shoulders
const WALL_RAY_HEIGHTS = [STEP_HEIGHT, 0.8, 1.25];
const GRAVITY = -20; // units per second²

export function useCapsuleCollision(collidables: RefObject<THREE.Mesh[]> | undefined) {
  const raycaster = useRef(new THREE.Raycaster());
  const normalMatrix = useRef(new THREE.Matrix3());
  const verticalVelocity = useRef(0);

  // Slides characterMovementVector against walls (mutates in place).
  // Returns terrain Y to snap to, or null if no ground found.
  return function applyCollision(
    characterPosition: THREE.Vector3,
    characterMovementVector: THREE.Vector3,
    delta: number,
  ): number | null {
    const meshes = collidables?.current;
    if (!meshes || meshes.length === 0) return null;

    if (characterMovementVector.lengthSq() > 1e-8) {
      const movementDistance = characterMovementVector.length();
      const movementDirection = characterMovementVector.clone().normalize();
      const wallNormal = new THREE.Vector3();
      let hasWall = false;

      for (const capsuleSampleHeight of WALL_RAY_HEIGHTS) {
        raycaster.current.set(
          new THREE.Vector3(characterPosition.x, characterPosition.y + capsuleSampleHeight, characterPosition.z),
          movementDirection,
        );
        raycaster.current.near = 0;
        raycaster.current.far = CAPSULE_RADIUS + movementDistance;
        const wallRayHits = raycaster.current.intersectObjects(meshes, false);
        if (wallRayHits.length > 0 && wallRayHits[0].distance < CAPSULE_RADIUS + movementDistance) {
          hasWall = true;
          if (wallRayHits[0].face) {
            normalMatrix.current.getNormalMatrix(wallRayHits[0].object.matrixWorld);
            wallNormal.add(wallRayHits[0].face.normal.clone().applyMatrix3(normalMatrix.current));
          }
        }
      }

      if (hasWall) {
        wallNormal.normalize().setY(0);
        const movementIntoWall = characterMovementVector.dot(wallNormal);
        if (movementIntoWall < 0) {
          characterMovementVector.addScaledVector(wallNormal, -movementIntoWall);
        }
      }
    }

    verticalVelocity.current += GRAVITY * delta;

    const proposedPosition = characterPosition.clone().add(characterMovementVector);
    // Extend the ray to cover the full distance the character could fall this frame
    const groundRayFar = 1.5 + Math.abs(verticalVelocity.current * delta) + 0.1;
    raycaster.current.set(
      new THREE.Vector3(proposedPosition.x, proposedPosition.y + 1.5, proposedPosition.z),
      new THREE.Vector3(0, -1, 0),
    );
    raycaster.current.near = 0;
    raycaster.current.far = groundRayFar;
    const groundRayHits = raycaster.current.intersectObjects(meshes, false);

    if (groundRayHits.length > 0) {
      verticalVelocity.current = 0;
      return groundRayHits[0].point.y;
    }

    return proposedPosition.y + verticalVelocity.current * delta;
  };
}
