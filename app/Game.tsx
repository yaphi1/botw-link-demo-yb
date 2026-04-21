'use client';

import { useState } from 'react';
import Scene from './Scene';
import GameUI from './GameUI';

export type ActiveScene = 'town' | 'castle';

export default function Game() {
  const [activeScene, setActiveScene] = useState<ActiveScene>('town');

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Scene activeScene={activeScene} />
      <GameUI activeScene={activeScene} onSceneChange={setActiveScene} />
    </div>
  );
}
