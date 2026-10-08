(() => {
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  const header = $('[data-site-header]');
  const menuToggle = $('.menu-toggle');
  const mobileMenu = $('.mobile-menu');

  const setHeaderScrollState = () => {
    header?.classList.toggle('scrolled', window.scrollY > 18);
  };

  const closeMobileMenu = ({ returnFocus = false } = {}) => {
    if (!menuToggle || !mobileMenu) return;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    menuToggle.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    if (returnFocus) menuToggle.focus();
  };

  const openMobileMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
    menuToggle.classList.add('is-open');
    document.body.classList.add('nav-open');
    requestAnimationFrame(() => $('.mobile-primary-nav a', mobileMenu)?.focus());
  };

  setHeaderScrollState();
  window.addEventListener('scroll', setHeaderScrollState, { passive: true });

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeMobileMenu();
      else openMobileMenu();
    });

    $$('.mobile-menu a').forEach(link => link.addEventListener('click', () => closeMobileMenu()));

    document.addEventListener('keydown', event => {
      if (menuToggle.getAttribute('aria-expanded') !== 'true') return;

      if (event.key === 'Escape') {
        closeMobileMenu({ returnFocus: true });
        return;
      }

      if (event.key === 'Tab') {
        const focusable = [menuToggle, ...$$('a[href], button:not([disabled])', mobileMenu)];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMobileMenu();
      }
    }, { passive: true });
  }

  // Keep active states consistent across desktop, mobile, and the primary footer navigation.
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const publicPages = ['index.html', 'about.html', 'services.html', 'blog.html', 'contact.html'];
  if (publicPages.includes(currentPage)) {
    $$('.primary-nav a, .mobile-primary-nav a, .footer-primary a').forEach(link => {
      const target = (link.getAttribute('href') || '').split('#')[0].toLowerCase();
      const active = target === currentPage;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  // AOS is progressive enhancement: content stays visible if the library fails to load.
  if (window.AOS) {
    try {
      AOS.init({
        duration: 760,
        delay: 0,
        once: true,
        offset: 70,
        easing: 'ease-out-cubic',
        disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
      });
      document.documentElement.classList.add('aos-enabled');
    } catch (error) {
      document.documentElement.classList.remove('aos-enabled');
    }
  }

  // Register GSAP once. Existing page animations remain scoped to their current selectors.
  if (window.gsap) {
    try {
      if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
      document.documentElement.classList.add('gsap-enabled');

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Home 01: calm entrance sequence. Defaults remain fully visible when GSAP is unavailable.
      const homeHero = $('[data-home-hero]');
      if (homeHero && !reduceMotion) {
        const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
        heroTimeline
          .from($('.home-hero__eyebrow', homeHero), { y: 18, autoAlpha: 0, duration: .55 })
          .from($('.home-hero__title', homeHero), { y: 38, autoAlpha: 0, duration: .85 }, '-=.28')
          .from($('.home-hero__lead', homeHero), { y: 24, autoAlpha: 0, duration: .65 }, '-=.48')
          .from($$('.home-hero__actions .btn', homeHero), { y: 18, autoAlpha: 0, duration: .5, stagger: .08 }, '-=.38')
          .from($('.home-hero__reassurance', homeHero), { y: 12, autoAlpha: 0, duration: .45 }, '-=.3')
          .from($('.home-hero__media', homeHero), { clipPath: 'inset(0 0 100% 0 round 48% 48% 26px 26px)', scale: .985, duration: 1.05, ease: 'power3.inOut' }, '-=1.02')
          .from($$('.home-hero__orbit', homeHero), { scale: .78, autoAlpha: 0, duration: .75, stagger: .08 }, '-=.58')
          .from($('.home-hero__note', homeHero), { y: 24, autoAlpha: 0, duration: .58 }, '-=.42');
      }

      if (window.ScrollTrigger && !reduceMotion) {
        const mq = gsap.matchMedia();

        // Shared legacy selectors are left intact for the other completed pages.
        mq.add('(min-width: 768px)', () => {
          if (homeHero) {
            gsap.to($('.home-hero__media img', homeHero), {
              yPercent: 5,
              scale: 1.075,
              ease: 'none',
              scrollTrigger: { trigger: homeHero, start: 'top top', end: 'bottom top', scrub: .7 }
            });
            gsap.to($('.home-hero__orbit--large', homeHero), {
              yPercent: -10,
              ease: 'none',
              scrollTrigger: { trigger: homeHero, start: 'top top', end: 'bottom top', scrub: .8 }
            });
          }
          $$('.approach-step').forEach((el, i) => gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 82%' }, y: 45, opacity: 0, duration: .65, delay: i * .06 }));
          $$('.story-image img').forEach(el => gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 82%' }, clipPath: 'inset(0 100% 0 0)', duration: 1.1, ease: 'power2.inOut' }));
        });

        // Home page: each major section uses a different motion language.
        const homeCheckin = $('[data-home-checkin]');
        if (homeCheckin) {
          gsap.from($('.home-checkin__photo', homeCheckin), {
            clipPath: 'inset(0 100% 0 0 round 42px)',
            scale: 1.035,
            scrollTrigger: { trigger: homeCheckin, start: 'top 80%' },
            duration: 1.15,
            ease: 'power3.inOut'
          });
          gsap.from($('.home-checkin__field-head', homeCheckin), {
            x: 28,
            autoAlpha: 0,
            scrollTrigger: { trigger: homeCheckin, start: 'top 76%' },
            duration: .62,
            ease: 'power2.out'
          });
          gsap.from($$('.feeling', homeCheckin), {
            y: 22,
            scale: .96,
            autoAlpha: 0,
            stagger: .075,
            scrollTrigger: { trigger: homeCheckin, start: 'top 72%' },
            duration: .58,
            ease: 'back.out(1.35)'
          });
          gsap.from($('.home-checkin__insight', homeCheckin), {
            y: 20,
            autoAlpha: 0,
            scrollTrigger: { trigger: homeCheckin, start: 'top 66%' },
            duration: .6,
            ease: 'power2.out'
          });
          gsap.to($('.home-checkin__orbit--one', homeCheckin), {
            yPercent: -18,
            rotate: 18,
            ease: 'none',
            scrollTrigger: { trigger: homeCheckin, start: 'top bottom', end: 'bottom top', scrub: .9 }
          });
          gsap.to($('.home-checkin__photo img', homeCheckin), {
            yPercent: 4,
            ease: 'none',
            scrollTrigger: { trigger: homeCheckin, start: 'top bottom', end: 'bottom top', scrub: .8 }
          });
        }

        const approach = $('[data-home-approach]');
        if (approach) {
          const chapters = $$('[data-approach-step]', approach);
          const meterCurrent = $('.home-approach__meter-current', approach);
          const meterFill = $('.home-approach__meter-line i', approach);
          const setApproachStep = index => {
            chapters.forEach((chapter, chapterIndex) => chapter.classList.toggle('is-active', chapterIndex === index));
            if (meterCurrent) meterCurrent.textContent = String(index + 1).padStart(2, '0');
            if (meterFill) gsap.to(meterFill, { scaleX: (index + 1) / chapters.length, duration: .42, ease: 'power2.out', overwrite: true });
          };

          gsap.to($('.home-approach__progress', approach), {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: approach, start: 'top 66%', end: 'bottom 56%', scrub: .65 }
          });

          chapters.forEach((chapter, index) => {
            ScrollTrigger.create({
              trigger: chapter,
              start: 'top 56%',
              end: 'bottom 56%',
              onEnter: () => setApproachStep(index),
              onEnterBack: () => setApproachStep(index)
            });

            const ghost = $('.home-approach__ghost', chapter);
            if (ghost) {
              gsap.fromTo(ghost, { x: 26, autoAlpha: .25 }, {
                x: 0,
                autoAlpha: 1,
                ease: 'none',
                scrollTrigger: { trigger: chapter, start: 'top 88%', end: 'top 48%', scrub: .55 }
              });
            }
          });
        }

        const servicesAtlas = $('[data-home-services]');
        if (servicesAtlas) {
          const servicesSection = servicesAtlas.closest('.home-services-preview');
          const servicesLine = $('.home-services-preview__progress-line', servicesSection);
          if (servicesLine) {
            gsap.to(servicesLine, {
              scaleX: 1,
              ease: 'none',
              scrollTrigger: { trigger: servicesSection, start: 'top 78%', end: 'bottom 52%', scrub: .65 }
            });
          }
        }

        const connection = $('[data-home-connection]');
        if (connection) {
          gsap.fromTo($('.home-connection__media img', connection), { scale: 1.015 }, {
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: connection, start: 'top bottom', end: 'bottom top', scrub: .75 }
          });
          gsap.to($('.home-connection__word', connection), {
            xPercent: 9,
            ease: 'none',
            scrollTrigger: { trigger: connection, start: 'top bottom', end: 'bottom top', scrub: .85 }
          });
        }


      }
    } catch (error) {
      document.documentElement.classList.remove('gsap-enabled');
    }
  }
  const checkinStage = $('[data-home-checkin]');
  if (checkinStage) {
    const feelingButtons = $$('.feeling', checkinStage);
    const response = $('[data-checkin-response]', checkinStage);
    const insightTitle = $('[data-checkin-title]', checkinStage);
    const insight = $('[data-checkin-insight]', checkinStage);

    feelingButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        feelingButtons.forEach(button => {
          button.classList.remove('selected');
          button.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
        if (insightTitle) insightTitle.textContent = btn.dataset.title || 'You can start from here.';
        if (response) response.textContent = btn.dataset.response || `Thank you for naming “${btn.textContent.trim()}”.`;
        if (window.gsap && insight && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          gsap.fromTo(insight, { y: 8, autoAlpha: .72 }, { y: 0, autoAlpha: 1, duration: .36, ease: 'power2.out' });
        }
      });
    });

    // Gentle magnetic response for the check-in choices on fine pointers only.
    if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      feelingButtons.forEach(button => {
        button.addEventListener('pointermove', event => {
          const rect = button.getBoundingClientRect();
          const x = (event.clientX - rect.left - rect.width / 2) * .07;
          const y = (event.clientY - rect.top - rect.height / 2) * .07;
          button.style.translate = `${x}px ${y}px`;
        });
        button.addEventListener('pointerleave', () => { button.style.translate = ''; });
      });
    }
  }

  $$('.counter').forEach(el=>{const target=Number(el.dataset.target||0);if(!target)return;let done=false;const run=()=>{if(done)return;done=true;let n=0,steps=40,inc=target/steps;const t=setInterval(()=>{n+=inc;if(n>=target){n=target;clearInterval(t)}el.textContent=Math.round(n)+(el.dataset.suffix||'')},28)};if('IntersectionObserver'in window){new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&run()),{threshold:.4}).observe(el)}else run();});
  const form=$('#contactForm');if(form){const rules={name:v=>/^[A-Za-z][A-Za-z ]{1,49}$/.test(v.trim())?'':'Use letters and reasonable spaces only.',email:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())?'':'Enter a valid email address.',phone:v=>/^\+?[0-9][0-9\s-]{7,14}$/.test(v.trim())?'':'Enter a valid phone number.',message:v=>v.trim().length>=10?'':'Please add a short message (at least 10 characters).'};form.addEventListener('submit',e=>{e.preventDefault();let ok=true;Object.entries(rules).forEach(([n,test])=>{const input=form.elements[n],msg=test(input.value),err=input.closest('.field').querySelector('.error');input.classList.toggle('invalid',!!msg);err.textContent=msg;if(msg)ok=false});const status=$('.form-status',form);if(ok){status.textContent='Thank you. Your message is ready for the care team in this demo.';status.style.color='#2c715a';form.reset()}else{status.textContent='Please correct the highlighted fields.';status.style.color='#a53d3d'}});}
  const newsletter=$('#newsletterForm');if(newsletter)newsletter.addEventListener('submit',e=>{e.preventDefault();const input=new FormData(newsletter).get('email');const out=$('.newsletter-status');if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)){out.textContent='You’re on the list. Thank you.';newsletter.reset()}else out.textContent='Please enter a valid email.';});
})();

