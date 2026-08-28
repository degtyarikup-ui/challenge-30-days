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

// 1. Crisp, Delightful Toggle ON Sound (Tactile Apple-like harmonic pop)
export function playToggleOnSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Primary bell tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.07); // A5
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.09);

    // Harmonic sparkle overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1174.66, now); // D6
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.05); // A6
    gain2.gain.setValueAtTime(0.08, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.07);
  } catch (e) {
    // Audio blocked
  }
}

// 2. Soft Tactile Toggle OFF Tick
export function playToggleOffSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
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

    // Rich bright chord progression: C5 -> E5 -> G5 -> B5 -> C6 -> E6
    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.4 }, // C5
      { freq: 659.25, time: 0.08, dur: 0.4 }, // E5
      { freq: 783.99, time: 0.16, dur: 0.5 }, // G5
      { freq: 987.77, time: 0.24, dur: 0.5 }, // B5
      { freq: 1046.50, time: 0.32, dur: 0.8 }, // C6
      { freq: 1318.51, time: 0.40, dur: 0.9 }, // E6
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const noteStart = now + time;

      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.2, noteStart);
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
    bassGain.gain.setValueAtTime(0.22, now + 0.32);
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

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  } catch (e) {
    // Audio blocked
  }
}
