/* Native disclosures remain usable with no JavaScript or animation libraries. */
(() => {
  const sections = [...document.querySelectorAll('.finish-section, .finish-final')];
  if (!sections.length) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const steps = [...document.querySelectorAll('.finish-step')];
  const refresh = () => window.ScrollTrigger?.refresh();

  sections.forEach(section => {
    section.querySelectorAll('details').forEach(detail => {
      detail.addEventListener('toggle', () => {
        if (detail.open && detail.classList.contains('finish-step')) {
          // Also supports browsers that do not implement named details groups.
          steps.forEach(other => { if (other !== detail) other.open = false; });
        }
        if (detail.open && !motion.matches && window.gsap) {
          const body = detail.querySelector('.finish-step__body, p');
          if (body) window.gsap.fromTo(body, { y: 6, opacity: .75 }, {
            y: 0, opacity: 1, duration: .24, overwrite: true, clearProps: 'transform,opacity'
          });
        }
        requestAnimationFrame(refresh);
      });
    });
  });

  if (!window.gsap || !window.ScrollTrigger) return;
  window.gsap.registerPlugin(window.ScrollTrigger);
  const media = window.gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    sections.forEach(section => {
      section.querySelectorAll('[data-finish-reveal]').forEach(element => {
        // Keep text visible even if another script or the CDN fails mid-animation.
        window.gsap.fromTo(element, { y: 20 }, {
          y: 0, duration: .7, ease: 'power2.out', clearProps: 'transform',
          scrollTrigger: { trigger: element, start: 'top 94%', once: true }
        });
      });
    });
    window.gsap.fromTo('.finish-final__rings', { y: 22 }, {
      y: -22, ease: 'none', scrollTrigger: { trigger: '.finish-final', start: 'top bottom', end: 'bottom top', scrub: .6 }
    });
  });
  document.fonts?.ready.then(refresh);
  window.addEventListener('load', refresh, { once: true });
})();
