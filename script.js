/* ============================================================
   script.js – Ultra-Luxury Invitation Logic
   ============================================================ */

/* ============================================================
   1. MP3 PLAYER
   ============================================================ */

const bgAudio  = new Audio('nhac_nen.mp3');
bgAudio.loop   = true;
bgAudio.volume = 0;

let isPlaying = false;

function fadeIn(targetVol = 0.55, duration = 1200) {
  bgAudio.volume = 0;
  bgAudio.play().catch(() => {});
  const step  = 30;
  const ticks = duration / step;
  const delta = targetVol / ticks;
  const timer = setInterval(() => {
    if (bgAudio.volume + delta >= targetVol) {
      bgAudio.volume = targetVol;
      clearInterval(timer);
    } else {
      bgAudio.volume += delta;
    }
  }, step);
}

function fadeOut(duration = 800) {
  const step  = 30;
  const ticks = duration / step;
  const delta = (bgAudio.volume || 0.55) / ticks;
  const timer = setInterval(() => {
    if (bgAudio.volume - delta <= 0) {
      bgAudio.volume = 0;
      bgAudio.pause();
      clearInterval(timer);
    } else {
      bgAudio.volume -= delta;
    }
  }, step);
}

/* ============================================================
   2. CONFETTI ENGINE
   ============================================================ */

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
  '#7c3aed','#f9a8d4','#facc15'
];

class ConfettiPiece {
  constructor(burst = false) { this.burst = burst; this.reset(); }
  reset() {
    this.x       = this.burst
      ? canvas.width / 2 + (Math.random() - 0.5) * 300
      : Math.random() * canvas.width;
    this.y       = this.burst ? canvas.height * 0.4 : -20;
    this.vy      = this.burst ? (Math.random() * -14 - 4) : (Math.random() * 3 + 2);
    this.vx      = (Math.random() - 0.5) * (this.burst ? 12 : 2);
    this.gravity = 0.25;
    this.w       = Math.random() * 10 + 4;
    this.h       = Math.random() * 5  + 3;
    this.color   = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.angle   = Math.random() * Math.PI * 2;
    this.spin    = (Math.random() - 0.5) * 0.14;
    this.opacity = Math.random() * 0.5 + 0.5;
    this.life    = 1;
    this.decay   = this.burst ? (Math.random() * 0.008 + 0.005) : 0;
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

function burstConfetti(count = 180) {
  const burst = Array.from({ length: count }, () => new ConfettiPiece(true));
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

/* ============================================================
   3. FLOATING PARTICLES
   ============================================================ */

const PARTICLE_COLORS = ['#a855f7','#f472b6','#fb923c','#2dd4bf','#d8b4fe','#facc15'];
const particleContainer = document.getElementById('floatParticles');

function spawnParticles(count = 24) {
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
spawnParticles(24);

/* ============================================================
   4. COUNTDOWN ENGINE
   ============================================================ */

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
        el.textContent     = s;
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

['days','hours','minutes','seconds'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.style.transition = 'transform 0.25s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease';
});

/* ============================================================
   5. MUSIC BUTTON
   ============================================================ */

const musicBtn  = document.getElementById('musicBtn');
const musicIcon = document.getElementById('musicIcon');
const NOTE_EMOJIS = ['🎵','🎶','♪','♫','🎼'];

function spawnNoteParticle() {
  if (!musicBtn) return;
  const rect = musicBtn.getBoundingClientRect();
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const el = document.createElement('span');
      el.className   = 'note-particle';
      el.textContent = NOTE_EMOJIS[Math.floor(Math.random() * NOTE_EMOJIS.length)];
      el.style.left  = (rect.left + Math.random() * rect.width) + 'px';
      el.style.top   = (rect.top - 10) + 'px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2100);
    }, i * 120);
  }
}

function setMusicPlaying(playing) {
  isPlaying = playing;
  if (playing) {
    musicIcon.textContent = '🔊';
    musicBtn.classList.add('playing');
  } else {
    musicIcon.textContent = '🎵';
    musicBtn.classList.remove('playing');
  }
}

musicBtn.addEventListener('click', () => {
  if (isPlaying) {
    fadeOut();
    setMusicPlaying(false);
  } else {
    fadeIn();
    setMusicPlaying(true);
    spawnNoteParticle();
  }
});

