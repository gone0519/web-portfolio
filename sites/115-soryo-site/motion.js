(() => {
  if (window.__soryoMotion) return; window.__soryoMotion = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.75,.2,1)';
  const K = {
    up: [{ opacity: 0, transform: 'translateY(44px)' }, { opacity: 1, transform: 'none' }],
    left: [{ opacity: 0, transform: 'translateX(-28px)' }, { opacity: 1, transform: 'none' }],
    right: [{ opacity: 0, transform: 'translateX(28px)' }, { opacity: 1, transform: 'none' }],
    fade: [{ opacity: 0 }, { opacity: 1 }],
    scale: [{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }],
    mask: [{ clipPath: 'inset(0 0 100% 0)', transform: 'translateY(45%)' }, { clipPath: 'inset(0 0 0% 0)', transform: 'none' }],
    img: [{ clipPath: 'inset(0 0 0 100%)', transform: 'scale(1.06)' }, { clipPath: 'inset(0 0 0 0%)', transform: 'none' }],
    tile: [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }],
    blob: [{ opacity: 0, transform: 'scale(.82) rotate(-8deg)' }, { opacity: 1, transform: 'none' }],
  };
  const DUR = { mask: 1100, img: 1300, tile: 700, blob: 1600, fade: 900 };
  const seen = new WeakSet();
  const pending = new Map();
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    (pending.get(e.target) || []).forEach(go);
    pending.delete(e.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  const go = a => { a.play(); const t = a.effect.getTiming(); setTimeout(() => { try { a.finish(); } catch (e) {} }, t.delay + t.duration + 300); };
  const prep = (el, kind, delay, trigger) => {
    const a = el.animate(K[kind] || K.up, { duration: DUR[kind] || 950, delay, easing: EASE, fill: 'backwards' });
    a.pause();
    const t = trigger || el;
    if (!pending.has(t)) { pending.set(t, []); io.observe(t); }
    pending.get(t).push(a);
  };
  const kids = el => [...el.children].filter(c => c.nodeType === 1);

  const scan = root => {
    if (reduce || !root.querySelectorAll) return;
    const list = [root, ...root.querySelectorAll('[data-reveal],[data-stagger],[data-float],[data-drift],[data-swap],[data-parallax]')];
    list.forEach(el => {
      if (!el.dataset || seen.has(el)) return;
      const d = el.dataset;
      if (d.reveal) { seen.add(el); prep(el, d.reveal, +(d.delay || 0), /^(mask|img)$/.test(d.reveal) ? el.parentElement : null); }
      if (d.stagger !== undefined) {
        seen.add(el);
        const kind = d.stagger || 'up', step = kind === 'tile' ? 70 : 95, base = +(d.delay || 0);
        kids(el).forEach((c, i) => prep(c, kind, base + Math.min(i, 9) * step, el));
        new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
          if (n.nodeType === 1 && !pending.has(el)) n.animate(K[kind] || K.up, { duration: 700, easing: EASE, fill: 'backwards' });
        }))).observe(el, { childList: true });
      }
      if (d.float !== undefined) {
        seen.add(el);
        el.animate([{ transform: 'rotate(-14deg) translate(0,0)' }, { transform: 'rotate(-9deg) translate(-10px,-18px)' }], { duration: 7000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      }
      if (d.drift !== undefined) {
        seen.add(el);
        el.animate([{ backgroundPosition: '0 0' }, { backgroundPosition: '0 130px' }], { duration: 5200, iterations: Infinity, easing: 'linear' });
        el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-36px)' }], { duration: 8000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      }
      if (d.swap !== undefined) {
        seen.add(el);
        let raf = 0;
        new MutationObserver(() => {
          if (raf) return;
          raf = requestAnimationFrame(() => {
            raf = 0;
            const targets = d.swap === 'stagger' ? kids(el) : [el];
            targets.forEach((c, i) => c.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: Math.min(i, 8) * 60, easing: EASE, fill: 'backwards' }));
          });
        }).observe(el, { childList: true, subtree: true, characterData: true });
      }
      if (d.parallax !== undefined) { seen.add(el); para.push(el); }
    });
  };

  const para = [];
  let bar;
  const onScroll = () => {
    const vh = innerHeight;
    para.forEach(el => {
      if (!el.isConnected) return;
      const r = el.getBoundingClientRect();
      const off = (r.top + r.height / 2 - vh / 2) * (+el.dataset.parallax || 0.1);
      el.style.translate = `0 ${off.toFixed(1)}px`;
    });
    pending.forEach((as, t) => {
      const r = t.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) { as.forEach(go); pending.delete(t); io.unobserve(t); }
    });
    if (bar) {
      const h = document.documentElement.scrollHeight - vh;
      bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    }
  };

  const tilePulse = () => {
    const tiles = document.querySelectorAll('[data-pulse] > *');
    if (!tiles.length) return;
    const t = tiles[Math.floor(Math.random() * tiles.length)];
    t.animate([{ opacity: 1 }, { opacity: .35 }, { opacity: 1 }], { duration: 1400, easing: 'ease-in-out' });
  };

  const arrows = (el, on) => {
    el.querySelectorAll('span').forEach(s => {
      if (s.childElementCount || !/^[→↓]$/.test(s.textContent.trim())) return;
      const down = s.textContent.trim() === '↓';
      const kf = [{ transform: 'none' }, { transform: down ? 'translateY(4px)' : 'translateX(7px)' }];
      s.animate(on ? kf : kf.reverse(), { duration: 280, easing: EASE, fill: 'forwards' });
    });
  };

  const curtain = (dir, done) => {
    const c = document.createElement('div');
    c.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#0b3fd9;pointer-events:none;display:flex;align-items:center;justify-content:center';
    c.innerHTML = '<span style="color:#fff;font:700 22px/1 \'Noto Sans JP\',sans-serif;letter-spacing:.3em">蒼稜大学</span>';
    document.body.appendChild(c);
    const kf = dir === 'out' ? [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }] : [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }];
    const a = c.animate(kf, { duration: dir === 'out' ? 900 : 450, delay: dir === 'out' ? 250 : 0, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'both' });
    c.firstChild.animate([{ opacity: 0, letterSpacing: '.6em' }, { opacity: 1, letterSpacing: '.3em' }], { duration: 400, fill: 'both' });
    let fired = false; const end = () => { if (fired) return; fired = true; if (dir === 'out') c.remove(); done && done(); };
    a.onfinish = end; setTimeout(end, dir === 'out' ? 1400 : 700);
  };

  const init = () => {
    if (reduce) return;
    scan(document.body);
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && scan(n)))).observe(document.body, { childList: true, subtree: true });
    bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;left:0;top:0;height:3px;width:100%;background:#0b3fd9;transform-origin:0 50%;transform:scaleX(0);z-index:9998;pointer-events:none';
    document.body.appendChild(bar);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
    setInterval(onScroll, 600);
    setInterval(tilePulse, 1100);
    document.addEventListener('mouseover', e => { const t = e.target.closest('a,button'); if (t && !t.contains(e.relatedTarget)) arrows(t, true); });
    document.addEventListener('mouseout', e => { const t = e.target.closest('a,button'); if (t && !t.contains(e.relatedTarget)) arrows(t, false); });
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.metaKey || e.ctrlKey || a.target) return;
      const href = a.getAttribute('href');
      if (!/\.dc\.html/.test(href)) return;
      const url = new URL(href, location.href);
      if (url.pathname === location.pathname) return;
      e.preventDefault();
      curtain('in', () => { location.href = url.href; });
    });
    curtain('out');
  };
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
