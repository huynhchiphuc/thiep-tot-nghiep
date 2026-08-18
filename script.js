/* ============================================================
   script.js – Ultra-Luxury Invitation Logic
   ============================================================ */

/* ============================================================
   1. MP3 PLAYER
   ============================================================ */

const bgAudio  = new Audio('nhac_nen.mp3');
bgAudio.loop   = true;
bgAudio.preload = 'auto';
bgAudio.volume = 0.55; // Set volume trực tiếp (iOS Safari không hỗ trợ thay đổi volume qua JS)

let isPlaying = false;

function fadeIn(targetVol = 0.55, duration = 1000) {
  try {
    bgAudio.volume = targetVol;
  } catch (e) {}
  bgAudio.play().then(() => {
    isPlaying = true;
    setMusicPlaying(true);
  }).catch(() => {});
}

function fadeOut(duration = 500) {
  bgAudio.pause();
  isPlaying = false;
  setMusicPlaying(false);
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
  bgAudio.play().then(() => {
    isPlaying = true;
    setMusicPlaying(true);
    spawnNoteParticle();
  }).catch(() => {});
}

// Unlock audio on any touch/click event on mobile
const unlockAudioHandler = () => {
  startMusicOnFirstInteraction();
  document.removeEventListener('click',       unlockAudioHandler);
  document.removeEventListener('touchstart',  unlockAudioHandler);
  document.removeEventListener('pointerdown', unlockAudioHandler);
};

document.addEventListener('click',       unlockAudioHandler, { once: true });
document.addEventListener('touchstart',  unlockAudioHandler, { once: true });
document.addEventListener('pointerdown', unlockAudioHandler, { once: true });

/* ============================================================
   7. INTRO → MAIN TRANSITION
   ============================================================ */

const introScreen = document.getElementById('introScreen');
const introBtn    = document.getElementById('introBtn');
const mainPage    = document.getElementById('mainPage');

