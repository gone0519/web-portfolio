(function () {
  if (window.__siteMotion) return; window.__siteMotion = true;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  document.documentElement.style.overflowX = 'clip';

  /* ---------- page transition overlay ---------- */
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none';
  ov.innerHTML = '<div style="position:absolute;inset:0;background:#1b4d72;display:flex;align-items:center;justify-content:center"><span style="font-family:Bebas Neue,sans-serif;font-size:28px;letter-spacing:.4em;color:#7fe4ff">SEIREI UNIVERSITY</span></div><div style="position:absolute;inset:0;background:#00c8ff"></div>';
  document.body.appendChild(ov);
  const [navyP, cyanP] = ov.children;
  function enter() {
    if (RM) { ov.style.display = 'none'; return; }
    cyanP.animate([{ translate: '0 0' }, { translate: '100% 0' }], { duration: 650, easing: EASE, fill: 'both' });
    navyP.firstChild.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 900, fill: 'both' });
    navyP.animate([{ translate: '0 0' }, { translate: '100% 0' }], { duration: 750, delay: 380, easing: EASE, fill: 'both' });
  }
  function leave(href) {
    if (RM) { location.href = href; return; }
    ov.style.pointerEvents = 'auto';
    navyP.firstChild.style.opacity = '0';
    cyanP.animate([{ translate: '-100% 0' }, { translate: '0 0' }], { duration: 450, easing: EASE, fill: 'both' });
    navyP.animate([{ translate: '-100% 0' }, { translate: '0 0' }], { duration: 450, delay: 160, easing: EASE, fill: 'both' });
    setTimeout(() => { location.href = href; }, 640);
  }
  enter();
  addEventListener('pageshow', e => { if (e.persisted) { ov.style.pointerEvents = 'none'; ov.getAnimations({ subtree: true }).forEach(a => a.cancel()); navyP.style.translate = cyanP.style.translate = '100% 0'; } });
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || !href.includes('.dc.html')) return;
    const url = new URL(href, location.href);
    if (url.pathname === location.pathname) return;
    e.preventDefault(); leave(url.href);
  }, true);

  /* ---------- scroll progress ---------- */
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;left:0;top:0;height:3px;width:100%;background:#00c8ff;transform-origin:0 50%;scale:0 1;z-index:100;pointer-events:none';
  document.body.appendChild(bar);

  if (RM) return;

  /* ---------- reveal engine ---------- */
  const pending = new Map(), doneSet = new Set();
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const a = pending.get(e.target);
    if (a) { a.forEach(x => x.play()); pending.delete(e.target); }
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });

  function reg(el, kf, o = {}, extra) {
    if (doneSet.has(el)) return; doneSet.add(el);
    const list = [];
    const a = el.animate(kf, { duration: o.d || 900, delay: o.delay || 0, easing: o.e || EASE, fill: 'both' });
    a.pause(); a.onfinish = () => { a.cancel(); o.after && o.after(); }; list.push(a);
    if (extra) extra.forEach(([t, k, oo]) => { const b = t.animate(k, { duration: oo.d || 900, delay: oo.delay || 0, easing: oo.e || EASE, fill: 'both' }); b.pause(); b.onfinish = () => b.cancel(); list.push(b); });
    pending.set(el, list); io.observe(el);
  }
  const inDone = el => { for (let p = el.parentElement; p; p = p.parentElement) if (doneSet.has(p)) return true; return false; };
  const hasDoneInside = el => { for (const d of doneSet) if (el !== d && el.contains(d)) return true; return false; };
  const ok = el => !doneSet.has(el) && !inDone(el) && !hasDoneInside(el) && el.offsetParent !== null;
  const UP = (y) => [{ opacity: 0, translate: `0 ${y}px` }, { opacity: 1, translate: '0 0' }];

  const para = new Set(), paraList = [];
  let bgDone = false;

  function scan() {
    const roots = [...document.querySelectorAll('main, footer')];
    if (!roots.length) return;
    const all = roots.flatMap(r => [...r.querySelectorAll('*')]);

    if (!bgDone) {
      const bg = [...document.body.querySelectorAll('div')].find(d => d.style.position === 'fixed' && d.style.zIndex === '0');
      if (bg) { bgDone = true; bg.animate([{ scale: '1.12', opacity: .6 }, { scale: '1', opacity: 1 }], { duration: 2600, easing: EASE }); bgLouver = bg.firstElementChild; }
    }

    all.forEach(el => {
      const cs = getComputedStyle(el);
      // giant display words -> parallax
      const fs = parseFloat(cs.fontSize);
      if (fs >= 80 && el.tagName !== 'H1' && /Bebas|Yuji/.test(cs.fontFamily) && !para.has(el) && el.children.length === 0) {
        para.add(el); paraList.push({ el, k: 0.1 + (paraList.length % 3) * 0.03, dir: paraList.length % 2 ? 1 : -1, v: cs.writingMode.startsWith('vertical') });
      }
      // slanted grey bands -> parallax
      if (cs.clipPath.startsWith('polygon') && cs.backgroundColor.startsWith('rgba(120, 128, 136') && !para.has(el)) {
        para.add(el); paraList.push({ el, k: 0.18, dir: -1, v: true, band: true });
      }
    });

    // circles: pop + float
    let ci = 0;
    all.forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.borderRadius === '50%' && el.offsetWidth >= 100 && ok(el)) {
        const i = ci++;
        reg(el, [{ opacity: 0, scale: '.5' }, { opacity: 1, scale: '1' }], { d: 1100, delay: 200 + i * 160, e: 'cubic-bezier(.34,1.56,.64,1)' });
        el.animate([{ translate: '0 0' }, { translate: '0 -9px' }, { translate: '0 0' }], { duration: 3800 + i * 700, iterations: Infinity, easing: 'ease-in-out', delay: i * 300 });
      }
      // cyan slab / accent bars
      if (cs.backgroundColor === 'rgb(0, 200, 255)' && ok(el)) {
        if (el.offsetWidth > 150) reg(el, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { d: 1300 });
        else if (el.offsetHeight <= 3 && el.offsetWidth >= 30) reg(el, [{ scale: '0 1' }, { scale: '1 1' }], { d: 900, delay: 200 });
      }
    });

    // h1: strong entrance
    document.querySelectorAll('main h1').forEach(h => {
      if (!ok(h)) return;
      const span = h.querySelector('span');
      reg(h, [{ opacity: 0, translate: '0 70px', filter: 'blur(10px)' }, { opacity: 1, translate: '0 0', filter: 'blur(0)' }], { d: 1400, delay: 500 },
        span ? [[span, [{ opacity: 0, translate: '60px 0' }, { opacity: 1, translate: '0 0' }], { d: 1200, delay: 1000 }]] : null);
    });

    // image boxes: wipe + zoom
    roots.forEach(r => r.querySelectorAll('image-slot').forEach(s => {
      const box = s.parentElement;
      if (!ok(box)) return;
      reg(box, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { d: 1200, delay: 100 },
        [[s, [{ scale: '1.25' }, { scale: '1' }], { d: 1800, delay: 100 }]]);
    }));

    // lists: grids / wrapping flex / horizontal rows -> stagger
    all.forEach(el => {
      if (el.children.length < 2) return;
      const cs = getComputedStyle(el);
      const grid = cs.display === 'grid';
      const wrap = cs.display === 'flex' && cs.flexWrap === 'wrap';
      const row = cs.display === 'flex' && cs.overflowX === 'auto';
      if (!grid && !wrap && !row) return;
      if (inDone(el)) return;
      [...el.children].forEach((c, i) => {
        if (!ok(c)) return;
        const kf = row ? [{ opacity: 0, translate: '80px 0' }, { opacity: 1, translate: '0 0' }] : UP(grid ? 40 : 30);
        reg(c, kf, { d: 900, delay: Math.min(i * 90, 700) });
      });
    });

    // remaining text
    roots.forEach(r => r.querySelectorAll('h2, h3, p, label, article').forEach(el => {
      if (!ok(el)) return;
      reg(el, UP(el.tagName === 'H2' ? 50 : 26), { d: el.tagName === 'H2' ? 1100 : 900 });
    }));
    // big parallax words also get a fade-in
    paraList.forEach(p => { if (!p.band && ok(p.el)) reg(p.el, [{ opacity: 0 }, { opacity: 1 }], { d: 1400 }); });
  }

  /* ---------- scroll-linked ---------- */
  let bgLouver = null, lastY = scrollY, ticking = false;
  const header = () => document.querySelector('header');
  // 予備：IntersectionObserver が発火しなかった要素も、画面の縦方向に入っていれば表示する
  function flushPending() {
    const vh = innerHeight;
    pending.forEach((list, el) => {
      if (!el.isConnected) { pending.delete(el); return; }
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.96 && r.bottom > 0) { list.forEach(x => x.play()); pending.delete(el); io.unobserve(el); }
    });
  }
  function onScroll() {
    ticking = false;
    flushPending();
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.scale = `${max > 0 ? y / max : 0} 1`;
    const vh = innerHeight;
    paraList.forEach(p => {
      if (!p.el.isConnected) return;
      const r = p.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const c = (r.top + r.height / 2 - vh / 2) * p.k * p.dir;
      p.el.style.translate = p.v ? `0 ${c}px` : `${c}px 0`;
    });
    if (bgLouver) bgLouver.style.backgroundPosition = `0 ${-y * 0.12}px, 0 ${-y * 0.2}px`;
    const h = header();
    if (h && !document.querySelector('nav[style*="fixed"]')) {
      h.style.transition = 'translate .45s cubic-bezier(.2,.8,.2,1)';
      h.style.translate = (y > lastY && y > 240) ? '0 -120%' : '0 0';
    }
    lastY = y;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);

  /* ---------- magnetic pill buttons ---------- */
  let mag = null;
  document.addEventListener('pointermove', e => {
    const b = e.target.closest && e.target.closest('a,button');
    if (mag && mag !== b) { mag.style.translate = '0 0'; mag = null; }
    if (!b || !getComputedStyle(b).borderRadius.startsWith('999')) return;
    mag = b; const r = b.getBoundingClientRect();
    b.style.transition = (b.style.transition ? b.style.transition + ',' : '') + 'translate .25s';
    b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.18}px ${(e.clientY - r.top - r.height / 2) * 0.3}px`;
  });

  /* ---------- dynamic content ---------- */
  let ready = false, t = null;
  const pendingAncestor = el => { for (let p = el; p; p = p.parentElement) if (pending.has(p)) return true; return false; };
  new MutationObserver(muts => {
    if (!ready) { clearTimeout(t); t = setTimeout(scan, 120); return; }
    muts.forEach(m => {
      if (m.type === 'characterData') {
        const p = m.target.parentElement;
        if (p && !pendingAncestor(p) && !p.closest('[data-sm-busy]')) p.animate([{ opacity: 0, translate: '0 12px', filter: 'blur(4px)' }, { opacity: 1, translate: '0 0', filter: 'blur(0)' }], { duration: 500, easing: EASE });
        return;
      }
      m.addedNodes.forEach(n => {
        if (n.nodeType !== 1 || n === ov || n === bar) return;
        if (n.tagName === 'NAV' || (n.querySelector && n.querySelector('nav') && getComputedStyle(n).position === 'fixed')) {
          const nav = n.tagName === 'NAV' ? n : n.querySelector('nav');
          nav.animate([{ clipPath: 'circle(0 at calc(100% - 48px) 44px)' }, { clipPath: 'circle(150% at calc(100% - 48px) 44px)' }], { duration: 700, easing: EASE });
          nav.querySelectorAll('a').forEach((a, i) => a.animate([{ opacity: 0, translate: '-50px 0' }, { opacity: 1, translate: '0 0' }], { duration: 700, delay: 200 + i * 70, easing: EASE, fill: 'backwards' }));
          return;
        }
        if (pendingAncestor(n)) return;
        if (getComputedStyle(n).position === 'fixed') {
          n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
          const card = n.firstElementChild; if (card) card.animate([{ opacity: 0, translate: '0 40px', scale: '.96' }, { opacity: 1, translate: '0 0', scale: '1' }], { duration: 500, easing: EASE });
          return;
        }
        n.animate([{ opacity: 0, translate: '0 16px' }, { opacity: 1, translate: '0 0' }], { duration: 550, easing: EASE });
      });
    });
  }).observe(document.body, { childList: true, subtree: true, characterData: true });

  function boot() { scan(); onScroll(); setTimeout(() => { scan(); ready = true; flushPending(); }, 1600); }
  if (document.readyState === 'complete') setTimeout(boot, 200); else addEventListener('load', () => setTimeout(boot, 200));
})();
