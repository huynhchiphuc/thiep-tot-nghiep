/* ============================================================
   script.js – Vibrant Glassmorphism Invitation Logic
   ============================================================ */

/* ---- Confetti ---- */
const canvas = document.getElementById('confettiCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const COLORS = [
  '#a855f7','#d8b4fe','#f472b6','#fda4af',
  '#fb923c','#fdba74','#2dd4bf','#ffffff',
  '#7c3aed','#f9a8d4'
];

class ConfettiPiece {
  constructor(burst = false) { this.burst = burst; this.reset(); }
  reset() {
    this.x      = this.burst
      ? canvas.width / 2 + (Math.random() - 0.5) * 300
      : Math.random() * canvas.width;
    this.y      = this.burst ? canvas.height * 0.4 : -20;
    this.vy     = this.burst ? (Math.random() * -14 - 4) : (Math.random() * 3 + 2);
    this.vx     = (Math.random() - 0.5) * (this.burst ? 12 : 2);
    this.gravity= 0.25;
    this.w      = Math.random() * 10 + 4;
    this.h      = Math.random() * 5  + 3;
    this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.angle  = Math.random() * Math.PI * 2;
    this.spin   = (Math.random() - 0.5) * 0.14;
    this.opacity= Math.random() * 0.5 + 0.5;
    this.life   = 1;
    this.decay  = this.burst ? (Math.random() * 0.008 + 0.005) : 0;
  }
  update() {
    if (this.burst) {
      this.vy   += this.gravity;
      this.life -= this.decay;
      this.opacity = this.life * 0.8;
    }
    this.x     += this.vx;
    this.y     += this.vy;
    this.angle += this.spin;
    if (!this.burst && this.y > canvas.height + 20) this.reset();
  }
  draw() {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  }
  isDead() { return this.burst && this.life <= 0; }
}

let confettiList = [];
let confettiLoop = null;

function burstConfetti() {
  const burst = Array.from({ length: 180 }, () => new ConfettiPiece(true));
  confettiList.push(...burst);
  if (!confettiLoop) runConfettiLoop();
}

function runConfettiLoop() {
  confettiLoop = requestAnimationFrame(function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiList = confettiList.filter(c => !c.isDead());
    confettiList.forEach(c => { c.update(); c.draw(); });
    if (confettiList.length > 0) {
      confettiLoop = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiLoop = null;
    }
  });
}

/* ---- Floating particles ---- */
const PARTICLE_COLORS = ['#a855f7','#f472b6','#fb923c','#2dd4bf','#d8b4fe'];
const particleContainer = document.getElementById('floatParticles');

