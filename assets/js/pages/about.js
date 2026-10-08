/* About has its own motion scope; shared header behavior stays in main.js. */
(() => {
  const page = document.querySelector('.about-page');
  if (!page) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const refresh = () => { window.AOS?.refresh(); window.ScrollTrigger?.refresh(); };
  const values = [...page.querySelectorAll('.about-value-list details')];
  page.querySelectorAll('details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (detail.open && values.includes(detail)) {
        values.forEach(other => { if (other !== detail) other.open = false; });
      }
      const body = detail.querySelector(':scope > div, :scope > p');
      if (body && detail.open && window.gsap && !reduced.matches) {
        window.gsap.fromTo(body, { y: 5, opacity: .8 }, { y: 0, opacity: 1, duration: .24, overwrite: true, clearProps: 'transform,opacity' });
      }
      requestAnimationFrame(refresh);
    });
  });
  reduced.addEventListener('change', refresh);
  document.fonts?.ready.then(refresh);
  window.addEventListener('load', refresh, { once: true });
  if (!window.gsap || !window.ScrollTrigger) return;
  window.gsap.registerPlugin(window.ScrollTrigger);
  const media = window.gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    window.gsap.fromTo('.about-hero__copy > *', { y: 18 }, { y: 0, duration: .7, stagger: .07, ease: 'power3.out', clearProps: 'transform' });
    window.gsap.fromTo('.about-hero__visual', { y: 24 }, { y: 0, duration: 1, ease: 'power3.out', clearProps: 'transform' });
    page.querySelectorAll('[data-about-image]').forEach(image => {
      window.gsap.fromTo(image, { y: 22 }, { y: 0, duration: .85, clearProps: 'transform', ease: 'power2.out', scrollTrigger: { trigger: image, start: 'top 90%', once: true } });
    });
    window.gsap.fromTo('.about-closing__rings', { y: 18 }, { y: -18, ease: 'none', scrollTrigger: { trigger: '.about-closing', start: 'top bottom', end: 'bottom top', scrub: .65 } });
  });
})();
