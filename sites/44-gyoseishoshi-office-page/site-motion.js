(function () {
  if (window.SiteMotion) return;
  const types = {
    up: { o: 0, t: 'translateY(36px)' }, left: { o: 0, t: 'translateX(-64px)' }, right: { o: 0, t: 'translateX(64px)' },
    zoom: { o: 0, t: 'scale(.88)' }, diamond: { o: 0, t: 'scale(.55) rotate(-8deg)' }, fade: { o: 0 },
    wipe: { c: 'inset(0 100% 0 0)' }, wipeR: { c: 'inset(0 0 0 100%)' }, wipeUp: { c: 'inset(100% 0 0 0)' },
    bar: { t: 'scaleX(0)' }, track: { o: 0, ls: '0.6em' }
  };
  const loops = {
    kenburns: 'kenburns 18s ease-in-out infinite alternate', drift: 'drift 6s ease-in-out infinite',
    shimmer: 'shimmer 3.8s ease-in-out infinite', pulse: 'pulseRing 2.6s ease-out infinite',
    scrollLine: 'scrollLine 2.4s cubic-bezier(.7,0,.3,1) infinite', spin: 'spinSlow 14s linear infinite',
    bob: 'bob 3.2s ease-in-out infinite'
  };
  const css = `@keyframes kenburns{0%{transform:scale(1.02)}100%{transform:scale(1.14) translate(-2%,-1.5%)}}
@keyframes drift{0%,100%{transform:rotate(-45deg) translateX(0)}50%{transform:rotate(-45deg) translateX(18px)}}
@keyframes shimmer{0%{transform:translateX(-120%) skewX(-20deg)}55%,100%{transform:translateX(420%) skewX(-20deg)}}
@keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(0,196,200,.45)}70%{box-shadow:0 0 0 18px rgba(0,196,200,0)}100%{box-shadow:0 0 0 0 rgba(0,196,200,0)}}
@keyframes scrollLine{0%{transform:scaleY(0);transform-origin:top}45%{transform:scaleY(1);transform-origin:top}55%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
@keyframes spinSlow{to{transform:rotate(405deg)}}
@keyframes menuIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = 'cubic-bezier(.2,.7,.2,1)', easeW = 'cubic-bezier(.77,0,.18,1)';
  let io, proxies = new Map(), reveal = true, mo, raf, started = false;

  const show = el => {
    if (el._shown) return; el._shown = true;
    const k = el.dataset.reveal || 'up', o = el._orig || {};
    el.style.opacity = o.opacity || ''; el.style.transform = o.transform || 'none';
    if ((types[k] || {}).c) el.style.clipPath = 'inset(0 0 0 0)';
    if (k === 'track') el.style.letterSpacing = o.ls || '';
  };
  const inView = p => { const r = p.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; };

  function scan() {
    if (!reduce()) document.querySelectorAll('[data-loop]').forEach(el => {
      if (el._loop) return; el._loop = true; const a = loops[el.dataset.loop]; if (a) el.style.animation = a;
    });
    if (!reveal || reduce() || !io) return;
    const fresh = [];
    document.querySelectorAll('[data-reveal]').forEach(el => {
      if (el._rv) return; el._rv = true;
      const k = el.dataset.reveal || 'up', ty = types[k] || types.up;
      let d = parseInt(el.dataset.delay || '0', 10);
      const p = el.parentElement && el.parentElement.closest('[data-stagger]');
      if (p) {
        const sibs = Array.from(p.querySelectorAll('[data-reveal]')).filter(x => x.parentElement.closest('[data-stagger]') === p && (x.parentElement === p || x.parentElement.parentElement === p));
        const i = sibs.indexOf(el), mod = parseInt(p.dataset.staggerMod || '0', 10);
        if (i >= 0) d += (mod ? i % mod : i) * parseInt(p.dataset.stagger, 10);
      }
      const dur = ty.c ? 1.2 : (k === 'diamond' ? 1.4 : 1);
      el._orig = { opacity: el.style.opacity, transform: el.style.transform, ls: el.style.letterSpacing };
      el.style.transition = `opacity ${dur}s ${ease} ${d}ms, transform ${dur}s ${ease} ${d}ms, clip-path ${dur}s ${easeW} ${d}ms, letter-spacing 1.2s ${ease} ${d}ms`;
      if (k === 'bar') el.style.transformOrigin = el.dataset.origin === 'left' ? 'left center' : 'center';
      if (ty.o === 0) el.style.opacity = '0';
      if (ty.t) el.style.transform = (k === 'zoom' && el._orig.transform) ? el._orig.transform + ' scale(.4)' : ty.t;
      if (ty.c) el.style.clipPath = ty.c;
      if (ty.ls) el.style.letterSpacing = ty.ls;
      el.getBoundingClientRect();
      const px = el.parentElement || el;
      if (!proxies.has(px)) { proxies.set(px, []); io.observe(px); }
      proxies.get(px).push(el); fresh.push([px, el]);
    });
    setTimeout(() => fresh.forEach(([px, el]) => { if (inView(px)) show(el); }), 200);
  }

  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
      const bar = document.querySelector('[data-progress]'); if (bar) bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
      const hd = document.querySelector('[data-header]'); if (hd) hd.style.boxShadow = y > 10 ? '0 8px 24px -16px rgba(0,40,50,.25)' : 'none';
      const tt = document.querySelector('[data-totop]');
      if (tt) { const on = y > 600; tt.style.opacity = on ? '1' : '0'; tt.style.transform = on ? 'none' : 'translateY(20px)'; tt.style.pointerEvents = on ? 'auto' : 'none'; }
      if (reduce()) return;
      const vh = window.innerHeight;
      document.querySelectorAll('[data-parallax]').forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        el.style.transform = `translate3d(0,${((r.top + r.height / 2) - vh / 2) * (parseFloat(el.dataset.parallax) || 0)}px,0)`;
      });
    });
  }

  window.SiteMotion = {
    init(opts) {
      reveal = !(opts && opts.reveal === false);
      if (started) { scan(); return; }
      started = true;
      if ('IntersectionObserver' in window) io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return; (proxies.get(e.target) || []).forEach(show); io.unobserve(e.target);
      }), { threshold: 0, rootMargin: '0px 0px -60px 0px' });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      let t; mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => { scan(); onScroll(); }, 80); });
      mo.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => { scan(); onScroll(); }, 40);
    }
  };
})();
