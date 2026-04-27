/* ══════════════════════════════════════════════
   CERVEZA CUMBRES — script.js
   ══════════════════════════════════════════════ */

'use strict';

// ─── NAV scroll behaviour ───────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ─── Hamburger ──────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mm-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ─── Reveal on scroll (IntersectionObserver) ───────────────────────
const revealEls = document.querySelectorAll(
  '.beer-card, .testi-card, .stat, .historia-text-col, .historia-img-col, .statement-inner'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, 80 * i);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObs.observe(el));

// ─── Scroll video / canvas animation ────────────────────────────────
(function initScrollCanvas() {
  const section = document.getElementById('scroll-section');
  const canvas = document.getElementById('scrollCanvas');
  const ctx = canvas.getContext('2d');
  const scrollText = document.getElementById('scrollText');

  // Detectar si hay video o frames
  // Primero intentamos con VIDEO
  const useVideo = true; // Cambiar a false si se usan frames

  // ── OPCIÓN A: VIDEO ──────────────────────────────────────────────
  if (useVideo) {
    const video = document.createElement('video');
    video.src = 'imagenes/cerveza-scroll.mp4';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.loop = false;
    video.pause();

    let videoReady = false;
    let animFrame = null;
    let lastProgress = -1;

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawVideoCover() {
      if (!videoReady) return;
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      const scale = Math.max(cw / vw, ch / vh);
      const sw = vw * scale;
      const sh = vh * scale;
      const sx = (cw - sw) / 2;
      const sy = (ch - sh) / 2;

      ctx.clearRect(0, 0, cw, ch);

      // Fondo oscuro
      ctx.fillStyle = '#0E0D0B';
      ctx.fillRect(0, 0, cw, ch);

      ctx.drawImage(video, sx, sy, sw, sh);

      // Vignette overlay
      const gradient = ctx.createRadialGradient(cw/2, ch/2, ch*0.1, cw/2, ch/2, ch*0.85);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, cw, ch);
    }

    function onScroll() {
      if (!videoReady || !video.duration) return;

      const sectionTop = section.offsetTop;
      const sectionH = section.offsetHeight - window.innerHeight;
      const scrolled = window.scrollY - sectionTop;
      const progress = Math.max(0, Math.min(1, scrolled / sectionH));

      if (Math.abs(progress - lastProgress) < 0.001) return;
      lastProgress = progress;

      const targetTime = progress * video.duration;

      // Sincronizar currentTime con el scroll
      if (Math.abs(video.currentTime - targetTime) > 0.05) {
        video.currentTime = targetTime;
      }

      // Opacidad del texto según progreso
      const textOpacity = progress < 0.15 ? progress / 0.15 :
                          progress > 0.85 ? (1 - progress) / 0.15 : 1;
      scrollText.style.opacity = textOpacity;

      if (animFrame) cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(drawVideoCover);
    }

    video.addEventListener('loadedmetadata', () => {
      videoReady = true;
      resizeCanvas();
      drawVideoCover();
    });

    video.addEventListener('seeked', () => {
      if (animFrame) cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(drawVideoCover);
    });

    video.addEventListener('error', () => {
      // Si el video falla, mostrar fallback
      initFramesFallback();
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { resizeCanvas(); drawVideoCover(); });

    resizeCanvas();

    // Dibujar estado inicial
    ctx.fillStyle = '#0E0D0B';
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    ctx.fillRect(0, 0, cw, ch);

    // Texto de placeholder mientras carga
    ctx.fillStyle = 'rgba(232, 98, 26, 0.15)';
    ctx.fillRect(0, 0, cw, ch);
    return;
  }

  // ── OPCIÓN B: FRAMES ─────────────────────────────────────────────
  // (Fallback automático si no hay video)
  initFramesFallback();

  function initFramesFallback() {
    // Generar paths de frames (ajusta el total real)
    const TOTAL_FRAMES = 60; // Ajustar según los frames disponibles
    const FRAME_PREFIX = 'imagenes/frames/frame_';

    const frames = [];
    let loadedCount = 0;
    let framesReady = false;

    function pad(n, width) {
      return String(n).padStart(width, '0');
    }

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawFrameCover(img) {
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const sx = (cw - sw) / 2;
      const sy = (ch - sh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = '#0E0D0B';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, sx, sy, sw, sh);

      const gradient = ctx.createRadialGradient(cw/2, ch/2, ch*0.1, cw/2, ch/2, ch*0.85);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, cw, ch);
    }

    let lastFrameIdx = -1;
    let animFrame = null;

    function onScroll() {
      if (!framesReady) return;

      const sectionTop = section.offsetTop;
      const sectionH = section.offsetHeight - window.innerHeight;
      const scrolled = window.scrollY - sectionTop;
      const progress = Math.max(0, Math.min(1, scrolled / sectionH));

      const frameIdx = Math.min(
        Math.floor(progress * (frames.length - 1)),
        frames.length - 1
      );

      if (frameIdx === lastFrameIdx) return;
      lastFrameIdx = frameIdx;

      const textOpacity = progress < 0.15 ? progress / 0.15 :
                          progress > 0.85 ? (1 - progress) / 0.15 : 1;
      scrollText.style.opacity = textOpacity;

      if (animFrame) cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(() => drawFrameCover(frames[frameIdx]));
    }

    resizeCanvas();

    // Dibujar fondo mientras cargan
    ctx.fillStyle = '#0E0D0B';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // Precargar frames de forma progresiva
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const idx = i;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) framesReady = true;
        // Dibujar primer frame apenas esté listo
        if (idx === 1) { resizeCanvas(); drawFrameCover(img); }
      };
      img.src = `${FRAME_PREFIX}${pad(i, 4)}.jpg`;
      frames[i - 1] = img;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      resizeCanvas();
      if (frames[lastFrameIdx]) drawFrameCover(frames[lastFrameIdx]);
    });
  }

})();

// ─── Smooth parallax para hero ────────────────────────────────────────
(function heroParallax() {
  const heroImg = document.querySelector('.hero-img');
  if (!heroImg) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight * 1.5) {
          heroImg.style.transform = `scale(1) translateY(${scrolled * 0.25}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();
