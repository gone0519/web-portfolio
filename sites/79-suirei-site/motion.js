/* Site-wide motion: load curtain, scroll reveals, parallax, blob morph, hover zoom, progress bar. */
(function () {
  if (window.__suireiMotion) return; window.__suireiMotion = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.7,.2,1)';
  const done = new WeakSet(), owned = new WeakSet(), pending = new Map();
  const parallax = new Map();

  function start() {
    curtain(); progressBar(); grain(); cursor();
    if (reduce) return;
    const io = new IntersectionObserver(es => {
      let n = 0;
      es.forEach(e => { if (!e.isIntersecting) return; const a = pending.get(e.target); if (!a) return;
        io.unobserve(e.target); pending.delete(e.target);
        a.forEach(x => { x.effect.updateTiming({ delay: (x.effect.getTiming().delay || 0) + n * 70 }); x.play(); }); n++; });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    const queue = (el, anims) => { const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) { anims.forEach(a => a.play()); return; }
      anims.forEach(a => a.pause()); pending.set(el, anims); io.observe(el); };
    const flush = all => pending.forEach((a, el) => { const r = el.getBoundingClientRect(); if (all || r.top < innerHeight) { a.forEach(x => all ? x.finish() : x.play()); pending.delete(el); io.unobserve(el); } });
    addEventListener('beforeprint', () => flush(true));
    setTimeout(() => flush(false), 2500);
    const insideOwned = el => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) if (owned.has(p)) return true; return false; };
    const isImgWrap = el => el.firstElementChild && el.firstElementChild.tagName === 'IMAGE-SLOT' && el.children.length === 1;

    function scan() {
      document.querySelectorAll('body *').forEach(el => {
        if (done.has(el) || el.tagName === 'IMAGE-SLOT' || el.closest('header,[data-mo-skip]')) return;
        const mo = el.dataset && el.dataset.mo;
        if (mo) { done.add(el); owned.add(el);
          if (mo === 'marquee') el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: (+el.dataset.speed || 28) * 1000, iterations: Infinity, direction: el.dataset.rev ? 'reverse' : 'normal' });
          if (mo === 'spin') el.animate([{ rotate: '0deg' }, { rotate: '360deg' }], { duration: 18000, iterations: Infinity });
          if (mo === 'drift') el.animate([{ transform: 'translateX(-4%)' }, { transform: 'translateX(2%)' }], { duration: 14000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
          if (mo === 'float') { owned.delete(el); el.animate([{ transform: 'translateY(0) rotate(0deg)' }, { transform: 'translateY(-22px) rotate(8deg)' }], { duration: 4200 + Math.random() * 2400, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }); }
          if (mo === 'pop') queue(el, [el.animate([{ scale: 0, rotate: '-60deg' }, { scale: 1.15, rotate: '8deg', offset: .7 }, { scale: 1, rotate: '0deg' }], { duration: 1100, delay: 500, easing: EASE, fill: 'both' })]);
          if (mo === 'big') queue(el, [el.animate([{ opacity: 0, translate: '0 60px', letterSpacing: '.3em' }, { opacity: 1, translate: '0 0' }], { duration: 1400, easing: EASE, fill: 'both' })]);
          return; }
        const cs = el.style;
        if (cs.position === 'fixed') { done.add(el); return; }
        if (insideOwned(el)) return;
        const r = el.getBoundingClientRect(); if (!r.width && !r.height) return;
        const parent = el.parentElement, pd = parent ? getComputedStyle(parent).display : '';
        const idx = parent ? [...parent.children].indexOf(el) : 0;
        // decorative: diamonds breathe, dashed rings spin, blobs morph
        if (/rotate\(45deg\)/.test(cs.transform) && r.width < 40) { done.add(el);
          el.animate([{ scale: 1 }, { scale: 1.18 }, { scale: 1 }], { duration: 3200 + idx * 200, iterations: Infinity, easing: 'ease-in-out' }); }
        if (cs.border && /dashed/.test(cs.border)) { done.add(el);
          el.animate([{ rotate: '0deg' }, { rotate: '360deg' }], { duration: 40000, iterations: Infinity }); parallax.set(el, .14); return; }
        if (/repeating-linear-gradient/.test(cs.background) && cs.position === 'absolute') { done.add(el);
          el.animate([{ rotate: '0deg' }, { rotate: '-360deg' }], { duration: 60000, iterations: Infinity }); parallax.set(el, .2); return; }
        if (isImgWrap(el)) { done.add(el); owned.add(el);
          const img = el.firstElementChild, blob = (cs.borderRadius || '').includes('/');
          const vert = r.height > r.width * 1.1;
          const from = vert ? 'inset(100% 0 0 0)' : (idx % 2 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)');
          queue(el, [
            el.animate([{ clipPath: from, opacity: .4 }, { clipPath: 'inset(0 0 0 0)', opacity: 1 }], { duration: 1100, easing: EASE, fill: 'both', delay: (idx % 6) * 90 }),
            img.animate([{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 1600, easing: EASE, fill: 'both', delay: (idx % 6) * 90 })
          ]);
          if (blob) { const b = cs.borderRadius;
            el.animate([{ borderRadius: b }, { borderRadius: '42% 58% 46% 54% / 56% 44% 56% 44%' }, { borderRadius: '55% 45% 60% 40% / 45% 55% 40% 60%' }, { borderRadius: b }], { duration: 9000 + idx * 700, iterations: Infinity, easing: 'ease-in-out', composite: 'replace' }); }
          parallax.set(el, cs.position === 'absolute' ? .12 : (r.height < 700 ? .035 : 0));
          return; }
        if (/vertical-rl/.test(cs.writingMode) && /^(H1|H2|P|SPAN|DIV)$/.test(el.tagName)) { done.add(el); owned.add(el);
          queue(el, [el.animate([{ clipPath: 'inset(0 0 100% 0)', opacity: 0, translate: '0 -14px' }, { clipPath: 'inset(0 0 0% 0)', opacity: 1, translate: '0 0' }], { duration: 1400, easing: EASE, fill: 'both', delay: 120 })]);
          return; }
        if (parent && (pd === 'grid' || pd === 'flex') && parent.children.length >= 3 && /^(DIV|A|ARTICLE|BUTTON|LI|LABEL)$/.test(el.tagName) && r.height < 620) { done.add(el); owned.add(el);
          const strip = parent.style.width === 'max-content';
          const kf = strip ? [{ opacity: 0, translate: '80px 0' }, { opacity: 1, translate: '0 0' }] : [{ opacity: 0, translate: '0 36px', scale: .97 }, { opacity: 1, translate: '0 0', scale: 1 }];
          queue(el, [el.animate(kf, { duration: 900, easing: EASE, fill: 'both', delay: (idx % 8) * 85 })]);
          return; }
        if (/^(H1|H2|H3|P|UL|DL|FORM)$/.test(el.tagName) || ((el.tagName === 'A' || el.tagName === 'BUTTON') && /999px/.test(cs.borderRadius))) { done.add(el); owned.add(el);
          queue(el, [el.animate([{ opacity: 0, translate: '0 24px', filter: 'blur(4px)' }, { opacity: 1, translate: '0 0', filter: 'blur(0)' }], { duration: 950, easing: EASE, fill: 'both', delay: (idx % 6) * 80 })]);
          return; }
        if (el.tagName === 'SECTION' || el.tagName === 'FOOTER') { done.add(el);
          if (/radius/.test(el.getAttribute('style') || '') || el.tagName === 'FOOTER') queue(el, [el.animate([{ opacity: .6, scale: .985 }, { opacity: 1, scale: 1 }], { duration: 1000, easing: EASE, fill: 'both' })]); }
      });
    }
    let t; const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 80); });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(scan, 60); setTimeout(scan, 700);
    const iv = setInterval(scan, 500); setTimeout(() => clearInterval(iv), 5000);
    addEventListener('load', scan); addEventListener('resize', () => { clearTimeout(t); t = setTimeout(scan, 120); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { scan(); flush(false); } });

    let ticking = false;
    const tick = () => { ticking = false; const vh = innerHeight;
      parallax.forEach((k, el) => { if (!el.isConnected) { parallax.delete(el); return; } if (!k) return;
        const r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
        el.style.translate = `0 ${((r.top + r.height / 2) - vh / 2) * -k}px`; }); };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }, { passive: true });

    // hover: zoom photos, nudge pill buttons
    document.addEventListener('pointerover', e => {
      const w = e.target.closest && e.target.closest('div'); const host = w && (w.firstElementChild && w.firstElementChild.tagName === 'IMAGE-SLOT' ? w : null);
      const card = e.target.closest && e.target.closest('a,button');
      const wrap = host || (card && [...card.querySelectorAll('div')].find(d => d.firstElementChild && d.firstElementChild.tagName === 'IMAGE-SLOT'));
      if (wrap && !wrap.__hov) { wrap.__hov = true; const img = wrap.firstElementChild;
        img.animate([{ scale: 1 }, { scale: 1.07 }], { duration: 700, easing: EASE, fill: 'forwards' });
        const leave = () => { wrap.__hov = false; img.animate([{ scale: 1.07 }, { scale: 1 }], { duration: 600, easing: EASE, fill: 'forwards' }); (card || wrap).removeEventListener('pointerleave', leave); };
        (card || wrap).addEventListener('pointerleave', leave); }
      if (card && /999px/.test(card.style.borderRadius) && !card.__hov) { card.__hov = true;
        card.animate([{ scale: 1 }, { scale: 1.05 }, { scale: 1.03 }], { duration: 420, easing: EASE, fill: 'forwards' });
        const leave = () => { card.__hov = false; card.animate([{ scale: 1.03 }, { scale: 1 }], { duration: 300, easing: EASE, fill: 'forwards' }); card.removeEventListener('pointerleave', leave); };
        card.addEventListener('pointerleave', leave); }
    });
    // click ripple feedback on buttons (overlay, outside React tree)
    document.addEventListener('pointerdown', e => {
      const b = e.target.closest && e.target.closest('a,button'); if (!b) return;
      const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2, d = document.createElement('div');
      Object.assign(d.style, { position: 'fixed', left: e.clientX - s / 2 + 'px', top: e.clientY - s / 2 + 'px', width: s + 'px', height: s + 'px', borderRadius: '50%', background: 'rgba(185,71,47,.14)', pointerEvents: 'none', zIndex: 9998 });
      document.body.appendChild(d);
      d.animate([{ scale: 0, opacity: 1 }, { scale: 1, opacity: 0 }], { duration: 650, easing: 'ease-out' }).onfinish = () => d.remove();
    });
  }

  function grain() {
    const g = document.createElement('div');
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";
    Object.assign(g.style, { position: 'fixed', inset: 0, zIndex: 9997, pointerEvents: 'none', opacity: .09, mixBlendMode: 'multiply', backgroundImage: 'url("data:image/svg+xml;utf8,' + svg + '")' });
    document.body.appendChild(g);
  }
  function cursor() {
    if (reduce || !matchMedia('(pointer: fine)').matches) return;
    const c = document.createElement('div');
    Object.assign(c.style, { position: 'fixed', left: 0, top: 0, width: '36px', height: '36px', margin: '-18px 0 0 -18px', borderRadius: '50%', border: '1px solid #2a2622', pointerEvents: 'none', zIndex: 9999, mixBlendMode: 'difference', borderColor: '#fff', transition: 'width .35s, height .35s, margin .35s, background .35s' });
    document.body.appendChild(c);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY;
      const hot = e.target.closest && e.target.closest('a,button,image-slot');
      const s = hot ? 72 : 36; c.style.width = c.style.height = s + 'px'; c.style.margin = (-s / 2) + 'px 0 0 ' + (-s / 2) + 'px'; c.style.background = hot ? '#fff' : 'transparent'; }, { passive: true });
    (function loop() { cx += (x - cx) * .18; cy += (y - cy) * .18; c.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; requestAnimationFrame(loop); })();
  }
  function progressBar() {
    const bar = document.createElement('div');
    Object.assign(bar.style, { position: 'fixed', left: 0, top: 0, height: '3px', width: '100%', background: '#b9472f', transformOrigin: '0 50%', transform: 'scaleX(0)', zIndex: 9999, pointerEvents: 'none' });
    document.body.appendChild(bar);
    const upd = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  function curtain() {
    if (reduce) return;
    const c = document.createElement('div');
    Object.assign(c.style, { position: 'fixed', inset: 0, zIndex: 10000, background: '#f7f4ef', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', pointerEvents: 'none' });
    c.innerHTML = '<span style="width:26px;height:26px;background:#2f6b47;transform:rotate(45deg);border-radius:3px 14px 3px 14px;display:block"></span><span style="font-family:\'Noto Serif JP\',serif;font-size:22px;font-weight:600;letter-spacing:.3em;color:#2a2622">翠嶺大学</span>';
    document.body.appendChild(c);
    const [mark, word] = c.children;
    mark.animate([{ transform: 'rotate(-135deg) scale(0)' }, { transform: 'rotate(45deg) scale(1)' }], { duration: 700, easing: EASE, fill: 'both' });
    word.animate([{ opacity: 0, letterSpacing: '.8em' }, { opacity: 1, letterSpacing: '.3em' }], { duration: 800, delay: 150, easing: EASE, fill: 'both' });
    c.animate([{ clipPath: 'inset(0 0 0 0 round 0)' }, { clipPath: 'inset(0 0 100% 0 round 0 0 50% 50%)' }], { duration: 900, delay: 900, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }).onfinish = () => c.remove();
    setTimeout(() => c.remove(), 2500);
  }

  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
