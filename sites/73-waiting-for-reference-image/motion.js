(function () {
  if (window.__motion) return; window.__motion = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.7,.2,1)';
  const SEL = 'section h1,section h2,section h3,section h4,section p,section article,section li,section tr,section dl,section table,section form,section label,section nav a,section button,section a[style*="padding"],[data-reveal],[data-img]';
  const done = new WeakSet();

  // page fade in / out
  const st = document.createElement('style');
  st.textContent = '@keyframes mPage{from{opacity:0}to{opacity:1}}body{animation:mPage .6s ease both}' +
    '@keyframes mFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}' +
    '@keyframes mMarq{from{transform:translateX(0)}to{transform:translateX(-50%)}}' +
    '@keyframes mPulse{0%{box-shadow:0 0 0 0 rgba(178,131,47,.55)}100%{box-shadow:0 0 0 14px rgba(178,131,47,0)}}';
  document.head.appendChild(st);
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || reduce || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute('href');
    if (!/\.dc\.html(#.*)?$/.test(href) || href.startsWith('#')) return;
    e.preventDefault();
    document.body.style.transition = 'opacity .35s ease, transform .35s ease';
    document.body.style.opacity = '0'; document.body.style.transform = 'translateY(-8px)';
    setTimeout(() => { location.href = href; }, 320);
  }, true);
  addEventListener('pageshow', () => { document.body.style.opacity = ''; document.body.style.transform = ''; });

  // progress bar
  const bar = document.createElement('div');
  Object.assign(bar.style, { position: 'fixed', left: 0, top: 0, height: '3px', width: '100%', background: '#b2832f', transformOrigin: '0 50%', transform: 'scaleX(0)', zIndex: 200, pointerEvents: 'none' });
  document.body.appendChild(bar);

  const isImg = el => el.hasAttribute('data-img') || (el.getAttribute('style') || '').includes('repeating-linear-gradient');
  const prep = el => {
    if (done.has(el) || el.closest('header') || el.closest('[data-no-motion]')) return false;
    let p = el.parentElement;
    while (p) { if (done.has(p) && p.__mPending) return false; p = p.parentElement; }
    done.add(el); el.__mPending = true;
    if (isImg(el)) {
      el.style.clipPath = 'inset(0 100% 0 0)'; el.style.transform = 'scale(1.06)';
      el.style.transition = `clip-path 1.1s ${EASE}, transform 1.6s ${EASE}`;
    } else {
      const big = /^H[12]$/.test(el.tagName);
      el.style.opacity = '0';
      el.style.transform = big ? 'translateY(40px)' : 'translateY(24px)';
      if (big) el.style.filter = 'blur(6px)';
      el.style.transition = `opacity .9s ${EASE}, transform .9s ${EASE}, filter .9s ${EASE}`;
    }
    return true;
  };
  const show = el => {
    const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.__mPending || done.has(c)) : [];
    const i = Math.max(0, sibs.indexOf(el));
    el.style.transitionDelay = Math.min(i, 8) * 80 + 'ms';
    requestAnimationFrame(() => {
      el.style.opacity = ''; el.style.filter = '';
      el.style.transform = isImg(el) ? 'scale(1)' : 'translateY(0)';
      el.style.clipPath = isImg(el) ? 'inset(0 0% 0 0)' : '';
    });
    setTimeout(() => {
      el.__mPending = false; el.style.transition = ''; el.style.transitionDelay = '';
      if (!el.hasAttribute('data-parallax')) el.style.transform = '';
      el.style.clipPath = '';
    }, 1800 + Math.min(i, 8) * 80);
  };
  // Elements waiting to be revealed. IntersectionObserver alone is not enough: a target hidden with
  // clip-path inset(0 100% 0 0) has zero visible area, so Chromium never reports it as intersecting.
  // reveal() therefore also checks the (clip-independent) bounding box on load and on scroll.
  const waiting = new Set();
  const reveal = el => { if (!waiting.delete(el)) return; io.unobserve(el); show(el); };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) reveal(e.target); }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  const checkWaiting = () => {
    const vh = innerHeight * 0.92;
    waiting.forEach(el => {
      if (!el.isConnected) { waiting.delete(el); io.unobserve(el); return; }
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh && r.width > 0) reveal(el);
    });
  };
  const scan = root => {
    if (reduce) return;
    (root.querySelectorAll ? root.querySelectorAll(SEL) : []).forEach(el => { if (prep(el)) { waiting.add(el); io.observe(el); } });
    checkWaiting();
  };

  // count-up for numerals like 01, 02
  const countUp = root => {
    if (reduce) return;
    root.querySelectorAll('section span').forEach(s => {
      if (s.__mc || s.children.length || !/^0\d$/.test(s.textContent.trim())) return;
      s.__mc = true; const target = +s.textContent; const o = new IntersectionObserver(es => {
        if (!es[0].isIntersecting) return; o.disconnect(); let n = 0;
        const t = setInterval(() => { n++; s.textContent = String(Math.min(n, target)).padStart(2, '0'); if (n >= target) clearInterval(t); }, 90);
      }); o.observe(s);
    });
  };

  // decorative: float, pulse, marquee
  const deco = root => {
    if (reduce) return;
    root.querySelectorAll('[data-float]').forEach(el => { if (!el.__mf) { el.__mf = 1; el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-12px)' }, { transform: 'translateY(0)' }], { duration: 4200, iterations: Infinity, easing: 'ease-in-out' }); } });
    root.querySelectorAll('[data-marquee]').forEach(el => { if (!el.__mm) { el.__mm = 1; el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 32000, iterations: Infinity }); } });
    root.querySelectorAll('[data-pulse]').forEach(el => { if (!el.__mp) { el.__mp = 1; el.animate([{ boxShadow: '0 0 0 0 rgba(178,131,47,.55)' }, { boxShadow: '0 0 0 16px rgba(178,131,47,0)' }], { duration: 1800, iterations: Infinity }); } });
  };

  const run = () => { scan(document); countUp(document); deco(document); };
  let queued = false;
  new MutationObserver(() => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; run(); }); }).observe(document.documentElement, { childList: true, subtree: true });

  // scroll: progress, header shadow, parallax
  let tick = false;
  const onScroll = () => {
    if (tick) return; tick = true;
    requestAnimationFrame(() => {
      tick = false;
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
      const hd = document.querySelector('header');
      if (hd) { hd.style.transition = 'box-shadow .3s'; hd.style.boxShadow = scrollY > 10 ? '0 6px 24px rgba(29,36,51,.08)' : 'none'; }
      checkWaiting();
      // parallax only on wide screens; on phones/tablets it shifts stacked images into neighbouring content
      const para = !reduce && innerWidth >= 900;
      document.querySelectorAll('[data-parallax]').forEach(el => {
        if (el.__mPending) return;
        if (!para) { el.style.transform = ''; return; }
        const r = el.getBoundingClientRect(); const k = +el.dataset.parallax || 0.08;
        el.style.transform = `translateY(${(r.top + r.height / 2 - innerHeight / 2) * -k}px)`;
      });
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  const start = () => { run(); onScroll(); };
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', start) : start();
})();
