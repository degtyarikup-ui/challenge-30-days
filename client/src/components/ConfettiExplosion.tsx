import React, { useMemo } from 'react';

const COLORS = [
  '#D4FF00', // Electric Lime
  '#00F0FF', // Neon Cyan
  '#FF007A', // Hot Magenta
  '#FFE600', // Bright Gold
  '#7B2CBF', // Electric Purple
  '#FF5400', // Vivid Orange
  '#FFFFFF', // Bright White
];

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  scale: number;
  color: string;
  shape: 'rect' | 'circle' | 'diamond';
  delay: number;
}

export const ConfettiExplosion: React.FC = () => {
  const particles: Particle[] = useMemo(() => {
    const list: Particle[] = [];
    const count = 75;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const velocity = 180 + Math.random() * 260; // Spread radius px
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 60; // slight upward bias

      list.push({
        id: i,
        x: 0,
        y: 0,
        vx,
        vy,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 720,
        scale: 0.7 + Math.random() * 0.6,
        color: COLORS[i % COLORS.length],
        shape: i % 3 === 0 ? 'rect' : i % 3 === 1 ? 'circle' : 'diamond',
        delay: Math.random() * 0.15,
      });
    }
    return list;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-10">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            transform: `translate3d(${p.vx}px, ${p.vy}px, 0) rotate(${p.vRot}deg) scale(${p.scale})`,
            transition: 'transform 1.8s cubic-bezier(0.12, 0.8, 0.33, 1), opacity 1.8s ease-out',
            animation: `confetti-fall-${p.id % 4} 2.2s cubic-bezier(0.2, 0.8, 0.4, 1) ${p.delay}s forwards`,
          }}
        >
          {p.shape === 'circle' && (
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: p.color }}
            />
          )}
          {p.shape === 'rect' && (
            <div
              className="w-3.5 h-2 rounded-xs shadow-sm"
              style={{ backgroundColor: p.color }}
            />
          )}
          {p.shape === 'diamond' && (
            <div
              className="w-2.5 h-2.5 rotate-45 shadow-sm"
              style={{ backgroundColor: p.color }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
