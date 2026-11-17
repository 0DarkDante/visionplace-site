(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const qs = (s, p=document) => p.querySelector(s);
  const qsa = (s, p=document) => [...p.querySelectorAll(s)];

  // Reveal on entry
  const revealEls = qsa('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    revealEls.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`; observer.observe(el); });
  } else revealEls.forEach(el => el.classList.add('is-visible'));

  // Header direction
  const header = qs('[data-header]');
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastY && y > 220) header?.classList.add('is-hidden'); else header?.classList.remove('is-hidden');
    lastY = y;
  }, { passive:true });

  // Full-screen menu
  const menuBtn = qs('.menu-toggle');
  const menu = qs('#menu-panel');
  const menuMedia = qs('.menu-media');
  const closeMenu = () => {
    menu?.classList.remove('is-open');
    menu?.setAttribute('aria-hidden','true');
    menuBtn?.setAttribute('aria-expanded','false');
    document.body.classList.remove('menu-open');
  };
  menuBtn?.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  });
  qsa('.menu-links a').forEach(link => {
    link.addEventListener('mouseenter', () => {
      menu.style.background = link.dataset.menuColor;
      menuMedia.style.backgroundImage = `url('${link.dataset.menuImage}')`;
      menuMedia.style.transform = `rotate(${Math.random() * 4 - 2}deg) scale(1.02)`;
    });
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });

  // Hero rotating word
  const word = qs('.changing-word');
  if (word && !reduced) {
    const words = JSON.parse(word.dataset.words || '[]');
    let i = 0;
    setInterval(() => {
      word.classList.add('is-changing');
      setTimeout(() => { i = (i + 1) % words.length; word.textContent = words[i]; word.classList.remove('is-changing'); }, 250);
    }, 1800);
  }

  // Vision mode
  const visionRange = qs('[data-vision-range]');
  const visionArt = qs('[data-vision-art]');
  const visionCaption = qs('[data-vision-caption]');
  const updateVision = (v) => {
    const p = Number(v);
    visionRange.style.background = `linear-gradient(90deg,var(--pink) 0 ${p}%,rgba(255,255,255,.25) ${p}%)`;
    visionArt.style.setProperty('--vision', p);
    visionArt.classList.toggle('is-clear', p > 62);
    visionArt.style.filter = `saturate(${.4 + p/100})`;
    visionCaption.textContent = p > 68 ? 'A coherent visual world, ready to be used.' : p > 35 ? 'Patterns emerge. A direction becomes visible.' : 'Instinct, fragments and untapped potential.';
  };
  visionRange?.addEventListener('input', e => updateVision(e.target.value));
  updateVision(visionRange?.value || 22);
  if (!coarse && !reduced) {
    qs('.hero')?.addEventListener('pointermove', e => {
      const x = (e.clientX / innerWidth - .5) * 18;
      const y = (e.clientY / innerHeight - .5) * 18;
      visionArt.style.transform = `translate3d(${x}px,${y}px,0)`;
    });
  }

  // Services accordion
  qsa('.service-row').forEach(row => {
    row.style.setProperty('--service-accent', row.dataset.accent || '#ff4d6d');
    const btn = qs('button', row);
    btn.addEventListener('click', () => {
      const open = row.classList.contains('is-open');
      qsa('.service-row.is-open').forEach(r => {
        r.classList.remove('is-open'); qs('button', r).setAttribute('aria-expanded','false'); qs('.service-plus', r).textContent = '+';
      });
      if (!open) { row.classList.add('is-open'); btn.setAttribute('aria-expanded','true'); qs('.service-plus', row).textContent = '−'; }
    });
  });

  // Process sequence from chaos to system
  const process = qs('.process');
  const steps = qsa('.process-steps article');
  const chaosItems = qsa('.chaos-item');
  const animateProcess = () => {
    if (!process || reduced) return;
    const rect = process.getBoundingClientRect();
    const max = process.offsetHeight - innerHeight;
    const progress = Math.max(0, Math.min(1, -rect.top / max));
    chaosItems.forEach((el, i) => {
      const phase = Math.max(0, Math.min(1, (progress - i*.025) / .58));
      el.style.opacity = String(1 - phase*.88);
      el.style.transform = `translate(${(i%2?1:-1)*phase*90}px, ${phase*150}px) rotate(${(i%2?1:-1)*(12-phase*12)}deg) scale(${1-phase*.35})`;
    });
    steps.forEach((el, i) => {
      const phase = Math.max(0, Math.min(1, (progress - .28 - i*.09) / .16));
      el.style.transform = `translateY(${(1-phase)*130}%)`;
      el.style.opacity = String(phase);
    });
  };
  window.addEventListener('scroll', animateProcess, { passive:true }); animateProcess();

  // Statement kinetic type
  const statement = qs('.statement');
  window.addEventListener('scroll', () => {
    if (!statement || reduced) return;
    const r = statement.getBoundingClientRect();
    const p = Math.max(-1, Math.min(1, (innerHeight/2 - r.top) / innerHeight));
    qsa('.statement-line', statement).forEach((line, i) => line.style.transform = `translateX(${(i%2?-1:1)*p*4.5}vw)`);
  }, { passive:true });

  // Before/after
  const compareRange = qs('[data-compare-range]');
  const compareBefore = qs('[data-compare-before]');
  const compareLine = qs('[data-compare-line]');
  const updateCompare = v => { compareBefore.style.width = `${v}%`; compareLine.style.left = `${v}%`; };
  compareRange?.addEventListener('input', e => updateCompare(e.target.value)); updateCompare(compareRange?.value || 48);

  // Custom cursor and magnetic hover
  if (!coarse && !reduced) {
    const cursor = qs('.cursor');
    window.addEventListener('pointermove', e => { cursor.style.left = `${e.clientX}px`; cursor.style.top = `${e.clientY}px`; });
    qsa('a,button,input,select,textarea').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
    });
    qsa('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.16}px, ${(e.clientY-r.top-r.height/2)*.16}px)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = 'translate(0,0)');
    });
  }

  // Contact dialog and success confirmation
  const dialog = qs('[data-form-dialog]');
  qs('[data-open-form]')?.addEventListener('click', () => { dialog.showModal(); document.body.classList.add('dialog-open'); });
  const closeDialog = () => { dialog.close(); document.body.classList.remove('dialog-open'); };
  qs('[data-close-form]')?.addEventListener('click', closeDialog);
  dialog?.addEventListener('click', e => { if (e.target === dialog) closeDialog(); });
  const alertBox = qs('[data-success-alert]');
  qs('[data-contact-form]')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(form).entries());
    sessionStorage.setItem('visionplace:lastEnquiry', JSON.stringify({...data, createdAt:new Date().toISOString()}));
    closeDialog(); form.reset(); alertBox.classList.add('is-visible');
    setTimeout(() => alertBox.classList.remove('is-visible'), 7200);
  });
  qs('[data-close-alert]')?.addEventListener('click', () => alertBox.classList.remove('is-visible'));

  // Cookie preference
  const cookieBanner = qs('[data-cookie-banner]');
  if (!localStorage.getItem('visionplace:cookiePreference')) setTimeout(() => cookieBanner?.classList.add('is-visible'), 900);
  const setCookiePreference = value => { localStorage.setItem('visionplace:cookiePreference', value); cookieBanner?.classList.remove('is-visible'); };
  qs('[data-cookie-essential]')?.addEventListener('click', () => setCookiePreference('essential'));
  qs('[data-cookie-accept]')?.addEventListener('click', () => setCookiePreference('all'));
})();
