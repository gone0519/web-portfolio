(function () {
  if (window.__shirasagiMotion) return;
  window.__shirasagiMotion = true;
  if (!document.documentElement.lang) document.documentElement.lang = 'ja';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  const seen = new WeakSet();
  const V = {
    up: [{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
    pop: [{ opacity: 0, transform: 'scale(.86)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
    left: [{ opacity: 0, transform: 'translateX(-40px)' }, { opacity: 1, transform: 'none' }],
    zoom: [{ opacity: 0, transform: 'scale(.9) rotate(-3deg)' }, { opacity: 1, transform: 'none' }],
  };
  const LOOPS = {
    float: [[{ transform: 'translateY(0)' }, { transform: 'translateY(-14px)' }], { duration: 3200, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }],
    pulse: [[{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }], { duration: 1400, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }],
    nudge: [[{ transform: 'translateX(0)' }, { transform: 'translateX(5px)' }], { duration: 700, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }],
    glow: [[{ boxShadow: '0 0 0 0 rgba(245,227,90,.7)' }, { boxShadow: '0 0 0 14px rgba(245,227,90,0)' }], { duration: 1800, iterations: Infinity, easing: 'ease-out' }],
  };

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.__a && e.target.__a.play(); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function reveal(el) {
    const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
    const idx = Math.max(0, sibs.indexOf(el));
    const delay = Number(el.dataset.delay || 0) + Math.min(idx, 6) * 110;
    const a = el.animate(V[el.dataset.reveal] || V.up, { duration: 950, easing: EASE, delay, fill: 'both' });
    a.pause(); a.currentTime = 0;
    a.onfinish = () => a.cancel();
    el.__a = a; io.observe(el);
  }
  function loop(el) {
    const k = el.dataset.motion;
    if (k === 'flicker') {
      const tick = () => {
        el.animate([{ opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }], { duration: 600 + Math.random() * 900, easing: 'ease-in-out' });
        setTimeout(tick, 1200 + Math.random() * 4000);
      };
      setTimeout(tick, Math.random() * 3000); return;
    }
    const d = LOOPS[k]; if (!d) return;
    el.animate(d[0], { ...d[1], delay: -Math.random() * d[1].duration });
  }
  function sparkleZone(zone) {
    let last = 0;
    const spawn = (x, y, big) => {
      const s = document.createElement('span');
      const z = (big ? 14 : 7) + Math.random() * (big ? 12 : 8);
      const col = Math.random() < 0.35 ? '#f5e35a' : '#fff';
      s.setAttribute('aria-hidden', 'true');
      s.style.cssText = `position:absolute;left:${x - z / 2}px;top:${y - z / 2}px;width:${z}px;height:${z}px;background:${col};pointer-events:none;z-index:5;clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%);filter:drop-shadow(0 0 4px ${col})`;
      zone.appendChild(s);
      const dx = (Math.random() - 0.5) * (big ? 160 : 50), dy = (big ? -60 : 10) + Math.random() * (big ? 120 : 50);
      s.animate([{ opacity: 1, transform: 'scale(.4) rotate(0)' }, { opacity: 1, transform: 'scale(1.1) rotate(90deg)', offset: 0.3 }, { opacity: 0, transform: `translate(${dx}px,${dy}px) scale(.2) rotate(200deg)` }], { duration: big ? 1100 : 900, easing: 'ease-out' }).onfinish = () => s.remove();
    };
    const pos = (e) => { const r = zone.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    zone.addEventListener('pointermove', (e) => {
      const t = performance.now(); if (t - last < 40) return; last = t;
      const [x, y] = pos(e); spawn(x, y, false);
    });
    zone.addEventListener('click', (e) => { const [x, y] = pos(e); for (let i = 0; i < 12; i++) spawn(x, y, true); });
  }
  function progressBar() {
    const b = document.createElement('div');
    b.setAttribute('aria-hidden', 'true');
    b.style.cssText = 'position:fixed;left:0;top:0;height:4px;width:100%;z-index:100;pointer-events:none;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#f5e35a,#fff7b8);box-shadow:0 0 10px rgba(245,227,90,.8)';
    document.body.appendChild(b);
    const upd = () => { const m = document.documentElement.scrollHeight - innerHeight; b.style.transform = `scaleX(${m > 0 ? scrollY / m : 0})`; };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  function scan() {
    document.querySelectorAll('[data-reveal],[data-motion],[data-sparkle-zone]').forEach((el) => {
      if (seen.has(el)) return; seen.add(el);
      if (el.hasAttribute('data-sparkle-zone')) sparkleZone(el);
      if (reduce) return;
      if (el.hasAttribute('data-reveal')) reveal(el);
      if (el.hasAttribute('data-motion')) loop(el);
    });
  }
  let queued = false;
  const q = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; scan(); }); };
  const start = () => { if (!reduce) progressBar(); scan(); new MutationObserver(q).observe(document.body, { childList: true, subtree: true }); };
  if (document.body) start(); else addEventListener('DOMContentLoaded', start);
})();
