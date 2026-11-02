export function initReveal() {
  if (window.__revealInit) return;
  window.__revealInit = true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-bubble]').forEach((b, i) => b.animate([{ transform: 'translateY(0) scale(1)' }, { transform: `translateY(${-10 - (i % 3) * 6}px) scale(${1 + (i % 2) * 0.08})` }], { duration: 2600 + (i % 4) * 700, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out', delay: i * 180 }));
  const ease = 'cubic-bezier(.2,.7,.2,1)';
  const prep = (el, from, dur) => {
    if (el.__rv) return false;
    el.__rv = { o: el.style.opacity, t: el.style.transform, tr: el.style.transition };
    el.style.opacity = '0';
    el.style.transform = (el.__rv.t ? el.__rv.t + ' ' : '') + from;
    el.style.transition = `opacity ${dur}ms ${ease}, transform ${dur}ms ${ease}`;
    return true;
  };
  const play = (el, delay) => {
    setTimeout(() => {
      el.style.opacity = el.__rv.o || '';
      el.style.transform = el.__rv.t || '';
      setTimeout(() => { el.style.transition = el.__rv.tr || ''; }, 900);
    }, delay);
  };
  // Hero headline: staggered rise
  document.querySelectorAll('main h1 > span').forEach((s, i) => {
    if (getComputedStyle(s).position === 'absolute') { if (prep(s, 'scale(.6) rotate(-12deg)', 1100)) play(s, 380); return; }
    if (prep(s, 'translateY(45%)', 900)) play(s, 120 + i * 140);
  });
  const targets = [];
  const add = (el) => { if (!el.closest('h1') && !el.closest('[data-no-reveal]')) targets.push(el); };
  document.querySelectorAll('main section > *:not(h1)').forEach(add);
  document.querySelectorAll('main section li, main section article, main section tr, main > nav > a').forEach(add);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target;
      const sibs = el.parentElement ? Array.from(el.parentElement.children) : [];
      const idx = Math.max(0, sibs.indexOf(el));
      play(el, (idx % 6) * 70);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  const firstSection = document.querySelector('main section');
  const prepped = [];
  targets.forEach((el) => {
    if (firstSection && firstSection.contains(el) && el.parentElement === firstSection) return;
    const r = el.getBoundingClientRect();
    const inView = r.top < innerHeight && r.bottom > 0;
    if (!prep(el, 'translateY(28px)', 800)) return;
    prepped.push(el);
    if (inView) {
      const sibs = el.parentElement ? Array.from(el.parentElement.children) : [];
      play(el, 200 + (Math.max(0, sibs.indexOf(el)) % 6) * 70);
    } else io.observe(el);
  });
  // Failsafe: anything still hidden after load becomes visible when scrolled near, or after a timeout
  const sweep = () => prepped.forEach((el) => {
    if (el.style.opacity !== '0') return;
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 1.1 && r.bottom > -50) { io.unobserve(el); play(el, 0); }
  });
  addEventListener('scroll', sweep, { passive: true });
  setTimeout(sweep, 2500);
  // Ghost display words drift with scroll
  const ghosts = Array.from(document.querySelectorAll('[aria-hidden="true"]')).filter((g) => parseFloat(getComputedStyle(g).fontSize) > 70 && getComputedStyle(g).position === 'absolute' && !g.closest('h1'));
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ghosts.forEach((g) => {
        const r = g.parentElement.getBoundingClientRect();
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        g.style.transform = `translateX(${(p * 60).toFixed(1)}px)`;
      });
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
