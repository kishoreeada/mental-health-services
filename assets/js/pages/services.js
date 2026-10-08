/* Progressive enhancement only: navigation and disclosures work without JavaScript. */
(() => {
  const page = document.querySelector('.services-page');
  if (!page) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const refresh = () => { window.AOS?.refresh(); window.ScrollTrigger?.refresh(); };
  const exploration = [...page.querySelectorAll('.svc-explore details')];
  page.querySelectorAll('details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (detail.open && exploration.includes(detail)) {
        exploration.forEach(other => { if (other !== detail) other.open = false; });
      }
      const answer = detail.querySelector(':scope > div, :scope > p');
      if (detail.open && answer && window.gsap && !reduced.matches) {
        window.gsap.fromTo(answer, { y: 5, opacity: .8 }, { y: 0, opacity: 1, duration: .24, overwrite: true, clearProps: 'transform,opacity' });
      }
      requestAnimationFrame(refresh);
    });
  });
  document.fonts?.ready.then(refresh);
  window.addEventListener('load', refresh, { once: true });
  reduced.addEventListener('change', refresh);
  if (!window.gsap || !window.ScrollTrigger) return;
  window.gsap.registerPlugin(window.ScrollTrigger);
  const media = window.gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    window.gsap.fromTo('.svc-hero__copy > *', { y: 18 }, { y: 0, duration: .75, stagger: .07, ease: 'power3.out', clearProps: 'transform' });
    window.gsap.fromTo('.svc-directory > *', { y: 16 }, { y: 0, duration: .7, stagger: .055, ease: 'power3.out', clearProps: 'transform' });
    page.querySelectorAll('[data-svc-image]').forEach(image => {
      window.gsap.fromTo(image, { y: 22 }, { y: 0, duration: .85, clearProps: 'transform', ease: 'power2.out', scrollTrigger: { trigger: image, start: 'top 90%', once: true } });
    });
    page.querySelectorAll('.svc-contours, .svc-closing__art').forEach(art => {
      window.gsap.fromTo(art, { y: 16 }, { y: -16, ease: 'none', scrollTrigger: { trigger: art.parentElement, start: 'top bottom', end: 'bottom top', scrub: .65 } });
    });
  });
})();
