/* Shubh Deepavali — personalisation, thali, lanterns, share links, ambience. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- 1. Personalised greeting from URL query params ---------- */
  var params = new URLSearchParams(window.location.search);
  var name = (params.get('name') || '').trim().slice(0, 40);
  var message = (params.get('message') || '').trim().slice(0, 300);
  var from = (params.get('from') || '').trim().slice(0, 40);

  if (name) {
    $('greeting-name').textContent = name;
    document.title = 'Happy Diwali, ' + name + '!';
  }
  if (message) $('greeting-message').textContent = message;
  if (from) {
    var senderEl = $('greeting-sender');
    senderEl.textContent = '— With love and light, ' + from;
    senderEl.hidden = false;
  }

  /* ---------- 2. Ambient sky: twinkling stars + falling marigold petals ---------- */
  var starsBox = $('stars-container');
  for (var i = 0; i < 90; i++) {
    var st = document.createElement('span');
    st.className = 'star';
    var size = 1 + Math.random() * 2.2;
    st.style.width = st.style.height = size + 'px';
    st.style.left = Math.random() * 100 + 'vw';
    st.style.top = Math.random() * 100 + 'vh';
    st.style.animationDuration = 2 + Math.random() * 4 + 's';
    st.style.animationDelay = -Math.random() * 5 + 's';
    starsBox.appendChild(st);
  }
  var petalsBox = $('petals-container');
  for (var p = 0; p < 15; p++) {
    var pe = document.createElement('span');
    pe.className = 'petal';
    var ps = 8 + Math.random() * 10;
    pe.style.width = ps + 'px';
    pe.style.height = ps * 1.25 + 'px';
    pe.style.left = Math.random() * 100 + 'vw';
    pe.style.animationDuration = 9 + Math.random() * 9 + 's';
    pe.style.animationDelay = -Math.random() * 16 + 's';
    petalsBox.appendChild(pe);
  }

  /* ---------- 3. Music ---------- */
  var audioBtn = $('audio-toggle-btn');
  var musicStarted = false;

  function setAudioUI(on) {
    audioBtn.classList.toggle('on', on);
    audioBtn.setAttribute('aria-pressed', String(on));
    $('audio-label').textContent = on ? 'Music On' : 'Music Off';
  }
  function startMusicOnce() {
    if (musicStarted) return;
    musicStarted = true;
    setAudioUI(window.DiwaliAudio.start());
  }
  audioBtn.addEventListener('click', function () {
    if (window.DiwaliAudio && window.DiwaliAudio.ctx && window.DiwaliAudio.ctx.state === 'suspended') {
    window.DiwaliAudio.ctx.resume();
  }
    musicStarted = true;
    setAudioUI(window.DiwaliAudio.toggle());
  });

  /* ---------- 4. Tap-to-burst fireworks ---------- */
  window.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button, a, input, textarea, select, label, .modal-card')) return;
    window.DiwaliFX.launchAt(e.clientX, e.clientY);
    window.DiwaliAudio.cracker(0.9);
    startMusicOnce();
  });

  /* ---------- 5. Virtual Puja Thali ---------- */
  var diyas = Array.prototype.slice.call(document.querySelectorAll('.thali-diya'));
  var counter = $('diyas-lit-counter');
  var litCount = 0, finaleDone = false;

  diyas.forEach(function (diya, idx) {
    diya.addEventListener('click', function () {
      startMusicOnce();
      if (diya.classList.contains('lit')) return;
      diya.classList.add('lit');
      litCount++;
      counter.textContent = litCount + ' / 5 Diyas Lit';
      window.DiwaliAudio.bell(idx);
      var r = diya.getBoundingClientRect();
      window.DiwaliFX.burst(r.left + r.width / 2, r.top + r.height / 2, null, 0.55);
      window.DiwaliAudio.cracker(0.25);
      if (litCount === 5 && !finaleDone) {
        finaleDone = true;
        setTimeout(function () {
          window.DiwaliFX.finale();
          $('blessing-modal').hidden = false;
        }, 600);
      }
    });
  });

  $('blessing-close-btn').addEventListener('click', function () {
    $('blessing-modal').hidden = true;
  });
  $('blessing-modal').addEventListener('click', function (e) {
    if (e.target === this) this.hidden = true;
  });

  /* ---------- 6. Wish lanterns ---------- */
  var wishInput = $('wish-input');
  var activeLanterns = 0;

  $('release-lantern-btn').addEventListener('click', function () {
    startMusicOnce();
    if (activeLanterns >= 8) { toast('The sky is full of wishes — wait a moment!'); return; }
    var wish = wishInput.value.trim().slice(0, 80) || 'Health, wealth & happiness';
    var lantern = document.createElement('div');
    lantern.className = 'lantern lantern--flying';
    lantern.style.left = (15 + Math.random() * 65) + 'vw';
    lantern.style.setProperty('--drift', ((Math.random() - 0.5) * 160).toFixed(0) + 'px');
    var wishEl = document.createElement('span');
    wishEl.className = 'lantern-wish';
    wishEl.textContent = wish;
    lantern.appendChild(wishEl);
    document.body.appendChild(lantern);
    activeLanterns++;
    lantern.addEventListener('animationend', function () {
      lantern.remove();
      activeLanterns--;
    });
    var r = this.getBoundingClientRect();
    window.DiwaliFX.confettiBurst(r.left + r.width / 2, r.top, 40);
    window.DiwaliAudio.bell(4);
    wishInput.value = '';
    toast('Your wish is on its way to the stars');
  });

  /* ---------- 7. Greeting card download ---------- */
  $('download-card-btn').addEventListener('click', function () {
    startMusicOnce();
    var r = this.getBoundingClientRect();
    window.DiwaliFX.confettiBurst(r.left + r.width / 2, r.top, 30);
    window.DiwaliAudio.bell(2);
    window.DiwaliCard.download().then(function () {
      toast('Greeting card downloaded');
    });
  });

  /* ---------- 8. Shareable greeting link ---------- */
  var resultBox = $('share-link-result');
  var linkOut = $('share-link-output');
  var waBtn = $('whatsapp-share-btn');

  $('generate-link-btn').addEventListener('click', function () {
    var to = $('recipient-name-input').value.trim();
    var msg = $('message-input').value.trim();
    var fromName = $('sender-name-input').value.trim();
    if (!to) { toast("Add the recipient's name first"); $('recipient-name-input').focus(); return; }
    var q = new URLSearchParams();
    q.set('name', to);
    if (msg) q.set('message', msg);
    if (fromName) q.set('from', fromName);
    var url = window.location.origin + window.location.pathname + '?' + q.toString();
    linkOut.value = url;
    resultBox.hidden = false;
    var text = 'Diwali greetings for you' + (fromName ? ' from ' + fromName : '') + '! Open your personalised wish: ' + url;
    waBtn.href = 'https://wa.me/?text=' + encodeURIComponent(text);
    window.DiwaliFX.confettiBurst(window.innerWidth / 2, window.innerHeight / 2, 60);
    toast('Your greeting link is ready');
  });

  $('copy-link-btn').addEventListener('click', function () {
    function done() { toast('Link copied — share the sparkle!'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(linkOut.value).then(done, function () { legacyCopy(); done(); });
    } else {
      legacyCopy(); done();
    }
    function legacyCopy() {
      linkOut.select();
      document.execCommand('copy');
      linkOut.blur();
    }
  });

  /* ---------- toast ---------- */
  var toastEl = $('toast');
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }
})();
