import confetti from 'canvas-confetti';

export function triggerCelebrationConfetti() {
  // Electric lime, gold, black, and white celebratory palette
  const colors = ['#D4FF00', '#FFD700', '#FF3B30', '#0D0E12', '#FFFFFF'];

  // Left cannon
  confetti({
    particleCount: 60,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.8 },
    colors: colors,
    ticks: 200,
    gravity: 1.2,
    scalar: 1.1,
  });

  // Right cannon
  confetti({
    particleCount: 60,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.8 },
    colors: colors,
    ticks: 200,
    gravity: 1.2,
    scalar: 1.1,
  });

  // Center burst after short delay
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors: colors,
      ticks: 250,
      scalar: 1.2,
    });
  }, 200);
}
