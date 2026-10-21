(() => {
  if (window.__motion) return; window.__motion = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.7,.2,1)';
  const seen = new WeakSet();
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.__anim && e.target.__anim.play(); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function prep(el, frames, opts, now) {
    if (seen.has(el) || reduce) return; seen.add(el);
    const a = el.animate(frames, Object.assign({ duration: 800, easing: EASE, fill: 'both' }, opts));
    if (now) return;
    a.pause(); a.currentTime = 0; el.__anim = a; io.observe(el);
  }
  const up = [{ opacity: 0, translate: '0 32px' }, { opacity: 1, translate: '0 0' }];
  const left = [{ opacity: 0, translate: '-48px 0' }, { opacity: 1, translate: '0 0' }];
  const zoom = [{ opacity: 0, scale: '1.12', filter: 'blur(4px)' }, { opacity: 1, scale: '1', filter: 'none' }];
  const pop = [{ opacity: 0, scale: '.6', rotate: '-8deg' }, { opacity: 1, scale: '1.06', rotate: '0deg', offset: .7 }, { opacity: 1, scale: '1', rotate: '0deg' }];
  const sibIndex = el => el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;

  function scan() {
    const main = document.querySelector('main'); if (!main) return;
    // Top page hero intro
    const hero = main.querySelector('[data-screen-label="01 Hero"]');
    if (hero) {
      [...hero.children].forEach((col, ci) => {
        const red = getComputedStyle(col).backgroundColor === 'rgb(226, 51, 43)';
        [...col.children].forEach((c, i) => prep(c, red ? (i === 2 ? left : up) : zoom,
          { duration: red ? 800 : 1100, delay: (red ? 300 : ci * 120) + i * (red ? 110 : 90) }, true));
      });
    }
    // Subpage hero intro
    main.querySelectorAll('section[data-screen-label$="Hero"]').forEach(s => {
      if (s === hero) return;
      s.querySelectorAll(':scope > div > *, :scope > div > div > *').forEach((c, i) => {
        if (c.tagName === 'H1') prep(c, [{ opacity: 0, translate: '-60px 0', letterSpacing: '.12em' }, { opacity: 1, translate: '0 0', letterSpacing: 'normal' }], { duration: 1100, delay: 150 }, true);
        else if (c.children.length < 6 || c.tagName === 'P') prep(c, up, { delay: 100 + i * 90 }, true);
      });
    });
    // Headings + paragraphs
    main.querySelectorAll('section h2, article').forEach(el => prep(el, el.tagName === 'H2' ? left : up, { delay: 60 }));
    // Children of grids / card rows
    main.querySelectorAll('div').forEach(d => {
      if (d.closest('[data-screen-label$="Hero"]')) return;
      const cs = getComputedStyle(d);
      const isGrid = cs.display === 'grid' && d.children.length > 1 && !d.closest('table');
      const isCol = cs.display === 'flex' && cs.flexDirection === 'column' && d.children.length > 2 && d.children[0].offsetHeight > 120;
      if (isGrid || isCol) [...d.children].forEach(c => prep(c, up, { delay: (sibIndex(c) % 6) * 90 }));
    });
    main.querySelectorAll('table tbody tr, section [style*="border-bottom: 1px solid"]').forEach(r => prep(r, [{ opacity: 0, translate: '24px 0' }, { opacity: 1, translate: '0 0' }], { duration: 600, delay: (sibIndex(r) % 8) * 60 }));
    // Hexagons: pop in, then float
    document.querySelectorAll('[style*="50% 0px, 100% 25%"], [style*="50% 0,100% 25%"]').forEach((h, i) => {
      if (seen.has(h) || reduce) return;
      prep(h, pop, { duration: 700, delay: 200 + i * 140 });
      setTimeout(() => h.animate([{ translate: '0 0' }, { translate: '0 -8px' }, { translate: '0 0' }], { duration: 3200, delay: i * 400, iterations: Infinity, easing: 'ease-in-out', composite: 'add' }), 1200);
    });
    // Footer stripes
    document.querySelectorAll('footer > div:last-child').forEach(s => {
      if (seen.has(s) || reduce || !s.style.background.includes('repeating')) return; seen.add(s);
      s.animate([{ backgroundPosition: '0 0' }, { backgroundPosition: '39.6px 0' }], { duration: 1600, iterations: Infinity });
    });
  }

  let loaded = false; setTimeout(() => loaded = true, 1500);
  let t; const queue = () => { clearTimeout(t); t = setTimeout(() => { scan(); extras(); }, 60); };
  new MutationObserver(ms => {
    if (loaded && !reduce) ms.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType === 1 && n.closest('main') && !n.__added) { n.__added = 1; n.animate([{ opacity: 0, translate: '0 10px' }, { opacity: 1, translate: '0 0' }], { duration: 420, easing: EASE }); }
    }));
    queue();
  }).observe(document.documentElement, { childList: true, subtree: true });

  const done = new WeakSet();
  const once = (el, fn) => { if (!done.has(el)) { done.add(el); fn(el); } };
  const RED = 'rgb(226, 51, 43)';
  function extras() {
    if (reduce) return;
    const main = document.querySelector('main'); if (!main) return;
    // Count-up numbers (Kanit display numerals)
    main.querySelectorAll('div, span').forEach(el => {
      const tn = el.firstChild;
      if (!tn || tn.nodeType !== 3 || !/^\d{1,4}$/.test(tn.nodeValue.trim())) return;
      if (!getComputedStyle(el).fontFamily.includes('Kanit') || parseFloat(getComputedStyle(el).fontSize) < 24) return;
      once(el, () => {
        const target = tn.nodeValue.trim(), n = parseInt(target, 10), pad = target.length;
        const run = () => { const t0 = performance.now(); const step = now => { const p = Math.min(1, (now - t0) / 1400), v = Math.round(n * (1 - Math.pow(1 - p, 3))); tn.nodeValue = String(v).padStart(pad, '0'); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); };
        tn.nodeValue = '0'.repeat(pad);
        const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { o.disconnect(); setTimeout(run, 300); } }, { threshold: .5 }); o.observe(el);
      });
    });
    // Image tilt + zoom on card hover
    main.querySelectorAll('a, article').forEach(card => {
      const img = [...card.querySelectorAll('div')].find(d => /repeating-linear-gradient|url\(/.test(d.style.background));
      const self = card.style.background.includes('repeating-linear-gradient');
      if (!img && !self) return;
      once(card, () => {
        const tgt = self ? null : img; if (!tgt) return;
        card.style.perspective = '900px';
        tgt.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1)';
        card.addEventListener('mousemove', e => { const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; tgt.style.transform = `scale(1.05) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`; });
        card.addEventListener('mouseleave', () => { tgt.style.transform = ''; });
      });
    });
    // Magnetic pill/black buttons + arrow nudge + ripple
    document.querySelectorAll('a, button').forEach(b => {
      const cs = getComputedStyle(b);
      const arrow = [...b.children].find(s => s.tagName === 'SPAN' && s.textContent.trim() === '›');
      const isBtn = cs.backgroundColor === 'rgb(17, 17, 17)' || cs.backgroundColor === RED || arrow;
      if (!isBtn || b.closest('nav') && !arrow) return;
      once(b, () => {
        b.style.position = b.style.position || 'relative'; b.style.overflow = 'hidden';
        b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.translate = `${(e.clientX - r.left - r.width / 2) * .12}px ${(e.clientY - r.top - r.height / 2) * .25}px`; });
        b.addEventListener('mouseleave', () => { b.style.translate = ''; });
        b.style.transition = (b.style.transition ? b.style.transition + ',' : '') + 'translate .3s cubic-bezier(.2,.7,.2,1)';
        if (arrow) b.addEventListener('mouseenter', () => arrow.animate([{ transform: 'none' }, { transform: 'translateX(5px)' }, { transform: 'none' }], { duration: 700, iterations: 2, easing: 'ease-in-out' }));
        b.addEventListener('click', e => {
          const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, s = document.createElement('i');
          Object.assign(s.style, { position: 'absolute', left: e.clientX - r.left - d / 2 + 'px', top: e.clientY - r.top - d / 2 + 'px', width: d + 'px', height: d + 'px', borderRadius: '50%', background: 'rgba(255,255,255,.35)', pointerEvents: 'none' });
          b.appendChild(s); s.animate([{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }], { duration: 600, easing: 'ease-out' }).onfinish = () => s.remove();
        });
      });
    });
    // Red circular arrows spin on parent hover
    main.querySelectorAll('span').forEach(s => {
      if (s.textContent.trim() !== '›' || getComputedStyle(s).borderRadius !== '50%') return;
      const p = s.closest('a'); if (!p) return;
      once(s, () => p.addEventListener('mouseenter', () => s.animate([{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(360deg) scale(1.15)' }, { transform: 'rotate(360deg) scale(1)' }], { duration: 600, easing: EASE })));
    });
    // Hero: shine sweep + wobbling tag
    const hero = main.querySelector('[data-screen-label="01 Hero"]');
    if (hero) {
      const panel = [...hero.children].find(c => getComputedStyle(c).backgroundColor === RED);
      if (panel) once(panel, p => {
        p.style.backgroundImage = 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,.18) 50%, transparent 60%)';
        p.style.backgroundSize = '250% 100%'; p.style.backgroundRepeat = 'no-repeat';
        p.animate([{ backgroundPosition: '150% 0' }, { backgroundPosition: '-50% 0' }, { backgroundPosition: '-50% 0' }], { duration: 4200, iterations: Infinity, easing: 'ease-in-out' });
        const tag = p.children[0]; tag && setTimeout(() => tag.animate([{ rotate: '0deg' }, { rotate: '3deg' }, { rotate: '-2deg' }, { rotate: '0deg' }], { duration: 2400, iterations: Infinity, easing: 'ease-in-out', composite: 'add' }), 1500);
      });
      const tiles = [...hero.querySelectorAll(':scope > div > div')].filter(d => getComputedStyle(d.parentElement).display === 'grid');
      tiles.forEach(tile => once(tile, () => {
        tile.style.position = 'relative'; tile.style.overflow = 'hidden';
        tile.style.transition = 'filter .4s, scale .5s cubic-bezier(.2,.7,.2,1)';
        tile.addEventListener('mouseenter', () => { tile.style.scale = '1.04'; tile.style.zIndex = 2; tiles.forEach(o => o !== tile && (o.style.filter = 'brightness(.8) saturate(.6)')); });
        tile.addEventListener('mouseleave', () => { tile.style.scale = ''; tile.style.zIndex = ''; tiles.forEach(o => o.style.filter = ''); });
      }));
      if (tiles.length && !hero.__loop) {
        hero.__loop = true;
        let last = -1, n = 0;
        const fx = () => {
          let i; do { i = Math.floor(Math.random() * tiles.length); } while (i === last && tiles.length > 1); last = i;
          const tile = tiles[i];
          if (!tile.isConnected || tile.matches(':hover')) return;
          if (n++ % 2 === 0) {
            const red = getComputedStyle(tile).backgroundColor === RED;
            const o = document.createElement('i');
            Object.assign(o.style, { position: 'absolute', inset: 0, background: red ? '#111' : '#E2332B', pointerEvents: 'none', zIndex: 1 });
            tile.appendChild(o);
            o.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)', offset: .45 }, { clipPath: 'inset(0 0 0 0)', offset: .55 }, { clipPath: 'inset(0 0 0 100%)' }], { duration: 1100, easing: 'cubic-bezier(.7,0,.2,1)' }).onfinish = () => o.remove();
          } else {
            tile.animate([{ transform: 'perspective(800px) rotateY(0)' }, { transform: 'perspective(800px) rotateY(180deg)', filter: 'brightness(.7)', offset: .5 }, { transform: 'perspective(800px) rotateY(360deg)' }], { duration: 1200, easing: 'cubic-bezier(.6,0,.3,1)' });
          }
        };
        setTimeout(() => setInterval(fx, 1800), 2200);
      }
    }
  }

  // Parallax: striped placeholders drift with scroll
  if (!reduce) addEventListener('scroll', () => {
    document.querySelectorAll('main div').forEach(d => {
      if (!d.style.background.includes('repeating-linear-gradient(135deg')) return;
      const r = d.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      d.style.backgroundPosition = `0 ${((r.top + r.height / 2 - innerHeight / 2) * -.15).toFixed(1)}px`;
    });
  }, { passive: true });

  // Page transitions: red wipe between pages
  if (!reduce) {
    const wipe = document.createElement('div');
    Object.assign(wipe.style, { position: 'fixed', inset: 0, background: '#E2332B', zIndex: 200, pointerEvents: 'none', transform: 'translateX(0)' });
    const add = () => { if (document.body && !wipe.isConnected) { document.body.appendChild(wipe); wipe.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }], { duration: 650, delay: 80, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }); } };
    document.body ? add() : addEventListener('DOMContentLoaded', add);
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href]'); if (!a || e.metaKey || e.ctrlKey) return;
      const href = a.getAttribute('href'); if (!/\.dc\.html/.test(href) || href.startsWith('#')) return;
      e.preventDefault(); add();
      wipe.getAnimations().forEach(x => x.cancel());
      wipe.animate([{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }], { duration: 450, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }).onfinish = () => { location.href = a.href; };
    }, true);
    addEventListener('pageshow', e => { if (e.persisted) wipe.getAnimations().forEach(x => x.cancel()) || (wipe.style.transform = 'translateX(100%)'); });
  }
  addEventListener('load', queue); queue();

  // Header shadow on scroll + scroll progress bar
  const bar = document.createElement('div');
  Object.assign(bar.style, { position: 'fixed', top: 0, left: 0, height: '3px', width: '100%', background: '#E2332B', transformOrigin: '0 50%', transform: 'scaleX(0)', zIndex: 100, pointerEvents: 'none' });
  const mount = () => document.body && !bar.isConnected && document.body.appendChild(bar);
  addEventListener('scroll', () => {
    mount();
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    const h = document.querySelector('header');
    if (h) { h.style.transition = 'box-shadow .3s'; h.style.boxShadow = scrollY > 10 ? '0 6px 20px rgba(0,0,0,.08)' : 'none'; }
  }, { passive: true });
})();
