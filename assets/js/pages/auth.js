/* Front-end routing only. The email is kept in sessionStorage for display, never the password. */
(() => {
  'use strict';
  const form = document.querySelector('form[data-auth]');
  if (!form) return;
  const signup = form.dataset.auth === 'signup';
  const keys = signup ? ['name', 'email', 'phone', 'password', 'confirm'] : ['email', 'password'];
  const fields = Object.fromEntries(keys.map(key => [key, form.elements.namedItem(key)]));
  const summary = document.getElementById('auth-errors');
  const submit = form.querySelector('[type="submit"]');
  const touched = new Set();
  let attempted = false, navigating = false;

  function errorFor(key) {
    const field = fields[key], value = field.value;
    switch (key) {
      case 'name':
        if (!value.trim()) return 'Enter the name you go by.';
        if (!/\p{L}/u.test(value)) return 'Include at least one letter in your name.';
        if (value.trim().length > 100) return 'Keep your name to 100 characters or fewer.';
        return '';
      case 'email': {
        const email = value.trim();
        if (!email) return 'Enter an email address.';
        if (field.validity.typeMismatch || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address, such as you@example.com.';
        return '';
      }
      case 'phone': {
        const phone = value.trim(), digits = (phone.match(/\d/g) || []).length;
        if (!phone) return '';
        if (!/^\+?[\d\s().-]+$/.test(phone) || digits < 7 || digits > 15 || phone.length > 30) return 'Use 7–15 digits, with an optional +, spaces, brackets or hyphens—or leave this blank.';
        return '';
      }
      case 'password':
        if (!value.trim()) return signup ? 'Create a password.' : 'Enter your password.';
        if (value.length < 6 || value.length > 128 || !/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) return 'Use 6–128 characters, including at least one letter and one number.';
        return '';
      case 'confirm':
        if (!value) return 'Enter your password again.';
        if (value !== fields.password.value) return 'Your passwords do not match. Check both fields.';
        return '';
      default: return '';
    }
  }

  function validate(key) {
    const message = errorFor(key);
    document.getElementById(`${key}-error`).textContent = message;
    if (message) fields[key].setAttribute('aria-invalid', 'true');
    else fields[key].removeAttribute('aria-invalid');
    return message;
  }

  function updateSummary() {
    const list = summary.querySelector('ul');
    list.replaceChildren();
    for (const key of keys) {
      const message = errorFor(key);
      if (!message) continue;
      const item = document.createElement('li'), link = document.createElement('a');
      link.href = `#${key}`; link.textContent = message;
      link.addEventListener('click', event => { event.preventDefault(); fields[key].focus(); });
      item.append(link); list.append(item);
    }
    summary.hidden = !list.children.length;
  }

  let lengthState = '';
  function updateLength() {
    const note = document.getElementById('password-length');
    if (!note) return;
    const value = fields.password.value;
    note.hidden = !value.length;
    const state = !errorFor('password') ? 'met' : 'short';
    note.dataset.valid = String(state === 'met');
    // Announce only a threshold change, not every keystroke or a misleading strength score.
    if (state !== lengthState) note.textContent = state === 'met' ? '✓ Password requirements met. Make sure both fields match.' : 'Use 6–128 characters, including a letter and a number.';
    lengthState = state;
  }

  for (const key of keys) {
    fields[key].addEventListener('blur', () => { touched.add(key); validate(key); if (attempted) updateSummary(); });
    const change = () => {
      if (attempted || touched.has(key)) validate(key);
      if (key === 'password') {
        updateLength();
        if (signup && (attempted || touched.has('confirm'))) validate('confirm');
      }
      if (attempted) updateSummary();
    };
    fields[key].addEventListener('input', change);
    fields[key].addEventListener('change', change);
  }

  form.querySelectorAll('.au-reveal').forEach(button => {
    const input = document.getElementById(button.getAttribute('aria-controls'));
    const label = input.id === 'confirm' ? 'confirm password' : 'password';
    button.addEventListener('click', () => {
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.textContent = visible ? 'Hide' : 'Show';
      button.setAttribute('aria-pressed', String(visible));
      button.setAttribute('aria-label', `${visible ? 'Hide' : 'Show'} ${label}`);
    });
    button.hidden = false;
    const caps = document.getElementById(`${input.id}-caps`);
    const updateCaps = event => { caps.hidden = !event.getModifierState?.('CapsLock'); };
    input.addEventListener('keydown', updateCaps);
    input.addEventListener('keyup', updateCaps);
    input.addEventListener('blur', () => { caps.hidden = true; });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (navigating) return;
    attempted = true;
    fields.email.value = fields.email.value.trim();
    const errors = keys.map(validate).filter(Boolean);
    updateSummary();
    if (errors.length) { summary.focus(); return; }
    const role = form.elements.namedItem('role')?.value;
    if (!signup && !['client', 'admin'].includes(role)) return;
    const destination = signup ? 'login.html' : role === 'admin' ? 'admin-dashboard.html' : 'client-dashboard.html';
    // Display identity only, not an authentication token or authorization check.
    if (!signup) {
      try { sessionStorage.setItem('stackly.displayEmail', fields.email.value); }
      catch (_) { /* Storage-disabled browsers can still open the public workspace as a guest. */ }
    }
    navigating = true; submit.disabled = true;
    // Discard even synthetic credentials before leaving. Never put them in a URL.
    form.reset();
    location.assign(destination);
  });

  function reset() {
    form.reset(); touched.clear(); attempted = false; navigating = false;
    keys.forEach(key => { fields[key].removeAttribute('aria-invalid'); document.getElementById(`${key}-error`).textContent = ''; });
    form.querySelectorAll('.au-reveal').forEach(button => {
      const input = document.getElementById(button.getAttribute('aria-controls'));
      input.type = 'password'; button.textContent = 'Show'; button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', input.id === 'confirm' ? 'Show confirm password' : 'Show password');
    });
    form.querySelectorAll('.au-caps').forEach(note => { note.hidden = true; });
    summary.hidden = true; summary.querySelector('ul').replaceChildren(); submit.disabled = false;
    lengthState = ''; updateLength();
  }
  window.addEventListener('pagehide', reset);
  window.addEventListener('pageshow', event => { if (event.persisted) reset(); });
  reset();

  if (window.gsap) window.gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    window.gsap.fromTo('.au-visual', { y: 15 }, { y: 0, duration: .75, ease: 'power3.out', clearProps: 'transform' });
    // Animate only decorative copy, never the form inputs or error feedback.
    window.gsap.fromTo('.au-visual__top, .au-visual h2, .au-visual__intro', { y: 10 }, { y: 0, stagger: .05, duration: .6, clearProps: 'transform' });
  });
})();
