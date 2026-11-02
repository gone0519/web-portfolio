(function () {
  if (window.__aobaMotion) return; window.__aobaMotion = 1;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const seen = new WeakSet();
  const R = (a, b) => a + Math.random() * (b - a);
  const loop = (el, frames, dur, opts = {}) => el.animate(frames, Object.assign({ duration: dur, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: -R(0, dur) }, opts));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      play(e.target);
    });
  }, { threshold: .12 });

  function play(el) {
      pending.delete(el);
      const i = +el.dataset.mi || 0, kind = el.dataset.mk;
      const frames = kind === 'pop'
        ? [{ opacity: 0, transform: 'scale(.6) rotate(-4deg)' }, { opacity: 1, transform: 'scale(1.08) rotate(1deg)', offset: .7 }, { opacity: 1, transform: 'none' }]
        : [{ opacity: 0, transform: 'translateY(32px) scale(.96)' }, { opacity: 1, transform: 'none' }];
      const a = el.animate(frames, { duration: kind === 'pop' ? 650 : 750, delay: i * 90, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
      a.onfinish = () => { el.style.opacity = ''; a.cancel(); };
      a.oncancel = () => { el.style.opacity = ''; };
  }

  function reveal(el, kind) {
    if (seen.has(el)) return; seen.add(el);
    const sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.dataset.mi = Math.min(sib, 6); if (kind) el.dataset.mk = kind;
    if (document.visibilityState === 'hidden' || matchMedia('print').matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) { play(el); return; }
    el.style.opacity = '0';
    pending.add(el);
    io.observe(el);
  }
  const pending = new Set();
  function showAll() { pending.forEach((el) => { io.unobserve(el); el.style.opacity = ''; }); pending.clear(); }
  addEventListener('beforeprint', showAll);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') showAll(); });
  setInterval(() => { pending.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) { io.unobserve(el); play(el); } }); }, 1500);

  function hoverable(el, card) {
    if (seen.has(el)) return; seen.add(el);
    let a;
    el.addEventListener('pointerenter', () => {
      a && a.cancel();
      a = card
        ? el.animate([{ transform: 'none' }, { transform: 'translateY(-6px) rotate(-.6deg)' }], { duration: 260, easing: 'cubic-bezier(.3,1.6,.5,1)', fill: 'forwards' })
        : el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.07) translateY(-2px)', offset: .5 }, { transform: 'scale(1.03) translateY(-1px)' }], { duration: 360, easing: 'ease-out', fill: 'forwards' });
    });
    el.addEventListener('pointerleave', () => { a && a.cancel(); a = el.animate([{ transform: card ? 'translateY(-6px)' : 'scale(1.03)' }, { transform: 'none' }], { duration: 220, easing: 'ease-out' }); });
  }

  function deco(el) {
    if (seen.has(el)) return; seen.add(el);
    const s = el.style, cp = s.clipPath || s.webkitClipPath || '';
    if (cp.startsWith('polygon(0px 0px, 100% 0px, 50% 100%') || cp.startsWith('polygon(0 0,100% 0,50% 100%')) {
      s.transformOrigin = '50% 0'; loop(el, [{ transform: 'rotate(-10deg)' }, { transform: 'rotate(10deg)' }], R(1400, 2400));
    } else if (cp.includes('85% 50%')) {
      s.transformOrigin = '0 50%'; loop(el, [{ transform: 'skewY(4deg) scaleX(1)' }, { transform: 'skewY(-8deg) scaleX(.86)' }], R(700, 1100));
    } else if (cp.startsWith('polygon(50% 0') && el.parentElement && !seen.has(el.parentElement)) {
      const t = el.parentElement; seen.add(t); t.style.transformOrigin = '50% 100%';
      loop(t, [{ transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }], R(2200, 3400));
    } else if (s.borderRadius === '999px' && s.position === 'absolute' && (s.border.includes('169, 211, 222') || s.border.includes('#A9D3DE') || s.background)) {
      loop(el, [{ transform: 'translateX(-22px)' }, { transform: 'translateX(22px)' }], R(5000, 9000));
    } else if (s.borderRadius === '50%' && s.width === '12px') {
      loop(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }], R(900, 1600));
    } else if (s.width === '2px' && el.parentElement && !seen.has(el.parentElement)) {
      const f = el.parentElement; seen.add(f); f.style.transformOrigin = '50% 100%';
      loop(f, [{ transform: 'rotate(-12deg)' }, { transform: 'rotate(12deg)' }], R(1200, 2200));
    } else if (s.borderRadius === '50%' && (s.background.includes('184, 209, 106') || s.background.includes('#B8D16A')) && el.parentElement && !seen.has(el.parentElement)) {
      const t = el.parentElement; seen.add(t); t.style.transformOrigin = '50% 100%';
      loop(t, [{ transform: 'rotate(-5deg)' }, { transform: 'rotate(5deg)' }], R(2000, 3000));
    } else if (s.background.includes('repeating-linear-gradient(-55deg')) {
      el.animate([{ backgroundPosition: '0 0' }, { backgroundPosition: '40px 0' }], { duration: 1600, iterations: Infinity, easing: 'linear' });
    } else if (s.borderRadius.includes('50% 0')) {
      loop(el, [{ transform: 'rotate(-45deg) translate(0,0)' }, { transform: 'rotate(-45deg) translate(-6px,6px) scale(1.1)' }], 900);
    } else if (s.transform && s.transform.includes('rotate') && s.height === '230px') {
      const base = s.transform;
      loop(el, [{ transform: base + ' translateY(0)' }, { transform: base + ' translateY(-14px)' }], R(2600, 3600));
    }
  }

  function scan() {
    document.querySelectorAll('main article, main ol > li, main table, main form, [role=status], main section > div > p').forEach((el) => reveal(el));
    document.querySelectorAll('main h2, main h1').forEach((el) => reveal(el, 'pop'));
    document.querySelectorAll('[aria-hidden="true"] span, [aria-hidden="true"] div, [aria-hidden="true"]').forEach(deco);
    document.querySelectorAll('a, button').forEach((el) => { if (el.style.borderRadius === '999px' || el.style.borderRadius === '50%') hoverable(el, false); });
    document.querySelectorAll('header a span span, footer a span span').forEach((el) => {
      if (seen.has(el) || el.style.borderRadius !== '50%') return; seen.add(el);
      el.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(1)', offset: .9 }, { transform: 'scaleY(.1)', offset: .95 }, { transform: 'scaleY(1)' }], { duration: 4200, iterations: Infinity });
    });
    const top = document.querySelector('a[href="#pagetop"][aria-label]');
    if (top && !seen.has(top)) { seen.add(top); loop(top, [{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }], 1200, { delay: 0 }); }
    extras();
    const hdr = document.querySelector('header');
    if (hdr && !seen.has(hdr)) { seen.add(hdr); hdr.animate([{ transform: 'translateY(-100%)' }, { transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' }); }
  }

  const PAL = ['#89C2C1', '#F2A93B', '#EF9E92', '#C5D97F', '#7FCAD5', '#EDE36A'];
  const pick = () => PAL[Math.floor(Math.random() * PAL.length)];
  const fine = matchMedia('(pointer: fine)').matches;

  // enter-once effects that never hide content beforehand
  const io2 = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; io2.unobserve(e.target);
    const el = e.target, k = el.dataset.mx;
    if (k === 'mtn') el.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1.08)', offset: .7 }, { transform: 'scaleY(1)' }], { duration: 900, delay: R(0, 300), easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    if (k === 'badge') el.animate([{ transform: 'rotate(-360deg) scale(0)' }, { transform: 'rotate(0) scale(1.2)', offset: .75 }, { transform: 'none' }], { duration: 800, delay: 250 + R(0, 300), easing: 'ease-out', fill: 'backwards' });
    if (k === 'img') el.animate([{ clipPath: 'inset(0 100% 0 0 round 12px)' }, { clipPath: 'inset(0 0 0 0 round 12px)' }], { duration: 900, delay: 200, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'backwards' });
    if (k === 'chip') el.animate([{ transform: 'scale(0) rotate(-12deg)' }, { transform: 'scale(1.15)', offset: .7 }, { transform: 'none' }], { duration: 500, delay: (+el.dataset.mi || 0) * 45, easing: 'ease-out', fill: 'backwards' });
  }), { threshold: .1 });
  function enter(el, k, i) { if (el.__e) return; el.__e = 1; el.dataset.mx = k; if (i != null) el.dataset.mi = i; if (k === 'mtn') el.style.transformOrigin = '50% 100%'; io2.observe(el); }

  // parallax via independent `translate` so it stacks on transform loops
  const para = [];
  function parallax(el) { if (el.__p) return; el.__p = R(.04, .14) * (Math.random() < .5 ? -1 : 1); para.push(el); }
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - innerHeight);
      bar.style.transform = 'scaleX(' + p + ')';
      para.forEach((el) => { if (!el.isConnected) return; const r = el.getBoundingClientRect(); el.style.translate = '0 ' + ((r.top + r.height / 2 - innerHeight / 2) * el.__p).toFixed(1) + 'px'; });
    });
  }
  const bar = document.createElement('div');
  bar.setAttribute('aria-hidden', 'true');
  Object.assign(bar.style, { position: 'fixed', left: 0, top: 0, right: 0, height: '5px', zIndex: 9999, transformOrigin: '0 50%', transform: 'scaleX(0)', pointerEvents: 'none', background: 'repeating-linear-gradient(90deg,#89C2C1 0 40px,#F2A93B 40px 80px,#EF9E92 80px 120px,#C5D97F 120px 160px)' });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  // 3D tilt for cards
  function tilt(el) {
    if (el.__t) return; el.__t = 1;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transition = 'transform .08s';
      el.style.transform = 'perspective(700px) rotateX(' + (-y * 8).toFixed(2) + 'deg) rotateY(' + (x * 10).toFixed(2) + 'deg) translateY(-6px)';
    });
    el.addEventListener('pointerleave', () => { el.style.transition = 'transform .5s cubic-bezier(.3,1.6,.5,1)'; el.style.transform = ''; });
  }

  // cursor sparkles + click bursts (own nodes on body)
  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  Object.assign(layer.style, { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998, overflow: 'hidden' });
  function dot(x, y, size, shape) {
    const d = document.createElement('span');
    Object.assign(d.style, { position: 'absolute', left: x - size / 2 + 'px', top: y - size / 2 + 'px', width: size + 'px', height: size + 'px', background: pick(), borderRadius: shape === 'tri' ? '0' : '50%', clipPath: shape === 'tri' ? 'polygon(50% 0,100% 100%,0 100%)' : '' });
    layer.appendChild(d); return d;
  }
  let last = 0;
  if (fine) addEventListener('pointermove', (e) => {
    const now = performance.now(); if (now - last < 45) return; last = now;
    const d = dot(e.clientX, e.clientY, R(5, 10));
    d.animate([{ transform: 'translate(0,0) scale(1)', opacity: .9 }, { transform: 'translate(' + R(-14, 14) + 'px,' + R(-34, -14) + 'px) scale(0)', opacity: 0 }], { duration: 800, easing: 'ease-out' }).onfinish = () => d.remove();
  });
  addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('a, button'); if (!t) return;
    for (let i = 0; i < 14; i++) {
      const a = (Math.PI * 2 * i) / 14 + R(-.2, .2), dist = R(40, 90), d = dot(e.clientX, e.clientY, R(7, 12), i % 2 ? 'tri' : 'c');
      d.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * dist + 'px,' + (Math.sin(a) * dist + 20) + 'px) rotate(' + R(-360, 360) + 'deg)', opacity: 0 }], { duration: R(600, 900), easing: 'cubic-bezier(.1,.7,.3,1)' }).onfinish = () => d.remove();
    }
  }, true);

  // page transitions
  addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute('href'); if (!/\.dc\.html/.test(href) || href.startsWith('#')) return;
    e.preventDefault();
    document.body.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-16px)' }], { duration: 320, easing: 'ease-in', fill: 'forwards' }).onfinish = () => { location.href = a.href; };
  });

  // periodic heading wiggle + CTA pulse
  setInterval(() => {
    const hs = [...document.querySelectorAll('main h2')].filter((h) => { const r = h.getBoundingClientRect(); return r.top > 0 && r.bottom < innerHeight; });
    const h = hs[Math.floor(Math.random() * hs.length)];
    if (h) h.animate([{ transform: 'none' }, { transform: 'rotate(-3deg) scale(1.05)' }, { transform: 'rotate(3deg) scale(1.05)' }, { transform: 'rotate(-1deg)' }, { transform: 'none' }], { duration: 700, easing: 'ease-in-out' });
  }, 3500);

  function extras() {
    if (!bar.isConnected && document.body) { document.body.appendChild(bar); document.body.appendChild(layer); }
    document.querySelectorAll('[aria-hidden="true"] span').forEach((el) => {
      const s = el.style, cp = s.clipPath || '';
      if (s.position === 'absolute' && s.bottom === '0px' && cp.includes('100% 100%') && !cp.startsWith('polygon(50% 0')) enter(el, 'mtn');
      else if (s.position === 'absolute' && s.bottom !== '0px' && !el.__p && !cp.includes('100% 100%')) parallax(el);
    });
    document.querySelectorAll('main span').forEach((el) => {
      const s = el.style;
      if (s.borderRadius === '50%' && (s.width === '30px' || s.width === '36px' || s.width === '44px' || s.width === '16px')) enter(el, 'badge');
      else if (s.borderRadius === '999px' && (s.padding || '').length && el.parentElement && el.parentElement.style.flexWrap === 'wrap') enter(el, 'chip', Array.prototype.indexOf.call(el.parentElement.children, el));
    });
    document.querySelectorAll('main div').forEach((el) => { if ((el.style.background || '').includes('repeating-linear-gradient(45deg')) enter(el, 'img'); });
    document.querySelectorAll('main img').forEach((el) => { if (el.style.borderRadius !== '50%') enter(el, 'img'); });
    document.querySelectorAll('main article').forEach(tilt);
    document.querySelectorAll('a').forEach((el) => {
      if (el.__g) return; const bg = el.style.background || el.style.backgroundColor || '';
      if (bg.includes('242, 169, 59') || bg.includes('#F2A93B') || (el.closest('header') && el.getAttribute('href') === 'OpenCampus.dc.html')) {
        el.__g = 1; el.animate([{ boxShadow: '0 0 0 0 rgba(242,169,59,.7)' }, { boxShadow: '0 0 0 14px rgba(242,169,59,0)' }], { duration: 1600, iterations: Infinity, easing: 'ease-out' });
      }
    });
    onScroll();
  }

  let t;
  const queue = () => { clearTimeout(t); t = setTimeout(scan, 120); };
  new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', queue); else queue();
  const fadeIn = () => document.body && document.body.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: 'ease-out' });
  if (document.body) fadeIn(); else document.addEventListener('DOMContentLoaded', fadeIn);
})();
