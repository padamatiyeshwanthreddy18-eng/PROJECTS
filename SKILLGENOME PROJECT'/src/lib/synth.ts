// Programmatic Web Audio Synthesizer for Cyberpunk Sci-fi HUD Click, Scan, Alarm, and Score Tones.
let audioCtx: AudioContext | null = null;
let isMuted = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export const synth = {
  toggleMute: () => {
    isMuted = !isMuted;
    if (!isMuted) {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume();
      }
    }
    return isMuted;
  },

  getMuted: () => isMuted,

  // Soft low-latency high-tech click
  playClick: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  },

  // Synthesize cyberpunk interface scan swipe hover
  playScanSwipe: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  },

  // Sequence completion chime
  playSuccessCadence: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chords.forEach((freq, idx) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx!.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0, ctx!.currentTime + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.05, ctx!.currentTime + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx!.currentTime + idx * 0.1 + 0.3);

      osc.connect(gain);
      gain.connect(ctx!.destination);

      osc.start(ctx!.currentTime + idx * 0.1);
      osc.stop(ctx!.currentTime + idx * 0.1 + 0.35);
    });
  },

  // Level Up dramatic swell
  playLevelUpChime: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const baseTime = ctx.currentTime;
    // Ascending sci-fi pitch swoop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, baseTime);
    osc.frequency.exponentialRampToValueAtTime(880, baseTime + 0.4);

    // Apply lowpass filter for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, baseTime);

    gain.gain.setValueAtTime(0, baseTime);
    gain.gain.linearRampToValueAtTime(0.08, baseTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, baseTime + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(baseTime + 0.5);
  }
};
