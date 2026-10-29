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
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
  });

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
  const btn = $('button[type="submit"]', form);
  form.addEventListener('submit', async e => {
    e.preventDefault(); ok.textContent = '';
    const valid = Object.keys(rules).map(check).every(Boolean);
    if (!valid) { $('.has-error input, .has-error textarea', form).focus(); return; }
    if ($('#website').value) return; /* champ piège anti-spam */
    const type = (form.querySelector('input[name="type"]:checked') || {}).value || '';
    const name = $('#name').value.trim(), email = $('#email').value.trim(), msg = ($('#msg').value.trim() + (type ? `\n\nBesoin : ${type}` : '') + (((form.querySelector('input[name="delai"]:checked') || {}).value) ? `\nDélai : ${form.querySelector('input[name="delai"]:checked').value}` : ''));
    const endpoint = (form.dataset.endpoint || '').trim();

    if (endpoint) {
      /* Envoi direct (Formspree, Web3Forms...) */
      btn.disabled = true; ok.textContent = 'Envoi en cours...';
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name, email, message: msg })
        });
        if (!res.ok) throw new Error(res.status);
        ok.textContent = 'Merci ! Votre message a bien été envoyé, je vous réponds sous 24 h.';
        form.reset();
      } catch (err) {
        ok.textContent = 'Envoi impossible pour le moment. Écrivez-moi sur WhatsApp ou par e-mail.';
      } finally { btn.disabled = false; }
      return;
    }

    /* Solution de secours : ouvre l'application e-mail */
    const body = `${msg}\n\n${name}\n${email}`;
    location.href = `mailto:benikipaka243@gmail.com?subject=${encodeURIComponent('Nouveau projet - ' + name)}&body=${encodeURIComponent(body)}`;
    ok.textContent = 'Merci ! Votre application e-mail s\'ouvre pour envoyer le message.';
    form.reset();
  });

  /* 8. Année du footer */
  $('#year').textContent = new Date().getFullYear();
})();

/* Refonte v2 : effets d'interaction */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Barre de progression de lecture */
  const bar = document.createElement('div'); bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true'); document.body.prepend(bar);
  const prog = () => { bar.style.transform = `scaleX(${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`; };
  addEventListener('scroll', prog, { passive: true }); prog();

  /* Bandeau d'outils : duplication pour une boucle continue */
  const track = $('.marquee__track'); if (track) track.innerHTML += track.innerHTML;

  /* Pourcentages des barres de compétences */
  $$('.bars li').forEach(li => { const i = $('i', li), b = document.createElement('b'); b.textContent = i.style.getPropertyValue('--v'); li.append(b); });

  /* Apparition échelonnée dans les grilles */
  $$('.bento, .grid, .tools, .steps').forEach(g => $$('.reveal', g).forEach((el, n) => el.style.transitionDelay = `${n * 90}ms`));

  if (reduce || !fine) return;

  /* Halo lumineux qui suit le curseur sur les cartes de services */
  $$('.sv').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  /* Inclinaison 3D du plan de travail */
  const art = $('.hx__art'), board = $('.board');
  if (art) {
    art.addEventListener('pointermove', e => {
      const r = art.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      board.style.setProperty('--ry', `${x * 12}deg`); board.style.setProperty('--rx', `${-y * 10}deg`);
    });
    art.addEventListener('pointerleave', () => { board.style.setProperty('--ry', '0deg'); board.style.setProperty('--rx', '0deg'); });
  }

  /* Boutons magnétiques */
  $$('.mag').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .28}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
})();

/* Refonte v3 : jauges, méthode, lueurs, formulaire */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const R = 44, C = 2 * Math.PI * R;
  $$('.rg').forEach(l => {
    const v = +l.dataset.v; l.style.setProperty('--off', C * (1 - v / 100));
    l.innerHTML = `<div class="rg__c"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${R}"/><circle class="v" cx="50" cy="50" r="${R}" stroke-dasharray="${C}"/></svg><strong data-count="${v}" data-suffix="%">0</strong></div><h3>${l.dataset.t}</h3><p>${l.dataset.s}</p>`;
  });
  const steps = $('.steps');
  const stepsOn = () => {
    const r = steps.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * .75 - r.top) / (r.height + 40)));
    steps.style.setProperty('--p', p);
    $$('li', steps).forEach(li => li.classList.toggle('on', li.offsetLeft <= p * steps.offsetWidth || li.offsetTop > 0 && p > .1 + li.offsetTop / (r.height || 1)));
  };
  addEventListener('scroll', stepsOn, { passive: true }); stepsOn();
  if (fine) {
    $$('.tool,.project,.cf li').forEach(c => c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
      if (c.matches('.project,.cf li')) c.style.transform = `perspective(800px) rotateY(${(x / r.width - .5) * 6}deg) rotateX(${-(y / r.height - .5) * 6}deg) translateY(-6px)`;
    }));
    $$('.project,.cf li').forEach(c => c.addEventListener('pointerleave', () => { c.style.transform = ''; }));
  }
  const form = $('#form'), cnt = $('#cnt'), fpv = $('#fpv');
  const prog = () => {
    const ok = [$('#name').value.trim().length >= 2, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($('#email').value), $('#msg').value.trim().length >= 10].filter(Boolean).length;
    const n = Math.round(25 + ok * 25); form.style.setProperty('--fp', n + '%'); fpv.textContent = n;
    const L = $('#msg').value.trim().length; cnt.textContent = L >= 10 ? 'Parfait, continuez' : `${L} / 10 caractères minimum`;
  };
  form.addEventListener('input', prog); prog();
  form.addEventListener('reset', () => {
    setTimeout(() => { $('#sentTxt').textContent = $('#ok').textContent; form.classList.add('is-done'); prog(); }, 30);
    setTimeout(() => form.classList.remove('is-done'), 7000);
  });
})();
