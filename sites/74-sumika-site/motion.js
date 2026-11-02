(() => {
  if (window.__sumikaMotion) return; window.__sumikaMotion = 1;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.8,.2,1)', BOUNCE = 'cubic-bezier(.34,1.56,.64,1)';
  const seen = new WeakSet();
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const a = e.target.__rv; if (a) a.play();
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  const idx = el => { let i = 0, s = el; while ((s = s.previousElementSibling)) i++; return i; };

  function reveal(el, kf, o = {}) {
    if (seen.has(el)) return; seen.add(el);
    const a = el.animate(kf, { duration: o.d || 900, delay: o.delay || 0, easing: o.e || EASE, fill: 'both' });
    a.pause(); el.__rv = a;
    a.onfinish = () => { a.cancel(); el.__rv = null; if (o.after) o.after(el); };
    io.observe(el);
  }
  function loop(el, kf, o = {}) {
    if (el.__loop) return;
    el.__loop = el.animate(kf, { duration: o.d || 3000, delay: o.delay || 0, iterations: Infinity, direction: 'alternate', easing: o.e || 'ease-in-out' });
  }
  function lift(el) {
    if (el.__lift) return; el.__lift = 1;
    let a;
    el.addEventListener('pointerenter', () => { a && a.cancel(); a = el.animate([{ translate: '0 0', boxShadow: '0 0 0 rgba(74,63,58,0)' }, { translate: '0 -6px', boxShadow: '0 14px 28px rgba(196,140,130,.22)' }], { duration: 320, easing: BOUNCE, fill: 'forwards' }); });
    el.addEventListener('pointerleave', () => { a && a.reverse(); });
  }

  const UP = [{ opacity: 0, translate: '0 40px' }, { opacity: 1, translate: '0 0' }];
  const POP = [{ opacity: 0, translate: '0 34px', scale: '.92' }, { opacity: 1, translate: '0 0', scale: '1' }];
  const SIDE = [{ opacity: 0, translate: '-40px 0' }, { opacity: 1, translate: '0 0' }];
  const ZOOM = [{ opacity: 0, scale: '1.18' }, { opacity: 1, scale: '1' }];
  const CLIP = [{ opacity: 0, clipPath: 'inset(0 0 100% 0)', translate: '0 20px' }, { opacity: 1, clipPath: 'inset(0 0 0% 0)', translate: '0 0' }];
  const DROP = [{ opacity: 0, translate: '0 -60px', rotate: '-12deg' }, { opacity: 1, translate: '0 0', rotate: '0deg' }];

  const rings = new Set();
  function scan() {
    const q = s => document.querySelectorAll(s);
    q('main h1').forEach(el => reveal(el, CLIP, { d: 1200, delay: 150 }));
    q('main h2').forEach(el => reveal(el, SIDE, { d: 800 }));
    q('main section > div > span, main section > div > div > span').forEach(el => { if (el.closest('li')) return; reveal(el, POP, { d: 700, e: BOUNCE }); });
    q('main p, main nav, main table, main form, main dl').forEach(el => { if (el.closest('li,a[style*="scroll-snap"]')) return; reveal(el, UP, { d: 900, delay: 120 }); });
    q('main li, main article, main details').forEach(el => {
      if (el.parentElement && el.parentElement.closest('li')) { reveal(el, POP, { d: 600, delay: 200 + (idx(el) % 8) * 60, e: BOUNCE }); return; }
      reveal(el, POP, { d: 850, delay: (idx(el) % 6) * 110, e: BOUNCE });
      if (getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)') lift(el);
    });
    q('main a[style*="scroll-snap-align"]').forEach(el => { reveal(el, POP, { d: 1000, delay: 200 + idx(el) * 140, e: BOUNCE }); lift(el); });
    q('main section > a, main section > div[style*="border-radius:4"], main section > div[style*="border-radius:3"]').forEach(el => reveal(el, UP, { d: 1000 }));
    q('main image-slot').forEach(el => reveal(el, ZOOM, { d: 1600, delay: 100 }));
    q('footer').forEach(el => reveal(el, UP, { d: 1000 }));
    q('main span[style*="vertical-rl"]').forEach(s => {
      const t = s.parentElement; if (!t || seen.has(t) || getComputedStyle(t).position !== 'absolute') return;
      reveal(t, DROP, { d: 1100, e: BOUNCE, after: el => loop(el, [{ transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }], { d: 2600 }) });
    });
    q('[aria-hidden="true"]').forEach(el => {
      if (rings.has(el) || getComputedStyle(el).borderRadius !== '50%') return;
      rings.add(el);
      loop(el, [{ transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(18deg) scale(1.08)' }], { d: 5000 + Math.random() * 3000, delay: Math.random() * -4000 });
    });
    q('main span, header span, footer span').forEach(el => {
      if (el.textContent.trim() !== '→' || el.__loop) return;
      loop(el, [{ translate: '0 0' }, { translate: '4px 0' }], { d: 700, e: 'ease-in-out' });
    });
    q('header span[style*="width:9px"], header span[style*="width:10px"]').forEach((el, i) => loop(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }], { d: 1400, delay: i * 200 }));
    const logo = document.querySelector('header a');
    if (logo && !seen.has(logo)) {
      seen.add(logo);
      [...logo.children].forEach((c, i) => c.animate([{ opacity: 0, translate: '0 30px', scale: '.6' }, { opacity: 1, translate: '0 0', scale: '1' }], { duration: 900, delay: 100 + i * 160, easing: BOUNCE, fill: 'backwards' }));
    }
  }

  function progressBar() {
    const bar = document.createElement('div');
    bar.setAttribute('aria-hidden', 'true');
    Object.assign(bar.style, { position: 'fixed', left: 0, top: 0, height: '5px', width: '100%', zIndex: 60, transformOrigin: '0 50%', transform: 'scaleX(0)', background: 'linear-gradient(90deg,#f4a8a1,#f6d384,#9ad8bd,#a9c8ee,#cdb8e6)', borderRadius: '0 4px 4px 0', pointerEvents: 'none' });
    document.body.appendChild(bar);
    let tick = false;
    const upd = () => {
      tick = false;
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
      rings.forEach(r => { r.style.translate = `0 ${(scrollY * (r.__pf || (r.__pf = (Math.random() * .2 + .08)))) * -1}px`; });
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  function start() {
    if (reduce) return;
    scan(); progressBar();
    let pending = false;
    new MutationObserver(() => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; scan(); }); })
      .observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
