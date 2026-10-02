(function () {
  if (window.__aobaReveal) return; window.__aobaReveal = 1;
  const ease = 'cubic-bezier(.2,.7,.2,1)';
  const fmt = (v, d) => d ? v.toFixed(d) : Math.round(v).toLocaleString('en-US');
  const count = el => {
    const to = +el.dataset.count, d = +el.dataset.decimals || 0, t0 = performance.now();
    const tick = now => { const p = Math.min(1, (now - t0) / 1600); el.textContent = fmt(to * (1 - Math.pow(1 - p, 4)), d); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  const counters = el => el.matches('[data-count]') ? [el] : [...el.querySelectorAll('[data-count]')];
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, t = el.dataset.reveal; io.unobserve(el);
    if (t === 'img') el.style.clipPath = 'inset(0 0 0 0)';
    else if (t === 'zoom') el.style.transform = 'scale(1)';
    else { el.style.opacity = '1'; el.style.transform = 'none'; }
    counters(el).forEach(count);
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  const prep = el => {
    if (el.__rv) return; el.__rv = 1;
    const t = el.dataset.reveal, d = (el.dataset.delay || 0) + 'ms';
    if (t === 'img') { el.style.clipPath = 'inset(0 100% 0 0)'; el.style.transition = `clip-path 1.3s ${ease} ${d}`; }
    else if (t === 'zoom') { el.style.transform = 'scale(1.08)'; el.style.transition = `transform 2.6s ${ease}`; }
    else { el.style.opacity = '0'; el.style.transform = 'translateY(28px)'; el.style.transition = `opacity 1s ${ease} ${d}, transform 1s ${ease} ${d}`; }
    counters(el).forEach(c => { c.textContent = fmt(0, +c.dataset.decimals || 0); });
    requestAnimationFrame(() => io.observe(el));
  };
  let q = 0;
  const scan = () => { if (q) return; q = requestAnimationFrame(() => { q = 0; document.querySelectorAll('[data-reveal]').forEach(prep); }); };
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  scan();
})();
