'use client';

import Scene from './Scene';
import GameUI from './GameUI';

export default function Game() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Scene />
      <GameUI />
    </div>
  );
}
