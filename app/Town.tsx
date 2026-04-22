import React, { useCallback, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

type RenderMode = 'textured' | 'solid' | 'wireframe';
const RENDER_MODE: RenderMode = 'textured';

export function Town({ collidablesRef }: { collidablesRef?: React.RefObject<THREE.Mesh[]> }) {
  const townImport = useGLTF('/3d_assets/botw_town.glb');
  const townModel = townImport.scene;
  
  const hitboxesImport = useGLTF('/3d_assets/botw_town_hitboxes_only.glb');
  const hitboxesModel = hitboxesImport.scene;

  const prepareRenderMode = useCallback(() => {
    townModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true;
        if (RENDER_MODE === 'wireframe') {
          child.material = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x0098db });
        } else if (RENDER_MODE === 'solid') {
          child.material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        }
      }
    });
  }, [townModel]);

  useEffect(prepareRenderMode, [prepareRenderMode]);
  
  const prepareHitboxes = useCallback(() => {
    const hitboxMeshes: THREE.Mesh[] = [];
    hitboxesModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.transparent = true;
        child.material.opacity = 0.0;
        child.material.depthWrite = false; // prevents z-buffer issues
        hitboxMeshes.push(child);
      }
    });
    if (collidablesRef) {
      collidablesRef.current = hitboxMeshes;
    }
  }, [hitboxesModel, collidablesRef]);

  useEffect(prepareHitboxes, [prepareHitboxes]);

  return (
    <group>
      <primitive object={townModel} dispose={null} />
      <primitive object={hitboxesModel} dispose={null} />
    </group>
  );
}
