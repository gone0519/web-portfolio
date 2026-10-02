// Shared scroll / reveal / parallax engine for 旬彩 ひより pages.
(function () {
  const E = 'cubic-bezier(.16,1,.3,1)', B = 'cubic-bezier(.65,0,.35,1)';

  function start(opts) {
    const st = { px: [], mx: 0, my: 0, tmx: 0, tmy: 0, zoom: 1.2, tzoom: 1.2, hero: opts.hero || null, ambient: opts.ambient !== false, io: null, raf: 0, timers: [] };
    const T = (f, ms) => { const id = setTimeout(f, ms); st.timers.push(id); return id; };

    function prep(el, mode, delay) {
      el._mode = mode; el._t0 = el.style.transform || ''; el._tr0 = el.style.transition || ''; el._d = delay;
      const s = el.style;
      if (mode === 'stagger') {
        const cm = el.dataset.child || 'up', step = +(el.dataset.step || 130);
        Array.from(el.children).forEach((c, i) => prep(c, cm, delay + i * step));
        return;
      }
      if (mode === 'up') { s.opacity = '0'; s.transform = (el._t0 + ' translate3d(0,36px,0)').trim(); s.transition = 'opacity 1.3s ' + E + ', transform 1.5s ' + E; }
      else if (mode === 'left') { s.opacity = '0'; s.transform = 'translate3d(-24px,0,0)'; s.transition = 'opacity 1s ' + E + ', transform 1.2s ' + E; }
      else if (mode === 'fade') { s.opacity = '0'; s.transition = 'opacity 1.6s ease'; }
      else if (mode === 'brush') { s.opacity = '0'; s.clipPath = 'inset(0 0 100% 0)'; s.filter = 'blur(6px)'; s.transition = 'clip-path 1.7s ' + B + ', filter 1.7s ' + E + ', opacity .9s ease'; }
      else if (mode === 'brush-rl') { s.clipPath = 'inset(0 0 0 100%)'; s.filter = 'blur(4px)'; s.transition = 'clip-path 3s ' + B + ', filter 2.4s ' + E; }
      else if (mode === 'stamp') { s.opacity = '0'; s.transform = 'scale(1.7)'; s.filter = 'blur(5px)'; s.transition = 'opacity .8s ease, transform 1.1s ' + E + ', filter 1s ' + E; }
      else if (mode === 'line-y') { s.transform = 'scaleY(0)'; s.transformOrigin = 'top'; s.transition = 'transform 1.6s ' + B; }
      else if (mode === 'line-x') { s.transform = 'scaleX(0)'; s.transformOrigin = 'left'; s.transition = 'transform 1.8s ' + B; }
      s.transitionDelay = delay + 'ms';
    }
    function show(el) {
      if (el._shown) return; el._shown = true;
      if (el._mode === 'stagger') Array.from(el.children).forEach(c => c._mode && show(c));
      else if (el._mode) {
        const s = el.style;
        s.opacity = '1'; s.clipPath = 'inset(0 0 0 0)'; s.filter = 'blur(0px)'; s.transform = el._t0;
        T(() => { s.transition = el._tr0; s.transitionDelay = ''; s.clipPath = ''; s.filter = ''; }, (el._d || 0) + 3200);
      }
      if (el._img) {
        const { ov, slot } = el._img;
        ov.style.transform = 'scaleX(0)'; slot.style.transform = 'scale(1)';
        T(() => { slot.style.transform = slot._t0; slot.style.transition = slot._tr0; ov.remove(); }, 2600);
      }
    }
    function observe(el) {
      if (!st.io) st.io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { show(e.target); st.io.unobserve(e.target); } }), { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
      st.io.observe(el);
    }
    function initReveal() {
      document.querySelectorAll('[data-reveal]:not([data-rv])').forEach(el => {
        el.setAttribute('data-rv', '1');
        prep(el, el.dataset.reveal, +(el.dataset.delay || 0));
        if (el.closest('#top')) { if (st.heroShown) show(el); } else observe(el);
      });
    }
    function initImages() {
      document.querySelectorAll('image-slot:not([data-cv])').forEach(slot => {
        slot.setAttribute('data-cv', '1');
        if (slot.closest('#top')) return;
        const p = slot.parentElement; if (!p) return;
        if (getComputedStyle(p).position === 'static') p.style.position = 'relative';
        const ov = document.createElement('div');
        Object.assign(ov.style, { position: 'absolute', inset: '0', zIndex: '3', background: '#0a0908', transformOrigin: 'right', transition: 'transform 1.5s cubic-bezier(.77,0,.18,1) .15s', pointerEvents: 'none', boxShadow: 'inset 2px 0 0 #b39b5c' });
        p.appendChild(ov);
        slot._t0 = slot.style.transform || ''; slot._tr0 = slot.style.transition || '';
        slot.style.transform = 'scale(1.22)'; slot.style.transition = 'transform 2.6s ' + E + ' .15s';
        p._img = { ov, slot }; p.setAttribute('data-rv', '1');
        observe(p);
      });
    }
    function initParallax() {
      document.querySelectorAll('[data-parallax]:not([data-pxi])').forEach((el, i) => {
        el.setAttribute('data-pxi', '1');
        const base = parseFloat(el.dataset.parallax) || 0;
        const thin = el.style.width === '1px' || el.style.height === '1px';
        st.px.push({ el, s: thin ? base * (1 + (i % 3) * .6) : base, t0: el.style.transform || '' });
      });
    }
    function initAmbient() {
      const hero = document.getElementById('top'); if (!hero || !st.hero) return;
      let c = hero.querySelector('[data-ambient]');
      if (!st.ambient) { if (c) c.remove(); return; }
      if (c) return;
      c = document.createElement('div'); c.setAttribute('data-ambient', '1');
      Object.assign(c.style, { position: 'absolute', inset: '0', zIndex: '1', pointerEvents: 'none', overflow: 'hidden' });
      for (let i = 0; i < 26; i++) {
        const d = document.createElement('span'), sz = 1.2 + Math.random() * 2.6;
        Object.assign(d.style, { position: 'absolute', left: (Math.random() * 100) + '%', top: (45 + Math.random() * 60) + '%', width: sz + 'px', height: sz + 'px', borderRadius: '50%', background: 'rgba(238,210,150,.95)', boxShadow: '0 0 ' + (6 + sz * 3) + 'px rgba(235,185,110,.8)', opacity: '0' });
        c.appendChild(d);
        const dx = (Math.random() - .5) * 120, dy = -(180 + Math.random() * 260), dur = 9000 + Math.random() * 9000;
        d.animate([{ transform: 'translate(0,0)', opacity: 0 }, { opacity: .5 + Math.random() * .4, offset: .35 }, { transform: 'translate(' + dx + 'px,' + dy + 'px)', opacity: 0 }], { duration: dur, delay: -Math.random() * dur, iterations: Infinity, easing: 'ease-in-out' });
      }
      hero.appendChild(c);
    }
    function initDetails() {
      document.querySelectorAll('[data-scroll-line]:not([data-hv])').forEach(line => {
        line.setAttribute('data-hv', '1');
        line.animate([{ transform: 'translateY(-100%)' }, { transform: 'translateY(100%)' }], { duration: 2400, iterations: Infinity, easing: B });
      });
      document.querySelectorAll('a:not([data-hv])').forEach(a => {
        a.setAttribute('data-hv', '1');
        if (a.closest('header') && a.closest('nav')) {
          a.style.position = 'relative';
          const u = document.createElement('span');
          Object.assign(u.style, { position: 'absolute', left: '0', right: '0', bottom: '-8px', height: '1px', background: '#b39b5c', transform: 'scaleX(0)', transition: 'transform .6s ' + E });
          a.appendChild(u);
          a.addEventListener('mouseenter', () => { u.style.transform = 'scaleX(1)'; });
          a.addEventListener('mouseleave', () => { u.style.transform = 'scaleX(0)'; });
          return;
        }
        const sp = a.lastElementChild;
        if (!sp || a.children.length !== 1 || sp.style.height !== '1px') return;
        const w0 = sp.style.width;
        sp.style.transition = 'width .6s ' + E;
        a.addEventListener('mouseenter', () => { sp.style.width = '44px'; });
        a.addEventListener('mouseleave', () => { sp.style.width = w0; });
      });
    }
    function refresh() {
      if (!('IntersectionObserver' in window)) return;
      initReveal(); initImages(); initParallax(); initAmbient(); initDetails();
    }
    function revealHero() { st.heroShown = true; document.querySelectorAll('#top [data-reveal]').forEach(show); }

    function loop() {
      st.raf = requestAnimationFrame(loop);
      const sy = window.scrollY, vh = window.innerHeight;
      st.mx += (st.tmx - st.mx) * .05; st.my += (st.tmy - st.my) * .05; st.zoom += (st.tzoom - st.zoom) * .02;
      if (st.hero && sy < vh * 1.3) st.hero.style.transform = 'translate3d(' + st.mx.toFixed(2) + 'px,' + (sy * .32 + st.my).toFixed(2) + 'px,0) scale(' + st.zoom.toFixed(4) + ')';
      st.px = st.px.filter(o => o.el.isConnected);
      for (const o of st.px) {
        const p = o.el.parentElement; if (!p) continue;
        const r = p.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const d = (r.top + r.height / 2 - vh / 2) * o.s;
        o.el.style.transform = (o.t0 ? o.t0 + ' ' : '') + 'translate3d(0,' + d.toFixed(1) + 'px,0)';
      }
    }
    function intro() {
      let seen = false;
      try { seen = !!sessionStorage.getItem('hiyori-intro-v3'); } catch (e) {}
      if (!opts.intro || !st.hero || seen || document.hidden) { st.tzoom = 1.06; T(revealHero, 200); return; }
      try { sessionStorage.setItem('hiyori-intro-v3', '1'); } catch (e) {}
      const ov = document.createElement('div');
      Object.assign(ov.style, { position: 'fixed', inset: '0', zIndex: '200', background: '#0a0908', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' });
      ov.innerHTML = '<span data-a="seal" style="width:46px;height:46px;background:#9e3b2a;color:#f3e9dc;display:flex;align-items:center;justify-content:center;font-family:\'Shippori Mincho\',serif;font-size:21px;font-weight:600;border-radius:3px;opacity:0">旬</span>'
        + '<span data-a="name" style="font-family:\'Shippori Mincho\',serif;font-size:18px;letter-spacing:.5em;padding-left:.5em;color:#ece6da;opacity:0">旬彩 ひより</span>'
        + '<span data-a="line" style="width:140px;height:1px;background:#b39b5c;transform:scaleX(0)"></span>';
      document.body.appendChild(ov);
      const q = s => ov.querySelector('[data-a="' + s + '"]');
      q('seal').animate([{ opacity: 0, transform: 'scale(1.8)', filter: 'blur(6px)' }, { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' }], { duration: 1000, easing: E, fill: 'forwards', delay: 200 });
      q('name').animate([{ opacity: 0, letterSpacing: '.9em' }, { opacity: 1, letterSpacing: '.5em' }], { duration: 1600, easing: E, fill: 'forwards', delay: 600 });
      q('line').animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 1300, easing: B, fill: 'forwards', delay: 800 });
      T(() => {
        ov.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 1300, easing: 'cubic-bezier(.77,0,.18,1)', fill: 'forwards' });
        st.tzoom = 1.06; T(revealHero, 400); T(() => ov.remove(), 1500);
      }, 2400);
    }

    const onMove = e => { st.tmx = (e.clientX / window.innerWidth - .5) * -20; st.tmy = (e.clientY / window.innerHeight - .5) * -14; };
    window.addEventListener('mousemove', onMove, { passive: true });
    let mt = 0;
    const mo = new MutationObserver(() => { clearTimeout(mt); mt = setTimeout(refresh, 60); });
    mo.observe(document.body, { childList: true, subtree: true });
    refresh(); intro(); loop();
    T(() => { if (document.hidden) { document.querySelectorAll('[data-rv]').forEach(show); st.tzoom = 1.06; } }, 6000);

    return {
      refresh(o) { if (o && 'ambient' in o) st.ambient = o.ambient; refresh(); },
      stop() { cancelAnimationFrame(st.raf); st.timers.forEach(clearTimeout); mo.disconnect(); window.removeEventListener('mousemove', onMove); if (st.io) st.io.disconnect(); }
    };
  }
  window.HiyoriMotion = { start };
})();
