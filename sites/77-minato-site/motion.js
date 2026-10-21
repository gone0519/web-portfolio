(function () {
  if (window.__mgMotion) return; window.__mgMotion = true;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const done = new WeakSet();
  const EASE = 'cubic-bezier(.2,.7,.2,1)';
  let ready = false;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const a = e.target.__mgAnim; if (!a) return;
    setTimeout(() => a.play(), e.target.__mgDelay || 0);
  }), { rootMargin: '0px 0px -8% 0px' });

  const K = {
    up: [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }],
    wipe: [{ clipPath: 'inset(0 100% 0 0)', opacity: .3, transform: 'translateX(-24px)' }, { clipPath: 'inset(0 0% 0 0)', opacity: 1, transform: 'none' }],
    img: [{ clipPath: 'inset(0 0 100% 0)', transform: 'scale(1.08)' }, { clipPath: 'inset(0 0 0% 0)', transform: 'scale(1)' }],
  };
  const skip = el => el.closest('header,aside,nav,form,[style*="position: fixed"]');
  const regAnc = el => { for (let p = el.parentElement; p; p = p.parentElement) if (done.has(p)) return true; return false; };
  function reg(el, kind, delay) {
    if (done.has(el) || skip(el) || regAnc(el)) return;
    done.add(el);
    const a = el.animate(K[kind], { duration: kind === 'up' ? 900 : 1200, easing: EASE });
    a.pause(); a.currentTime = 0;
    el.__mgAnim = a; el.__mgDelay = delay || 0;
    io.observe(el);
  }
  function once(el, frames, opts) { if (done.has(el)) return; done.add(el); el.animate(frames, { easing: EASE, ...opts }); }

  function scan() {
    document.querySelectorAll('header').forEach(h => once(h, [{ opacity: 0, transform: 'translateY(-24px)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: 200 }));
    document.querySelectorAll('aside').forEach(h => once(h, [{ transform: 'translateX(100%)' }, { transform: 'none' }], { duration: 900, delay: 500 }));
    document.querySelectorAll('[style*="position: fixed"][style*="inset: 0"]').forEach(d => {
      once(d, [{ clipPath: 'circle(0% at 100% 0)' }, { clipPath: 'circle(150% at 100% 0)' }], { duration: 650 });
      d.querySelectorAll('a').forEach((a, i) => a.animate(K.up, { duration: 600, delay: 150 + i * 50, easing: EASE, fill: 'backwards' }));
    });
    document.querySelectorAll('svg[preserveAspectRatio="none"]').forEach(s => {
      if (done.has(s)) return; done.add(s);
      const wide = s.getBoundingClientRect().width > innerWidth * .6;
      s.style.transformOrigin = wide ? 'top' : 'left center';
      s.animate(wide ? [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1.3)' }] : [{ transform: 'scaleX(1)' }, { transform: 'scaleX(1.12)' }], { duration: 5000 + Math.random() * 2000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    });
    document.querySelectorAll('[style*="repeating-linear-gradient"],[data-photo]').forEach(el => { if (el.offsetHeight > 60) reg(el, 'img'); });
    document.querySelectorAll('h1,h2').forEach(el => reg(el, 'wipe'));
    document.querySelectorAll('[style*="display: grid"],[style*="flex-wrap: wrap"]').forEach(g => {
      if (g.children.length < 2) return;
      [...g.children].forEach((c, i) => reg(c, 'up', Math.min(i * 90, 630)));
    });
    document.querySelectorAll('h3,p,article').forEach(el => reg(el, 'up'));
    marquee();
  }

  let q = 0;
  const schedule = () => { if (!q) q = requestAnimationFrame(() => { q = 0; scan(); }); };
  new MutationObserver(ms => {
    if (ready) ms.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType !== 1 || done.has(n) || n.closest('[style*="position: fixed"]')) return;
      n.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: EASE });
    }));
    schedule();
  }).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('load', () => setTimeout(() => { ready = true; }, 1500));
  document.addEventListener('DOMContentLoaded', schedule);

  // banner auto-scroll
  function marquee() {
    document.querySelectorAll('[style*="overflow-x: auto"]').forEach(el => {
      if (el.__mgMarq || el.closest('nav') || el.children.length < 5 || [...el.children].some(c => c.tagName !== 'A')) return;
      el.__mgMarq = true; let hover = false, dir = 1, pos = el.scrollLeft;
      el.addEventListener('pointerenter', () => hover = true);
      el.addEventListener('pointerleave', () => { hover = false; pos = el.scrollLeft; });
      (function tick() {
        if (!hover) {
          const max = el.scrollWidth - el.clientWidth;
          pos += .5 * dir; if (pos >= max) dir = -1; if (pos <= 0) dir = 1;
          el.scrollLeft = pos;
        }
        requestAnimationFrame(tick);
      })();
    });
  }

  // progress bar, back-to-top, parallax
  function chrome() {
    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;left:0;top:0;height:3px;width:100%;background:#5aa58c;transform-origin:left;transform:scaleX(0);z-index:60;pointer-events:none';
    const top = document.createElement('button');
    top.setAttribute('aria-label', 'ページの先頭へ');
    top.textContent = '↑';
    top.style.cssText = 'position:fixed;right:24px;bottom:24px;width:56px;height:56px;border-radius:50%;border:0;background:#2b86ad;color:#fff;font:400 20px Jost,sans-serif;cursor:pointer;z-index:60;opacity:0;transform:translateY(20px);transition:opacity .4s,transform .4s;box-shadow:0 8px 24px rgba(20,70,90,.25)';
    top.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
    document.body.append(bar, top);
    let t = 0;
    addEventListener('scroll', () => {
      if (t) return; t = requestAnimationFrame(() => {
        t = 0; const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
        const show = y > innerHeight * .8;
        top.style.opacity = show ? 1 : 0; top.style.transform = show ? 'none' : 'translateY(20px)'; top.style.pointerEvents = show ? 'auto' : 'none';
        const hero = document.querySelector('main section, body section');
        if (hero) hero.querySelectorAll('[style*="repeating-linear-gradient"],[data-photo]').forEach(el => { if (el.offsetHeight > 300) el.style.translate = `0 ${Math.min(y, 900) * .18}px`; });
      });
    }, { passive: true });
  }
  if (document.body) chrome(); else document.addEventListener('DOMContentLoaded', chrome);

  // press feedback
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest('a,button'); if (!b) return;
    b.animate([{ scale: 1 }, { scale: .96 }, { scale: 1 }], { duration: 280, easing: 'ease-out' });
  });
})();
