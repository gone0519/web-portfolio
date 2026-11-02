(function () {
  const EASE = 'cubic-bezier(.2,.75,.15,1)';
  const clamp = v => Math.max(0, Math.min(1, v));
  function show(el) {
    if (el.hasAttribute('data-rvs')) return;
    el.setAttribute('data-rvs', '1');
    const t = el.dataset.rv;
    if (t === 'up') { el.style.opacity = '1'; el.style.transform = 'none'; }
    if (t === 'line') el.style.transform = 'translateY(0)';
    if (t === 'clip') el.style.clipPath = 'inset(0 0 0 0)';
    if (t === 'draw') el.style.transform = 'scaleX(1)';
  }
  function attach(isCalm) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { show(e.target.__rvChild || e.target); io.unobserve(e.target); } }), { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    let raf = 0;
    const inView = el => { const r = (el.dataset.rv === 'line' && el.parentElement ? el.parentElement : el).getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; };
    function scan() {
      document.querySelectorAll('[data-rv="line"]:not([data-rvp])').forEach(el => {
        el.setAttribute('data-rvp', '1');
        const p = el.parentElement; if (!p) return;
        const cs = getComputedStyle(p);
        p.style.paddingBottom = 'calc(' + cs.paddingBottom + ' + .22em)';
        p.style.marginBottom = 'calc(' + cs.marginBottom + ' - .22em)';
      });
      if (isCalm() || document.visibilityState !== 'visible') return;
      document.querySelectorAll('[data-rv]:not([data-rvi])').forEach(el => {
        el.setAttribute('data-rvi', '1');
        const t = el.dataset.rv, d = +(el.dataset.delay || 0);
        el.style.transition = `opacity 1s ${EASE} ${d}ms, transform 1.3s ${EASE} ${d}ms, clip-path 1.5s cubic-bezier(.75,0,.15,1) ${d}ms`;
        if (t === 'up') { el.style.opacity = '0'; el.style.transform = 'translateY(56px)'; }
        if (t === 'line') el.style.transform = 'translateY(105%)';
        if (t === 'clip') el.style.clipPath = 'inset(100% 0 0 0)';
        if (t === 'draw') { el.style.transformOrigin = 'left'; el.style.transform = 'scaleX(0)'; }
        if (inView(el)) requestAnimationFrame(() => requestAnimationFrame(() => show(el)));
        if (t === 'line' && el.parentElement) { el.parentElement.__rvChild = el; io.observe(el.parentElement); } else io.observe(el);
      });
    }
    function tick() {
      // 狭い画面では視差（縦）と横スライドを止め、要素の重なり・はみ出しを防ぐ
      const vh = window.innerHeight, calm = isCalm(), small = window.innerWidth < 760;
      document.querySelectorAll('[data-rvi]:not([data-rvs])').forEach(el => { if (inView(el)) show(el); });
      document.querySelectorAll('[data-px]').forEach(el => {
        if (calm || small) { el.style.transform = ''; return; }
        const r = el.getBoundingClientRect();
        el.style.transform = `translate3d(0,${((r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.px)).toFixed(1)}px,0)`;
      });
      document.querySelectorAll('[data-sx]').forEach(el => {
        if (calm || small) { el.style.transform = ''; return; }
        const r = el.getBoundingClientRect();
        el.style.transform = `translate3d(${((vh / 2 - r.top) * parseFloat(el.dataset.sx)).toFixed(1)}px,0,0)`;
      });
      document.querySelectorAll('[data-zoom]').forEach(el => {
        if (calm) { el.style.transform = ''; return; }
        const r = el.getBoundingClientRect();
        el.style.transform = `scale(${(1.22 - 0.22 * clamp((vh - r.top) / (vh + r.height))).toFixed(3)})`;
      });
      document.querySelectorAll('[data-prog]').forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        el.style.transform = `scaleY(${clamp((vh * 0.6 - r.top) / r.height).toFixed(3)})`;
      });
    }
    const onS = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; tick(); }); };
    window.addEventListener('scroll', onS, { passive: true });
    window.addEventListener('resize', onS);
    const mo = new MutationObserver(() => { scan(); onS(); });
    mo.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('visibilitychange', () => { scan(); tick(); });
    setTimeout(() => document.querySelectorAll('[data-rvi]:not([data-rvs])').forEach(el => { if (inView(el)) show(el); }), 2500);
    scan(); tick();
    return { scan, tick, detach() { window.removeEventListener('scroll', onS); window.removeEventListener('resize', onS); io.disconnect(); mo.disconnect(); } };
  }
  function badge(React, id, text, color, fill, ch) {
    const E = React.createElement;
    return E('div', { style: { width: '100%', height: '100%', position: 'relative' } },
      E('svg', { viewBox: '0 0 200 200', style: { width: '100%', height: '100%', animation: 'mg-spin 18s linear infinite', display: 'block' } },
        E('defs', null, E('path', { id, d: 'M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0' })),
        E('circle', { cx: 100, cy: 100, r: 99, fill, stroke: color, strokeWidth: 1 }),
        E('text', { fill: color, style: { fontFamily: 'Instrument Sans, sans-serif', fontSize: 15, letterSpacing: '0.2em', fontWeight: 600 } }, E('textPath', { href: '#' + id }, text))),
      E('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontFamily: 'Shippori Mincho, serif', fontSize: 30 } }, ch));
  }
  function marquee(React, list, size, anim, serifIdx) {
    const E = React.createElement;
    const items = [...list, ...list, ...list, ...list].map((t, i) => E('span', { key: i, style: { display: 'inline-flex', alignItems: 'center', gap: 36, paddingRight: 36, fontFamily: i % 2 === serifIdx ? 'Shippori Mincho, serif' : 'Shippori Mincho, serif', fontStyle: 'normal' } }, t, E('span', { style: { fontFamily: 'Instrument Sans, sans-serif', fontStyle: 'normal', fontSize: '0.5em' } }, '✳')));
    return E('div', { style: { display: 'flex', width: 'max-content', whiteSpace: 'nowrap', fontSize: size, animation: anim } }, items);
  }
  window.MGMotion = { attach, badge, marquee };
})();
