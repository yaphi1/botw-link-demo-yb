import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

type RenderMode = 'textured' | 'solid' | 'wireframe';
const RENDER_MODE: RenderMode = 'textured';

export function Castle({ collidablesRef }: { collidablesRef?: React.RefObject<THREE.Mesh[]> }) {
  const castleImport = useGLTF('/3d_assets/hyrule_castle.glb');
  const castleModel = castleImport.scene;

  useEffect(() => {
    const meshes: THREE.Mesh[] = [];
    castleModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true;
        if (RENDER_MODE === 'wireframe') {
          child.material = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x0098db });
        } else if (RENDER_MODE === 'solid') {
          child.material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        }
        meshes.push(child);
      }
    });
    if (collidablesRef) {
      collidablesRef.current = meshes;
    }
  }, [castleModel, collidablesRef]);

  return (
    <primitive object={castleModel} dispose={null} />
  );
}
