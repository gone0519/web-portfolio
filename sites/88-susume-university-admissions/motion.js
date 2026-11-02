(() => {
  if (window.__susumeMotion) return; window.__susumeMotion = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  const EASE = 'cubic-bezier(.2,.7,.2,1)';
  const seen = new WeakSet(), reveals = new WeakSet();
  const isBg = el => { const c = getComputedStyle(el).backgroundColor; return c && c !== 'transparent' && !/rgba\(0, 0, 0, 0\)/.test(c); };
  const orange = el => getComputedStyle(el).backgroundColor === 'rgb(229, 83, 28)';

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target); e.target.__play && e.target.__play();
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  function prep(el, frames, opts, after) {
    const a = el.animate(frames, { duration: 900, easing: EASE, fill: 'both', ...opts });
    a.pause();
    el.__play = () => { a.play(); a.finished.then(() => { a.cancel(); after && after(); }).catch(() => {}); };
    io.observe(el);
  }
  const stagger = el => { const p = el.parentElement; if (!p) return 0; const i = [...p.children].indexOf(el); return (i % 6) * 110; };

  function reveal(el, kind) {
    if (seen.has(el)) return; seen.add(el); reveals.add(el);
    const d = stagger(el);
    if (kind === 'card') prep(el, [{ opacity: 0, translate: '0 48px', scale: '.96' }, { opacity: 1, translate: '0 0', scale: '1' }], { delay: d, duration: 1000 });
    else if (kind === 'title') prep(el, [{ opacity: 0, translate: '0 30px', filter: 'blur(6px)' }, { opacity: 1, translate: '0 0', filter: 'blur(0)' }], { delay: d, duration: 1100 });
    else prep(el, [{ opacity: 0, translate: '0 22px' }, { opacity: 1, translate: '0 0' }], { delay: d, duration: 800 });
  }
  const insideReveal = el => { for (let p = el.parentElement; p; p = p.parentElement) if (reveals.has(p)) return true; return false; };

  function scan() {
    const root = document.body;
    // header drop-in
    root.querySelectorAll('header').forEach(h => { if (seen.has(h)) return; seen.add(h);
      h.animate([{ opacity: 0, translate: '0 -24px' }, { opacity: 1, translate: '0 0' }], { duration: 900, easing: EASE }); });
    // decorative orange / navy bands: wipe in
    root.querySelectorAll('section > div[style*="position: absolute"], section > div > div[style*="position: absolute"]').forEach(el => {
      if (seen.has(el) || !isBg(el) || el.offsetWidth < 60) return; seen.add(el);
      const fromRight = parseFloat(getComputedStyle(el).right) === 0 && parseFloat(getComputedStyle(el).left) !== 0;
      el.style.transformOrigin = fromRight ? 'right center' : 'left center';
      prep(el, [{ scale: '0 1' }, { scale: '1 1' }], { duration: 1300, easing: 'cubic-bezier(.7,0,.2,1)' });
    });
    // cards: grid children with background
    root.querySelectorAll('section *, footer *').forEach(el => {
      if (seen.has(el)) return;
      const p = el.parentElement; if (!p) return;
      const ps = getComputedStyle(p);
      if (ps.display === 'grid' && p.children.length > 1 && isBg(el) && !orange(el) && el.offsetHeight > 60 && !insideReveal(el)) reveal(el, 'card');
    });
    root.querySelectorAll('section h1, section h2').forEach(el => { if (!insideReveal(el)) reveal(el, 'title'); });
    root.querySelectorAll('section p, section ul, section form, section figure, section label, section > div > div > a, section span[style*="Libre Caslon"], footer p, footer a, footer span').forEach(el => { if (!insideReveal(el) && !seen.has(el)) reveal(el); });
    // image wipes
    root.querySelectorAll('image-slot').forEach(img => {
      const w = img.parentElement; if (!w || seen.has(w)) return; seen.add(w);
      w.style.overflow = 'hidden';
      if (!w.style.borderRadius) w.style.borderRadius = getComputedStyle(img).borderRadius;
      prep(w, [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: 1200, delay: 150, easing: 'cubic-bezier(.7,0,.2,1)' });
      img.style.scale = '1.12';
      img.animate([{ scale: '1.3' }, { scale: '1.12' }], { duration: 1800, easing: EASE });
    });
    // badges: pop
    root.querySelectorAll('section span').forEach(el => {
      if (seen.has(el) || !orange(el)) return;
      const r = el.getBoundingClientRect(); if (r.width < 20 || r.width > 40 || Math.abs(r.width - r.height) > 2) return;
      seen.add(el);
      prep(el, [{ scale: '0', rotate: '-90deg' }, { scale: '1.25', rotate: '10deg', offset: .7 }, { scale: '1', rotate: '0deg' }], { duration: 800, delay: 450 + stagger(el.parentElement) });
    });
    // tiny section squares: spin in
    root.querySelectorAll('section span, footer span').forEach(el => {
      if (seen.has(el)) return; const r = el.getBoundingClientRect();
      if (r.width === 7 && r.height === 7) { seen.add(el); prep(el, [{ rotate: '-180deg', scale: '0' }, { rotate: '0deg', scale: '1' }], { duration: 900 }); }
    });
    // pixel squares: twinkle forever
    root.querySelectorAll('span').forEach(el => {
      if (seen.has(el)) return; const r = el.getBoundingClientRect();
      if (r.width === 12 && r.height === 12) { seen.add(el);
        el.animate([{ opacity: 1, translate: '0 0' }, { opacity: .25, translate: '0 -4px' }, { opacity: 1, translate: '0 0' }], { duration: 1600 + Math.random() * 1600, delay: Math.random() * 1500, iterations: Infinity, easing: 'ease-in-out' }); }
    });
    // quote marks float
    root.querySelectorAll('figure > span').forEach(el => { if (seen.has(el)) return; seen.add(el);
      el.animate([{ translate: '0 0' }, { translate: '0 -6px' }, { translate: '0 0' }], { duration: 2600, delay: Math.random() * 800, iterations: Infinity, easing: 'ease-in-out' }); });
    // round arrow icons nudge
    root.querySelectorAll('a span, button span').forEach(el => {
      if (seen.has(el) || el.textContent.trim() !== '→') return; seen.add(el);
      el.animate([{ translate: '0 0' }, { translate: '4px 0' }, { translate: '0 0' }], { duration: 1400, iterations: Infinity, easing: 'ease-in-out' });
    });
  }

  // scroll progress bar + hero parallax
  const bar = document.createElement('div');
  Object.assign(bar.style, { position: 'fixed', left: 0, top: 0, height: '3px', width: '100%', background: '#e5531c', transformOrigin: 'left', scale: '0 1', zIndex: 100, pointerEvents: 'none' });
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.scale = `${max > 0 ? scrollY / max : 0} 1`;
    const hero = document.querySelector('section');
    if (hero) hero.querySelectorAll('image-slot').forEach((img, i) => {
      const r = img.parentElement.getBoundingClientRect();
      const t = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      img.style.translate = `0 ${(-t * (i ? 40 : 28)).toFixed(1)}px`;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });

  let q = 0;
  const schedule = () => { if (q) return; q = requestAnimationFrame(() => { q = 0; scan(); onScroll(); }); };
  const start = () => { document.body.appendChild(bar); scan(); onScroll(); new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true }); };
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', start) : start();
})();
