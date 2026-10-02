/**
 * Short rising three-note chime built with oscillators, so there is no audio
 * asset to ship or fetch. Must be triggered from a user gesture to satisfy
 * browser autoplay policy — the transfer is always started by a click, so the
 * AudioContext starts unlocked.
 */
let ctx: AudioContext | null = null;

function getContext() {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  return ctx;
}

type Note = { freq: number; at: number; duration: number };

function playNote(audio: AudioContext, master: GainNode, { freq, at, duration }: Note) {
  const start = audio.currentTime + at;

  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  // Quick attack, exponential decay gives the chime a bell-like tail.
  gain.gain.exponentialRampToValueAtTime(0.22, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  // Two detuned oscillators per note add a little shimmer.
  for (const detune of [-4, 4]) {
    const osc = audio.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);
    osc.detune.setValueAtTime(detune, start);
    osc.connect(gain);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  gain.connect(master);
}

export function playSuccessChime() {
  const audio = getContext();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();

  const master = audio.createGain();
  master.gain.setValueAtTime(0.9, audio.currentTime);
  master.connect(audio.destination);

  // C6 - E6 - G6: a major triad ascending, reads as "it worked".
  const notes: Note[] = [
    { freq: 1046.5, at: 0, duration: 0.32 },
    { freq: 1318.51, at: 0.1, duration: 0.32 },
    { freq: 1567.98, at: 0.2, duration: 0.6 },
  ];

  for (const note of notes) playNote(audio, master, note);

  window.setTimeout(() => master.disconnect(), 1200);
}
