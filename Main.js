/* ════════════════════════════
   Hero — mosaic reveal + check items
   ════════════════════════════ */
(function () {
  const el    = document.querySelector('.hero-title');
  const items = document.querySelectorAll('.check-item');
  if (!el) return;

  /* --- 建立每個 check-item 的 SVG + label --- */
  items.forEach(item => {
    const text = item.dataset.text;
    item.innerHTML = `
      <svg viewBox="0 0 18 18" class="check-svg">
        <polyline class="check-stroke" points="2,9 7,14 16,4"/>
      </svg>
      <span class="check-label">${text}</span>
    `;
  });

  /* --- 馬賽克隨機顯現 --- */
  const fullText = el.textContent.trim();

  /* 把每個字元包成 span */
  el.innerHTML = fullText.split('').map((ch, i) =>
    `<span class="mosaic-char" data-i="${i}">${ch}</span>`
  ).join('');

  const chars = Array.from(el.querySelectorAll('.mosaic-char'));

  /* 初始：全部模糊隱藏 */
  chars.forEach(c => {
    c.style.cssText = `
      display: inline-block;
      opacity: 0;
      filter: blur(12px);
      transform: scale(2);
      transition: none;
    `;
  });

  /* 隨機打亂順序 */
  const order = chars.map((_, i) => i).sort(() => Math.random() - 0.5);

  const TOTAL_MS  = 900;  /* 整體動畫時長 */
  const CHAR_MS   = 600;  /* 每個字元的 transition 時長 */
  const startTime = performance.now();

  function animateChecks() {
    let delay = 50;
    const GAP = 400;
    items.forEach(item => {
      setTimeout(() => item.classList.add('visible'), delay);
      delay += GAP;
    });
  }

  function revealChars(now) {
    const elapsed = now - startTime;
    order.forEach((charIdx, seq) => {
      const triggerAt = (seq / chars.length) * TOTAL_MS;
      if (elapsed >= triggerAt && chars[charIdx].style.opacity === '0') {
        chars[charIdx].style.cssText = `
          display: inline-block;
          opacity: 1;
          filter: blur(0px);
          transform: scale(1);
          transition: opacity ${CHAR_MS}ms ease, filter ${CHAR_MS}ms ease, transform ${CHAR_MS}ms ease;
        `;
      }
    });

    if (elapsed < TOTAL_MS + CHAR_MS) {
      requestAnimationFrame(revealChars);
    } else {
      /* 全部顯現後開始 check 動畫 */
      animateChecks();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(revealChars);
  });
})();


/* ════════════════════════════
   Team — Lottie animation (inline)
   ════════════════════════════ */
(function () {
  const container = document.getElementById('team-lottie');
  if (!container) return;

  

  function initLottie() {
    if (typeof lottie === 'undefined') {
      setTimeout(initLottie, 100);
      return;
    }
    lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: './assets/lottie/animation_team.json',
      rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet'
  }
});
  }

  initLottie();
})();


/* ════════════════════════════
   Products — GSAP Pin Stack
   ════════════════════════════ */
(function () {
  const initProductsPinStack = () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const cards = gsap.utils.toArray('.card-item');
    if (!cards.length) return;

    cards.forEach((card, index) => {
      gsap.set(card, {
        zIndex: index + 1,
        scale: index === 0 ? 1 : 0.92,
        opacity: index === 0 ? 1 : 0,
        yPercent: index === 0 ? 0 : 8
      });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.products-pin-wrap',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        pin: '.stack-container',
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    cards.forEach((card, index) => {
      if (index === cards.length - 1) return;

      const nextCard = cards[index + 1];

      tl.to(card, {
        scale: 0.88,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      }, index);

      tl.to(nextCard, {
        scale: 1,
        opacity: 1,
        yPercent: 0,
        duration: 1,
        ease: 'power2.out'
      }, index);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductsPinStack);
  } else {
    initProductsPinStack();
  }
})();


(function () {
  const items = document.querySelectorAll('.nav-item');

  items.forEach(item => {
    let closeTimer = null;

    function open()  {
      clearTimeout(closeTimer);
      items.forEach(i => i !== item && i.classList.remove('open'));
      item.classList.add('open');
    }
    function scheduleClose() {
      closeTimer = setTimeout(() => item.classList.remove('open'), 120);
    }

    /* trigger (span) */
    const trigger = item.querySelector('.nav-item-trigger');
    trigger.addEventListener('mouseenter', open);
    trigger.addEventListener('mouseleave', scheduleClose);

    /* dropdown */
    const dropdown = item.querySelector('.nav-dropdown');
    dropdown.addEventListener('mouseenter', () => { clearTimeout(closeTimer); });
    dropdown.addEventListener('mouseleave', scheduleClose);
  });

  /* 點擊頁面其他地方關閉 */
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-item')) {
      items.forEach(i => i.classList.remove('open'));
    }
  });
})();



