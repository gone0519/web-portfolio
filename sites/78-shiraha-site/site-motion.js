window.SWUMotion = {
  setup(ctx, enabled) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bar = document.getElementById('swu-progress');
    if (!enabled || reduce) {
      document.getAnimations().forEach(a => a.cancel());
      if (bar) bar.style.display = 'none';
      window.__swuOff = true;
      ctx.__done = new WeakSet(); return;
    }
    window.__swuOff = false;
    ctx.__done = ctx.__done || new WeakSet();
    ctx.__io = ctx.__io || new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { (e.target.__anims || []).forEach(a => a.play()); ctx.__io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    const ease = 'cubic-bezier(.2,.7,.2,1)', spring = 'cubic-bezier(.34,1.56,.64,1)';
    const once = (sel, fn) => document.querySelectorAll(sel).forEach((el, i) => { if (ctx.__done.has(el)) return; ctx.__done.add(el); fn(el, i); });
    const staged = (el, kf, opt) => { const a = el.animate(kf, { fill: 'both', easing: ease, ...opt }); a.pause(); el.__anims = (el.__anims || []).concat(a); ctx.__io.observe(el); };
    const loop = (el, kf, dur, opt) => el.animate(kf, { duration: dur, iterations: Infinity, ...opt });

    // header intro
    once('header > a:first-child > span:nth-child(2) > span', (el, i) => {
      el.animate([{ transform: 'translateY(-24px) rotate(-12deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 800, delay: 150 + i * 120, easing: spring, fill: 'backwards' });
      el.addEventListener('mouseenter', () => !window.__swuOff && el.animate([{ transform: 'none' }, { transform: 'translateY(-6px) rotate(' + (i % 2 ? 8 : -8) + 'deg)' }, { transform: 'none' }], { duration: 500, easing: spring }));
    });
    once('header nav a', (el, i) => el.animate([{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 300 + i * 70, easing: ease, fill: 'backwards' }));
    once('header a[href*="OpenCampus"][style*="border-radius:50%"]', el => {
      el.animate([{ transform: 'scale(0) rotate(-20deg)' }, { transform: 'none' }], { duration: 900, delay: 700, easing: spring, fill: 'backwards' });
      loop(el, [{ rotate: '-3deg' }, { rotate: '3deg' }], 1800, { direction: 'alternate', easing: 'ease-in-out', delay: 1600 });
    });

    // split big English titles into letters
    once('#ph-title > span:first-child, [data-split]', el => {
      const t = el.textContent; el.textContent = '';
      [...t].forEach((ch, i) => {
        const s = document.createElement('span'); s.textContent = ch; s.style.display = 'inline-block'; if (ch === ' ') s.style.width = '0.3em';
        el.appendChild(s);
        s.animate([{ opacity: 0, transform: 'translateY(0.6em) rotate(8deg)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 200 + i * 45, easing: spring, fill: 'backwards' });
      });
    });
    once('h2[data-reveal] > span:first-child', el => {
      const t = el.textContent; el.textContent = '';
      [...t].forEach((ch, i) => { const s = document.createElement('span'); s.textContent = ch; s.style.display = 'inline-block'; if (ch === ' ') s.style.width = '0.3em'; el.appendChild(s);
        staged(s, [{ opacity: 0, transform: 'translateY(0.5em)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 150 + i * 40, easing: spring });
      });
    });

    once('[data-reveal]', el => {
      const sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
      staged(el, [{ opacity: 0, transform: 'translateY(32px)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: Math.max(0, sibs.indexOf(el)) * 120 });
    });
    once('[data-clip]', (el, i) => staged(el, [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: 1200, delay: 300 + (i % 2) * 350 }));
    once('[data-wipe]', el => staged(el, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { duration: 1400 }));

    // shaped photos pop in
    once('[style*="mask-image"]', (el, i) => {
      const box = el.parentElement;
      if (box.closest('[data-float]')) return;
      staged(box, [{ transform: 'scale(.82) rotate(-5deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 1000, easing: spring, delay: (i % 3) * 120 });
    });
    once('[data-float]', (el, i) => {
      el.animate([{ opacity: 0, transform: 'scale(.85) rotate(-4deg)' }, { opacity: 1, transform: 'none' }], { duration: 1100, delay: 150 + i * 200, easing: spring, fill: 'backwards' });
      loop(el, [{ translate: '0 0' }, { translate: '0 ' + (-8 - (i % 3) * 2) + 'px' }], 4200 + i * 600, { direction: 'alternate', easing: 'ease-in-out' });
    });
    once('[data-bob]', (el, i) => {
      el.animate([{ scale: '0' }, { scale: '1' }], { duration: 700, delay: 400 + (i % 6) * 120, easing: spring, fill: 'backwards' });
      loop(el, [{ translate: '0 0', rotate: '0deg' }, { translate: '0 ' + (-6 - (i % 3) * 4) + 'px', rotate: (i % 2 ? 16 : -16) + 'deg' }], 2200 + (i % 5) * 500, { delay: (i % 4) * 300, direction: 'alternate', easing: 'ease-in-out' });
    });
    once('[data-sway]', (el, i) => loop(el, [{ rotate: '-4deg' }, { rotate: '4deg' }], 2400 + i * 300, { direction: 'alternate', easing: 'ease-in-out' }));

    // living patterns
    once('[style*="background-size:26px 20px"]', el => loop(el, [{ backgroundPosition: '0 0' }, { backgroundPosition: '26px 20px' }], 9000, { easing: 'linear' }));
    once('[style*="background-size:24px 14px"]', (el, i) => loop(el, [{ backgroundPosition: '0 0' }, { backgroundPosition: (i % 2 ? '-' : '') + '24px 0' }], 2400, { easing: 'linear' }));
    once('[style*="background-size:28px 28px"]', el => loop(el, [{ backgroundPosition: '0 0' }, { backgroundPosition: '28px 28px' }], 6000, { easing: 'linear' }));
    once('[style*="background-size:16px 16px"],[style*="background-size:14px 14px"]', (el, i) => loop(el, [{ rotate: '0deg' }, { rotate: (i % 2 ? '-' : '') + '360deg' }], 40000, { easing: 'linear' }));
    once('[style*="background-size:22px 22px"]', el => loop(el, [{ backgroundPosition: '0 0' }, { backgroundPosition: '22px -22px' }], 5000, { easing: 'linear' }));
    once('h1 span[aria-hidden][style*="#f4a3bd"], h2 span[aria-hidden][style*="#f4a3bd"]', (el, i) => loop(el, [{ scale: '1' }, { scale: '1.45' }, { scale: '1' }], 1800, { delay: i * 200, easing: 'ease-in-out' }));
    once('[style*="border-radius:50%"][style*="width:50px;height:50px"]', el => loop(el, [{ translate: '0 0' }, { translate: '6px 0' }, { translate: '0 0' }], 1600, { easing: 'ease-in-out' }));

    // hover bounce on colorful buttons
    once('a[style*="background:#9ae6bb"], button[style*="background:#9ae6bb"], a[style*="background:#fdd9e2"], button[style*="background:#fdd9e2"]', el =>
      el.addEventListener('mouseenter', () => !window.__swuOff && el.animate([{ transform: 'none' }, { transform: 'scale(1.03,.96)' }, { transform: 'scale(.98,1.03)' }, { transform: 'none' }], { duration: 480, easing: 'ease-out' })));

    // ticker auto-scroll
    once('[data-ticker]', el => {
      let paused = false, last = 0;
      el.addEventListener('mouseenter', () => paused = true); el.addEventListener('mouseleave', () => paused = false);
      const step = t => { if (!el.isConnected) return; if (!paused && !window.__swuOff && last) { el.scrollLeft += (t - last) * 0.04; if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) el.scrollLeft = 0; } last = t; requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });

    // scroll progress bar
    let b = bar;
    if (!b) {
      b = document.createElement('div'); b.id = 'swu-progress';
      Object.assign(b.style, { position: 'fixed', left: 0, top: 0, height: '4px', width: '100%', zIndex: 100, transformOrigin: '0 50%', transform: 'scaleX(0)', background: 'repeating-linear-gradient(90deg,#9ae6bb 0 24px,#fdd9e2 24px 48px,#c5ebf7 48px 72px)', borderBottom: '1px solid #1a1a1a', pointerEvents: 'none' });
      document.body.appendChild(b);
      const upd = () => { const h = document.documentElement.scrollHeight - innerHeight; b.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')'; };
      addEventListener('scroll', upd, { passive: true }); upd();
    }
    b.style.display = '';
  }
};
