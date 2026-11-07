/* Diwali Fireworks & Confetti — canvas particle engine (no libraries). */
window.DiwaliFX = (function () {
  'use strict';

  var canvas, ctx, W = 0, H = 0;
  var rockets = [], sparks = [], confetti = [];
  var COLORS = ['#FFD166', '#FF9F1C', '#D81159', '#06D6A0', '#E63946', '#FFF8F0', '#D4C2FC'];

  function pickColor() { return COLORS[(Math.random() * COLORS.length) | 0]; }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function launchAt(tx, ty) {
    rockets.push({
      x: tx, y: H + 12,
      ty: Math.max(70, Math.min(ty, H * 0.72)),
      speed: 9 + Math.random() * 3.5,
      color: pickColor()
    });
  }

  function burst(x, y, color, power) {
    power = power || 1;
    var rings = [0.45, 0.75, 1.05];
    for (var r = 0; r < rings.length; r++) {
      var count = 24 + r * 12;
      for (var i = 0; i < count; i++) {
        var a = (Math.PI * 2 * i) / count + Math.random() * 0.18;
        var sp = rings[r] * power * (2.3 + Math.random() * 1.7);
        sparks.push({
          x: x, y: y,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 1, decay: 0.008 + Math.random() * 0.013,
          color: color || pickColor(),
          size: 1.4 + Math.random() * 1.8
        });
      }
    }
  }

  function confettiBurst(x, y, n) {
    n = n || 70;
    for (var i = 0; i < n; i++) {
      confetti.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 9 - 2,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        w: 5 + Math.random() * 5, h: 8 + Math.random() * 6,
        color: pickColor(), life: 1, decay: 0.004 + Math.random() * 0.006
      });
    }
  }

  function confettiRain() {
    for (var i = 0; i < 150; i++) {
      confetti.push({
        x: Math.random() * W, y: -20 - Math.random() * H * 0.35,
        vx: (Math.random() - 0.5) * 1.6, vy: 1.6 + Math.random() * 2.2,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.25,
        w: 5 + Math.random() * 5, h: 8 + Math.random() * 6,
        color: pickColor(), life: 1, decay: 0.0022
      });
    }
  }

  function finale() {
    var i = 0;
    var iv = setInterval(function () {
      launchAt(W * (0.12 + 0.76 * Math.random()), H * (0.16 + 0.36 * Math.random()));
      if (window.DiwaliAudio) window.DiwaliAudio.cracker(1.25);
      i++;
      if (i > 9) {
        clearInterval(iv);
        confettiRain();
      }
    }, 270);
  }

  function ambient() {
    if (document.hidden) return;
    if (Math.random() < 0.75) launchAt(W * (0.15 + 0.7 * Math.random()), H * (0.15 + 0.4 * Math.random()));
  }

  function loop() {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';
    var i, s;
    for (i = rockets.length - 1; i >= 0; i--) {
      var rk = rockets[i];
      rk.y -= rk.speed;
      ctx.globalAlpha = 1;
      ctx.fillStyle = rk.color;
      ctx.fillRect(rk.x - 1.2, rk.y, 2.4, 9);
      if (rk.y <= rk.ty) {
        burst(rk.x, rk.y, rk.color);
        rockets.splice(i, 1);
      }
    }
    for (i = sparks.length - 1; i >= 0; i--) {
      s = sparks[i];
      s.x += s.vx; s.y += s.vy;
      s.vx *= 0.985; s.vy = s.vy * 0.985 + 0.05;
      s.life -= s.decay;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.globalAlpha = s.life;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.life + 0.4, 0, 7);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    for (i = confetti.length - 1; i >= 0; i--) {
      var c = confetti[i];
      c.x += c.vx; c.y += c.vy;
      c.vy += 0.12; c.vx *= 0.99;
      c.rot += c.vr; c.life -= c.decay;
      if (c.life <= 0 || c.y > H + 30) { confetti.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.min(1, c.life * 1.6);
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h * (0.4 + Math.abs(Math.sin(c.rot * 2)) * 0.6));
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(loop);
  }

  function init() {
    canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(loop);
    setInterval(ambient, 4600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    launchAt: launchAt,
    burst: burst,
    confettiBurst: confettiBurst,
    confettiRain: confettiRain,
    finale: finale
  };
  })();