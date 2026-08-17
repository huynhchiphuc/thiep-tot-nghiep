/* ====================================================
   script.js – Graduation Invitation Interactive Logic
   ==================================================== */

/* ---------- Confetti ---------- */
const canvas = document.getElementById('confettiCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const CONFETTI_COLORS = [
  '#d4a843','#f0c96a','#e8a0b4','#5ab4c4','#ffffff',
  '#ffdd57','#ff6eb4','#a78bfa','#34d399'
];

class Confetti {
  constructor() { this.reset(true); }
  reset(initial = false) {
    this.x     = Math.random() * canvas.width;
    this.y     = initial ? Math.random() * canvas.height : -20;
    this.w     = Math.random() * 10 + 4;
    this.h     = Math.random() * 5  + 3;
    this.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    this.speed = Math.random() * 3 + 2;
    this.angle = Math.random() * Math.PI * 2;
    this.spin  = (Math.random() - 0.5) * 0.12;
    this.drift = (Math.random() - 0.5) * 1.5;
    this.opacity = Math.random() * 0.6 + 0.4;
  }
  update() {
    this.y     += this.speed;
    this.x     += this.drift;
    this.angle += this.spin;
    if (this.y > canvas.height + 20) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  }
}

let confettiPieces = [];
let confettiActive = false;

function startConfetti(duration = 5000) {
  confettiPieces = Array.from({ length: 120 }, () => new Confetti());
  confettiActive = true;
  setTimeout(() => { confettiActive = false; }, duration);
  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiPieces.forEach(c => { c.update(); c.draw(); });
  if (confettiActive || confettiPieces.some(c => c.y < canvas.height)) {
    requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/* ---------- Petals ---------- */
const PETAL_EMOJIS = ['🌸','🌺','⭐','✨','🌟','💛','🏵️'];
const petalsContainer = document.getElementById('petals');

function spawnPetals(count = 18) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'petal';
    el.textContent = PETAL_EMOJIS[Math.floor(Math.random() * PETAL_EMOJIS.length)];
    el.style.left     = Math.random() * 100 + 'vw';
    el.style.fontSize = (Math.random() * 0.9 + 0.5) + 'rem';
    const dur = Math.random() * 8 + 6;
    const del = Math.random() * 10;
    el.style.animationDuration = dur + 's';
    el.style.animationDelay    = del + 's';
    petalsContainer.appendChild(el);
  }
}

/* ---------- Countdown ---------- */
const TARGET_DATE = new Date('2026-08-22T13:30:00+07:00');

function updateCountdown() {
  const now  = new Date();
  const diff = TARGET_DATE - now;

  if (diff <= 0) {
    document.getElementById('days').textContent    = '00';
    document.getElementById('hours').textContent   = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    return;
  }

  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000)  / 60000);
  const seconds = Math.floor((diff % 60000)    / 1000);

  const set = (id, val) => {
    const el = document.getElementById(id);
    const s  = String(val).padStart(2, '0');
    if (el.textContent !== s) {
      el.style.transform = 'translateY(-6px)';
      el.style.opacity   = '0';
      requestAnimationFrame(() => {
        el.textContent     = s;
        el.style.transform = 'translateY(0)';
        el.style.opacity   = '1';
      });
    }
  };

  set('days',    days);
  set('hours',   hours);
  set('minutes', minutes);
  set('seconds', seconds);
}

/* ---------- Envelope open ---------- */
function openEnvelope() {
  const scene    = document.getElementById('envelopeScene');
  const envelope = document.getElementById('envelope');
  const card     = document.getElementById('card');
  const flap     = envelope.querySelector('.envelope-flap');

  envelope.style.cursor = 'default';
  envelope.removeEventListener('click', openEnvelope);

  // Lift flap
  flap.style.transform = 'rotateX(-180deg)';

  setTimeout(() => {
    // Fade out envelope
    scene.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    scene.style.opacity    = '0';
    scene.style.transform  = 'scale(0.85)';
  }, 700);

  setTimeout(() => {
    scene.style.display = 'none';
    card.classList.remove('hidden');
    // Trigger confetti and petals
    startConfetti(6000);
    spawnPetals(24);
    // Start countdown
    updateCountdown();
    setInterval(updateCountdown, 1000);
    // Reveal animations
    initReveal();
  }, 1350);
}

document.getElementById('envelope').addEventListener('click', openEnvelope);

/* ---------- Intersection Observer reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll(
    '.info-card, .countdown-section, .quote-box, .map-btn'
  );
  els.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i * 80) + 'ms';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  els.forEach(el => observer.observe(el));
}

/* ---------- Touch / mobile: count-down digits transition ---------- */
document.querySelectorAll('.count-num').forEach(el => {
  el.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
});

/* ---------- Lazy fallback: if user doesn't click envelope after 12s ---------- */
// (removed to keep it interactive-only)
