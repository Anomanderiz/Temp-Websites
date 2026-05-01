
const canvas = document.getElementById('ambience');
const ctx = canvas.getContext('2d');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let width = 0;
let height = 0;
let particles = [];
let confetti = [];
let celebrationTimers = [];
const pointer = { x: innerWidth / 2, y: innerHeight / 2 };

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.width = Math.floor(innerWidth * ratio);
  height = canvas.height = Math.floor(innerHeight * ratio);
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  particles = Array.from({ length: Math.min(90, Math.floor(innerWidth / 14)) }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: 1.5 + Math.random() * 5.5,
    vy: .16 + Math.random() * .42,
    vx: -.18 + Math.random() * .36,
    a: .1 + Math.random() * .28,
    hue: Math.random() > .5 ? '255,255,255' : '231,164,167'
  }));
}

function drawHeart(x, y, size, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.beginPath();
  ctx.moveTo(0, .35);
  ctx.bezierCurveTo(-.9, -.35, -.9, -1.05, 0, -.72);
  ctx.bezierCurveTo(.9, -1.05, .9, -.35, 0, .35);
  ctx.fillStyle = `rgba(142,65,81,${alpha})`;
  ctx.fill();
  ctx.restore();
}

function animate() {
  if (prefersReduced) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  for (const p of particles) {
    p.x += p.vx + Math.sin((p.y + performance.now() * .02) * .01) * .12;
    p.y -= p.vy;
    if (p.y < -20) { p.y = innerHeight + 20; p.x = Math.random() * innerWidth; }
    if (p.x < -20) p.x = innerWidth + 20;
    if (p.x > innerWidth + 20) p.x = -20;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue},${p.a})`;
    ctx.fill();
  }

  for (let i = confetti.length - 1; i >= 0; i--) {
    const c = confetti[i];
    c.x += c.vx;
    c.y += c.vy;
    c.vy += .035;
    c.life -= 1;
    c.rot += c.spin;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    if (c.kind === 'heart') drawHeart(0, 0, c.size / 8, c.life / 110);
    else {
      ctx.fillStyle = `rgba(${c.colour},${Math.max(c.life / 110, 0)})`;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * .7);
    }
    ctx.restore();
    if (c.life <= 0 || c.y > innerHeight + 80) confetti.splice(i, 1);
  }

  requestAnimationFrame(animate);
}

function burst(x = innerWidth / 2, y = innerHeight * .45, count = 90, speedBoost = 1) {
  if (prefersReduced) return;
  const colours = ['142,65,81', '213,167,93', '255,255,255', '185,205,185', '231,164,167'];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (2 + Math.random() * 7) * speedBoost;
    confetti.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 5 + Math.random() * 10,
      rot: Math.random() * Math.PI,
      spin: -.15 + Math.random() * .3,
      life: 76 + Math.random() * 58,
      colour: colours[Math.floor(Math.random() * colours.length)],
      kind: Math.random() > .62 ? 'heart' : 'square'
    });
  }
}

function clearCelebrationTimers() {
  celebrationTimers.forEach((id) => clearTimeout(id));
  celebrationTimers = [];
}

function launchCelebration(event) {
  const x = event?.clientX ?? innerWidth / 2;
  const y = event?.clientY ?? innerHeight * .42;
  const dialog = document.getElementById('acceptDialog');
  const message = document.getElementById('acceptMessage');

  if (dialog && typeof dialog.show === 'function' && !dialog.open) {
    dialog.show();
  }
  document.body.classList.add('modal-open');

  if (message) {
    message.style.opacity = '0';
    message.style.transform = 'translateY(8px)';
    setTimeout(() => {
      message.textContent = 'The spa kingdom rejoices. Your appointment is booked, the oils await, and Din Tai Fung now feels cosmically inevitable.';
      message.style.opacity = '1';
      message.style.transform = 'translateY(0)';
    }, 120);
  }

  clearCelebrationTimers();
  document.body.classList.remove('celebrating');
  void document.body.offsetWidth;
  document.body.classList.add('celebrating');

  const bursts = [
    [x, y, 0, 1.2, 130],
    [innerWidth * .18, innerHeight * .26, 140, 1.15, 110],
    [innerWidth * .82, innerHeight * .24, 270, 1.15, 110],
    [innerWidth * .5, innerHeight * .16, 430, 1.35, 150],
    [innerWidth * .34, innerHeight * .58, 620, 1.1, 95],
    [innerWidth * .68, innerHeight * .62, 780, 1.1, 95],
    [innerWidth * .5, innerHeight * .48, 980, 1.25, 140]
  ];

  bursts.forEach(([bx, by, delay, boost, count]) => {
    celebrationTimers.push(setTimeout(() => burst(bx, by, count, boost), delay));
  });

  celebrationTimers.push(setTimeout(() => {
    document.body.classList.remove('celebrating');
  }, 1850));
}

window.addEventListener('resize', resize);
window.addEventListener('pointermove', (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .16 });

document.querySelectorAll('.reveal').forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index * 55, 360)}ms`;
  observer.observe(el);
});

for (const card of document.querySelectorAll('.tilt')) {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-5px)`;
  });
  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
}

for (const btn of document.querySelectorAll('.magnetic')) {
  btn.addEventListener('pointermove', (event) => {
    const rect = btn.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * .08}px, ${y * .14}px)`;
  });
  btn.addEventListener('pointerleave', () => {
    btn.style.transform = '';
  });
}

const moodText = document.getElementById('moodText');
const moodCopy = {
  candles: 'Candle-glow mode: honeyed light, soft shadows, and the moral necessity of relaxation.',
  rain: 'Rain mode: cool air, hush, and the feeling that the city has decided to whisper.',
  silk: 'Silk mode: warm blush tones, luminous calm, and a room behaving like a love letter.'
};

document.querySelectorAll('.mood').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.mood').forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
    document.body.classList.remove('rain', 'silk');
    const mood = button.dataset.mood;
    if (mood !== 'candles') document.body.classList.add(mood);
    moodText.textContent = moodCopy[mood];
  });
});

document.getElementById('acceptHero').addEventListener('click', launchCelebration);
document.getElementById('acceptFinal').addEventListener('click', launchCelebration);
document.getElementById('confettiAgain').addEventListener('click', launchCelebration);
document.getElementById('closeDialog').addEventListener('click', () => {
  clearCelebrationTimers();
  document.body.classList.remove('celebrating', 'modal-open');
  document.getElementById('acceptDialog').close();
});

document.getElementById('teaseNo').addEventListener('mouseenter', (event) => {
  const btn = event.currentTarget;
  const x = (Math.random() - .5) * 190;
  const y = (Math.random() - .5) * 90;
  btn.style.transform = `translate(${x}px, ${y}px) rotate(${(Math.random() - .5) * 10}deg)`;
});
document.getElementById('teaseNo').addEventListener('click', (event) => {
  event.currentTarget.textContent = 'Nice try. Yes?';
  burst(event.clientX, event.clientY, 90, 1.1);
});

const envelope = document.getElementById('envelope');
envelope.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    document.getElementById('ritual').scrollIntoView({ behavior: 'smooth' });
  }
});

resize();
requestAnimationFrame(animate);
setTimeout(() => burst(innerWidth / 2, innerHeight * .6, 100, 1.05), 1150);
