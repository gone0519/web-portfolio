(() => {
  if (window.__koyoMotion) return; window.__koyoMotion = 1;
  const css = '@keyframes mFloat{0%,100%{translate:0 0;scale:1}50%{translate:0 -22px;scale:1.12}}@keyframes mBob{0%,100%{translate:0 0}50%{translate:0 -14px}}@keyframes mSpark{0%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0deg)}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(.2) rotate(120deg)}}';
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const E = 'cubic-bezier(.16,1,.3,1)';
  const PROPS = ['opacity', 'translate', 'scale', 'filter', 'letterSpacing', 'clipPath', 'transition', 'strokeDasharray', 'strokeDashoffset'];

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); show(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });

  function hide(el, kind, delay) {
    const s = el.style, orig = {}; PROPS.forEach(p => orig[p] = s[p]);
    el.__m = { kind, delay, orig };
    s.transition = 'none';
    if (kind === 'clip') s.clipPath = 'inset(0 0 100% 0)';
    else if (kind === 'title') { s.opacity = '0'; s.letterSpacing = '0.3em'; s.filter = 'blur(14px)'; }
    else if (kind === 'blur') { s.opacity = '0'; s.filter = 'blur(10px)'; s.translate = '0 30px'; }
    else if (kind === 'zoom') { s.opacity = '0'; s.scale = '.86'; }
    else if (kind === 'path') { const L = el.getTotalLength(); el.__m.L = L; s.strokeDasharray = L; s.strokeDashoffset = L; }
    else { s.opacity = '0'; s.translate = '0 46px'; }
    // clip-path で全面を隠した要素自体は「画面に入った」と判定されないことがあるため、
    // clip / path は隠していない親要素を監視して、そこから表示させる
    const watch = kind === 'path' ? el.ownerSVGElement : kind === 'clip' ? el.parentElement : el;
    if (watch !== el) watch.__paths = (watch.__paths || []).concat(el);
    io.observe(watch);
  }
  function show(el) {
    if (el.__paths) { el.__paths.forEach(show); if (!el.__m) return; }
    const m = el.__m; if (!m) return; const s = el.style, d = m.delay;
    void el.getBoundingClientRect();
    setTimeout(() => {
      if (el.__shown) return; el.__shown = 1;
      s.transition = ['opacity 1.1s', 'translate 1.3s', 'scale 1.3s', 'filter 1.2s', 'letter-spacing 1.8s', 'clip-path 1.5s', 'stroke-dashoffset 2.6s'].map(t => `${t} ${E} ${d}ms`).join(',');
      if (m.kind === 'clip') s.clipPath = 'inset(0 0 0% 0)';
      else if (m.kind === 'path') s.strokeDashoffset = '0';
      else { s.opacity = m.orig.opacity; s.translate = m.orig.translate; s.scale = m.orig.scale; s.filter = m.orig.filter; s.letterSpacing = m.orig.letterSpacing; }
      setTimeout(() => { if (m.kind !== 'path') PROPS.forEach(p => s[p] = m.orig[p]); else s.transition = m.orig.transition; }, 2000 + d);
    }, 30);
  }
  function revealAll(inViewOnly) {
    // 画面内、またはすでに通り過ぎた（画面より上の）要素は必ず表示する
    document.querySelectorAll('[data-m]').forEach(el => { if (el.__shown) return; if (inViewOnly) { const r = el.getBoundingClientRect(); if (r.top > innerHeight) return; } io.unobserve(el); if (el.__m) el.__m.delay = 0; show(el); });
    document.querySelectorAll('svg').forEach(sv => { if (sv.__paths) sv.__paths.forEach(pp => { if (!pp.__shown) show(pp); }); });
  }

  const counters = new WeakMap();
  const SEL = 'h1,h2,h3,p,figure,article,li,form,dl,image-slot,a,nav,blockquote';
  function scan() {
    if (document.visibilityState === 'hidden') return;
    document.querySelectorAll('main section, footer').forEach(sec => {
      sec.querySelectorAll(SEL).forEach(el => {
        let t = el, kind = 'up';
        if (el.tagName === 'IMAGE-SLOT') {
          const shape = el.getAttribute('shape');
          if (shape === 'pill') { t = el.parentElement && el.parentElement.parentElement; kind = 'zoom'; }
          else if (shape === 'circle') { t = el.parentElement; kind = 'zoom'; }
          else { t = el.parentElement; kind = 'clip'; }
          if (el.id === 'hero-illustration' && !el.__bob) { el.__bob = 1; el.style.animation = 'mBob 8s ease-in-out infinite'; }
          if (shape === 'rect' && t && t.offsetHeight >= 200 && !el.__px) { el.__px = 1; t.style.overflow = 'hidden'; el.style.scale = '1.14'; px.push(el); }
        } else if (el.tagName === 'A') {
          const cs = getComputedStyle(el);
          if (!(parseFloat(cs.borderTopLeftRadius) > 200 || /Lexend/.test(cs.fontFamily))) return;
          kind = 'zoom';
        } else if (el.tagName === 'NAV' && !/パンくず/.test(el.getAttribute('aria-label') || '')) {
          if (!el.closest('footer')) return;
        }
        if (!t || t.hasAttribute('data-m') || (t.parentElement && t.parentElement.closest('[data-m]'))) return;
        if (el.tagName !== 'IMAGE-SLOT' && el.closest('[aria-hidden="true"]') && el.tagName !== 'P') return;
        if (/^H[12]$/.test(t.tagName)) kind = 'blur';
        if (t.tagName === 'P' && parseFloat(getComputedStyle(t).fontSize) >= 44) kind = 'title';
        t.setAttribute('data-m', '');
        const par = t.parentElement, n = counters.get(par) || 0; counters.set(par, n + 1);
        hide(t, kind, Math.min(n * 110, 660));
      });
      sec.querySelectorAll('svg path[fill="none"]').forEach(p => { if (!p.__d) { p.__d = 1; hide(p, 'path', 0); } });
      sec.querySelectorAll('span[aria-hidden="true"]').forEach(o => {
        if (o.__f || !/radial-gradient/.test(o.style.background) || o.offsetWidth < 80) return;
        o.__f = 1; const r = Math.random(); o.style.animation = `mFloat ${6 + r * 5}s ease-in-out ${-r * 6}s infinite`;
      });
    });
    onScroll();
  }

  const px = [];
  const bar = document.createElement('div');
  Object.assign(bar.style, { position: 'fixed', left: 0, top: 0, height: '2px', width: '100%', transformOrigin: '0 50%', transform: 'scaleX(0)', background: 'linear-gradient(90deg,#ffd27a,#E8611A)', boxShadow: '0 0 12px #E8611A', zIndex: 60, pointerEvents: 'none' });
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
      const vh = innerHeight;
      px.forEach(el => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) return; const c = (r.top + r.height / 2 - vh / 2) / vh; el.style.translate = `0 ${(-c * 40).toFixed(1)}px`; });
    });
  }

  function cursor() {
    if (!matchMedia('(pointer:fine)').matches) return;
    const glow = document.createElement('div');
    Object.assign(glow.style, { position: 'fixed', left: 0, top: 0, width: '420px', height: '420px', marginLeft: '-210px', marginTop: '-210px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,97,26,.22) 0%,rgba(232,97,26,0) 65%)', mixBlendMode: 'screen', pointerEvents: 'none', zIndex: 45, opacity: 0, transition: 'opacity .4s' });
    document.body.appendChild(glow);
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, last = 0, lx = 0, ly = 0;
    (function loop() { gx += (tx - gx) * .12; gy += (ty - gy) * .12; glow.style.transform = `translate(${gx}px,${gy}px)`; requestAnimationFrame(loop); })();
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY; glow.style.opacity = 1;
      const now = performance.now();
      if (now - last > 45 && Math.hypot(tx - lx, ty - ly) > 14) {
        last = now; lx = tx; ly = ty;
        const sz = 6 + Math.random() * 12, sp = document.createElement('span');
        Object.assign(sp.style, { position: 'fixed', left: tx + 'px', top: ty + 'px', width: sz + 'px', height: sz + 'px', pointerEvents: 'none', zIndex: 70,
          background: 'radial-gradient(circle,#fff 0 8%,rgba(255,210,122,.8) 14%,rgba(255,210,122,0) 32%),linear-gradient(90deg,rgba(255,190,110,0) 44%,#ffd27a 50%,rgba(255,190,110,0) 56%),linear-gradient(0deg,rgba(255,190,110,0) 44%,#ffd27a 50%,rgba(255,190,110,0) 56%)',
          animation: 'mSpark .9s ease-out forwards' });
        sp.style.setProperty('--dx', (Math.random() * 40 - 20) + 'px'); sp.style.setProperty('--dy', (Math.random() * 30 + 10) + 'px');
        sp.addEventListener('animationend', () => sp.remove());
        document.body.appendChild(sp);
      }
      const b = e.target.closest && e.target.closest('a,button');
      if (b && b !== mag) { release(); mag = isOrange(b) ? b : null; }
      if (!b) release();
      if (mag) { const r = mag.getBoundingClientRect(); mag.style.translate = `${((tx - r.left - r.width / 2) * .18).toFixed(1)}px ${((ty - r.top - r.height / 2) * .3).toFixed(1)}px`; }
    }, { passive: true });
    document.addEventListener('pointerleave', () => { glow.style.opacity = 0; release(); });
  }
  let mag = null; const oc = new WeakMap();
  function isOrange(el) { if (!oc.has(el)) oc.set(el, getComputedStyle(el).backgroundColor === 'rgb(232, 97, 26)'); return oc.get(el); }
  function release() { if (!mag) return; const m = mag, cur = m.style.translate || '0 0'; mag = null; m.style.translate = ''; m.animate([{ translate: cur }, { translate: '0 0' }], { duration: 500, easing: E }); }

  function init() {
    document.body.appendChild(bar);
    cursor();
    let tmr; const mo = new MutationObserver(() => { clearTimeout(tmr); tmr = setTimeout(scan, 80); });
    mo.observe(document.body, { childList: true, subtree: true });
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
    setTimeout(scan, 60);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') scan(); });
    addEventListener('beforeprint', () => revealAll(false));
    setInterval(() => revealAll(true), 1500);
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