/* ============================================================
   6. AUTO-PLAY ON FIRST INTERACTION
   ============================================================ */

function startMusicOnFirstInteraction() {
  if (isPlaying) return;
  setMusicPlaying(true);
  fadeIn();
  spawnNoteParticle();
}

bgAudio.play()
  .then(() => {
    setMusicPlaying(true);
    bgAudio.volume = 0;
    fadeIn();
  })
  .catch(() => {
    const handler = () => {
      startMusicOnFirstInteraction();
      document.removeEventListener('click',      handler);
      document.removeEventListener('touchstart', handler);
    };
    document.addEventListener('click',      handler, { once: true });
    document.addEventListener('touchstart', handler, { once: true });
  });

/* ============================================================
   7. INTRO → MAIN TRANSITION
   ============================================================ */

const introScreen = document.getElementById('introScreen');
const introBtn    = document.getElementById('introBtn');
const mainPage    = document.getElementById('mainPage');

function openInvitation() {
  introBtn.disabled = true;

  if (!isPlaying) {
    setMusicPlaying(true);
    fadeIn();
  }

  introScreen.style.opacity   = '0';
  introScreen.style.transform = 'scale(0.92)';

  setTimeout(() => {
    introScreen.style.display = 'none';
    mainPage.classList.remove('hidden');
    burstConfetti(220);
    updateCountdown();
    setInterval(updateCountdown, 1000);
    initReveal();
  }, 700);
}

introBtn.addEventListener('click', openInvitation);

/* ============================================================
   8. INTERACTIVE TOAST NOTIFICATIONS
   ============================================================ */

const toastContainer = document.getElementById('toastContainer');

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ============================================================
   9. HEART WISH WALL / HEART EXPLOSION
   ============================================================ */

const sendHeartBtn = document.getElementById('sendHeartBtn');
const heartCountEl = document.getElementById('heartCount');
let currentHearts = 128;

const HEART_TYPES = ['❤️','💖','💕','✨','🌸','🌟','🎉'];

sendHeartBtn.addEventListener('click', (e) => {
  currentHearts++;
  heartCountEl.textContent = currentHearts;

  // Spawn floating hearts
  const rect = sendHeartBtn.getBoundingClientRect();
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const heart = document.createElement('div');
      heart.className = 'floating-heart-anim';
      heart.textContent = HEART_TYPES[Math.floor(Math.random() * HEART_TYPES.length)];
      heart.style.left = (rect.left + Math.random() * rect.width) + 'px';
      heart.style.top = (rect.top + Math.random() * rect.height) + 'px';
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 1800);
    }, i * 90);
  }

  showToast('💖 Cảm ơn bạn đã gửi lời chúc tốt đẹp!');
});

/* ============================================================
   10. RSVP MODAL & QUICK ACTIONS
   ============================================================ */

const rsvpModal      = document.getElementById('rsvpModal');
const quickRsvpBtn   = document.getElementById('quickRsvpBtn');
const closeRsvpModal = document.getElementById('closeRsvpModal');
const rsvpForm       = document.getElementById('rsvpForm');
const quickShareBtn  = document.getElementById('quickShareBtn');

function openModal() {
  rsvpModal.classList.remove('hidden');
}

function closeModal() {
  rsvpModal.classList.add('hidden');
}

quickRsvpBtn.addEventListener('click', openModal);
closeRsvpModal.addEventListener('click', closeModal);

rsvpModal.addEventListener('click', (e) => {
  if (e.target === rsvpModal) closeModal();
});

rsvpForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('guestName').value.trim();
  closeModal();
  burstConfetti(150);
  showToast(`🎉 Cảm ơn <strong>${name}</strong> đã xác nhận tham dự!`);
  rsvpForm.reset();
});

// QUICK SHARE BUTTON
quickShareBtn.addEventListener('click', () => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href);
    showToast('📲 Đã sao chép liên kết thiệp! Hãy gửi cho bạn bè nhé.');
  } else {
    showToast('📲 Hãy copy đường dẫn trên thanh địa chỉ để chia sẻ nhé!');
  }
});

/* ============================================================
   11. REVEAL ON SCROLL
   ============================================================ */

function initReveal() {
  const targets = document.querySelectorAll(
    '.hero-section, .info-section, .timeline-section, .cd-section, .wish-section, .map-section, .quote-section, .site-footer'
  );
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i * 90) + 'ms';
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
