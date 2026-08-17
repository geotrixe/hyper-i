/* Wires the testimonials slider's existing Prev/Next/dot markup to native
   scroll behavior. The saved page expects Slick.js to drive this carousel,
   but that library never runs here — css/enhance.css turns the track into a
   horizontal scroll-snap strip, and this file makes the controls work it. */
(() => {
  'use strict';

  const sliders = document.querySelectorAll('.testimonials__slider.slick-slider');

  sliders.forEach((slider) => {
    const list = slider.querySelector('.slick-list');
    const track = slider.querySelector('.slick-track');
    if (!list || !track) return;

    const realSlides = [...track.children].filter((el) => !el.classList.contains('slick-cloned'));
    if (!realSlides.length) return;

    const prevBtn = slider.querySelector('.slick-prev');
    const nextBtn = slider.querySelector('.slick-next');
    const dots = [...slider.querySelectorAll('.slick-dots > li')];

    function step() {
      const style = getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
      return realSlides[0].getBoundingClientRect().width + gap;
    }

    function scrollByStep(direction) {
      list.scrollBy({ left: direction * step(), behavior: 'smooth' });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => scrollByStep(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollByStep(1));

    dots.forEach((dot, index) => {
      const button = dot.querySelector('button');
      if (!button) return;
      button.disabled = false;
      button.addEventListener('click', () => {
        const target = realSlides[index];
        if (!target) return;
        list.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: 'smooth' });
      });
    });

    function syncActiveDot() {
      if (!dots.length) return;
      const listLeft = list.getBoundingClientRect().left;
      let closestIndex = 0;
      let closestDelta = Infinity;

      realSlides.forEach((slideEl, index) => {
        const delta = Math.abs(slideEl.getBoundingClientRect().left - listLeft);
        if (delta < closestDelta) {
          closestDelta = delta;
          closestIndex = index;
        }
      });

      dots.forEach((dot, index) => dot.classList.toggle('slick-active', index === closestIndex));
    }

    let ticking = false;
    list.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          syncActiveDot();
        });
      },
      { passive: true }
    );

    syncActiveDot();
  });
})();
