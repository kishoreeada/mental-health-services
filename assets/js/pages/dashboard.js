/* Static workspace interactions. Only the display email uses tab-scoped sessionStorage. */
(() => {
  'use strict';
  const identityKey = 'stackly.displayEmail';
  const profile = document.querySelector('.db-profile');
  function renderIdentity() {
    if (!profile) return;
    let email = '';
    try { email = sessionStorage.getItem(identityKey) || ''; } catch (_) { /* Guest fallback. */ }
    const checker = document.createElement('input');
    checker.type = 'email'; checker.value = email;
    if (email.length > 254 || checker.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) email = '';
    profile.querySelector('.db-avatar').textContent = email ? Array.from(email)[0].toLocaleUpperCase() : 'G';
    const label = profile.querySelector('strong');
    label.textContent = email || 'Guest';
    label.title = email || 'No email entered';
    profile.querySelector('small').textContent = email ? 'Your workspace' : 'Not signed in';
  }
  renderIdentity();
  window.addEventListener('pageshow', renderIdentity);
  document.querySelectorAll('.db-logout').forEach(link => link.addEventListener('click', () => {
    try { sessionStorage.removeItem(identityKey); } catch (_) { /* No stored identity to clear. */ }
    renderIdentity();
  }));
  const side = document.querySelector('.db-sidebar');
  const workspace = document.querySelector('.db-workspace');
  const toggle = document.querySelector('.db-menu');
  const close = document.querySelector('.db-close');
  const backdrop = document.querySelector('.db-backdrop');
  const skip = document.querySelector('.db-skip');
  if (!side || !workspace || !toggle || !close || !backdrop) return;
  const mobile = matchMedia('(max-width:767px)');
  let open = false;
  function setOpen(value, restore = true) {
    open = Boolean(value && mobile.matches);
    side.classList.toggle('is-open', open);
    side.inert = mobile.matches && !open;
    workspace.inert = open;
    if (skip) skip.inert = open;
    backdrop.hidden = !open;
    document.body.classList.toggle('db-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      side.setAttribute('role', 'dialog');
      side.setAttribute('aria-modal', 'true');
      close.focus();
    } else {
      side.removeAttribute('role');
      side.removeAttribute('aria-modal');
      if (restore && mobile.matches) toggle.focus();
    }
  }
  toggle.addEventListener('click', () => setOpen(!open));
  close.addEventListener('click', () => setOpen(false));
  backdrop.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', event => {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
    if (event.key !== 'Tab') return;
    const controls = [...side.querySelectorAll('a[href],button:not([disabled])')].filter(el => el.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || !side.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !side.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  });
  mobile.addEventListener('change', () => {
    const hadSideFocus = side.contains(document.activeElement);
    setOpen(false, false);
    if (hadSideFocus) (mobile.matches ? toggle : side.querySelector('[aria-current="page"]')).focus();
  });
  toggle.hidden = false; close.hidden = false;
  document.documentElement.classList.add('db-js');
  setOpen(false, false);
  window.addEventListener('pageshow', event => { if (event.persisted) setOpen(false, false); });

  const tools = document.querySelector('[data-tools]');
  if (tools) {
    const input = tools.querySelector('input[type=search]');
    const select = tools.querySelector('select');
    const reset = tools.querySelector('[data-reset]');
    const items = [...document.querySelectorAll('[data-item]')];
    const result = document.querySelector('[data-results]');
    const empty = document.querySelector('[data-empty]');
    function filter() {
      const query = input.value.trim().toLocaleLowerCase();
      let shown = 0;
      items.forEach(item => {
        const matches = (select.value === 'all' || item.dataset.category === select.value) && item.dataset.search.toLocaleLowerCase().includes(query);
        item.hidden = !matches;
        if (matches) shown++;
      });
      result.textContent = shown + ' of ' + items.length + ' items shown';
      empty.hidden = shown !== 0;
      const table = document.querySelector('.db-table-wrap');
      if (table) table.hidden = shown === 0;
    }
    input.addEventListener('input', filter);
    select.addEventListener('change', filter);
    reset.addEventListener('click', () => { input.value = ''; select.value = 'all'; filter(); input.focus(); });
    tools.hidden = false; result.hidden = false; filter();
  }
  if (window.gsap && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    window.gsap.fromTo('.db-page-heading, .db-metrics, .db-main > .db-grid, .db-main > .db-panel',
      { y: 10 }, { y: 0, duration: .55, stagger: .035, ease: 'power2.out', clearProps: 'transform' });
  }
})();
