/* Hyper-i hero: scroll-scrubbed frame sequence + nav scroll state.
   Ported from hyper-i/index.html, with progressive loading so the first
   paint doesn't wait on all 240 frames. */
(() => {
  'use strict';

  const FRAME_COUNT = 240;
  const FRAME_PATH = (i) => `assets/hero-frames/frame_${String(i).padStart(4, '0')}.jpg`;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hero = document.getElementById('hxi-hero');
  const canvas = document.getElementById('hxi-hero-canvas');

  if (hero && canvas) {
    const stage = hero.querySelector('.hxi-hero__stage');
    const progressBar = hero.querySelector('.hxi-hero__progress-bar');
    const ctx = canvas.getContext('2d', { alpha: false });

    const frames = new Array(FRAME_COUNT);
    const loaded = new Array(FRAME_COUNT).fill(false);

    let currentFrame = -1;
    let ticking = false;
    let ready = false;

    const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const ratio = dpr();
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      currentFrame = -1;
      update();
    }

    // The exact frame may not have downloaded yet — fall back to the closest
    // one that has, so scrubbing never shows a blank stage.
    function nearestLoaded(index) {
      if (loaded[index]) return index;
      for (let offset = 1; offset < FRAME_COUNT; offset++) {
        if (index - offset >= 0 && loaded[index - offset]) return index - offset;
        if (index + offset < FRAME_COUNT && loaded[index + offset]) return index + offset;
      }
      return -1;
    }

    function draw(index) {
      const target = nearestLoaded(index);
      if (target < 0 || target === currentFrame) return;

      const img = frames[target];
      const cw = canvas.width;
      const ch = canvas.height;
      if (!cw || !ch || !img.naturalWidth) return;

      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;

      ctx.fillStyle = '#050608';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);

      currentFrame = target;

      if (!ready && stage) {
        ready = true;
        stage.classList.add('is-ready');
      }
    }

    function progress() {
      const scrollable = hero.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      const scrolled = -hero.getBoundingClientRect().top;
      return Math.min(1, Math.max(0, scrolled / scrollable));
    }

    function update() {
      const p = reduceMotion ? 0 : progress();
      draw(Math.min(FRAME_COUNT - 1, Math.floor(p * FRAME_COUNT)));

      if (progressBar) progressBar.style.width = `${p * 100}%`;
      hero.classList.toggle('is-scrubbing', p > 0.02);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    }

    function load(index) {
      if (frames[index]) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = FRAME_PATH(index);
      img.onload = () => {
        loaded[index] = true;
        if (!ready) {
          resize();
        } else {
          currentFrame = -1;
          update();
        }
      };
      frames[index] = img;
    }

    // Frame 0 first, then a coarse pass so early scrubbing is usable, then the
    // rest in the background.
    function loadSequence() {
      load(0);

      const coarse = [];
      for (let i = 8; i < FRAME_COUNT; i += 8) coarse.push(i);

      const rest = [];
      for (let i = 1; i < FRAME_COUNT; i++) {
        if (i % 8 !== 0) rest.push(i);
      }

      let queue = coarse.concat(rest);
      let cursor = 0;

      const pump = () => {
        const budget = 6;
        for (let n = 0; n < budget && cursor < queue.length; n++, cursor++) {
          load(queue[cursor]);
        }
        if (cursor < queue.length) setTimeout(pump, 120);
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(pump, { timeout: 600 });
      } else {
        setTimeout(pump, 300);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);

    resize();
    loadSequence();
  }

  // Nav gets a backdrop once the page has moved past the top of the hero.
  const nav = document.querySelector('.nav');
  if (nav) {
    let navTicking = false;
    const syncNav = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener(
      'scroll',
      () => {
        if (navTicking) return;
        navTicking = true;
        requestAnimationFrame(() => {
          navTicking = false;
          syncNav();
        });
      },
      { passive: true }
    );
    syncNav();
  }
})();
