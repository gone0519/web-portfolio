(() => {
  if (window.__seiranMotion) return; window.__seiranMotion = true;
  if (!('animate' in Element.prototype)) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.8,.2,1)', BACK = 'cubic-bezier(.34,1.56,.64,1)';
  const K = {
    up:   { f: [{ opacity: 0, translate: '0 48px' }, { opacity: 1, translate: '0 0' }], d: 900, e: EASE },
    pop:  { f: [{ opacity: 0, translate: '0 36px', scale: '.9', clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, translate: '0 0', scale: '1', clipPath: 'inset(0 0 -20% 0)' }], d: 900, e: BACK },
    wipe: { f: [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], d: 1000, e: 'cubic-bezier(.77,0,.18,1)' },
    chip: { f: [{ opacity: 0, scale: '.4', rotate: '-8deg' }, { opacity: 1, scale: '1', rotate: '0deg' }], d: 600, e: BACK },
    side: { f: [{ opacity: 0, translate: '-40px 0' }, { opacity: 1, translate: '0 0' }], d: 800, e: EASE }
  };
  const seen = new WeakSet(), pending = new Map();
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const a = pending.get(en.target); if (a) { a.play(); pending.delete(en.target); }
    io.unobserve(en.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  const sibIndex = (el, kind) => {
    const p = el.parentElement; if (!p) return 0;
    let i = 0; for (const c of p.children) { if (c === el) break; if (c.dataset.mk === kind) i++; }
    return i;
  };
  const reveal = (el, kind, extraDelay = 0, step = 90) => {
    if (seen.has(el)) return; seen.add(el); el.dataset.mk = kind;
    const k = K[kind], delay = Math.min(sibIndex(el, kind), 8) * step + extraDelay;
    const a = el.animate(k.f, { duration: k.d, easing: k.e, delay, fill: 'both' });
    a.pause();
    a.onfinish = () => { a.cancel(); el.dispatchEvent(new Event('mk:done')); };
    pending.set(el, a); io.observe(el);
  };
  const tagged = el => { for (let p = el.parentElement; p; p = p.parentElement) if (p.dataset && p.dataset.mk && p.dataset.mk !== 'wipe') return true; return false; };
  const scopes = () => document.querySelectorAll('main, footer, section[aria-label]');
  const bg = el => getComputedStyle(el).backgroundColor;

  const loops = new WeakSet();
  const loop = (el, f, o) => { if (loops.has(el)) return; loops.add(el); el.animate(f, Object.assign({ iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }, o)); };
  const hovers = new WeakSet();
  const lift = el => {
    if (hovers.has(el)) return; hovers.add(el);
    let a;
    el.addEventListener('pointerenter', () => { a && a.cancel(); a = el.animate([{ translate: '0 0', rotate: '0deg' }, { translate: '0 -8px', rotate: '-.6deg' }], { duration: 320, easing: BACK, fill: 'forwards' }); });
    el.addEventListener('pointerleave', () => { a && a.cancel(); a = el.animate([{ translate: '0 -8px', rotate: '-.6deg' }, { translate: '0 0', rotate: '0deg' }], { duration: 380, easing: EASE }); });
  };
  const circles = new Set();

  const scan = () => {
    // looping background type & dots
    document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
      const s = el.getAttribute('style') || '';
      if (s.includes('text-stroke')) {
        if (s.includes('rotate(')) loop(el, [{ translate: '0 -40px', opacity: .55 }, { translate: '0 40px', opacity: 1 }], { duration: 7000 + Math.random() * 3000 });
        else loop(el, [{ translate: '0 0' }, { translate: '-38% 0' }], { duration: 38000 + Math.random() * 10000, easing: 'linear' });
      } else if (s.includes('radial-gradient')) {
        loop(el, [{ rotate: '0deg' }, { rotate: '360deg' }], { duration: 140000, direction: 'normal', easing: 'linear' });
        circles.add(el);
      }
    });
    scopes().forEach(sc => {
      sc.querySelectorAll('article').forEach(el => { if (!tagged(el)) { reveal(el, 'up'); lift(el); } });
      sc.querySelectorAll('[style*="box-shadow"]').forEach(el => {
        if (el.tagName === 'A' || el.tagName === 'BUTTON' || seen.has(el) || tagged(el)) return;
        if (el.closest('header')) return;
        reveal(el, 'up');
      });
      sc.querySelectorAll('h1, h2').forEach(el => { if (!tagged(el)) reveal(el, 'pop', 0, 0); });
      sc.querySelectorAll('[style*="repeating-linear-gradient"]').forEach(el => reveal(el, 'wipe', 250, 120));
      sc.querySelectorAll('span[style*="999px"]').forEach(el => { if (!tagged(el)) reveal(el, 'chip', 0, 35); });
      sc.querySelectorAll('a[style*="999px"], nav > a').forEach(el => { if (!tagged(el)) reveal(el, 'side', 150, 80); });
      sc.querySelectorAll('ol > li').forEach(el => { if (!tagged(el)) reveal(el, 'side', 0, 90); });
      sc.querySelectorAll('p').forEach(el => { if (!tagged(el) && !el.closest('[data-mk]')) reveal(el, 'up', 120, 0); });
    });
    // hero card float after it lands
    const heroCard = document.querySelector('#top [data-mk="up"]');
    if (heroCard && !heroCard.__float) {
      heroCard.__float = true;
      heroCard.addEventListener('mk:done', () => loop(heroCard, [{ translate: '0 0', rotate: '0deg' }, { translate: '0 -10px', rotate: '.4deg' }], { duration: 3200 }), { once: true });
    }
    // orange OC CTA pulse
    document.querySelectorAll('a[href*="OpenCampus"], a[href="#reserve"], button[type="submit"]').forEach(el => {
      if (bg(el) === 'rgb(221, 67, 24)' && !loops.has(el)) {
        loops.add(el);
        el.animate([{ scale: '1' }, { scale: '1.045' }, { scale: '1' }, { scale: '1' }], { duration: 2600, iterations: Infinity, easing: 'ease-in-out' });
      }
    });
    // header slide-in
    document.querySelectorAll('header').forEach(h => { if (!h.__in) { h.__in = true; h.animate([{ translate: '0 -100%' }, { translate: '0 0' }], { duration: 500, easing: EASE }); } });
  };

  let raf = 0;
  const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; scan(); }); };

  const bar = document.createElement('div');
  bar.setAttribute('aria-hidden', 'true');
  Object.assign(bar.style, { position: 'fixed', top: '0', left: '0', right: '0', height: '4px', background: '#DD4318', transformOrigin: '0 50%', transform: 'scaleX(0)', zIndex: '80', pointerEvents: 'none' });
  // fail-safe: play anything already on screen even if IntersectionObserver never fires
  const flush = () => pending.forEach((a, el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) { a.play(); pending.delete(el); io.unobserve(el); }
  });
  const onScroll = () => {
    flush();
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    if (!reduce) circles.forEach(c => { const r = c.getBoundingClientRect(); c.style.translate = `0 ${((r.top + r.height / 2) - innerHeight / 2) * -0.18}px`; });
  };
  const start = () => {
    document.body.appendChild(bar);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (reduce) return;
    scan();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    setInterval(flush, 500);
  };
  document.body ? start() : addEventListener('DOMContentLoaded', start);
})();
