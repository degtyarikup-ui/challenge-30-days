import confetti from 'canvas-confetti';

export function triggerCelebrationConfetti() {
  const colors = ['#D4FF00', '#FFFFFF', '#FFDD00', '#FF3B30', '#3B82F6'];

  // 1. Initial side cannons
  confetti({
    particleCount: 70,
    angle: 60,
    spread: 70,
    origin: { x: 0, y: 0.75 },
    colors: colors,
    ticks: 300,
    gravity: 1.1,
    scalar: 1.15,
  });

  confetti({
    particleCount: 70,
    angle: 120,
    spread: 70,
    origin: { x: 1, y: 0.75 },
    colors: colors,
    ticks: 300,
    gravity: 1.1,
    scalar: 1.15,
  });

  // 2. High center explosion after 180ms
  setTimeout(() => {
    confetti({
      particleCount: 90,
      spread: 120,
      origin: { x: 0.5, y: 0.4 },
      colors: colors,
      ticks: 350,
      gravity: 0.9,
      scalar: 1.25,
      shapes: ['circle', 'square'],
    });
  }, 180);

  // 3. Second rain of stars/particles after 350ms
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 90,
      spread: 100,
      origin: { x: 0.5, y: 0.6 },
      colors: colors,
      ticks: 300,
      gravity: 1.0,
      scalar: 1.1,
    });
  }, 350);
}
