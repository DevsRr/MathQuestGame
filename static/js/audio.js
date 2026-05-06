// ═══════════════════════════════════════════
//  audio.js — Web Audio API sound engine
//  No external files needed — all synth sounds
// ═══════════════════════════════════════════

const AudioManager = (() => {
  let ctx = null;
  let bgGain = null;
  let sfxGain = null;
  let musicEnabled = true;
  let sfxEnabled = true;
  let bgOscillators = [];

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      bgGain = ctx.createGain();
      bgGain.gain.value = 0.08;
      bgGain.connect(ctx.destination);
      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.4;
      sfxGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function playTone(freq, type, duration, gainVal, startDelay = 0) {
    if (!sfxEnabled) return;
    const c = getCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, c.currentTime + startDelay);
    g.gain.setValueAtTime(gainVal || 0.3, c.currentTime + startDelay);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + startDelay + duration);
    osc.connect(g);
    g.connect(sfxGain);
    osc.start(c.currentTime + startDelay);
    osc.stop(c.currentTime + startDelay + duration);
  }

  // ── SFX Presets ──────────────────────────────

  function correct() {
    // Happy ascending chord
    playTone(523, 'sine', 0.15, 0.5, 0.0);
    playTone(659, 'sine', 0.15, 0.5, 0.1);
    playTone(784, 'sine', 0.3, 0.5, 0.2);
    playTone(1047, 'sine', 0.4, 0.4, 0.3);
  }

  function wrong() {
    // Sad descending
    playTone(400, 'sawtooth', 0.1, 0.3, 0.0);
    playTone(300, 'sawtooth', 0.15, 0.3, 0.1);
    playTone(220, 'sawtooth', 0.25, 0.3, 0.2);
  }

  function click() {
    playTone(800, 'sine', 0.08, 0.2);
  }

  function levelUp() {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((n, i) => playTone(n, 'sine', 0.2, 0.4, i * 0.1));
  }

  function gameOver() {
    playTone(300, 'sawtooth', 0.2, 0.3, 0.0);
    playTone(250, 'sawtooth', 0.2, 0.3, 0.2);
    playTone(200, 'sawtooth', 0.4, 0.3, 0.4);
  }

  function countdown() {
    playTone(600, 'sine', 0.1, 0.3);
  }

  function countdownGo() {
    playTone(900, 'sine', 0.05, 0.4, 0.0);
    playTone(1200, 'sine', 0.3, 0.4, 0.08);
  }

  function timerWarning() {
    playTone(880, 'square', 0.08, 0.15);
  }

  // ── Background music (simple looping arpeggio) ──

  function startBgMusic() {
    if (!musicEnabled) return;
    const c = getCtx();
    const notes = [261, 329, 392, 329, 523, 392, 659, 523];
    let i = 0;
    const interval = setInterval(() => {
      if (!musicEnabled) { clearInterval(interval); return; }
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'triangle';
      osc.frequency.value = notes[i % notes.length];
      g.gain.setValueAtTime(0.06, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
      osc.connect(g);
      g.connect(bgGain);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.4);
      i++;
    }, 450);
    bgOscillators.push(interval);
  }

  function stopBgMusic() {
    bgOscillators.forEach(clearInterval);
    bgOscillators = [];
  }

  // ── Voice-like text feedback via SpeechSynthesis ──

  function speak(text) {
    if (!sfxEnabled) return;
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.1;
    utter.pitch = 1.4;
    utter.volume = 0.8;
    const voices = window.speechSynthesis.getVoices();
    const kidVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'));
    if (kidVoice) utter.voice = kidVoice;
    window.speechSynthesis.speak(utter);
  }

  function toggleMusic() {
    musicEnabled = !musicEnabled;
    if (musicEnabled) startBgMusic();
    else stopBgMusic();
    return musicEnabled;
  }

  function toggleSFX() {
    sfxEnabled = !sfxEnabled;
    return sfxEnabled;
  }

  function setMusicEnabled(val) { musicEnabled = val; }
  function setSFXEnabled(val) { sfxEnabled = val; }

  return {
    correct, wrong, click, levelUp, gameOver,
    countdown, countdownGo, timerWarning,
    startBgMusic, stopBgMusic,
    speak, toggleMusic, toggleSFX,
    setMusicEnabled, setSFXEnabled,
    isMusicOn: () => musicEnabled,
    isSFXOn: () => sfxEnabled
  };
})();

window.AudioManager = AudioManager;
