(() => {
  if (window.__tokiMotion) return; window.__tokiMotion = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const E = 'cubic-bezier(.22,1,.36,1)', B = 'cubic-bezier(.34,1.56,.64,1)';
  const seen = new WeakSet();
  const SEL = 'main h1, main h2, main h3, main p, main li, main article, main form, main dl, main a[style*="border-radius: 50%"], main div:has(> image-slot), footer nav a, footer li';

  const variant = el => {
    const cs = getComputedStyle(el), ff = cs.fontFamily;
    if (el.matches('div:has(> image-slot)')) return 'img';
    if (/^H[12]$/.test(el.tagName) && ff.includes('Zilla')) return 'slab';
    if (ff.includes('Shippori')) return 'mincho';
    if (el.tagName === 'LI' && cs.backgroundColor === 'rgb(230, 0, 18)') return 'card';
    if (el.tagName === 'A' && cs.borderRadius.includes('50%')) return 'pop';
    if (ff.includes('Klee')) return 'hand';
    return 'up';
  };
  const play = (el, i) => {
    const d = Math.min(i, 6) * 90;
    const v = variant(el);
    const o = { duration: 1000, easing: E, delay: d, fill: 'backwards' };
    if (v === 'slab') el.animate([{ clipPath: 'inset(0 100% 0 0)', transform: 'translateY(30px)', opacity: 0 }, { clipPath: 'inset(0 0 0 0)', transform: 'none', opacity: 1 }], { ...o, duration: 1200 });
    else if (v === 'mincho') el.animate([{ filter: 'blur(14px)', letterSpacing: '.4em', opacity: 0 }, { filter: 'blur(0)', opacity: 1 }], { ...o, duration: 1600 });
    else if (v === 'img') {
      el.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { ...o, duration: 1300 });
      const s = el.querySelector(':scope > image-slot'); s && s.animate([{ scale: 1.25 }, { scale: 1 }], { ...o, duration: 1800 });
    }
    else if (v === 'card') el.animate([{ transform: `translateY(80px) rotate(${i % 2 ? 8 : -8}deg)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { ...o, easing: B, duration: 1100 });
    else if (v === 'pop') el.animate([{ transform: 'scale(.4) rotate(-12deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { ...o, easing: B, delay: d + 200 });
    else if (v === 'hand') el.animate([{ clipPath: 'inset(0 0 100% 0)', opacity: 0 }, { clipPath: 'inset(0 0 0 0)', opacity: 1 }], { ...o, duration: 1400, delay: d + 500 });
    else el.animate([{ transform: 'translateY(44px)', opacity: 0 }, { transform: 'none', opacity: 1 }], o);
  };
  const io = new IntersectionObserver(es => {
    const vis = es.filter(e => e.isIntersecting);
    const groups = new Map();
    vis.forEach(e => { const p = e.target.parentElement; groups.set(p, (groups.get(p) || 0)); play(e.target, groups.get(p)); groups.set(p, groups.get(p) + 1); io.unobserve(e.target); });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });

  const ambient = () => {
    document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
      if (seen.has(el)) return;
      const cs = getComputedStyle(el);
      if (cs.position !== 'absolute') return;
      const w = el.offsetWidth;
      if (cs.backgroundImage.includes('radial-gradient')) { seen.add(el); el.animate([{ translate: '0 0', rotate: '0deg' }, { translate: '0 -18px', rotate: '8deg' }, { translate: '0 0', rotate: '0deg' }], { duration: 5000 + Math.random() * 3000, iterations: Infinity, easing: 'ease-in-out', delay: -Math.random() * 4000 }); }
      else if (cs.borderTopStyle === 'solid' && cs.borderRadius.includes('50%') && w > 300) { seen.add(el); el.animate([{ scale: 1, translate: '0 0' }, { scale: 1.06, translate: '20px 14px' }, { scale: 1, translate: '0 0' }], { duration: 12000, iterations: Infinity, easing: 'ease-in-out' }); el.animate([{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)' }], { duration: 2200, easing: E, fill: 'backwards' }); }
      else if (el.children.length && [...el.children].every(c => getComputedStyle(c).fontFamily.includes('Zilla'))) { seen.add(el); el.dataset.para = '1'; [...el.children].forEach((c, i) => c.animate([{ opacity: 0, translate: `${i % 2 ? 80 : -80}px 0` }, { opacity: 1, translate: '0 0' }], { duration: 1800, easing: E, delay: i * 150, fill: 'backwards', composite: 'add' })); }
    });
    document.querySelectorAll('main section:first-child image-slot[style*="inset"], #open-campus > image-slot, #oc-hero').forEach(s => {
      if (seen.has(s)) return; seen.add(s);
      s.animate([{ scale: 1.12 }, { scale: 1 }], { duration: 2400, easing: E, fill: 'backwards' });
      s.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06) translate(-1%,-1%)' }], { duration: 18000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: 2400 });
    });
    document.querySelectorAll('header').forEach(h => { if (seen.has(h)) return; seen.add(h); h.animate([{ transform: 'translateY(-100%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 900, easing: E, delay: 200, fill: 'backwards' }); });
  };

  const scan = () => {
    if (reduce) return;
    const els = [...document.querySelectorAll(SEL)];
    const set = new Set(els);
    els.forEach(el => {
      if (seen.has(el)) return;
      let p = el.parentElement, nested = false;
      while (p) { if (set.has(p)) { nested = true; break; } p = p.parentElement; }
      if (nested && !el.matches('div:has(> image-slot)')) return;
      if (el.closest('[role="dialog"]')) return;
      seen.add(el); io.observe(el);
    });
    ambient();
  };

  let bar;
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (!bar) { bar = document.createElement('div'); bar.setAttribute('aria-hidden', 'true'); Object.assign(bar.style, { position: 'fixed', top: 0, left: 0, height: '3px', width: '100%', background: '#E60012', transformOrigin: '0 50%', transform: 'scaleX(0)', zIndex: 70, pointerEvents: 'none' }); document.body.appendChild(bar); }
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    document.querySelectorAll('[data-para]').forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      const t = (r.top + r.height / 2 - innerHeight / 2);
      [...el.children].forEach((c, i) => c.style.translate = `${(i % 2 ? 1 : -1) * t * 0.12}px ${t * 0.06}px`);
    });
    document.querySelectorAll('main section:first-child h1').forEach(h1 => { if (y < innerHeight) h1.style.translate = `0 ${y * -0.25}px`; });
  };

  let t;
  const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 60); });
  const start = () => { scan(); mo.observe(document.body, { childList: true, subtree: true }); addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true }); onScroll(); };
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', start) : start();
})();
