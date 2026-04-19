import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const BLADE_COUNT = 100000;
const GROUND_SIZE = 40;
const BLADE_HEIGHT = 0.3;
const BLADE_WIDTH = 0.06;
const BLADE_BEND = 0.14;

function createBladeGeometry(): THREE.BufferGeometry {
  const h = BLADE_HEIGHT;
  const w = BLADE_WIDTH / 2;

  const rows = [
    { y: 0,        halfW: w,       bx: 0 },
    { y: h * 0.3,  halfW: w * 0.8, bx: BLADE_BEND * 0.1 },
    { y: h * 0.6,  halfW: w * 0.5, bx: BLADE_BEND * 0.4 },
    { y: h * 0.85, halfW: w * 0.2, bx: BLADE_BEND * 0.75 },
    { y: h,        halfW: 0,       bx: BLADE_BEND },
  ];

  const posA: number[] = [];
  const posB: number[] = [];

  for (const { y, halfW, bx } of rows) {
    if (halfW === 0) {
      posA.push(bx, y, 0);
      posB.push(0, y, bx);
    } else {
      posA.push(-halfW + bx, y, 0,  halfW + bx, y, 0);
      posB.push(0, y, -halfW + bx,  0, y, halfW + bx);
    }
  }

  const rowSizes = rows.map(r => (r.halfW === 0 ? 1 : 2));

  function buildStrip(base: number): number[] {
    const idx: number[] = [];
    let offset = base;
    for (let i = 0; i < rowSizes.length - 1; i++) {
      const curr = offset;
      const next = offset + rowSizes[i];
      if (rowSizes[i + 1] === 1) {
        idx.push(curr, curr + 1, next);
      } else {
        idx.push(curr, curr + 1, next, curr + 1, next + 1, next);
      }
      offset = next;
    }
    return idx;
  }

  const vertsPerBlade = rowSizes.reduce((a, b) => a + b, 0);
  const indices = [...buildStrip(0), ...buildStrip(vertsPerBlade)];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([...posA, ...posB], 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function GroundGrass() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  // Shared object — assigning to shader.uniforms.time means updating .value updates the GPU uniform
  const timeUniform = useRef({ value: 0 });

  const bladeGeometry = useMemo(() => createBladeGeometry(), []);

  const bladeMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ color: '#5ca840', side: THREE.DoubleSide });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.time = timeUniform.current;
      shader.vertexShader = `uniform float time;\n` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        // Vertices near the base don't move; tip sways most (quadratic falloff)
        float heightFactor = clamp(position.y / ${BLADE_HEIGHT.toFixed(2)}, 0.0, 1.0);
        float t = heightFactor * heightFactor;
        // Per-instance phase from world-space position creates a travelling wave
        float phase = instanceMatrix[3].x * 1.7 + instanceMatrix[3].z * 1.7;
        float sway = (sin(time * 2.5 + phase) * 0.06 + sin(time * 1.1 + phase * 0.8) * 0.025) * t;
        transformed.x += sway;
        transformed.z += sway * 0.4;`,
      );
    };
    return mat;
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < BLADE_COUNT; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * GROUND_SIZE,
        0,
        (Math.random() - 0.5) * GROUND_SIZE,
      );
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.scale.setScalar(0.5 + Math.random() * 0.9);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state) => {
    timeUniform.current.value = state.clock.elapsedTime;
  });

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial color="#3d6b35" />
      </mesh>
      <instancedMesh ref={meshRef} args={[bladeGeometry, bladeMaterial, BLADE_COUNT]} />
    </>
  );
}
