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
