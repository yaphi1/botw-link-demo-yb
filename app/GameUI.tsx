'use client';

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

export default function GameUI() {
  const maxHearts = 3;
  const currentHearts = 3;

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
      <div style={{ position: 'absolute', bottom: 16, right: 16, color: 'white', fontFamily: 'monospace' }}>
        WASD: camera &nbsp; Arrows: move &nbsp; Space: slash
      </div>
    </div>
  );
}
