// Shared motion for all Trattoria Shiki pages.
window.SiteFx = {
  mount(opts = {}) {
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const on = opts.reveal !== false && !reduce;
    const ease = 'cubic-bezier(.2,.7,.2,1)';
    const spring = 'cubic-bezier(.34,1.56,.64,1)';
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const vh = () => window.innerHeight;

    // progress bar + page-exit curtain (outside React tree)
    let bar = document.getElementById('sfx-bar');
    if (!bar) {
      bar = document.createElement('div'); bar.id = 'sfx-bar';
      Object.assign(bar.style, { position: 'fixed', top: '0', left: '0', height: '3px', width: '100%', background: 'linear-gradient(90deg,#9C1F34,#D2692B,#DDBE5C)', transformOrigin: 'left', transform: 'scaleX(0)', zIndex: '100', pointerEvents: 'none' });
      document.body.appendChild(bar);
    }
    let curtain = document.getElementById('sfx-curtain');
    if (!curtain) {
      curtain = document.createElement('div'); curtain.id = 'sfx-curtain';
      Object.assign(curtain.style, { position: 'fixed', inset: '0', zIndex: '120', background: '#9C1F34', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(100%)', transition: `transform .55s ${ease}`, pointerEvents: 'none' });
      curtain.innerHTML = '<span style="font-family:\'Lobster Two\',cursive;font-style:italic;font-weight:700;font-size:64px;color:#DDBE5C;transform:rotate(-6deg)">Shiki</span>';
      document.body.appendChild(curtain);
    }
    const onClick = e => {
      if (!on || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = e.target.closest && e.target.closest('a[href$=".dc.html"]');
      if (!a || a.target) return;
      e.preventDefault();
      curtain.style.transform = 'translateY(0)';
      setTimeout(() => { location.href = a.getAttribute('href'); }, 520);
    };
    document.addEventListener('click', onClick);
    window.addEventListener('pageshow', () => { curtain.style.transform = 'translateY(100%)'; });

    // classify decorative objects
    const isScript = el => el.getAttribute('aria-hidden') === 'true' && (el.style.fontFamily || '').includes('Lobster') && !el.hasAttribute('data-par');
    const floaters = () => [...document.querySelectorAll('[aria-hidden="true"]')].filter(el => !el.closest('header') && (isScript(el) || el.style.borderRadius === '50%'));
    const dots = () => [...document.querySelectorAll('[aria-hidden="true"]')].filter(el => (el.style.backgroundImage || '').includes('radial-gradient'));
    const orig = el => (el.dataset.sfxT ??= el.style.transform || '');

    // reveal
    const prep = el => {
      const img = el.hasAttribute('data-reveal-img');
      if (img) {
        el.dataset.sfxShadow = el.style.boxShadow || '';
        el.style.clipPath = 'inset(0 100% 0 0)';
        el.style.transition = `clip-path 1.3s ${ease}, box-shadow .9s ${spring}`;
        if (el.dataset.sfxShadow) el.style.boxShadow = el.dataset.sfxShadow.replace(/-?\d+px\s+-?\d+px/, '0px 0px');
        const s = el.querySelector('image-slot');
        if (s) { s.style.transform = 'scale(1.18)'; s.style.transition = `transform 1.8s ${ease}`; }
      } else if (el.dataset.sfxPop) {
        el.style.transform = 'scale(0) rotate(-90deg)';
        el.style.transition = `transform .8s ${spring}`;
      } else {
        el.style.opacity = '0';
        el.style.transform = el.dataset.sfxHead ? 'translateY(.8em)' : 'translateY(40px)';
        el.style.transition = `opacity 1s ${ease}, transform 1.1s ${ease}`;
        if (el.dataset.sfxHead) { el.style.clipPath = 'inset(0 0 100% 0)'; el.style.transition += `, clip-path 1s ${ease}`; }
      }
    };
    const show = el => {
      el.dataset.shown = '1';
      if (el.hasAttribute('data-reveal-img')) {
        el.style.clipPath = 'inset(0 0 0 0)';
        const s = el.querySelector('image-slot'); if (s) s.style.transform = 'scale(1)';
        setTimeout(() => { el.style.clipPath = 'none'; if (el.dataset.sfxShadow) el.style.boxShadow = el.dataset.sfxShadow; }, 1100);
      } else {
        el.style.opacity = '1';
        el.style.transform = el.dataset.sfxPop ? 'none' : '';
        if (el.dataset.sfxHead) el.style.clipPath = 'inset(-20% -5% -20% -5%)';
      }
    };
    const staggerOf = el => {
      const p = el.parentElement; if (!p) return 0;
      const sib = [...p.children].filter(c => c.hasAttribute('data-reveal') || c.hasAttribute('data-reveal-img'));
      return Math.min(sib.indexOf(el), 6) * 110;
    };
    const targets = () => {
      document.querySelectorAll('h1, h2').forEach(h => { if (!h.closest('[data-reveal]') && !h.hasAttribute('data-reveal')) { h.setAttribute('data-reveal', ''); h.dataset.sfxHead = '1'; } });
      document.querySelectorAll('main span, main p').forEach(el => {
        if (el.style.borderRadius === '50%' && el.getAttribute('aria-hidden') !== 'true' && parseFloat(el.style.width) >= 28 && !el.hasAttribute('data-reveal')) { el.setAttribute('data-reveal', ''); el.dataset.sfxPop = '1'; }
      });
      return document.querySelectorAll('[data-reveal],[data-reveal-img]');
    };
    let first = true;
    const onReveal = () => {
      if (!on) return;
      const h = vh();
      targets().forEach(el => {
        if (el.dataset.shown) return;
        const top = el.getBoundingClientRect().top;
        if (!el.dataset.armed) {
          el.dataset.armed = '1';
          prep(el);
          if (top < h * 0.95) { const d = (first ? 150 : 0) + staggerOf(el) + (el.dataset.sfxHead ? 120 : 0); later(() => show(el), d); el.dataset.shown = 'pending'; }
          return;
        }
        if (top < h * 0.88) { el.dataset.shown = 'pending'; later(() => show(el), staggerOf(el)); }
      });
      first = false;
    };

    // continuous: parallax, floating objects, progress, marquee
    let raf, lastY = scrollY, vel = 0, mq = 0, t0 = performance.now();
    const loop = now => {
      const t = (now - t0) / 1000, h = vh(), y = scrollY;
      vel += ((y - lastY) - vel) * 0.1; lastY = y;
      const max = document.documentElement.scrollHeight - h;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      document.querySelectorAll('[data-par]').forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        el.style.transform = `translateX(${((r.top - h / 2) * 0.14).toFixed(1)}px)`;
      });
      if (!reduce) {
        floaters().forEach((el, i) => {
          if (el.dataset.shown === 'pending') return;
          const o = orig(el), ph = i * 1.7;
          const round = el.style.borderRadius === '50%';
          const rot = round ? (y * 0.04 + Math.sin(t * 0.8 + ph) * 4) : Math.sin(t * 1.1 + ph) * 1.8;
          el.style.transform = `${o} translateY(${(Math.sin(t * 1.4 + ph) * (round ? 7 : 5)).toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;
        });
        dots().forEach((el, i) => {
          const r = el.getBoundingClientRect();
          el.style.transform = `translate(${(Math.sin(t * .6 + i) * 6).toFixed(1)}px, ${((r.top - h / 2) * -0.12).toFixed(1)}px)`;
        });
        document.querySelectorAll('[data-marquee-track]').forEach(tr => {
          const half = tr.scrollWidth / 2 || 1;
          mq = (mq + 0.6 + Math.abs(vel) * 0.25) % half;
          tr.style.transform = `translateX(${-mq}px)`;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // hover micro-interactions
    const hov = (e, enter) => {
      const a = e.target.closest && e.target.closest('a,button');
      if (a) {
        const ch = [...a.querySelectorAll('span[aria-hidden="true"]')].find(s => s.textContent.trim() === '›');
        if (ch) { ch.style.transition = `transform .35s ${ease}`; ch.style.transform = enter ? 'translateX(6px)' : ''; ch.style.display = 'inline-block'; }
      }
      const card = e.target.closest && e.target.closest('main article');
      if (card && !(e.relatedTarget && card.contains(e.relatedTarget))) {
        const s = card.querySelector('image-slot');
        if (s) { s.parentElement.style.overflow = 'hidden'; s.style.transition = `transform .9s ${ease}`; s.style.transform = enter ? 'scale(1.07)' : 'scale(1)'; }
      }
    };
    const over = e => hov(e, true), out = e => hov(e, false);
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);

    window.addEventListener('scroll', onReveal, { passive: true });
    window.addEventListener('resize', onReveal);
    const r0 = requestAnimationFrame(onReveal);
    const iv = setInterval(onReveal, 700);
    return () => {
      cancelAnimationFrame(raf); cancelAnimationFrame(r0); clearInterval(iv); timers.forEach(clearTimeout);
      window.removeEventListener('scroll', onReveal); window.removeEventListener('resize', onReveal);
      document.removeEventListener('click', onClick);
      document.removeEventListener('mouseover', over); document.removeEventListener('mouseout', out);
    };
  }
};
