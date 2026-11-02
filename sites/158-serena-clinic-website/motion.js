(function () {
  if (window.__seremaMotion) return; window.__seremaMotion = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = 'cubic-bezier(.2,.7,.2,1)', wipe = 'cubic-bezier(.7,0,.2,1)';
  const init = {
    up: el => { el.style.opacity = '0'; el.style.transform = 'translateY(40px)'; el.style.filter = 'blur(4px)'; },
    fade: el => { el.style.opacity = '0'; },
    left: el => { el.style.opacity = '0'; el.style.transform = 'translateX(-48px)'; },
    right: el => { el.style.opacity = '0'; el.style.transform = 'translateX(48px)'; },
    zoom: el => { el.style.opacity = '0'; el.style.transform = 'scale(.94)'; },
    // overflow:hidden while the slot is scaled up — clip-path alone still lets it widen the page (horizontal scroll on mobile)
    img: el => { el.__ovf = el.style.overflow; el.style.overflow = 'hidden'; el.style.clipPath = 'inset(0 100% 0 0)'; const s = el.querySelector('image-slot'); if (s) { s.style.transform = 'scale(1.18)'; s.style.transformOrigin = 'center'; } },
    line: el => { el.style.transform = 'scaleX(0)'; el.style.transformOrigin = 'left center'; },
  };
  function show(el) {
    const o = el.__orig; setTimeout(() => { if (!o) return; ['transition','transform','opacity','filter','clipPath'].forEach(k => { el.style[k] = o[k]; }); }, 2600 + (+(el.dataset.delay || 0)));
    const t = el.getAttribute('data-reveal') || 'up', d = +(el.dataset.delay || 0);
    if (t === 'img') {
      el.style.transition = `clip-path 1.5s ${wipe} ${d}ms`; el.style.clipPath = 'inset(0 0 0 0)';
      const s = el.querySelector('image-slot'); if (s) { s.style.transition = `transform 2.2s ${ease} ${d}ms`; s.style.transform = 'scale(1)'; }
      setTimeout(() => { el.style.overflow = el.__ovf || ''; }, 2300 + d);
    } else if (t === 'line') {
      el.style.transition = `transform 1.4s ${wipe} ${d + 200}ms`; el.style.transform = 'scaleX(1)';
    } else {
      el.style.transition = `opacity 1.2s ease ${d}ms, transform 1.2s ${ease} ${d}ms, filter 1.2s ease ${d}ms`;
      el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none';
    }
  }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function prepReveal(el) {
    el.setAttribute('data-rv', '1');
    if (reduce) return;
    const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal')) : [];
    if (sibs.length > 1) el.dataset.delay = Math.min(sibs.indexOf(el) * 130, 650);
    const t = el.getAttribute('data-reveal');
    if (t !== 'img' && t !== 'line') el.__orig = { transition: el.style.transition, transform: el.style.transform, opacity: el.style.opacity, filter: el.style.filter, clipPath: el.style.clipPath };
    (init[t] || init.up)(el);
    io.observe(el);
  }
  function prepIntro(el) {
    el.setAttribute('data-rv', '1');
    if (reduce) return;
    [...el.children].forEach((c, i) => c.animate(
      [{ opacity: 0, transform: 'translateY(32px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
      { duration: 1400, delay: 300 + i * 180, easing: ease, fill: 'both' }));
  }
  function prepKen(el) {
    el.setAttribute('data-rv', '1');
    if (reduce) return;
    el.style.overflow = 'hidden';
    const s = el.querySelector('image-slot') || el;
    s.animate([{ transform: 'scale(1.14)', opacity: 0 }, { transform: 'scale(1.04)', opacity: 1, offset: .35 }, { transform: 'scale(1)', opacity: 1 }], { duration: 5200, easing: 'cubic-bezier(.2,.6,.2,1)', fill: 'both' });
  }
  function prepShimmer(el) {
    el.setAttribute('data-rv', '1');
    if (reduce) return;
    el.style.backgroundSize = '220% 100%';
    el.animate([{ backgroundPosition: '0% 50%' }, { backgroundPosition: '100% 50%' }], { duration: 7000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
  }
  function prepFloat(el) {
    el.setAttribute('data-rv', '1');
    if (reduce) return;
    el.animate([{ transform: 'translate(0,0) rotate(0deg)' }, { transform: 'translate(-18px,24px) rotate(8deg)' }], { duration: 9000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
  }
  function prepZoom(el) {
    el.setAttribute('data-zm', '1');
    const s = el.querySelector('image-slot'); if (!s) return;
    s.parentElement.style.overflow = 'hidden';
    s.style.transition = `transform 1.1s ${ease}`;
    el.addEventListener('mouseenter', () => { s.style.transform = 'scale(1.06)'; });
    el.addEventListener('mouseleave', () => { s.style.transform = 'scale(1)'; });
  }
  const parallax = new Set();
  function scan() {
    document.querySelectorAll('[data-reveal]:not([data-rv])').forEach(prepReveal);
    document.querySelectorAll('[data-intro]:not([data-rv])').forEach(prepIntro);
    document.querySelectorAll('[data-kenburns]:not([data-rv])').forEach(prepKen);
    document.querySelectorAll('[data-shimmer]:not([data-rv])').forEach(prepShimmer);
    document.querySelectorAll('[data-float]:not([data-rv])').forEach(prepFloat);
    document.querySelectorAll('[data-zoom]:not([data-zm])').forEach(prepZoom);
    document.querySelectorAll('[data-parallax]').forEach(el => parallax.add(el));
  }

  let bar, top;
  function chrome() {
    bar = document.createElement('div');
    Object.assign(bar.style, { position: 'fixed', left: 0, top: 0, height: '2px', width: '100%', background: 'linear-gradient(90deg,#ecc9c4,#bfa77a)', transformOrigin: 'left', transform: 'scaleX(0)', zIndex: 80, pointerEvents: 'none' });
    top = document.createElement('button');
    top.setAttribute('aria-label', 'ページトップへ');
    top.textContent = 'TOP';
    Object.assign(top.style, { position: 'fixed', right: '20px', bottom: innerWidth < 860 ? '76px' : '28px', width: '56px', height: '56px', borderRadius: '50%', border: '1px solid #cdbfa9', background: 'rgba(255,255,255,.92)', color: '#6e5a4e', fontFamily: "'Cormorant Garamond',serif", fontSize: '12px', letterSpacing: '.14em', cursor: 'pointer', zIndex: 45, opacity: 0, transform: 'translateY(16px)', transition: 'opacity .5s, transform .5s, background .3s', pointerEvents: 'none' });
    top.onmouseenter = () => { top.style.background = '#fbf1ee'; };
    top.onmouseleave = () => { top.style.background = 'rgba(255,255,255,.92)'; };
    top.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
    document.body.append(bar, top);
  }
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
      if (top) { const on = y > 600; top.style.opacity = on ? 1 : 0; top.style.transform = on ? 'none' : 'translateY(16px)'; top.style.pointerEvents = on ? 'auto' : 'none'; }
      if (!reduce) parallax.forEach(el => {
        if (!el.isConnected) { parallax.delete(el); return; }
        const r = el.getBoundingClientRect(), k = +el.getAttribute('data-parallax') || -0.15;
        el.style.transform = `translate3d(0,${((r.top + r.height / 2) - innerHeight / 2) * k}px,0)`;
      });
    });
  }
  function start() {
    chrome(); scan();
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
  }
  if (document.body) start(); else addEventListener('DOMContentLoaded', start);
})();
