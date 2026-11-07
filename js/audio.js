/* Diwali Audio Engine — pure Web Audio API, zero external files.
   Synthesises a festive raga-style ambient loop, temple bells and firecrackers. */
window.DiwaliAudio = (function () {
  'use strict';

  var ctx = null, master = null, musicBus = null, sfxBus = null;
  var noiseBuffer = null;
  var isPlaying = false, schedulerId = null, droneNodes = [];

  var SA = 138.59; // C#3 tonic
  var RAGA = [1, 9 / 8, 5 / 4, 45 / 32, 3 / 2, 27 / 16, 15 / 8, 2, 9 / 4, 5 / 2]; // Yaman-flavoured
  var melodyPos = 4;
  var BELL_STEPS = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3];

  function makeNoise() {
    var len = ctx.sampleRate * 1;
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }
  function ensureCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      musicBus = ctx.createGain(); musicBus.gain.value = 0.5; musicBus.connect(master);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.8; sfxBus.connect(master);
      noiseBuffer = makeNoise();
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  /* ----- background music ----- */
  function startDrone() {
    stopDrone();
    var t = ctx.currentTime;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
    var dg = ctx.createGain();
    dg.gain.setValueAtTime(0.0001, t);
    dg.gain.exponentialRampToValueAtTime(0.16, t + 2.5);
    lp.connect(dg); dg.connect(musicBus);
    [[SA / 2, 'sine', 1], [SA, 'triangle', 0.5], [SA * 1.5, 'sine', 0.3]].forEach(function (cfg) {
      var o = ctx.createOscillator(); o.type = cfg[1]; o.frequency.value = cfg[0];
      var g = ctx.createGain(); g.gain.value = cfg[2];
      o.connect(g); g.connect(lp); o.start(t);
      droneNodes.push(o);
    });
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
    var lfoG = ctx.createGain(); lfoG.gain.value = 0.05;
    lfo.connect(lfoG); lfoG.connect(dg.gain); lfo.start(t);
    droneNodes.push(lfo, lp, dg);
  }

  function stopDrone() {
    droneNodes.forEach(function (n) { try { if (n.stop) n.stop(); else n.disconnect(); } catch (e) {} });
    droneNodes = [];
  }

  function pluck(freq) {
    var t = ctx.currentTime;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    var o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq;
    var o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2.005;
    var g2 = ctx.createGain(); g2.gain.value = 0.35;
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(musicBus);
    o.start(t); o2.start(t); o.stop(t + 1.6); o2.stop(t + 1.6);
  }

  function scheduler() {
    if (Math.random() < 0.78) {
      var step = [-2, -1, -1, 0, 1, 1, 2][(Math.random() * 7) | 0];
      melodyPos = Math.max(0, Math.min(RAGA.length - 1, melodyPos + step));
      pluck(SA * 2 * RAGA[melodyPos]);
    }
    if (Math.random() < 0.1) playBell(SA * 4 * BELL_STEPS[(Math.random() * 5) | 0], 0.08);
  }

  function playBell(freq, vol) {
    var t = ctx.currentTime;
    [[1, 1], [2.76, 0.5], [5.4, 0.22]].forEach(function (p) {
      var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq * p[0];
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime((vol || 0.2) * p[1], t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 2.3);
    });
  }

  /* ----- firecracker SFX ----- */
  function burstNoise(t, dur, freq, vol) {
    var src = ctx.createBufferSource(); src.buffer = noiseBuffer; src.loop = true;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 1.1;
    var g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(bp); bp.connect(g); g.connect(sfxBus);
    src.start(t); src.stop(t + dur + 0.05);
  }

  function cracker(power) {
    ensureCtx();
    power = power || 1;
    var t = ctx.currentTime;
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(34, t + 0.35);
    g.gain.setValueAtTime(0.45 * power, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + 0.45);
    burstNoise(t, 0.13, 800 + Math.random() * 1300, 0.55 * power);
    var n = 5 + ((Math.random() * 6) | 0);
    for (var i = 0; i < n; i++) {
      burstNoise(t + 0.07 + Math.random() * 0.5, 0.03, 2200 + Math.random() * 3200, 0.13 * power);
    }
  }

  /* ----- public API ----- */
  function start() {
    ensureCtx();
    if (isPlaying) return true;
    isPlaying = true;
    startDrone();
    scheduler();
    schedulerId = setInterval(scheduler, 620);
    return true;
  }

  function stop() {
    isPlaying = false;
    clearInterval(schedulerId);
    stopDrone();
    return false;
  }

  function toggle() {
    ensureCtx();
    return isPlaying ? stop() : start();
  }

  function bell(step) {
    ensureCtx();
    var idx = (typeof step === 'number') ? step % BELL_STEPS.length : 0;
    playBell(SA * 4 * BELL_STEPS[idx], 0.28);
  }

  return {
    start: start,
    stop: stop,
    toggle: toggle,
    bell: bell,
    cracker: cracker,
    isOn: function () { return isPlaying; }
  };
})();
