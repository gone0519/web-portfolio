(function () {
  if (window.SiteAnim) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const E = 'cubic-bezier(.22,1,.36,1)';
  const T = (a) => [{ opacity: 0, transform: a }, { opacity: 1, transform: 'none' }];
  const C = (a) => [{ clipPath: a }, { clipPath: 'inset(0 0 0 0)' }];
  const K = {
    up: T('translateY(36px)'), left: T('translateX(-50px)'), right: T('translateX(40px)'),
    drop: T('translateY(-80px)'), rise: T('translateY(80px)'), scale: T('scale(.94)'),
    fade: [{ opacity: 0 }, { opacity: 1 }],
    pop: [{ opacity: 0, transform: 'scale(.3) rotate(-30deg)' }, { opacity: 1, transform: 'scale(1.08)', offset: .7 }, { opacity: 1, transform: 'none' }],
    block: C('inset(100% 0 0 0)'), wipe: C('inset(0 100% 0 0)'), tag: C('inset(0 100% 0 0)'), line: C('inset(0 100% 0 0)'),
    zoom: [{ opacity: 0, transform: 'scale(1.5) rotate(-6deg)' }, { opacity: 1, transform: 'none' }],
    blur: [{ opacity: 0, transform: 'translateY(24px)', filter: 'blur(10px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
    curtain: C('inset(0 0 100% 0)'),
  };
  const D = { block: 1000, wipe: 1200, tag: 600, pop: 800, line: 700, zoom: 1600, blur: 1200, type: 1300, curtain: 1100 };
  const pending = new Set();
  const outlines = [];

  function kind(el) {
    const a = el.dataset.anim;
    if (el.tagName === 'H1' || el.tagName === 'H2') return 'type';
    if (a === 'fade' && el.getAttribute('aria-hidden') === 'true') return 'zoom';
    if (a === 'up' && /Shippori/.test(el.style.fontFamily || '')) return 'blur';
    return a;
  }
  function frames(el, k) {
    if (k === 'type') {
      const ls = getComputedStyle(el).letterSpacing;
      return [{ opacity: 0, letterSpacing: '.45em', filter: 'blur(8px)', transform: 'translateX(-20px)' }, { opacity: 1, letterSpacing: ls === 'normal' ? '0px' : ls, filter: 'blur(0)', transform: 'none' }];
    }
    return K[k] || K.up;
  }
  function check() {
    const vh = window.innerHeight;
    pending.forEach((el) => {
      if (!el.isConnected) { pending.delete(el); return; }
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) { el.__a.play(); pending.delete(el); }
    });
  }
  function arm(el, k, delay) {
    el.__a = el.animate(frames(el, k), { duration: D[k] || 900, delay, easing: E, fill: 'backwards' });
    el.__a.pause(); el.__a.currentTime = 0;
    pending.add(el);
  }
  function scan() {
    if (reduce) return;
    const groups = new Map();
    document.querySelectorAll('[data-anim]').forEach((el) => {
      if (el.__a) return;
      let delay = +(el.dataset.delay || 0);
      if (el.dataset.stagger) { const p = el.parentElement; const n = groups.get(p) || 0; groups.set(p, n + 1); delay += n * 110; }
      const k = kind(el);
      arm(el, k, delay);
      if (k === 'zoom') outlines.push(el);
      if (el.dataset.anim === 'block' && !el.__f) el.__f = el.animate([{ translate: '0 0' }, { translate: '0 -14px' }], { duration: 4200 + Math.random() * 1600, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: 1200 });
    });
    document.querySelectorAll('image-slot').forEach((el) => { if (!el.__a && !el.closest('[data-anim]')) arm(el, 'curtain', 150); });
    document.querySelectorAll('[data-marquee]').forEach((el) => { if (!el.__m) el.__m = el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 38000, iterations: Infinity }); });
    document.querySelectorAll('[data-pulse]').forEach((el) => { if (!el.__m) el.__m = el.animate([{ transform: 'scale(1)', opacity: .8 }, { transform: 'scale(1.25)', opacity: 0 }], { duration: 2000, iterations: Infinity, delay: 2600, easing: 'ease-out' }); });
    if (fine) document.querySelectorAll('a,button').forEach((el) => {
      if (el.__mg) return; el.__mg = 1;
      if (parseFloat(getComputedStyle(el).borderTopLeftRadius) < 100) return;
      el.addEventListener('mousemove', (e) => { const r = el.getBoundingClientRect(); el.style.translate = ((e.clientX - r.left - r.width / 2) * .22) + 'px ' + ((e.clientY - r.top - r.height / 2) * .3) + 'px'; });
      el.addEventListener('mouseleave', () => { el.animate([{ translate: el.style.translate || '0 0' }, { translate: '0 0' }], { duration: 500, easing: E }); el.style.translate = ''; });
    });
    requestAnimationFrame(check);
  }

  let lastY = window.scrollY, vel = 0, bar;
  function onScroll() {
    const y = window.scrollY;
    vel = y - lastY; lastY = y;
    document.querySelectorAll('[data-parallax]').forEach((el) => { el.style.transform = 'translateY(' + y * parseFloat(el.dataset.parallax) + 'px)'; });
    const vh = window.innerHeight;
    outlines.forEach((el) => { if (!el.isConnected) return; const r = el.getBoundingClientRect(); el.style.translate = '0 ' + ((r.top + r.height / 2 - vh / 2) * -0.12).toFixed(1) + 'px'; });
    document.querySelectorAll('[data-marquee]').forEach((el) => { if (el.__m) el.__m.playbackRate = Math.max(-6, Math.min(8, 1 + vel * 0.25)); });
    if (bar) { const max = document.documentElement.scrollHeight - vh; bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')'; }
    check();
  }
  function settle() { vel *= 0.9; document.querySelectorAll('[data-marquee]').forEach((el) => { if (el.__m && Math.abs(el.__m.playbackRate - 1) > .02) el.__m.playbackRate += (1 - el.__m.playbackRate) * 0.08; }); requestAnimationFrame(settle); }

  function chrome() {
    bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;left:0;top:0;height:3px;width:100%;background:#f2958c;transform-origin:0 50%;transform:scaleX(0);z-index:9999;pointer-events:none';
    document.body.appendChild(bar);
    if (reduce) return;
    const cur = document.createElement('div');
    const pt = document.createElement('div');
    pt.style.cssText = "position:fixed;inset:0;z-index:10000;background:#e8dfd2;display:flex;align-items:center;justify-content:center;pointer-events:none;font-family:'Josefin Sans',sans-serif;font-size:14px;letter-spacing:.9em;color:#fff";
    pt.textContent = 'MIRAI CAMPUS';
    document.body.appendChild(pt);
    pt.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 900, delay: 150, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      const href = a.getAttribute('href');
      if (!/\.dc\.html/.test(href) || href.startsWith('#')) return;
      e.preventDefault();
      pt.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }).onfinish = () => { window.location.href = a.href; };
    });
    window.addEventListener('pageshow', (e) => { if (e.persisted) pt.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 700, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }); });
    if (!fine) return;
    cur.style.cssText = 'position:fixed;left:0;top:0;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#f2958c;mix-blend-mode:multiply;z-index:9998;pointer-events:none;transition:width .3s,height .3s,margin .3s,background .3s,border .3s;opacity:0';
    document.body.appendChild(cur);
    let x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', (e) => {
      x = e.clientX; y = e.clientY; cur.style.opacity = '1';
      const hot = e.target.closest && e.target.closest('a,button,label,image-slot');
      const s = hot ? 46 : 14;
      cur.style.width = cur.style.height = s + 'px'; cur.style.margin = (-s / 2) + 'px 0 0 ' + (-s / 2) + 'px';
      cur.style.background = hot ? 'rgba(242,149,140,.25)' : '#f2958c';
      cur.style.border = hot ? '1.5px solid #f2958c' : '0';
    });
    document.addEventListener('mouseleave', () => { cur.style.opacity = '0'; });
    (function loop() { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; requestAnimationFrame(loop); })();
  }

  let t;
  const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 40); });
  window.SiteAnim = {
    init() {
      if (this.on) return; this.on = true;
      mo.observe(document.body, { childList: true, subtree: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', check);
      chrome();
      scan();
      if (!reduce) settle();
    },
  };
  if (document.body) window.SiteAnim.init();
  else document.addEventListener('DOMContentLoaded', () => window.SiteAnim.init());
})();
