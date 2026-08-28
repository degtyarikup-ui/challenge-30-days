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
  vx: number;
  vy: number;
  vRot: number;
  scale: number;
  color: string;
  shape: 'rect' | 'circle' | 'diamond' | 'ribbon';
  duration: number;
  delay: number;
}

export const ConfettiExplosion: React.FC = () => {
  const particles: Particle[] = useMemo(() => {
    const list: Particle[] = [];
    const count = 90;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 160 + Math.random() * 280; // Large 360-degree spread
      const vx = Math.cos(angle) * distance;
      const vy = Math.sin(angle) * distance + 40; // slight gravity drift

      const shapes: Array<'rect' | 'circle' | 'diamond' | 'ribbon'> = ['rect', 'circle', 'diamond', 'ribbon'];
      const shape = shapes[i % shapes.length];

      list.push({
        id: i,
        vx: Math.round(vx),
        vy: Math.round(vy),
        vRot: Math.round((Math.random() - 0.5) * 800),
        scale: Number((0.7 + Math.random() * 0.7).toFixed(2)),
        color: COLORS[i % COLORS.length],
        shape,
        duration: Number((1.5 + Math.random() * 0.5).toFixed(2)),
        delay: Number((Math.random() * 0.12).toFixed(2)),
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
            ['--tx' as any]: `${p.vx}px`,
            ['--ty' as any]: `${p.vy}px`,
            ['--rot' as any]: `${p.vRot}deg`,
            ['--sc' as any]: p.scale,
            animation: `confetti-burst ${p.duration}s cubic-bezier(0.12, 0.8, 0.33, 1) ${p.delay}s forwards`,
          }}
        >
          {p.shape === 'circle' && (
            <div
              className="w-3.5 h-3.5 rounded-full shadow-sm"
              style={{ backgroundColor: p.color }}
            />
          )}
          {p.shape === 'rect' && (
            <div
              className="w-4 h-2 rounded-xs shadow-sm"
              style={{ backgroundColor: p.color }}
            />
          )}
          {p.shape === 'diamond' && (
            <div
              className="w-3 h-3 rotate-45 shadow-sm"
              style={{ backgroundColor: p.color }}
            />
          )}
          {p.shape === 'ribbon' && (
            <div
              className="w-5 h-1.5 rounded-full shadow-sm"
              style={{ backgroundColor: p.color }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
