import confetti from 'canvas-confetti';

// Ultra-vibrant electric neon color palette
const VIBRANT_PALETTE = [
  '#D4FF00', // Electric Lime
  '#00F0FF', // Neon Cyan
  '#FF007A', // Hot Magenta
  '#FFE600', // Bright Gold
  '#7B2CBF', // Electric Purple
  '#FF5400', // Vivid Orange
  '#FFFFFF', // Bright White
];

// 1. Full-screen spectacular multi-phase celebration fireworks
export function triggerCelebrationConfetti() {
  // Phase 1: Dual side cannons
  confetti({
    particleCount: 80,
    angle: 60,
    spread: 75,
    origin: { x: 0, y: 0.7 },
    colors: VIBRANT_PALETTE,
    ticks: 350,
    gravity: 1.0,
    scalar: 1.2,
  });

  confetti({
    particleCount: 80,
    angle: 120,
    spread: 75,
    origin: { x: 1, y: 0.7 },
    colors: VIBRANT_PALETTE,
    ticks: 350,
    gravity: 1.0,
    scalar: 1.2,
  });

  // Phase 2: High center power starburst
  setTimeout(() => {
    confetti({
      particleCount: 110,
      spread: 140,
      origin: { x: 0.5, y: 0.35 },
      colors: VIBRANT_PALETTE,
      ticks: 400,
      gravity: 0.85,
      scalar: 1.3,
      shapes: ['circle', 'square'],
    });
  }, 200);

  // Phase 3: Secondary cascading rain
  setTimeout(() => {
    confetti({
      particleCount: 70,
      angle: 90,
      spread: 120,
      origin: { x: 0.5, y: 0.5 },
      colors: VIBRANT_PALETTE,
      ticks: 350,
      gravity: 0.95,
      scalar: 1.15,
    });
  }, 400);
}

// 2. Playful micro-burst at target click coordinates (per-habit completion)
export function triggerMicroConfetti(clientX?: number, clientY?: number) {
  try {
    const x = clientX !== undefined ? clientX / window.innerWidth : 0.85;
    const y = clientY !== undefined ? clientY / window.innerHeight : 0.5;

    confetti({
      particleCount: 22,
      spread: 60,
      origin: { x, y },
      colors: ['#D4FF00', '#00F0FF', '#FF007A', '#FFE600', '#FFFFFF'],
      ticks: 120,
      gravity: 1.4,
      scalar: 0.85,
      disableForReducedMotion: true,
    });
  } catch (e) {
    // Confetti fallback
  }
}
