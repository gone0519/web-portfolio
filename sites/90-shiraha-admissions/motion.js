export function initMotion(root = document) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const anims = [];
  const timers = [];
  const sel = 'main h1, main h2, main h3, main p, main article, main li, main details, main ol, main ul, main [style*="aspect-ratio"], main a[style*="999px"], aside [style*="top:26%"], aside [style*="top:50%"], aside [style*="aspect-ratio"]';
  const all = [...root.querySelectorAll(sel)].filter(el => !el.dataset.mDone);
  const set = new Set(all);
  const els = all.filter(el => {
    if (el.dataset.mPending) return true;
    if (el.style.transform) return false;
    for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false;
    return true;
  });
  const reveal = (el, delay) => {
    if (el.dataset.mDone) return;
    el.dataset.mDone = '1';
    delete el.dataset.mPending;
    el.style.transition = `opacity 1s cubic-bezier(.2,.7,.2,1) ${delay}ms, transform 1.1s cubic-bezier(.2,.7,.2,1) ${delay}ms`;
    el.style.opacity = el.dataset.mOp || '';
    el.style.transform = el.dataset.mTf || '';
    timers.push(setTimeout(() => { el.style.transition = el.dataset.mTr || ''; }, 1200 + delay));
  };
  const inView = el => { const r = el.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; };
  const below = [];
  let n = 0;
  els.forEach(el => {
    if (!el.dataset.mPending) {
      el.dataset.mOp = el.style.opacity; el.dataset.mTf = el.style.transform; el.dataset.mTr = el.style.transition;
    }
    if (inView(el) || el.getBoundingClientRect().top < 0) {
      const d = Math.min(n++, 8) * 120;
      const big = el.tagName === 'H1' || el.matches('[style*="aspect-ratio"]');
      el.style.opacity = '0';
      el.style.transform = big ? 'translateY(36px) scale(0.97)' : 'translateY(28px)';
      el.dataset.mPending = '1';
      requestAnimationFrame(() => requestAnimationFrame(() => reveal(el, d)));
    } else {
      el.dataset.mPending = '1';
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      below.push(el);
    }
  });
  const check = () => {
    let k = 0;
    below.forEach(el => { if (!el.dataset.mDone && el.getBoundingClientRect().top < window.innerHeight - 30) reveal(el, Math.min(k++, 5) * 110); });
  };
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(entries => {
      let k = 0;
      entries.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); reveal(e.target, Math.min(k++, 5) * 110); } });
    }, { threshold: 0.1 });
    below.forEach(el => io.observe(el));
  }
  window.addEventListener('scroll', check, { passive: true });
  const iv = setInterval(check, 600);

  root.querySelectorAll('[style*="position:absolute"][style*="border-radius:50%"]').forEach((el, i) => {
    anims.push(el.animate(
      [{ transform: 'translate(0,0) rotate(0deg)' }, { transform: `translate(${i % 2 ? -10 : 12}px,-16px) rotate(${i % 2 ? -8 : 10}deg)` }],
      { duration: 4200 + i * 650, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }
    ));
  });
  root.querySelectorAll('[data-drift]').forEach((el, i) => {
    anims.push(el.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${i % 2 ? 40 : -40}px)` }],
      { duration: 7000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }));
  });
  const petals = [];
  root.querySelectorAll('[data-petals]').forEach(box => {
    if (box.childElementCount) return;
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('span');
      const s = 8 + Math.random() * 9;
      p.style.cssText = `position:absolute;top:-24px;left:${Math.random() * 100}%;width:${s}px;height:${s * 0.75}px;border-radius:80% 0 80% 0;background:${i % 3 ? '#fff' : '#f6c6c3'};opacity:${0.55 + Math.random() * 0.4};pointer-events:none`;
      box.appendChild(p); petals.push(p);
      const h = box.clientHeight || window.innerHeight;
      const dx = (Math.random() - 0.5) * 160;
      anims.push(p.animate([
        { transform: 'translate(0,0) rotate(0deg)' },
        { transform: `translate(${dx * 0.5}px,${h * 0.5}px) rotate(200deg)` },
        { transform: `translate(${dx}px,${h + 40}px) rotate(400deg)` }
      ], { duration: 9000 + Math.random() * 8000, delay: -Math.random() * 15000, iterations: Infinity, easing: 'linear' }));
    }
  });

  return () => {
    if (io) io.disconnect();
    clearInterval(iv);
    window.removeEventListener('scroll', check);
    timers.forEach(clearTimeout);
    els.forEach(el => {
      el.style.opacity = el.dataset.mOp || ''; el.style.transform = el.dataset.mTf || ''; el.style.transition = el.dataset.mTr || '';
      delete el.dataset.mPending; delete el.dataset.mDone;
    });
    anims.forEach(a => a.cancel());
    petals.forEach(p => p.remove());
  };
}
