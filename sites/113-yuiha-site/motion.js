(function () {
  if (window.__yuihaMotion) return;
  window.__yuihaMotion = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.7,.2,1)';
  const HEX = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
  const HEX0 = 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)';
  const INK = 'rgb(35, 35, 35)';

  /* ---------- curtain (intro + page transitions) ---------- */
  const curtain = document.createElement('div');
  curtain.setAttribute('aria-hidden', 'true');
  curtain.style.cssText = 'position:fixed;inset:0;z-index:1000;background-color:#fcfcfb;background-image:linear-gradient(#ececea 1px,transparent 1px),linear-gradient(90deg,#ececea 1px,transparent 1px);background-size:14px 14px;display:flex;align-items:center;justify-content:center;pointer-events:none';
  const hexCss = 'position:absolute;width:30px;height:26px;background:#232323;clip-path:' + HEX;
  curtain.innerHTML =
    '<div style="display:flex;flex-direction:column;align-items:center;gap:18px">' +
    '<div style="position:relative;width:60px;height:50px">' +
    '<span data-h style="' + hexCss + ';left:0;top:0"></span>' +
    '<span data-h style="' + hexCss + ';left:0;top:24px"></span>' +
    '<span data-h style="position:absolute;left:24px;top:10px;width:32px;height:28px;border:2px solid #232323;border-radius:50%"></span></div>' +
    '<span data-t style="font-family:\'Josefin Sans\',sans-serif;font-size:12px;letter-spacing:.3em;color:#232323">YUIHA WOMEN\'S UNIV.</span></div>';
  document.documentElement.appendChild(curtain);
  const first = !sessionStorage.getItem('yuihaVisited');
  try { sessionStorage.setItem('yuihaVisited', '1'); } catch (e) {}
  let ready = false;
  const queue = [];

  function openPage() {
    if (reduce) { curtain.style.display = 'none'; start(); return; }
    const hs = curtain.querySelectorAll('[data-h]');
    hs.forEach((h, i) => h.animate([{ transform: 'scale(0) rotate(-90deg)' }, { transform: 'none' }], { duration: 600, delay: i * 120, easing: EASE, fill: 'both' }));
    curtain.querySelector('[data-t]').animate([{ opacity: 0, letterSpacing: '.8em' }, { opacity: 1, letterSpacing: '.3em' }], { duration: 700, delay: 200, easing: EASE, fill: 'both' });
    const hold = first ? 1100 : 350;
    setTimeout(start, hold - 200);
    curtain.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 800, delay: hold, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'both' })
      .onfinish = () => { curtain.style.visibility = 'hidden'; };
  }
  setTimeout(() => { curtain.style.visibility = 'hidden'; start(); }, 4000);

  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || !/\.dc\.html/.test(href)) return;
    const url = new URL(a.href, location.href);
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    curtain.style.visibility = 'visible';
    curtain.getAnimations().forEach(x => x.cancel());
    curtain.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 550, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'both' })
      .onfinish = () => { location.href = a.href; };
  }, true);
  addEventListener('pageshow', e => { if (e.persisted) { curtain.getAnimations().forEach(x => x.cancel()); curtain.style.visibility = 'hidden'; } });

  /* ---------- scroll progress ---------- */
  const bar = document.createElement('div');
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = 'position:fixed;left:0;top:0;height:2px;width:100%;background:#232323;transform-origin:0 50%;transform:scaleX(0);z-index:999;pointer-events:none';
  document.documentElement.appendChild(bar);

  /* ---------- reveal on scroll ---------- */
  const seen = new WeakSet();
  const watchers = new Map();
  let io = null;
  const readyQ = [];
  function onReady(fn) { if (ready) fn(); else readyQ.push(fn); }
  // `watch` is the element whose visibility triggers the animation. Clip-path reveals start at zero
  // area, and IntersectionObserver never reports a zero-area target as visible, so they watch their parent.
  function prep(el, kf, opt, watch) {
    if (seen.has(el)) return;
    seen.add(el);
    if (reduce) return;
    const a = el.animate(kf, Object.assign({ duration: 900, easing: EASE, fill: 'both' }, opt));
    a.pause();
    const w = watch || el;
    const list = watchers.get(w);
    if (list) { list.push(a); return; }
    watchers.set(w, [a]);
    if (io) io.observe(w); else queue.push(w);
  }
  function start() {
    if (ready) return;
    ready = true;
    io = new IntersectionObserver(entries => {
      let i = 0;
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const list = watchers.get(en.target);
        io.unobserve(en.target);
        watchers.delete(en.target);
        if (!list) return;
        const stagger = Math.min(i++, 8) * 90;
        list.forEach(a => {
          a.effect.updateTiming({ delay: (a.effect.getTiming().delay || 0) + stagger });
          a.play();
          a.onfinish = () => a.cancel();
        });
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    queue.splice(0).forEach(el => io.observe(el));
    readyQ.splice(0).forEach(fn => fn());
    heroIntro();
  }

  const up = [{ opacity: 0, transform: 'translateY(32px)' }, { opacity: 1, transform: 'none' }];
  function inTrack(el) { return !!el.closest('[data-yt]'); }

  function scan() {
    const main = document.querySelector('main');
    if (!main) return;
    findTrack(main);
    main.querySelectorAll('h1,h2,h3,p,blockquote,article,figure,form,dl>div,ol>li,ul>li,nav').forEach(el => {
      if (inTrack(el)) return;
      const card = el.closest('article,figure,form');
      if (card && card !== el) return;
      prep(el, up, {});
    });
    main.querySelectorAll('[style*="vertical-rl"]').forEach(el => prep(el, [{ opacity: 0, transform: 'translateY(-40px)' }, { opacity: 1, transform: 'none' }], { duration: 1400 }));
    main.querySelectorAll('[style*="polygon(25%"]').forEach(el => {
      if (inTrack(el)) return;
      if (el.getAttribute('aria-hidden') === 'true') { deco.add(el); return; }
      prep(el, [{ clipPath: HEX0 }, { clipPath: HEX }], { duration: 1300 }, el.parentElement);
      const img = el.firstElementChild;
      if (img) { prep(img, [{ transform: 'scale(1.4) rotate(-6deg)' }, { transform: 'none' }], { duration: 1700 }, el.parentElement); if (el.offsetWidth > 300) para.add(img); }
    });
    main.querySelectorAll('div[style*="repeating-linear-gradient"]').forEach(el => {
      if (inTrack(el) || seen.has(el)) return;
      if (el.parentElement && /polygon\(25%/.test(el.parentElement.getAttribute('style') || '')) return;
      prep(el, [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1100, easing: 'cubic-bezier(.7,0,.2,1)' }, el.parentElement);
    });
    main.querySelectorAll('span').forEach(s => {
      if (seen.has(s) || inTrack(s)) return;
      const cs = getComputedStyle(s);
      if (cs.backgroundColor === INK && parseFloat(cs.fontSize) <= 12 && s.textContent.trim()) {
        prep(s, [{ opacity: 0, transform: 'translateY(10px) scale(.7)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 250, easing: 'cubic-bezier(.3,1.6,.5,1)' });
      } else if (cs.borderRadius === '50%' && cs.backgroundColor === INK && s.offsetWidth < 32) {
        prep(s, [{ transform: 'rotate(-270deg) scale(0)' }, { transform: 'none' }], { duration: 900, delay: 300 });
      } else if (cs.backgroundColor === 'rgb(255, 255, 255)' && s.parentElement && getComputedStyle(s.parentElement).flexDirection === 'column' && s.textContent.trim().length > 2) {
        prep(s, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 900, delay: 200, easing: 'cubic-bezier(.7,0,.2,1)' }, s.parentElement);
      }
    });
    document.querySelectorAll('[style*="calc(100% - 1"]').forEach(magnet);
    document.querySelectorAll('footer').forEach(f => prep(f, [{ opacity: 0 }, { opacity: 1 }], { duration: 1200 }));
    loops();
    extras();
  }

  /* ---------- hero slider ---------- */
  let track = null;
  function findTrack(main) {
    const t = main.querySelector('[style*="transition: transform 0.9s"]');
    if (!t || t === track) return;
    track = t;
    t.setAttribute('data-yt', '');
    new MutationObserver(() => { slideIn(250); setTimeout(tabProgress, 30); }).observe(t, { attributes: true, attributeFilter: ['style'] });
    if (ready) heroIntro();
  }
  function heroIntro() {
    if (!track || reduce) return;
    track.animate([{ translate: '0 60px', opacity: 0 }, { translate: '0 0', opacity: 1 }], { duration: 1300, easing: EASE });
    slideIn(300);
    const sec = track.closest('section');
    if (sec) sec.animate([{ backgroundPosition: '0 0' }, { backgroundPosition: '14px 28px' }], { duration: 5000, iterations: Infinity });
  }
  function slideIn(d) {
    if (!track || reduce || !ready) return;
    const s = track.querySelector('[aria-hidden="false"]');
    if (!s) return;
    let i = 0;
    s.querySelectorAll('span').forEach(sp => {
      const cs = getComputedStyle(sp);
      if (cs.backgroundColor === 'rgb(255, 255, 255)' && getComputedStyle(sp.parentElement).flexDirection === 'column')
        sp.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 800, delay: d + 300 + i++ * 160, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'backwards' });
      else if (cs.backgroundColor === INK)
        sp.animate([{ opacity: 0, transform: 'translateY(-12px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: d + 600 + i++ * 80, easing: EASE, fill: 'backwards' });
    });
    s.querySelectorAll('div[style*="repeating-linear-gradient"]').forEach((g, k) =>
      g.animate([{ transform: 'scale(1.18)', opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 1600, delay: d + k * 120, easing: EASE, fill: 'backwards' }));
    const num = s.querySelector('[style*="Josefin Sans"][style*="font-weight: 600"]');
    if (num) num.animate([{ transform: 'translateY(100%) rotate(12deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, delay: d + 200, easing: EASE, fill: 'backwards' });
  }

  /* ---------- loops: marquee / spin ---------- */
  const looped = new WeakSet();
  function loops() {
    if (reduce) return;
    document.querySelectorAll('[data-marquee]').forEach(el => {
      if (looped.has(el)) return; looped.add(el);
      el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: Math.max(18000, el.scrollWidth * 14), iterations: Infinity });
    });
    document.querySelectorAll('[data-spin]').forEach(el => {
      if (looped.has(el)) return; looped.add(el);
      el.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 16000, iterations: Infinity });
    });
    document.querySelectorAll('[data-drift]').forEach(el => drift.add(el));
  }

  /* ---------- parallax ---------- */
  const deco = new Set(), para = new Set(), drift = new Set();
  function onScroll() {
    const h = innerHeight;
    const max = document.documentElement.scrollHeight - h;
    bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
    if (reduce) return;
    deco.forEach(el => {
      if (!el.isConnected) return deco.delete(el);
      const r = el.getBoundingClientRect();
      const k = r.top + r.height / 2 - h / 2;
      el.style.translate = '0 ' + (k * -0.18).toFixed(1) + 'px';
      el.style.rotate = (k * 0.03).toFixed(2) + 'deg';
    });
    drift.forEach(el => {
      if (!el.isConnected) return drift.delete(el);
      const r = el.parentElement.getBoundingClientRect();
      el.style.translate = ((r.top - h / 2) * 0.25).toFixed(1) + 'px 0';
    });
    para.forEach(el => {
      if (!el.isConnected) return para.delete(el);
      const r = el.parentElement.getBoundingClientRect();
      el.style.scale = '1.14';
      el.style.translate = '0 ' + ((r.top + r.height / 2 - h / 2) * 0.07).toFixed(1) + 'px';
    });
  }
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
  addEventListener('resize', onScroll);

  /* ---------- magnetic buttons ---------- */
  const mag = new WeakSet();
  function magnet(el) {
    if (mag.has(el) || reduce || !matchMedia('(hover: hover)').matches) return;
    mag.add(el);
    el.style.transition = 'translate .35s cubic-bezier(.2,.7,.2,1), background-color .2s';
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.translate = ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px';
    });
    el.addEventListener('mouseleave', () => { el.style.translate = '0 0'; });
  }

  /* ---------- extras ---------- */
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const done = new WeakSet();
  function once(el) { if (done.has(el)) return false; done.add(el); return true; }

  // cursor follower
  if (fine && !reduce) {
    const cur = document.createElement('div');
    cur.setAttribute('aria-hidden', 'true');
    cur.style.cssText = 'position:fixed;left:0;top:0;width:34px;height:30px;margin:-15px 0 0 -17px;z-index:1001;pointer-events:none;transition:scale .3s cubic-bezier(.2,.7,.2,1),opacity .3s;opacity:0';
    cur.innerHTML = '<span style="position:absolute;inset:0;background:#232323;clip-path:' + HEX + '"></span><span style="position:absolute;inset:1.5px;background:#fcfcfb;clip-path:' + HEX + '"></span><span style="position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2.5px;border-radius:50%;background:#232323"></span>';
    document.documentElement.appendChild(cur);
    let mx = -100, my = -100, cx = -100, cy = -100, rot = 0;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cur.style.opacity = '1'; });
    document.addEventListener('mouseleave', () => { cur.style.opacity = '0'; });
    document.addEventListener('mouseover', e => { cur.style.scale = e.target.closest && e.target.closest('a,button,label,select,input') ? '1.8' : '1'; });
    (function loop() { cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18; rot += ((mx - cx) * 0.4 - rot) * 0.1; cur.style.translate = cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px'; cur.style.rotate = rot.toFixed(1) + 'deg'; requestAnimationFrame(loop); })();
  }

  // hex burst on click
  if (!reduce) document.addEventListener('pointerdown', e => {
    for (let i = 0; i < 7; i++) {
      const p = document.createElement('span');
      const s = 6 + Math.random() * 9, ang = (i / 7) * Math.PI * 2 + Math.random() * .5, dist = 30 + Math.random() * 40;
      p.style.cssText = 'position:fixed;z-index:1002;pointer-events:none;left:' + e.clientX + 'px;top:' + e.clientY + 'px;width:' + s + 'px;height:' + (s * .87) + 'px;margin:' + (-s / 2) + 'px;background:' + (i % 2 ? '#232323' : '#bdbdb9') + ';clip-path:' + HEX;
      document.documentElement.appendChild(p);
      p.animate([{ transform: 'translate(0,0) rotate(0) scale(1)', opacity: 1 }, { transform: 'translate(' + Math.cos(ang) * dist + 'px,' + Math.sin(ang) * dist + 'px) rotate(' + (Math.random() * 240 - 120) + 'deg) scale(0)', opacity: 0 }], { duration: 650 + Math.random() * 250, easing: 'cubic-bezier(.2,.7,.2,1)' }).onfinish = () => p.remove();
    }
  }, { passive: true });

  // header hides on scroll down, returns on scroll up
  let lastY = scrollY, hidden = false;
  addEventListener('scroll', () => {
    const hd = document.querySelector('header');
    const wrap = hd && hd.parentElement;
    if (!wrap || reduce) return;
    if (!hd.__t) { hd.__t = 1; hd.style.transition = 'translate .45s cubic-bezier(.2,.7,.2,1)'; }
    const y = scrollY, dn = y > lastY && y > 160;
    if (dn !== hidden && Math.abs(y - lastY) > 4) { hidden = dn; hd.style.translate = hidden ? '0 -110%' : '0 0'; wrap.style.pointerEvents = hidden ? 'none' : ''; }
    lastY = y;
  }, { passive: true });

  // marquee reacts to scroll velocity
  let vel = 0, prevY = scrollY;
  (function vloop() {
    const d = Math.abs(scrollY - prevY); prevY = scrollY;
    vel += (d - vel) * 0.1;
    document.querySelectorAll('[data-marquee]').forEach(el => el.getAnimations().forEach(a => { a.playbackRate = 1 + Math.min(vel, 60) * 0.12; }));
    requestAnimationFrame(vloop);
  })();

  function extras() {
    const main = document.querySelector('main');
    if (!main) return;
    // card tilt
    if (fine && !reduce) main.querySelectorAll('article,figure,form').forEach(el => {
      if (!once(el) || el.style.transform) return;
      el.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1), box-shadow .5s';
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = 'perspective(900px) rotateY(' + (x * 6).toFixed(2) + 'deg) rotateX(' + (-y * 6).toFixed(2) + 'deg) translateY(-4px)';
        el.style.boxShadow = (-x * 12).toFixed(1) + 'px ' + (14 - y * 8).toFixed(1) + 'px 0 -6px #e3e3e0';
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; el.style.boxShadow = ''; });
    });
    // placeholder zoom on hover
    if (fine && !reduce) main.querySelectorAll('[style*="polygon(25%"]').forEach(hx => {
      if (!once(hx) || hx.getAttribute('aria-hidden') === 'true') return;
      const img = hx.firstElementChild; if (!img) return;
      hx.addEventListener('mouseenter', () => img.animate([{ filter: 'none', transform: 'scale(1)' }, { filter: 'contrast(1.08)', transform: 'scale(1.08) rotate(2deg)' }], { duration: 600, easing: EASE, fill: 'forwards' }));
      hx.addEventListener('mouseleave', () => img.getAnimations().filter(a => a.effect.getTiming().fill === 'forwards').forEach(a => a.reverse()));
    });
    // decorative hexes float
    if (!reduce) main.querySelectorAll('[aria-hidden="true"][style*="radial-gradient"]').forEach((el, i) => {
      if (!once(el)) return;
      el.animate([{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(-18px) scale(1.04)' }, { transform: 'translateY(0) scale(1)' }], { duration: 7000 + i * 900, iterations: Infinity, easing: 'ease-in-out' });
    });
    // headings: letter-spacing settles
    if (!reduce) main.querySelectorAll('h1,h2').forEach(h => {
      if (!once(h)) return;
      const ls = getComputedStyle(h).letterSpacing;
      const a = h.animate([{ letterSpacing: '.6em', filter: 'blur(4px)' }, { letterSpacing: ls, filter: 'blur(0)' }], { duration: 1300, easing: EASE, fill: 'both' });
      a.pause();
      const o = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { o.disconnect(); onReady(() => { a.play(); a.onfinish = () => a.cancel(); }); } }), { threshold: .2 });
      o.observe(h);
    });
    // English labels scramble in
    if (!reduce) main.querySelectorAll('span').forEach(s => {
      if (s.children.length || !/Josefin/.test(s.style.fontFamily)) return;
      const txt = s.textContent;
      if (!/^[A-Z0-9 \\/()&.\-']{3,24}$/.test(txt.trim()) || !once(s)) return;
      const o = new IntersectionObserver(es => es.forEach(en => {
        if (!en.isIntersecting) return;
        o.disconnect();
        onReady(() => scramble(s, txt));
      }), { threshold: .5 });
      o.observe(s);
    });
    function scramble(s, txt) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let f = 0; const total = 18;
      const node = s.firstChild; if (!node || node.nodeType !== 3) return;
      (function step() {
        f++;
        node.nodeValue = txt.split('').map((c, i) => c === ' ' || i < (f / total) * txt.length ? c : chars[(Math.random() * chars.length) | 0]).join('');
        if (f < total) setTimeout(step, 40); else node.nodeValue = txt;
      })();
    }
    // hero tab progress
    main.querySelectorAll('[role="tab"]').forEach(b => {
      if (!once(b)) return;
      b.style.position = 'relative';
      const bar = document.createElement('span');
      bar.setAttribute('aria-hidden', 'true');
      bar.style.cssText = 'position:absolute;left:0;bottom:-1px;height:1px;width:100%;background:#232323;transform-origin:0 50%;transform:scaleX(0);pointer-events:none';
      b.appendChild(bar);
      b.__bar = bar;
    });
    tabProgress();
  }
  let tabAnim = null, lastActive = null;
  function tabProgress() {
    if (reduce) return;
    const on = document.querySelector('[role="tab"][aria-selected="true"]');
    if (!on || !on.__bar || on === lastActive) return;
    lastActive = on;
    if (tabAnim) tabAnim.cancel();
    tabAnim = on.__bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 6000, easing: 'linear', fill: 'forwards' });
  }

  /* ---------- boot ---------- */
  let t = null;
  const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => { scan(); onScroll(); }, 120); });
  function boot() {
    mo.observe(document.body, { childList: true, subtree: true });
    scan(); onScroll();
    openPage();
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
