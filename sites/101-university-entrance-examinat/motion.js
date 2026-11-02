// Shared motion: hero entrance, ken burns, floating bars, scroll reveal, parallax watermarks.
(function () {
  const ease = 'cubic-bezier(.2,.7,.2,1)';
  const K = {
    up: [{ opacity: 0, translate: '0 50px' }, { opacity: 1, translate: '0 0' }],
    left: [{ opacity: 0, translate: '-70px 0' }, { opacity: 1, translate: '0 0' }],
    right: [{ opacity: 0, translate: '70px 0' }, { opacity: 1, translate: '0 0' }],
    pop: [{ opacity: 0, scale: '.6' }, { opacity: 1, scale: '1.06', offset: .7 }, { opacity: 1, scale: '1' }],
    drop: [{ opacity: 0, translate: '0 -60px', scale: '1.1' }, { opacity: 1, translate: '0 0', scale: '1' }],
  };
  let pending = [], px = [], bound = false;
  const checkRv = () => {
    const lim = window.innerHeight * 0.9;
    pending = pending.filter(el => { if (!el.isConnected) return false; if (el.getBoundingClientRect().top < lim) { el.__rv.play(); return false; } return true; });
  };
  const finishAll = () => { pending.forEach(el => el.__rv.finish()); pending = []; };
  const onPx = () => {
    const vh = window.innerHeight;
    px.forEach((el, i) => { const r = el.getBoundingClientRect(); const c = (r.top + r.height / 2 - vh / 2) / vh; el.style.translate = (c * (i % 2 ? 160 : -160)).toFixed(1) + 'px 0'; });
  };
  function scan() {
    document.querySelectorAll('[data-hero]').forEach(el => {
      if (el.__hero) return; el.__hero = 1;
      const k = el.dataset.hero;
      if (k === 'h') return el.animate([{ translate: '0 -100%' }, { translate: '0 0' }], { duration: 800, easing: ease, delay: 200, fill: 'backwards' });
      if (k === '0') return el.animate([{ opacity: 0, filter: 'blur(14px)', letterSpacing: '.4em' }, { opacity: 1, filter: 'blur(0)' }], { duration: 1400, easing: ease, delay: 300, fill: 'backwards' });
      el.animate(K.up, { duration: 1000, easing: ease, delay: 800 + (+k) * 220, fill: 'backwards' });
    });
    document.querySelectorAll('[data-kenburns]').forEach(el => { if (el.__kb) return; el.__kb = 1; el.animate([{ scale: '1' }, { scale: '1.12' }], { duration: 16000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }); });
    document.querySelectorAll('[data-float]').forEach((el, i) => { if (el.__fl) return; el.__fl = 1; el.animate([{ translate: '0 0' }, { translate: (i % 2 ? '-' : '') + '30px ' + (i % 2 ? '' : '-') + '20px' }], { duration: 3800 + i * 500, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }); });
    document.querySelectorAll('[data-reveal]').forEach(el => {
      if (el.__rv) return;
      const sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
      const a = el.animate(K[el.dataset.reveal] || K.up, { duration: 900, easing: ease, delay: Math.min(sibs.indexOf(el), 6) * 120, fill: 'backwards' });
      a.pause(); a.currentTime = 0; el.__rv = a; pending.push(el);
    });
    px = [...document.querySelectorAll('[data-parallax]')];
    checkRv(); onPx();
  }
  function init() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
    scan();
    if (!bound) {
      bound = true;
      window.addEventListener('scroll', () => { checkRv(); onPx(); }, { passive: true });
      window.addEventListener('resize', checkRv);
      window.addEventListener('beforeprint', finishAll);
    }
    const t1 = setTimeout(scan, 600);
    return () => clearTimeout(t1);
  }
  window.SiteMotion = { init, scan };
})();
