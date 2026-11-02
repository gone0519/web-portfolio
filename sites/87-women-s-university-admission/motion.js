(function () {
  if (window.__korinMotion) return; window.__korinMotion = true;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.7,.2,1)';
  const done = new WeakSet();
  const isMobile = () => window.innerWidth < 760;

  /* ---------- load veil + progress bar ---------- */
  function veil() {
    const v = document.createElement('div');
    v.setAttribute('aria-hidden', 'true');
    Object.assign(v.style, { position: 'fixed', inset: '0', zIndex: '9999', pointerEvents: 'none', background: 'linear-gradient(160deg,#f6e4ee,#e4cdea 60%,#f1dde4)' });
    const m = document.createElement('div');
    m.textContent = 'KORIN';
    Object.assign(m.style, { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontFamily: "'Cormorant Garamond',serif", fontSize: '42px', letterSpacing: '.3em', color: '#c0607f' });
    v.appendChild(m);
    document.body.appendChild(v);
    m.animate([{ opacity: 0, letterSpacing: '.6em', filter: 'blur(6px)' }, { opacity: 1, letterSpacing: '.3em', filter: 'blur(0)' }], { duration: 700, easing: EASE, fill: 'both' });
    setTimeout(() => {
      v.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: 'ease', fill: 'both' }).onfinish = () => v.remove();
    }, 750);
    const bar = document.createElement('div');
    bar.setAttribute('aria-hidden', 'true');
    Object.assign(bar.style, { position: 'fixed', left: '0', top: '0', height: '2px', width: '100%', zIndex: '60', transformOrigin: '0 50%', transform: 'scaleX(0)', background: 'linear-gradient(90deg,#e98aa6,#c79ae0,#f3dcae)', pointerEvents: 'none' });
    document.body.appendChild(bar);
    const upd = () => { const h = document.documentElement.scrollHeight - window.innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')'; };
    window.addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* ---------- scroll reveal ---------- */
  const SEL = 'main section h2, main section h3, main section p, main section article, main section li, main section form, main section a, main section [style*="clip-path"], main section address';
  const pending = [];
  let flushT = 0;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { pending.push(e.target); io.unobserve(e.target); } });
    clearTimeout(flushT); flushT = setTimeout(flush, 16);
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  function flush() {
    pending.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    pending.splice(0).forEach((el, i) => {
      const a = el.__rv; if (!a) return;
      a.effect.updateTiming({ delay: Math.min(i, 8) * 90 });
      a.play();
      a.onfinish = () => { a.cancel(); };
      if (el.__img) el.__img.play();
    });
  }

  function framesFor(el) {
    const tag = el.tagName;
    if (tag === 'H2') return [{ opacity: 0, letterSpacing: '.45em', filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0)' }];
    if (/Klee One/.test(el.getAttribute('style') || '')) return [{ opacity: 0, clipPath: 'inset(0 100% 0 0)', transform: 'translateX(-10px)' }, { opacity: 1, clipPath: 'inset(0 0% 0 0)', transform: 'none' }];
    if (tag === 'ARTICLE' && el.closest('[aria-labelledby="campus-h"],[aria-labelledby="st-h"]')) { const s = (el.__i = (el.__i || Math.random() > .5 ? 1 : -1)); return [{ opacity: 0, transform: 'translateY(60px) rotate(' + 3 * s + 'deg) scale(.94)' }, { opacity: 1, transform: 'none' }]; }
    if (el.matches('[style*="clip-path"]')) return [{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'none' }];
    if (tag === 'ARTICLE' || tag === 'FORM') return [{ opacity: 0, transform: 'translateY(40px) scale(.97)' }, { opacity: 1, transform: 'none' }];
    if (tag === 'LI') return [{ opacity: 0, transform: 'translateX(-18px)' }, { opacity: 1, transform: 'none' }];
    if (tag === 'A') return [{ opacity: 0, transform: 'translateY(16px) scale(.96)' }, { opacity: 1, transform: 'none' }];
    return [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }];
  }

  function scan() {
    if (reduce) return;
    document.querySelectorAll(SEL).forEach(el => {
      if (done.has(el)) return;
      done.add(el);
      if (el.closest('#top') || el.closest('[aria-roledescription]') || el.closest('header')) return;
      let p = el.parentElement, skip = false;
      while (p && p.tagName !== 'MAIN') { if (p.__rv) { skip = true; break; } p = p.parentElement; }
      if (skip) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.2 && r.bottom > 0 && document.readyState === 'complete' && window.scrollY > 0) return;
      const a = el.animate(framesFor(el), { duration: el.tagName === 'H2' ? 1300 : 1000, easing: EASE, fill: 'both' });
      a.pause(); el.__rv = a;
      if (el.matches('[style*="clip-path"]')) {
        const img = el.querySelector('image-slot');
        if (img) { const ia = img.animate([{ transform: 'scale(1.18)', filter: 'saturate(.6) brightness(1.1)' }, { transform: 'scale(1)', filter: 'none' }], { duration: 1800, easing: EASE, fill: 'both' }); ia.pause(); ia.onfinish = () => ia.cancel(); el.__img = ia; }
      }
      io.observe(el);
    });
    enhance();
  }

  /* ---------- hero intro, loops, parallax ---------- */
  let heroDone = false;
  function hero() {
    const top = document.querySelector('main #top');
    if (!top || heroDone || reduce) return;
    const h1 = top.querySelector('h1');
    if (!h1) return;
    heroDone = true;
    const D = 900;
    const ring = [...top.children].filter(d => d.tagName === 'DIV' && /border-radius:\s*50%/.test(d.getAttribute('style') || '') && /aspect-ratio/.test(d.getAttribute('style') || '') && !/position:absolute/.test(d.getAttribute('style') || '')).sort((a, b) => b.offsetWidth - a.offsetWidth)[0];
    [...top.children].filter(d => d.tagName === 'DIV' && /position:absolute/.test(d.getAttribute('style') || '') && d.querySelector('image-slot')).forEach((d, i) => {
      d.animate([{ opacity: 0, transform: 'translateY(60px) scale(.85)', filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 1400, delay: D + 500 + i * 250, easing: EASE, fill: 'backwards' });
      d.animate([{ translate: '0 0' }, { translate: '0 ' + (i % 2 ? 12 : -12) + 'px' }, { translate: '0 0' }], { duration: 5500 + i * 900, iterations: Infinity, easing: 'ease-in-out' });
    });
    if (ring) {
      ring.animate([{ opacity: 0, scale: '.7', rotate: '-12deg', filter: 'blur(10px)' }, { opacity: 1, scale: '1', rotate: '0deg', filter: 'blur(0)' }], { duration: 1600, delay: D, easing: EASE, fill: 'backwards' });
      ring.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-14px)' }, { transform: 'translateY(0)' }], { duration: 6000, iterations: Infinity, easing: 'ease-in-out' });
      ring.animate([{ boxShadow: '0 30px 80px rgba(150,90,140,.35)' }, { boxShadow: '0 30px 110px rgba(230,160,210,.65)' }, { boxShadow: '0 30px 80px rgba(150,90,140,.35)' }], { duration: 4000, iterations: Infinity, easing: 'ease-in-out' });
      const img = ring.querySelector('image-slot');
      if (img) img.animate([{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 2600, delay: D, easing: EASE, fill: 'backwards' });
      window.addEventListener('scroll', () => { const y = Math.min(window.scrollY, 900); ring.style.translate = '0 ' + (y * 0.25) + 'px'; }, { passive: true });
    }
    h1.animate([{ opacity: 0, clipPath: 'inset(0 100% 0 0)', filter: 'blur(6px)' }, { opacity: 1, clipPath: 'inset(0 0% 0 0)', filter: 'blur(0)' }], { duration: 1800, delay: D + 700, easing: 'cubic-bezier(.6,.1,.3,1)', fill: 'backwards' });
    let k = 0;
    [...top.children].forEach(c => {
      if (c === h1 || c === ring || c.getAttribute('aria-hidden') === 'true' || /position:absolute/.test(c.getAttribute('style') || '')) return;
      if (c.tagName === 'P' && /Cormorant/.test(c.getAttribute('style') || '') && !ring) {
        c.animate([{ opacity: 0, letterSpacing: '.5em', filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 1400, delay: D, easing: EASE, fill: 'backwards' });
        return;
      }
      c.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 1100, delay: D + 1300 + k++ * 160, easing: EASE, fill: 'backwards' });
    });
    top.querySelectorAll('[aria-hidden="true"]').forEach((d, i) => {
      const st = d.getAttribute('style') || '';
      if (/conic-gradient/.test(st)) {
        d.animate([{ opacity: .5, transform: 'rotate(-3deg)' }, { opacity: 1, transform: 'rotate(3deg)' }, { opacity: .5, transform: 'rotate(-3deg)' }], { duration: 9000, iterations: Infinity, easing: 'ease-in-out' });
      } else if (/radial-gradient/.test(st)) {
        d.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(' + (i % 2 ? -40 : 40) + 'px,30px) scale(1.15)' }, { transform: 'translate(0,0) scale(1)' }], { duration: 11000 + i * 1500, iterations: Infinity, easing: 'ease-in-out' });
      }
    });
    sparkles(top);
  }

  function sparkles(top) {
    const layer = document.createElement('div');
    layer.setAttribute('aria-hidden', 'true');
    Object.assign(layer.style, { position: 'absolute', left: '0', top: '0', width: '100%', pointerEvents: 'none', zIndex: '5', overflow: 'hidden' });
    const size = () => { layer.style.height = top.offsetHeight + 'px'; };
    size(); window.addEventListener('resize', size);
    document.body.appendChild(layer);
    const n = isMobile() ? 14 : 28;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('div');
      const z = 3 + Math.random() * 7;
      Object.assign(s.style, { position: 'absolute', left: Math.random() * 100 + '%', top: (20 + Math.random() * 80) + '%', width: z + 'px', height: z + 'px', borderRadius: '50%', background: 'radial-gradient(circle,#fff 0%,rgba(255,240,250,.8) 35%,transparent 70%)', boxShadow: '0 0 ' + z * 2 + 'px rgba(255,255,255,.9)' });
      layer.appendChild(s);
      s.animate([{ transform: 'translate(0,0)', opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: .8, offset: .8 }, { transform: 'translate(' + (Math.random() * 80 - 40) + 'px,-' + (160 + Math.random() * 260) + 'px)', opacity: 0 }], { duration: 7000 + Math.random() * 8000, delay: Math.random() * 6000, iterations: Infinity, easing: 'linear' });
    }
    for (let i = 0; i < 5; i++) {
      const st = document.createElement('div');
      st.textContent = '✦';
      Object.assign(st.style, { position: 'absolute', left: (8 + Math.random() * 84) + '%', top: (10 + Math.random() * 60) + '%', color: '#fff', fontSize: (10 + Math.random() * 14) + 'px', textShadow: '0 0 12px #fff' });
      layer.appendChild(st);
      st.animate([{ opacity: 0, transform: 'scale(.4) rotate(0deg)' }, { opacity: 1, transform: 'scale(1) rotate(45deg)' }, { opacity: 0, transform: 'scale(.4) rotate(90deg)' }], { duration: 2600 + Math.random() * 2000, delay: Math.random() * 3000, iterations: Infinity, easing: 'ease-in-out' });
    }
  }

  /* ---------- per-element enhancements ---------- */
  const enh = new WeakSet();
  function enhance() {
    if (reduce) return;
    document.querySelectorAll('span[aria-hidden="true"]').forEach(s => {
      if (enh.has(s) || s.textContent.trim() !== '✦') return; enh.add(s);
      s.animate([{ opacity: .3, transform: 'scale(.6) rotate(0deg)' }, { opacity: 1, transform: 'scale(1.15) rotate(45deg)' }, { opacity: .3, transform: 'scale(.6) rotate(90deg)' }], { duration: 2800 + Math.random() * 1500, iterations: Infinity, easing: 'ease-in-out' });
    });
    document.querySelectorAll('a, button').forEach(b => {
      if (enh.has(b)) return;
      const st = b.getAttribute('style') || '';
      if (!/linear-gradient\(100deg/.test(st)) return; enh.add(b);
      b.style.backgroundSize = '220% 100%';
      b.animate([{ backgroundPosition: '0% 50%' }, { backgroundPosition: '100% 50%' }, { backgroundPosition: '0% 50%' }], { duration: 6000, iterations: Infinity, easing: 'ease-in-out' });
    });
    document.querySelectorAll('[aria-roledescription] button > span').forEach((s, i) => {
      if (enh.has(s)) return; enh.add(s);
      s.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }, { transform: 'translateY(0)' }], { duration: 5000, delay: i * 400, iterations: Infinity, easing: 'ease-in-out' });
    });
    document.querySelectorAll('main section div[style*="border-radius:50%"][style*="aspect-ratio"]').forEach(r => {
      if (enh.has(r) || r.closest('#top')) return; enh.add(r);
      r.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-12px)' }, { transform: 'translateY(0)' }], { duration: 6500, iterations: Infinity, easing: 'ease-in-out' });
    });
    document.querySelectorAll('main section article, main section a[style*="border-radius:18px"], main section a[style*="border-radius:24px"]').forEach(c => {
      if (enh.has(c) || !window.matchMedia('(hover:hover)').matches) return; enh.add(c);
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.rotate = 'none';
        c.style.transform = 'perspective(900px) rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 8) + 'deg) translateY(-4px)';
      });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
    const hd = document.querySelector('header');
    if (hd && !enh.has(hd)) { enh.add(hd); hd.animate([{ transform: 'translateY(-100%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 1000, delay: 1100, easing: EASE, fill: 'backwards' }); }
    hero();
    interactions();
    marquees();
  }

  /* ---------- extra layers ---------- */
  function petals() {
    const layer = document.createElement('div');
    layer.setAttribute('aria-hidden', 'true');
    Object.assign(layer.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '3', overflow: 'hidden' });
    document.body.appendChild(layer);
    const n = isMobile() ? 6 : 12;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('div');
      const z = 8 + Math.random() * 10;
      Object.assign(p.style, { position: 'absolute', left: Math.random() * 100 + '%', top: '-30px', width: z + 'px', height: z * 0.7 + 'px', borderRadius: '70% 0 70% 0', opacity: '.55', background: Math.random() > .5 ? 'linear-gradient(135deg,#fff,#f6bfd0)' : 'linear-gradient(135deg,#fff,#dcc2f0)' });
      layer.appendChild(p);
      const dx = Math.random() * 200 - 100;
      p.animate([{ transform: 'translate(0,0) rotate(0deg)' }, { transform: 'translate(' + dx / 2 + 'px,50vh) rotate(' + (180 + Math.random() * 180) + 'deg)', offset: .5 }, { transform: 'translate(' + dx + 'px,110vh) rotate(' + (360 + Math.random() * 360) + 'deg)' }], { duration: 14000 + Math.random() * 12000, delay: Math.random() * 14000, iterations: Infinity, easing: 'linear' });
    }
  }

  function marquees() {
    const secs = [...document.querySelectorAll('main > section')].filter(s => s.id !== 'top' && s.offsetHeight > 400);
    secs.forEach((s, i) => {
      if (enh.has(s)) return; enh.add(s);
      const lay = document.createElement('div');
      lay.setAttribute('aria-hidden', 'true');
      Object.assign(lay.style, { position: 'absolute', left: '0', width: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: '1', height: '160px', mixBlendMode: 'soft-light' });
      const t = document.createElement('div');
      const word = ['ABOUT', 'ACADEMICS', 'CAMPUS LIFE', 'ADMISSIONS', 'KORIN'][i % 5];
      t.textContent = (word + '  ✦  ').repeat(8);
      Object.assign(t.style, { whiteSpace: 'nowrap', fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(70px,11vw,150px)', letterSpacing: '.12em', color: '#fff', opacity: '.5', lineHeight: '160px' });
      lay.appendChild(t);
      document.body.appendChild(lay);
      const place = () => { const r = s.getBoundingClientRect(); lay.style.top = (r.top + window.scrollY + (i % 2 ? r.height - 200 : 20)) + 'px'; };
      place(); new ResizeObserver(place).observe(document.body);
      t.animate([{ transform: 'translateX(' + (i % 2 ? -50 : 0) + '%)' }, { transform: 'translateX(' + (i % 2 ? 0 : -50) + '%)' }], { duration: 60000, iterations: Infinity, easing: 'linear' });
    });
  }

  let lastY = window.scrollY, vel = 0, raf = 0;
  function scrollFx() {
    let frames = [], arcs = [];
    const collect = () => {
      frames = [...document.querySelectorAll('main section [style*="clip-path"]')];
      arcs = [...document.querySelectorAll('main section > div')].filter(d => /border-radius:50% 50% 0 0/.test(d.getAttribute('style') || ''));
    };
    collect(); setInterval(collect, 2000);
    const tick = () => {
      const y = window.scrollY; vel += ((y - lastY) - vel) * 0.15; lastY = y;
      const vh = window.innerHeight;
      frames.forEach(f => {
        const r = f.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        const img = f.querySelector('image-slot');
        if (img) { img.style.scale = '1.14'; img.style.translate = '0 ' + (p * -40) + 'px'; }
        f.style.rotate = Math.max(-1.5, Math.min(1.5, vel * 0.04)) + 'deg';
      });
      arcs.forEach(a => {
        const r = a.getBoundingClientRect(); if (r.top > vh || r.bottom < 0) return;
        const p = Math.max(0, Math.min(1, 1 - r.top / vh));
        const ry = Math.round(90 - p * 60);
        a.style.borderRadius = '50% 50% 0 0 / ' + ry + 'px ' + ry + 'px 0 0';
      });
      if (Math.abs(vel) > 0.1) raf = requestAnimationFrame(tick); else raf = 0;
    };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
    tick();
  }

  function interactions() {
    const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    document.querySelectorAll('a[style*="border-radius:999px"], button[style*="border-radius:999px"], button[style*="border-radius:50%"]').forEach(b => {
      if (enh.has(b) || b.closest('[aria-roledescription]') && b.getAttribute('aria-label') && /表示$/.test(b.getAttribute('aria-label'))) return; enh.add(b);
      if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
      b.style.overflow = 'hidden';
      b.addEventListener('click', e => {
        const r = b.getBoundingClientRect(); const z = Math.max(r.width, r.height) * 2;
        const d = document.createElement('span');
        Object.assign(d.style, { position: 'absolute', left: e.clientX - r.left - z / 2 + 'px', top: e.clientY - r.top - z / 2 + 'px', width: z + 'px', height: z + 'px', borderRadius: '50%', background: 'rgba(255,255,255,.55)', pointerEvents: 'none' });
        b.appendChild(d);
        d.animate([{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }], { duration: 700, easing: 'ease-out' }).onfinish = () => d.remove();
      });
      if (!fine) return;
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.15) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.25) + 'px'; });
      b.addEventListener('pointerleave', () => { b.animate([{ translate: b.style.translate || '0 0' }, { translate: '0 0' }], { duration: 400, easing: EASE }); b.style.translate = '0 0'; });
    });
    document.querySelectorAll('image-slot').forEach(img => {
      if (enh.has(img) || !fine) return; enh.add(img);
      const host = img.parentElement; if (!host) return;
      host.addEventListener('pointerenter', () => img.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.08) saturate(1.1)' }], { duration: 500, fill: 'forwards', easing: EASE }));
      host.addEventListener('pointerleave', () => img.animate([{ filter: 'brightness(1.08) saturate(1.1)' }, { filter: 'none' }], { duration: 500, fill: 'forwards', easing: EASE }));
    });
    document.querySelectorAll('div[style*="#c9a36a"]').forEach(g => {
      if (enh.has(g)) return; enh.add(g);
      g.style.backgroundSize = '250% 250%';
      g.animate([{ backgroundPosition: '0% 0%' }, { backgroundPosition: '100% 100%' }, { backgroundPosition: '0% 0%' }], { duration: 5000 + Math.random() * 2000, iterations: Infinity, easing: 'ease-in-out' });
    });
    document.querySelectorAll('h2').forEach(h => {
      if (enh.has(h)) return; enh.add(h);
      h.animate([{ textShadow: '0 0 0 rgba(255,255,255,0)' }, { textShadow: '0 0 18px rgba(255,255,255,.9)' }, { textShadow: '0 0 0 rgba(255,255,255,0)' }], { duration: 4200, delay: Math.random() * 2000, iterations: Infinity, easing: 'ease-in-out' });
    });
    const live = document.querySelector('[aria-live="polite"]');
    if (live && !enh.has(live)) {
      enh.add(live);
      let t = 0;
      new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => {
        [...live.children].forEach((c, i) => c.animate([{ opacity: 0, transform: 'translateY(16px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 700, delay: i * 70, easing: EASE, fill: 'backwards' }));
      }, 10); }).observe(live, { subtree: true, characterData: true, childList: true });
    }
  }

  function pageTransitions() {
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.metaKey || e.ctrlKey || a.target) return;
      const href = a.getAttribute('href');
      if (!/\.dc\.html/.test(href) || href.startsWith('#')) return;
      const here = location.pathname.split('/').pop();
      if (decodeURIComponent(href.split('#')[0]) === decodeURIComponent(here)) return;
      e.preventDefault();
      const v = document.createElement('div');
      Object.assign(v.style, { position: 'fixed', inset: '0', zIndex: '9999', pointerEvents: 'none', background: 'linear-gradient(160deg,#f6e4ee,#e4cdea 60%,#f1dde4)' });
      document.body.appendChild(v);
      v.animate([{ clipPath: 'circle(0% at ' + e.clientX + 'px ' + e.clientY + 'px)' }, { clipPath: 'circle(150% at ' + e.clientX + 'px ' + e.clientY + 'px)' }], { duration: 650, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'both' }).onfinish = () => { location.href = a.href; };
    }, true);
  }

  /* ---------- cursor sparkle trail ---------- */
  function trail() {
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    let last = 0;
    window.addEventListener('pointermove', e => {
      const now = performance.now(); if (now - last < 45) return; last = now;
      const d = document.createElement('div');
      const z = 4 + Math.random() * 6;
      Object.assign(d.style, { position: 'fixed', left: e.clientX - z / 2 + 'px', top: e.clientY - z / 2 + 'px', width: z + 'px', height: z + 'px', borderRadius: '50%', pointerEvents: 'none', zIndex: '9998', background: Math.random() > .5 ? '#f3a6c0' : '#d3b0ec', boxShadow: '0 0 10px #fff' });
      document.body.appendChild(d);
      d.animate([{ opacity: .9, transform: 'translate(0,0) scale(1)' }, { opacity: 0, transform: 'translate(' + (Math.random() * 30 - 15) + 'px,' + (10 + Math.random() * 25) + 'px) scale(.2)' }], { duration: 900, easing: 'ease-out' }).onfinish = () => d.remove();
    }, { passive: true });
  }

  function start() {
    if (!reduce) { veil(); trail(); petals(); pageTransitions(); }
    scan();
    if (!reduce) setTimeout(scrollFx, 400);
    let t = 0;
    new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 60); }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
