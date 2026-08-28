// Web Audio API synthesized pleasant micro-sounds & triumphant celebratory sound

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Subtle Toggle ON Pop (Satisfying upward soft pop)
export function playToggleOnSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (e) {
    // Audio not supported or blocked
  }
}

// 2. Subtle Toggle OFF Click (Soft downward tick)
export function playToggleOffSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (e) {
    // Audio blocked
  }
}

// 3. Rich, Bright & Triumphant All-Done Fanfare Sound
export function playAllDoneSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Rich bright progression: C5 -> E5 -> G5 -> B5 -> C6 -> E6
    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.4 }, // C5
      { freq: 659.25, time: 0.08, dur: 0.4 }, // E5
      { freq: 783.99, time: 0.16, dur: 0.5 }, // G5
      { freq: 987.77, time: 0.24, dur: 0.5 }, // B5
      { freq: 1046.50, time: 0.32, dur: 0.8 }, // C6 (Power high)
      { freq: 1318.51, time: 0.40, dur: 0.9 }, // E6 (Sparkle)
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const noteStart = now + time;

      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.18, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + dur + 0.05);
    });

    // Deep warm sub-bass root for punch
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(130.81, now + 0.32); // C3
    bassGain.gain.setValueAtTime(0.2, now + 0.32);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32 + 0.8);
    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.start(now + 0.32);
    bassOsc.stop(now + 0.32 + 0.85);

  } catch (e) {
    // Audio blocked
  }
}

// 4. Soft Warning Click
export function playWarningSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  } catch (e) {
    // Audio blocked
  }
}