(function () {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H;
  const particles = [];
  const COUNT    = 90;
  const MAX_DIST = 130;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function rand(a, b) { return a + Math.random() * (b - a); }

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x:     rand(0, W || window.innerWidth),
      y:     rand(0, H || window.innerHeight),
      vx:    rand(-0.25, 0.25),
      vy:    rand(-0.25, 0.25),
      r:     rand(1.5, 3.5),
      alpha: rand(0.3, 0.8),
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${0.18 * (1 - d / MAX_DIST)})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
})();


/* ════════════════════════════
   Phone — float + mouse-follow + 3D tilt
   ════════════════════════════ */
(function () {
  const phone  = document.getElementById('phone-mockup');
  const visual = phone.parentElement;   /* .hero-visual */
  const hero   = document.querySelector('.hero');

  /* 套上 perspective，讓子元素的 rotateX/Y 產生真實透視感 */
  visual.style.perspective         = '800px';
  visual.style.perspectiveOrigin   = '50% 50%';
  phone.style.transformStyle       = 'preserve-3d';

  let tgtTX = 0, tgtTY = 0;   /* 目標平移 px */
  let tgtRX = 0, tgtRY = 0;   /* 目標旋轉 deg */
  let curTX = 0, curTY = 0;
  let curRX = 0, curRY = 0;

  const TRANSLATE_MAX = 18;   /* 最大平移量 px */
  const ROTATE_MAX    = 12;   /* 最大旋轉角 deg（Z 感） */
  const FLOAT_AMP     = 10;   /* 浮動振幅 px */
  const FLOAT_SPEED   = 0.0008;
  const EASE          = 0.07;

  hero.addEventListener('mousemove', e => {
    const r  = hero.getBoundingClientRect();
    /* 正規化 -1 ~ +1 */
    const nx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    const ny = (e.clientY - r.top  - r.height / 2) / (r.height / 2);

    tgtTX =  nx * TRANSLATE_MAX;
    tgtTY =  ny * TRANSLATE_MAX;
    /* rotateY：左右傾斜；rotateX：上下傾斜（符號反轉讓效果符合直覺） */
    tgtRY =  nx * ROTATE_MAX;
    tgtRX = -ny * ROTATE_MAX;
  });

  hero.addEventListener('mouseleave', () => {
    tgtTX = tgtTY = tgtRX = tgtRY = 0;
  });

  /* 行動裝置陀螺儀 */
  window.addEventListener('deviceorientation', e => {
    if (e.gamma === null) return;
    const nx = Math.max(-1, Math.min(1, e.gamma / 30));
    const ny = Math.max(-1, Math.min(1, (e.beta - 40) / 30));
    tgtTX =  nx * TRANSLATE_MAX;
    tgtTY =  ny * TRANSLATE_MAX;
    tgtRY =  nx * ROTATE_MAX;
    tgtRX = -ny * ROTATE_MAX;
  });

  function tick(timestamp) {
    const floatT = timestamp * FLOAT_SPEED;
    const floatY = Math.sin(floatT)        * FLOAT_AMP;
    const floatX = Math.sin(floatT * 0.7) * (FLOAT_AMP * 0.4);

    /* 緩動插值 */
    curTX += (tgtTX - curTX) * EASE;
    curTY += (tgtTY - curTY) * EASE;
    curRX += (tgtRX - curRX) * EASE;
    curRY += (tgtRY - curRY) * EASE;

    phone.style.transform = [
      `translate(${curTX + floatX}px, ${curTY + floatY}px)`,
      `rotateY(${curRY}deg)`,
      `rotateX(${curRX}deg)`,
    ].join(' ');

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();


/* ════════════════════════════
   Scroll reveal
   ════════════════════════════ */
(function () {
  const els = document.querySelectorAll('.reveal');
  const io  = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => io.observe(el));
})();
/* ════════════════════════════
   Team stats — 數字滾動動畫
   ════════════════════════════ */
(function () {
  const counters = document.querySelectorAll('.count');
  if (!counters.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      const duration = 1200;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
        el.textContent = Math.round(ease * target);
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
})();

/* ════════════════════════════
   漢堡選單
   ════════════════════════════ */
(function () {
  const hamburger = document.getElementById('hamburger');
  const menu      = document.getElementById('mobile-menu');
  if (!hamburger || !menu) return;

  function openMenu() {
    hamburger.classList.add('is-open');
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    hamburger.classList.remove('is-open');
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    menu.querySelectorAll('.mobile-nav-dropdown.is-expanded').forEach(d => {
      d.classList.remove('is-expanded');
      d.querySelector('.mobile-nav-trigger')?.setAttribute('aria-expanded', 'false');
    });
  }
  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  menu.querySelectorAll('.mobile-nav-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const dropdown  = trigger.closest('.mobile-nav-dropdown');
      const expanding = !dropdown.classList.contains('is-expanded');
      menu.querySelectorAll('.mobile-nav-dropdown.is-expanded').forEach(d => {
        d.classList.remove('is-expanded');
        d.querySelector('.mobile-nav-trigger')?.setAttribute('aria-expanded', 'false');
      });
      if (expanding) {
        dropdown.classList.add('is-expanded');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
})();


/* ════════════════════════════
   Team orbit — 圓點動畫
   ════════════════════════════ */
(function () {
  const svg = document.getElementById('team-orbit-svg');
  if (!svg) return;

  const CX = 190, CY = 195, R = 120;
  const SPEED = 0.00025;
  const FADE_RANGE = 18;
  const TRAIL = [0, -12, -22, -30];
  const TRAIL_OPA = [1, 0.45, 0.2, 0.08];
  const NODE_ANGLES = [-90, -30, 30, 90, 150, 210];

  function angleDiff(a, b) {
    let d = ((b - a) % 360 + 360) % 360;
    return d > 180 ? d - 360 : d;
  }
  function getOpacity(deg) {
    for (const na of NODE_ANGLES) {
      const diff = Math.abs(angleDiff(deg, na));
      if (diff < FADE_RANGE) {
        const t = diff / FADE_RANGE;
        const s = Math.max(0, (t - 0.3) / 0.7);
        return s * s * (3 - 2 * s);
      }
    }
    return 1;
  }
  function posAt(deg) {
    const rad = deg * Math.PI / 180;
    return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
  }
  function setDot(prefix, angle) {
    const opa = getOpacity(angle);
    for (let i = 0; i < 4; i++) {
      const el = document.getElementById(`torbit-${prefix}-${i}`);
      if (!el) return;
      const p = posAt(angle + TRAIL[i]);
      el.setAttribute('cx', p.x);
      el.setAttribute('cy', p.y);
      el.setAttribute('opacity', (TRAIL_OPA[i] * opa).toFixed(3));
    }
  }
  function loop(ts) {
    const deg = (ts * SPEED * 180 / Math.PI) % 360;
    setDot('a', -90 + deg);
    setDot('b',  30 + deg);
    setDot('c', 150 + deg);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();


/* ════════════════════════════
   Team orbit — 圓點動畫
   ════════════════════════════ */
(function () {
  if (!document.getElementById('team-orbit-svg')) return;
  const CX=190,CY=195,R=120,SPEED=0.00025,FADE_RANGE=18;
  const TRAIL=[0,-12,-22,-30], TRAIL_OPA=[1,0.45,0.2,0.08];
  const NODE_ANGLES=[-90,-30,30,90,150,210];
  function angleDiff(a,b){let d=((b-a)%360+360)%360;return d>180?d-360:d;}
  function getOpacity(deg){
    for(const na of NODE_ANGLES){
      const diff=Math.abs(angleDiff(deg,na));
      if(diff<FADE_RANGE){const t=diff/FADE_RANGE,s=Math.max(0,(t-0.3)/0.7);return s*s*(3-2*s);}
    }
    return 1;
  }
  function posAt(deg){const r=deg*Math.PI/180;return{x:CX+R*Math.cos(r),y:CY+R*Math.sin(r)};}
  function setDot(p,angle){
    const opa=getOpacity(angle);
    for(let i=0;i<4;i++){
      const el=document.getElementById(`torbit-${p}-${i}`);
      if(!el)return;
      const pos=posAt(angle+TRAIL[i]);
      el.setAttribute('cx',pos.x);el.setAttribute('cy',pos.y);
      el.setAttribute('opacity',(TRAIL_OPA[i]*opa).toFixed(3));
    }
  }
  function loop(ts){
    const deg=(ts*SPEED*180/Math.PI)%360;
    setDot('a',-90+deg);setDot('b',30+deg);setDot('c',150+deg);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();