import React from 'react';

export function Ground() {
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
      <gridHelper args={[20, 20]} position={[0, 0.01, 0]} />
    </>
  );
}
