/* The journal is readable without scripts. Search, saved reading and motion enhance it. */
(() => {
  const page = document.querySelector('.journal-page');
  if (!page) return;
  const $ = s => document.querySelector(s);
  const all = s => [...document.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const refresh = () => { window.AOS?.refresh(); window.ScrollTrigger?.refresh(); };
  const registry = JSON.parse($('#journal-index')?.textContent || '[]');
  const known = new Map(registry.map(a => [a.id, a]));
  const storageKey = 'stackly-journal-saved-v1';
  let persistent = true;
  const readSaved = () => {
    try { const value = JSON.parse(localStorage.getItem(storageKey) || '[]'); return new Set(Array.isArray(value) ? value.filter(id => known.has(id)) : []); }
    catch { persistent = false; return new Set(); }
  };
  let saved = readSaved();
  const status = text => { const el = $('#save-status'); if (el) el.textContent = text; };
  const renderSaved = () => {
    all('[data-save]').forEach(button => {
      const a = known.get(button.dataset.save), selected = saved.has(button.dataset.save);
      if (!a) return;
      button.hidden = false;
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', `${selected ? 'Remove saved reflection' : 'Save'}: ${a.title}`);
      button.replaceChildren();
      const icon = document.createElement('span'); icon.setAttribute('aria-hidden', 'true'); icon.textContent = selected ? '✓' : '＋';
      button.append(icon, selected ? ' Saved' : ' Save');
    });
    const target = $('#saved-items');
    if (target) {
      target.replaceChildren();
      if (!saved.size) {
        const text = document.createElement('p'); text.className = 'jr-saved__empty'; text.textContent = 'A little space for something worth coming back to.'; target.append(text);
      } else {
        const list = document.createElement('ul'); list.className = 'jr-saved-list';
        saved.forEach(id => {
          const a = known.get(id), item = document.createElement('li'), link = document.createElement('a'), remove = document.createElement('button');
          link.href = "404.html"; link.dataset.cta = "404"; link.textContent = a.title;
          remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', `Remove: ${a.title}`);
          remove.addEventListener('click', () => { saveChange(id); $('#clear-saved')?.focus(); if (!saved.size) $('#reading-list .jr-link[href="#library"]')?.focus(); });
          item.append(link, remove); list.append(item);
        });
        target.append(list);
      }
      $('#clear-saved').hidden = !saved.size;
      if (!persistent) $('#storage-note').textContent = 'Browser storage is unavailable. Saves last only while this page stays open; use your browser bookmarks to keep an article.';
    }
    requestAnimationFrame(refresh);
  };
  const persist = () => {
    try { if (saved.size) localStorage.setItem(storageKey, JSON.stringify([...saved])); else localStorage.removeItem(storageKey); persistent = true; }
    catch { persistent = false; }
  };
  const saveChange = id => {
    if (!known.has(id)) return;
    saved.has(id) ? saved.delete(id) : saved.add(id); persist(); renderSaved();
    status(saved.has(id) ? (persistent ? 'Saved in this browser. Manage it in your reading list.' : 'Saved for this page only. Browser storage is unavailable.') : 'Removed from your reading list.');
  };
  all('[data-save]').forEach(b => b.addEventListener('click', () => saveChange(b.dataset.save)));
  $('#clear-saved')?.addEventListener('click', () => { saved.clear(); persist(); renderSaved(); status('Your reading list is clear.'); $('#reading-list .jr-link[href="#library"]')?.focus(); });
  window.addEventListener('storage', event => { if (event.key === storageKey || event.key === null) { saved = readSaved(); renderSaved(); } });
  renderSaved();

  const cards = all('.jr-card');
  if (cards.length) {
    $('.jr-tools').hidden = false;
    const input = $('#journal-search'), buttons = all('[data-topic]');
    const normalize = text => text.toLocaleLowerCase().replace(/[-–—]/g, ' ').replace(/[’‘]/g, "'");
    const searchIndex = new Map(cards.map(card => [card, normalize(`${card.dataset.search} ${card.querySelector('[data-save]')?.dataset.save || ''}`)]));
    let topic = 'all';
    const apply = (updateURL = true) => {
      const query = input.value.trim(), terms = normalize(query).split(/\s+/).filter(Boolean);
      let count = 0;
      cards.forEach(card => { const match = (topic === 'all' || card.dataset.category === topic) && terms.every(term => searchIndex.get(card).includes(term)); card.hidden = !match; if (match) count++; });
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.topic === topic)));
      $('#journal-results').textContent = `${count} ${count === 1 ? 'reflection' : 'reflections'} to explore`;
      $('#no-results').hidden = count !== 0; $('#clear-search').hidden = !input.value;
      if (updateURL) {
        const url = new URL(location.href);
        query ? url.searchParams.set('q', input.value.trim()) : url.searchParams.delete('q');
        topic !== 'all' ? url.searchParams.set('topic', topic) : url.searchParams.delete('topic');
        try { history.replaceState(null, '', url); } catch { /* file previews may restrict History */ }
      }
      refresh();
    };
    const fromURL = () => {
      const params = new URLSearchParams(location.search);
      input.value = (params.get('q') || '').slice(0, 120);
      topic = buttons.some(b => b.dataset.topic === params.get('topic')) ? params.get('topic') : 'all';
      apply(false);
    };
    buttons.forEach(button => button.addEventListener('click', () => { topic = button.dataset.topic; apply(); }));
    input.addEventListener('input', () => apply());
    $('#clear-search').addEventListener('click', () => { input.value = ''; apply(); input.focus(); });
    $('#reset-filters').addEventListener('click', () => { topic = 'all'; input.value = ''; apply(); input.focus(); });
    const revealAnchor = () => {
      const card = cards.find(c => '#'+c.id === location.hash);
      if (card?.hidden) { topic = 'all'; input.value = ''; apply(); card.scrollIntoView({ block: 'start', behavior: reduce.matches ? 'instant' : 'smooth' }); }
    };
    fromURL(); revealAnchor();
    window.addEventListener('popstate', () => { fromURL(); revealAnchor(); });
    window.addEventListener('hashchange', revealAnchor);
  }
  const prompts = ['What has been asking the most of you lately?', 'What would you like a little more room for?', 'Which expectation feels like it belongs to someone else?', 'What is one thing you do not have to solve today?'];
  if ($('#prompt-content')) {
    let index = 0; $('.jr-prompt__controls').hidden = false;
    const change = direction => {
      index = (index + direction + prompts.length) % prompts.length;
      $('#prompt-content p').textContent = prompts[index]; $('#prompt-count').textContent = `${String(index + 1).padStart(2, '0')} / 04`;
      if (window.gsap && !reduce.matches) window.gsap.fromTo('#prompt-content p', { y: 7 }, { y: 0, duration: .3, clearProps: 'transform', overwrite: true });
    };
    $('#previous-prompt').addEventListener('click', () => change(-1)); $('#next-prompt').addEventListener('click', () => change(1));
  }
  const print = $('#print-article');
  if (print) { print.hidden = false; print.addEventListener('click', () => window.print()); }
  const progress = $('.jr-reading-progress > span'), body = $('.jr-reading-body');
  if (progress && body) {
    let queued = false;
    const update = () => { const box = body.getBoundingClientRect(), start = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 84; const total = Math.max(1, box.height - innerHeight + start); const fraction = Math.min(1, Math.max(0, (start - box.top) / total)); progress.style.transform = `scaleX(${fraction})`; queued = false; };
    const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule, { passive: true }); update();
  }
  document.fonts?.ready.then(refresh); window.addEventListener('load', refresh, { once: true });
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      window.gsap.fromTo('.jr-hero__grid > *, .jr-reader-hero__grid > *', { y: 20 }, { y: 0, duration: .8, stagger: .08, clearProps: 'transform', ease: 'power3.out' });
      all('[data-jr-image]').forEach(image => window.gsap.fromTo(image, { y: 22 }, { y: 0, duration: .85, clearProps: 'transform', scrollTrigger: { trigger: image, start: 'top 90%', once: true } }));
      if ($('.jr-pause__rings')) window.gsap.fromTo('.jr-pause__rings', { y: 15 }, { y: -15, ease: 'none', scrollTrigger: { trigger: '.jr-pause', start: 'top bottom', end: 'bottom top', scrub: .65 } });
    });
  }
})();