function spawnParticles(count = 20) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'fparticle';
    const size = Math.random() * 6 + 2;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}vw;
      bottom:${-size}px;
      background:${PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]};
      animation-duration:${Math.random() * 12 + 8}s;
      animation-delay:${Math.random() * 8}s;
    `;
    particleContainer.appendChild(p);
  }
}

spawnParticles(22);

/* ---- Countdown ---- */
const TARGET = new Date('2026-08-22T13:30:00+07:00');

function pad(n) { return String(n).padStart(2, '0'); }

function tick(id, newVal) {
  const el = document.getElementById(id);
  const s  = pad(newVal);
  if (el && el.textContent !== s) {
    el.style.transform = 'translateY(-8px)';
    el.style.opacity   = '0';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.textContent   = s;
        el.style.transform = 'translateY(0)';
        el.style.opacity   = '1';
      });
    });
  }
}

function updateCountdown() {
  const diff = TARGET - new Date();
  if (diff <= 0) {
    ['days','hours','minutes','seconds'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '00';
    });
    return;
  }
  tick('days',    Math.floor(diff / 86400000));
  tick('hours',   Math.floor((diff % 86400000) / 3600000));
  tick('minutes', Math.floor((diff % 3600000)  / 60000));
  tick('seconds', Math.floor((diff % 60000)    / 1000));
}

/* ---- Intro → Main transition ---- */
const introScreen = document.getElementById('introScreen');
const introBtn    = document.getElementById('introBtn');
const mainPage    = document.getElementById('mainPage');

function openInvitation() {
  introBtn.disabled = true;
  introScreen.style.opacity   = '0';
  introScreen.style.transform = 'scale(0.92)';

  setTimeout(() => {
    introScreen.style.display = 'none';
    mainPage.classList.remove('hidden');
    burstConfetti();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    initReveal();
    // Auto-play nhạc sau khi mở thiệp (user đã gesture rồi)
    setTimeout(() => { if (window.__autoPlayMusic) window.__autoPlayMusic(); }, 600);
  }, 700);
}

introBtn.addEventListener('click', openInvitation);

/* ---- Reveal on scroll ---- */
function initReveal() {
  const targets = document.querySelectorAll(
    '.hero-section, .info-section, .cd-section, .map-section, .quote-section, .site-footer'
  );
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i * 100) + 'ms';
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach(el => obs.observe(el));
}

/* ---- Smooth style for countdown numbers ---- */
['days','hours','minutes','seconds'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.style.transition = 'transform 0.25s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease';
});

/* ============================================================
   WEB AUDIO MUSIC ENGINE
   Tạo nhạc chúc mừng tốt nghiệp tự động, không cần file âm thanh
   ============================================================ */

let audioCtx   = null;
let musicNodes = [];
let isPlaying  = false;
let musicScheduleTimeout = null;

// Giai điệu: "Pomp and Circumstance" đơn giản hóa + thêm harmony
// Frequencies (Hz) – A4=440
const NOTE = {
  C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00,
  A4:440.00, B4:493.88,
  C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99,
  A5:880.00, B5:987.77,
  G3:196.00, A3:220.00, C3:130.81, F3:174.61,
};

// Melody sequence: [freq, duration_seconds]
const MELODY = [
  [NOTE.G4, 0.5],[NOTE.G4, 0.25],[NOTE.G4, 0.25],
  [NOTE.E4, 0.5],[NOTE.G4, 0.25],[NOTE.G4, 0.25],
  [NOTE.A4, 1.0],
  [NOTE.A4, 0.5],[NOTE.A4, 0.25],[NOTE.A4, 0.25],
  [NOTE.F4, 0.5],[NOTE.A4, 0.25],[NOTE.A4, 0.25],
  [NOTE.B4, 1.0],
  [NOTE.B4, 0.5],[NOTE.B4, 0.25],[NOTE.B4, 0.25],
  [NOTE.G4, 0.5],[NOTE.B4, 0.25],[NOTE.B4, 0.25],
  [NOTE.C5, 0.75],[NOTE.B4, 0.25],[NOTE.A4, 0.5],[NOTE.G4, 0.5],
  [NOTE.D5, 1.5],
  [NOTE.C5, 0.5],[NOTE.B4, 0.5],[NOTE.A4, 0.5],[NOTE.G4, 0.5],
  [NOTE.A4, 0.5],[NOTE.G4, 0.5],[NOTE.E4, 1.0],
  [NOTE.G4, 0.5],[NOTE.F4, 0.5],[NOTE.E4, 0.5],[NOTE.D4, 0.5],
  [NOTE.E4, 1.5],
];

// Bass line: root chords
const BASS = [
  [NOTE.C3, 2],[NOTE.C3, 2],[NOTE.F3, 2],[NOTE.F3, 2],
  [NOTE.G3, 2],[NOTE.G3, 2],[NOTE.C3, 2],[NOTE.C3, 2],
  [NOTE.A3, 2],[NOTE.A3, 2],[NOTE.G3, 2],[NOTE.C3, 2],
];

function createAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playNote(freq, startTime, duration, type = 'sine', gainVal = 0.18, ctx) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  // Envelope
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02);
  gain.gain.setValueAtTime(gainVal, startTime + duration - 0.08);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  // Reverb-like: add slight detune
  osc.detune.setValueAtTime(Math.random() * 2 - 1, startTime);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);

  musicNodes.push(osc, gain);
  return osc;
}

function scheduleMelody() {
  if (!isPlaying) return;
  const ctx    = createAudioCtx();
  const now    = ctx.currentTime;
  let   time   = now + 0.1;

  // Play melody
  MELODY.forEach(([freq, dur]) => {
    playNote(freq, time, dur * 0.92, 'sine', 0.22, ctx);
    // Add harmonics
    playNote(freq * 2, time, dur * 0.92, 'sine', 0.06, ctx);
    time += dur;
  });

  // Play bass
  let bassTime = now + 0.1;
  BASS.forEach(([freq, dur]) => {
    playNote(freq, bassTime, dur * 0.85, 'triangle', 0.10, ctx);
    bassTime += dur;
  });

  // Loop after total melody duration
  const totalDur = MELODY.reduce((s, [, d]) => s + d, 0);
  musicScheduleTimeout = setTimeout(() => {
    if (isPlaying) {
      musicNodes = [];
      scheduleMelody();
    }
  }, (totalDur + 0.5) * 1000);
}

function stopMusic() {
  clearTimeout(musicScheduleTimeout);
  musicNodes.forEach(n => {
    try { n.stop ? n.stop() : n.disconnect(); } catch(e) {}
    try { n.disconnect(); } catch(e) {}
  });
  musicNodes = [];
}

// Spawn floating music note on btn click
const NOTE_EMOJIS = ['🎵','🎶','♪','♫','🎼'];
function spawnNoteParticle() {
  const btn  = document.getElementById('musicBtn');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const el = document.createElement('span');
      el.className   = 'note-particle';
      el.textContent = NOTE_EMOJIS[Math.floor(Math.random() * NOTE_EMOJIS.length)];
      el.style.left  = (rect.left + Math.random() * rect.width)  + 'px';
      el.style.top   = (rect.top  - 10) + 'px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2100);
    }, i * 120);
  }
}

// Music button logic
const musicBtn  = document.getElementById('musicBtn');
const musicIcon = document.getElementById('musicIcon');

musicBtn.addEventListener('click', () => {
  if (isPlaying) {
    isPlaying = false;
    stopMusic();
    musicIcon.textContent = '🎵';
    musicBtn.classList.remove('playing');
  } else {
    isPlaying = true;
    createAudioCtx().resume();
    scheduleMelody();
    musicIcon.textContent = '🔊';
    musicBtn.classList.add('playing');
    spawnNoteParticle();
  }
});

// Auto-play after intro opens (with user gesture already done)
window.__autoPlayMusic = function() {
  if (!isPlaying) {
    isPlaying = true;
    createAudioCtx();
    scheduleMelody();
    musicIcon.textContent = '🔊';
    musicBtn.classList.add('playing');
    spawnNoteParticle();
  }
};

