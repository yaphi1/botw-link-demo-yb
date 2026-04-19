import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

type RenderMode = 'textured' | 'solid' | 'wireframe';
const RENDER_MODE: RenderMode = 'textured';

export function Town() {
  const townImport = useGLTF('/3d_assets/botw_town.glb');
  const townModel = townImport.scene;

  useEffect(() => {
    townModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (RENDER_MODE === 'wireframe') {
          child.material = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x0098db });
        } else if (RENDER_MODE === 'solid') {
          child.material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        }
      }
    });
  }, [townModel]);

  return (
    <primitive object={townModel} dispose={null} />
  );
}