function openInvitation() {
  introBtn.disabled = true;

  startMusicOnFirstInteraction();

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
introBtn.addEventListener('touchstart', openInvitation, { passive: true });

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
   9. GOOGLE SHEETS & LIVE PUBLIC WISH WALL FEED
   ============================================================ */

// Google Sheet WebApp URL của Huỳnh Chí Phúc
const GOOGLE_SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxCI9RbDNbiOL1XKQbWqQBDWCCwu1GE87RdWvlqvuOSJxC9-R-By5n0V51OlBrtDz0F/exec';

// Default sample wishes for public wall
const DEFAULT_WISHES = [
  { name: 'Hội Bạn Thân 🎓', tag: 'Chắc chắn đến 🎉', msg: 'Chúc Tân kỹ sư Huỳnh Chí Phúc luôn gặt hái được nhiều thành công rực rỡ!', time: 'Vừa xong' },
  { name: 'Anh Chị Đồng Nghiệp ✨', tag: 'Sẽ cố gắng xếp lịch ✨', msg: 'Chúc mừng Phúc đã hoàn thành xuất sắc chặng đường Đại Học Nam Cần Thơ nhé!', time: '10 phút trước' },
  { name: 'Bạn Cùng Lớp DNC 🌟', tag: 'Gửi chúc từ xa 💖', msg: 'Chúc Phúc luôn giữ ngọn lửa đam mê và tự tin chạm tới mọi mục tiêu!', time: '1 giờ trước' }
];

// Default sample hearts for public heart wall
const DEFAULT_HEARTS = [
  { name: 'Minh Anh', count: 12, time: '5 phút trước' },
  { name: 'Tuấn Kiệt', count: 8, time: '12 phút trước' },
  { name: 'Bảo Ngọc', count: 15, time: '30 phút trước' },
  { name: 'Hoàng Nam', count: 6, time: '1 giờ trước' },
  { name: 'Thùy Trang', count: 10, time: '2 giờ trước' }
];

// Load stored wishes or use default
function getStoredWishes() {
  const localData = localStorage.getItem('hcp_wishes_feed');
  if (localData) {
    try { return JSON.parse(localData); } catch(e) {}
  }
  return DEFAULT_WISHES;
}

// Load stored heart droppers or use default
function getStoredHearts() {
  const localData = localStorage.getItem('hcp_hearts_feed');
  if (localData) {
    try { return JSON.parse(localData); } catch(e) {}
  }
  return DEFAULT_HEARTS;
}

function renderWishFeed() {
  const feedList = document.getElementById('wishFeedList');
  const feedCount = document.getElementById('wishFeedCount');
  if (!feedList) return;

  const rawWishes = getStoredWishes();
  // Lọc nghiêm ngặt: Chỉ lấy các LỜI CHÚC VIẾT TAY (Loại bỏ thả tim)
  const wishes = rawWishes.filter(w => {
    const tag = (w.tag || w.attending || '');
    const msg = (w.msg || w.message || '');
    return !tag.includes('Thả tim') && !msg.includes('Đã thả tim');
  });

  if (feedCount) feedCount.textContent = wishes.length;

  feedList.innerHTML = wishes.map(w => `
    <div class="feed-card">
      <div class="feed-card-header">
        <span class="feed-author">✨ ${escapeHtml(w.name)}</span>
        <div class="feed-header-right">
          ${w.tag ? `<span class="feed-tag">${escapeHtml(w.tag)}</span>` : ''}
          <span class="feed-time">${escapeHtml(w.time || 'Vừa xong')}</span>
        </div>
      </div>
      <div class="feed-body">${escapeHtml(w.msg)}</div>
    </div>
  `).join('');
}

function renderHeartsFeed() {
  const heartList  = document.getElementById('heartFeedList');
  const heartCount = document.getElementById('heartFeedCount');
  if (!heartList) return;

  const localHearts = getStoredHearts();
  
  // Trích xuất các lượt thả tim từ Google Sheet sync (nếu có)
  const rawWishes = getStoredWishes();
  const sheetHearts = rawWishes.filter(w => {
    const tag = (w.tag || w.attending || '');
    const msg = (w.msg || w.message || '');
    return tag.includes('Thả tim') || msg.includes('Đã thả tim');
  }).map(w => ({ name: w.name, count: 1, time: w.time || 'Vừa xong' }));

  // Hợp nhất danh sách thả tim & cộng dồn số lượng tim của người cùng tên
  const hearts = [];
  [...localHearts, ...sheetHearts].forEach(sh => {
    const sName = (sh.name || '').trim();
    if (!sName) return;
    const existing = hearts.find(h => h.name.toLowerCase() === sName.toLowerCase());
    if (existing) {
      existing.count = Math.max(existing.count || 1, sh.count || 1);
    } else {
      hearts.push({
        name: sName,
        count: sh.count || 1,
        time: sh.time || 'Vừa xong'
      });
    }
  });

  if (heartCount) heartCount.textContent = hearts.length;

  heartList.innerHTML = hearts.map(h => `
    <div class="heart-user-card">
      <span class="heart-user-avatar">💖</span>
      <div class="heart-user-info">
        <div class="heart-user-header">
          <strong class="heart-user-name">${escapeHtml(h.name)}</strong>
          <span class="heart-user-cnt">(${h.count || 1} ❤️)</span>
        </div>
        <small class="heart-user-time">${escapeHtml(h.time || 'Vừa xong')}</small>
      </div>
    </div>
  `).join('');
}

// Render both feeds on start
renderWishFeed();
renderHeartsFeed();

// Tab switcher logic
const tabWishesBtn = document.getElementById('tabWishesBtn');
const tabHeartsBtn = document.getElementById('tabHeartsBtn');
const panelWishes  = document.getElementById('panelWishes');
const panelHearts  = document.getElementById('panelHearts');

if (tabWishesBtn && tabHeartsBtn) {
  tabWishesBtn.addEventListener('click', () => {
    tabWishesBtn.classList.add('active');
    tabHeartsBtn.classList.remove('active');
    panelWishes.classList.remove('hidden');
    panelWishes.classList.add('active');
    panelHearts.classList.add('hidden');
    panelHearts.classList.remove('active');
  });

  tabHeartsBtn.addEventListener('click', () => {
    tabHeartsBtn.classList.add('active');
    tabWishesBtn.classList.remove('active');
    panelHearts.classList.remove('hidden');
    panelHearts.classList.add('active');
    panelWishes.classList.add('hidden');
    panelWishes.classList.remove('active');
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function addNewHeartUser(name) {
  const cleanName = (name || '').trim().slice(0, 60) || 'Người bạn giấu tên';
  const hearts = getStoredHearts();
  
  // Tự động gộp lượt thả tim nếu trùng tên
  const existingIdx = hearts.findIndex(h => h.name.trim().toLowerCase() === cleanName.toLowerCase());
  if (existingIdx !== -1) {
    hearts[existingIdx].count = (hearts[existingIdx].count || 1) + 1;
    hearts[existingIdx].time = 'Vừa xong';
    const updated = hearts.splice(existingIdx, 1)[0];
    hearts.unshift(updated);
  } else {
    hearts.unshift({
      name: cleanName,
      count: 1,
      time: 'Vừa xong'
    });
  }

  localStorage.setItem('hcp_hearts_feed', JSON.stringify(hearts));
  renderHeartsFeed();

  // Send heart reaction to Google Sheet
  sendDataToGoogleSheet({
    name: cleanName,
    attending: 'Thả tim ❤️',
    message: `Đã thả tim chúc mừng! (Tổng số tim: ${currentHearts})`,
    timestamp: new Date().toLocaleString('vi-VN')
  });
}

function addNewWish(name, msg, attendingStatus = 'Gửi chúc từ xa 💖', isPublic = true) {
  // Sanitize & truncate inputs
  const cleanName = (name || '').trim().slice(0, 60);
  const cleanMsg  = (msg || '').trim().slice(0, 300);

  // If public, append to public Wish Feed on website
  if (isPublic) {
    const wishes = getStoredWishes();
    const newWish = {
      name: cleanName || 'Người bạn giấu tên',
      tag: attendingStatus,
      msg: cleanMsg || 'Gửi lời chúc mừng thành công đến Huỳnh Chí Phúc! 🎓✨',
      time: 'Vừa xong'
    };
    wishes.unshift(newWish); // add to top
    localStorage.setItem('hcp_wishes_feed', JSON.stringify(wishes));
    renderWishFeed();
  }

  // Always send data to Google Sheet (marked if Private)
  sendDataToGoogleSheet({
    name: cleanName || 'Người bạn giấu tên',
    attending: attendingStatus,
    message: isPublic ? (cleanMsg || 'Gửi lời chúc tốt đẹp!') : `🔒 [RIÊNG TƯ] ${cleanMsg || 'Gửi lời chúc tốt đẹp!'}`,
    timestamp: new Date().toLocaleString('vi-VN')
  });
}

// Function to post data to Google Sheet WebApp safely
function sendDataToGoogleSheet(data) {
  if (!GOOGLE_SHEET_WEBAPP_URL) return;
  try {
    const payload = {
      name: String(data.name || '').slice(0, 80),
      attending: String(data.attending || '').slice(0, 50),
      message: String(data.message || '').slice(0, 400),
      timestamp: String(data.timestamp || '')
    };
    fetch(GOOGLE_SHEET_WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(() => {
      // Refresh global sync after sending
      setTimeout(fetchGlobalData, 1500);
    }).catch(err => console.log('Sheet sync status:', err));
  } catch(e) {}
}

// Function to fetch real-time global heart count and wishes from Google Sheet WebApp
function fetchGlobalData() {
  if (!GOOGLE_SHEET_WEBAPP_URL) return;
  fetch(GOOGLE_SHEET_WEBAPP_URL)
    .then(res => res.json())
    .then(data => {
      if (data && typeof data.hearts === 'number') {
        currentHearts = data.hearts;
        if (heartCountEl) heartCountEl.textContent = currentHearts;
        localStorage.setItem('hcp_hearts_count', currentHearts.toString());
      }
      if (data && Array.isArray(data.wishes) && data.wishes.length > 0) {
        localStorage.setItem('hcp_wishes_feed', JSON.stringify(data.wishes));
        renderWishFeed();
        renderHeartsFeed();
      }
    })
    .catch(err => {});
}

// Render feed & sync global data on page init
document.addEventListener('DOMContentLoaded', () => {
  renderWishFeed();
  renderHeartsFeed();
  fetchGlobalData();
  // Poll global sync every 12 seconds for live updates on all devices
  setInterval(fetchGlobalData, 12000);
});
renderWishFeed();
renderHeartsFeed();
fetchGlobalData();

/* ============================================================
   10. HEART WISH WALL / HEART EXPLOSION
   ============================================================ */

const sendHeartBtn = document.getElementById('sendHeartBtn');
const heartCountEl = document.getElementById('heartCount');
let currentHearts  = parseInt(localStorage.getItem('hcp_hearts_count') || '128', 10);
if (heartCountEl) heartCountEl.textContent = currentHearts;

const HEART_TYPES = ['❤️','💖','💕','✨','🌸','🌟','🎉'];

sendHeartBtn.addEventListener('click', (e) => {
  let guestName = localStorage.getItem('hcp_guest_name');
  if (!guestName) {
    const input = prompt('Nhập tên của bạn để Phúc biết ai đã thả tim chúc mừng nhé ❤️:');
    if (input === null) return; // Người dùng bấm Hủy
    guestName = input.trim() || 'Người bạn giấu tên';
    localStorage.setItem('hcp_guest_name', guestName);
  }

  currentHearts++;
  heartCountEl.textContent = currentHearts;
  localStorage.setItem('hcp_hearts_count', currentHearts.toString());

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

  showToast(`💖 Cảm ơn <strong>${escapeHtml(guestName)}</strong> đã thả tim chúc mừng!`);

  // Add to separate Heart Feed list & sync to Google Sheet
  addNewHeartUser(guestName);
});

/* ============================================================
   11. RSVP MODAL & QUICK ACTIONS
   ============================================================ */

const rsvpModal      = document.getElementById('rsvpModal');
const quickRsvpBtn   = document.getElementById('quickRsvpBtn');
const writeWishBtn   = document.getElementById('writeWishBtn');
const closeRsvpModal = document.getElementById('closeRsvpModal');
const rsvpForm       = document.getElementById('rsvpForm');
const quickShareBtn  = document.getElementById('quickShareBtn');

function openModal() {
  const guestNameInput = document.getElementById('guestName');
  if (guestNameInput && !guestNameInput.value) {
    guestNameInput.value = localStorage.getItem('hcp_guest_name') || '';
  }
  rsvpModal.classList.remove('hidden');
}

function closeModal() {
  rsvpModal.classList.add('hidden');
}

quickRsvpBtn.addEventListener('click', openModal);
if (writeWishBtn) writeWishBtn.addEventListener('click', openModal);
closeRsvpModal.addEventListener('click', closeModal);

rsvpModal.addEventListener('click', (e) => {
  if (e.target === rsvpModal) closeModal();
});

rsvpForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('guestName').value.trim();
  const msg  = document.getElementById('guestMsg').value.trim();

  if (name) {
    localStorage.setItem('hcp_guest_name', name);
  }

  const attendingRadio = document.querySelector('input[name="attending"]:checked');
  let attendingVal = 'Gửi chúc từ xa 💖';
  if (attendingRadio) {
    if (attendingRadio.value === 'yes') attendingVal = 'Chắc chắn đến 🎉';
    else if (attendingRadio.value === 'maybe') attendingVal = 'Sẽ cố gắng xếp lịch ✨';
    else attendingVal = 'Gửi chúc từ xa 💖';
  }

  const visibilityRadio = document.querySelector('input[name="visibility"]:checked');
  const isPublic = visibilityRadio ? (visibilityRadio.value === 'public') : true;

  // Add wish & sync to Google Sheet
  addNewWish(name, msg || 'Gửi lời chúc tốt đẹp nhất đến Phúc ngày tốt nghiệp! 🎓✨', attendingVal, isPublic);

  closeModal();
  burstConfetti(150);
  
  if (isPublic) {
    showToast(`🎉 Cảm ơn <strong>${escapeHtml(name)}</strong> đã gửi lời chúc mừng!`);
  } else {
    showToast(`🔒 Cảm ơn <strong>${escapeHtml(name)}</strong>! Lời chúc riêng tư đã được gửi đến Phúc.`);
  }

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
