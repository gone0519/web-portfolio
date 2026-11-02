(function () {
  if (window.__shiroMotion) return; window.__shiroMotion = 1;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const st = document.createElement('style');
  st.textContent = `
@keyframes shFloat{0%,100%{translate:0 0}50%{translate:0 -12px}}
@keyframes shTwinkle{0%,100%{opacity:1;scale:1}50%{opacity:.35;scale:.6}}
@keyframes shSpin{to{rotate:360deg}}
@keyframes shSwing{0%,100%{rotate:-5deg}50%{rotate:5deg}}
@keyframes shHeader{from{opacity:0;translate:0 -30px}to{opacity:1;translate:0 0}}
@keyframes shFall{0%{transform:translate3d(0,-40px,0) rotate(0deg)}100%{transform:translate3d(var(--dx),var(--dy),0) rotate(var(--r))}}
@keyframes shFlutter{0%,100%{transform:rotateY(0deg) rotateX(0deg)}50%{transform:rotateY(170deg) rotateX(30deg)}}
@keyframes shSway{0%,100%{translate:0 0}50%{translate:26px 0}}
@keyframes shPulse{0%,100%{box-shadow:0 0 0 0 rgba(168,134,42,.35)}60%{box-shadow:0 0 0 12px rgba(168,134,42,0)}}
@keyframes shRingPulse{0%,100%{scale:1;opacity:1}50%{scale:1.015;opacity:.75}}`;
  document.head.appendChild(st);

  const done = { rev: new WeakSet(), anim: new WeakSet(), draw: new WeakSet() };
  const meta = new WeakMap();
  const R = (a, b) => a + Math.random() * (b - a);
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target); show(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

  const FROM = {
    up: { transform: 'translateY(46px)' },
    zoom: { transform: 'scale(.82)' },
    pop: { transform: 'scale(.6) translateY(14px)' },
    band: { transform: 'scaleX(0)', opacity: '1' },
    clipX: { clipPath: 'inset(0 100% 0 0)', opacity: '1' },
    clipY: { clipPath: 'inset(0 0 100% 0)', opacity: '1' }
  };

  function prep(el, type, delay) {
    if (done.rev.has(el)) return; done.rev.add(el);
    const s = el.style;
    const o = { opacity: s.opacity, transform: s.transform, transition: s.transition, clipPath: s.clipPath };
    meta.set(el, { o, type, delay });
    const f = FROM[type];
    s.opacity = f.opacity || '0';
    if (f.transform) s.transform = f.transform;
    if (f.clipPath) s.clipPath = f.clipPath;
    s.transition = `opacity 1s ease ${delay}s, transform 1.2s cubic-bezier(.2,.75,.2,1) ${delay}s, clip-path 1.6s cubic-bezier(.65,0,.25,1) ${delay}s`;
    io.observe(el);
  }
  function show(el) {
    const m = meta.get(el);
    if (!m) { // svg path draw
      el.style.transition = 'stroke-dashoffset 2.8s cubic-bezier(.6,0,.2,1)';
      el.style.strokeDashoffset = '0'; return;
    }
    const s = el.style, o = m.o;
    s.opacity = o.opacity; s.transform = o.transform;
    if (FROM[m.type].clipPath) s.clipPath = 'inset(0 0 0 0)';
    setTimeout(() => { s.transition = o.transition; s.clipPath = o.clipPath; }, (m.delay + 1.7) * 1000);
  }
  function anim(el, v, origin) {
    if (done.anim.has(el)) return; done.anim.add(el);
    el.style.animation = v; if (origin) el.style.transformOrigin = origin;
  }

  function scan() {
    const main = document.querySelector('main'); if (!main) return;
    const hd = document.querySelector('header');
    if (hd) anim(hd, 'shHeader 1.2s cubic-bezier(.2,.75,.2,1) both');
    document.querySelectorAll('a').forEach((a) => {
      if (a.style.position === 'fixed') anim(a, 'shSwing 4.5s ease-in-out infinite', '50% 0');
    });

    main.querySelectorAll('h1').forEach((h) => prep(h, 'clipX', .5));
    main.querySelectorAll('section > div, section > p, section > nav, section > ol, section > span, section > a, section > h2').forEach((el) => {
      if (getComputedStyle(el).position === 'absolute') return;
      prep(el, 'up', 0);
    });

    main.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el);
      const p = el.parentElement, pcs = p && getComputedStyle(p);
      const w = el.offsetWidth;
      if (pcs && pcs.display === 'grid' && p.children.length >= 3 && p.tagName !== 'DL') {
        const i = Array.prototype.indexOf.call(p.children, el);
        prep(el, 'up', Math.min(i * 0.13, 0.9));
      } else if (pcs && pcs.flexWrap === 'wrap' && p.children.length >= 4 && cs.position !== 'absolute') {
        const i = Array.prototype.indexOf.call(p.children, el);
        prep(el, 'pop', Math.min(i * 0.05, 0.8));
      }
      if (cs.writingMode === 'vertical-rl') prep(el, 'clipY', 1);
      const bg = cs.backgroundColor;
      if (cs.position === 'absolute' && (bg === 'rgb(242, 201, 206)' || bg === 'rgb(239, 213, 106)') && el.offsetHeight < 40) prep(el, 'band', .15);
      if (cs.borderTopLeftRadius === '50%' && w > 0) {
        if (cs.borderTopStyle === 'dashed') anim(el, 'shSpin 90s linear infinite');
        else if (w <= 16 && cs.position === 'absolute') anim(el, `shTwinkle ${R(2.4, 4.2)}s ease-in-out ${-R(0, 4)}s infinite`);
        else if (w >= 300 && cs.borderTopStyle === 'solid' && cs.backgroundImage === 'none') anim(el, 'shRingPulse 6s ease-in-out infinite');
        else if (w >= 100) anim(el, `shFloat ${R(5, 8)}s ease-in-out ${-R(0, 6)}s infinite`);
      }
      if (el.tagName === 'A' && bg === 'rgb(168, 134, 42)' && cs.borderTopLeftRadius !== '0px') anim(el, 'shPulse 2.8s ease-out infinite');
    });

    main.querySelectorAll('svg path').forEach((pth) => {
      if (done.draw.has(pth) || !pth.getTotalLength) return; done.draw.add(pth);
      const L = pth.getTotalLength() + 2;
      pth.style.strokeDasharray = L; pth.style.strokeDashoffset = L;
      io.observe(pth);
    });
    petals(main);
  }

  let layer;
  function petals(main) {
    const first = main.querySelector('section'); if (!first) return;
    const h = first.getBoundingClientRect().bottom + scrollY;
    if (!layer) {
      layer = document.createElement('div');
      layer.setAttribute('aria-hidden', 'true');
      layer.style.cssText = 'position:absolute;top:0;left:0;width:100%;overflow:hidden;pointer-events:none;z-index:5';
      document.body.appendChild(layer);
      const n = innerWidth < 700 ? 9 : 18;
      const cols = ['#f0b9c4', '#f6d6dc', '#ecd36e', '#ffffff', '#e7a7b5', '#cfe7e3'];
      for (let i = 0; i < n; i++) {
        const o = document.createElement('span'), m = document.createElement('span'), p = document.createElement('span');
        const sz = R(8, 16);
        o.style.cssText = `position:absolute;top:0;left:${R(0, 100)}%;--dx:${R(-160, 160)}px;--r:${R(300, 900)}deg;animation:shFall ${R(11, 20)}s linear ${-R(0, 20)}s infinite`;
        m.style.cssText = `display:block;animation:shSway ${R(3, 5)}s ease-in-out ${-R(0, 4)}s infinite`;
        p.style.cssText = `display:block;width:${sz}px;height:${sz * .62}px;border-radius:100% 0 100% 0;background:${cols[i % cols.length]};opacity:.9;box-shadow:0 1px 2px rgba(150,120,90,.15);animation:shFlutter ${R(2.2, 4)}s ease-in-out ${-R(0, 3)}s infinite`;
        m.appendChild(p); o.appendChild(m); layer.appendChild(o);
      }
    }
    layer.style.height = h + 'px';
    layer.style.setProperty('--dy', (h + 60) + 'px');
    layer.querySelectorAll(':scope > span').forEach((s) => s.style.setProperty('--dy', (h + 60) + 'px'));
  }

  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:100%;background:linear-gradient(90deg,#efcfd2,#efd56a,#a8862a);transform-origin:0 50%;transform:scaleX(0);z-index:60;pointer-events:none';
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });

  let t;
  const queue = () => { clearTimeout(t); t = setTimeout(scan, 120); };
  const start = () => {
    document.body.appendChild(bar);
    new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
    addEventListener('resize', queue);
    scan(); setTimeout(scan, 800); setTimeout(scan, 2000);
  };
  if (document.body) start(); else addEventListener('DOMContentLoaded', start);
})();
