(() => {
  if (window.__manabiMotion) return; window.__manabiMotion = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.visibilityState === 'hidden' || /[?&]print/.test(location.search);
  let ioAlive = false;
  const finishAll = () => { queue.forEach(a => { try { a.finish(); } catch (e) {} }); queue.clear(); };
  const EASE = 'cubic-bezier(.2,.7,.1,1)';
  const seen = new WeakSet();
  const queue = new Map();
  const isFixed = el => { for (let n = el; n && n !== document.body; n = n.parentElement) { if (getComputedStyle(n).position === 'fixed') return true; } return false; };

  const kinds = {
    heading: el => [[{ opacity: 0, transform: 'translateY(40%)', clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, transform: 'none', clipPath: 'inset(0 0 -20% 0)' }], 1100],
    text: el => [[{ opacity: 0, transform: 'translateY(24px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], 1000],
    image: el => [[{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], 1400],
    card: el => [[{ opacity: 0, transform: 'translateY(48px) scale(.97)' }, { opacity: 1, transform: 'none' }], 1000],
    line: el => [[{ transform: 'scaleX(0)', transformOrigin: 'left' }, { transform: 'scaleX(1)', transformOrigin: 'left' }], 1400],
    wordmark: el => [[{ opacity: 0, letterSpacing: '.6em', filter: 'blur(12px)' }, { opacity: 1, letterSpacing: '.08em', filter: 'blur(0)' }], 1800],
    rise: el => [[{ opacity: 0, transform: 'translateY(60%)' }, { opacity: 1, transform: 'none' }], 1600]
  };

  function prime(el, kind, delay) {
    if (seen.has(el) || reduce || isFixed(el)) return;
    seen.add(el);
    const [kf, dur] = kinds[kind](el);
    const a = el.animate(kf, { duration: dur, delay, easing: EASE, fill: 'both' });
    a.pause();
    queue.set(el, a);
    const r0 = el.getBoundingClientRect();
    const inView = r0.top < innerHeight && r0.bottom > 0;
    if (kind === 'image') {
      const slot = el.tagName === 'IMAGE-SLOT' ? el : el.querySelector('image-slot');
      if (slot) { const z = slot.animate([{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 2200, delay, easing: EASE, fill: 'both' }); z.pause(); queue.set(slot, z); slot.__zoomOf = el; el.__zoom = z; el.__zoomSlot = slot; }
    }
    if (inView) setTimeout(() => reveal(el), 0);
    else io.observe(el);
  }
  // 表示開始：本体のアニメーションと、画像のズームを再生してキューから外す
  function reveal(el) {
    const a = queue.get(el); if (a) { a.play(); queue.delete(el); }
    if (el.__zoom) { el.__zoom.play(); queue.delete(el.__zoomSlot); }
    io.unobserve(el);
  }
  // clip-path で幅0に隠した要素は IntersectionObserver が「見えていない」と判定し続けるため、
  // スクロール時に位置（clip-path の影響を受けない getBoundingClientRect）でも判定する
  function revealInView() {
    const vh = innerHeight;
    // ページ最下部まで来たら、画面内のものはすべて表示（最下部の要素は 92% ラインに届かないため）
    const lim = scrollY + vh >= document.documentElement.scrollHeight - 4 ? vh : vh * 0.92;
    queue.forEach((a, el) => {
      if (el.__zoomOf) return;
      const r = el.getBoundingClientRect();
      if ((r.width || r.height) && r.top < lim && r.bottom > 0) reveal(el);
    });
  }
  const io = new IntersectionObserver(es => es.forEach(e => {
    ioAlive = true;
    if (e.isIntersecting) reveal(e.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  function scan(root) {
    root.querySelectorAll('h1,h2,h3,p').forEach(el => {
      if (getComputedStyle(el).fontFamily.includes('Michroma') && parseFloat(getComputedStyle(el).fontSize) > 50 && el.querySelector('span')) prime(el, 'wordmark', 200);
    });
    root.querySelectorAll('h1,h2,h3').forEach(el => prime(el, 'heading', 0));
    root.querySelectorAll('p').forEach(el => {
      if (counted.has(el)) return;
      const t = el.firstChild && el.firstChild.nodeType === 3 ? el.firstChild : null;
      if (t && /^\s*\d{1,3}\s*$/.test(t.nodeValue) && getComputedStyle(el).fontFamily.includes('Michroma')) { counted.add(el); countIO.observe(el); }
    });
    root.querySelectorAll('a,button').forEach(el => {
      if (magnets.has(el) || isFixed(el)) return;
      const cs = getComputedStyle(el);
      if (cs.borderBottomStyle === 'solid' && el.lastElementChild && el.lastElementChild.tagName === 'SPAN') { magnets.add(el); arrowNudge(el); }
      else if ((cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.borderTopStyle === 'solid' || cs.borderRadius === '50%') && el.offsetWidth < 420 && el.offsetHeight < 80) { magnets.add(el); magnet(el); }
    });
    root.querySelectorAll('image-slot').forEach(slot => { const b = slot.parentElement; if (b && !tilts.has(b) && b.offsetWidth < 700 && b.offsetHeight > 120) { tilts.add(b); tilt(b); } });
    root.querySelectorAll('p').forEach(el => { if (!floaters.has(el) && getComputedStyle(el).writingMode === 'vertical-rl') floaters.add(el); });
    root.querySelectorAll('section p, footer p').forEach(el => {
      if (el.closest('button') || el.closest('a') || el.textContent.trim().length === 0) return;
      const big = parseFloat(getComputedStyle(el).fontSize) > 60;
      prime(el, big ? 'rise' : 'text', 80);
    });
    root.querySelectorAll('image-slot').forEach(slot => {
      const box = slot.parentElement; if (!box || isFixed(box)) return;
      const r = box.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) { box.style.overflow = 'hidden'; prime(box, 'image', 0); }
      if (r.height >= 360) parallax.add(slot);
    });
    root.querySelectorAll('div,a,button,label').forEach(el => {
      const p = el.parentElement; if (!p || seen.has(el)) return;
      const ps = getComputedStyle(p);
      if (ps.display === 'grid' || (ps.display === 'flex' && ps.flexDirection === 'column' && p.children.length >= 3)) {
        const cs = getComputedStyle(el);
        if (cs.backgroundColor === 'rgb(255, 255, 255)' || el.querySelector('image-slot') || cs.borderBottomStyle === 'solid') {
          const i = Array.prototype.indexOf.call(p.children, el);
          prime(el, 'card', (i % 6) * 90);
        }
      }
    });
    root.querySelectorAll('[style*="height: 1px"],[style*="height:1px"]').forEach(el => { if (el.offsetWidth > 30) prime(el, 'line', 200); });
    root.querySelectorAll('p').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.webkitTextStroke && cs.color === 'rgba(0, 0, 0, 0)' && !drift.has(el)) drift.add(el);
    });
  }

  const parallax = new Set(), drift = new Set(), counted = new WeakSet(), magnets = new WeakSet(), tilts = new WeakSet(), floaters = new Set(), boxes = new Set();
  const countIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting || reduce) return; countIO.unobserve(e.target);
    const node = e.target.firstChild, end = parseInt(node.nodeValue, 10), pad = node.nodeValue.trim().length, t0 = performance.now();
    const step = now => { const k = Math.min(1, (now - t0) / 1400), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
      node.nodeValue = String(v).padStart(pad, '0'); if (k < 1) requestAnimationFrame(step); else node.nodeValue = String(end).padStart(pad, '0'); };
    requestAnimationFrame(step);
  }), { threshold: 0.4 });
  function magnet(el) {
    if (reduce) return;
    el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); el.style.translate = ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px'; el.style.transition = (el.style.transition ? el.style.transition.replace(/,?\s*translate[^,]*/g, '') + ',' : '') + 'translate .15s'; });
    el.addEventListener('mouseleave', () => { el.style.translate = '0 0'; });
  }
  function arrowNudge(el) {
    if (reduce) return; const s = el.lastElementChild; s.style.transition = 'translate .35s ' + EASE; s.style.display = s.style.display || 'inline-block';
    el.addEventListener('mouseenter', () => { s.style.translate = '6px 0'; }); el.addEventListener('mouseleave', () => { s.style.translate = '0 0'; });
  }
  function tilt(b) {
    if (reduce) return; boxes.add(b); b.__rx = 0; b.__ry = 0; b.style.transformStyle = 'preserve-3d';
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.__ry = ((e.clientX - r.left) / r.width - .5) * 8; b.__rx = -((e.clientY - r.top) / r.height - .5) * 8; });
    b.addEventListener('mouseleave', () => { b.__rx = 0; b.__ry = 0; });
  }
  let vel = 0, lastY = scrollY, skew = 0, mx = 0, my = 0;
  addEventListener('mousemove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
  (function frame() {
    const y = scrollY; vel = vel * 0.85 + (y - lastY) * 0.15; lastY = y; window.__mgVel = vel;
    if (!reduce) {
      skew += (Math.max(-4, Math.min(4, vel * 0.12)) - skew) * 0.2;
      boxes.forEach(b => { if (!b.isConnected) { boxes.delete(b); return; } b.style.transform = 'perspective(900px) rotateX(' + b.__rx.toFixed(2) + 'deg) rotateY(' + b.__ry.toFixed(2) + 'deg) skewY(' + (skew * 0.5).toFixed(2) + 'deg)'; });
      floaters.forEach((p, i) => { if (!p.isConnected) { floaters.delete(p); return; } p.style.translate = (mx * (14 + i * 6)).toFixed(1) + 'px ' + (my * (18 + i * 6)).toFixed(1) + 'px'; });
    }
    requestAnimationFrame(frame);
  })();
  function pageLinks() {
    if (reduce) return;
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href]'); if (!a || e.metaKey || e.ctrlKey || a.target === '_blank') return;
      const href = a.getAttribute('href'); if (!/\.dc\.html/.test(href)) return;
      const same = href.split('#')[0] && location.pathname.endsWith(decodeURIComponent(href.split('#')[0]));
      if (same) return;
      e.preventDefault(); e.stopPropagation();
      const v = document.createElement('div');
      Object.assign(v.style, { position: 'fixed', inset: 0, background: '#2b2b2b', zIndex: 10001, pointerEvents: 'none' });
      document.body.append(v);
      v.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 600, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'both' });
      setTimeout(() => { location.href = a.href; }, 620);
    }, true);
  }
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      revealInView();
      const vh = innerHeight, sy = scrollY, max = document.documentElement.scrollHeight - vh;
      bar.style.transform = `scaleX(${max > 0 ? sy / max : 0})`;
      parallax.forEach(s => {
        if (!s.isConnected) { parallax.delete(s); return; }
        const r = s.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        s.style.translate = `0 ${(p * -9).toFixed(2)}%`; s.style.scale = '1.14';
      });
      drift.forEach(el => {
        if (!el.isConnected) { drift.delete(el); return; }
        const r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
        el.style.translate = `${((r.top - vh / 2) * 0.12).toFixed(1)}px ${((r.top - vh / 2) * -0.08).toFixed(1)}px`;
      });
    });
  }

  const bar = document.createElement('div');
  Object.assign(bar.style, { position: 'fixed', left: 0, top: 0, right: 0, height: '2px', background: '#2d3a78', transformOrigin: 'left', transform: 'scaleX(0)', zIndex: 9999, pointerEvents: 'none' });

  let ring, dot;
  function cursor() {
    if (reduce || matchMedia('(pointer: coarse)').matches) return;
    ring = document.createElement('div'); dot = document.createElement('div');
    Object.assign(ring.style, { position: 'fixed', left: 0, top: 0, width: '36px', height: '36px', margin: '-18px 0 0 -18px', border: '1px solid rgba(45,58,120,.55)', borderRadius: '50%', pointerEvents: 'none', zIndex: 9998, transition: 'width .3s, height .3s, margin .3s, background .3s, border-color .3s', mixBlendMode: 'multiply' });
    Object.assign(dot.style, { position: 'fixed', left: 0, top: 0, width: '5px', height: '5px', margin: '-2.5px 0 0 -2.5px', background: '#2d3a78', borderRadius: '50%', pointerEvents: 'none', zIndex: 9998 });
    document.body.append(ring, dot);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; });
    addEventListener('mouseover', e => {
      const hot = e.target.closest && e.target.closest('a,button,label,image-slot');
      Object.assign(ring.style, hot ? { width: '64px', height: '64px', margin: '-32px 0 0 -32px', background: 'rgba(45,58,120,.08)', borderColor: 'rgba(45,58,120,.25)' } : { width: '36px', height: '36px', margin: '-18px 0 0 -18px', background: 'transparent', borderColor: 'rgba(45,58,120,.55)' });
    });
    (function loop() { rx += (x - rx) * 0.16; ry += (y - ry) * 0.16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
  }

  function intro() {
    if (reduce) return;
    const veil = document.createElement('div');
    Object.assign(veil.style, { position: 'fixed', inset: 0, background: '#2b2b2b', zIndex: 10000, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' });
    const mark = document.createElement('div');
    Object.assign(mark.style, { fontFamily: 'Michroma, sans-serif', color: '#f5f4f1', fontSize: 'clamp(16px,2vw,28px)', letterSpacing: '.5em' });
    mark.textContent = 'MANABI GATE';
    veil.append(mark); document.body.append(veil);
    setTimeout(() => veil.remove(), 2400);
    mark.animate([{ opacity: 0, letterSpacing: '1.2em' }, { opacity: 1, letterSpacing: '.5em' }], { duration: 900, easing: EASE, fill: 'both' });
    veil.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 900, delay: 1000, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'both' }).onfinish = () => veil.remove();
  }

  function indicator() {
    if (innerWidth < 900) return;
    const box = document.createElement('div');
    Object.assign(box.style, { position: 'fixed', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0, transition: 'opacity .5s', zIndex: 45, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', pointerEvents: 'none', mixBlendMode: 'difference', color: '#fff', fontFamily: 'Marcellus, serif', fontSize: '11px', letterSpacing: '.24em' });
    const num = document.createElement('span'), line = document.createElement('span'), lab = document.createElement('span');
    Object.assign(line.style, { width: '1px', height: '60px', background: '#fff', transformOrigin: 'top' });
    Object.assign(lab.style, { writingMode: 'vertical-rl' });
    box.append(lab, line, num); document.body.append(box);
    let cur = '';
    const upd = () => {
      const secs = [...document.querySelectorAll('section[data-screen-label]')].filter(s => !s.parentElement.closest('section[data-screen-label]'));
      const mid = innerHeight / 2; let idx = 0;
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top < mid) idx = i; });
      box.style.opacity = scrollY > innerHeight * 0.7 ? '1' : '0';
      const s = secs[idx]; if (!s) return;
      const label = s.getAttribute('data-screen-label').replace(/^\d+\s*/, '');
      if (label !== cur) { cur = label; lab.textContent = label; num.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(secs.length).padStart(2, '0');
        if (!reduce) { lab.animate([{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: EASE }); line.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 700, easing: EASE }); } }
    };
    addEventListener('scroll', upd, { passive: true }); setTimeout(upd, 500);
  }
  function start() {
    document.body.append(bar);
    intro(); cursor(); pageLinks(); indicator();
    let t; const rescan = () => { clearTimeout(t); t = setTimeout(() => { scan(document.body); revealInView(); }, 120); };
    rescan(); setTimeout(rescan, 800); setTimeout(rescan, 2000);
    addEventListener('beforeprint', finishAll);
    setTimeout(() => { if (!ioAlive && document.visibilityState !== 'visible') finishAll(); }, 3000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') finishAll(); });
    new MutationObserver(rescan).observe(document.body, { childList: true, subtree: true });
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
    onScroll();
  }
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', start) : start();
})();
