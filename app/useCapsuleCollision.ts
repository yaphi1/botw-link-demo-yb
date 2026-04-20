import { useRef } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';

const CAPSULE_RADIUS = 1;
// Y heights at which horizontal wall rays are cast: ankles, midsection, shoulders
const WALL_RAY_HEIGHTS = [0.35, 0.8, 1.25];

export function useCapsuleCollision(collidables: RefObject<THREE.Mesh[]> | undefined) {
  const raycaster = useRef(new THREE.Raycaster());
  const normalMatrix = useRef(new THREE.Matrix3());

  // Slides characterMovementVector against walls (mutates in place).
  // Returns terrain Y to snap to, or null if no ground found.
  return function applyCollision(
    characterPosition: THREE.Vector3,
    characterMovementVector: THREE.Vector3
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

    const proposedPosition = characterPosition.clone().add(characterMovementVector);
    raycaster.current.set(
      new THREE.Vector3(proposedPosition.x, proposedPosition.y + 1.5, proposedPosition.z),
      new THREE.Vector3(0, -1, 0),
    );
    raycaster.current.near = 0;
    raycaster.current.far = 2.0;
    const groundRayHits = raycaster.current.intersectObjects(meshes, false);
    return groundRayHits.length > 0 ? groundRayHits[0].point.y : null;
  };
}