/* Public-page motion system. Enhancements are additive: pages remain usable without JS or CDN assets. */
(() => {
  const root = document.querySelector('main');
  if (!root || root.hasAttribute('data-custom-motion')) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isHome = root.classList.contains('home-page');
  const sections = [...root.querySelectorAll(':scope > section')];

  sections.forEach((section, index) => {
    section.dataset.sectionLabel = String(index + 1).padStart(2, '0');
    if (!isHome && !section.querySelector('[data-aos]')) {
      const content = section.querySelector('.section-head, .split-editorial, .service-feature, .image-story, .contact-form-wrap, .faq, .newsletter, .quote-stage, .final-cta');
      if (content) {
        content.setAttribute('data-aos', index % 2 ? 'fade-up' : 'fade-up');
        content.setAttribute('data-aos-duration', '760');
      }
    }
  });

  if (window.AOS && !isHome) {
    try { AOS.refreshHard(); } catch (_) { /* AOS remains optional */ }
  }

  const progress = document.createElement('div');
  progress.className = 'premium-scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  document.body.append(progress);
  const progressFill = progress.firstElementChild;
  const updateProgress = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progressFill.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / max))})`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });

  if (!isHome && sections.length) {
    const navigator = document.createElement('nav');
    navigator.className = 'premium-section-dot';
    navigator.setAttribute('aria-label', 'Page section navigation');
    const dots = sections.map((section, index) => {
      const label = section.querySelector('h2, h1')?.textContent.trim().replace(/\s+/g, ' ').slice(0, 80) || `Section ${index + 1}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.title = label;
      button.setAttribute('aria-label', `Jump to ${label}`);
      button.addEventListener('click', () => section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }));
      navigator.append(button);
      return button;
    });
    document.body.append(navigator);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const active = sections.indexOf(entry.target);
          dots.forEach((dot, index) => dot.classList.toggle('is-current', index === active));
        });
      }, { rootMargin: '-42% 0px -48%', threshold: .01 });
      sections.forEach(section => observer.observe(section));
    } else dots[0]?.classList.add('is-current');
  }

  document.querySelectorAll('.faq details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('.faq details[open]').forEach(openDetail => {
        if (openDetail !== detail) openDetail.removeAttribute('open');
      });
      if (window.gsap && !reduceMotion) {
        const answer = detail.querySelector('p');
        if (answer) gsap.fromTo(answer, { y: -7, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .32, ease: 'power2.out' });
      }
    });
  });

  const interactiveCards = document.querySelectorAll('.value-piece, .approach-step, .article-card, .contact-option, .session-pill');
  if (window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    interactiveCards.forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
        card.style.setProperty('--card-x', `${x * 4}px`);
        card.style.setProperty('--card-y', `${y * 4}px`);
        card.style.translate = `${x * 4}px ${y * 4}px`;
      });
      card.addEventListener('pointerleave', () => { card.style.translate = ''; });
    });
  }

  if (!window.gsap || reduceMotion) return;
  try {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    const hero = document.querySelector('.page-hero');
    if (hero && !isHome) {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      timeline.from(hero.querySelector('.eyebrow'), { y: 16, autoAlpha: 0, duration: .48 })
        .from(hero.querySelector('h1'), { y: 38, autoAlpha: 0, duration: .8 }, '-=.22')
        .from(hero.querySelector('.page-hero-side'), { y: 22, autoAlpha: 0, duration: .56 }, '-=.44')
        .from([hero], { '--hero-enter': 0, duration: .01 });
      if (window.ScrollTrigger) {
        gsap.to(hero, { backgroundPosition: '52% 50%', ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .7 } });
      }
    }
    if (window.ScrollTrigger && !isHome) {
      document.querySelectorAll('.split-media img, .service-image img, .story-image img').forEach(image => {
        gsap.from(image, { clipPath: 'inset(0 0 100% 0 round 28px)', duration: .95, ease: 'power3.inOut', scrollTrigger: { trigger: image, start: 'top 82%' } });
        gsap.to(image, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: image.parentElement, start: 'top bottom', end: 'bottom top', scrub: .8 } });
      });
      document.querySelectorAll('.value-band, .approach-track, .care-steps, .article-strip, .session-flow').forEach(group => {
        const items = [...group.children];
        gsap.from(items, { y: 28, autoAlpha: 0, stagger: .08, duration: .6, ease: 'power2.out', scrollTrigger: { trigger: group, start: 'top 78%' } });
      });
      document.querySelectorAll('.quote-stage, .newsletter, .privacy-panel').forEach(block => {
        gsap.from(block, { y: 28, autoAlpha: 0, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: block, start: 'top 82%' } });
      });
    }
  } catch (_) { /* Preserve the static experience if an animation cannot initialize. */ }
})();
