import confetti from 'canvas-confetti';

const VIBRANT_PALETTE = [
  '#D4FF00', // Electric Lime
  '#00F0FF', // Neon Cyan
  '#FF007A', // Hot Magenta
  '#FFE600', // Bright Gold
  '#7B2CBF', // Electric Purple
  '#FFFFFF', // Bright White
];

let celebrationTimeoutId1: ReturnType<typeof setTimeout> | null = null;
let celebrationTimeoutId2: ReturnType<typeof setTimeout> | null = null;

// Clean up all confetti and remove hanging canvases
export function clearCelebrationConfetti() {
  if (celebrationTimeoutId1) {
    clearTimeout(celebrationTimeoutId1);
    celebrationTimeoutId1 = null;
  }
  if (celebrationTimeoutId2) {
    clearTimeout(celebrationTimeoutId2);
    celebrationTimeoutId2 = null;
  }
  try {
    confetti.reset();
  } catch (e) {
    // Ignore reset error
  }
}

// 1. Full-screen celebration fireworks with guaranteed auto-fadeout
export function triggerCelebrationConfetti() {
  clearCelebrationConfetti();

  // Phase 1: Dual side burst
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 65,
    origin: { x: 0.05, y: 0.7 },
    colors: VIBRANT_PALETTE,
    ticks: 140, // ~2.3 seconds max
    decay: 0.91, // Fast smooth fade-out
    gravity: 1.2,
    scalar: 1.1,
  });

  confetti({
    particleCount: 50,
    angle: 120,
    spread: 65,
    origin: { x: 0.95, y: 0.7 },
    colors: VIBRANT_PALETTE,
    ticks: 140,
    decay: 0.91,
    gravity: 1.2,
    scalar: 1.1,
  });

  // Phase 2: High center power burst (short delay)
  celebrationTimeoutId1 = setTimeout(() => {
    confetti({
      particleCount: 70,
      spread: 100,
      origin: { x: 0.5, y: 0.4 },
      colors: VIBRANT_PALETTE,
      ticks: 150,
      decay: 0.9,
      gravity: 1.1,
      scalar: 1.2,
    });
  }, 180);

  // Auto-cleanup guarantee after 3 seconds
  celebrationTimeoutId2 = setTimeout(() => {
    clearCelebrationConfetti();
  }, 3000);
}

// 2. Playful micro-burst at target click coordinates (per-habit completion)
export function triggerMicroConfetti(clientX?: number, clientY?: number) {
  try {
    const x = clientX !== undefined ? clientX / window.innerWidth : 0.85;
    const y = clientY !== undefined ? clientY / window.innerHeight : 0.5;

    confetti({
      particleCount: 16,
      spread: 50,
      origin: { x, y },
      colors: ['#D4FF00', '#00F0FF', '#FF007A', '#FFE600', '#FFFFFF'],
      ticks: 80, // ~1.3 seconds
      decay: 0.88, // Quick disappear
      gravity: 1.5,
      scalar: 0.8,
      disableForReducedMotion: true,
    });
  } catch (e) {
    // Fallback
  }
}
