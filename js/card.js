/* Greeting Card generator — paints a festive PNG card on canvas, no libraries. */
window.DiwaliCard = (function () {
  'use strict';

  var W = 1080, H = 1350;
  var PALETTE = ['#FFD166', '#FF9F1C', '#D81159', '#06D6A0', '#E63946', '#D4C2FC'];

  function orb(ctx, x, y, r, color) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(10,9,21,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawRangoliCorner(ctx, cx, cy, R) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = '#FF9F1C';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 10]);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#D81159';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, 0, R * 0.66, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < 8; i++) {
      ctx.save();
      ctx.rotate((Math.PI / 4) * i);
      ctx.fillStyle = i % 2 ? '#FF9F1C' : '#D81159';
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.ellipse(0, -R * 0.42, R * 0.11, R * 0.26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#FFD166';
    ctx.beginPath(); ctx.arc(0, 0, R * 0.09, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawDiya(ctx, cx, cy, s) {
    orb(ctx, cx, cy - s * 1.4, s * 3.1, 'rgba(255,209,102,0.45)');
    var bg = ctx.createLinearGradient(cx, cy - s * 0.4, cx, cy + s);
    bg.addColorStop(0, '#b3541e');
    bg.addColorStop(0.7, '#7a2f0d');
    bg.addColorStop(1, '#5c2408');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.ellipse(cx, cy, s * 1.6, s * 0.85, 0, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    var rg = ctx.createLinearGradient(cx - s * 1.7, cy, cx + s * 1.7, cy);
    rg.addColorStop(0, '#8a3b12');
    rg.addColorStop(0.5, '#d97b3f');
    rg.addColorStop(1, '#8a3b12');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.ellipse(cx, cy, s * 1.7, s * 0.32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a1c05';
    ctx.beginPath(); ctx.ellipse(cx, cy, s * 1.35, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    var fg = ctx.createLinearGradient(cx, cy - s * 2.7, cx, cy - s * 0.5);
    fg.addColorStop(0, '#e63946');
    fg.addColorStop(0.45, '#ff9f1c');
    fg.addColorStop(0.8, '#ffd166');
    fg.addColorStop(1, '#fff8dc');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 2.7);
    ctx.bezierCurveTo(cx + s * 0.9, cy - s * 1.7, cx + s * 0.62, cy - s * 0.7, cx, cy - s * 0.5);
    ctx.bezierCurveTo(cx - s * 0.62, cy - s * 0.7, cx - s * 0.9, cy - s * 1.7, cx, cy - s * 2.7);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,248,220,0.95)';
    ctx.beginPath(); ctx.ellipse(cx, cy - s * 0.95, s * 0.2, s * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  }

  function wrapText(ctx, text, maxWidth) {
    var words = text.split(/\s+/);
    var lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function build() {
    return document.fonts.ready.then(function () {
      var name = (document.getElementById('greeting-name') || {}).textContent || 'Dear Friend';
      var message = (document.getElementById('greeting-message') || {}).textContent || '';
      var senderEl = document.getElementById('greeting-sender');
      var sender = senderEl && !senderEl.hidden ? senderEl.textContent : '';

      var canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      var ctx = canvas.getContext('2d');
      try { ctx.letterSpacing = '0px'; } catch (e) {}

      ctx.fillStyle = '#0a0915';
      ctx.fillRect(0, 0, W, H);
      orb(ctx, W * 0.88, H * 0.05, 360, 'rgba(216,17,89,0.22)');
      orb(ctx, W * 0.08, H * 0.96, 400, 'rgba(255,159,28,0.17)');

      drawRangoliCorner(ctx, 40, H - 40, 210);
      drawRangoliCorner(ctx, W - 40, 40, 210);

      for (var i = 0; i < 70; i++) {
        ctx.save();
        ctx.translate(Math.random() * W, Math.random() * H);
        ctx.rotate(Math.random() * Math.PI);
        ctx.globalAlpha = 0.25 + Math.random() * 0.4;
        ctx.fillStyle = PALETTE[(Math.random() * PALETTE.length) | 0];
        ctx.fillRect(-4, -2, 8, 4);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      ctx.strokeStyle = '#FF9F1C';
      ctx.lineWidth = 4;
      roundedRect(ctx, 34, 34, W - 68, H - 68, 36);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(216,17,89,0.75)';
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 12]);
      roundedRect(ctx, 52, 52, W - 104, H - 104, 28);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';

      try { ctx.letterSpacing = '8px'; } catch (e) {}
      ctx.fillStyle = '#FF9F1C';
      ctx.font = '36px Marcellus, serif';
      ctx.fillText('॥ शुभ दीपावली ॥', W / 2, 150);
      try { ctx.letterSpacing = '0px'; } catch (e) {}

      drawDiya(ctx, W / 2, 440, 92);

      ctx.fillStyle = '#FFF8F0';
      ctx.font = '74px "Yatra One", serif';
      ctx.fillText('Happy Diwali,', W / 2, 700);

      var nameSize = 116;
      ctx.font = nameSize + 'px "Yatra One", serif';
      while (ctx.measureText(name).width > W - 180 && nameSize > 40) {
        nameSize -= 6;
        ctx.font = nameSize + 'px "Yatra One", serif';
      }
      var ng = ctx.createLinearGradient(W / 2 - 300, 0, W / 2 + 300, 0);
      ng.addColorStop(0, '#FF9F1C');
      ng.addColorStop(0.5, '#FFD166');
      ng.addColorStop(1, '#FF9F1C');
      ctx.fillStyle = ng;
      ctx.fillText(name, W / 2, 830);

      ctx.fillStyle = '#D4C2FC';
      ctx.font = '38px Outfit, sans-serif';
      var lines = wrapText(ctx, message, W - 240).slice(0, 4);
      var y = 930;
      lines.forEach(function (line) {
        ctx.fillText(line, W / 2, y);
        y += 56;
      });

      if (sender) {
        ctx.fillStyle = '#FF9F1C';
        ctx.font = '42px Marcellus, serif';
        ctx.fillText(sender, W / 2, y + 40);
      }

      for (var d = 0; d < 5; d++) {
        drawDiya(ctx, W / 2 + (d - 2) * 150, 1215, 40);
      }

      ctx.fillStyle = 'rgba(138,125,176,0.9)';
      ctx.font = '24px Outfit, sans-serif';
      ctx.fillText('Made with light · Shubh Deepavali', W / 2, 1315);

      return canvas;
    });
  }

  function download() {
    return build().then(function (canvas) {
      return new Promise(function (resolve) {
        canvas.toBlob(function (blob) {
          var name = ((document.getElementById('greeting-name') || {}).textContent || 'friend')
            .toLowerCase().replace(/[^a-z0-9]+/g, '-');
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'diwali-greeting-for-' + name + '.png';
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
          resolve();
        }, 'image/png');
      });
    });
  }

  return { build: build, download: download };
})();
