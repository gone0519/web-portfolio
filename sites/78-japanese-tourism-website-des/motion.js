// Shared scroll/entrance motion for all pages. Elements opt in via data-* attributes.
export function initMotion() {
  const q = s => Array.from(document.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.getElementById('tnm-kf')) {
    const st = document.createElement('style'); st.id = 'tnm-kf';
    st.textContent = '@keyframes kb{from{transform:scale(1)}to{transform:scale(1.07)}}@keyframes marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}@keyframes float{from{transform:translateY(-5px) rotate(45deg)}to{transform:translateY(5px) rotate(45deg)}}@keyframes flow{to{stroke-dashoffset:-90}}';
    document.head.appendChild(st);
  }
  const px = q('[data-parallax]');
  let raf = 0;
  const tick = () => { raf = 0; const vh = innerHeight; px.forEach(el => { const r = el.getBoundingClientRect(); el.style.translate = '0 ' + ((r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax)).toFixed(1) + 'px'; }); };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
  if (reduce || !('IntersectionObserver' in window)) return () => {};
  addEventListener('scroll', onScroll, { passive: true }); tick();
  q('[data-kenburns]').forEach(el => { el.style.animation = 'kb 16s ease-in-out infinite alternate'; });
  q('[data-float]').forEach(el => { el.style.animation = 'float 2.6s ease-in-out infinite alternate'; });
  q('[data-flow]').forEach(el => { el.style.animation = 'flow 6s linear infinite'; });
  q('[data-marquee]').forEach(el => { el.style.animation = 'marq 48s linear infinite'; });
  const vh = innerHeight;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; const el = e.target; io.unobserve(el);
    if (el.dataset.curtain) {
      const from = el.dataset.dir === 'up' ? 'inset(100% 0 0 0)' : 'inset(0 100% 0 0)';
      el.animate([{ clipPath: from }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1500, delay: +(el.dataset.delay || 0), easing: 'cubic-bezier(.77,0,.18,1)', fill: 'backwards' });
      el.style.clipPath = '';
    } else {
      el.animate([{ opacity: 0, transform: 'translateY(28px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 1100, delay: +(el.dataset.delay || 0), easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
      el.style.opacity = '';
    }
  }), { rootMargin: '0px 0px -8% 0px' });
  q('[data-curtain]').forEach(el => { el.style.clipPath = el.dataset.dir === 'up' ? 'inset(100% 0 0 0)' : 'inset(0 100% 0 0)'; io.observe(el); });
  q('[data-reveal]').forEach(el => { if (el.getBoundingClientRect().top < vh * 0.9 && !el.dataset.delay) return; el.style.opacity = '0'; io.observe(el); });
  return () => { removeEventListener('scroll', onScroll); io.disconnect(); cancelAnimationFrame(raf); };
}
export function loadMotion(cb) {
  import(new URL('./motion.js', document.baseURI).href).then(m => cb(m.initMotion())).catch(() => {});
}
