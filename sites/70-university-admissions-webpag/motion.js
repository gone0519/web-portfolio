(function () {
  if (window.__motionInit) return;
  window.__motionInit = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.75,.2,1)';
  const K = {
    'fade': [{ opacity: 0 }, { opacity: 1 }],
    'fade-up': [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }],
    'fade-down': [{ opacity: 0, transform: 'translateY(-20px)' }, { opacity: 1, transform: 'none' }],
    'slide-left': [{ opacity: 0, transform: 'translateX(-60px)' }, { opacity: 1, transform: 'none' }],
    'slide-right': [{ opacity: 0, transform: 'translateX(60px)' }, { opacity: 1, transform: 'none' }],
    'from-left': [{ opacity: 0, transform: 'translateX(-30%)' }, { opacity: 1, transform: 'none' }],
    'from-right': [{ opacity: 0, transform: 'translateX(30%)' }, { opacity: 1, transform: 'none' }],
    'zoom': [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }],
    'pop': [{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1.04)', offset: .7 }, { opacity: 1, transform: 'none' }],
    'blur-in': [{ opacity: 0, filter: 'blur(14px)', transform: 'translateY(10px)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }],
    'drop': [{ opacity: 0, transform: 'translateY(-100%)' }, { opacity: 1, transform: 'none' }],
    'stripe': [{ opacity: 0, transform: 'translateY(-110%)' }, { opacity: 1, transform: 'none' }],
    'rise': [{ transform: 'translateY(110%)' }, { transform: 'none' }],
    'wipe': [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
    'tilt-in': [{ opacity: 0, transform: 'perspective(900px) rotateX(18deg) translateY(60px)' }, { opacity: 1, transform: 'none' }]
  };
  const LOOPS = {
    kenburns: [[{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }], { duration: 14000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }],
    pulse: [[{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 1600, iterations: Infinity, easing: 'ease-in-out' }],
    float: [[{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }], { duration: 2400, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }],
    marquee: [[{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 30000, iterations: Infinity, easing: 'linear' }],
    spin: [[{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 18000, iterations: Infinity, easing: 'linear' }],
    scrolldot: [[{ transform: 'translateX(0)', opacity: 0 }, { opacity: 1, offset: .2 }, { transform: 'translateX(72px)', opacity: 0 }], { duration: 1800, iterations: Infinity, easing: 'ease-in-out' }]
  };
  const prepped = new WeakSet(), looped = new WeakSet(), counted = new WeakSet();
  const cio = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, t0 = performance.now();
    if (reduce) { el.textContent = to; return; }
    const step = t => { const k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.4 }) : null;

  function play(el, extra) {
    const kf = K[el.dataset.anim] || K['fade-up'];
    const delay = (+el.dataset.delay || 0) + (extra || 0);
    el.style.opacity = '';
    el.animate(kf, { duration: +el.dataset.dur || 900, delay, easing: EASE, fill: 'backwards' });
  }
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    const counts = new Map();
    entries.filter(e => e.isIntersecting).forEach(e => {
      const el = e.target, p = el.__staggerParent;
      let extra = 0;
      if (p) { const n = counts.get(p) || 0; counts.set(p, n + 1); extra = n * (+p.dataset.stagger || 0); }
      play(el, extra);
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }) : null;

  function scan() {
    document.querySelectorAll('[data-stagger]').forEach(p => {
      Array.from(p.children).forEach(c => {
        if (!c.dataset.anim) c.dataset.anim = p.dataset.child || 'fade-up';
        c.__staggerParent = p;
      });
    });
    if (!reduce && io) document.querySelectorAll('[data-anim]').forEach(el => {
      if (prepped.has(el)) return;
      prepped.add(el);
      el.style.opacity = '0';
      io.observe(el);
    });
    if (!reduce) document.querySelectorAll('[data-loop]').forEach(el => {
      if (looped.has(el)) return;
      looped.add(el);
      const l = LOOPS[el.dataset.loop];
      if (l) el.animate(l[0], Object.assign({}, l[1], el.dataset.speed ? { duration: +el.dataset.speed } : {}));
    });
    if (cio) document.querySelectorAll('[data-count]').forEach(el => {
      if (counted.has(el)) return;
      counted.add(el);
      if (!reduce) el.textContent = '0';
      cio.observe(el);
    });
  }
  let queued = false;
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; scan(); }); } };
  new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true });

  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;left:0;top:0;height:3px;width:100%;background:#ffe600;transform-origin:0 50%;transform:scaleX(0);z-index:200;pointer-events:none';
  document.documentElement.appendChild(bar);
  function onScroll() {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    document.querySelectorAll('[data-totop]').forEach(b => {
      const show = scrollY > 400;
      b.style.transition = 'opacity .4s, transform .4s, background .2s';
      b.style.opacity = show ? '1' : '0';
      b.style.transform = show ? 'none' : 'translateY(20px)';
      b.style.pointerEvents = show ? 'auto' : 'none';
    });
    if (!reduce) document.querySelectorAll('[data-parallax]').forEach(el => {
      const r = el.getBoundingClientRect();
      el.style.transform = 'translateY(' + ((r.top + r.height / 2 - innerHeight / 2) * -(+el.dataset.parallax)) + 'px)';
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  queue();
  setTimeout(onScroll, 50);
})();
