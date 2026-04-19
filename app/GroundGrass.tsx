import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const BLADE_COUNT = 250000;
const GROUND_SIZE = 40;
const BLADE_HEIGHT = 0.15;
const BLADE_WIDTH = 0.1;
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

const vertexShader = /* glsl */`
  uniform float time;

  varying float vHeight;
  varying vec3 vNormal;

  void main() {
    vHeight = clamp(position.y / ${BLADE_HEIGHT.toFixed(2)}, 0.0, 1.0);
    float t = vHeight * vHeight;

    vec3 pos = position;

    // Wind: tip sways most, base is anchored
    float phase = instanceMatrix[3][0] * 1.7 + instanceMatrix[3][2] * 1.7;
    float sway = (sin(time * 2.5 + phase) * 0.06 + sin(time * 1.1 + phase * 0.8) * 0.025) * t;
    pos.x += sway;
    pos.z += sway * 0.4;

    // World-space normal (uniform scale: mat3 of instanceMatrix is correct)
    vNormal = normalize(mat3(instanceMatrix) * normal);

    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  uniform vec3 baseColor;
  uniform vec3 tipColor;

  varying float vHeight;
  varying vec3 vNormal;

  void main() {
    // Height gradient: dark base to bright tip
    vec3 col = mix(baseColor, tipColor, vHeight);

    // Half-Lambert diffuse — matches scene's directional light at (2, 5, 2)
    vec3 lightDir = normalize(vec3(2.0, 5.0, 2.0));
    vec3 n = gl_FrontFacing ? vNormal : -vNormal;
    float diff = dot(n, lightDir) * 0.3 + 0.7;

    // Fake AO: base receives less light as if shaded by surrounding blades
    float ao = mix(0.8, 1.0, vHeight);

    gl_FragColor = vec4(col * diff * ao, 1.0);
  }
`;

export function GroundGrass() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matRef  = useRef<THREE.ShaderMaterial | null>(null);

  const bladeGeometry = useMemo(() => createBladeGeometry(), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        time:      { value: 0 },
        baseColor: { value: new THREE.Color('#72d040') },
        tipColor:  { value: new THREE.Color('#c4deab') },
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
    });
    matRef.current = mat;
    mesh.material = mat;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < BLADE_COUNT; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * GROUND_SIZE,
        0,
        (Math.random() - 0.5) * GROUND_SIZE,
      );
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.scale.setScalar(0.8 + Math.random() * 0.7);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    return () => mat.dispose();
  }, []);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial color="#3d6b35" />
      </mesh>
      <instancedMesh ref={meshRef} args={[bladeGeometry, undefined, BLADE_COUNT]} />
    </>
  );
}
