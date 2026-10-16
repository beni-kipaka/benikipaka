/* Portfolio Beni Kipaka - script.js (JavaScript vanilla) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Mode sombre / clair (sauvegardé dans localStorage) */
  $('#themeBtn').addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* 2. Menu mobile accessible */
  const burger = $('#burger'), menu = $('#menu');
  const setMenu = open => {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); burger.focus(); } });

  /* 3. Barre de navigation, bouton retour en haut */
  const nav = $('#nav'), totop = $('#totop');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', scrollY > 10);
    totop.classList.toggle('is-visible', scrollY > 600);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  totop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* 4. Lien actif selon la section visible */
  const links = $$('.nav__menu a[href^="#"]:not(.btn)');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* 5. Apparition au scroll et compteurs animés */
  const count = el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries, o) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      $$('[data-count]', en.target).forEach(count);
      o.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => io.observe(el));
  const stats = $('.stats');
  new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { $$('[data-count]', stats).forEach(count); o.disconnect(); } }).observe(stats);

  /* 6. Filtrage des projets */
  $$('.filter:not(.tool-filter)').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter:not(.tool-filter)').forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', b === btn); });
    $$('.project').forEach(p => p.classList.toggle('is-hidden', btn.dataset.filter !== 'all' && p.dataset.cat !== btn.dataset.filter));
  }));


  /* 6b. Filtrage des outils */
  $$('.tool-filter').forEach(btn => btn.addEventListener('click', () => {
    $$('.tool-filter').forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', b === btn); });
    $$('.tool').forEach(t => t.classList.toggle('is-hidden', btn.dataset.tool !== 'all' && t.dataset.cat !== btn.dataset.tool));
  }));

  /* 7. Validation du formulaire (envoi via l'application e-mail) */
  const form = $('#form'), ok = $('#ok');
  const rules = {
    name: v => v.trim().length >= 2 ? '' : 'Entrez votre nom (2 caractères minimum).',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Entrez une adresse e-mail valide, par exemple nom@domaine.com.',
    msg: v => v.trim().length >= 10 ? '' : 'Décrivez votre projet en 10 caractères minimum.'
  };
  const check = id => {
    const input = $('#' + id), msg = rules[id](input.value);
    $('#e-' + id).textContent = msg;
    input.closest('.field').classList.toggle('has-error', !!msg);
    input.setAttribute('aria-invalid', !!msg);
    return !msg;
  };
  Object.keys(rules).forEach(id => $('#' + id).addEventListener('blur', () => check(id)));
  form.addEventListener('submit', e => {
    e.preventDefault(); ok.textContent = '';
    const valid = Object.keys(rules).map(check).every(Boolean);
    if (!valid) { $('.has-error input, .has-error textarea', form).focus(); return; }
    const body = `${$('#msg').value}\n\n${$('#name').value}\n${$('#email').value}`;
    location.href = `mailto:benikipaka243@gmail.com?subject=${encodeURIComponent('Nouveau projet - ' + $('#name').value)}&body=${encodeURIComponent(body)}`;
    ok.textContent = 'Merci ! Votre application e-mail s\'ouvre pour envoyer le message.';
    form.reset();
  });

  /* 8. Année du footer */
  $('#year').textContent = new Date().getFullYear();
})();
