(() => {
  if (window.__seiranAnim) return; window.__seiranAnim = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now();
  const EASE = 'cubic-bezier(.2,.7,.15,1)';
  const css = document.createElement('style');
  css.textContent = `
@keyframes gradShift{0%{background-position:0% 50%}100%{background-position:100% 50%}}
@keyframes diaIn{0%{transform:rotate(-135deg) scale(0);opacity:0}70%{transform:rotate(60deg) scale(1.25);opacity:1}100%{transform:rotate(45deg) scale(1);opacity:1}}
@keyframes dotPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.7);opacity:.55}}
@keyframes scrollLine{0%{clip-path:inset(0 0 100% 0)}50%{clip-path:inset(0 0 0 0)}100%{clip-path:inset(100% 0 0 0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes logoIn{0%{opacity:0;letter-spacing:.9em}100%{opacity:1;letter-spacing:.4em}}`;
  document.head.appendChild(css);

  // page transition overlay
  const ov = document.createElement('div');
  ov.setAttribute('aria-hidden', 'true');
  Object.assign(ov.style, { position: 'fixed', inset: '0', zIndex: '200', background: 'linear-gradient(110deg,#3a31b0,#8b31a8 55%,#df2f8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', clipPath: 'inset(0 0 0 0)', transition: `clip-path .8s ${EASE}` });
  ov.innerHTML = '<span style="font:700 22px Quicksand,sans-serif;color:#fff;letter-spacing:.4em;animation:logoIn .7s both">SEIRAN</span>';
  (document.body || document.documentElement).appendChild(ov);
  const hideOv = () => setTimeout(() => { ov.style.clipPath = 'polygon(100% 0,100% 0,100% 50%,100% 100%,100% 100%,100% 50%)'; }, reduce ? 0 : 380);
  ov.style.clipPath = 'polygon(0 0,100% 0,100% 50%,100% 100%,0 100%,0 50%)';
  if (document.readyState === 'complete') hideOv(); else { addEventListener('load', hideOv); setTimeout(hideOv, 1400); }
  addEventListener('pageshow', e => { if (e.persisted) hideOv(); });
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const url = new URL(a.getAttribute('href'), location.href);
    if (url.pathname === location.pathname || !/\.dc\.html$/.test(url.pathname)) return;
    e.preventDefault();
    ov.style.transition = 'none';
    ov.style.clipPath = 'polygon(0 0,0 0,8% 50%,0 100%,0 100%,0 50%)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ov.style.transition = `clip-path .6s ${EASE}`;
      ov.style.clipPath = 'polygon(0 0,100% 0,100% 50%,100% 100%,0 100%,0 50%)';
    }));
    setTimeout(() => { location.href = url.href; }, reduce ? 0 : 620);
  }, true);

  // scroll progress bar
  const bar = document.createElement('div');
  Object.assign(bar.style, { position: 'fixed', left: '0', top: '0', height: '3px', width: '100%', zIndex: '80', background: 'linear-gradient(90deg,#3a31b0,#df2f8a)', transformOrigin: '0 50%', transform: 'scaleX(0)', pointerEvents: 'none' });
  (document.body || document.documentElement).appendChild(bar);

  if (reduce) { addEventListener('scroll', () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; }, { passive: true }); return; }

  const TARGETS = 'h1,h2,h3,h4,p,li,tr,article,dl,form,a,button,span[style*="rotate(45deg)"]';
  const reg = new WeakSet(), seen = new WeakSet();
  const parallax = new Set();
  let heroSlot = null;
  const pending = new Set();
  const sweep = () => { pending.forEach(el => { if (!el.isConnected || el.dataset.aRev) { if (el.dataset.aRev) pending.delete(el); return; } const r = el.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight * .96 && (r.width || r.height)) { pending.delete(el); reveal(el); } }); };
  [300, 800, 1500, 2500, 4000].forEach(t => setTimeout(sweep, t));
  let batch = new Map();
  const skip = el => el.closest('header,[role="dialog"],select') || el.style.position === 'fixed';
  const hasRegAncestor = el => { for (let p = el.parentElement; p; p = p.parentElement) if (reg.has(p)) return true; return false; };

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { io.unobserve(en.target); reveal(en.target); } });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });

  function prep(el) {
    if (seen.has(el) || skip(el)) return; seen.add(el);
    const st = el.style;
    if (el.tagName === 'IMAGE-SLOT') return prepSlot(el);
    if (hasRegAncestor(el)) return;
    reg.add(el);
    const d = el.dataset;
    d.aT = st.transform; d.aO = st.opacity; d.aTr = st.transition; d.aC = st.clipPath; d.aF = st.filter;
    if (st.transform === 'rotate(45deg)') { d.aKind = 'dia'; st.opacity = '0'; }
    else if (el.tagName === 'H1') { d.aKind = 'wipe'; st.clipPath = 'inset(0 100% 0 0)'; st.opacity = '0'; st.transform = (d.aT + ' translateX(-20px)').trim(); }
    else if (/^H[23]$/.test(el.tagName)) { d.aKind = 'blur'; st.opacity = '0'; st.filter = 'blur(10px)'; st.transform = (d.aT + ' translateY(24px)').trim(); }
    else if (st.clipPath && st.clipPath.includes('polygon')) { d.aKind = 'arrow'; st.opacity = '0'; st.transform = (d.aT + ' translateX(-48px)').trim(); }
    else { d.aKind = 'up'; st.opacity = '0'; st.transform = (d.aT + ' translateY(30px)').trim(); }
    io.observe(el); pending.add(el);
  }
  function prepSlot(el) {
    const w = el.parentElement; if (!w) return;
    el.dataset.aKind = 'slot';
    const hero = !!el.closest('[data-screen-label*="Hero"]');
    el.dataset.aHero = hero ? '1' : '';
    if (!w.style.overflow) w.style.overflow = 'hidden';
    el.style.transform = `scale(${hero ? 1.16 : 1.1})`;
    if (!w.style.clipPath && !reg.has(w)) { w.dataset.aWipe = '1'; w.style.clipPath = el.parentElement.parentElement && [...w.parentElement.children].indexOf(w) % 2 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'; }
    el.addEventListener('mouseenter', () => { if (el.dataset.aDone) el.style.transform = 'scale(1.045)'; });
    el.addEventListener('mouseleave', () => { if (el.dataset.aDone) el.style.transform = 'scale(1)'; });
    if (hero) { heroSlot = w; }
    io.observe(el); pending.add(el);
  }
  function stagger(el) {
    const p = el.parentElement;
    const n = batch.get(p) || 0; batch.set(p, n + 1);
    if (batch.size === 1) requestAnimationFrame(() => { batch = new Map(); });
    const base = Math.max(0, t0 + 700 - performance.now());
    return base + Math.min(n * 90, 720);
  }
  function reveal(el) {
    if (el.dataset.aRev) return; el.dataset.aRev = '1'; io.unobserve(el);
    const d = el.dataset, st = el.style, delay = stagger(el);
    if (d.aKind === 'slot') {
      const w = el.parentElement, dur = d.aHero ? 2.6 : 1.6;
      st.transition = `transform ${dur}s ${EASE} ${delay}ms`;
      requestAnimationFrame(() => { st.transform = 'scale(1)'; });
      if (w.dataset.aWipe) { w.style.transition = `clip-path 1.2s ${EASE} ${delay}ms`; requestAnimationFrame(() => { w.style.clipPath = 'inset(0 0 0 0)'; }); setTimeout(() => { w.style.clipPath = ''; w.style.transition = ''; }, delay + 1300); }
      setTimeout(() => { st.transition = `transform .8s ${EASE}`; d.aDone = '1'; }, delay + dur * 1000);
      return;
    }
    if (d.aKind === 'dia') {
      st.animation = [st.animation, `diaIn .9s ${EASE} ${delay}ms both`].filter(Boolean).join(',');
      st.opacity = d.aO; return;
    }
    const dur = d.aKind === 'wipe' ? 1.3 : d.aKind === 'blur' ? 1.1 : .9;
    st.transition = ['opacity', 'transform', 'clip-path', 'filter'].map(p => `${p} ${dur}s ${EASE} ${delay}ms`).join(',');
    requestAnimationFrame(() => {
      st.opacity = d.aO; st.transform = d.aT; st.filter = d.aF;
      if (d.aKind === 'wipe') st.clipPath = 'inset(0 0 0 0)';
    });
    setTimeout(() => { st.transition = d.aTr; if (d.aKind === 'wipe') st.clipPath = d.aC; }, delay + dur * 1000 + 50);
  }

  function decorate(el) {
    if (el.nodeType !== 1 || el.dataset.aDeco) return;
    const st = el.style;
    if (st.backgroundImage && st.backgroundImage.includes('linear-gradient') && !st.backgroundImage.includes('rgba') && st.pointerEvents !== 'none') {
      el.dataset.aDeco = '1';
      st.backgroundSize = '220% 100%';
      st.animation = [st.animation, `gradShift ${el.tagName === 'H1' || el.tagName === 'H2' ? 5 : 7}s ease-in-out infinite alternate`].filter(Boolean).join(',');
    }
    if (el.tagName === 'SPAN' && st.borderRadius === '50%' && (st.width === '6px' || st.width === '5px')) { el.dataset.aDeco = '1'; st.animation = 'dotPulse 2.2s ease-in-out infinite'; }
    if (st.width === '1px' && parseInt(st.height) >= 80) { el.dataset.aDeco = '1'; st.animation = 'scrollLine 2.4s cubic-bezier(.6,0,.3,1) infinite'; }
    if (el.tagName === 'DIV' && st.position === 'absolute' && st.clipPath && st.background && !el.children.length && st.pointerEvents !== 'none' && el.closest('main')) { el.dataset.aDeco = '1'; parallax.add(el); }
  }

  function scan(root) {
    if (root.nodeType !== 1) return;
    decorate(root); root.querySelectorAll('[style]').forEach(decorate);
    if (root.matches(TARGETS) || root.tagName === 'IMAGE-SLOT') prep(root);
    root.querySelectorAll(TARGETS + ',image-slot').forEach(prep);
  }
  const later = new Set();
  const mo = new MutationObserver(ms => {
    ms.forEach(m => {
      m.addedNodes.forEach(n => { if (n.nodeType === 1) later.add(n); });
      if (m.type === 'attributes' && m.target.nodeType === 1 && !m.target.dataset.aDeco) decorate(m.target);
    });
    clearTimeout(mo._t); mo._t = setTimeout(() => { later.forEach(n => { if (n.isConnected) scan(n); }); later.clear(); sweep(); }, 16);
  });
  const start = () => { scan(document.body); mo.observe(document.body, { childList: true, subtree: true }); };
  if (document.body) start(); else addEventListener('DOMContentLoaded', start);

  // header hide/show, progress, parallax
  let lastY = scrollY, ticking = false;
  function onScroll() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    const hd = document.querySelector('header');
    if (hd) {
      hd.style.transition = `translate .45s ${EASE}, box-shadow .3s`;
      hd.style.translate = y > 240 && y > lastY ? '0 -100%' : '0 0';
      hd.style.boxShadow = y > 20 ? '0 6px 24px rgba(40,36,120,.08)' : 'none';
    }
    parallax.forEach(el => {
      if (!el.isConnected) return parallax.delete(el);
      const p = el.parentElement.getBoundingClientRect();
      const off = (p.top + p.height / 2 - innerHeight / 2) * -0.07;
      el.style.translate = `0 ${Math.max(-60, Math.min(60, off)).toFixed(1)}px`;
    });
    sweep(); lastY = y; ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // hero mouse parallax
  addEventListener('mousemove', e => {
    if (!heroSlot || !heroSlot.isConnected || scrollY > innerHeight) return;
    const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
    heroSlot.style.transition = 'translate 1.2s cubic-bezier(.2,.7,.2,1)';
    heroSlot.style.translate = `${(x * -14).toFixed(1)}px ${(y * -10).toFixed(1)}px`;
  }, { passive: true });
})();
