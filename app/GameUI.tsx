'use client';

import { useState } from 'react';
import { ActiveScene } from './Game';

function Heart({ filled }: { filled: boolean }) {
  const color = filled ? '#d93a10' : '#3a1010';
  return (
    <svg width="30" height="28" viewBox="0 0 30 28" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 8.5 14 L 15 20 L 21.5 14"
        fill="transparent"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}

const controls = [
  { key: 'A / D', action: 'rotate camera' },
  { key: 'W / S', action: 'zoom camera' },
  { key: 'R / F', action: 'raise / lower camera' },
  { key: '↑ ↓ ← →', action: 'move' },
  { key: 'Space', action: 'slash' },
];

export default function GameUI({ activeScene, onSceneChange, showYiga, onYigaToggle }: { activeScene: ActiveScene; onSceneChange: (scene: ActiveScene) => void; showYiga: boolean; onYigaToggle: () => void }) {
  const maxHearts = 10;
  const currentHearts = 10;
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '30px',
        display: 'flex',
        gap: '1px',
        scale: '0.8',
      }}>
        {Array.from({ length: maxHearts }, (_, index) => (
          <Heart key={index} filled={index < currentHearts} />
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 16, right: 16, pointerEvents: 'auto' }}>
        {isControlsOpen && (
          <div style={{
            position: 'absolute',
            bottom: '44px',
            right: 0,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '13px',
            borderRadius: '8px',
            padding: '12px 16px',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '12px', opacity: 0.6, letterSpacing: '0.05em' }}>CONTROLS</span>
              <button
                onClick={() => setIsControlsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0 0 0 16px', fontSize: '16px', lineHeight: 1, opacity: 0.6 }}
              >
                ×
              </button>
            </div>
            {controls.map(({ key, action }) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', marginBottom: '4px' }}>
                <span style={{ opacity: 0.5 }}>{action}</span>
                <span style={{ fontWeight: 'bold' }}>{key}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '10px', paddingTop: '10px' }}>
              <div style={{ fontSize: '12px', opacity: 0.6, letterSpacing: '0.05em', fontWeight: 'bold', marginBottom: '8px' }}>ENTITIES</div>
              <button
                onClick={onYigaToggle}
                style={{
                  background: showYiga ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '4px 10px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  fontWeight: showYiga ? 'bold' : 'normal',
                  opacity: showYiga ? 1 : 0.5,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Yiga
              </button>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '10px', paddingTop: '10px' }}>
              <div style={{ fontSize: '12px', opacity: 0.6, letterSpacing: '0.05em', fontWeight: 'bold', marginBottom: '8px' }}>SCENE</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['town', 'castle'] as ActiveScene[]).map((scene) => (
                  <button
                    key={scene}
                    onClick={() => onSceneChange(scene)}
                    style={{
                      background: activeScene === scene ? 'rgba(255,255,255,0.2)' : 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '4px',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '4px 10px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      fontWeight: activeScene === scene ? 'bold' : 'normal',
                      opacity: activeScene === scene ? 1 : 0.5,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {scene}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsControlsOpen(prev => !prev)}
          style={{
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            width: '36px',
            height: '36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '4px',
            padding: '8px',
          }}
          aria-label="Controls"
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{ display: 'block', width: '16px', height: '2px', background: 'white', borderRadius: '1px' }} />
          ))}
        </button>
      </div>
    </div>
  );
}
