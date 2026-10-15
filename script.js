// Menu mobile
const btn = document.querySelector('.menu-btn');
const nav = document.getElementById('nav');
btn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
  btn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  btn.setAttribute('aria-expanded', false);
}));

// Bordure du header au défilement
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Filtre des projets
const filters = document.querySelectorAll('.filters button');
const projects = document.querySelectorAll('.project');
filters.forEach(b => b.addEventListener('click', () => {
  filters.forEach(x => x.classList.remove('on'));
  b.classList.add('on');
  const f = b.dataset.filter;
  projects.forEach(p => { p.hidden = f !== 'all' && p.dataset.cat !== f; });
}));

// Formulaire : ouvre le client mail avec le message pré-rempli
// (remplace par Formspree, EmailJS ou ton backend pour un envoi direct)
const form = document.getElementById('form');
const msg = document.getElementById('msg');
form.addEventListener('submit', e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  let ok = true;
  ['nom', 'email', 'message'].forEach(n => {
    const el = form.elements[n];
    const bad = !el.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
    el.classList.toggle('err', bad);
    if (bad) ok = false;
  });
  msg.className = 'msg';
  if (!ok) {
    msg.classList.add('error');
    msg.textContent = 'Complétez votre nom, un email valide et votre message.';
    return;
  }
  const subject = encodeURIComponent(`Projet : ${d.type} — ${d.nom}`);
  const body = encodeURIComponent(`${d.message}\n\n${d.nom}\n${d.email}`);
  window.location.href = `mailto:contact@benikipaka.com?subject=${subject}&body=${body}`;
  msg.textContent = 'Votre messagerie s\u2019ouvre avec le message prêt à envoyer.';
  form.reset();
});

// Année du footer
document.getElementById('year').textContent = new Date().getFullYear();
