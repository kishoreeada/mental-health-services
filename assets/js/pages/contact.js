/* Demo only: validation in memory, no requests or persistence. Valid -> 404. */
(() => {
  'use strict';
  const page = document.querySelector('.contact-page');
  const form = document.getElementById('enquiryForm');
  if (!page || !form) return;
  const fields = ['name', 'email', 'phone', 'topic', 'message', 'consent'];
  const controls = Object.fromEntries(fields.map(key => [key, document.getElementById(`enquiry-${key}`)]));
  const summary = document.getElementById('enquiry-errors');
  const submit = document.getElementById('enquiry-submit');
  const touched = new Set();
  let attempted = false, navigating = false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const refresh = () => { window.AOS?.refresh(); window.ScrollTrigger?.refresh(); };

  function errorFor(key) {
    const input = controls[key], value = input.value.trim();
    switch (key) {
      case 'name':
        if (!value) return 'Enter the name you go by.';
        if (!/\p{L}/u.test(value)) return 'Include at least one letter in your name.';
        if (value.length > 100) return 'Keep your name to 100 characters or fewer.';
        return '';
      case 'email':
        if (!value) return 'Enter an email address.';
        if (input.validity.typeMismatch || value.length > 254 || /\s/.test(value)) return 'Enter a valid email address, such as you@example.com.';
        return '';
      case 'phone':
        if (!value) return '';
        if (!/^\+?[\d\s().-]+$/.test(value) || (value.match(/\d/g) || []).length < 7 || (value.match(/\d/g) || []).length > 15 || value.length > 30) return 'Use 7–15 digits, with an optional +, spaces, brackets or hyphens—or leave this blank.';
        return '';
      case 'topic': return ['general', 'appointment', 'workplace'].includes(value) ? '' : 'Choose an enquiry type.';
      case 'message':
        if (!value) return 'Write a brief question or message.';
        if (value.length > 1000) return 'Keep your message to 1,000 characters or fewer.';
        return '';
      case 'consent': return input.checked ? '' : 'Confirm that you’ve read the privacy note and emergency notice.';
      default: return '';
    }
  }

  function validate(key) {
    const message = errorFor(key);
    document.getElementById(`${key}-error`).textContent = message;
    if (message) controls[key].setAttribute('aria-invalid', 'true');
    else controls[key].removeAttribute('aria-invalid');
    return message;
  }

  function updateSummary() {
    const list = summary.querySelector('ul');
    list.replaceChildren();
    for (const key of fields) {
      const message = errorFor(key);
      if (!message) continue;
      const item = document.createElement('li'), link = document.createElement('a');
      link.href = `#enquiry-${key}`;
      link.textContent = message;
      link.addEventListener('click', event => { event.preventDefault(); controls[key].focus(); });
      item.append(link); list.append(item);
    }
    summary.hidden = !list.children.length;
    requestAnimationFrame(refresh);
  }

  const count = () => { document.getElementById('message-count').textContent = `${controls.message.value.length.toLocaleString('en')} / 1,000`; };
  for (const key of fields) {
    controls[key].addEventListener('blur', () => { touched.add(key); validate(key); if (attempted) updateSummary(); });
    const changed = () => { if (touched.has(key) || attempted) validate(key); if (attempted) updateSummary(); if (key === 'message') count(); };
    controls[key].addEventListener('input', changed);
    controls[key].addEventListener('change', changed);
  }

  page.querySelectorAll('[data-enquiry]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      controls.topic.value = link.dataset.enquiry;
      controls.topic.dispatchEvent(new Event('change'));
      controls.name.focus({ preventScroll: true });
      controls.name.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'center' });
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (navigating) return;
    attempted = true;
    controls.email.value = controls.email.value.trim();
    const errors = fields.map(validate).filter(Boolean);
    updateSummary();
    if (errors.length) { summary.focus(); return; }
    navigating = true;
    submit.disabled = true;
    // Never attach form values to the destination or transmit a submission.
    window.location.assign('404.html');
  });

  // Discard entries before leaving, including history-cache restores.
  function reset() {
    form.reset(); touched.clear(); attempted = false; navigating = false;
    fields.forEach(key => { controls[key].removeAttribute('aria-invalid'); document.getElementById(`${key}-error`).textContent = ''; });
    summary.hidden = true; summary.querySelector('ul').replaceChildren(); submit.disabled = false; count();
  }
  window.addEventListener('pagehide', reset);
  window.addEventListener('pageshow', event => { if (event.persisted) reset(); });
  reset();

  page.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', () => {
    const answer = detail.querySelector(':scope > div');
    if (detail.open && answer && window.gsap && !reduced.matches) window.gsap.fromTo(answer, { y: 4 }, { y: 0, duration: .2, clearProps: 'transform' });
    requestAnimationFrame(refresh);
  }));
  document.fonts?.ready.then(refresh);
  window.addEventListener('load', refresh, { once: true });
  reduced.addEventListener('change', refresh);
  if (!window.gsap || !window.ScrollTrigger) return;
  window.gsap.registerPlugin(window.ScrollTrigger);
  window.gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    window.gsap.fromTo('.ct-hero__copy > *', { y: 16 }, { y: 0, duration: .7, stagger: .06, ease: 'power3.out', clearProps: 'transform' });
    window.gsap.fromTo('.ct-hero__figure', { y: 20 }, { y: 0, duration: .95, ease: 'power3.out', clearProps: 'transform' });
    window.gsap.fromTo('.ct-contours', { y: 18 }, { y: -18, ease: 'none', scrollTrigger: { trigger: '.ct-notes', start: 'top bottom', end: 'bottom top', scrub: .7 } });
  });
})();
